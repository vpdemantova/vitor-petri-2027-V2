/* ════════════════════════════════════════════════════════════════════
   O LOGOTIPO "VITOR PETRI", desenhado letra por letra (10/out/2026).

   As medidas saem do logotipo WHIZBIGG das telas de referência, medido
   pixel a pixel (scripts de análise no histórico do projeto). Na unidade
   em que a altura das maiúsculas vale 1000:
     · haste 174 (o I tem 175 de largura; H, B e G têm hastes de 172–175);
     · barra horizontal 76 (a travessa do H, as barras do Z, do B e do G);
     · miolos estreitos, de uns 100 (o vão entre as hastes do H e do B);
     · cantos de fora arredondados, de uns 110 (o B à direita, o G nos
       quatro cantos), e as curvas passam um pouco da linha (o G vai de
       −6 a 1006);
     · o entalhe no meio do lado direito do B, onde as duas barrigas se
       encontram (de 47 de fundo);
     · espaço entre letras de uns 100.
   As letras que o WHIZBIGG não tem saem dessas regras:
     V  as diagonais com a largura de uma haste, fechando embaixo;
     T  a barra do Z por cima, a haste do I no meio;
     O  o G sem a abertura nem o esporão;
     R  o B com a barriga de baixo aberta (a perna reta);
     P  a barriga de cima do B, com o canto de baixo redondo;
     E  a haste do B com três barras.
   Tudo vira um SVG (um caminho só, regra "evenodd" para os miolos).
════════════════════════════════════════════════════════════════════ */

const S = 174;   // haste
const BAR = 76;  // barra
const R = 110;   // canto de fora
const K = 0.6;   // quanto a curva do canto "puxa" (0,55 = círculo; mais = mais quadrado)
const GAP = 100; // entre letras
const SPACE = 250; // entre as palavras
const OV = 7;    // o quanto as letras redondas passam da linha

type Pt = [number, number];

/** Retângulo de cantos arredondados (raios por canto: sup. esq., sup. dir., inf. dir., inf. esq.). */
function roundRect(x0: number, y0: number, x1: number, y1: number, r: [number, number, number, number]): string {
  const [tl, tr, br, bl] = r;
  const c = (v: number) => v * K;
  const parts = [
    `M${x0 + tl} ${y0}`,
    `H${x1 - tr}`,
    tr ? `C${x1 - tr + c(tr)} ${y0} ${x1} ${y0 + tr - c(tr)} ${x1} ${y0 + tr}` : "",
    `V${y1 - br}`,
    br ? `C${x1} ${y1 - br + c(br)} ${x1 - br + c(br)} ${y1} ${x1 - br} ${y1}` : "",
    `H${x0 + bl}`,
    bl ? `C${x0 + bl - c(bl)} ${y1} ${x0} ${y1 - bl + c(bl)} ${x0} ${y1 - bl}` : "",
    `V${y0 + tl}`,
    tl ? `C${x0} ${y0 + tl - c(tl)} ${x0 + tl - c(tl)} ${y0} ${x0 + tl} ${y0}` : "",
    "Z",
  ].filter(Boolean);
  return parts.join("");
}

const poly = (pts: Pt[]) => `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}Z`;

/* ── as letras: cada uma devolve o desenho (na origem) e a largura ── */
interface Glyph { d: string; w: number }

const V = (): Glyph => {
  /* as diagonais têm a largura (na horizontal) da diagonal do Z, 151, e a
     inclinação de 0,148: os lados de dentro se encontram a 57% da altura,
     e o pé tem a largura de uma haste */
  const w = 470, foot = 148, d = 151;
  const apex = (w - 2 * d) / (2 * (foot / 1000));
  return { w, d: poly([[0, 0], [d, 0], [w / 2, apex], [w - d, 0], [w, 0], [w - foot, 1000], [foot, 1000]]) };
};

const I = (): Glyph => ({ w: 175, d: poly([[0, 0], [175, 0], [175, 1000], [0, 1000]]) });

const T = (): Glyph => {
  const w = 449, s0 = (w - S) / 2;
  return { w, d: poly([[0, 0], [w, 0], [w, BAR], [s0 + S, BAR], [s0 + S, 1000], [s0, 1000], [s0, BAR], [0, BAR]]) };
};

const O = (): Glyph => {
  const w = 449;
  /* por fora: os quatro cantos redondos, passando um pouco da linha;
     por dentro: o miolo estreito do G (de 172 a 277), cantos quase retos */
  const outer = roundRect(0, -OV, w, 1000 + OV, [R, R, R, R]);
  const inner = roundRect(S - 2, BAR - 2, w - S + 2 - 1, 1000 - BAR + 2, [18, 18, 18, 18]);
  return { w, d: outer + inner };
};

/** O lado direito com o entalhe do B: desce de y0 até o entalhe e segue até y1. */
function notchRight(x: number, yNotch: number): string {
  const depth = 49, half = 58;
  return `V${yNotch - half}C${x} ${yNotch - half + 34} ${x - depth + 24} ${yNotch} ${x - depth} ${yNotch}` +
         `C${x - depth + 24} ${yNotch} ${x} ${yNotch + half - 34} ${x} ${yNotch + half}`;
}

const P = (): Glyph => {
  const w = 447, mid = 489;
  const c = (v: number) => v * K;
  const d = `M0 0H${w - R}C${w - R + c(R)} 0 ${w} ${R - c(R)} ${w} ${R}V${mid - R}` +
            `C${w} ${mid - R + c(R)} ${w - R + c(R)} ${mid} ${w - R} ${mid}H${S}V1000H0Z` +
            roundRect(S, BAR, w - S + 1, 412, [0, 14, 14, 0]);
  return { w, d };
};

const Rg = (): Glyph => {
  /* o B com a barriga de baixo aberta: a perna desce reta até a linha */
  const w = 447, legX = w - S + 1;
  const c = (v: number) => v * K;
  const d = `M0 0H${w - R}C${w - R + c(R)} 0 ${w} ${R - c(R)} ${w} ${R}` +
            notchRight(w, 451) +
            `V1000H${legX}V489H${S}V1000H0Z` +
            roundRect(S, BAR, legX, 412, [0, 14, 14, 0]);
  return { w, d };
};

const E = (): Glyph => {
  const w = 400;
  return { w, d: poly([[0, 0], [w, 0], [w, BAR], [S, BAR], [S, 412], [w - 30, 412], [w - 30, 489], [S, 489], [S, 1000 - BAR], [w, 1000 - BAR], [w, 1000], [0, 1000]]) };
};

const GLYPHS: Record<string, () => Glyph> = { V, I, T, O, R: Rg, P, E };

/** As letras soltas: o desenho de cada uma e onde ela começa (para o canvas das partículas). */
export function wordmarkGlyphs(text = "VITOR PETRI"): { glyphs: { d: string; x: number }[]; width: number } {
  let x = 0;
  const glyphs: { d: string; x: number }[] = [];
  const chars = [...text];
  chars.forEach((ch, i) => {
    if (ch === " ") { x += SPACE - GAP; return; }
    const g = GLYPHS[ch]?.();
    if (!g) return;
    glyphs.push({ d: g.d, x });
    x += g.w + (i < chars.length - 1 ? GAP : 0);
  });
  return { glyphs, width: x };
}

/** O caminho SVG da palavra inteira e a caixa dela. */
export function wordmarkPath(text = "VITOR PETRI"): { d: string; width: number } {
  const { glyphs, width } = wordmarkGlyphs(text);
  return { d: glyphs.map((g) => `<path d="${g.d}" transform="translate(${g.x} 0)"/>`).join(""), width };
}

/** As medidas da caixa (a altura das letras vale 1000, mais o que as redondas passam). */
export const WORDMARK_OV = OV;

/** O SVG pronto (cor pelo "currentColor"). Cada letra num grupo (a abertura as faz chegar uma a uma). */
export function wordmarkSVG(label = "Vitor Petri", className = "wordmark"): string {
  const { glyphs, width } = wordmarkGlyphs();
  const d = glyphs.map((g) => `<g transform="translate(${g.x} 0)"><path class="wm-l" d="${g.d}"/></g>`).join("");
  const a11y = label ? `role="img" aria-label="${label}"><title>${label}</title>` : `aria-hidden="true">`;
  return `<svg class="${className}" viewBox="0 ${-OV} ${width} ${1000 + OV * 2}" fill="currentColor" fill-rule="evenodd" ${a11y}${d}</svg>`;
}
