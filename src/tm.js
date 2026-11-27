import timing from './timing.json';
export const S = Object.fromEntries(timing.shots.map((s) => [s.key, s]));
export const keys = timing.shots.map((s) => s.key);
export const CUTS = keys.map((k, i) => (i === 0 ? 0 : (timing.shots[i - 1].end + timing.shots[i].start) / 2));
export const END = timing.duration;
export const cutEnd = (k) => { const i = keys.indexOf(k); return i + 1 < keys.length ? CUTS[i + 1] : END; };
export const norm = (w) => w.toLowerCase().replace(/[^a-z]/g, '');
export const wordIdx = (k, w, occ = 0) => { let n = 0; const ws = S[k].text.split(/\s+/); for (let i = 0; i < ws.length; i++) if (norm(ws[i]) === norm(w)) { if (n === occ) return i; n++; } throw new Error('word not found: ' + k + ' ' + w); };
// start time of word idx (or word string) inside shot k, from the audio-aligned word times
export const wordT = (k, x) => { const i = typeof x === 'string' ? wordIdx(k, x) : x; const wt = S[k].wt; return (wt[Math.min(i, wt.length - 1)] || [S[k].end])[0]; };
export const wordE = (k, x) => { const i = typeof x === 'string' ? wordIdx(k, x) : x; const wt = S[k].wt; return (wt[Math.min(i, wt.length - 1)] || [0, S[k].end])[1]; };
export const ease = (t, a, b) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
export function warpU(T, t) {
  const n = T.length; if (t <= T[0]) return 0; if (t >= T[n - 1]) return 1;
  const sec = []; for (let i = 0; i < n - 1; i++) sec.push((1 / (n - 1)) / (T[i + 1] - T[i]));
  const m = [0]; for (let i = 1; i < n - 1; i++) m.push(2 * sec[i - 1] * sec[i] / (sec[i - 1] + sec[i])); m.push(0);
  let i = 0; while (t > T[i + 1]) i++;
  const h = T[i + 1] - T[i], x = (t - T[i]) / h, x2 = x * x, x3 = x2 * x;
  return (2 * x3 - 3 * x2 + 1) * (i / (n - 1)) + (x3 - 2 * x2 + x) * h * m[i] + (-2 * x3 + 3 * x2) * ((i + 1) / (n - 1)) + (x3 - x2) * h * m[i + 1];
}
