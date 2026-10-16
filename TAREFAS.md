# Vitor Petri V2 — tarefas, prompts, controles e melhorias

> O painel de trabalho deste projeto. Você acrescenta, eu faço (ou guio), e os dois vamos riscando. Criado em 11/out/2026 na V1; a V2 (esta pasta, `vitor-petri-2027-V2`) nasceu em 16/out/2026 como cópia da V1, com o histórico, e passou por todos os itens daqui, um por um. O que existe e como roda está no `README.md`; aqui fica o que foi feito, o que falta e como pedir.

**No ar:** https://vitor-petri-2027-v2.vercel.app · **Código:** https://github.com/vpdemantova/vitor-petri-2027-V2 (público, como o da V1) · **A V1** continua intacta em `~/www/vitor-petri-2027`.

## Como usar

- **Para pedir uma tarefa, diga o número:** "faz a VP-95", "faz as VP-94 a VP-96". O prompt pronto de cada uma está logo abaixo dela; dá para copiar e mudar.
- **Para acrescentar uma ideia:** uma linha na categoria certa, com o próximo número livre (o último em uso está no fim da página). Pode ser em português corrido, do seu jeito; eu completo o porquê e o prompt quando for fazer.
- **Situação de cada uma:**
  - `[ ]` a fazer;
  - `[~]` em parte (o que falta está escrito embaixo);
  - `[x]` feita (com a data);
  - `[-]` descartada (com o motivo).
- **Prioridade:** **P1** faz diferença já, **P2** melhora bem, **P3** quando der.
- **Tamanho:** *pequena* (minutos), *média* (uma sessão), *grande* (várias sessões, ou precisa de decisão sua).
- Quando uma tarefa fica pronta, ela ganha `[x]` e uma linha no **Registro**, no fim.

### O que espera você (nada quebra enquanto isso)

| O quê | Onde | Por quê |
|---|---|---|
| Os anos que faltam | VP-04 | Sem ano, o campo some. Nada é inventado. |
| Uma foto sua | VP-02 | O Perfil já tem o lugar. |
| Testar o arrasto num celular de verdade | VP-24 | O ajuste do dedo só se acerta na mão. |
| As 7 telas de referência | VP-94 | Para o modo comparação ter com o que comparar. |
| O domínio | VP-82 | Decisão sua. |

---

## 1. Controles

### Comandos
| O quê | Comando | Onde |
|---|---|---|
| Rodar no computador | `npm run dev` | http://localhost:5190 |
| Conferir tudo (tipos, lint, testes) | `npm run check` | o mesmo que a Vercel roda a cada envio |
| Só os testes | `npm test` | 42 testes (Vitest) |
| Gerar a versão final | `npm run build` | sai em `dist/`, com uma página por projeto |
| Ver a versão final | `npm run preview` | http://localhost:5191 |
| Refazer as imagens, as prévias e os ícones | `npm run images` | lê `media/`, grava `public/img/`, `public/og/` e os ícones |
| Ver o que pesa no pacote | `npm run analise` | grava `dist/stats.html` |
| Ver no celular, na mesma rede | `npx vite --host` | o endereço "Network" que aparecer |

### No fim do endereço (para conferir)
| | O que faz |
|---|---|
| `?lang=pt` / `?lang=en` | abre na língua pedida |
| `?webgl` | força o WebGL2 (o caminho de quem não tem WebGPU) |
| `?semabertura` | pula a abertura (para conferir e fotografar) |
| `?semefeitos` | desliga o pós-processamento (para comparar) |
| `?hora=18` | finge a hora de Campinas (a cor do brilho, VP-17) |
| `?arrasto=1.3` | o arrasto 30% mais sensível (VP-24) |
| `?ref=3` | o modo comparação com a tela 3 (VP-10) |

### No teclado
`← →` (ou `↑ ↓`) muda de projeto · `Enter` abre · `I` índice · `P` perfil · `C` contato · `R` a sala · `S` o som · `L` a língua · `Esc` fecha · `?` mostra esta lista na tela.

### Antes de dar uma tarefa por pronta
- [ ] `npm run check` e `npm run build` sem erro.
- [ ] Olhar em **1440 px** e em **390 px**, com `?webgl` também, sem rolagem para os lados e sem erro vermelho no console.
- [ ] Só pelo teclado: Tab, setas, Enter e Esc fazem tudo.
- [ ] Com **reduzir movimento** ligado, nada dobra nem flutua, e não há partículas.
- [ ] Nas duas línguas.
- [ ] Nada inventado: ano, função e tecnologia só se forem sabidos, e a linha `source:` do arquivo diz de onde veio.
- Como eu confiro (num Mac): o Chrome sem janela, com a placa de vídeo (`--use-angle=metal`), percorre as telas e fotografa; o axe-core (o motor do Lighthouse) procura problemas de acessibilidade; o Lighthouse mede no endereço público.

### Publicar
- **Um push na `main` publica sozinho** (o projeto `vitor-petri-2027-v2` da Vercel, equipe vitordes-projects, está ligado ao repositório). Antes do build, a Vercel roda `npm run check`: um teste quebrado não vai ao ar.
- Desde 12/out/2026 você autorizou publicar na hora, depois de conferir. Nada de apagar histórico, forçar push ou mexer em domínio sem dizer.

### O que não fazer
- Inventar dado de projeto.
- Mexer no **Portfólio do zero**, que é seu: a IA só guia lá.
- Mexer na V1 (`~/www/vitor-petri-2027`): ela fica como estava.

---

## 2. Conteúdo

- [x] **VP-01** · [P1 · pequena] **Português e inglês.** *16/out/2026.* Tudo existe nas duas línguas: a interface (`src/core/i18n.ts`), os projetos (cada arquivo tem a chave e a chave `.pt`, e o texto depois de `<!-- pt -->`), o Perfil e o contato (`src/data/site.ts`). O botão **PT / EN** fica no pé, à direita (ou a tecla L). A troca é animada como a do vitordemantova.com (`src/ui/langswitch.ts`): os textos sobem desfocando, a língua muda, e os curtos "decodificam". Na primeira visita vale a língua do navegador; depois, a escolhida.
- [~] **VP-02** · [P1 · pequena] **Sua foto no Perfil.** O lugar está pronto: um arquivo `media/perfil/retrato.jpg`, depois `npm run images`, e o retrato vai ao meio da composição, entre a Herança Dimensional e o cartaz do Carlos Gomes. *Falta a foto.*
  *Prompt:* "faz a VP-02 com esta foto: [anexo]."
- [x] **VP-03** · [P2 · média] **Categoria Música.** *16/out/2026.* A quinta categoria, com as seis obras do catálogo publicado no vitordemantova.com (`data/music.ts` de lá): Chanson Antique, I Trust Thee, Prepoulesca Sonata, I Am Change, Celestial Interlude e Nocturne Sonate. As obras não têm imagem: o cartão é desenhado na hora (`src/ui/musiccard.ts`) como a página de rosto de uma partitura europeia, com o nome, o título em itálico, a formação, a pauta em lavanda e o ano, sempre nas letras do site. Só a Chanson Antique tem gravação: ela toca na ficha (o tocador) e, com o som ligado, entra baixinho quando o cartão dela está na vez ou sob o mouse.
- [~] **VP-04** · [P2 · pequena] **Anos que faltam.** O primeiro site ganhou **2023**, a data do primeiro commit do repositório `vitorpetri` (18/jan/2023), e o Portal Solar, **2026**, pelo histórico do git. Continuam sem ano: CEPIL, Conservatório Carlos Gomes, De tanta luz, Eufonia Abstrata, Instituto Lênin, o Notion e a Chanson Antique. Os arquivos das peças não guardam data de criação. *Você me diz os anos e eu ponho* (é uma linha `year:` em cada arquivo de `content/projects/`).
  *Prompt:* "VP-04: CEPIL 20__, Carlos Gomes 20__, …"
- [~] **VP-05** · [P2 · média] **Mais projetos de verdade.** *16/out/2026:* entrou o **Portal Solar** (montagnedejade.org, fotografado no ar, com o texto do próprio site). Ficaram de fora:
  - o bhop-surf, que só existe no Windows e sem git;
  - a Casa 3D, por ter dados pessoais;
  - as fotografias, que ainda não existem como arquivos.
  *Prompt:* "faz a VP-05 com: [lista]."
- [x] **VP-06** · [P3 · pequena] **WhatsApp no contato.** *16/out/2026.* Embaixo do e-mail, o número do vitordemantova.com. As redes seguem a ordem de lá ("coloque sempre o Behance antes", 09/out).
- [ ] **VP-07** · [P2 · média] **Vídeo no lugar da foto nos sites.** Junto com a VP-33, agora na **VP-95** (o plano está lá).

**Feito também (16/out/2026):** as fotos do vitordemantova foram tiradas de novo, do site de hoje: o Estúdio em quatro telas; o Editorial, com a capa e o bilhete "o resto da edição está sendo escrito"; o Laboratório com a fonte dos desejos; e a Malha. As de 11/out mostravam um site que não existe mais. A ficha do Editorial diz o que ele é hoje.

## 3. Design e interface (fidelidade às telas)

- [x] **VP-10** · [P1 · média] **Modo comparação.** *16/out/2026.* `?ref=2` põe a tela 2 por cima do site, em "diferença" (o que coincide fica preto; o que está fora de lugar acende). No teclado: `1`–`7` troca a tela, `D` liga e desliga a diferença, `[` `]` a transparência, `0` esconde (`src/ui/compare.ts`). **As telas não estão neste Mac** (vieram só na conversa de 11/out): ver a VP-94.
- [x] **VP-11** · [P1 · pequena] **Contraste dos cinzas.** *16/out/2026.* O cinza dos valores (ROLE, TYPE…) e do "Private" passou de `#9c9ca6` para `#4f4f59`, contado em todo fundo possível:

  | Fundo | Antes | Agora |
  |---|---|---|
  | o vidro sobre o preto (o pior caso) | 1,6:1 | 4,7:1 |
  | o vidro sobre o lavanda | 2,0:1 | 5,8:1 |
  | o branco | 2,7:1 | 8,1:1 |

  O mínimo é 4,5:1. A sugestão da V1 (`#5f5f6b`) dava só 3,7:1 no pior caso.
- [x] **VP-12** · [P2 · pequena] **Cantos dos cartões.** *16/out/2026.* No shader, pela distância até a borda, nítido em qualquer tamanho e sem perder a dobra. Os **sites** ganharam o raio de uma janela de navegador (2,2 cm num cartão de 2 m). As peças **impressas** (design, música) ficaram com o canto vivo das telas. Para mudar: `u.radius` em `src/gl/gallery.ts`.
- [x] **VP-13** · [P2 · pequena] **Contador "03 / 21"** no pé, à direita, nas letras das coordenadas, em lavanda. Com um filtro, diz a categoria: "MUSIC · 01 / 06".
- [x] **VP-14** · [P2 · média] **A abertura com mais assinatura.** *16/out/2026.*
  - as coordenadas "digitam" (cada algarismo sorteia até acertar);
  - as letras do logotipo caem no lugar, uma a uma;
  - o brilho acende do centro para fora;
  - com a placa de vídeo, o logotipo se forma de partículas (VP-32).
- [x] **VP-15** · [P2 · pequena] **Cursor próprio** (só com mouse). Um anel sobre a galeria, um círculo branco com **VIEW** ("VER") sobre o cartão da vez, um círculo menor com → sobre os outros, e o anel apertado ao arrastar. Sobre a interface, volta a seta do sistema (`src/ui/cursor.ts`).
- [x] **VP-16** · [P3 · pequena] **Favicon e imagem de compartilhamento.** O ícone é o V e o P do próprio logotipo, brancos no brilho lavanda (`public/favicon.svg`, `apple-touch-icon.png`, `icon-512.png`), e a prévia do site é o logotipo no brilho (`public/og/site.jpg`). Tudo gerado por `npm run images`, a partir do desenho medido.
- [x] **VP-17** · [P3 · média] **A cor do brilho pela hora** de Campinas (`src/gl/hour.ts`). Das 9h às 16h fica a cor medida das telas; no fim da tarde, mais quente; à noite e de madrugada, um lavanda mais fundo; ao nascer, rosado. Entra com no máximo 20%. Para ver as horas: `?hora=18`, `?hora=23`, `?hora=7`.

## 4. Experiência (UX)

- [x] **VP-20** · [P1 · média] **Os filtros do Índice mexem na galeria.** *16/out/2026.* Com "Music", a fila 3D passa a ter só as seis obras (apaga, troca e acende). O da vez continua na vez, se ficou. O contador diz a categoria. Com menos de três cartões, a fila não dá a volta.
- [x] **VP-21** · [P1 · pequena] **Anterior / próximo na ficha.** Embaixo da descrição, com o nome de cada um, e as setas ← → no teclado. Anda na fila de agora (com o filtro, só na categoria).
- [x] **VP-22** · [P2 · média] **Do cartão para a ficha, sem corte.** Ao abrir pelo cartão (o clique, o VIEW PROJECT ou Enter), o vidro cresce do retângulo do cartão na tela até o lugar da ficha, e o cartão some da galeria. Ao fechar, o vidro encolhe até ele, que acende de novo.
- [x] **VP-23** · [P2 · pequena] **Dica de rolagem** na primeira visita, no pé: "SCROLL OR DRAG · ? for the shortcuts", com um traço que desce. Some no primeiro gesto e não volta (fica guardado no navegador).
- [~] **VP-24** · [P2 · pequena] **Ajuste fino do arrasto no celular.** Tudo num lugar só, `DRAG` em `src/core/input.ts`:
  - 210 px de dedo por cartão (eram 230);
  - o embalo só vale se o dedo ainda estava andando ao soltar (segurar parado e soltar não joga a fila);
  - um teto de 1,6 cartão por jogada.
  Para testar: `?arrasto=1.3` (mais sensível) ou `?arrasto=0.8` (menos). *Falta o seu teste num aparelho:* diga "está pesado", "está solto" ou o número que ficou bom.
- [x] **VP-25** · [P3 · pequena] **Atalhos à vista.** `?` abre a lista (`src/ui/shortcuts.ts`), e a dica da primeira visita conta isso.
- [x] **VP-26** · [P3 · média] **Busca no Índice**, embaixo dos filtros. Procura por nome, tipo, tecnologia, formação e ano, nas duas línguas e sem precisar de acento ("lenin" acha o Lênin). Enter abre o primeiro que sobrou.

## 5. 3D e WebGPU

- [x] **VP-30** · [P2 · média] **Pós-processamento leve em TSL** (`src/gl/post.ts`). O **brilho** (bloom) só aparece com o gesto: parada, a galeria fica limpa; rolando depressa, o claro deixa um rastro de luz que some quando para. É a regra do site pessoal: efeito em repouso é enfeite. O **grão de filme** é bem fino e não clareia nem escurece; com "reduzir movimento", fica parado. Para comparar: `?semefeitos`.
- [x] **VP-31** · [P2 · média] **A troca de cartão como onda.** Ao assentar num cartão novo, um anel sai do centro da imagem, na proporção do cartão, distorce de leve e assenta. Com "reduzir movimento", nada.
- [x] **VP-32** · [P2 · grande] **Partículas na placa de vídeo** (`src/gl/particles.ts`). Na abertura, 16.000 pontos (7.000 no celular) boiam no brilho e formam o logotipo de baixo para cima, conforme as imagens chegam. Quando tudo chegou, o logotipo nítido acende por cima, voa para o canto, e os pontos se desfazem no brilho. A conta é um compute shader em TSL: no WebGPU é compute de verdade, e no WebGL2 o three.js faz a mesma conta com transform feedback. Conferido nos dois, sem erro. Com "reduzir movimento", fica o enchimento em SVG.
- [ ] **VP-33** · [P2 · média] **Texturas de vídeo nos sites.** Agora na **VP-95**.
- [x] **VP-34** · [P3 · média] **Profundidade de campo.** Os de trás são lidos num mipmap mais alto (até 1,6 degrau), e o da vez fica nítido. Não custa nada a mais.
- [x] **VP-35** · [P3 · pequena] **O cartão da vez inclina com o mouse**, até 4°, como um objeto na mão.

**Feito também (16/out/2026):** os cartões de trás se afastam com a profundidade, e os em pé ganham o que falta da largura de um site. Antes, as capas e as peças de design de trás ficavam escondidas atrás do cartão da vez; agora todos espiam pelos cantos, como nas telas.

## 6. Desempenho

- [x] **VP-40** · [P1 · pequena] **Só o alfabeto latino nas fontes** (o português cabe nele). Os outros alfabetos (o cirílico, o vietnamita e o latino estendido) não vão mais no build. A Lato 300, que não era usada, também saiu.
- [-] **VP-41** · [P2 · média] **Texturas KTX2.** *Descartada por enquanto (16/out/2026)*, por três motivos:
  - os cartões são capturas de sites, com letra pequena, e o KTX2 leve (ETC1S) borra as letras;
  - o KTX2 nítido (UASTC) pesa ~1 byte por pixel, ~1 MB por cartão, contra 30–140 KB do WebP de hoje: uns 15 MB a mais para baixar;
  - não há codificador neste Mac (toktx, basisu).

  O ganho seria memória da placa (~80 MB), que importa menos que o download. Volta à mesa se a galeria passar de uns 40 cartões.
- [x] **VP-42** · [P2 · pequena] **Medir.** *16/out/2026*, com o Lighthouse no endereço público:
  - **computador: 100 em desempenho, acessibilidade, boas práticas e SEO** (a primeira pintura em 0,3 s);
  - **celular simulado** (4G lento e processador 4× mais lento): **100 nas quatro**, em três rodadas seguidas (a primeira pintura em 1,1 s, a maior em 1,4–1,5 s, 20–50 ms de bloqueio). Antes, o desempenho era **56**: a tela ficava vazia por 2,6 s, até o JavaScript chegar. O que resolveu foi a abertura (as coordenadas e o logotipo) vir pronta no HTML.
  - A primeira visita logo depois de uma publicação, com o cache da Vercel vazio, mediu 63 (ver a VP-99).
  - O Lighthouse não espera o 3D: no Chrome deste Mac, a galeria fica pronta em ~0,6 s depois da página.

- [x] **VP-43** · [P3 · pequena] **Ver o que pesa no pacote:** `npm run analise` grava o mapa em `dist/stats.html`.
  - o three.js com WebGPU é 241 KB compactado, ~80% de tudo;
  - a interface (o GSAP e o código do site) é 52 KB;
  - o 3D chega à parte, depois da interface.
- [x] **VP-44** · [P3 · pequena] **Carregar primeiro as imagens perto da vez.** A abertura espera só quatro: o da vez, os dois de trás e o que passou. O resto chega depois, de três em três, sem pressa. Antes, as 14 iam juntas e a abertura esperava todas.

## 7. Acessibilidade

- [x] **VP-50** · [P1 · pequena] Os contrastes da VP-11.
- [x] **VP-51** · [P2 · pequena] **Pular para o índice**: o primeiro Tab da página mostra o link, que abre o Índice com o foco nos filtros.
- [x] **VP-52** · [P2 · pequena] **Alvos de toque de 44 px** no celular: o fechar, os botões do pé, o tocador, o anterior/próximo e os filtros.
- [~] **VP-53** · [P3 · pequena] **Revisão de acessibilidade.** *16/out/2026*, com o axe-core, nas dez telas (a galeria com o contato aberto, o Índice, o Perfil, uma ficha de site e a da música, em inglês e em português): **nenhum problema**. Antes da correção, ele achou quatro:
  - o "PT" e o "Anterior" com o nome falado diferente do que se lê;
  - o pular-para-o-índice e a etiqueta fora das regiões da página;
  - a coluna de imagens que rolava sem teclado.

  O Lighthouse também dá 100 em acessibilidade. *Falta a passada com o Narrador do Windows* (Ctrl + Win + Enter), de ponta a ponta: VP-97.

## 8. SEO e compartilhamento

- [x] **VP-60** · [P1 · média] **Imagem e textos de prévia** (Open Graph). No WhatsApp aparecem o nome, a frase e a imagem: a do site é o logotipo no brilho, e cada projeto tem a sua, com o cartão dele no brilho (`public/og/<id>.jpg`, 1200 × 630, de `npm run images`).
- [x] **VP-61** · [P2 · média] **Cada projeto com o seu endereço de verdade:** `/project/laboratorio`, `/index`, `/profile`. O build escreve uma página para cada um, com o título, a descrição, a prévia e o endereço canônico dele. O JavaScript lê o endereço e abre a ficha, e o voltar do navegador funciona. Os links antigos (`#/project/x`) continuam valendo. Também saem `sitemap.xml` e `robots.txt`, e o `<noscript>` traz a lista dos projetos com links (para quem não roda JavaScript e para a busca).
- [x] **VP-62** · [P3 · pequena] **Dados estruturados "Person"** no `<head>`: o nome, os ofícios, o lugar, as redes e o vitordemantova.com.

## 9. Código e organização

- [x] **VP-70** · [P2 · pequena] **ESLint**, no `npm run lint` e no `npm run check`, sem nenhum aviso. O **Prettier** está configurado (`.prettierrc.json`, linhas de até 200, como o código) e roda com `npm run format`, mas **não foi aplicado em tudo**: ele desfaria o desenho das linhas e dos comentários alinhados à mão. Use num arquivo novo, se quiser.
- [x] **VP-71** · [P2 · média] **Testes (Vitest):** 42, em três arquivos.
  - `src/gl/math.test.ts`: a volta da fila, o caminho mais curto, a mola que não passa do alvo, o enquadramento, quem aparece, a cor da hora;
  - `src/content/content.test.ts`: o leitor do Markdown e **cada um dos 21 projetos** (a categoria, as imagens existem, o ano é um ano, a linha `source:`, as duas línguas, a gravação existe);
  - `src/ui/wordmark.test.ts`: as dez letras e a largura medida.
  As contas puras saíram para `src/gl/math.ts` e `src/gl/hour.ts`.
- [x] **VP-72** · [P2 · pequena] **Dividir o `main.ts`**, que ficou só como o que liga as peças:
  - `core/` (router, i18n, input, sound);
  - `ui/` (label, contact, intro, preloader, cursor, foot, shortcuts, compare, langswitch, musiccard, panels);
  - `gl/` (stage, backdrop, gallery, post, particles, math, hour);
  - `content/` (parse, projects).
- [x] **VP-73** · [P3 · média] **Conteúdo em Markdown:** cada projeto é um arquivo em `content/projects/`, e o número do nome dá a ordem (`030-chanson-antique.md`). O formato está no topo de `src/content/parse.ts` e em "Pôr um projeto", no README. O mesmo leitor serve ao site e ao build.
- [~] **VP-74** · [P3 · pequena] **Conferência a cada envio.** Hoje quem faz é a **Vercel**: `npm run check` antes de cada build, e um teste quebrado não vai ao ar. O arquivo do **GitHub Actions** está pronto em `scripts/github-actions-ci.yml`, mas não pôde ir para `.github/workflows/`: a chave do GitHub deste Mac só tem a permissão "repo", e o GitHub exige "workflow" para essa pasta. Ver a VP-98.

## 10. Publicação

- [x] **VP-80** · [P1 · pequena] **Git e GitHub.** *16/out/2026*, a seu pedido ("publique no github"): `github.com/vpdemantova/vitor-petri-2027-V2`, público como o da V1, com o histórico da V1 e os commits da V2.
- [x] **VP-81** · [P1 · pequena] **No ar pela Vercel.** O projeto `vitor-petri-2027-v2` (equipe vitordes-projects), ligado ao GitHub: **https://vitor-petri-2027-v2.vercel.app**. Um push na `main` publica.
- [ ] **VP-82** · [P2 · pequena] **Domínio.** *Decisão sua.* O `vitorpetri.com` está hoje em dois projetos antigos da Vercel (`vpd-space` e `vitorpetri`), e o Linktree aponta para ele. Passar para este site é tirá-lo de lá. A outra saída é um subdomínio do vitordemantova.com (por exemplo, `portfolio.vitordemantova.com`). Quando decidir, eu ligo o domínio e troco o endereço público em `src/data/site.ts` (as prévias precisam dele inteiro).
  *Prompt:* "VP-82: use [domínio]."
- [x] **VP-83** · [P3 · pequena] **Cache** (`vercel.json`):
  - `/assets`: 1 ano, imutável (os nomes mudam a cada versão);
  - `/img`: 7 dias, com a troca em segundo plano (os nomes **não** mudam, então uma captura trocada chega a todos em até 7 dias);
  - `/og`: 1 dia;
  - `/audio`: 30 dias.

## 11. Ideias grandes

- [x] **VP-90 · O site como instrumento.** *16/out/2026*, com o som desligado por padrão (o botão **Som** no pé, ou S). Cada cartão tem uma nota, de uma pentatônica de ré em duas oitavas. Rolar devagar toca as notas uma a uma; rolar depressa, um arpejo, no andamento da mão. O timbre é feito na hora (Web Audio, nenhum arquivo), como uma celesta ao longe (`src/core/sound.ts`).
- [x] **VP-91 · O modo sala.** *16/out/2026*, com R ou o botão **Room** ("Sala") no pé. A fila vira um corredor: os cartões nas duas paredes, alternando os lados, o chão e as paredes escuros, com juntas que andam com a rolagem, e o brilho lavanda no fundo como horizonte. O cartão da vez vira para você; a rolagem anda pelo corredor. No celular, o botão some (falta lugar no pé): ver a VP-96.
- [~] **VP-92 · Estudo de caso por projeto.** A estrutura está pronta: um trecho `<!-- process -->` (e `<!-- process.pt -->`) no arquivo do projeto vira a seção "Processo" da ficha, embaixo da descrição. *O conteúdo é seu:* os esboços, as decisões, o antes e o depois.
  *Prompt:* "VP-92 no [projeto]: [o processo, em tópicos ou corrido]."
- [x] **VP-93 · As cores de cada projeto.** O brilho puxa de leve para o tom do cartão da vez: a cor é calculada da imagem no build e entra com no máximo 12%. Só o **tom** muda, nunca o brilho, e um cartão cinza não entra: o lavanda medido continua mandando (medido no pixel, igual ao da V1).

## 12. Novas (abertas na V2, 16/out/2026)

- [ ] **VP-94** · [P1 · pequena] **As 7 telas de referência em `public/ref/`** (1.png … 7.png), para o modo comparação (VP-10). Com elas, a rodada de fidelidade tela a tela. *Preciso das telas* (as do Whizbigg, de 11/out).
  *Prompt:* "VP-94: [anexo das 7 telas]."
- [ ] **VP-95** · [P2 · média] **Vídeos nos cartões dos sites** (junta a VP-07 e a VP-33). O plano:
  1. gravar laços de 6 a 8 s do Estúdio (a logo girando), do Laboratório (a volta na ilha), da Malha, da capa do Editorial e do Portal Solar rolando: o Chrome sem janela grava os quadros, e o ffmpeg (que não está neste Mac; vai pelo `ffmpeg-static`, só na pasta de trabalho) faz MP4 H.264 de 1280 × 800, ~1 MB cada;
  2. na galeria, `THREE.VideoTexture` (com `muted`, `loop` e `playsInline`) só no cartão da vez; os outros ficam na foto. O vídeo só baixa quando o cartão chega perto;
  3. sem vídeo com "reduzir movimento" ou com a economia de dados ligada.
  *Prompt:* "faz a VP-95."
- [ ] **VP-96** · [P3 · pequena] **A sala no celular.** Hoje o botão some abaixo de 760 px. A ideia: pôr Sala/Fila no Índice do celular, ou um gesto de dois dedos.
- [ ] **VP-97** · [P3 · pequena] **O Narrador do Windows de ponta a ponta** (o axe já passou, VP-53). *Seu, no Windows.*
- [ ] **VP-98** · [P3 · pequena] **Ligar o GitHub Actions:** mover `scripts/github-actions-ci.yml` para `.github/workflows/ci.yml`. Precisa de uma chave do GitHub com a permissão "workflow", ou de você fazer isso pelo site do GitHub ("Add file").
- [ ] **VP-99** · [P3 · média] **A primeira visita depois de uma publicação.** Com o cache da Vercel vazio, o celular simulado mediu 63 (as fontes e o three.js vêm de longe na primeira vez); com o cache, 100 (VP-42). Três passos, se um dia importar:
  1. pré-carregar o pedaço do three.js junto com a página;
  2. no celular, imagens de 800 px em vez de 1280 (um `srcset`);
  3. adiar a compilação dos shaders até depois da primeira pintura.
- [ ] **VP-100** · [P3 · pequena] **A gravação mais leve:** o MP3 da Chanson Antique tem 3 MB (só baixa ao tocar). Um AAC de 96 kbps teria ~2,2 MB (precisa do ffmpeg, como a VP-95).
- [ ] **VP-101** · [P3 · média] **As páginas em português para a busca** (`/pt/project/…`). Hoje as páginas geradas são em inglês; o português vem pela língua do navegador ou por `?lang=pt`.

---

## 13. Prompts prontos

**Refinar a fidelidade de uma tela** (depois da VP-94):
> "Compara a tela [número] com o site no modo comparação (?ref=[número]) e acerta tudo que estiver fora: medidas, letras, cores, espaçamentos. Mostra o antes e o depois."

**Uma rodada de qualidade:**
> "Rodada de qualidade no Vitor Petri V2: contraste, teclado, axe, Lighthouse, celular, as duas línguas. Lista o que achou, corrige o que for P1 e registra aqui."

**Um projeto novo na galeria:**
> "Põe no Vitor Petri o projeto [nome]: [endereço ou imagens], categoria [Websites/Design/Experiments/Music], tipo [ ], função [ ], tecnologias [ ], ano [ ], descrição [ ], em português [ ]."

**Uma obra de música:**
> "Põe a obra [título]: formação [ ], ano [ ], [gravação em anexo, se houver]."

**Um dado que faltava:**
> "No [projeto], o ano é [ ] / a função é [ ] / o endereço é [ ]."

---

## 14. Registro

| Data | O que | Onde |
|---|---|---|
| 11/out/2026 | O projeto nasce das 7 telas do Whizbigg: logotipo medido e redesenhado, brilho medido, galeria 3D em WebGPU (com WebGL2 de reserva), abertura, Índice, Perfil, ficha, contato, 14 projetos reais. Testado em 1440 e 390, nos dois motores. | `README.md` |
| 11/out/2026 | Este arquivo de tarefas. | `TAREFAS.md` |
| 16/out/2026 | **A V2:** a cópia com o histórico (`vitor-petri-2027-V2`), no GitHub e na Vercel. | VP-80, VP-81 |
| 16/out/2026 | Conteúdo: os 21 projetos em Markdown, em inglês e português (com o Portal Solar e as seis obras de música); fotos novas do vitordemantova; o WhatsApp; o primeiro site com o ano de 2023. | VP-01, 03, 04, 05, 06, 73 |
| 16/out/2026 | Interface: o idioma, os endereços de verdade com uma página e uma prévia por projeto, os filtros na galeria, a busca, anterior/próximo, a ficha que nasce do cartão, o contador, o cursor, a dica, os atalhos, o modo comparação, os cantos, o contraste, os ícones. | VP-10 a 26, 50 a 52, 60 a 62 |
| 16/out/2026 | 3D: a onda, o desfoque dos de trás, a inclinação, o brilho pela hora e pelo cartão, o bloom só no gesto, o grão, as partículas da abertura (compute em TSL, nos dois motores), a sala, o som. | VP-14, 17, 30 a 35, 90, 91, 93 |
| 16/out/2026 | Código: os módulos, 42 testes, ESLint, a Vercel conferindo tudo antes de publicar; a abertura no HTML; as fontes só latinas; a carga perto da vez. Conferido com a placa de vídeo em 1440 e 390 px, em WebGPU e WebGL2, nas duas línguas, sem erro no console; axe sem nenhum problema; Lighthouse 100/100/100/100 no computador. | VP-40, 42 a 44, 53, 70 a 74 |
| 16/out/2026 | Lighthouse no endereço público: 100/100/100/100 no computador e, depois da abertura no HTML, no celular simulado (o desempenho era 56). | VP-42 |
| 16/out/2026 | Descartada por enquanto: a VP-41 (KTX2). Abertas: VP-94 a VP-101. | §12 |

*Último número em uso: VP-101. O próximo é VP-102 (ou o primeiro número livre da categoria).*
