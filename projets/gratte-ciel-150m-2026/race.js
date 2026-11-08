// Classement animé : pays avec le plus de gratte-ciel de 150 m+ (CTBUH, 2026).
// Révélation du 20e au 1er, barres à échelle dynamique, drapeaux ronds, fond noir, 66 s, sans son.
window.DURATION = 66;

const D = window.DATA;                 // rangs 1..20, triés
const P = 76;                          // pas entre deux lignes
const BAR_H = 52, FLAG_R = 30;
const NAME_X = 470, X0 = 500;          // fin de la colonne des noms, début des barres
const LMAX = W - 80 - 210 - X0;        // longueur max d'une barre
const VIEW_TOP = 215, VIEW_H = 800;    // fenêtre visible du classement
const Y0 = VIEW_TOP + 22 + P / 2;      // centre de la 1re ligne visible
const PAL = ['#3B82F6', '#8B5CF6', '#14B8A6', '#F59E0B', '#EC4899', '#22C55E', '#0EA5E9', '#6366F1', '#F97316', '#06B6D4', '#A855F7', '#10B981'];

// Temps
const S0 = 3.2, SLOT = 2.4;
const tReveal = r => (r === 1 ? 50.6 : S0 + (20 - r) * SLOT); // rang 2 -> 46.4
const T_SUSP = 48.8, T_STAT = 54.6, T_END = 59.6;

const fmt = v => Math.round(v).toLocaleString('en-US');
const defs = document.querySelector('#s defs');
function def(tag, attrs) { return el(tag, attrs, defs); }
function shade(hex, k) { // k>0 éclaircit, k<0 assombrit
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = c => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

// ---------- titre ----------
{
  const g = item({ x: 80, y: 92, t0: 0.2, t1: T_END - 0.2, fi: 0.7, rise: 18, s0: 1 });
  const tx = el('text', { x: 0, y: 0, 'text-anchor': 'start', 'dominant-baseline': 'middle', 'font-size': 56, 'font-weight': 800, class: 'disp', fill: TH.text, 'letter-spacing': -1 }, g);
  tx.innerHTML = 'Which countries have the most <tspan fill="url(#tGold)">skyscrapers</tspan>?';
  const sub = item({ x: 82, y: 160, t0: 0.8, t1: T_END - 0.2, fi: 0.6, rise: 10, s0: 1 });
  text(sub, { str: 'COMPLETED BUILDINGS 150 M+ · RANKING 2026', size: 24, weight: 600, ls: 6, fill: '#8A8C93', anchor: 'start' });
  const yr = item({ x: W - 80, y: 112, t0: 0.5, t1: T_END - 0.2, fi: 0.7, rise: 18, s0: 0.9, filter: 'gGold' });
  text(yr, { str: '2026', size: 120, weight: 800, disp: true, fill: 'url(#tGold)', anchor: 'end', ls: -3 });
  const src = item({ x: 80, y: H - 38, t0: 1.2, t1: DURATION, fi: 0.6, rise: 0, s0: 1, fo: 0.01 });
  text(src, { str: 'Source: CTBUH – The Skyscraper Center (skyscrapercenter.com) · completed buildings of 150 m and taller · data as of Nov 7, 2026', size: 19, weight: 500, fill: '#6E7077', anchor: 'start', ls: 0.5 });
}

// ---------- fenêtre du classement (masque + caméra) ----------
const mk = def('linearGradient', { id: 'viewFade', gradientUnits: 'userSpaceOnUse', x1: 0, y1: VIEW_TOP, x2: 0, y2: VIEW_TOP + VIEW_H });
[[0, 0], [0.03, 1], [0.97, 1], [1, 0]].forEach(([o, a]) => el('stop', { offset: o, 'stop-color': '#fff', 'stop-opacity': a }, mk));
const mask = def('mask', { id: 'viewMask', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H });
el('rect', { x: 0, y: VIEW_TOP, width: W, height: VIEW_H, fill: 'url(#viewFade)' }, mask);
const view = el('g', { mask: 'url(#viewMask)' });
const cam = el('g', {}, view);

const topRank = r => clamp(r, 1, 11); // 20..11 : on remplit la fenêtre par le bas ; ensuite le nouveau pays reste en haut
const camKeys = [[0, Y0 - 10 * P]];
for (let r = 20; r >= 1; r--) {
  const tr = r === 1 ? T_SUSP : tReveal(r);
  const y = Y0 - (topRank(r) - 1) * P;
  if (y !== camKeys[camKeys.length - 1][1]) camKeys.push([tr - 0.35, camKeys[camKeys.length - 1][1]], [tr + 0.5, y]);
}
// échelle : la barre la plus longue = le dernier pays révélé
const scaleKeys = [[0, D[19].value]];
for (let r = 20; r >= 1; r--) { const tr = tReveal(r); scaleKeys.push([tr, scaleKeys[scaleKeys.length - 1][1]], [tr + (r === 1 ? 1.6 : 1.0), D[r - 1].value]); }

const shownVal = (c, t) => c.value * eOut(prog(t, tReveal(c.rank) + 0.1, c.rank === 1 ? 2.2 : 1.2));
let scaleNow = D[19].value, camY = 0;
updaters.push(t => {
  scaleNow = kf(t, scaleKeys, eIO);
  for (const c of D) if (t >= tReveal(c.rank)) scaleNow = Math.max(scaleNow, shownVal(c, t)); // jamais de barre qui dépasse
  camY = kf(t, camKeys, eIO);
  cam.setAttribute('transform', `translate(0,${camY.toFixed(2)})`);
});

// ---------- lignes ----------
D.forEach((c, i) => {
  const r = c.rank, tr = tReveal(r), gold = r === 1;
  const col = PAL[(20 - r) % PAL.length];
  const y = (r - 1) * P;
  const row = el('g', {}, cam);

  // dégradé de la barre
  const gid = 'bar' + r;
  if (!gold) {
    const lg = def('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
    el('stop', { offset: 0, 'stop-color': shade(col, 0.28) }, lg);
    el('stop', { offset: 0.55, 'stop-color': col }, lg);
    el('stop', { offset: 1, 'stop-color': shade(col, -0.35) }, lg);
  }
  const rk = text(row, { str: '#' + r, x: 92, y, size: 28, weight: 700, disp: true, fill: gold ? 'url(#tGold)' : '#64666D', anchor: 'start' });
  const nm = text(row, { str: c.name, x: NAME_X, y, size: 36, weight: 700, fill: TH.text, anchor: 'end' });
  const barG = el('g', gold ? { filter: 'url(#gSoft)' } : {}, row);
  const bar = el('rect', { x: X0, y: y - BAR_H / 2, height: BAR_H, rx: 10, fill: gold ? 'url(#tGold)' : `url(#${gid})` }, barG);
  let shine;
  if (gold) { // reflet qui glisse sur la barre dorée
    const sg = def('linearGradient', { id: 'shine', x1: 0, y1: 0, x2: 1, y2: 0 });
    [[0, 0], [0.5, 0.55], [1, 0]].forEach(([o, a]) => el('stop', { offset: o, 'stop-color': '#FFFFFF', 'stop-opacity': a }, sg));
    const cp = def('clipPath', { id: 'barClip1' });
    shine = { cp: el('rect', { x: X0, y: y - BAR_H / 2, height: BAR_H, rx: 10 }, cp) };
    shine.r = el('rect', { x: 0, y: y - BAR_H / 2, width: 220, height: BAR_H, fill: 'url(#shine)', 'clip-path': 'url(#barClip1)' }, barG);
  }
  // drapeau rond
  const cp = def('clipPath', { id: 'fc' + r });
  el('circle', { cx: 0, cy: 0, r: FLAG_R }, cp);
  const fg = el('g', {}, row);
  const fgi = el('g', {}, fg);
  el('circle', { cx: 0, cy: 3, r: FLAG_R + 4, fill: '#000', opacity: 0.45 }, fgi);
  el('image', { href: `flags/${c.code}.svg`, x: -FLAG_R, y: -FLAG_R, width: 2 * FLAG_R, height: 2 * FLAG_R, preserveAspectRatio: 'xMidYMid slice', 'clip-path': `url(#fc${r})` }, fgi);
  el('circle', { cx: 0, cy: 0, r: FLAG_R, fill: 'none', stroke: '#F4F4F5', 'stroke-width': 3.5 }, fgi);
  const vg = el('g', gold ? { filter: 'url(#gGold)' } : {}, row);
  const val = text(vg, { str: '0', x: 0, y: y + 2, size: gold ? 50 : 44, weight: 800, disp: true, fill: gold ? 'url(#tGold)' : TH.text, anchor: 'start' });

  updaters.push(t => {
    if (t < tr - 0.05) { row.setAttribute('display', 'none'); return; }
    row.removeAttribute('display');
    const pIn = eOut(prog(t, tr, 0.5));

    const sy = camY + y; // position à l'écran : on efface les lignes qui sortent de la fenêtre
    const edge = clamp((1000 - sy) / 35) * clamp((sy - 236) / 30);
    const fade = edge - 0.95 * edge * eIO(prog(t, T_STAT - 0.2, 0.6)); // le classement s'efface derrière la conclusion
    row.setAttribute('opacity', (pIn * fade).toFixed(3));
    nm.setAttribute('x', NAME_X - 30 * (1 - pIn)); rk.setAttribute('x', 92 - 30 * (1 - pIn));
    const shown = shownVal(c, t);
    const L = Math.max(0, shown / scaleNow * LMAX);
    bar.setAttribute('width', L.toFixed(1));
    const fx = X0 + Math.max(L, FLAG_R + 4);
    const pop = t < tr + 0.7 ? 1 + 0.18 * Math.sin(Math.PI * prog(t, tr, 0.7)) : 1;
    fg.setAttribute('transform', `translate(${fx.toFixed(1)},${y}) scale(${(eOut(prog(t, tr, 0.35)) * pop).toFixed(3)})`);
    val.setAttribute('x', (fx + FLAG_R + 18).toFixed(1));
    val.textContent = fmt(shown);
    if (shine) {
      shine.cp.setAttribute('width', L.toFixed(1));
      const sp = ((t - tr - 1.2) % 2.6) / 2.6;
      shine.r.setAttribute('x', (X0 - 240 + (L + 480) * clamp(sp)).toFixed(1));
      shine.r.setAttribute('opacity', t > tr + 1.2 ? 1 : 0);
    }
  });
});

// ---------- suspense avant le n°1 ----------
{
  const y = 0; // ligne du rang 1 (repère caméra)
  const g = el('g', {}, cam);
  const rk = text(g, { str: '#1', x: 92, y, size: 28, weight: 700, disp: true, fill: 'url(#tGold)', anchor: 'start' });
  const q = el('g', {}, g);
  el('circle', { cx: 0, cy: 0, r: FLAG_R, fill: '#1A1A1D', stroke: '#F6D27A', 'stroke-width': 3.5 }, q);
  text(q, { str: '?', y: 2, size: 36, weight: 800, disp: true, fill: 'url(#tGold)' });
  const lb = text(g, { str: 'AND NUMBER ONE IS…', x: X0 + 2 * FLAG_R + 36, y: y + 2, size: 34, weight: 700, ls: 8, fill: 'url(#tGold)', anchor: 'start' });
  updaters.push(t => {
    const a = Math.min(eOut(prog(t, T_SUSP, 0.5)), 1 - eIn(prog(t, tReveal(1) - 0.25, 0.3)));
    if (a <= 0.001) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    g.setAttribute('opacity', a.toFixed(3));
    q.setAttribute('transform', `translate(${X0 + FLAG_R + 4},0) scale(${(1 + 0.08 * Math.sin(t * 7)).toFixed(3)})`);
    lb.setAttribute('opacity', (0.65 + 0.35 * Math.sin(t * 4)).toFixed(3));
  });
}

// ---------- conclusion : part de la Chine ----------
{
  const vr = def('radialGradient', { id: 'veil' });
  el('stop', { offset: 0, 'stop-color': '#000', 'stop-opacity': 0.85 }, vr);
  el('stop', { offset: 1, 'stop-color': '#000', 'stop-opacity': 0 }, vr);
  const veil = el('ellipse', { cx: CX, cy: CY + 20, rx: 1000, ry: 430, fill: 'url(#veil)' });
  updaters.push(t => veil.setAttribute('opacity', eIO(prog(t, T_STAT - 0.2, 0.6)).toFixed(3)));
  const share = Math.round(window.DATA[0].value / window.WORLD_TOTAL * 100); // 3657 / 7818 = 47 %
  money({ x: CX, y: CY - 110, t0: T_STAT + 0.3, t1: T_END - 0.3, from: 0, to: share, prefix: '', suffix: '%', size: 200, color: 'gold', dur: 1.3, auraR: 520 });
  label({ str: 'OF ALL 150 M+ SKYSCRAPERS ON EARTH', x: CX, y: CY + 60, t0: T_STAT + 0.8, t1: T_END - 0.3, size: 40, ls: 8, weight: 700, fill: TH.text });
  label({ str: 'ARE IN CHINA', x: CX, y: CY + 125, t0: T_STAT + 1.2, t1: T_END - 0.3, size: 52, ls: 10, weight: 800, fill: 'url(#tGold)', filter: 'gGold' });
  label({ str: `${fmt(window.DATA[0].value)} OUT OF ${fmt(window.WORLD_TOTAL)}`, x: CX, y: CY + 200, t0: T_STAT + 1.6, t1: T_END - 0.3, size: 26, ls: 6, weight: 600, fill: '#8A8C93' });
}

// ---------- fin ----------
label({ str: 'IS YOUR COUNTRY ON THE LIST?', x: CX, y: CY - 40, t0: T_END, t1: DURATION + 1, size: 76, ls: 2, weight: 800, fill: TH.text });
label({ str: 'COMMENT BELOW', x: CX, y: CY + 60, t0: T_END + 0.7, t1: DURATION + 1, size: 36, ls: 10, weight: 700, fill: 'url(#tGold)', filter: 'gGold' });
label({ str: 'FOLLOW FOR MORE', x: CX, y: CY + 190, t0: T_END + 2.2, t1: DURATION + 1, size: 30, ls: 12, weight: 600, fill: '#8A8C93' });

// attendre que les drapeaux soient chargés avant la première image
window.READY = Promise.all([...document.querySelectorAll('#s image')].map(im => new Promise(res => {
  const i = new Image(); i.onload = i.onerror = res; i.src = im.getAttribute('href');
})));
