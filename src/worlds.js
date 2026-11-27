import * as THREE from 'three';
import {INK, rng, toon, box, cyl, sign, ink, signTex} from './kit.js';
import {groundY, buildTerrain, buildSea, cracks, STREAM, SEA_Y} from './terrain.js';
import * as P from './island.js';
import {hero} from './hero.js';
import {heroState, SP, SPRING} from './story.js';
import {S, wordT, wordE, ease} from './tm.js';

const pop = (t, a, b, d = 0.35) => { const i = ease(t, a, a + d), o = 1 - ease(t, b, b + 0.3); const k = i * o; return k <= 0.001 ? 0 : k * (1 + 0.12 * Math.sin(Math.min(1, (t - a) / d) * Math.PI)); };
const W_ = (k, w) => wordT(k, w);

export function buildWorld() {
  const W = new THREE.Group();
  const up = [];
  const sea = buildSea(); W.add(buildTerrain(), sea);
  // ---------- scenery: dry, abandoned island ----------
  const r = rng(11);
  const okSpot = (x, z) => Math.hypot(x * 0.9, z * 0.85) < 47 && Math.hypot(x + 6, z + 44) > 6 && !(Math.abs(x) < 7 && z > -3 && z < 18);
  const near = (x, z, list) => list.some(([a, b, d]) => Math.hypot(x - a, z - b) < d);
  const keep = [[2, 14, 4], [0, 0, 3], [-7, -20, 4], [-9, -13, 4], [-13, -7.5, 5], [-4.3, -42.6, 4], [0, 9, 4]];
  const scatter = (n, make, seed) => { const q = rng(seed); let c = 0, g = 0; while (c < n && g++ < n * 40) { const x = (q() - 0.5) * 100, z = -66 + q() * 120; if (!okSpot(x, z) || near(x, z, keep)) continue; const o = make(q, c); P.place(o, x, z, q() * 6.28, -0.02); W.add(o); c++; } };
  scatter(46, (q, i) => P.rock(0.5 + q() * 1.5, ['#8f8579', '#7d756b', '#9d9285', '#a39683'][i % 4], 100 + i), 21);
  scatter(14, (q, i) => P.cactus(0.8 + q() * 0.9, 40 + i), 22);
  scatter(9, (q, i) => P.deadTree(0.8 + q() * 0.9, 60 + i), 23);
  scatter(4, (q, i) => P.skull(0.9 + q() * 0.4), 24);
  scatter(6, (q, i) => P.tumbleweed(0.8 + q() * 0.5), 25);
  scatter(10, (q, i) => P.rockPile(4, 2.4, 0.5, 200 + i), 26);
  // hand-placed set dressing
  const dressings = [];
  const D = (o, x, z, ry = 0, dy = 0) => { P.place(o, x, z, ry, dy); W.add(o); dressings.push(o); return o; };
  D(P.deadTree(1.3, 7), -6.5, 10.5, 0.4); D(P.cactus(1.2, 3), 7.2, 7.5); D(P.cactus(0.9, 5), -11, 16); D(P.skull(1.2), 0.9, 11.4, 0.5); D(P.cactus(0.7, 9), 12.5, 2.5);
  D(P.rockPile(6, 3, 0.55, 301), 5.5, 15.5); D(P.rockPile(5, 3, 0.6, 302), -4.5, 5.5); D(P.rock(1.6, '#8f8579', 303), -9, 6); D(P.rock(1.2, '#a39683', 304), 9, 11);
  D(P.backpack(), -1.4, 8.6, 0.7); D(P.canteen(), -0.7, 8.2, 0); D(P.shovel().rotateZ(1.45), -2.3, 7.6, 0.3, 0.12);
  // dry well + broken fence = "a place left behind by time"
  const well = new THREE.Group(); const wr = cyl(0.9, 0.95, 0.9, '#8f8579', {y: 0.45, seg: 12}); well.add(wr, cyl(0.62, 0.62, 0.92, '#2d2420', {y: 0.47, seg: 12}), box(0.12, 1.6, 0.12, '#6b5443', {x: -0.85, y: 1.3}), box(0.12, 1.6, 0.12, '#6b5443', {x: 0.85, y: 1.3}), box(1.9, 0.12, 0.12, '#6b5443', {y: 2.1}));
  D(well, 14, -6, 0.5);
  for (let i = 0; i < 7; i++) { const post = box(0.14, 1.2 + (i % 3) * 0.2, 0.14, '#7a6048', {y: 0.7}); const g = new THREE.Group(); g.add(post); if (i % 2 === 0) g.add(box(1.6, 0.1, 0.06, '#7a6048', {x: 0.8, y: 0.9 - (i % 3) * 0.1})); g.rotation.z = (i % 3 - 1) * 0.12; D(g, 16 + i * 1.8, 5 + Math.sin(i) * 0.5, 0); }
  D(P.boatWreck(), 38, 31, 0.5, -0.15);
  for (let i = 0; i < 5; i++) { const l = cyl(0.14, 0.12, 2.5 + (i % 3), '#8a7a66', {seg: 7}); l.rotation.z = Math.PI / 2; const g = new THREE.Group(); g.add(l); D(g, 28 + i * 3.2, 44 + (i % 2) * 2.5, i * 0.5, 0.15); }
  // signpost: day 1
  const post = new THREE.Group(); post.add(cyl(0.07, 0.09, 2.2, '#6b4430', {y: 1.1, seg: 7})); const hs = sign('HARI 1', 1.7, 0.8, {bg: '#f2e6cc', w: 512, h: 240, font: 'bold 150px Arial, sans-serif'}); hs.position.set(0.5, 1.75, 0.1); hs.rotation.z = 0.04; post.add(hs); D(post, 3.9, 14.4, -0.1);
  // zero mark + day sign
  const X = P.xMark(); D(X, 0, 0, 0, 0.04);
  const nolSign = sign('TITIK NOL', 1.5, 0.6, {w: 512, h: 210, font: 'bold 120px Arial, sans-serif'}); const nolPost = new THREE.Group(); nolPost.add(cyl(0.05, 0.06, 1.0, '#6b4430', {y: 0.5, seg: 6})); nolSign.position.set(0, 1.15, 0); nolPost.add(nolSign); D(nolPost, 1.6, -0.6, -0.15);
  for (const [x, z] of [[0.9, 0.2], [-0.8, 0.6], [0.2, -0.9], [1.3, -0.4], [-1.2, -0.7]]) D(P.deadSprout(), x, z, x);
  W.add(cracks(0, 2, 9, 70, 3), cracks(-4, -30, 10, 40, 8), cracks(-3, -44, 6, 22, 9));
  const dust = P.dustField(260); W.add(dust);
  // tumbleweed rolling past
  const tw = P.tumbleweed(1.1), tw2 = P.tumbleweed(0.8); W.add(tw, tw2);
  // tools
  const pickG = P.pickaxe(); pickG.rotation.z = -0.6; W.add(pickG);
  const hand = hero({seed: 5}); const H = hand; W.add(H);
  const pickH = P.pickaxe(); pickH.position.set(0, 0.28, 0.02); pickH.visible = false; H.userData.hands.R.add(pickH);
  const seedH = P.seedItem(); seedH.position.set(0.0, 0.03, 0.05); seedH.visible = false; H.userData.hands.R.add(seedH);
  const sapH = P.sapling(0.45); sapH.position.set(0, 0.0, 0.05); sapH.visible = false; H.userData.hands.R.add(sapH);
  // calendar board: 100 days
  const calCan = document.createElement('canvas'); calCan.width = 640; calCan.height = 640; const cg = calCan.getContext('2d');
  const calTex = new THREE.CanvasTexture(calCan); calTex.colorSpace = THREE.SRGBColorSpace;
  let lastCal = '';
  const drawCal = (done, blink) => {
    const key = done + '|' + blink; if (key === lastCal) return; lastCal = key;
    cg.fillStyle = '#f2e6cc'; cg.fillRect(0, 0, 640, 640); cg.strokeStyle = INK; cg.lineWidth = 10; cg.strokeRect(8, 8, 624, 624);
    cg.fillStyle = INK; cg.font = 'bold 54px Arial'; cg.textAlign = 'center'; cg.textBaseline = 'middle'; cg.fillText('100 HARI', 320, 52);
    for (let i = 0; i < 100; i++) {
      const cx = 40 + (i % 10) * 56, cy = 110 + Math.floor(i / 10) * 51;
      const isDone = i < done, isBlink = i === done && blink;
      cg.fillStyle = isDone ? '#58b04a' : isBlink ? '#f2a53a' : '#e4d6b4'; cg.fillRect(cx, cy, 50, 45);
      cg.strokeStyle = INK; cg.lineWidth = 2; cg.strokeRect(cx, cy, 50, 45);
      cg.fillStyle = isDone ? '#ffffff' : INK; cg.font = 'bold 22px Arial'; cg.fillText(String(i + 1), cx + 25, cy + 23);
    }
    calTex.needsUpdate = true;
  };
  drawCal(0, false);
  const cal = new THREE.Group(); const calBoard = box(2.0, 2.0, 0.1, '#ffffff', {thick: 0.02}); const plain = toon('#6b4430'); calBoard.material = [plain, plain, plain, plain, new THREE.MeshBasicMaterial({map: calTex}), plain];
  calBoard.position.y = 2.2; cal.add(calBoard, cyl(0.06, 0.07, 3.2, '#6b4430', {x: -0.8, y: 1.5, seg: 6}), cyl(0.06, 0.07, 3.2, '#6b4430', {x: 0.8, y: 1.5, seg: 6})); W.add(cal);
  // ---------- spring + mound ----------
  const [spx, spz] = SPRING; const spy = groundY(spx, spz);
  const mound = [[-0.5, 0.3, 0.7], [0.4, 0.5, 0.6], [-0.1, -0.5, 0.75], [0.8, -0.1, 0.55], [-1.0, -0.2, 0.6], [0.1, 0.05, 0.8]].map(([dx, dz, s], i) => { const k = P.rock(s, ['#8f8579', '#7d756b', '#a39683'][i % 3], 500 + i); W.add(k); return {k, dx, dz, s}; });
  const bigRocks = [[-7.8, -45.8, 2.2], [-3.6, -46.4, 1.9], [-9.4, -43.2, 1.5], [-2.2, -43.4, 1.3], [-6.4, -48, 2.8]]; bigRocks.forEach(([x, z, s], i) => { const k = P.rock(s, '#8f8579', 600 + i); P.place(k, x, z, i); W.add(k); });
  const slit = box(0.9, 0.05, 0.16, '#1d130e', {x: spx, y: spy + 0.04, z: spz, edges: false, thick: 0.001}); slit.rotation.y = 0.5; W.add(slit);
  const damp = new THREE.Mesh(new THREE.CircleGeometry(0.9, 24), new THREE.MeshBasicMaterial({color: '#5a3f2b', transparent: true, opacity: 0.85})); damp.rotation.x = -Math.PI / 2; damp.position.set(-5.2, groundY(-5.2, -43.2) + 0.05, -43.2); W.add(damp);
  const veins = new THREE.Group(); const veinM = new THREE.MeshBasicMaterial({color: '#59d6ff', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false});
  for (let i = 0; i < 7; i++) { const l = 1.2 + (i % 3) * 0.7; const v = new THREE.Mesh(new THREE.PlaneGeometry(l, 0.08), veinM); v.rotation.x = -Math.PI / 2; v.rotation.z = i * 0.9; const a = i * 0.9; v.position.set(-5.4 + Math.cos(a) * 0.5 * l * 0.5, groundY(-5.4, -43.4) + 0.06, -43.4 + Math.sin(a) * 0.4 * l * 0.5); veins.add(v); }
  W.add(veins);
  const drop = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshBasicMaterial({color: '#6ad4f6'})); W.add(drop);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 28), new THREE.MeshBasicMaterial({color: '#bff0ff', transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false})); ring.rotation.x = -Math.PI / 2; ring.position.set(spx, spy + 0.1, spz); W.add(ring);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({color: '#3eb2e0', transparent: true, opacity: 0.95})); pool.rotation.x = -Math.PI / 2; pool.position.set(spx, spy + 0.08, spz); W.add(pool);
  const stream = P.waterRibbon(STREAM, {width: 0.9}); W.add(stream);
  const rockOut = [[-1.7, -41.6], [-1.1, -42.4], [-1.9, -43.3], [-0.9, -41.0], [-2.4, -42.0], [-1.4, -43.8]];
  // ---------- icons ----------
  const mkIcon = (o) => { W.add(o); o.visible = false; return o; };
  const iTree = mkIcon(P.iconTree()), iHouse = mkIcon(P.iconHouse()), iBut = mkIcon(P.iconButterfly()), iDrop = mkIcon(P.iconDrop());
  const iEx = mkIcon(P.textIcon('!', '#ffffff', '#f2a53a', 0.8)), iQ = [0, 1, 2].map(() => mkIcon(P.textIcon('?', '#ffffff', '#4a8ad8', 0.7)));
  const iHeart = mkIcon(P.iconHeart()); const pulse = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 28), new THREE.MeshBasicMaterial({color: '#bff0ff', transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false})); pulse.rotation.x = -Math.PI / 2; pulse.visible = false; W.add(pulse);
  const iSun = mkIcon(P.iconSun());
  const sp = P.sparkles(70); W.add(sp);
  // ---------- choice dioramas ----------
  const saps = [[-12.3, -17.5], [-8.6, -21.4], [-11.8, -22.4], [-9.4, -15.8], [-13.2, -20.4], [-6, -23.4], [-12.6, -14.6]].map(([x, z], i) => { const s = P.sapling(0.9 + (i % 3) * 0.25); P.place(s, x, z, i); s.scale.setScalar(0.001); W.add(s); return s; });
  const tufts = Array.from({length: 26}, (_, i) => { const u = (i % 13) / 13; const q = rng(900 + i); const x = -10 - u * 5 + (q() - 0.5) * 7, z = -22 + u * 26 + (q() - 0.5) * 4; const g = P.grassTuft(1 + q() * 0.6, i); P.place(g, x, z, q() * 6, 0.02); g.scale.setScalar(0.001); W.add(g); return g; });
  const sign1 = new THREE.Group(); sign1.add(cyl(0.06, 0.07, 1.8, '#6b4430', {y: 0.9, seg: 6})); const s1 = sign('PILIHAN 1', 2.2, 1.1, {w: 640, h: 320, font: 'bold 120px Arial, sans-serif', sub: 'TANAM POHON', bg: '#d8efc4'}); s1.position.set(0, 1.9, 0.1); sign1.add(s1); P.place(sign1, -8.4, -18.6, 0.15); W.add(sign1); sign1.scale.setScalar(0.001);
  const sign2 = new THREE.Group(); sign2.add(cyl(0.06, 0.07, 1.8, '#6b4430', {y: 0.9, seg: 6})); const s2 = sign('PILIHAN 2', 2.2, 1.1, {w: 640, h: 320, font: 'bold 120px Arial, sans-serif', sub: 'BENDUNGAN', bg: '#cfe6f6'}); s2.position.set(0, 1.9, 0.1); sign2.add(s2); P.place(sign2, -11.5, -7.2, -0.1); W.add(sign2); sign2.scale.setScalar(0.001);
  const damG = P.dam(); P.place(damG, -16, -9, -0.25, 0.0); W.add(damG); damG.scale.setScalar(0.001);
  const pond = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshBasicMaterial({color: '#3eb2e0', transparent: true, opacity: 0.93})); pond.rotation.x = -Math.PI / 2; pond.position.set(-16.2, groundY(-16.2, -11) + 0.12, -11.2); pond.scale.setScalar(0.001); W.add(pond);
  const voteS = [-1, 1].map((sd, i) => { const g = new THREE.Group(); g.add(cyl(0.05, 0.06, 1.3, '#6b4430', {y: 0.65, seg: 6})); const bd = sign(String(i + 1), 1.0, 1.0, {w: 256, h: 256, font: 'bold 200px Arial, sans-serif', bg: i ? '#cfe6f6' : '#d8efc4'}); bd.position.set(0, 1.5, 0.05); g.add(bd); P.place(g, -9 + sd * 1.6, -12.4, -sd * 0.2); W.add(g); g.scale.setScalar(0.001); return g; });
  const bars = [0, 1].map((i) => { const b = box(0.5, 1, 0.3, i ? '#3b8fd0' : '#58b04a', {thick: 0.02}); b.visible = false; W.add(b); return b; });
  const cmt = sign('KOMENTAR', 2.4, 0.8, {w: 640, h: 220, font: 'bold 112px Arial, sans-serif', sub: '1  atau  2', bg: '#fff4dc'}); cmt.visible = false; W.add(cmt);
  const lerp = (a, b, k) => a + (b - a) * k;

  // ======== per-frame update ========
  const update = (t, cam, shot) => {
    sea.userData.update(t);
    const st = heroState(t); const hp = st.pos;
    H.position.set(hp.x, hp.y, hp.z);
    const n = st.num, d = st.disc;
    H.userData.apply(t, {speak: true, walk: hp.walk, crouch: n.crouch, wind: n.wind, tilt: n.tilt, wobble: n.wobble, look: [n.lx, n.ly], pose: {aL: n.aL, eL: n.eL, aR: n.aR, eR: n.eR},
      expr: {eyes: d.eyes, mouth: d.mouth, browL: n.browL, browR: n.browR, browY: n.browY, blush: n.blush}, sweat: d.sweat, dirt: d.dirt, waveEl: d.waveEl}, cam.position);
    // hand-held items
    const swing = Math.sin(t * 5.5);
    pickH.visible = d.tool; pickH.rotation.z = -0.5 + swing * 0.5; seedH.visible = shot === 'kubur' || shot === 'nol'; sapH.visible = d.sapling;
    const gs = S.gali.start;
    const pickOnGround = !(shot === 'gali' || shot === 'tetes') && t < gs;
    pickG.visible = true; if (pickOnGround) { P.place(pickG, 0.4, 7.7, 0.6, 0.55); pickG.rotation.z = -0.6; } else if (!d.tool) { P.place(pickG, -3.4, -41.2, 0.4, 0.5); pickG.rotation.z = -0.5; } else pickG.visible = false;
    // tumbleweeds
    const tx = 16 - ((t * 2.4) % 46), tx2 = 22 - (((t + 9) * 1.9) % 46);
    tw.position.set(tx, groundY(tx, 12.8) + 0.55 + Math.abs(Math.sin(t * 3)) * 0.2, 12.8); tw.rotation.z = t * 4.4; tw.visible = t < S.sungai.start;
    tw2.position.set(tx2, groundY(tx2, 3) + 0.5 + Math.abs(Math.sin(t * 3 + 1)) * 0.2, 3); tw2.rotation.z = t * 3.5; tw2.visible = t < S.sungai.start;
    dust.visible = t < S.sungai.start; dust.userData.update(t, new THREE.Vector3(cam.position.x, hp.y - 0.4, cam.position.z - 3), 1);
    dust.material.opacity = shot === 'lereng' || shot === 'gali' ? 0.9 : 0.55;
    // calendar placement
    const calMain = shot === 'misi' || shot === 'ubah';
    if (shot === 'misi') { P.place(cal, 3.0, 7.7, -0.12); cal.visible = true; drawCal(0, false); cal.scale.setScalar(Math.max(0.001, ease(t, W_('misi', 'seratus') - 0.4, W_('misi', 'seratus') + 0.3))); }
    else if (shot === 'seratus' || shot === 'alir' || shot === 'nasib' || shot === 'tanya') { P.place(cal, -4.9, -19.3, -0.15); cal.visible = true; cal.scale.setScalar(1); const two = shot === 'tanya' && t > W_('tanya', 'kedua'); drawCal(two ? 1 : 1, two && Math.floor(t * 2.5) % 2 === 0); }
    else cal.visible = false;
    // mound, rocks flying
    const toss = (i) => W_('gali', 'penggalian') + 0.6 + i * 1.05;
    mound.forEach((m, i) => {
      const t0 = toss(i), t1 = t0 + 0.9; const a = [spx + m.dx, spz + m.dz], b = rockOut[i];
      if (t < t0) { m.k.position.set(a[0], groundY(...a) + 0.02, a[1]); }
      else if (t < t1) { const k = (t - t0) / 0.9; const x = lerp(a[0], b[0], k), z = lerp(a[1], b[1], k); m.k.position.set(x, lerp(groundY(...a), groundY(...b), k) + Math.sin(k * Math.PI) * 2.0 + 0.3, z); m.k.rotation.z = k * 6; }
      else m.k.position.set(b[0], groundY(...b) + 0.02, b[1]);
    });
    const cleared = t > toss(mound.length - 1) + 0.6; slit.visible = cleared;
    // damp patch + glowing vein
    const lemb = W_('harap', 'lembap'); damp.visible = t > lemb; damp.scale.setScalar(Math.max(0.001, ease(t, lemb, lemb + 0.8)));
    const trap = W_('harap', 'terperangkap'); const vOn = t > trap && t < S.sungai.start; veins.visible = vOn; veinM.opacity = 0.45 + 0.45 * Math.sin(t * 5);
    // droplet + splash + pool
    const tt = W_('tetes', 'Tetesan'); const form0 = S.tetes.start - 0.2;
    const dropR = 0.07 * ease(t, form0, tt) + 0.004; let dy = 0.55;
    const fall = ease(t, tt, tt + 0.38); dy = lerp(0.55, 0.02, fall * fall);
    drop.visible = t > form0 && t < tt + 0.4; drop.scale.set(dropR * (1 - 0.3 * fall), dropR * (1 + 0.5 * (1 - fall)), dropR * (1 - 0.3 * fall)); drop.position.set(spx + 0.2, spy + dy, spz);
    const sp0 = tt + 0.38; const rk = (t - sp0) / 1.0; ring.visible = rk > 0 && rk < 1; ring.scale.setScalar(0.1 + rk * 1.2); ring.material.opacity = 0.9 * (1 - rk);
    const poolR = 0.55 * ease(t, sp0, W_('tetes', 'muncul') + 0.5) + 0.7 * ease(t, S.sungai.start, S.sungai.start + 4);
    pool.visible = t > sp0; pool.scale.setScalar(Math.max(0.001, poolR));
    // river flow
    stream.userData.setProgress(ease(t, S.sungai.start + 0.4, S.sungai.start + 9.4), t);
    // -------- holo icons --------
    const hy = hp.y;
    const nolK = shot === 'nol';
    const place3 = (o, dx, dy2, dz, s) => { o.visible = s > 0.002; o.position.set(hp.x + dx, hy + dy2 + Math.sin(t * 2 + dx) * 0.06, hp.z + dz); o.scale.setScalar(Math.max(0.001, s)); o.rotation.y = Math.sin(t * 1.3) * 0.3; };
    if (nolK) {
      const a1 = W_('nol', 'hutan'), a2 = W_('nol', 'rumah'), a3 = W_('nol', 'kehidupan'), a4 = W_('nol', 'air');
      place3(iTree, 1.0, 2.35, 0.2, pop(t, a1, a1 + 1.6) * 1.0); place3(iHouse, 1.0, 2.3, 0.2, pop(t, a2, a2 + 1.6)); place3(iBut, 0.9, 2.45, 0.3, pop(t, a3, a3 + 1.5) * 1.1);
      const dsc = pop(t, a4, S.nol.end + 0.6, 0.5) * 1.5; place3(iDrop, 0.9, 2.1, 0.3, dsc);
      iBut.userData.wings && iBut.userData.wings.forEach((w, i) => { w.scale.x = 0.4 + 0.6 * Math.abs(Math.sin(t * 12)); });
    } else { iTree.visible = iHouse.visible = iBut.visible = iDrop.visible = false; }
    const lm = W_('harap', 'lembap'); place3(iEx, 0.55, 2.25 - (hp.y ? 0 : 0), 0.1, shot === 'harap' ? pop(t, lm, lm + 1.6) : 0);
    const tq = shot === 'tanya' ? 1 : 0; iQ.forEach((q, i) => place3(q, (i - 1) * 0.95, 2.35 + (i === 1 ? 0.35 : 0), 0.1, tq * ease(t, S.tanya.start + i * 0.35, S.tanya.start + i * 0.35 + 0.4)));
    // heartbeat over the stream
    const hbOn = shot === 'detak'; const beat = Math.pow(Math.max(0, Math.sin(t * 5.6)), 4);
    iHeart.visible = hbOn; iHeart.position.set(-9.8, groundY(-9.8, -19) + 1.35, -19.2); iHeart.scale.setScalar(1.3 + beat * 0.5);
    const pk = (t * 1.1) % 1; pulse.visible = hbOn; pulse.position.set(-10, groundY(-10, -19) + 0.12, -19); pulse.scale.setScalar(0.3 + pk * 1.8); pulse.material.opacity = 0.8 * (1 - pk);
    // sparkles
    const sc = {nol: [hp.x + 0.9, hy + 1.5, hp.z + 0.3, 1.1, 1.6], tetes: [spx, spy, spz, 1.2, 1.2], sungai: [-9, groundY(-9, -34), -34, 4, 3], detak: [-10, groundY(-10, -19), -19, 2, 2.4], nasib: [hp.x, hy, hp.z, 2.2, 3], komen: [hp.x, hy, hp.z, 2.4, 3], pil1: [-10.5, groundY(-10.5, -19), -19, 3, 3]}[shot];
    sp.visible = !!sc && (shot !== 'tetes' || t > tt + 0.3); if (sc) sp.userData.update(t, new THREE.Vector3(sc[0], sc[1], sc[2]), sc[3], sc[4]);
    // choice 1: saplings and grass
    const m0 = W_('pil1', 'menanam'); const onP1 = t >= S.pil1.start - 0.5;
    sign1.scale.setScalar(Math.max(0.001, onP1 ? ease(t, S.pil1.start - 0.3, S.pil1.start + 0.4) : 0)); sign1.visible = onP1 && t < S.pil2.start;
    saps.forEach((s, i) => { const a = m0 + 0.1 + i * 0.32; const k = ease(t, a, a + 0.8); s.scale.setScalar(Math.max(0.001, k * (0.9 + 0.15 * Math.sin(Math.min(1, (t - a) / 0.8) * Math.PI)))); s.visible = t < S.pil2.start; });
    tufts.forEach((g, i) => { const a = m0 + i * 0.12; g.scale.setScalar(Math.max(0.001, ease(t, a, a + 0.5))); g.visible = t < S.pil2.start; });
    // choice 2: dam + pond + sun
    const bd = W_('pil2', 'bendungan'), pn = W_('pil2', 'penampungan'), ms = W_('pil2', 'musim');
    const onP2 = t >= S.pil2.start - 0.2;
    sign2.visible = onP2 && t < S.komen.start; sign2.scale.setScalar(Math.max(0.001, ease(t, S.pil2.start - 0.1, S.pil2.start + 0.4)));
    damG.visible = onP2 && t < S.komen.start; damG.scale.setScalar(Math.max(0.001, ease(t, bd, bd + 0.7)));
    pond.visible = onP2 && t < S.komen.start; pond.scale.setScalar(Math.max(0.001, 2.1 * ease(t, pn, pn + 1.6)));
    place3(iSun, -2.9, 3.2, -1.0, shot === 'pil2' ? pop(t, ms, ms + 2.2) * 1.7 : 0);
    // vote
    const onK = shot === 'komen';
    voteS.forEach((g, i) => { g.visible = onK; g.scale.setScalar(Math.max(0.001, onK ? ease(t, S.komen.start + 0.2 + i * 0.4, S.komen.start + 0.9 + i * 0.4) : 0)); });
    cmt.visible = onK; cmt.position.set(hp.x, hy + 3.15 + Math.sin(t * 2) * 0.08, hp.z + 0.2); cmt.scale.setScalar(Math.max(0.001, ease(t, S.komen.start + 0.3, S.komen.start + 0.9)));
    const tb = W_('komen', 'terbanyak');
    bars.forEach((b, i) => { b.visible = onK && t > tb - 0.2; const h = 0.5 + 0.55 * (1 + Math.sin(t * 3.2 + i * 3)) * ease(t, tb - 0.2, tb + 0.5); b.scale.y = Math.max(0.01, h); b.position.set(-9 + (i ? 1.6 : -1.6), hy + 1.6 + 1.0 + h / 2 + 0.2, hp.z - 0.4); });
  };
  return {group: W, update};
}
