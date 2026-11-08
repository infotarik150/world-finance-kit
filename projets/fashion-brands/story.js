// "Fashion Brands & Their Countries" — vertical 1080x1920, 30 fps, exactly 65 s. No character.
// Brand names in clean typography (no official logos available: no fake logos), real flags (flag-icons, MIT).
window.DURATION = 65.0;
TH.bg = ['#050505', '#050505', '#050505']; TH.dustA = 0.12; TH.grainA = 0.03; TH.vignette = 'rgba(0,0,0,0.35)';
document.body.style.background = '#050505';

const RED = '#FF3535', WHITE = '#FFFFFF', GREY = '#B8B8B8';
const BRANDS = [
  ['Nike', 'us'], ["Levi's", 'us'], ['Ralph Lauren', 'us'], ['Tommy Hilfiger', 'us'], ['Calvin Klein', 'us'], ['Converse', 'us'], ['Vans', 'us'],
  ['New Balance', 'us'], ['Under Armour', 'us'], ['The North Face', 'us'], ['Patagonia', 'us'], ['Columbia', 'us'], ['Wrangler', 'us'], ['Gap', 'us'],
  ['Old Navy', 'us'], ['American Eagle', 'us'], ['Hollister', 'us'], ['Guess', 'us'], ['Champion', 'us'], ['Brooks Brothers', 'us'],
  ['Burberry', 'gb'], ['Barbour', 'gb'], ['Fred Perry', 'gb'], ['Chanel', 'fr'], ['Dior', 'fr'], ['Lacoste', 'fr'], ['Adidas', 'de'], ['Puma', 'de'],
  ['Hering', 'br'], ['Osklen', 'br'], ['Uniqlo', 'jp'], ['Comme des Garçons', 'jp'], ['Gucci', 'it'], ['H&M', 'se'],
];
// mixed order (seeded shuffle, see ordre.json): no two same non-US countries in a row, max 2 US in a row
const ORDER = [["Tommy Hilfiger", "us"], ["Comme des Garçons", "jp"], ["Patagonia", "us"], ["Hering", "br"], ["Guess", "us"], ["Columbia", "us"], ["Adidas", "de"], ["Brooks Brothers", "us"], ["New Balance", "us"], ["Lacoste", "fr"], ["Nike", "us"], ["Converse", "us"], ["H&M", "se"], ["Under Armour", "us"], ["Ralph Lauren", "us"], ["Burberry", "gb"], ["Old Navy", "us"], ["The North Face", "us"], ["Puma", "de"], ["Hollister", "us"], ["Calvin Klein", "us"], ["Chanel", "fr"], ["American Eagle", "us"], ["Uniqlo", "jp"], ["Levi's", "us"], ["Dior", "fr"], ["Osklen", "br"], ["Barbour", "gb"], ["Champion", "us"], ["Vans", "us"], ["Fred Perry", "gb"], ["Gap", "us"], ["Gucci", "it"], ["Wrangler", "us"]];
const COUNTRY = { us: 'United States', gb: 'United Kingdom', fr: 'France', de: 'Germany', br: 'Brazil', jp: 'Japan', it: 'Italy', se: 'Sweden' };

/* ---------------- helpers ---------------- */
const defs = document.querySelector('#s defs');
const def = (tag, a) => el(tag, a, defs);
const ab = def('marker', { id: 'arrowHead', viewBox: '0 0 10 10', refX: 6, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto' });
el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: RED }, ab);
for (const [id, rgb] of [['white', [1, 1, 1]], ['red', [1, 0, 0]]]) { const f = def('filter', { id: 'logo_' + id }); el('feColorMatrix', { type: 'matrix', values: `0 0 0 0 ${rgb[0]}  0 0 0 0 ${rgb[1]}  0 0 0 0 ${rgb[2]}  0 0 0 1 0` }, f); }
const fc = def('clipPath', { id: 'flagClip', clipPathUnits: 'objectBoundingBox' });
el('rect', { x: 0, y: 0, width: 1, height: 1, rx: 0.12, ry: 0.16 }, fc);
function flag(parent, code, x, y, w = 72) {
  const h = w * 0.75, g = el('g', {}, parent);
  el('image', { href: `flags/${code}.svg`, x: x - w / 2, y: y - h / 2, width: w, height: h, preserveAspectRatio: 'none', 'clip-path': 'url(#flagClip)' }, g);
  el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: w * 0.12, fill: 'none', stroke: 'rgba(255,255,255,0.18)', 'stroke-width': 2 }, g);
  return g;
}
// one "brand -> country + flag" line, in local coordinates (centre at 0)
const XB = 70, XA1 = 0, XC = 1000; // brand left edge, country right edge (flag at the very right)
function row(parent, name, code, o = {}) {
  const g = el('g', {}, parent);
  const size = o.size ?? (name.length > 15 ? 54 : 64);
  const bg = el('g', {}, g);
  const L = window.LOGOS && LOGOS[name];
  let bt, logoW = 0;
  if (L) {
    const hL = (o.size ? o.size / 64 : 1) * (L.h ?? 88), w = Math.min((o.size ? o.size / 64 : 1) * (L.maxW ?? 380), hL * L.ar), h = w / L.ar;
    el('image', Object.assign({ href: `logos/${L.file}`, x: XB, y: -h / 2, width: w, height: h, preserveAspectRatio: 'xMinYMid meet' }, L.mode === 'orig' ? {} : { filter: `url(#logo_${L.mode})` }), bg);
    logoW = w;
    if (L.name) { bt = el('text', { x: XB + w + 22, y: 2, 'dominant-baseline': 'middle', 'font-size': 44 * (o.size ? o.size / 64 : 1), 'font-weight': 800, fill: WHITE, class: 'disp' }, bg); bt.textContent = name; }
  } else {
    bt = el('text', { x: XB, y: 0, 'dominant-baseline': 'middle', 'font-size': size, 'font-weight': 800, fill: WHITE, class: 'disp', 'letter-spacing': -0.5 }, bg);
    bt.textContent = name;
  }
  const line = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: RED, 'stroke-width': 6, 'stroke-linecap': 'round', 'marker-end': 'url(#arrowHead)' }, g);
  const cg = el('g', {}, g);
  const ct = el('text', { x: XC - 108, y: 2, 'text-anchor': 'end', 'dominant-baseline': 'middle', 'font-size': 40, 'font-weight': 600, fill: GREY }, cg);
  ct.textContent = COUNTRY[code];
  flag(cg, code, XC - 42, 0, 84);
  // measure once fonts are ready to place the arrow between brand and country
  let x1 = 0, x2 = 0, measured = false;
  const measure = () => { const bw = (L ? logoW + (bt ? 22 + bt.getComputedTextLength() : 0) : bt.getComputedTextLength()), cw = ct.getComputedTextLength(); x1 = XB + bw + 26; x2 = XC - 108 - cw - 28; measured = true; };
  return { g, bg, line, cg, bw: () => { if (!measured) measure(); return x1 - XB - 26; }, set(p) { // p: 0..1 build progress of the row
    if (!measured) measure();
    const pb = eOut(clamp(p / 0.35)), pl = eIO(clamp((p - 0.28) / 0.32)), pc = eOut(clamp((p - 0.55) / 0.3));
    bg.setAttribute('transform', `translate(${(-40 * (1 - pb)).toFixed(1)},0)`); bg.setAttribute('opacity', pb.toFixed(3));
    const xe = x1 + (x2 - x1) * pl;
    line.setAttribute('x1', x1.toFixed(1)); line.setAttribute('x2', Math.max(x1 + 0.1, xe).toFixed(1)); line.setAttribute('opacity', pl > 0.01 ? 1 : 0);
    cg.setAttribute('opacity', pc.toFixed(3)); cg.setAttribute('transform', `translate(${(24 * (1 - pc)).toFixed(1)},0)`);
  } };
}

/* ======================= HOOK 0–6 s ======================= */
{
  const hook = fader(root, t => 1 - eIn(prog(t, 2.9, 0.4)));
  [['Nike', 'us'], ['Adidas', 'de'], ['Gucci', 'it']].forEach(([n, c], i) => {
    const g = el('g', {}, hook);
    const r = row(g, n, c, { size: 80 });
    const t0 = 0.1 + i * 0.22;
    updaters.push(t => {
      // 0–1 s: name pops in centred; 1–3 s: it slides left and links to its flag
      const pin = eOut(prog(t, t0, 0.4)), slide = eIO(prog(t, 1.0 + i * 0.15, 0.6));
      const centreShift = (1 - slide) * (CX - XB - r.bw() / 2);
      g.setAttribute('transform', `translate(${centreShift.toFixed(1)},${760 + i * 200}) scale(${(0.85 + 0.15 * pin).toFixed(3)})`);
      r.bg.setAttribute('opacity', pin.toFixed(3));
      r.set(slide < 0.01 ? Math.min(0.3, pin * 0.3) : 0.35 + 0.65 * clamp((t - 1.0 - i * 0.15) / 1.1));
      if (slide < 0.01) { r.bg.setAttribute('opacity', pin.toFixed(3)); r.bg.setAttribute('transform', 'translate(0,0)'); }
    });
  });
  // title
  const tg = el('g', {}, root);
  const t1 = text(tg, { str: 'FASHION BRANDS', x: 0, y: -60, size: 112, weight: 900, disp: true, fill: WHITE, ls: 1 });
  const t2 = el('text', { x: 0, y: 70, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': 84, 'font-weight': 800, class: 'disp', fill: WHITE }, tg);
  t2.innerHTML = `<tspan fill="${RED}">&amp;</tspan> THEIR COUNTRIES`;
  const bar = el('rect', { x: -80, y: 150, width: 160, height: 8, rx: 4, fill: RED }, tg);
  updaters.push(t => {
    const pin = eOut(prog(t, 3.0, 0.5)), pout = eIO(prog(t, 5.0, 0.9));
    if (t < 3.0 || t > 6.0) { tg.setAttribute('display', 'none'); return; }
    tg.removeAttribute('display');
    tg.setAttribute('transform', `translate(${CX},${960 - 520 * pout}) scale(${(0.9 + 0.1 * pin) * (1 - 0.55 * pout)})`);
    tg.setAttribute('opacity', (pin * (1 - pout)).toFixed(3));
    bar.setAttribute('transform', `scale(${eOut(prog(t, 3.3, 0.5)).toFixed(3)},1)`);
  });
}

/* ======================= MAIN TABLE 6–60 s ======================= */
const T0 = 6.0, T1 = 60.0, STEP = (T1 - T0 - 0.4) / ORDER.length; // ≈1.58 s per brand
const PITCH = 176, FOCUS = 1480, V = PITCH / STEP;                   // constant scroll speed
{
  const tableG = fader(root, t => Math.min(eOut(prog(t, T0 - 0.2, 0.4)), 1 - eIn(prog(t, T1 - 0.1, 0.5))));
  // thin red rule marking where each new line arrives
  const rows = ORDER.map(([n, c], i) => ({ i, t: T0 + 0.2 + i * STEP, r: row(tableG, n, c) }));
  // separators between countries
  rows.forEach(R => {
    updaters.push(t => {
      if (t < R.t - 0.05) { R.r.g.setAttribute('display', 'none'); return; }
      const y = FOCUS - (t - R.t) * V;
      if (y < -100) { R.r.g.setAttribute('display', 'none'); return; }
      R.r.g.removeAttribute('display');
      R.r.g.setAttribute('transform', `translate(0,${y.toFixed(1)})`);
      R.r.set(clamp((t - R.t) / 0.95));
      // readable everywhere, slightly dimmed once it has been read, faded at the top edge
      const top = clamp((y - 140) / 160), age = clamp((t - R.t - STEP * 1.2) / 0.6);
      R.r.g.setAttribute('opacity', (top * (1 - 0.35 * age)).toFixed(3));
    });
  });
}

/* ======================= CTA 60–65 s ======================= */
{
  const g = el('g', {}, root);
  const l1 = text(g, { str: 'WHICH COUNTRY', x: CX, y: 820, size: 104, weight: 900, disp: true, fill: WHITE });
  const l2 = text(g, { str: 'SURPRISED YOU?', x: CX, y: 950, size: 104, weight: 900, disp: true, fill: WHITE });
  const cg = el('g', {}, g);
  text(cg, { str: 'COMMENT BELOW ↓', x: CX, y: 1130, size: 64, weight: 800, fill: RED, ls: 4 });
  // simple comment icon
  const ic = el('g', {}, g);
  el('path', { d: 'M-70 -50 H70 Q90 -50 90 -30 V30 Q90 50 70 50 H-10 L-45 80 L-40 50 H-70 Q-90 50 -90 30 V-30 Q-90 -50 -70 -50 Z', fill: 'none', stroke: WHITE, 'stroke-width': 8, 'stroke-linejoin': 'round' }, ic);
  for (const x of [-35, 0, 35]) el('circle', { cx: x, cy: 0, r: 8, fill: RED }, ic);
  updaters.push(t => {
    if (t < T1) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    const p1 = eOut(prog(t, T1 + 0.15, 0.45)), p2 = eOut(prog(t, T1 + 0.35, 0.45)), p3 = prog(t, T1 + 2.4, 0.4), p4 = eOut(prog(t, T1 + 0.6, 0.5));
    l1.setAttribute('opacity', p1); l1.setAttribute('transform', `translate(0,${(30 * (1 - p1)).toFixed(1)})`);
    l2.setAttribute('opacity', p2); l2.setAttribute('transform', `translate(0,${(30 * (1 - p2)).toFixed(1)})`);
    const pc = p3 <= 0 ? 0 : eOut(p3) + 0.2 * Math.sin(Math.PI * p3);
    cg.setAttribute('opacity', Math.min(1, pc)); cg.setAttribute('transform', `translate(${CX},1130) scale(${pc.toFixed(3)}) translate(${-CX},-1130)`);
    ic.setAttribute('opacity', p4); ic.setAttribute('transform', `translate(${CX},600) scale(${(0.6 + 0.4 * p4).toFixed(3)})`);
  });
}

function fader(parent, fn) {
  const g = el('g', {}, parent);
  updaters.push(t => { const a = fn(t); if (a <= 0.001) g.setAttribute('display', 'none'); else { g.removeAttribute('display'); g.setAttribute('opacity', a.toFixed(3)); } });
  return g;
}
window.READY = Promise.all([...['us', 'gb', 'fr', 'de', 'br', 'jp', 'it', 'se'].map(c => `flags/${c}.svg`), ...Object.values(window.LOGOS || {}).map(l => `logos/${l.file}`)].map(src => new Promise(res => { const i = new Image(); i.onload = i.onerror = res; i.src = src; })));
