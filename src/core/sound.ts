/* ════════════════════════════════════════════════════════════════════
   O SOM (VP-90 "o site como instrumento" e VP-03, 16/out/2026).

   Desligado por padrão; liga no botão "Som" do pé da página (ou S), e a
   escolha fica guardada neste navegador.
   · Cada cartão tem uma nota, de uma escala pentatônica de ré em duas
     oitavas (a posição dele na fila). Ao assentar num cartão, a nota soa:
     rolar devagar toca as notas uma a uma; rolar depressa, um arpejo, e o
     andamento é o da mão. O timbre é feito na hora (Web Audio, nenhum
     arquivo): duas senoides e um sino curto, como uma celesta ao longe.
   · A gravação (a Chanson Antique): com o som ligado, ela entra baixinho
     quando o cartão dela está na vez (ou sob o mouse) e sai quando ele
     sai; na ficha, o tocador toca de verdade, com ou sem o som ligado
     (é um clique).
   Um som só por vez: quem toca a gravação na ficha cala a prévia.

   VP-114 (21/out/2026, "remova o som por enquanto"): o som do site está
   desligado por esta chave. Com ela em false, o botão Som e a tecla S somem,
   as notas e a prévia não tocam, e quem tinha deixado o som ligado (guardado
   no navegador) também não ouve nada. O tocador da gravação na ficha
   continua (ele só toca com um clique). Para voltar: true.
════════════════════════════════════════════════════════════════════ */
export const SOUND_ENABLED = false;
const KEY = "vp-som";
let on = false;
try { on = SOUND_ENABLED && localStorage.getItem(KEY) === "1"; } catch { /* sem armazenamento */ }
const subs = new Set<(on: boolean) => void>();

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const audioCtx = () => {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.22;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 5200;
    master.connect(lp).connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

export const soundOn = () => on;
export function onSound(fn: (on: boolean) => void) { subs.add(fn); fn(on); }
export function setSound(v: boolean) {
  if (!SOUND_ENABLED) return;
  on = v;
  try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* sem armazenamento */ }
  if (v) { audioCtx(); chime(7, 0.5); } else fadePreview(0);
  for (const fn of subs) fn(v);
}

/* a escala: ré pentatônico (ré, mi, fá#, lá, si), de ré4 para cima */
const PENTA = [0, 2, 4, 7, 9];
const freqOf = (n: number) => 293.66 * Math.pow(2, (PENTA[n % 5] + 12 * Math.floor(n / 5)) / 12);

let lastNote = 0;
/** A nota de um cartão (a posição na fila). */
export function chime(slot: number, vel = 1) {
  if (!on) return;
  const c = audioCtx();
  const now = c.currentTime;
  /* duas notas grudadas viram uma só (a mão que passa muito depressa) */
  if (now - lastNote < 0.045) return;
  lastNote = now;
  const f = freqOf(slot % 10);
  const g = c.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.5 * vel, now + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0008, now + 1.6);
  g.connect(master!);
  for (const [mult, amp, type] of [[1, 1, "sine"], [2, 0.18, "sine"], [3.01, 0.05, "triangle"]] as const) {
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = type; o.frequency.value = f * mult;
    og.gain.value = amp;
    o.connect(og).connect(g);
    o.start(now); o.stop(now + 1.7);
  }
}

/* ── a gravação: a prévia na galeria e o tocador da ficha usam o mesmo <audio> ── */
const audio = new Audio();
audio.preload = "none";
audio.crossOrigin = "anonymous";
let previewOf: string | null = null, fadeTimer = 0;

function fadePreview(to: number, ms = 700) {
  window.clearInterval(fadeTimer);
  const from = audio.volume, t0 = performance.now();
  fadeTimer = window.setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    audio.volume = from + (to - from) * k;
    if (k === 1) { window.clearInterval(fadeTimer); if (to === 0 && previewOf) { audio.pause(); previewOf = null; } }
  }, 30);
}

/** Com o som ligado: a gravação entra baixinho (src) ou sai (null). */
export function preview(src: string | null) {
  if (playerOwns) return;
  if (!on || !src) { if (previewOf) fadePreview(0); return; }
  if (previewOf === src) return;
  previewOf = src;
  if (!audio.src.endsWith(src)) audio.src = src;
  audio.volume = 0;
  void audio.play().then(() => fadePreview(0.55, 1200)).catch(() => { previewOf = null; });
}

let playerOwns = false;
const playerSubs = new Set<() => void>();
/** O tocador da ficha: toca, pausa, a posição e a duração. */
export const player = {
  audio,
  toggle(src: string) {
    playerOwns = true; previewOf = null; window.clearInterval(fadeTimer);
    if (!audio.src.endsWith(src)) { audio.src = src; }
    audio.volume = 1;
    if (audio.paused) void audio.play(); else audio.pause();
  },
  playing: (src: string) => !audio.paused && audio.src.endsWith(src),
  seek(frac: number) { if (audio.duration) audio.currentTime = frac * audio.duration; },
  release() { if (playerOwns) { audio.pause(); playerOwns = false; } },
  onChange(fn: () => void) { playerSubs.add(fn); return () => playerSubs.delete(fn); },
};
for (const ev of ["play", "pause", "timeupdate", "ended", "loadedmetadata"]) audio.addEventListener(ev, () => { for (const fn of playerSubs) fn(); });
