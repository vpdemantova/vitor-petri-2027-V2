# Vitor Petri · V2

O portfólio **Vitor Petri**, construído a partir das sete telas de referência do design "Whizbigg" (logotipo, Preloader, Home / Gallery, Project, Index e Profile), com o nome trocado e os projetos de verdade dele. A V1 é de 11/out/2026 e continua em `~/www/vitor-petri-2027`. Esta V2, de 16/out/2026, é a cópia dela, com o histórico, que passou por todas as tarefas do `TAREFAS.md`. Em 19/out/2026 a V2 ganhou, já no Windows (`D:\www\vitor-petri-2027-V2`), a segunda rodada: as páginas em português (`/pt`), os vídeos nos cartões dos sites, o DRIFT, a sala no celular, a abertura mais rápida no celular e o GitHub Actions.

- **No ar:** https://vitor-petri-2027-v2.vercel.app (um push na `main` publica; antes, a Vercel confere os tipos, o lint e os testes).
- **Código:** https://github.com/vpdemantova/vitor-petri-2027-V2
- **O que foi feito, o que falta e como pedir:** `TAREFAS.md`.

> **Este é um projeto à parte.** O "Portfólio do zero" (o repositório público em que o Vitor digita o código e a IA só orienta) continua sendo dele, com o guia em `blessednotebook/2 Academy/0 Aulas…/Portfólio do zero — guia e estatutos.md`. Este aqui foi construído inteiro pela IA, a pedido dele, e pode servir de referência.

## Rodar

```
npm install
npm run dev        # http://localhost:5190
npm run check      # tipos, lint e os testes (o mesmo que a Vercel e o GitHub rodam)
npm run build      # gera dist/, com uma página por projeto, o sitemap e o robots
npm run preview    # serve o dist/ em http://localhost:5191
npm run images     # refaz public/img, public/og e os ícones a partir de media/ (só o que mudou; -- --tudo refaz tudo)
npm run analise    # o mapa do pacote em dist/stats.html
npm run videos     # regrava os laços dos cartões (public/video), dos sites no ar; ver o cabeçalho de scripts/gravar-videos.mjs
```

No fim do endereço:
- `?lang=pt` ou `?lang=en`;
- `?webgl`, que força o WebGL2;
- `?semabertura`;
- `?semefeitos`, sem o pós-processamento;
- `?hora=18`, que finge a hora de Campinas;
- `?arrasto=1.3`, o arrasto mais sensível;
- `?ref=3`, o modo comparação (as telas ficam em `ref/`, fora do git: ver a VP-94);
- `?semvideo`, só as fotos nos cartões;
- `?alternado`, os cartões de trás alternando os cantos, como antes da VP-109.

## O que tem

| Tela de referência | Aqui |
|---|---|
| Logotipo | `VITOR PETRI` desenhado letra por letra no estilo do WHIZBIGG (`src/ui/wordmark.ts`) |
| Preloader | As coordenadas de Campinas, que "digitam", e o logotipo grande. Ele se forma de partículas enquanto as imagens chegam (sem placa de vídeo, se enche de baixo para cima) e depois voa até o canto. Vem pronto no HTML, para pintar antes do JavaScript |
| Home / Gallery | Os 22 projetos como cartões em profundidade, no brilho lavanda (nos cinco sites com laço gravado, o cartão da vez vira vídeo quando a fila para); a etiqueta "Nome ↗ · VIEW PROJECT" presa ao canto do cartão da vez; o botão "Contact"; no pé, o contador, a Sala, o Som e o idioma |
| Project | O vidro claro com nome, ROLE / TYPE / STACK / YEAR, VISIT WEBSITE, a descrição, anterior e próximo, e as imagens rolando. Nasce do retângulo do cartão. Nas obras de música, o tocador e a capa desenhada |
| Index | O painel branco com os filtros (All, Websites, Design, Experiments, Music), que valem também para a galeria, a busca e a tabela. A linha sob o mouse leva a galeria até aquele projeto |
| Profile | O texto em serifa à esquerda, a composição com três peças dele (o retrato entra no meio, quando houver) e as duas linhas embaixo à direita |
| Contact | A pílula vira o cartão "Get in touch!", com o e-mail, o WhatsApp e as redes |

Além das telas:
- o português, no botão PT/EN, com a troca animada;
- a sala (R): a fila vira um corredor;
- o som (S): uma nota por cartão e a prévia da gravação;
- o cursor próprio;
- a dica da primeira visita;
- os atalhos (?);
- o modo comparação (`?ref=N`).

Endereços: `/index`, `/profile` e `/project/<id>`, e os mesmos em português com `/pt` na frente (`/pt/project/<id>`). Cada um tem a sua página gerada no build, na língua dele, com os links `hreflang` para a outra. Trocar a língua troca o `/pt` do endereço. O voltar do navegador funciona, e os links antigos, com `#/`, continuam valendo.

Teclado e acessibilidade:
- as setas (ou PageUp e PageDown) passam de projeto, e Enter abre o da vez; na ficha, ← e → passam de ficha;
- I, P, C, R, S, L e ? abrem o índice, o perfil, o contato, a sala, o som, a língua e os atalhos;
- os painéis são diálogos: o Tab fica dentro, Esc fecha e o foco volta para onde estava;
- o primeiro Tab mostra "pular para o índice";
- um leitor de tela ouve o nome do projeto da vez;
- com "reduzir movimento", nada dobra nem flutua, e não há partículas nem grão animado;
- o axe-core não acha nenhum problema, e o Lighthouse dá 100 em acessibilidade.

## De onde saíram as medidas

As telas foram **medidas**, não copiadas a olho.

- **O logotipo.** As letras do WHIZBIGG foram lidas pixel a pixel numa imagem de 3840 × 2160. Na unidade em que a altura das letras vale 1000:
  - hastes de 174;
  - barras de 76;
  - miolos de uns 100;
  - cantos de fora de uns 110, com as curvas passando um pouco da linha;
  - o entalhe no meio do B;
  - espaço de uns 100 entre as letras.

  As letras que o WHIZBIGG não tem saem dessas regras:
  - V: as diagonais com a largura da diagonal do Z;
  - T: a barra do Z sobre a haste do I;
  - O: o G sem a abertura;
  - R: o B com a barriga de baixo aberta;
  - P: a barriga de cima do B;
  - E: a haste do B com três barras.
- **O brilho do fundo.** Medido em 41 pontos em cada eixo: é uma elipse que encosta nas quatro bordas da tela, e a cor cai em linha reta de `#878EE9` no centro até o preto na borda. Está igual no shader (`src/gl/backdrop.ts`) e no CSS por baixo, para a página nunca nascer preta.
- **As letras** (todas livres, do Google Fonts):
  - **Cormorant Garamond** no menu, nas coordenadas e no itálico das etiquetas;
  - **Young Serif** no texto do Perfil: foi a única candidata, entre oito comparadas lado a lado com a tela, com o "a" de um bojo só;
  - **Lato** no resto.
- **As distâncias.** Os quadros 16:9 foram levados a 1920 px de largura. Cada número no CSS é "px numa tela de 1920" (`calc(N * var(--u))`) e escala com a janela. Abaixo de 760 px, há outro jogo de medidas para o celular.

Diferenças em relação às telas:
- **Os nomes dos projetos são mais longos** que os das telas: no Índice, eles terminam em "…" e o nome inteiro aparece ao passar o mouse.
- **O Perfil:** onde a tela diz "Beautiful composition, images and texts here", entrou uma composição com três peças dele.
- **Projeto não publicado:** no lugar do link, aparece "Private" no Índice e "Not published yet" na ficha.
- **Cinco filtros** (as telas tinham quatro): a letra deles é um pouco menor, para caberem antes do ×.
- **O cartão de contato** é mais largo que o das telas, para o e-mail e o WhatsApp caberem numa linha cada.
- **O cinza dos valores** é mais escuro que o das telas, porque o delas não passava no contraste (ver a VP-11 no `TAREFAS.md`).

## As técnicas

- **WebGPU, com WebGL2 de reserva.** O `WebGPURenderer` do three.js escolhe o motor. Os materiais são escritos em **TSL** (a linguagem de nós do three), que vira WGSL no WebGPU e GLSL no WebGL2: o mesmo código nos dois.
- **A galeria** (`src/gl/gallery.ts`; as contas puras em `src/gl/math.ts`, com testes):
  - **a fila:** os cartões ao longo do eixo da câmera, sem fim. O da vez fica no foco; os de trás ficam menores, mais escuros e um pouco desfocados (um mipmap mais alto). Desde 20/out (VP-109), numa direção só: os de trás todos em cima à direita, cada um mais longe, e o que passou desce para a esquerda (`laneOffset` em `src/gl/math.ts`); o desenho de antes, com os cantos alternados, continua em `?alternado`;
  - **a rolagem:** persegue o alvo com uma **mola criticamente amortecida**. Parada, ela **encaixa** no cartão mais perto. A roda e o arrasto decidem (VP-108, `src/core/gesture.ts`): cada gesto anda pelo menos um cartão inteiro na direção dele, e nunca volta sozinho;
  - **a velocidade:** entra nos shaders. O cartão **dobra** e as cores **se separam** nas bordas; ao assentar, um **anel** sai do centro da imagem;
  - **os filtros:** a fila se refaz só com a categoria;
  - **a sala:** a mesma fila, nas paredes de um corredor (no celular, o da vez sai da parede para o meio);
  - **os vídeos:** nos cartões com laço, uma segunda textura (`VideoTexture`) entra num fade sobre a foto quando a fila para; o vídeo só baixa quando o cartão vira a vez e pausa ao sair;
  - **os cantos:** arredondados pela distância até a borda, no próprio shader.
- **O fundo** (`src/gl/backdrop.ts`): o brilho medido, com pontilhado contra os degraus de 8 bits. Na abertura, acende do centro para fora; depois, muda de tom com a hora de Campinas (`src/gl/hour.ts`) e puxa de leve para o tom do cartão da vez.
- **O pós-processamento** (`src/gl/post.ts`): o bloom só com o gesto e um grão de filme fino.
- **As partículas da abertura** (`src/gl/particles.ts`): um compute shader em TSL (compute de verdade no WebGPU, transform feedback no WebGL2).
- **Imagens fora da linha principal.** O `ImageBitmapLoader` decodifica com `createImageBitmap`, com mipmaps e filtro anisotrópico. Primeiro vêm os quatro cartões perto da vez; o resto chega depois. No celular, os cartões vêm em 800 px (`<nome>-m.webp`).
- **A primeira pintura** (VP-99): a abertura vem pronta no HTML e o JavaScript não a mexe de lugar (mexer a fazia pintar de novo, e a "maior pintura" ia para depois do JavaScript); os materiais compilam antes do primeiro quadro (`compileAsync`).
- **Resolução adaptativa:** se o quadro passa de 20 ms por um segundo, a densidade de pixels baixa um degrau; com folga, sobe de volta. O laço para quando a aba some.
- **O 3D em pedaço separado:** a interface aparece na hora, e o three.js (uns 241 KB compactados) chega em seguida.
- **O som** (`src/core/sound.ts`): Web Audio, sem arquivos, desligado por padrão.
- **As animações da interface** são do GSAP:
  - o voo do logotipo (FLIP);
  - o Índice que sobe;
  - o Perfil que se abre de dentro para fora;
  - a ficha que nasce do cartão;
  - a pílula do contato que vira cartão;
  - o nome da etiqueta, que troca deslizando.

## Pôr um projeto

1. A imagem vai para `media/sites/` (uma captura de 1440 × 900 e, se quiser, a página inteira como `<nome>-full.jpg`) ou para `media/design/` (o arquivo da peça). As obras de música não precisam de imagem: a capa é desenhada.
2. `npm run images`, que gera a imagem do site, a prévia de compartilhamento e a cor do cartão.
3. Um arquivo em `content/projects/`, com o número do lugar na fila no começo do nome (`055-meu-projeto.md` entra entre o 050 e o 060):

```
---
name: Meu projeto
category: websites          (websites · design · experiments · music)
type: Personal website
type.pt: Site pessoal       (".pt" é o português; sem ela, vale o inglês)
role: Design & development
role.pt: Design e desenvolvimento
stack: Next.js, Three.js
year: 2026                  (só se for sabido)
url: https://…              (sem endereço: "não publicado")
card: meu-projeto           (a imagem do cartão, sem o .webp)
shots: meu-projeto, meu-projeto-full
video: meu-projeto          (opcional: public/video/meu-projeto.mp4, um laço de 8 s; ver npm run videos)
source: de onde saiu cada dado (não aparece no site)
---
O texto em inglês.

<!-- pt -->
O texto em português.
```

   Na música, em vez de `card` e `shots`: `instrumentation:` (e `instrumentation.pt:`) e, se houver gravação, `audio: /audio/<arquivo>.mp3` e `duration:`. Um trecho `<!-- process -->` (e `<!-- process.pt -->`) vira a seção "Processo" da ficha.
4. `npm run check`. Os testes conferem que:
   - a imagem existe;
   - o ano é um ano;
   - as duas línguas estão lá;
   - a linha `source:` foi escrita.

**Regra: nada inventado.** Ano, função e tecnologias só entram quando são sabidos; o que falta fica vazio, e a interface esconde o campo.

## Pastas

```
content/projects/   os projetos, um arquivo cada (a ordem é o número do nome)
media/              as imagens originais (capturas, peças de design, o retrato)
public/img/         as imagens do site, em WebP (geradas)
public/og/          as prévias de compartilhamento (geradas)
public/audio/       a gravação da Chanson Antique
public/video/       os laços dos cartões (gerados por npm run videos)
scripts/            prepare-images.mjs (as imagens; imagens-feitas.json guarda o que já está em dia), gravar-videos.mjs (os vídeos)
.github/workflows/  ci.yml: a conferência a cada envio (VP-98)
ref/                as telas de referência do modo comparação (fora do git e do site: VP-94)
src/main.ts         liga as peças
src/core/           router (os endereços), paths (o /pt, também usado pelo build), i18n (as línguas), input (roda, dedo, teclado), gesture (as contas da roda e do arrasto), sound
src/content/        parse (o leitor do Markdown, também usado pelo build), projects
src/gl/             stage, backdrop, gallery, post, particles, math, hour
src/ui/             wordmark, preloader, intro, label, contact, panels, foot, cursor, shortcuts, compare, langswitch, musiccard, dom
src/data/           site (o perfil e o contato), image-sizes.json (gerado)
src/styles/         app.css
vite.config.ts      o build e as páginas de cada projeto
vercel.json         o build na Vercel, os endereços e o cache
```
