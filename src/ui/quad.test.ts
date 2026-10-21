/* VP-119 (21/out/2026): a homografia do voo da ficha, conferida (ui/quad.ts). */
import { describe, expect, it } from "vitest";
import { squareToQuad, mapPoint, quadTransform, rectQuad, lerpQuad, quadBox, type Quad } from "./quad";

const near = (a: { x: number; y: number }, b: { x: number; y: number }) => { expect(a.x).toBeCloseTo(b.x, 6); expect(a.y).toBeCloseTo(b.y, 6); };

describe("a homografia", () => {
  const persp: Quad = [{ x: 310, y: 190 }, { x: 1130, y: 205 }, { x: 1120, y: 712 }, { x: 300, y: 700 }];
  it("leva os quatro cantos do quadrado exatamente aos do quadrilátero (em perspectiva)", () => {
    const m = squareToQuad(persp);
    near(mapPoint(m, 0, 0), persp[0]); near(mapPoint(m, 1, 0), persp[1]);
    near(mapPoint(m, 1, 1), persp[2]); near(mapPoint(m, 0, 1), persp[3]);
  });
  it("num retângulo, é só escala e translação", () => {
    const m = squareToQuad(rectQuad({ x: 10, y: 20, w: 300, h: 200 }));
    expect(m[6]).toBe(0); expect(m[7]).toBe(0);
    near(mapPoint(m, 0.5, 0.5), { x: 160, y: 120 });
  });
  it("o matrix3d leva o elemento w × h ao quadrilátero (a conta que o navegador faz)", () => {
    const w = 640, h = 400, css = quadTransform(w, h, persp);
    const v = css.slice(9, -1).split(",").map(Number);
    /* a matriz é por colunas: aplica (x, y, 0, 1) e divide por w */
    const apply = (x: number, y: number) => {
      const X = v[0] * x + v[4] * y + v[12], Y = v[1] * x + v[5] * y + v[13], W = v[3] * x + v[7] * y + v[15];
      return { x: X / W, y: Y / W };
    };
    near(apply(0, 0), persp[0]); near(apply(w, 0), persp[1]); near(apply(w, h), persp[2]); near(apply(0, h), persp[3]);
  });
  it("o caminho entre dois quadriláteros e a caixa que os contém", () => {
    const a = rectQuad({ x: 0, y: 0, w: 100, h: 100 }), b = rectQuad({ x: 100, y: 50, w: 200, h: 100 });
    near(lerpQuad(a, b, 0.5)[2], { x: 200, y: 125 });
    expect(quadBox(persp)).toEqual({ x: 300, y: 190, w: 830, h: 522 });
  });
});
