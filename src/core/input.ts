/* ════════════════════════════════════════════════════════════════════
   AS ENTRADAS DA GALERIA: a roda, o arrasto (com embalo) e o teclado.

   O ajuste fino do arrasto (VP-24) mora em DRAG: quantos pixels de
   arrasto passam um cartão (no dedo e no mouse) e a força do embalo.
   Para testar num aparelho, ?arrasto=1.3 no endereço multiplica a força
   (1,3 = 30% mais sensível); o número que ficar bom vira o padrão aqui.

   Desde 19/out/2026 (VP-108, "a galeria deve dar scroll em uma direção
   só"), a rolagem decide: a roda anda pelo menos um cartão inteiro por
   gesto, na direção em que você rolou, e não volta; o arrasto segue um
   eixo só (o que andou mais no começo) e, ao soltar, vai até o próximo
   cartão nessa direção. As contas estão em core/gesture.ts, com testes.
   Desde 21/out/2026 (VP-116, "deixe a galeria rolar mais depois que o
   mouse larga, diminua o freio"), ao soltar com a mão ainda andando, a
   fila continua deslizando com o embalo (mais longe e com um freio leve),
   até o cartão inteiro em que o embalo a leva.
════════════════════════════════════════════════════════════════════ */
import type { Gallery } from "../gl/gallery";
import { createWheelStepper, releaseTarget, dragAxis, releaseVelocity, coast } from "./gesture";

export const DRAG = {
  /** pixels de arrasto por cartão */
  touchPx: 210,
  mousePx: 320,
  /** abaixo disso (em pixels), é um toque, não um arrasto */
  tap: 6,
};
const gain = Number(new URLSearchParams(location.search).get("arrasto")) || 1;

interface Opts {
  /** a galeria não responde (a abertura, um painel por cima) */
  blocked: () => boolean;
  /** um balão aberto (o contato): o clique na galeria só fecha ele, sem abrir nem mover nada (19/out/2026) */
  consumes?: () => boolean;
  /** um toque num cartão: o da vez abre, outro vai até ele */
  onTap: (index: number) => void;
  /** o primeiro gesto (a dica some) */
  onMove: () => void;
  onDrag: (dragging: boolean) => void;
}

export function bindInput(canvas: HTMLCanvasElement, g: Gallery, o: Opts) {
  /* a roda: um eixo (o vertical, a não ser que o gesto seja mesmo de lado) e passos inteiros */
  const wheel = createWheelStepper();
  window.addEventListener("wheel", (e) => {
    /* com o Índice aberto, a roda rola a lista (e não a galeria atrás dele) */
    if (o.blocked() || document.documentElement.dataset.panel) return;
    const scale = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 600 : 1;
    const d = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * scale;
    const n = wheel(d, performance.now());
    if (n) g.step(n);
    o.onMove();
  }, { passive: true });

  let dragging = false, lastX = 0, lastY = 0, downX = 0, downY = 0, moved = 0, start = 0, travel = 0;
  /* VP-116: as últimas posições da mão (t em ms, x em cartões), para o embalo ao soltar */
  let samples: { t: number; x: number }[] = [];
  let axis: "x" | "y" | null = null;
  canvas.addEventListener("pointerdown", (e) => {
    if (o.blocked() || o.consumes?.()) return;
    dragging = true; moved = 0; axis = null;
    lastX = downX = e.clientX; lastY = downY = e.clientY;
    start = g.target(); travel = 0;
    samples = [{ t: performance.now(), x: 0 }];
    canvas.setPointerCapture(e.pointerId);
    o.onDrag(true);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    moved = Math.hypot(e.clientX - downX, e.clientY - downY);
    /* antes de passar do toque, nada anda; depois, um eixo só, o que andou mais até ali */
    if (!axis) {
      if (moved <= DRAG.tap) return;
      axis = dragAxis(e.clientX - downX, e.clientY - downY);
      lastX = downX; lastY = downY;
    }
    const px = e.pointerType === "touch" ? DRAG.touchPx : DRAG.mousePx;
    /* para cima ou para a esquerda: o próximo (o cartão acompanha o dedo) */
    const along = axis === "y" ? e.clientY - lastY : e.clientX - lastX;
    const step = (-along / px) * gain;
    g.nudge(step);
    travel += step;
    const now = performance.now();
    samples.push({ t: now, x: travel });
    if (samples.length > 24) samples.shift();
    lastY = e.clientY; lastX = e.clientX;
    o.onMove();
  });
  const end = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    o.onDrag(false);
    if (!axis) {
      const hit = g.pick((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
      if (hit !== null) o.onTap(hit);
      return;
    }
    /* ao soltar: com a mão ainda andando, a fila desliza com o embalo (VP-116) até o cartão inteiro em que ele a leva;
       parada, vai ao próximo cartão inteiro na direção do arrasto */
    const extra = coast(releaseVelocity(samples, performance.now()));
    const to = releaseTarget(start, g.target(), extra);
    if (extra) g.glide(to); else g.settle(to);
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  return { dragging: () => dragging };
}
