/* ════════════════════════════════════════════════════════════════════
   A CAPA DAS COMPOSIÇÕES (VP-03, 16/out/2026). As obras de música não
   têm imagem: o cartão é desenhado na hora, como a página de rosto de uma
   partitura europeia (papel creme, um fio duplo, o nome do compositor em
   versaletes, o título em itálico, a formação, o ano), com uma pauta de
   cinco linhas em lavanda, a cor do brilho. Tudo sai do arquivo do
   projeto: nada é escrito aqui que não esteja lá.
   O mesmo desenho serve à galeria (textura) e à ficha (imagem).
════════════════════════════════════════════════════════════════════ */
import type { Project } from "../content/parse";
import { tx, t } from "../core/i18n";

export const COVER_W = 1024;
export const COVER_H = Math.round(COVER_W * Math.SQRT2);

const PAPER = "#f1ece1", INK = "#1b1a17", LAV = "#878ee9";

let fontsReady: Promise<unknown> | null = null;
/** As letras do site, carregadas antes do primeiro desenho (o canvas não espera sozinho). */
export function loadCoverFonts() {
  fontsReady ??= Promise.all([
    document.fonts.load('italic 500 120px "Cormorant Garamond"'),
    document.fonts.load('500 44px "Cormorant Garamond"'),
    document.fonts.load('700 26px "Lato"'),
    document.fonts.load('400 26px "Lato"'),
  ]).catch(() => undefined);
  return fontsReady;
}

/** Quebra o texto em linhas que cabem em maxW. */
function lines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/)) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width > maxW && cur) { out.push(cur); cur = w; } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, track: number) {
  /* versaletes espaçados, centrados em x */
  const chars = [...text];
  const w = chars.reduce((s, c) => s + ctx.measureText(c).width, 0) + track * (chars.length - 1);
  let cx = x - w / 2;
  for (const c of chars) { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + track; }
}

/** Desenha a capa no canvas dado (que é redimensionado para COVER_W × COVER_H). */
export function drawCover(canvas: HTMLCanvasElement, p: Project) {
  canvas.width = COVER_W; canvas.height = COVER_H;
  const ctx = canvas.getContext("2d")!;
  const W = COVER_W, H = COVER_H, cx = W / 2;
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  /* o grão do papel, fixo (o mesmo a cada desenho) */
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = rnd() < 0.5 ? "rgba(0,0,0,0.035)" : "rgba(255,255,255,0.25)";
    ctx.fillRect(rnd() * W, rnd() * H, 1.4, 1.4);
  }
  /* o fio duplo */
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2; ctx.strokeRect(58, 58, W - 116, H - 116);
  ctx.lineWidth = 0.9; ctx.strokeRect(70, 70, W - 140, H - 140);

  ctx.fillStyle = INK; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.font = '700 25px "Lato"';
  spaced(ctx, "VITOR P. DEMANTOVA", cx, 196, 6.5);

  /* o título: tão grande quanto couber em duas linhas */
  let size = 156;
  let tl: string[] = [];
  for (; size > 70; size -= 4) {
    ctx.font = `italic 500 ${size}px "Cormorant Garamond"`;
    tl = lines(ctx, p.name.en, W - 260);
    if (tl.length <= 2) break;
  }
  ctx.textAlign = "center";
  const lead = size * 0.98;
  const top = 560 - ((tl.length - 1) * lead) / 2;
  tl.forEach((l, i) => ctx.fillText(l, cx, top + i * lead));
  const below = top + (tl.length - 1) * lead;

  /* o fio curto e a formação */
  ctx.fillStyle = LAV; ctx.fillRect(cx - 54, below + 70, 108, 3);
  ctx.fillStyle = INK;
  const inst = tx(p.instrumentation);
  if (inst) {
    ctx.font = '500 44px "Cormorant Garamond"';
    lines(ctx, inst, W - 300).forEach((l, i) => ctx.fillText(l, cx, below + 150 + i * 54));
  }

  /* a pauta, em lavanda, no terço de baixo */
  const sy = H * 0.71;
  ctx.strokeStyle = LAV; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.moveTo(130, sy + i * 22); ctx.lineTo(W - 130, sy + i * 22); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  /* a barra dupla do fim, como no fim de uma peça */
  ctx.fillStyle = LAV;
  ctx.fillRect(W - 142, sy, 3, 88); ctx.fillRect(W - 134, sy, 8, 88);

  /* embaixo: a gravação (quando há) e o ano */
  ctx.fillStyle = INK; ctx.font = '400 25px "Lato"';
  const foot: string[] = [];
  if (p.audio) foot.push(`${t("recording").toUpperCase()}${p.duration ? ` · ${p.duration}` : ""}`);
  if (p.year) foot.push(p.year);
  foot.forEach((f, i) => spaced(ctx, f, cx, H - 196 + i * 46 - (foot.length - 1) * 46, 5));
  if (p.audio) {
    /* o sinal de tocar, num círculo, acima do rodapé */
    const y = H - 196 - (foot.length - 1) * 46 - 70;
    ctx.lineWidth = 2; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.arc(cx, y, 26, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 8, y - 12); ctx.lineTo(cx + 13, y); ctx.lineTo(cx - 8, y + 12); ctx.closePath(); ctx.fill();
  }
  return canvas;
}
