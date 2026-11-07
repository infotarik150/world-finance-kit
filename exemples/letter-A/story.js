// "Letter A" — story, props, title and karaoke subtitles. Times = word onsets in voix_quentin_brute.mp3.
const GROUND = 1380;
const GOLDF = 'url(#tGold)', REDF = 'url(#tRed)';
const OTHER = TH.other;
const R3 = rnd(9);

const BACK = el('g', {}, root), MID = el('g', {}, root), FRONT = el('g', {}, root);
const SLOPE = x => 1500 - x * 0.36;
const STEP = x => x < 330 ? GROUND : x < 480 ? GROUND - 70 : x < 630 ? GROUND - 140 : x < 780 ? GROUND - 210 : GROUND - 280;
// ---------- generic helpers ----------
const win = (t0, t1, fi = 0.35, fo = 0.35, parent = FRONT) => fader(parent, t => Math.min(eOut(prog(t, t0, fi)), 1 - eIn(prog(t, t1, fo))));
function fader(parent, fn) {
  const g = el('g', {}, parent);
  updaters.push(t => { const a = fn(t); if (a <= 0.001) g.setAttribute('display', 'none'); else { g.removeAttribute('display'); g.setAttribute('opacity', a.toFixed(3)); } });
  return g;
}
function follow(g, fn) { updaters.push(t => { const [x, y, r = 0, s = 1] = fn(t); g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${r.toFixed(1)}) scale(${s.toFixed(3)})`); }); return g; }
const HEART = 'M0 34 C-70 -8 -46 -66 0 -32 C46 -66 70 -8 0 34 Z';
function heart(parent, fill, size = 1) { const g = el('g', {}, parent); el('path', { d: HEART, fill, transform: `scale(${size})` }, g); return g; }
function bubble(parent, x, y, w, h, tail = 1, label = null) {
  const g = el('g', { transform: `translate(${x},${y})` }, parent);
  el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2.4, fill: TH.bubble }, g);
  el('path', { d: `M${tail * 10} ${h / 2 - 4} L${tail * 34} ${h / 2 + 26} L${tail * 38} ${h / 2 - 6} Z`, fill: TH.bubble }, g);
  const dots = [];
  if (label) text(g, { str: label, size: h * 0.5, weight: 800, fill: TH.bubbleInk });
  else for (let i = 0; i < 3; i++) dots.push(el('circle', { cx: (i - 1) * 26, cy: 0, r: 8, fill: TH.bubbleInk }, g));
  updaters.push(t => dots.forEach((d, i) => d.setAttribute('opacity', (0.35 + 0.65 * Math.max(0, Math.sin(t * 6 - i * 0.9))).toFixed(2))));
  return g;
}
function cloud(parent, x, y, w, h) {
  const g = el('g', { transform: `translate(${x},${y})` }, parent);
  const c = TH.bubble;
  [[-w * 0.3, 0, h * 0.42], [0, -h * 0.12, h * 0.5], [w * 0.3, 0, h * 0.42], [-w * 0.12, h * 0.16, h * 0.38], [w * 0.14, h * 0.16, h * 0.38]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r, fill: c }, g));
  el('circle', { cx: -w * 0.42, cy: h * 0.62, r: 14, fill: c }, g);
  el('circle', { cx: -w * 0.52, cy: h * 0.86, r: 8, fill: c }, g);
  return g;
}
function gear(parent, r, teeth, fill) {
  let d = '';
  for (let i = 0; i < teeth * 2; i++) { const a = i * Math.PI / teeth, rr = i % 2 ? r : r * 1.28; d += (i ? 'L' : 'M') + (rr * Math.cos(a)).toFixed(1) + ' ' + (rr * Math.sin(a)).toFixed(1) + ' '; }
  const g = el('g', {}, parent);
  el('path', { d: d + 'Z', fill }, g); el('circle', { r: r * 0.4, fill: TH.bubble }, g);
  return g;
}
function hero(keys) { return makeChar(MID, keys, { blinkOff: 0 }); }
function other(keys, k = 1) { return makeChar(MID, keys, { ...OTHER, blinkOff: 1.3 * k }); }
// fade a character out, then back in elsewhere: returns key list
const cut = (t, pose) => [[t - 0.22, { alpha: 0 }, 0.2], [t, { ...pose, alpha: 0 }, 0.01], [t + 0.01, { alpha: 1 }, 0.25]];

// ---------- ground line ----------
{
  const gl = fader(BACK, t => (t < 41.2 || (t > 43.5 && t < 73.6) || t > 81.0) ? 1 : 0);
  el('line', { x1: 60, y1: GROUND + 2, x2: 1020, y2: GROUND + 2, stroke: TH.line, 'stroke-width': 2, 'stroke-opacity': 0.35 }, gl);
}

/* ===================== the hero, through the whole video ===================== */
const HERO = hero([
  [0.0, { pose: 'stand', x: 540, alpha: 0 }, 0.01], [0.05, { alpha: 1 }, 0.45],
  [3.0, { pose: 'stand', head: -8, mouth: 0.65 }, 0.4],
  [4.36, 'proud', 0.45],
  [7.3, 'doubt', 0.5],
  ...cut(9.0, { pose: 'frown', x: 760, dir: -1 }),
  [10.3, 'recoil', 0.35],
  [13.06, { pose: 'walkAway', dir: 1, x: 980, head: 2 }, 0.9],
  ...cut(14.56, { pose: 'stand', x: 540, y: GROUND - 230, s: 1.0, dir: 1, mouth: 0.4 }),
  [15.96, { pose: 'victory' }, 0.4],
  [18.9, { pose: 'refuse' }, 0.4], [19.35, { pose: 'refuse', head: -14 }, 0.18], [19.6, { pose: 'refuse', head: 6 }, 0.18], [19.85, { pose: 'refuse', head: -12 }, 0.18], [20.1, { pose: 'refuse', head: 0 }, 0.2],
  ...cut(21.42, { pose: 'think', x: 520, y: GROUND, s: 1.15 }),
  [24.66, { pose: 'annoyed', tap: 1 }, 0.4],
  [27.1, { pose: 'annoyed', tap: 1, mouth: -0.9, brow: 1 }, 0.2],
  ...cut(27.9, { pose: 'stand', x: 690, dir: -1, tap: 0, mouth: 0.5 }),
  [28.8, 'give', 0.45],
  [32.5, 'hurt', 0.4],
  [33.4, { pose: 'walkAway', dir: 1, x: 900 }, 1.0], [34.6, { pose: 'hurt', dir: 1 }, 0.4],
  ...cut(35.75, { pose: 'refuse', x: 690, dir: -1 }),
  [39.4, 'hug', 0.5],
  ...cut(41.36, { pose: 'push', x: 400, y: SLOPE(400) + 4, dir: 1, walk: 1, walkSpeed: 0.55 }),
  ...cut(43.6, { pose: 'heart', x: 600, y: GROUND, dir: 1, walk: 0 }),
  [45.6, { pose: 'heart', dir: -1, look: -0.2 }, 0.5],
  ...cut(47.9, { pose: 'walkAway', x: 760, dir: -1, walkSpeed: 0.7 }),
  [48.0, { x: 220 }, 5.6],
  ...cut(53.8, { pose: 'stop', x: 600, dir: -1, walk: 0 }),
  [55.6, { pose: 'stand', mouth: 0.45, head: 6 }, 0.45],
  ...cut(56.95, { pose: 'sitSad', x: 470, hipY: 1222, dir: 1 }),
  [59.8, { pose: 'sitSad', aF: [160, 6], head: -10 }, 0.5],
  [61.98, 'sitSad', 0.5],
  [64.32, { pose: 'sitLookUp', look: -0.6, mouth: 0 }, 0.5],
  ...cut(66.6, { pose: 'sitHeadHands', x: 530, hipY: 1222, dir: 1 }),
  [71.08, { pose: 'sitLookUp', mouth: 0.05, look: 0.3 }, 0.5],
  ...cut(73.8, { pose: 'climb', x: 250, y: STEP(250), dir: 1, anchor: 0 }),
  [73.85, { x: 400, y: STEP(400) }, 0.45], [74.3, { x: 555, y: STEP(555) }, 0.45],
  [75.2, { pose: 'crushed', walk: 0 }, 0.45],
  [76.86, { pose: 'crushed', lean: 54, mouth: -0.9 }, 0.4],
  [78.18, { pose: 'kneel', y: STEP(555) }, 0.45],
  ...cut(81.0, { pose: 'hugKnees', x: 640, hipY: 1300, dir: 1 }),
  [82.0, { pose: 'hugKnees', head: 8, look: 0.5 }, 0.4],
  [83.6, { pose: 'stand', x: 640, y: GROUND, head: -6, mouth: 0.15 }, 0.8],
  ...cut(85.3, { pose: 'stand', x: 700, dir: -1, mouth: 0.5 }),
  [85.96, 'give', 0.45],
  [89.6, 'hurt', 0.5],
  [90.8, { pose: 'hurt', x: 840 }, 1.1],
  [91.7, { alpha: 0 }, 0.35],
  ...cut(96.2, { pose: 'walkAway', x: 880, dir: 1, s: 0.8, alpha: 1 }),
  [96.25, { x: 1010 }, 4.0],
  [99.8, { alpha: 0 }, 0.8],
]);

/* ===================== S1–S2 (0 – 8.9) ===================== */
{
  const a = win(0.1, 4.2, 0.8, 0.5, BACK);
  const g = el('g', { filter: 'url(#gGold)' }, a);
  const A = text(g, { str: 'A', x: 540, y: 1010, size: 900, weight: 800, disp: true, fill: 'none' });
  A.setAttribute('stroke', TH.gold[1]); A.setAttribute('stroke-width', 6); A.setAttribute('opacity', 0.28);
  // doubt: question marks rising inside
  const q = win(7.4, 8.8, 0.3, 0.3);
  for (let i = 0; i < 3; i++) {
    const m = el('g', {}, q); text(m, { str: '?', size: 64 + i * 10, weight: 800, fill: TH.text });
    follow(m, t => { const p = ((t - 7.4) * 0.5 + i * 0.33) % 1; return [640 + i * 46 + 10 * Math.sin(t * 3 + i), 760 - p * 160, 10 * Math.sin(t * 2 + i), 0.8 + 0.3 * p]; });
  }
}
/* ===================== S3: controlled / trapped (9.0 – 13.9) ===================== */
{
  const o = other([[8.9, { pose: 'stand', x: 300, alpha: 0 }, 0.01], [9.0, { alpha: 1, pose: 'point' }, 0.35], [11.4, { pose: 'point', mouth: -0.6 }, 0.3], [13.7, { alpha: 0 }, 0.3]]);
  const b = win(9.2, 11.3, 0.25, 0.25);
  bubble(b, 250, 640, 170, 86, 1, '!!');
  // cage of red bars closing in
  const cage = win(11.95, 13.1, 0.15, 0.3);
  for (let i = 0; i < 6; i++) {
    const x = 560 + i * 52;
    const ln = el('line', { x1: x, y1: GROUND, x2: x, y2: GROUND, stroke: TH.red[1], 'stroke-width': 9, 'stroke-linecap': 'round', filter: 'url(#gRed)' }, cage);
    updaters.push(t => ln.setAttribute('y2', GROUND - 700 * eOut(prog(t, 12.0 + i * 0.04, 0.35))));
  }
}
/* ===================== S4: leader on the podium (14.56 – 20.9) ===================== */
{
  const pod = win(14.4, 20.9, 0.3, 0.3, BACK);
  const blocks = [[250, 190, 140, '2'], [440, 200, 230, '1'], [640, 190, 100, '3']];
  blocks.forEach(([x, w, h, n]) => {
    const r = el('rect', { x, y: GROUND - h, width: w, height: h, rx: 10, fill: n === '1' ? GOLDF : TH.prop2, filter: n === '1' ? 'url(#gGold)' : '' }, pod);
    text(pod, { str: n, x: x + w / 2, y: GROUND - h / 2, size: 70, weight: 800, fill: n === '1' ? '#7A520F' : TH.line });
  });
  other([[14.6, { pose: 'stand', x: 345, y: GROUND - 140, s: 0.9, alpha: 0 }, 0.01], [14.7, { alpha: 1 }, 0.3], [18.7, { pose: 'offer', mouth: 0.2 }, 0.4], [20.7, { alpha: 0 }, 0.25]], 1);
  other([[14.6, { pose: 'stand', x: 735, y: GROUND - 100, s: 0.9, dir: -1, alpha: 0 }, 0.01], [14.8, { alpha: 1 }, 0.3], [18.85, { pose: 'offer', mouth: 0.2 }, 0.4], [20.7, { alpha: 0 }, 0.25]], 2);
}
/* ===================== S5: fast mind / slow excuses (21.4 – 27.8) ===================== */
{
  const th = win(21.9, 24.5, 0.3, 0.3);
  cloud(th, 800, 640, 260, 170);
  const g1 = gear(th, 34, 9, TH.bubbleInk), g2 = gear(th, 22, 7, TH.bubbleInk);
  follow(g1, t => [770, 640, t * 420]); follow(g2, t => [838, 618, -t * 600]);
  // speed lines around the head
  const sp = win(21.5, 24.4, 0.2, 0.3);
  for (let i = 0; i < 5; i++) {
    const l = el('line', { stroke: TH.text, 'stroke-width': 6, 'stroke-linecap': 'round' }, sp);
    updaters.push(t => { const hp = HERO.headPos, p = (t * 2.2 + i / 5) % 1, y = hp[1] - 60 + i * 30, x = hp[0] - 120 - p * 160; l.setAttribute('x1', x); l.setAttribute('x2', x + 70 - p * 40); l.setAttribute('y1', y); l.setAttribute('y2', y); l.setAttribute('opacity', (1 - p).toFixed(2)); });
  }
  // the snail: slow decisions
  const sn = win(24.6, 27.8, 0.3, 0.3);
  const snail = el('g', {}, sn);
  el('path', { d: 'M-70 0 Q-80 -14 -60 -16 L40 -16 Q60 -16 60 0 Z', fill: TH.line }, snail);
  el('circle', { cx: -10, cy: -48, r: 40, fill: TH.line }, snail);
  el('path', { d: 'M-10 -48 m-22 0 a22 22 0 1 1 22 22 a12 12 0 1 1 -10 -12', fill: 'none', stroke: TH.bubble, 'stroke-width': 6, 'stroke-linecap': 'round' }, snail);
  el('path', { d: 'M48 -14 L58 -44 M40 -14 L44 -42', stroke: TH.line, 'stroke-width': 5, 'stroke-linecap': 'round' }, snail);
  follow(snail, t => [110 + 70 * prog(t, 24.6, 3.2), GROUND - 2, 0, 1.8]);
  // steam (anger)
  const st = win(26.9, 27.9, 0.15, 0.3);
  for (let i = 0; i < 3; i++) {
    const p = el('path', { d: 'M0 0 q-14 -20 0 -40 q14 -20 0 -40', fill: 'none', stroke: TH.red[1], 'stroke-width': 8, 'stroke-linecap': 'round', filter: 'url(#gRed)' }, st);
    follow(p, t => [520 + (i - 1) * 46, 690 - 40 * ((t * 1.6 + i * 0.3) % 1), 0, 0.8]);
  }
}
/* ===================== S6: loyal, then trust breaks (27.9 – 35.6) ===================== */
{
  const o = other([[27.8, { pose: 'stand', x: 330, alpha: 0 }, 0.01], [27.95, { alpha: 1 }, 0.3], [30.9, { pose: 'stand', head: 14, mouth: 0.6 }, 0.25], [31.3, { head: -2 }, 0.3],
    [32.6, { pose: 'shrug' }, 0.4], [35.3, { alpha: 0 }, 0.3]], 1);
  // gold thread between them, snaps red
  const th = win(29.9, 34.0, 0.4, 0.4);
  const L = el('path', { fill: 'none', stroke: TH.gold[1], 'stroke-width': 6, 'stroke-linecap': 'round', filter: 'url(#gGold)' }, th);
  const R = el('path', { fill: 'none', stroke: TH.gold[1], 'stroke-width': 6, 'stroke-linecap': 'round', filter: 'url(#gGold)' }, th);
  updaters.push(t => {
    const br = eOut(prog(t, 32.35, 0.6)), red = prog(t, 32.2, 0.2) > 0;
    const y = 1080, x0 = 400, x1 = 650, m = (x0 + x1) / 2;
    L.setAttribute('d', `M${x0} ${y} Q${x0 + 60} ${y + 22 + 30 * br} ${m - 8 - 30 * br} ${y + 10 + 160 * br}`);
    R.setAttribute('d', `M${x1} ${y} Q${x1 - 60} ${y + 22 + 30 * br} ${m + 8 + 30 * br} ${y + 10 + 160 * br}`);
    for (const p of [L, R]) { p.setAttribute('stroke', red ? TH.red[1] : TH.gold[1]); p.setAttribute('filter', red ? 'url(#gRed)' : 'url(#gGold)'); }
  });
}
/* ===================== S7: cold / distant (35.7 – 41.3) ===================== */
{
  other([[35.5, { pose: 'stand', x: 200, s: 0.95, alpha: 0 }, 0.01], [35.7, { alpha: 1, head: 10, aF: [40, 120] }, 0.3], [38.3, { alpha: 0 }, 0.35]], 1);
  other([[35.5, { pose: 'stand', x: 340, s: 0.95, alpha: 0 }, 0.01], [35.85, { alpha: 1, head: -4, look: -0.6 }, 0.3], [38.3, { alpha: 0 }, 0.35]], 2);
  const wb = win(36.0, 38.2, 0.25, 0.25);
  bubble(wb, 330, 700, 150, 76, -1);
  const fr = win(36.4, 38.6, 0.4, 0.6);
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9, f = el('g', { filter: 'url(#gSoft)' }, fr);
    icon(f, I.snow, { size: 70, t0: 36.4 + i * 0.08, draw: 0.4, sw: 3, color: TH.text });
    follow(f, t => [690 + 230 * Math.cos(a + t * 0.25), 1040 + 260 * Math.sin(a + t * 0.25), t * 20, 1]);
  }
  // lock on the chest
  const lk = win(39.85, 41.25, 0.3, 0.3);
  const lock = el('g', { filter: 'url(#gSoft)' }, lk);
  el('path', { d: 'M-18 -8 V-26 A18 18 0 0 1 18 -26 V-8', fill: 'none', stroke: TH.bubbleInk, 'stroke-width': 8 }, lock);
  el('rect', { x: -28, y: -10, width: 56, height: 44, rx: 8, fill: TH.bubbleInk }, lock);
  el('circle', { cx: 0, cy: 10, r: 6, fill: TH.text }, lock);
  follow(lock, t => { const c = HERO.chestPos ?? [690, 1050]; return [c[0], c[1] + 10, 0, 1.3]; });
}
/* ===================== S8: carry alone / feel deeply (41.4 – 47.8) ===================== */
{
  const sl = win(41.2, 43.5, 0.25, 0.3, BACK);
  el('polygon', { points: `0,${SLOPE(0)} 1080,${SLOPE(1080)} 1080,1920 0,1920`, fill: TH.prop }, sl);
  el('line', { x1: 0, y1: SLOPE(0), x2: 1080, y2: SLOPE(1080), stroke: TH.line, 'stroke-width': 3, 'stroke-opacity': 0.6 }, sl);
  const rock = el('g', {}, sl);
  el('circle', { r: 130, fill: TH.prop2 }, rock);
  el('path', { d: 'M-60 -40 Q-20 -70 30 -50 M10 30 Q50 20 70 50 M-70 40 Q-50 60 -20 55', fill: 'none', stroke: TH.line, 'stroke-width': 8, 'stroke-linecap': 'round' }, rock);
  follow(rock, t => [665, SLOPE(665) - 128, -t * 40]);
  // glowing heart inside the chest, dims when someone looks
  const hw = win(43.6, 47.7, 0.35, 0.3);
  const hg = el('g', { filter: 'url(#gGold)' }, hw);
  heart(hg, GOLDF, 0.62);
  follow(hg, t => { const c = HERO.chestPos ?? [540, 1000]; return [c[0], c[1], 0, 1 + 0.08 * Math.sin(t * 6)]; });
  updaters.push(t => hg.setAttribute('opacity', (1 - 0.75 * eIO(prog(t, 45.9, 0.6))).toFixed(3)));
  other([[45.2, { pose: 'stand', x: 230, alpha: 0 }, 0.01], [45.4, { alpha: 1, look: 0.4 }, 0.35], [47.6, { alpha: 0 }, 0.25]], 1);
}
/* ===================== S9: walks away after trying quietly (47.9 – 53.7) ===================== */
{
  const tr = win(49.6, 53.6, 0.3, 0.3);
  for (let i = 0; i < 6; i++) {
    const ts = 49.8 + i * 0.55, x = 760 - i * 75;
    const b = fader(tr, t => Math.min(eOut(prog(t, ts, 0.25)), 1 - 0.75 * eOut(prog(t, ts + 0.6, 1.2))));
    bubble(b, x, 820 - (i % 2) * 40, 110, 58, 1);
  }
}
/* ===================== S10: attention vs understood (53.8 – 56.8) ===================== */
{
  const ey = win(53.85, 55.5, 0.2, 0.25);
  [[300, 760], [820, 720], [250, 1040], [880, 1000], [560, 600]].forEach(([x, y], i) => {
    const e = el('g', {}, ey);
    el('ellipse', { rx: 46, ry: 28, fill: TH.bubble }, e); el('circle', { r: 15, fill: TH.bubbleInk }, e);
    follow(e, t => [x + 6 * Math.sin(t * 3 + i), y + 4 * Math.cos(t * 2.5 + i), 0, eOut(prog(t, 53.85 + i * 0.06, 0.25))]);
  });
  other([[55.45, { pose: 'stand', x: 360, alpha: 0 }, 0.01], [55.6, { alpha: 1, mouth: 0.5, head: 8 }, 0.35], [56.75, { alpha: 0 }, 0.2]], 1);
  const hb = win(55.9, 56.8, 0.25, 0.2);
  const hh = el('g', { filter: 'url(#gGold)' }, hb); heart(hh, GOLDF, 0.4);
  follow(hh, t => [520, 760 - 20 * Math.sin(t * 3), 0, 1]);
}
/* ===================== S11: can't let go / replay (56.9 – 66.5) ===================== */
{
  const couch = win(56.85, 66.45, 0.3, 0.3, BACK);
  el('rect', { x: 300, y: 1060, width: 90, height: 320, rx: 30, fill: TH.prop2 }, couch);
  el('rect', { x: 300, y: 1235, width: 470, height: 145, rx: 26, fill: TH.prop }, couch);
  el('rect', { x: 720, y: 1170, width: 70, height: 210, rx: 26, fill: TH.prop2 }, couch);
  // balloon he can't release
  const bl = win(59.75, 61.95, 0.3, 0.4);
  const string = el('path', { fill: 'none', stroke: TH.gold[1], 'stroke-width': 3 }, bl);
  const ball = el('g', { filter: 'url(#gGold)' }, bl);
  el('ellipse', { rx: 62, ry: 74, fill: GOLDF }, ball);
  updaters.push(t => {
    const h = HERO.hand, bx = h[0] + 40 + 18 * Math.sin(t * 1.7), by = h[1] - 300 + 12 * Math.sin(t * 2.3);
    ball.setAttribute('transform', `translate(${bx},${by}) rotate(${8 * Math.sin(t * 1.7)})`);
    string.setAttribute('d', `M${h[0]} ${h[1]} Q${h[0] + 50} ${(h[1] + by) / 2} ${bx} ${by + 74}`);
  });
  // replay loop in a thought cloud
  const rp = win(61.95, 66.4, 0.35, 0.3);
  cloud(rp, 760, 650, 330, 220);
  const loop = el('path', { d: 'M-70 0 A70 70 0 1 1 0 70', fill: 'none', stroke: TH.bubbleInk, 'stroke-width': 9, 'stroke-linecap': 'round' }, rp);
  const arrow = el('path', { d: 'M-14 56 L4 72 L-14 88', fill: 'none', stroke: TH.bubbleInk, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, rp);
  const lg = el('g', {}, rp); lg.appendChild(loop); lg.appendChild(arrow);
  follow(lg, t => [760, 640, -t * 160, 0.85]);
  const mem = el('g', {}, rp);
  el('circle', { cx: -16, cy: -18, r: 13, fill: TH.line }, mem); el('rect', { x: -27, y: -4, width: 22, height: 36, rx: 10, fill: TH.line }, mem);
  el('circle', { cx: 18, cy: -18, r: 13, fill: TH.red[1] }, mem); el('rect', { x: 7, y: -4, width: 22, height: 36, rx: 10, fill: TH.red[1] }, mem);
  follow(mem, t => [760, 638, 0, 1]);
}
/* ===================== S12: misunderstood / expect them to notice (66.6 – 73.7) ===================== */
{
  const ch = win(66.5, 73.65, 0.3, 0.3, BACK);
  el('path', { d: 'M440 1380 L450 1240 L640 1240 L650 1380 M450 1240 L430 1020', fill: 'none', stroke: TH.line, 'stroke-width': 18, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ch);
  other([[66.5, { pose: 'shrug', x: 170, alpha: 0, s: 0.95 }, 0.01], [66.75, { alpha: 1 }, 0.3], [70.6, { alpha: 0 }, 0.3]], 1);
  other([[66.5, { pose: 'shrug', x: 920, dir: -1, alpha: 0, s: 0.95 }, 0.01], [66.9, { alpha: 1 }, 0.3], [70.6, { alpha: 0 }, 0.3]], 2);
  const qm = win(67.0, 70.6, 0.3, 0.3);
  [[150, 700], [940, 700]].forEach(([x, y], i) => {
    const q = el('g', {}, qm); text(q, { str: '?', size: 90, weight: 800, fill: TH.text });
    follow(q, t => [x, y + 10 * Math.sin(t * 3 + i), 10 * Math.sin(t * 2 + i), 1]);
  });
  // people walk past without noticing
  other([[71.15, { pose: 'stand', x: -120, s: 0.9, alpha: 1, walk: 1, look: 0.5 }, 0.01], [71.2, { x: 1200 }, 2.6]], 1);
  other([[71.6, { pose: 'stand', x: -160, s: 0.85, alpha: 1, walk: 1 }, 0.01], [71.65, { x: 1200 }, 2.2]], 2);
}
/* ===================== S13: ambition, pressure, failure (73.8 – 80.9) ===================== */
{
  const st = win(73.6, 80.9, 0.3, 0.3, BACK);
  [[180, 0], [330, 70], [480, 140], [630, 210], [780, 280]].forEach(([x, h]) => el('rect', { x, y: GROUND - h, width: 150, height: h + 2, fill: TH.prop2 }, st));
  el('line', { x1: 180, y1: GROUND, x2: 930, y2: GROUND, stroke: TH.line, 'stroke-width': 2, 'stroke-opacity': 0.4 }, st);
  const fl = el('g', { filter: 'url(#gGold)' }, st);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -300, stroke: TH.gold[2], 'stroke-width': 8 }, fl);
  el('path', { d: 'M0 -300 L130 -262 L0 -222 Z', fill: GOLDF }, fl);
  follow(fl, t => [870, GROUND - 280, 38 * eIn(prog(t, 78.2, 0.7)), 1]);
  updaters.push(t => fl.setAttribute('opacity', (1 - 0.65 * eOut(prog(t, 78.4, 0.8))).toFixed(3)));
  // pressure block
  const pb = win(74.7, 78.3, 0.2, 0.35);
  const blk = el('g', { filter: 'url(#gRed)' }, pb);
  el('rect', { x: -110, y: -150, width: 220, height: 150, rx: 14, fill: REDF }, blk);
  text(blk, { str: 'PRESSURE', y: -75, size: 30, weight: 800, ls: 4, fill: '#3A0A0E' });
  follow(blk, t => { const h = HERO.headPos; const land = eIn(prog(t, 74.75, 0.6)); return [h[0] - 30, (h[1] - 70) - 520 * (1 - land), 0, 1 + 0.08 * eOut(prog(t, 76.86, 0.4))]; });
}
/* ===================== S14: won't ask for help (81.0 – 85.2) ===================== */
{
  other([[80.9, { pose: 'stand', x: 300, alpha: 0 }, 0.01], [81.05, { alpha: 1 }, 0.3], [81.6, { pose: 'offer' }, 0.45], [83.4, { alpha: 0 }, 0.4]], 1);
}
/* ===================== S15: loves deeply, taken for granted (85.3 – 91.9) ===================== */
{
  const o15 = other([[85.2, { pose: 'stand', x: 330, alpha: 0 }, 0.01], [85.35, { alpha: 1, mouth: 0.4 }, 0.3], [88.5, { pose: 'phone' }, 0.45], [91.8, { alpha: 0 }, 0.3]], 1);
  const ph = win(88.7, 91.7, 0.25, 0.3);
  const scr = el('rect', { x: -16, y: -26, width: 32, height: 52, rx: 6, fill: '#BFE0FF', filter: 'url(#gSoft)' }, ph);
  follow(scr, () => [o15.hand[0] + 4, o15.hand[1] - 22, -20, 1]);
  const hh = win(85.9, 91.8, 0.3, 0.4);
  const hg = el('g', { filter: 'url(#gGold)' }, hh);
  const hp = el('path', { d: HEART, fill: GOLDF, transform: 'scale(0.75)' }, hg);
  updaters.push(t => {
    const red = prog(t, 88.9, 0.5);
    hp.setAttribute('fill', red > 0.5 ? REDF : GOLDF); hg.setAttribute('filter', red > 0.5 ? 'url(#gRed)' : 'url(#gGold)');
    const h = HERO.hand; hg.setAttribute('transform', `translate(${h[0] - 10},${h[1] - 30}) scale(${1 - 0.25 * eOut(prog(t, 89.6, 0.6))})`);
  });
  const th = win(86.3, 91.4, 0.4, 0.5);
  const thread = el('path', { fill: 'none', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '1 0' }, th);
  updaters.push(t => {
    const red = prog(t, 89.0, 0.4) > 0.5, x1 = (HERO.chestPos ?? [700, 1050])[0];
    const sag = 40 + 120 * eOut(prog(t, 90.74, 1.0));
    thread.setAttribute('d', `M380 1060 Q${(380 + x1) / 2} ${1060 + sag} ${x1} 1060`);
    thread.setAttribute('stroke', red ? TH.red[1] : TH.gold[1]);
    thread.setAttribute('stroke-dasharray', prog(t, 90.9, 0.2) > 0.5 ? '18 22' : '1 0');
  });
}
/* ===================== S16: sudden for others, long for them (92.6 – end) ===================== */
{
  [[170, 1], [420, 2], [670, 3]].forEach(([x, k], i) => other([[92.4, { pose: 'stand', x, s: 0.95, alpha: 0 }, 0.01], [92.6 + i * 0.08, { alpha: 1 }, 0.3], [93.4 + i * 0.1, { pose: 'surprised' }, 0.3], [96.0, { alpha: 0 }, 0.3]], k));
  const ex = win(93.5, 96.0, 0.2, 0.3);
  [[200, 690], [450, 690], [700, 690]].forEach(([x, y], i) => {
    const e = el('g', {}, ex); text(e, { str: '!', size: 110, weight: 800, fill: TH.text });
    follow(e, t => [x, y - 10 * eOut(prog(t, 93.5 + i * 0.07, 0.3)), 0, eOut(prog(t, 93.5 + i * 0.07, 0.25))]);
  });
  // the empty spot where he used to stand
  const gh = win(92.7, 96.0, 0.4, 0.4, BACK);
  el('ellipse', { cx: 920, cy: GROUND + 4, rx: 110, ry: 16, fill: 'none', stroke: TH.line, 'stroke-width': 3, 'stroke-dasharray': '10 12' }, gh);
  // a long line of small red cracks: it built up for a long time
  const cr = win(96.3, 100.4, 0.3, 0.6);
  el('line', { x1: 80, y1: 1180, x2: 1000, y2: 1180, stroke: TH.line, 'stroke-width': 3, 'stroke-opacity': 0.5 }, cr);
  for (let i = 0; i < 26; i++) {
    const x = 100 + i * 35, ts = 96.5 + i * 0.09;
    const c = el('path', { d: `M${x} 1180 l${-6 + R3() * 12} -22 l${-8 + R3() * 16} -16`, fill: 'none', stroke: TH.red[1], 'stroke-width': 4, 'stroke-linecap': 'round', filter: 'url(#gRed)' }, cr);
    updaters.push(t => c.setAttribute('opacity', eOut(prog(t, ts, 0.2)).toFixed(3)));
  }
  const tl = win(96.6, 100.4, 0.3, 0.6);
  label({ str: 'A LONG TIME', x: 540, y: 1250, t0: 97.6, t1: 100.0, size: 30, ls: 12, fill: TH.red[0], parent: tl });
}


// trophy in his hand on the podium
{
  const tw = win(15.9, 18.85, 0.3, 0.3);
  const tg = el('g', { filter: 'url(#gGold)' }, tw);
  el('path', { d: 'M-34 -70 H34 Q34 -20 0 -10 Q-34 -20 -34 -70 Z M-6 -10 H6 V8 H-6 Z M-24 8 H24 V20 H-24 Z', fill: GOLDF }, tg);
  el('path', { d: 'M-34 -60 Q-58 -60 -50 -38 Q-44 -26 -28 -30 M34 -60 Q58 -60 50 -38 Q44 -26 28 -30', fill: 'none', stroke: TH.gold[2], 'stroke-width': 6 }, tg);
  follow(tg, () => [HERO.hand[0], HERO.hand[1] + 6, 0, 1]);
}
// give: gold heart in his hand (S6)
{
  const hw = win(28.8, 32.45, 0.3, 0.15);
  const hg = el('g', { filter: 'url(#gGold)' }, hw); heart(hg, GOLDF, 0.6);
  follow(hg, () => [HERO.hand[0] - 6, HERO.hand[1] - 28, 0, 1]);
  // cracked heart falls
  const cw = win(32.45, 33.6, 0.05, 0.3);
  const hl = el('g', { filter: 'url(#gRed)' }, cw), hr = el('g', { filter: 'url(#gRed)' }, cw);
  el('path', { d: 'M0 34 C-70 -8 -46 -66 0 -32 L-10 -8 L6 6 Z', fill: REDF, transform: 'scale(0.6)' }, hl);
  el('path', { d: 'M0 34 C70 -8 46 -66 0 -32 L-10 -8 L6 6 Z', fill: REDF, transform: 'scale(0.6)' }, hr);
  let anchor = null;
  updaters.push(t => { if (t < 32.4) anchor = [HERO.hand[0] - 6, HERO.hand[1] - 28]; });
  follow(hl, t => { const p = prog(t, 32.45, 1.0), a = anchor ?? [600, 1000]; return [a[0] - 30 * p, a[1] + 300 * p * p, -30 * p, 1]; });
  follow(hr, t => { const p = prog(t, 32.45, 1.0), a = anchor ?? [600, 1000]; return [a[0] + 30 * p, a[1] + 280 * p * p, 30 * p, 1]; });
}


/* ===================== title + karaoke subtitles ===================== */
{
  const tg = item({ x: CX, y: 250, t0: 0, t1: 99.6, fo: 0.8, rise: 0, s0: 1 });
  const tt = text(tg, { str: '', size: 70, weight: 700, disp: true, fill: TH.text });
  tt.innerHTML = `Letter <tspan fill="${TH.glow ? 'url(#tGold)' : TH.gold[2]}">"A"</tspan>`;
  // chunk words into short lines
  const chunks = []; let cur = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const len = cur.map(x => x[0]).join(' ').length, end = /[.,?!]$/.test(w[0]);
    if ((end && cur.length >= 2) || cur.length >= 5 || len > 24 || i === WORDS.length - 1) { chunks.push(cur); cur = []; }
  });
  const sg = el('g', {}, root);
  const lines = chunks.map((c, ci) => {
    const t0 = c[0][1] - 0.04, t1 = ci + 1 < chunks.length ? chunks[ci + 1][0][1] - 0.04 : c[c.length - 1][2] + 1.0;
    const tx = el('text', { x: CX, y: 395, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': 58, 'font-weight': 700 }, sg);
    const spans = c.map(([w, ws]) => {
      const sp = document.createElementNS(NS, 'tspan');
      sp.textContent = w + ' '; tx.appendChild(sp);
      return [sp, ws, /^"?A"?[.,]?$/.test(w)];
    });
    return { tx, t0, t1, spans };
  });
  updaters.push(t => {
    for (const L of lines) {
      if (t < L.t0 || t >= L.t1) { L.tx.setAttribute('display', 'none'); continue; }
      L.tx.removeAttribute('display');
      L.tx.setAttribute('opacity', Math.min(1, (t - L.t0) / 0.08).toFixed(2));
      for (const [sp, ws, isA] of L.spans) sp.setAttribute('fill', t >= ws - 0.02 ? (isA ? TH.gold[1] : TH.text) : TH.muted);
    }
  });
}

window.DURATION = 100.6;
