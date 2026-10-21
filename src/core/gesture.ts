/* ════════════════════════════════════════════════════════════════════
   A ROLAGEM QUE DECIDE (VP-108, 19/out/2026), em contas puras.
   De onde veio: o pedido dele em 19/out ("a galeria deve dar scroll em uma
   direção só"). Antes, cada dente da roda somava ~0,24 de cartão e o ímã
   puxava de volta para o cartão inteiro mais perto: a galeria ia e voltava,
   e quem rolava devagar nunca saía do lugar. Para onde vai: core/input.ts
   (a roda e o arrasto da galeria); os testes em gesture.test.ts.

   · A RODA: um gesto (rodadas sem pausa maior que WHEEL.gap) anda pelo
     menos um cartão na direção em que começou, já no primeiro dente; cada
     WHEEL.next pixels a mais no mesmo gesto, mais um. A direção fica presa
     no gesto: o tremor do fim do embalo de um trackpad (deltas pequenos ao
     contrário) não puxa para trás; só uma virada de verdade (mais de
     WHEEL.reverse pixels ao contrário) começa um gesto novo.
   · O ARRASTO: ao soltar, quem andou mais que DRAG_COMMIT de cartão vai até
     o próximo cartão inteiro nessa direção (com o embalo, talvez mais);
     quem quase não andou volta para onde estava.
════════════════════════════════════════════════════════════════════ */

export const WHEEL = {
  /** pixels de roda que fazem o primeiro passo de um gesto (um dente de mouse tem uns 100) */
  first: 12,
  /** pixels a mais, no mesmo gesto, para cada passo seguinte (um trackpad longo passa vários) */
  next: 260,
  /** sem roda por mais que isto (ms), o gesto acabou */
  gap: 180,
  /** pixels ao contrário que valem como virada de verdade (menos que isso é tremor) */
  reverse: 60,
};

/** Quanto de arrasto (em cartões) já leva ao próximo cartão ao soltar. */
export const DRAG_COMMIT = 0.12;

/** A roda: recebe cada delta (em pixels, com sinal) e o tempo (ms); devolve quantos passos dar agora (com sinal). */
export function createWheelStepper(opts = WHEEL) {
  let dir = 0, acc = 0, steps = 0, rev = 0, last = -Infinity;
  return function feed(delta: number, now: number): number {
    if (!delta) return 0;
    if (now - last > opts.gap) { dir = 0; acc = 0; steps = 0; rev = 0; }
    last = now;
    const d = Math.sign(delta);
    if (dir && d !== dir) {
      rev += Math.abs(delta);
      if (rev < opts.reverse) return 0;
      /* virou de propósito: um gesto novo, nesta direção */
      dir = 0; acc = rev; steps = 0; rev = 0;
    } else {
      rev = 0;
      acc += Math.abs(delta);
    }
    if (!dir) dir = d;
    const want = acc >= opts.first ? 1 + Math.floor((acc - opts.first) / opts.next) : 0;
    const n = want - steps;
    steps = want;
    return n * dir;
  };
}

/**
 * O arrasto, ao soltar: para que cartão (inteiro) a fila vai.
 * start: o alvo quando o dedo desceu; now: o alvo agora; flick: o embalo extra (em cartões).
 */
export function releaseTarget(start: number, now: number, flick = 0, commit = DRAG_COMMIT): number {
  const base = Math.round(start);
  const moved = now - start + flick;
  if (Math.abs(moved) < commit) return base;
  return base + Math.sign(moved) * Math.max(1, Math.round(Math.abs(moved)));
}

/**
 * VP-116 (21/out/2026, "deixe a galeria rolar mais depois que o mouse larga, diminua o freio"): o embalo.
 * Antes, o arrasto ao soltar ganhava no máximo uma fração de cartão (a conta usava só o último movimento,
 * por quadro). Agora a velocidade é medida nos últimos ~100 ms da mão, e a fila desliza a distância que
 * esse embalo leva com um freio leve (GLIDE.omega: quanto menor, mais longe), até o cartão inteiro mais perto.
 */
export const GLIDE = {
  /** o freio do deslize (1/s): a distância é a velocidade ÷ omega */
  omega: 2.2,
  /** o quanto de histórico mede a velocidade (ms), e quanto tempo parado zera o embalo (ms) */
  window: 100, stale: 110,
  /** abaixo disso (cartões/s), não desliza: só encaixa */
  min: 0.6,
  /** no máximo, quantos cartões um arremesso anda */
  max: 12,
};

/** A velocidade da mão ao soltar, em cartões por segundo, a partir das amostras (t em ms, x em cartões). */
export function releaseVelocity(samples: { t: number; x: number }[], now: number, g = GLIDE): number {
  if (samples.length < 2) return 0;
  const last = samples[samples.length - 1];
  if (now - last.t > g.stale) return 0;
  let i = samples.length - 1;
  while (i > 0 && last.t - samples[i - 1].t <= g.window) i--;
  const first = samples[i === samples.length - 1 ? i - 1 : i];
  const dt = (last.t - first.t) / 1000;
  return dt > 0 ? (last.x - first.x) / dt : 0;
}

/** Quantos cartões o embalo ainda anda depois de soltar (com sinal), com o freio leve do GLIDE. */
export function coast(v: number, g = GLIDE): number {
  if (Math.abs(v) < g.min) return 0;
  return Math.max(-g.max, Math.min(g.max, v / g.omega));
}

/** O eixo do arrasto, escolhido no começo do gesto pelo lado que andou mais. */
export const dragAxis = (dx: number, dy: number): "x" | "y" => (Math.abs(dx) > Math.abs(dy) ? "x" : "y");
