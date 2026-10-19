/* ════════════════════════════════════════════════════════════════════
   O ENDEREÇO (VP-61, 16/out/2026). Cada estado tem um endereço de
   verdade, não mais com #:
     /                     a galeria
     /index                o Índice
     /profile              o Perfil
     /project/<id>         a ficha de um projeto
   O build gera uma página para cada projeto (dist/project/<id>/index.html,
   com o título e a prévia dele: ver vite.config.ts), e a Vercel serve
   essas páginas antes de cair no index.html (vercel.json).
   Os endereços antigos (#/project/x) continuam valendo: viram o novo.

   EM PORTUGUÊS (VP-101, 19/out/2026): os mesmos endereços com /pt na
   frente (/pt, /pt/index, /pt/project/<id>), cada um com a sua página
   gerada no build, em português, para a busca e o compartilhamento. O
   endereço segue a língua: trocar o idioma troca o /pt sem somar uma
   entrada no histórico. Quem chama go() passa o endereço sem o /pt; o
   prefixo é posto aqui (localize), com a conta de core/paths.ts, a mesma
   que o build usa.
════════════════════════════════════════════════════════════════════ */
import { getLang, onLang } from "./i18n";
import { stripLang, withLang } from "./paths";

export type PanelKind = "index" | "profile" | "project";
export interface Route { kind: PanelKind | null; id?: string }

const subs = new Set<(r: Route) => void>();

/** o endereço na língua de agora ("/project/x" vira "/pt/project/x" em português) */
export const localize = (path: string) => withLang(path, getLang());

export function parseRoute(path = location.pathname): Route {
  const m = stripLang(path).replace(/\/+$/, "").match(/^\/(index|profile|project)(?:\/([\w-]+))?$/);
  if (!m) return { kind: null };
  if (m[1] === "project") return m[2] ? { kind: "project", id: m[2] } : { kind: null };
  return { kind: m[1] as PanelKind };
}

export const pathOf = (r: Route) => (r.kind === null ? "/" : r.kind === "project" ? `/project/${r.id}` : `/${r.kind}`);

export function current(): Route { return parseRoute(); }

/** Vai para um endereço (o voltar do navegador volta). */
export function go(path: string, replace = false) {
  const url = localize(path) + location.search;
  if (url === location.pathname + location.search) { emit(); return; }
  if (replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
  emit();
}

function emit() {
  const r = parseRoute();
  for (const fn of subs) fn(r);
}

export function onRoute(fn: (r: Route) => void) { subs.add(fn); }

export function startRouter() {
  /* o endereço antigo, com #: vira o novo sem somar uma entrada no histórico */
  const old = location.hash.match(/^#\/(.*)$/);
  if (old) history.replaceState(null, "", localize("/" + old[1]) + location.search);
  /* o /pt segue a língua (agora e a cada troca), sem somar entrada no histórico */
  onLang(() => {
    const want = localize(location.pathname);
    if (want !== location.pathname) history.replaceState(history.state, "", want + location.search + location.hash);
  });
  window.addEventListener("popstate", emit);
  /* os links internos (data-link) andam sem recarregar a página */
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-link]");
    if (!a || a.target === "_blank") return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return;
    e.preventDefault();
    go(u.pathname);
  });
}
