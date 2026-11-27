import * as THREE from 'three';
import {rng, toon, paintTex} from './kit.js';

const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const gauss = (x, z, cx, cz, sx, sz, h) => h * Math.exp(-(((x - cx) ** 2) / sx + ((z - cz) ** 2) / sz));
// island height at (x, z): flat dry plain, rocky hill in the north, beach sloping into the sea
export function groundY(x, z) {
  const r = Math.hypot(x * 0.9, z * 0.85);
  const shore = 1 - sstep(50, 70, r);
  let h = gauss(x, z, -4, -66, 500, 420, 11) + gauss(x, z, 30, -50, 200, 250, 3) + gauss(x, z, -36, -28, 160, 200, 2.2) + gauss(x, z, 26, 18, 90, 90, 0.9);
  h += Math.sin(x * 0.31) * Math.cos(z * 0.27) * 0.18 + Math.sin(x * 0.9 + z * 0.7) * 0.05;
  return -2.8 + 2.8 * shore + h * shore;
}
export const SEA_Y = -1.15;
export const STREAM = [[-6, -44], [-9, -37], [-5, -29], [-10, -19], [-16, -9], [-13, 2], [-19, 15], [-24, 29], [-22, 43], [-26, 60]];

export function buildTerrain(wet = 0) {
  const N = 150, S = 190;
  const geo = new THREE.PlaneGeometry(S, S, N, N); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
  const r = rng(5); const c = new THREE.Color();
  const dry = new THREE.Color('#c79a63'), dry2 = new THREE.Color('#b0804f'), rock = new THREE.Color('#8f8579'), sand = new THREE.Color('#ead7a4'), deep = new THREE.Color('#6a5a52');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i); const y = groundY(x, z); pos.setY(i, y);
    const rr = Math.hypot(x * 0.9, z * 0.85);
    c.copy(dry).lerp(dry2, (Math.sin(x * 0.2) * Math.cos(z * 0.23) + 1) / 2 * 0.7 + r() * 0.15);
    c.lerp(rock, Math.min(1, Math.max(0, (y - 2.2) / 5)) * 0.85);
    c.lerp(sand, sstep(44, 58, rr) * 0.9);
    c.lerp(deep, Math.max(0, -y - 0.6) * 0.4);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, toon('#ffffff', null, {vertexColors: true}));
  m.receiveShadow = true; m.castShadow = true;
  return m;
}

export function buildSea() {
  const geo = new THREE.PlaneGeometry(700, 700, 70, 70); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshToonMaterial({color: '#2aa7c9', gradientMap: toon('#fff').gradientMap, transparent: true, opacity: 0.94});
  const m = new THREE.Mesh(geo, mat); m.position.y = SEA_Y; m.receiveShadow = true;
  const base = geo.attributes.position.array.slice();
  m.userData.update = (t) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.setY(i, Math.sin(x * 0.09 + t * 0.9) * 0.22 + Math.cos(z * 0.11 + t * 0.7) * 0.18); }
    p.needsUpdate = true;
  };
  // foam ring where the water meets the beach
  return m;
}

// cracks in the dry ground (thin dark zig-zag strips)
export function cracks(cx, cz, rad, n, seed = 3) {
  const g = new THREE.Group(); const r = rng(seed);
  const mat = new THREE.MeshBasicMaterial({color: '#3a2519'});
  for (let i = 0; i < n; i++) {
    let x = cx + (r() - 0.5) * rad * 2, z = cz + (r() - 0.5) * rad * 2, a = r() * 6.28;
    const len = 2 + r() * 4;
    for (let s = 0; s < 5; s++) {
      a += (r() - 0.5) * 1.2; const l = len / 5;
      const seg = new THREE.Mesh(new THREE.PlaneGeometry(l * 1.1, 0.07 + r() * 0.05), mat);
      seg.rotation.x = -Math.PI / 2; seg.rotation.z = -a;
      x += Math.cos(a) * l; z += Math.sin(a) * l;
      seg.position.set(x, groundY(x, z) + 0.03, z); g.add(seg);
    }
  }
  return g;
}
