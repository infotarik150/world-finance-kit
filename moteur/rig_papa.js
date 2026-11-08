// Papa: the main character, 2D "noodle" version of the reference sheet (personnages/papa.md).
// Head from the 3D sheet (ginger quiff, full beard, freckles, round turquoise glasses),
// outfit from the written description (beige cardigan, light blue shirt, brown trousers, leather shoes,
// watch, notebook). Rubber-hose arms and legs, offset outline on the body, front view.
// Needs engine.js (el, updaters, TH, eIO, prog). Ground at y = 0 in local space.
const P_INK = TH.glow ? '#F2EFE9' : '#1D1B19';
const PAPA = {
  skin: '#F4C7A4', skinDark: '#E3A07C', hair: '#E8642A', hairDark: '#B9461A', freckle: '#D9895B',
  glasses: '#25B3A1', cardigan: '#D9C29E', cardiganDark: '#BFA37C', shirt: '#A9CCEB', button: '#7A4A2A',
  pants: '#5B3A29', shoe: '#6B4226', watch: '#6B4226', book: '#E8742A', bookSpine: '#3E6FB3',
  mouth: '#4A1A10', tongue: '#E07A6E', eye: '#1D1B19',
};
const PBASE = { x: 960, y: 930, s: 1, tilt: 0, headTilt: 0, squash: 0, look: 0, lookY: 0, mouth: 0.4, mouthOpen: 0,
  eyes: 1, brow: 0, worry: 0, aL: [18, 1, 1], aR: [18, 1, 1], hL: 0, hR: 0, walk: 0, walkSpeed: 1.1, alpha: 1,
  book: 0, laugh: 0 };
// arm: [angle from straight down (outwards +, degrees), reach 0..1 (1 = arm straight), elbow side (+1 out, -1 in)]
// hand: 0 open, 1 pointing finger, 2 fist
const PPOSE = {
  stand: {},
  walk: { walk: 1, mouth: 0.5, look: 0.4 },
  wave: { aL: [18, 0.95, 1], aR: [155, 0.8, -1], hR: 0, mouth: 0.9, mouthOpen: 0.35, brow: 0.5, headTilt: -4 },
  think: { aL: [22, 0.9, 1], aR: [-72, 0.36, 1], hR: 2, book: 1, mouth: -0.15, brow: 0.3, worry: 0.6,
    look: 0.55, lookY: -0.6, headTilt: 5, eyes: 0.9 },
  laugh: { aL: [-26, 0.62, 1], aR: [-26, 0.62, 1], hL: 0, hR: 0, mouth: 1, mouthOpen: 1, eyes: 0, brow: 0.7,
    laugh: 1, headTilt: -6, squash: 0.03 },
  shrug: { aL: [80, 0.72, 1], aR: [80, 0.72, 1], mouth: -0.35, brow: 1, worry: 0.3, look: -0.3, headTilt: 6 },
  worried: { aL: [10, 0.9, -1], aR: [10, 0.9, -1], mouth: -0.7, brow: 0.6, worry: 1, eyes: 0.8, headTilt: 4 },
  angry: { aL: [40, 0.6, -1], aR: [40, 0.6, -1], hL: 2, hR: 2, mouth: -0.6, brow: -1, eyes: 0.8 },
};
function mixPapa(a, b, k) {
  const o = {};
  for (const key in PBASE) { const va = a[key] ?? PBASE[key], vb = b[key] ?? PBASE[key]; o[key] = Array.isArray(va) ? va.map((v, i) => v + (vb[i] - v) * k) : va + (vb - va) * k; }
  return o;
}

function makePapa(parent, keys, o = {}) {
  const C = PAPA, I = P_INK;
  const g = el('g', {}, parent);
  const P = (d, a, p = g) => el('path', { d, ...a }, p);
  const tube = (out, inn, col) => { const gg = el('g', {}, g); return [P('', { fill: 'none', stroke: I, 'stroke-width': out, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gg), P('', { fill: 'none', stroke: col, 'stroke-width': inn, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gg)]; };
  // offset fill + open outline, the noodle signature
  const offShape = (d, col, p, lw = 9, gap = 8) => { P(d, { fill: col, transform: 'translate(9,7)' }, p); return P(d, { fill: 'none', stroke: I, 'stroke-width': lw, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', pathLength: 100, 'stroke-dasharray': '78 22', 'stroke-dashoffset': gap }, p); };

  const shadow = el('ellipse', { cx: 0, cy: 4, rx: 150, ry: 16, fill: I, opacity: 0.12 }, g);
  // legs + shoes
  const legL = tube(58, 42, C.pants), legR = tube(58, 42, C.pants);
  const shoeL = el('g', {}, g), shoeR = el('g', {}, g);
  const SHOE = 'M-38 0 Q-42 -32 -4 -34 Q30 -34 46 -12 Q54 2 40 4 H-32 Q-40 4 -38 0 Z';
  for (const [sg, m] of [[shoeL, -1], [shoeR, 1]]) {
    const inner = el('g', { transform: `scale(${m},1)` }, sg);
    P(SHOE, { fill: C.shoe, stroke: I, 'stroke-width': 7, 'stroke-linejoin': 'round' }, inner);
    P('M-6 -30 Q4 -20 2 -10', { fill: 'none', stroke: I, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.5 }, inner);
  }
  // left arm behind the body when it hangs; drawn after body for clarity in most poses
  const body = el('g', {}, g);
  // torso, local origin = hip centre
  const TORSO = 'M-112 -262 Q-120 -282 -92 -284 H92 Q120 -282 112 -262 L134 -40 Q140 6 96 8 H-96 Q-140 6 -134 -40 Z';
  P(TORSO, { fill: C.cardigan, transform: 'translate(9,7)' }, body);
  P('M-60 -284 L0 -120 L60 -284 Z', { fill: C.shirt }, body); // shirt V
  P('M-60 -284 L-22 -262 L-8 -238 M60 -284 L22 -262 L8 -238', { fill: 'none', stroke: I, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.55 }, body); // collar
  P('M-136 -22 Q-138 6 -96 8 H96 Q138 6 136 -22 Z', { fill: C.cardiganDark, transform: 'translate(9,7)' }, body); // ribbed hem
  P('M0 -120 V8', { stroke: I, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.7 }, body); // cardigan opening
  P('M-60 -284 L0 -120 L60 -284', { fill: 'none', stroke: I, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.7 }, body);
  for (const by of [-92, -56, -20]) el('circle', { cx: 12, cy: by, r: 8, fill: C.button, stroke: I, 'stroke-width': 3 }, body);
  P('M-100 -110 H-48 V-62 Q-74 -54 -100 -62 Z', { fill: 'none', stroke: I, 'stroke-width': 4, opacity: 0.45, 'stroke-linejoin': 'round' }, body); // pocket
  for (let k = 0; k < 7; k++) P(`M${-112 + k * 6} ${-230 + k * 26} v14 M${108 - k * 6} ${-230 + k * 26} v14`, { stroke: C.cardiganDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, body); // knit hints
  P(TORSO, { fill: 'none', stroke: I, 'stroke-width': 9, 'stroke-linejoin': 'round', pathLength: 100, 'stroke-dasharray': '80 20', 'stroke-dashoffset': 12 }, body);

  // head, local origin = head centre
  const head = el('g', {}, body);
  el('rect', { x: -30, y: 60, width: 60, height: 70, fill: C.skin }, head); // neck
  for (const sx of [-1, 1]) { el('circle', { cx: sx * 100, cy: 8, r: 24, fill: C.skin, stroke: I, 'stroke-width': 6 }, head); P(`M${sx * 104} -2 q${sx * 8} 10 0 20`, { fill: 'none', stroke: C.skinDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, head); }
  const HEAD = 'M-100 0 C-100 -70 -60 -112 0 -112 C60 -112 100 -70 100 0 C100 70 60 112 0 112 C-60 112 -100 70 -100 0 Z';
  P(HEAD, { fill: C.skin }, head);
  const face = el('g', {}, head);
  // beard and moustache (move a little with the look)
  const BEARD = 'M-102 -6 C-110 92 -60 168 0 172 C60 168 110 92 102 -6 C92 26 74 40 52 36 C34 52 -34 52 -52 36 C-74 40 -92 26 -102 -6 Z';
  P(BEARD, { fill: C.hair, stroke: I, 'stroke-width': 7, 'stroke-linejoin': 'round' }, face);
  for (const [x1, y1, x2, y2] of [[-80, 50, -70, 100], [-50, 90, -40, 140], [80, 50, 70, 100], [50, 90, 40, 140], [-15, 130, -10, 158], [15, 130, 10, 158]]) P(`M${x1} ${y1} Q${(x1 + x2) / 2 + 6} ${(y1 + y2) / 2} ${x2} ${y2}`, { fill: 'none', stroke: C.hairDark, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.7 }, face);
  const mouthG = el('g', {}, face);
  const mouthOpenP = P('', { fill: C.mouth, stroke: I, 'stroke-width': 5, 'stroke-linejoin': 'round' }, mouthG);
  const teeth = P('', { fill: '#FFFDF7' }, mouthG);
  const tongue = el('ellipse', { rx: 18, ry: 9, fill: C.tongue }, mouthG);
  const mouthLine = P('', { fill: 'none', stroke: C.mouth, 'stroke-width': 7, 'stroke-linecap': 'round' }, mouthG);
  P('M-50 58 C-36 34 -8 38 0 50 C8 38 36 34 50 58 C34 66 12 62 0 60 C-12 62 -34 66 -50 58 Z', { fill: C.hair, stroke: I, 'stroke-width': 6, 'stroke-linejoin': 'round' }, face); // moustache
  // freckles, nose
  for (const sx of [-1, 1]) for (const [fx, fy] of [[54, 14], [66, 22], [48, 26], [70, 8]]) el('circle', { cx: sx * fx, cy: fy, r: 3.2, fill: C.freckle }, face);
  el('ellipse', { cx: 0, cy: 26, rx: 20, ry: 17, fill: C.skinDark }, face);
  P('M-14 34 Q0 46 14 34', { fill: 'none', stroke: I, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.45 }, face);
  // eyes, brows, glasses
  const eyeL = P('', { fill: C.eye }, face), eyeR = P('', { fill: C.eye }, face);
  const shineL = el('circle', { r: 3.5, fill: '#FFFFFF' }, face), shineR = el('circle', { r: 3.5, fill: '#FFFFFF' }, face);
  const glasses = el('g', {}, face);
  for (const sx of [-1, 1]) {
    el('circle', { cx: sx * 40, cy: -14, r: 34, fill: '#FFFFFF', opacity: 0.18 }, glasses);
    el('circle', { cx: sx * 40, cy: -14, r: 34, fill: 'none', stroke: C.glasses, 'stroke-width': 7 }, glasses);
    P(`M${sx * 74} -18 L${sx * 98} -10`, { stroke: C.glasses, 'stroke-width': 6, 'stroke-linecap': 'round' }, glasses);
  }
  P('M-8 -18 Q0 -26 8 -18', { fill: 'none', stroke: C.glasses, 'stroke-width': 6, 'stroke-linecap': 'round' }, glasses);
  const browL = P('', { fill: 'none', stroke: C.hairDark, 'stroke-width': 13, 'stroke-linecap': 'round' }, face);
  const browR = P('', { fill: 'none', stroke: C.hairDark, 'stroke-width': 13, 'stroke-linecap': 'round' }, face);
  // hair quiff on top
  P(HEAD, { fill: 'none', stroke: I, 'stroke-width': 8, pathLength: 100, 'stroke-dasharray': '55 45', 'stroke-dashoffset': -28 }, head);
  const HAIR = 'M-98 -14 C-112 -70 -104 -130 -64 -172 C-30 -208 40 -214 86 -184 C120 -160 122 -100 104 -16 C96 -48 84 -66 62 -74 C44 -60 22 -64 8 -76 C-12 -64 -40 -62 -60 -74 C-80 -62 -92 -40 -98 -14 Z';
  P(HAIR, { fill: C.hair, transform: 'translate(7,5)' }, head);
  P(HAIR, { fill: 'none', stroke: I, 'stroke-width': 8, 'stroke-linejoin': 'round' }, head);
  for (const d of ['M-62 -84 C-70 -130 -40 -178 10 -192', 'M-20 -84 C-26 -130 10 -176 60 -186', 'M28 -84 C30 -120 60 -150 92 -160', 'M-86 -60 C-96 -100 -84 -140 -56 -166']) P(d, { fill: 'none', stroke: C.hairDark, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.75 }, head);

  // arms (front), hands, watch, notebook
  const armL = tube(50, 34, C.cardigan), armR = tube(50, 34, C.cardigan);
  const mkHand = side => {
    const hg = el('g', {}, g), rot = el('g', {}, hg);
    const finger = (d, p) => { P(d, { fill: 'none', stroke: I, 'stroke-width': 17, 'stroke-linecap': 'round' }, p); P(d, { fill: 'none', stroke: C.skin, 'stroke-width': 8, 'stroke-linecap': 'round' }, p); };
    const open = el('g', {}, rot);
    for (const d of [`M${-side * 20} 10 L${-side * 34} 30`, 'M-12 22 L-14 52', 'M0 24 L0 58', 'M12 22 L14 54']) finger(d, open);
    el('circle', { cx: 0, cy: 16, r: 22, fill: C.skin, stroke: I, 'stroke-width': 6 }, open);
    const point = el('g', {}, rot);
    finger(`M${side * 6} 18 L${side * 8} 62`, point);
    P('M-20 2 Q-24 34 0 36 Q22 34 20 2 Z', { fill: C.skin, stroke: I, 'stroke-width': 6, 'stroke-linejoin': 'round' }, point);
    const fist = el('g', {}, rot);
    P('M-21 0 Q-25 34 0 36 Q23 34 21 0 Z', { fill: C.skin, stroke: I, 'stroke-width': 6, 'stroke-linejoin': 'round' }, fist);
    P('M-12 18 H12 M-12 27 H12', { stroke: I, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.6 }, fist);
    // cardigan cuff, and a watch on the left wrist
    el('rect', { x: -21, y: -10, width: 42, height: 12, rx: 5, fill: side < 0 ? C.watch : C.cardiganDark, stroke: I, 'stroke-width': 4 }, rot);
    if (side < 0) el('circle', { cx: 0, cy: -4, r: 7, fill: '#F7F2E6', stroke: I, 'stroke-width': 3 }, rot);
    return { hg, rot, types: [open, point, fist] };
  };
  const handL = mkHand(-1), handR = mkHand(1);
  const book = el('g', {}, g);
  el('rect', { x: -40, y: -56, width: 80, height: 100, rx: 6, fill: C.book, stroke: I, 'stroke-width': 6 }, book);
  el('rect', { x: -40, y: -56, width: 16, height: 100, fill: C.bookSpine, stroke: I, 'stroke-width': 4 }, book);
  P('M-14 -30 H26 M-14 -14 H26 M-14 2 H16', { stroke: '#FFF3E0', 'stroke-width': 5, 'stroke-linecap': 'round' }, book);

  let carry = { ...PBASE, ...(o.start ?? {}) };
  const KEEP = ['x', 'y', 's', 'alpha'];
  const ks = keys.map(([t, p, d]) => {
    const ov = typeof p === 'string' ? { pose: p } : p;
    let pose;
    if (ov.pose) { pose = { ...PBASE, ...PPOSE[ov.pose] }; for (const k of KEEP) pose[k] = carry[k]; } else pose = { ...carry };
    Object.assign(pose, ov); delete pose.pose; carry = pose;
    return [t, pose, d ?? 0.45];
  });
  const off = o.phase ?? 0;
  const api = { g };
  updaters.push(t => {
    let i = 0; while (i + 1 < ks.length && ks[i + 1][0] <= t) i++;
    let S = ks[i][1];
    if (t >= ks[0][0]) { const [t1, p1, d1] = ks[i], prev = i > 0 ? ks[i - 1][1] : p1; S = mixPapa(prev, p1, eIO(prog(t, t1, d1))); }
    if (S.alpha <= 0.001) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    const breath = Math.sin(t * 2 + off), ph = t * S.walkSpeed * 2 * Math.PI;
    let bob = -12 * S.walk * Math.abs(Math.sin(ph)) - S.laugh * 10 * Math.abs(Math.sin(t * 13));
    const sq = S.squash + 0.015 * breath + S.laugh * 0.03 * Math.sin(t * 26);
    const legLen = 270, hipY = -legLen + 30 + bob;
    const tilt = S.tilt + 1.5 * Math.sin(t * 1.3 + off) + S.walk * 3 * Math.sin(ph);
    body.setAttribute('transform', `translate(0,${hipY}) rotate(${tilt}) scale(${1 + sq},${1 - sq})`);
    const hTilt = S.headTilt + 2 * Math.sin(t * 1.1 + off) + S.laugh * 5 * Math.sin(t * 13);
    head.setAttribute('transform', `translate(0,${-284 - 112 + 18}) rotate(${hTilt})`);
    const lx = S.look * 12, ly = S.lookY * 8;
    face.setAttribute('transform', `translate(${lx * 0.6},${ly * 0.5})`);
    // eyes (blink every 3.6 s; closed happy arcs when eyes is low)
    const blink = ((t + off) % 3.6) < 0.12 ? 0.08 : 1, op = S.eyes * blink;
    for (const [e, sh, sx] of [[eyeL, shineL, -1], [eyeR, shineR, 1]]) {
      const cx = sx * 40 + lx * 0.8, cy = -12 + ly;
      if (op > 0.3) { const ry = 15 * op; e.setAttribute('d', `M${cx - 10} ${cy} A10 ${ry} 0 1 0 ${cx + 10} ${cy} A10 ${ry} 0 1 0 ${cx - 10} ${cy} Z`); e.setAttribute('fill', PAPA.eye); e.removeAttribute('stroke'); sh.setAttribute('cx', cx + 3); sh.setAttribute('cy', cy - ry * 0.45); sh.setAttribute('opacity', 1); }
      else { e.setAttribute('d', `M${cx - 15} ${cy + 4} Q${cx} ${cy - 14} ${cx + 15} ${cy + 4}`); e.setAttribute('fill', 'none'); e.setAttribute('stroke', PAPA.eye); e.setAttribute('stroke-width', 7); e.setAttribute('stroke-linecap', 'round'); sh.setAttribute('opacity', 0); }
    }
    const by = -62 - S.brow * 12, w = S.worry * 10;
    browL.setAttribute('d', `M${-66} ${by + 4 + w * 0.4} Q${-42} ${by - 10 - S.brow * 4} ${-18} ${by + (S.brow < 0 ? -S.brow * 12 : 0) - w}`);
    browR.setAttribute('d', `M${18} ${by + (S.brow < 0 ? -S.brow * 12 : 0) - w} Q${42} ${by - 10 - S.brow * 4} ${66} ${by + 4 + w * 0.4}`);
    // mouth on the beard
    const m = S.mouth, mo = S.mouthOpen, my = 78;
    if (mo > 0.05) {
      const top = my - 4 + (m > 0 ? 0 : 6), bot = my + 6 + 34 * mo, hw = 26 + 8 * Math.max(0, m);
      mouthOpenP.setAttribute('d', `M${-hw} ${top} Q0 ${top - 4 - 8 * m} ${hw} ${top} Q${hw * 0.6} ${bot} 0 ${bot} Q${-hw * 0.6} ${bot} ${-hw} ${top} Z`);
      teeth.setAttribute('d', `M${-hw + 6} ${top + 1} Q0 ${top - 2 - 7 * m} ${hw - 6} ${top + 1} L${hw - 10} ${top + 10} Q0 ${top + 7} ${-hw + 10} ${top + 10} Z`);
      tongue.setAttribute('cx', 0); tongue.setAttribute('cy', bot - 9);
      for (const n of [mouthOpenP, teeth, tongue]) n.setAttribute('opacity', clamp(mo * 3));
      mouthLine.setAttribute('opacity', 0);
    } else {
      for (const n of [mouthOpenP, teeth, tongue]) n.setAttribute('opacity', 0);
      mouthLine.setAttribute('opacity', 1);
      mouthLine.setAttribute('d', `M-26 ${my} Q0 ${my + m * 24} 26 ${my - (m < 0 ? 0 : 2)}`);
    }
    // legs
    const step = S.walk * 34 * Math.sin(ph);
    const feet = [[-56 + step, legL, shoeL, -1], [56 - step, legR, shoeR, 1]];
    for (const [fx, lg, sh, sx] of feet) {
      const lift = S.walk * 14 * Math.max(0, Math.sin(ph) * -sx);
      const d = `M${sx * 52} ${hipY - 10} Q${sx * 60} ${(hipY - 10) / 2} ${fx} ${-30 - lift}`;
      lg[0].setAttribute('d', d); lg[1].setAttribute('d', d);
      sh.setAttribute('transform', `translate(${fx + sx * 6},${-lift})`);
    }
    // arms
    const arm = (side, [ang, reach, bend], swing) => {
      const a = (ang + swing) * Math.PI / 180, L = 250;
      // shoulder follows the body tilt approximately
      const tr = tilt * Math.PI / 180, lsx = side * 112, lsy = -258;
      const sx = lsx * Math.cos(tr) - lsy * Math.sin(tr), sy = hipY + lsx * Math.sin(tr) + lsy * Math.cos(tr);
      const d = L * clamp(reach, 0.2, 1);
      const hx = sx + side * d * Math.sin(a), hy = sy + d * Math.cos(a);
      const mx = (sx + hx) / 2, my2 = (sy + hy) / 2;
      const nx = -(hy - sy) / d * -side, ny = (hx - sx) / d * -side;
      const hOff = bend * (Math.sqrt(Math.max(0, (L / 2) ** 2 - (d / 2) ** 2)) + 16);
      const ex = mx + nx * hOff, ey = my2 + ny * hOff, cx = 2 * ex - mx, cy = 2 * ey - my2;
      return { d: `M${sx} ${sy} Q${cx} ${cy} ${hx} ${hy}`, hx, hy, dir: Math.atan2(hy - cy, hx - cx) * 180 / Math.PI - 90 };
    };
    const sw = S.walk * 20 * Math.sin(ph) + 2.5 * Math.sin(t * 1.9 + off);
    const A = arm(-1, S.aL, sw), B = arm(1, S.aR, -sw);
    for (const p of armL) p.setAttribute('d', A.d);
    for (const p of armR) p.setAttribute('d', B.d);
    for (const [h, X, type] of [[handL, A, S.hL], [handR, B, S.hR]]) {
      h.hg.setAttribute('transform', `translate(${X.hx},${X.hy})`);
      h.rot.setAttribute('transform', `rotate(${X.dir})`);
      h.types.forEach((n, k) => n.setAttribute('display', Math.round(type) === k ? 'inline' : 'none'));
    }
    book.setAttribute('transform', `translate(${A.hx + 6},${A.hy - 10}) rotate(${-8 + tilt}) scale(${0.3 + 0.7 * S.book})`);
    book.setAttribute('opacity', S.book);
    shadow.setAttribute('rx', 150 + bob * 2);
    g.setAttribute('transform', `translate(${S.x},${S.y}) scale(${S.s})`);
    g.setAttribute('opacity', S.alpha);
    api.head = [S.x, S.y + (hipY - 400) * S.s];
  });
  return api;
}
