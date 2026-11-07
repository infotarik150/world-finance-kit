// Static cover image built from the video's own elements. Rendered at t = 5.
const T = 0;
label({ str: 'NO DEGREE REQUIRED', x: CX, y: 330, t0: T, t1: 99, size: 34, ls: 12, fill: 'url(#tBlue)' });
{
  const g = item({ x: CX, y: 455, t0: T, t1: 99, filter: 'gSoft' });
  text(g, { str: '5 BUSINESSES', size: 128, weight: 800, disp: true, fill: '#F4F8FF', ls: 1 });
}
for (let i = 0; i < 5; i++) {
  const c = item({ x: 300 + 120 * i, y: 625, t0: T, t1: 99 });
  el('circle', { r: 42, fill: 'url(#tGreen)', filter: 'url(#gGreen)' }, c);
  text(c, { str: '0' + (i + 1), size: 26, weight: 700, fill: '#053B25' });
}
// honest bar chart: $5,000 vs $200,000 (1:40)
const BASE = 1470, TALL = 600;
el('line', { x1: 200, y1: BASE, x2: 880, y2: BASE, stroke: '#A9CBF7', 'stroke-width': 3, 'stroke-opacity': 0.7 }, root);
el('rect', { x: 290, y: BASE - 15, width: 130, height: 15, rx: 3, fill: 'url(#tGold)', filter: 'url(#gGold)' }, root);
el('rect', { x: 620, y: BASE - TALL, width: 150, height: TALL, rx: 6, fill: 'url(#tGreen)', filter: 'url(#gGreen)' }, root);
{
  const p = item({ x: 355, y: BASE - 15 - 76, t0: T, t1: 99, filter: 'gSoft' });
  icon(p, I.person, { size: 200, t0: T, draw: 0.1 });
}
label({ str: 'AGE 22', x: 355, y: BASE - 15 - 210, t0: T, t1: 99, size: 30, ls: 9 });
money({ x: 355, y: BASE + 70, t0: T, t1: 99, to: 5000, tc: T, dur: 0.1, size: 76, color: 'gold', auraR: 200 });
label({ str: 'TO START', x: 355, y: BASE + 140, t0: T, t1: 99, size: 26, ls: 9 });
money({ x: 695, y: BASE - TALL - 80, t0: T, t1: 99, to: 200000, tc: T, dur: 0.1, size: 104, color: 'green', auraR: 330 });
label({ str: 'PER YEAR', x: 695, y: BASE + 70, t0: T, t1: 99, size: 30, ls: 10, fill: '#BDF7DD' });
