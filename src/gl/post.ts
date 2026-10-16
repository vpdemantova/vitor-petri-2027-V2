/* ════════════════════════════════════════════════════════════════════
   O PÓS-PROCESSAMENTO (VP-30, 16/out/2026), em TSL, só no 3D (a interface
   fica por cima, intacta):
   · o brilho (bloom) só aparece com o gesto: parada, a galeria fica limpa;
     rolando depressa, o que é claro acende e deixa um rastro de luz, e
     some quando para (a regra do site pessoal: efeito em repouso é
     enfeite; com o gesto, é resposta);
   · um grão de filme bem fino, de média zero (não clareia nem escurece) e
     mais fraco nas partes escuras, como numa película. Com "reduzir
     movimento", o grão fica parado.
   ?semefeitos no endereço desliga tudo (para comparar).
════════════════════════════════════════════════════════════════════ */
import * as THREE from "three/webgpu";
import { pass, uniform, Fn, vec4, float, hash, screenCoordinate, time, dot, vec3, mix, smoothstep, renderOutput } from "three/tsl";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";

export function createPost(renderer: THREE.WebGPURenderer, scene: THREE.Scene, camera: THREE.Camera, reduced: boolean) {
  const pipeline = new THREE.RenderPipeline(renderer);
  const scenePass = pass(scene, camera);
  const color = scenePass.getTextureNode("output");
  const uBloom = uniform(0);
  const uGrain = uniform(0.032);
  const uMove = uniform(reduced ? 0 : 1);
  const glow = bloom(color, uBloom, 0.55, 0.62);
  /* o grão é somado já em sRGB (no linear, ele estouraria nos pretos): a saída é feita aqui */
  pipeline.outputColorTransform = false;

  pipeline.outputNode = Fn(() => {
    const c = renderOutput(color.add(glow)).toVar();
    /* o grão: um sorteio por pixel (e por quadro, se pode mexer), centrado no zero */
    const seed = screenCoordinate.x.add(screenCoordinate.y.mul(1931.0)).add(time.mul(60).floor().mul(uMove).mul(7919));
    const n = hash(seed).sub(0.5);
    const lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
    const amt = uGrain.mul(mix(float(0.35), float(1), smoothstep(0.0, 0.25, lum)));
    return vec4(c.rgb.add(n.mul(amt)), 1);
  })();

  return {
    render: () => pipeline.render(),
    /** 0…1: a velocidade da galeria acende o brilho */
    setMotion: (v: number) => { uBloom.value = Math.min(0.9, v * 1.1); },
  };
}
