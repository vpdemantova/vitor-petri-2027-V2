# Vitor Petri V2 — tarefas, prompts, controles e melhorias

> O painel de trabalho deste projeto. Você acrescenta, eu faço (ou guio), e os dois vamos riscando. Criado em 11/out/2026 na V1; a V2 (esta pasta, `vitor-petri-2027-V2`) nasceu em 16/out/2026 como cópia da V1, com o histórico, e passou por todos os itens daqui, um por um. Em 19/out/2026, já no Windows, veio a **segunda rodada**: tudo o que estava aberto e dava para fazer sem você (ver o Registro). O que existe e como roda está no `README.md`; aqui fica o que foi feito, o que falta e como pedir.

**No ar:** https://vitor-petri-2027-v2.vercel.app · **Código:** https://github.com/vpdemantova/vitor-petri-2027-V2 (público, como o da V1) · **A V1** continua intacta (`~/www/vitor-petri-2027` no Mac, `D:\www\vitor-petri-2027` no Windows). · **Esta pasta no Windows:** `D:\www\vitor-petri-2027-V2`.

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
| Um "pode" para as 7 telas de referência | VP-94 | Achei as telas na conversa de 11/out; elas mostram trabalho de outros estúdios e rostos, por isso só entram com o seu ok (e só na pasta local `ref/`, fora do site e do git). |
| O domínio | VP-82 | Decisão sua. |
| O processo de algum projeto | VP-92 | O lugar existe; o conteúdo é seu. |
| A passada com o Narrador | VP-97 | No Windows, com o seu ouvido. |
| Uma gravação sem perda da Chanson Antique (WAV), se existir | VP-100 | Só com o original dá para deixar o arquivo mais leve sem piorar o som. |

---

## 1. Controles

### Comandos
| O quê | Comando | Onde |
|---|---|---|
| Rodar no computador | `npm run dev` | http://localhost:5190 |
| Conferir tudo (tipos, lint, testes) | `npm run check` | o mesmo que a Vercel e o GitHub (VP-98) rodam a cada envio |
| Só os testes | `npm test` | 46 testes (Vitest): um por projeto, as contas e o `/pt` dos endereços |
| Gerar a versão final | `npm run build` | sai em `dist/`, com uma página por projeto |
| Ver a versão final | `npm run preview` | http://localhost:5191 |
| Refazer as imagens, as prévias e os ícones | `npm run images` | lê `media/`, grava `public/img/`, `public/og/` e os ícones |
| Ver o que pesa no pacote | `npm run analise` | grava `dist/stats.html` (desde 19/out funciona também no Windows) |
| Regravar os vídeos dos cartões | `npm run videos` (ou `npm run videos -- malha`) | grava dos sites no ar e salva em `public/video/`; precisa do ffmpeg (ver o cabeçalho de `scripts/gravar-videos.mjs`) |
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
| `?ref=3` | o modo comparação com a tela 3 (VP-10); as telas ficam em `ref/` (VP-94) |
| `?semvideo` | só as fotos nos cartões (VP-95) |
| `/pt/…` | a mesma página em português (VP-101): `/pt`, `/pt/index`, `/pt/project/laboratorio` |

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
- Como eu confiro (no Windows, desde 19/out): o Edge sem janela (`--headless=new --disable-extensions`, que roda WebGPU de verdade com a placa) contra o `npm run preview` numa porta minha (5291), pilotado pelo protocolo de depuração (teclas, toques, fotos); o Lighthouse 12 com o Edge (`CHROME_PATH`), no celular simulado e no computador. As ferramentas ficam numa pasta temporária fora do projeto; só o `gravar-videos.mjs` entrou em `scripts/`.

### Publicar
- **Um push na `main` publica sozinho** (o projeto `vitor-petri-2027-v2` da Vercel, equipe vitordes-projects, está ligado ao repositório). Antes do build, a Vercel roda `npm run check`: um teste quebrado não vai ao ar. O GitHub roda a mesma conferência (aba Actions: VP-98).
- Do Windows, o envio usa o acesso ao GitHub guardado no Git deste computador (o Git Credential Manager), o mesmo que já envia o jadesun.
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
- [~] **VP-05** · [P2 · média] **Mais projetos de verdade.** *16/out/2026:* entrou o **Portal Solar** (montagnedejade.org, fotografado no ar, com o texto do próprio site). *19/out/2026, no Windows:* entrou o **DRIFT** (o bhop-surf, `content/projects/135-drift.md`), na categoria Experiments: o texto saiu do README do próprio jogo, o ano das datas dos arquivos (25/set/2026), e as quatro imagens foram fotografadas do jogo rodando (o Desfiladeiro no cartão; o Surf, os Blocos e o menu na ficha). Sem endereço: "Not published yet". Ficaram de fora:
  - a Casa 3D, por ter dados pessoais;
  - as fotografias, que ainda não existem como arquivos.
  *Prompt:* "faz a VP-05 com: [lista]."
- [x] **VP-06** · [P3 · pequena] **WhatsApp no contato.** *16/out/2026.* Embaixo do e-mail, o número do vitordemantova.com. As redes seguem a ordem de lá ("coloque sempre o Behance antes", 09/out).
- [x] **VP-07** · [P2 · média] **Vídeo no lugar da foto nos sites.** *19/out/2026*, junto com a VP-33: feita na **VP-95**.

**Feito também (16/out/2026):** as fotos do vitordemantova foram tiradas de novo, do site de hoje: o Estúdio em quatro telas; o Editorial, com a capa e o bilhete "o resto da edição está sendo escrito"; o Laboratório com a fonte dos desejos; e a Malha. As de 11/out mostravam um site que não existe mais. A ficha do Editorial diz o que ele é hoje.

## 3. Design e interface (fidelidade às telas)

- [x] **VP-10** · [P1 · média] **Modo comparação.** *16/out/2026.* `?ref=2` põe a tela 2 por cima do site, em "diferença" (o que coincide fica preto; o que está fora de lugar acende). No teclado: `1`–`7` troca a tela, `D` liga e desliga a diferença, `[` `]` a transparência, `0` esconde (`src/ui/compare.ts`). **As telas não estão neste Mac** (vieram só na conversa de 11/out): ver a VP-94. *19/out:* as telas agora saem da pasta local `ref/` (fora do git e do site publicado), servida só pelo `npm run dev` e pelo `npm run preview`.
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
- [x] **VP-33** · [P2 · média] **Texturas de vídeo nos sites.** *19/out/2026:* feita na **VP-95**.
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
- [x] **VP-74** · [P3 · pequena] **Conferência a cada envio.** A **Vercel** roda `npm run check` antes de cada build, e um teste quebrado não vai ao ar. O **GitHub Actions** faz o mesmo desde 19/out/2026 (VP-98): `.github/workflows/ci.yml`. No Mac, a chave do GitHub só tinha a permissão "repo"; do Windows, o envio foi com a chave deste computador.

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

- [~] **VP-94** · [P1 · pequena] **As 7 telas de referência**, para o modo comparação (VP-10). *19/out/2026:* as telas foram achadas. São as sete imagens coladas na conversa de 11/out ("crie um novo projeto, com o nome de VITOR PETRI…"), guardadas na transcrição do Claude Code deste computador (`.claude/projects/d--www/42d9b65f-….jsonl`, linha 16678). O modo comparação agora lê de `ref/`, uma pasta local fora do git e do site publicado, servida só pelo `npm run dev` e pelo `npm run preview`.
  - **Falta o seu "pode":** as telas mostram trabalho de outros estúdios (El Hempe, Strangers Only) e rostos de pessoas. Por isso não vão para o repositório público e não foram gravadas em lugar nenhum sem você.
  - A ordem que o modo comparação espera: 1 logotipo, 2 abertura (a tela da abertura já traz o cartão de contato), 3 galeria, 4 projeto, 5 índice, 6 perfil, 7 a segunda tela da galeria. Não há tela só do contato.
  - As telas vêm dentro da moldura cinza do arquivo de apresentação ("Home / Gallery", "Project"…): antes de comparar, recortar até o quadro preto.
  *Prompt:* "VP-94: pode pôr as telas em ref/."
- [x] **VP-95** · [P2 · média] **Vídeos nos cartões dos sites** (junta a VP-07 e a VP-33). *19/out/2026.*
  - **Os cinco laços** (`public/video/`, 8 s, 1280 × 800, H.264, sem som): o Estúdio (a logo girando, 282 KB), o Laboratório (a praça com a logo girando, 272 KB), a Malha (335 KB), a capa do Editorial (243 KB) e o Portal Solar rolando (1 MB). Gravados dos sites no ar.
  - **Na galeria:** o cartão da vez toca o laço quando a fila para nele, mudo e em laço, num fade sobre a foto; ao sair, o vídeo apaga e pausa. Os outros cartões ficam na foto. O vídeo só baixa quando o cartão vira a vez pela primeira vez. Nada toca com a aba escondida.
  - **Sem vídeo:** com "reduzir movimento", com a economia de dados ligada, ou com `?semvideo`.
  - **Para refazer:** `npm run videos` (todos) ou `npm run videos -- malha` (um). Como grava, no cabeçalho de `scripts/gravar-videos.mjs`. Dois truques que valem saber:
    - o 3D pesado (o Estúdio e o Laboratório) rende uns 9 quadros por segundo sem janela. Durante a gravação, o relógio da página anda 2× ou 3× mais devagar, e o vídeo volta à velocidade certa na codificação: sai liso, com uns 25 a 35 quadros por segundo;
    - nos que giram, o fim se funde no começo num fade de 0,6 s; nos que rolam, a página desce 4 s e sobe 4 s, e o laço emenda sozinho.
  - Conferido no WebGPU e no WebGL2: toca no da vez, troca ao passar, não baixa nada com `?semvideo`.
  - Um teste confere que cada `video:` tem o seu arquivo e que ele tem menos de 1,25 MB.
- [x] **VP-96** · [P3 · pequena] **A sala no celular.** *19/out/2026.* O botão volta ao pé abaixo de 760 px, só com o desenho de uma sala em perspectiva (o mesmo alvo de 44 px dos outros). Na sala em pé, o cartão da vez ficava cortado na parede; agora ele sai da parede para o meio do corredor e volta ao passar (só em pé; no computador, nada mudou). Ver a VP-104.
- [ ] **VP-97** · [P3 · pequena] **O Narrador do Windows de ponta a ponta** (o axe já passou, VP-53). *Seu, no Windows.*
- [x] **VP-98** · [P3 · pequena] **Ligar o GitHub Actions.** *19/out/2026:* o arquivo saiu de `scripts/` para `.github/workflows/ci.yml` e foi enviado do Windows. A cada envio, o GitHub roda `npm ci`, `npm run check` e `npm run build` (a aba Actions do repositório mostra o resultado).
- [x] **VP-99** · [P3 · média] **A primeira visita mais rápida.** *19/out/2026.* Medido com o Lighthouse 12 no build local (`npm run preview`), no celular simulado (4G lento, processador 4× mais lento):

  | | Antes | Depois |
  |---|---|---|
  | Desempenho | 63 | 82 |
  | A maior pintura (LCP) | 4,1 s | 1,9 s |
  | O bloqueio (TBT) | 830 ms | ~540 ms |

  O computador ficou em 97/100/100/100 (a maior pintura em 0,6 s). O que mudou:
  1. **o principal:** o `main.ts` tirava a abertura do lugar e a punha de volta (um `append` dela), e isso a fazia pintar de novo logo depois do JavaScript. O navegador contava essa segunda pintura como a maior da página. Agora as outras peças entram em volta da abertura, sem mexer nela;
  2. no celular (abaixo de 760 px), os cartões vêm em 800 px (`<nome>-m.webp`, só os 16 cartões), em vez de 1280: menos para baixar e para mandar à placa de vídeo;
  3. os materiais dos 22 cartões e da sala compilam antes do primeiro quadro (`compileAsync`), em vez de travar o primeiro quadro.

  Não fiz o pré-carregamento do three.js: ele disputaria a rede com a fonte da abertura, que é a maior pintura, e a primeira pintura já não depende do JavaScript. O que sobra está na VP-103.
- [-] **VP-100** · [P3 · pequena] **A gravação mais leve.** *Descartada (19/out/2026).* O único arquivo da Chanson Antique é o próprio MP3 de 128 kbps (o mesmo do vitordemantova.com). Passá-lo para AAC de 96 kbps seria recodificar o que já foi comprimido: o som pioraria para economizar 0,8 MB, e esse arquivo só baixa quando alguém aperta o play. Volta se houver o original sem perda (WAV): daí sai um AAC melhor e menor.
- [x] **VP-101** · [P3 · média] **As páginas em português para a busca.** *19/out/2026.*
  - Os mesmos endereços com `/pt` na frente: `/pt`, `/pt/index`, `/pt/profile` e `/pt/project/<id>`. O build gera cada um com `lang="pt-BR"`, o título, a descrição e o `<noscript>` em português, e `og:locale` `pt_BR`.
  - Todas as páginas, nas duas línguas, apontam uma para a outra (`hreflang` `en`, `pt-BR` e `x-default`). O `sitemap.xml` lista as duas, com as alternativas.
  - **O endereço segue a língua:** quem troca para português vai para `/pt/…` (sem somar uma entrada no histórico), e os links (o logotipo, o menu, anterior e próximo) levam à página na língua de agora. Quem chega por `/pt/…` lê em português.
  - As descrições das páginas cortam na última palavra inteira, com reticências (antes cortavam no meio da palavra).
  - A regra do `/pt` está num arquivo só, `src/core/paths.ts`, usado pelo endereço e pelo build, com testes.

## 13. Novas (abertas na segunda rodada, 19/out/2026)

- [x] **VP-102** · [P2 · pequena] **`npm run images` só refaz o que mudou.** *19/out/2026.* Cada imagem gerada guarda a impressão (sha1) do arquivo e das opções que a fizeram, em `scripts/imagens-feitas.json`. Se nada mudou, a imagem fica como está. Antes, cada rodada recodificava as ~75 imagens, e o WebP e o JPEG mudam alguns bytes de uma máquina para outra: o git via tudo como mudado. `npm run images -- --tudo` refaz tudo.
- [ ] **VP-103** · [P3 · média] **O resto do bloqueio no celular** (82, com a meta de 90 ou mais). O que sobra, no celular simulado:
  - a montagem da interface inteira de uma vez (~300 ms simulados): o Índice, o Perfil e os textos das fichas. A ideia é montar o Índice e o Perfil só quando o navegador estiver livre (`requestIdleCallback`) ou na primeira vez que abrirem;
  - o envio das texturas para a placa de vídeo, em pedaços menores;
  - o Speed Index (4,6 s) é a própria abertura, com as letras caindo e as partículas. Só muda se você quiser uma abertura mais curta no celular. *Decisão sua.*
  *Prompt:* "faz a VP-103 e mede antes e depois."
- [ ] **VP-104** · [P3 · pequena] **A sala em pé, maior.** Depois da VP-96, o cartão da vez fica inteiro no meio do corredor, mas pequeno (uns 140 px de largura numa tela de 390). Trazer mais perto da câmera (em `src/gl/gallery.ts`, o `zr` do da vez quando `portrait`), conferindo que ele não tapa a etiqueta nem some ao passar.
- [ ] **VP-105** · [P2 · média] **Vídeos que precisam de alguém jogando:** o DRIFT (`D:\www\bhop-surf`), o Jardim (no Jadesun) e o passeio no Laboratório ("a volta na ilha" do plano da VP-95; o vídeo de hoje é a praça parada, com a logo girando). Os três só se mexem com teclas, então o gravador ganharia um roteiro de entradas (andar, pular, virar a câmera) entre a espera e a gravação. O DRIFT e o Jardim só rodam neste computador: gravar daqui.
  *Prompt:* "faz a VP-105 com o DRIFT primeiro."
- [ ] **VP-106** · [P3 · pequena] **Foto e vídeo iguais no primeiro quadro.** Quando o vídeo entra sobre a foto, o conteúdo muda um pouco, porque a foto é de outro dia. A ideia: o `npm run videos` também salvar o quadro de 0,6 s (o começo do laço) como a foto do cartão, em `media/sites/<id>.jpg`, e o `npm run images` refazer o cartão, a versão de 800 px e a prévia. *Muda as fotos dos cartões e as prévias de compartilhamento: decisão sua.*

---

## 14. Rotinas (o que fazer quando…)

- **Um site mudou** (o vitordemantova ganhou uma tela nova, o Portal Solar mudou de cara):
  1. uma captura nova de 1440 × 900 em `media/sites/<id>.jpg`;
  2. `npm run images` (só refaz o que mudou);
  3. `npm run videos -- <id>`, e olhar três quadros do vídeo (o começo, o meio e o fim);
  4. `npm run check`, e publicar.
- **Antes de publicar:** `npm run check` e `npm run build`; depois `npm run preview`, olhando `/` e `/pt` em 1440 e 390 px, com e sem `?webgl`.
- **Uma vez por mês:** o Lighthouse no endereço público, no celular e no computador, com uma linha no Registro.
- **Ao trocar o domínio (VP-82):** mudar `SITE.url` em `src/data/site.ts`. As páginas, o `sitemap.xml`, os `hreflang` e as prévias acompanham sozinhos no próximo build.
- **Num computador novo:** `npm install`. Para os vídeos, o ffmpeg (ver o cabeçalho de `scripts/gravar-videos.mjs`). As telas de referência (VP-94) não vêm com o git: ficam em `ref/`.

---

## 15. Prompts prontos

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

**Um site mudou:**
> "O [projeto] mudou: tira foto nova, regrava o vídeo, confere os três quadros e publica."

**Vídeo num cartão que ainda não tem:**
> "Põe vídeo no cartão do [projeto]: [endereço], [girando / rolando], esperar [ ] s para carregar."

---

## 16. Registro

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
| 19/out/2026 | **A segunda rodada, no Windows:** a pasta `D:\www\vitor-petri-2027-V2` alinhada com o GitHub (64a287d), e tudo o que estava aberto e não dependia de você. | — |
| 19/out/2026 | As páginas em português: 24 endereços a mais, com `hreflang` e o sitemap nas duas línguas; o endereço segue a língua; a regra do `/pt` num arquivo só, com testes. | VP-101 |
| 19/out/2026 | Os vídeos nos cartões: cinco laços de 8 s (240 KB a 1 MB), gravados dos sites no ar pelo novo `npm run videos`; tocam no cartão da vez, nos dois motores. | VP-95 (VP-07, VP-33) |
| 19/out/2026 | O DRIFT (o bhop-surf) na galeria, fotografado do jogo rodando: 22 projetos. | VP-05 |
| 19/out/2026 | A sala no celular; o GitHub Actions ligado; `npm run analise` funcionando no Windows; o modo comparação lendo de `ref/`, fora do git; as telas de referência achadas (esperando o seu ok). | VP-94, 96, 98 |
| 19/out/2026 | Lighthouse local, celular simulado: de 63 para 82 (a maior pintura de 4,1 s para 1,9 s). Computador: 97/100/100/100. Acessibilidade, boas práticas e SEO em 100, também na página em português. | VP-99 |
| 19/out/2026 | `npm run images` só refaz o que mudou. 46 testes. Descartada: a VP-100 (o MP3 é o único original). Abertas: VP-103 a VP-106, e a seção de rotinas (§14). | VP-102, §13, §14 |

*Último número em uso: VP-106. O próximo é VP-107 (ou o primeiro número livre da categoria).*
