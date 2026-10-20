/* VP-108 (19/out/2026): a roda e o arrasto que decidem, conferidos (core/gesture.ts). */
import { describe, expect, it } from "vitest";
import { createWheelStepper, releaseTarget, dragAxis, WHEEL } from "./gesture";

/** dá vários deltas e soma os passos */
const run = (events: [delta: number, t: number][]) => {
  const feed = createWheelStepper();
  return events.reduce((s, [d, t]) => s + feed(d, t), 0);
};

describe("a roda", () => {
  it("um dente de mouse já passa um cartão", () => {
    expect(run([[100, 0]])).toBe(1);
    expect(run([[-100, 0]])).toBe(-1);
  });
  it("dentes com pausa: um cartão por dente (antes, três dentes devagar não saíam do lugar)", () => {
    expect(run([[100, 0], [100, 300], [100, 600]])).toBe(3);
  });
  it("dentes rápidos, no mesmo gesto: um cartão a cada ~260 px", () => {
    expect(run([[100, 0], [100, 40], [100, 80]])).toBe(2);
    expect(run(Array.from({ length: 10 }, (_, i) => [100, i * 30] as [number, number]))).toBe(4);
  });
  it("um trackpad: muitos deltas pequenos, sem voltar", () => {
    const ev = Array.from({ length: 40 }, (_, i) => [8, i * 16] as [number, number]);
    expect(run(ev)).toBe(2);
  });
  it("o tremor ao contrário no fim do embalo não puxa para trás", () => {
    expect(run([[60, 0], [30, 16], [-3, 32], [-2, 48], [-4, 64]])).toBe(1);
  });
  it("uma virada de verdade no meio do gesto vai para o outro lado", () => {
    expect(run([[100, 0], [-40, 50], [-40, 80]])).toBe(0); // +1 e depois −1
  });
  it("nada de roda, nada de passo", () => {
    expect(run([[0, 0]])).toBe(0);
    expect(WHEEL.first).toBeLessThan(100);
  });
});

describe("o arrasto, ao soltar", () => {
  it("andou pouco: volta para onde estava", () => {
    expect(releaseTarget(3, 3.05)).toBe(3);
    expect(releaseTarget(3, 2.95)).toBe(3);
  });
  it("andou um pouco mais: vai até o próximo inteiro nessa direção, sem voltar", () => {
    expect(releaseTarget(3, 3.2)).toBe(4);
    expect(releaseTarget(3, 2.8)).toBe(2);
  });
  it("andou muito ou jogou: vai mais longe", () => {
    expect(releaseTarget(3, 5.4)).toBe(5);
    expect(releaseTarget(3, 3.4, 1.2)).toBe(5);
  });
  it("o eixo é o que andou mais no começo", () => {
    expect(dragAxis(10, 3)).toBe("x");
    expect(dragAxis(-2, 9)).toBe("y");
  });
});
