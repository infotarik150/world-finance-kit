// Minimal deterministic animation engine: everything is a pure function of time t (seconds).
const NS = 'http://www.w3.org/2000/svg';
// Format: 'horizontal' (1920x1080, default) or 'vertical' (1080x1920)
const FORMAT = window.FORMAT || 'horizontal';
const W = FORMAT === 'vertical' ? 1080 : 1920, H = FORMAT === 'vertical' ? 1920 : 1080, CX = W / 2, CY = H / 2;
(function sizeStage() {
  const wrap = document.getElementById('wrap'), c = document.getElementById('bg'), sv = document.getElementById('s');
  wrap.style.width = W + 'px'; wrap.style.height = H + 'px';
  c.width = W; c.height = H;
  sv.setAttribute('width', W); sv.setAttribute('height', H); sv.setAttribute('viewBox', `0 0 ${W} ${H}`);
})();
const root = document.getElementById('root');
const updaters = [];
const bgState = { snow: [] }; // time windows for background effects

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eOut = x => 1 - Math.pow(1 - x, 3);
const eIn = x => x * x * x;
const eIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const prog = (t, a, d) => clamp((t - a) / d);

function el(tag, attrs = {}, parent = root) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent.appendChild(n);
  return n;
}

// Visibility envelope: fade in at t0, fade out at t1.
function vis(t, t0, t1, fi, fo) {
  if (t < t0 || t > t1 + fo) return 0;
  return Math.min(eOut(prog(t, t0, fi)), 1 - eIn(prog(t, t1, fo)));
}

// A positioned item that fades/rises in at t0 and fades out at t1.
// opts: x, y, t0, t1, fi, fo, rise, s0, filter, dims: [[ta, tb, level]]
function item(o, parent = root) {
  const g = el('g', o.filter ? { filter: `url(#${o.filter})` } : {}, parent);
  const inner = el('g', {}, g);
  const fi = o.fi ?? 0.5, fo = o.fo ?? 0.35, rise = o.rise ?? 26, s0 = o.s0 ?? 0.94;
  updaters.push(t => {
    let a = vis(t, o.t0, o.t1, fi, fo);
    if (a <= 0.001) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    if (o.dims) for (const [ta, tb, lv] of o.dims) {
      const d = Math.min(eIO(prog(t, ta, 0.4)), 1 - eIO(prog(t, tb, 0.4)));
      a *= 1 - (1 - lv) * d;
    }
    const pin = eOut(prog(t, o.t0, fi)), pout = eIn(prog(t, o.t1, fo));
    const s = s0 + (1 - s0) * pin + 0.035 * pout;
    const dy = (1 - pin) * rise - pout * 12;
    const x = typeof o.x === 'function' ? o.x(t) : o.x;
    const y = typeof o.y === 'function' ? o.y(t) : o.y;
    g.setAttribute('transform', `translate(${x},${y + dy}) scale(${s})`);
    g.setAttribute('opacity', a.toFixed(3));
  });
  return inner;
}

function text(parent, o) {
  const n = el('text', {
    x: o.x ?? 0, y: o.y ?? 0, 'text-anchor': o.anchor ?? 'middle', 'dominant-baseline': 'middle',
    'font-size': o.size, 'font-weight': o.weight ?? 600, fill: o.fill ?? '#F2F6FF',
    'letter-spacing': o.ls ?? 0, class: o.disp ? 'disp' : '',
  }, parent);
  n.textContent = o.str;
  return n;
}

// Small caps label, the "keyword" style of the reference.
function label(o) {
  const g = item({ fi: 0.4, rise: 14, ...o, filter: o.filter }, o.parent ?? root);
  text(g, { str: o.str, size: o.size ?? 30, weight: o.weight ?? 600, ls: o.ls ?? 7, fill: o.fill ?? 'url(#tBlue)' });
  return g;
}

// Big money number with rolling counter and aura.
// o: from, to, tc (count start), dur, color: 'gold'|'green', size
function money(o) {
  const col = o.color === 'green' ? 'Green' : 'Gold';
  const outer = item({ fi: 0.35, rise: 20, s0: 0.9, ...o }, o.parent ?? root);
  const aura = el('ellipse', { cx: 0, cy: 0, rx: o.auraR ?? 420, ry: (o.auraR ?? 420) * 0.55, fill: `url(#a${col})` }, outer);
  const bumpG = el('g', {}, outer);
  const g = el('g', { filter: `url(#g${col})` }, bumpG);
  const n = text(g, { str: '', size: o.size ?? 150, weight: 700, disp: true, fill: `url(#t${col})`, ls: -2 });
  const fmt = v => (o.prefix ?? '$') + Math.round(v).toLocaleString('en-US') + (o.suffix ?? '');
  const tc = o.tc ?? o.t0, dur = o.dur ?? 0.9, from = o.from ?? 0;
  // steps: [[tc, dur, from, to], ...] for multi-stage counters (e.g. 250k -> x3 -> 750k)
  const steps = o.steps ?? [[tc, dur, from, o.to]];
  updaters.push(t => {
    let v = steps[0][2], p = 0;
    for (const [sc, sd, sf, st] of steps) if (t >= sc) { p = eOut(prog(t, sc, sd)); v = sf + (st - sf) * p; if (p >= 1) v = st; }
    if (o.round && p < 1) v = Math.round(v / o.round) * o.round;
    n.textContent = fmt(v);
    if (o.bump) bumpG.setAttribute('transform', `scale(${1 + 0.14 * eOut(prog(t, o.bump, 0.6))})`);
    const pulse = 1 + 0.06 * Math.sin(t * 2.2);
    aura.setAttribute('transform', `scale(${(0.6 + 0.4 * eOut(prog(t, tc, dur + 0.4))) * pulse})`);
  });
  return outer;
}

// Line-art icon drawn stroke by stroke. parts: [{d, fill?}] in a 100x100 box centred at (50,50).
function icon(parent, parts, o) {
  const sc = o.size / 100;
  const g = el('g', { transform: `translate(${(o.x ?? 0) - 50 * sc},${(o.y ?? 0) - 50 * sc}) scale(${sc})` }, parent);
  const col = o.color ?? 'url(#iBlue)';
  const sw = (o.sw ?? 4) / sc;
  const draw = o.draw ?? 0.8, stag = o.stag ?? 0.12, t0 = o.t0;
  parts.forEach((p, i) => {
    const filled = !!p.fill;
    const n = el('path', filled
      ? { d: p.d, fill: p.color ?? col, stroke: 'none' }
      : { d: p.d, fill: 'none', stroke: p.color ?? col, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 }, g);
    const ts = t0 + i * stag;
    updaters.push(t => {
      const pr = eIO(prog(t, ts, draw));
      if (filled) n.setAttribute('opacity', eOut(prog(t, ts, draw * 0.8)).toFixed(3));
      else n.setAttribute('stroke-dashoffset', (1 - pr).toFixed(4));
    });
  });
  return g;
}

// ---------- icon library (100x100) ----------
const circ = (cx, cy, r) => `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
const I = {
  cap: [{ d: 'M50 24 L90 42 L50 60 L10 42 Z' }, { d: 'M27 51 V68 Q50 82 73 68 V51' }, { d: 'M90 42 V64' }, { d: 'M86 64 H94 L92 72 H88 Z' }],
  person: [{ d: circ(50, 30, 12), fill: 1 }, { d: 'M27 88 Q27 49 50 49 Q73 49 73 88 Z', fill: 1 }],
  key: [{ d: circ(32, 50, 14) }, { d: circ(32, 50, 5) }, { d: 'M46 50 H88' }, { d: 'M78 50 V61' }, { d: 'M87 50 V58' }],
  building: [{ d: 'M24 12 H76 V88 H24 Z' }, { d: 'M44 88 V75 H56 V88' }, { d: 'M6 88 H94' }],
  moon: [{ d: 'M62 16 A35 35 0 1 0 86 70 A28 28 0 1 1 62 16 Z' }],
  truck: [{ d: 'M6 28 H60 V68 H6 Z' }, { d: 'M60 40 H77 L92 55 V68 H60' }, { d: 'M65 45 H75 L84 54 H65 Z' }, { d: circ(24, 72, 8) }, { d: circ(76, 72, 8) }],
  dumpster: [{ d: 'M10 34 H90 L85 41 H15 Z' }, { d: 'M15 41 H85 L78 80 H22 Z' }, { d: 'M36 50 V71 M50 50 V71 M64 50 V71' }, { d: circ(28, 86, 4) + ' ' + circ(72, 86, 4) }],
  lifter: [{ d: circ(32, 20, 8) }, { d: 'M32 30 Q42 46 36 64' }, { d: 'M36 64 L27 90 M36 64 L49 90' }, { d: 'M37 41 L60 48' }, { d: 'M57 38 H86 V62 H57 Z' }],
  boxes: [{ d: 'M12 50 H48 V86 H12 Z' }, { d: 'M52 50 H88 V86 H52 Z' }, { d: 'M31 14 H69 V50 H31 Z' }, { d: 'M30 50 V60 M70 50 V60 M50 14 V24' }],
  washer: [{ d: 'M12 74 L22 56 L34 60 L27 80 Z' }, { d: 'M22 56 L30 44 L48 50 L42 62 L34 60' }, { d: 'M45 50 L80 36' }, { d: 'M80 36 L88 33' }],
  plow: [{ d: 'M14 58 H74 V74 H14 Z' }, { d: 'M28 58 V40 H54 L66 58' }, { d: 'M33 45 H52 L59 56 H33 Z' }, { d: circ(28, 77, 7) }, { d: circ(62, 77, 7) }, { d: 'M74 66 H80' }, { d: 'M80 44 Q93 60 89 82 H80 Z' }],
  house: [{ d: 'M14 50 L50 18 L86 50' }, { d: 'M24 42 V86 H76 V42' }, { d: 'M43 86 V64 H57 V86' }],
  mini: [{ d: 'M28 14 H72 V90 H28 Z' }, { d: 'M38 28 H46 M54 28 H62 M38 44 H46 M54 44 H62 M38 60 H46 M54 60 H62 M45 90 V76 H55 V90' }],
  plus: [{ d: circ(50, 50, 40) }, { d: 'M50 32 V68 M32 50 H68' }],
  strike: [{ d: 'M12 88 L88 12' }],
};
I.snow = (() => {
  let d = '';
  for (let k = 0; k < 6; k++) {
    const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a);
    d += `M50 50 L${50 + 40 * c} ${50 + 40 * s} `;
    for (const r of [22, 31]) {
      const bx = 50 + r * c, by = 50 + r * s, L = r === 22 ? 11 : 8;
      for (const sg of [-1, 1]) {
        const b = a + sg * 0.75;
        d += `M${bx} ${by} L${bx + L * Math.cos(b)} ${by + L * Math.sin(b)} `;
      }
    }
  }
  return [{ d }];
})();

// Section header "01 — COMMERCIAL CLEANING"
function header(num, name, t0, tName, t1, parent = root) {
  const g = item({ x: CX, y: 400, t0, t1, fi: 0.5, rise: 30, s0: 0.85 }, parent);
  text(g, { str: num, size: 110, weight: 300, disp: true, fill: 'url(#tBlue)', ls: 4 });
  const ln = el('line', { x1: -60, y1: 78, x2: 60, y2: 78, stroke: '#9EC3F5', 'stroke-width': 2, 'stroke-opacity': 0.6 }, g);
  updaters.push(t => { const p = eOut(prog(t, t0 + 0.2, 0.6)); ln.setAttribute('x1', -60 * p); ln.setAttribute('x2', 60 * p); });
  label({ str: name, x: CX, y: 515, t0: tName, t1, size: 40, ls: 9, weight: 600, fill: '#F2F6FF', parent });
}

// Keyframe interpolation: keys [[t, v], ...]
function kf(t, keys, ease = eIO) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const [a, va] = keys[i - 1], [b, vb] = keys[i];
    return va + (vb - va) * ease((t - a) / (b - a));
  }
  return keys[keys.length - 1][1];
}

// A business section: slides in from the right and out to the left (continuous camera pan).
function scene(t0, t1, o = {}) {
  const g = el('g', {}, root);
  const inner = el('g', {}, g);
  updaters.push(t => {
    if (t < t0 - 0.6 || t > t1 + 0.6) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    const pin = o.panIn === false ? 1 : eIO(prog(t, t0 - 0.3, 0.55));
    const pout = o.panOut === false ? 0 : eIO(prog(t, t1 - 0.25, 0.55));
    g.setAttribute('transform', `translate(${(1 - pin) * W - pout * W},0)`);
  });
  return inner;
}

// Gold coin flying from (x0,y0) to (x1,y1) along an arc.
function coin(parent, x0, y0, x1, y1, ts, dur = 0.5, size = 20, arc = 120) {
  const g = el('g', { filter: 'url(#gSoft)' }, parent);
  el('circle', { r: size, fill: 'url(#tGold)' }, g);
  el('circle', { r: size * 0.74, fill: 'none', stroke: '#A8731F', 'stroke-width': 1.6, 'stroke-opacity': 0.7 }, g);
  text(g, { str: '$', size: size * 1.05, weight: 800, fill: '#7A520F', y: 1 });
  updaters.push(t => {
    const p = prog(t, ts, dur);
    if (t < ts || p >= 1) { g.setAttribute('display', 'none'); return; }
    g.removeAttribute('display');
    const e = eIO(p);
    const x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e - Math.sin(Math.PI * e) * arc;
    const s = Math.min(1, p / 0.15) * (1 - 0.5 * e);
    g.setAttribute('transform', `translate(${x},${y}) scale(${s})`);
    g.setAttribute('opacity', (p > 0.85 ? (1 - p) / 0.15 : 1).toFixed(3));
  });
  return g;
}

// ---------- background ----------
const bg = document.getElementById('bg').getContext('2d');
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const R = rnd(7);
const dust = Array.from({ length: 70 }, () => ({ x: R() * W, y: R() * H, r: 0.8 + R() * 2.2, sp: 6 + R() * 18, ph: R() * 6.28, a: 0.15 + R() * 0.35 }));
const flakes = Array.from({ length: 90 }, () => ({ x: R() * W, y: R() * H, r: 1.5 + R() * 3.5, sp: 60 + R() * 110, sw: 10 + R() * 30, ph: R() * 6.28, a: 0.35 + R() * 0.5 }));
const grains = Array.from({ length: 6 }, (_, k) => {
  const c = document.createElement('canvas'); c.width = 540; c.height = 960;
  const x = c.getContext('2d'), im = x.createImageData(540, 960), r = rnd(100 + k);
  for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0); return c;
});

function blob(x, y, r, rgb, a) {
  const g = bg.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(0.55, `rgba(${rgb},${a * 0.35})`); g.addColorStop(1, `rgba(${rgb},0)`);
  bg.fillStyle = g; bg.fillRect(0, 0, W, H);
}

// ---------- themes: 'noir' (black + chrome white) or 'creme' (cream + dark brown) ----------
const THEMES = {
  noir: {
    bg: ['#121214', '#0A0A0B', '#030303'], dust: '#FFFFFF', dustA: 0.5, vignette: 'rgba(0,0,0,0.55)', grainA: 0.06,
    hero: { front: '#EEF0F3', back: '#AEB2B9', headC: '#F7F8FA', ink: '#0B0B0C' },
    other: { front: '#7E828A', back: '#585B61', headC: '#8F939A', ink: '#0B0B0C' },
    text: '#F4F4F5', muted: '#4E4F55', line: '#5C5D63', prop: '#26262A', prop2: '#34343A', bubble: '#F1F2F4', bubbleInk: '#0B0B0C', snow: '#FFFFFF',
    gold: ['#FFF6D8', '#F6D27A', '#D9A441', '#A8731F'], green: ['#E9FFF4', '#7DF2C0', '#2DC98A', '#138F5D'], red: ['#FFD6D2', '#F0766E', '#C9353C', '#8E1F27'],
    glow: true,
  },
  creme: {
    bg: ['#FBF6EC', '#F3EADB', '#E2D3BD'], dust: '#7A5A3E', dustA: 0.18, vignette: 'rgba(120,90,60,0.22)', grainA: 0.05,
    hero: { front: '#3B2719', back: '#5E432F', headC: '#432D1D', ink: '#F7EFE2' },
    other: { front: '#B7A28B', back: '#9A8570', headC: '#C3AF98', ink: '#3B2719' },
    text: '#2A1A10', muted: '#C2B19C', line: '#A9937B', prop: '#D9C8AF', prop2: '#CDB99D', bubble: '#FFFDF8', bubbleInk: '#3B2719', snow: '#9E8770',
    gold: ['#F2D27E', '#D8A73F', '#B07F1F', '#7E5710'], green: ['#7FD9A8', '#2FA36C', '#1D7D50', '#105A37'], red: ['#F29A92', '#D9534F', '#B02E34', '#7E1C22'],
    glow: false,
  },
};
const TH = THEMES[window.THEME || 'noir'];
(function applyTheme() {
  const setStops = (id, cols) => { const g = document.getElementById(id); if (!g) return; const st = g.querySelectorAll('stop'); cols.forEach((c, i) => st[Math.min(i, st.length - 1)]?.setAttribute('stop-color', c)); };
  setStops('tGold', TH.gold); setStops('tGreen', TH.green); setStops('tRed', TH.red);
  setStops('iGold', [TH.gold[0], TH.gold[1], TH.gold[3]]); setStops('iGreen', [TH.green[0], TH.green[1], TH.green[3]]);
  if (!TH.glow) {
    // on a light background a glow looks muddy: replace glows by a soft drop shadow
    for (const id of ['gSoft', 'gGold', 'gGreen', 'gRed']) {
      const f = document.getElementById(id); if (!f) continue;
      f.innerHTML = '<feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#5A3F2C" flood-opacity="0.18"/>';
    }
  }
  document.body.style.background = TH.bg[1];
})();

function drawBg(t, frame) {
  bg.globalCompositeOperation = 'source-over'; bg.globalAlpha = 1;
  const rg = bg.createRadialGradient(CX, H * 0.43, 80, CX, CY, Math.max(W, H) * 0.7);
  rg.addColorStop(0, TH.bg[0]); rg.addColorStop(0.55, TH.bg[1]); rg.addColorStop(1, TH.bg[2]);
  bg.fillStyle = rg; bg.fillRect(0, 0, W, H);
  // a slow, very soft light drifting so the background is never flat
  const lx = CX + 180 * Math.sin(t * 0.09), ly = H * 0.42 + 160 * Math.cos(t * 0.07);
  const lg = bg.createRadialGradient(lx, ly, 0, lx, ly, 700);
  lg.addColorStop(0, TH.glow ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.35)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
  bg.fillStyle = lg; bg.fillRect(0, 0, W, H);
  // dust
  for (const d of dust) {
    const y = ((d.y - t * d.sp) % H + H) % H, x = d.x + 14 * Math.sin(t * 0.3 + d.ph);
    bg.globalAlpha = TH.dustA * d.a * (0.55 + 0.45 * Math.sin(t * 1.3 + d.ph));
    bg.fillStyle = TH.dust; bg.beginPath(); bg.arc(x, y, d.r, 0, 6.283); bg.fill();
  }
  let sa = 0;
  for (const [a, b] of bgState.snow) sa = Math.max(sa, Math.min(eOut(prog(t, a, 0.8)), 1 - eIn(prog(t, b, 0.6))));
  if (sa > 0) for (const f of flakes) {
    const y = ((f.y + t * f.sp) % H + H) % H, x = f.x + f.sw * Math.sin(t * 0.9 + f.ph);
    bg.globalAlpha = f.a * sa; bg.fillStyle = TH.snow; bg.beginPath(); bg.arc(x, y, f.r, 0, 6.283); bg.fill();
  }
  bg.globalAlpha = 1;
  const vg = bg.createRadialGradient(CX, H * 0.47, Math.min(W, H) * 0.32, CX, CY, Math.max(W, H) * 0.68);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, TH.vignette);
  bg.fillStyle = vg; bg.fillRect(0, 0, W, H);
  bg.globalCompositeOperation = 'overlay'; bg.globalAlpha = TH.grainA;
  bg.drawImage(grains[frame % grains.length], 0, 0, W, H);
  bg.globalAlpha = 1; bg.globalCompositeOperation = 'source-over';
}

window.render = (t, frame = 0) => {
  drawBg(t, frame);
  for (const u of updaters) u(t);
};
