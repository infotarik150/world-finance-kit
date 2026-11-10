// Renders part of the overlay (overlay_patch.html): node rendre_patch.js out_dir t0 t1
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const [out, t0, t1] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4])]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(__dirname, 'overlay_patch.html')); await p.evaluate(() => document.fonts.ready);
  const n = Math.round((t1 - t0) * 30);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.render(t), t0 + i / 30);
    await p.screenshot({ path: path.join(out, `o_${String(i).padStart(4, '0')}.png`), omitBackground: true });
  }
  await b.close(); console.log('frames', n);
})();
