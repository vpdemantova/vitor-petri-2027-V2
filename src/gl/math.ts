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
 * A FILA (VP-109, 20/out/2026; VP-111, 21/out/2026).
 * VP-109, "uma direção somente e não alternado": antes, os cartões de trás alternavam os cantos e cada
 * um entrava e saía pelo seu canto, e a rolagem parecia mudar de direção a cada cartão. Agora todos
 * estão numa linha só, e rolar leva tudo para o mesmo lado.
 * VP-111, "aparecer o projeto anterior também e não só o próximo… deve ficar atrás como ficava": a linha
 * passa pelo foco. Os próximos ficam em cima à direita; os anteriores, embaixo à esquerda (onde ficava o
 * cartão de baixo); todos ATRÁS do da vez, mais longe da câmera. Rolar para a frente: o da vez recua
 * para baixo e para a esquerda e vira o anterior; o próximo vem de cima e da direita até o foco. Nada
 * mais passa por cima da tela.
 * As medidas são "na tela" (deslocamento ÷ distância da câmera), e por isso não dependem do tamanho da
 * janela nem do fator k. O primeiro de cada lado fica onde já ficava: 0,86 m e 0,5 m a 4,65 m da câmera
 * (FOCUS + D, em gl/gallery.ts), os cantos das telas.
 */
export const LANE = {
  x: 0.86 / 4.65,
  y: 0.5 / 4.65,
  /** em pé, os vizinhos vão mais para cima e para baixo que para o lado (como antes) */
  portraitX: 0.42, portraitY: 1.9,
  /** o quanto os de cada lado se juntam no canto (maior = mais juntos); em pé falta lugar, então mais */
  bunch: 0.4, bunchPortrait: 1.5,
  /** depois do primeiro de cada lado, a altura quase para de crescer: a pilha fica longe do menu e do pé */
  flat: 11,
  /** a profundidade em V: o bico arredondado no foco (0 = bico vivo, com tranco) */
  bend: 0.3,
  /** quantos aparecem: os próximos até `ahead`, os anteriores até `behind` (em cartões), e somem em `fade` */
  ahead: 2.2, behind: 1.2, fade: 0.9,
  /** VP-111: os de lado viram um pouco para o meio, como numa vitrine (radianos) */
  rx: 0.04, ry: -0.12,
  /** VP-115: na troca, o que chega passa por cima (sobe) e o que sai passa por baixo (desce), como numa roda;
      na tela, vezes a distância. Em pé, os lados já se afastam na vertical, então menos */
  lift: 0.085, dip: 0.13, swingPortrait: 0.55,
};

/**
 * VP-115 (21/out/2026, "as animações estão bem ruins ainda"): a troca entre o da vez e o próximo. Os dois
 * passam pela mesma profundidade no meio do caminho, e ali um tem de passar à frente do outro; antes, eles
 * se sobrepunham nesse instante e a troca aparecia como um estalo. Agora, no meio do caminho, o que chega
 * está mais alto e o que sai mais baixo, sem se tocar: a troca acontece no vão entre os dois.
 * Devolve o quanto o cartão sobe (ou desce), na tela, a u lugares do foco; zero fora da troca (|u| ≥ 1).
 */
export function laneSwing(u: number, portrait: boolean) {
  const v = Math.abs(u);
  if (v >= 1 || v === 0) return 0;
  const s = Math.sin(Math.PI * v) * (portrait ? LANE.swingPortrait : 1);
  return u > 0 ? LANE.lift * s : -LANE.dip * s;
}

/** O desenho de um lado: g, para o lado; gy, para cima (que achata depois do primeiro). v ≥ 0. */
function laneSide(v: number, a: number) {
  const g = Math.log1p(a * v) / Math.log1p(a);
  let gy = g;
  if (v > 1) {
    const d1 = a / ((1 + a) * Math.log1p(a));
    gy = 1 + (d1 / LANE.flat) * Math.log1p(LANE.flat * (v - 1));
  }
  return { g, gy };
}

/**
 * Onde fica, na tela, um cartão a u lugares do foco (u > 0: os próximos; u < 0: os anteriores).
 * x, y: o deslocamento "na tela" (multiplicar pela distância até a câmera para ter metros);
 * t: o quanto ele está fora do foco, de −1 a 1 (para a inclinação e o ajuste dos estreitos).
 * Os dois lados são o espelho um do outro, e a curva passa pelo foco sem quebra.
 */
export function laneOffset(u: number, portrait: boolean) {
  const a = portrait ? LANE.bunchPortrait : LANE.bunch;
  const s = Math.sign(u);
  const { g, gy } = laneSide(Math.abs(u), a);
  const sx = LANE.x * (portrait ? LANE.portraitX : 1), sy = LANE.y * (portrait ? LANE.portraitY : 1);
  return { x: s * sx * g, y: s * sy * gy, t: clamp(s * g, -1, 1) };
}

/**
 * VP-111: quanto mais longe da câmera (em cartões) fica um cartão a u lugares do foco: os dois lados
 * recuam igual. O V tem o bico arredondado, para o cartão chegar e sair do foco sem tranco; 1 no
 * primeiro de cada lado, como antes.
 */
export function laneDepth(u: number) {
  const c = LANE.bend, v = Math.abs(u);
  return (Math.sqrt(v * v + c * c) - c) / (Math.sqrt(1 + c * c) - c);
}

/**
 * VP-111: a volta da fila para os dois lados. Com os anteriores à mostra, a fila sem fim divide os
 * cartões ao meio: metade à frente, metade atrás. r e L em metros; com menos de três, não dá a volta.
 */
export function wrapSym(r: number, L: number, n: number) {
  if (n < 3) return r;
  let v = ((r % L) + L) % L;
  if (v >= L / 2) v -= L;
  return v;
}

/**
 * VP-111: quanto aparece (0…1) um cartão a u lugares do foco: uns dois próximos (o terceiro some) e um
 * anterior. Com poucos cartões, eles somem antes do ponto em que a fila dá a volta (metade da fila), para
 * nenhum trocar de lado à vista.
 */
export function laneVisibility(u: number, n: number) {
  const half = n < 3 ? Infinity : n / 2 - 0.05;
  const ahead = Math.min(LANE.ahead + LANE.fade, half), behind = Math.min(LANE.behind + LANE.fade, half);
  return u >= 0 ? 1 - smoothstep(ahead - LANE.fade, ahead, u) : 1 - smoothstep(behind - LANE.fade, behind, -u);
}

/** O texto "03 / 14" do contador. */
export const counterText = (i: number, n: number) => `${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
