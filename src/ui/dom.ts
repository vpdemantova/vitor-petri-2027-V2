/* Pequenas ferramentas de interface: criar elementos, os ícones e a
   armadilha de foco dos painéis (o Tab não sai do painel aberto; ao
   fechar, o foco volta para quem abriu). */

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string | boolean | undefined> = {}, ...children: (Node | string | null | undefined | false)[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k === "class") el.className = String(v);
    else if (k === "html") el.innerHTML = String(v);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

/** a seta ↗ desenhada (a mesma espessura em qualquer tamanho) */
export const ARROW = `<svg class="arrow" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 9.5 L9.5 2.5 M4 2.5 H9.5 V8"/></svg>`;
/** tocar e pausar (o tocador da gravação) */
export const PLAY = `<svg class="ico-play" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.8 L10.2 6 L3 10.2 Z"/></svg>`;
export const PAUSE = `<svg class="ico-play" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.6 1.8 H5 V10.2 H2.6 Z M7 1.8 H9.4 V10.2 H7 Z"/></svg>`;
/** o × dos botões de fechar */
export const CROSS = `<svg viewBox="-6 -6 12 12" aria-hidden="true"><path d="M-4 -4 L4 4 M4 -4 L-4 4"/></svg>`;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Prende o Tab dentro de `root`; devolve a função que solta. */
export function trapFocus(root: HTMLElement): () => void {
  const before = document.activeElement as HTMLElement | null;
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  root.addEventListener("keydown", onKey);
  return () => {
    root.removeEventListener("keydown", onKey);
    before?.focus?.({ preventScroll: true });
  };
}

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
