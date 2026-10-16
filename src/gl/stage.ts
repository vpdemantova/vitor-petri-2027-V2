/* ════════════════════════════════════════════════════════════════════
   O PALCO: o renderizador, a cena, a câmera e o laço de quadros.

   · WebGPU quando o navegador tem (Chrome, Edge, Safari 26+), e o mesmo
     código cai sozinho para WebGL2 quando não tem: o WebGPURenderer do
     three.js escolhe o "backend" e os materiais são escritos em TSL (a
     linguagem de nós do three), que vira WGSL ou GLSL conforme o caso.
   · A resolução se adapta: se o quadro passa de 20 ms por um segundo, a
     densidade de pixels baixa um degrau (até 1); se sobra folga por
     alguns segundos, sobe de volta.
   · O laço para quando a aba some (nada roda escondido).
   · Quem quiser desenhar de outro jeito (o pós-processamento, gl/post.ts)
     troca a função de desenhar com setRender.
════════════════════════════════════════════════════════════════════ */
import * as THREE from "three/webgpu";

export interface Stage {
  renderer: THREE.WebGPURenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  backend: "WebGPU" | "WebGL2";
  onFrame: (fn: (dt: number, t: number) => void) => void;
  /** troca o desenho do quadro (o padrão é renderer.render(scene, camera)) */
  setRender: (fn: () => void) => void;
  start: () => void;
}

export async function createStage(canvas: HTMLCanvasElement): Promise<Stage> {
  /* ?webgl no endereço força o WebGL2 (para testar o caminho de reserva) */
  const forceWebGL = new URLSearchParams(location.search).has("webgl");
  const renderer = new THREE.WebGPURenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance", forceWebGL });
  await renderer.init();
  const backend = (renderer.backend as unknown as { isWebGPUBackend?: boolean }).isWebGPUBackend ? "WebGPU" : "WebGL2";
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 120);
  camera.position.set(0, 0, 0);

  /* a densidade de pixels: começa no da tela (até 2) e se ajusta */
  const maxDpr = Math.min(window.devicePixelRatio || 1, 2);
  let dpr = maxDpr;
  const resize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  const frames: ((dt: number, t: number) => void)[] = [];
  let last = performance.now(), slow = 0, fast = 0, running = false;
  let render = () => renderer.render(scene, camera);
  const loop = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    const ms = now - last;
    last = now;
    for (const f of frames) f(dt, now / 1000);
    render();
    /* o ajuste fino da resolução */
    if (ms > 20) { slow += dt; fast = 0; } else { fast += dt; slow = Math.max(0, slow - dt * 0.5); }
    if (slow > 1 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); slow = 0; resize(); }
    if (fast > 4 && dpr < maxDpr) { dpr = Math.min(maxDpr, dpr + 0.25); fast = 0; resize(); }
    requestAnimationFrame(loop);
  };
  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(loop);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) running = false;
    else start();
  });

  return { renderer, scene, camera, backend, onFrame: (fn) => frames.push(fn), setRender: (fn) => { render = fn; }, start };
}
