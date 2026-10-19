import { defineConfig, type Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import { parseAll, type Lang, type Project } from "./src/content/parse.ts";
import { SITE, PROFILE } from "./src/data/site.ts";
import { preloaderHtml } from "./src/ui/preloader.ts";
import { withLang } from "./src/core/paths.ts";

/* ════════════════════════════════════════════════════════════════════
   O build (V2, 16/out/2026; as páginas em português em 19/out/2026).
   · O three/webgpu usa "top-level await" e recursos novos: o alvo é o dos
     navegadores com WebGPU ou WebGL2 de hoje.
   · O plugin "paginas" (VP-60, VP-61, VP-62, VP-101):
     – põe no index.html o endereço do site, os dados "Person" (para a
       busca) e, no <noscript>, a lista dos projetos com links;
     – no fim do build, escreve uma página para cada projeto
       (dist/project/<id>/index.html), e para o Índice e o Perfil, com o
       título, a descrição e a prévia de compartilhamento de cada um. A
       página é o mesmo site: o JavaScript lê o endereço e abre a ficha;
     – e a mesma coisa em português, em /pt (dist/pt/…), com lang="pt-BR",
       os textos .pt de cada projeto e os links hreflang entre as duas
       línguas (VP-101). O sitemap.xml lista as duas.
   · O plugin "telas" (VP-94): no npm run dev e no preview, /ref/<n>.png
     sai da pasta ref/ da raiz, que fica fora do git e do site publicado
     (as telas de referência mostram trabalho de outros estúdios).
   · npm run analise (vite build --mode analise) também grava
     dist/stats.html, o mapa do que pesa no pacote (VP-43). Desde 19/out
     funciona também no Windows (antes era ANALISE=1, só no Mac).
   · SITE_URL=https://… muda o endereço público (o padrão está em
     src/data/site.ts).
════════════════════════════════════════════════════════════════════ */
const SITE_URL = (process.env.SITE_URL || SITE.url).replace(/\/$/, "");

function readProjects(): Project[] {
  const dir = "content/projects";
  const files: Record<string, string> = {};
  for (const f of fs.readdirSync(dir)) if (f.endsWith(".md")) files[f] = fs.readFileSync(path.join(dir, f), "utf8");
  return parseAll(files);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** um texto das duas línguas (o português cai no inglês se faltar) */
const L = (v: { en: string; pt: string } | undefined, lang: Lang) => (v ? v[lang] || v.en : "");
/** corta na última palavra inteira antes de n letras, com reticências */
const clip = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "").replace(/[,;:.\s]+$/, "") + "…");
/** o endereço na língua ("/project/x" → "/pt/project/x"; "/" → "/pt"): a mesma conta do router (src/core/paths.ts) */
const at = withLang;

/** os textos das páginas geradas que não vêm dos projetos */
const PAGE = {
  en: {
    noscript: "Vitor Petri: this site needs JavaScript to show the gallery. Contact:",
    skip: "Skip to the index of projects",
    siteDesc: "Vitor Petri: music, design, photography and writing. Websites, design, experiments and compositions, from Campinas, Brazil.",
    ogDesc: "Music, design, photography and writing. Websites, design, experiments and compositions, from Campinas, Brazil.",
    index: "Index", profile: "Profile",
    indexDesc: (n: number) => `All ${n} projects: websites, design, experiments and music.`,
  },
  pt: {
    noscript: "Vitor Petri: este site precisa de JavaScript para mostrar a galeria. Contato:",
    skip: "Pular para o índice dos projetos",
    siteDesc: "Vitor Petri: música, design, fotografia e escrita. Sites, design, experimentos e composições, de Campinas.",
    ogDesc: "Música, design, fotografia e escrita. Sites, design, experimentos e composições, de Campinas.",
    index: "Índice", profile: "Perfil",
    indexDesc: (n: number) => `Todos os ${n} projetos: sites, design, experimentos e música.`,
  },
};

const noscriptList = (projects: Project[], lang: Lang) =>
  `<ul>${projects.map((p) => `<li><a href="${at(`/project/${p.id}`, lang)}">${esc(L(p.name, lang))}</a>, ${esc(L(p.type, lang))}${p.year ? `, ${p.year}` : ""}</li>`).join("")}</ul>`;

function paginas(): Plugin {
  let outDir = "dist";
  return {
    name: "paginas",
    configResolved(c) { outDir = c.build.outDir; },
    transformIndexHtml(html) {
      const projects = readProjects();
      const person = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Vitor P. Demantova",
        alternateName: "Vitor Petri",
        url: SITE_URL,
        email: `mailto:${SITE.email}`,
        jobTitle: ["Musician", "Designer", "Photographer", "Writer"],
        knowsAbout: ["Music composition", "Lutherie", "Piano tuning", "Graphic design", "Web development", "Photography"],
        description: PROFILE.body.map((b) => b.en).join(" "),
        homeLocation: { "@type": "Place", name: "Campinas, Brazil" },
        sameAs: [...SITE.socials.map((s) => s.href), "https://www.vitordemantova.com"],
      };
      return html
        .replace(/__SITE_URL__/g, SITE_URL)
        .replace("__PERSON_JSONLD__", JSON.stringify(person).replace(/</g, "\\u003c"))
        .replace("<!--NOSCRIPT_INDEX-->", `<!--ns-->${noscriptList(projects, "en")}<!--/ns-->`)
        .replace("<!--PRELOADER-->", preloaderHtml());
    },
    closeBundle() {
      const base = path.join(outDir, "index.html");
      if (!fs.existsSync(base)) return;
      const html = fs.readFileSync(base, "utf8");
      const projects = readProjects();
      const page = (route: string, lang: Lang, title: string, desc: string, image: string) => {
        const url = `${SITE_URL}${at(route, lang)}`;
        const alt = (l: Lang) => `${SITE_URL}${at(route, l)}`;
        const T = PAGE[lang];
        let out = html
          .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`)
          .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
          .replace(/(<link rel="alternate" hreflang="en" href=")[^"]*/, `$1${alt("en")}`)
          .replace(/(<link rel="alternate" hreflang="pt-BR" href=")[^"]*/, `$1${alt("pt")}`)
          .replace(/(<link rel="alternate" hreflang="x-default" href=")[^"]*/, `$1${alt("en")}`)
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`)
          .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
          .replace(/(<meta property="og:image" content=")[^"]*/, `$1${SITE_URL}${image}`);
        out = out.replace('<meta property="og:type" content="website" />', `<meta property="og:type" content="${route.startsWith("/project/") ? "article" : "website"}" />`);
        if (lang === "pt") {
          out = out
            .replace(/<html lang="en">/, '<html lang="pt-BR">')
            .replace('<meta property="og:locale" content="en_US" />', '<meta property="og:locale" content="pt_BR" />')
            .replace('<meta property="og:locale:alternate" content="pt_BR" />', '<meta property="og:locale:alternate" content="en_US" />')
            .replace(/(<a class="skip" href=")[^"]*("[^>]*>)[^<]*/, `$1/pt/index$2${T.skip}`)
            .replace(PAGE.en.noscript, T.noscript)
            .replace("<span class=\"sr-only\">Loading the gallery</span>", "<span class=\"sr-only\">Carregando a galeria</span>")
            .replace(/<!--ns-->[\s\S]*?<!--\/ns-->/, `<!--ns-->${noscriptList(projects, "pt")}<!--/ns-->`);
        }
        const dir = path.join(outDir, at(route, lang));
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, "index.html"), out);
      };
      for (const lang of ["en", "pt"] as const) {
        const T = PAGE[lang];
        if (lang === "pt") page("/", lang, "Vitor Petri", T.siteDesc, "/og/site.jpg");
        for (const p of projects) {
          const body = p.description[lang].length ? p.description[lang] : p.description.en;
          const desc = body.join(" ") || [L(p.type, lang), L(p.instrumentation, lang), p.year].filter(Boolean).join(" · ");
          const img = fs.existsSync(path.join("public/og", `${p.id}.jpg`)) ? `/og/${p.id}.jpg` : "/og/site.jpg";
          const name = L(p.name, lang);
          const title = name === "Vitor Petri" ? `Vitor Petri — ${L(p.type, lang)}` : `${name} — Vitor Petri`;
          page(`/project/${p.id}`, lang, title, clip(desc, 300), img);
        }
        page("/index", lang, `${T.index} — Vitor Petri`, T.indexDesc(projects.length), "/og/site.jpg");
        page("/profile", lang, `${T.profile} — Vitor Petri`, L(PROFILE.body[0], lang), "/og/site.jpg");
      }
      /* o mapa do site, para a busca: cada endereço nas duas línguas, um apontando para o outro */
      const routes = ["/", "/index", "/profile", ...projects.map((p) => `/project/${p.id}`)];
      const entry = (r: string, lang: Lang) =>
        `  <url><loc>${SITE_URL}${at(r, lang)}</loc>` +
        `<xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${at(r, "en")}"/>` +
        `<xhtml:link rel="alternate" hreflang="pt-BR" href="${SITE_URL}${at(r, "pt")}"/></url>`;
      const urls = routes.flatMap((r) => [entry(r, "en"), entry(r, "pt")]);
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`);
      fs.writeFileSync(path.join(outDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
    },
  };
}

/** VP-94: /ref/<arquivo> no dev e no preview, lido de ref/ (fora do git e do site) */
function telas(): Plugin {
  const serve = (req: { url?: string }, res: { setHeader: (k: string, v: string) => void; end: (b: Buffer) => void }, next: () => void) => {
    const m = req.url?.match(/^\/ref\/([\w.-]+\.(png|jpe?g|webp))$/);
    const file = m && path.join("ref", m[1]);
    if (!file || !fs.existsSync(file)) return next();
    res.setHeader("Content-Type", m[2] === "png" ? "image/png" : m[2] === "webp" ? "image/webp" : "image/jpeg");
    res.end(fs.readFileSync(file));
  };
  return {
    name: "telas",
    configureServer(s) { s.middlewares.use(serve); },
    configurePreviewServer(s) { s.middlewares.use(serve); },
  };
}

export default defineConfig(async ({ mode }) => {
  const plugins: Plugin[] = [paginas(), telas()];
  if (mode === "analise" || process.env.ANALISE) {
    const { visualizer } = await import("rollup-plugin-visualizer");
    plugins.push(visualizer({ filename: "dist/stats.html", gzipSize: true, brotliSize: true, template: "treemap" }) as Plugin);
  }
  return {
    plugins,
    build: { target: "es2022", chunkSizeWarningLimit: 1600 },
    server: { port: 5190 },
    preview: { port: 5191 },
  };
});
