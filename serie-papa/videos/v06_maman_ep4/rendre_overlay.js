// Renders the transparent overlay to a PNG sequence: node rendre_overlay.js out_dir
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(__dirname, 'overlay.html')); await p.evaluate(() => document.fonts.ready);
  const n = Math.round((await p.evaluate(() => window.TLDATA.duration)) * 30);
  const i0 = Number(process.argv[3] || 0);
  const i1 = Math.min(n, Number(process.argv[4] || n));
  for (let i = i0; i < i1; i++) {
    await p.evaluate(t => window.render(t), i / 30);
    await p.screenshot({ path: path.join(out, `o_${String(i).padStart(4, '0')}.png`), omitBackground: true });
  }
  await b.close(); console.log('frames', n);
})();
