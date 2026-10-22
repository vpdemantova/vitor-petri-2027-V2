/* ════════════════════════════════════════════════════════════════════
   O PÉ DA PÁGINA, à direita (V2, 16/out/2026), nas letras das
   coordenadas da abertura (Cormorant, em lavanda):
   · o contador "03 / 21" (VP-13), com a categoria quando há filtro;
   · as três vistas (VP-126, 22/out/2026): FILA, SALA (VP-91, o corredor) e
     CASCATA (a grade sobre o papel claro); a da vez fica acesa. No celular,
     só os desenhos (VP-96: antes era um botão Sala / Fila só);
   · Som (VP-90): desligado por padrão;
   · o idioma (VP-01): mostra a outra língua ("PT" lendo em inglês).
   E, no meio, a dica da primeira visita (VP-23): "Role ou arraste", que
   some no primeiro movimento e não volta (guardado neste navegador).
════════════════════════════════════════════════════════════════════ */
import { t, getLang, onLang } from "../core/i18n";
import { h } from "./dom";
import { counterText } from "../gl/math";
import { SOUND_ENABLED } from "../core/sound";

export type ViewName = "queue" | "room" | "cascade";
/* os desenhos das vistas (só no celular, onde falta lugar para as palavras): a fila em profundidade, a sala em
   perspectiva (VP-96) e a cascata em colunas */
const svg = (inner: string) => `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3">${inner}</svg>`;
const ICONS: Record<ViewName, string> = {
  queue: svg(`<rect x="1" y="6" width="9" height="7"/><path d="M4 6V3.5h9v7h-3"/><path d="M7 3.5V1.5h8V7h-2"/>`),
  room: svg(`<rect x="1" y="1" width="14" height="14"/><rect x="5.5" y="5.5" width="5" height="5"/><path d="M1 1l4.5 4.5M15 1l-4.5 4.5M1 15l4.5-4.5M15 15l-4.5-4.5"/>`),
  cascade: svg(`<rect x="1" y="1" width="6" height="8"/><rect x="9" y="1" width="6" height="5"/><rect x="1" y="11" width="6" height="4"/><rect x="9" y="8" width="6" height="7"/>`),
};
const VIEW_KEY = { queue: "queue", room: "room", cascade: "cascade" } as const;
const VIEW_LABEL = { queue: "viewQueue", room: "viewRoom", cascade: "viewCascade" } as const;

export function createFoot(handlers: { onView: (v: ViewName) => void; onSound: () => void; onLang: () => void }) {
  const cat = h("span", { class: "foot-cat" });
  const num = h("span", { class: "foot-num" });
  const counter = h("p", { class: "foot-counter", "aria-hidden": "true" }, cat, num);
  /* VP-126: as três vistas */
  const views = (["queue", "room", "cascade"] as const).map((v) => {
    const label = h("span", { class: "foot-view-t" });
    const b = h("button", { class: `foot-btn foot-view is-${v}`, type: "button", "aria-pressed": "false" },
      h("span", { class: "foot-view-i", "aria-hidden": "true", html: ICONS[v] }), label);
    b.addEventListener("click", () => handlers.onView(v));
    return { v, b, label };
  });
  const viewGroup = h("div", { class: "foot-views", role: "group" }, ...views.map((x) => x.b));
  const sound = h("button", { class: "foot-btn foot-sound", type: "button", "aria-pressed": "false" }, h("span", { class: "foot-bars", "aria-hidden": "true" }, h("i"), h("i"), h("i")), h("span", { class: "foot-sound-t" }));
  const lang = h("button", { class: "foot-btn foot-lang", type: "button" });
  /* VP-114: sem o som (por ora), sem o botão */
  const el = h("div", { class: "foot" }, counter, h("div", { class: "foot-ctl" }, viewGroup, ...(SOUND_ENABLED ? [sound] : []), lang));
  sound.addEventListener("click", handlers.onSound);
  lang.addEventListener("click", handlers.onLang);
  let view: ViewName = "queue", soundOn = false, catKey: string | null = null;
  const fill = () => {
    viewGroup.setAttribute("aria-label", t("views"));
    for (const x of views) {
      x.label.textContent = t(VIEW_KEY[x.v]);
      x.b.setAttribute("aria-pressed", String(view === x.v));
      x.b.setAttribute("aria-label", t(VIEW_LABEL[x.v]));
      x.b.title = `${t(VIEW_LABEL[x.v])} (V)`;
    }
    (sound.querySelector(".foot-sound-t") as HTMLElement).textContent = t("sound");
    sound.setAttribute("aria-pressed", String(soundOn));
    sound.setAttribute("aria-label", soundOn ? t("soundOn") : t("soundOff"));
    sound.title = `${soundOn ? t("soundOn") : t("soundOff")} (S)`;
    lang.textContent = t("lang");
    /* o nome falado começa pelo que se lê ("PT, ler em português") */
    lang.setAttribute("aria-label", `${t("lang")}, ${t("langLabel").toLowerCase()}`);
    lang.setAttribute("lang", getLang() === "en" ? "pt-BR" : "en");
    lang.title = `${t("langLabel")} (L)`;
    cat.textContent = catKey ? `${t(catKey as "design")} · ` : "";
  };
  onLang(fill);
  return {
    el,
    setCount(i: number, n: number, category: string | null) {
      num.textContent = counterText(i, n);
      if (category !== catKey) { catKey = category; fill(); }
    },
    setView(v: ViewName) { view = v; fill(); },
    setSound(v: boolean) { soundOn = v; el.classList.toggle("is-sound", v); fill(); },
  };
}

export function createHint(reduced: boolean) {
  let seen = false;
  try { seen = localStorage.getItem("vp-dica") === "1"; } catch { /* sem armazenamento */ }
  const a = h("span", { class: "hint-a" });
  const b = h("span", { class: "hint-b" });
  const el = h("p", { class: "hint", "aria-hidden": "true" }, h("span", { class: "hint-line" }), a, b);
  onLang(() => { a.textContent = t("hint"); b.textContent = t("hintKeys"); });
  let shown = false;
  return {
    el,
    /** depois da abertura: aparece (na primeira visita) */
    show() {
      if (seen || shown) return;
      shown = true;
      el.classList.add("is-on");
      if (reduced) el.classList.add("is-still");
    },
    /** o primeiro movimento: some de vez */
    done() {
      if (!shown || seen) return;
      seen = true;
      el.classList.remove("is-on");
      try { localStorage.setItem("vp-dica", "1"); } catch { /* sem armazenamento */ }
    },
  };
}
