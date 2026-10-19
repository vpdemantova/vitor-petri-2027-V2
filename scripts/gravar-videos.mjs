/* ════════════════════════════════════════════════════════════════════
   GRAVAR OS VÍDEOS DOS CARTÕES (VP-95, 19/out/2026).
   De onde veio: a VP-95 ("vídeo no lugar da foto nos sites"); feito no
   Windows, com o Edge sem janela e o ffmpeg. Para onde vai: os laços de
   8 s em public/video/<id>.mp4, que a galeria toca no cartão da vez
   (src/gl/gallery.ts) quando o arquivo do projeto tem a linha video:.

   Rodar:   npm run videos                 (todos)
            npm run videos -- malha        (só um)
   Precisa:
   · o Edge ou o Chrome (ou CHROME=<caminho do executável>);
   · o ffmpeg no PATH (ou FFMPEG=<caminho>). Sem ele instalado, o jeito
     mais curto é numa pasta fora do projeto: npm i ffmpeg-static, e
     FFMPEG=<pasta>/node_modules/ffmpeg-static/ffmpeg.exe.

   Como grava:
   · abre o site em 1280 × 800, espera ele carregar e grava os quadros do
     navegador (screencast), com o tempo de cada um. O screencast pega a
     janela, com bordas, e não a página emulada: antes de gravar, um quadro
     de teste mede a diferença e a janela cresce o que falta;
   · 3D pesado (o Estúdio e o Laboratório) rende poucos quadros sem
     janela: o relógio da página fica 3× mais lento durante a gravação
     (performance.now, Date.now e requestAnimationFrame) e o vídeo volta à
     velocidade certa na hora de codificar;
   · o laço: 8 s; nos que giram, o fim se funde no começo num fade de
     0,6 s; nos que rolam, a página desce 4 s e sobe 4 s (emenda sozinha);
   · sai em H.264, 30 quadros por segundo, sem som, com o índice no começo
     do arquivo (começa a tocar antes de baixar inteiro). Meta: até ~1 MB.
════════════════════════════════════════════════════════════════════ */
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** o que gravar: o endereço, quanto esperar o site carregar, o relógio mais lento, o vaivém da rolagem */
const SITES = {
  vitordemantova: { url: "https://www.vitordemantova.com", wait: 60000, slow: 3 },
  laboratorio: { url: "https://www.vitordemantova.com/#laboratorio", wait: 60000, slow: 3 },
  malha: { url: "https://www.vitordemantova.com/#malha", wait: 32000, slow: 2 },
  editorial: { url: "https://www.vitordemantova.com/?modo=editorial", wait: 26000, slow: 2 },
  "portal-solar": { url: "https://montagnedejade.org", wait: 9000, pingpong: 1100 },
};
const W = 1280, H = 800, LOOP = 8, FADE = 0.6, PORT = 9351;

const CHROME = process.env.CHROME || [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => fs.existsSync(p));
const FFMPEG = process.env.FFMPEG || "ffmpeg";
if (!CHROME) { console.error("Não achei o Edge nem o Chrome: CHROME=<caminho> npm run videos"); process.exit(1); }
try { execFileSync(FFMPEG, ["-version"], { stdio: "ignore" }); } catch { console.error("Não achei o ffmpeg: ver o cabeçalho deste arquivo (FFMPEG=<caminho>)."); process.exit(1); }

const only = process.argv.slice(2);
const list = Object.entries(SITES).filter(([id]) => !only.length || only.includes(id));
const work = fs.mkdtempSync(path.join(os.tmpdir(), "vp-videos-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* o navegador sem janela, com a placa de vídeo */
const browser = spawn(CHROME, [`--headless=new`, `--remote-debugging-port=${PORT}`, `--user-data-dir=${work}/perfil`, "--disable-extensions", "--disable-component-extensions-with-background-pages",
  "--no-first-run", "--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: "ignore" });
for (let i = 0; i < 50; i++) { try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch { await sleep(200); } }

async function record(id, site) {
  const tab = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let n = 0;
  const pend = new Map();
  const frames = [];
  const dir = path.join(work, id);
  fs.mkdirSync(dir, { recursive: true });
  let onFrame = null;
  ws.addEventListener("message", (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); }
    if (d.method === "Page.screencastFrame") {
      ws.send(JSON.stringify({ id: ++n, method: "Page.screencastFrameAck", params: { sessionId: d.params.sessionId } }));
      onFrame?.(d.params);
    }
  });
  const cmd = (method, params = {}) => new Promise((r) => { const i = ++n; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await cmd("Page.enable");
  await cmd("Runtime.enable");
  if (site.slow) {
    await cmd("Page.addScriptToEvaluateOnNewDocument", { source: `(()=>{const K=1/${site.slow};const pn=performance.now.bind(performance);const t0=pn();performance.now=()=>t0+(pn()-t0)*K;const dn=Date.now;const d0=dn();Date.now=()=>d0+(dn()-d0)*K;const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=(cb)=>raf((t)=>cb(t0+(t-t0)*K));})()` });
  }
  await cmd("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await cmd("Page.navigate", { url: site.url });
  await sleep(site.wait);
  const slow = site.slow || 1;
  const ms = (LOOP + FADE + 0.6) * 1000 * slow;
  if (site.pingpong) {
    await cmd("Runtime.evaluate", { expression: `(()=>{const A=${site.pingpong};const t0=performance.now();const f=(t)=>{const u=(t-t0)/${LOOP * 1000};window.scrollTo({top:A*(1-Math.cos(2*Math.PI*u))/2,behavior:"instant"});if(t-t0<${ms})requestAnimationFrame(f)};requestAnimationFrame(f)})()` });
  }
  /* o screencast grava a janela (com bordas), não a página emulada: um quadro de teste mede a diferença
     e a janela cresce o que falta, para o quadro sair com W × H */
  const { windowId } = (await cmd("Browser.getWindowForTarget", { targetId: tab.id })).result;
  for (let i = 0; i < 3; i++) {
    const first = new Promise((r) => { onFrame = (p) => { onFrame = null; r(p.metadata); }; });
    await cmd("Page.startScreencast", { format: "jpeg", quality: 60, everyNthFrame: 1 });
    const meta = await Promise.race([first, sleep(3000).then(() => null)]);
    await cmd("Page.stopScreencast");
    if (!meta) break;
    const dw = W - Math.round(meta.deviceWidth), dh = H - Math.round(meta.deviceHeight);
    if (!dw && !dh) break;
    const { bounds } = (await cmd("Browser.getWindowBounds", { windowId })).result;
    await cmd("Browser.setWindowBounds", { windowId, bounds: { width: bounds.width + dw, height: bounds.height + dh } });
    await sleep(400);
  }
  onFrame = (p) => {
    fs.writeFileSync(path.join(dir, `f${String(frames.length).padStart(4, "0")}.jpg`), Buffer.from(p.data, "base64"));
    frames.push(p.metadata.timestamp);
  };
  await cmd("Page.startScreencast", { format: "jpeg", quality: 90, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  await sleep(ms);
  await cmd("Page.stopScreencast");
  onFrame = null;
  await fetch(`http://127.0.0.1:${PORT}/json/close/${tab.id}`).catch(() => {});
  ws.close();
  return { dir, frames, slow };
}

function encode(id, site, { dir, frames, slow }) {
  /* cada quadro dura o que durou de verdade (dividido pelo relógio mais lento) */
  /* se a página parou de mudar antes do fim, o último quadro fica na tela até completar o tempo */
  const need = LOOP + FADE + 0.2;
  const span = (frames.at(-1) - frames[0]) / slow;
  let txt = "";
  for (let i = 0; i < frames.length; i++) {
    const d = i + 1 < frames.length ? (frames[i + 1] - frames[i]) / slow : Math.max(1 / 30, need - span);
    txt += `file 'f${String(i).padStart(4, "0")}.jpg'\nduration ${d.toFixed(4)}\n`;
  }
  txt += `file 'f${String(frames.length - 1).padStart(4, "0")}.jpg'\n`;
  fs.writeFileSync(path.join(dir, "list.txt"), txt);
  const fc = site.pingpong
    ? `[0:v]scale=${W}:${H}:flags=lanczos,setsar=1,fps=30,trim=start=0:end=${LOOP},setpts=PTS-STARTPTS,format=yuv420p[v]`
    : `[0:v]scale=${W}:${H}:flags=lanczos,setsar=1,fps=30,split[a][b];[a]trim=start=${FADE}:end=${FADE + LOOP},setpts=PTS-STARTPTS[m];` +
      `[b]trim=start=0:end=${FADE},setpts=PTS-STARTPTS[h];[m][h]xfade=transition=fade:duration=${FADE}:offset=${LOOP - FADE},format=yuv420p[v]`;
  const out = path.join("public/video", `${id}.mp4`);
  fs.mkdirSync("public/video", { recursive: true });
  execFileSync(FFMPEG, ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(dir, "list.txt"), "-filter_complex", fc, "-map", "[v]",
    "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-profile:v", "high", "-movflags", "+faststart", "-an", out]);
  if (span < LOOP) console.warn(`  aviso: ${id} só mudou por ${span.toFixed(1)} s (a página parou?); confira o vídeo`);
  console.log(`${out}  ${frames.length} quadros  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
}

try {
  for (const [id, site] of list) {
    console.log(`gravando ${id} (${site.url})…`);
    encode(id, site, await record(id, site));
  }
} finally {
  browser.kill();
  await sleep(500);
  fs.rmSync(work, { recursive: true, force: true });
}
console.log("Pronto. Para um vídeo aparecer, o arquivo do projeto precisa da linha video: <id>.");
