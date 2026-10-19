/* ════════════════════════════════════════════════════════════════════
   OS DOIS IDIOMAS (VP-01, 16/out/2026): inglês, como as telas, e
   português. A escolha vem do endereço (?lang=pt, ou o /pt da frente: VP-101),
   depois do que a pessoa
   escolheu antes (guardado neste navegador) e, na primeira visita, da
   língua do navegador.

   Os textos curtos da interface estão aqui (DICT); os longos, nos
   arquivos de cada projeto (content/projects/*.md) e em data/site.ts.
   Quem desenha texto na tela registra uma função em onLang(): ela roda de
   novo a cada troca. A troca é animada em ui/langswitch.ts.
════════════════════════════════════════════════════════════════════ */
import type { Lang, Text2 } from "../content/parse";

export type { Lang };

const DICT = {
  en: {
    index: "Index", profile: "Profile", contact: "Contact",
    backToGallery: "Vitor Petri, back to the gallery",
    viewProject: "View project", listen: "Listen", pause: "Pause",
    getInTouch: "Get in touch!", socials: "Socials",
    loading: "Loading the gallery",
    filterProjects: "Filter the projects", indexTitle: "Index of projects", search: "Search", searchLabel: "Search by name, type or technology", noResults: "Nothing found.",
    all: "All", websites: "Websites", design: "Design", experiments: "Experiments", music: "Music",
    visit: "Visit", private: "Private", opensNewTab: "opens in a new tab",
    role: "Role", type: "Type", stack: "Stack", year: "Year", instrumentation: "Instrumentation", duration: "Duration",
    visitWebsite: "Visit website", notPublished: "Not published yet", recording: "Recording",
    process: "Process",
    previous: "Previous", next: "Next",
    closeIndex: "Close the index", closeProfile: "Close the profile", closeProject: "Close the project", close: "Close",
    hint: "Scroll or drag", hintKeys: "? for the shortcuts",
    shortcuts: "Shortcuts",
    kNext: "next project", kOpen: "open the project", kIndex: "index", kProfile: "profile", kContact: "contact",
    kLang: "português", kSound: "sound on or off", kRoom: "the room", kClose: "close", kHelp: "this list",
    sound: "Sound", soundOn: "Sound on", soundOff: "Sound off",
    room: "Room", queue: "Queue", roomOn: "Walk the room", roomOff: "Back to the queue",
    lang: "PT", langLabel: "Ler em português",
    skipToIndex: "Skip to the index of projects",
    view: "View", go: "Go",
    noGpu: "This browser has neither WebGPU nor WebGL2: here is the index.",
    profileArt: "Three of my pieces",
    galleryLabel: "The gallery of projects",
  },
  pt: {
    index: "Índice", profile: "Perfil", contact: "Contato",
    backToGallery: "Vitor Petri, de volta à galeria",
    viewProject: "Ver projeto", listen: "Ouvir", pause: "Pausar",
    getInTouch: "Fale comigo!", socials: "Redes",
    loading: "Carregando a galeria",
    filterProjects: "Filtrar os projetos", indexTitle: "Índice dos projetos", search: "Buscar", searchLabel: "Buscar por nome, tipo ou tecnologia", noResults: "Nada encontrado.",
    all: "Todos", websites: "Sites", design: "Design", experiments: "Experimentos", music: "Música",
    visit: "Visitar", private: "Privado", opensNewTab: "abre em outra aba",
    role: "Função", type: "Tipo", stack: "Tecnologias", year: "Ano", instrumentation: "Formação", duration: "Duração",
    visitWebsite: "Visitar o site", notPublished: "Ainda não publicado", recording: "Gravação",
    process: "Processo",
    previous: "Anterior", next: "Próximo",
    closeIndex: "Fechar o índice", closeProfile: "Fechar o perfil", closeProject: "Fechar o projeto", close: "Fechar",
    hint: "Role ou arraste", hintKeys: "? para os atalhos",
    shortcuts: "Atalhos",
    kNext: "próximo projeto", kOpen: "abrir o projeto", kIndex: "índice", kProfile: "perfil", kContact: "contato",
    kLang: "English", kSound: "ligar ou desligar o som", kRoom: "a sala", kClose: "fechar", kHelp: "esta lista",
    sound: "Som", soundOn: "Som ligado", soundOff: "Som desligado",
    room: "Sala", queue: "Fila", roomOn: "Andar pela sala", roomOff: "Voltar à fila",
    lang: "EN", langLabel: "Read in English",
    skipToIndex: "Pular para o índice dos projetos",
    view: "Ver", go: "Ir",
    noGpu: "Este navegador não tem WebGPU nem WebGL2: aqui está o índice.",
    profileArt: "Três peças minhas",
    galleryLabel: "A galeria dos projetos",
  },
} as const;

export type Key = keyof typeof DICT.en;
const KEY = "vp-lang";

function initial(): Lang {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "pt" || q === "en") return q;
  /* VP-101: as páginas em português moram em /pt */
  if (/^\/pt(\/|$)/.test(location.pathname)) return "pt";
  try {
    const s = localStorage.getItem(KEY);
    if (s === "pt" || s === "en") return s;
  } catch { /* sem armazenamento: segue */ }
  return (navigator.languages ?? [navigator.language]).some((l) => l?.toLowerCase().startsWith("pt")) ? "pt" : "en";
}

let lang: Lang = initial();
const subs = new Set<(l: Lang) => void>();
document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

export const getLang = () => lang;
export const t = (k: Key): string => DICT[lang][k];
/** um texto das duas línguas, na língua de agora */
export const tx = (v: Text2 | undefined): string => (v ? v[lang] || v.en : "");
/** um campo que existe nas duas línguas como lista de parágrafos */
export const tp = (v: { en: string[]; pt: string[] } | undefined): string[] => (v ? (v[lang].length ? v[lang] : v.en) : []);

/** Roda fn agora e de novo a cada troca de idioma. */
export function onLang(fn: (l: Lang) => void) {
  subs.add(fn);
  fn(lang);
  return () => subs.delete(fn);
}

/** Troca de verdade (quem anima é ui/langswitch.ts). */
export function applyLang(l: Lang) {
  if (l === lang) return;
  lang = l;
  try { localStorage.setItem(KEY, l); } catch { /* sem armazenamento */ }
  document.documentElement.lang = l === "pt" ? "pt-BR" : "en";
  /* o ?lang= do endereço deixaria de valer: sai */
  const u = new URL(location.href);
  if (u.searchParams.has("lang")) { u.searchParams.delete("lang"); history.replaceState(history.state, "", u); }
  for (const fn of subs) fn(l);
}
