/* Prepara as imagens do site a partir das fontes em media/ (10/out/2026;
   refeito em 16/out/2026 para a V2).
   · media/sites/: capturas de tela 1440 × 900 (o cartão e as imagens da
     ficha) e, quando houver, a página inteira (-full);
   · media/perfil/retrato.jpg: o retrato do Perfil (VP-02), quando houver;
   · media/design/: as peças de design, nos arquivos originais (o cartaz
     do Conservatório tem 12 MB).
   Saem em public/img/, em WebP: o cartão (a textura da galeria, até
   1280 px) e a imagem grande da ficha (até 2000 px; as páginas inteiras
   com 1200 px de largura).

   E, desde a V2:
   · a cor de cada imagem (VP-93): a média ponderada pela saturação, para
     o brilho do fundo puxar de leve para o cartão da vez. Vai junto com a
     medida em src/data/image-sizes.json;
   · a prévia de compartilhamento (VP-60) de cada projeto com imagem, em
     public/og/<id>.jpg (1200 × 630), e a do site, public/og/site.jpg: o
     brilho lavanda medido das telas, o logotipo e o cartão;
   · os ícones (VP-16): public/favicon.svg, apple-touch-icon.png (180 px) e
     icon-512.png.
   · (VP-99, 19/out/2026) o cartão também em 800 px (<id>-m.webp), para
     telas pequenas: menos para baixar e para mandar à placa de vídeo.
   · (VP-102, 19/out/2026) SÓ REFAZ O QUE MUDOU. Cada saída guarda a
     impressão (sha1) do arquivo e das opções que a geraram, em
     scripts/imagens-feitas.json; se a impressão é a mesma e a saída existe,
     ela fica como está. Antes, cada rodada recodificava as ~80 imagens, e
     o WebP e o JPEG mudam alguns bytes de uma máquina para outra: o git via
     tudo como mudado.
   Rodar: npm run images
          npm run images -- --tudo      refaz tudo
          npm run images -- --semente   só anota as impressões das saídas que
                                        já existem (para começar sem recodificar) */
import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { wordmarkPath } from '../src/ui/wordmark.ts';
import { parseAll } from '../src/content/parse.ts';

const OUT = 'public/img';
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync('public/og', { recursive: true });
const done = [];
let kept = 0;

/* ── as impressões (VP-102) ── */
const CACHE = 'scripts/imagens-feitas.json';
const TUDO = process.argv.includes('--tudo');
const SEMENTE = process.argv.includes('--semente');
const before = !TUDO && fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
const after = {};
/** a impressão de um conjunto de entradas (buffers ou textos); mude VERSAO para refazer tudo de uma vez */
const VERSAO = '1';
const stamp = (...parts) => {
  const h = crypto.createHash('sha1').update(VERSAO);
  for (const p of parts) h.update(typeof p === 'string' ? p : p ?? '');
  return h.digest('hex').slice(0, 16);
};
/** true quando a saída existe e foi feita das mesmas entradas (então fica como está) */
const upToDate = (dst, key) => {
  const k = dst.split(path.sep).join('/');
  after[k] = key;
  if (!fs.existsSync(dst)) return false;
  return SEMENTE || before[k] === key;
};

/** A cor que representa a imagem: a média ponderada pela saturação (cinza e preto pesam pouco). */
async function accent(file) {
  const { data, info } = await sharp(file).resize(48, 48, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let r = 0, g = 0, b = 0, w = 0, mr = 0, mg = 0, mb = 0;
  const n = info.width * info.height;
  for (let i = 0; i < n; i++) {
    const R = data[i * 3], G = data[i * 3 + 1], B = data[i * 3 + 2];
    const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
    const sat = mx ? (mx - mn) / mx : 0, val = mx / 255;
    const k = sat * sat * val + 1e-4;
    r += R * k; g += G * k; b += B * k; w += k;
    mr += R; mg += G; mb += B;
  }
  const hex = (x) => Math.round(x).toString(16).padStart(2, '0');
  /* quase sem cor (um site preto e branco): fica a média, que o fundo quase não sente */
  return w > n * 0.004 ? `#${hex(r / w)}${hex(g / w)}${hex(b / w)}` : `#${hex(mr / n)}${hex(mg / n)}${hex(mb / n)}`;
}

async function save(src, dst, opts) {
  if (upToDate(dst, stamp(fs.readFileSync(src), JSON.stringify(opts)))) kept++;
  else {
    const img = sharp(src, { limitInputPixels: false });
    const meta = await img.metadata();
    await img.resize({ width: opts.w, height: opts.h, fit: 'inside', withoutEnlargement: true }).webp({ quality: opts.q ?? 80, effort: 5 }).toFile(dst);
    const o = await sharp(dst).metadata();
    done.push(`${path.basename(dst)}  ${meta.width}×${meta.height} → ${o.width}×${o.height}  ${(fs.statSync(dst).size / 1024).toFixed(0)} KB`);
  }
  const out = await sharp(dst).metadata();
  return { width: out.width, height: out.height, color: await accent(dst) };
}

/* os projetos (para as prévias e para saber quais imagens são cartões) */
const files = {};
for (const f of fs.readdirSync('content/projects')) if (f.endsWith('.md')) files[f] = fs.readFileSync(path.join('content/projects', f), 'utf8');
const projects = parseAll(files);
/* só os cartões vão para a placa de vídeo: só eles ganham a versão de 800 px */
const CARDS = new Set(projects.map((p) => p.card).filter(Boolean));

const sizes = {};
for (const f of fs.readdirSync('media/sites').sort()) {
  if (!/\.(jpe?g|png)$/i.test(f)) continue;
  const id = f.replace(/\.(jpe?g|png)$/i, '');
  const src = path.join('media/sites', f);
  if (id.endsWith('-full')) sizes[id] = await save(src, path.join(OUT, `${id}.webp`), { w: 1200, h: 16000, q: 74 });
  else {
    sizes[id] = await save(src, path.join(OUT, `${id}.webp`), { w: 1280, h: 1280, q: 80 });
    if (CARDS.has(id)) sizes[`${id}-m`] = await save(src, path.join(OUT, `${id}-m.webp`), { w: 800, h: 800, q: 80 });
  }
}
for (const f of fs.readdirSync('media/design').sort()) {
  if (!/\.(jpe?g|png)$/i.test(f)) continue;
  const id = f.replace(/\.(jpe?g|png)$/i, '');
  const src = path.join('media/design', f);
  sizes[id] = await save(src, path.join(OUT, `${id}.webp`), { w: 1280, h: 1280, q: 84 });
  if (CARDS.has(id)) sizes[`${id}-m`] = await save(src, path.join(OUT, `${id}-m.webp`), { w: 800, h: 800, q: 84 });
  sizes[`${id}-full`] = await save(src, path.join(OUT, `${id}-full.webp`), { w: 2000, h: 2000, q: 84 });
}
/* VP-02: o retrato do Perfil (media/perfil/retrato.jpg ou .png), quando houver: vai ao meio da composição */
if (fs.existsSync('media/perfil')) for (const f of fs.readdirSync('media/perfil').sort()) {
  if (!/^retrato\.(jpe?g|png)$/i.test(f)) continue;
  sizes.retrato = await save(path.join('media/perfil', f), path.join(OUT, 'retrato.webp'), { w: 1000, h: 1400, q: 84 });
}
/* o que não existe mais em media/ sai de public/img (uma captura trocada não fica para trás) */
for (const f of fs.readdirSync(OUT)) if (!sizes[f.replace(/\.webp$/, '')]) { fs.unlinkSync(path.join(OUT, f)); done.push(`(apagada) ${f}`); }
fs.writeFileSync('src/data/image-sizes.json', JSON.stringify(sizes, null, 2) + '\n');

/* ── o logotipo e o brilho, em SVG (as medidas das telas) ── */
const WM = wordmarkPath();
const OV = 7;
const wordmark = (x, y, h, fill = '#fff') => {
  const s = h / (1000 + OV * 2);
  return `<g transform="translate(${x} ${y + OV * s}) scale(${s})" fill="${fill}" fill-rule="evenodd">${WM.d}</g>`;
};
/* o brilho: uma elipse que encosta nas bordas, de #878EE9 no centro a preto, em linha reta (como o shader) */
const glow = (w, h) => `<defs><radialGradient id="g" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
  <stop offset="0" stop-color="#878ee9"/><stop offset="0.25" stop-color="#6569af"/><stop offset="0.5" stop-color="#444775"/>
  <stop offset="0.75" stop-color="#22233a"/><stop offset="1" stop-color="#000"/></radialGradient></defs>
  <rect width="${w}" height="${h}" fill="#000"/><rect width="${w}" height="${h}" fill="url(#g)"/>`;

/* ── as prévias de compartilhamento (VP-60) ── */
const W = 1200, H = 630;
async function og(out, cardFile) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${glow(W, H)}${wordmark(44, 40, cardFile ? 70 : 120)}</svg>`;
  if (upToDate(out, stamp(svg, cardFile ? fs.readFileSync(cardFile) : 'sem cartão'))) { kept++; return; }
  const layers = [];
  if (cardFile) {
    const m = await sharp(cardFile).metadata();
    const maxW = 720, maxH = 420;
    const k = Math.min(maxW / m.width, maxH / m.height);
    const w = Math.round(m.width * k), h = Math.round(m.height * k);
    const card = await sharp(cardFile).resize(w, h).toBuffer();
    const shadow = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w + 120}" height="${h + 120}"><rect x="60" y="78" width="${w}" height="${h}" fill="rgba(10,10,40,0.55)"/></svg>`)).blur(26).png().toBuffer();
    const left = Math.round((W - w) / 2), top = Math.round(150 + (420 - h) / 2);
    layers.push({ input: shadow, left: left - 60, top: top - 60 }, { input: card, left, top });
  }
  await sharp(Buffer.from(svg)).composite(layers).jpeg({ quality: 86, mozjpeg: true }).toFile(out);
  done.push(`${out}  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
}
const ogUsed = new Set(['site.jpg']);
for (const p of projects) {
  if (!p.card || !sizes[p.card]) continue;
  await og(`public/og/${p.id}.jpg`, path.join(OUT, `${p.card}.webp`));
  ogUsed.add(`${p.id}.jpg`);
}
/* a do site: o logotipo grande no meio do brilho */
{
  const h = 150, w = (WM.width / 1014) * h;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${glow(W, H)}${wordmark((W - w) / 2, (H - h) / 2, h)}</svg>`;
  if (upToDate('public/og/site.jpg', stamp(svg))) kept++;
  else {
    await sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toFile('public/og/site.jpg');
    done.push(`public/og/site.jpg  ${(fs.statSync('public/og/site.jpg').size / 1024).toFixed(0)} KB`);
  }
}
for (const f of fs.readdirSync('public/og')) if (!ogUsed.has(f)) fs.unlinkSync(path.join('public/og', f));

/* ── os ícones (VP-16): o V e o P do logotipo, brancos no brilho ── */
{
  /* as duas letras saem do próprio desenho: a 1ª e a 6ª peça do caminho (V e P) */
  const parts = WM.d.match(/<path d="[^"]+" transform="translate\([\d.]+ 0\)"\/>/g);
  const v = parts[0];
  const pPath = parts[5].replace(/translate\([\d.]+ 0\)/, `translate(${470 + 70} 0)`);
  const monoW = 470 + 70 + 447;   // V (470), o espaço, P (447)
  const icon = (size, round) => {
    const pad = size * 0.2, h = size - pad * 2, s = h / 1014;
    const w = monoW * s;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
<defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#878ee9"/><stop offset="1" stop-color="#000"/></radialGradient></defs>
<rect width="${size}" height="${size}" rx="${round ? size * 0.22 : 0}" fill="#000"/><rect width="${size}" height="${size}" rx="${round ? size * 0.22 : 0}" fill="url(#g)"/>
<g transform="translate(${(size - w) / 2} ${pad + OV * s}) scale(${s})" fill="#fff" fill-rule="evenodd">${v}${pPath}</g></svg>`;
  };
  const fav = icon(64, true);
  if (upToDate('public/favicon.svg', stamp(fav))) kept++;
  else { fs.writeFileSync('public/favicon.svg', fav); done.push('public/favicon.svg'); }
  for (const [file, size] of [['public/apple-touch-icon.png', 180], ['public/icon-512.png', 512]]) {
    const svg = icon(size, false);
    if (upToDate(file, stamp(svg))) { kept++; continue; }
    await sharp(Buffer.from(svg)).png().toFile(file);
    done.push(file);
  }
}

/* as impressões das saídas que existem, em ordem (o arquivo muda pouco no git) */
const keep = Object.fromEntries(Object.keys(after).sort().filter((k) => fs.existsSync(k)).map((k) => [k, after[k]]));
fs.writeFileSync(CACHE, JSON.stringify(keep, null, 2) + '\n');

console.log([...done, `${kept} já em dia${SEMENTE ? ' (impressões anotadas, nada recodificado)' : ''}.`].join('\n'));
