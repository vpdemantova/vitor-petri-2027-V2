/* ════════════════════════════════════════════════════════════════════
   O MODO COMPARAÇÃO (VP-10, 16/out/2026): ?ref=2 no endereço põe a tela
   de referência 2 por cima do site, meio transparente, para conferir
   medida por medida. Com mix-blend-mode: difference, o que coincide fica
   preto e o que está fora de lugar acende.
   As telas vão em public/ref/1.png … 7.png (ou .jpg, .webp), na ordem do
   README (1 logotipo, 2 abertura, 3 galeria, 4 projeto, 5 índice,
   6 perfil, 7 contato). No teclado: 1–7 troca a tela, D liga e desliga a
   diferença, [ e ] mudam a transparência, 0 esconde.
════════════════════════════════════════════════════════════════════ */
import { h } from "./dom";

export function startCompare() {
  const q = new URLSearchParams(location.search).get("ref");
  if (!q) return;
  let n = Number(q) || 1, op = 0.5, diff = true, hidden = false;
  const img = h("img", { class: "ref-img", alt: "" });
  const info = h("p", { class: "ref-info" });
  document.body.append(img, info);
  const exts = ["png", "jpg", "webp"];
  const load = (i = 0) => {
    img.src = `/ref/${n}.${exts[i]}`;
    img.onerror = () => { if (i + 1 < exts.length) load(i + 1); else info.textContent = `ref ${n}: falta public/ref/${n}.png (ponha as telas de referência lá)`; };
    img.onload = () => paint();
  };
  const paint = () => {
    img.style.opacity = hidden ? "0" : String(op);
    img.style.mixBlendMode = diff ? "difference" : "normal";
    info.textContent = `ref ${n} · ${Math.round(op * 100)}% · ${diff ? "diferença" : "normal"} — 1–7 tela · D diferença · [ ] transparência · 0 esconder`;
  };
  window.addEventListener("keydown", (e) => {
    if ((e.target as HTMLElement).closest("input, textarea")) return;
    if (/^[1-7]$/.test(e.key)) { n = Number(e.key); load(); }
    else if (e.key === "d" || e.key === "D") diff = !diff;
    else if (e.key === "[") op = Math.max(0.05, op - 0.1);
    else if (e.key === "]") op = Math.min(1, op + 0.1);
    else if (e.key === "0") hidden = !hidden;
    else return;
    paint();
  }, true);
  load();
}
