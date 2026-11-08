// 5-second test of Papa: walks in, waves, thinks with his notebook, bursts out laughing.
const G = H - 150;
el('line', { x1: 80, y1: G + 2, x2: W - 80, y2: G + 2, stroke: P_INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, root);
const nameTag = item({ x: CX, y: 92, t0: 0.3, t1: 99 });
text(nameTag, { str: 'PAPA', size: 64, weight: 800, disp: true, fill: P_INK, ls: 10 });
makePapa(root, [
  [0, { pose: 'walk', x: -260, y: G, s: 0.88 }],
  [0.05, { x: CX }, 1.55],
  [1.55, 'wave', 0.4],
  [2.6, 'think', 0.45],
  [3.75, 'laugh', 0.3],
]);
window.DURATION = 5;
