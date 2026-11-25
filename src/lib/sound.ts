/**
 * Tiny procedural sound-effects engine built on the Web Audio API — no external
 * audio files. Everything is synthesized (oscillators + filtered noise) so it
 * works offline and starts instantly on the user gesture that triggers it.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext })
    .webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** Call from inside the click handler that starts a sequence, so autoplay policies allow sound. */
export function primeAudio() {
  getCtx();
}

function createNoiseBuffer(audioCtx: AudioContext, duration: number): AudioBuffer {
  const length = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Rising filtered-noise sweep — used for the meteor's atmospheric entry. */
export function playWhoosh(duration = 1.0) {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;

  const noise = audioCtx.createBufferSource();
  noise.buffer = createNoiseBuffer(audioCtx, duration);

  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.8;
  filter.frequency.setValueAtTime(180, t0);
  filter.frequency.exponentialRampToValueAtTime(3400, t0 + duration * 0.9);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.35, t0 + duration * 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  noise.connect(filter).connect(gain).connect(audioCtx.destination);
  noise.start(t0);
  noise.stop(t0 + duration + 0.05);
}

/** Deep sub-bass thump layered with a filtered noise blast — the meteor impact. */
export function playImpactBoom() {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(160, t0);
  osc.frequency.exponentialRampToValueAtTime(32, t0 + 0.35);
  const oscGain = audioCtx.createGain();
  oscGain.gain.setValueAtTime(0.9, t0);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5);
  osc.connect(oscGain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.55);

  const noise = audioCtx.createBufferSource();
  noise.buffer = createNoiseBuffer(audioCtx, 0.6);
  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2200, t0);
  filter.frequency.exponentialRampToValueAtTime(140, t0 + 0.5);
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.8, t0);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.6);
  noise.connect(filter).connect(noiseGain).connect(audioCtx.destination);
  noise.start(t0);
  noise.stop(t0 + 0.65);
}

/** Brittle high-passed noise burst plus scattered crackle ticks — UI "shattering". */
export function playCrashSound() {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;

  const noise = audioCtx.createBufferSource();
  noise.buffer = createNoiseBuffer(audioCtx, 0.4);
  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(3000, t0);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.5, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
  noise.connect(filter).connect(gain).connect(audioCtx.destination);
  noise.start(t0);
  noise.stop(t0 + 0.4);

  for (let i = 0; i < 6; i++) {
    const dt = Math.random() * 0.3;
    const tick = audioCtx.createBufferSource();
    tick.buffer = createNoiseBuffer(audioCtx, 0.03);
    const tickFilter = audioCtx.createBiquadFilter();
    tickFilter.type = "highpass";
    tickFilter.frequency.value = 2500 + Math.random() * 2000;
    const tickGain = audioCtx.createGain();
    tickGain.gain.setValueAtTime(0.25, t0 + dt);
    tickGain.gain.exponentialRampToValueAtTime(0.001, t0 + dt + 0.05);
    tick.connect(tickFilter).connect(tickGain).connect(audioCtx.destination);
    tick.start(t0 + dt);
    tick.stop(t0 + dt + 0.06);
  }
}

/** Soft reverse whoosh finishing in a gentle major-triad shimmer — pieces flying home. */
export function playRestoreWhoosh() {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  const duration = 0.9;

  const noise = audioCtx.createBufferSource();
  noise.buffer = createNoiseBuffer(audioCtx, duration);
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(2600, t0);
  filter.frequency.exponentialRampToValueAtTime(300, t0 + duration);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.22, t0 + duration * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  noise.connect(filter).connect(gain).connect(audioCtx.destination);
  noise.start(t0);
  noise.stop(t0 + duration + 0.05);

  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const noteGain = audioCtx.createGain();
    const start = t0 + duration * 0.55 + i * 0.09;
    noteGain.gain.setValueAtTime(0.0001, start);
    noteGain.gain.exponentialRampToValueAtTime(0.18, start + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    osc.connect(noteGain).connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

/** Cheerful upward-sweeping "boing" — the punchline popup. */
export function playPopSound() {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(220, t0);
  osc.frequency.exponentialRampToValueAtTime(880, t0 + 0.12);
  osc.frequency.exponentialRampToValueAtTime(660, t0 + 0.22);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.4, t0 + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.32);
}
