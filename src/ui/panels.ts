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
   Os três são diálogos de verdade (role="dialog", o Tab fica dentro, Esc
   fecha, o foco volta para onde estava). As animações são do GSAP.
════════════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import { PROJECTS, CATEGORIES, hasImage, imageUrl, type Category, type Project } from "../content/projects";
import { PROFILE, PROFILE_ART } from "../data/site";
import { t, tx, tp, onLang } from "../core/i18n";
import type { PanelKind } from "../core/router";
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
  /** a ficha aberta (o cartão dela some da galeria) */
  onProjectShown: (index: number | null) => void;
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
    row.addEventListener("pointerenter", focusIt);
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
    const img = h("img", { src: imageUrl(a.img), loading: "lazy", decoding: "async" });
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
      const img = h("img", { class: "is-art is-cover", alt: `${tx(p.name)}: ${tx(p.type)}` });
      loadCoverFonts().then(() => { img.src = drawCover(document.createElement("canvas"), p).toDataURL("image/webp", 0.9); });
      shots = h("div", { class: "project-shots", tabindex: "0", role: "group", "aria-label": tx(p.name) }, img);
    } else {
      shots = h("div", { class: "project-shots", tabindex: "0", role: "group", "aria-label": tx(p.name) },
        ...p.shots.map((s, i) => h("img", {
          src: imageUrl(s), alt: i === 0 ? `${tx(p.name)}: ${tx(p.type)}` : "", loading: i === 0 ? "eager" : "lazy", decoding: "async",
          class: p.category === "design" ? "is-art" : undefined,
        })));
    }
    const { prev, next } = neighbors(p);
    /* o nome falado é o que se lê ("Anterior Laboratório"): as setas ficam escondidas do leitor */
    const navLink = (q: Project, dir: "prev" | "next") => h("a", { class: `project-step is-${dir}`, href: `/project/${q.id}`, "data-link": "" },
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
  const panels: Record<PanelKind, HTMLElement> = { index: indexPanel, profile: profilePanel, project: projectPanel };
  let current: PanelKind | null = null;
  let release: (() => void) | null = null;

  /** VP-22: o recorte que faz a ficha nascer do retângulo do cartão */
  const clipFrom = (el: HTMLElement, r: Rect) => {
    const b = el.getBoundingClientRect();
    const top = Math.max(0, r.y - b.top), left = Math.max(0, r.x - b.left);
    const right = Math.max(0, b.right - (r.x + r.w)), bottom = Math.max(0, b.bottom - (r.y + r.h));
    return `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round 4px)`;
  };
  const clipFull = (el: HTMLElement) => `inset(0px 0px 0px 0px round ${getComputedStyle(el).borderTopLeftRadius})`;

  const animIn = (kind: PanelKind, el: HTMLElement, from?: Rect | null) => {
    const reduce = prefersReducedMotion();
    gsap.killTweensOf(el);
    if (reduce) { gsap.set(el, { clearProps: "all" }); return; }
    if (kind === "index") {
      gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: "expo.out" });
      gsap.fromTo(el.querySelectorAll(".filters label, .index-search, .index-row:not([hidden])"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.03, delay: 0.25, ease: "power3.out" });
    } else if (kind === "profile") {
      gsap.fromTo(el, { clipPath: "inset(48% 48% 48% 48% round 40px)", opacity: 1 }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.0, ease: "expo.inOut", clearProps: "clipPath" });
      gsap.fromTo(el.querySelectorAll(".profile-text p, .profile-art figure, .profile-aside"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07, delay: 0.45, ease: "power3.out" });
    } else if (from) {
      /* do cartão: o vidro cresce do retângulo dele até o lugar da ficha */
      gsap.fromTo(el, { clipPath: clipFrom(el, from) }, { clipPath: clipFull(el), duration: 0.95, ease: "expo.inOut", clearProps: "clipPath" });
      gsap.fromTo(el.querySelectorAll(".project-info > *"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, delay: 0.45, ease: "power3.out" });
      gsap.fromTo(el.querySelector(".project-shots"), { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.9, delay: 0.35, ease: "expo.out" });
    } else {
      gsap.fromTo(el, { opacity: 0, scale: 0.94, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.85, ease: "expo.out" });
      gsap.fromTo(el.querySelectorAll(".project-info > *"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, delay: 0.2, ease: "power3.out" });
      gsap.fromTo(el.querySelector(".project-shots"), { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.9, delay: 0.15, ease: "expo.out" });
    }
  };
  const animOut = (kind: PanelKind, el: HTMLElement, done: () => void, to?: Rect | null) => {
    if (prefersReducedMotion()) { done(); return; }
    gsap.killTweensOf(el);
    if (kind === "index") gsap.to(el, { yPercent: 100, duration: 0.55, ease: "power3.in", onComplete: done });
    else if (kind === "profile") gsap.to(el, { clipPath: "inset(48% 48% 48% 48% round 40px)", duration: 0.55, ease: "power3.in", onComplete: done });
    else if (to) {
      /* de volta ao cartão (que acende enquanto o vidro encolhe) */
      gsap.to(el.querySelectorAll(".project-info > *, .project-shots"), { opacity: 0, duration: 0.2 });
      gsap.fromTo(el, { clipPath: clipFull(el) }, { clipPath: clipFrom(el, to), duration: 0.6, ease: "expo.inOut", onComplete: done });
    } else gsap.to(el, { opacity: 0, scale: 0.96, y: 20, duration: 0.4, ease: "power2.in", onComplete: done });
  };

  const hide = (kind: PanelKind, to?: Rect | null) => {
    const el = panels[kind];
    /* o cartão acende enquanto o vidro encolhe até ele */
    if (kind === "project") { opts.onProjectShown(null); player.release(); unPlayer?.(); unPlayer = null; }
    animOut(kind, el, () => {
      el.classList.remove("is-open");
      gsap.set([el, ...el.querySelectorAll(".project-info > *, .project-shots")], { clearProps: "all" });
    }, to);
  };

  return {
    current: () => current,
    /** o projeto da ficha aberta */
    shown: () => (current === "project" ? shownProject : null),
    open(kind: PanelKind, projectId?: string, fromCard = false) {
      let from: Rect | null = null;
      if (kind === "project") {
        const p = PROJECTS.find((q) => q.id === projectId);
        if (!p) return;
        const same = current === "project" && shownProject === p;
        if (same) return;
        const i = PROJECTS.indexOf(p);
        if (fromCard && current !== "project") from = opts.cardRect(i);
        if (current === "project") player.release();
        fillProject(p);
        opts.onProjectShown(i);
      }
      if (current && current !== kind) { release?.(); release = null; hide(current); }
      const el = panels[kind];
      const was = current === kind;
      current = kind;
      document.documentElement.classList.add("has-panel");
      document.documentElement.dataset.panel = kind;
      el.classList.add("is-open");
      if (!was) animIn(kind, el, from);
      else if (kind === "project" && !prefersReducedMotion()) gsap.fromTo(el.querySelectorAll(".project-info > *, .project-shots"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: "power3.out" });
      release?.();
      release = trapFocus(el);
      requestAnimationFrame(() => (el.querySelector<HTMLElement>(kind === "index" ? ".filters input:checked" : ".close") ?? el).focus({ preventScroll: true }));
    },
    close() {
      if (!current) return;
      release?.(); release = null;
      const to = current === "project" && shownProject ? opts.cardRect(PROJECTS.indexOf(shownProject)) : null;
      hide(current, to);
      current = null;
      document.documentElement.classList.remove("has-panel");
      delete document.documentElement.dataset.panel;
    },
    /** o anterior e o próximo da ficha aberta (as setas ← →) */
    step(dir: 1 | -1) {
      if (current !== "project" || !shownProject) return null;
      const { prev, next } = neighbors(shownProject);
      return dir > 0 ? next : prev;
    },
    /** para o "pular para o índice": o campo de busca */
    focusSearch() { search.focus(); },
  };
}
