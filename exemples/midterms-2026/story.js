// "Midterms 2026" — 5 s test scene. Times = word onsets in the Quentin voice (words.js).
// Metaphor: a giant scale in front of the Capitol. Ballots tip it to the blue side ("flipped"),
// then the HOUSE and SENATE blocks jump from the red pan to the blue pan ("lost the House and the Senate").
const G = H - 150;
const BACK = el('g', {}, root), MID = el('g', {}, root), FRONT = el('g', {}, root);
const win = (t0, t1, fi = 0.35, fo = 0.35, parent = FRONT) => fader(parent, t => Math.min(eOut(prog(t, t0, fi)), 1 - eIn(prog(t, t1, fo))));
function fader(parent, fn) {
  const g = el('g', {}, parent);
  updaters.push(t => { const a = fn(t); if (a <= 0.001) g.setAttribute('display', 'none'); else { g.removeAttribute('display'); g.setAttribute('opacity', a.toFixed(3)); } });
  return g;
}
function follow(g, fn) { updaters.push(t => { const [x, y, r = 0, s = 1] = fn(t); g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${r.toFixed(1)}) scale(${s.toFixed(3)})`); }); return g; }
// party gradients (blue for the winning side, red only because the text talks about a loss)
{
  const defs = document.querySelector('defs');
  const grad = (id, cols) => { const g = el('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs); cols.forEach((c, i) => el('stop', { offset: i / (cols.length - 1), 'stop-color': c }, g)); };
  grad('pBlue', ['#BFDBFF', '#5B9BFF', '#2F6FE0', '#1D4AA8']);
  grad('pRed', TH.red);
}
const END = 5.85;
const ALL = win(0, END, 0.3, 0.01, root); // everything fades in at the start
BACK.remove(); MID.remove(); FRONT.remove(); ALL.append(BACK, MID, FRONT);

// ---------- ground + Capitol silhouette (backdrop) ----------
el('line', { x1: 80, y1: G + 2, x2: W - 80, y2: G + 2, stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, BACK);
const PX = 1250; // scale / Capitol axis
{
  const cap = el('g', { opacity: 0.9 }, BACK);
  const st = { fill: TH.prop, stroke: TH.line, 'stroke-width': 3, 'stroke-linejoin': 'round' };
  el('path', { d: `M${PX - 420} ${G} V${G - 150} H${PX + 420} V${G} Z`, ...st }, cap);           // wings
  el('path', { d: `M${PX - 440} ${G - 150} H${PX + 440} L${PX + 420} ${G - 175} H${PX - 420} Z`, ...st }, cap);
  for (let i = -9; i <= 9; i++) if (Math.abs(i) > 1) el('line', { x1: PX + i * 44, y1: G - 140, x2: PX + i * 44, y2: G - 10, stroke: TH.line, 'stroke-width': 3, 'stroke-opacity': 0.6 }, cap);
  el('path', { d: `M${PX - 150} ${G - 175} V${G - 290} H${PX + 150} V${G - 175} Z`, ...st }, cap);  // drum
  for (let i = -3; i <= 3; i++) el('line', { x1: PX + i * 40, y1: G - 280, x2: PX + i * 40, y2: G - 185, stroke: TH.line, 'stroke-width': 3, 'stroke-opacity': 0.6 }, cap);
  el('path', { d: `M${PX - 135} ${G - 290} A135 135 0 0 1 ${PX + 135} ${G - 290} Z`, ...st }, cap); // dome
  el('path', { d: `M${PX - 18} ${G - 425} V${G - 470} H${PX + 18} V${G - 425} Z`, ...st }, cap);    // lantern
}

// ---------- the scale ----------
const PIVOT = [PX, 370], L = 400, DROP = 230;
// beam angle (deg, + = right/blue side down): red-heavy, flips on "flipped", tips further with each block
const ang = t => kf(t, [[0, -13], [1.08, -13], [1.75, 9], [3.92, 9], [4.3, 15], [4.84, 15], [5.2, 19]], eIO)
  + 1.6 * Math.sin(Math.max(0, t - 1.75) * 9) * Math.exp(-Math.max(0, t - 1.75) * 3.5) * (t > 1.75 ? 1 : 0);
const endPt = (t, side) => { const a = ang(t) * Math.PI / 180; return [PIVOT[0] + side * L * Math.cos(a), PIVOT[1] + side * L * Math.sin(a)]; };
const dish = (t, side) => { const [x, y] = endPt(t, side); return [x, y + DROP]; }; // centre of the pan's top
{
  const sc = el('g', {}, MID);
  // post + base
  el('path', { d: `M${PX - 14} ${PIVOT[1]} H${PX + 14} V${G - 40} H${PX - 14} Z`, fill: TH.prop2, stroke: INK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, sc);
  el('path', { d: `M${PX - 130} ${G} Q${PX - 120} ${G - 46} ${PX} ${G - 50} Q${PX + 120} ${G - 46} ${PX + 130} ${G} Z`, fill: TH.prop2, stroke: INK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, sc);
  // pans (chains behind, dish in front)
  for (const side of [-1, 1]) {
    const chains = el('path', { fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }, sc);
    const pan = el('g', {}, sc);
    el('path', { d: 'M-165 0 H165 Q150 62 0 70 Q-150 62 -165 0 Z', fill: side < 0 ? 'url(#pRed)' : 'url(#pBlue)', stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, pan);
    text(pan, { str: side < 0 ? 'REP' : 'DEM', y: 30, size: 34, weight: 800, ls: 6, fill: '#FFFFFF', disp: true });
    updaters.push(t => {
      const [ex, ey] = endPt(t, side), [dx, dy] = dish(t, side);
      chains.setAttribute('d', `M${ex} ${ey} L${dx - 150} ${dy} M${ex} ${ey} L${dx + 150} ${dy}`);
      pan.setAttribute('transform', `translate(${dx},${dy})`);
    });
  }
  // beam (in front of the chains) + pivot cap
  const beam = el('g', {}, sc);
  el('path', { d: `M${-L - 18} -12 H${L + 18} Q${L + 30} 0 ${L + 18} 12 H${-L - 18} Q${-L - 30} 0 ${-L - 18} -12 Z`, fill: TH.prop2, stroke: INK, 'stroke-width': 6, 'stroke-linejoin': 'round' }, beam);
  for (const s of [-1, 1]) el('circle', { cx: s * L, cy: 0, r: 13, fill: INK }, beam);
  follow(beam, t => [PIVOT[0], PIVOT[1], ang(t), 1]);
  const capG = el('g', { filter: 'url(#gGold)' }, sc);
  el('circle', { cx: PIVOT[0], cy: PIVOT[1], r: 26, fill: 'url(#tGold)', stroke: INK, 'stroke-width': 5 }, capG);
}

// ---------- ballots raining on the blue pan (0.1 – 1.2): the votes tip the balance ----------
for (let i = 0; i < 7; i++) {
  const ts = 0.1 + i * 0.13, dur = 0.5, ox = -110 + i * 36, rot0 = -30 + (i * 37) % 60;
  const b = el('g', {}, FRONT);
  el('rect', { x: -26, y: -34, width: 52, height: 68, rx: 6, fill: TH.bubble, stroke: INK, 'stroke-width': 4 }, b);
  el('path', { d: 'M-12 2 L-3 12 L14 -12', fill: 'none', stroke: '#2F6FE0', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, b);
  updaters.push(t => {
    const p = prog(t, ts, dur);
    if (t < ts || t > ts + dur + 0.25) { b.setAttribute('display', 'none'); return; }
    b.removeAttribute('display');
    const [dx, dy] = dish(t, 1), e = eIn(p);
    const x = dx + ox, y = -80 + (dy - 34 - (-80)) * e;
    const land = prog(t, ts + dur, 0.25);
    b.setAttribute('transform', `translate(${x},${y}) rotate(${rot0 * (1 - p)}) scale(${1 - 0.6 * land},${1 - 0.9 * land})`);
    b.setAttribute('opacity', (1 - land).toFixed(3));
  });
}

// ---------- HOUSE and SENATE blocks jump from the red pan to the blue pan ----------
function block(label, slotFrom, slotTo, tj, gold) {
  const g = el('g', {}, FRONT);
  const inner = el('g', {}, g);
  el('rect', { x: -110, y: -42, width: 220, height: 84, rx: 14, fill: TH.prop2, stroke: INK, 'stroke-width': 6 }, inner);
  text(inner, { str: label, size: 40, weight: 800, ls: 5, disp: true, fill: TH.text, y: 2 });
  const ring = el('rect', { x: -110, y: -42, width: 220, height: 84, rx: 14, fill: 'none', stroke: 'url(#tGold)', 'stroke-width': 6, filter: 'url(#gGold)' }, inner);
  updaters.push(t => {
    const a = dish(t, -1), b = dish(t, 1);
    const from = [a[0], a[1] - 44 - slotFrom * 86], to = [b[0], b[1] - 44 - slotTo * 86];
    const p = eIO(prog(t, tj, 0.55));
    const x = from[0] + (to[0] - from[0]) * p, y = from[1] + (to[1] - from[1]) * p - Math.sin(Math.PI * p) * 230;
    const sq = Math.exp(-Math.max(0, t - tj - 0.55) * 9) * (t > tj + 0.55 ? 0.12 : 0); // squash on landing
    g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(360 * p * (slotTo ? -1 : 1) * 0).toFixed(1)})`);
    inner.setAttribute('transform', `translate(0,${(42 * sq).toFixed(1)}) rotate(${(-14 * Math.sin(Math.PI * p)).toFixed(1)}) scale(${1 + sq},${1 - sq})`);
    ring.setAttribute('opacity', Math.min(eOut(prog(t, tj - 0.15, 0.2)), 1 - eIn(prog(t, tj + 0.9, 0.4))).toFixed(3));
  });
  return g;
}
block('SENATE', 0, 1, 4.84);
block('HOUSE', 1, 0, 3.92);

// ---------- characters ----------
const HERO = makeNoodle(MID, [
  [0, { pose: 'stand', x: 290, y: G, s: 0.82, look: 0.5 }, 0.01],
  [0.35, { pose: 'point', look: 0.7 }, 0.35],
  [1.1, { pose: 'shout', look: 0.6, squash: -0.06 }, 0.3],
  [2.3, { pose: 'think', look: 0.5 }, 0.45],
  [3.85, { pose: 'point', look: 0.7, mouth: 0.6 }, 0.3],
  [4.8, { pose: 'happy', look: 0.4 }, 0.35],
], { hero: true });
// the losing side: a red-ish square that slumps on "lost"
const LOSER = makeNoodle(MID, [
  [0, { pose: 'proud', x: 640, y: G, s: 0.5, look: 0.6 }, 0.01],
  [1.15, { pose: 'shrug', look: 0.5 }, 0.35],
  [3.4, { pose: 'sad', look: 0.3, squash: -0.08 }, 0.35],
  [4.85, { pose: 'hugSelf', look: 0.2, squash: -0.1 }, 0.4],
], { shape: 'square', colorIndex: 0, phase: 1.7 });
// "LOST" pops above the square on the word "lost"
{
  const lw = win(3.38, END, 0.15, 0.01);
  const lg = el('g', { filter: 'url(#gRed)' }, lw);
  text(lg, { str: 'LOST', size: 92, weight: 800, disp: true, fill: 'url(#tRed)', ls: 4 });
  follow(lg, t => [625, 615 - 18 * eOut(prog(t, 3.38, 0.35)), -6, 0.6 + 0.4 * eOut(prog(t, 3.38, 0.3)) + 0.06 * Math.exp(-(t - 3.68) * 6) * (t > 3.68 ? 1 : 0)]);
  // small red cracks on the ground under the square
  for (let i = 0; i < 6; i++) {
    const x = 560 + i * 32, c = el('path', { d: `M${x} ${G + 4} l${-8 + (i * 7) % 16} 18 l${6 - (i * 5) % 12} 14`, fill: 'none', stroke: TH.red[1], 'stroke-width': 4, 'stroke-linecap': 'round' }, lw);
    updaters.push(t => c.setAttribute('opacity', eOut(prog(t, 3.5 + i * 0.05, 0.2)).toFixed(3)));
  }
}

// ---------- kicker + karaoke subtitles ----------
label({ str: 'US MIDTERMS  ·  NOV 2026', x: CX, y: 70, t0: 0.05, t1: END, fo: 0.01, size: 28, ls: 10, fill: TH.gold[1], parent: ALL });
{
  const KEY = { 'flipped': TH.gold[1], 'House': TH.gold[1], 'Senate.': TH.gold[1], 'lost': TH.red[1] };
  const chunks = [WORDS.slice(0, 5), WORDS.slice(5)];
  const sg = el('g', {}, ALL);
  const lines = chunks.map((c, ci) => {
    const t0 = ci ? c[0][1] - 0.15 : 0, t1 = ci + 1 < chunks.length ? chunks[ci + 1][0][1] - 0.15 : END + 1;
    const tx = el('text', { x: CX, y: 150, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': 58, 'font-weight': 700 }, sg);
    const spans = c.map(([w, ws]) => { const sp = document.createElementNS(NS, 'tspan'); sp.textContent = w + ' '; tx.appendChild(sp); return [sp, ws, KEY[w]]; });
    return { tx, t0, t1, spans };
  });
  updaters.push(t => {
    for (const Ln of lines) {
      if (t < Ln.t0 || t >= Ln.t1) { Ln.tx.setAttribute('display', 'none'); continue; }
      Ln.tx.removeAttribute('display');
      for (const [sp, ws, key] of Ln.spans) sp.setAttribute('fill', t >= ws - 0.02 ? (key ?? TH.text) : TH.muted);
    }
  });
}

window.DURATION = END;
