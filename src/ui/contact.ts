/* ════════════════════════════════════════════════════════════════════
   O CONTATO: a pílula "Contact" vira o cartão "Get in touch!", com o
   e-mail, o WhatsApp (VP-06) e as redes (a ordem do vitordemantova.com:
   o Behance antes). Fecha com Esc, com um clique fora ou de novo na pílula.
════════════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import { SITE } from "../data/site";
import { t, onLang } from "../core/i18n";
import { h, ARROW } from "./dom";

export function createContact(reduced: boolean) {
  const pill = h("button", { class: "contact-pill", type: "button", "aria-expanded": "false", "aria-controls": "contact-card" });
  const kick = h("p", { class: "contact-kick" });
  const mail = h("a", { class: "contact-mail", href: `mailto:${SITE.email}` }, SITE.email);
  const wa = h("a", { class: "contact-wa", href: SITE.whatsapp.href, target: "_blank", rel: "noopener noreferrer" }, h("span", { class: "contact-wa-k" }, "WhatsApp"), h("span", {}, SITE.whatsapp.label));
  wa.insertAdjacentHTML("beforeend", ARROW);
  const socialsK = h("p", { class: "contact-socials-k" });
  const card = h("aside", { class: "contact-card", id: "contact-card" },
    kick, mail, wa, socialsK,
    h("ul", { class: "contact-socials" }, ...SITE.socials.map((s) => h("li", {}, h("a", { href: s.href, target: "_blank", rel: "noopener noreferrer" }, s.label)))));
  onLang(() => {
    pill.textContent = t("contact");
    card.setAttribute("aria-label", t("contact"));
    kick.textContent = t("getInTouch");
    socialsK.textContent = t("socials");
    wa.setAttribute("aria-label", `WhatsApp ${SITE.whatsapp.label} (${t("opensNewTab")})`);
  });

  const isOpen = () => card.classList.contains("is-open");
  function toggle(open: boolean) {
    if (open === isOpen()) return;
    pill.setAttribute("aria-expanded", String(open));
    if (open) {
      card.classList.add("is-open");
      if (!reduced) {
        gsap.fromTo(card, { scale: 0.42, opacity: 0, borderRadius: 999 }, { scale: 1, opacity: 1, borderRadius: getComputedStyle(card).borderRadius, duration: 0.7, ease: "expo.out", clearProps: "borderRadius" });
        gsap.fromTo(card.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, delay: 0.12, ease: "power3.out" });
      }
      gsap.to(pill, { opacity: 0, duration: 0.2, pointerEvents: "none" });
      mail.focus({ preventScroll: true });
    } else {
      const done = () => { card.classList.remove("is-open"); gsap.set(card, { clearProps: "all" }); };
      if (reduced) done(); else gsap.to(card, { scale: 0.5, opacity: 0, duration: 0.35, ease: "power3.in", onComplete: done });
      gsap.to(pill, { opacity: 1, duration: 0.3, delay: 0.15, pointerEvents: "auto" });
      pill.focus({ preventScroll: true });
    }
  }
  pill.addEventListener("click", () => toggle(true));
  document.addEventListener("pointerdown", (e) => {
    if (isOpen() && !card.contains(e.target as Node) && e.target !== pill) toggle(false);
  });
  /* o Tab que sai do cartão fecha ele (não fica um cartão aberto atrás do foco) */
  card.addEventListener("focusout", (e) => { if (isOpen() && !card.contains(e.relatedTarget as Node) && e.relatedTarget) toggle(false); });
  return { pill, card, toggle, isOpen };
}
