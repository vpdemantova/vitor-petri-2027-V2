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

/** O texto "03 / 14" do contador. */
export const counterText = (i: number, n: number) => `${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
