/**
 * sound.ts
 * Synthesised sound effects via the Web Audio API.
 * No external audio files required — all tones generated on the fly.
 *
 * Browser policy: AudioContext must be resumed after a user gesture.
 * Call resumeAudio() on first user interaction.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function resumeAudio(): void {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
}

function tone(
  freq: number,
  durationSec: number,
  startOffset = 0,
  type: OscillatorType = 'sine',
  volume = 0.25
) {
  const c = getCtx();
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);

  osc.type = type;
  osc.frequency.value = freq;

  const t0 = c.currentTime + startOffset;
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec);

  osc.start(t0);
  osc.stop(t0 + durationSec + 0.01);
}

/** Soft thud when a piece is placed */
export function playDrop() {
  tone(220, 0.08, 0, 'triangle', 0.2);
}

/** Ascending fanfare on win */
export function playWin() {
  tone(523, 0.14, 0.00, 'sine', 0.3);
  tone(659, 0.14, 0.14, 'sine', 0.3);
  tone(784, 0.30, 0.28, 'sine', 0.3);
}

/** Low descending drone on loss */
export function playLose() {
  tone(294, 0.18, 0.00, 'sawtooth', 0.2);
  tone(247, 0.35, 0.18, 'sawtooth', 0.2);
}

/** Neutral double-tap on draw */
export function playDraw() {
  tone(392, 0.12, 0.00, 'triangle', 0.2);
  tone(370, 0.25, 0.13, 'triangle', 0.2);
}
