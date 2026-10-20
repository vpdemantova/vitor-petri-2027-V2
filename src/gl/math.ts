/* ════════════════════════════════════════════════════════════════════
   AS CONTAS PURAS da galeria (VP-71, 16/out/2026): nada de three.js nem
   de navegador aqui, para os testes (src/gl/math.test.ts) rodarem no Node.
════════════════════════════════════════════════════════════════════ */

export function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** aproxima a de b com a pressa k por segundo, igual em qualquer taxa de quadros */
export const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-dt * k));

/**
 * A posição de um cartão na fila, já com a volta (a fila não tem fim).
 * r: a distância (em metros) do cartão até o foco, sem volta; L: o
 * comprimento da fila (N × D); D: o espaço entre cartões.
 * Os que já passaram (até 1,5 D) ficam do lado de cá; os outros, atrás.
 * Com menos de 3 cartões a fila não dá a volta (um cartão não pode estar
 * atrás e à frente ao mesmo tempo).
 */
export function wrap(r: number, L: number, D: number, n: number) {
  if (n < 3) return r;
  let v = ((r % L) + L) % L;
  if (v > L - 1.5 * D) v -= L;
  return v;
}

/** O índice (0…n−1) de uma posição qualquer da rolagem, contada em cartões. */
export const indexOf = (pos: number, n: number) => ((Math.round(pos) % n) + n) % n;

/**
 * O alvo da rolagem para chegar ao cartão i pelo caminho mais curto,
 * a partir do alvo de agora (em cartões, sem volta).
 */
export function shortestTarget(target: number, i: number, n: number) {
  const cur = Math.round(target);
  if (n < 3) return clamp(i, 0, n - 1);
  const base = ((cur % n) + n) % n;
  let d = i - base;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return cur + d;
}

/**
 * Um passo da mola criticamente amortecida (chega sem passar e sem
 * tremer). Devolve a posição e a velocidade novas.
 */
export function springStep(pos: number, vel: number, target: number, dt: number, stiff = 46) {
  const dampK = 2 * Math.sqrt(stiff);
  const acc = (target - pos) * stiff - vel * dampK;
  const v = vel + acc * dt;
  return { pos: pos + v * dt, vel: v };
}

/**
 * A distância da câmera ao cartão da vez depende da proporção da tela:
 * o cartão ocupa `share` da largura (57% no computador, 84% no celular em
 * pé). Devolve o fator k (≥ 1) que escala a fila, o espalhamento e a câmera.
 */
export function fitScale(aspect: number, fovDeg: number, cardW: number, focus: number) {
  const portrait = aspect < 0.9;
  const share = portrait ? 0.84 : 0.57;
  const want = cardW / (share * 2 * Math.tan((fovDeg * Math.PI) / 360) * aspect);
  return { k: Math.max(1, want / focus), portrait };
}

/**
 * Quanto um cartão aparece (0…1), pela posição dele na fila: some ao
 * passar da câmera, mostra só uns três para trás e entra pela volta da
 * fila sem pulo (o limite de trás é L − 1,5 D).
 */
export function visibility(rel: number, L: number, D: number, n: number) {
  const near = smoothstep(-D * 0.95, -D * 0.42, rel);
  const far = 1 - smoothstep(2.3 * D, 3.6 * D, rel);
  const back = n < 3 ? 1 : 1 - smoothstep(L - 2.1 * D, L - 1.55 * D, rel);
  return near * far * back;
}

/**
 * A FILA NUMA DIREÇÃO SÓ (VP-109, 20/out/2026: "uma direção somente e não alternado").
 * Antes, os cartões de trás alternavam os cantos (em cima à direita, embaixo à esquerda), e cada um
 * entrava e saía pelo seu canto: a cada cartão a rolagem parecia mudar de direção. Agora todos estão
 * numa linha só: os de trás sobem para a direita e se juntam no canto; o que passou desce para a
 * esquerda e some. Rolar para a frente leva tudo para baixo e para a esquerda, sempre.
 * As medidas são "na tela" (deslocamento ÷ distância da câmera), e por isso não dependem do tamanho
 * da janela nem do fator k. O primeiro de trás fica onde já ficava: 0,86 m e 0,5 m a 4,65 m da câmera
 * (FOCUS + D, em gl/gallery.ts), o primeiro canto das telas.
 */
export const LANE = {
  x: 0.86 / 4.65,
  y: 0.5 / 4.65,
  /** em pé, os vizinhos vão mais para cima que para o lado (como antes) */
  portraitX: 0.42, portraitY: 1.9,
  /** o quanto os de trás se juntam no canto (maior = mais juntos); em pé falta lugar, então mais */
  bunch: 0.4, bunchPortrait: 1.5,
  /** quanto o que passou corre para o lado ao sair (um cartão depois do foco), para não cobrir o da vez */
  exit: 2.2,
  /** depois do primeiro de trás, a subida achata (maior = mais reto para o lado): a pilha fica abaixo do menu */
  flat: 11,
  /** em pé, a fila inteira desce um pouco (na tela): os de trás ficam em cima e o de baixo não fica vazio */
  portraitDrop: 0.04,
  /** a inclinação de quem está fora do foco (radianos), a mesma de antes */
  rx: 0.025, ry: -0.06,
};

/**
 * Onde fica, na tela, um cartão a u lugares do foco (u > 0: atrás; u < 0: já passou).
 * x, y: o deslocamento "na tela" (multiplicar pela distância até a câmera para ter metros);
 * t: o quanto ele está fora do foco, de −1 a 1 (para a inclinação e o ajuste dos estreitos).
 * A curva não quebra no foco: o que passou sai com a mesma velocidade com que chegou e acelera
 * para o lado (até LANE.exit) enquanto some.
 */
export function laneOffset(u: number, portrait: boolean) {
  const a = portrait ? LANE.bunchPortrait : LANE.bunch;
  const slope = a / Math.log1p(a);
  const g = u >= 0 ? Math.log1p(a * u) / Math.log1p(a) : u * (slope + (LANE.exit - slope) * smoothstep(0, 1, -u));
  /* depois do primeiro de trás, a altura quase para de crescer (com a mesma inclinação em u = 1, sem quebra):
     os de trás seguem para a direita, abaixo do menu */
  let gy = g;
  if (u > 1) {
    const d1 = a / ((1 + a) * Math.log1p(a));
    gy = 1 + (d1 / LANE.flat) * Math.log1p(LANE.flat * (u - 1));
  }
  const sx = LANE.x * (portrait ? LANE.portraitX : 1), sy = LANE.y * (portrait ? LANE.portraitY : 1);
  return { x: sx * g, y: sy * gy, t: clamp(g, -1, 1) };
}

/** O texto "03 / 14" do contador. */
export const counterText = (i: number, n: number) => `${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
