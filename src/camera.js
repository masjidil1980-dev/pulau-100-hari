import * as THREE from 'three';
import {S, keys, CUTS, END, wordT, warpU, cutEnd} from './tm.js';
import {SHOTS, heroPos} from './story.js';
import {groundY} from './terrain.js';
export {wordT, CUTS, END};

export const LIGHTS = {
  dawn: {sun: '#ffd9b0', si: 1.9, sky: '#ffe9d2', gnd: '#b89a78', hi: 1.0, fog: '#f1dcc4', near: 70, far: 420, sunOff: [-40, 35, 50], shadow: 70, top: '#7fa7d4', hor: '#f6d8b8'},
  day: {sun: '#fff0cf', si: 2.6, sky: '#a9d8ff', gnd: '#d9a878', hi: 1.15, fog: '#cfe7f7', near: 200, far: 700, sunOff: [-50, 90, 60], shadow: 80, top: '#3d8fe0', hor: '#cde9f8'},
  hot: {sun: '#fff4d6', si: 3.0, sky: '#fff0c8', gnd: '#d9a65f', hi: 1.15, fog: '#f6e2b2', near: 110, far: 480, sunOff: [-14, 100, 26], shadow: 70, top: '#3a86d8', hor: '#f6e4b8'},
  gold: {sun: '#ffc989', si: 2.7, sky: '#ffe3bd', gnd: '#c08a5a', hi: 1.0, fog: '#f6dcc0', near: 120, far: 520, sunOff: [-60, 42, 50], shadow: 70, top: '#6fa6dd', hor: '#ffd3a1'},
  dusk: {sun: '#ff9d62', si: 2.3, sky: '#ffcaa0', gnd: '#a06a50', hi: 0.95, fog: '#f2b890', near: 90, far: 500, sunOff: [-70, 22, 40], shadow: 70, top: '#4f5fa8', hor: '#ffb27a'},
};
const SUN_ON = new Set(['day', 'hot', 'gold', 'dawn', 'dusk']);
export const sunVisible = (l) => SUN_ON.has(l);

const CURVES = {};
keys.forEach((k, i) => {
  const sh = SHOTS[k]; const a = CUTS[i], b = cutEnd(k);
  const pts = [], looks = [];
  const n = sh.keys.length;
  sh.keys.forEach((key, j) => {
    const f = j / (n - 1);
    if (key.p) { pts.push(new THREE.Vector3(...key.p)); looks.push(new THREE.Vector3(...key.l)); }
    else {
      const x = sh.A[0] + (sh.B[0] - sh.A[0]) * f, z = sh.A[1] + (sh.B[1] - sh.A[1]) * f; const y = groundY(x, z);
      const py = Math.max(key.o[1] + y, groundY(x + key.o[0], z + key.o[2]) + 0.5);
      pts.push(new THREE.Vector3(x + key.o[0], py, z + key.o[2])); looks.push(new THREE.Vector3(x + key.l[0], y + key.l[1], z + key.l[2]));
    }
  });
  let T;
  if (sh.beats && sh.beats.startsWith('words:')) { const [, key, idx] = sh.beats.split(':'); T = idx.split(',').map(Number).map((q) => wordT(key, q)); T[0] = a; T[T.length - 1] = b; }
  else T = sh.keys.map((_, j) => a + (b - a) * j / (n - 1));
  CURVES[k] = {p: new THREE.CatmullRomCurve3(pts, false, 'centripetal'), l: new THREE.CatmullRomCurve3(looks, false, 'centripetal'), T};
});
export function shotAt(t) { let i = 0; while (i + 1 < CUTS.length && t >= CUTS[i + 1]) i++; return keys[i]; }
export function cameraAt(t) {
  const k = shotAt(t); const C = CURVES[k]; const u = warpU(C.T, t);
  const pos = C.p.getPointAt(u), look = C.l.getPointAt(u);
  const gy = groundY(pos.x, pos.z) + 0.45; if (pos.y < gy) pos.y = gy;
  return {key: k, pos, look, plan: {light: SHOTS[k].light, anchor: [SHOTS[k].A[0], groundY(...SHOTS[k].A), SHOTS[k].A[1]]}};
}
// cream dip only when the story moves to a new place
const DIP = new Set(['mati', 'lereng', 'harap', 'sungai', 'refleksi', 'pil1', 'pamit']);
export function dipAt(t) {
  let o = 0;
  keys.forEach((k, i) => { if (i === 0 || !DIP.has(k)) return; const d = Math.abs(t - CUTS[i]); if (d < 0.2) o = Math.max(o, 1 - d / 0.2); });
  if (t > END - 0.9) o = Math.max(o, (t - (END - 0.9)) / 0.9);
  return o;
}
