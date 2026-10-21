/* ════════════════════════════════════════════════════════════════════
   A IMAGEM QUE SAI DO CARTÃO 3D (VP-119, 21/out/2026).
   De onde veio: o pedido dele em 21/out ("as animações estão bem ruins
   ainda! ponha mais atenção nelas todas"). Ao abrir uma ficha, a imagem do
   cartão voava a partir do retângulo que contém o cartão na tela; como o
   cartão está em perspectiva (inclinado), o voo começava com um salto. A
   técnica: a homografia (Heckbert, "Fundamentals of Texture Mapping and
   Image Warping", 1989), que leva o retângulo da imagem a qualquer
   quadrilátero da tela; em CSS, um matrix3d. Assim a imagem nasce
   exatamente em cima do cartão 3D, com a mesma perspectiva, e vai se
   endireitando até o lugar dela na ficha (e o caminho de volta).
   Para onde vai: ui/panels.ts (o voo da ficha). Conta pura, com testes
   (quad.test.ts).
════════════════════════════════════════════════════════════════════ */

/** Um ponto na tela, em pixels. */
export type Pt = { x: number; y: number };
/** Os quatro cantos, nesta ordem: em cima à esquerda, em cima à direita, embaixo à direita, embaixo à esquerda. */
export type Quad = [Pt, Pt, Pt, Pt];

/** Os cantos de um retângulo. */
export const rectQuad = (r: { x: number; y: number; w: number; h: number }): Quad => [
  { x: r.x, y: r.y }, { x: r.x + r.w, y: r.y }, { x: r.x + r.w, y: r.y + r.h }, { x: r.x, y: r.y + r.h },
];

/** O caminho entre dois quadriláteros (cada canto em linha reta). */
export const lerpQuad = (a: Quad, b: Quad, t: number): Quad =>
  a.map((p, i) => ({ x: p.x + (b[i].x - p.x) * t, y: p.y + (b[i].y - p.y) * t })) as Quad;

/** O retângulo que contém um quadrilátero. */
export function quadBox(q: Quad) {
  const xs = q.map((p) => p.x), ys = q.map((p) => p.y);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/**
 * A homografia do quadrado unitário para o quadrilátero (Heckbert): devolve [a, b, c, d, e, f, g, h], com
 * X = (a·u + b·v + c) / (g·u + h·v + 1) e Y = (d·u + e·v + f) / (g·u + h·v + 1), para (u, v) em 0…1.
 */
export function squareToQuad(q: Quad): number[] {
  const [p0, p1, p2, p3] = q;
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) {
    return [p1.x - p0.x, p3.x - p0.x, p0.x, p1.y - p0.y, p3.y - p0.y, p0.y, 0, 0];
  }
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const h = (dx1 * dy3 - dx3 * dy1) / det;
  return [p1.x - p0.x + g * p1.x, p3.x - p0.x + h * p3.x, p0.x, p1.y - p0.y + g * p1.y, p3.y - p0.y + h * p3.y, p0.y, g, h];
}

/** Aplica a homografia a um ponto (u, v) do quadrado unitário. */
export function mapPoint(m: number[], u: number, v: number): Pt {
  const [a, b, c, d, e, f, g, h] = m;
  const z = g * u + h * v + 1;
  return { x: (a * u + b * v + c) / z, y: (d * u + e * v + f) / z };
}

/**
 * O CSS que leva um elemento de w × h (com left: 0, top: 0 e transform-origin: 0 0, em position: fixed)
 * ao quadrilátero q da tela.
 */
export function quadTransform(w: number, h: number, q: Quad): string {
  const [a, b, c, d, e, f, g, hh] = squareToQuad(q);
  const n = (v: number) => (Math.abs(v) < 1e-12 ? 0 : +v.toPrecision(10));
  return `matrix3d(${n(a / w)}, ${n(d / w)}, 0, ${n(g / w)}, ${n(b / h)}, ${n(e / h)}, 0, ${n(hh / h)}, 0, 0, 1, 0, ${n(c)}, ${n(f)}, 0, 1)`;
}
