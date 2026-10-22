/* ════════════════════════════════════════════════════════════════════
   O FUNDO: o brilho lavanda das telas, num shader (TSL).

   Medido ponto a ponto na tela de abertura (3840 × 2160): é uma elipse que
   encosta nas quatro bordas da tela (raio = metade da largura na
   horizontal, metade da altura na vertical) e a cor cai em linha reta, nos
   valores sRGB, de #878EE9 no centro até o preto na borda:
       cor(r) = #878EE9 · (1 − r),   r = √(((x − ½)/½)² + ((y − ½)/½)²)
   Igual ao radial-gradient do CSS que está por baixo.

   O que o shader soma, de leve:
   · pontilhado (dithering): ±½ degrau de cor sorteado por pixel. Degradê
     escuro em 8 bits faz "degraus" visíveis; o ruído some com eles;
   · o centro do brilho segue o mouse um pouco (2% da tela) e respira
     devagar (±1,5% de intensidade). Com "reduzir movimento", parado;
   · desde a V2 (16/out/2026):
     – a abertura acende o brilho do centro para fora (VP-14);
     – a hora de Campinas muda a cor, sem perder a das telas (VP-17): o
       lavanda de dia, mais quente no fim da tarde, mais fundo à noite;
     – o brilho puxa de leve para a cor do cartão da vez (VP-93).
     A hora entra no máximo com 20% e o cartão com 12%: a cor medida manda.
   · VP-126 (22/out/2026): na cascata, o fundo vira papel claro (#f2f1ee),
     com um lavanda bem leve no meio, onde ficava o brilho (setLight).
════════════════════════════════════════════════════════════════════ */
import * as THREE from "three/webgpu";
import { hourTint } from "./hour";
import { Fn, uniform, vec2, vec3, vec4, float, length, clamp, screenUV, screenCoordinate, hash, sin, positionGeometry, sRGBTransferEOTF, time, mix, smoothstep } from "three/tsl";

export function createBackdrop(scene: THREE.Scene, reduced: boolean) {
  const uMouse = uniform(new THREE.Vector2(0, 0));
  const uIntensity = uniform(1);
  /* a abertura: o raio do brilho, de 0 (um ponto) a 1 (encosta nas bordas) */
  const uSpread = uniform(1);
  const uBreath = uniform(reduced ? 0 : 1);
  /* as cores ficam em vetores (valores sRGB crus: a conta é feita em sRGB, como a medida) */
  const uHour = uniform(new THREE.Vector3(1, 1, 1));
  const uHourAmt = uniform(0);
  const uCard = uniform(new THREE.Vector3(135 / 255, 142 / 255, 233 / 255));
  const uCardAmt = uniform(0);
  /* VP-126: 0 = o brilho no escuro (a fila e a sala), 1 = o papel claro (a cascata) */
  const uLight = uniform(0);
  /* ?hora=18 no endereço finge a hora (para conferir as cores) */
  const fake = new URLSearchParams(location.search).get("hora");

  const mat = new THREE.MeshBasicNodeMaterial({ depthTest: false, depthWrite: false });
  /* o retângulo cobre a tela inteira, direto no espaço de recorte */
  mat.vertexNode = vec4(positionGeometry.xy, 0, 1);
  mat.colorNode = Fn(() => {
    const center = vec2(0.5, 0.5).add(uMouse.mul(0.02));
    const p = screenUV.sub(center).div(0.5);
    const r = length(p);
    const breath = float(1).add(sin(time.mul(0.55)).mul(0.015).mul(uBreath));
    /* o raio cresce na abertura: a mesma reta, só que até onde o brilho já chegou */
    const spread = uSpread.max(0.001);
    const k = clamp(float(1).sub(r.div(spread)), 0, 1).mul(uIntensity).mul(breath).mul(smoothstep(0, 0.35, spread).mul(0.4).add(0.6));
    /* a cor: a das telas, com a hora e o cartão por cima (em sRGB, como a medida) */
    const base = vec3(135 / 255, 142 / 255, 233 / 255);
    const withHour = mix(base, uHour, uHourAmt);
    const col = mix(withHour, uCard, uCardAmt);
    /* o pontilhado, em valores sRGB (meio degrau de 1/255 para cada lado) */
    const n = hash(screenCoordinate.x.add(screenCoordinate.y.mul(4099.0))).sub(0.5).div(255);
    /* VP-126: o papel, com o lavanda de leve no meio (na mesma elipse do brilho) */
    const paper = vec3(0.949, 0.945, 0.933);
    const lightCol = mix(paper, vec3(0.86, 0.87, 0.97), clamp(float(1).sub(r), 0, 1).mul(0.32));
    const srgb = clamp(mix(col.mul(k), lightCol, uLight).add(n), 0, 1);
    /* a saída do renderizador converte de linear para sRGB: devolve linear */
    return sRGBTransferEOTF(srgb) as unknown as ReturnType<typeof vec3>;
  })();

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -100;
  scene.add(mesh);

  const setHour = () => {
    const d = new Date();
    if (fake !== null && !Number.isNaN(Number(fake))) d.setUTCHours((Number(fake) + 3) % 24, 0, 0, 0);
    const { color, amount } = hourTint(d);
    uHour.value.set(color[0], color[1], color[2]);
    uHourAmt.value = amount * 0.36;
  };
  setHour();
  const timer = window.setInterval(setHour, 60_000);

  return {
    /** o mouse em −1…1 (alisado por quem chama) */
    setMouse: (x: number, y: number) => uMouse.value.set(x, -y),
    /** 0…1: a abertura acende o brilho */
    setIntensity: (v: number) => { uIntensity.value = v; },
    /** VP-126: 0…1: o quanto o fundo é o papel claro (a cascata) */
    setLight: (v: number) => { uLight.value = v; },
    /** 0…1: até onde o brilho chegou (a abertura, do centro para fora) */
    setSpread: (v: number) => { uSpread.value = v; },
    /** a cor do cartão da vez e o quanto ela entra (até 0,12) */
    setCard: (c: THREE.Color, amt: number) => {
      c.getRGB(tmp, THREE.SRGBColorSpace);
      /* só o tom do cartão entra, com o brilho do lavanda medido (o maior canal = 233/255):
         um cartão escuro não apaga o fundo, e um cinza (sem cor) não entra */
      const mx = Math.max(tmp.r, tmp.g, tmp.b, 1e-3), mn = Math.min(tmp.r, tmp.g, tmp.b);
      const sat = (mx - mn) / mx, k = 233 / 255 / mx;
      uCard.value.set(tmp.r * k, tmp.g * k, tmp.b * k);
      uCardAmt.value = Math.min(0.12, amt) * Math.min(1, sat * 1.6);
    },
    dispose: () => window.clearInterval(timer),
  };
}
const tmp = { r: 0, g: 0, b: 0 };
