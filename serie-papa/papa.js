// Papa, flat design, faithful to the reference sheet (personnages/references/papa_planche.png):
// stocky build, small head with tall ginger quiff, full ginger beard, freckles, round turquoise glasses,
// mint polo with brush-stroke pattern and white collar, tattooed forearm, white belt with gold buckle,
// charcoal trousers rolled at the ankle, white sneakers with a turquoise / purple wave, watch and ring.
// Front view, ground at y = 0 in local space, about 760 px tall at s = 1.
const PC = {
  skin: '#F7C4A0', skinSh: '#EBA685', skinHi: '#FFD9BD', freckle: '#E39169', lip: '#C8574A',
  hair: '#EF6B26', hairSh: '#CC5019', hairHi: '#FF8C47', brow: '#D9561C',
  glasses: '#2FB7A5', eyeW: '#FFFFFF', iris: '#5F7586', pupil: '#1E2228', mouth: '#7A2420', tongue: '#E8786E', teeth: '#FFFFFF',
  polo: '#5ED0B3', poloSh: '#46B69A', poloHi: '#78DEC3', purple: '#6B3FB6', white: '#FFFFFF', brushOr: '#F37B2C',
  collar: '#F8F5EF', collarSh: '#DFD9CF', button: '#1F2026',
  belt: '#F4F0E8', beltSh: '#DAD4C8', buckle: '#C9A55A',
  pants: '#4C4F57', pantsSh: '#3C3E45', cuff: '#41444B',
  shoe: '#F8F8F6', shoeSh: '#E4E2DC', teal: '#4FC9AE', sole: '#EDE9E1',
  watch: '#6B4429', watchFace: '#F7F2E6', ring: '#26272B',
  tatOr: '#F08A3A', tatTeal: '#3AA894', tatInk: '#5A4A44',
};
const PB = { x: 960, y: 970, s: 1, tilt: 0, headTilt: 0, look: 0, lookY: 0,
  mouth: 0.6, mouthOpen: 0.3, oh: 0, eyes: 1, winkL: 0, brow: 0, worry: 0, frown: 0,
  aL: [38, 88], aR: [38, 88], hL: 3, hR: 3, wave: 0, laugh: 0, bounce: 0, alpha: 1, jump: 0 };
// arm: [shoulder angle outwards (deg, 0 = hanging), elbow bend (deg, + = forearm towards the body / up)]
// hands: 0 open palm, 1 pointing, 2 fist, 3 on the hip
const PP = {
  hips: {},
  stand: { aL: [8, 6], aR: [8, 6], hL: 0, hR: 0, mouth: 0.4, mouthOpen: 0 },
  wave: { aR: [100, -80], hR: 0, wave: 1, mouth: 1, mouthOpen: 0.55, brow: 0.6, headTilt: -5, look: 0.2 },
  think: { aR: [-12, 134], hR: 2, mouth: -0.1, mouthOpen: 0, brow: 0.2, worry: 0.7, look: -0.6, lookY: -0.7, headTilt: 6 },
  laugh: { aL: [26, 96], aR: [26, 96], hL: 0, hR: 0, mouth: 1, mouthOpen: 1, eyes: 0, brow: 0.8, laugh: 1, headTilt: -8 },
  surprise: { aL: [30, 40], aR: [30, 40], hL: 0, hR: 0, mouth: 0, mouthOpen: 0, oh: 1, brow: 1, eyes: 1.15 },
  wink: { aR: [30, 150], hR: 1, mouth: 0.8, mouthOpen: 0.2, winkL: 1, headTilt: -6 },
  angry: { aL: [20, 30], aR: [20, 30], hL: 2, hR: 2, mouth: -0.7, mouthOpen: 0, frown: 1, brow: -0.2 },
  worried: { aL: [10, 70], aR: [10, 70], hL: 0, hR: 0, mouth: -0.6, mouthOpen: 0.15, worry: 1, brow: 0.5, headTilt: 4 },
  shrug: { aL: [62, 70], aR: [62, 70], hL: 0, hR: 0, mouth: -0.3, mouthOpen: 0, brow: 1, worry: 0.4, headTilt: 7 },
};
function mixP(a, b, k) {
  const o = {};
  for (const key in PB) { const va = a[key] ?? PB[key], vb = b[key] ?? PB[key]; o[key] = Array.isArray(va) ? va.map((v, i) => v + (vb[i] - v) * k) : va + (vb - va) * k; }
  return o;
}

function makePapa(parent, keys, o = {}) {
  const C = PC, g = el('g', {}, parent);
  const P = (d, fill, p, extra = {}) => el('path', { d, fill, ...extra }, p);
  const E = (cx, cy, rx, ry, fill, p, extra = {}) => el('ellipse', { cx, cy, rx, ry, fill, ...extra }, p);
  const shadow = E(0, 2, 175, 20, '#000000', g, { opacity: 0.13 });

  // ---------- legs (each rotates around its hip) ----------
  const mkLeg = side => {
    const lg = el('g', {}, g), inner = el('g', {}, lg);
    // trousers: hip at local (0,0), cuff top at y = 228
    P('M-52 -6 H50 L46 228 H-44 Z', C.pants, inner);
    P('M22 -6 H50 L46 228 H18 Z', C.pantsSh, inner);
    P('M-8 60 Q-2 120 -4 200', 'none', inner, { stroke: C.pantsSh, 'stroke-width': 5, 'stroke-linecap': 'round' });
    // rolled cuff
    P('M-48 222 H50 Q53 242 50 258 H-48 Q-51 242 -48 222 Z', C.cuff, inner);
    P('M-48 238 H50', 'none', inner, { stroke: C.pantsSh, 'stroke-width': 4 });
    // sneaker (front view)
    const sh = el('g', { transform: 'translate(0,258)' }, inner);
    P('M-42 6 Q-44 -6 -30 -8 H30 Q44 -6 44 6 L50 58 Q50 72 36 72 H-36 Q-50 72 -50 58 Z', C.shoe, sh);
    P('M-50 44 Q-24 30 0 42 Q26 54 50 36 L50 50 Q26 66 0 56 Q-24 44 -50 58 Z', C.teal, sh);
    P('M-50 58 Q-24 46 0 57 Q26 68 50 50 L50 56 Q26 74 0 63 Q-24 52 -50 64 Z', C.purple, sh);
    P('M-50 62 H50 Q50 76 36 76 H-36 Q-50 76 -50 62 Z', C.sole, sh);
    P('M-20 -8 Q0 6 20 -8', 'none', sh, { stroke: C.shoeSh, 'stroke-width': 5, 'stroke-linecap': 'round' });
    return lg;
  };
  const legL = mkLeg(-1), legR = mkLeg(1);
  const legTop = -336; // hip joint height (feet bottom at 0)

  // ---------- upper body (bounces, tilts) ----------
  const body = el('g', {}, g);
  // hips / seat of the trousers
  P('M-104 -392 H104 Q110 -350 102 -312 H-102 Q-110 -350 -104 -392 Z', C.pants, body);
  P('M30 -392 H98 Q104 -350 96 -318 H40 Z', C.pantsSh, body);
  P('M0 -380 V-326', 'none', body, { stroke: C.pantsSh, 'stroke-width': 5, 'stroke-linecap': 'round' });
  // polo
  const POLO = 'M-96 -612 Q-130 -606 -136 -580 L-124 -470 Q-116 -426 -104 -396 H104 Q116 -426 124 -470 L136 -580 Q130 -606 96 -612 Z';
  P(POLO, C.polo, body);
  P('M70 -610 Q130 -606 136 -580 L124 -470 Q116 -426 104 -396 H78 Q100 -470 92 -560 Z', C.poloSh, body);
  P('M-110 -590 Q-90 -604 -60 -604 L-70 -560 Q-96 -560 -110 -540 Z', C.poloHi, body, { opacity: 0.6 });
  // brush-stroke pattern (purple / white / orange dabs)
  const dab = (x, y, r, col, s = 1) => P(`M${-14 * s} ${-5 * s} Q0 ${-12 * s} ${14 * s} ${-5 * s} Q18 ${2 * s} ${10 * s} ${6 * s} Q0 ${2 * s} ${-12 * s} ${6 * s} Q${-20 * s} ${2 * s} ${-14 * s} ${-5 * s} Z`, col, body, { transform: `translate(${x},${y}) rotate(${r})` });
  for (const [x, y, r, c, s] of [[-92, -520, -30, C.purple, 1.1], [-58, -470, 20, C.white, 1], [-100, -430, 40, C.purple, 0.9], [-30, -540, -50, C.white, 0.8],
    [70, -540, 30, C.purple, 1.1], [44, -458, -20, C.white, 1], [96, -470, 60, C.brushOr, 0.8], [-66, -560, 70, C.brushOr, 0.7], [34, -420, 10, C.purple, 0.9], [-36, -414, -10, C.purple, 0.8], [100, -600, 0, C.white, 0.7]]) dab(x, y, r, c, s);
  // placket, buttons, chest pocket
  P('M-10 -592 H10 V-500 H-10 Z', C.poloSh, body, { opacity: 0.55 });
  for (const by of [-578, -548, -518]) el('circle', { cx: 0, cy: by, r: 5.5, fill: C.button }, body);
  P('M40 -560 H86 V-516 Q63 -508 40 -516 Z', C.poloSh, body, { opacity: 0.5 });
  // belt
  P('M-104 -402 H104 V-378 H-104 Z', C.belt, body);
  P('M-104 -384 H104 V-378 H-104 Z', C.beltSh, body);
  el('rect', { x: -17, y: -405, width: 34, height: 30, rx: 4, fill: C.buckle }, body);
  el('rect', { x: -9, y: -397, width: 18, height: 14, rx: 2, fill: C.belt }, body);
  for (const bx of [-70, 70]) el('rect', { x: bx - 4, y: -406, width: 8, height: 32, rx: 2, fill: C.pantsSh }, body);
  // neck + collar
  P('M-34 -650 H34 V-598 Q0 -588 -34 -598 Z', C.skinSh, body);
  P('M-36 -612 Q-74 -616 -84 -596 Q-60 -566 -14 -566 Q-6 -590 -36 -612 Z', C.collar, body);
  P('M36 -612 Q74 -616 84 -596 Q60 -566 14 -566 Q6 -590 36 -612 Z', C.collar, body);
  P('M14 -566 Q60 -566 84 -596 Q70 -574 18 -572 Z', C.collarSh, body);

  // ---------- head ----------
  const head = el('g', {}, body);
  for (const sx of [-1, 1]) { E(sx * 60, 2, 14, 19, C.skin, head); E(sx * 61, 3, 6, 10, C.skinSh, head); }
  P('M-60 -6 C-60 -54 -34 -74 0 -74 C34 -74 60 -54 60 -6 C60 40 36 68 0 70 C-36 68 -60 40 -60 -6 Z', C.skin, head);
  const face = el('g', {}, head);
  // freckles, cheeks
  for (const sx of [-1, 1]) for (const [fx, fy] of [[30, 12], [38, 18], [26, 20], [42, 8], [34, 6]]) el('circle', { cx: sx * fx, cy: fy, r: 2, fill: C.freckle }, face);
  // beard
  const BEARD = 'M-63 -14 C-70 50 -48 112 0 118 C48 112 70 50 63 -14 C58 12 46 26 30 24 C18 40 -18 40 -30 24 C-46 26 -58 12 -63 -14 Z';
  P(BEARD, C.hair, face);
  P('M20 30 C40 24 58 8 63 -14 C70 50 48 112 0 118 C30 100 48 60 20 30 Z', C.hairSh, face);
  for (const d of ['M-44 40 Q-40 70 -26 92', 'M-20 70 Q-14 92 -6 106', 'M44 40 Q40 70 26 92', 'M18 72 Q14 92 8 104', 'M-54 10 Q-56 34 -48 52']) P(d, 'none', face, { stroke: C.hairSh, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  P('M-50 20 Q-46 40 -38 50', 'none', face, { stroke: C.hairHi, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  // mouth
  const mouthG = el('g', {}, face);
  const mOpen = P('', C.mouth, mouthG), mTongue = E(0, 0, 13, 7, C.tongue, mouthG), mTeeth = P('', C.teeth, mouthG);
  const mLine = P('', 'none', mouthG, { stroke: C.mouth, 'stroke-width': 5, 'stroke-linecap': 'round' });
  // moustache
  P('M-34 32 C-24 18 -6 20 0 28 C6 20 24 18 34 32 C24 38 8 36 0 34 C-8 36 -24 38 -34 32 Z', C.hair, face);
  P('M0 28 C6 20 24 18 34 32 C24 38 8 36 0 34 Z', C.hairSh, face, { opacity: 0.6 });
  // nose
  E(0, 12, 13, 11, C.skinSh, face); E(-4, 8, 5, 4, C.skinHi, face);
  // eyes
  const eyes = [-1, 1].map(sx => {
    const eg = el('g', {}, face);
    const white = E(0, 0, 11, 12, C.eyeW, eg), iris = el('circle', { r: 7, fill: C.iris }, eg), pupil = el('circle', { r: 3.8, fill: C.pupil }, eg), hi = el('circle', { r: 2.2, fill: '#FFFFFF' }, eg);
    const lid = P('', 'none', eg, { stroke: C.pupil, 'stroke-width': 4.5, 'stroke-linecap': 'round' });
    return { sx, eg, white, iris, pupil, hi, lid };
  });
  const browL = P('', 'none', face, { stroke: C.brow, 'stroke-width': 9, 'stroke-linecap': 'round' });
  const browR = P('', 'none', face, { stroke: C.brow, 'stroke-width': 9, 'stroke-linecap': 'round' });
  // glasses
  const gl = el('g', {}, face);
  for (const sx of [-1, 1]) {
    el('circle', { cx: sx * 25, cy: -8, r: 21, fill: '#FFFFFF', opacity: 0.12 }, gl);
    el('circle', { cx: sx * 25, cy: -8, r: 21, fill: 'none', stroke: C.glasses, 'stroke-width': 4.5 }, gl);
    P(`M${sx * 46} -10 L${sx * 60} -6`, 'none', gl, { stroke: C.glasses, 'stroke-width': 4, 'stroke-linecap': 'round' });
  }
  P('M-5 -10 Q0 -15 5 -10', 'none', gl, { stroke: C.glasses, 'stroke-width': 4, 'stroke-linecap': 'round' });
  // hair: short sides + tall swept-back quiff
  for (const sx of [-1, 1]) P(`M${sx * 60} -8 C${sx * 64} -30 ${sx * 62} -46 ${sx * 54} -56 L${sx * 46} -38 C${sx * 52} -30 ${sx * 56} -20 ${sx * 60} -8 Z`, C.hairSh, head);
  const QUIFF = 'M-60 -26 C-80 -66 -76 -124 -36 -144 C4 -164 64 -156 78 -114 C88 -84 76 -54 62 -26 C56 -50 44 -62 26 -64 C10 -56 -10 -58 -24 -62 C-40 -60 -54 -48 -60 -26 Z';
  P(QUIFF, C.hair, head);
  P('M34 -150 C62 -144 84 -114 76 -76 C72 -58 68 -42 62 -26 C56 -50 44 -62 26 -64 C48 -90 52 -128 34 -150 Z', C.hairSh, head);
  for (const d of ['M-40 -66 C-48 -96 -36 -128 -8 -142', 'M-12 -62 C-16 -96 0 -126 30 -140', 'M14 -62 C18 -92 34 -116 56 -122']) P(d, 'none', head, { stroke: C.hairSh, 'stroke-width': 4, 'stroke-linecap': 'round' });
  P('M-46 -80 C-50 -104 -38 -126 -18 -134', 'none', head, { stroke: C.hairHi, 'stroke-width': 6, 'stroke-linecap': 'round' });

  // ---------- arms (shoulder -> elbow -> hand) ----------
  const L1 = 122, L2 = 118;
  const mkArm = side => {
    const up = el('g', {}, g), fo = el('g', {}, g), hand = el('g', {}, g);
    // upper arm, pointing down local +y
    P(`M-28 -6 Q-30 ${L1 / 2} -24 ${L1} H24 Q30 ${L1 / 2} 28 -6 Z`, C.skin, up);
    P(`M${side * 10} 0 Q${side * 28} ${L1 / 2} ${side * 22} ${L1} H${side * 6} Z`, C.skinSh, up, { opacity: 0.6 });
    // short sleeve + white cuff
    P('M-36 -24 Q-38 30 -34 54 H34 Q38 30 36 -24 Z', C.polo, up);
    P(`M${side * 8} -24 Q${side * 38} 20 ${side * 34} 54 H${side * 14} Z`, C.poloSh, up);
    for (const [x, y, r, c] of [[-14, 10, 30, C.purple], [12, 30, -20, C.white]]) P('M-10 -4 Q0 -9 10 -4 Q13 2 7 4 Q0 1 -9 4 Q-14 2 -10 -4 Z', c, up, { transform: `translate(${x},${y}) rotate(${r})` });
    P('M-35 44 H35 Q36 52 34 60 H-34 Q-36 52 -35 44 Z', C.collar, up);
    // forearm
    P(`M-24 -4 Q-26 ${L2 / 2} -20 ${L2} H20 Q26 ${L2 / 2} 24 -4 Z`, C.skin, fo);
    P(`M${side * 8} 0 Q${side * 26} ${L2 / 2} ${side * 18} ${L2} H${side * 4} Z`, C.skinSh, fo, { opacity: 0.55 });
    el('circle', { cx: 0, cy: 0, r: 25, fill: C.skin }, fo); // elbow
    if (side < 0) { // tattoo sleeve on Papa's right arm (viewer's left), as on the sheet
      const tat = (x, y, s, kind) => {
        const tg = el('g', { transform: `translate(${x},${y}) scale(${s})` }, kind === 'up' ? up : fo);
        if (kind === 'up' || kind === 'flower') { for (let k = 0; k < 6; k++) E(0, -8, 5, 9, C.tatOr, tg, { transform: `rotate(${k * 60})` }); el('circle', { r: 4, fill: C.tatInk }, tg); }
        else if (kind === 'bird') { P('M-12 2 Q-4 -10 6 -4 L16 -10 L12 0 Q4 10 -12 2 Z', C.tatTeal, tg); el('circle', { cx: 4, cy: -3, r: 1.6, fill: C.tatInk }, tg); }
        else { P('M0 -12 V10 M-7 -6 H7 M-9 6 Q0 16 9 6', 'none', tg, { stroke: C.tatInk, 'stroke-width': 3, 'stroke-linecap': 'round' }); }
      };
      tat(-2, 86, 1, 'up'); tat(4, 34, 1.1, 'flower'); tat(-4, 70, 1, 'bird'); tat(6, 98, 0.9, 'anchor');
      P('M-14 50 Q-4 44 4 52 M8 22 Q14 16 18 22', 'none', fo, { stroke: C.tatTeal, 'stroke-width': 3, 'stroke-linecap': 'round' });
    } else { // watch on the left wrist
      el('rect', { x: -22, y: L2 - 22, width: 44, height: 14, rx: 4, fill: C.watch }, fo);
      el('circle', { cx: 0, cy: L2 - 15, r: 9, fill: C.watchFace, stroke: C.watch, 'stroke-width': 3 }, fo);
    }
    // hands (drawn pointing down local +y from the wrist)
    const h = el('g', {}, hand), types = [];
    const palm = (pg) => { P('M-23 0 Q-26 30 -16 44 Q0 52 16 44 Q26 30 23 0 Z', C.skin, pg); };
    let t0 = el('g', {}, h); // open palm, fingers spread
    for (const [x, a] of [[-14, 8], [-4, 2], [6, -3], [15, -9]]) el('rect', { x: x - 5.5, y: 30, width: 11, height: 34, rx: 5.5, fill: C.skin, transform: `rotate(${a} ${x} 30)` }, t0);
    palm(t0); E(side * -22, 18, 8, 15, C.skin, t0, { transform: `rotate(${side * 30} ${side * -22} 18)` });
    P('M-12 34 V44 M0 36 V48 M12 34 V44', 'none', t0, { stroke: C.skinSh, 'stroke-width': 3, 'stroke-linecap': 'round' });
    types.push(t0);
    t0 = el('g', {}, h); // pointing
    palm(t0); el('rect', { x: side * 8 - 6, y: 36, width: 12, height: 40, rx: 6, fill: C.skin }, t0);
    P('M-14 40 Q0 46 6 40', 'none', t0, { stroke: C.skinSh, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
    types.push(t0);
    t0 = el('g', {}, h); // fist
    P('M-24 0 Q-28 34 -14 44 H14 Q28 34 24 0 Z', C.skin, t0);
    P('M-16 26 H16 M-16 36 H14', 'none', t0, { stroke: C.skinSh, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
    types.push(t0);
    t0 = el('g', {}, h); // on the hip (fist seen from the side, ring on the left hand)
    P('M-22 0 Q-30 28 -10 42 Q14 46 24 30 Q28 10 22 0 Z', C.skin, t0);
    P('M-12 22 Q4 30 18 24', 'none', t0, { stroke: C.skinSh, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
    if (side > 0) el('rect', { x: -8, y: 28, width: 16, height: 6, rx: 3, fill: C.ring }, t0);
    types.push(t0);
    return { up, fo, hand, h, types, side };
  };
  const armL = mkArm(-1), armR = mkArm(1);

  // ---------- timeline ----------
  let carry = { ...PB, ...(o.start ?? {}) };
  const KEEP = ['x', 'y', 's', 'alpha'];
  const ks = keys.map(([t, p, d]) => {
    const ov = typeof p === 'string' ? { pose: p } : p;
    let pose;
    if (ov.pose) { pose = { ...PB, ...PP[ov.pose] }; for (const k of KEEP) pose[k] = carry[k]; } else pose = { ...carry };
    Object.assign(pose, ov); delete pose.pose; carry = pose;
    return [t, pose, d ?? 0.4];
  });
  const off = o.phase ?? 0, api = { g };
  updaters.push(t => {
    let i = 0; while (i + 1 < ks.length && ks[i + 1][0] <= t) i++;
    let S = ks[i][1];
    if (t >= ks[0][0]) { const [t1, p1, d1] = ks[i], prev = i > 0 ? ks[i - 1][1] : p1; S = mixP(prev, p1, eIO(prog(t, t1, d1))); }
    if (S.alpha <= 0.001) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    const breath = Math.sin(t * 2.2 + off);
    const lb = S.laugh * Math.abs(Math.sin(t * 12));
    const bob = -6 * lb - 3 * breath * 0 - S.bounce * 18 * Math.abs(Math.sin(t * 6));
    const sq = 0.012 * breath + 0.025 * lb;
    const tilt = S.tilt + 1.2 * Math.sin(t * 1.3 + off);
    // body pivots around the hips
    body.setAttribute('transform', `translate(0,${bob}) rotate(${tilt} 0 ${legTop}) translate(0,${legTop}) scale(${1 + sq * 0.6},${1 - sq}) translate(0,${-legTop})`);
    const hT = S.headTilt + 1.5 * Math.sin(t * 1.1 + off) + S.laugh * 4 * Math.sin(t * 12);
    head.setAttribute('transform', `translate(0,-682) rotate(${hT} 0 60) scale(1.12)`);
    // legs
    legL.setAttribute('transform', `translate(-52,${legTop}) rotate(${2.5})`);
    legR.setAttribute('transform', `translate(52,${legTop}) rotate(${-2.5})`);
    // face
    const lx = S.look * 7, ly = S.lookY * 5;
    face.setAttribute('transform', `translate(${lx * 0.5},${ly * 0.4})`);
    const blink = ((t + off) % 3.4) < 0.11 ? 0.06 : 1;
    for (const e of eyes) {
      const open = S.eyes * blink * (e.sx < 0 ? 1 - S.winkL : 1);
      e.eg.setAttribute('transform', `translate(${e.sx * 25},-8)`);
      if (open > 0.35) {
        const sy = Math.min(open, 1.2);
        e.white.setAttribute('ry', 12 * sy); e.white.setAttribute('rx', 11 * (open > 1 ? 1.08 : 1));
        for (const n of [e.white, e.iris, e.pupil, e.hi]) n.setAttribute('display', 'inline');
        e.iris.setAttribute('cx', lx); e.iris.setAttribute('cy', ly); e.pupil.setAttribute('cx', lx); e.pupil.setAttribute('cy', ly);
        e.hi.setAttribute('cx', lx + 2.5); e.hi.setAttribute('cy', ly - 3);
        e.lid.setAttribute('d', `M-11 ${-12 * sy + 2} Q0 ${-12 * sy - 3} 11 ${-12 * sy + 2}`);
        e.lid.setAttribute('opacity', 0.0);
      } else {
        for (const n of [e.white, e.iris, e.pupil, e.hi]) n.setAttribute('display', 'none');
        e.lid.setAttribute('opacity', 1);
        e.lid.setAttribute('d', S.eyes < 0.35 ? 'M-11 3 Q0 -9 11 3' : 'M-11 0 Q0 6 11 0');
      }
    }
    const by = -38 - S.brow * 7;
    const inner = S.worry * 6 - S.frown * 8;
    browL.setAttribute('d', `M-44 ${by + 2 + S.frown * -2} Q-30 ${by - 6} -12 ${by - inner + 2}`);
    browR.setAttribute('d', `M12 ${by - inner + 2} Q30 ${by - 6} 44 ${by + 2 + S.frown * -2}`);
    // mouth
    const m = S.mouth, mo = S.mouthOpen, my = 46;
    if (S.oh > 0.3) {
      mOpen.setAttribute('d', `M-9 ${my - 2} Q-10 ${my + 16} 0 ${my + 17} Q10 ${my + 16} 9 ${my - 2} Q0 ${my - 8} -9 ${my - 2} Z`);
      for (const n of [mOpen]) n.setAttribute('opacity', 1); mTeeth.setAttribute('opacity', 0); mTongue.setAttribute('opacity', 0); mLine.setAttribute('opacity', 0);
    } else if (mo > 0.08) {
      const hw = 20 + 6 * Math.max(0, m), top = my - 2 - Math.max(0, m) * 3, bot = my + 4 + 26 * mo + Math.min(0, m) * -4;
      mOpen.setAttribute('d', `M${-hw} ${top} Q0 ${top + (m < 0 ? 6 : -2)} ${hw} ${top} Q${hw * 0.7} ${bot} 0 ${bot} Q${-hw * 0.7} ${bot} ${-hw} ${top} Z`);
      mTeeth.setAttribute('d', `M${-hw + 4} ${top + 1} Q0 ${top - 1} ${hw - 4} ${top + 1} L${hw - 7} ${top + 8} Q0 ${top + 6} ${-hw + 7} ${top + 8} Z`);
      mTongue.setAttribute('cy', bot - 6); mTongue.setAttribute('rx', 10 + 4 * mo);
      for (const n of [mOpen, mTeeth, mTongue]) n.setAttribute('opacity', clamp(mo * 4)); mLine.setAttribute('opacity', 0);
    } else {
      for (const n of [mOpen, mTeeth, mTongue]) n.setAttribute('opacity', 0); mLine.setAttribute('opacity', 1);
      mLine.setAttribute('d', `M-18 ${my} Q0 ${my + m * 16} 18 ${my}`);
    }
    // arms
    const tr = tilt * Math.PI / 180;
    for (const A of [armL, armR]) {
      const side = A.side, [out, bend0] = side < 0 ? S.aL : S.aR;
      const bend = bend0 + (side > 0 ? S.wave * 16 * Math.sin(t * 11) : 0);
      // shoulder position follows the body (rotation around the hip point)
      const lsx = side * 112, lsy = -590 - legTop;
      const sx = lsx * Math.cos(tr) - lsy * Math.sin(tr), sy = legTop + bob + lsx * Math.sin(tr) + lsy * Math.cos(tr);
      const a1 = -side * out + tilt + 2 * Math.sin(t * 1.9 + off + side), a2 = a1 + side * bend;
      const r1 = a1 * Math.PI / 180, r2 = a2 * Math.PI / 180;
      const ex = sx - Math.sin(r1) * L1, ey = sy + Math.cos(r1) * L1;
      const hx = ex - Math.sin(r2) * L2, hy = ey + Math.cos(r2) * L2;
      A.up.setAttribute('transform', `translate(${sx},${sy}) rotate(${a1})`);
      A.fo.setAttribute('transform', `translate(${ex},${ey}) rotate(${a2})`);
      const type = Math.round(side < 0 ? S.hL : S.hR);
      const handRot = type === 3 ? a2 - side * 30 : a2;
      A.hand.setAttribute('transform', `translate(${hx},${hy}) rotate(${handRot})`);
      A.types.forEach((n, k) => n.setAttribute('display', k === type ? 'inline' : 'none'));
    }
    shadow.setAttribute('rx', 175 - S.bounce * 20 * Math.abs(Math.sin(t * 6)));
    g.setAttribute('transform', `translate(${S.x},${S.y - S.jump}) scale(${S.s})`);
    g.setAttribute('opacity', S.alpha);
    api.head = [S.x, S.y + (-682 + legTop * 0) * S.s];
  });
  return api;
}
