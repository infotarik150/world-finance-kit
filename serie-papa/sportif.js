// Le Sportif, flat design, faithful to the two reference sheets
// (personnages/references/sportif_planche_habille.png and sportif_planche_torse_nu.png):
// very broad shoulders, big arms, short legs, round friendly face, big brown eyes, thick brows,
// short dark-brown hair brushed up. Outfit 0 (dressed): fitted grey T-shirt, blue jeans, brown/beige check
// shirt tied round the waist, grey sneakers. Outfit 1 (shirtless): muscular torso, dark-grey joggers with
// white stripes and drawstring, light beige sneakers. Black watch in both.
// Front view, ground at y = 0, about 790 px tall at s = 1. Needs core.js.
const SC = {
  skin: '#EDA77F', skinSh: '#D88B64', skinHi: '#F8C3A0', nose: '#E79470', mouth: '#7A2B22', tongue: '#E07B6C', teeth: '#FFFFFF',
  hair: '#3A2418', hairSh: '#26170F', hairHi: '#5A3A28', brow: '#2A1A12',
  eyeW: '#FFFFFF', iris: '#6E3F1E', pupil: '#1E1410',
  tee: '#8F8F93', teeSh: '#76767B', teeHi: '#A3A3A7',
  jeans: '#5F80A8', jeansSh: '#4B6A90', jeansHi: '#7493BA', stitch: '#C99A4E',
  check: '#D7BC92', checkDark: '#2C2622',
  shoe: '#A19D97', shoeSh: '#8A8680', lace: '#F2F0EB', sole: '#ECE9E3',
  jog: '#46474D', jogSh: '#38393E', stripe: '#F2F0EA',
  shoe2: '#E8E3DA', shoe2Sh: '#D3CDC2',
  watch: '#1F1F23', watchFace: '#2E2E33',
};
const SB = { x: 960, y: 980, s: 1, tilt: 0, headTilt: 0, look: 0, lookY: 0,
  mouth: 0.7, mouthOpen: 0, oh: 0, eyes: 1, winkL: 0, brow: 0, worry: 0, frown: 0,
  aL: [12, 100], aR: [12, 108], hL: 2, hR: 2, cross: 1, wave: 0, laugh: 0, alpha: 1, jump: 0, torse: 0 };
// arm: [shoulder angle outwards (deg), elbow bend (deg, + = forearm towards the body / up)]
// hands: 0 open, 1 pointing, 2 fist, 3 on the hip, 4 hidden (in the pocket)
const SPO = {
  cross: {},
  pockets: { aL: [10, 40], aR: [10, 40], hL: 4, hR: 4, cross: 0, mouth: 0.75 },
  stand: { aL: [10, 6], aR: [10, 6], hL: 0, hR: 0, cross: 0, mouth: 0.5 },
  wave: { aL: [10, 6], hL: 0, aR: [100, -82], hR: 0, cross: 0, wave: 1, mouth: 1, mouthOpen: 0.6, brow: 0.6, headTilt: -5 },
  flex: { aL: [92, -100], aR: [92, -100], hL: 2, hR: 2, cross: 0, mouth: 1, mouthOpen: 0.45, brow: -0.2, headTilt: 0 },
  think: { aL: [12, 100], hL: 2, aR: [-10, 136], hR: 2, cross: 0, mouth: -0.1, worry: 0.6, look: -0.6, lookY: -0.7, headTilt: 6 },
  laugh: { aL: [26, 96], aR: [26, 96], hL: 0, hR: 0, cross: 0, mouth: 1, mouthOpen: 1, eyes: 0, brow: 0.8, laugh: 1, headTilt: -8 },
  surprise: { aL: [30, 40], aR: [30, 40], hL: 0, hR: 0, cross: 0, mouth: 0, oh: 1, brow: 1, eyes: 1.15 },
  wink: { aL: [10, 40], hL: 4, aR: [30, 150], hR: 1, cross: 0, mouth: 0.85, mouthOpen: 0, winkL: 1, headTilt: -6 },
  angry: { frown: 1, mouth: -0.6, brow: -0.2 },
  worried: { aL: [10, 70], aR: [10, 70], hL: 0, hR: 0, cross: 0, mouth: -0.6, mouthOpen: 0.15, worry: 1, brow: 0.5, headTilt: 4 },
  calm: { mouth: 0.6, eyes: 0, brow: 0.3, headTilt: 5 },
};
function mixS(a, b, k) {
  const o = {};
  for (const key in SB) { const va = a[key] ?? SB[key], vb = b[key] ?? SB[key]; o[key] = Array.isArray(va) ? va.map((v, i) => v + (vb[i] - v) * k) : va + (vb - va) * k; }
  return o;
}
(function checkPattern() {
  const svg = document.getElementById('s'), defs = el('defs', {}, svg), p = el('pattern', { id: 'sportifCheck', width: 26, height: 26, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-6)' }, defs);
  el('rect', { width: 26, height: 26, fill: SC.check }, p);
  el('rect', { width: 13, height: 26, fill: SC.checkDark, opacity: 0.55 }, p);
  el('rect', { width: 26, height: 13, fill: SC.checkDark, opacity: 0.55 }, p);
})();

function makeSportif(parent, keys, o = {}) {
  const C = SC, g = el('g', {}, parent);
  const P = (d, fill, p, extra = {}) => el('path', { d, fill, ...extra }, p);
  const E = (cx, cy, rx, ry, fill, p, extra = {}) => el('ellipse', { cx, cy, rx, ry, fill, ...extra }, p);
  const shadow = E(0, 2, 190, 22, '#000000', g, { opacity: 0.13 });
  const outfit = [[], []]; // parts per outfit, toggled with S.torse
  const dressed = p => (outfit[0].push(p), p), bare = p => (outfit[1].push(p), p);

  // ---------- legs ----------
  const mkLeg = side => {
    const lg = el('g', {}, g);
    const jn = dressed(el('g', {}, lg)); // jeans + grey sneakers
    P('M-56 -6 H54 L48 214 H-48 Z', C.jeans, jn);
    P('M22 -6 H54 L48 214 H18 Z', C.jeansSh, jn);
    P('M-30 40 Q-26 120 -30 200', 'none', jn, { stroke: C.jeansHi, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.6 });
    P('M-52 206 H52 Q55 226 52 244 H-52 Q-55 226 -52 206 Z', C.jeansHi, jn);
    P('M-52 222 H52', 'none', jn, { stroke: C.jeansSh, 'stroke-width': 3 });
    const sh = el('g', { transform: 'translate(0,244)' }, jn);
    P('M-46 4 Q-48 -8 -32 -10 H32 Q48 -8 48 4 L54 56 Q54 66 40 66 H-40 Q-54 66 -54 56 Z', C.shoe, sh);
    P('M20 -10 H32 Q48 -8 48 4 L54 56 Q54 66 40 66 H24 Z', C.shoeSh, sh);
    for (const y of [4, 16, 28]) P(`M-16 ${y} H16`, 'none', sh, { stroke: C.lace, 'stroke-width': 5, 'stroke-linecap': 'round' });
    P('M-54 54 H54 Q54 76 40 76 H-40 Q-54 76 -54 54 Z', C.sole, sh);
    const jg = bare(el('g', {}, lg)); // joggers + beige sneakers
    P('M-58 -6 H56 L50 196 Q48 214 40 220 H-42 Q-50 214 -52 196 Z', C.jog, jg);
    P('M24 -6 H56 L50 196 Q48 214 40 220 H20 Z', C.jogSh, jg);
    P(`M${side * 50} -4 L${side * 46} 200 M${side * 40} -4 L${side * 37} 200`, 'none', jg, { stroke: C.stripe, 'stroke-width': 5 });
    P('M-46 196 H46 Q50 218 44 238 H-44 Q-50 218 -46 196 Z', C.jogSh, jg);
    for (const x of [-30, -15, 0, 15, 30]) P(`M${x} 202 V234`, 'none', jg, { stroke: C.jog, 'stroke-width': 3 });
    const s2 = el('g', { transform: 'translate(0,244)' }, jg);
    P('M-48 2 Q-50 -10 -32 -12 H32 Q50 -10 50 2 L56 54 Q56 66 42 66 H-42 Q-56 66 -56 54 Z', C.shoe2, s2);
    P('M-56 40 Q0 30 56 40 L56 50 Q0 40 -56 50 Z', C.shoe2Sh, s2);
    for (const y of [2, 14]) P(`M-14 ${y} H14`, 'none', s2, { stroke: '#FFFFFF', 'stroke-width': 5, 'stroke-linecap': 'round' });
    P('M-56 54 H56 Q56 76 42 76 H-42 Q-56 76 -56 54 Z', '#F7F5F1', s2);
    return lg;
  };
  const legL = mkLeg(-1), legR = mkLeg(1);
  const legTop = -320;

  // ---------- upper body ----------
  const body = el('g', {}, g);
  const TORSO = 'M-122 -616 Q-162 -612 -170 -578 L-146 -470 Q-128 -404 -116 -372 H116 Q128 -404 146 -470 L170 -578 Q162 -612 122 -616 Z';
  // dressed: jeans seat, T-shirt, check shirt tied at the waist
  const dB = dressed(el('g', {}, body));
  P('M-112 -380 H112 Q118 -340 108 -300 H-108 Q-118 -340 -112 -380 Z', C.jeans, dB);
  P('M0 -372 V-304', 'none', dB, { stroke: C.jeansSh, 'stroke-width': 5 });
  P(TORSO, C.tee, dB);
  P('M84 -614 Q160 -612 170 -578 L146 -470 Q128 -404 116 -372 H92 Q118 -470 110 -560 Z', C.teeSh, dB);
  P('M-60 -506 Q-30 -490 0 -500 Q30 -490 60 -506', 'none', dB, { stroke: C.teeSh, 'stroke-width': 5, 'stroke-linecap': 'round' }); // pecs fold
  P('M-46 -618 Q0 -584 46 -618', 'none', dB, { stroke: C.teeSh, 'stroke-width': 9, 'stroke-linecap': 'round' }); // crew neck
  // check shirt: back panel showing at the sides, waist band, knot, hanging sleeves
  P('M-124 -392 Q-150 -300 -136 -236 L-96 -262 L-80 -350 Z', 'url(#sportifCheck)', dB);
  P('M124 -392 Q150 -300 136 -236 L96 -262 L80 -350 Z', 'url(#sportifCheck)', dB);
  P('M-126 -400 Q0 -384 126 -400 L122 -360 Q0 -346 -122 -360 Z', 'url(#sportifCheck)', dB);
  P('M-30 -394 L-58 -258 L-34 -250 L-6 -360 Z', 'url(#sportifCheck)', dB);
  P('M30 -394 L58 -262 L34 -254 L6 -360 Z', 'url(#sportifCheck)', dB);
  P('M-58 -258 L-34 -250 L-36 -238 L-60 -246 Z M58 -262 L34 -254 L36 -242 L60 -250 Z', C.checkDark, dB, { opacity: 0.5 });
  E(0, -378, 26, 20, 'url(#sportifCheck)', dB);
  P('M-26 -378 Q0 -362 26 -378', 'none', dB, { stroke: C.checkDark, 'stroke-width': 4, opacity: 0.5 });
  P('M-126 -400 Q0 -384 126 -400 L122 -360 Q0 -346 -122 -360 Z', C.checkDark, dB, { opacity: 0.12 });
  // shirtless: muscular torso, joggers waistband and drawstring
  const bB = bare(el('g', {}, body));
  P('M-114 -380 H114 Q120 -340 110 -300 H-110 Q-120 -340 -114 -380 Z', C.jog, bB);
  P(TORSO, C.skin, bB);
  P('M84 -614 Q160 -612 170 -578 L146 -470 Q128 -404 116 -372 H96 Q122 -470 112 -560 Z', C.skinSh, bB, { opacity: 0.7 });
  P('M-6 -590 Q-60 -600 -112 -572 Q-122 -530 -98 -500 Q-50 -486 -6 -500 Z', C.skinHi, bB, { opacity: 0.35 });
  P('M-112 -508 Q-56 -480 -6 -500 M112 -508 Q56 -480 6 -500', 'none', bB, { stroke: C.skinSh, 'stroke-width': 7, 'stroke-linecap': 'round' }); // pecs
  P('M0 -592 V-388', 'none', bB, { stroke: C.skinSh, 'stroke-width': 5, 'stroke-linecap': 'round' });
  for (const [y, w] of [[-478, 40], [-444, 38], [-410, 34]]) for (const sx of [-1, 1]) el('rect', { x: sx < 0 ? -6 - w : 6, y, width: w, height: 28, rx: 12, fill: C.skinSh, opacity: 0.38 }, bB); // abs
  for (const sx of [-1, 1]) { el('circle', { cx: sx * 58, cy: -520, r: 5.5, fill: C.nose }, bB); P(`M${sx * 112} -470 Q${sx * 100} -430 ${sx * 86} -392`, 'none', bB, { stroke: C.skinSh, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.6 }); }
  P('M0 -396 Q-3 -392 0 -388', 'none', bB, { stroke: C.skinSh, 'stroke-width': 5, 'stroke-linecap': 'round' });
  P('M-118 -386 H118 V-354 H-118 Z', C.jogSh, bB);
  P('M-4 -366 Q-20 -338 -16 -312 M4 -366 Q20 -338 18 -310', 'none', bB, { stroke: C.stripe, 'stroke-width': 5, 'stroke-linecap': 'round' });
  E(0, -366, 9, 6, C.stripe, bB);
  for (const sx of [-1, 1]) P(`M${sx * 70} -350 Q${sx * 84} -320 ${sx * 100} -312`, 'none', bB, { stroke: C.jogSh, 'stroke-width': 5, 'stroke-linecap': 'round' }); // pockets
  // thick neck
  P('M-48 -664 H48 V-606 Q0 -592 -48 -606 Z', C.skinSh, body);
  // ---------- head ----------
  const head = el('g', {}, body);
  for (const sx of [-1, 1]) { E(sx * 72, 0, 19, 25, C.skin, head); E(sx * 74, 1, 8, 13, C.skinSh, head); }
  P('M-74 -14 C-74 -66 -40 -88 0 -88 C40 -88 74 -66 74 -14 C82 40 58 84 0 86 C-58 84 -82 40 -74 -14 Z', C.skin, head);
  P('M30 -84 C60 -72 74 -44 72 -12 C74 40 54 80 0 84 C40 70 58 30 54 -10 C52 -40 46 -66 30 -84 Z', C.skinSh, head, { opacity: 0.45 });
  P('M-30 70 Q0 82 30 70', 'none', head, { stroke: C.skinSh, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.6 }); // chin
  const face = el('g', {}, head);
  const eyes = [-1, 1].map(sx => {
    const eg = el('g', {}, face);
    const white = E(0, 0, 15, 17, C.eyeW, eg), iris = el('circle', { r: 11, fill: C.iris }, eg), pupil = el('circle', { r: 6, fill: C.pupil }, eg), hi = el('circle', { r: 3.2, fill: '#FFFFFF' }, eg);
    const lid = P('', 'none', eg, { stroke: C.pupil, 'stroke-width': 5, 'stroke-linecap': 'round' });
    return { sx, eg, white, iris, pupil, hi, lid };
  });
  const browL = P('', 'none', face, { stroke: C.brow, 'stroke-width': 13, 'stroke-linecap': 'round' });
  const browR = P('', 'none', face, { stroke: C.brow, 'stroke-width': 13, 'stroke-linecap': 'round' });
  E(0, 22, 17, 15, C.nose, face); E(-5, 17, 6, 5, C.skinHi, face);
  const mouthG = el('g', {}, face);
  const mOpen = P('', C.mouth, mouthG), mTongue = E(0, 0, 13, 7, C.tongue, mouthG), mTeeth = P('', C.teeth, mouthG);
  const mLine = P('', 'none', mouthG, { stroke: C.mouth, 'stroke-width': 5, 'stroke-linecap': 'round' });
  for (const sx of [-1, 1]) E(sx * 44, 30, 12, 8, C.nose, face, { opacity: 0.25 }); // cheeks
  // hair: short sides, volume brushed up on top
  for (const sx of [-1, 1]) P(`M${sx * 72} -6 C${sx * 76} -36 ${sx * 72} -56 ${sx * 62} -68 L${sx * 54} -50 C${sx * 62} -36 ${sx * 66} -22 ${sx * 72} -6 Z`, C.hair, head);
  const HAIR = 'M-72 -26 C-84 -70 -70 -108 -40 -120 C-28 -136 4 -142 22 -130 C46 -136 72 -118 76 -88 C82 -66 78 -46 72 -26 C68 -50 60 -66 46 -74 C34 -82 18 -78 6 -84 C-8 -78 -26 -84 -40 -78 C-56 -70 -66 -50 -72 -26 Z';
  P(HAIR, C.hair, head);
  P('M22 -130 C46 -136 72 -118 76 -88 C82 -66 78 -46 72 -26 C68 -50 60 -66 46 -74 C56 -94 48 -118 22 -130 Z', C.hairSh, head);
  for (const d of ['M-50 -78 C-58 -98 -44 -114 -22 -122', 'M-20 -82 C-22 -102 -6 -118 18 -126', 'M14 -82 C20 -100 38 -112 58 -110']) P(d, 'none', head, { stroke: C.hairSh, 'stroke-width': 5, 'stroke-linecap': 'round' });
  P('M-48 -82 C-50 -100 -40 -112 -26 -116', 'none', head, { stroke: C.hairHi, 'stroke-width': 6, 'stroke-linecap': 'round' });

  // ---------- arms ----------
  const L1 = 128, L2 = 120;
  const mkArm = side => {
    const up = el('g', {}, g), fo = el('g', {}, g), hand = el('g', {}, g);
    // upper arm with a big biceps
    P(`M-48 -10 Q-62 ${L1 * 0.45} -38 ${L1} H38 Q62 ${L1 * 0.45} 48 -10 Z`, C.skin, up);
    P(`M${side * 14} -6 Q${side * 62} ${L1 * 0.45} ${side * 38} ${L1} H${side * 12} Z`, C.skinSh, up, { opacity: 0.55 });
    const sl = dressed(el('g', {}, up)); // tight T-shirt sleeve
    P('M-56 -4 Q-54 -44 0 -46 Q54 -44 56 -4 Q62 26 56 54 H-56 Q-62 26 -56 -4 Z', C.tee, sl);
    P(`M${side * 14} -44 Q${side * 56} -40 ${side * 56} -4 Q${side * 62} 26 ${side * 56} 54 H${side * 24} Z`, C.teeSh, sl);
    P('M-57 44 H57 V56 H-57 Z', C.teeSh, sl);
    bare(P(`M-50 -4 Q-48 -44 0 -46 Q48 -44 50 -4 Q54 26 40 40 Q0 50 -40 40 Q-54 26 -50 -4 Z`, C.skin, up)); bare(P(`M-36 -20 Q0 -40 36 -20 Q40 10 30 26 Q0 34 -30 26 Q-40 10 -36 -20 Z`, C.skinHi, up, { opacity: 0.3 })); // deltoid
    // forearm
    const foS = el('g', {}, fo);
    P(`M-38 -4 Q-44 ${L2 * 0.35} -28 ${L2} H28 Q44 ${L2 * 0.35} 38 -4 Z`, C.skin, foS);
    P(`M${side * 8} 0 Q${side * 32} ${L2 * 0.35} ${side * 20} ${L2} H${side * 4} Z`, C.skinSh, foS, { opacity: 0.5 });
    el('circle', { cx: 0, cy: 0, r: 39, fill: C.skin }, fo);
    let watch = null;
    if (side > 0) { watch = el('g', {}, fo); el('rect', { x: -31, y: L2 - 24, width: 62, height: 18, rx: 5, fill: C.watch }, watch); el('circle', { cx: 0, cy: L2 - 16, r: 11, fill: C.watchFace, stroke: C.watch, 'stroke-width': 3 }, watch); P(`M0 ${L2 - 16} V${L2 - 23} M0 ${L2 - 16} H5`, 'none', watch, { stroke: '#DDDDDD', 'stroke-width': 2, 'stroke-linecap': 'round' }); }
    const h = el('g', { transform: 'scale(1.25)' }, hand), types = [];
    const palm = pg => P('M-26 0 Q-30 32 -18 48 Q0 56 18 48 Q30 32 26 0 Z', C.skin, pg);
    let t0 = el('g', {}, h);
    for (const [x, a] of [[-16, 8], [-5, 2], [6, -3], [17, -9]]) el('rect', { x: x - 6.5, y: 34, width: 13, height: 36, rx: 6.5, fill: C.skin, transform: `rotate(${a} ${x} 34)` }, t0);
    palm(t0); E(side * -25, 20, 9, 17, C.skin, t0, { transform: `rotate(${side * 30} ${side * -25} 20)` });
    types.push(t0);
    t0 = el('g', {}, h); palm(t0); el('rect', { x: side * 9 - 7, y: 40, width: 14, height: 42, rx: 7, fill: C.skin }, t0); types.push(t0);
    t0 = el('g', {}, h); P('M-28 0 Q-32 38 -16 50 H16 Q32 38 28 0 Z', C.skin, t0);
    P('M-18 28 H18 M-18 39 H16', 'none', t0, { stroke: C.skinSh, 'stroke-width': 4, 'stroke-linecap': 'round' }); types.push(t0);
    t0 = el('g', {}, h); P('M-26 0 Q-34 30 -12 46 Q16 50 28 34 Q32 10 26 0 Z', C.skin, t0); types.push(t0);
    types.push(el('g', {}, h)); // hidden in the pocket
    return { up, fo, foS, hand, types, side, watch };
  };
  const armL = mkArm(-1), armR = mkArm(1);

  let carry = { ...SB, ...(o.start ?? {}) };
  const KEEP = ['x', 'y', 's', 'alpha', 'torse'];
  const ks = keys.map(([t, p, d]) => {
    const ov = typeof p === 'string' ? { pose: p } : p;
    let pose;
    if (ov.pose) { pose = { ...SB, ...SPO[ov.pose] }; for (const k of KEEP) pose[k] = carry[k]; } else pose = { ...carry };
    Object.assign(pose, ov); delete pose.pose; carry = pose;
    return [t, pose, d ?? 0.4];
  });
  const off = o.phase ?? 0, api = { g };
  updaters.push(t => {
    let i = 0; while (i + 1 < ks.length && ks[i + 1][0] <= t) i++;
    let S = ks[i][1];
    if (t >= ks[0][0]) { const [t1, p1, d1] = ks[i], prev = i > 0 ? ks[i - 1][1] : p1; S = mixS(prev, p1, eIO(prog(t, t1, d1))); }
    if (S.alpha <= 0.001) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    const bare1 = S.torse > 0.5;
    outfit[0].forEach(n => n.setAttribute('display', bare1 ? 'none' : 'inline'));
    outfit[1].forEach(n => n.setAttribute('display', bare1 ? 'inline' : 'none'));
    const breath = Math.sin(t * 2.4 + off), lb = S.laugh * Math.abs(Math.sin(t * 12));
    const bob = -6 * lb, sq = 0.012 * breath + 0.025 * lb;
    const tilt = S.tilt + 1.2 * Math.sin(t * 1.3 + off);
    body.setAttribute('transform', `translate(0,${bob}) rotate(${tilt} 0 ${legTop}) translate(0,${legTop}) scale(${1 + sq * 0.6},${1 - sq}) translate(0,${-legTop})`);
    const hT = S.headTilt + 1.5 * Math.sin(t * 1.1 + off) + S.laugh * 4 * Math.sin(t * 12);
    head.setAttribute('transform', `translate(0,-712) rotate(${hT} 0 70) scale(1.32)`);
    legL.setAttribute('transform', `translate(-60,${legTop}) rotate(2.5)`);
    legR.setAttribute('transform', `translate(60,${legTop}) rotate(-2.5)`);
    const lx = S.look * 8, ly = S.lookY * 6;
    face.setAttribute('transform', `translate(${lx * 0.5},${ly * 0.4})`);
    const blink = ((t + off) % 3.1) < 0.11 ? 0.06 : 1;
    for (const e of eyes) {
      const open = S.eyes * blink * (e.sx < 0 ? 1 - S.winkL : 1);
      e.eg.setAttribute('transform', `translate(${e.sx * 30},-8)`);
      if (open > 0.35) {
        const sy = Math.min(open, 1.2);
        e.white.setAttribute('ry', 17 * sy);
        for (const n of [e.white, e.iris, e.pupil, e.hi]) n.setAttribute('display', 'inline');
        e.iris.setAttribute('cx', lx); e.iris.setAttribute('cy', ly + 1); e.pupil.setAttribute('cx', lx); e.pupil.setAttribute('cy', ly + 1);
        e.hi.setAttribute('cx', lx + 3.5); e.hi.setAttribute('cy', ly - 3);
        e.lid.setAttribute('opacity', 0);
      } else {
        for (const n of [e.white, e.iris, e.pupil, e.hi]) n.setAttribute('display', 'none');
        e.lid.setAttribute('opacity', 1);
        e.lid.setAttribute('d', S.eyes < 0.35 ? (S.mouthOpen > 0.5 ? 'M-14 4 Q0 -10 14 4' : 'M-14 -2 Q0 8 14 -2') : 'M-14 -2 Q0 8 14 -2');
      }
    }
    const by = -42 - S.brow * 8, inner = S.worry * 7 - S.frown * 10;
    browL.setAttribute('d', `M-54 ${by + 4 - S.frown * 2} Q-36 ${by - 8} -14 ${by - inner + 2}`);
    browR.setAttribute('d', `M14 ${by - inner + 2} Q36 ${by - 8} 54 ${by + 4 - S.frown * 2}`);
    const m = S.mouth, mo = S.mouthOpen, my = 52;
    if (S.oh > 0.3) {
      mOpen.setAttribute('d', `M-10 ${my - 2} Q-11 ${my + 18} 0 ${my + 19} Q11 ${my + 18} 10 ${my - 2} Q0 ${my - 9} -10 ${my - 2} Z`);
      mOpen.setAttribute('opacity', 1); for (const n of [mTeeth, mTongue, mLine]) n.setAttribute('opacity', 0);
    } else if (mo > 0.08) {
      const hw = 24 + 7 * Math.max(0, m), top = my - 3 - Math.max(0, m) * 3, bot = my + 4 + 28 * mo;
      mOpen.setAttribute('d', `M${-hw} ${top} Q0 ${top + (m < 0 ? 6 : -2)} ${hw} ${top} Q${hw * 0.7} ${bot} 0 ${bot} Q${-hw * 0.7} ${bot} ${-hw} ${top} Z`);
      mTeeth.setAttribute('d', `M${-hw + 4} ${top + 1} Q0 ${top - 1} ${hw - 4} ${top + 1} L${hw - 8} ${top + 9} Q0 ${top + 7} ${-hw + 8} ${top + 9} Z`);
      mTongue.setAttribute('cy', bot - 6); mTongue.setAttribute('rx', 11 + 4 * mo);
      for (const n of [mOpen, mTeeth, mTongue]) n.setAttribute('opacity', clamp(mo * 4)); mLine.setAttribute('opacity', 0);
    } else {
      for (const n of [mOpen, mTeeth, mTongue]) n.setAttribute('opacity', 0); mLine.setAttribute('opacity', 1);
      mLine.setAttribute('d', `M-24 ${my - 2} Q0 ${my + m * 20} 24 ${my - 2 - (S.winkL > 0.5 ? 6 : 0)}`);
    }
    const tr = tilt * Math.PI / 180;
    for (const A of [armL, armR]) {
      const side = A.side, [out, bend0] = side < 0 ? S.aL : S.aR;
      const bend = bend0 + (side > 0 ? S.wave * 16 * Math.sin(t * 11) : 0);
      const lsx = side * 148, lsy = -590 - legTop;
      const sx = lsx * Math.cos(tr) - lsy * Math.sin(tr), sy = legTop + bob + lsx * Math.sin(tr) + lsy * Math.cos(tr);
      const a1 = -side * out + tilt + 2 * Math.sin(t * 1.9 + off + side), a2 = a1 + side * bend;
      const r1 = a1 * Math.PI / 180, r2 = a2 * Math.PI / 180;
      const fl = L2 * (1 + 0.55 * S.cross); // crossed arms: forearms reach the other elbow
      const ex = sx - Math.sin(r1) * L1, ey = sy + Math.cos(r1) * L1;
      const hx = ex - Math.sin(r2) * fl, hy = ey + Math.cos(r2) * fl;
      A.up.setAttribute('transform', `translate(${sx},${sy}) rotate(${a1})`);
      A.fo.setAttribute('transform', `translate(${ex},${ey}) rotate(${a2})`);
      A.foS.setAttribute('transform', `scale(1,${fl / L2})`);
      if (A.watch) A.watch.setAttribute('transform', `translate(0,${fl - L2})`);
      const type = Math.round(side < 0 ? S.hL : S.hR);
      A.hand.setAttribute('transform', `translate(${hx},${hy}) rotate(${type === 3 ? a2 - side * 30 : a2})`);
      A.types.forEach((n, k) => n.setAttribute('display', k === type ? 'inline' : 'none'));
    }
    g.setAttribute('transform', `translate(${S.x},${S.y - S.jump}) scale(${S.s})`);
    g.setAttribute('opacity', S.alpha);
    api.head = [S.x, S.y - 700 * S.s];
  });
  return api;
}
