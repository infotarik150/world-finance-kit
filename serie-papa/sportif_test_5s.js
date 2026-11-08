// 5-second test of Le Sportif: dressed (arms crossed, wave), quick spin, shirtless (flex, wink).
background([[0, 'orange'], [1.25, 'rose'], [2.5, 'ciel'], [3.75, 'jaune']]);
const spin = el('g', {});
makeSportif(spin, [
  [0, { pose: 'cross', x: 0, y: 1010, s: 0.97 }],
  [1.25, 'wave', 0.35],
  [2.42, { torse: 1 }, 0.01],
  [2.5, 'flex', 0.35],
  [3.75, 'wink', 0.35],
]);
// quick turn on the spot to change outfit (the switch happens while he is edge-on)
updaters.push(t => {
  const p = prog(t, 2.2, 0.45), sx = Math.abs(Math.cos(p * Math.PI)) * (p > 0 && p < 1 ? 1 : 1);
  spin.setAttribute('transform', `translate(${CX},0) scale(${Math.max(0.04, sx)},1)`);
});
window.DURATION = 5;
