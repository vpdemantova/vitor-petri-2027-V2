/* A cor do brilho pela hora de Campinas (VP-17): conta pura, sem three.js
   (gl/backdrop.ts usa; gl/math.test.ts confere). */

/**
 * A cor da hora em Campinas (UTC−3, sem horário de verão desde 2019) e o
 * quanto ela entra (0…1). De dia (9h–16h) fica a cor das telas.
 */
export function hourTint(date = new Date()): { color: [number, number, number]; amount: number } {
  const h = ((date.getUTCHours() - 3 + 24) % 24) + date.getUTCMinutes() / 60;
  /* os pontos do dia: [hora, cor sRGB, quanto] */
  const keys: [number, [number, number, number], number][] = [
    [0, [70, 74, 168], 0.55],    // madrugada: o lavanda mais fundo e azul
    [5.5, [70, 74, 168], 0.5],
    [7, [214, 150, 200], 0.28],  // o nascer: rosado
    [9, [135, 142, 233], 0],     // o dia: a cor medida das telas
    [16, [135, 142, 233], 0],
    [17.8, [236, 160, 128], 0.3], // o fim da tarde: quente
    [19.3, [150, 110, 200], 0.32],
    [21, [70, 74, 168], 0.5],    // a noite
    [24, [70, 74, 168], 0.55],
  ];
  let i = 0;
  while (i < keys.length - 2 && keys[i + 1][0] <= h) i++;
  const [h0, c0, a0] = keys[i], [h1, c1, a1] = keys[i + 1];
  const t = Math.min(1, Math.max(0, (h - h0) / (h1 - h0)));
  const s = t * t * (3 - 2 * t);
  return { color: [0, 1, 2].map((j) => (c0[j] + (c1[j] - c0[j]) * s) / 255) as [number, number, number], amount: a0 + (a1 - a0) * s };
}
