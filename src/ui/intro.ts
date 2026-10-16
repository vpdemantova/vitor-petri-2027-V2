/* ════════════════════════════════════════════════════════════════════
   A ABERTURA ("Preloader"): as coordenadas de Campinas e o logotipo
   grande, que se enche enquanto as imagens chegam e depois voa até o
   canto (FLIP: mede onde ele está e para onde vai).

   Com mais assinatura desde a V2 (VP-14, 16/out/2026):
   · as coordenadas "digitam": cada algarismo sorteia até acertar, da
     esquerda para a direita;
   · as letras chegam uma a uma, cada uma caindo no lugar;
   · o brilho acende do centro para fora (gl/backdrop, setSpread);
   · com a placa de vídeo, o enchimento é de partículas (gl/particles,
     VP-32); sem ela, o SVG se enche de baixo para cima, como antes.
   Com "reduzir movimento", tudo aparece parado e a abertura é curta.
════════════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import { SITE } from "../data/site";
import { t, onLang } from "../core/i18n";
import { wordmarkSVG } from "./wordmark";
import { h } from "./dom";

export function createIntro(reduced: boolean) {
  const mark = h("div", { class: "pre-mark", "aria-hidden": "true" },
    h("div", { class: "pre-ghost", html: wordmarkSVG("") }),
    h("div", { class: "pre-fill", html: wordmarkSVG("") }));
  const place = h("span", { class: "pre-place" }, SITE.place);
  const num = h("span", { class: "pre-num" }, SITE.coords);
  const coords = h("p", { class: "pre-coords", title: SITE.coordsTitle }, place, num);
  const sr = h("span", { class: "sr-only" });
  const el = h("div", { class: "preloader", role: "status", "aria-live": "polite" }, coords, mark, sr);
  onLang(() => { sr.textContent = t("loading"); });

  const fill = { p: 0 };
  let particlesOn = false;

  /** o texto que "digita": cada caractere sorteia até acertar */
  const type = (node: HTMLElement, pool: string, delay: number, dur: number) => {
    const to = node.textContent ?? "";
    const at = [...to].map((_, i) => delay + (i / to.length) * dur + Math.random() * 90);
    const t0 = performance.now();
    const tick = (now: number) => {
      const e = now - t0;
      let s = "";
      for (let i = 0; i < to.length; i++) {
        const c = to[i];
        /* antes da vez, um espaço do tamanho de um algarismo; perto dela, um sorteio; na vez, o certo */
        if (e >= at[i]) s += c;
        else if (e >= at[i] - 260) s += /[\dA-Z]/.test(c) ? pool[(Math.random() * pool.length) | 0] : c;
        else s += " ";
      }
      node.textContent = s;
      if (e < delay + dur + 120) requestAnimationFrame(tick); else node.textContent = to;
    };
    requestAnimationFrame(tick);
  };

  return {
    el,
    mark,
    /** a entrada: as coordenadas digitam e as letras caem no lugar */
    start() {
      if (reduced) return;
      type(place, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", 80, 520);
      type(num, "0123456789", 260, 900);
      gsap.from(el.querySelectorAll(".pre-ghost .wm-l"), { y: -320, opacity: 0, duration: 1.1, stagger: 0.055, ease: "expo.out", delay: 0.15 });
      gsap.from(el.querySelectorAll(".pre-fill .wm-l"), { y: -320, duration: 1.1, stagger: 0.055, ease: "expo.out", delay: 0.15 });
    },
    /** com partículas, o enchimento em SVG espera o fim */
    useParticles() { particlesOn = true; el.classList.add("has-particles"); },
    /** 0…1: as imagens que chegaram */
    setProgress(v: number) {
      gsap.to(fill, { p: v, duration: 0.6, ease: "power2.out", overwrite: true, onUpdate: () => mark.style.setProperty("--p", `${(fill.p * 100).toFixed(1)}%`) });
    },
    particles: () => particlesOn,
    /** o fim: o logotipo nítido acende (sobre as partículas) e voa até o lugar do pequeno */
    finish(brand: HTMLElement, onBurst: () => void, then: () => void) {
      const from = mark.getBoundingClientRect();
      const to = brand.getBoundingClientRect();
      const sx = to.width / from.width, sy = to.height / from.height;
      const done = () => { el.remove(); gsap.set(brand, { opacity: 1 }); then(); };
      if (reduced) { done(); return null; }
      gsap.set(brand, { opacity: 0 });
      const tl = gsap.timeline({ onComplete: done });
      if (particlesOn) {
        mark.style.setProperty("--p", "100%");
        tl.fromTo(".pre-fill", { opacity: 0 }, { opacity: 1, duration: 0.32, ease: "power2.out" }, 0)
          .call(onBurst, [], 0.18);
      }
      const t0 = particlesOn ? 0.3 : 0;
      tl.to(".pre-coords", { opacity: 0, y: -12, duration: 0.5, ease: "power2.in" }, t0)
        .to(mark, { x: to.left - from.left, y: to.top - from.top, scaleX: sx, scaleY: sy, transformOrigin: "0 0", duration: 1.15, ease: "expo.inOut" }, t0 + 0.1)
        .to(".pre-ghost", { opacity: 0, duration: 0.4 }, t0 + 0.1);
      return { tl, t0 };
    },
  };
}
