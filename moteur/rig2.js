// "Noodle" character: flat colour body (bubble / round / square), offset black outline,
// rubber-hose arms and legs (white tubes with black outline), minimal face. Front view.
// ink (outlines) and paper (inside of the limbs) follow the background
const INK = TH.glow ? '#F2EFE9' : '#1D1B19', PAPER = TH.glow ? '#0E0E0F' : '#FBF8F1';
// hero: mustard-yellow speech bubble with a bolder outline; others: any creative shape, colours that suit the background
const HERO_COLOR = '#E3A82B';
const NPAL = {
  creme: ['#E07A5F', '#81B29A', '#7FA7C9', '#F2A7B5', '#B8A1D9', '#4FB3AE', '#F4A261'],
  noir: ['#FF7A6B', '#6EE7B7', '#6EC1FF', '#FF9BC2', '#C4A7FF', '#5ED3CE', '#FFB36B'],
};
const FACE = '#1D1B19'; // faces sit on bright fills: always dark
const SHOULDER = { triangle: 78, star: 92, diamond: 105, heart: 125, crescent: 120 };
const otherColor = i => (TH.glow ? NPAL.noir : NPAL.creme)[i % 7];
const star = (n, r1, r2) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r2 : r1; d += (i ? 'L' : 'M') + (r * Math.cos(a)).toFixed(1) + ' ' + (r * Math.sin(a)).toFixed(1) + ' '; } return d + 'Z'; };
const SHAPES = {
  // all centred on (0,0), about 300px wide
  bubble: 'M-150 -80 Q-150 -150 -80 -150 H80 Q150 -150 150 -80 V70 Q150 140 80 140 H40 L95 185 L5 140 H-80 Q-150 140 -150 70 Z',
  round: 'M-155 0 A155 155 0 1 0 155 0 A155 155 0 1 0 -155 0 Z',
  square: 'M-145 -100 Q-145 -150 -95 -150 H95 Q145 -150 145 -100 V95 Q145 145 95 145 H-95 Q-145 145 -145 95 Z',
  blob: 'M-150 -10 C-160 -120 -60 -165 20 -150 C120 -140 165 -60 150 30 C140 120 60 160 -20 150 C-110 140 -145 80 -150 -10 Z',
  triangle: 'M0 -175 Q14 -175 22 -160 L160 120 Q168 145 140 145 H-140 Q-168 145 -160 120 L-22 -160 Q-14 -175 0 -175 Z',
  star: star(5, 185, 92),
  crescent: 'M40 -160 A160 160 0 1 0 150 90 A125 125 0 1 1 40 -160 Z',
  diamond: 'M0 -170 L150 -10 L0 150 L-150 -10 Z',
  hexagon: star(3, 160, 160).replace(/Z$/, '') && 'M-80 -140 H80 L160 0 L80 140 H-80 L-160 0 Z',
  heart: 'M0 150 C-200 30 -150 -150 0 -70 C150 -150 200 30 0 150 Z',
};
const NBASE = { x: 540, y: 1380, s: 1, tilt: 0, squash: 0, look: 0, mouth: 0.5, eyes: 1, brow: 0,
  aL: [35, 30], aR: [35, 30], hL: 0, hR: 0, legs: 0, sit: 0, walk: 0, walkSpeed: 1, alpha: 1, mouthOpen: 0 };
// arm: [angle from straight down (outwards +), bend (+ = elbow up/out)], hand: 0 open, 1 point, 2 fist
const NPOSE = {
  stand: {},
  wave: { aL: [55, -30], aR: [150, -60], mouth: 0.8 },
  shrug: { aL: [70, 70], aR: [70, 70], hL: 0, hR: 0, mouth: -0.1, brow: 0.6, look: -0.3 },
  point: { aL: [20, 20], aR: [95, 10], hR: 1, mouth: 0.4, look: 0.6 },
  think: { aL: [25, 25], aR: [-30, -110], hR: 2, mouth: -0.2, brow: -0.4, look: -0.5, eyes: 0.8 },
  happy: { aL: [140, 30], aR: [140, 30], mouth: 1, squash: 0.06 },
  sad: { aL: [8, 10], aR: [8, 10], mouth: -0.7, brow: 0.8, eyes: 0.6, tilt: 6, squash: -0.04 },
  proud: { aL: [60, -120], aR: [60, -120], hL: 2, hR: 2, mouth: 0.7, tilt: -3 },
  shout: { aL: [-40, -100], aR: [100, 15], hR: 0, mouth: 0.2, mouthOpen: 1, look: -0.7 },
  hugSelf: { aL: [-60, -130], aR: [-60, -130], hL: 2, hR: 2, mouth: -0.3, eyes: 0.5, brow: 0.7 },
  sitLedge: { sit: 1, aL: [40, 40], aR: [-20, -120], hR: 1, mouth: -0.1, look: 0.4, eyes: 0.9 },
  walk: { walk: 1, aL: [20, 20], aR: [20, 20], mouth: 0.4, look: 0.6 },
};

function makeNoodle(parent, keys, o = {}) {
  const color = o.color ?? (o.hero ? HERO_COLOR : otherColor(o.colorIndex ?? 0)), shape = SHAPES[o.shape ?? (o.hero ? 'bubble' : 'round')];
  const lineW = o.hero ? 12 : 7, tubeOut = o.hero ? 30 : 26, tubeIn = o.hero ? 17 : 17;
  const g = el('g', {}, parent);
  const tube = () => { const gg = el('g', {}, g); return [el('path', { fill: 'none', stroke: INK, 'stroke-width': tubeOut, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gg), el('path', { fill: 'none', stroke: PAPER, 'stroke-width': tubeIn, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gg)]; };
  const legL = tube(), legR = tube();
  const footL = el('path', { fill: 'none', stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
  const footR = el('path', { fill: 'none', stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
  const armBackL = tube();
  const body = el('g', {}, g);
  const fill = el('path', { d: shape, fill: color }, body);
  const outline = el('path', { d: shape, fill: 'none', stroke: INK, 'stroke-width': lineW, 'stroke-linejoin': 'round', pathLength: 100, 'stroke-dasharray': '74 26', 'stroke-dashoffset': o.gapAt ?? 8 }, body);
  const face = el('g', {}, body);
  const eyeL = el('path', { fill: 'none', stroke: FACE, 'stroke-width': 7, 'stroke-linecap': 'round' }, face);
  const eyeR = el('path', { fill: 'none', stroke: FACE, 'stroke-width': 7, 'stroke-linecap': 'round' }, face);
  const browL = el('path', { fill: 'none', stroke: FACE, 'stroke-width': 5, 'stroke-linecap': 'round' }, face);
  const browR = el('path', { fill: 'none', stroke: FACE, 'stroke-width': 5, 'stroke-linecap': 'round' }, face);
  const mouth = el('path', { fill: 'none', stroke: FACE, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, face);
  const armL = tube(), armR = tube();
  const handL = el('g', {}, g), handR = el('g', {}, g);
  const KEEP = ['x', 'y', 's', 'alpha'];
  let carry = { ...NBASE, ...(o.start ?? {}) };
  const ks = keys.map(([t, p, d]) => {
    const ov = typeof p === 'string' ? { pose: p } : p;
    let pose;
    if (ov.pose) { pose = { ...NBASE, ...NPOSE[ov.pose] }; for (const k of KEEP) pose[k] = carry[k]; } else pose = { ...carry };
    Object.assign(pose, ov); delete pose.pose; carry = pose;
    return [t, pose, d ?? 0.5];
  });
  const off = o.phase ?? 0;
  function drawHand(hg, type, ang, side) {
    // hand drawn in its own frame, pointing along the arm direction
    while (hg.firstChild) hg.removeChild(hg.firstChild);
    const a = el('g', { transform: `rotate(${ang})` }, hg);
    if (type > 1.5) { // fist
      el('path', { d: 'M-16 -4 Q-20 22 0 24 Q20 22 16 -4 Z', fill: PAPER, stroke: INK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, a);
      el('path', { d: 'M-10 8 H10 M-10 15 H10', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }, a);
    } else if (type > 0.5) { // pointing finger
      el('path', { d: `M-14 -2 Q-18 18 0 20 Q14 18 14 6 M${side * 6} 4 L${side * 6} 52`, fill: PAPER, stroke: INK, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, a);
    } else { // open hand with fingers
      el('path', { d: 'M-16 -2 Q-22 26 -10 34 M-4 4 L-6 44 M6 4 L8 46 M15 -2 L22 38', fill: 'none', stroke: INK, 'stroke-width': 6, 'stroke-linecap': 'round' }, a);
    }
  }
  let lastHands = '';
  updaters.push(t => {
    let i = 0; while (i + 1 < ks.length && ks[i + 1][0] <= t) i++;
    let P = ks[i][1];
    if (i > 0 || t >= ks[0][0]) { const [t1, p1, d1] = ks[i], prev = i > 0 ? ks[i - 1][1] : p1; P = mixPose2(prev, p1, eIO(prog(t, t1, d1))); }
    if (P.alpha <= 0.001) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    const s = P.s, sit = P.sit;
    const breath = Math.sin(t * 2.0 + off);
    const sq = P.squash + 0.018 * breath;
    let legLen = 210 - 120 * sit, bob = 0;
    const ph = t * P.walkSpeed * 2 * Math.PI;
    if (P.walk > 0.01) bob = -10 * P.walk * Math.abs(Math.sin(ph));
    // body centre (local, ground at y=0)
    const bodyH = 150;
    const cy = -(legLen + bodyH) + bob;
    const tilt = P.tilt + 2 * Math.sin(t * 1.3 + off);
    body.setAttribute('transform', `translate(0,${cy}) rotate(${tilt}) scale(${1 + sq},${1 - sq})`);
    fill.setAttribute('transform', 'translate(12,10)');
    // face
    const lx = P.look * 55, ey = -38, op = P.eyes * (((t + off) % 3.6) < 0.12 ? 0.1 : 1);
    eyeL.setAttribute('d', `M${lx - 26} ${ey - 9 * op} V${ey + 9 * op}`);
    eyeR.setAttribute('d', `M${lx + 18} ${ey - 9 * op} V${ey + 9 * op}`);
    const b = P.brow;
    browL.setAttribute('d', `M${lx - 38} ${ey - 26 - b * 6} L${lx - 16} ${ey - 26 + b * 2}`);
    browR.setAttribute('d', `M${lx + 8} ${ey - 26 + b * 2} L${lx + 30} ${ey - 26 - b * 6}`);
    browL.setAttribute('opacity', Math.abs(b) > 0.2 ? 1 : 0); browR.setAttribute('opacity', Math.abs(b) > 0.2 ? 1 : 0);
    const m = P.mouth, mo = P.mouthOpen;
    mouth.setAttribute('d', mo > 0.3 ? `M${lx - 20} 6 Q${lx} ${-6} ${lx + 20} 6 Q${lx} ${36} ${lx - 20} 6 Z` : `M${lx - 26} 8 Q${lx - 4} ${8 + m * 22} ${lx + 22} ${8 - m * 2}`);
    mouth.setAttribute('fill', mo > 0.3 ? FACE : 'none');
    // legs
    const hipY = cy + bodyH * (1 - sq) - 6;
    const stepL = P.walk * 40 * Math.sin(ph), stepR = -stepL;
    if (sit > 0.5) {
      legL[0].setAttribute('d', `M-45 ${hipY} Q-40 ${hipY + 40} -70 ${hipY + 70} L-60 ${hipY + 170}`);
      legR[0].setAttribute('d', `M45 ${hipY} Q50 ${hipY + 40} 30 ${hipY + 70} L45 ${hipY + 170}`);
    } else {
      legL[0].setAttribute('d', `M-45 ${hipY} L${-48 + stepL} ${-6}`);
      legR[0].setAttribute('d', `M45 ${hipY} L${48 + stepR} ${-6}`);
    }
    legL[1].setAttribute('d', legL[0].getAttribute('d')); legR[1].setAttribute('d', legR[0].getAttribute('d'));
    const fy = sit > 0.5 ? hipY + 172 : -2;
    const flx = sit > 0.5 ? -60 : -48 + stepL, frx = sit > 0.5 ? 45 : 48 + stepR;
    footL.setAttribute('d', `M${flx - 16} ${fy} H${flx + 8}`); footR.setAttribute('d', `M${frx - 8} ${fy} H${frx + 16}`);
    // arms (rubber hose): shoulder on the body side, quadratic curve through a bent elbow
    const arm = (side, [ang, bend], swing) => {
      const a = (ang + swing) * Math.PI / 180;
      const sx = side * (SHOULDER[o.shape] ?? 138), sy = cy + 10;
      const L = 190;
      const hx = sx + side * L * Math.sin(a), hy = sy + L * Math.cos(a);
      const mx = (sx + hx) / 2, my = (sy + hy) / 2;
      const nx = -(hy - sy) / L, ny = (hx - sx) / L; // perpendicular
      const k = bend * side * 0.9;
      const cx = mx + nx * k, cy2 = my + ny * k;
      return { d: `M${sx} ${sy} Q${cx} ${cy2} ${hx} ${hy}`, hx, hy, dir: Math.atan2(hy - cy2, hx - cx) * 180 / Math.PI - 90 };
    };
    const sw = P.walk * 18 * Math.sin(ph) + 3 * Math.sin(t * 1.9 + off);
    const A = arm(-1, P.aL, sw), B = arm(1, P.aR, -sw);
    for (const p of armL) p.setAttribute('d', A.d);
    for (const p of armR) p.setAttribute('d', B.d);
    const hk = `${Math.round(P.hL)}${Math.round(P.hR)}${A.dir.toFixed(0)}${B.dir.toFixed(0)}`;
    if (hk !== lastHands) { drawHand(handL, Math.round(P.hL), A.dir, -1); drawHand(handR, Math.round(P.hR), B.dir, 1); lastHands = hk; }
    handL.setAttribute('transform', `translate(${A.hx},${A.hy})`); handR.setAttribute('transform', `translate(${B.hx},${B.hy})`);
    g.setAttribute('transform', `translate(${P.x},${P.y}) scale(${s})`);
    g.setAttribute('opacity', P.alpha);
    api.hand = [P.x + B.hx * s, P.y + B.hy * s]; api.handL = [P.x + A.hx * s, P.y + A.hy * s];
    api.head = [P.x, P.y + cy * s];
  });
  const api = { g };
  return api;
}
function mixPose2(a, b, k) {
  const o = {};
  for (const key in NBASE) { const va = a[key] ?? NBASE[key], vb = b[key] ?? NBASE[key]; o[key] = Array.isArray(va) ? va.map((v, i) => v + (vb[i] - v) * k) : va + (vb - va) * k; }
  return o;
}
