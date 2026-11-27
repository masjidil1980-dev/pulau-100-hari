// The storyboard: where the narrator stands, how the camera moves, and the expression / pose events of every shot.
import {POSES, EXPR} from './hero.js';
import {groundY} from './terrain.js';
import {S, keys, CUTS, wordT, ease} from './tm.js';

const T = (k, x) => wordT(k, x);
const R = (ox, oy, oz, lx, ly, lz) => ({o: [ox, oy, oz], l: [lx, ly, lz]});   // relative to the narrator
const A_ = (px, py, pz, lx, ly, lz) => ({p: [px, py, pz], l: [lx, ly, lz]});  // absolute

export const SP = [-4.3, -42.6];   // narrator at the spring
export const SPRING = [-6, -44];

export const SHOTS = {
  d1: {light: 'dawn', A: [2, 14], B: [2, 14], keys: [A_(13, 1.0, 31, 2.5, 1.3, 14), A_(8.5, 1.7, 24, 2.2, 1.45, 14), A_(5.2, 1.9, 19.5, 2.0, 1.5, 14)],
    ev: [[-1, {pose: 'idle', expr: 'grim', speak: 1}]]},
  sunyi: {light: 'dawn', A: [2, 14], B: [-1.5, 9], keys: [R(1.4, 0.6, 3.6, 0, 1.4, 0), R(-2.2, 0.9, 3.3, 0, 1.4, 0), R(-3.4, 1.3, 3.1, 0.4, 1.5, 0)],
    ev: [[-1, {pose: 'sweep', expr: 'sad'}], [['sunyi', 'burung'], {pose: 'earcup', expr: 'think', look: [-1, 0.3]}], [['sunyi', 'gemerisik'], {look: [1, 0.2], tilt: 0.12}],
      [['sunyi', 'hanyalah'], {pose: 'idle', expr: 'grim', wind: 1, look: [0, 0], tilt: 0}]]},
  mati: {light: 'day', A: [-1.5, 9], B: [-1.5, 9], keys: [A_(-0.2, 1.7, 13, -1.5, 1.4, 9), A_(18, 20, 40, -1, 0, 6), A_(46, 58, 100, 0, -8, -6)],
    ev: [[-1, {pose: 'idle', expr: 'sad'}]]},
  ubah: {light: 'gold', A: [-1.5, 9], B: [-1.5, 9], keys: [R(1.7, 0.1, 3.5, 0, 1.5, 0), R(1.0, 0.25, 2.8, 0, 1.55, 0), R(0.3, 0.35, 2.3, 0, 1.55, 0)],
    ev: [[-1, {pose: 'idle', expr: 'grim', wind: 0.6}], [['ubah', 'semuanya'], {pose: 'fist', expr: 'determined', wind: 1.6}]]},
  misi: {light: 'gold', A: [-1.5, 9], B: [0.2, 9.2], keys: [R(-1.4, 0.5, 3.6, 0.5, 1.5, 0), R(0.6, 0.8, 3.3, 1.2, 1.6, 0), R(2.2, 1.0, 3.0, 1.6, 1.7, 0)],
    ev: [[-1, {pose: 'hips', expr: 'confident', wind: 0.5}], [['misi', 'seratus'], {pose: 'point', expr: 'determined'}], [['misi', 'mengubah'], {pose: 'fist', expr: 'confident', wind: 1}]]},
  nol: {light: 'day', A: [0, 0], B: [0, 0], keys: [R(1.1, 0.8, 3.4, 0, 1.4, 0), R(-1.6, 1.0, 3.2, 0, 1.5, 0), R(-0.6, 1.4, 3.0, 0.5, 1.6, 0)],
    ev: [[-1, {pose: 'hips', expr: 'warm'}], [['nol', 'hutan'], {pose: 'think', expr: 'think', look: [0.8, 0.7]}], [['nol', 'butuh'], {pose: 'open', expr: 'whisper', look: [0, 0]}], [['nol', 'air'], {pose: 'pointUp', expr: 'hope', look: [0.6, 0.8]}]]},
  kubur: {light: 'hot', A: [0, 0], B: [0, 0], keys: [R(0.7, 0.5, 2.7, 0.3, 0.9, 0), R(-0.5, 0.4, 2.2, 0.4, 0.7, 0.2), R(0.3, 0.9, 2.4, 0, 1.2, 0)],
    ev: [[-1, {pose: 'seed', expr: 'grim', crouch: 0.28, look: [0.4, -0.8]}], [['kubur', 'kuburan'], {expr: 'sad', tilt: -0.05}]]},
  lereng: {light: 'hot', A: [6, -20], B: [-6, -33], keys: [R(1.2, 0.9, 4.2, -0.6, 1.3, 0), R(-0.4, 1.0, 3.8, -0.4, 1.35, 0), R(1.0, 0.8, 3.9, -0.3, 1.4, 0)],
    ev: [[-1, {pose: 'idle', expr: 'hot', sweat: 1, dirt: 1}], [['lereng', 'panasnya'], {pose: 'fan', wobble: 0.18}], [['lereng', 'tanahnya'], {pose: 'wipe', wobble: 0.1, look: [0, -1]}]]},
  harap: {light: 'hot', A: SP, B: SP, keys: [R(1.3, 0.9, 3.6, -0.3, 1.0, 0), R(0.9, 0.8, 3.4, -0.9, 0.6, -0.5), R(1.8, 0.8, 3.6, -0.6, 0.9, -0.3)],
    ev: [[-1, {pose: 'touch', expr: 'think', crouch: 0.42, look: [-1, -0.6], sweat: 1}], [['harap', 'harapan'], {expr: 'hope'}], [['harap', 'lembap'], {expr: 'wow', crouch: 0.5}], [['harap', 'artinya'], {pose: 'think', expr: 'hope', crouch: 0.2}]]},
  gali: {light: 'hot', A: SP, B: SP, keys: [R(1.8, 0.9, 4.4, -0.5, 1.1, -0.3), R(-0.6, 0.9, 4.2, -0.5, 1.0, -0.3), R(0.9, 1.1, 3.8, -0.3, 1.2, -0.2)],
    ev: [[-1, {pose: 'dig', expr: 'effort', wobble: 0.5, sweat: 1, dirt: 1, tool: 1}]]},
  tetes: {light: 'hot', A: SP, B: SP, keys: [R(0.4, 0.6, 2.6, -1.1, 0.4, -0.8), R(-0.2, 0.7, 2.6, -1.1, 0.45, -0.8), R(0.9, 0.8, 3.4, 0, 1.4, 0)],
    beats: 'words:tetes:0,3,6',
    ev: [[-1, {pose: 'touch', expr: 'whisper', crouch: 0.45, look: [-1, -0.8], sweat: 1}], [['tetes', 'Tetesan'], {expr: 'wow'}], [['tetes', 'muncul'], {pose: 'cheer', expr: 'happy', crouch: 0, look: [0, 0]}]]},
  sungai: {light: 'gold', A: SP, B: SP, keys: [R(1.3, 0.8, 3.2, -0.5, 1.3, 0), A_(-2.5, 4.2, -26, -9, 0.5, -34), A_(-20, 9, 9, -16, 0, -12)],
    beats: 'words:sungai:0,8,24',
    ev: [[-1, {pose: 'open', expr: 'wow', crouch: 0.1}], [['sungai', 'mengalir'], {expr: 'happy', pose: 'cheer'}], [['sungai', 'membentuk'], {pose: 'open', expr: 'warm', crouch: 0}]]},
  refleksi: {light: 'gold', A: [-7, -20], B: [-7, -20], keys: [R(0.9, 0.8, 3.4, 0, 1.4, 0), R(0.2, 0.75, 3.0, 0, 1.45, 0), R(-0.4, 0.7, 2.7, 0, 1.5, 0)],
    ev: [[-1, {pose: 'idle', expr: 'sad'}], [['refleksi', 'Belum'], {pose: 'open', expr: 'warm'}], [['refleksi', 'dan'], {pose: 'idle', expr: 'warm', look: [0.7, 0.2]}]]},
  detak: {light: 'gold', A: [-7.2, -19.5], B: [-7.2, -19.5], keys: [R(0.2, 0.4, 3.4, -1.6, 0.5, 0), R(0.8, 0.7, 3.2, -0.6, 1.3, 0), R(0.0, 0.7, 2.8, -0.2, 1.45, 0)],
    ev: [[-1, {pose: 'chest', expr: 'warm'}], [['detak', 'detak'], {pose: 'chest', expr: 'happy', blush: 0.6}]]},
  seratus: {light: 'dusk', A: [-7.2, -19.5], B: [-7.2, -19.5], keys: [R(1.0, 0.7, 3.0, 0, 1.5, 0), A_(-1.5, 4.5, -12, -8, 0.5, -20), A_(7, 12, 0, -8, 0, -18)],
    ev: [[-1, {pose: 'idle', expr: 'warm'}]]},
  alir: {light: 'dusk', A: [-7.2, -19.5], B: [-7.2, -19.5], keys: [R(-1.6, 0.9, 3.0, 0, 1.45, 0), R(0.2, 0.8, 3.2, 0, 1.45, 0), R(1.4, 0.8, 3.0, 0, 1.45, 0)],
    ev: [[-1, {pose: 'open', expr: 'neutral'}], [['alir', 'Tapi'], {pose: 'open', expr: 'curious', look: [0.8, 0.3]}]]},
  nasib: {light: 'dusk', A: [-7.2, -19.5], B: [-7.2, -19.5], keys: [R(0.7, 0.7, 3.3, 0, 1.45, 0), R(0.4, 0.6, 2.7, 0, 1.5, 0), R(0.1, 0.5, 2.2, 0, 1.5, 0)],
    ev: [[-1, {pose: 'open', expr: 'confident'}], [['nasib', 'kalian'], {pose: 'point', expr: 'happy'}]]},
  tanya: {light: 'dusk', A: [-7.2, -19.5], B: [-7.2, -19.5], keys: [R(-1.3, 0.8, 3.1, 0, 1.45, 0), R(0.3, 0.8, 3.0, 0, 1.5, 0), R(1.5, 0.9, 3.0, 0, 1.5, 0)],
    ev: [[-1, {pose: 'think', expr: 'think', look: [0.8, 0.8], tilt: 0.1}], [['tanya', 'kedua'], {look: [-0.8, 0.5], tilt: -0.1}]]},
  pil1: {light: 'gold', A: [-6.8, -18], B: [-6.8, -18], keys: [R(1.0, 0.8, 3.6, -0.4, 1.4, 0), R(-0.6, 0.9, 3.8, -0.9, 1.1, 0), R(-0.2, 1.4, 4.2, -1.3, 0.8, -0.3)],
    ev: [[-1, {pose: 'seed', expr: 'hope', sapling: 1}], [['pil1', 'menanam'], {pose: 'seed', expr: 'happy', sapling: 1}], [['pil1', 'hutan'], {pose: 'open', expr: 'warm', sapling: 0}]]},
  pil2: {light: 'gold', A: [-13, -7.5], B: [-13, -7.5], keys: [R(0.9, 0.8, 3.6, 0.1, 1.2, 0), R(-0.8, 0.8, 3.8, -1.2, 0.8, -0.2), R(0.8, 1.2, 4.0, -0.9, 1.0, 0)],
    ev: [[-1, {pose: 'point', expr: 'determined'}], [['pil2', 'bendungan'], {pose: 'hips', expr: 'confident'}], [['pil2', 'musim'], {pose: 'fan', expr: 'hot', sweat: 1}]]},
  komen: {light: 'dusk', A: [-9, -13], B: [-9, -13], keys: [R(0.7, 0.8, 3.7, 0, 1.5, 0), R(0.3, 0.7, 3.0, 0, 1.6, 0), R(0.0, 0.7, 2.5, 0, 1.6, 0)],
    ev: [[-1, {pose: 'twoSigns', expr: 'happy'}], [['komen', 'terbanyak'], {pose: 'point', expr: 'confident'}]]},
  pamit: {light: 'dusk', A: [-9, -13], B: [-9, -13], keys: [R(0.8, 0.7, 3.2, 0, 1.5, 0), R(2.0, 2.2, 6.5, 0, 1.2, 0), R(3.6, 5.5, 13, 0, 0.5, 0)],
    ev: [[-1, {pose: 'wave', expr: 'warm', waveEl: 1}]]},
};

// ---- hero state, a pure function of time ----
const NUM = ['aL', 'eL', 'aR', 'eR', 'browL', 'browR', 'browY', 'blush', 'crouch', 'wind', 'tilt', 'wobble', 'lx', 'ly'];
function resolve(acc) {
  const p = POSES[acc.pose || 'idle'], e = EXPR[acc.expr || 'neutral'];
  return {
    num: {aL: p.aL, eL: p.eL, aR: p.aR, eR: p.eR, browL: e.browL, browR: e.browR, browY: e.browY, blush: e.blush + (acc.blush || 0), crouch: acc.crouch || 0, wind: acc.wind || 0, tilt: acc.tilt || 0, wobble: acc.wobble || 0, lx: acc.look ? acc.look[0] : 0, ly: acc.look ? acc.look[1] : 0},
    disc: {eyes: e.eyes, mouth: e.mouth, sweat: !!acc.sweat, dirt: !!acc.dirt, waveEl: !!acc.waveEl, tool: !!acc.tool, sapling: !!acc.sapling},
  };
}
const evCache = {};
function events(k) {
  if (evCache[k]) return evCache[k];
  evCache[k] = SHOTS[k].ev.map(([spec, patch]) => [spec === -1 ? -1 : Array.isArray(spec) ? T(spec[0], spec[1]) : spec, patch]).sort((a, b) => a[0] - b[0]);
  return evCache[k];
}
export function shotOf(t) { let i = 0; while (i + 1 < CUTS.length && t >= CUTS[i + 1]) i++; return keys[i]; }
export function heroState(t) {
  const k = shotOf(t); const ev = events(k);
  let acc = {}, prev = resolve({}), cur = resolve({}), ti = -1;
  for (const [te, patch] of ev) { if (te > t) break; prev = cur; acc = Object.assign({}, acc, patch); cur = resolve(acc); ti = te; }
  const kk = ti < 0 ? 1 : ease(t, ti, ti + 0.4);
  const num = {}; for (const n of NUM) num[n] = prev.num[n] + (cur.num[n] - prev.num[n]) * kk;
  const disc = kk < 0.5 ? prev.disc : cur.disc;
  const P = heroPos(k, t);
  return {key: k, num, disc, pos: P, speak: true};
}
export function heroPos(k, t) {
  const sh = SHOTS[k], s = S[k]; const u = ease(t, s.start, s.end);
  const x = sh.A[0] + (sh.B[0] - sh.A[0]) * u, z = sh.A[1] + (sh.B[1] - sh.A[1]) * u;
  const walk = (sh.A[0] !== sh.B[0] || sh.A[1] !== sh.B[1]) && u > 0.02 && u < 0.98 ? 1 : 0;
  return {x, z, y: groundY(x, z), walk};
}
