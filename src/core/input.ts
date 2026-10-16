/* ════════════════════════════════════════════════════════════════════
   AS ENTRADAS DA GALERIA: a roda, o arrasto (com embalo) e o teclado.

   O ajuste fino do arrasto (VP-24) mora em DRAG: quantos pixels de
   arrasto passam um cartão (no dedo e no mouse) e a força do embalo.
   Para testar num aparelho, ?arrasto=1.3 no endereço multiplica a força
   (1,3 = 30% mais sensível); o número que ficar bom vira o padrão aqui.
════════════════════════════════════════════════════════════════════ */
import type { Gallery } from "../gl/gallery";

export const DRAG = {
  /** pixels de arrasto por cartão */
  touchPx: 210,
  mousePx: 320,
  /** o embalo ao soltar: quanto da velocidade final continua, e o teto */
  flick: 6.5,
  flickMax: 1.6,
  /** abaixo disso (em pixels), é um toque, não um arrasto */
  tap: 6,
};
const gain = Number(new URLSearchParams(location.search).get("arrasto")) || 1;

interface Opts {
  /** a galeria não responde (a abertura, um painel por cima) */
  blocked: () => boolean;
  /** um toque num cartão: o da vez abre, outro vai até ele */
  onTap: (index: number) => void;
  /** o primeiro gesto (a dica some) */
  onMove: () => void;
  onDrag: (dragging: boolean) => void;
}

export function bindInput(canvas: HTMLCanvasElement, g: Gallery, o: Opts) {
  window.addEventListener("wheel", (e) => {
    /* com o Índice aberto, a roda rola a lista (e não a galeria atrás dele) */
    if (o.blocked() || document.documentElement.dataset.panel) return;
    const scale = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 600 : 1;
    const d = (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * scale;
    g.nudge(Math.max(-0.6, Math.min(0.6, d / 420)));
    o.onMove();
  }, { passive: true });

  let dragging = false, lastX = 0, lastY = 0, lastT = 0, flick = 0, downX = 0, downY = 0, moved = 0;
  canvas.addEventListener("pointerdown", (e) => {
    if (o.blocked()) return;
    dragging = true; moved = 0;
    lastX = downX = e.clientX; lastY = downY = e.clientY; lastT = performance.now(); flick = 0;
    canvas.setPointerCapture(e.pointerId);
    o.onDrag(true);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dy = e.clientY - lastY, dx = e.clientX - lastX;
    const now = performance.now();
    const px = e.pointerType === "touch" ? DRAG.touchPx : DRAG.mousePx;
    const step = (-(dy + dx * 0.7) / px) * gain;
    g.nudge(step);
    flick = (step / Math.max(1, now - lastT)) * 16;
    lastY = e.clientY; lastX = e.clientX; lastT = now;
    moved = Math.hypot(e.clientX - downX, e.clientY - downY);
    if (moved > DRAG.tap) o.onMove();
  });
  const end = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    o.onDrag(false);
    if (moved < DRAG.tap) {
      const hit = g.pick((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
      if (hit !== null) o.onTap(hit);
    } else if (Math.abs(flick) > 0.02 && performance.now() - lastT < 90) g.nudge(Math.max(-DRAG.flickMax, Math.min(DRAG.flickMax, flick * DRAG.flick)));
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  return { dragging: () => dragging };
}
