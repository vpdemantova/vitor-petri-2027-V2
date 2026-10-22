/* ════════════════════════════════════════════════════════════════════
   O CONTATO: a pílula "Contact" vira o cartão "Get in touch!", com o
   e-mail, o WhatsApp (VP-06) e as redes (a ordem do vitordemantova.com:
   o Behance antes). Fecha com Esc, com um clique fora ou de novo na pílula.

   VP-120 (21/out/2026, "um botão de fechar no de contato, deixe esse menu
   um pouquinho maior pra caber com mais respiro"; e "as animações estão
   bem ruins ainda"):
   · um botão de fechar (×) no canto, como nos painéis;
   · o cartão maior, com mais respiro (as medidas estão no app.css);
   · a abertura é a pílula virando o cartão de verdade: o cartão nasce
     recortado exatamente no formato da pílula (clip-path, sem esticar: os
     cantos não deformam), cresce até o tamanho dele e o texto entra
     depois; ao fechar, o caminho de volta, e a pílula reaparece no fim.
     A pílula fica por cima enquanto o nome dela some, para não piscar.
     O recorte é calculado aqui a cada quadro, a partir de um número só
     (0 = a pílula, 1 = o cartão): o navegador abrevia o clip-path
     ("inset(0px round …)") e a interpolação de texto do GSAP pulava.
     Interrompível: abrir no meio do fechamento continua de onde está.
   VP-127 (22/out/2026, "a animação dos cards… meio fracos"): o conteúdo entra
   em cascata, uma linha e uma rede de cada vez, subindo, e o × entra girando.
════════════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import { SITE } from "../data/site";
import { t, onLang } from "../core/i18n";
import { h, ARROW, CROSS } from "./dom";

export function createContact(reduced: boolean) {
  const pill = h("button", { class: "contact-pill", type: "button", "aria-expanded": "false", "aria-controls": "contact-card" });
  const close = h("button", { class: "close contact-close", type: "button", html: CROSS });
  const kick = h("p", { class: "contact-kick" });
  const mail = h("a", { class: "contact-mail", href: `mailto:${SITE.email}` }, SITE.email);
  const wa = h("a", { class: "contact-wa", href: SITE.whatsapp.href, target: "_blank", rel: "noopener noreferrer" }, h("span", { class: "contact-wa-k" }, "WhatsApp"), h("span", {}, SITE.whatsapp.label));
  wa.insertAdjacentHTML("beforeend", ARROW);
  const socialsK = h("p", { class: "contact-socials-k" });
  const socials = h("ul", { class: "contact-socials" }, ...SITE.socials.map((s) => h("li", {}, h("a", { href: s.href, target: "_blank", rel: "noopener noreferrer" }, s.label))));
  const card = h("aside", { class: "contact-card", id: "contact-card" }, close, kick, mail, wa, socialsK, socials);
  /* o que entra e sai em cascata (o texto e o ×) */
  /* o que entra e sai em cascata: cada linha e cada rede (VP-127), e o × à parte */
  const items: HTMLElement[] = [kick, mail, wa, socialsK, ...(Array.from(socials.children) as HTMLElement[])];
  const all = [...items, close];
  onLang(() => {
    pill.textContent = t("contact");
    card.setAttribute("aria-label", t("contact"));
    kick.textContent = t("getInTouch");
    socialsK.textContent = t("socials");
    wa.setAttribute("aria-label", `WhatsApp ${SITE.whatsapp.label} (${t("opensNewTab")})`);
    close.setAttribute("aria-label", t("close"));
    close.title = `${t("close")} (Esc)`;
  });

  /* a metamorfose: k = 0 é o cartão recortado no formato da pílula; k = 1, o cartão inteiro */
  const morph = { k: 0 };
  let geo = { t: 0, r: 0, b: 0, l: 0, pr: 0, cr: 0 };
  /** as distâncias da pílula às bordas do cartão (os dois no mesmo canto de baixo à esquerda) e os dois raios */
  const measure = () => {
    const c = card.getBoundingClientRect(), p = pill.getBoundingClientRect();
    geo = {
      t: Math.max(0, p.top - c.top), r: Math.max(0, c.right - p.right), b: Math.max(0, c.bottom - p.bottom), l: Math.max(0, p.left - c.left),
      pr: p.height / 2, cr: parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0,
    };
  };
  const paint = () => {
    const k = morph.k, i = 1 - k, f2 = (v: number) => v.toFixed(2);
    card.style.clipPath = `inset(${f2(geo.t * i)}px ${f2(geo.r * i)}px ${f2(geo.b * i)}px ${f2(geo.l * i)}px round ${f2(geo.pr + (geo.cr - geo.pr) * k)}px)`;
  };

  let open = false;
  const isOpen = () => open;
  function toggle(want: boolean) {
    if (want === open) return;
    open = want;
    pill.setAttribute("aria-expanded", String(want));
    gsap.killTweensOf([card, pill, morph, ...all]);
    if (want) {
      const wasHidden = !card.classList.contains("is-open");
      card.classList.add("is-open");
      if (reduced) {
        morph.k = 1; card.style.clipPath = ""; gsap.set(all, { clearProps: "opacity,transform" });
        gsap.set(pill, { opacity: 0, pointerEvents: "none" });
      } else {
        measure();
        if (wasHidden) { morph.k = 0; gsap.set(items, { opacity: 0, y: 22 }); gsap.set(close, { opacity: 0, rotate: -90, scale: 0.6 }); }
        paint();
        /* a pílula fica por cima enquanto o nome dela some: o cartão cresce por baixo dela, da mesma cor */
        pill.classList.add("is-morph");
        gsap.to(pill, { opacity: 0, duration: 0.18, ease: "power1.out", onComplete: () => { pill.classList.remove("is-morph"); gsap.set(pill, { pointerEvents: "none" }); } });
        gsap.to(morph, { k: 1, duration: 0.78, ease: "expo.out", onUpdate: paint, onComplete: () => { card.style.clipPath = ""; } });
        gsap.to(items, { opacity: 1, y: 0, duration: 0.75, stagger: 0.04, delay: 0.14, ease: "expo.out", clearProps: "transform" });
        gsap.to(close, { opacity: 1, rotate: 0, scale: 1, duration: 0.7, delay: 0.3, ease: "expo.out", clearProps: "transform" });
      }
      mail.focus({ preventScroll: true });
    } else {
      const done = () => { card.classList.remove("is-open"); card.style.clipPath = ""; morph.k = 0; gsap.set(all, { clearProps: "opacity,transform" }); };
      if (reduced) { done(); gsap.set(pill, { opacity: 1, pointerEvents: "auto" }); }
      else {
        measure(); paint();
        gsap.to([...items].reverse(), { opacity: 0, y: -10, duration: 0.18, stagger: 0.012, ease: "power2.in" });
        gsap.to(close, { opacity: 0, rotate: 90, scale: 0.7, duration: 0.2, ease: "power2.in" });
        gsap.to(morph, { k: 0, duration: 0.55, delay: 0.08, ease: "expo.inOut", onUpdate: paint, onComplete: done });
        /* no fim do caminho, a pílula volta por cima, já no lugar */
        pill.classList.add("is-morph");
        gsap.to(pill, { opacity: 1, duration: 0.2, delay: 0.46, ease: "power1.out", onComplete: () => { pill.classList.remove("is-morph"); gsap.set(pill, { pointerEvents: "auto" }); } });
      }
      pill.focus({ preventScroll: true });
    }
  }
  pill.addEventListener("click", () => toggle(true));
  close.addEventListener("click", () => toggle(false));
  document.addEventListener("pointerdown", (e) => {
    if (open && !card.contains(e.target as Node) && e.target !== pill) toggle(false);
  });
  /* o Tab que sai do cartão fecha ele (não fica um cartão aberto atrás do foco) */
  card.addEventListener("focusout", (e) => { if (open && !card.contains(e.relatedTarget as Node) && e.relatedTarget && e.relatedTarget !== pill) toggle(false); });
  return { pill, card, toggle, isOpen };
}
