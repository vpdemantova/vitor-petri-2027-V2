/* ════════════════════════════════════════════════════════════════════
   VITOR PETRI, V2 — o começo de tudo (10/out/2026; refeito em 16/out/2026,
   dividido em módulos: VP-72).

   O site é uma página só, com cinco estados (as telas de referência):
     · a abertura (ui/intro): as coordenadas de Campinas e o logotipo
       grande, que se enche enquanto as imagens chegam e voa até o canto;
     · a galeria (gl/gallery): os projetos em profundidade, a etiqueta do
       cartão da vez (ui/label) e o botão Contact (ui/contact);
     · o Índice, o Perfil e a ficha do Projeto (ui/panels).
   O endereço guarda o estado (/index, /profile, /project/<id>: core/router).
   Em volta: os dois idiomas (core/i18n), o som (core/sound), o pé com o
   contador (ui/foot), o cursor (ui/cursor), os atalhos (ui/shortcuts) e o
   modo comparação (?ref=N: ui/compare).
════════════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import "./styles/app.css";
import { PROJECTS } from "./content/projects";
import { t, tx, getLang, onLang } from "./core/i18n";
import { startRouter, onRoute, go, localize, current as currentRoute, type Route } from "./core/router";
import { bindInput } from "./core/input";
import { soundOn, setSound, onSound, chime, preview, SOUND_ENABLED } from "./core/sound";
import { wordmarkSVG } from "./ui/wordmark";
import { h, prefersReducedMotion } from "./ui/dom";
import { createPanels } from "./ui/panels";
import { createLabel } from "./ui/label";
import { createContact } from "./ui/contact";
import { createIntro } from "./ui/intro";
import { createCursor } from "./ui/cursor";
import { createFoot, createHint } from "./ui/foot";
import { createShortcuts } from "./ui/shortcuts";
import { startCompare } from "./ui/compare";
import { switchLang } from "./ui/langswitch";
import type { Gallery, View } from "./gl/gallery";

const app = document.getElementById("app")!;
const canvas = document.getElementById("gl") as HTMLCanvasElement;
const skip = document.querySelector<HTMLAnchorElement>(".skip");
const params = new URLSearchParams(location.search);
const reduced = prefersReducedMotion();
/* ?semabertura: pula a abertura (para conferir e fotografar) */
const quick = reduced || params.has("semabertura");

/* ── o alto: o logotipo e o menu ── */
const brand = h("a", { class: "brand", href: "/", "data-link": "", html: wordmarkSVG("Vitor Petri") });
const navIndex = h("a", { href: "/index", "data-link": "" });
const navProfile = h("a", { href: "/profile", "data-link": "" });
const top = h("header", { class: "top" }, brand, h("nav", { class: "nav" }, navIndex, navProfile));

/* para leitores de tela: o projeto da vez */
const live = h("p", { class: "sr-only", "aria-live": "polite" });
const label = createLabel(live, reduced, (i) => openProject(i, true));
const contact = createContact(reduced);
const intro = createIntro(quick);
const cursor = createCursor(reduced);
const hint = createHint(reduced);
const shortcuts = createShortcuts();
let gallery: Gallery | null = null;
const foot = createFoot({
  onView: (v) => setView(v),
  onSound: () => setSound(!soundOn()),
  onLang: () => switchLang(getLang() === "en" ? "pt" : "en"),
});
onSound((v) => foot.setSound(v));

/* as regiões da página (para quem navega por elas): o alto (com o "pular para o índice") e a galeria */
if (skip) top.prepend(skip);
const stageUi = h("main", { class: "stage-ui" }, label.el, contact.pill, contact.card, foot.el, hint.el, live);
onLang(() => stageUi.setAttribute("aria-label", t("galleryLabel")));
/* VP-99 (19/out/2026): a abertura que veio pronta no HTML fica onde está e as outras peças entram em volta
   dela. Mover a abertura (um append dela) a fazia pintar de novo depois do JavaScript, e o navegador contava
   essa pintura como a maior da página: no celular simulado, de 1,7 s para 4,1 s. */
if (intro.el.parentNode === app) { intro.el.before(top, stageUi); intro.el.after(shortcuts.el, cursor.el); }
else app.append(top, stageUi, intro.el, shortcuts.el, cursor.el);

onLang(() => {
  navIndex.textContent = t("index");
  navProfile.textContent = t("profile");
  /* VP-101: os links levam à página na língua de agora (/pt/…) */
  brand.href = localize("/");
  navIndex.href = localize("/index");
  navProfile.href = localize("/profile");
  if (skip) skip.href = localize("/index");
  brand.setAttribute("aria-label", t("backToGallery"));
  if (skip) skip.textContent = t("skipToIndex");
  document.title = titleFor(currentRoute());
  gallery?.refreshCovers();
});

/* ── os painéis e o endereço ── */
let openFromCard = false;
const panels = createPanels(app, {
  onClose: () => go("/"),
  onFocusProject: (i) => gallery?.goTo(i),
  onOpenProject: (id) => go(`/project/${id}`),
  onFilter: (f) => gallery?.setFilter(f),
  order: () => gallery?.order() ?? PROJECTS.map((_, i) => i),
  cardRect: (i) => gallery?.screenRect(i) ?? null,
  cardQuad: (i) => gallery?.screenQuad(i) ?? null,
  onProjectShown: (i, instant) => gallery?.setHidden(i, instant),
});

function openProject(i: number, fromCard = false) {
  openFromCard = fromCard;
  go(`/project/${PROJECTS[i].id}`);
}

function titleFor(r: Route) {
  if (r.kind === "project") {
    const p = PROJECTS.find((q) => q.id === r.id);
    /* o primeiro portfólio também se chama Vitor Petri: aí o título leva o tipo */
    return p ? (tx(p.name) === "Vitor Petri" ? `Vitor Petri — ${tx(p.type)}` : `${tx(p.name)} — Vitor Petri`) : "Vitor Petri";
  }
  if (r.kind) return `${t(r.kind)} — Vitor Petri`;
  return "Vitor Petri";
}

let introDone = false;
function route(r: Route) {
  if (!introDone) return;
  const fromCard = openFromCard;
  openFromCard = false;
  if (r.kind === "project" && r.id) {
    const i = PROJECTS.findIndex((p) => p.id === r.id);
    if (i < 0) { go("/", true); return; }
    gallery?.goTo(i);
    panels.open("project", r.id, fromCard);
  } else if (r.kind) panels.open(r.kind);
  else panels.close();
  for (const [a, k] of [[navIndex, "index"], [navProfile, "profile"]] as const) {
    if (r.kind === k) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  }
  document.title = titleFor(r);
}
startRouter();
onRoute(route);

/** VP-113: o lugar da etiqueta na sala: no meio de baixo, na linha do Contact e do pé quando cabe entre eles
    (no computador); senão (no celular), logo acima deles */
function dockSpot(w: number, h: number) {
  const pill = contact.pill.getBoundingClientRect(), ft = foot.el.getBoundingClientRect();
  const x = (innerWidth - w) / 2;
  const fits = pill.width > 0 && ft.width > 0 && x > pill.right + 16 && x + w < ft.left - 16;
  const line = ft.top + ft.height / 2;
  return { x, y: fits ? line - h / 2 : Math.min(pill.top, ft.top) - h - 14 };
}

/* ── as teclas de toda a página ── */
/** VP-126: as três vistas (a fila, a sala, a cascata); a cascata muda o fundo para o papel claro (html.is-light) */
function setView(v: View) {
  if (!gallery) return;
  gallery.setView(v);
  foot.setView(v);
  hint.done();
}
function toggleRoom() {
  if (!gallery) return;
  setView(gallery.view() === "room" ? "queue" : "room");
}
const VIEWS: View[] = ["queue", "room", "cascade"];
window.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const typing = (e.target as HTMLElement).closest("input, textarea, select, [contenteditable]");
  if (e.key === "Escape") {
    if (shortcuts.isOpen()) { shortcuts.toggle(false); return; }
    if (contact.isOpen()) { contact.toggle(false); return; }
    if (panels.current()) go("/");
    return;
  }
  if (typing || !introDone) return;
  /* na ficha: ← → passam de projeto (VP-21) */
  if (panels.current() === "project" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    if ((e.target as HTMLElement).closest("[role='slider'], input[type='range']")) return;
    const q = panels.step(e.key === "ArrowRight" ? 1 : -1);
    if (q) { e.preventDefault(); go(`/project/${q.id}`); }
    return;
  }
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === "?") { shortcuts.toggle(); e.preventDefault(); return; }
  if (shortcuts.isOpen()) return;
  if (k === "i") go(panels.current() === "index" ? "/" : "/index");
  else if (k === "p") go(panels.current() === "profile" ? "/" : "/profile");
  else if (k === "c" && !panels.current()) contact.toggle(!contact.isOpen());
  else if (k === "l") switchLang(getLang() === "en" ? "pt" : "en");
  else if (k === "s" && SOUND_ENABLED) setSound(!soundOn());
  else if (k === "r" && !panels.current()) toggleRoom();
  else if (k === "v" && !panels.current() && gallery) setView(VIEWS[(VIEWS.indexOf(gallery.view()) + 1) % VIEWS.length]);
  else if (!panels.current() && gallery) {
    if (["ArrowDown", "ArrowRight", "PageDown", "j"].includes(k)) { gallery.step(1); hint.done(); e.preventDefault(); }
    else if (["ArrowUp", "ArrowLeft", "PageUp", "k"].includes(k)) { gallery.step(-1); hint.done(); e.preventDefault(); }
    else if (k === "Home") gallery.goTo(gallery.order()[0]);
    else if (k === "End") { const o = gallery.order(); gallery.goTo(o[o.length - 1]); }
    else if (k === "Enter" && (document.activeElement === document.body || document.activeElement === canvas)) openProject(gallery.active().index, true);
  }
});
skip?.addEventListener("click", () => requestAnimationFrame(() => panels.focusSearch()));

/* ── o 3D ── */
async function boot() {
  /* o 3D é carregado à parte (o three.js é grande); a interface já está na tela */
  const [{ createStage }, { createBackdrop }, { createGallery }, { createPost }, { createIntroParticles }] = await Promise.all([
    import("./gl/stage"), import("./gl/backdrop"), import("./gl/gallery"), import("./gl/post"), import("./gl/particles"),
  ]);
  let stage;
  try {
    stage = await createStage(canvas);
  } catch (e) {
    /* sem WebGPU nem WebGL2: o site continua, com o índice como página */
    console.warn("Sem 3D:", e);
    document.documentElement.dataset.gpu = "none";
    live.textContent = t("noGpu");
    finish(null);
    if (!currentRoute().kind) go("/index", true);
    return;
  }
  document.documentElement.dataset.gpu = stage.backend;
  const backdrop = createBackdrop(stage.scene, reduced);
  const g = createGallery(stage.scene, stage.camera, stage.renderer, reduced);
  gallery = g;
  /* VP-126: a vista com que a página nasce (?vista=cascata, ?vista=sala) */
  foot.setView(g.view());
  /* VP-30: o pós-processamento (?semefeitos desliga) */
  const post = params.has("semefeitos") ? null : createPost(stage.renderer, stage.scene, stage.camera, reduced);
  if (post) stage.setRender(post.render);
  /* um link direto para um projeto: a galeria já nasce nele */
  const r0 = currentRoute();
  if (r0.kind === "project") { const i = PROJECTS.findIndex((p) => p.id === r0.id); if (i >= 0) g.goTo(i); }

  /* VP-32: as partículas da abertura (com movimento e sem pular a abertura) */
  let particles: ReturnType<typeof createIntroParticles> = null;
  if (!quick) {
    try {
      stage.renderer.setSize(innerWidth, innerHeight, false);
      particles = createIntroParticles(stage.renderer, stage.scene, stage.camera, intro.mark.getBoundingClientRect());
      if (particles) intro.useParticles();
    } catch (e) { console.warn("Sem partículas:", e); particles = null; }
  }

  /* o mouse (alisado), para a paralaxe e o brilho */
  const mouse = { x: 0, y: 0, sx: 0, sy: 0, moved: false };
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -((e.clientY / innerHeight) * 2 - 1);
    mouse.moved = true;
  }, { passive: true });

  const input = bindInput(canvas, g, {
    blocked: () => !introDone || shortcuts.isOpen() || (!!panels.current() && panels.current() !== "index"),
    consumes: () => contact.isOpen(),
    /* na fila e na sala, o da vez abre e os outros vêm até a vez; na cascata (VP-126), qualquer um abre */
    onTap: (hit) => { if (g.view() === "cascade" || hit === g.active().index) openProject(hit, true); else g.goTo(hit); },
    onMove: () => hint.done(),
    onDrag: () => {},
  });

  g.onSettle((i) => {
    const slot = g.order().indexOf(i);
    if (introDone) chime(slot, 0.9);
  });

  const anchor = { x: 0, y: 0 };
  let isLight = false;
  let hoverHit: number | null = null;
  stage.onFrame((dt) => {
    mouse.sx += (mouse.x - mouse.sx) * (1 - Math.exp(-dt * 4));
    mouse.sy += (mouse.y - mouse.sy) * (1 - Math.exp(-dt * 4));
    backdrop.setMouse(reduced ? 0 : mouse.sx, reduced ? 0 : mouse.sy);
    g.setPointer(mouse.sx, mouse.sy);
    g.update(dt);
    backdrop.setCard(g.color(), 0.12);
    /* VP-126: o papel claro da cascata; as cores da página (html.is-light) viram no meio da troca do fundo */
    const light = g.light();
    backdrop.setLight(light);
    post?.setLight(light);
    if ((light > 0.5) !== isLight) { isLight = light > 0.5; document.documentElement.classList.toggle("is-light", isLight); }
    post?.setMotion(g.speed());
    particles?.update(dt);
    cursor.frame(dt);

    /* a etiqueta: aparece com o cartão no foco, some com painel aberto */
    const { index, focus, slot } = g.active();
    label.set(index);
    const panel = panels.current();
    /* VP-112: espera os painéis acabarem de sair (antes, ela aparecia por cima da ficha que ainda encolhia);
       VP-113: na sala, fica parada no meio de baixo e não some com o movimento (só o nome troca) */
    const docked = g.view() !== "queue";
    const free = introDone && (!panel || panel === "index") && !panels.busy() && !contact.isOpen();
    const want = docked ? free : free && focus > 0.85 && g.anchor(anchor);
    label.frame(dt, want, anchor.x, anchor.y, docked ? dockSpot : null);
    const f = g.filter();
    foot.setCount(slot, g.order().length, f === "all" ? null : f);

    /* o cartão sob o mouse (só sem painel por cima) */
    if (introDone && mouse.moved && !panel) {
      /* com o mouse sobre a interface (o menu, o pé, a etiqueta), nenhum cartão fica "sob o mouse" (VP-127: senão o
         cartão que passava por baixo de um botão acendia) */
      const overUi = (document.querySelector(":hover:is(.top, .label, .contact-pill, .contact-card, .foot, .keys)") !== null);
      hoverHit = overUi ? null : g.pick(mouse.x, mouse.y);
      g.setHover(hoverHit);
      cursor.set(overUi ? "off" : input.dragging() ? "drag" : hoverHit === null ? "ring" : hoverHit === index || g.view() === "cascade" ? "view" : "go");
      canvas.style.cursor = cursor.enabled ? "none" : hoverHit !== null ? "pointer" : input.dragging() ? "grabbing" : "grab";
    } else if (panel) { cursor.set("off"); hoverHit = null; g.setHover(null); }

    /* a gravação: com o som ligado, entra baixinho no cartão dela (VP-03) */
    const p = PROJECTS[hoverHit ?? index];
    preview(introDone && !panel && p.audio && (hoverHit !== null || focus > 0.9) ? p.audio : null);
  });
  /* VP-99: os materiais compilam antes do primeiro quadro (no WebGPU, em paralelo, fora do fio principal);
     se falhar, compilam no primeiro quadro, como antes */
  await g.warm().catch((e) => console.warn("Sem pré-compilação:", e));
  stage.start();

  /* ── a abertura: as imagens chegam, a palavra se enche ── */
  intro.start();
  backdrop.setIntensity(0);
  backdrop.setSpread(quick ? 1 : 0.04);
  const glow = { v: 0, s: quick ? 1 : 0.04 };
  gsap.to(glow, { v: 1, s: 1, duration: quick ? 0.01 : 2.2, ease: "power2.out", onUpdate: () => { backdrop.setIntensity(glow.v); backdrop.setSpread(glow.s); } });
  await g.load((p) => { intro.setProgress(p * 0.98); particles?.setProgress(p); });
  intro.setProgress(1);
  particles?.setProgress(1.05);
  /* com partículas, um instante para as últimas assentarem */
  await new Promise((r) => setTimeout(r, quick ? 30 : particles ? 1100 : 700));
  finish(g, particles);
}

/** a abertura sai: o logotipo grande voa até o lugar do pequeno */
function finish(g: Gallery | null, particles?: { burst: () => Promise<void>; dispose: () => void } | null) {
  const done = () => {
    if (!introDone) { introDone = true; route(currentRoute()); }
    /* VP-126: na sala e na cascata, a etiqueta fica no meio de baixo, onde estaria a dica: a dica só aparece na fila */
    if (!gallery || gallery.view() === "queue") hint.show();
  };
  const r = intro.finish(brand, () => { particles?.burst().then(() => particles?.dispose()); }, done);
  if (!r || !g) {
    gsap.set([top, contact.pill, ".nav a", foot.el], { opacity: 1 });
    g?.setReveal(1);
    if (!r) done();
    return;
  }
  const { tl, t0 } = r;
  /* VP-122 (21/out/2026): os cartões só chegam quando o logotipo grande já voou quase todo até o canto (antes, ele
     passava por cima dos cartões que entravam); depois, o menu, o contato e o pé, um de cada vez */
  tl.to({ v: 0 }, { v: 1, duration: 2.0, ease: "power2.out", onUpdate() { g.setReveal(this.targets()[0].v); } }, t0 + 0.8)
    .fromTo(".nav a", { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }, t0 + 0.95)
    .fromTo(contact.pill, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, t0 + 1.1)
    .fromTo(foot.el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, t0 + 1.2)
    .call(done, [], t0 + 1.9);
}

/* antes do 3D: o logotipo pequeno, o menu, o contato e o pé esperam a abertura */
gsap.set(brand, { opacity: 0 });
gsap.set([".nav a", contact.pill, foot.el], { opacity: 0 });
startCompare();
boot();
