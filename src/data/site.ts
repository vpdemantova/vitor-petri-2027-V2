/* O perfil e o contato (10/out/2026; em português e inglês desde a V2,
   16/out/2026). Os textos são os do site vitordemantova.com
   (data/profile.ts, ABOUT) e os canais, os de lib/constants.ts de lá
   (SOCIALS, com o WhatsApp: VP-06). Nada novo inventado aqui.
   A ordem das redes segue a de lá: "coloque sempre o Behance antes"
   (09/out/2026). */
import type { Text2 } from "../content/parse.ts";

export const SITE = {
  name: "Vitor Petri",
  /** o endereço público (as prévias de compartilhamento precisam dele inteiro) */
  url: "https://vitor-petri-2027-v2.vercel.app",
  /** o lugar e as coordenadas, no formato da tela de abertura:
      22°54′ S, 47°03′ W → "22.54.4703.39" (graus e minutos da latitude,
      graus e minutos da longitude, segundos) */
  place: "Campinas",
  coords: "22.54.4703.39",
  coordsTitle: "22°54′ S, 47°03′ W",
  email: "vpdemantova@gmail.com",
  whatsapp: { href: "https://wa.me/5547988219219", label: "+55 47 98821-9219" },
  socials: [
    { label: "Behance", href: "https://www.behance.net/vitordemantova" },
    { label: "Dribbble", href: "https://dribbble.com/vpdemantova" },
    { label: "Instagram", href: "https://www.instagram.com/vpdemantova/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/vitor-demantova-a31b42193/" },
    { label: "X", href: "https://x.com/vpdemantova" },
    { label: "YouTube", href: "https://www.youtube.com/@vitordemantova" },
  ],
};

export const PROFILE: { body: Text2[]; aside: Text2[] } = {
  /* o texto grande, à esquerda, em serifa */
  body: [
    {
      en: "I am Vitor P. Demantova, from Campinas, Brazil. I work with music, design, photography and writing.",
      pt: "Sou Vitor P. Demantova, de Campinas. Trabalho com música, design, fotografia e escrita.",
    },
    {
      en: "I tune pianos, I am a luthier of string instruments, I compose for piano, chamber ensembles and orchestra, I conduct and I perform.",
      pt: "Afino pianos, sou luthier de instrumentos de corda, componho para piano, câmara e orquestra, rejo e toco.",
    },
    {
      en: "I design logos, posters, interfaces and websites, from the drawing to the code. I photograph nature, activism, events and portraits, from the ground and from the air. I write criticism, philosophy and poems.",
      pt: "Desenho marcas, cartazes, interfaces e sites, do desenho ao código. Fotografo natureza, ativismo, eventos e retratos, do chão e do ar. Escrevo crítica, filosofia e poemas.",
    },
  ],
  /* as duas linhas embaixo, à direita */
  aside: [
    { en: "Signs that lift the soul:", pt: "Signos que elevam a alma:" },
    { en: "that is what I look for in all of it.", pt: "é o que procuro em tudo isso." },
  ],
};

/* a composição do perfil: três peças dele, de verdade (e o retrato, VP-02,
   quando houver um media/perfil/retrato.jpg: ver o script de imagens) */
export const PROFILE_ART: { img: string; alt: Text2; caption: string }[] = [
  { img: "dimensional-heritage", alt: { en: "Herança Dimensional, a geometric mandala", pt: "Herança Dimensional, uma mandala geométrica" }, caption: "Herança Dimensional" },
  { img: "sun-lettering", alt: { en: "De tanta luz dói olhar pro sol, a type poster", pt: "De tanta luz dói olhar pro sol, um cartaz tipográfico" }, caption: "De tanta luz…" },
  { img: "poster-ccg", alt: { en: "Conservatório Carlos Gomes, a poster", pt: "Conservatório Carlos Gomes, um cartaz" }, caption: "Carlos Gomes" },
];
