import { defineConfig, type Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import { parseAll, type Project } from "./src/content/parse.ts";
import { SITE, PROFILE } from "./src/data/site.ts";
import { preloaderHtml } from "./src/ui/preloader.ts";

/* ════════════════════════════════════════════════════════════════════
   O build (V2, 16/out/2026).
   · O three/webgpu usa "top-level await" e recursos novos: o alvo é o dos
     navegadores com WebGPU ou WebGL2 de hoje.
   · O plugin "paginas" (VP-60, VP-61, VP-62):
     – põe no index.html o endereço do site, os dados "Person" (para a
       busca) e, no <noscript>, a lista dos projetos com links;
     – no fim do build, escreve uma página para cada projeto
       (dist/project/<id>/index.html), e para o Índice e o Perfil, com o
       título, a descrição e a prévia de compartilhamento de cada um. A
       página é o mesmo site: o JavaScript lê o endereço e abre a ficha.
   · ANALISE=1 npm run build também grava dist/stats.html, o mapa do que
     pesa no pacote (VP-43).
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
      const list = `<ul>${projects.map((p) => `<li><a href="/project/${p.id}">${esc(p.name.en)}</a>, ${esc(p.type.en)}${p.year ? `, ${p.year}` : ""}</li>`).join("")}</ul>`;
      return html
        .replace(/__SITE_URL__/g, SITE_URL)
        .replace("__PERSON_JSONLD__", JSON.stringify(person).replace(/</g, "\\u003c"))
        .replace("<!--NOSCRIPT_INDEX-->", list)
        .replace("<!--PRELOADER-->", preloaderHtml());
    },
    closeBundle() {
      const base = path.join(outDir, "index.html");
      if (!fs.existsSync(base)) return;
      const html = fs.readFileSync(base, "utf8");
      const page = (route: string, title: string, desc: string, image: string) => {
        const url = `${SITE_URL}${route}`;
        let out = html
          .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`)
          .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`)
          .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
          .replace(/(<meta property="og:image" content=")[^"]*/, `$1${SITE_URL}${image}`);
        out = out.replace('<meta property="og:type" content="website" />', `<meta property="og:type" content="${route.startsWith("/project/") ? "article" : "website"}" />`);
        const dir = path.join(outDir, route);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, "index.html"), out);
      };
      const projects = readProjects();
      for (const p of projects) {
        const desc = p.description.en.join(" ") || [p.type.en, p.instrumentation?.en, p.year].filter(Boolean).join(" · ");
        const img = fs.existsSync(path.join("public/og", `${p.id}.jpg`)) ? `/og/${p.id}.jpg` : "/og/site.jpg";
        const title = p.name.en === "Vitor Petri" ? `Vitor Petri — ${p.type.en}` : `${p.name.en} — Vitor Petri`;
        page(`/project/${p.id}`, title, desc.slice(0, 300), img);
      }
      page("/index", "Index — Vitor Petri", `All ${projects.length} projects: websites, design, experiments and music.`, "/og/site.jpg");
      page("/profile", "Profile — Vitor Petri", PROFILE.body[0].en, "/og/site.jpg");
      /* o mapa do site, para a busca */
      const urls = ["/", "/index", "/profile", ...projects.map((p) => `/project/${p.id}`)];
      fs.writeFileSync(path.join(outDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
      fs.writeFileSync(path.join(outDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
    },
  };
}

export default defineConfig(async () => {
  const plugins: Plugin[] = [paginas()];
  if (process.env.ANALISE) {
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
