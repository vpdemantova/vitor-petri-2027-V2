/* ════════════════════════════════════════════════════════════════════
   A ETIQUETA do cartão da vez ("Nome ↗ · VIEW PROJECT"), presa ao canto
   de baixo à direita dele: 64% da pílula antes do canto, como nas telas.
   O nome leva ao site (nova aba); o botão abre a ficha. O nome novo troca
   deslizando.
   VP-113 (21/out/2026, "na sala, deixe o botão de projeto bem no meio
   inferior só trocando o nome dos projetos"): na sala, a etiqueta fica
   parada no meio de baixo (a "doca", calculada em main.ts) e não some com
   o movimento: só o nome troca.
════════════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import { PROJECTS } from "../content/projects";
import { t, tx, onLang } from "../core/i18n";
import { h, ARROW } from "./dom";
import { damp } from "../gl/math";

export function createLabel(live: HTMLElement, reduced: boolean, onOpen: (index: number) => void) {
  const text = h("span", { class: "label-name-text" });
  const name = h("a", { class: "label-name", target: "_blank", rel: "noopener noreferrer" }, text);
  name.insertAdjacentHTML("beforeend", ARROW);
  const cta = h("button", { class: "label-cta", type: "button" });
  const el = h("div", { class: "label" }, name, cta);
  let index = -1, alpha = 0, x = 0, y = 0, first = true;

  const fill = (i: number) => {
    const p = PROJECTS[i];
    text.textContent = tx(p.name);
    if (p.url) { name.setAttribute("href", p.url); name.removeAttribute("aria-disabled"); name.removeAttribute("tabindex"); }
    else { name.removeAttribute("href"); name.setAttribute("aria-disabled", "true"); name.setAttribute("tabindex", "-1"); }
    name.classList.toggle("is-off", !p.url);
    name.setAttribute("aria-label", p.url ? `${tx(p.name)}, ${t("visitWebsite").toLowerCase()} (${t("opensNewTab")})` : `${tx(p.name)}, ${t("notPublished").toLowerCase()}`);
    cta.textContent = t("viewProject");
    cta.setAttribute("aria-label", `${t("viewProject")}: ${tx(p.name)}`);
    live.textContent = `${tx(p.name)}, ${tx(p.type)}`;
  };
  cta.addEventListener("click", () => onOpen(index));
  onLang(() => { if (index >= 0) fill(index); });

  return {
    el,
    /** o projeto da vez mudou: o nome troca deslizando */
    set(i: number) {
      if (i === index) return;
      const was = index;
      index = i;
      if (reduced || was < 0) { fill(i); return; }
      gsap.to(text, { yPercent: -110, opacity: 0, duration: 0.18, ease: "power2.in", overwrite: true, onComplete: () => { fill(index); gsap.fromTo(text, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.32, ease: "power3.out" }); } });
    },
    /** a cada quadro: aparece (want) no canto (ax, ay); dock: o lugar fixo dela na sala (VP-113), pelo tamanho dela */
    frame(dt: number, want: boolean, ax: number, ay: number, dock?: ((w: number, h: number) => { x: number; y: number }) | null) {
      alpha = damp(alpha, want ? 1 : 0, 10, dt);
      el.classList.toggle("is-on", alpha > 0.01);
      if (want) {
        const w = el.offsetWidth, hh = el.offsetHeight;
        let tx2: number, ty: number;
        if (dock) ({ x: tx2, y: ty } = dock(w, hh));
        else {
          tx2 = ax - w * 0.64; ty = ay - hh / 2;
          tx2 = Math.min(innerWidth - w - 12, Math.max(12, tx2));
          ty = Math.min(innerHeight - hh - 12, Math.max(64, ty));
        }
        if (first) { x = tx2; y = ty; first = false; }
        x = damp(x, tx2, 14, dt); y = damp(y, ty, 14, dt);
      }
      el.style.opacity = alpha.toFixed(3);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${(0.92 + alpha * 0.08).toFixed(3)})`;
    },
    index: () => index,
  };
}
