// "The intersection that became a monster" — Dallas High Five. Horizontal 1920x1080, black theme.
// Top-down road diagrams in a map window on the right, the hero (mustard bubble) reacting on the left.
// Times = word onsets in audio/voix.mp3 (see words.js).
window.DURATION = 69.0;

/* ---------------- word timing ---------------- */
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
function at(word, after = 0) {
  for (const w of WORDS) if (w[1] >= after - 0.01 && norm(w[0]) === norm(word)) return w[1];
  console.warn('word not found', word, after); return after;
}
const T = {};
T.five1 = at('five'); T.s2 = at('started') - 0.35; T.four = at('four', T.s2); T.except = at('except'); T.always = at('always'); T.ignores = at('ignores');
T.s3 = at('installed') - 0.5; T.leftTurning = at('turning', T.s3); T.mistake = at('mistake'); T.boom = at('boom');
T.s4 = at('protected') - 0.75; T.protected = at('protected'); T.safer = at('safer'); T.butNow = at('now', T.safer); T.wait = at('wait', T.safer); T.miles = at('miles');
T.s5 = at('lifted') - 0.85; T.lifted = at('lifted'); T.diamond = at('diamond'); T.stillWaiting = at('still', T.diamond);
T.s6 = at('cloverleaf') - 0.65; T.clover = at('cloverleaf'); T.loops = at('loops', T.clover); T.noLeft = at('no', T.clover); T.solved = at('solved'); T.until = at('until'); T.fighting = at('fighting');
T.s7 = at('tight') - 0.3; T.truck = at('truck'); T.tip = at('tip');
T.s8 = at('separate') - 0.5; T.separate = at('separate'); T.widened = at('widened'); T.tilted = at('tilted'); T.stack = at('stack', T.s8); T.this = at('this', T.s8);
T.s9 = at('dallas') - 0.6; T.highFive = at('high', T.s9); T.under = at('underneath'); T.regular = at('regular');
T.s10 = at('wait', T.regular) - 0.2; T.six = at('six'); T.count = at('count', T.six);

/* ---------------- layout ---------------- */
const MX = 1215, MY = 628, MW = 1340, MH = 820;        // map window
const GROUND_Y = 1000;
const SUB = el('g', {}), LAB = el('g', {});              // subtitles / on-screen labels (added later in z-order)
const ROAD = '#26262B', ROAD_EDGE = '#43434A', LANE = '#8A8C93', YEL = '#E3B23C';
const CARC = ['#FF7A6B', '#6EE7B7', '#6EC1FF', '#FF9BC2', '#C4A7FF', '#5ED3CE', '#FFB36B', '#F4F4F5'];
const defs = document.querySelector('#s defs');
const def = (tag, a) => el(tag, a, defs);

// map window: soft panel, everything inside is clipped
const mapClip = def('clipPath', { id: 'mapClip' });
el('rect', { x: MX - MW / 2, y: MY - MH / 2, width: MW, height: MH, rx: 34 }, mapClip);
const panel = el('rect', { x: MX - MW / 2, y: MY - MH / 2, width: MW, height: MH, rx: 34, fill: '#0D0D10', stroke: '#2A2A30', 'stroke-width': 2 });
const MAP = el('g', { 'clip-path': 'url(#mapClip)' });
{
  // faint grid like a city map
  const gp = def('pattern', { id: 'grid', width: 60, height: 60, patternUnits: 'userSpaceOnUse' });
  el('path', { d: 'M60 0 H0 V60', fill: 'none', stroke: '#16161A', 'stroke-width': 2 }, gp);
  el('rect', { x: MX - MW / 2, y: MY - MH / 2, width: MW, height: MH, fill: 'url(#grid)' }, MAP);
  [panel].forEach(p => updaters.push(t => p.setAttribute('opacity', eOut(prog(t, 0, 0.3)))));
}
for (const id of ['gRed', 'gGold', 'gGreen', 'gSoft']) { const f = document.getElementById(id); if (f) { f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('x', -4000); f.setAttribute('y', -4000); f.setAttribute('width', 8000); f.setAttribute('height', 8000); } }
const shadowF = def('filter', { id: 'elev', filterUnits: 'userSpaceOnUse', x: -4000, y: -4000, width: 8000, height: 8000 });
el('feDropShadow', { dx: 10, dy: 14, stdDeviation: 9, 'flood-color': '#000', 'flood-opacity': 0.75 }, shadowF);
const shadowS = def('filter', { id: 'elevS', filterUnits: 'userSpaceOnUse', x: -4000, y: -4000, width: 8000, height: 8000 });
el('feDropShadow', { dx: 4, dy: 6, stdDeviation: 4, 'flood-color': '#000', 'flood-opacity': 0.7 }, shadowS);

/* ---------------- helpers ---------------- */
function fader(parent, fn) {
  const g = el('g', {}, parent);
  updaters.push(t => { const a = fn(t); if (a <= 0.001) g.setAttribute('display', 'none'); else { g.removeAttribute('display'); g.setAttribute('opacity', a.toFixed(3)); } });
  return g;
}
const win = (parent, t0, t1, fi = 0.3, fo = 0.3) => fader(parent, t => Math.min(eOut(prog(t, t0, fi)), 1 - eIn(prog(t, t1, fo))));
// keyframes with per-segment easing: [[t, v, ease?], ...] ease applies to the segment that ENDS at this key
const EASE = { lin: x => x, io: eIO, out: eOut, in: eIn };
function kfe(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const [a, va] = keys[i - 1], [b, vb, e = 'io'] = keys[i];
    return va + (vb - va) * EASE[e]((t - a) / (b - a));
  }
  return keys[keys.length - 1][1];
}
// a scene = group in the map with a camera [scale, cx, cy] keyed in time, cross-fading in/out
function scene(t0, t1, camKeys = [[0, 1, 0, 0]]) {
  const outer = fader(MAP, t => Math.min(eOut(prog(t, t0 - 0.25, 0.4)), 1 - eIn(prog(t, t1 - 0.15, 0.4))));
  const g = el('g', {}, outer);
  const ks = k => camKeys.map(c => [c[0], c[k], c[4]]);
  const S = ks(1), X = ks(2), Y = ks(3);
  updaters.push(t => {
    if (t < t0 - 0.4 || t > t1 + 0.4) return;
    const s = kfe(t, S), x = kfe(t, X), y = kfe(t, Y);
    g.setAttribute('transform', `translate(${MX},${MY}) scale(${s.toFixed(4)}) translate(${(-x).toFixed(2)},${(-y).toFixed(2)})`);
  });
  return g;
}
// road drawn as stacked strokes along a path
function road(parent, d, w = 140, o = {}) {
  const g = el('g', o.elev ? { filter: `url(#${o.elev})` } : {}, parent);
  el('path', { d, fill: 'none', stroke: o.edge ?? ROAD_EDGE, 'stroke-width': w + 10, 'stroke-linecap': o.cap ?? 'butt', 'stroke-linejoin': 'round' }, g);
  el('path', { d, fill: 'none', stroke: o.fill ?? ROAD, 'stroke-width': w, 'stroke-linecap': o.cap ?? 'butt', 'stroke-linejoin': 'round' }, g);
  if (o.center !== false && w >= 90) { // US double yellow centre line
    el('path', { d, fill: 'none', stroke: YEL, 'stroke-width': 10, 'stroke-dasharray': o.centerDash ?? 'none' }, g);
    el('path', { d, fill: 'none', stroke: o.fill ?? ROAD, 'stroke-width': 3.5 }, g);
  }
  if (o.dash) el('path', { d, fill: 'none', stroke: LANE, 'stroke-width': 3, 'stroke-dasharray': '22 26', opacity: 0.7 }, g);
  return g;
}
// box junction: a plain square of asphalt covering the crossing (hides centre lines)
function junction(parent, w = 140, h = 140) { el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, fill: ROAD }, parent); }
// stop bar
const stopBar = (parent, x1, y1, x2, y2) => el('line', { x1, y1, x2, y2, stroke: '#EDEDEF', 'stroke-width': 7 }, parent);

// car following a path: keys [[t, distance, ease]]
function car(parent, d, keys, o = {}) {
  const p = el('path', { d, fill: 'none', stroke: 'none' }, parent);
  const L = p.getTotalLength();
  const g = el('g', {}, parent);
  const inner = el('g', {}, g);
  const col = o.color ?? CARC[(o.c ?? 0) % CARC.length];
  if (o.truck) {
    el('rect', { x: -58, y: -19, width: 96, height: 38, rx: 6, fill: '#000', opacity: 0.5, transform: 'translate(5,6)' }, inner);
    el('rect', { x: -58, y: -18, width: 80, height: 36, rx: 5, fill: '#D9DBE0' }, inner);
    el('line', { x1: -50, y1: -10, x2: 14, y2: -10, stroke: '#B5B8BF', 'stroke-width': 3 }, inner);
    el('line', { x1: -50, y1: 10, x2: 14, y2: 10, stroke: '#B5B8BF', 'stroke-width': 3 }, inner);
    el('rect', { x: 25, y: -16, width: 28, height: 32, rx: 7, fill: col }, inner);
    el('rect', { x: 42, y: -12, width: 7, height: 24, rx: 2, fill: '#1B2230' }, inner);
  } else {
    el('rect', { x: -26, y: -14, width: 52, height: 28, rx: 9, fill: '#000', opacity: 0.55, transform: 'translate(4,5)' }, inner);
    el('rect', { x: -26, y: -14, width: 52, height: 28, rx: 9, fill: col }, inner);
    el('rect', { x: -12, y: -10, width: 24, height: 20, rx: 5, fill: '#000', opacity: 0.22 }, inner);
    el('rect', { x: 8, y: -10, width: 8, height: 20, rx: 2.5, fill: '#1B2230' }, inner);
    el('rect', { x: -20, y: -9, width: 5, height: 18, rx: 2, fill: '#1B2230' }, inner);
    for (const yy of [-9, 9]) el('circle', { cx: 24, cy: yy, r: 3, fill: '#FFF6D8' }, inner);
  }
  const brake = el('g', {}, inner); // brake lights
  for (const yy of [-9, 9]) el('circle', { cx: o.truck ? -57 : -25, cy: yy, r: 4.5, fill: '#FF3B30' }, brake);
  const t0 = o.from ?? keys[0][0], t1 = o.to ?? 1e9;
  updaters.push(t => {
    if (t < t0 || t > t1) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    let dist = o.loop ? ((t * o.loop.speed + o.loop.off) % L + L) % L : kfe(t, keys);
    dist = clamp(dist, 0, L);
    const a = p.getPointAtLength(dist), b = p.getPointAtLength(Math.min(L, dist + 2)), c = p.getPointAtLength(Math.max(0, dist - 2));
    const ang = Math.atan2(b.y - c.y, b.x - c.x) * 180 / Math.PI;
    const extra = o.extra ? o.extra(t) : null; // {rot, sx, sy, dx, dy}
    g.setAttribute('transform', `translate(${(a.x + (extra?.dx ?? 0)).toFixed(1)},${(a.y + (extra?.dy ?? 0)).toFixed(1)}) rotate(${(ang + (extra?.rot ?? 0)).toFixed(1)})`);
    if (extra) inner.setAttribute('transform', `scale(${extra.sx ?? 1},${extra.sy ?? 1})`);
    // brake lights when slowing / stopped
    const v = o.loop ? 1 : Math.abs(kfe(t + 0.05, keys) - kfe(t - 0.05, keys));
    brake.setAttribute('opacity', o.loop ? 0 : (v < 4 ? 1 : 0.15));
  });
  return { g, p, L };
}
// stop sign
function stopSign(parent, x, y, t0, s = 1) {
  const g = el('g', {}, parent);
  const oct = Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + i * Math.PI / 4; return `${(26 * Math.cos(a)).toFixed(1)} ${(26 * Math.sin(a)).toFixed(1)}`; });
  el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: '#888', 'stroke-width': 4 }, g);
  el('path', { d: 'M' + oct.join(' L') + ' Z', fill: '#E5484D', stroke: '#FFFFFF', 'stroke-width': 3.5 }, g);
  text(g, { str: 'STOP', size: 13, weight: 800, fill: '#FFFFFF', y: 1 });
  updaters.push(t => {
    const p = prog(t, t0, 0.35);
    const sc = p <= 0 ? 0 : (eOut(p) + 0.25 * Math.sin(Math.PI * p)) * s;
    g.setAttribute('transform', `translate(${x},${y}) scale(${sc.toFixed(3)})`);
  });
  return g;
}
// traffic light: state(t) -> 'r'|'y'|'g'|'a' (green arrow)
function signal(parent, x, y, rot, state, t0, s = 1) {
  const g = el('g', {}, parent);
  el('rect', { x: -15, y: -40, width: 30, height: 80, rx: 9, fill: '#141417', stroke: '#55555C', 'stroke-width': 3 }, g);
  const R = el('circle', { cx: 0, cy: -22, r: 9 }, g), Y = el('circle', { cx: 0, cy: 0, r: 9 }, g), Gc = el('circle', { cx: 0, cy: 22, r: 9 }, g);
  const arrow = el('path', { d: 'M5 22 H-5 M-5 22 L0 17 M-5 22 L0 27', fill: 'none', stroke: '#0D0D10', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
  updaters.push(t => {
    const st = state(t), p = prog(t, t0, 0.35);
    R.setAttribute('fill', st === 'r' ? '#FF4D4D' : '#3A1416'); Y.setAttribute('fill', st === 'y' ? '#FFC93C' : '#3A3014');
    Gc.setAttribute('fill', st === 'g' || st === 'a' ? '#3CE08A' : '#12301F'); arrow.setAttribute('opacity', st === 'a' ? 1 : 0);
    g.setAttribute('transform', `translate(${x},${y}) rotate(${rot}) scale(${((eOut(p) + 0.2 * Math.sin(Math.PI * p)) * s).toFixed(3)})`);
  });
  return g;
}
// comic impact burst
function burst(parent, x, y, t0, o = {}) {
  const g = el('g', {}, parent);
  const pts = []; const n = 12;
  for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n, r = i % 2 ? (o.r ?? 70) * 0.55 : (o.r ?? 70); pts.push(`${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`); }
  el('path', { d: 'M' + pts.join(' L') + ' Z', fill: o.fill ?? 'url(#tGold)', stroke: o.stroke ?? '#C9353C', 'stroke-width': 6, 'stroke-linejoin': 'round' }, g);
  if (o.str) text(g, { str: o.str, size: o.size ?? 34, weight: 900, disp: true, fill: o.ink ?? '#7A1A1F', y: 2 });
  const dur = o.dur ?? 1.0;
  updaters.push(t => {
    const p = prog(t, t0, dur);
    if (t < t0 || p >= 1) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    const sc = eOut(prog(t, t0, 0.18)) * (1 + 0.08 * Math.sin(t * 40) * (1 - p));
    g.setAttribute('transform', `translate(${x},${y}) rotate(${(o.rot ?? -8)}) scale(${sc.toFixed(3)})`);
    g.setAttribute('opacity', (1 - eIn(prog(t, t0 + dur * 0.7, dur * 0.3))).toFixed(3));
  });
  return g;
}
// skid marks drawn behind a braking car
function skid(parent, d, t0, dur = 0.4) {
  const p = el('path', { d, fill: 'none', stroke: '#000', 'stroke-width': 7, 'stroke-opacity': 0.75, pathLength: 1, 'stroke-dasharray': 1 }, parent);
  updaters.push(t => p.setAttribute('stroke-dashoffset', (1 - eOut(prog(t, t0, dur))).toFixed(3)));
}
// highlight ring (pulsing)
function ring(parent, x, y, r, t0, t1, col = '#FF4D4D') {
  const g = win(parent, t0, t1, 0.25, 0.3);
  const c = el('circle', { cx: x, cy: y, r, fill: 'none', stroke: col, 'stroke-width': 7, 'stroke-dasharray': '18 12' }, g);
  updaters.push(t => c.setAttribute('transform', `rotate(${(t * 40) % 360} ${x} ${y})`));
  return g;
}

/* ---------------- the High Five (stack interchange), drawn level by level ---------------- */
// levels: 1 US-75 sunk below ground, 2 frontage roads (ground-level intersections), 3 I-635, 4-5 direct-connect ramps
const HF = {
  us75: 'M0 -900 V900',
  i635: 'M-1100 0 H1100',
  frontH1: 'M-1100 -150 H1100', frontH2: 'M-1100 150 H1100', frontV1: 'M-150 -900 V900', frontV2: 'M150 -900 V900',
  // pinwheel of flyover ramps (each one rotated 90 degrees)
  ramp: 'M-1100 -55 C-520 -55 -330 -60 -230 -160 C-120 -270 -60 -420 -60 -900',
};
const LEVEL_COL = ['#1A1A1E', '#2B2B31', '#383840', '#45454E', '#53535D'];
function highFive(parent, show = () => 1, o = {}) {
  // show(levelIndex, t) -> 0..1 build progress per level (1..5)
  const lv = [];
  const L = i => { const g = el('g', {}, parent); lv[i] = g; return g; };
  // level 1: US-75 in a trench
  const g1 = L(1);
  el('path', { d: HF.us75, stroke: '#08080A', 'stroke-width': 210, fill: 'none' }, g1);
  road(g1, HF.us75, 170, { fill: LEVEL_COL[0], edge: '#2E2E34', center: false, dash: true });
  // level 2: frontage roads at street level, forming four everyday intersections
  const g2 = L(2);
  for (const d of [HF.frontH1, HF.frontH2]) road(g2, d, 74, { fill: LEVEL_COL[1], edge: '#3A3A41', center: false, dash: true });
  for (const d of [HF.frontV1, HF.frontV2]) road(g2, d, 74, { fill: LEVEL_COL[1], edge: '#3A3A41', center: false, dash: true });
  for (const [x, y] of [[-150, -150], [150, -150], [-150, 150], [150, 150]]) el('rect', { x: x - 37, y: y - 37, width: 74, height: 74, fill: LEVEL_COL[1] }, g2);
  // right-turn connectors (outer sweeping ramps), at street level
  for (const r of [0, 90, 180, 270]) { const rg = el('g', { transform: `rotate(${r})` }, g2); road(rg, 'M-1100 115 C-600 115 -420 260 -330 380 C-260 470 -230 600 -230 900', 50, { fill: LEVEL_COL[1], edge: '#3A3A41', center: false }); }
  // level 3: I-635
  const g3 = L(3);
  road(g3, HF.i635, 180, { fill: LEVEL_COL[2], edge: '#5A5A63', elev: 'elevS', centerDash: 'none' });
  // levels 4 and 5: four flyovers (two per level)
  const g4 = L(4), g5 = L(5);
  [0, 180].forEach(r => { const rg = el('g', { transform: `rotate(${r})` }, g4); road(rg, HF.ramp, 62, { fill: LEVEL_COL[3], edge: '#6C6C76', elev: 'elev', center: false }); });
  [90, 270].forEach(r => { const rg = el('g', { transform: `rotate(${r})` }, g5); road(rg, HF.ramp, 62, { fill: LEVEL_COL[4], edge: '#80808B', elev: 'elev', center: false }); });
  // pillars under the flyovers
  for (const r of [0, 90, 180, 270]) {
    const rg = el('g', { transform: `rotate(${r})` }, r % 180 === 0 ? g4 : g5);
    const tmp = el('path', { d: HF.ramp }, rg), Lr = tmp.getTotalLength();
    for (let k = 0.18; k < 0.95; k += 0.09) { const pt = tmp.getPointAtLength(Lr * k); el('rect', { x: pt.x - 7, y: pt.y - 7, width: 14, height: 14, rx: 3, fill: '#9A9AA5', opacity: 0.35 }, rg); }
    tmp.remove();
  }
  updaters.push(t => {
    for (let i = 1; i <= 5; i++) {
      const p = clamp(show(i, t));
      if (p <= 0.001) { lv[i].setAttribute('display', 'none'); continue; }
      lv[i].removeAttribute('display');
      // each level drops in from above: slightly bigger, then lands
      const sc = 1 + 0.12 * (1 - eOut(p));
      lv[i].setAttribute('transform', `scale(${sc.toFixed(4)})`);
      lv[i].setAttribute('opacity', eOut(Math.min(1, p * 1.6)).toFixed(3));
    }
  });
  return lv;
}
// traffic flowing on the High Five (loops forever)
function hfTraffic(parent, from, to) {
  const g = el('g', {}, parent);
  const paths = [
    ['M-1100 40 H1100', 260, 0], ['M1100 -40 H-1100', 240, 1], ['M-1100 40 H1100', 260, 2], ['M1100 -40 H-1100', 240, 3],
    ['M40 900 V-900', 200, 4], ['M-40 -900 V900', 220, 5],
    ['M-1100 -150 H1100', 120, 6], ['M150 900 V-900', 110, 1],
  ];
  paths.forEach(([d, sp, c], i) => car(g, d, [[0, 0]], { c, loop: { speed: sp, off: i * 530 }, from, to }));
  for (const r of [0, 90, 180, 270]) {
    const rg = el('g', { transform: `rotate(${r})` }, g);
    car(rg, HF.ramp, [[0, 0]], { c: r / 90 + 2, loop: { speed: 230, off: r * 7 }, from, to });
  }
  return g;
}
// level numbers popping on the High Five
function levelTags(parent, t0, t1, step = 0.22) {
  const spots = [[0, 560], [-150, 330], [520, 0], [-300, -330], [330, -230]]; // positions for levels 1..5
  const g = win(parent, t0, t1, 0.2, 0.3);
  spots.forEach(([x, y], i) => {
    const tg = el('g', {}, g);
    el('circle', { r: 64, fill: 'url(#tGold)', filter: 'url(#gGold)' }, tg);
    text(tg, { str: String(i + 1), size: 74, weight: 800, disp: true, fill: '#3A2608', y: 2 });
    updaters.push(t => { const p = prog(t, t0 + i * step, 0.3); tg.setAttribute('transform', `translate(${x},${y}) scale(${(eOut(p) + 0.3 * Math.sin(Math.PI * p)).toFixed(3)})`); });
  });
  return g;
}

/* ======================= SCENE 1 — HOOK ======================= */
{
  const t0 = 0, t1 = T.s2;
  const cam = [[0, 2.1, 0, 30], [1.6, 2.25, 0, 30], [2.2, 1.6, 0, 0, 'io'], [3.2, 0.42, 0, 0, 'io'], [t1, 0.36, 0, 0, 'out']];
  const S = scene(t0, t1, cam);
  // ordinary intersection, then it "folds up" into the stack
  const base = fader(S, t => 1 - eIO(prog(t, 2.0, 0.8)));
  road(base, 'M-900 0 H900', 140); road(base, 'M0 -900 V900', 140); junction(base);
  const c1 = car(S, 'M-700 35 H700', [[0, -40], [1.25, 610, 'out'], [2.0, 610]], { c: 0, to: 2.4 });
  const c2 = car(S, 'M35 700 V-700', [[0, 300], [1.25, 625, 'out'], [2.0, 625]], { c: 2, to: 2.4 });
  skid(S, 'M-160 35 H-90', 1.0, 0.25); skid(S, 'M35 160 V100', 1.0, 0.25);
  burst(S, 10, 20, 1.22, { r: 46, str: '!', size: 40, dur: 0.75 });
  const hf = el('g', {}, S);
  highFive(hf, (i, t) => prog(t, 2.0 + (i - 1) * 0.28, 0.45));
  hfTraffic(hf, 2.4, t1 + 0.5);
}

/* ======================= SCENE 2 — FOUR STOP SIGNS ======================= */
{
  const t0 = T.s2, t1 = T.s3;
  const S = scene(t0, t1, [[t0, 1.05, 0, 0], [T.ignores, 1.12, 0, 0], [T.ignores + 0.6, 1.5, 10, 20, 'out'], [t1, 1.5, 10, 20]]);
  road(S, 'M-900 0 H900', 140); road(S, 'M0 -900 V900', 140); junction(S);
  stopBar(S, 0, 78, 70, 78); stopBar(S, 0, -78, -70, -78); stopBar(S, -78, 0, -78, 70); stopBar(S, 78, 0, 78, -70);
  [[105, 105], [-105, -105], [-105, 105], [105, -105]].forEach(([x, y], i) => stopSign(S, x, y, T.four + i * 0.12, 1.4));
  // car A stops properly, then goes; car B rolls straight through
  const A = 'M35 700 V-700', B = 'M-900 35 H900';
  car(S, A, [[t0, 0], [T.four + 0.4, 590, 'out'], [T.except + 0.3, 590], [T.always + 0.15, 640, 'in'], [T.always + 0.45, 650, 'out'], [t1, 650]], { c: 1 });
  car(S, B, [[t0, -100], [T.except + 0.2, 300, 'lin'], [T.always + 0.45, 870, 'lin'], [T.always + 0.75, 900, 'out'], [t1, 900]], { c: 0 });
  skid(S, 'M-40 35 H10', T.always + 0.4, 0.3);
  burst(S, 25, 25, T.always + 0.5, { r: 70, str: 'HONK!', size: 26, dur: 1.4 });
}

/* ======================= SCENE 3 — TRAFFIC LIGHTS ======================= */
{
  const t0 = T.s3, t1 = T.s4;
  const S = scene(t0, t1, [[t0, 1.05, 0, 0], [T.mistake, 1.1, 0, 0], [T.boom - 0.2, 2.1, 30, 30, 'io'], [t1, 2.2, 30, 30]]);
  road(S, 'M-900 0 H900', 140); road(S, 'M0 -900 V900', 140); junction(S);
  stopBar(S, 0, 78, 70, 78); stopBar(S, 0, -78, -70, -78); stopBar(S, -78, 0, -78, 70); stopBar(S, 78, 0, 78, -70);
  const ns = t => (t < t0 + 0.6 ? 'r' : 'g'), ew = t => (t < t0 + 0.6 ? 'g' : 'r');
  signal(S, 110, 110, 0, ns, T.s3 + 0.3, 1.2); signal(S, -110, -110, 180, ns, T.s3 + 0.4, 1.2);
  signal(S, -110, 110, 90, ew, T.s3 + 0.5, 1.2); signal(S, 110, -110, 270, ew, T.s3 + 0.6, 1.2);
  // organised streams north-south
  for (let k = 0; k < 4; k++) {
    car(S, 'M35 800 V-800', [[t0 + k * 0.9, 0], [t0 + k * 0.9 + 3.2, 1600, 'lin']], { c: k + 2, to: t0 + k * 0.9 + 3.3 });
    car(S, 'M-35 -800 V800', [[t0 + 0.4 + k * 0.9, 0], [t0 + 0.4 + k * 0.9 + 3.2, 1600, 'lin']], { c: k + 4, to: t0 + 0.4 + k * 0.9 + 3.3 });
  }
  // the left turner (southbound turning left = east) meets an oncoming northbound car: BOOM
  const LT = 'M-35 -800 V-30 Q-35 35 30 35 H900';
  car(S, LT, [[T.leftTurning, 0], [T.mistake + 0.2, 700, 'out'], [T.boom - 0.05, 815, 'in'], [T.boom + 0.3, 830, 'out'], [t1, 830]], { c: 6 });
  car(S, 'M35 800 V-800', [[T.mistake, 300], [T.boom - 0.05, 745, 'lin'], [T.boom + 0.3, 770, 'out'], [t1, 770]], { c: 0,
    extra: t => ({ rot: 25 * eOut(prog(t, T.boom - 0.05, 0.3)) }) });
  burst(S, 40, 35, T.boom - 0.05, { r: 90, str: 'BOOM!', size: 34, dur: 1.2 });
}

/* ======================= SCENE 4 — THE GREEN ARROW ======================= */
{
  const t0 = T.s4, t1 = T.s5;
  const S = scene(t0, t1, [[t0, 1.05, 0, 0], [T.butNow, 1.05, 0, 0], [T.miles - 0.2, 0.34, 1500, -40, 'io'], [t1, 0.32, 1600, -40, 'lin']]);
  road(S, 'M-900 0 H5200', 140); road(S, 'M0 -900 V900', 140); junction(S);
  stopBar(S, 0, 78, 70, 78); stopBar(S, 0, -78, -70, -78); stopBar(S, -78, 0, -78, 70); stopBar(S, 78, 0, 78, -70);
  const arrowOn = t => (t >= T.protected - 0.1 && t < T.butNow ? 'a' : 'r');
  signal(S, -110, -110, 180, arrowOn, t0, 1.2); signal(S, 110, 110, 0, t => 'r', t0, 1.2);
  signal(S, 110, -110, 270, t => 'r', t0, 1.2); signal(S, -110, 110, 90, t => 'r', t0, 1.2);
  // big green arrow badge
  const ab = win(S, T.protected - 0.1, T.butNow, 0.25, 0.3);
  el('circle', { cx: -260, cy: -250, r: 70, fill: '#0F2A1C', stroke: '#3CE08A', 'stroke-width': 6 }, ab);
  el('path', { d: 'M-225 -240 H-285 M-285 -240 L-262 -263 M-285 -240 L-262 -217', fill: 'none', stroke: '#3CE08A', 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ab);
  // protected left turns pass safely, oncoming traffic waits at the line
  for (let k = 0; k < 3; k++) car(S, 'M-35 -800 V-30 Q-35 35 30 35 H5000', [[T.protected + k * 0.55, 0], [T.protected + k * 0.55 + 2.4, 1400, 'lin']], { c: k + 1, to: T.protected + k * 0.55 + 2.5 });
  car(S, 'M35 800 V-800', [[t0, 400], [T.protected, 700, 'out'], [t1, 700]], { c: 0 });
  // the queue on the westbound side grows and grows (cars arrive and stop bumper to bumper)
  const Q = 'M5200 -35 H-900', qStop = 5200 - 110 - 30;
  for (let k = 0; k < 70; k++) {
    const tArr = T.butNow + 0.05 * k + 0.15 * Math.sqrt(k), stopAt = qStop - k * 64;
    car(S, Q, [[t0, stopAt - 900 - 220 * k * 0], [tArr, stopAt, 'out'], [t1, stopAt]], { c: k, from: t0 });
  }
  const bk = win(S, T.miles - 0.2, t1 + 0.2, 0.4, 0.2);
  text(bk, { str: '…FOR MILES', x: 1900, y: -330, size: 210, weight: 900, disp: true, fill: 'url(#tRed)' });
}

/* ======================= SCENE 5 — THE DIAMOND ======================= */
{
  const t0 = T.s5, t1 = T.s6;
  const S = scene(t0, t1, [[t0, 0.95, 0, 0], [T.stillWaiting - 0.4, 0.95, 0, 0], [T.stillWaiting + 0.3, 2.3, -95, 165, 'io'], [t1, 2.4, -95, 165]]);
  // local road (north-south) stays on the ground
  road(S, 'M0 -900 V900', 120);
  // the freeway rises over it: shadow + scale
  const fw = el('g', {}, S);
  const fwShadow = el('rect', { x: -1100, y: -75, width: 2200, height: 150, fill: '#000', opacity: 0 }, fw);
  const fwRoad = el('g', {}, fw);
  road(fwRoad, 'M-1100 0 H1100', 150, { edge: '#5A5A63', fill: '#34343B' });
  updaters.push(t => {
    const p = eIO(prog(t, T.lifted - 0.2, 0.9));
    fwShadow.setAttribute('transform', `translate(${18 * p},${26 * p})`); fwShadow.setAttribute('opacity', (0.6 * p).toFixed(3));
    fwRoad.setAttribute('transform', `translate(0,${-10 * p}) scale(${1 + 0.03 * p})`);
  });
  // diamond ramps (drawn on)
  const ramps = ['M-560 70 L-60 170', 'M-560 -70 L-60 -170', 'M560 70 L60 170', 'M560 -70 L60 -170'];
  const rg = el('g', {}, S);
  ramps.forEach((d, i) => {
    const gg = el('g', {}, rg);
    road(gg, d, 54, { center: false });
    updaters.push(t => { const p = eOut(prog(t, T.diamond - 0.3 + i * 0.12, 0.5)); gg.setAttribute('opacity', p.toFixed(3)); });
  });
  // diamond outline glow to read the shape from above
  const dw = win(S, T.diamond - 0.1, T.stillWaiting - 0.3, 0.3, 0.3);
  el('path', { d: 'M-560 0 L0 -200 L560 0 L0 200 Z', fill: 'none', stroke: 'url(#tGold)', 'stroke-width': 6, 'stroke-dasharray': '20 14', filter: 'url(#gGold)' }, dw);
  // lights at the ramp terminals
  signal(S, -40, 230, 0, t => 'r', T.diamond, 0.9); signal(S, 40, -230, 180, t => 'r', T.diamond, 0.9);
  // freeway traffic flows; a car takes the off-ramp and has to stop at a red light (punchline)
  for (let k = 0; k < 5; k++) car(S, 'M-1100 35 H1100', [[0, 0]], { c: k, loop: { speed: 420, off: k * 440 }, from: T.lifted + 0.5, to: t1 + 0.5 });
  car(S, 'M-1100 70 H-560 L-95 163', [[T.diamond - 0.2, 0], [T.stillWaiting - 0.1, 1010, 'out'], [t1, 1010]], { c: 6 });
  car(S, 'M-1100 70 H-560 L-95 163', [[T.diamond + 0.4, 0], [T.stillWaiting + 0.4, 945, 'out'], [t1, 945]], { c: 3 });
}

/* ======================= SCENE 6 — THE CLOVERLEAF ======================= */
const LOOP = (cx, cy, r, dir = 1) => `M${cx - r} ${cy} A${r} ${r} 0 1 ${dir > 0 ? 1 : 0} ${cx + r} ${cy} A${r} ${r} 0 1 ${dir > 0 ? 1 : 0} ${cx - r} ${cy}`;
{
  const t0 = T.s6, t1 = T.s7 + 0.1;
  const S = scene(t0, t1, [[t0, 0.72, 0, 0], [T.until, 0.72, 0, 0], [T.until + 0.8, 1.35, 0, 150, 'io'], [T.s7, 1.35, 0, 150]]);
  road(S, 'M-1200 0 H1200', 140);
  road(S, 'M0 -900 V900', 140, { elev: 'elevS', fill: '#34343B', edge: '#5A5A63' });
  // collector lanes where loops join the road
  road(S, 'M-420 125 H420', 50, { center: false }); road(S, 'M-420 -125 H420', 50, { center: false });
  const loops = [[-215, -215], [215, -215], [-215, 215], [215, 215]];
  loops.forEach(([x, y], i) => {
    const gg = el('g', {}, S);
    road(gg, LOOP(x, y, 95), 46, { center: false });
    updaters.push(t => { const p = prog(t, T.loops - 0.15 + i * 0.12, 0.45); gg.setAttribute('transform', `translate(${x},${y}) scale(${eOut(p).toFixed(3)}) translate(${-x},${-y})`); gg.setAttribute('opacity', eOut(p).toFixed(3)); });
  });
  // smooth flow through the loops
  loops.forEach(([x, y], i) => car(S, LOOP(x, y, 95), [[0, 0]], { c: i + 1, loop: { speed: 260, off: i * 150 }, from: T.noLeft, to: t1 + 0.3 }));
  for (let k = 0; k < 4; k++) {
    car(S, 'M-1200 35 H1200', [[0, 0]], { c: k + 3, loop: { speed: 380, off: k * 600 }, from: T.clover, to: T.until + 0.3 });
    car(S, 'M35 900 V-900', [[0, 0]], { c: k, loop: { speed: 330, off: k * 450 }, from: T.clover, to: t1 + 0.3 });
  }
  // the weave: one car exits a loop while another enters, both want the same lane
  ring(S, 0, 125, 120, T.until + 0.4, T.s7, '#FF4D4D');
  car(S, 'M-420 125 H420', [[T.until, 0], [T.fighting, 380, 'out'], [T.fighting + 0.5, 390, 'out'], [t1, 390]], { c: 0 });
  car(S, 'M420 125 H-420', [[T.until + 0.2, 0], [T.fighting, 410, 'out'], [T.fighting + 0.5, 420, 'out'], [t1, 420]], { c: 2 });
  burst(S, 0, 60, T.fighting + 0.05, { r: 62, str: 'HONK!', size: 22, dur: 1.2 });
}

/* ======================= SCENE 7 — THE TRUCK PROBLEM ======================= */
{
  const t0 = T.s7, t1 = T.s8;
  const S = scene(t0, t1, [[t0, 1.9, 215, 215], [T.tip, 2.1, 215, 215], [t1 - 0.4, 1.0, 215, 215, 'io'], [t1, 0.9, 215, 215]]);
  road(S, 'M-1200 0 H1200', 140); road(S, 'M0 -900 V900', 140, { elev: 'elevS', fill: '#34343B', edge: '#5A5A63' });
  // the tight loop, then the curve widens
  const lg = el('g', {}, S);
  road(lg, LOOP(215, 215, 95), 46, { center: false });
  const wide = win(S, T.tip + 0.6, t1 + 0.3, 0.6, 0.2);
  road(wide, `M-200 120 C 200 140 520 300 560 700`, 70, { center: false });
  updaters.push(t => lg.setAttribute('opacity', (1 - eIO(prog(t, T.tip + 0.6, 0.6))).toFixed(3)));
  const tipP = t => eOut(prog(t, T.tip - 0.1, 0.5));
  car(S, LOOP(215, 215, 95), [[t0, 0], [T.tip, 420, 'lin'], [T.tip + 0.4, 470, 'out'], [t1, 470]], { truck: true, c: 0,
    extra: t => ({ rot: 8 * Math.sin(t * 30) * tipP(t) * (1 - prog(t, T.tip + 0.5, 0.3)), sx: 1, sy: 1 - 0.45 * tipP(t), dy: 0, dx: 0 }) });
  // warning sign
  const wg = win(S, T.truck + 0.3, t1 - 0.2, 0.2, 0.3);
  el('path', { d: 'M215 40 L265 125 H165 Z', fill: 'url(#tRed)', stroke: '#FFFFFF', 'stroke-width': 5, 'stroke-linejoin': 'round', filter: 'url(#gRed)' }, wg);
  text(wg, { str: '!', x: 215, y: 98, size: 52, weight: 900, fill: '#FFFFFF' });
  burst(S, 300, 250, T.tip + 0.1, { r: 50, str: 'SCREECH', size: 15, dur: 1.0, rot: 10 });
}

/* ======================= SCENE 8 — BUILDING THE MONSTER ======================= */
{
  const t0 = T.s8, t1 = T.s9;
  const S = scene(t0, t1, [[t0, 0.55, 0, 0], [T.stack, 0.6, 0, 0], [T.this - 0.1, 0.62, 0, 0], [T.this + 0.5, 0.4, 0, 0, 'out'], [t1, 0.38, 0, 0]]);
  // first: separate direct ramps, wider curves, tilted (banked) roads — drawn as the pinwheel ramps, then stacked
  const beats = [T.stack, T.stack + 0.32, T.stack + 0.64, T.stack + 0.96, T.this - 0.25];
  highFive(S, (i, t) => {
    if (i >= 4) return prog(t, i === 4 ? T.separate : T.widened, 0.5); // ramps appear first (separate, then widened)
    return prog(t, beats[i - 1], 0.35);
  });
  // banking cue on a ramp: tilted road gets a light/shade split
  const bank = win(S, T.tilted - 0.1, T.stack + 0.2, 0.3, 0.3);
  const bg2 = el('g', { transform: 'rotate(0)' }, bank);
  el('path', { d: HF.ramp, fill: 'none', stroke: '#8E8E9A', 'stroke-width': 26, opacity: 0.55, transform: 'translate(-14,-10)' }, bg2);
  el('path', { d: HF.ramp, fill: 'none', stroke: 'url(#tGold)', 'stroke-width': 8, 'stroke-dasharray': '24 18', filter: 'url(#gGold)' }, bg2);
  // impact flash on "THIS"
  const fl = fader(S, t => (t > T.this - 0.05 ? Math.max(0, 1 - (t - T.this + 0.05) / 0.35) : 0) * 0.3);
  el('rect', { x: -4000, y: -4000, width: 8000, height: 8000, fill: '#FFF6D8' }, fl);
  hfTraffic(S, T.this, t1 + 0.4);
}

/* ======================= SCENE 9 — THE REVEAL ======================= */
{
  const t0 = T.s9, t1 = T.s10;
  const S = scene(t0, t1, [[t0, 0.4, 0, 0], [T.under - 0.2, 0.42, 0, 0], [T.regular - 0.1, 2.6, 150, 150, 'io'], [t1, 2.7, 150, 150]]);
  highFive(S, () => 1);
  hfTraffic(S, t0 - 0.5, t1 + 0.5);
  levelTags(S, T.highFive, T.under, 0.2);
  // the everyday intersection under it all: a light, a car waiting, and a little taco truck easter egg
  signal(S, 205, 205, 0, t => 'r', T.regular - 0.3, 0.8);
  car(S, 'M150 600 V-600', [[t0, 330], [T.regular, 400, 'out'], [t1, 400]], { c: 1 });
  const taco = win(S, T.regular, t1 + 0.3, 0.3, 0.2);
  const tg = el('g', { transform: 'translate(95,250)' }, taco);
  el('rect', { x: -30, y: -16, width: 60, height: 32, rx: 6, fill: '#FFB36B' }, tg);
  text(tg, { str: 'TACOS', size: 12, weight: 900, fill: '#3A2608', y: 1 });
}

/* ======================= SCENE 10 — COMMENT PROMPT ======================= */
{
  const t0 = T.s10, t1 = DURATION + 1;
  const S = scene(t0, t1, [[t0, 0.45, 0, 0], [t1, 0.4, 0, 0, 'lin']]);
  highFive(S, () => 1);
  hfTraffic(S, t0 - 0.5, t1);
  levelTags(S, T.s10 + 0.2, t1, 0.15);
  // big "6?" over the structure
  const six = win(S, T.six - 0.1, T.six + 0.9, 0.12, 0.25);
  text(six, { str: '6?', y: 20, size: 520, weight: 900, disp: true, fill: 'url(#tGold)' });
}

/* ======================= THE HERO ======================= */
const HX = 305;
el('line', { x1: 110, y1: GROUND_Y + 2, x2: 470, y2: GROUND_Y + 2, stroke: INK, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.85 });
const HERO = makeNoodle(root, [
  [0.0, { pose: 'stand', x: HX, y: GROUND_Y, s: 0.82, alpha: 1, look: 0.6 }, 0.2],
  [1.15, { pose: 'shout', look: 0.7, eyes: 1.2 }, 0.2],            // near miss!
  [2.2, { pose: 'happy', look: 0.5, mouthOpen: 1 }, 0.45],          // wow
  [3.6, { pose: 'proud', mouth: 1 }, 0.4],                          // FIVE levels
  [T.s2, { pose: 'wave', look: 0.4 }, 0.4],                         // it started with...
  [T.four, { pose: 'point', look: 0.7 }, 0.4],                      // four stop signs
  [T.except, { pose: 'shrug', look: 0.3 }, 0.35],                   // except...
  [T.always + 0.4, { pose: 'shout' }, 0.2],                         // honk
  [T.s3 + 0.2, { pose: 'point', look: 0.7, mouth: 0.6 }, 0.4],      // lights
  [T.leftTurning, { pose: 'think', look: 0.6 }, 0.4],               // hmm
  [T.mistake, { pose: 'hugSelf', look: 0.6 }, 0.3],                 // one mistake...
  [T.boom - 0.1, { pose: 'shout', squash: -0.08, tilt: -6 }, 0.12],  // BOOM
  [T.boom + 0.7, { pose: 'sad', look: 0.4 }, 0.5],
  [T.protected - 0.2, { pose: 'happy', look: 0.5 }, 0.4],           // protected left: yay
  [T.safer, { pose: 'proud' }, 0.35],
  [T.butNow, { pose: 'sad', look: 0.6 }, 0.4],                      // waiting...
  [T.wait + 0.3, { pose: 'sitLedge', look: 0.6, eyes: 0.5 }, 0.6],  // sits down, bored
  [T.miles - 0.1, { pose: 'shout', look: 0.7 }, 0.25],              // MILES
  [T.s5 + 0.2, { pose: 'stand', look: 0.5, mouth: 0.6 }, 0.4],
  [T.lifted, { pose: 'proud', look: 0.5 }, 0.4],                    // lifted it!
  [T.diamond, { pose: 'point', look: 0.7 }, 0.35],
  [T.stillWaiting - 0.7, { pose: 'shrug', mouth: -0.4 }, 0.35],     // sarcastic
  [T.clover - 0.2, { pose: 'happy', mouthOpen: 1 }, 0.35],          // cloverleaf!
  [T.solved, { pose: 'proud' }, 0.35],                              // problem solved
  [T.until, { pose: 'think', look: 0.6 }, 0.4],                     // until...
  [T.fighting, { pose: 'shout' }, 0.2],
  [T.s7, { pose: 'think', look: 0.6, eyes: 0.8 }, 0.35],
  [T.truck, { pose: 'hugSelf', look: 0.6, eyes: 1.3 }, 0.3],        // scared for the truck
  [T.tip, { pose: 'shout', tilt: 8 }, 0.2],
  [T.s8, { pose: 'point', look: 0.7, mouth: 0.8 }, 0.35],           // building
  [T.stack, { pose: 'wave', look: 0.6 }, 0.25],
  [T.stack + 0.5, { pose: 'happy', look: 0.6 }, 0.25],
  [T.this - 0.15, { pose: 'happy', squash: 0.1, mouthOpen: 1, y: GROUND_Y - 60 }, 0.18], // jumps on THIS
  [T.this + 0.25, { y: GROUND_Y, squash: -0.06 }, 0.25],
  [T.this + 0.6, { pose: 'proud', squash: 0 }, 0.3],
  [T.under - 0.1, { pose: 'think', look: 0.5, mouth: 0.3, eyes: 0.8 }, 0.4], // whisper
  [T.regular, { pose: 'point', look: 0.7 }, 0.35],
  [T.s10, { pose: 'think', look: 0.6, brow: 0.6 }, 0.35],           // wait...
  [T.six - 0.1, { pose: 'shrug', brow: 0.8, mouth: 0.2 }, 0.3],
  [T.count, { pose: 'point', look: 0.4, mouth: 0.9 }, 0.35],
  [T.count + 0.8, { pose: 'wave', mouth: 1 }, 0.4],
], { hero: true, start: { x: HX, y: GROUND_Y, s: 0.82 } });
// props that follow the hero
{
  // a little stop sign in his hand while he explains the 4-way stop
  const sw = win(root, T.four, T.except - 0.1, 0.25, 0.25);
  const sg = el('g', {}, sw);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -70, stroke: '#B5B8BF', 'stroke-width': 6 }, sg);
  const oct = Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + i * Math.PI / 4; return `${(34 * Math.cos(a)).toFixed(1)} ${(-100 + 34 * Math.sin(a)).toFixed(1)}`; });
  el('path', { d: 'M' + oct.join(' L') + ' Z', fill: '#E5484D', stroke: '#FFF', 'stroke-width': 4 }, sg);
  text(sg, { str: 'STOP', y: -99, size: 17, weight: 900, fill: '#FFF' });
  updaters.push(t => sg.setAttribute('transform', `translate(${HERO.hand[0].toFixed(1)},${(HERO.hand[1] + 8).toFixed(1)}) rotate(${(6 * Math.sin(t * 3)).toFixed(1)})`));
  // "zzz" while stuck in traffic
  const zw = win(root, T.wait + 0.5, T.miles - 0.15, 0.3, 0.2);
  ['z', 'z', 'Z'].forEach((s, i) => {
    const z = text(zw, { str: s, size: 34 + i * 10, weight: 800, fill: '#F4F4F5' });
    updaters.push(t => { const ph = ((t * 0.7 + i / 3) % 1); z.setAttribute('transform', `translate(${(HERO.head[0] + 90 + ph * 50).toFixed(1)},${(HERO.head[1] - 90 - ph * 90).toFixed(1)})`); z.setAttribute('opacity', (Math.sin(Math.PI * ph)).toFixed(2)); });
  });
  // sweat drops when the truck leans
  const dw = win(root, T.truck, T.s8, 0.2, 0.3);
  [0, 1].forEach(i => {
    const d = el('path', { d: 'M0 -14 Q10 0 0 8 Q-10 0 0 -14 Z', fill: '#6EC1FF' }, dw);
    updaters.push(t => { const ph = (t * 1.4 + i * 0.5) % 1; d.setAttribute('transform', `translate(${(HERO.head[0] + (i ? 125 : -125)).toFixed(1)},${(HERO.head[1] - 60 + ph * 70).toFixed(1)}) scale(1.3)`); d.setAttribute('opacity', (1 - ph).toFixed(2)); });
  });
  // hard hat while building the monster
  const hw = win(root, T.s8 - 0.1, T.s9, 0.25, 0.3);
  const hh = el('g', {}, hw);
  el('path', { d: 'M-95 0 Q-95 -75 0 -78 Q95 -75 95 0 Z', fill: '#FFC93C', stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, hh);
  el('rect', { x: -120, y: -6, width: 240, height: 18, rx: 9, fill: '#FFC93C', stroke: INK, 'stroke-width': 7 }, hh);
  el('path', { d: 'M0 -78 V-8', stroke: INK, 'stroke-width': 6 }, hh);
  updaters.push(t => hh.setAttribute('transform', `translate(${HERO.head[0].toFixed(1)},${(HERO.head[1] - 118 * 0.82 + 30).toFixed(1)}) scale(0.82)`));
  // "shh" finger near the mouth when he whispers about the hidden intersection
  const shw = win(root, T.under, T.regular - 0.1, 0.2, 0.2);
  text(shw, { str: 'shh…', x: HX + 150, y: 520, size: 38, weight: 700, fill: '#8A8C93' });
}

/* ======================= ON-SCREEN TEXT (storyboard) ======================= */
function onScreen(str, t0, t1, o = {}) {
  const g = item({ x: MX, y: 150, t0, t1, fi: 0.22, fo: 0.25, rise: 14, s0: 0.82, filter: o.glow }, LAB);
  const tx = text(g, { str, size: o.size ?? 62, weight: 900, disp: true, fill: o.fill ?? TH.text, ls: o.ls ?? 1 });
  return tx;
}
const G_ = 'url(#tGold)', R_ = 'url(#tRed)', V_ = 'url(#tGreen)';
onScreen('ONE INTERSECTION.', 0.25, 2.0);
onScreen('FIVE LEVELS.', 2.3, T.s2 - 0.1, { fill: G_, glow: 'gGold', size: 76 });
onScreen('SOMEONE ALWAYS IGNORES IT.', T.except, T.s3 - 0.1, { size: 54 });
onScreen('LEFT TURN = CRASH', T.leftTurning + 0.3, T.s4 - 0.1, { fill: R_, glow: 'gRed' });
onScreen('SAFER.', T.safer - 0.1, T.butNow - 0.05, { fill: V_, glow: 'gGreen' });
onScreen('BUT SLOWER.', T.butNow, T.s5 - 0.1, { fill: R_, glow: 'gRed' });
onScreen('DIAMOND INTERCHANGE', T.diamond - 0.1, T.s6 - 0.1, { size: 56 });
onScreen('NO STOPPING.', T.noLeft - 0.1, T.until - 0.05, { fill: V_, glow: 'gGreen' });
onScreen('MORE MERGING.', T.until, T.s7 - 0.1, { fill: R_, glow: 'gRed' });
onScreen('TOO TIGHT. TOO DANGEROUS.', T.truck - 0.2, T.s8 - 0.1, { fill: R_, glow: 'gRed', size: 54 });
onScreen('THE HIGH FIVE', T.this - 0.05, T.under - 0.1, { fill: G_, glow: 'gGold', size: 84, ls: 4 });
onScreen('ONE NORMAL INTERSECTION.', T.under + 0.1, T.s10 - 0.1, { size: 54 });
onScreen('5 OR 6 LEVELS?', T.six + 0.9, DURATION + 1, { fill: G_, glow: 'gGold', size: 80 });
label({ str: 'COUNT THEM BELOW ↓', x: MX, y: MY + 330, t0: T.count, t1: DURATION + 1, size: 44, ls: 8, weight: 800, fill: TH.text, parent: LAB });

/* ======================= KARAOKE SUBTITLES (top) ======================= */
{
  const chunks = []; let cur = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const len = cur.map(x => x[0]).join(' ').length, end = /[.,?!…]$/.test(w[0]);
    if ((end && cur.length >= 2) || cur.length >= 6 || len > 34 || i === WORDS.length - 1) { chunks.push(cur); cur = []; }
  });
  const KEY = /^(boom|five|miles|diamond|cloverleaf|truck|this|high|six|stop|lights|loops)$/i;
  const lines = chunks.map((c, ci) => {
    const t0 = c[0][1] - 0.05, t1 = ci + 1 < chunks.length ? chunks[ci + 1][0][1] - 0.05 : c[c.length - 1][2] + 1.2;
    const tx = el('text', { x: MX, y: 64, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': 46, 'font-weight': 700 }, SUB);
    const spans = c.map(([w, ws]) => { const sp = document.createElementNS(NS, 'tspan'); sp.textContent = w + ' '; tx.appendChild(sp); return [sp, ws, KEY.test(norm(w))]; });
    return { tx, t0, t1, spans };
  });
  updaters.push(t => {
    for (const L of lines) {
      if (t < L.t0 || t >= L.t1) { L.tx.setAttribute('display', 'none'); continue; }
      L.tx.removeAttribute('display');
      L.tx.setAttribute('opacity', Math.min(1, (t - L.t0) / 0.08).toFixed(2));
      for (const [sp, ws, key] of L.spans) sp.setAttribute('fill', t >= ws - 0.02 ? (key ? TH.gold[1] : TH.text) : TH.muted);
    }
  });
}
// keep labels and subtitles on top
root.appendChild(LAB); root.appendChild(SUB);
