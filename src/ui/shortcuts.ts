/* ════════════════════════════════════════════════════════════════════
   OS ATALHOS À VISTA (VP-25, 16/out/2026): "?" abre uma lista pequena,
   Esc (ou ? de novo) fecha. A lista é a que o main.ts obedece.
════════════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import { t, onLang, type Key } from "../core/i18n";
import { h, trapFocus, prefersReducedMotion } from "./dom";
import { SOUND_ENABLED } from "../core/sound";

const KEYS: [string[], Key][] = [
  [["←", "→"], "kNext"], [["Enter"], "kOpen"], [["I"], "kIndex"], [["P"], "kProfile"], [["C"], "kContact"],
  [["V"], "kView"], [["R"], "kRoom"], [["S"], "kSound"], [["L"], "kLang"], [["Esc"], "kClose"], [["?"], "kHelp"],
].filter(([, d]) => SOUND_ENABLED || d !== "kSound") as [string[], Key][];

export function createShortcuts() {
  const title = h("h2", { class: "keys-title", id: "keys-title" });
  const list = h("dl", { class: "keys-list" });
  const el = h("section", { class: "keys", role: "dialog", "aria-modal": "true", "aria-labelledby": "keys-title", tabindex: "-1" }, title, list);
  onLang(() => {
    title.textContent = t("shortcuts");
    list.replaceChildren(...KEYS.map(([k, d]) => h("div", {}, h("dt", {}, ...k.map((x) => h("kbd", {}, x))), h("dd", {}, t(d)))));
  });
  let release: (() => void) | null = null;
  const isOpen = () => el.classList.contains("is-open");
  function toggle(open = !isOpen()) {
    if (open === isOpen()) return;
    if (open) {
      el.classList.add("is-open");
      release = trapFocus(el);
      el.focus({ preventScroll: true });
      if (!prefersReducedMotion()) gsap.fromTo(el, { opacity: 0, y: 14, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "expo.out" });
    } else {
      el.classList.remove("is-open");
      release?.(); release = null;
    }
  }
  el.addEventListener("pointerdown", (e) => { if (e.target === el) toggle(false); });
  return { el, toggle, isOpen };
}
