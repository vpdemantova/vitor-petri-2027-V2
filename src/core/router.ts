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
════════════════════════════════════════════════════════════════════ */
export type PanelKind = "index" | "profile" | "project";
export interface Route { kind: PanelKind | null; id?: string }

const subs = new Set<(r: Route) => void>();

export function parseRoute(path = location.pathname): Route {
  const m = path.replace(/\/+$/, "").match(/^\/(index|profile|project)(?:\/([\w-]+))?$/);
  if (!m) return { kind: null };
  if (m[1] === "project") return m[2] ? { kind: "project", id: m[2] } : { kind: null };
  return { kind: m[1] as PanelKind };
}

export const pathOf = (r: Route) => (r.kind === null ? "/" : r.kind === "project" ? `/project/${r.id}` : `/${r.kind}`);

export function current(): Route { return parseRoute(); }

/** Vai para um endereço (o voltar do navegador volta). */
export function go(path: string, replace = false) {
  const url = path + location.search;
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
  if (old) history.replaceState(null, "", "/" + old[1] + location.search);
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
