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
   Os três são diálogos de verdade (role="dialog", o Tab fica dentro, Esc
   fecha, o foco volta para onde estava). As animações são do GSAP.
════════════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import { PROJECTS, CATEGORIES, aspectOf, hasImage, imageUrl, sizeOf, type Category, type Project } from "../content/projects";
import { PROFILE, PROFILE_ART } from "../data/site";
import { t, tx, tp, onLang } from "../core/i18n";
import { localize, type PanelKind } from "../core/router";
import { player } from "../core/sound";
import { drawCover, loadCoverFonts } from "./musiccard";
import { h, ARROW, CROSS, PLAY, PAUSE, trapFocus, prefersReducedMotion } from "./dom";

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
    const navLink = (q: Project, dir: "prev" | "next") => h("a", { class: `project-step is-${dir}`, href: localize(`/project/${q.id}`), "data-link": "" },
      h("span", { class: "project-step-k", html: dir === "prev" ? `<span aria-hidden="true">←</span> ${t("previous")}` : `${t("next")} <span aria-hidden="true">→</span>` }),
      h("span", { class: "project-step-name" }, tx(q.name)));
    const desc = tp(p.description);
    const proc = tp(p.process);
    projectPanel.replaceChildren(
      projectClose,
      h("div", { class: "project-info" },
        h("h2", { id: "project-title", class: "project-title" }, tx(p.name)),
        h("div", { class: "project-meta" }, meta, visit),
        p.audio ? playerEl(p) : null,
        desc.length ? h("div", { class: "project-desc" }, ...desc.map((d) => h("p", {}, d))) : null,
        proc.length ? h("div", { class: "project-process" }, h("h3", {}, t("process")), ...proc.map((d) => h("p", {}, d))) : null,
        h("nav", { class: "project-nav", "aria-label": `${t("previous")} / ${t("next")}` }, navLink(prev, "prev"), navLink(next, "next"))),
      shots);
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
  let closing = 0;

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
  /** o voo: a imagem vai do retângulo a ao b só com transform (sem mexer no layout a cada quadro) */
  const fly = (el: HTMLElement, a: Rect, b: Rect, duration: number, onComplete: () => void) => {
    Object.assign(el.style, { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` });
    gsap.fromTo(el, { x: a.x - b.x, y: a.y - b.y, scaleX: a.w / b.w, scaleY: a.h / b.h, transformOrigin: "0 0" },
      { x: 0, y: 0, scaleX: 1, scaleY: 1, duration, ease: "expo.inOut", onComplete });
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

  const animIn = (kind: PanelKind, el: HTMLElement, from?: Rect | null, delay = 0) => {
    const reduce = prefersReducedMotion();
    gsap.killTweensOf(el);
    if (reduce) { gsap.set(el, { clearProps: "all" }); return; }
    if (kind === "index") {
      gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.9, delay, ease: "expo.out" });
      gsap.fromTo(el.querySelectorAll(".filters label, .index-search, .index-row:not([hidden])"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.025, delay: delay + 0.12, ease: "power3.out" });
    } else if (kind === "profile") {
      gsap.fromTo(el, { clipPath: "inset(48% 48% 48% 48% round 40px)", opacity: 1 }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.0, delay, ease: "expo.inOut", clearProps: "clipPath" });
      gsap.fromTo(el.querySelectorAll(".profile-text p, .profile-art figure, .profile-aside"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07, delay: delay + 0.45, ease: "power3.out" });
    } else if (from && shownProject) {
      /* VP-112: do cartão: o vidro cresce do retângulo dele e a própria imagem do cartão voa até o lugar dela na
         ficha (antes, crescia uma caixa branca vazia e a imagem só aparecia depois) */
      const p = shownProject;
      const shots = el.querySelector<HTMLElement>(".project-shots");
      gsap.fromTo(el, { clipPath: clipFrom(el, from) }, { clipPath: clipFull(el), duration: 0.9, ease: "expo.inOut", clearProps: "clipPath" });
      gsap.fromTo(el.querySelectorAll(".project-info > *"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, delay: 0.45, ease: "power3.out" });
      const to = shotRect(p);
      if (to && shots) {
        gsap.set(shots, { opacity: 0 });
        const c = flyClone(p);
        fly(c, from, to, 0.9, () => { gsap.set(shots, { opacity: 1 }); gsap.to(c, { opacity: 0, duration: 0.2, onComplete: () => c.remove() }); });
      } else if (shots) gsap.fromTo(shots, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.9, delay: 0.35, ease: "expo.out" });
    } else {
      gsap.fromTo(el, { opacity: 0, scale: 0.94, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.85, delay, ease: "expo.out" });
      gsap.fromTo(el.querySelectorAll(".project-info > *"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, delay: delay + 0.2, ease: "power3.out" });
      gsap.fromTo(el.querySelector(".project-shots"), { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.9, delay: delay + 0.15, ease: "expo.out" });
    }
  };
  /** a saída; fast: na troca de um painel por outro, o que sai sai mais depressa (o outro entra depois) */
  const animOut = (kind: PanelKind, el: HTMLElement, done: () => void, to?: Rect | null, fast = false) => {
    if (prefersReducedMotion()) { done(); return; }
    gsap.killTweensOf(el);
    const q = fast ? 0.65 : 1;
    if (kind === "index") gsap.to(el, { yPercent: 100, duration: 0.55 * q, ease: "power3.in", onComplete: done });
    else if (kind === "profile") gsap.to(el, { clipPath: "inset(48% 48% 48% 48% round 40px)", opacity: fast ? 0 : 1, duration: 0.55 * q, ease: "power3.in", onComplete: done });
    else if (to && shownProject) {
      /* VP-112: de volta ao cartão: o texto some, o vidro encolhe até o cartão, e a imagem da ficha voa de volta
         ao lugar dele; o cartão acende ali mesmo quando ela chega (antes, uma caixa vazia encolhia e o cartão
         aparecia por baixo, ao mesmo tempo) */
      const p = shownProject;
      const shots = el.querySelector<HTMLElement>(".project-shots");
      const fr = shotRect(p);
      gsap.to(el.querySelectorAll(".project-info > *"), { opacity: 0, duration: 0.18 });
      gsap.fromTo(el, { clipPath: clipFull(el) }, { clipPath: clipFrom(el, to), duration: 0.7, ease: "expo.inOut" });
      if (fr && shots) {
        const c = flyClone(p);
        gsap.set(shots, { opacity: 0 });
        gsap.to(el, { opacity: 0, duration: 0.3, delay: 0.38 });
        fly(c, fr, to, 0.7, () => { done(); requestAnimationFrame(() => c.remove()); });
      } else gsap.to(el, { opacity: 0, duration: 0.3, delay: 0.38, onComplete: done });
    } else gsap.to(el, { opacity: 0, scale: 0.96, y: 20, duration: 0.4 * q, ease: "power2.in", onComplete: done });
  };

  const hide = (kind: PanelKind, to?: Rect | null, fast = false) => {
    const el = panels[kind];
    closing++;
    if (kind === "project") {
      player.release(); unPlayer?.(); unPlayer = null;
      /* com o voo de volta, o cartão acende na hora em que a imagem chega; sem ele, já (devagar) */
      if (!to) opts.onProjectShown(null);
    }
    animOut(kind, el, () => {
      closing = Math.max(0, closing - 1);
      if (kind === "project" && to) opts.onProjectShown(null, true);
      /* o painel pode ter sido aberto de novo enquanto saía: aí ele fica */
      if (current === kind) return;
      el.classList.remove("is-open");
      gsap.set([el, ...el.querySelectorAll(".project-info > *, .project-shots")], { clearProps: "all" });
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
    gsap.to(outEls, {
      opacity: 0, x: -28 * swapDir, duration: 0.2, stagger: 0.012, ease: "power2.in",
      onComplete: () => {
        const q = swapTo!;
        swapTo = null;
        fillProject(q);
        const inEls = projectPanel.querySelectorAll(".project-info > *, .project-shots");
        gsap.fromTo(inEls, { opacity: 0, x: 28 * swapDir }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.03, ease: "power3.out", clearProps: "transform,opacity" });
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
    busy: () => closing > 0,
    /** o projeto da ficha aberta */
    shown: () => (current === "project" ? shownProject : null),
    open(kind: PanelKind, projectId?: string, fromCard = false) {
      let from: Rect | null = null;
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
        if (fromCard) from = opts.cardRect(i);
        fillProject(p);
        opts.onProjectShown(i);
      }
      /* VP-112: um painel no lugar de outro: o que sai sai depressa, e o novo entra logo depois, por cima */
      let delay = 0;
      if (current && current !== kind) { release?.(); release = null; hide(current, null, true); delay = 0.2; }
      const el = panels[kind];
      const was = current === kind;
      current = kind;
      document.documentElement.classList.add("has-panel");
      document.documentElement.dataset.panel = kind;
      el.classList.add("is-open");
      if (kind === "index" && !was) hoverArmed = false;
      if (!was) {
        el.classList.add("is-front");
        animIn(kind, el, from, delay);
        window.setTimeout(() => el.classList.remove("is-front"), (delay + 1.1) * 1000);
      }
      release?.();
      release = trapFocus(el);
      requestAnimationFrame(() => (el.querySelector<HTMLElement>(kind === "index" ? ".filters input:checked" : ".close") ?? el).focus({ preventScroll: true }));
    },
    close() {
      if (!current) return;
      release?.(); release = null;
      const to = current === "project" && shownProject ? opts.cardRect(PROJECTS.indexOf(shownProject)) : null;
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
