/* ════════════════════════════════════════════════════════════════════
   OS PROJETOS (desde a V2, 16/out/2026, cada um é um arquivo em
   content/projects/: ver o leitor em content/parse.ts e "Pôr um projeto"
   no README). Só trabalhos que existem; ano, função e tecnologias só onde
   são sabidos (o que falta fica vazio e a interface esconde o campo).
   A ordem do número no nome do arquivo é a ordem da galeria e do índice.
════════════════════════════════════════════════════════════════════ */
import sizes from "../data/image-sizes.json";
import { parseAll, CATEGORIES, type Category, type Project } from "./parse";

export type { Category, Project };
export { CATEGORIES };

const files = import.meta.glob("/content/projects/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export const PROJECTS: Project[] = parseAll(files);

type Size = { width: number; height: number; color?: string };
const SIZES = sizes as Record<string, Size>;

/** Largura ÷ altura de uma imagem (pelo arquivo gerado); a capa de música é A4 em pé. */
export function aspectOf(p: Project | string): number {
  if (typeof p !== "string" && p.category === "music" && !p.card) return 1 / Math.SQRT2;
  const s = SIZES[typeof p === "string" ? p : p.card];
  return s ? s.width / s.height : 16 / 10;
}

/** A cor do cartão (VP-93), para o brilho do fundo. */
export function colorOf(p: Project): string {
  if (p.category === "music" && !p.card) return "#c9b98f";
  return SIZES[p.card]?.color ?? "#878ee9";
}

export const hasImage = (name: string) => !!SIZES[name];
/** largura e altura de uma imagem gerada (para o <img> reservar o lugar antes de ela chegar) */
export const sizeOf = (name: string): { width?: string; height?: string } => (SIZES[name] ? { width: String(SIZES[name].width), height: String(SIZES[name].height) } : {});
export const imageUrl = (name: string) => `${import.meta.env.BASE_URL}img/${name}.webp`;
