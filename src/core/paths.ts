/* ════════════════════════════════════════════════════════════════════
   O /pt DOS ENDEREÇOS (VP-101, 19/out/2026), numa conta só.
   De onde veio: as páginas em português para a busca (/pt, /pt/index,
   /pt/project/<id>). Para onde vai: o core/router.ts (os links e o
   endereço que segue a língua) e o vite.config.ts (as páginas geradas e o
   sitemap). Sem nada de navegador aqui, para os dois usarem e para os
   testes (paths.test.ts).
════════════════════════════════════════════════════════════════════ */
import type { Lang } from "../content/parse.ts";

/** o endereço sem o /pt da frente ("/pt/index" → "/index"; "/pt" → "/") */
export const stripLang = (path: string) => path.replace(/^\/pt(?=\/|$)/, "") || "/";

/** o endereço numa língua ("/project/x" → "/pt/project/x" em português; "/" → "/pt") */
export function withLang(path: string, lang: Lang) {
  const p = stripLang(path);
  if (lang !== "pt") return p;
  return p === "/" ? "/pt" : `/pt${p}`;
}
