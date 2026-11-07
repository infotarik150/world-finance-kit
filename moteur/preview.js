// Usage: node preview.js out_dir t1 t2 ...  -> renders still frames at the given times.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [out, ...times] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: (process.env.FORMAT === 'vertical') ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto('file://' + path.join(__dirname, process.env.PAGE || 'index.html') + '?theme=' + (process.env.THEME || 'noir') + '&format=' + (process.env.FORMAT || 'horizontal'));
  await page.evaluate(() => document.fonts.ready);
  for (const t of times) {
    await page.evaluate(t => window.render(t, Math.round(t * 30)), Number(t));
    await page.screenshot({ path: path.join(out, `t_${Number(t).toFixed(2).padStart(6, '0')}.png`) });
  }
  await browser.close();
})();
