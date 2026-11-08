// Minimal deterministic animation core for the "Papa" series (flat design, vivid backgrounds).
// Everything is a pure function of time t (seconds): window.render(t) draws one frame.
const NS = 'http://www.w3.org/2000/svg';
const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
const root = document.getElementById('root');
const updaters = [];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eOut = x => 1 - Math.pow(1 - x, 3);
const eIn = x => x * x * x;
const eIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eBack = x => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const prog = (t, a, d) => clamp((t - a) / d);
function el(tag, attrs = {}, parent = root) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent.appendChild(n);
  return n;
}

// Vivid flat backgrounds
const BG = { orange: '#FF9A3C', rose: '#FF8FB8', ciel: '#7FD0F5', jaune: '#FFD43B' };
const BG_LIGHT = { orange: '#FFB466', rose: '#FFADCB', ciel: '#A3DEF8', jaune: '#FFE170' };
// keys: [[t, 'orange'], [2.3, 'rose'], ...] -> each new colour opens as a circle from (ox, oy)
function background(keys, ox = CX, oy = CY + 60) {
  const layers = keys.map(([t0, name], i) => {
    const g = el('g', {});
    const base = i === 0 ? el('rect', { x: 0, y: 0, width: W, height: H, fill: BG[name] }, g) : el('circle', { cx: ox, cy: oy, r: 0, fill: BG[name] }, g);
    // a big soft lighter disc behind the character, and two flat decorative circles
    const deco = el('g', {}, g);
    el('circle', { cx: ox, cy: oy - 40, r: 430, fill: BG_LIGHT[name] }, deco);
    el('circle', { cx: 230, cy: 210, r: 70, fill: BG_LIGHT[name] }, deco);
    el('circle', { cx: W - 260, cy: H - 230, r: 110, fill: BG_LIGHT[name] }, deco);
    return { g, base, deco, t0 };
  });
  updaters.push(t => {
    for (const L of layers) {
      if (L.base.tagName === 'circle') { const p = eOut(prog(t, L.t0, 0.55)); L.base.setAttribute('r', p * 1500); L.g.setAttribute('display', p > 0 ? 'inline' : 'none'); }
      const p2 = eBack(prog(t, L.t0 + 0.1, 0.6));
      L.deco.setAttribute('transform', `translate(${ox},${oy}) scale(${Math.max(0, p2) * (1 + 0.015 * Math.sin(t * 2))}) translate(${-ox},${-oy})`);
    }
  });
}

window.render = t => { for (const u of updaters) u(t); };
