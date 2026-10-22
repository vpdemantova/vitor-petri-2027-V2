/* ════════════════════════════════════════════════════════════════════
   OS PAINÉIS: o Índice, o Perfil e a ficha do Projeto (as telas "Index",
   "Profile" e "Project" das referências). Refeitos para a V2 (16/out/2026).

   · Índice: branco, à esquerda, sobe do pé da tela; os filtros (Todos,
     Sites, Design, Experimentos, Música), que desde a V2 valem também para
     a fila 3D (VP-20), a busca por nome, tipo ou tecnologia (VP-26) e a
     tabela nome · tipo · VISIT ↗ · ano. Passar o mouse (ou o foco) numa
     linha leva a galeria até aquele projeto, atrás do painel.
   · Perfil: o texto grande em serifa à esquerda, a composição de peças
     (com o retrato, quando houver: VP-02) e as duas linhas embaixo.
   · Projeto: o vidro claro com o nome, FUNÇÃO / TIPO / TECNOLOGIAS / ANO,
     VISIT WEBSITE e a descrição; as imagens rolando à direita. Desde a V2:
     anterior e próximo (os botões e as setas ← →, VP-21); o tocador da
     gravação nos de música; o processo (VP-92), quando ele escrever; e a
     ficha nasce do retângulo do cartão na tela e volta para ele (VP-22).
   Desde 21/out/2026 (VP-112, "as animações estão dando overlap e não estão
   sendo animadas in e out da melhor forma"):
   · um painel no lugar de outro: o que sai sai depressa, e o novo entra
     logo depois, por cima (antes, os dois animavam juntos, um sobre o outro);
   · do cartão para a ficha e de volta: a própria imagem do cartão voa entre
     a galeria e a ficha, e o cartão só reacende quando ela chega (antes,
     crescia e encolhia uma caixa branca vazia);
   · de uma ficha para outra: o conteúdo sai para um lado e o novo entra
     pelo outro, no sentido da fila;
   · o Índice só leva a galeria até a linha sob o mouse depois de o mouse
     andar (subindo por baixo de um mouse parado, ele fazia a galeria correr).
   Desde 21/out/2026, à noite (VP-118 e VP-119):
   · "o anterior e próximo devem ficar fixos embaixo do card de projeto":
     a barra anterior / próximo é uma faixa fixa no pé da ficha, que não se
     move nem some quando o conteúdo muda (antes, ficava no fim do texto e
     mudava de lugar a cada projeto, ou nem aparecia nos de texto longo);
   · o voo da imagem nasce exatamente em cima do cartão 3D, com a mesma
     perspectiva (os cantos dele na tela e uma homografia: ui/quad.ts), e
     volta para ele seguindo o cartão vivo; antes, nascia do retângulo em
     volta do cartão e começava com um salto.
   · VP-121: o Perfil abre de dentro para fora e fecha de fora para dentro
     por um número só (o recorte é escrito aqui a cada quadro: o navegador
     abrevia o clip-path e a interpolação de texto do GSAP pulava, e o
     fechamento não encolhia); reaberto no meio do fechamento, o Índice e o
     Perfil continuam de onde estão, sem voltar ao começo.
   Desde 22/out/2026 (VP-127, "a animação dos cards… meio fracos"): na ficha,
   o título sobe letra a letra e os parágrafos linha a linha, cada um de
   trás da sua máscara (o SplitText do GSAP, livre desde a 3.13); o
   resto (função, tipo, o link) entra em cascata, e as outras imagens sobem
   uma depois da outra. Ao passar de projeto, as linhas saem por cima e as
   novas entram por baixo. No Perfil, o texto grande sobe linha a linha.
   Os três são diálogos de verdade (role="dialog", o Tab fica dentro, Esc
   fecha, o foco volta para onde estava). As animações são do GSAP.
════════════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { PROJECTS, CATEGORIES, aspectOf, hasImage, imageUrl, sizeOf, type Category, type Project } from "../content/projects";
import { PROFILE, PROFILE_ART } from "../data/site";
import { t, tx, tp, onLang } from "../core/i18n";
import { localize, type PanelKind } from "../core/router";
import { player } from "../core/sound";
import { drawCover, loadCoverFonts } from "./musiccard";
import { h, ARROW, CROSS, PLAY, PAUSE, trapFocus, prefersReducedMotion } from "./dom";
import { quadTransform, lerpQuad, rectQuad, quadBox, type Quad } from "./quad";

export type Rect = { x: number; y: number; w: number; h: number };
type Filter = Category | "all";

interface Opts {
  onClose: () => void;
  onFocusProject: (index: number) => void;
  onOpenProject: (id: string) => void;
  onFilter: (f: Filter) => void;
  /** a ordem da fila de agora (para o anterior e o próximo) */
  order: () => number[];
  /** o retângulo do cartão na tela (para a ficha nascer dele) */
  cardRect: (index: number) => Rect | null;
  /** VP-119: os quatro cantos do cartão na tela (o voo nasce dele, com a mesma perspectiva) */
  cardQuad: (index: number) => Quad | null;
  /** a ficha aberta (o cartão dela some da galeria); instant: o cartão volta na hora (no fim do voo de volta) */
  onProjectShown: (index: number | null, instant?: boolean) => void;
}

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "–:––");

export function createPanels(root: HTMLElement, opts: Opts) {
  const closeBtn = (key: "closeIndex" | "closeProfile" | "closeProject") => {
    const b = h("button", { class: "close", type: "button", html: CROSS });
    b.addEventListener("click", opts.onClose);
    onLang(() => { b.setAttribute("aria-label", t(key)); b.title = `${t(key)} (Esc)`; });
    return b;
  };

  /* ── o Índice ── */
  let filter: Filter = "all";
  /* VP-112: a linha sob o mouse só leva a galeria depois de o mouse andar (ver o fim do arquivo) */
  let hoverArmed = false;
  let query = "";
  const filters = h("fieldset", { class: "filters" });
  const legend = h("legend", { class: "sr-only" });
  filters.append(legend);
  const filterInputs = (["all", ...CATEGORIES] as Filter[]).map((c, i) => {
    const input = h("input", { type: "radio", name: "filter", value: c, checked: i === 0 });
    const text = h("span", {});
    filters.append(h("label", {}, input, text));
    return { c, input, text };
  });
  const search = h("input", { type: "search", class: "index-search-input", autocomplete: "off", spellcheck: "false" });
  const searchWrap = h("label", { class: "index-search" }, h("span", { class: "sr-only" }), search);
  const head = h("div", { class: "index-head" }, filters, searchWrap);
  const list = h("ul", { class: "index-list" });
  const empty = h("p", { class: "index-empty", hidden: true });

  const rows = PROJECTS.map((p, i) => {
    const name = h("button", { class: "index-name", type: "button" });
    name.addEventListener("click", () => opts.onOpenProject(p.id));
    const type = h("span", { class: "index-type" });
    const visitSlot = h("span", { class: "index-visit-slot" });
    const year = h("span", { class: "index-year" }, p.year ?? "");
    const row = h("li", { class: "index-row", "data-cat": p.category }, name, type, visitSlot, year);
    const focusIt = () => { rowEls.forEach((r) => r.classList.toggle("is-on", r === row)); opts.onFocusProject(i); };
    row.addEventListener("pointerenter", () => { if (hoverArmed) focusIt(); });
    name.addEventListener("focus", focusIt);
    list.append(row);
    return { p, row, name, type, visitSlot };
  });
  const rowEls = rows.map((r) => r.row);

  const fillRows = () => {
    for (const { p, name, type, visitSlot } of rows) {
      name.textContent = tx(p.name);
      name.title = tx(p.name);
      type.textContent = tx(p.type);
      let visit: HTMLElement;
      if (p.url) visit = h("a", { class: "index-visit", href: p.url, target: "_blank", rel: "noopener noreferrer", html: `${t("visit")} ${ARROW}`, "aria-label": `${t("visit")} ${tx(p.name)} (${t("opensNewTab")})` });
      else if (p.audio) {
        visit = h("button", { class: "index-visit is-listen", type: "button", html: `${PLAY} ${t("listen")}`, "aria-label": `${t("listen")}: ${tx(p.name)}` });
        visit.addEventListener("click", () => opts.onOpenProject(p.id));
      } else if (p.category === "music") visit = h("span", { class: "index-visit is-off" }, "");
      else visit = h("span", { class: "index-visit is-off" }, t("private"));
      visitSlot.replaceChildren(visit);
    }
  };

  const haystack = (p: Project) => [p.name.en, p.name.pt, p.type.en, p.type.pt, p.stack ?? "", p.year ?? "", p.instrumentation?.en ?? "", p.instrumentation?.pt ?? ""].join(" ").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  const hay = rows.map((r) => haystack(r.p));
  const applyRows = (animate: boolean) => {
    const q = query.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
    let shown = 0;
    rows.forEach(({ p, row }, i) => {
      const ok = (filter === "all" || p.category === filter) && (!q || q.split(/\s+/).every((w) => hay[i].includes(w)));
      row.hidden = !ok;
      if (ok) shown++;
    });
    empty.hidden = shown > 0;
    if (animate && !prefersReducedMotion()) gsap.fromTo(rowEls.filter((r) => !r.hidden), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.03, ease: "power3.out" });
  };
  filters.addEventListener("change", () => {
    filter = (filters.querySelector("input:checked") as HTMLInputElement).value as Filter;
    applyRows(true);
    opts.onFilter(filter);
  });
  search.addEventListener("input", () => { query = search.value; applyRows(false); });
  /* Enter na busca abre o primeiro que sobrou */
  search.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const first = rows.find((r) => !r.row.hidden);
    if (first) opts.onOpenProject(first.p.id);
  });

  const indexTitle = h("h2", { id: "index-title", class: "sr-only" });
  const indexPanel = h("section", { class: "panel index-panel", role: "dialog", "aria-modal": "true", "aria-labelledby": "index-title", tabindex: "-1" },
    indexTitle, head, closeBtn("closeIndex"), list, empty);
  onLang(() => {
    indexTitle.textContent = t("indexTitle");
    legend.textContent = t("filterProjects");
    for (const f of filterInputs) f.text.textContent = t(f.c);
    search.placeholder = t("search");
    search.setAttribute("aria-label", t("searchLabel"));
    (searchWrap.firstChild as HTMLElement).textContent = t("searchLabel");
    empty.textContent = t("noResults");
    fillRows();
  });

  /* ── o Perfil ── */
  const profileTitle = h("h2", { id: "profile-title", class: "sr-only" });
  const profileText = h("div", { class: "profile-text" });
  /* VP-02: com um retrato (media/perfil/retrato.jpg → npm run images), ele vai ao meio da composição */
  const art = hasImage("retrato")
    ? [PROFILE_ART[0], { img: "retrato", alt: { en: "Vitor P. Demantova", pt: "Vitor P. Demantova" }, caption: "Vitor P. Demantova" }, PROFILE_ART[2]]
    : PROFILE_ART;
  const figures = art.map((a) => {
    const img = h("img", { src: imageUrl(a.img), loading: "lazy", decoding: "async", ...sizeOf(a.img) });
    return { a, img, fig: h("figure", {}, img, h("figcaption", {}, a.caption)) };
  });
  const profileArt = h("div", { class: `profile-art${hasImage("retrato") ? " has-portrait" : ""}`, role: "group" }, ...figures.map((f) => f.fig));
  const aside = h("p", { class: "profile-aside" });
  const profilePanel = h("section", { class: "panel profile-panel", role: "dialog", "aria-modal": "true", "aria-labelledby": "profile-title", tabindex: "-1" },
    profileTitle, closeBtn("closeProfile"), profileText, profileArt, aside);
  onLang(() => {
    profileTitle.textContent = t("profile");
    profileText.replaceChildren(...PROFILE.body.map((b) => h("p", {}, tx(b))));
    aside.replaceChildren(tx(PROFILE.aside[0]), h("br"), tx(PROFILE.aside[1]));
    profileArt.setAttribute("aria-label", t("profileArt"));
    for (const f of figures) f.img.alt = tx(f.a.alt);
  });

  /* ── o Projeto (preenchido a cada abertura) ── */
  const projectPanel = h("section", { class: "panel project-panel", role: "dialog", "aria-modal": "true", "aria-labelledby": "project-title", tabindex: "-1" });
  const projectClose = closeBtn("closeProject");
  let shownProject: Project | null = null;
  let unPlayer: (() => void) | null = null;

  /* VP-118: a barra anterior / próximo, fixa no pé da ficha: criada uma vez; a cada projeto, só os nomes trocam */
  const stepEl = (dir: "prev" | "next") => {
    const k = h("span", { class: "project-step-k" });
    const nm = h("span", { class: "project-step-name" });
    const a = h("a", { class: `project-step is-${dir}`, "data-link": "" }, k, nm);
    return { a, k, nm };
  };
  const prevStep = stepEl("prev"), nextStep = stepEl("next");
  const projectNav = h("nav", { class: "project-nav" }, prevStep.a, nextStep.a);
  const fillNav = (prev: Project, next: Project) => {
    for (const [st, q, dir] of [[prevStep, prev, "prev"], [nextStep, next, "next"]] as const) {
      st.a.setAttribute("href", localize(`/project/${q.id}`));
      st.k.innerHTML = dir === "prev" ? `<span aria-hidden="true">←</span> ${t("previous")}` : `${t("next")} <span aria-hidden="true">→</span>`;
      st.nm.textContent = tx(q.name);
    }
    projectNav.setAttribute("aria-label", `${t("previous")} / ${t("next")}`);
  };

  const neighbors = (p: Project) => {
    const order = opts.order();
    const i = PROJECTS.indexOf(p);
    let s = order.indexOf(i);
    /* fora da fila filtrada (veio do Índice com outro filtro): anda na lista inteira */
    const list = s < 0 ? PROJECTS.map((_, j) => j) : order;
    if (s < 0) s = i;
    const n = list.length;
    return { prev: PROJECTS[list[(s - 1 + n) % n]], next: PROJECTS[list[(s + 1) % n]] };
  };

  const playerEl = (p: Project) => {
    const btn = h("button", { class: "player-btn", type: "button" });
    const bar = h("input", { class: "player-bar", type: "range", min: "0", max: "1000", value: "0", step: "1" });
    const time = h("span", { class: "player-time" });
    const wrap = h("div", { class: "project-player" }, btn, h("div", { class: "player-track" }, bar, time));
    const sync = () => {
      const playing = player.playing(p.audio!);
      btn.innerHTML = `${playing ? PAUSE : PLAY}<span>${playing ? t("pause") : t("listen")}</span>`;
      btn.setAttribute("aria-pressed", String(playing));
      const a = player.audio;
      const mine = a.src.endsWith(p.audio!);
      const cur = mine ? a.currentTime : 0, dur = mine && a.duration ? a.duration : NaN;
      if (document.activeElement !== bar) bar.value = String(Number.isFinite(dur) ? Math.round((cur / dur) * 1000) : 0);
      time.textContent = `${fmt(cur)} / ${Number.isFinite(dur) ? fmt(dur) : (p.duration ?? "–:––")}`;
      bar.setAttribute("aria-label", `${t("recording")}: ${tx(p.name)}`);
      bar.setAttribute("aria-valuetext", time.textContent);
    };
    btn.addEventListener("click", () => player.toggle(p.audio!));
    bar.addEventListener("input", () => { if (player.audio.src.endsWith(p.audio!)) player.seek(Number(bar.value) / 1000); });
    unPlayer?.();
    unPlayer = player.onChange(sync);
    sync();
    return wrap;
  };

  const fillProject = (p: Project) => {
    shownProject = p;
    const meta = h("dl", {});
    const add = (k: Parameters<typeof t>[0], v?: string) => { if (v) meta.append(h("div", {}, h("dt", {}, t(k)), h("dd", {}, v))); };
    add("role", tx(p.role)); add("type", tx(p.type)); add("instrumentation", tx(p.instrumentation)); add("stack", p.stack); add("duration", p.duration); add("year", p.year);
    const visit = p.url
      ? h("a", { class: "project-visit", href: p.url, target: "_blank", rel: "noopener noreferrer", html: `${t("visitWebsite")} ${ARROW}`, "aria-label": `${t("visitWebsite")} (${t("opensNewTab")})` })
      : p.category === "music" ? null : h("span", { class: "project-visit is-off" }, t("notPublished"));
    let shots: HTMLElement;
    if (p.category === "music" && !p.card) {
      const img = h("img", { class: "is-art is-cover", alt: `${tx(p.name)}: ${tx(p.type)}`, width: "1024", height: "1448" });
      loadCoverFonts().then(() => { img.src = drawCover(document.createElement("canvas"), p).toDataURL("image/webp", 0.9); });
      shots = h("div", { class: "project-shots", tabindex: "0", role: "group", "aria-label": tx(p.name) }, img);
    } else {
      shots = h("div", { class: "project-shots", tabindex: "0", role: "group", "aria-label": tx(p.name) },
        ...p.shots.map((s, i) => h("img", {
          src: imageUrl(s), alt: i === 0 ? `${tx(p.name)}: ${tx(p.type)}` : "", loading: i === 0 ? "eager" : "lazy", decoding: "async", ...sizeOf(s),
          class: p.category === "design" ? "is-art" : undefined,
        })));
    }
    const { prev, next } = neighbors(p);
    /* o nome falado é o que se lê ("Anterior Laboratório"): as setas ficam escondidas do leitor */
    fillNav(prev, next);
    const desc = tp(p.description);
    const proc = tp(p.process);
    projectPanel.replaceChildren(
      projectClose,
      h("div", { class: "project-info" },
        h("h2", { id: "project-title", class: "project-title" }, tx(p.name)),
        h("div", { class: "project-meta" }, meta, visit),
        p.audio ? playerEl(p) : null,
        desc.length ? h("div", { class: "project-desc" }, ...desc.map((d) => h("p", {}, d))) : null,
        proc.length ? h("div", { class: "project-process" }, h("h3", {}, t("process")), ...proc.map((d) => h("p", {}, d))) : null),
      shots,
      projectNav);
  };
  onLang(() => { if (shownProject && current === "project") fillProject(shownProject); });

  root.append(indexPanel, profilePanel, projectPanel);
  /* VP-112: a camada do "elemento compartilhado": a imagem do cartão voa entre a galeria e a ficha */
  const flyLayer = h("div", { class: "fly-layer", "aria-hidden": "true" });
  root.append(flyLayer);
  const panels: Record<PanelKind, HTMLElement> = { index: indexPanel, profile: profilePanel, project: projectPanel };
  let current: PanelKind | null = null;
  let release: (() => void) | null = null;
  /* VP-112: quantos painéis ainda estão saindo (a etiqueta da galeria espera eles sumirem) */
  /* (por painel: um painel reaberto no meio da saída deixa de contar) */
  const closing = new Set<PanelKind>();

  /** VP-22: o recorte que faz a ficha nascer do retângulo do cartão */
  const clipFrom = (el: HTMLElement, r: Rect) => {
    const b = el.getBoundingClientRect();
    const top = Math.max(0, r.y - b.top), left = Math.max(0, r.x - b.left);
    const right = Math.max(0, b.right - (r.x + r.w)), bottom = Math.max(0, b.bottom - (r.y + r.h));
    return `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round 4px)`;
  };
  const clipFull = (el: HTMLElement) => `inset(0px 0px 0px 0px round ${getComputedStyle(el).borderTopLeftRadius})`;

  /** VP-112: a imagem do cartão, solta na tela (a capa desenhada, nas obras de música) */
  const flyClone = (p: Project) => {
    const el: HTMLElement = p.category === "music" && !p.card
      ? drawCover(document.createElement("canvas"), p)
      : h("img", { src: imageUrl(p.card), alt: "", decoding: "sync" });
    el.className = `fly${p.category === "websites" || p.category === "experiments" ? " is-site" : ""}`;
    flyLayer.append(el);
    return el;
  };
  /** o lugar da primeira imagem da ficha, na proporção do cartão (das páginas inteiras, que são altas, só o alto) */
  const shotRect = (p: Project): Rect | null => {
    const col = projectPanel.querySelector<HTMLElement>(".project-shots");
    const img = col?.querySelector<HTMLElement>("img");
    if (!col || !img) return null;
    const c = col.getBoundingClientRect(), b = img.getBoundingClientRect();
    const w = b.width || c.width;
    if (!w) return null;
    /* rolada para fora da vista, a imagem: vale o alto da coluna */
    const y = b.top >= c.top - 1 && b.top < innerHeight ? b.top : c.top;
    return { x: b.width ? b.left : c.left, y, w, h: w / aspectOf(p) };
  };
  /** VP-119: o voo: a imagem (de w × h) vai do quadrilátero a ao b, cada canto no seu caminho, por um matrix3d a cada
      quadro; a e b podem ser funções (o cartão vivo, que ainda se move); o caminho é dobrado (expo.inOut) */
  const fly = (el: HTMLElement, a: Quad | (() => Quad | null), b: Quad | (() => Quad | null), w: number, h: number, duration: number, onComplete: () => void) => {
    Object.assign(el.style, { left: "0px", top: "0px", width: `${w}px`, height: `${h}px`, transformOrigin: "0 0" });
    let qa = typeof a === "function" ? a() : a, qb = typeof b === "function" ? b() : b;
    const st = { t: 0 };
    const paint = () => {
      if (typeof a === "function") qa = a() ?? qa;
      if (typeof b === "function") qb = b() ?? qb;
      if (qa && qb) el.style.transform = quadTransform(w, h, lerpQuad(qa, qb, st.t));
    };
    paint();
    gsap.to(st, { t: 1, duration, ease: "expo.inOut", onUpdate: paint, onComplete });
  };
  const clearFlights = () => { gsap.killTweensOf(flyLayer.children); flyLayer.replaceChildren(); };

  /** VP-112: de que lado está o projeto novo, em relação ao da ficha (na fila de agora): 1 = o próximo */
  const stepDir = (a: Project, b: Project) => {
    const order = opts.order();
    let ia = order.indexOf(PROJECTS.indexOf(a)), ib = order.indexOf(PROJECTS.indexOf(b));
    let n = order.length;
    if (ia < 0 || ib < 0) { ia = PROJECTS.indexOf(a); ib = PROJECTS.indexOf(b); n = PROJECTS.length; }
    const d = (ib - ia + n) % n;
    return d <= n / 2 ? 1 : -1;
  };

  /* VP-121: o recorte do Perfil, por um número (1 = aberto inteiro; 0 = um ponto no meio, com o canto bem redondo) */
  const prof = { k: 0 };
  const paintProfile = () => {
    const i = 1 - prof.k;
    profilePanel.style.clipPath = `inset(${(48 * i).toFixed(3)}% ${(48 * i).toFixed(3)}% ${(48 * i).toFixed(3)}% ${(48 * i).toFixed(3)}% round ${(40 * i).toFixed(2)}px)`;
  };

  /* VP-127: o texto em máscaras. Os cortes são refeitos a cada abertura (a largura e a língua podem ter mudado) e
     desfeitos ao fechar; só em elementos que a interface troca inteiros (os parágrafos, o título), para que desfazer um
     corte velho nunca devolva um texto antigo */
  gsap.registerPlugin(SplitText);
  const splitsBy: Record<"project" | "profile", SplitText[]> = { project: [], profile: [] };
  const unsplit = (k: "project" | "profile") => { for (const sp of splitsBy[k]) sp.revert(); splitsBy[k] = []; };
  const linesOf = (k: "project" | "profile", root: Element, sel: string) => {
    const out: Element[] = [];
    for (const el of root.querySelectorAll(sel)) {
      const sp = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });
      splitsBy[k].push(sp);
      out.push(...sp.lines);
    }
    return out;
  };
  const charsOf = (k: "project" | "profile", root: Element, sel: string) => {
    const out: Element[] = [];
    for (const el of root.querySelectorAll(sel)) {
      const sp = SplitText.create(el, { type: "lines,chars", mask: "lines", linesClass: "split-line" });
      splitsBy[k].push(sp);
      out.push(...sp.chars);
    }
    return out;
  };
  /** as letras e as linhas da ficha (para sair por cima) */
  const splitTargets = () => splitsBy.project.flatMap((sp) => (sp.chars.length ? sp.chars : sp.lines));
  /** a ficha entra: o título letra a letra, os parágrafos linha a linha, o resto em cascata, as outras imagens subindo */
  const revealProject = (delay: number, skipFirstShot: boolean) => {
    unsplit("project");
    const title = charsOf("project", projectPanel, ".project-title");
    const lines = linesOf("project", projectPanel, ".project-desc p, .project-process p");
    if (title.length) gsap.fromTo(title, { yPercent: 108 }, { yPercent: 0, duration: 0.85, stagger: 0.018, delay, ease: "expo.out" });
    const meta = projectPanel.querySelectorAll(".project-meta dl > div, .project-visit, .project-player, .project-process h3");
    if (meta.length) gsap.fromTo(meta,
      { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.045, delay: delay + 0.1, ease: "power3.out", clearProps: "transform,opacity" });
    if (lines.length) gsap.fromTo(lines, { yPercent: 108 }, { yPercent: 0, duration: 0.95, stagger: 0.04, delay: delay + 0.2, ease: "expo.out" });
    gsap.fromTo(projectNav, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: delay + 0.35, ease: "power2.out", clearProps: "opacity" });
    const shots = [...projectPanel.querySelectorAll<HTMLElement>(".project-shots img")].slice(skipFirstShot ? 1 : 0);
    /* (com uma imagem só, a lista fica vazia: nada a animar) */
    if (shots.length) gsap.fromTo(shots, { opacity: 0, y: 46 }, { opacity: 1, y: 0, duration: 1.0, stagger: 0.09, delay: delay + 0.25, ease: "expo.out", clearProps: "transform,opacity" });
  };

  const animIn = (kind: PanelKind, el: HTMLElement, fromQuad?: Quad | null, delay = 0, resume = false) => {
    const reduce = prefersReducedMotion();
    gsap.killTweensOf(el);
    if (reduce) { gsap.set(el, { clearProps: "all" }); return; }
    if (kind === "index") {
      /* VP-121: reaberto no meio da saída, sobe de onde está */
      if (resume) gsap.to(el, { yPercent: 0, duration: 0.7, ease: "expo.out" });
      else gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.9, delay, ease: "expo.out" });
      gsap.fromTo(el.querySelectorAll(".filters label, .index-search, .index-row:not([hidden])"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.025, delay: delay + 0.12, ease: "power3.out" });
    } else if (kind === "profile") {
      gsap.killTweensOf(prof);
      if (!resume) prof.k = 0;
      gsap.set(el, { opacity: 1 });
      paintProfile();
      gsap.to(prof, { k: 1, duration: resume ? 0.7 : 1.0, delay: resume ? 0 : delay, ease: "expo.inOut", onUpdate: paintProfile, onComplete: () => { el.style.clipPath = ""; } });
      /* VP-127: o texto grande sobe linha a linha; as peças e as duas linhas de baixo, em cascata */
      if (!resume) {
        unsplit("profile");
        gsap.fromTo(linesOf("profile", el, ".profile-text p"), { yPercent: 108 }, { yPercent: 0, duration: 1.0, stagger: 0.05, delay: delay + 0.4, ease: "expo.out" });
        gsap.fromTo(el.querySelectorAll(".profile-art figure, .profile-aside"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, delay: delay + 0.55, ease: "power3.out" });
      }
    } else if (fromQuad && shownProject) {
      /* VP-112: do cartão: o vidro cresce do retângulo dele e a própria imagem do cartão voa até o lugar dela na
         ficha (antes, crescia uma caixa branca vazia e a imagem só aparecia depois) */
      const p = shownProject;
      const shots = el.querySelector<HTMLElement>(".project-shots");
      const from = quadBox(fromQuad);
      gsap.fromTo(el, { clipPath: clipFrom(el, from) }, { clipPath: clipFull(el), duration: 0.9, ease: "expo.inOut", clearProps: "clipPath" });
      const to = shotRect(p);
      const first = shots?.querySelector<HTMLElement>("img") ?? null;
      if (to && shots && first) {
        /* só a primeira imagem espera o voo; as outras sobem em cascata (VP-127) */
        gsap.set(first, { opacity: 0 });
        const c = flyClone(p);
        fly(c, fromQuad, rectQuad(to), to.w, to.h, 0.9, () => { gsap.set(first, { opacity: 1 }); gsap.to(c, { opacity: 0, duration: 0.15, onComplete: () => c.remove() }); });
        revealProject(0.42, true);
      } else revealProject(0.42, false);
    } else {
      gsap.fromTo(el, { opacity: 0, scale: 0.94, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.85, delay, ease: "expo.out" });
      revealProject(delay + 0.18, false);
    }
  };
  /** a saída; fast: na troca de um painel por outro, o que sai sai mais depressa (o outro entra depois) */
  const animOut = (kind: PanelKind, el: HTMLElement, done: () => void, toQuad?: (() => Quad | null) | null, fast = false) => {
    if (prefersReducedMotion()) { done(); return; }
    gsap.killTweensOf(el);
    const q = fast ? 0.65 : 1;
    /* VP-121: a saída começa a andar na hora (power3.in ficava quase parado nos primeiros 0,2 s) */
    if (kind === "index") gsap.to(el, { yPercent: 100, duration: 0.46 * q, ease: "power2.in", onComplete: done });
    else if (kind === "profile") {
      gsap.killTweensOf(prof);
      paintProfile();
      if (fast) gsap.to(el, { opacity: 0, duration: 0.3, ease: "power2.in" });
      gsap.to(prof, { k: 0, duration: 0.5 * q, ease: "power2.in", onUpdate: paintProfile, onComplete: done });
    }
    else if (toQuad && shownProject) {
      /* VP-112: de volta ao cartão: o texto some, o vidro encolhe até o cartão, e a imagem da ficha voa de volta
         ao lugar dele; o cartão acende ali mesmo quando ela chega (antes, uma caixa vazia encolhia e o cartão
         aparecia por baixo, ao mesmo tempo) */
      const p = shownProject;
      const shots = el.querySelector<HTMLElement>(".project-shots");
      const fr = shotRect(p);
      const q0 = toQuad();
      if (splitTargets().length) gsap.to(splitTargets(), { yPercent: -108, duration: 0.24, stagger: 0.004, ease: "power2.in" });
      gsap.to(el.querySelectorAll(".project-info > *, .project-nav"), { opacity: 0, duration: 0.22, delay: 0.04 });
      if (q0) gsap.fromTo(el, { clipPath: clipFull(el) }, { clipPath: clipFrom(el, quadBox(q0)), duration: 0.7, ease: "expo.inOut" });
      if (fr && shots && q0) {
        const c = flyClone(p);
        gsap.set(shots, { opacity: 0 });
        /* o vidro se desfaz logo (antes, ficava um instante como uma caixa branca vazia encolhendo) */
        gsap.to(el, { opacity: 0, duration: 0.32, delay: 0.06, ease: "power2.out" });
        fly(c, rectQuad(fr), toQuad, fr.w, fr.h, 0.7, () => { done(); requestAnimationFrame(() => c.remove()); });
      } else gsap.to(el, { opacity: 0, duration: 0.3, delay: 0.38, onComplete: done });
    } else gsap.to(el, { opacity: 0, scale: 0.96, y: 20, duration: 0.4 * q, ease: "power2.in", onComplete: done });
  };

  const hide = (kind: PanelKind, to?: (() => Quad | null) | null, fast = false) => {
    const el = panels[kind];
    closing.add(kind);
    if (kind === "project") {
      player.release(); unPlayer?.(); unPlayer = null;
      /* com o voo de volta, o cartão acende na hora em que a imagem chega; sem ele, já (devagar) */
      if (!to) opts.onProjectShown(null);
    }
    animOut(kind, el, () => {
      closing.delete(kind);
      if (kind === "project" && to) opts.onProjectShown(null, true);
      /* o painel pode ter sido aberto de novo enquanto saía: aí ele fica */
      if (current === kind) return;
      el.classList.remove("is-open");
      if (kind === "project" || kind === "profile") unsplit(kind);
      gsap.set([el, ...el.querySelectorAll(".project-info > *, .project-shots, .project-shots img")], { clearProps: "all" });
      if (kind === "profile") prof.k = 0;
    }, to, fast);
  };

  /** VP-112: de uma ficha para outra (anterior, próximo, o Índice): o conteúdo sai para um lado e o novo entra pelo outro */
  let swapTo: Project | null = null;
  let swapDir = 1;
  const swapProject = (p: Project) => {
    const from = shownProject;
    swapDir = from ? stepDir(from, p) : 1;
    if (prefersReducedMotion()) { fillProject(p); return; }
    if (swapTo) { swapTo = p; return; }
    swapTo = p;
    const outEls = projectPanel.querySelectorAll(".project-info > *, .project-shots");
    gsap.killTweensOf(outEls);
    /* VP-118: a barra não sai: só os nomes dela trocam, num esmaecer rápido */
    gsap.to(projectNav.querySelectorAll(".project-step-name"), { opacity: 0, duration: 0.16, ease: "power2.in" });
    /* VP-127: as letras e as linhas saem por cima, as imagens para o lado da fila */
    if (splitTargets().length) gsap.to(splitTargets(), { yPercent: -108, duration: 0.17, stagger: 0.003, ease: "power2.in" });
    gsap.to(projectPanel.querySelector(".project-shots"), { opacity: 0, x: -36 * swapDir, duration: 0.2, ease: "power2.in" });
    /* curta: o vidro não chega a ficar vazio (as novas linhas já começam a subir logo em seguida) */
    gsap.to(outEls, {
      opacity: 0, duration: 0.18, delay: 0.02, ease: "power1.in",
      onComplete: () => {
        const q = swapTo!;
        swapTo = null;
        unsplit("project");
        fillProject(q);
        gsap.fromTo(projectPanel.querySelector(".project-shots"), { opacity: 0, x: 36 * swapDir }, { opacity: 1, x: 0, duration: 0.7, ease: "expo.out", clearProps: "transform,opacity" });
        revealProject(0, false);
        gsap.fromTo(projectNav.querySelectorAll(".project-step-name"), { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
        /* o foco fica no mesmo lado (quem anda pelo teclado continua andando) */
        projectPanel.querySelector<HTMLElement>(swapDir > 0 ? ".project-step.is-next" : ".project-step.is-prev")?.focus({ preventScroll: true });
      },
    });
  };

  /* o Índice: a linha sob o mouse leva a galeria até o projeto, mas só depois de o mouse andar (VP-112: enquanto o
     painel sobe por baixo de um mouse parado, as linhas passavam por ele e a galeria corria de projeto em projeto) */
  indexPanel.addEventListener("pointermove", (e) => {
    if (hoverArmed || (!e.movementX && !e.movementY)) return;
    hoverArmed = true;
    (e.target as HTMLElement).closest<HTMLElement>(".index-row")?.dispatchEvent(new PointerEvent("pointerenter"));
  });

  return {
    current: () => current,
    /** VP-112: algum painel ainda está saindo */
    busy: () => closing.size > 0,
    /** o projeto da ficha aberta */
    shown: () => (current === "project" ? shownProject : null),
    open(kind: PanelKind, projectId?: string, fromCard = false) {
      let from: Quad | null = null;
      if (kind === "project") {
        const p = PROJECTS.find((q) => q.id === projectId);
        if (!p) return;
        const same = current === "project" && (swapTo ?? shownProject) === p;
        if (same) return;
        const i = PROJECTS.indexOf(p);
        if (current === "project") {
          player.release();
          opts.onProjectShown(i);
          swapProject(p);
          return;
        }
        clearFlights();
        if (fromCard) from = opts.cardQuad(i);
        fillProject(p);
        opts.onProjectShown(i);
      }
      /* VP-112: um painel no lugar de outro: o que sai sai depressa, e o novo entra logo depois, por cima */
      let delay = 0;
      if (current && current !== kind) { release?.(); release = null; hide(current, null, true); delay = 0.2; }
      const el = panels[kind];
      const was = current === kind;
      /* VP-121: ainda saindo (reaberto no meio do fechamento): continua de onde está */
      const resume = !was && el.classList.contains("is-open") && (kind === "index" || kind === "profile");
      closing.delete(kind);
      current = kind;
      document.documentElement.classList.add("has-panel");
      document.documentElement.dataset.panel = kind;
      el.classList.add("is-open");
      if (kind === "index" && !was) hoverArmed = false;
      if (!was) {
        el.classList.add("is-front");
        animIn(kind, el, from, delay, resume);
        window.setTimeout(() => el.classList.remove("is-front"), (delay + 1.1) * 1000);
      }
      release?.();
      release = trapFocus(el);
      requestAnimationFrame(() => (el.querySelector<HTMLElement>(kind === "index" ? ".filters input:checked" : ".close") ?? el).focus({ preventScroll: true }));
    },
    close() {
      if (!current) return;
      release?.(); release = null;
      const shownIndex = shownProject ? PROJECTS.indexOf(shownProject) : -1;
      const to = current === "project" && shownProject && opts.cardQuad(shownIndex) ? () => opts.cardQuad(shownIndex) : null;
      const kind = current;
      current = null;
      hide(kind, to);
      document.documentElement.classList.remove("has-panel");
      delete document.documentElement.dataset.panel;
    },
    /** o anterior e o próximo da ficha aberta (as setas ← →) */
    step(dir: 1 | -1) {
      if (current !== "project" || !shownProject) return null;
      const { prev, next } = neighbors(swapTo ?? shownProject);
      return dir > 0 ? next : prev;
    },
    /** para o "pular para o índice": o campo de busca */
    focusSearch() { search.focus(); },
  };
}
