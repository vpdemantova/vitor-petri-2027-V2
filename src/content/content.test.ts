/* VP-71 e a regra "nada inventado": o leitor do Markdown e os arquivos de
   content/projects conferidos um a um. */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { frontMatter, sections, parseProject, parseAll, CATEGORIES } from "./parse";
import sizes from "../data/image-sizes.json";

const DIR = path.resolve(__dirname, "../../content/projects");
const files: Record<string, string> = {};
for (const f of fs.readdirSync(DIR)) if (f.endsWith(".md")) files[f] = fs.readFileSync(path.join(DIR, f), "utf8");
const projects = parseAll(files);
const SIZES = sizes as Record<string, unknown>;

describe("o leitor", () => {
  it("lê o cabeçalho, com aspas e comentário no fim", () => {
    const { data, body } = frontMatter('---\nname: "A: B"\nyear: 2025  # sabido\n---\nTexto.');
    expect(data.name).toBe("A: B");
    expect(data.year).toBe("2025");
    expect(body.trim()).toBe("Texto.");
  });
  it("separa o inglês, o português e o processo", () => {
    const s = sections("Um.\n\nDois\nlinhas.\n\n<!-- pt -->\nUm pt.\n<!-- process -->\nP.");
    expect(s.en).toEqual(["Um.", "Dois linhas."]);
    expect(s.pt).toEqual(["Um pt."]);
    expect(s.process).toEqual(["P."]);
  });
  it("tira o id e a ordem do nome do arquivo; o português cai no inglês", () => {
    const p = parseProject("070-a-b.md", "---\nname: X\ncategory: design\ntype: Poster\n---\nEn.");
    expect(p.id).toBe("a-b");
    expect(p.type.pt).toBe("Poster");
    expect(p.description.pt).toEqual(["En."]);
  });
  it("recusa uma categoria que não existe", () => {
    expect(() => parseProject("1-x.md", "---\nname: X\ncategory: pintura\n---\n")).toThrow();
  });
});

describe("os projetos de verdade", () => {
  it("têm ids únicos, na ordem dos números", () => {
    expect(projects.length).toBe(Object.keys(files).length);
    expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length);
    expect(projects[0].id).toBe("vitordemantova");
  });
  it.each(projects.map((p) => [p.id, p]))("%s: categoria, imagens, ano e fonte", (_, p) => {
    expect(CATEGORIES).toContain(p.category);
    expect(p.name.en.length).toBeGreaterThan(0);
    /* a fonte de cada dado fica anotada no arquivo (não aparece no site) */
    expect(p.source, "falta a linha source:").toBeTruthy();
    /* o ano, se houver, é um ano */
    if (p.year) expect(p.year).toMatch(/^(19|20)\d\d$/);
    if (p.category === "music") {
      /* a capa é desenhada; só a que tem gravação tem duração */
      if (p.audio) { expect(fs.existsSync(path.resolve(__dirname, "../../public" + p.audio))).toBe(true); expect(p.duration).toBeTruthy(); }
    } else {
      expect(SIZES[p.card], `falta public/img/${p.card}.webp (npm run images)`).toBeTruthy();
      for (const s of p.shots) expect(SIZES[s], `falta ${s}`).toBeTruthy();
      expect(p.description.en.length).toBeGreaterThan(0);
      expect(p.description.pt.length).toBeGreaterThan(0);
    }
    if (p.url) expect(p.url).toMatch(/^https:\/\//);
    /* VP-95: o vídeo do cartão existe e é leve (um laço de 8 s, até ~1,2 MB) */
    if (p.video) {
      const f = path.resolve(__dirname, `../../public/video/${p.video}.mp4`);
      expect(fs.existsSync(f), `falta public/video/${p.video}.mp4`).toBe(true);
      expect(fs.statSync(f).size).toBeLessThan(1.25 * 1024 * 1024);
    }
  });
});
