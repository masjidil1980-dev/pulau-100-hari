import * as THREE from 'three';
import {INK, rng} from './kit.js';
import {flat, circlePts, stick, inkMat} from './char.js';
import LIP from './lip.json';

const SKIN = '#e9b88e', SKIN2 = '#d79f74', HAIR = '#1f1714', HAIR2 = '#4a352b', HAIR3 = '#6e5242';
const SHIRT = '#d4b277', SHIRT2 = '#b8955a', VEST = '#7b4b2a', PANTS = '#3a4a63', BOOT = '#4a2f22', SCARF = '#c8463a';
const fills = {};
const fm = (c) => fills[c] || (fills[c] = new THREE.MeshBasicMaterial({color: c, side: THREE.DoubleSide}));
const sh = (pts) => new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))));
const shift = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
// colored limb: ink outline + colored fill
function limb(x0, y0, x1, y1, w0, w1, color, z = 0) {
  const g = new THREE.Group();
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const mk = (a, b, m, zz) => {
    const mesh = new THREE.Mesh(sh([[x0 + nx * a, y0 + ny * a], [x1 + nx * b, y1 + ny * b], [x1 - nx * b, y1 - ny * b], [x0 - nx * a, y0 - ny * a]]), m);
    mesh.position.z = zz; return mesh;
  };
  g.add(mk(w0 + 0.014, w1 + 0.014, inkMat, z - 0.002), mk(w0, w1, fm(color), z));
  return g;
}
const ell = (cx, cy, rx, ry, color, z, band = 0.012, seed = 1, a0, a1, n = 20) => flat(circlePts(cx, cy, rx, ry, n, a0, a1), color, z, band, seed);
function arcLine(cx, cy, rx, ry, a0, a1, w, z, n = 10) {
  const g = new THREE.Group(); const p = circlePts(cx, cy, rx, ry, n, a0, a1);
  for (let i = 0; i < p.length - 1; i++) { const s = stick(p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], w, w); s.position.z = z; g.add(s); }
  return g;
}

export const POSES = {
  idle: {aL: 0.1, eL: 0.15, aR: 0.1, eR: 0.15},
  sweep: {aL: 0.15, eL: 0.2, aR: 1.9, eR: 0.15},
  earcup: {aL: 0.12, eL: 0.2, aR: 2.45, eR: 1.5},
  fist: {aL: 0.15, eL: 0.2, aR: 2.9, eR: 0.5},
  fistBoth: {aL: 2.6, eL: 0.6, aR: 2.6, eR: 0.6},
  point: {aL: 0.12, eL: 0.2, aR: 1.45, eR: 0.0},
  pointUp: {aL: 0.12, eL: 0.2, aR: 2.5, eR: 0.0},
  wipe: {aL: 0.12, eL: 0.2, aR: 2.6, eR: 2.0},
  fan: {aL: 0.12, eL: 0.2, aR: 1.3, eR: 1.9},
  cheer: {aL: 2.8, eL: 0.2, aR: 2.8, eR: 0.2},
  wave: {aL: 0.12, eL: 0.2, aR: 2.5, eR: 0.5},
  seed: {aL: 0.12, eL: 0.2, aR: 1.0, eR: 1.5},
  open: {aL: 0.9, eL: 0.5, aR: 0.9, eR: 0.5},
  think: {aL: 0.12, eL: 0.2, aR: 2.0, eR: 2.5},
  hips: {aL: 0.7, eL: -1.0, aR: 0.7, eR: -1.0},
  dig: {aL: 1.0, eL: 0.6, aR: 1.0, eR: 0.6},
  twoSigns: {aL: 1.3, eL: 0.1, aR: 1.3, eR: 0.1},
  chest: {aL: 0.3, eL: 1.2, aR: 0.3, eR: 1.2},
  touch: {aL: 0.12, eL: 0.2, aR: 0.7, eR: -0.2},
};
export const EXPR = {
  neutral: {eyes: 'open', browL: 0, browR: 0, browY: 0, mouth: 'smile', blush: 0},
  sad: {eyes: 'half', browL: 0.4, browR: -0.4, browY: -0.005, mouth: 'frown', blush: 0},
  grim: {eyes: 'half', browL: -0.25, browR: 0.25, browY: -0.01, mouth: 'flat', blush: 0},
  determined: {eyes: 'open', browL: -0.35, browR: 0.35, browY: -0.005, mouth: 'smile', blush: 0.3},
  confident: {eyes: 'open', browL: -0.1, browR: 0.12, browY: 0.02, mouth: 'grin', blush: 0.4},
  hope: {eyes: 'wide', browL: 0.1, browR: -0.1, browY: 0.05, mouth: 'smile', blush: 0.3},
  happy: {eyes: 'happy', browL: 0, browR: 0, browY: 0.03, mouth: 'grin', blush: 0.7},
  wow: {eyes: 'wide', browL: 0, browR: 0, browY: 0.07, mouth: 'o', blush: 0.5},
  hot: {eyes: 'half', browL: 0.3, browR: -0.3, browY: 0, mouth: 'flat', blush: 0.8},
  curious: {eyes: 'open', browL: 0, browR: 0, browY: 0.05, mouth: 'flat', blush: 0.1},
  warm: {eyes: 'happy', browL: 0.08, browR: -0.08, browY: 0.01, mouth: 'smile', blush: 0.5},
  think: {eyes: 'open', browL: 0.1, browR: -0.15, browY: 0.045, mouth: 'flat', blush: 0},
  whisper: {eyes: 'wide', browL: 0.15, browR: -0.15, browY: 0.04, mouth: 'flat', blush: 0.2},
  effort: {eyes: 'half', browL: -0.45, browR: 0.45, browY: -0.02, mouth: 'grin', blush: 0.6},
};

// openness at time t, 0..1 from the narration envelope
export const lipAt = (t) => { const f = t * 30, i = Math.floor(f), k = f - i; const a = LIP[i] ?? 0, b = LIP[i + 1] ?? 0; return (a * (1 - k) + b * k) / 100; };

export function hero({seed = 5, scale = 1} = {}) {
  const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  // ---- legs (swing from the hip) ----
  const legL = new THREE.Group(), legR = new THREE.Group();
  legL.position.set(-0.09, 0.74, 0); legR.position.set(0.09, 0.74, 0);
  for (const [lg, s] of [[legL, -1], [legR, 1]]) {
    lg.add(limb(0, 0, 0.01 * s, -0.66, 0.045, 0.036, PANTS, -0.01));
    const boot = new THREE.Group(); boot.position.set(0.01 * s, -0.68, 0);
    boot.add(flat([[-0.07, 0.07], [0.06, 0.07], [0.06, -0.03], [0.17 * 1, -0.05], [0.17, -0.1], [-0.08, -0.1]].map(([x, y]) => [x * (s > 0 ? 1 : -1) * 1, y]), BOOT, 0.0, 0.012, seed + s + 3));
    lg.add(boot); body.add(lg);
  }
  // ---- torso: shirt, vest, belt, scarf ----
  const torso = []; for (let i = 0; i <= 22; i++) { const a = Math.PI * 2 * i / 22; const y = 0.98 + Math.sin(a) * 0.3; const wid = 0.2 + 0.065 * (1 - (y - 0.68) / 0.6); torso.push([Math.cos(a) * wid, y]); }
  body.add(flat(torso, SHIRT, 0.01, 0.024, seed + 3));
  body.add(flat([[-0.2, 1.22], [-0.04, 1.2], [-0.07, 0.8], [-0.24, 0.78], [-0.26, 0.98]], VEST, 0.02, 0.012, seed + 4));
  body.add(flat([[0.2, 1.22], [0.04, 1.2], [0.07, 0.8], [0.24, 0.78], [0.26, 0.98]], VEST, 0.02, 0.012, seed + 5));
  body.add(flat([[-0.26, 0.8], [0.26, 0.8], [0.25, 0.74], [-0.25, 0.74]], '#3b2418', 0.03, 0.008, seed + 6));
  body.add(flat([[-0.04, 0.8], [0.04, 0.8], [0.04, 0.74], [-0.04, 0.74]], '#e0b04a', 0.035, 0.006, seed + 7));
  body.add(flat([[0.1, 1.0], [0.2, 1.0], [0.2, 0.9], [0.1, 0.9]], VEST === '' ? SHIRT : '#5e3820', 0.03, 0.008, seed + 8));
  body.add(flat([[-0.13, 1.26], [0.13, 1.26], [0.0, 1.05]], SCARF, 0.04, 0.012, seed + 9)); // bandana
  body.add(flat([[-0.12, 1.28], [0.12, 1.28], [0.1, 1.24], [-0.1, 1.24]], SCARF, 0.045, 0.008, seed + 10));
  // ---- arms (shoulder pivot + elbow pivot) ----
  const mkArm = (s) => {
    const sh0 = new THREE.Group(); sh0.position.set(0.21 * s, 1.17, 0.05);
    sh0.add(limb(0, 0, 0.0, -0.24, 0.05, 0.042, SHIRT2, 0.0));
    const el = new THREE.Group(); el.position.set(0, -0.24, 0.001); sh0.add(el);
    el.add(limb(0, 0, 0.0, -0.22, 0.036, 0.03, SKIN, 0.0));
    el.add(flat([[-0.045, -0.22], [0.045, -0.22], [0.05, -0.26], [0.0, -0.31], [-0.05, -0.26]], SKIN, 0.002, 0.012, seed + 11 + s));
    const hand = new THREE.Group(); hand.position.set(0, -0.27, 0.01); el.add(hand);
    body.add(sh0); return {sh: sh0, el, hand};
  };
  const AL = mkArm(-1), AR = mkArm(1);
  // ---- head ----
  const head = new THREE.Group(); head.position.set(0, 1.58, 0.06); body.add(head);
  // back hair (undercut sides)
  const backHair = circlePts(0, 0.03, 0.365, 0.35, 30, -0.35, Math.PI + 0.35); backHair.push([-0.34, -0.06], [0.34, -0.06]);
  head.add(flat(backHair, HAIR, -0.03, 0.02, seed + 12));
  head.add(flat([[-0.07, -0.3], [0.07, -0.3], [0.05, -0.38], [-0.05, -0.38]], SKIN2, -0.025, 0.01, seed + 13)); // neck
  head.add(flat(circlePts(0, 0, 0.335, 0.315, 40), SKIN, 0.0, 0.026, seed + 14));
  for (const s of [-1, 1]) head.add(ell(0.335 * s, -0.02, 0.05, 0.07, SKIN, -0.01, 0.014, seed + 15 + s, undefined, undefined, 12));
  // blush
  const blushL = ell(-0.2, -0.08, 0.055, 0.035, '#e98a72', 0.012, 0, seed + 20), blushR = ell(0.2, -0.08, 0.055, 0.035, '#e98a72', 0.012, 0, seed + 21);
  head.add(blushL, blushR);
  // nose
  const nose = arcLine(0.0, -0.045, 0.03, 0.022, Math.PI * 1.1, Math.PI * 1.9, 0.007, 0.025, 8); head.add(nose);
  // ---- eyes ----
  const eyes = {L: {}, R: {}};
  for (const [k, ex] of [['L', -0.12], ['R', 0.12]]) {
    const E = eyes[k]; const g = new THREE.Group(); g.position.set(ex, 0.025, 0.02); head.add(g);
    const mkOpen = (rx, ry, pr) => {
      const o = new THREE.Group(); o.add(ell(0, 0, rx, ry, '#fdf9ef', 0.0, 0.013, seed + 30, undefined, undefined, 22));
      const pup = new THREE.Group(); pup.add(ell(0, 0, pr, pr * 1.1, INK, 0.012, 0.0, seed + 31, undefined, undefined, 14), ell(pr * 0.3, pr * 0.4, pr * 0.3, pr * 0.3, '#ffffff', 0.016, 0, seed + 32, undefined, undefined, 8));
      o.add(pup); o.userData.pupil = pup; return o;
    };
    E.open = mkOpen(0.058, 0.068, 0.036); E.wide = mkOpen(0.072, 0.088, 0.034);
    E.half = mkOpen(0.058, 0.068, 0.036);
    E.half.add(flat([[-0.07, 0.075], [0.07, 0.075], [0.07, 0.006], [-0.07, 0.01]], SKIN, 0.03, 0.0, seed + 33)); // lid
    const l = stick(-0.065, 0.006, 0.065, 0.006, 0.01, 0.01); l.position.z = 0.034; E.half.add(l);
    E.closed = arcLine(0, 0.02, 0.06, 0.045, Math.PI * 1.15, Math.PI * 1.85, 0.011, 0.0, 10);
    E.happy = arcLine(0, -0.03, 0.06, 0.06, Math.PI * 0.15, Math.PI * 0.85, 0.013, 0.0, 10);
    for (const n of ['open', 'wide', 'half', 'closed', 'happy']) { g.add(E[n]); }
    E.root = g;
  }
  // ---- brows ----
  const brows = {};
  for (const [k, ex] of [['L', -0.125], ['R', 0.125]]) {
    const b = new THREE.Group(); b.position.set(ex, 0.135, 0.03); head.add(b);
    const m = stick(-0.065, 0, 0.065, 0.0, 0.013, 0.011); m.position.z = 0.0; b.add(m);
    const m2 = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([[-0.062, -0.008], [0.062, -0.008], [0.06, 0.008], [-0.062, 0.008]].map(([x, y]) => new THREE.Vector2(x, y)))), fm(HAIR2)); m2.position.z = 0.002; b.add(m2);
    brows[k] = b;
  }
  // ---- mouth shapes ----
  const M = {}; const my = -0.145;
  const mg = new THREE.Group(); mg.position.set(0, my, 0.022); head.add(mg);
  M.smile = arcLine(0, 0.03, 0.075, 0.06, Math.PI * 1.17, Math.PI * 1.83, 0.009, 0, 12);
  M.flat = (() => { const s = stick(-0.045, 0, 0.045, -0.004, 0.009, 0.009); const g = new THREE.Group(); g.add(s); return g; })();
  M.frown = arcLine(0, -0.07, 0.065, 0.055, Math.PI * 0.2, Math.PI * 0.8, 0.009, 0, 10);
  const open = (rx, ry, teeth) => {
    const g = new THREE.Group(); g.add(ell(0, 0, rx, ry, '#4b1d24', 0, 0.014, seed + 40, undefined, undefined, 20));
    g.add(ell(0, -ry * 0.55, rx * 0.6, ry * 0.4, '#e0707a', 0.01, 0, seed + 41, undefined, undefined, 10));
    if (teeth) g.add(flat([[-rx * 0.8, ry * 0.75], [rx * 0.8, ry * 0.75], [rx * 0.7, ry * 0.2], [-rx * 0.7, ry * 0.2]], '#fbf7ee', 0.02, 0, seed + 42));
    return g;
  };
  M.grin = (() => { const g = new THREE.Group(); const p = circlePts(0, 0.03, 0.085, 0.07, 14, Math.PI, Math.PI * 2); g.add(flat(p, '#4b1d24', 0, 0.014, seed + 43)); g.add(flat([[-0.075, 0.03], [0.075, 0.03], [0.068, 0.006], [-0.068, 0.006]], '#fbf7ee', 0.012, 0, seed + 44)); return g; })();
  M.o = open(0.04, 0.05, false); M.s1 = open(0.045, 0.028, false); M.s2 = open(0.065, 0.05, true); M.s3 = open(0.08, 0.075, true); M.s4 = open(0.052, 0.06, false);
  for (const k in M) { mg.add(M[k]); M[k].visible = false; }
  // ---- hair front: pompadour quiff + forelock + sideburns ----
  const hairFront = new THREE.Group(); head.add(hairFront);
  const base = [[-0.33, 0.09], [-0.34, 0.26], [-0.26, 0.42], [-0.1, 0.52], [0.1, 0.57], [0.28, 0.5], [0.38, 0.36], [0.36, 0.2], [0.3, 0.06], [0.24, 0.17], [0.1, 0.25], [-0.04, 0.22], [-0.18, 0.18], [-0.27, 0.1]];
  hairFront.add(flat(base, HAIR, 0.04, 0.018, seed + 50));
  const quiff = new THREE.Group(); quiff.position.set(0.02, 0.3, 0.05); head.add(quiff);
  const swoop = [[-0.25, 0.0], [-0.14, 0.2], [0.04, 0.3], [0.22, 0.27], [0.36, 0.12], [0.3, 0.16], [0.14, 0.12], [0.0, 0.1], [-0.12, 0.04]];
  quiff.add(flat(swoop, HAIR2, 0.01, 0.012, seed + 51));
  quiff.add(flat([[-0.12, 0.08], [0.0, 0.2], [0.17, 0.22], [0.05, 0.14]], HAIR3, 0.018, 0.0, seed + 52));
  quiff.add(flat([[-0.2, 0.0], [-0.08, 0.14], [0.06, 0.2], [-0.02, 0.1]], HAIR3, 0.019, 0.0, seed + 53));
  const lock = new THREE.Group(); lock.position.set(0.06, 0.2, 0.06); head.add(lock);
  lock.add(flat([[-0.03, 0.0], [0.07, 0.0], [0.09, -0.07], [0.03, -0.16], [0.0, -0.08], [-0.05, -0.04]], HAIR, 0.0, 0.012, seed + 54));
  const lock2 = new THREE.Group(); lock2.position.set(-0.12, 0.2, 0.06); head.add(lock2);
  lock2.add(flat([[-0.04, 0.0], [0.05, 0.0], [0.03, -0.1], [-0.02, -0.14], [-0.05, -0.05]], HAIR, 0.0, 0.012, seed + 55));
  for (const s of [-1, 1]) head.add(flat([[0.3 * s, 0.1], [0.34 * s, 0.1], [0.34 * s, -0.08], [0.31 * s, -0.12]], HAIR, 0.035, 0.008, seed + 56 + s));
  // sweat drop
  const sweat = flat([[0, 0.07], [0.04, 0.0], [0.03, -0.04], [0, -0.05], [-0.03, -0.04], [-0.04, 0.0]], '#7fd0f2', 0.06, 0.01, seed + 60); sweat.position.set(0.33, 0.25, 0); head.add(sweat);
  // dust smudges (face)
  const dirt = ell(-0.22, -0.02, 0.04, 0.02, SKIN2, 0.011, 0, seed + 61); head.add(dirt);
  // shadow blob
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.45, 24), new THREE.MeshBasicMaterial({color: '#000', transparent: true, opacity: 0.25, depthWrite: false}));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.012; blob.scale.y = 0.55; root.add(blob);
  root.scale.setScalar(scale);

  const phase = rng(seed)() * 6;
  const hands = {L: AL.hand, R: AR.hand};
  // pure function of time + state object s
  root.userData.apply = (t, s, camPos) => {
    const lip = s.speak ? lipAt(t) : 0;
    // body motion
    const speed = s.walk || 0;
    const bob = speed ? Math.abs(Math.sin(t * 7)) * 0.04 : Math.abs(Math.sin(t * 2.2 + phase)) * 0.012;
    body.position.y = bob - (s.crouch || 0);
    legL.rotation.z = speed ? Math.sin(t * 7) * 0.55 : 0; legR.rotation.z = speed ? -Math.sin(t * 7) * 0.55 : 0;
    if (s.crouch) { legL.rotation.z = 0.5; legR.rotation.z = -0.5; }
    // head
    head.rotation.z = Math.sin(t * 1.3 + phase) * 0.04 + (s.tilt || 0);
    head.position.y = 1.58 + Math.sin(t * 1.9 + phase) * 0.008 + lip * 0.012;
    // hair physics: sway + wind
    const wind = s.wind || 0;
    quiff.rotation.z = Math.sin(t * 2.1 + phase) * 0.03 - wind * (0.1 + 0.05 * Math.sin(t * 9));
    lock.rotation.z = Math.sin(t * 2.6 + 1) * 0.09 - wind * (0.45 + 0.2 * Math.sin(t * 11)) + head.rotation.z * -0.5;
    lock2.rotation.z = Math.sin(t * 2.3 + 2) * 0.08 - wind * (0.35 + 0.2 * Math.sin(t * 10 + 1));
    // pose
    const p = s.pose;
    const wob = s.wobble || 0;
    AL.sh.rotation.z = -(p.aL + Math.sin(t * 8) * wob * 0.5); AL.el.rotation.z = -(p.eL + Math.sin(t * 8 + 1) * wob * 0.3);
    AR.sh.rotation.z = p.aR + Math.sin(t * 8 + 2) * wob; AR.el.rotation.z = p.eR + Math.sin(t * 8 + 3) * wob * 0.6 + (s.waveEl ? Math.sin(t * 9) * 0.5 : 0);
    // brows
    const e = s.expr;
    brows.L.rotation.z = e.browL; brows.R.rotation.z = e.browR; brows.L.position.y = brows.R.position.y = 0.135 + e.browY;
    // eyes
    const blink = (t % 3.3) < 0.11 && e.eyes !== 'happy';
    const eyeName = blink ? 'closed' : e.eyes;
    const lx = (s.look ? s.look[0] : 0) * 0.02, ly = (s.look ? s.look[1] : 0) * 0.02;
    for (const k of ['L', 'R']) {
      const E = eyes[k];
      for (const n of ['open', 'wide', 'half', 'closed', 'happy']) E[n].visible = n === eyeName;
      for (const n of ['open', 'wide', 'half']) E[n].userData.pupil.position.set(lx, ly, 0);
    }
    // mouth: speaking shapes driven by the audio level
    for (const k in M) M[k].visible = false;
    let shape;
    if (lip > 0.1) {
      const h = Math.floor(t * 11) % 3;
      shape = lip < 0.28 ? 's1' : lip < 0.55 ? (h === 0 ? 'o' : 's4') : (h === 1 ? 's3' : 's2');
      if (e.mouth === 'grin' && lip > 0.55) shape = 's3';
    } else shape = e.mouth;
    M[shape].visible = true;
    M[shape].scale.set(1 + (e.mouth === 'grin' ? 0.1 : 0), 0.85 + lip * 0.3, 1);
    blushL.visible = blushR.visible = (e.blush + (s.blush || 0)) > 0.25;
    sweat.visible = !!s.sweat; sweat.position.y = 0.25 - ((t * 0.5) % 1) * 0.1;
    dirt.visible = !!s.dirt;
    // face the camera (clamped)
    const wp = new THREE.Vector3(); root.getWorldPosition(wp);
    let yaw = Math.atan2(camPos.x - wp.x, camPos.z - wp.z); yaw = Math.max(-0.55, Math.min(0.55, yaw));
    root.rotation.y = yaw * 0.9;
  };
  root.userData.hands = hands; root.userData.head = head;
  return root;
}
