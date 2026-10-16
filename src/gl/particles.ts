/* ════════════════════════════════════════════════════════════════════
   AS PARTÍCULAS DA ABERTURA (VP-32, 16/out/2026).

   Milhares de pontos boiam no brilho e vão formando o logotipo VITOR
   PETRI de baixo para cima, conforme as imagens chegam (o mesmo sentido
   do enchimento de antes). Quando tudo chegou, o logotipo de verdade
   (o SVG, nítido) acende por cima, voa para o canto, e os pontos se
   desfazem no brilho e somem. Uma vez por visita, e só na abertura.

   A simulação roda na placa de vídeo, num "compute shader" escrito em TSL:
   no WebGPU ele vira um compute de verdade; no WebGL2, o three.js faz a
   mesma conta com transform feedback. Cada ponto tem a posição, a
   velocidade e o alvo (um ponto dentro das letras, sorteado do desenho do
   logotipo num canvas), mais a "vez" dele (de baixo para cima).
   Os pontos ficam presos à câmera, numa placa a 3 m: o pixel da tela e o
   ponto 3D coincidem, e o alvo cai exatamente sobre o SVG.

   Com "reduzir movimento", sem partículas (fica o enchimento em SVG).
════════════════════════════════════════════════════════════════════ */
import * as THREE from "three/webgpu";
import {
  Fn, uniform, instancedArray, instanceIndex, vec3, vec4, float, sin, cos, mix, smoothstep, uv, length,
} from "three/tsl";
import { wordmarkGlyphs, WORDMARK_OV } from "../ui/wordmark";

const DEPTH = 3;

export interface IntroParticles {
  /** 0…1: a fração das imagens que chegou (os pontos chegam junto, de baixo para cima) */
  setProgress: (p: number) => void;
  /** os pontos se desfazem; resolve quando sumiram */
  burst: () => Promise<void>;
  update: (dt: number) => void;
  dispose: () => void;
}

/** Os alvos: pontos sorteados dentro das letras, em pixels da tela. */
function sample(rect: DOMRect, count: number): Float32Array {
  const { glyphs, width } = wordmarkGlyphs();
  const H = 1000 + WORDMARK_OV * 2;
  const s = rect.height / H;
  const cw = Math.ceil(rect.width), ch = Math.ceil(rect.height);
  const cv = document.createElement("canvas");
  cv.width = cw; cv.height = ch;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.scale(s * (rect.width / (width * s)), s);
  ctx.translate(0, WORDMARK_OV);
  ctx.fillStyle = "#fff";
  for (const g of glyphs) { ctx.save(); ctx.translate(g.x, 0); ctx.fill(new Path2D(g.d), "evenodd"); ctx.restore(); }
  const data = ctx.getImageData(0, 0, cw, ch).data;
  const inside: number[] = [];
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (data[(y * cw + x) * 4 + 3] > 140) inside.push(x, y);
  const out = new Float32Array(count * 2);
  const n = inside.length / 2;
  for (let i = 0; i < count; i++) {
    const j = Math.floor(Math.random() * n);
    out[i * 2] = rect.left + inside[j * 2] + Math.random();
    out[i * 2 + 1] = rect.top + inside[j * 2 + 1] + Math.random();
  }
  return out;
}

export function createIntroParticles(renderer: THREE.WebGPURenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, rect: DOMRect): IntroParticles | null {
  if (rect.width < 10 || rect.height < 4) return null;
  const small = window.innerWidth < 760;
  const N = small ? 7000 : 16000;
  const W = window.innerWidth, Hs = window.innerHeight;
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * DEPTH;
  const halfW = halfH * (W / Hs);
  const px = (2 * halfH) / Hs;            // metros por pixel, na placa
  const toX = (x: number) => (x / W) * 2 * halfW - halfW;
  const toY = (y: number) => halfH - (y / Hs) * 2 * halfH;

  const targetsPx = sample(rect, N);
  const pos = new Float32Array(N * 4), tgt = new Float32Array(N * 4);
  const cx = toX(rect.left + rect.width / 2), cy = toY(rect.top + rect.height / 2);
  for (let i = 0; i < N; i++) {
    const tx = toX(targetsPx[i * 2]), ty = toY(targetsPx[i * 2 + 1]);
    /* a vez: de baixo para cima, com um pouco de sorte para a borda não ser reta */
    const order = 1 - (targetsPx[i * 2 + 1] - rect.top) / rect.height;
    tgt.set([tx, ty, 0, Math.min(0.97, Math.max(0, order * 0.9 + Math.random() * 0.08))], i * 4);
    /* o começo: espalhados no brilho, mais densos no meio */
    const a = Math.random() * Math.PI * 2, r = Math.pow(Math.random(), 0.7) * halfH * 1.3;
    pos.set([Math.cos(a) * r * (W / Hs) * 0.8, Math.sin(a) * r * 0.75, (Math.random() - 0.5) * 0.8, Math.random()], i * 4);
  }

  const P = instancedArray(pos, "vec4");
  const V = instancedArray(new Float32Array(N * 4), "vec4");
  const T = instancedArray(tgt, "vec4");
  const uProg = uniform(0), uBurst = uniform(0), uDt = uniform(1 / 60), uT = uniform(0);
  const uCenter = uniform(new THREE.Vector3(cx, cy, 0));

  const step = Fn(() => {
    const p = P.element(instanceIndex);
    const v = V.element(instanceIndex);
    const g = T.element(instanceIndex);
    const arrive = smoothstep(g.w, g.w.add(0.07), uProg).mul(float(1).sub(uBurst.mul(1.4)).max(0));
    const seed = p.w.mul(6.2831);
    /* uma correnteza barata (senos que mudam com o lugar e o tempo) */
    const swirl = vec3(
      sin(p.y.mul(1.9).add(uT.mul(0.55)).add(seed)),
      cos(p.x.mul(1.4).sub(uT.mul(0.45)).add(seed.mul(1.7))),
      sin(p.x.add(p.y).mul(0.8).add(seed.mul(2.3))).mul(0.4),
    );
    const toT = g.xyz.sub(p.xyz);
    /* chegando: a mola até o alvo; boiando: a correnteza; no fim, o vento para fora e para cima */
    const outward = p.xyz.sub(uCenter).normalize().mul(uBurst.mul(2.2)).add(vec3(0, 0.5, 0.6).mul(uBurst));
    const acc = toT.mul(arrive.mul(34)).add(swirl.mul(mix(float(0.22), float(0.02), arrive).add(uBurst.mul(1.2)))).add(outward);
    const drag = mix(float(1.4), float(11.6), arrive);
    v.xyz.assign(v.xyz.add(acc.mul(uDt)).mul(float(1).sub(drag.mul(uDt)).max(0)));
    p.xyz.addAssign(v.xyz.mul(uDt));
  })().compute(N);

  const mat = new THREE.SpriteNodeMaterial({ transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const posAttr = P.toAttribute();
  const tgtAttr = T.toAttribute();
  mat.positionNode = posAttr.xyz;
  const arriveR = smoothstep(tgtAttr.w, tgtAttr.w.add(0.07), uProg);
  mat.scaleNode = mix(float(2.3), float(1.55), arriveR).mul(px).mul(window.devicePixelRatio > 1.5 ? 1 : 1.15);
  mat.colorNode = vec4(mix(vec3(0.72, 0.74, 1.0), vec3(1, 1, 1), arriveR), 1);
  mat.opacityNode = Fn(() => {
    const d = length(uv().sub(0.5));
    const dot = smoothstep(0.5, 0.12, d);
    /* boiando, fracos; no logotipo, fortes; no fim, cada um some na sua hora */
    const base = mix(float(0.16), float(0.9), arriveR);
    const fade = float(1).sub(smoothstep(posAttr.w.mul(0.45), posAttr.w.mul(0.45).add(0.55), uBurst));
    return dot.mul(base).mul(fade);
  })();
  const sprite = new THREE.Sprite(mat);
  sprite.count = N;
  sprite.frustumCulled = false;
  sprite.renderOrder = 50;
  sprite.position.set(0, 0, -DEPTH);
  if (!camera.parent) scene.add(camera);
  camera.add(sprite);

  let burstT = -1, resolveBurst: (() => void) | null = null, t = 0, prog = 0, progGoal = 0, dead = false;
  return {
    setProgress: (p) => { progGoal = p; },
    burst: () => new Promise<void>((res) => { burstT = 0; resolveBurst = res; }),
    update: (dt) => {
      /* depois de sumir, nada mais roda (os buffers já foram liberados) */
      if (dead) return;
      t += dt;
      prog += (progGoal - prog) * (1 - Math.exp(-dt * 5));
      uProg.value = prog; uT.value = t; uDt.value = Math.min(dt, 1 / 30);
      if (burstT >= 0) {
        burstT += dt;
        uBurst.value = Math.min(1, burstT / 1.9);
        if (burstT > 2.1 && resolveBurst) { resolveBurst(); resolveBurst = null; }
      }
      renderer.compute(step);
    },
    dispose: () => {
      if (dead) return;
      dead = true;
      camera.remove(sprite);
      mat.dispose();
      sprite.geometry.dispose();
    },
  };
}
