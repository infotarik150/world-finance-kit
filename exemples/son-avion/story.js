// "The sound that can reveal your location" — 65 s, horizontal, noir theme, no music.
// Times come from words.js (measured on the final audio, pauses included). T(i) = onset of word i.
const T = i => WORDS[i][1];
const G = H - 150;
const END = 65.0;
const CYAN = '#5EE6FF', CYAN_D = '#1FA8CC';
const GOLD = TH.gold[1];
const R7 = rnd(42);

// ---------- extra defs: cyan gradient + glow, clip paths ----------
const DEFS = document.querySelector('defs');
DEFS.insertAdjacentHTML('beforeend', `
  <linearGradient id="tCyan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6FCFF"/><stop offset="0.45" stop-color="#7FEBFF"/><stop offset="1" stop-color="#1FA8CC"/></linearGradient>
  <filter id="gCyan" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b1"/><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b2"/>
    <feComponentTransfer in="b1" result="b1s"><feFuncA type="linear" slope="0.8"/></feComponentTransfer>
    <feComponentTransfer in="b2" result="b2s"><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
    <feMerge><feMergeNode in="b1s"/><feMergeNode in="b2s"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="gCyanU" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
    <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b1"/>
    <feComponentTransfer in="b1" result="b1s"><feFuncA type="linear" slope="0.9"/></feComponentTransfer>
    <feMerge><feMergeNode in="b1s"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <linearGradient id="skyCam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15181D"/><stop offset="1" stop-color="#2A2E34"/></linearGradient>
  <clipPath id="cMon"><rect x="200" y="200" width="1520" height="700" rx="18"/></clipPath>
  <clipPath id="cMap"><rect x="470" y="196" width="1360" height="722" rx="22"/></clipPath>
  <clipPath id="cSat"><rect x="120" y="196" width="1680" height="722" rx="22"/></clipPath>
  <clipPath id="cStreet"><rect x="60" y="196" width="1800" height="740" rx="22"/></clipPath>
  <clipPath id="cLens"><circle id="lensC" cx="0" cy="0" r="105"/></clipPath>`);

// ---------- generic helpers ----------
function fader(parent, fn) {
  const g = el('g', {}, parent);
  updaters.push(t => { const a = fn(t); if (a <= 0.001) g.setAttribute('display', 'none'); else { g.removeAttribute('display'); g.setAttribute('opacity', a.toFixed(3)); } });
  return g;
}
const win = (parent, t0, t1, fi = 0.3, fo = 0.3) => fader(parent, t => Math.min(eOut(prog(t, t0, fi)), 1 - eIn(prog(t, t1, fo))));
function follow(g, fn) { updaters.push(t => { const [x, y, r = 0, s = 1, sy] = fn(t); g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)},${(sy ?? s).toFixed(4)})`); }); return g; }
const lerp = (a, b, k) => a + (b - a) * k;
// A scene: cross-fades in/out and slowly pushes in (no hard cuts).
function stage(t0, t1, push = 0.035, cy = 560) {
  const g = el('g', {}, root), inner = el('g', {}, g);
  updaters.push(t => {
    const a = Math.min(eOut(prog(t, t0 - 0.25, 0.45)), 1 - eIn(prog(t, t1 - 0.2, 0.45)));
    if (a <= 0.001) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display'); g.setAttribute('opacity', a.toFixed(3));
    const s = 1 + push * eIO(prog(t, t0, t1 - t0));
    g.setAttribute('transform', `translate(${CX},${cy}) scale(${s.toFixed(4)}) translate(${-CX},${-cy})`);
  });
  return inner;
}
// On-screen title at the bottom: html may contain <c>..</c> for the cyan keyword.
function caption(html, t0, t1) {
  const g = item({ x: CX, y: H - 72, t0, t1, fi: 0.35, fo: 0.3, rise: 18, s0: 0.96 });
  const tx = text(g, { str: '', size: 42, weight: 800, ls: 7, disp: true, fill: TH.text });
  tx.innerHTML = html.replace(/<c>/g, `<tspan fill="${CYAN}">`).replace(/<\/c>/g, '</tspan>');
  return g;
}
const PLANE = 'M54 0 Q50 -6 38 -6 L8 -6 L-14 -40 L-24 -40 L-10 -6 L-36 -6 L-46 -20 L-54 -20 L-48 -6 Q-56 -4 -56 0 Q-56 4 -48 6 L-54 20 L-46 20 L-36 6 L-10 6 L-24 40 L-14 40 L8 6 L38 6 Q50 6 54 0 Z';
function plane(parent, o = {}) {
  const g = el('g', {}, parent);
  el('path', { d: PLANE, fill: o.fill ?? 'none', stroke: o.stroke ?? CYAN, 'stroke-width': o.sw ?? 4, 'stroke-linejoin': 'round' }, g);
  return g;
}
// Doppler frequency (0..1 across the pass): high before, falling S, low after
const dop = (u, w = 0.085) => -Math.tanh((u - 0.5) / w);
function curvePath(x, y, w, h, base, amp, w0 = 0.085, n = 90) {
  let d = '';
  for (let i = 0; i <= n; i++) { const u = i / n, f = base + amp * dop(u, w0); d += (i ? 'L' : 'M') + (x + u * w).toFixed(1) + ' ' + (y + h - f * h).toFixed(1) + ' '; }
  return d;
}
// Spectrogram panel (dark, grid, faint noise)
function spectro(parent, x, y, w, h, seed, o = {}) {
  const g = el('g', {}, parent), r = rnd(seed);
  el('rect', { x, y, width: w, height: h, rx: 14, fill: '#0B1013', stroke: '#2C3A40', 'stroke-width': 3 }, g);
  for (let i = 1; i < 8; i++) el('line', { x1: x + i * w / 8, y1: y + 8, x2: x + i * w / 8, y2: y + h - 8, stroke: '#18242A', 'stroke-width': 2 }, g);
  for (let i = 1; i < 5; i++) el('line', { x1: x + 8, y1: y + i * h / 5, x2: x + w - 8, y2: y + i * h / 5, stroke: '#18242A', 'stroke-width': 2 }, g);
  for (let i = 0; i < (o.noise ?? 520); i++) {
    const nx = x + 10 + r() * (w - 20), ny = y + 10 + r() * (h - 20), lo = (ny - y) / h;
    el('rect', { x: nx, y: ny, width: 3 + r() * 9, height: 2, fill: '#5A8A99', opacity: (0.05 + 0.22 * r() * lo).toFixed(2) }, g);
  }
  text(g, { str: 'FREQUENCY', x: x - 34, y: y + h / 2, size: 20, weight: 700, ls: 6, fill: '#6F8A94' }).setAttribute('transform', `rotate(-90 ${x - 34} ${y + h / 2})`);
  text(g, { str: 'TIME', x: x + w / 2, y: y + h + 32, size: 20, weight: 700, ls: 6, fill: '#6F8A94' });
  return g;
}
// Ordinary suburban street, drawn inside the box (0,0,w,h), muted surveillance greys.
function street(parent, w, h, o = {}) {
  const g = el('g', {}, parent);
  const vx = w / 2, vy = h * 0.47;
  el('rect', { x: 0, y: 0, width: w, height: h, fill: 'url(#skyCam)' }, g);
  el('rect', { x: 0, y: vy, width: w, height: h - vy, fill: '#24282D' }, g);
  // power line
  el('path', { d: `M0 ${h * 0.2} Q${w * 0.3} ${h * 0.27} ${w * 0.55} ${h * 0.22} T${w} ${h * 0.24}`, fill: 'none', stroke: '#3B4047', 'stroke-width': 3 }, g);
  // road in perspective
  el('path', { d: `M${w * 0.22} ${h} L${vx - 14} ${vy} H${vx + 14} L${w * 0.78} ${h} Z`, fill: '#1B1E22' }, g);
  for (let k = 0; k < 7; k++) {
    const a = Math.pow(k / 7, 1.9), b = Math.pow((k + 0.45) / 7, 1.9);
    el('path', { d: `M${vx - 1 - 3 * a} ${lerp(vy, h, a)} L${vx - 1 - 3 * b} ${lerp(vy, h, b)} L${vx + 1 + 3 * b} ${lerp(vy, h, b)} L${vx + 1 + 3 * a} ${lerp(vy, h, a)} Z`, fill: '#4A4E54' }, g);
  }
  el('path', { d: `M${w * 0.15} ${h} L${vx - 30} ${vy}`, stroke: '#3A3E44', 'stroke-width': 4 }, g);
  el('path', { d: `M${w * 0.85} ${h} L${vx + 30} ${vy}`, stroke: '#3A3E44', 'stroke-width': 4 }, g);
  // houses on both sides (bigger = closer)
  const house = (x, base, s, side) => {
    const hw = 260 * s, hh = 170 * s, gg = el('g', {}, g);
    el('rect', { x: x - hw / 2, y: base - hh, width: hw, height: hh, fill: '#363A40', stroke: '#4A4F56', 'stroke-width': 2 }, gg);
    el('path', { d: `M${x - hw / 2 - 18 * s} ${base - hh} L${x} ${base - hh - 120 * s} L${x + hw / 2 + 18 * s} ${base - hh} Z`, fill: '#2A2D32', stroke: '#4A4F56', 'stroke-width': 2 }, gg);
    el('rect', { x: x - 26 * s + side * 50 * s, y: base - 92 * s, width: 52 * s, height: 92 * s, fill: '#22252A' }, gg);
    el('rect', { x: x - side * 70 * s - 32 * s, y: base - 130 * s, width: 64 * s, height: 48 * s, fill: o.lit ? '#6B5A3A' : '#4C5158' }, gg);
  };
  const tree = (x, base, s) => { el('rect', { x: x - 6 * s, y: base - 90 * s, width: 12 * s, height: 90 * s, fill: '#2A2D31' }, g); el('circle', { cx: x, cy: base - 120 * s, r: 58 * s, fill: '#2C3135' }, g); };
  house(w * 0.36, vy + 40, 0.42, 1); house(w * 0.64, vy + 40, 0.42, -1);
  tree(w * 0.43, vy + 46, 0.45); tree(w * 0.57, vy + 46, 0.45);
  house(w * 0.22, vy + 110, 0.8, 1); house(w * 0.78, vy + 110, 0.8, -1);
  tree(w * 0.31, vy + 140, 0.8);
  house(w * 0.03, vy + 230, 1.35, 1); house(w * 0.97, vy + 230, 1.35, -1);
  // street lamp
  el('path', { d: `M${w * 0.69} ${h * 0.93} V${h * 0.42} Q${w * 0.69} ${h * 0.38} ${w * 0.66} ${h * 0.38}`, fill: 'none', stroke: '#454A51', 'stroke-width': 6 }, g);
  return g;
}

const BACKL = el('g', {}, root);

/* =================== S1 · THE HOOK (0 – 5.95) =================== */
{
  const S1end = T(13) - 0.1;
  const st = stage(0, S1end, 0.02);
  const mon = el('g', { 'clip-path': 'url(#cMon)' }, st);
  const cam = el('g', {}, mon);       // slow digital zoom (stops at the freeze)
  const scene = el('g', { transform: 'translate(200,200)' }, cam);
  street(scene, 1520, 700);
  // the faint airplane, revealed by the scan
  const ap = el('g', {}, scene);
  const apG = el('g', { transform: 'translate(1060,150) scale(0.55)' }, ap);
  el('path', { d: PLANE, fill: '#3A4048', stroke: 'none' }, apG);
  updaters.push(t => {
    const z = 1 + 0.035 * Math.min(t, 2.0) / 2.0;
    cam.setAttribute('transform', `translate(960,550) scale(${z}) translate(-960,-550)`);
    const rev = prog(t, 2.55, 0.25);
    apG.setAttribute('opacity', (0.35 + 0.65 * rev).toFixed(2));
  });
  const apHi = win(scene, 2.55, S1end, 0.2, 0.3);
  const ag = el('g', { transform: 'translate(1060,150) scale(0.55)', filter: 'url(#gCyan)' }, apHi);
  el('path', { d: PLANE, fill: 'none', stroke: CYAN, 'stroke-width': 6, 'stroke-linejoin': 'round' }, ag);
  const br = el('g', { transform: 'translate(1060,150)' }, apHi);
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) el('path', { d: `M${sx * 70} ${sy * 38} h${-sx * 22} M${sx * 70} ${sy * 38} v${-sy * 18}`, stroke: CYAN, 'stroke-width': 4, fill: 'none' }, br);
  text(br, { str: 'AIRCRAFT', x: 0, y: -60, size: 20, weight: 700, ls: 6, fill: CYAN });
  // scanlines + CCTV overlay
  const ov = el('g', {}, mon);
  for (let y = 204; y < 900; y += 7) el('line', { x1: 200, y1: y, x2: 1720, y2: y, stroke: '#000', 'stroke-width': 2, opacity: 0.18 }, ov);
  const rec = el('circle', { cx: 252, cy: 246, r: 11, fill: TH.red[1] }, ov);
  text(ov, { str: 'REC', x: 274, y: 247, size: 26, weight: 700, anchor: 'start', ls: 3, fill: '#E9EAEC' });
  text(ov, { str: 'CAM 03 · FRONT STREET', x: 1680, y: 247, size: 22, weight: 600, anchor: 'end', ls: 4, fill: '#C9CBCF' });
  const ts = text(ov, { str: '', x: 1680, y: 866, size: 26, weight: 600, anchor: 'end', ls: 2, fill: '#E9EAEC' });
  const paused = text(ov, { str: '❚❚  FROZEN', x: 240, y: 866, size: 26, weight: 800, anchor: 'start', ls: 5, fill: CYAN });
  updaters.push(t => {
    const s = Math.floor(7 + Math.min(t, 2.0) * 1);
    ts.textContent = `11/07/2026  14:32:${String(s).padStart(2, '0')}`;
    rec.setAttribute('opacity', t < 2.0 ? ((t % 1) < 0.6 ? 1 : 0.15) : 0.15);
    paused.setAttribute('opacity', t >= 2.0 ? 1 : 0);
  });
  // freeze flash + scan bar
  const fl = el('rect', { x: 200, y: 200, width: 1520, height: 700, fill: '#FFFFFF' }, mon);
  updaters.push(t => fl.setAttribute('opacity', (t >= 2.0 ? 0.28 * (1 - prog(t, 2.0, 0.25)) : 0).toFixed(3)));
  const scan = el('g', {}, mon);
  el('rect', { x: 200, y: -40, width: 1520, height: 80, fill: CYAN, opacity: 0.12 }, scan);
  el('line', { x1: 200, y1: 0, x2: 1720, y2: 0, stroke: CYAN, 'stroke-width': 3, filter: 'url(#gCyan)' }, scan);
  updaters.push(t => {
    const p = prog(t, 2.1, 0.8);
    if (t < 2.1 || p >= 1) { scan.setAttribute('display', 'none'); return; }
    scan.removeAttribute('display'); scan.setAttribute('transform', `translate(0,${200 + 700 * eIO(p)})`);
  });
  // monitor frame
  el('rect', { x: 200, y: 200, width: 1520, height: 700, rx: 18, fill: 'none', stroke: '#4A4F57', 'stroke-width': 5 }, st);
  // the frame dissolves into a glowing waveform (3.4 → 4.4)
  const pic = [mon];
  updaters.push(t => { const k = 1 - 0.85 * eIO(prog(t, 3.5, 0.9)); mon.setAttribute('opacity', k.toFixed(3)); });
  const wv = win(st, 3.45, S1end + 0.4, 0.2, 0.01);
  const wp = el('path', { fill: 'none', stroke: CYAN, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#gCyanU)', pathLength: 1, 'stroke-dasharray': 1 }, wv);
  updaters.push(t => {
    if (t < 3.4) return;
    let d = '';
    for (let i = 0; i <= 220; i++) {
      const u = i / 220, x = 230 + u * 1460, env = Math.pow(Math.sin(Math.PI * u), 1.6);
      const y = 550 + env * (70 * Math.sin(u * 46 + t * 7) * Math.sin(u * 9 - t * 2.3) + 28 * Math.sin(u * 131 + t * 13));
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
    }
    wp.setAttribute('d', d);
    wp.setAttribute('stroke-dashoffset', (1 - eIO(prog(t, 3.45, 0.9))).toFixed(3));
  });
  caption('YOUR LOCATION IS HIDING IN THE <c>SOUND</c>.', 3.3, S1end);
}

/* =================== S2 · THE INVISIBLE CLUE (5.95 – 13.24) =================== */
{
  const t0 = T(13) - 0.1, t1 = T(31) - 0.1;
  const st = stage(t0, t1);
  const PX = 640, PY = 250, PW = 1120, PH = 560;
  const grow = el('g', {}, st);
  updaters.push(t => { const k = eOut(prog(t, t0, 0.7)); grow.setAttribute('transform', `translate(0,${PY + PH / 2}) scale(1,${(0.02 + 0.98 * k).toFixed(3)}) translate(0,${-(PY + PH / 2)})`); });
  spectro(grow, PX, PY, PW, PH, 11);
  const cd = curvePath(PX, PY, PW, PH, 0.48, 0.12);
  el('path', { d: cd, fill: 'none', stroke: CYAN, 'stroke-width': 3, opacity: 0.13 }, grow);
  el('path', { d: curvePath(PX, PY, PW, PH, 0.24, 0.06), fill: 'none', stroke: CYAN, 'stroke-width': 2, opacity: 0.08 }, grow);
  // magnifying lens sweeps along the curve: inside it, the hidden trace is bright
  const lensT0 = T(22) - 0.1;
  const inLens = el('g', { 'clip-path': 'url(#cLens)' }, st);
  el('rect', { x: PX, y: PY, width: PW, height: PH, fill: '#0F1A1F' }, inLens);
  el('path', { d: cd, fill: 'none', stroke: CYAN, 'stroke-width': 7, filter: 'url(#gCyanU)' }, inLens);
  el('path', { d: curvePath(PX, PY, PW, PH, 0.24, 0.06), fill: 'none', stroke: CYAN, 'stroke-width': 4, opacity: 0.7 }, inLens);
  const lens = el('g', {}, st);
  el('circle', { r: 105, fill: 'none', stroke: INK, 'stroke-width': 12 }, lens);
  el('circle', { r: 105, fill: 'none', stroke: CYAN, 'stroke-width': 3, opacity: 0.8 }, lens);
  el('path', { d: 'M74 74 L150 150', stroke: INK, 'stroke-width': 26, 'stroke-linecap': 'round' }, lens);
  el('path', { d: 'M78 78 L146 146', stroke: GOLD, 'stroke-width': 14, 'stroke-linecap': 'round' }, lens);
  const lensC = document.getElementById('lensC');
  const lensU = t => lerp(0.12, 0.62, eIO(prog(t, lensT0 + 0.3, t1 - lensT0 - 0.6)));
  updaters.push(t => {
    const a = eOut(prog(t, lensT0, 0.35));
    const u = lensU(t), x = PX + u * PW, y = PY + PH - (0.48 + 0.12 * dop(u)) * PH;
    lens.setAttribute('transform', `translate(${x},${y + (1 - a) * 60}) scale(${0.6 + 0.4 * a})`);
    lens.setAttribute('opacity', a.toFixed(3)); inLens.setAttribute('opacity', a.toFixed(3));
    lensC.setAttribute('cx', x); lensC.setAttribute('cy', y + (1 - a) * 60); lensC.setAttribute('r', 105 * (0.6 + 0.4 * a));
  });
  // the airplane appears above the spectrogram on "airplane"
  const pw = win(st, T(28) - 0.1, t1 + 0.3, 0.3, 0.01);
  const pg = plane(pw, { sw: 4 });
  pg.setAttribute('filter', 'url(#gCyan)');
  follow(pg, t => [PX + lensU(t) * PW, PY - 52 + 6 * Math.sin(t * 3), 0, 0.85]);
  // hero: investigator
  makeNoodle(st, [
    [t0, { pose: 'stand', x: 330, y: G, s: 0.72, look: 0.6 }, 0.01],
    [T(15), { pose: 'shrug', look: 0.3 }, 0.35],
    [T(22), { pose: 'point', look: 0.7, mouth: 0.6 }, 0.35],
    [T(28), { pose: 'point', look: 0.8, mouthOpen: 1, mouth: 0.2 }, 0.3],
    [T(29) + 0.4, { pose: 'think', look: 0.6 }, 0.45],
  ], { hero: true });
  el('line', { x1: 80, y1: G + 2, x2: 560, y2: G + 2, stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, st);
  // "not in the image": a crossed picture frame next to the hero
  const nf = win(st, T(16) - 0.1, T(19) + 0.2, 0.25, 0.3);
  el('rect', { x: 180, y: 300, width: 160, height: 110, rx: 10, fill: 'none', stroke: INK, 'stroke-width': 5 }, nf);
  el('path', { d: 'M195 395 L245 345 L275 372 L300 350 L325 395 Z', fill: '#3A3E44' }, nf);
  const xs = el('path', { d: 'M170 290 L350 420 M350 290 L170 420', stroke: TH.red[1], 'stroke-width': 8, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 }, nf);
  updaters.push(t => xs.setAttribute('stroke-dashoffset', (1 - eOut(prog(t, T(18), 0.3))).toFixed(3)));
  caption('AN AIRPLANE. A <c>SOUND</c>. A CLUE.', T(28) - 0.1, t1);
}

/* =================== S3 · THE DOPPLER EFFECT (13.24 – 20.9) =================== */
{
  const t0 = T(31) - 0.1, t1 = T(48) - 0.1;
  const st = stage(t0, t1, 0.02);
  el('line', { x1: 80, y1: G + 2, x2: W - 80, y2: G + 2, stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, st);
  const HX = 900, PY = 380, V = 300, C = 520;
  const tPass = T(40); // "passes" = the plane is right above the hero
  const px = t => HX + (t - tPass) * V;
  // sound rings emitted along the path: squeezed ahead, stretched behind
  const ringsG = el('g', {}, st);
  const rings = [];
  for (let k = 0; k < 46; k++) rings.push([t0 - 0.9 + k * 0.19, el('circle', { cx: 0, cy: PY, r: 1, fill: 'none', stroke: CYAN, 'stroke-width': 3 }, ringsG)]);
  updaters.push(t => {
    for (const [te, c] of rings) {
      const r = C * (t - te);
      if (t < te || r > 1150) { c.setAttribute('display', 'none'); continue; }
      c.removeAttribute('display');
      c.setAttribute('cx', px(te).toFixed(1)); c.setAttribute('r', r.toFixed(1));
      c.setAttribute('opacity', (0.6 * (1 - r / 1150) * Math.min(1, r / 30)).toFixed(3));
    }
  });
  const pg = plane(st, { fill: '#E9EEF2', stroke: INK, sw: 4 });
  follow(pg, t => [px(t), PY + 4 * Math.sin(t * 2), 0, 1.25]);
  // HIGHER / LOWER labels riding with the plane
  const hi = win(st, T(37) - 0.15, T(40) + 0.2, 0.25, 0.3);
  const hiT = el('g', {}, hi); text(hiT, { str: 'HIGHER ▲', size: 34, weight: 800, ls: 5, fill: CYAN });
  follow(hiT, t => [px(t) + 210, PY - 120, 0, 1]);
  const lo = win(st, T(42) - 0.1, t1, 0.25, 0.3);
  const loT = el('g', {}, lo); text(loT, { str: '▼ LOWER', size: 34, weight: 800, ls: 5, fill: '#8FB3C0' });
  follow(loT, t => [px(t) - 250, PY - 120, 0, 1]);
  // pitch meter, drawn live as the plane passes
  const MX = 1380, MY = 600, MW = 420, MH = 230;
  const meter = win(st, t0 + 0.3, t1, 0.4, 0.3);
  el('rect', { x: MX, y: MY, width: MW, height: MH, rx: 14, fill: '#0B1013', stroke: '#2C3A40', 'stroke-width': 3 }, meter);
  text(meter, { str: 'PITCH', x: MX + 22, y: MY + 28, size: 20, weight: 700, ls: 6, anchor: 'start', fill: '#6F8A94' });
  const mp = el('path', { fill: 'none', stroke: CYAN, 'stroke-width': 5, 'stroke-linecap': 'round', filter: 'url(#gCyanU)' }, meter);
  const md = el('circle', { r: 8, fill: CYAN }, meter);
  updaters.push(t => {
    const a = t0, b = t1 - 0.3; let d = '', last = null;
    for (let i = 0; i <= 80; i++) {
      const tt = lerp(a, b, i / 80); if (tt > t) break;
      const f = -Math.tanh((px(tt) - HX) / 230);
      last = [MX + 20 + (MW - 40) * i / 80, MY + MH / 2 + 10 - f * (MH / 2 - 40)];
      d += (i ? 'L' : 'M') + last[0].toFixed(1) + ' ' + last[1].toFixed(1) + ' ';
    }
    mp.setAttribute('d', d || 'M0 0');
    if (last) { md.setAttribute('cx', last[0]); md.setAttribute('cy', last[1]); }
  });
  // hero = the listener on the ground, following the plane with the eyes
  makeNoodle(st, [
    [t0, { pose: 'stand', x: HX, y: G, s: 0.72, look: -0.8 }, 0.01],
    [T(32), { pose: 'stand', look: -0.8, aL: [125, -25], hL: 1, mouth: 0.6 }, 0.4],
    [T(37), { pose: 'happy', look: -0.2, mouth: 0.9 }, 0.35],
    [T(40), { pose: 'shrug', look: 0.6, mouth: -0.1 }, 0.5],
    [T(43), { pose: 'sad', look: 0.8, mouth: -0.3, tilt: 2 }, 0.4],
    [T(46), { pose: 'proud', look: 0.2 }, 0.4],
  ], { hero: true });
  caption('THE <c>DOPPLER</c> EFFECT', T(44) - 0.1, t1);
}

/* =================== S4 · THE ACOUSTIC FINGERPRINT (20.9 – 26.8) =================== */
{
  const t0 = T(48) - 0.1, t1 = T(62) - 0.1;
  const st = stage(t0, t1, 0.0);
  const PX = 520, PY = 230, PW = 1180, PH = 620;
  const z = el('g', {}, st);
  spectro(z, PX, PY, PW, PH, 23, { noise: 650 });
  const harm = [[0.2, 0.05, 3, 0.45], [0.4, 0.1, 4, 0.7], [0.6, 0.15, 6, 1]];
  const draws = [];
  harm.forEach(([b, a, sw, op], i) => {
    const p = el('path', { d: curvePath(PX + 10, PY, PW - 20, PH, b, a, 0.075), fill: 'none', stroke: CYAN, 'stroke-width': sw, opacity: op, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, filter: i === 2 ? 'url(#gCyanU)' : '' }, z);
    draws.push(p);
  });
  updaters.push(t => draws.forEach((p, i) => p.setAttribute('stroke-dashoffset', (1 - eIO(prog(t, T(49) - 0.2 + i * 0.15, 2.0))).toFixed(3))));
  // highlighted section (the "signature")
  const cxh = PX + PW / 2, cyh = PY + PH - 0.6 * PH;
  const hiW = win(z, T(53) - 0.1, T(57) - 0.3, 0.3, 0.3);
  el('rect', { x: cxh - 150, y: PY + 20, width: 300, height: PH - 40, rx: 12, fill: CYAN, opacity: 0.06, stroke: CYAN, 'stroke-opacity': 0.5, 'stroke-width': 2, 'stroke-dasharray': '10 10' }, hiW);
  text(hiW, { str: 'SIGNATURE', x: cxh, y: PY + 48, size: 20, weight: 700, ls: 6, fill: CYAN });
  // fingerprint ridges grow around the falling S
  const fp = win(z, T(60) - 0.2, t1, 0.3, 0.2);
  const ridges = [];
  for (let k = 0; k < 9; k++) {
    const rx = 18 + 13 * k, ry = 26 + 16 * k, a0 = (110 + k * 23) * Math.PI / 180;
    let d = '';
    for (let i = 0; i <= 40; i++) { const th = a0 + (i / 40) * 5.1; d += (i ? 'L' : 'M') + (cxh + rx * Math.cos(th)).toFixed(1) + ' ' + (cyh + ry * Math.sin(th)).toFixed(1) + ' '; }
    ridges.push(el('path', { d, fill: 'none', stroke: CYAN, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.85, pathLength: 1, 'stroke-dasharray': 1 }, fp));
  }
  updaters.push(t => ridges.forEach((r, k) => r.setAttribute('stroke-dashoffset', (1 - eOut(prog(t, T(60) - 0.2 + k * 0.05, 0.6))).toFixed(3))));
  // slow macro zoom into the highlighted curve
  updaters.push(t => {
    const s = 1 + 0.45 * eIO(prog(t, T(57) - 0.3, 1.7));
    z.setAttribute('transform', `translate(${cxh},${cyh}) scale(${s.toFixed(4)}) translate(${-cxh},${-cyh})`);
  });
  // hero points from the left
  makeNoodle(st, [
    [t0, { pose: 'point', x: 230, y: G, s: 0.62, look: 0.7 }, 0.01],
    [T(53), { pose: 'point', look: 0.8, mouth: 0.8 }, 0.3],
    [T(57), { pose: 'happy', look: 0.5 }, 0.4],
  ], { hero: true });
  el('line', { x1: 60, y1: G + 2, x2: 420, y2: G + 2, stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, st);
  caption('<c>ACOUSTIC FINGERPRINT</c>', T(53) - 0.1, t1);
}

/* =================== S5 + S6 · FLIGHT DATA → INVESTIGATION (26.8 – 42.1) =================== */
const TARGET = [-86.5, 39.8];
{
  const t0 = T(62) - 0.1, t1 = T(95) - 0.1;
  const st = stage(t0, t1, 0.0);
  const MX = 520, MY = 222;
  const P = (lon, lat) => [MX + (lon + 125) * 21.5, MY + (49.6 - lat) * 28];
  const US = [[-124.7, 48.4], [-124.0, 46.3], [-124.2, 43.0], [-124.4, 40.4], [-122.4, 37.8], [-120.6, 34.6], [-117.1, 32.5], [-114.8, 32.5], [-111.0, 31.3], [-108.2, 31.3], [-106.5, 31.8], [-104.5, 29.6], [-103.0, 29.0], [-101.4, 29.8], [-99.5, 27.5], [-97.4, 25.9], [-97.4, 27.8], [-94.7, 29.4], [-93.8, 29.7], [-91.5, 29.5], [-89.4, 29.0], [-89.6, 30.2], [-88.0, 30.6], [-85.4, 29.7], [-84.0, 30.0], [-82.8, 28.0], [-81.8, 26.1], [-80.4, 25.2], [-80.0, 26.8], [-80.6, 28.5], [-81.4, 30.7], [-80.9, 32.0], [-79.1, 33.4], [-77.9, 34.0], [-75.5, 35.2], [-76.0, 36.9], [-75.2, 38.5], [-74.0, 39.7], [-74.0, 40.6], [-71.9, 41.3], [-70.0, 41.7], [-70.6, 42.6], [-70.2, 43.7], [-67.0, 44.8], [-67.8, 47.1], [-69.2, 47.4], [-71.0, 45.0], [-74.9, 45.0], [-76.8, 43.6], [-79.1, 43.3], [-79.0, 42.9], [-82.7, 41.7], [-83.5, 42.0], [-82.4, 43.0], [-82.5, 45.3], [-84.5, 46.5], [-88.4, 48.3], [-89.6, 48.0], [-95.2, 49.0], [-123.0, 49.0], [-123.2, 48.3]];
  const clip = el('g', { 'clip-path': 'url(#cMap)' }, st);
  el('rect', { x: 470, y: 196, width: 1360, height: 722, rx: 22, fill: '#0A0F12' }, clip);
  const map = el('g', {}, clip);
  const NS_ = { 'vector-effect': 'non-scaling-stroke' };
  // faint lat/lon grid
  for (let lon = -120; lon <= -70; lon += 5) { const [x] = P(lon, 0); el('line', { x1: x, y1: 150, x2: x, y2: 1000, stroke: '#14212A', 'stroke-width': 1.5, ...NS_ }, map); }
  for (let lat = 25; lat <= 50; lat += 5) { const [, y] = P(0, lat); el('line', { x1: 380, y1: y, x2: 1900, y2: y, stroke: '#14212A', 'stroke-width': 1.5, ...NS_ }, map); }
  el('path', { d: 'M' + US.map(p => P(...p).map(v => v.toFixed(1)).join(' ')).join(' L') + ' Z', fill: '#16242C', stroke: '#4E6C78', 'stroke-width': 3, 'stroke-linejoin': 'round', ...NS_ }, map);
  // city dots
  const C = { SEA: [-122.3, 47.6], SF: [-122.4, 37.8], LA: [-118.2, 34.0], PHX: [-112.1, 33.4], DEN: [-104.9, 39.7], DAL: [-96.8, 32.8], HOU: [-95.4, 29.8], CHI: [-87.6, 41.9], ATL: [-84.4, 33.7], MIA: [-80.2, 25.8], NYC: [-74.0, 40.7], BOS: [-71.1, 42.4], MSP: [-93.3, 44.9], STL: [-90.2, 38.6], LAS: [-115.1, 36.2], SLC: [-111.9, 40.8], CLT: [-80.8, 35.2], DET: [-83.0, 42.3], BNA: [-86.8, 36.2], DCA: [-77.0, 38.9], MCI: [-94.6, 39.1] };
  for (const k in C) el('circle', { cx: P(...C[k])[0], cy: P(...C[k])[1], r: 4, fill: '#6F8A94' }, map);
  // flight paths: [from, to, bend, keep]
  const ROUTES = [['SEA', 'CHI', 0.12], ['SF', 'NYC', 0.1], ['LA', 'ATL', 0.1], ['PHX', 'DEN', 0.1], ['LAS', 'MSP', 0.1], ['SLC', 'DAL', -0.08], ['HOU', 'BOS', 0.1], ['MIA', 'NYC', -0.12], ['DAL', 'CLT', 0.1], ['DEN', 'NYC', 0.07], ['SEA', 'LA', -0.1], ['MSP', 'ATL', -0.08],
    ['CHI', 'ATL', 0.03, 1], ['MCI', 'DCA', 0.04, 1], ['STL', 'DET', 0.02, 1], ['BNA', 'DET', -0.05, 1]];
  const routes = ROUTES.map(([a, b, bend, keep], i) => {
    const A = P(...C[a]), B = P(...C[b]);
    const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
    const Q = [mx + dy / L * bend * L, my - Math.abs(dx / L) * bend * L];
    const path = el('path', { d: `M${A[0]} ${A[1]} Q${Q[0]} ${Q[1]} ${B[0]} ${B[1]}`, fill: 'none', stroke: CYAN, 'stroke-width': keep ? 3.5 : 2.5, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, ...NS_ }, map);
    const pl = el('g', {}, map); el('path', { d: PLANE, fill: '#E9EEF2', transform: 'scale(0.16)' }, pl);
    const bez = u => [(1 - u) ** 2 * A[0] + 2 * (1 - u) * u * Q[0] + u * u * B[0], (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * Q[1] + u * u * B[1]];
    const ts = T(62) + 0.1 + i * 0.16;
    return { path, pl, bez, ts, keep };
  });
  const narrow = T(74), zoomA = T(88) - 0.1, zoomB = T(94) + 0.4;
  const zoom = t => eIO(prog(t, zoomA, zoomB - zoomA));
  updaters.push(t => {
    const z = zoom(t), s = 1 + 2.6 * z;
    const TP = P(...TARGET), F = [1150, 560];
    const cx = lerp(TP[0], F[0], z), cy = lerp(TP[1], F[1], z);
    map.setAttribute('transform', `translate(${cx.toFixed(1)},${cy.toFixed(1)}) scale(${s.toFixed(4)}) translate(${-TP[0].toFixed(1)},${-TP[1].toFixed(1)})`);
    const dim = eIO(prog(t, narrow, 0.8));
    for (const r of routes) {
      const p = eIO(prog(t, r.ts, 1.6));
      r.path.setAttribute('stroke-dashoffset', (1 - p).toFixed(3));
      r.path.setAttribute('opacity', (r.keep ? 0.55 + 0.45 * dim : 0.75 * (1 - 0.8 * dim)).toFixed(3));
      r.path.setAttribute('stroke', r.keep ? lerpCol(dim) : '#7FA9B8');
      const u = ((t - r.ts) * 0.09 + (r.ts * 0.37) % 1) % 1;
      if (t < r.ts + 0.4) { r.pl.setAttribute('display', 'none'); continue; }
      r.pl.removeAttribute('display');
      const [x, y] = r.bez(u), [x2, y2] = r.bez(Math.min(1, u + 0.01));
      r.pl.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(Math.atan2(y2 - y, x2 - x) * 180 / Math.PI).toFixed(1)}) scale(${(1 / s).toFixed(3)})`);
      r.pl.setAttribute('opacity', (r.keep ? 1 : 1 - 0.8 * dim).toFixed(3));
    }
  });
  function lerpCol(k) { return k > 0.5 ? CYAN : '#7FA9B8'; }
  // candidate areas, eliminated one criterion at a time
  const CAND = [[TARGET, 99], [[-89.5, 40.6], T(82)], [[-84.3, 38.4], T(82)], [[-87.9, 37.5], T(83)], [[-83.6, 41.2], T(83)], [[-91.0, 39.3], T(86)]];
  CAND.forEach(([ll, tOut], i) => {
    const [x, y] = P(...ll);
    const g = el('g', {}, map);
    const ring = el('circle', { cx: x, cy: y, r: 26, fill: CYAN, 'fill-opacity': 0.08, stroke: CYAN, 'stroke-width': 3, 'stroke-dasharray': '8 7', ...NS_ }, g);
    const xm = el('path', { d: `M${x - 14} ${y - 14} L${x + 14} ${y + 14} M${x + 14} ${y - 14} L${x - 14} ${y + 14}`, stroke: TH.red[1], 'stroke-width': 4, 'stroke-linecap': 'round', ...NS_ }, g);
    const tin = T(80) + i * 0.08;
    updaters.push(t => {
      const a = Math.min(eOut(prog(t, tin, 0.3)), 1 - eIn(prog(t, tOut + 0.3, 0.35)));
      if (a <= 0.001) { g.setAttribute('display', 'none'); return; }
      g.removeAttribute('display'); g.setAttribute('opacity', a.toFixed(3));
      xm.setAttribute('opacity', t >= tOut ? 1 : 0);
      const pulse = i === 0 && t > T(87) ? 1 + 0.12 * Math.sin((t - T(87)) * 6) : 1;
      ring.setAttribute('r', (26 * pulse).toFixed(1));
      ring.setAttribute('stroke-dasharray', i === 0 && t > T(87) ? '1 0' : '8 7');
    });
  });
  // the recording's signature card, carried onto the map on "Compare"
  const card = win(st, T(62) - 0.05, T(70), 0.3, 0.4);
  const cg = el('g', {}, card);
  el('rect', { x: -95, y: -60, width: 190, height: 120, rx: 12, fill: '#0B1013', stroke: CYAN, 'stroke-width': 3 }, cg);
  el('path', { d: curvePath(-80, -50, 160, 100, 0.5, 0.25, 0.1, 40), fill: 'none', stroke: CYAN, 'stroke-width': 4 }, cg);
  follow(cg, t => { const p = eIO(prog(t, T(64), 1.2)); return [lerp(470, P(...TARGET)[0], p), lerp(560, P(...TARGET)[1], p), 0, 1 - 0.45 * p]; });
  // criteria chips
  const chips = [['TIMING', T(82)], ['FREQUENCY', T(83)], ['FLIGHT PATHS', T(86)]];
  chips.forEach(([s, tc], i) => {
    const w = win(st, T(80) + i * 0.1, t1, 0.25, 0.3);
    const g = el('g', { transform: `translate(${700 + i * 300},880)` }, w);
    const bg2 = el('rect', { x: -130, y: -30, width: 260, height: 60, rx: 30, fill: '#0B1013', stroke: '#3B5560', 'stroke-width': 3 }, g);
    const tx = text(g, { str: s, size: 24, weight: 800, ls: 5, fill: '#8FB3C0' });
    updaters.push(t => { const on = t >= tc; bg2.setAttribute('stroke', on ? CYAN : '#3B5560'); tx.setAttribute('fill', on ? CYAN : '#8FB3C0'); tx.textContent = (on ? '✓ ' : '') + s; });
  });
  // hero = the investigator, at the left of the map
  makeNoodle(st, [
    [t0, { pose: 'point', x: 260, y: G, s: 0.62, look: 0.7 }, 0.01],
    [T(70), { pose: 'think', look: 0.6 }, 0.45],
    [T(80), { pose: 'point', look: 0.7, mouth: 0.6 }, 0.35],
    [T(88), { pose: 'think', look: 0.5, brow: -0.4 }, 0.45],
    [T(93), { pose: 'proud', look: 0.4 }, 0.45],
  ], { hero: true });
  el('line', { x1: 60, y1: G + 2, x2: 450, y2: G + 2, stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, st);
  el('rect', { x: 470, y: 196, width: 1360, height: 722, rx: 22, fill: 'none', stroke: '#2C3A40', 'stroke-width': 3 }, st);
  caption('<c>SOUND</c> + FLIGHT DATA', T(66) - 0.1, T(80) - 0.1);
  caption('SEARCHING FOR A <c>MATCH</c>', T(80) + 0.2, t1);
}

/* =================== S7 · THE REVEAL (42.1 – 48.72) =================== */
{
  const t0 = T(95) - 0.1, t1 = T(110) - 0.1;
  const st = stage(t0, t1, 0.0);
  const clip = el('g', { 'clip-path': 'url(#cSat)' }, st);
  el('rect', { x: 120, y: 196, width: 1680, height: 722, fill: '#1C2125' }, clip);
  const hood = el('g', {}, clip);
  const NS_ = { 'vector-effect': 'non-scaling-stroke' };
  const r = rnd(5);
  const roadsX = [-1020, -420, 180, 780, 1380], roadsY = [-660, -260, 140, 540, 940];
  for (const x of roadsX) el('rect', { x: x - 32, y: -1200, width: 64, height: 2600, fill: '#2C3035' }, hood);
  for (const y of roadsY) el('rect', { x: -1600, y: y - 32, width: 3600, height: 64, fill: '#2C3035' }, hood);
  for (const x of roadsX) el('line', { x1: x, y1: -1200, x2: x, y2: 1400, stroke: '#565A60', 'stroke-width': 2, 'stroke-dasharray': '16 18', ...NS_ }, hood);
  for (const y of roadsY) el('line', { x1: -1600, y1: y, x2: 2000, y2: y, stroke: '#565A60', 'stroke-width': 2, 'stroke-dasharray': '16 18', ...NS_ }, hood);
  for (let bx = 0; bx < roadsX.length - 1; bx++) for (let by = 0; by < roadsY.length - 1; by++) {
    const x0 = roadsX[bx] + 50, x1 = roadsX[bx + 1] - 50, y0 = roadsY[by] + 50, y1 = roadsY[by + 1] - 50;
    for (let row = 0; row < 2; row++) for (let col = 0; col < 4; col++) {
      const hx = lerp(x0, x1, (col + 0.5) / 4), hy = lerp(y0, y1, row ? 0.75 : 0.25);
      el('rect', { x: hx - 48, y: hy - 38, width: 96, height: 76, rx: 4, fill: ['#3E434A', '#45403A', '#3A4047'][Math.floor(r() * 3)] }, hood);
      el('line', { x1: hx - 48, y1: hy, x2: hx + 48, y2: hy, stroke: '#2A2E33', 'stroke-width': 3, ...NS_ }, hood);
      if (r() < 0.6) el('circle', { cx: hx + (r() - 0.5) * 120, cy: hy + (row ? -1 : 1) * 70, r: 14 + r() * 16, fill: '#27332B' }, hood);
    }
  }
  // the target house is the one at block (1,1), row 1, col 1 → compute its centre
  const HXc = lerp(-420 + 50, 180 - 50, 1.5 / 4), HYc = lerp(-260 + 50, 140 - 50, 0.75);
  const camI = win(hood, T(104) - 0.1, t1, 0.25, 0.2);
  const ci = el('g', { transform: `translate(${HXc + 30},${HYc - 30})` }, camI);
  el('rect', { x: -16, y: -8, width: 30, height: 16, rx: 4, fill: '#E9EEF2', stroke: INK, 'stroke-width': 2 }, ci);
  el('circle', { cx: 16, cy: 0, r: 5, fill: CYAN }, ci);
  // 300 ft radius ring
  const radW = win(hood, T(108) - 0.1, t1, 0.3, 0.2);
  const radC = el('circle', { cx: HXc, cy: HYc, r: 1, fill: CYAN, 'fill-opacity': 0.07, stroke: GOLD, 'stroke-width': 3, 'stroke-dasharray': '10 8', ...NS_ }, radW);
  updaters.push(t => radC.setAttribute('r', (170 * eOut(prog(t, T(108) - 0.1, 0.6))).toFixed(1)));
  let zs = 0.5;
  updaters.push(t => {
    zs = lerp(0.45, 1.5, eIO(prog(t, t0, T(102) - t0))) + 0.12 * eIO(prog(t, T(102), t1 - T(102)));
    hood.setAttribute('transform', `translate(${CX},560) scale(${zs.toFixed(4)}) translate(${-HXc},${-HYc})`);
  });
  // reticle (screen space)
  const ret = win(st, T(102) - 0.15, t1, 0.15, 0.2);
  const rg = el('g', { filter: 'url(#gCyan)' }, ret);
  el('circle', { r: 70, fill: 'none', stroke: CYAN, 'stroke-width': 4 }, rg);
  el('path', { d: 'M0 -100 V-78 M0 100 V78 M-100 0 H-78 M100 0 H78', stroke: CYAN, 'stroke-width': 4, 'stroke-linecap': 'round' }, rg);
  follow(rg, t => [CX, 560, 45 * (1 - eOut(prog(t, T(102) - 0.15, 0.5))), 1 + 1.4 * (1 - eOut(prog(t, T(102) - 0.15, 0.5)))]);
  const lab = win(st, T(108) - 0.05, t1, 0.25, 0.2);
  const lg = el('g', { filter: 'url(#gGold)' }, lab);
  text(lg, { str: '≈ 300 FT', size: 46, weight: 800, disp: true, fill: 'url(#tGold)', ls: 2 });
  follow(lg, t => [CX + 290, 560 - 200 + 10 * (1 - eOut(prog(t, T(108), 0.4))), 0, 1]);
  el('rect', { x: 120, y: 196, width: 1680, height: 722, rx: 22, fill: 'none', stroke: '#2C3A40', 'stroke-width': 3 }, st);
  text(st, { str: 'SATELLITE VIEW', x: 160, y: 236, size: 20, weight: 700, ls: 6, anchor: 'start', fill: '#8FB3C0' });
  label({ str: 'DEMO BY YOUTUBER COLSTO', x: 1760, y: 236, t0: T(98) - 0.1, t1, fo: 0.2, size: 20, ls: 6, weight: 700, fill: '#C9CBCF', parent: st }).parentNode.querySelector('text').setAttribute('text-anchor', 'end');
  caption('LOCATION <c>REVEALED?</c>', T(102), t1);
}

/* =================== S8 · THE PRIVACY REALIZATION (48.72 – 55.58) =================== */
{
  const t0 = T(110) - 0.1, t1 = T(126) - 0.1;
  const st = stage(t0, t1, 0.03);
  const clip = el('g', { 'clip-path': 'url(#cStreet)' }, st);
  const sc = el('g', { transform: 'translate(60,196) scale(1.184,1)' }, clip);
  street(sc, 1520, 740, { lit: true });
  // the sky still carries the clue: faint plane + spectrogram trace
  const sky = win(clip, T(119), t1 + 0.3, 0.6, 0.01);
  const sp = el('path', { d: curvePath(140, 200, 1640, 260, 0.55, 0.3, 0.09), fill: 'none', stroke: CYAN, 'stroke-width': 5, opacity: 0.5, filter: 'url(#gCyanU)', pathLength: 1, 'stroke-dasharray': 1 }, sky);
  updaters.push(t => sp.setAttribute('stroke-dashoffset', (1 - eIO(prog(t, T(119), 1.6))).toFixed(3)));
  const ppl = plane(sky, { stroke: CYAN, sw: 3 });
  follow(ppl, t => [lerp(200, 1750, prog(t, T(119), t1 - T(119))), 270, 0, 0.7]);
  // darkening at the end
  const dk = el('rect', { x: 0, y: 0, width: W, height: H, fill: '#000' }, st);
  updaters.push(t => dk.setAttribute('opacity', (0.6 * eIO(prog(t, T(124), 1.2))).toFixed(3)));
  st.appendChild(dk);
  el('line', { x1: 60, y1: G + 2, x2: W - 60, y2: G + 2, stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, st);
  const HERO = makeNoodle(st, [
    [t0, { pose: 'stand', x: 640, y: G, s: 0.8, look: 0.3 }, 0.01],
    [T(112), { pose: 'hugSelf', look: 0, mouth: 0.2 }, 0.35],
    [T(115), { pose: 'point', look: 0.8, mouth: 0.5 }, 0.35],
    [T(118), { pose: 'proud', look: 0.3, mouth: 0.6 }, 0.35],
    [T(120), { pose: 'shout', look: 0.4, mouthOpen: 1, mouth: 0.1, brow: 0.6 }, 0.35],
    [T(124), { pose: 'sad', look: 0.2, brow: 0.8 }, 0.5],
  ], { hero: true });
  // censor bar over the eyes on "hide your face"
  const cb = win(st, T(112) - 0.05, t1, 0.15, 0.3);
  const bar = el('g', {}, cb);
  el('rect', { x: -95, y: -24, width: 190, height: 48, rx: 6, fill: '#0B0B0C', stroke: INK, 'stroke-width': 3 }, bar);
  text(bar, { str: 'HIDDEN', size: 20, weight: 800, ls: 6, fill: '#E9EAEC' });
  follow(bar, () => [HERO.head[0] + 2, HERO.head[1] - 38 * 0.8, -2, 1]);
  // metadata tag, wiped out on "remove your metadata"
  const md = win(st, t0 + 0.2, T(117) + 0.6, 0.3, 0.3);
  const mg = el('g', { transform: 'translate(1180,470)' }, md);
  const inner = el('g', {}, mg);
  el('rect', { x: -200, y: -95, width: 400, height: 190, rx: 16, fill: '#0B1013', stroke: '#3B5560', 'stroke-width': 3 }, inner);
  text(inner, { str: 'METADATA', y: -58, size: 24, weight: 800, ls: 6, fill: CYAN });
  text(inner, { str: 'GPS  39.80° N  86.50° W', y: -10, size: 24, weight: 600, fill: '#C9CBCF' });
  text(inner, { str: 'DEVICE  ·  DATE  ·  TIME', y: 30, size: 22, weight: 600, fill: '#8FB3C0' });
  text(inner, { str: 'FILE INFO ✓', y: 66, size: 20, weight: 600, fill: '#6F8A94' });
  const wipe = el('rect', { x: -210, y: -105, width: 0, height: 210, fill: '#0B0B0C' }, mg);
  const strike = el('path', { d: 'M-190 0 H190', stroke: TH.red[1], 'stroke-width': 8, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 }, mg);
  updaters.push(t => {
    strike.setAttribute('stroke-dashoffset', (1 - eOut(prog(t, T(115), 0.3))).toFixed(3));
    wipe.setAttribute('width', (420 * eIO(prog(t, T(116) + 0.2, 0.7))).toFixed(1));
  });
  caption('YOUR <c>ENVIRONMENT</c> LEAVES CLUES.', T(119), t1);
}

/* =================== S9 · THE COMMENT TRIGGER (55.58 – 65) =================== */
{
  const t0 = T(126) - 0.1;
  const st = stage(t0, END + 1, 0.0);
  el('rect', { x: 0, y: 0, width: W, height: H, fill: '#020203', opacity: 0.9 }, st);
  // cyan wave that collapses into a point on a map
  const wv = win(st, t0 + 0.1, T(132) + 0.9, 0.4, 0.3);
  const wp = el('path', { fill: 'none', stroke: CYAN, 'stroke-width': 5, 'stroke-linecap': 'round', filter: 'url(#gCyanU)' }, wv);
  updaters.push(t => {
    const c = 1 - eIO(prog(t, T(131), 0.9));
    let d = '';
    for (let i = 0; i <= 160; i++) {
      const u = i / 160, x = CX + (u - 0.5) * 1100 * c, env = Math.pow(Math.sin(Math.PI * u), 1.5);
      const y = 470 + env * c * (60 * Math.sin(u * 30 + t * 6) + 20 * Math.sin(u * 97 - t * 11));
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
    }
    wp.setAttribute('d', d);
  });
  const pin = win(st, T(131) + 0.6, T(135) - 0.1, 0.25, 0.35);
  const pg = el('g', { filter: 'url(#gCyan)' }, pin);
  el('path', { d: 'M0 0 C-14 -26 -36 -40 -36 -66 A36 36 0 1 1 36 -66 C36 -40 14 -26 0 0 Z', fill: CYAN }, pg);
  el('circle', { cx: 0, cy: -66, r: 13, fill: '#020203' }, pg);
  const ring = el('ellipse', { cx: 0, cy: 0, rx: 10, ry: 4, fill: 'none', stroke: CYAN, 'stroke-width': 3 }, pin);
  for (let i = 0; i < 40; i++) el('circle', { cx: (R7() - 0.5) * 900, cy: (R7() - 0.5) * 300, r: 2.5, fill: '#4E6C78' }, pin);
  follow(pg, t => [0, -40 * (1 - eOut(prog(t, T(131) + 0.6, 0.4))), 0, 1]);
  follow(pin, () => [CX, 500, 0, 1]);
  updaters.push(t => { const p = ((t - T(132)) % 1.1) / 1.1; ring.setAttribute('rx', (10 + 120 * p).toFixed(1)); ring.setAttribute('ry', (4 + 40 * p).toFixed(1)); ring.setAttribute('opacity', (1 - p).toFixed(2)); });
  // the question
  const q = item({ x: CX, y: 420, t0: T(135) - 0.05, t1: END + 1, fi: 0.45, rise: 24, s0: 0.95 }, st);
  text(q, { str: 'WOULD YOU STILL', y: -58, size: 84, weight: 800, disp: true, fill: TH.text, ls: 1 });
  const l2 = text(q, { str: '', y: 46, size: 84, weight: 800, disp: true, fill: TH.text, ls: 1 });
  l2.innerHTML = `FILM AT <tspan fill="${CYAN}">HOME?</tspan>`;
  const pill = (s, x, tc) => {
    const g = item({ x, y: 650, t0: tc - 0.05, t1: END + 1, fi: 0.3, rise: 20, s0: 0.8 }, st);
    el('rect', { x: -130, y: -46, width: 260, height: 92, rx: 46, fill: 'none', stroke: CYAN, 'stroke-width': 4 }, g);
    text(g, { str: s, size: 48, weight: 800, ls: 6, fill: TH.text, disp: true });
  };
  pill('YES', CX - 170, T(141));
  pill('NO', CX + 170, T(143));
  label({ str: 'TELL ME IN THE COMMENTS', x: CX, y: 800, t0: T(143) + 0.6, t1: END + 1, size: 30, ls: 12, weight: 700, fill: CYAN, parent: st });
}

/* =================== karaoke subtitles (top) =================== */
{
  const KEY = { sound: CYAN, airplane: CYAN, Doppler: CYAN, 'effect.': CYAN, signature: CYAN, 'fingerprint.': CYAN, acoustic: CYAN, flight: CYAN, tracking: CYAN, 'data,': CYAN, '300': GOLD, 'feet.': GOLD, environment: CYAN, 'live,': GOLD, 'higher.': CYAN, 'drops.': CYAN };
  const chunks = []; let cur = [];
  WORDS.forEach((w, i) => {
    cur.push(w);
    const len = cur.map(x => x[0]).join(' ').length, end = /[.,?!]$/.test(w[0]);
    const next = WORDS[i + 1], gap = next ? next[1] - w[2] : 9;
    if ((end && cur.length >= 3) || (end && gap > 0.5) || cur.length >= 6 || len > 30 || i === WORDS.length - 1) { chunks.push(cur); cur = []; }
  });
  const sg = el('g', {}, root);
  const HIDE = T(135) - 0.1; // the big question replaces the subtitles
  const lines = chunks.map((c, ci) => {
    const t0 = c[0][1] - 0.06, t1 = Math.min(ci + 1 < chunks.length ? chunks[ci + 1][0][1] - 0.06 : END, c[c.length - 1][2] + 0.9, HIDE);
    const tx = el('text', { x: CX, y: 118, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': 58, 'font-weight': 700 }, sg);
    const spans = c.map(([w, ws]) => { const sp = document.createElementNS(NS, 'tspan'); sp.textContent = w + ' '; tx.appendChild(sp); return [sp, ws, KEY[w]]; });
    return { tx, t0, t1, spans };
  });
  updaters.push(t => {
    for (const L of lines) {
      if (t < L.t0 || t >= L.t1) { L.tx.setAttribute('display', 'none'); continue; }
      L.tx.removeAttribute('display');
      for (const [sp, ws, key] of L.spans) sp.setAttribute('fill', t >= ws - 0.02 ? (key ?? TH.text) : TH.muted);
    }
  });
}

window.DURATION = END;
