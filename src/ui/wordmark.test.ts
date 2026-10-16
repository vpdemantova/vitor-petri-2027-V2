/* VP-71: o logotipo medido (ui/wordmark.ts). */
import { describe, expect, it } from "vitest";
import { wordmarkGlyphs, wordmarkPath } from "./wordmark";

describe("o logotipo VITOR PETRI", () => {
  it("tem as dez letras e a largura de sempre", () => {
    const { glyphs, width } = wordmarkGlyphs();
    expect(glyphs.length).toBe(10);
    expect(width).toBe(4958);
  });
  it("o espaço entre as palavras é maior que entre as letras", () => {
    const { glyphs } = wordmarkGlyphs();
    const gapLetters = glyphs[1].x - glyphs[0].x;   // V → I
    const gapWords = glyphs[5].x - glyphs[4].x;     // R → P
    expect(gapWords).toBeGreaterThan(gapLetters);
  });
  it("o caminho tem um <path> por letra", () => {
    expect(wordmarkPath().d.match(/<path /g)?.length).toBe(10);
  });
});
