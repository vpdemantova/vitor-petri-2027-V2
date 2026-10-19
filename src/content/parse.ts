/* ════════════════════════════════════════════════════════════════════
   O LEITOR DOS PROJETOS EM MARKDOWN (VP-73, 16/out/2026).

   Cada projeto é um arquivo em content/projects/, e o número no começo do
   nome dá a ordem da galeria e do índice ("03-dimensional-heritage.md").
   O arquivo tem duas partes:

     ---
     name: Herança Dimensional
     category: design            (websites · design · experiments · music)
     type: Geometric drawing
     type.pt: Desenho geométrico (".pt" é a versão em português; sem ela, vale a de cima)
     role: Design
     year: 2025                  (só se for sabido: sem ano, o campo some)
     url: https://…              (sem endereço, "não publicado")
     card: dimensional-heritage  (a imagem do cartão, em public/img/, sem o .webp)
     shots: a-full, b-full       (as imagens da ficha, separadas por vírgula)
     video: malha                (opcional, VP-95: public/video/malha.mp4, o laço do cartão da vez)
     ---
     O texto em inglês (parágrafos separados por uma linha em branco).

     <!-- pt -->
     O texto em português.

     <!-- process -->          (opcional, VP-92: o estudo de caso, em inglês)
     <!-- process.pt -->       (e em português)

   Este arquivo não depende do navegador: o vite.config.ts usa o mesmo
   leitor para gerar as páginas de cada projeto no build (VP-61).
════════════════════════════════════════════════════════════════════ */

export type Lang = "en" | "pt";
export type Category = "websites" | "design" | "experiments" | "music";
export const CATEGORIES: Category[] = ["websites", "design", "experiments", "music"];

/** Um texto nas duas línguas (o português cai no inglês se faltar). */
export type Text2 = { en: string; pt: string };

export interface Project {
  id: string;
  name: Text2;
  category: Category;
  type: Text2;
  role?: Text2;
  stack?: string;
  year?: string;
  url?: string;
  /** a textura do cartão (public/img/<card>.webp); vazio nos de música (o cartão é desenhado) */
  card: string;
  shots: string[];
  /** VP-95: o laço de vídeo do cartão (public/video/<video>.mp4), quando houver */
  video?: string;
  description: { en: string[]; pt: string[] };
  /** o estudo de caso (VP-92): só quando ele escrever */
  process?: { en: string[]; pt: string[] };
  /** música: a gravação (em public/) e a formação */
  audio?: string;
  duration?: string;
  instrumentation?: Text2;
  /** de onde saiu o dado (fica no arquivo, não aparece no site) */
  source?: string;
}

/** As chaves "a: b" do cabeçalho (sem listas nem aninhamento: não precisa). */
export function frontMatter(src: string): { data: Record<string, string>; body: string } {
  const m = src.replace(/^\uFEFF/, "").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src };
  const data: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const i = line.indexOf(":");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    /* aspas opcionais; um comentário no fim ("  # …") sai */
    v = v.replace(/\s+#\s.*$/, "");
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    data[k] = v;
  }
  return { data, body: m[2] };
}

/** Separa o corpo pelas marcas <!-- pt -->, <!-- process -->… */
export function sections(body: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  let key = "en";
  let buf: string[] = [];
  const flush = () => {
    const paras = buf.join("\n").split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
    if (paras.length) out[key] = (out[key] ?? []).concat(paras);
    buf = [];
  };
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^\s*<!--\s*([\w.]+)\s*-->\s*$/);
    if (m) { flush(); key = m[1]; continue; }
    buf.push(line);
  }
  flush();
  return out;
}

const two = (d: Record<string, string>, k: string): Text2 | undefined => {
  const en = d[k];
  if (!en) return undefined;
  return { en, pt: d[`${k}.pt`] || en };
};

/** Um arquivo .md → um projeto. `file` é o nome do arquivo (dá o id e a ordem). */
export function parseProject(file: string, src: string): Project {
  const base = file.split("/").pop()!.replace(/\.md$/, "");
  const id = base.replace(/^\d+[-_ ]*/, "");
  const { data: d, body } = frontMatter(src);
  const s = sections(body);
  const category = (d.category || "websites") as Category;
  if (!CATEGORIES.includes(category)) throw new Error(`${file}: categoria desconhecida "${d.category}"`);
  if (!d.name) throw new Error(`${file}: falta o name`);
  const list = (v?: string) => (v ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);
  const desc = { en: s.en ?? [], pt: s.pt ?? s.en ?? [] };
  return {
    id: d.id || id,
    name: two(d, "name")!,
    category,
    type: two(d, "type") ?? { en: "", pt: "" },
    role: two(d, "role"),
    stack: d.stack || undefined,
    year: d.year || undefined,
    url: d.url || undefined,
    card: d.card ?? "",
    shots: list(d.shots),
    video: d.video || undefined,
    description: desc,
    process: s.process ? { en: s.process, pt: s["process.pt"] ?? s.process } : undefined,
    audio: d.audio || undefined,
    duration: d.duration || undefined,
    instrumentation: two(d, "instrumentation"),
    source: d.source || undefined,
  };
}

/** Todos, na ordem do número do nome do arquivo. */
export function parseAll(files: Record<string, string>): Project[] {
  return Object.keys(files)
    .sort((a, b) => a.split("/").pop()!.localeCompare(b.split("/").pop()!, "en", { numeric: true }))
    .map((f) => parseProject(f, files[f]));
}
