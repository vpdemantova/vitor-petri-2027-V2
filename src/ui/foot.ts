/* ════════════════════════════════════════════════════════════════════
   O PÉ DA PÁGINA, à direita (V2, 16/out/2026), nas letras das
   coordenadas da abertura (Cormorant, em lavanda):
   · o contador "03 / 21" (VP-13), com a categoria quando há filtro;
   · Sala / Fila (VP-91): a galeria vira um corredor e volta;
   · Som (VP-90): desligado por padrão;
   · o idioma (VP-01): mostra a outra língua ("PT" lendo em inglês).
   E, no meio, a dica da primeira visita (VP-23): "Role ou arraste", que
   some no primeiro movimento e não volta (guardado neste navegador).
════════════════════════════════════════════════════════════════════ */
import { t, getLang, onLang } from "../core/i18n";
import { h } from "./dom";
import { counterText } from "../gl/math";

export function createFoot(handlers: { onRoom: () => void; onSound: () => void; onLang: () => void }) {
  const cat = h("span", { class: "foot-cat" });
  const num = h("span", { class: "foot-num" });
  const counter = h("p", { class: "foot-counter", "aria-hidden": "true" }, cat, num);
  const room = h("button", { class: "foot-btn", type: "button", "aria-pressed": "false" });
  const sound = h("button", { class: "foot-btn foot-sound", type: "button", "aria-pressed": "false" }, h("span", { class: "foot-bars", "aria-hidden": "true" }, h("i"), h("i"), h("i")), h("span", { class: "foot-sound-t" }));
  const lang = h("button", { class: "foot-btn foot-lang", type: "button" });
  const el = h("div", { class: "foot" }, counter, h("div", { class: "foot-ctl" }, room, sound, lang));
  room.addEventListener("click", handlers.onRoom);
  sound.addEventListener("click", handlers.onSound);
  lang.addEventListener("click", handlers.onLang);
  let roomOn = false, soundOn = false, catKey: string | null = null;
  const fill = () => {
    room.textContent = roomOn ? t("queue") : t("room");
    room.setAttribute("aria-pressed", String(roomOn));
    room.setAttribute("aria-label", roomOn ? t("roomOff") : t("roomOn"));
    room.title = `${roomOn ? t("roomOff") : t("roomOn")} (R)`;
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
    setRoom(v: boolean) { roomOn = v; fill(); },
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
