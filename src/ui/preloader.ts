/* O miolo da abertura: as coordenadas e o logotipo grande (fantasma e
   enchimento). O mesmo HTML vai no index.html do build (vite.config.ts),
   para a abertura pintar antes do JavaScript, e serve ao ui/intro.ts
   quando não veio pronto. Sem nada de navegador aqui. */
import { SITE } from "../data/site.ts";
import { wordmarkSVG } from "./wordmark.ts";

/** O miolo da abertura (o mesmo no HTML do build e aqui). */
export function preloaderHtml() {
  return `<p class="pre-coords" title="${SITE.coordsTitle}"><span class="pre-place">${SITE.place}</span><span class="pre-num">${SITE.coords}</span></p>` +
    `<div class="pre-mark" aria-hidden="true"><div class="pre-ghost">${wordmarkSVG("")}</div><div class="pre-fill">${wordmarkSVG("")}</div></div>` +
    `<span class="sr-only">Loading the gallery</span>`;
}
