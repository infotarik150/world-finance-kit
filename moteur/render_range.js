// Render frames [a, b) to an mp4 (used to patch short sections).
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const [out, a, b] = process.argv.slice(2).map((v, i) => i ? Number(v) : v);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: (process.env.FORMAT === 'vertical') ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(__dirname, 'index.html') + '?theme=' + (process.env.THEME || 'noir') + '&format=' + (process.env.FORMAT || 'horizontal'));
  await page.evaluate(() => document.fonts.ready);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a; i < b; i++) {
    await page.evaluate(([t, f]) => window.render(t, f), [i / 30, i]);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();
})();
