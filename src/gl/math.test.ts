/* VP-71: as contas puras da galeria (gl/math.ts). */
import { describe, expect, it } from "vitest";
import { wrap, indexOf, shortestTarget, springStep, fitScale, visibility, counterText, smoothstep } from "./math";
import { hourTint } from "./hour";

const D = 1.3;

describe("a volta da fila", () => {
  it("põe os que passaram do lado de cá e o resto atrás", () => {
    const n = 14, L = n * D;
    expect(wrap(0, L, D, n)).toBe(0);
    expect(wrap(-D, L, D, n)).toBeCloseTo(-D);
    expect(wrap(-2 * D, L, D, n)).toBeCloseTo(L - 2 * D);
    expect(wrap(L + D, L, D, n)).toBeCloseTo(D);
  });
  it("não dá a volta com menos de três cartões", () => {
    expect(wrap(-2 * D, 2 * D, D, 2)).toBe(-2 * D);
  });
});

describe("o índice e o caminho mais curto", () => {
  it("dá o índice de qualquer posição, inclusive negativa", () => {
    expect(indexOf(0, 14)).toBe(0);
    expect(indexOf(15.2, 14)).toBe(1);
    expect(indexOf(-1, 14)).toBe(13);
  });
  it("vai pelo lado mais perto", () => {
    expect(shortestTarget(0, 13, 14)).toBe(-1);
    expect(shortestTarget(0, 3, 14)).toBe(3);
    expect(shortestTarget(28, 1, 14)).toBe(29);
  });
  it("com poucos cartões, não passa das pontas", () => {
    expect(shortestTarget(0, 5, 2)).toBe(1);
  });
});

describe("a mola", () => {
  it("chega ao alvo sem passar dele", () => {
    let s = { pos: 0, vel: 0 }, max = 0;
    for (let i = 0; i < 600; i++) { s = springStep(s.pos, s.vel, 1, 1 / 120); max = Math.max(max, s.pos); }
    expect(s.pos).toBeCloseTo(1, 3);
    expect(max).toBeLessThanOrEqual(1.0005);
  });
});

describe("o enquadramento", () => {
  it("no computador, o cartão ocupa ~57% da largura; em pé, a fila se afasta", () => {
    const wide = fitScale(1440 / 900, 35, 2, 3.35);
    const tall = fitScale(390 / 844, 35, 2, 3.35);
    expect(wide.portrait).toBe(false);
    expect(tall.portrait).toBe(true);
    expect(tall.k).toBeGreaterThan(wide.k);
    expect(wide.k).toBeGreaterThanOrEqual(1);
  });
});

describe("quem aparece", () => {
  it("o da vez inteiro; uns três para trás; nada atrás da câmera", () => {
    const n = 21, L = n * D;
    expect(visibility(0, L, D, n)).toBe(1);
    expect(visibility(2 * D, L, D, n)).toBe(1);
    expect(visibility(5 * D, L, D, n)).toBe(0);
    expect(visibility(-D, L, D, n)).toBe(0);
  });
  it("com três cartões, o de trás aparece", () => {
    expect(visibility(D, 3 * D, D, 3)).toBeGreaterThan(0.8);
  });
});

describe("pequenas", () => {
  it("o contador com dois algarismos", () => { expect(counterText(2, 21)).toBe("03 / 21"); });
  it("o smoothstep nas pontas", () => { expect(smoothstep(0, 1, -1)).toBe(0); expect(smoothstep(0, 1, 2)).toBe(1); });
});

describe("a cor da hora (VP-17)", () => {
  const at = (h: number) => { const d = new Date(Date.UTC(2026, 9, 16, (h + 3) % 24, 0)); return hourTint(d); };
  it("de dia é a cor das telas", () => { expect(at(12).amount).toBe(0); });
  it("à noite e no fim da tarde, a cor muda", () => { expect(at(23).amount).toBeGreaterThan(0.4); expect(at(18).amount).toBeGreaterThan(0.2); });
});
