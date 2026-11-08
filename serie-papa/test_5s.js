// 5-second test: one expression per vivid background.
background([[0, 'orange'], [1.25, 'rose'], [2.5, 'ciel'], [3.75, 'jaune']]);
makePapa(root, [
  [0, { pose: 'hips', x: CX, y: 1000, s: 1.08, mouth: 0.7, mouthOpen: 0.35 }],
  [1.25, 'wave', 0.35],
  [2.5, 'think', 0.4],
  [3.75, 'laugh', 0.3],
]);
window.DURATION = 5;
