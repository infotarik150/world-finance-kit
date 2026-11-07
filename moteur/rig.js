// Articulated side-view character with pose keyframes, breathing, blinking and walk cycles.
// Angles in degrees: 0 = pointing straight down, +90 = forward (towards the face).
const SEG = { T: 150, N: 8, R: 78, UA: 94, FA: 86, TH: 112, SH: 106 };
const BASE = { x: 540, y: 1380, s: 1.15, dir: 1, lean: 0, head: 0, aF: [12, 18], aB: [-10, 14], lF: [4, -2], lB: [-5, -2],
  mouth: 0.2, brow: 0, eyes: 1, look: 0, walk: 0, walkSpeed: 0.9, anchor: 0, hipY: 0, alpha: 1, breath: 1, glow: 0, tap: 0, shadow: 1 };
// anchor 0 = feet on ground line y; anchor 1 = hip placed at (x, hipY) (sitting)

const POSE = {
  stand: {},
  proud: { lean: -5, head: -10, aF: [-38, 105], aB: [-40, 100], lF: [12, 0], lB: [-12, 0], mouth: 0.7, brow: 0.2 },
  doubt: { lean: 4, head: 14, aF: [28, 140], aB: [-6, 10], mouth: -0.3, brow: -0.6, look: 0.4 },
  recoil: { lean: -16, head: -6, aF: [70, 55], aB: [55, 60], lF: [18, -6], lB: [-22, -4], mouth: -0.6, brow: 0.6 },
  frown: { lean: -4, head: 4, aF: [10, 20], aB: [-8, 16], mouth: -0.5, brow: 0.7 },
  victory: { lean: -4, head: -12, aF: [168, 8], aB: [150, 22], lF: [10, 0], lB: [-10, 0], mouth: 0.9, brow: 0.2 },
  refuse: { lean: -3, head: -4, aF: [24, 118], aB: [30, 108], mouth: -0.3, brow: 0.5 },
  think: { lean: 2, head: -8, aF: [30, 145], aB: [-6, 12], mouth: 0, brow: 0.3, look: -0.5 },
  annoyed: { lean: -2, head: 6, aF: [24, 120], aB: [30, 110], mouth: -0.7, brow: 0.9 },
  give: { lean: 8, head: 4, aF: [78, 8], aB: [62, 20], lF: [14, 0], lB: [-10, 0], mouth: 0.6, brow: -0.1 },
  hurt: { lean: 12, head: 28, aF: [4, 6], aB: [-4, 8], mouth: -0.8, brow: -0.8, eyes: 0.7 },
  hug: { lean: 6, head: 14, aF: [40, 120], aB: [46, 112], mouth: -0.4, brow: -0.5 },
  push: { lean: 42, head: -18, aF: [100, 4], aB: [92, 14], lF: [32, -38], lB: [-34, -14], mouth: -0.4, brow: 0.6 },
  heart: { lean: 2, head: 10, aF: [24, 142], aB: [-4, 10], mouth: 0.3, brow: -0.3, eyes: 0.85 },
  walkAway: { lean: 6, head: 16, aF: [0, 10], aB: [0, 10], mouth: -0.4, brow: -0.5, walk: 1 },
  stop: { lean: -6, head: -4, aF: [86, 30], aB: [-8, 14], mouth: -0.2, brow: 0.4 },
  sit: { anchor: 1, lean: 4, head: 6, aF: [40, 50], aB: [36, 56], lF: [88, -88], lB: [82, -84], mouth: 0, brow: 0 },
  sitSad: { anchor: 1, lean: 22, head: 30, aF: [52, 40], aB: [46, 46], lF: [88, -88], lB: [82, -84], mouth: -0.7, brow: -0.8, eyes: 0.75 },
  sitHeadHands: { anchor: 1, lean: 36, head: 30, aF: [118, 128], aB: [108, 132], lF: [88, -88], lB: [82, -84], mouth: -0.6, brow: -0.8, eyes: 0.2 },
  sitLookUp: { anchor: 1, lean: 8, head: -14, aF: [44, 50], aB: [38, 56], lF: [88, -88], lB: [82, -84], mouth: 0.1, brow: -0.6, look: 0.2 },
  climb: { lean: 18, head: -6, aF: [40, 10], aB: [-30, 20], walk: 1, walkSpeed: 0.8, mouth: 0.2, brow: 0.4 },
  crushed: { lean: 46, head: 10, aF: [80, 40], aB: [70, 50], lF: [60, -95], lB: [30, -70], mouth: -0.8, brow: -0.6 },
  kneel: { lean: 18, head: 34, aF: [6, 4], aB: [-2, 6], lF: [80, -80], lB: [-10, -100], mouth: -0.8, brow: -0.9, eyes: 0.6 },
  hugKnees: { anchor: 1, lean: 24, head: 20, aF: [70, 100], aB: [64, 104], lF: [150, -150], lB: [140, -140], mouth: -0.5, brow: -0.6 },
  shrug: { lean: 0, head: -6, aF: [40, 100], aB: [-40, 110], mouth: -0.1, brow: 0.3 },
  offer: { lean: 16, head: 8, aF: [72, 4], aB: [6, 12], mouth: 0.4, brow: -0.2 },
  phone: { lean: 6, head: 26, aF: [36, 110], aB: [4, 12], mouth: 0, brow: 0, eyes: 0.8 },
  point: { lean: 6, head: -4, aF: [92, 4], aB: [-10, 14], lF: [14, 0], lB: [-12, 0], mouth: -0.5, brow: 0.8 },
  surprised: { lean: -8, head: -10, aF: [130, 60], aB: [120, 70], mouth: -0.2, brow: -0.8, eyes: 1.25 },
};

const lerp = (a, b, k) => a + (b - a) * k;
function mixPose(a, b, k) {
  const o = {};
  for (const key in BASE) {
    const va = a[key] ?? BASE[key], vb = b[key] ?? BASE[key];
    o[key] = Array.isArray(va) ? va.map((v, i) => lerp(v, vb[i], k)) : lerp(va, vb, k);
  }
  return o;
}
const rad = d => d * Math.PI / 180;
const down = (p, a, L) => [p[0] + L * Math.sin(rad(a)), p[1] + L * Math.cos(rad(a))];
const up = (p, a, L) => [p[0] + L * Math.sin(rad(a)), p[1] - L * Math.cos(rad(a))];

// keys: [[t, poseOverrides, dur?], ...]  (poseOverrides merged on top of BASE)
function makeChar(parent, keys, o = {}) {
  const front = o.front ?? TH.hero.front, back = o.back ?? TH.hero.back, headC = o.headC ?? TH.hero.headC, ink = o.ink ?? TH.hero.ink;
  const shadowE = el('ellipse', { rx: 110, ry: 16, fill: TH.glow ? 'rgba(0,0,0,0.5)' : 'rgba(90,63,44,0.22)' }, parent);
  const g = el('g', { filter: 'url(#gSoft)' }, parent);
  const inner = el('g', {}, g);
  const mk = (c, w) => el('path', { fill: 'none', stroke: c, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, inner);
  const armB = mk(back, 34), legB = mk(back, 36), footB = mk(back, 30);
  const torso = mk(front, 96);
  const legF = mk(front, 36), footF = mk(front, 30);
  const headG = el('g', {}, inner);
  el('circle', { r: SEG.R, fill: headC }, headG);
  const eye = el('ellipse', { cx: 30, cy: -10, rx: 9.5, ry: 11, fill: ink }, headG);
  const shine = el('circle', { r: 3, fill: '#FFFFFF' }, headG);
  const blush = el('ellipse', { cx: 18, cy: 22, rx: 13, ry: 7, fill: '#F2A7A7', opacity: 0 }, headG);
  const brow = el('path', { fill: 'none', stroke: ink, 'stroke-width': 6, 'stroke-linecap': 'round' }, headG);
  const mouth = el('path', { fill: 'none', stroke: ink, 'stroke-width': 6, 'stroke-linecap': 'round' }, headG);
  const armF = mk(front, 34);
  const handF = el('circle', { r: 20, fill: front }, inner), handB = el('circle', { r: 19, fill: back }, inner);
  inner.insertBefore(handB, torso);
  const chest = el('g', {}, inner); // attachment point for props (heart, lock)
  // position-like fields persist from key to key unless overridden
  const KEEP = ['x', 'y', 's', 'dir', 'hipY', 'alpha'];
  // a key without a named pose keeps the previous key's pose and only changes what it lists
  let carry = { ...BASE, ...(o.start ?? {}) };
  const ks = keys.map(([t, p, d]) => {
    const ov = typeof p === 'string' ? { pose: p } : p;
    let pose;
    if (ov.pose) { pose = { ...BASE, ...POSE[ov.pose] }; for (const k of KEEP) pose[k] = carry[k]; }
    else pose = { ...carry };
    Object.assign(pose, ov); delete pose.pose;
    carry = pose;
    return [t, pose, d ?? 0.5];
  });
  const blinkOff = o.blinkOff ?? 0;
  const api = { g, chest, pose: null, hand: [0, 0], headPos: [0, 0] };

  updaters.push(t => {
    let i = 0;
    while (i + 1 < ks.length && ks[i + 1][0] <= t) i++;
    let P = ks[i][1];
    if (i > 0 || t >= ks[0][0]) {
      const [t1, p1, d1] = ks[i], prev = i > 0 ? ks[i - 1][1] : p1;
      P = mixPose(prev, p1, eIO(prog(t, t1, d1)));
    }
    if (P.alpha <= 0.001) { g.setAttribute('display', 'none'); shadowE.setAttribute('display', 'none'); return; }
    g.removeAttribute('display'); shadowE.removeAttribute('display');
    // idle life: breathing, sway
    const br = P.breath;
    let lean = P.lean + br * 1.6 * Math.sin(t * 1.9 + blinkOff);
    let head = P.head + br * 2.2 * Math.sin(t * 1.4 + 1 + blinkOff);
    let aF = [...P.aF], aB = [...P.aB], lF = [...P.lF], lB = [...P.lB];
    aF[0] += br * 2.5 * Math.sin(t * 1.9 + 0.6); aB[0] += br * 2.5 * Math.sin(t * 1.9 + 2.0);
    if (P.tap > 0.01) lF[1] -= P.tap * 22 * Math.max(0, Math.sin(t * 13));
    let bob = 0;
    if (P.walk > 0.01) {
      const ph = t * P.walkSpeed * 2 * Math.PI, w = P.walk;
      lF[0] += w * 26 * Math.sin(ph); lB[0] += w * 26 * Math.sin(ph + Math.PI);
      lF[1] -= w * 38 * Math.max(0, Math.sin(ph + 1.6)); lB[1] -= w * 38 * Math.max(0, Math.sin(ph + 1.6 + Math.PI));
      aF[0] += w * 22 * Math.sin(ph + Math.PI); aB[0] += w * 22 * Math.sin(ph);
      bob = -w * 7 * Math.abs(Math.sin(ph));
    }
    // forward kinematics (local, hip at origin)
    const hip = [0, 0];
    const neck = up(hip, lean, SEG.T), sh = up(hip, lean, SEG.T - 16);
    const hc = up(neck, lean + head * 0.4, SEG.N + SEG.R - 6);
    const e1 = down(sh, lean + aF[0], SEG.UA), w1 = down(e1, lean + aF[0] + aF[1], SEG.FA);
    const e2 = down(sh, lean + aB[0], SEG.UA), w2 = down(e2, lean + aB[0] + aB[1], SEG.FA);
    const k1 = down(hip, lF[0], SEG.TH), a1 = down(k1, lF[0] + lF[1], SEG.SH);
    const k2 = down(hip, lB[0], SEG.TH), a2 = down(k2, lB[0] + lB[1], SEG.SH);
    const P2 = p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    torso.setAttribute('d', `M${P2(up(hip, lean, 14))} L${P2(up(hip, lean, SEG.T - 30))}`);
    armF.setAttribute('d', `M${P2(sh)} L${P2(e1)} L${P2(w1)}`);
    armB.setAttribute('d', `M${P2(sh)} L${P2(e2)} L${P2(w2)}`);
    legF.setAttribute('d', `M${P2(hip)} L${P2(k1)} L${P2(a1)}`);
    legB.setAttribute('d', `M${P2(hip)} L${P2(k2)} L${P2(a2)}`);
    footF.setAttribute('d', `M${P2(a1)} l28 2`); footB.setAttribute('d', `M${P2(a2)} l28 2`);
    handF.setAttribute('cx', w1[0]); handF.setAttribute('cy', w1[1]);
    handB.setAttribute('cx', w2[0]); handB.setAttribute('cy', w2[1]);
    headG.setAttribute('transform', `translate(${hc[0].toFixed(1)},${hc[1].toFixed(1)}) rotate(${head.toFixed(1)})`);
    const mid = up(hip, lean, SEG.T * 0.66);
    chest.setAttribute('transform', `translate(${mid[0].toFixed(1)},${mid[1].toFixed(1)})`);
    // face
    const cyc = (t + blinkOff) % 3.9, bl = cyc < 0.13 ? Math.abs(cyc - 0.065) / 0.065 : 1;
    const lx = 30 + P.look * 10;
    const ery = 11 * Math.max(0.08, P.eyes * bl);
    eye.setAttribute('cx', lx); eye.setAttribute('ry', ery.toFixed(2));
    eye.setAttribute('rx', (9.5 * Math.min(1.25, Math.max(0.9, P.eyes))).toFixed(2));
    shine.setAttribute('cx', lx + 3); shine.setAttribute('cy', -14); shine.setAttribute('opacity', ery > 5 ? 0.9 : 0);
    blush.setAttribute('opacity', (0.5 * Math.max(0, P.mouth - 0.4)).toFixed(3));
    const b = P.brow; // + angry (inner end down), - sad (inner end up)
    brow.setAttribute('d', `M${lx - 15} ${-33 - b * 6} L${lx + 13} ${-33 + b * 5}`);
    const m = P.mouth;
    mouth.setAttribute('d', `M${lx - 6} 32 Q${lx + 8} ${32 + m * 13} ${lx + 22} ${30 - m * 1}`);
    // placement
    const s = P.s;
    let y;
    const lowest = Math.max(a1[1], a2[1]) + 13;
    y = lerp(P.y - lowest * s, P.hipY, P.anchor);
    y += bob * s;
    const dEff = (P.dir >= 0 ? 1 : -1) * (0.62 + 0.38 * Math.abs(P.dir)); // quick turn: never collapses to a sliver
    g.setAttribute('transform', `translate(${P.x.toFixed(1)},${y.toFixed(1)}) scale(${(dEff * s).toFixed(3)},${s.toFixed(3)})`);
    g.setAttribute('opacity', P.alpha.toFixed(3));
    shadowE.setAttribute('cx', P.x); shadowE.setAttribute('cy', P.y + 4); shadowE.setAttribute('rx', 110 * s);
    shadowE.setAttribute('opacity', (P.alpha * P.shadow * (1 - 0.6 * P.anchor)).toFixed(3));
    api.pose = P;
    api.hand = [P.x + w1[0] * s * P.dir, y + w1[1] * s];
    api.headPos = [P.x + hc[0] * s * P.dir, y + hc[1] * s];
    api.chestPos = [P.x + mid[0] * s * P.dir, y + mid[1] * s];
  });
  return api;
}
