/* VP-71: as contas puras da galeria (gl/math.ts). */
import { describe, expect, it } from "vitest";
import { wrap, indexOf, shortestTarget, springStep, fitScale, visibility, counterText, smoothstep, laneOffset, laneDepth, wrapSym, laneVisibility } from "./math";
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

describe("a fila numa direção só, com o anterior atrás (VP-109, VP-111)", () => {
  it("o da vez fica no meio", () => {
    const o = laneOffset(0, false);
    expect(o.x).toBe(0); expect(o.y).toBe(0); expect(o.t).toBe(0);
  });
  it("o primeiro próximo fica onde já ficava (o primeiro canto das telas)", () => {
    const o = laneOffset(1, false);
    expect(o.x).toBeCloseTo(0.86 / 4.65); expect(o.y).toBeCloseTo(0.5 / 4.65); expect(o.t).toBeCloseTo(1);
  });
  it("os próximos, todos em cima à direita, cada um mais para o canto e mais junto", () => {
    const xs = [1, 2, 3].map((u) => laneOffset(u, false).x);
    expect(xs.every((x) => x > 0)).toBe(true);
    expect(xs[1]).toBeGreaterThan(xs[0]); expect(xs[2]).toBeGreaterThan(xs[1]);
    expect(xs[2] - xs[1]).toBeLessThan(xs[1] - xs[0]);
    expect([1, 2, 3].every((u) => laneOffset(u, false).y > 0)).toBe(true);
  });
  it("os anteriores, embaixo à esquerda: o espelho dos próximos (o anterior aparece, como o cartão de baixo de antes)", () => {
    for (const u of [0.3, 1, 2]) {
      const a = laneOffset(u, false), b = laneOffset(-u, false);
      expect(b.x).toBeCloseTo(-a.x); expect(b.y).toBeCloseTo(-a.y); expect(b.t).toBeCloseTo(-a.t);
    }
  });
  it("a linha passa pelo foco sem quebra (chega e sai na mesma velocidade)", () => {
    const e = 1e-4;
    const before = (laneOffset(0, false).x - laneOffset(-e, false).x) / e, after = (laneOffset(e, false).x - laneOffset(0, false).x) / e;
    expect(Math.abs(before - after) / after).toBeLessThan(0.01);
  });
  it("depois do primeiro, os de lado quase não sobem (nem descem) mais, sem quebra", () => {
    const y = (u: number) => laneOffset(u, false).y;
    expect(y(2)).toBeGreaterThan(y(1)); expect(y(3)).toBeGreaterThan(y(2));
    expect(y(2) / y(1)).toBeLessThan(1.25); expect(y(3) / y(1)).toBeLessThan(1.35);
    const e = 1e-4, before = (y(1) - y(1 - e)) / e, after = (y(1 + e) - y(1)) / e;
    expect(Math.abs(before - after) / before).toBeLessThan(0.02);
    expect(y(-2)).toBeCloseTo(-y(2));
  });
  it("em pé, mais para cima que para o lado", () => {
    const o = laneOffset(1, true);
    expect(o.y / o.x).toBeGreaterThan(laneOffset(1, false).y / laneOffset(1, false).x);
  });
  it("a profundidade: os dois lados recuam igual, 1 no primeiro de cada lado, e o foco sem tranco", () => {
    expect(laneDepth(0)).toBe(0);
    expect(laneDepth(1)).toBeCloseTo(1); expect(laneDepth(-1)).toBeCloseTo(1);
    expect(laneDepth(2)).toBeGreaterThan(laneDepth(1));
    expect(laneDepth(-2.5)).toBeCloseTo(laneDepth(2.5));
    expect((laneDepth(1e-3) - laneDepth(0)) / 1e-3).toBeLessThan(0.01);
  });
  it("a volta dos dois lados: metade da fila à frente, metade atrás", () => {
    const n = 22, L = n * D;
    expect(wrapSym(0, L, n)).toBe(0);
    expect(wrapSym(-D, L, n)).toBeCloseTo(-D);
    expect(wrapSym(L - D, L, n)).toBeCloseTo(-D);
    expect(wrapSym(10 * D, L, n)).toBeCloseTo(10 * D);
    expect(wrapSym(12 * D, L, n)).toBeCloseTo(-10 * D);
    expect(wrapSym(-3 * D, 2 * D, 2)).toBe(-3 * D);
  });
  it("quem aparece: dois próximos inteiros e um anterior inteiro; o terceiro próximo e o segundo anterior quase somem", () => {
    expect(laneVisibility(0, 22)).toBe(1);
    expect(laneVisibility(1, 22)).toBe(1); expect(laneVisibility(2, 22)).toBe(1);
    expect(laneVisibility(-1, 22)).toBe(1);
    expect(laneVisibility(3, 22)).toBeLessThan(0.2);
    expect(laneVisibility(-2, 22)).toBeLessThan(0.1);
  });
  it("com poucos cartões, ninguém troca de lado à vista (some antes da volta)", () => {
    for (const n of [4, 5, 6]) {
      expect(laneVisibility(n / 2, n)).toBe(0);
      expect(laneVisibility(-n / 2, n)).toBe(0);
    }
  });
});

describe("a cor da hora (VP-17)", () => {
  const at = (h: number) => { const d = new Date(Date.UTC(2026, 9, 16, (h + 3) % 24, 0)); return hourTint(d); };
  it("de dia é a cor das telas", () => { expect(at(12).amount).toBe(0); });
  it("à noite e no fim da tarde, a cor muda", () => { expect(at(23).amount).toBeGreaterThan(0.4); expect(at(18).amount).toBeGreaterThan(0.2); });
});
