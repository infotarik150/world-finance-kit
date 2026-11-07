// Version 2: visual metaphors + continuous camera. Times are word onsets in voix_version1.mp3.
const NUM_Y = 1290, UNIT_Y = 1392, LBL_Y = 1180;
const GOLD = 'url(#iGold)', GREEN = 'url(#iGreen)', BLUE = 'url(#iBlue)';
const LINE = '#A9CBF7';
const onGround = (g, size, bottom) => g - (bottom - 50) * size / 100;
const R2 = rnd(42);

// stroke path drawn over [t0, t0+dur]
function drawPath(parent, d, t0, dur, attrs = {}) {
  const n = el('path', { d, fill: 'none', stroke: LINE, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, ...attrs }, parent);
  updaters.push(t => n.setAttribute('stroke-dashoffset', (1 - eIO(prog(t, t0, dur))).toFixed(4)));
  return n;
}
// fade group helper
function fader(parent, fn) {
  const g = el('g', {}, parent);
  updaters.push(t => { const a = fn(t); if (a <= 0.001) g.setAttribute('display', 'none'); else { g.removeAttribute('display'); g.setAttribute('opacity', a.toFixed(3)); } });
  return g;
}
// row of tokens that light up in sequence (small icons)
function tokens(parent, parts, n, o) {
  const g = item({ x: CX, y: o.y ?? NUM_Y, t0: o.t0, t1: o.t1, rise: 14 }, parent);
  const gap = o.gap ?? 140, x0 = -gap * (n - 1) / 2;
  for (let i = 0; i < n; i++) {
    const ts = o.t0 + i * (o.stag ?? 0.12);
    const c = item({ x: x0 + i * gap, y: 0, t0: ts, t1: o.t1 + 5, s0: 0.5, rise: 0, fi: 0.3, filter: 'gSoft' }, g);
    icon(c, parts, { size: o.size ?? 92, t0: ts, draw: 0.35, stag: 0.03, color: o.color ?? GOLD, sw: 3.4 });
  }
  return g;
}

/* =========================================================
   1–2. HOOK: the fork in the road  (0 – 5.0)
   ========================================================= */
const intro = el('g', {}, root);
updaters.push(t => {
  if (t > 5.0) { intro.setAttribute('display', 'none'); return; }
  intro.removeAttribute('display');
  intro.setAttribute('opacity', (1 - prog(t, 4.85, 0.15)).toFixed(3));
  const z = 1 + 7 * eIn(prog(t, 4.4, 0.75));
  intro.setAttribute('transform', `translate(780,705) scale(${z}) translate(-780,-705)`);
});
{
  const roads = el('g', { filter: 'url(#gSoft)' }, intro);
  drawPath(roads, 'M540 1600 L540 1080', 0.0, 0.45, { 'stroke-width': 5 });
  const left = drawPath(roads, 'M540 1080 C540 960 300 980 300 840', 0.3, 0.5, { 'stroke-width': 5 });
  drawPath(roads, 'M540 1080 C540 960 780 980 780 830', 0.38, 0.5, { 'stroke-width': 5 });
  // college branch dims once rejected
  const leftSide = fader(intro, t => 1 - 0.75 * eIO(prog(t, 1.75, 0.5)));
  updaters.push(t => left.setAttribute('stroke-opacity', (1 - 0.75 * eIO(prog(t, 1.75, 0.5))).toFixed(3)));
  const capG = el('g', { filter: 'url(#gSoft)' }, leftSide);
  icon(capG, I.cap, { x: 300, y: 730, size: 200, t0: 0.5, draw: 0.6, stag: 0.08, sw: 4.5 });
  icon(capG, I.strike, { x: 300, y: 730, size: 230, t0: 1.5, draw: 0.3, sw: 5, color: '#F2F6FF' });
  label({ str: 'COLLEGE', x: 300, y: 585, t0: 0.75, t1: 99, size: 30, ls: 9, parent: leftSide });

  // the right road lights up in gold
  const flow = el('path', { d: 'M540 1080 C540 960 780 980 780 830', fill: 'none', stroke: '#F6D27A', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': '16 20', filter: 'url(#gGold)' }, intro);
  const stemFlow = el('path', { d: 'M540 1600 L540 1080', fill: 'none', stroke: '#F6D27A', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': '16 20', filter: 'url(#gGold)' }, intro);
  updaters.push(t => {
    const a = eOut(prog(t, 2.46, 0.5));
    for (const p of [flow, stemFlow]) { p.setAttribute('opacity', a.toFixed(3)); p.setAttribute('stroke-dashoffset', (t * 90).toFixed(1)); }
  });

  // door: frame, light behind, panel that swings open
  const door = el('g', {}, intro);
  const rays = el('polygon', { points: '712,830 848,830 1060,1300 500,1300', fill: 'url(#ray)' }, door);
  const lightR = el('rect', { x: 712, y: 595, width: 136, height: 235, fill: 'url(#doorLight)', filter: 'url(#gGold)' }, door);
  const panelG = el('g', {}, door);
  el('rect', { x: 712, y: 595, width: 136, height: 235, fill: '#08132E', stroke: LINE, 'stroke-width': 3 }, panelG);
  el('circle', { cx: 830, cy: 715, r: 6, fill: LINE }, panelG);
  const frame = drawPath(door, 'M702 830 V585 H858 V830', 0.6, 0.5, { 'stroke-width': 4.5, filter: 'url(#gSoft)' });
  updaters.push(t => {
    const dim = 0.45 + 0.55 * eOut(prog(t, 2.46, 0.4));
    panelG.setAttribute('opacity', (eOut(prog(t, 0.9, 0.4)) * dim).toFixed(3));
    frame.setAttribute('stroke-opacity', dim.toFixed(3));
    const open = eIO(prog(t, 3.96, 0.5));
    panelG.setAttribute('transform', `translate(712,0) scale(${1 - 0.88 * open},1) translate(-712,0)`);
    const L = eOut(prog(t, 3.96, 0.45));
    lightR.setAttribute('opacity', L.toFixed(3)); rays.setAttribute('opacity', L.toFixed(3));
  });
  // golden key turning in the lock
  const key = el('g', { filter: 'url(#gGold)' }, door);
  const keyIn = el('g', {}, key);
  icon(keyIn, I.key, { x: 0, y: 0, size: 110, t0: 3.3, draw: 0.35, stag: 0.04, color: GOLD, sw: 5 });
  updaters.push(t => {
    const a = Math.min(eOut(prog(t, 3.3, 0.25)), 1 - eIn(prog(t, 3.9, 0.2)));
    key.setAttribute('opacity', a.toFixed(3));
    const slide = eOut(prog(t, 3.3, 0.3)), rot = 90 * eIO(prog(t, 3.55, 0.3));
    key.setAttribute('transform', `translate(${790 - 40 * (1 - slide) + 6},715) rotate(${rot})`);
  });

  // the kid walks up the road, then takes the right branch
  const motion = el('path', { d: 'M540 1080 C540 960 780 980 780 830', fill: 'none', stroke: 'none' }, intro);
  const ML = motion.getTotalLength();
  const kid = el('g', { filter: 'url(#gSoft)' }, intro);
  icon(kid, I.person, { x: 0, y: -42, size: 110, t0: 0.0, draw: 0.3 });
  updaters.push(t => {
    let x = 540, y = 1600 - 500 * eOut(prog(t, 0.05, 1.35));
    const p = eIO(prog(t, 2.55, 1.3));
    if (p > 0) { const pt = motion.getPointAtLength(p * ML); x = pt.x; y = pt.y; }
    const s = 1 - 0.3 * p;
    kid.setAttribute('transform', `translate(${x},${y}) scale(${s})`);
  });

  label({ str: 'OWN A', x: CX, y: 330, t0: 3.32, t1: 99, size: 30, ls: 10, parent: intro });
  label({ str: 'SERVICE BUSINESS', x: CX, y: 405, t0: 3.68, t1: 99, size: 62, ls: 5, weight: 700, fill: '#F2F6FF', parent: intro });
}
// golden flash: we fly through the open door
{
  const fl = el('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#flash)' }, root);
  updaters.push(t => fl.setAttribute('opacity', kf(t, [[4.55, 0], [4.98, 0.95], [5.6, 0]]).toFixed(3)));
}

/* =========================================================
   3. $5,000 vs $200,000 — honest bar chart  (5.08 – 13.4)
   ========================================================= */
{
  const s3 = fader(root, t => Math.min(eOut(prog(t, 5.0, 0.5)), 1 - eIO(prog(t, 12.95, 0.45))));
  label({ str: 'SERVICE BUSINESSES', x: CX, y: 745, t0: 5.82, t1: 99, size: 28, ls: 8, parent: s3 });
  drawPath(s3, 'M220 1430 H860', 7.0, 0.5, { 'stroke-width': 3, 'stroke-opacity': 0.7 });
  // the 22-year-old drops in and stands on the tiny $5,000 bar
  const kid = item({ x: 380, y: t => 1430 - 57 - 13 * eOut(prog(t, 8.6, 0.4)) - 260 * (1 - eOut(prog(t, 7.08, 0.55))), t0: 7.08, t1: 99, rise: 0, s0: 1, fi: 0.3, filter: 'gSoft' }, s3);
  icon(kid, I.person, { size: 150, t0: 7.08, draw: 0.3 });
  label({ str: 'AGE 22', x: 380, y: t => 1250 - 13 * eOut(prog(t, 8.6, 0.4)), t0: 7.35, t1: 99, size: 26, ls: 8, parent: s3 });
  const gb = el('rect', { x: 330, width: 100, rx: 3, fill: 'url(#tGold)', filter: 'url(#gGold)' }, s3);
  const vb = el('rect', { x: 650, width: 100, rx: 4, fill: 'url(#tGreen)', filter: 'url(#gGreen)' }, s3);
  const H5 = 13, H200 = 520; // 5,000 / 200,000 = exact 1:40 ratio
  const barH = t => H200 * eIO(prog(t, 10.42, 1.6));
  updaters.push(t => {
    const h = H5 * eOut(prog(t, 8.6, 0.4));
    gb.setAttribute('y', 1430 - h); gb.setAttribute('height', h);
    const g = barH(t); vb.setAttribute('y', 1430 - g); vb.setAttribute('height', g);
  });
  money({ x: 380, y: 1492, t0: 8.6, t1: 99, to: 5000, tc: 8.6, dur: 0.6, size: 62, color: 'gold', auraR: 170, parent: s3 });
  label({ str: 'TO START', x: 380, y: 1548, t0: 8.75, t1: 99, size: 22, ls: 7, parent: s3 });
  money({ x: 700, y: t => 1430 - barH(t) - 58, t0: 10.42, t1: 99, from: 5000, to: 200000, tc: 10.42, dur: 1.6, round: 1000, size: 76, color: 'green', auraR: 240, parent: s3, rise: 0 });
  label({ str: 'PER YEAR', x: 700, y: 1492, t0: 12.3, t1: 99, size: 26, ls: 8, fill: '#BDF7DD', parent: s3 });
}

/* =========================================================
   4. 01 COMMERCIAL CLEANING — the city that pays at night
   ========================================================= */
{
  const sc = scene(13.54, 24.95), E = 26, G = 1080;
  header('01', 'COMMERCIAL CLEANING', 13.54, 14.28, E, sc);
  const city = item({ x: 0, y: 0, t0: 14.2, t1: E, rise: 0, s0: 1, dims: [[22.25, 99, 0.45]] }, sc);
  const lines = el('g', { filter: 'url(#gSoft)' }, city);
  drawPath(lines, `M130 ${G} H950`, 14.28, 0.6, { 'stroke-width': 3 });
  const bl = [[215, 125, 300], [360, 140, 420], [520, 120, 350], [660, 150, 460], [830, 105, 280]];
  bl.forEach(([x, w, h], i) => drawPath(lines, `M${x} ${G} V${G - h} H${x + w} V${G}`, 14.3 + i * 0.08, 0.6, { 'stroke-width': 3.5 }));
  icon(lines, I.moon, { x: 900, y: 650, size: 80, t0: 15.0, draw: 0.6, sw: 3 });
  // 25 windows = 25 offices
  const wins = [];
  bl.forEach(([x, w, h]) => { for (let k = 0; k < 5; k++) wins.push([x + w / 2 - 11, G - h + 34 + k * 48]); });
  const order = [12, ...[...Array(25).keys()].filter(i => i !== 12).sort((a, b) => ((a * 7) % 25) - ((b * 7) % 25))];
  order.forEach((wi, n) => {
    const [wx, wy] = wins[wi];
    const ts = n === 0 ? 15.68 : 18.12 + (n - 1) * 0.034;
    const off = el('rect', { x: wx, y: wy, width: 22, height: 26, rx: 3, fill: 'none', stroke: LINE, 'stroke-width': 1.5, 'stroke-opacity': 0.45 }, city);
    const on = el('rect', { x: wx, y: wy, width: 22, height: 26, rx: 3, fill: '#FFE7A8', filter: 'url(#gGold)' }, city);
    updaters.push(t => { on.setAttribute('opacity', eOut(prog(t, ts, 0.2)).toFixed(3)); off.setAttribute('opacity', eOut(prog(t, 14.6, 0.5)).toFixed(3)); });
    coin(sc, wx + 11, wy + 13, CX, NUM_Y, ts + 0.05, 0.55, n === 0 ? 24 : 16, n === 0 ? 140 : 90);
  });
  money({ x: CX, y: NUM_Y, t0: 15.66, t1: 17.95, to: 30, tc: 15.68, dur: 0.45, size: 160, color: 'gold', auraR: 320, parent: sc });
  label({ str: 'PER OFFICE  ·  PER NIGHT', x: CX, y: UNIT_Y, t0: 16.12, t1: 17.95, size: 28, ls: 6, parent: sc });

  label({ str: '25 OFFICES', x: CX, y: LBL_Y, t0: 18.25, t1: 20.9, size: 30, ls: 9, parent: sc });
  money({ x: CX, y: NUM_Y, t0: 18.1, t1: 20.9, from: 30, to: 750, tc: 18.25, dur: 1.35, round: 10, size: 160, color: 'gold', auraR: 320, parent: sc });
  label({ str: 'PER NIGHT', x: CX, y: UNIT_Y, t0: 20.0, t1: 20.9, size: 28, ls: 9, parent: sc });

  // the week: 5 night slots
  label({ str: '5 NIGHTS A WEEK', x: CX, y: LBL_Y, t0: 20.96, t1: 22.25, size: 30, ls: 9, parent: sc });
  const wk = item({ x: CX, y: NUM_Y + 10, t0: 20.96, t1: 22.25, rise: 14 }, sc);
  'MTWTF'.split('').forEach((d, i) => {
    const x = -250 + i * 125, ts = 20.96 + i * 0.12;
    const slot = el('rect', { x: x - 46, y: -62, width: 92, height: 124, rx: 16, fill: 'rgba(246,210,122,0.0)', stroke: LINE, 'stroke-width': 2.5 }, wk);
    text(wk, { str: d, x, y: -30, size: 24, weight: 600, fill: '#DCEBFF', ls: 2 });
    const m = el('g', { filter: 'url(#gGold)' }, wk);
    icon(m, I.moon, { x, y: 20, size: 46, t0: ts, draw: 0.35, sw: 3, color: GOLD });
    updaters.push(t => { const p = eOut(prog(t, ts, 0.3)); slot.setAttribute('fill', `rgba(246,210,122,${(0.14 * p).toFixed(3)})`); slot.setAttribute('stroke', p > 0.5 ? '#F2C860' : LINE); });
  });
  // the year: 52 weeks fill up
  const yr = item({ x: CX, y: 1175, t0: 22.3, t1: E, rise: 10, s0: 0.98 }, sc);
  for (let c = 0; c < 52; c++) for (let r = 0; r < 5; r++) {
    const d = el('circle', { cx: -331 + c * 13, cy: -26 + r * 13, r: 3.4, fill: LINE }, yr);
    const ts = 22.34 + c * (1.5 / 52);
    updaters.push(t => { const p = prog(t, ts, 0.15); d.setAttribute('fill', p > 0.5 ? '#7DF2C0' : LINE); d.setAttribute('opacity', (0.3 + 0.7 * p).toFixed(3)); });
  }
  label({ str: '52 WEEKS', x: CX, y: 1100, t0: 22.4, t1: E, size: 22, ls: 8, parent: sc });
  money({ x: CX, y: 1305, t0: 22.32, t1: E, to: 195000, tc: 22.34, dur: 1.6, round: 1000, size: 165, color: 'green', parent: sc });
  label({ str: 'PER YEAR', x: CX, y: 1405, t0: 23.95, t1: E, size: 30, ls: 10, fill: '#BDF7DD', parent: sc });
}

/* =========================================================
   5. 02 JUNK REMOVAL — the truck, the dumpster, the back
   ========================================================= */
{
  const sc = scene(25.08, 35.4), E = 36.5, G = 1060;
  header('02', 'JUNK REMOVAL', 25.08, 25.92, E, sc);
  const ground = el('g', { filter: 'url(#gSoft)' }, sc);
  drawPath(ground, `M110 ${G} H970`, 25.9, 0.6, { 'stroke-width': 3 });
  // junk pile that gets thrown into the dumpster
  const pile = el('g', { filter: 'url(#gSoft)' }, sc);
  drawPath(pile, `M${818} ${G - 22} m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0`, 25.95, 0.5, { 'stroke-width': 3.5 });
  drawPath(pile, `M850 ${G} V${G - 50} H905 V${G} Z`, 26.05, 0.5, { 'stroke-width': 3.5 });
  drawPath(pile, `M790 ${G - 62} L880 ${G - 84} M800 ${G - 50} L840 ${G - 90}`, 26.15, 0.5, { 'stroke-width': 3.5 });
  updaters.push(t => {
    const p = eIO(prog(t, 29.5, 0.6));
    const dx = -300 * p, dy = -60 * p - Math.sin(Math.PI * p) * 200;
    pile.setAttribute('transform', `translate(${850 + dx},${G - 40 + dy}) scale(${1 - 0.6 * p}) translate(-850,${-(G - 40)})`);
    pile.setAttribute('opacity', (1 - prog(t, 29.95, 0.15)).toFixed(3));
  });
  const truck = item({ x: t => -260 + 560 * eOut(prog(t, 27.0, 0.8)), y: onGround(G, 250, 80), t0: 27.0, t1: E, rise: 0, s0: 1, fi: 0.2, filter: 'gSoft' }, sc);
  icon(truck, I.truck, { size: 250, t0: 27.0, draw: 0.5, stag: 0.05, sw: 4 });
  const dump = item({ x: 560, y: t => onGround(G, 190, 90) - 320 * (1 - eOut(prog(t, 27.8, 0.45))), t0: 27.8, t1: E, rise: 0, s0: 1, fi: 0.2, filter: 'gSoft' }, sc);
  icon(dump, I.dumpster, { size: 190, t0: 27.8, draw: 0.4, stag: 0.04, sw: 4 });
  const lift = item({ x: 715, y: onGround(G, 185, 90), t0: 28.66, t1: E, rise: 20, filter: 'gSoft' }, sc);
  icon(lift, I.lifter, { size: 185, t0: 28.66, draw: 0.45, stag: 0.05, sw: 4 });
  label({ str: 'TRUCK', x: 300, y: G + 45, t0: 27.2, t1: 29.4, size: 20, ls: 5, parent: sc });
  label({ str: 'DUMPSTER', x: 545, y: G + 45, t0: 27.95, t1: 29.4, size: 20, ls: 5, parent: sc });
  label({ str: 'STRONG BACK', x: 800, y: G + 45, t0: 28.8, t1: 29.4, size: 20, ls: 5, parent: sc });

  coin(sc, 560, G - 120, CX, NUM_Y, 29.95, 0.5, 24, 160);
  money({ x: CX, y: NUM_Y, t0: 29.46, t1: 31.38, to: 350, tc: 29.48, dur: 0.5, size: 160, color: 'gold', auraR: 320, parent: sc });
  label({ str: 'PER LOAD', x: CX, y: UNIT_Y, t0: 30.62, t1: 31.38, size: 28, ls: 9, parent: sc });

  tokens(sc, I.dumpster, 4, { t0: 31.46, t1: 32.7, size: 96, gap: 150, stag: 0.13 });
  label({ str: '4 LOADS A DAY', x: CX, y: UNIT_Y, t0: 31.6, t1: 32.7, size: 28, ls: 9, parent: sc });

  money({ x: CX, y: NUM_Y, t0: 32.76, t1: E, to: 1400, tc: 32.78, dur: 0.9, round: 10, size: 165, color: 'green', parent: sc });
  label({ str: 'DAILY', x: CX, y: UNIT_Y + 4, t0: 34.36, t1: E, size: 42, ls: 16, fill: '#BDF7DD', filter: 'gGreen', parent: sc });
}

/* =========================================================
   6. 03 MOVING — house to house, then x3
   ========================================================= */
{
  const sc = scene(35.52, 47.7), E = 48.8, G = 1060;
  header('03', 'MOVING', 35.52, 36.28, E, sc);
  const ground = el('g', { filter: 'url(#gSoft)' }, sc);
  drawPath(ground, `M110 ${G} H970`, 36.2, 0.6, { 'stroke-width': 3 });
  const hA = item({ x: 140, y: onGround(G, 200, 86), t0: 36.28, t1: 44.7, filter: 'gSoft' }, sc);
  icon(hA, I.house, { size: 200, t0: 36.28, draw: 0.5, stag: 0.06, sw: 4 });
  const hB = item({ x: 895, y: onGround(G, 200, 86), t0: 36.4, t1: 44.7, filter: 'gSoft' }, sc);
  icon(hB, I.house, { size: 200, t0: 36.4, draw: 0.5, stag: 0.06, sw: 4 });
  // boxes fly into the truck
  const bx = el('g', { filter: 'url(#gSoft)' }, sc);
  icon(bx, I.boxes, { x: 0, y: 0, size: 110, t0: 36.35, draw: 0.4, stag: 0.05, sw: 3.5 });
  updaters.push(t => {
    const p = eIO(prog(t, 38.3, 0.55));
    const x = 280 + (580 - 280) * p, y = onGround(G, 110, 86) - 30 * p - Math.sin(Math.PI * p) * 170;
    bx.setAttribute('transform', `translate(${x},${y}) scale(${1 - 0.5 * p})`);
    bx.setAttribute('opacity', (1 - prog(t, 38.75, 0.12)).toFixed(3));
  });
  const tx = t => kf(t, [[38.98, 600], [39.9, 680], [44.76, 680], [45.35, 810]], eOut);
  const truck = item({ x: tx, y: t => onGround(G, 240, 80) - 320 * (1 - eOut(prog(t, 37.16, 0.5))), t0: 37.16, t1: E, rise: 0, s0: 1, fi: 0.2, filter: 'gSoft' }, sc);
  icon(truck, I.truck, { size: 240, t0: 37.16, draw: 0.45, stag: 0.05, sw: 4 });
  const guys = item({ x: 410, y: onGround(G, 105, 88), t0: 38.0, t1: 38.95, rise: 20, filter: 'gSoft' }, sc);
  icon(guys, I.person, { x: -34, size: 105, t0: 38.0, draw: 0.3 });
  icon(guys, I.person, { x: 34, size: 105, t0: 38.12, draw: 0.3 });
  label({ str: '1 TRUCK  ·  2 GUYS', x: CX, y: G + 45, t0: 38.1, t1: 44.6, size: 24, ls: 7, parent: sc });
  coin(sc, 895, G - 160, CX, NUM_Y, 40.0, 0.5, 24, 160);

  label({ str: 'UP TO', x: CX, y: LBL_Y - 10, t0: 38.96, t1: 40.9, size: 28, ls: 10, parent: sc });
  money({ x: CX, y: NUM_Y, t0: 39.32, t1: 40.9, to: 1500, tc: 39.34, dur: 0.6, round: 10, size: 160, color: 'gold', auraR: 320, parent: sc });
  label({ str: 'PER MOVE', x: CX, y: UNIT_Y, t0: 40.22, t1: 40.9, size: 28, ls: 9, parent: sc });

  tokens(sc, I.boxes, 3, { t0: 40.98, t1: 42.22, size: 100, gap: 160, stag: 0.12 });
  label({ str: '3 MOVES A WEEK', x: CX, y: UNIT_Y, t0: 41.1, t1: 42.22, size: 28, ls: 9, parent: sc });

  // two more trucks slide out of the first one
  [270, 540].forEach((x, i) => {
    const c = item({ x: t => 680 + (x - 680) * eOut(prog(t, 44.76 + i * 0.1, 0.6)), y: onGround(G, 240, 80), t0: 44.76 + i * 0.1, t1: E, rise: 0, s0: 1, fi: 0.3, filter: 'gSoft' }, sc);
    icon(c, I.truck, { size: 240, t0: 44.6, draw: 0.01, stag: 0, sw: 4 });
  });
  label({ str: 'ABOUT', x: CX, y: LBL_Y - 10, t0: 42.28, t1: 44.7, size: 28, ls: 10, parent: sc });
  const x3 = item({ x: CX, y: LBL_Y - 20, t0: 44.76, t1: E, s0: 0.4, rise: 0, fi: 0.35, filter: 'gSoft' }, sc);
  text(x3, { str: '× 3', size: 74, weight: 300, disp: true, fill: '#F2F6FF', ls: 4 });
  money({ x: CX, y: NUM_Y + 10, t0: 42.3, t1: E, steps: [[42.5, 1.4, 0, 250000], [45.98, 1.1, 250000, 750000]], round: 1000, size: 165, color: 'green', bump: 45.98, auraR: 470, parent: sc });
  label({ str: 'PER YEAR', x: CX, y: UNIT_Y + 30, t0: 44.0, t1: E, size: 30, ls: 10, fill: '#BDF7DD', parent: sc });
}

/* =========================================================
   7. 04 POWER WASHING — money under the dirt, then SOLO
   ========================================================= */
{
  const sc = scene(47.82, 55.3), E = 56.4;
  header('04', 'POWER WASHING', 47.82, 48.78, E, sc);
  const X0 = 330, Y0 = 640, PW = 500, PH = 400;
  const panel = item({ x: 0, y: 0, t0: 48.7, t1: E, rise: 0, s0: 1 }, sc);
  el('rect', { x: X0, y: Y0, width: PW, height: PH, rx: 12, fill: 'rgba(170,205,255,0.10)' }, panel);
  const hidden = el('g', { filter: 'url(#gGold)' }, panel);
  text(hidden, { str: '$350', x: X0 + PW / 2, y: Y0 + 175, size: 165, weight: 700, disp: true, fill: 'url(#tGold)', ls: -2 });
  text(panel, { str: 'PER JOB', x: X0 + PW / 2, y: Y0 + 300, size: 28, weight: 600, ls: 9, fill: 'url(#tBlue)' });
  // grime layer, washed away from left to right
  const cp = el('clipPath', { id: 'grimeClip' }, panel);
  const cr = el('rect', { x: X0, y: Y0, width: PW, height: PH }, cp);
  const grime = el('g', { 'clip-path': 'url(#grimeClip)' }, panel);
  el('rect', { x: X0, y: Y0, width: PW, height: PH, rx: 12, fill: '#0A0F1D' }, grime);
  for (let i = 0; i < 90; i++) {
    const c = R2() < 0.5 ? `rgba(72,62,48,${0.25 + R2() * 0.3})` : `rgba(28,38,62,${0.4 + R2() * 0.4})`;
    el('ellipse', { cx: X0 + R2() * PW, cy: Y0 + R2() * PH, rx: 12 + R2() * 46, ry: 8 + R2() * 30, fill: c }, grime);
  }
  const border = drawPath(panel, `M${X0 + 12} ${Y0} H${X0 + PW - 12} Q${X0 + PW} ${Y0} ${X0 + PW} ${Y0 + 12} V${Y0 + PH - 12} Q${X0 + PW} ${Y0 + PH} ${X0 + PW - 12} ${Y0 + PH} H${X0 + 12} Q${X0} ${Y0 + PH} ${X0} ${Y0 + PH - 12} V${Y0 + 12} Q${X0} ${Y0} ${X0 + 12} ${Y0} Z`, 48.8, 0.6, { 'stroke-width': 3.5, filter: 'url(#gSoft)' });
  const grimeIn = fader(panel, () => 1); // keeps DOM order simple
  const wipeX = t => X0 + PW * eIO(prog(t, 49.45, 1.6));
  // washer wand + jets
  const wand = item({ x: 190, y: 1075, t0: 48.78, t1: E, filter: 'gSoft' }, sc);
  icon(wand, I.washer, { size: 240, t0: 48.78, draw: 0.5, stag: 0.06, sw: 4.5 });
  const nz = [190 + 38 * 2.4, 1075 - 17 * 2.4];
  const jets = [0, 1, 2].map(k => el('line', { x1: nz[0], y1: nz[1], stroke: '#DDEBFF', 'stroke-width': 3, 'stroke-dasharray': '12 14', 'stroke-linecap': 'round', filter: 'url(#gSoft)' }, sc));
  const mist = [...Array(10)].map(() => el('circle', { r: 2 + R2() * 3, fill: '#DDEBFF' }, sc));
  const seeds = mist.map(() => [R2() * 6.28, 20 + R2() * 40]);
  updaters.push(t => {
    const w = wipeX(t);
    cr.setAttribute('x', w); cr.setAttribute('width', Math.max(0, X0 + PW - w));
    const ja = Math.min(eOut(prog(t, 49.3, 0.2)), 1 - eIn(prog(t, 51.1, 0.3)));
    const iy = Y0 + PH / 2 + 150 * Math.sin(t * 7.5);
    jets.forEach((j, k) => {
      j.setAttribute('x2', w); j.setAttribute('y2', iy + (k - 1) * 22);
      j.setAttribute('opacity', (0.85 * ja).toFixed(3)); j.setAttribute('stroke-dashoffset', (-t * 220 - k * 9).toFixed(1));
    });
    mist.forEach((m, i) => {
      const [a, r] = seeds[i], ph = (t * 3 + i * 0.37) % 1;
      m.setAttribute('cx', w + Math.cos(a) * r * ph); m.setAttribute('cy', iy + Math.sin(a) * r * ph);
      m.setAttribute('opacity', (ja * (1 - ph) * 0.8).toFixed(3));
    });
  });
  tokens(sc, I.house, 3, { t0: 49.94, t1: 51.95, size: 92, gap: 160, stag: 0.13, color: BLUE });
  label({ str: '3 JOBS A DAY', x: CX, y: UNIT_Y, t0: 50.0, t1: 51.95, size: 28, ls: 9, parent: sc });
  money({ x: CX, y: NUM_Y, t0: 52.06, t1: E, to: 270000, tc: 52.08, dur: 1.3, round: 1000, size: 165, color: 'green', parent: sc });
  label({ str: 'PER YEAR', x: CX, y: UNIT_Y, t0: 53.5, t1: E, size: 30, ls: 10, fill: '#BDF7DD', parent: sc });
  // SOLO: lights go down, one spotlight
  const solo = fader(sc, t => eOut(prog(t, 54.3, 0.35)));
  el('rect', { x: -200, y: 0, width: W + 400, height: H, fill: 'rgba(1,3,10,0.88)' }, solo);
  el('polygon', { points: '470,150 610,150 760,1150 320,1150', fill: 'url(#spot)' }, solo);
  el('ellipse', { cx: CX, cy: 1150, rx: 260, ry: 46, fill: 'url(#spotFloor)' }, solo);
  const sp = el('g', { filter: 'url(#gSoft)' }, solo);
  icon(sp, I.person, { x: CX, y: onGround(1150, 260, 88), size: 260, t0: 54.36, draw: 0.3, color: '#F4F8FF' });
  label({ str: 'SOLO', x: CX, y: 1260, t0: 54.4, t1: E, size: 72, ls: 22, weight: 700, fill: '#F2F6FF', parent: solo, filter: 'gSoft' });
}

/* =========================================================
   8. 05 SNOW PLOWING — 30 driveways cleared one by one
   ========================================================= */
{
  bgState.snow.push([55.4, 63.9]);
  const sc = scene(55.4, 64.1), E = 65.2;
  header('05', 'SNOW PLOWING', 55.4, 56.22, E, sc);
  const big = item({ x: t => -260 + 800 * eOut(prog(t, 56.22, 0.75)), y: 860, t0: 56.22, t1: 57.2, rise: 0, s0: 1, fi: 0.2, fo: 0.3, filter: 'gSoft' }, sc);
  icon(big, I.plow, { size: 320, t0: 56.22, draw: 0.45, stag: 0.04, sw: 4 });
  const grid = item({ x: 0, y: 0, t0: 57.28, t1: E, rise: 10, s0: 1, dims: [[60.85, 99, 0.45]] }, sc);
  const tiles = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) tiles.push([215 + c * 130, 650 + r * 100]);
  const path = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) path.push(r * 6 + (r % 2 ? 5 - c : c));
  const T0 = 58.52, DT = 2.15 / 30;
  tiles.forEach(([x, y], i) => {
    const ts = 57.28 + i * 0.022, k = path.indexOf(i), tc = T0 + k * DT;
    const g = item({ x, y, t0: ts, t1: E + 1, s0: 0.6, rise: 0, fi: 0.25 }, grid);
    const hs = el('g', { filter: 'url(#gSoft)' }, g);
    icon(hs, I.house, { x: 0, y: -12, size: 60, t0: ts, draw: 0.25, stag: 0.02, sw: 2.6 });
    el('path', { d: 'M-7 20 L-22 40 H22 L7 20', fill: 'none', stroke: LINE, 'stroke-width': 2, 'stroke-opacity': 0.8 }, g);
    const snowR = el('path', { d: 'M-9 18 L-26 42 H26 L9 18 Z', fill: '#EEF5FF', filter: 'url(#gSoft)' }, g);
    const spark = el('g', { filter: 'url(#gGold)' }, g);
    el('circle', { cx: 0, cy: 30, r: 10, fill: 'url(#tGold)' }, spark);
    updaters.push(t => {
      const cl = eOut(prog(t, tc, 0.12));
      snowR.setAttribute('opacity', (0.9 * (1 - cl)).toFixed(3));
      const sp = prog(t, tc, 0.45);
      spark.setAttribute('opacity', (sp > 0 && sp < 1 ? Math.sin(Math.PI * sp) : 0).toFixed(3));
      spark.setAttribute('transform', `translate(0,${-30 * sp}) scale(${0.6 + 0.6 * sp})`);
    });
  });
  // mini plow zig-zagging through the grid
  const mp = el('g', { filter: 'url(#gSoft)' }, sc);
  icon(mp, I.plow, { size: 56, t0: 58.3, draw: 0.2, stag: 0, sw: 3, color: GOLD });
  updaters.push(t => {
    const a = Math.min(eOut(prog(t, 58.35, 0.2)), 1 - eIn(prog(t, 60.75, 0.25)));
    if (a <= 0) { mp.setAttribute('opacity', 0); return; }
    const f = clamp((t - T0) / DT, 0, 29), k = Math.floor(f), fr = f - k;
    const [x1, y1] = tiles[path[k]], [x2, y2] = tiles[path[Math.min(29, k + 1)]];
    const dir = (Math.floor(k / 6) % 2) ? -1 : 1;
    mp.setAttribute('transform', `translate(${x1 + (x2 - x1) * fr},${y1 + 30 + (y2 - y1) * fr}) scale(${dir},1)`);
    mp.setAttribute('opacity', a.toFixed(3));
  });
  label({ str: '30 DRIVEWAYS', x: CX, y: 1165, t0: 57.5, t1: 58.45, size: 30, ls: 9, parent: sc });
  money({ x: CX, y: NUM_Y, t0: 58.5, t1: 60.8, to: 80, tc: 58.52, dur: 0.45, size: 160, color: 'gold', auraR: 320, parent: sc });
  label({ str: 'EACH  ·  EVERY STORM', x: CX, y: UNIT_Y, t0: 58.98, t1: 60.8, size: 28, ls: 7, parent: sc });
  tokens(sc, I.snow, 5, { t0: 60.9, t1: 61.96, size: 86, gap: 135, stag: 0.1, color: BLUE });
  label({ str: '5 STORMS', x: CX, y: UNIT_Y, t0: 61.0, t1: 61.96, size: 28, ls: 9, parent: sc });
  money({ x: CX, y: NUM_Y, t0: 62.02, t1: E, to: 12000, tc: 62.04, dur: 0.9, round: 100, size: 165, color: 'green', parent: sc });
  label({ str: 'SIDE INCOME', x: CX, y: UNIT_Y, t0: 63.06, t1: E, size: 30, ls: 10, fill: '#BDF7DD', parent: sc });
}

/* =========================================================
   9–10. NO DEGREE / GETTING RICH — everything flows to him
   ========================================================= */
const ORB = { x: CX, y: 930, r: 270 };
{
  const fin = fader(root, t => Math.min(eOut(prog(t, 64.15, 0.4)), 1 - eIO(prog(t, 67.7, 0.3))));
  // streams of gold from the five businesses into the person
  for (let i = 0; i < 5; i++) {
    const a = (-90 + 72 * i) * Math.PI / 180, sx = ORB.x + ORB.r * Math.cos(a), sy = ORB.y + ORB.r * Math.sin(a);
    const ln = el('line', { x1: sx, y1: sy, x2: ORB.x, y2: ORB.y, stroke: '#F6D27A', 'stroke-width': 4, 'stroke-dasharray': '6 16', 'stroke-linecap': 'round', filter: 'url(#gGold)' }, fin);
    const dots = [...Array(5)].map(() => el('circle', { r: 6, fill: 'url(#tGold)', filter: 'url(#gGold)' }, fin));
    updaters.push(t => {
      const sa = Math.min(eOut(prog(t, 65.72 + i * 0.06, 0.35)), 1);
      ln.setAttribute('opacity', (0.8 * sa).toFixed(3)); ln.setAttribute('stroke-dashoffset', (t * 120).toFixed(1));
      dots.forEach((d, k) => {
        const ph = (t * 1.1 + k / 5 + i * 0.13) % 1, s = 1 - 0.85 * ph * 0.9;
        d.setAttribute('cx', sx + (ORB.x - sx) * ph); d.setAttribute('cy', sy + (ORB.y - sy) * ph);
        d.setAttribute('opacity', (sa * Math.sin(Math.PI * ph)).toFixed(3));
      });
    });
  }
  const glow = el('ellipse', { cx: ORB.x, cy: ORB.y, rx: 330, ry: 330, fill: 'url(#aGold)' }, fin);
  updaters.push(t => glow.setAttribute('opacity', eOut(prog(t, 65.8, 1.2)).toFixed(3)));
  const p = el('g', { filter: 'url(#gSoft)' }, fin);
  icon(p, I.person, { x: ORB.x, y: ORB.y, size: 200, t0: 64.18, draw: 0.3 });
  const pg = el('g', { filter: 'url(#gGold)' }, fin);
  icon(pg, I.person, { x: ORB.x, y: ORB.y, size: 200, t0: 64.18, draw: 0.3, color: GOLD });
  updaters.push(t => pg.setAttribute('opacity', eOut(prog(t, 66.3, 0.7)).toFixed(3)));
  // the cap falls off his head
  const cap = el('g', { filter: 'url(#gSoft)' }, fin);
  icon(cap, I.cap, { x: 0, y: 0, size: 130, t0: 64.18, draw: 0.3, stag: 0.03, sw: 4.5 });
  updaters.push(t => {
    const f = eIn(prog(t, 64.64, 0.75));
    cap.setAttribute('transform', `translate(${ORB.x + 60 * f},${ORB.y - 120 + 700 * f}) rotate(${50 * f})`);
    cap.setAttribute('opacity', (1 - prog(t, 65.05, 0.35)).toFixed(3));
  });
  label({ str: 'NO DEGREE REQUIRED', x: CX, y: 1330, t0: 64.36, t1: 65.6, size: 46, ls: 6, weight: 700, fill: '#F2F6FF', parent: fin });
  const rich = item({ x: CX, y: 1330, t0: 65.7, t1: 99, s0: 0.86, fi: 0.5 }, fin);
  const rg = el('g', { filter: 'url(#gGold)' }, rich);
  text(rg, { str: 'GETTING RICH', size: 112, weight: 700, disp: true, fill: 'url(#tGold)', ls: 2 });
  [['IS', 66.2, -205], ['VERY', 66.54, -50], ['EASY.', 67.02, 165]].forEach(([w, ts, dx]) => {
    const g = item({ x: CX + dx, y: 1445, t0: ts, t1: 99, rise: 18, fi: 0.25 }, fin);
    text(g, { str: w, size: 56, weight: 600, ls: 6, fill: '#F2F6FF' });
  });
}

/* =========================================================
   11. CTA: which one would you start? + follow
   ========================================================= */
const NAMES = ['CLEANING', 'JUNK', 'MOVING', 'WASHING', 'SNOW'];
{
  label({ str: 'WHICH ONE', x: CX, y: 690, t0: 68.05, t1: 70.15, size: 70, ls: 8, weight: 700, fill: '#F2F6FF' });
  label({ str: 'WOULD YOU START?', x: CX, y: 780, t0: 68.25, t1: 70.15, size: 44, ls: 8, weight: 600 });
  NAMES.forEach((n, i) => label({ str: n, x: 240 + 150 * i, y: 1125, t0: 68.45 + i * 0.07, t1: 70.15, size: 18, ls: 3, fill: '#DCEBFF' }));
  label({ str: 'COMMENT 01 – 05', x: CX, y: 1230, t0: 68.8, t1: 70.15, size: 26, ls: 8, fill: '#F6D27A' });
  const f = item({ x: CX, y: 800, t0: 70.3, t1: 72.4, filter: 'gSoft', s0: 0.7, fo: 0.6 });
  const pl = icon(f, I.plus, { size: 150, t0: 70.3, draw: 0.6, stag: 0.15, sw: 4 });
  updaters.push(t => pl.parentNode.setAttribute('transform', `scale(${1 + (t > 71.0 ? 0.05 * Math.max(0, Math.sin((t - 71.0) * 4.2)) : 0)})`));
  label({ str: 'FOLLOW', x: CX, y: 965, t0: 70.5, t1: 72.4, size: 76, ls: 14, weight: 700, fill: '#F2F6FF', fo: 0.6 });
  label({ str: 'FOR MORE', x: CX, y: 1050, t0: 70.7, t1: 72.4, size: 34, ls: 14, fo: 0.6 });
}

/* =========================================================
   PROGRESS TRACKER (on top of everything): 01–05
   ========================================================= */
{
  const fillT = [24.0, 34.4, 46.6, 53.6, 63.1];
  const active = [[13.5, 24.95], [25.1, 35.4], [35.5, 47.7], [47.8, 55.3], [55.4, 64.1]];
  for (let i = 0; i < 5; i++) {
    const g = el('g', {}, root);
    const ring = el('circle', { r: 68, fill: 'none', stroke: '#DCEBFF', 'stroke-width': 3 }, g);
    const base = el('circle', { r: 56, fill: 'rgba(120,170,255,0.07)', stroke: LINE, 'stroke-width': 2.5 }, g);
    const fill = el('circle', { r: 56, fill: 'url(#tGreen)', filter: 'url(#gGreen)' }, g);
    const num = text(g, { str: '0' + (i + 1), size: 30, weight: 600, fill: '#DCEBFF', ls: 1 });
    const pos = t => {
      const A = [240 + 150 * i, 640, 56], B = [380 + 80 * i, 228, 26];
      const a = (-90 + 72 * i) * Math.PI / 180, C = [ORB.x + ORB.r * Math.cos(a), ORB.y + ORB.r * Math.sin(a), 42];
      const D = [240 + 150 * i, 1050, 56];
      const mix = (P, Q, k) => P.map((v, j) => v + (Q[j] - v) * eIO(k));
      if (t < 13.0) return A;
      if (t < 13.6) return mix(A, B, (t - 13.0) / 0.6);
      if (t < 64.2) return B;
      if (t < 64.7) return mix(B, C, (t - 64.2) / 0.5);
      if (t < 67.9) return C;
      if (t < 68.45) return mix(C, D, (t - 67.9) / 0.55);
      return D;
    };
    updaters.push(t => {
      const appear = eOut(prog(t, 5.52 + i * 0.09, 0.35));
      const alpha = Math.min(appear, 1 - eIO(prog(t, 70.05, 0.4)));
      if (alpha <= 0.001) { g.setAttribute('display', 'none'); return; }
      g.removeAttribute('display');
      const [x, y, r] = pos(t);
      let s = r / 56 * (0.6 + 0.4 * appear);
      const pulse = prog(t, 68.6 + i * 0.28, 0.4);
      if (pulse > 0 && pulse < 1) s *= 1 + 0.16 * Math.sin(Math.PI * pulse);
      g.setAttribute('transform', `translate(${x},${y}) scale(${s})`);
      g.setAttribute('opacity', alpha.toFixed(3));
      const f = eOut(prog(t, fillT[i], 0.45));
      fill.setAttribute('opacity', f.toFixed(3));
      num.setAttribute('fill', f > 0.5 ? '#053B25' : '#DCEBFF');
      const sw = 2.5 * 56 / r;
      base.setAttribute('stroke-width', sw.toFixed(2));
      const [a0, a1] = active[i];
      const act = Math.min(eOut(prog(t, a0, 0.3)), 1 - eOut(prog(t, a1 - 0.2, 0.3)));
      ring.setAttribute('opacity', (act * (0.55 + 0.35 * Math.sin(t * 5))).toFixed(3));
      ring.setAttribute('stroke-width', (2.5 * 56 / r).toFixed(2));
    });
  }
}

window.DURATION = 73.0;
