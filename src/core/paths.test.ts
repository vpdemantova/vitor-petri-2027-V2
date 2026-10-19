/* VP-101 (19/out/2026): o /pt dos endereços, conferido (core/paths.ts). */
import { describe, expect, it } from "vitest";
import { stripLang, withLang } from "./paths";

describe("o /pt dos endereços", () => {
  it("tira o /pt só quando ele é a primeira parte", () => {
    expect(stripLang("/pt")).toBe("/");
    expect(stripLang("/pt/")).toBe("/");
    expect(stripLang("/pt/project/malha")).toBe("/project/malha");
    expect(stripLang("/project/pt-br")).toBe("/project/pt-br");
    expect(stripLang("/ptolomeu")).toBe("/ptolomeu");
    expect(stripLang("/")).toBe("/");
  });
  it("põe o /pt em português e nada em inglês", () => {
    expect(withLang("/", "pt")).toBe("/pt");
    expect(withLang("/index", "pt")).toBe("/pt/index");
    expect(withLang("/project/malha", "en")).toBe("/project/malha");
    expect(withLang("/pt/project/malha", "en")).toBe("/project/malha");
  });
  it("não dobra o /pt", () => {
    expect(withLang("/pt/profile", "pt")).toBe("/pt/profile");
    expect(withLang(withLang("/index", "pt"), "pt")).toBe("/pt/index");
  });
});
