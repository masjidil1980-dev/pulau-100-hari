import * as THREE from 'three';
import {INK, rng, toon, box, cyl, sign, ink, paintTex} from './kit.js';
import {groundY} from './terrain.js';

const G = () => new THREE.Group();
const place = (o, x, z, ry = 0, dy = 0) => { o.position.set(x, groundY(x, z) + dy, z); o.rotation.y = ry; return o; };
export {place};
const mesh = (geo, color, th = 0.03, edges = false) => { const m = new THREE.Mesh(geo, toon(color)); return ink(m, th, edges); };

export function rock(s = 1, color = '#8f8579', seed = 1) {
  const r = rng(seed); const geo = new THREE.IcosahedronGeometry(1, 1);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const k = 0.8 + r() * 0.4; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.75, p.getZ(i) * k); }
  geo.computeVertexNormals();
  const m = mesh(geo, color, 0.04 * s, false); m.scale.set(s * (0.9 + r() * 0.5), s * (0.7 + r() * 0.5), s * (0.9 + r() * 0.5)); m.rotation.y = r() * 6; m.position.y = s * 0.3;
  const g = G(); g.add(m); return g;
}
export function rockPile(n, spread, base = 1, seed = 1) {
  const g = G(); const r = rng(seed); const cols = ['#8f8579', '#7d756b', '#9d9285', '#a39683'];
  for (let i = 0; i < n; i++) { const k = rock(base * (0.4 + r() * 0.9), cols[i % 4], seed + i * 7); k.position.set((r() - 0.5) * spread, 0, (r() - 0.5) * spread); g.add(k); }
  return g;
}
export function cactus(s = 1, seed = 1) {
  const g = G(); const c = '#6f9a52';
  g.add(cyl(0.22 * s, 0.26 * s, 2.2 * s, c, {y: 1.1 * s, seg: 10}));
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.22 * s, 10, 8), toon(c)); top.position.y = 2.2 * s; g.add(ink(top, 0.02, false));
  for (const [sd, h] of [[-1, 1.1], [1, 1.5]]) {
    const a = cyl(0.12 * s, 0.12 * s, 0.7 * s, c, {x: sd * 0.5 * s, y: h * s + 0.1 * s, seg: 8}); const hz = cyl(0.12 * s, 0.12 * s, 0.5 * s, c, {x: sd * 0.25 * s, y: h * s - 0.2 * s, seg: 8}); hz.rotation.z = Math.PI / 2;
    g.add(a, hz);
  }
  return g;
}
export function deadTree(s = 1, seed = 1) {
  const g = G(); const r = rng(seed); const bark = '#6b5443';
  const trunk = cyl(0.1 * s, 0.22 * s, 3.2 * s, bark, {y: 1.6 * s, seg: 7}); trunk.rotation.z = (r() - 0.5) * 0.15; g.add(trunk);
  for (let i = 0; i < 5; i++) {
    const L = (0.9 + r() * 0.9) * s; const b = cyl(0.03 * s, 0.08 * s, L, bark, {seg: 5});
    const a = (r() - 0.5) * 2.4; b.position.set(Math.sin(a) * 0.4 * L, (1.8 + i * 0.35) * s, (r() - 0.5) * 0.3); b.rotation.z = -a * 0.9 - (a > 0 ? 0.2 : -0.2); g.add(b);
    if (r() > 0.4) { const b2 = cyl(0.02 * s, 0.04 * s, L * 0.5, bark, {seg: 4}); b2.position.set(b.position.x + Math.sin(a) * 0.5 * L, b.position.y + 0.35 * L, 0); b2.rotation.z = -a * 0.4; g.add(b2); }
  }
  return g;
}
export function skull(s = 1) {
  const g = G(); const bone = '#efe6d2';
  const cr = new THREE.Mesh(new THREE.SphereGeometry(0.28 * s, 12, 9), toon(bone)); cr.scale.set(1, 0.85, 1.1); cr.position.y = 0.26 * s; g.add(ink(cr, 0.02, false));
  const snout = box(0.22 * s, 0.18 * s, 0.34 * s, bone, {y: 0.14 * s, z: 0.3 * s, thick: 0.015}); g.add(snout);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06 * s, 8, 6), new THREE.MeshBasicMaterial({color: INK})); eye.position.set(sx * 0.13 * s, 0.32 * s, 0.22 * s); g.add(eye);
    const h = mesh(new THREE.ConeGeometry(0.06 * s, 0.6 * s, 8), '#d6c9a8', 0.015); h.position.set(sx * 0.4 * s, 0.4 * s, 0); h.rotation.z = -sx * 1.1; g.add(h);
  }
  return g;
}
export function tumbleweed(s = 1) {
  const g = G(); const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 * s, 1), toon('#b89b61', null, {wireframe: false})); ink(m, 0.03 * s, true, 20); g.add(m);
  const m2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.38 * s, 0), toon('#a2854f')); m2.rotation.set(1, 2, 0); g.add(ink(m2, 0.02 * s, true, 20)); g.userData.ball = g; return g;
}
export function boatWreck() {
  const g = G(); const w = '#7a5a40', w2 = '#5d4331';
  const hull = box(5.5, 0.4, 1.8, w, {y: 0.5, thick: 0.03}); hull.rotation.z = 0.08; g.add(hull);
  for (const sd of [-1, 1]) { const side = box(5.2, 0.9, 0.18, w2, {y: 0.95, z: sd * 0.85, thick: 0.03}); side.rotation.z = 0.08; g.add(side); }
  for (let i = 0; i < 4; i++) g.add(box(0.14, 0.7, 1.7, w2, {x: -2 + i * 1.3, y: 0.8, thick: 0.02}));
  const mast = cyl(0.08, 0.1, 3.4, w2, {x: 0.4, y: 2.2, seg: 6}); mast.rotation.z = 0.35; g.add(mast);
  const sail = box(1.4, 1.1, 0.03, '#d9cdb0', {x: 1.2, y: 2.4, thick: 0.01}); sail.rotation.z = 0.3; g.add(sail);
  return g;
}
export function pickaxe() {
  const g = G(); g.add(cyl(0.025, 0.03, 1.1, '#7b5236', {y: 0.0, seg: 8}));
  const head = box(0.7, 0.07, 0.07, '#7e8590', {y: 0.55, thick: 0.015}); g.add(head);
  for (const sd of [-1, 1]) { const tip = mesh(new THREE.ConeGeometry(0.04, 0.2, 6), '#7e8590', 0.01); tip.position.set(sd * 0.42, 0.55, 0); tip.rotation.z = -sd * Math.PI / 2; g.add(tip); }
  return g;
}
export function shovel() { const g = G(); g.add(cyl(0.025, 0.025, 1.3, '#7b5236', {y: 0.2, seg: 8})); g.add(box(0.28, 0.34, 0.03, '#8a929c', {y: -0.55, thick: 0.012})); g.add(box(0.12, 0.05, 0.05, '#7b5236', {y: 0.85, thick: 0.01})); return g; }
export function backpack() { const g = G(); g.add(box(0.7, 0.9, 0.4, '#a1522f', {y: 0.45}), box(0.6, 0.4, 0.15, '#8a4425', {y: 0.3, z: 0.27}), box(0.72, 0.08, 0.42, '#c48a4a', {y: 0.88}), cyl(0.1, 0.1, 0.8, '#d6c9a8', {y: 1.0, x: 0, seg: 8}).rotateZ(Math.PI / 2)); return g; }
export function canteen() { const g = G(); const c = cyl(0.17, 0.17, 0.12, '#5d7a45', {seg: 14}); c.rotation.x = Math.PI / 2; c.position.y = 0.25; g.add(c, cyl(0.05, 0.05, 0.1, '#444', {y: 0.45, seg: 8})); return g; }
export function tent() {
  const g = G(); const m = mesh(new THREE.ConeGeometry(1.6, 1.8, 4), '#d7b56d', 0.03, true); m.position.y = 0.9; m.rotation.y = Math.PI / 4; g.add(m);
  const door = mesh(new THREE.ConeGeometry(0.6, 1.1, 3), '#3a2a22', 0.01); door.position.set(0, 0.5, 1.13); door.rotation.y = 0; g.add(door); return g;
}
export function seedItem() { const m = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshBasicMaterial({color: '#6f4a24'})); m.scale.set(1, 1.3, 0.9); return m; }
export function sprout(s = 1, color = '#58b04a') {
  const g = G(); g.add(cyl(0.012 * s, 0.018 * s, 0.35 * s, '#4f9a3f', {y: 0.17 * s, seg: 5, thick: 0.005}));
  for (const sd of [-1, 1]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.11 * s, 8, 6), toon(color)); l.scale.set(1.4, 0.35, 0.8); l.position.set(sd * 0.1 * s, 0.34 * s, 0); l.rotation.z = sd * 0.5; g.add(ink(l, 0.01, false)); }
  return g;
}
export function deadSprout() { const g = G(); g.add(cyl(0.012, 0.016, 0.22, '#7a6040', {y: 0.11, seg: 5, thick: 0.004})); const l = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), toon('#a58a55')); l.scale.set(1.4, 0.3, 0.8); l.position.set(0.07, 0.19, 0); l.rotation.z = -0.9; g.add(ink(l, 0.008, false)); return g; }
export function grassTuft(s = 1, seed = 1) { const g = G(); const r = rng(seed); for (let i = 0; i < 5; i++) { const b = mesh(new THREE.ConeGeometry(0.035 * s, (0.3 + r() * 0.25) * s, 4), i % 2 ? '#5fb24c' : '#4a9a3f', 0.006); b.position.set((r() - 0.5) * 0.2 * s, 0.17 * s, (r() - 0.5) * 0.2 * s); b.rotation.z = (r() - 0.5) * 0.6; g.add(b); } return g; }
export function sapling(s = 1) { const g = G(); g.add(cyl(0.03 * s, 0.05 * s, 0.8 * s, '#7b5236', {y: 0.4 * s, seg: 6})); const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4 * s, 1), toon('#5fb24c')); l.position.y = 1.0 * s; g.add(ink(l, 0.025 * s, false)); const l2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26 * s, 1), toon('#79c65b')); l2.position.set(0.22 * s, 0.85 * s, 0.1 * s); g.add(ink(l2, 0.02 * s, false)); return g; }
// holo icons (shown beside the narrator)
const basic = (c) => new THREE.MeshBasicMaterial({color: c, transparent: true, opacity: 0.96});
export function iconTree() { const g = G(); g.add(cyl(0.06, 0.09, 0.5, '#7b5236', {y: 0.25, seg: 6}), (() => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), toon('#58b04a')); m.position.y = 0.7; return ink(m, 0.025, false); })()); return g; }
export function iconHouse() { const g = G(); g.add(box(0.7, 0.5, 0.6, '#e0c48a', {y: 0.25}), (() => { const m = mesh(new THREE.ConeGeometry(0.62, 0.4, 4), '#b3392f', 0.02, true); m.position.y = 0.7; m.rotation.y = Math.PI / 4; return m; })(), box(0.16, 0.28, 0.02, '#6b4430', {y: 0.14, z: 0.31, thick: 0.004})); return g; }
export function iconButterfly() { const g = G(); for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CircleGeometry(0.2, 14), new THREE.MeshBasicMaterial({color: s < 0 ? '#f28a3b' : '#f2b13b', side: THREE.DoubleSide})); w.position.set(s * 0.17, 0.05, 0); w.scale.set(1, 1.2, 1); g.add(w); } g.add(box(0.04, 0.3, 0.04, INK, {thick: 0.002, edges: false})); g.userData.wings = g.children.slice(0, 2); return g; }
export function iconDrop(glow = true) {
  const g = G(); const m = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), basic('#46c4f0')); m.position.y = 0.28; const c = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.46, 16), basic('#46c4f0')); c.position.y = 0.67;
  const hi = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), basic('#e6fbff')); hi.position.set(-0.1, 0.34, 0.2); g.add(m, c, hi);
  if (glow) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12), new THREE.MeshBasicMaterial({color: '#7fe0ff', transparent: true, opacity: 0.22, depthWrite: false})); h.position.y = 0.4; g.add(h); }
  return g;
}
export function iconHeart() { const s = new THREE.Shape(); s.moveTo(0, -0.3); s.bezierCurveTo(-0.5, 0.05, -0.28, 0.4, 0, 0.18); s.bezierCurveTo(0.28, 0.4, 0.5, 0.05, 0, -0.3); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, {depth: 0.08, bevelEnabled: false}), new THREE.MeshBasicMaterial({color: '#ee4466'})); return m; }
export function iconSun() { const g = G(); const c = new THREE.Mesh(new THREE.CircleGeometry(0.3, 20), new THREE.MeshBasicMaterial({color: '#ffcf3a'})); g.add(c); for (let i = 0; i < 10; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.2), new THREE.MeshBasicMaterial({color: '#ffcf3a', side: THREE.DoubleSide})); const a = i / 10 * 6.283; r.position.set(Math.cos(a) * 0.47, Math.sin(a) * 0.47, 0); r.rotation.z = a + Math.PI / 2; g.add(r); } return g; }
export function textIcon(text, color = '#ffffff', bg = '#e0533d', w = 0.9) { return sign(text, w, w, {bg, fg: color, w: 256, h: 256, font: 'bold 190px Arial, sans-serif', border: true}); }
export function xMark() { const g = G(); for (const a of [Math.PI / 4, -Math.PI / 4]) { const b = box(1.5, 0.04, 0.22, '#b3261e', {y: 0.05, thick: 0.008, edges: false}); b.rotation.y = a; g.add(b); } return g; }
// mini dam (diorama): stacked logs & stones across the stream, with a pond behind it
export function dam() {
  const g = G(); const cols = ['#8f8579', '#7d756b', '#9d9285'];
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6 - row; i++) { const k = rock(0.34, cols[(i + row) % 3], row * 9 + i); k.position.set(-1.2 + row * 0.2 + i * 0.5, 0.18 + row * 0.38, 0); g.add(k); }
  for (let i = 0; i < 3; i++) { const l = cyl(0.07, 0.07, 3.0, '#7b5236', {y: 1.3 + i * 0.0, x: 0, z: 0.1 * i, seg: 7}); l.rotation.z = Math.PI / 2; l.position.y = 0.2 + i * 0.28; l.position.z = 0.3; g.add(l); }
  return g;
}
// flowing water ribbon along the stream path (drawRange reveals it from the spring downhill)
export function waterRibbon(points, {width = 1.2, seg = 160} = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const u = i / seg; const p = curve.getPointAt(u), tg = curve.getTangentAt(u); const nx = -tg.z, nz = tg.x;
    const w = width * (0.45 + 0.9 * u) ;
    for (const s of [-1, 1]) { const x = p.x + nx * w * s, z = p.z + nz * w * s; pos.push(x, groundY(x, z) + 0.07 + (u < 0.05 ? 0.0 : 0), z); uv.push(s < 0 ? 0 : 1, u * 38); }
    if (i < seg) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  const c = document.createElement('canvas'); c.width = 128; c.height = 256; const g2 = c.getContext('2d');
  const gr = g2.createLinearGradient(0, 0, 128, 0); gr.addColorStop(0, '#2b9ccf'); gr.addColorStop(0.5, '#5ccbef'); gr.addColorStop(1, '#2b9ccf'); g2.fillStyle = gr; g2.fillRect(0, 0, 128, 256);
  g2.strokeStyle = 'rgba(255,255,255,0.75)'; g2.lineWidth = 6; g2.lineCap = 'round'; const r = rng(4);
  for (let i = 0; i < 9; i++) { const x = 18 + r() * 92, y = r() * 256; g2.beginPath(); g2.moveTo(x, y); g2.quadraticCurveTo(x + 14, y + 18, x - 4, y + 38); g2.stroke(); }
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({map: tex, transparent: true, opacity: 0.95, side: THREE.DoubleSide});
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false;
  m.userData.curve = curve;
  m.userData.setProgress = (p, t) => { const n = Math.floor(seg * Math.min(1, Math.max(0, p))) * 6; geo.setDrawRange(0, n); tex.offset.y = -t * 1.3; m.visible = p > 0.002; };
  return m;
}
export function dustField(n = 220, seed = 8) {
  const r = rng(seed); const geo = new THREE.BufferGeometry(); const p = new Float32Array(n * 3); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({color: '#e9d2a0', size: 0.09, transparent: true, opacity: 0.7, depthWrite: false}));
  const base = Array.from({length: n}, () => [r(), r(), r(), r()]); pts.frustumCulled = false;
  pts.userData.update = (t, center, strength = 1) => {
    for (let i = 0; i < n; i++) { const [a, b, c, d] = base[i]; p[i * 3] = center.x + (((a * 30 + t * (3 + d * 3) * strength) % 30) + 30) % 30 - 15; p[i * 3 + 1] = center.y + b * 4.5 + Math.sin(t * 1.2 + d * 9) * 0.2; p[i * 3 + 2] = center.z + (c - 0.5) * 24; }
    geo.attributes.position.needsUpdate = true;
  };
  return pts;
}
export function sparkles(n = 60, color = '#fff6b0', seed = 9) {
  const r = rng(seed); const geo = new THREE.BufferGeometry(); const p = new Float32Array(n * 3); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({color, size: 0.16, transparent: true, opacity: 0.95, depthWrite: false})); pts.frustumCulled = false;
  const base = Array.from({length: n}, () => [r(), r(), r(), r()]);
  pts.userData.update = (t, c, rad = 2, h = 2.5) => { for (let i = 0; i < n; i++) { const [a, b, d, e] = base[i]; const ang = a * 6.28 + t * (0.4 + e); p[i * 3] = c.x + Math.cos(ang) * rad * (0.3 + b); p[i * 3 + 1] = c.y + ((d * h + t * (0.5 + e)) % h); p[i * 3 + 2] = c.z + Math.sin(ang) * rad * (0.3 + b); } geo.attributes.position.needsUpdate = true; };
  return pts;
}
