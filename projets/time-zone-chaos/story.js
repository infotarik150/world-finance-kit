// "Time Zone Chaos" — horizontal 1920x1080, black theme, tilted 3D-style map of North America.
// Facts checked for Nov 2026: BC on permanent UTC-7 since Mar 8 2026, Alberta on permanent UTC-6 since Nov 1 2026,
// US states still change clocks; Arizona and Saskatchewan do not change.
window.DURATION = 73.6;

/* ---------------- timing from the voice ---------------- */
const norm = s => s.toLowerCase().replace(/[^a-z0-9']/g, '').replace(/'/g, '');
function at(word, after = 0) {
  for (const w of WORDS) if (w[1] >= after - 0.01 && norm(w[0]) === norm(word)) return w[1];
  console.warn('word not found', word, after); return after;
}
const T = {};
T.before = at('before'); T.how = at('how'); T.s2 = at('normally') - 0.35; T.east = at('east'); T.forward = at('forward', T.s2); T.west = at('west'); T.backward = at('backward');
T.s3 = at('but', 13) - 0.3; T.changes = at('changes'); T.really = at('really'); T.some = at('some', 17); T.others = at('others');
T.s4 = at('now', 21) - 0.3; T.thisA = at('this', 21); T.calgary = at('calgary'); T.destin = at('destin'); T.far = at('far'); T.date = at('date'); T.same = at('same', T.date);
T.s5 = at('heres') - 0.4; T.vancouver = at('vancouver'); T.seattle = at('seattle'); T.yet = at('yet'); T.winter = at('winter'); T.hour = at('hour', 37);
T.s6 = at('imagine', 39) - 0.3; T.three = at('three'); T.five = at('five', 42); T.isThat = at('is', 44); T.timeTravel = at('time', 46.5); T.travel2 = at('travel', 47);
T.s7 = at('the', 48) - 0.3; T.culprit = at('culprit'); T.policies = at('policies'); T.boundaries = at('boundaries'); T.lines = at('lines');
T.s8 = at('one', 55) - 0.3; T.suddenly = at('suddenly'); T.where = at('where', 60);
T.s9 = at('then', 61) - 0.3; T.spring = at('spring'); T.jump = at('jump'); T.lineUp = at('line', 67);
T.s10 = at('should') - 0.4; T.stop = at('stop', 68); T.yes = at('yes', 70); T.cta = 72.0;

/* ---------------- helpers ---------------- */
const defs = document.querySelector('#s defs');
const def = (tag, a) => el(tag, a, defs);
for (const id of ['gRed', 'gGold', 'gGreen', 'gSoft']) { const f = document.getElementById(id); if (f) { f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('x', -4000); f.setAttribute('y', -4000); f.setAttribute('width', 8000); f.setAttribute('height', 8000); } }
function fader(parent, fn) {
  const g = el('g', {}, parent);
  updaters.push(t => { const a = fn(t); if (a <= 0.001) g.setAttribute('display', 'none'); else { g.removeAttribute('display'); g.setAttribute('opacity', a.toFixed(3)); } });
  return g;
}
const win = (parent, t0, t1, fi = 0.3, fo = 0.3) => fader(parent, t => Math.min(eOut(prog(t, t0, fi)), 1 - eIn(prog(t, t1, fo))));
const EASE = { lin: x => x, io: eIO, out: eOut, in: eIn };
function kfe(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [a, va] = keys[i - 1], [b, vb, e = 'io'] = keys[i]; return va + (vb - va) * EASE[e]((t - a) / (b - a)); }
  return keys[keys.length - 1][1];
}
const pop = (t, t0, d = 0.35) => { const p = prog(t, t0, d); return p <= 0 ? 0 : eOut(p) + 0.25 * Math.sin(Math.PI * p); };
const ZC = { pt: '#6EC1FF', mt: '#6EE7B7', ct: '#FFB36B', et: '#FF9BC2', at: '#C4A7FF' };
const fmtTime = m => { m = ((Math.round(m) % 1440) + 1440) % 1440; let h = Math.floor(m / 60), mi = m % 60; const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${String(mi).padStart(2, '0')} ${ap}`; };

/* ---------------- the map (tilted plane with thickness) ---------------- */
const MAPLAYER = el('g', {}), OVER = el('g', {}), LAB = el('g', {}), SUB = el('g', {});
const TILT = 0.78, MCY = 600;
const camKeys = { s: [[0, 3.2]], x: [[0, 955]], y: [[0, 700]] };
function camTo(t, s, x, y, e = 'io') { camKeys.s.push([t, s, e]); camKeys.x.push([t, x, e]); camKeys.y.push([t, y, e]); }
const cam = { s: 1, x: 750, y: 450 };
const mapAlpha = [[0, 0]];
const mapG = fader(MAPLAYER, t => kfe(t, mapAlpha));
const plane = el('g', {}, mapG);
updaters.push(t => {
  cam.s = kfe(t, camKeys.s); cam.x = kfe(t, camKeys.x); cam.y = kfe(t, camKeys.y);
  plane.setAttribute('transform', `translate(${CX},${MCY}) scale(${cam.s.toFixed(4)}) scale(1,${TILT}) translate(${(-cam.x).toFixed(2)},${(-cam.y).toFixed(2)})`);
});
const toScreen = (x, y) => [CX + cam.s * (x - cam.x), MCY + cam.s * TILT * (y - cam.y)];
const landD = Object.values(LAND).join(' ');
const lc = def('clipPath', { id: 'landClip' }); el('path', { d: landD }, lc);
// thickness (3D slab)
for (let k = 6; k >= 1; k--) el('path', { d: landD, fill: k === 6 ? '#000' : '#0B0B0E', transform: `translate(0,${k * 4})`, opacity: 0.9 }, plane);
el('path', { d: landD, fill: '#1C1D22', stroke: '#45464E', 'stroke-width': 1.6 }, plane);
// time-zone bands, each a separate "puzzle piece"
const bandG = {};
for (const k of ['pt', 'mt', 'ct', 'et', 'at']) {
  const g = el('g', {}, plane); bandG[k] = g;
  const inner = el('g', { 'clip-path': 'url(#landClip)' }, g);
  el('path', { d: TZBAND[k], fill: ZC[k], opacity: k === 'at' ? 0.16 : 0.26 }, inner);
}
el('path', { d: STATES, fill: 'none', stroke: '#0E0E11', 'stroke-width': 1.2, opacity: 0.8 }, plane);
const lineG = el('g', { 'clip-path': 'url(#landClip)' }, plane);
const tzLines = {};
for (const k in TZLINE) tzLines[k] = el('path', { d: TZLINE[k], fill: 'none', stroke: '#F4F4F5', 'stroke-width': 2.4, 'stroke-dasharray': '10 8', opacity: 0.55 }, lineG);
// zone names on the map
const zoneLab = fader(plane, t => Math.min(eOut(prog(t, T.s2 + 0.2, 0.5)), 1 - eIn(prog(t, T.s4 - 0.2, 0.3))) + Math.min(eOut(prog(t, T.s9, 0.5)), 1 - eIn(prog(t, T.s10 - 0.2, 0.3))));
[['PACIFIC', 285, 520, 'pt'], ['MOUNTAIN', 520, 470, 'mt'], ['CENTRAL', 760, 640, 'ct'], ['EASTERN', 1035, 600, 'et']].forEach(([s, x, y, k]) =>
  text(zoneLab, { str: s, x, y, size: 30, weight: 800, ls: 6, fill: ZC[k] }));

/* ---------------- clocks ---------------- */
// clock floating above a point: pos(t) -> [x,y] screen; minutes(t); col
function clock(o) {
  const g = el('g', {}, o.parent ?? OVER);
  const R = o.r ?? 56, col = o.col ?? '#F4F4F5';
  el('ellipse', { cx: 0, cy: R + 18, rx: R * 0.8, ry: R * 0.18, fill: '#000', opacity: 0.5 }, g);
  el('circle', { r: R + 6, fill: col, opacity: 0.18, filter: 'url(#gSoft)' }, g);
  el('circle', { r: R, fill: '#121216', stroke: col, 'stroke-width': Math.max(3, R * 0.08) }, g);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; el('line', { x1: Math.sin(a) * R * 0.78, y1: -Math.cos(a) * R * 0.78, x2: Math.sin(a) * R * (i % 3 ? 0.86 : 0.7), y2: -Math.cos(a) * R * (i % 3 ? 0.86 : 0.7), stroke: '#8A8C93', 'stroke-width': i % 3 ? 2 : 4, 'stroke-linecap': 'round' }, g); }
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -R * 0.5, stroke: '#F4F4F5', 'stroke-width': Math.max(4, R * 0.09), 'stroke-linecap': 'round' }, g);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -R * 0.75, stroke: col, 'stroke-width': Math.max(3, R * 0.06), 'stroke-linecap': 'round' }, g);
  const sh = o.seconds ? el('line', { x1: 0, y1: R * 0.15, x2: 0, y2: -R * 0.8, stroke: '#FF4D4D', 'stroke-width': 2 }, g) : null;
  el('circle', { r: Math.max(4, R * 0.08), fill: col }, g);
  const dig = o.digital === false ? null : text(g, { str: '', y: R + 40, size: Math.max(22, R * 0.42), weight: 800, disp: true, fill: col });
  const lab = o.label ? text(g, { str: o.label, y: -R - 26, size: Math.max(18, R * 0.3), weight: 800, ls: 4, fill: '#F4F4F5' }) : null;
  const tag = o.tag ? el('g', {}, g) : null;
  if (tag) { { const tw = Math.max(160, o.tag.length * 15 + 40); el('rect', { x: -tw / 2, y: R + 66, width: tw, height: 36, rx: 18, fill: o.tagCol ?? '#E5484D' }, tag); } text(tag, { str: o.tag, y: R + 85, size: 18, weight: 900, ls: 3, fill: '#0D0D10' }); }
  updaters.push(t => {
    const a = o.alpha ? o.alpha(t) : Math.min(pop(t, o.t0), 1 - eIn(prog(t, o.t1, 0.3)));
    if (a <= 0.001 || t < o.t0) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    const [x, y] = o.pos(t), m = o.minutes(t), sc = o.scale ? o.scale(t) : 1;
    g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(Math.min(a, 1.2) * sc).toFixed(3)})`);
    g.setAttribute('opacity', Math.min(1, a).toFixed(3));
    hh.setAttribute('transform', `rotate(${((m / 60) % 12) * 30})`); mh.setAttribute('transform', `rotate(${(m % 60) * 6})`);
    if (sh) sh.setAttribute('transform', `rotate(${Math.floor(t * 2) * 6})`);
    if (dig) dig.textContent = o.text ? o.text(t) : fmtTime(m);
    if (tag) tag.setAttribute('opacity', o.tagOn ? o.tagOn(t) : 1);
  });
  return g;
}
const mapPos = (x, y, dy = -90) => () => { const [a, b] = toScreen(x, y); return [a, b + dy]; };
// city pin (screen space, follows map)
function pin(x, y, t0, t1, col, label) {
  const g = el('g', {}, OVER);
  const ring = el('circle', { r: 16, fill: 'none', stroke: col, 'stroke-width': 3 }, g);
  el('path', { d: 'M0 0 C-14 -18 -16 -30 0 -40 C16 -30 14 -18 0 0 Z', fill: col, stroke: '#0D0D10', 'stroke-width': 3 }, g);
  el('circle', { cy: -27, r: 5.5, fill: '#0D0D10' }, g);
  if (label) text(g, { str: label, y: 26, size: 22, weight: 800, ls: 2, fill: '#F4F4F5' });
  updaters.push(t => {
    const a = Math.min(pop(t, t0, 0.4), 1 - eIn(prog(t, t1, 0.3)));
    if (a <= 0.001) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    const [sx, sy] = toScreen(x, y);
    g.setAttribute('transform', `translate(${sx.toFixed(1)},${sy.toFixed(1)}) scale(${a.toFixed(3)})`);
    const ph = ((t - t0) % 1.2) / 1.2; ring.setAttribute('r', (10 + 30 * ph).toFixed(1)); ring.setAttribute('opacity', (1 - ph).toFixed(2));
  });
  return g;
}
// small car (screen-space, top view)
function carShape(parent, col) {
  const g = el('g', {}, parent);
  el('rect', { x: -22, y: -12, width: 44, height: 24, rx: 8, fill: col }, g);
  el('rect', { x: 6, y: -8, width: 7, height: 16, rx: 2, fill: '#1B2230' }, g);
  el('rect', { x: -16, y: -8, width: 5, height: 16, rx: 2, fill: '#1B2230' }, g);
  for (const yy of [-8, 8]) el('circle', { cx: 21, cy: yy, r: 2.6, fill: '#FFF6D8' }, g);
  return g;
}
// big card text (on-screen storyboard text)
function onScreen(str, t0, t1, o = {}) {
  const g = item({ x: o.x ?? CX, y: o.y ?? 150, t0, t1, fi: 0.22, fo: 0.25, rise: 14, s0: 0.82, filter: o.glow }, LAB);
  text(g, { str, size: o.size ?? 62, weight: 900, disp: true, fill: o.fill ?? TH.text, ls: o.ls ?? 1 });
  return g;
}
const G_ = 'url(#tGold)', R_ = 'url(#tRed)', V_ = 'url(#tGreen)';

/* ======================= 1 · HOOK ======================= */
{
  // the big glowing clock: ticks to 1:00 PM, then becomes the "LEAVE" clock
  const t0 = 0;
  clock({ t0: 0, t1: T.s2 - 0.2, r: 150, seconds: true, col: '#F6D27A', label: 'LEAVE', parent: OVER,
    pos: t => [kfe(t, [[0, CX], [2.2, CX], [2.9, 1400, 'io']]), kfe(t, [[0, 600], [2.2, 600], [2.9, 420, 'io']])],
    scale: t => kfe(t, [[0, 1.25], [2.2, 1.25], [2.9, 0.75, 'io']]),
    minutes: t => 13 * 60 + 0 * t, text: () => '1:00 PM · EASTERN' });
  // map fades in zoomed on the Eastern/Central line
  mapAlpha.push([2.0, 0], [2.7, 1, 'out']);
  camTo(2.0, 3.6, 955, 690); camTo(T.how - 0.2, 3.4, 955, 690, 'lin');
  // a car drives 30 minutes west across the time-zone line
  const cg = el('g', {}, OVER);
  const car = carShape(cg, '#FF7A6B');
  const trail = el('line', { stroke: '#FF7A6B', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.5 }, cg);
  updaters.push(t => {
    const p = eIO(prog(t, 2.4, 1.6));
    if (t < 2.4 || t > T.s2) { cg.setAttribute('display', 'none'); return; } cg.removeAttribute('display');
    const [x0, y0] = toScreen(985, 682), [x1, y1] = toScreen(925, 698);
    const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p;
    car.setAttribute('transform', `translate(${x},${y}) rotate(${180 + Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI - 180}) scale(1.6) rotate(180)`);
    trail.setAttribute('x1', x0); trail.setAttribute('y1', y0); trail.setAttribute('x2', x); trail.setAttribute('y2', y);
  });
  // arrival clock: hands snap BACKWARD on "before"
  clock({ t0: 3.0, t1: T.s2 - 0.2, r: 120, col: '#6EE7B7', label: 'ARRIVE', parent: OVER, pos: () => [660, 420],
    minutes: t => kfe(t, [[3.0, 13 * 60 + 30], [T.before + 0.1, 13 * 60 + 30], [T.before + 0.6, 12 * 60 + 30, 'out']]),
    text: t => (t < T.before + 0.35 ? '1:30 PM' : '12:30 PM') + ' · CENTRAL' });
  const dl = win(OVER, 3.2, T.s2 - 0.2, 0.3, 0.3);
  text(dl, { str: '30-MIN DRIVE WEST', x: CX, y: 880, size: 26, weight: 800, ls: 6, fill: '#8A8C93' });
  // freeze flash on HOW
  const fl = fader(OVER, t => (t > T.how - 0.05 ? Math.max(0, 1 - (t - T.how + 0.05) / 0.35) : 0) * 0.35);
  el('rect', { x: 0, y: 0, width: W, height: H, fill: '#FFFFFF' }, fl);
  onScreen('ARRIVE BEFORE YOU LEAVE?!', T.before - 0.1, T.s2 - 0.2, { fill: G_, glow: 'gGold', size: 66 });
}

/* ======================= 2 · THE NORMAL SYSTEM ======================= */
{
  camTo(T.s2 - 0.1, 0.92, 720, 520); camTo(T.s3, 0.92, 720, 520);
  // route LA -> Denver -> Chicago -> New York, and back
  const route = [[296, 653], [569, 561], [880, 504], [1124, 481]];
  const rp = el('path', { d: 'M' + route.map(p => p.join(' ')).join(' L'), fill: 'none', stroke: '#F6D27A', 'stroke-width': 6, 'stroke-dasharray': '14 10', 'stroke-linecap': 'round', pathLength: 1 }, plane);
  updaters.push(t => { rp.setAttribute('opacity', Math.min(eOut(prog(t, T.s2 + 0.3, 0.4)), 1 - eIn(prog(t, T.s3 - 0.3, 0.3))).toFixed(2)); });
  const L = rp.getTotalLength();
  const prog2 = t => t < T.west ? eIO(prog(t, T.east - 0.2, 1.7)) : 1 - eIO(prog(t, T.west - 0.1, 1.6));
  const zoneAt = p => (p < 0.2 ? 0 : p < 0.42 ? 1 : p < 0.73 ? 2 : 3); // crossings along this route
  const cg = el('g', {}, OVER); const car = carShape(cg, '#6EC1FF');
  updaters.push(t => {
    if (t < T.s2 || t > T.s3 + 0.1) { cg.setAttribute('display', 'none'); return; } cg.removeAttribute('display');
    const p = prog2(t), pt = rp.getPointAtLength(L * p), [x, y] = toScreen(pt.x, pt.y);
    const back = t >= T.west - 0.1;
    car.setAttribute('transform', `translate(${x},${y}) scale(1.5) rotate(${back ? 180 : 0})`);
  });
  clock({ t0: T.s2 + 0.4, t1: T.s3 - 0.2, r: 66, col: '#F6D27A', label: 'LOCAL TIME', pos: t => { const pt = rp.getPointAtLength(L * prog2(t)); const [x, y] = toScreen(pt.x, pt.y); return [x, y - 130]; },
    minutes: t => { const z = zoneAt(prog2(t)); return 9 * 60 + z * 60; } });
  onScreen('EAST = LATER', T.east - 0.1, T.west - 0.2, { fill: V_, glow: 'gGreen' });
  onScreen('WEST = EARLIER', T.west - 0.1, T.s3 - 0.1, { fill: '#6EC1FF' });
}

/* ======================= 3 · THE CLOCKS GO CRAZY ======================= */
{
  camTo(T.s3 + 0.2, 0.86, 720, 470); camTo(T.s4, 0.86, 720, 470);
  const places = [
    ['NEW YORK', 1124, 481, 'et', true], ['CHICAGO', 880, 504, 'ct', true], ['DENVER', 569, 561, 'mt', true],
    ['PHOENIX', 414, 694, 'mt', false], ['LOS ANGELES', 296, 653, 'pt', true], ['REGINA', 597, 308, 'ct', false],
  ];
  const nudge = { 'PHOENIX': [40, 150], 'LOS ANGELES': [-110, -40], 'DENVER': [70, 70], 'REGINA': [0, -70], 'CHICAGO': [-10, -80], 'NEW YORK': [30, -80] };
  places.forEach(([name, x, y, z, changes], i) => {
    const base = 10 * 60 + (z === 'et' ? 180 : z === 'ct' ? 120 : z === 'mt' ? 60 : 0) - (name === 'REGINA' ? 0 : 0);
    clock({ t0: T.s3 + 0.15 + i * 0.1, t1: T.s4 - 0.2, r: 42, col: ZC[z], label: name, pos: t => { const [a, b] = toScreen(x, y); return [a + nudge[name][0], b + nudge[name][1]]; },
      minutes: t => {
        let m = base + 360 * (eIO(prog(t, T.changes - 0.1, 0.9)) - eIO(prog(t, T.changes + 0.8, 0.6))) * (i % 2 ? -1 : 1); // spin
        if (changes) m -= 60 * eOut(prog(t, T.really, 0.6)); // fall back one hour
        return m;
      },
      tag: changes ? null : 'NO CHANGE', tagCol: '#F6D27A', tagOn: t => eOut(prog(t, T.others, 0.3)) });
  });
  // bands slide out of alignment + short glitch
  updaters.push(t => {
    const d = eIO(prog(t, T.changes, 0.6)) * (1 - eIO(prog(t, T.s4 - 0.6, 0.5)));
    const gl = (t > T.really && t < T.really + 0.35) ? Math.sin(t * 90) * 10 : 0;
    ['pt', 'mt', 'ct', 'et', 'at'].forEach((k, i) => bandG[k].setAttribute('transform', `translate(${(gl * (i % 2 ? 1 : -1)).toFixed(1)},${(d * (i % 2 ? 26 : -26)).toFixed(1)})`));
  });
  onScreen('NOT EVERYWHERE CHANGES', T.some - 0.1, T.s4 - 0.1, { size: 58 });
}

/* ======================= 4 · CALGARY vs DESTIN ======================= */
{
  const [cx1, cy1] = [CITY.calgary[0], CITY.calgary[1]], [cx2, cy2] = [CITY.destin[0], CITY.destin[1]];
  camTo(T.s4 + 0.1, 0.92, 700, 520); camTo(T.s5 - 0.2, 0.92, 700, 520);
  pin(cx1, cy1, T.calgary, T.s5 - 0.2, ZC.mt, 'CALGARY'); pin(cx2, cy2, T.destin, T.s5 - 0.2, ZC.ct, 'DESTIN');
  const arc = el('path', { d: `M${cx1} ${cy1} Q ${(cx1 + cx2) / 2} ${Math.min(cy1, cy2) - 260} ${cx2} ${cy2}`, fill: 'none', stroke: 'url(#tGold)', 'stroke-width': 5, pathLength: 1, 'stroke-dasharray': 1, filter: 'url(#gGold)' }, plane);
  updaters.push(t => { arc.setAttribute('stroke-dashoffset', (1 - eIO(prog(t, T.far - 0.2, 0.8))).toFixed(3)); arc.setAttribute('opacity', (t > T.s4 && t < T.s5 ? 1 : 0)); });
  const summer = t => t < T.date + 1.0; // July first, then November
  clock({ t0: T.calgary + 0.2, t1: T.s5 - 0.2, r: 70, col: ZC.mt, label: 'CALGARY', pos: () => [470, 600], minutes: () => 10 * 60 });
  clock({ t0: T.destin + 0.2, t1: T.s5 - 0.2, r: 70, col: ZC.ct, label: 'DESTIN, FL', pos: () => [1450, 600],
    minutes: t => 10 * 60 + 60 * (1 - eIO(prog(t, T.date + 1.0, 0.6))) * (t >= T.date - 0.3 ? 1 : 1) });
  // calendar card that flips JULY -> NOVEMBER
  const cal = win(OVER, T.date - 0.3, T.s5 - 0.2, 0.25, 0.3);
  const cg = el('g', { transform: `translate(${CX},800)` }, cal);
  el('rect', { x: -130, y: -70, width: 260, height: 150, rx: 18, fill: '#F4F4F5' }, cg);
  el('rect', { x: -130, y: -70, width: 260, height: 46, rx: 18, fill: '#E5484D' }, cg);
  el('rect', { x: -130, y: -40, width: 260, height: 16, fill: '#E5484D' }, cg);
  const month = text(cg, { str: 'JULY', y: -46, size: 26, weight: 900, ls: 6, fill: '#FFFFFF' });
  const diff = text(cg, { str: '1 HOUR APART', y: 28, size: 30, weight: 900, fill: '#0D0D10' });
  updaters.push(t => {
    const nov = !summer(t);
    month.textContent = nov ? 'NOVEMBER' : 'JULY'; diff.textContent = nov ? 'SAME TIME' : '1 HOUR APART';
    diff.setAttribute('fill', nov ? '#138F5D' : '#0D0D10');
    const f = Math.abs(Math.cos(Math.PI * clamp((t - T.date - 0.75) / 0.5))); // flip
    cg.setAttribute('transform', `translate(${CX},800) scale(1,${(t > T.date + 0.75 && t < T.date + 1.25 ? f : 1).toFixed(3)})`);
  });
  onScreen('SAME CLOCK?', T.thisA - 0.1, T.date - 0.15, { fill: G_, glow: 'gGold', size: 70 });
  onScreen('DATE MATTERS', T.date - 0.1, T.s5 - 0.2, { size: 64 });
}

/* ======================= 5 · VANCOUVER vs SEATTLE ======================= */
{
  const v = CITY.vancouver, s = CITY.seattle;
  camTo(T.s5 + 0.2, 4.2, 312, 300); camTo(T.s6 - 0.3, 4.4, 312, 300, 'lin');
  const bw = el('path', { d: BORDER49, fill: 'none', stroke: '#F6D27A', 'stroke-width': 1.2, 'stroke-dasharray': '4 3', filter: 'url(#gGold)' }, plane);
  updaters.push(t => bw.setAttribute('opacity', (t > T.s5 && t < T.s6 - 0.2 ? eOut(prog(t, T.s5 + 0.4, 0.5)) : 0).toFixed(2)));
  pin(v[0], v[1], T.vancouver, T.s6 - 0.2, ZC.pt, 'VANCOUVER'); pin(s[0], s[1], T.seattle, T.s6 - 0.2, ZC.pt, 'SEATTLE');
  clock({ t0: T.vancouver + 0.15, t1: T.s6 - 0.2, r: 72, col: '#6EC1FF', label: 'VANCOUVER', pos: () => [470, 560], minutes: () => 11 * 60,
    tag: 'NO CHANGE', tagCol: '#F6D27A', tagOn: t => eOut(prog(t, T.winter + 0.3, 0.3)) });
  clock({ t0: T.seattle + 0.15, t1: T.s6 - 0.2, r: 72, col: '#6EC1FF', label: 'SEATTLE', pos: () => [1450, 560],
    minutes: t => 11 * 60 - 60 * eOut(prog(t, T.winter + 0.1, 0.6)),
    tag: 'FELL BACK', tagCol: '#FF9BC2', tagOn: t => eOut(prog(t, T.winter + 0.3, 0.3)) });
  const sn = win(OVER, T.winter - 0.1, T.s6 - 0.2, 0.25, 0.3);
  text(sn, { str: 'THIS WINTER', x: CX, y: 860, size: 30, weight: 900, ls: 8, fill: '#6EC1FF' });
  onScreen('CLOSE ON THE MAP… CHECK THE RULES', T.vancouver - 0.1, T.hour - 0.15, { size: 50 });
  onScreen('1 HOUR APART', T.hour - 0.1, T.s6 - 0.2, { fill: G_, glow: 'gGold', size: 74 });
}

/* ======================= 6 · THE IMPOSSIBLE TRAIN (illustration) ======================= */
{
  mapAlpha.push([T.s6 - 0.3, 1], [T.s6 + 0.1, 0]);
  const S = win(OVER, T.s6, T.s7 - 0.1, 0.3, 0.3);
  // track
  el('line', { x1: 0, y1: 540, x2: W, y2: 540, stroke: '#55565E', 'stroke-width': 6 }, S);
  for (let x = 0; x < W; x += 46) el('rect', { x, y: 542, width: 26, height: 10, rx: 2, fill: '#2C2D33' }, S);
  // stations
  [['NORTH', 260], ['SOUTH', 1660]].forEach(([n, x]) => { const sg = el('g', { transform: `translate(${x},540)` }, S); el('rect', { x: -70, y: -150, width: 140, height: 120, rx: 10, fill: '#1C1D22', stroke: '#45464E', 'stroke-width': 3 }, sg); el('path', { d: 'M-85 -150 L0 -200 L85 -150 Z', fill: '#2C2D33' }, sg); text(sg, { str: n, y: -90, size: 24, weight: 900, ls: 4, fill: '#F4F4F5' }); });
  // train
  const tg = el('g', {}, S);
  const cars = ['#F6D27A', '#6EC1FF', '#6EC1FF', '#6EC1FF'];
  cars.forEach((c, i) => { const cx = -i * 150; el('rect', { x: cx - 70, y: -64, width: 140, height: 58, rx: i === 0 ? 22 : 10, fill: c, stroke: '#0D0D10', 'stroke-width': 4 }, tg); for (let w = 0; w < 3; w++) el('rect', { x: cx - 52 + w * 38, y: -54, width: 26, height: 20, rx: 4, fill: '#1B2230' }, tg); for (const wx of [-40, 40]) el('circle', { cx: cx + wx, cy: -4, r: 12, fill: '#2C2D33', stroke: '#8A8C93', 'stroke-width': 3 }, tg); });
  updaters.push(t => {
    const goS = eIO(prog(t, T.three - 0.6, 1.7)), goN = eIO(prog(t, T.five - 0.4, 1.4));
    const x = 340 + 1300 * goS - 1300 * goN;
    const flip = t >= T.five - 0.4 ? -1 : 1;
    tg.setAttribute('transform', `translate(${x.toFixed(1)},536) scale(${flip},1)`);
  });
  // timetable
  const tt = el('g', { transform: 'translate(960,320)' }, S);
  el('rect', { x: -330, y: -110, width: 660, height: 220, rx: 22, fill: '#121216', stroke: '#45464E', 'stroke-width': 3 }, tt);
  text(tt, { str: 'TIMETABLE', y: -74, size: 26, weight: 900, ls: 8, fill: '#8A8C93' });
  const r1 = el('g', {}, tt), r2 = el('g', {}, tt);
  text(r1, { str: 'SOUTHBOUND', x: -290, y: -16, size: 36, weight: 800, fill: '#F4F4F5', anchor: 'start' }); text(r1, { str: '3 HRS', x: 290, y: -16, size: 44, weight: 900, disp: true, fill: 'url(#tGreen)', anchor: 'end' });
  text(r2, { str: 'NORTHBOUND', x: -290, y: 56, size: 36, weight: 800, fill: '#F4F4F5', anchor: 'start' }); text(r2, { str: '5 HRS', x: 290, y: 56, size: 44, weight: 900, disp: true, fill: 'url(#tRed)', anchor: 'end' });
  updaters.push(t => { r1.setAttribute('opacity', eOut(prog(t, T.three - 0.1, 0.3))); r2.setAttribute('opacity', eOut(prog(t, T.five - 0.1, 0.3))); });
  const il = el('g', { transform: 'translate(1215,222)' }, S);
  el('rect', { x: -78, y: -18, width: 156, height: 36, rx: 18, fill: '#F6D27A' }, il); text(il, { str: 'ILLUSTRATION', size: 16, weight: 900, ls: 3, fill: '#3A2608', y: 1 });
  onScreen('TRAVEL TIME…', T.isThat + 0.3, T.timeTravel - 0.05, { size: 60 });
  onScreen('OR TIME TRAVEL?!', T.timeTravel - 0.05, T.s7 - 0.15, { fill: G_, glow: 'gGold', size: 74 });
}

/* ======================= 7 · THE REAL CULPRIT ======================= */
{
  mapAlpha.push([T.s7 - 0.2, 0], [T.s7 + 0.3, 1, 'out']);
  camTo(T.s7 - 0.3, 0.9, 720, 480); camTo(T.s8, 0.9, 720, 480);
  // the map comes apart like a puzzle, then clicks back
  const order = ['pt', 'mt', 'ct', 'et', 'at'];
  updaters.push(t => {
    if (t < T.s7 - 0.3 || t > T.s8 + 0.2) return;
    const out = eIO(prog(t, T.culprit - 0.4, 0.7)) * (1 - eIO(prog(t, T.policies + 0.2, 0.5)));
    order.forEach((k, i) => bandG[k].setAttribute('transform', `translate(${((i - 2) * 60 * out).toFixed(1)},${(-90 * out * (i % 2 ? 1 : 0.4)).toFixed(1)})`));
  });
  // boundary lines light up one by one
  updaters.push(t => {
    ['pm', 'mc', 'ce', 'ea'].forEach((k, i) => {
      const on = t > T.s7 && t < T.s8 ? eOut(prog(t, T.boundaries - 0.2 + i * 0.35, 0.3)) : 0;
      tzLines[k].setAttribute('stroke', on > 0.05 ? '#F6D27A' : '#F4F4F5');
      tzLines[k].setAttribute('stroke-width', (2.4 + 3.6 * on).toFixed(2));
      tzLines[k].setAttribute('opacity', (0.55 + 0.45 * on).toFixed(2));
      tzLines[k].setAttribute('filter', on > 0.05 ? 'url(#gGold)' : 'none');
    });
  });
  // calendar + clock icons = the rules
  const ic = win(OVER, T.policies - 0.2, T.s8 - 0.2, 0.3, 0.3);
  const c1 = el('g', { transform: 'translate(250,820)' }, ic);
  el('rect', { x: -60, y: -55, width: 120, height: 110, rx: 14, fill: '#F4F4F5' }, c1); el('rect', { x: -60, y: -55, width: 120, height: 34, rx: 14, fill: '#E5484D' }, c1);
  text(c1, { str: 'DST', y: 20, size: 36, weight: 900, fill: '#0D0D10' });
  text(ic, { str: 'POLICY', x: 250, y: 905, size: 24, weight: 900, ls: 6, fill: '#8A8C93' });
  text(ic, { str: 'BOUNDARIES', x: 1670, y: 905, size: 24, weight: 900, ls: 6, fill: '#8A8C93' });
  el('path', { d: 'M1610 820 L1640 790 L1670 830 L1700 785 L1730 815', fill: 'none', stroke: 'url(#tGold)', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#gGold)' }, ic);
  onScreen('THE REAL CULPRIT?', T.s7 + 0.1, T.policies - 0.2, { size: 64 });
  onScreen('POLICY + BOUNDARIES', T.policies - 0.1, T.s8 - 0.15, { fill: G_, glow: 'gGold', size: 68 });
}

/* ======================= 8 · TIME-ZONE CHAOS ======================= */
{
  camTo(T.s8 + 0.1, 0.9, 720, 480); camTo(T.suddenly, 0.9, 720, 480); camTo(T.where + 0.3, 2.6, 569, 561); camTo(T.s9, 2.7, 569, 561, 'lin');
  const spots = [['ct', 880, 504], ['et', 1124, 481], ['mt', 414, 694], ['pt', 296, 653], ['ct', 721, 734], ['et', 970, 688], ['mt', 457, 274], ['ct', 597, 308], ['et', 1015, 438], ['pt', 312, 300], ['et', 1095, 864]];
  const off = { pt: 0, mt: 60, ct: 120, et: 180 };
  spots.forEach(([z, x, y], i) => clock({ t0: T.s8 + 0.1 + i * 0.08, t1: T.s9 - 0.2, r: 34, col: ZC[z], digital: false, pos: mapPos(x, y, -50),
    minutes: t => 8 * 60 + off[z] + (t - T.s8) * 40 * (1 + (i % 3)),
    alpha: t => Math.min(pop(t, T.s8 + 0.1 + i * 0.08), 1 - eIn(prog(t, T.s9 - 0.2, 0.3))) * (1 - 0.8 * eIO(prog(t, T.suddenly + 0.3, 0.6))) }));
  pin(569, 561, T.suddenly + 0.2, T.s9 - 0.2, '#F6D27A', 'YOU ARE HERE');
  clock({ t0: T.where - 0.3, t1: T.s9 - 0.2, r: 90, col: '#F6D27A', pos: () => [CX + 330, 470], minutes: t => 11 * 60 + 15 });
  onScreen('ONE CONTINENT. DIFFERENT RULES.', T.s8 + 0.2, T.suddenly - 0.1, { size: 54 });
  onScreen('WHERE YOU ARE MATTERS', T.suddenly, T.s9 - 0.15, { fill: G_, glow: 'gGold', size: 64 });
}

/* ======================= 9 · SPRING RESET ======================= */
{
  camTo(T.s9 + 0.2, 0.86, 720, 470); camTo(T.s10, 0.86, 720, 470);
  // calendar flipping to March
  const cal = win(OVER, T.s9, T.jump + 0.2, 0.25, 0.35);
  const cg = el('g', { transform: 'translate(270,330)' }, cal);
  el('rect', { x: -120, y: -95, width: 240, height: 200, rx: 18, fill: '#F4F4F5' }, cg);
  el('rect', { x: -120, y: -95, width: 240, height: 54, rx: 18, fill: '#2DC98A' }, cg); el('rect', { x: -120, y: -60, width: 240, height: 19, fill: '#2DC98A' }, cg);
  const mo = text(cg, { str: 'NOV', y: -66, size: 30, weight: 900, ls: 6, fill: '#FFFFFF' });
  const flower = el('g', { transform: 'translate(0,30)' }, cg);
  for (let k = 0; k < 6; k++) el('ellipse', { cx: 0, cy: -26, rx: 13, ry: 24, fill: '#FF9BC2', transform: `rotate(${k * 60})` }, flower);
  el('circle', { r: 14, fill: '#F6D27A' }, flower);
  updaters.push(t => { const ms = ['NOV', 'DEC', 'JAN', 'FEB', 'MAR']; const i = Math.min(4, Math.floor(clamp((t - T.s9 - 0.2) / 0.3) * 4.99)); mo.textContent = ms[i]; flower.setAttribute('opacity', i === 4 ? 1 : 0); flower.setAttribute('transform', `translate(0,30) scale(${(i === 4 ? pop(t, T.s9 + 1.4, 0.4) : 0).toFixed(3)})`); });
  // clocks spring forward, Phoenix stays (Arizona does not change)
  [['NEW YORK', 1124, 481, 'et', true], ['CHICAGO', 880, 504, 'ct', true], ['DENVER', 569, 561, 'mt', true], ['PHOENIX', 414, 694, 'mt', false]].forEach(([n, x, y, z, ch], i) =>
    clock({ t0: T.s9 + 0.3 + i * 0.1, t1: T.s10 - 0.2, r: 46, col: ZC[z], label: n, pos: mapPos(x, y, -70),
      minutes: t => 9 * 60 + ({ et: 180, ct: 120, mt: 60 }[z]) + (ch ? 60 * eOut(prog(t, T.jump, 0.6)) : 0),
      ...(ch ? {} : { pos: t => { const [a, b] = toScreen(x, y); return [a + 60, b + 95]; } }),
      tag: ch ? null : 'STILL NO CHANGE', tagCol: '#F6D27A', tagOn: t => eOut(prog(t, T.lineUp - 0.6, 0.3)),
      scale: t => (ch ? 1 : 1 + 0.35 * eIO(prog(t, T.lineUp - 0.6, 0.5))) }));
  onScreen('SPRING FORWARD', T.jump - 0.2, T.lineUp - 0.7, { fill: V_, glow: 'gGreen', size: 64 });
  onScreen('ALL LINED UP?', T.lineUp - 0.6, T.s10 - 0.15, { size: 64 });
}

/* ======================= 10 · THE BIG QUESTION + 11 · CTA ======================= */
{
  mapAlpha.push([T.s10 - 0.3, 1], [T.s10 + 0.2, 0.18], [DURATION, 0.18]);
  const S = win(OVER, T.s10, DURATION + 1, 0.3, 0.2);
  const btn = (x, label, col, ink) => {
    const g = el('g', {}, S);
    el('rect', { x: -230, y: -16, width: 460, height: 210, rx: 40, fill: '#000', opacity: 0.5 }, g);
    el('rect', { x: -230, y: -40, width: 460, height: 210, rx: 40, fill: col, stroke: '#0D0D10', 'stroke-width': 6 }, g);
    text(g, { str: label, y: 66, size: 96, weight: 900, disp: true, fill: ink, ls: 4 });
    updaters.push(t => g.setAttribute('transform', `translate(${x},520) scale(${pop(t, T.s10 + (label === 'STOP' ? 0.2 : 0.35), 0.4).toFixed(3)})`));
    return g;
  };
  btn(1040, 'STOP', 'url(#tRed)', '#FFFFFF'); btn(1560, 'KEEP', 'url(#tGreen)', '#0D3A26');
  // cursor hovering between the two
  const cur = el('path', { d: 'M0 0 L0 64 L16 50 L28 78 L40 72 L28 46 L50 46 Z', fill: '#FFFFFF', stroke: '#0D0D10', 'stroke-width': 4, 'stroke-linejoin': 'round' }, S);
  updaters.push(t => { const x = 1300 + 230 * Math.sin((t - T.s10) * 2.4), y = 640 + 14 * Math.sin((t - T.s10) * 5); cur.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`); });
  onScreen('SHOULD WE STOP CHANGING THE CLOCKS?', T.s10, T.cta - 0.1, { size: 52 });
  // CTA (on screen only)
  const cta = item({ x: 1300, y: 830, t0: T.cta - 0.1, t1: DURATION + 1, fi: 0.2, rise: 10, s0: 0.7 }, LAB);
  el('rect', { x: -330, y: -60, width: 660, height: 120, rx: 60, fill: '#F4F4F5' }, cta);
  el('path', { d: 'M-200 55 L-230 105 L-150 58 Z', fill: '#F4F4F5' }, cta);
  text(cta, { str: 'YES or NO? COMMENT ↓', size: 52, weight: 900, disp: true, fill: '#0D0D10' });
}

/* ======================= THE HERO (appears when it matters) ======================= */
const HX = 300, GY = 1000;
const heroLine = fader(root, t => Math.max(Math.min(eOut(prog(t, 0, 0.3)), 1 - eIn(prog(t, T.s2 - 0.4, 0.3))), Math.min(eOut(prog(t, T.s6, 0.3)), 1 - eIn(prog(t, T.s7 - 0.3, 0.3))), eOut(prog(t, T.s10, 0.3))));
el('line', { x1: 130, y1: GY + 2, x2: 470, y2: GY + 2, stroke: INK, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.85 }, heroLine);
const HERO = makeNoodle(root, [
  [0, { pose: 'think', x: HX, y: GY, s: 0.72, alpha: 1, look: 0.5 }, 0.3],
  [T.before - 0.2, { pose: 'happy', mouthOpen: 1, look: 0.6 }, 0.25],
  [T.how - 0.1, { pose: 'shout', squash: -0.08, tilt: -8, eyes: 1.3 }, 0.12],
  [T.how + 0.8, { pose: 'shrug', squash: 0, tilt: 0 }, 0.4],
  [T.s2 - 0.4, { alpha: 0, x: HX - 200 }, 0.35],
  [T.s6 - 0.2, { pose: 'walk', alpha: 1, x: HX - 60 }, 0.4],
  [T.s6 + 0.4, { pose: 'point', x: HX, walk: 0, look: 0.7 }, 0.4],
  [T.five, { pose: 'think', look: 0.6, brow: 0.7 }, 0.35],
  [T.isThat, { pose: 'shrug', mouth: 0.5 }, 0.3],
  [T.timeTravel, { pose: 'happy', mouthOpen: 1, squash: 0.1 }, 0.2],  // laughing
  [T.timeTravel + 0.3, { squash: -0.05, tilt: 6 }, 0.15], [T.timeTravel + 0.5, { squash: 0.08, tilt: -6 }, 0.15], [T.timeTravel + 0.7, { squash: 0, tilt: 0 }, 0.2],
  [T.s7 - 0.3, { alpha: 0, x: HX - 200 }, 0.35],
  [T.s10 - 0.3, { pose: 'walk', alpha: 1, x: HX + 40, y: GY }, 0.4],
  [T.s10 + 0.3, { pose: 'think', x: HX + 120, walk: 0, look: 0.8, brow: 0.6 }, 0.4],
  [T.stop, { pose: 'point', look: 0.9, mouth: 0.7 }, 0.3],
  [T.yes, { pose: 'shrug', look: 0.6, mouth: 0.3 }, 0.3],
  [T.cta, { pose: 'wave', mouth: 1, look: 0.5 }, 0.35],
], { hero: true, start: { x: HX, y: GY, s: 0.72 } });

/* ======================= KARAOKE SUBTITLES (top) ======================= */
{
  const chunks = []; let cur = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const len = cur.map(x => x[0]).join(' ').length, end = /[.,?!…]$/.test(w[0]);
    if ((end && cur.length >= 2) || cur.length >= 6 || len > 34 || i === WORDS.length - 1) { chunks.push(cur); cur = []; }
  });
  const KEY = /^(before|how|east|west|really|same|hour|travel|culprit|stop|spring|calgary|destin|vancouver|seattle)$/i;
  const lines = chunks.map((c, ci) => {
    const t0 = c[0][1] - 0.05, t1 = ci + 1 < chunks.length ? chunks[ci + 1][0][1] - 0.05 : c[c.length - 1][2] + 0.6;
    const tx = el('text', { x: CX, y: 64, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': 46, 'font-weight': 700 }, SUB);
    const spans = c.map(([w, ws]) => { const sp = document.createElementNS(NS, 'tspan'); sp.textContent = w + ' '; tx.appendChild(sp); return [sp, ws, KEY.test(norm(w))]; });
    return { tx, t0, t1, spans };
  });
  updaters.push(t => {
    for (const L of lines) {
      if (t < L.t0 || t >= L.t1) { L.tx.setAttribute('display', 'none'); continue; }
      L.tx.removeAttribute('display'); L.tx.setAttribute('opacity', Math.min(1, (t - L.t0) / 0.08).toFixed(2));
      for (const [sp, ws, key] of L.spans) sp.setAttribute('fill', t >= ws - 0.02 ? (key ? TH.gold[1] : TH.text) : TH.muted);
    }
  });
}
root.appendChild(OVER); root.appendChild(LAB); root.appendChild(SUB);
