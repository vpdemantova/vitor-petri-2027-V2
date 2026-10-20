/* ════════════════════════════════════════════════════════════════════
   A GALERIA: os projetos como cartões em profundidade (a tela "Home /
   Gallery" das referências). Refeita para a V2 em 16/out/2026.

   A FILA. Os cartões ficam ao longo do eixo da câmera, separados por D
   metros. A rolagem (roda, dedo, setas) anda por essa fila; o cartão da
   vez fica a FOCUS metros da câmera, no meio da tela. Os de trás ficam
   menores e mais escuros, espalhados pelos quatro cantos (como nas
   telas); o que passa da vez cresce, sai pelo lado e some. A fila não tem
   fim (dá a volta; com menos de três cartões, não dá).

   A FÍSICA da rolagem: a entrada soma no alvo; a posição persegue o alvo
   com uma mola criticamente amortecida; parada, encaixa no cartão mais
   perto. A velocidade entra nos shaders: o cartão dobra e as cores se
   separam nas bordas. Com "reduzir movimento", nada dobra.

   O QUE A V2 SOMOU:
   · os filtros do Índice valem para a fila (VP-20): só os da categoria
     ficam, numa troca que apaga e acende;
   · a onda (VP-31): ao encaixar num cartão novo, um anel sai do centro da
     imagem e assenta;
   · a profundidade de campo (VP-34): os de trás um pouco desfocados (o
     mipmap mais alto), o da vez nítido;
   · a inclinação (VP-35): o da vez segue o mouse, até 4°;
   · os cantos (VP-12): os sites têm o raio de uma janela de navegador; as
     peças impressas (design, música) ficam com o canto vivo das telas;
   · a capa das composições, desenhada na hora (ui/musiccard.ts);
   · a ordem da carga (VP-44): primeiro os cartões perto da vez;
   · A SALA (VP-91): com R, a fila vira uma galeria de verdade, os cartões
     nas duas paredes de um corredor, o chão e as paredes escuros, com o
     brilho lavanda no fundo; a rolagem anda pelo corredor;
   · para a ficha que nasce do cartão (VP-22): o retângulo do cartão na
     tela (screenRect) e o cartão que some enquanto a ficha está aberta.

   O QUE VEIO DEPOIS (19/out/2026):
   · OS VÍDEOS (VP-95): os sites com um laço gravado (a linha video: do
     arquivo do projeto, public/video/<id>.mp4) tocam no cartão da vez,
     mudos e em laço, quando a fila para nele; os outros ficam na foto. O
     vídeo só baixa quando o cartão vira a vez, entra num fade sobre a foto
     e pausa ao sair. Sem vídeo com "reduzir movimento", com a economia de
     dados ligada ou com ?semvideo no endereço;
   · a sala em pé (VP-96): o cartão da vez sai da parede para o meio do
     corredor, senão ficava cortado na borda da tela.

   Os materiais são escritos em TSL (three/tsl) e rodam em WebGPU ou WebGL2.
════════════════════════════════════════════════════════════════════ */
import * as THREE from "three/webgpu";
import {
  Fn, uniform, texture, uv, vec2, vec3, vec4, float, sin, positionLocal, positionWorld, clamp, mix, abs, length, max, min,
  smoothstep, fwidth, exp, normalize, fract, cameraPosition,
} from "three/tsl";
import { PROJECTS, aspectOf, colorOf, hasImage, imageUrl, videoUrl, type Category, type Project } from "../content/projects";
import { drawCover, loadCoverFonts } from "../ui/musiccard";
import { wrap, smoothstep as ss, easeOut, damp, clamp as clampJS, indexOf, shortestTarget, springStep, fitScale, visibility } from "./math";

export const D = 1.3;        // metros entre um cartão e o próximo (o de trás fica com ~75% do tamanho, como nas telas)
export const FOCUS = 3.35;   // a distância do cartão da vez até a câmera
const SITE_W = 2.0;          // a largura de um cartão de site (16:10)
const ART_H = 1.42;          // a altura máxima de uma peça em pé (design, música)
/* a sala */
const DR = 1.75;             // metros entre um cartão e o próximo no corredor (alternando as paredes)
const ZR = 5.2;              // a distância, no corredor, até o cartão da vez
const WR = 1.6;              // metade da largura do corredor
const FLOOR = -1.18;         // a altura do chão

/* para onde cada cartão "foge" quando não é a vez dele (x, y em metros) —
   o desenho das telas: em cima à direita, embaixo à esquerda, alternando */
const SPREAD: [number, number][] = [
  [0.86, 0.5], [-0.78, -0.5], [0.98, 0.36], [-0.9, -0.38], [0.72, 0.6], [-0.66, -0.6], [0.94, 0.48], [-0.84, -0.46],
];

const makeUniforms = () => ({
  vel: uniform(0), hover: uniform(0), alpha: uniform(0), dim: uniform(0), reveal: uniform(0),
  wave: uniform(1), blur: uniform(0), size: uniform(new THREE.Vector2(2, 1.25)), radius: uniform(0),
  /** VP-95: 0 = a foto, 1 = o vídeo */
  video: uniform(0),
});
type Uniforms = ReturnType<typeof makeUniforms>;

interface Card {
  project: Project;
  index: number;
  mesh: THREE.Mesh;
  w: number;
  h: number;
  u: Uniforms;
  map: ReturnType<typeof texture>;
  hover: number;
  rel: number;
  /** a posição na fila filtrada (−1: fora do filtro) */
  slot: number;
  /** 0…1: a ficha aberta esconde o cartão (VP-22) */
  hide: number;
  waveT: number;
  cover?: { canvas: HTMLCanvasElement; tex: THREE.CanvasTexture };
  /** VP-95: a textura do vídeo (só nos cartões com laço), o elemento e o quanto ele já entrou (0…1) */
  vmap: ReturnType<typeof texture> | null;
  vid?: { el: HTMLVideoElement; ready: boolean };
  vmix: number;
}

export type Filter = Category | "all";

export interface Gallery {
  update: (dt: number) => void;
  /** a entrada: soma (em "cartões") ao alvo */
  nudge: (cards: number) => void;
  /** VP-108: n passos decididos a partir do cartão inteiro mais perto do alvo (a roda): nunca volta sozinho */
  step: (n: number) => void;
  /** o alvo de agora, em cartões (o arrasto guarda de onde partiu) */
  target: () => number;
  /** VP-108: o alvo vai para um cartão inteiro e fica (o arrasto, ao soltar) */
  settle: (to: number) => void;
  /** vai até o projeto i (índice de PROJECTS) pelo caminho mais curto */
  goTo: (index: number) => void;
  /** em que projeto o ponteiro está (coordenadas −1…1), ou null */
  pick: (ndcX: number, ndcY: number) => number | null;
  setHover: (index: number | null) => void;
  /** o projeto da vez, o quão perto do foco ele está (0…1) e a posição dele na fila */
  active: () => { index: number; focus: number; slot: number };
  /** o canto de baixo à direita do cartão da vez, em pixels da tela */
  anchor: (out: { x: number; y: number }) => boolean;
  /** o retângulo que o cartão i ocupa na tela (para a ficha nascer dele) */
  screenRect: (index: number) => { x: number; y: number; w: number; h: number } | null;
  /** a abertura: os cartões chegam do fundo (0 → 1) */
  setReveal: (v: number) => void;
  setPointer: (x: number, y: number) => void;
  /** carrega as texturas, as de perto primeiro; resolve quando as de perto chegaram */
  load: (onProgress: (p: number) => void) => Promise<void>;
  setFilter: (f: Filter) => void;
  filter: () => Filter;
  /** os projetos da fila, na ordem (índices de PROJECTS) */
  order: () => number[];
  setHidden: (index: number | null) => void;
  setRoom: (on: boolean) => void;
  room: () => boolean;
  /** a velocidade da rolagem (0…1), para o brilho do pós-processamento e o som */
  speed: () => number;
  /** a cor do cartão da vez (VP-93) */
  color: () => THREE.Color;
  /** a língua mudou: as capas de música são desenhadas de novo */
  refreshCovers: () => void;
  /** quando a rolagem assenta num cartão novo */
  onSettle: (fn: (index: number) => void) => void;
  /** VP-99: compila os materiais de todos os cartões (e da sala) antes do primeiro quadro, sem travar a página */
  warm: () => Promise<void>;
}

export function createGallery(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGPURenderer, reduced: boolean): Gallery {
  const group = new THREE.Group();
  scene.add(group);
  /* uma malha só para todos: um plano 1 × 1 com divisões (para dobrar) */
  const geometry = new THREE.PlaneGeometry(1, 1, 32, 18);
  const placeholder = new THREE.Texture();

  const cards: Card[] = PROJECTS.map((project, index) => {
    const ar = aspectOf(project);
    const upright = project.category === "design" || project.category === "music";
    let w = SITE_W, h = SITE_W / ar;
    if (upright) { h = Math.min(ART_H, SITE_W / ar); w = h * ar; if (w > SITE_W) { w = SITE_W; h = w / ar; } }
    const u = makeUniforms();
    u.size.value.set(w, h);
    /* VP-12: o raio de uma janela de navegador nos sites; canto vivo no que é impresso */
    u.radius.value = upright ? 0 : 0.022;
    const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const map = texture(placeholder);
    /* VP-95: a segunda textura só existe nos cartões com vídeo (os outros não pagam a leitura a mais) */
    const vmap = project.video ? texture(placeholder) : null;
    /* a dobra: a curva no meio da largura, pela velocidade; e, na
       abertura, o cartão chega levemente curvado */
    mat.positionNode = Fn(() => {
      const p = positionLocal.toVar();
      const q = uv();
      const bend = sin(q.x.mul(Math.PI)).mul(u.vel).mul(0.32).add(sin(q.y.mul(Math.PI)).mul(u.vel).mul(0.08));
      p.z.addAssign(bend.add(sin(q.x.mul(Math.PI)).mul(float(1).sub(u.reveal)).mul(-0.6)));
      return p;
    })();
    /* a imagem: um pouco ampliada sob o mouse; a onda da troca; as cores
       separadas nas bordas conforme a velocidade; o desfoque dos de trás */
    mat.colorNode = Fn(() => {
      const q = uv().sub(0.5).mul(float(1).sub(u.hover.mul(0.045))).toVar();
      /* VP-31: o anel, na proporção do cartão (redondo, não oval) */
      const asp = u.size.x.div(u.size.y);
      const c = q.mul(vec2(asp, 1));
      const dist = length(c);
      const front = u.wave.mul(1.15);
      const ring = exp(dist.sub(front).pow(2).negate().div(0.006)).mul(float(1).sub(u.wave));
      q.addAssign(normalize(c.add(vec2(1e-5, 0))).div(vec2(asp, 1)).mul(ring).mul(0.022));
      q.addAssign(0.5);
      const edge = abs(q.x.sub(0.5)).mul(2);
      const shift = vec2(clamp(u.vel, -1, 1).mul(0.012).mul(edge.add(0.25)), 0);
      const r = map.sample(q.add(shift)).bias(u.blur).r;
      const g = map.sample(q).bias(u.blur).g;
      const b = map.sample(q.sub(shift)).bias(u.blur).b;
      /* o anel acende de leve a imagem por onde passa */
      const col = vec3(r, g, b).mul(float(1).add(ring.mul(0.07))).toVar();
      /* VP-95: o vídeo entra por cima da foto (só toca parado, então sem a separação das cores) */
      if (vmap) col.assign(mix(col, vmap.sample(q).rgb, u.video));
      /* longe, mais escuro (como os cartões de trás nas telas) */
      return vec4(mix(col, vec3(0.02, 0.02, 0.05), u.dim), 1);
    })();
    /* VP-12: o canto arredondado, pela distância até a borda (nítido em qualquer tamanho) */
    mat.opacityNode = Fn(() => {
      const p = uv().sub(0.5).mul(u.size);
      const q = abs(p).sub(u.size.mul(0.5)).add(u.radius);
      const d = length(max(q, 0)).add(min(max(q.x, q.y), 0)).sub(u.radius);
      const aa = fwidth(d);
      return u.alpha.mul(smoothstep(aa, aa.negate(), d));
    })();
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.scale.set(w, h, 1);
    mesh.userData.index = index;
    group.add(mesh);
    const card: Card = { project, index, mesh, w, h, u, map, hover: 0, rel: 0, slot: index, hide: 0, waveT: 1, vmap, vmix: 0 };
    if (project.category === "music" && !project.card) {
      const canvas = document.createElement("canvas");
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      card.cover = { canvas, tex };
    }
    return card;
  });

  /* ── a sala: o chão e as duas paredes (VP-91) ── */
  const uRoom = uniform(0), uScroll = uniform(0), uK = uniform(1);
  const roomGroup = new THREE.Group();
  scene.add(roomGroup);
  const surface = (kind: "floor" | "wall") => {
    const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide });
    m.colorNode = Fn(() => {
      /* a distância ao longo do corredor, e as juntas a cada DR metros, que andam com a rolagem */
      const z = positionWorld.z.negate().div(uK);
      const along = fract(z.add(uScroll).div(DR * 2));
      const joint = smoothstep(0.012, 0.0, abs(along.sub(0.5))).mul(0.06);
      /* a luz: o brilho lavanda que vem do fundo do corredor */
      const glow = smoothstep(4, 40, z).mul(0.32);
      const base = kind === "floor" ? vec3(0.035, 0.035, 0.06) : vec3(0.05, 0.05, 0.085);
      /* o chão reflete um pouco o brilho, mais perto do meio */
      const center = kind === "floor" ? clamp(float(1).sub(abs(positionWorld.x.div(uK)).div(WR)), 0, 1).mul(0.06) : float(0);
      return base.add(vec3(0.53, 0.56, 0.91).mul(glow.add(center).add(joint)));
    })();
    m.opacityNode = Fn(() => {
      const z = positionWorld.z.sub(cameraPosition.z).negate().div(uK);
      /* some no fundo (o brilho do fundo é o horizonte) e perto da câmera */
      return uRoom.mul(smoothstep(0.4, 2.2, z)).mul(float(1).sub(smoothstep(26, 46, z)));
    })();
    return m;
  };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), surface("floor"));
  floor.rotation.x = -Math.PI / 2;
  const wallL = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), surface("wall"));
  wallL.rotation.y = Math.PI / 2;
  const wallR = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), surface("wall"));
  wallR.rotation.y = -Math.PI / 2;
  for (const m of [floor, wallL, wallR]) { m.renderOrder = -50; m.frustumCulled = false; roomGroup.add(m); }

  /* ── a fila filtrada ── */
  let filt: Filter = "all";
  let order = cards.map((c) => c.index);
  let N = order.length;
  /* a troca de filtro: apaga (out), troca a ordem, acende (in) */
  let pendingFilter: Filter | null = null, filterFade = 1, filterDir = 0;

  /* ── a rolagem ── */
  let target = 0, pos = 0, vel = 0, idle = 0, reveal = 0;
  let roomOn = false, room = 0;
  const pointer = new THREE.Vector2();
  const camGoal = new THREE.Vector3();
  const look = new THREE.Vector3(0, 0, -FOCUS);
  let hovered: number | null = null, hidden: number | null = null;
  let k = 1, portrait = false, settled = -1;
  const settleSubs: ((i: number) => void)[] = [];
  const tint = new THREE.Color("#878ee9"), tmpC = new THREE.Color();
  const tmpV = new THREE.Vector3();

  const applyOrder = (f: Filter) => {
    const activeProject = order[indexOf(pos, N)];
    filt = f;
    order = cards.filter((c) => f === "all" || c.project.category === f).map((c) => c.index);
    if (!order.length) { filt = "all"; order = cards.map((c) => c.index); }
    N = order.length;
    for (const c of cards) c.slot = order.indexOf(c.index);
    /* o da vez continua na vez, se ficou; senão, o primeiro */
    const s = Math.max(0, order.indexOf(activeProject));
    target = pos = s; vel = 0; settled = -1;
  };

  /* VP-95: o vídeo do cartão, criado na primeira vez que ele é a vez */
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  const videoOK = !reduced && !nav.connection?.saveData && !new URLSearchParams(location.search).has("semvideo");
  const startVideo = (card: Card) => {
    const el = document.createElement("video");
    el.muted = true; el.loop = true; el.playsInline = true; el.preload = "auto";
    el.setAttribute("muted", ""); el.setAttribute("playsinline", "");
    el.src = videoUrl(card.project.video!);
    const vid = { el, ready: false };
    el.addEventListener("playing", () => { vid.ready = true; }, { once: true });
    el.addEventListener("error", () => { vid.ready = false; });
    const tex = new THREE.VideoTexture(el);
    tex.colorSpace = THREE.SRGBColorSpace;
    card.vmap!.value = tex;
    card.vid = vid;
  };
  /* com a aba escondida o laço de quadros para; os vídeos também (nada toca escondido) */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) for (const c of cards) if (c.vid && !c.vid.el.paused) c.vid.el.pause();
  });
  const videoFrame = (card: Card, want: boolean, dt: number) => {
    if (!card.vmap || !videoOK) return;
    if (want && !card.vid) startVideo(card);
    const v = card.vid;
    if (!v) return;
    if (want && v.el.paused) v.el.play().catch(() => { /* o navegador recusou: fica a foto */ });
    card.vmix = damp(card.vmix, want && v.ready ? 1 : 0, 5, dt);
    card.u.video.value = card.vmix;
    if (!want && card.vmix < 0.01 && !v.el.paused) v.el.pause();
  };

  const update = (dt: number) => {
    const fit = fitScale(camera.aspect || 1.6, camera.fov, SITE_W, FOCUS);
    k = fit.k; portrait = fit.portrait;
    uK.value = k;

    /* a troca de filtro */
    if (filterDir === -1) {
      filterFade = Math.max(0, filterFade - dt / (reduced ? 0.01 : 0.28));
      if (filterFade === 0 && pendingFilter) { applyOrder(pendingFilter); pendingFilter = null; filterDir = 1; }
    } else if (filterDir === 1) {
      filterFade = Math.min(1, filterFade + dt / (reduced ? 0.01 : 0.45));
      if (filterFade === 1) filterDir = 0;
    }

    /* o ímã: parado, encaixa no cartão mais perto (com menos de 3, sem passar das pontas) */
    idle += dt;
    if (N < 3) target = clampJS(target, 0, N - 1);
    if (idle > 0.18) target = damp(target, Math.round(target), 7, dt);
    ({ pos, vel } = springStep(pos, vel, target, dt));
    const speed = reduced ? 0 : clampJS(vel * 0.32, -1, 1);

    /* a sala entra e sai devagar */
    room = damp(room, roomOn ? 1 : 0, reduced ? 60 : 2.6, dt);
    const R = room * room * (3 - 2 * room);
    uRoom.value = R;

    /* a câmera: um pouco de paralaxe com o mouse; na fila olha o foco, na sala, o fundo do corredor */
    const par = reduced ? 0 : 1;
    camGoal.set(pointer.x * 0.22 * par * k * (1 - R * 0.6), pointer.y * 0.14 * par * k * (1 - R * 0.5), 0);
    camera.position.lerp(camGoal, 1 - Math.exp(-dt * 3.5));
    look.set(0, 0, -FOCUS * k).lerp(tmpV.set(pointer.x * 0.5 * par * k, -0.05 * k, -12 * k), R);
    camera.lookAt(look);

    /* o chão e as paredes, presos à câmera no eixo do corredor */
    const len = 60 * k;
    floor.scale.set(WR * 2 * k, len, 1); floor.position.set(0, FLOOR * k, -len / 2);
    wallL.scale.set(len, 3.2 * k, 1); wallL.position.set(-(WR + 0.6) * k, (FLOOR + 1.6) * k, -len / 2);
    wallR.scale.set(len, 3.2 * k, 1); wallR.position.set((WR + 0.6) * k, (FLOOR + 1.6) * k, -len / 2);
    uScroll.value = pos * DR;
    roomGroup.visible = R > 0.002;

    const L = N * D, LR = N * DR;
    const act = indexOf(pos, N);
    for (const card of cards) {
      const s = card.slot;
      if (s < 0) { card.mesh.visible = false; card.u.alpha.value = 0; continue; }
      const rel = wrap(s * D - pos * D, L, D, N);
      card.rel = rel;
      const away = ss(0, D * 0.95, Math.abs(rel));
      /* a abertura: os cartões vêm do fundo, um depois do outro */
      const rv = clampJS(reveal * 1.6 - s * 0.03 - Math.max(0, rel) * 0.035, 0, 1);
      const enter = (1 - easeOut(rv)) * 9;
      const spread = SPREAD[s % SPREAD.length];
      /* em pé, os vizinhos vão mais para cima e para baixo que para os lados */
      const sx = spread[0] * (portrait ? 0.42 : 1), sy = spread[1] * (portrait ? 1.9 : 1);
      const focus = 1 - ss(0.12, 0.55, Math.abs(rel) / D);
      /* VP-35: o da vez inclina com o mouse, até 4° */
      const tilt = reduced ? 0 : focus * 0.07;
      /* os de trás se afastam com a profundidade (senão convergem para o meio e somem atrás do da vez),
         e os em pé, mais estreitos, ganham o que falta da largura de um site: todos espiam pelos cantos */
      const deep = rel > D ? (FOCUS + rel) / (FOCUS + D) : 1;
      const narrow = Math.sign(sx) * Math.max(0, (SITE_W - card.w) * 0.5) * (portrait ? 0.3 : 1);
      const qx = (sx * deep + narrow) * away * k, qy = sy * deep * away * k, qz = (-FOCUS - rel - enter) * k;
      const qrx = spread[1] * 0.05 * away - pointer.y * tilt, qry = -spread[0] * 0.07 * away + pointer.x * tilt;
      let alphaQ = visibility(rel, L, D, N) * easeOut(rv);

      /* a sala: os cartões nas paredes, alternando os lados */
      let px = qx, py = qy, pz = qz, rx = qrx, ry = qry;
      if (R > 0.001) {
        const relR = wrap(s * DR - pos * DR, LR, DR, N);
        const side = s % 2 === 0 ? -1 : 1;
        const fR = 1 - ss(0.15, 0.7, Math.abs(relR) / DR);
        /* VP-96 (19/out/2026): em pé, o corredor é estreito e o da vez ficava cortado na parede;
           ele sai da parede para o meio, como um quadro tirado para olhar, e volta ao passar */
        const wr = WR * (portrait ? 0.62 : 1) * (1 - (portrait ? 0.9 : 0) * fR);
        const zr = (ZR + (portrait ? 2.6 : 0)) + relR;
        const toCam = Math.atan2(wr, zr);
        const yaw = side * -(Math.PI / 2 - 0.5) * (1 - fR) + side * -toCam * fR;
        const ex = side * wr * k, ey = 0.02 * k, ez = -zr * k - enter * k;
        /* some ao passar do lado da câmera, mostra uns oito à frente e entra pela volta sem pulo */
        const alphaR = ss(3.6, 4.8, zr) * (1 - ss(8 * DR, 11 * DR, relR)) * (N < 3 ? 1 : 1 - ss(LR - 2.1 * DR, LR - 1.55 * DR, relR)) * easeOut(rv);
        px = mix1(qx, ex, R); py = mix1(qy, ey, R); pz = mix1(qz, ez, R);
        rx = mix1(qrx, -pointer.y * tilt * 0.5, R); ry = mix1(qry, yaw + pointer.x * tilt * 0.4 * fR, R);
        alphaQ = mix1(alphaQ, alphaR, R);
        card.u.dim.value = mix1(clampJS(rel / (D * 3.4), 0, 0.55), clampJS(relR / (DR * 9), 0, 0.6), R);
        card.u.blur.value = reduced ? 0 : mix1(clampJS((rel - D * 0.5) / D, 0, 1.6), clampJS((relR - DR) / (DR * 4), 0, 1.4), R);
      } else {
        card.u.dim.value = clampJS(rel / (D * 3.4), 0, 0.55);
        /* VP-34: o desfoque começa no primeiro de trás e cresce até ~1,6 degrau de mipmap */
        card.u.blur.value = reduced ? 0 : clampJS((rel - D * 0.5) / D, 0, 1.6);
      }
      card.mesh.position.set(px, py, pz);
      card.mesh.rotation.set(rx, ry, 0);

      /* a ficha aberta esconde o cartão que virou ficha */
      card.hide = damp(card.hide, hidden === card.index ? 1 : 0, reduced ? 60 : 9, dt);
      card.u.alpha.value = alphaQ * filterFade * (1 - card.hide);
      /* VP-95: o laço toca no da vez, com a fila parada, depois da abertura e sem a ficha por cima */
      videoFrame(card, card.index === order[act] && Math.abs(vel) < 0.05 && Math.abs(target - pos) < 0.03 && reveal > 0.99 && card.hide < 0.01 && filterDir === 0, dt);
      card.u.vel.value = speed * (1 - R * 0.7);
      card.u.reveal.value = rv;
      card.hover = damp(card.hover, hovered === card.index ? 1 : 0, 8, dt);
      card.u.hover.value = card.hover;
      /* a onda */
      if (card.waveT < 1) { card.waveT = Math.min(1, card.waveT + dt / 1.15); card.u.wave.value = card.waveT; }
      const sc = 1 + card.hover * 0.025;
      card.mesh.scale.set(card.w * sc, card.h * sc, 1);
      card.mesh.visible = card.u.alpha.value > 0.002;
      /* de trás para a frente */
      card.mesh.renderOrder = -Math.round(mix1(rel, wrap(s * DR - pos * DR, LR, DR, N), R) * 10);
    }

    /* assentou num cartão novo: a onda e quem quiser saber (o som) */
    const vi = order[act];
    if (Math.abs(vel) < 0.05 && Math.abs(target - pos) < 0.02 && vi !== settled && filterDir === 0) {
      if (settled !== -1 && !reduced) { cards[vi].waveT = 0; }
      settled = vi;
      for (const fn of settleSubs) fn(vi);
    }
    /* a cor do brilho (VP-93) persegue a do cartão da vez */
    tmpC.set(colorOf(cards[vi].project));
    tint.lerp(tmpC, 1 - Math.exp(-dt * 1.6));
  };

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pick = (x: number, y: number) => {
    ndc.set(x, y);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(cards.filter((c) => c.mesh.visible && c.u.alpha.value > 0.5).map((c) => c.mesh), false);
    return hits.length ? (hits[0].object.userData.index as number) : null;
  };

  const activeIndex = () => order[indexOf(pos, N)];
  const corner = new THREE.Vector3();

  const project = (c: Card, x: number, y: number) => {
    corner.set(x, y, 0).applyMatrix4(c.mesh.matrixWorld).project(camera);
    return { x: (corner.x * 0.5 + 0.5) * window.innerWidth, y: (-corner.y * 0.5 + 0.5) * window.innerHeight, z: corner.z };
  };

  /* a carga: os de perto da vez primeiro */
  const loader = new THREE.ImageBitmapLoader();
  loader.setOptions({ imageOrientation: "flipY", premultiplyAlpha: "none" });
  const maxAniso = renderer.getMaxAnisotropy?.() ?? 8;
  /* VP-99: no celular (abaixo de 760 px, o mesmo corte do CSS) o cartão da vez tem uns 350 px de CSS;
     a textura de 800 px basta e chega antes (a de 1280 fica para o computador) */
  const small = innerWidth < 760;
  const cardImage = (name: string) => (small && hasImage(`${name}-m`) ? `${name}-m` : name);
  const loadCard = async (card: Card) => {
    if (card.cover) {
      await loadCoverFonts();
      drawCover(card.cover.canvas, card.project);
      card.cover.tex.needsUpdate = true;
      card.map.value = card.cover.tex;
      return;
    }
    if (!card.project.card) return;
    try {
      const bmp = await loader.loadAsync(imageUrl(cardImage(card.project.card)));
      const tex = new THREE.Texture(bmp as unknown as HTMLImageElement);
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, maxAniso);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.needsUpdate = true;
      card.map.value = tex;
    } catch (e) {
      console.warn("Não carregou:", card.project.card, e);
    }
  };

  return {
    update,
    nudge: (n) => { target += n; idle = 0; },
    /* idle acima de 0,18 s: o ímã fica ligado, e o alvo já é um cartão inteiro, então ele não puxa para trás */
    step: (n) => { target = Math.round(target) + n; idle = 0.5; },
    target: () => target,
    settle: (to) => { target = Math.round(to); idle = 0.5; },
    goTo: (i) => {
      const s = order.indexOf(i);
      if (s < 0) return;
      target = shortestTarget(target, s, N);
      idle = 0.5;
    },
    pick,
    setHover: (i) => { hovered = i; },
    active: () => {
      const i = activeIndex();
      const c = cards[i];
      const relQ = Math.abs(c.rel) / D;
      const relR = Math.abs(wrap(c.slot * DR - pos * DR, N * DR, DR, N)) / DR;
      const f = 1 - ss(0.12, 0.55, mix1(relQ, relR, room));
      return { index: i, focus: f * filterFade, slot: c.slot };
    },
    anchor: (out) => {
      const c = cards[activeIndex()];
      c.mesh.updateMatrixWorld();
      const p = project(c, 0.5, -0.5);
      if (p.z > 1) return false;
      out.x = p.x; out.y = p.y;
      return true;
    },
    screenRect: (i) => {
      const c = cards[i];
      /* vale também para o cartão escondido pela ficha (a posição dele continua sendo calculada) */
      if (!c || c.slot < 0) return null;
      c.mesh.updateMatrixWorld();
      const pts = [project(c, -0.5, -0.5), project(c, 0.5, -0.5), project(c, 0.5, 0.5), project(c, -0.5, 0.5)];
      if (pts.some((p) => p.z > 1)) return null;
      const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
      const x = Math.min(...xs), y = Math.min(...ys);
      return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
    },
    setReveal: (v) => { reveal = v; },
    setPointer: (x, y) => pointer.set(x, y),
    load: async (onProgress) => {
      /* primeiro o da vez, os dois de trás e o que passou; depois o resto, sem pressa */
      const s0 = indexOf(pos, N);
      const near = [0, 1, 2, -1].map((d) => cards[order[((s0 + d) % N + N) % N]]);
      const rest = cards.filter((c) => !near.includes(c));
      let done = 0;
      await Promise.all(near.map(async (c) => { await loadCard(c); onProgress(++done / near.length); }));
      (async () => { for (let i = 0; i < rest.length; i += 3) await Promise.all(rest.slice(i, i + 3).map(loadCard)); })();
    },
    setFilter: (f) => {
      if (f === (pendingFilter ?? filt)) return;
      pendingFilter = f; filterDir = -1;
    },
    filter: () => pendingFilter ?? filt,
    order: () => order.slice(),
    setHidden: (i) => { hidden = i; },
    setRoom: (on) => { roomOn = on; idle = 0.5; },
    room: () => roomOn,
    speed: () => Math.min(1, Math.abs(vel) * 0.32),
    color: () => tint,
    refreshCovers: () => {
      for (const c of cards) if (c.cover && c.map.value === c.cover.tex) { drawCover(c.cover.canvas, c.project); c.cover.tex.needsUpdate = true; }
    },
    onSettle: (fn) => { settleSubs.push(fn); },
    warm: async () => {
      /* todos à vista por um instante (só para a compilação; nada é desenhado) */
      const before = cards.map((c) => [c.mesh.visible, c.mesh.frustumCulled] as const);
      const room0 = roomGroup.visible;
      for (const c of cards) { c.mesh.visible = true; c.mesh.frustumCulled = false; }
      roomGroup.visible = true;
      try { await renderer.compileAsync(scene, camera); } finally {
        cards.forEach((c, i) => { c.mesh.visible = before[i][0]; c.mesh.frustumCulled = before[i][1]; });
        roomGroup.visible = room0;
      }
    },
  };
}

const mix1 = (a: number, b: number, t: number) => a + (b - a) * t;
