/* ════════════════════════════════════════════════════════════════════
   O CURSOR PRÓPRIO (VP-15, 16/out/2026), só com mouse (nada no toque):
   · sobre a galeria, um anel branco pequeno;
   · sobre o cartão da vez, um círculo branco com "VIEW" ("VER");
   · sobre outro cartão, um círculo menor com a seta (vai até ele);
   · arrastando, o anel se aperta.
   Sobre a interface (menu, painéis, etiqueta), volta a seta do sistema.
   Com "reduzir movimento", sem atraso no seguir.
════════════════════════════════════════════════════════════════════ */
import { t, onLang } from "../core/i18n";
import { h } from "./dom";

export type CursorState = "ring" | "view" | "go" | "drag" | "off";

export function createCursor(reduced: boolean) {
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const label = h("span", { class: "cursor-label" });
  const el = h("div", { class: "cursor", "aria-hidden": "true", "data-state": "off" }, label);
  if (!fine) return { el, set: (_: CursorState) => {}, frame: (_: number) => {}, enabled: false };
  document.documentElement.classList.add("has-cursor");
  let x = -100, y = -100, cx = -100, cy = -100, state: CursorState = "off";
  window.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { x = e.clientX; y = e.clientY; } }, { passive: true });
  document.addEventListener("pointerleave", () => set("off"));
  const setLabel = () => { label.textContent = state === "view" ? t("view") : state === "go" ? "→" : ""; };
  onLang(setLabel);
  function set(s: CursorState) {
    if (s === state) return;
    state = s;
    el.dataset.state = s;
    setLabel();
  }
  return {
    el,
    set,
    frame(dt: number) {
      const k = reduced ? 1 : 1 - Math.exp(-dt * 22);
      cx += (x - cx) * k; cy += (y - cy) * k;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    },
    enabled: true,
  };
}
