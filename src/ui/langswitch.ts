/* ════════════════════════════════════════════════════════════════════
   A TROCA DE IDIOMA ANIMADA (VP-01), no jeito do vitordemantova.com
   (lib/localeTransition.ts de lá), em três tempos e só no que está na tela:
   1. SAI: cada texto visível sobe meia linha, desfoca e some, numa onda
      que começa no alto à esquerda e desce na diagonal;
   2. TROCA: o idioma muda (quem desenha texto redesenha: core/i18n.ts);
   3. VOLTA: os textos sobem para o lugar na mesma onda, e os curtos
      (até 40 letras) "decodificam": letras sorteadas que se acertam da
      esquerda para a direita.
   Com "reduzir movimento", troca na hora.
════════════════════════════════════════════════════════════════════ */
import { applyLang, type Lang } from "../core/i18n";
import { prefersReducedMotion } from "./dom";

const SEL = "#app h1, #app h2, #app h3, #app p, #app li, #app dt, #app dd, #app a, #app button, #app label, #app figcaption, #app .index-type, #app .index-year";
const OUT = 260, IN = 480, WAVE = 220;
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·/";
let busy = false;

function visible(): HTMLElement[] {
  const vw = innerWidth, vh = innerHeight;
  return [...document.querySelectorAll<HTMLElement>(SEL)].filter((el) => {
    if (el.closest("[data-no-lt], .preloader")) return false;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue!.trim())) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
  }).slice(0, 220);
}

function delay(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const d = (Math.max(0, r.top) / innerHeight) * 0.75 + (Math.max(0, r.left) / innerWidth) * 0.25;
  el.style.setProperty("--lt-d", `${Math.round(Math.min(1, d) * WAVE)}ms`);
}

function scramble(el: HTMLElement) {
  const nodes = [...el.childNodes].filter((n): n is Text => n.nodeType === 3 && !!n.nodeValue!.trim() && n.nodeValue!.length <= 40);
  for (const node of nodes) {
    const to = node.nodeValue!;
    const len = to.length, dur = 380 + len * 11;
    const at = Array.from({ length: len }, (_, i) => (i / len) * dur * 0.8 + Math.random() * 80);
    const t0 = performance.now();
    const tick = (now: number) => {
      if (node.nodeValue === to && now - t0 > dur) return;
      const t = now - t0;
      let s = "";
      for (let i = 0; i < len; i++) s += t >= at[i] || to[i] === " " ? to[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      node.nodeValue = s;
      if (t < dur) requestAnimationFrame(tick); else node.nodeValue = to;
    };
    requestAnimationFrame(tick);
  }
}

export async function switchLang(to: Lang) {
  if (busy) return;
  if (prefersReducedMotion()) { applyLang(to); return; }
  busy = true;
  const out = visible();
  out.forEach(delay);
  out.forEach((el) => el.classList.add("lt-out"));
  await new Promise((r) => setTimeout(r, OUT + WAVE));
  applyLang(to);
  out.forEach((el) => el.classList.remove("lt-out"));
  const back = visible();
  back.forEach(delay);
  back.forEach((el) => { el.classList.add("lt-in"); scramble(el); });
  await new Promise((r) => setTimeout(r, IN + WAVE));
  back.forEach((el) => { el.classList.remove("lt-in"); el.style.removeProperty("--lt-d"); });
  busy = false;
}
