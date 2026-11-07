// Character preview, horizontal 1920x1080: hero on the left, creative shapes on the right
const G = H - 150;
el('line', { x1: 80, y1: G + 2, x2: W - 80, y2: G + 2, stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, root);
makeNoodle(root, [[0, 'wave']], { hero: true, start: { x: 420, y: G, s: 0.85 } });
[['square', 'shrug'], ['triangle', 'point'], ['star', 'happy'], ['crescent', 'think'], ['heart', 'sad']].forEach(([sh, po], i) =>
  makeNoodle(root, [[0, po]], { shape: sh, colorIndex: i, start: { x: 880 + i * 210, y: G, s: 0.5 }, phase: i + 1 }));
text(root, { str: 'Letter "A"', x: CX, y: 90, size: 64, weight: 700, disp: true, fill: INK });
text(root, { str: 'They look confident on the outside,', x: CX, y: 175, size: 50, weight: 700, fill: INK });
window.DURATION = 2;
