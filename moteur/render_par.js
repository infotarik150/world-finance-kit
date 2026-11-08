// Parallel render: N browser pages each encode a frame range, then segments are concatenated.
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const path = require('path'), fs = require('fs');
const FPS = 30;
async function worker(browser, a, b, seg) {
  const page = await browser.newPage({ viewport: (process.env.FORMAT === 'vertical') ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto('file://' + path.resolve(__dirname, process.env.PAGE || 'index.html') + '?theme=' + (process.env.THEME || 'noir') + '&format=' + (process.env.FORMAT || 'horizontal'));
  await page.evaluate(() => document.fonts.ready); await page.evaluate(() => window.READY);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-tune', 'grain', '-threads', '1', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = a; i < b; i++) {
    await page.evaluate(([t, f]) => window.render(t, f), [i / FPS, i]);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((i - a) % 150 === 0) console.log(`${path.basename(seg)} ${i - a}/${b - a}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}
(async () => {
  const [out, nw = '3'] = process.argv.slice(2);
  const N = Number(nw), dir = path.dirname(out);
  const browser = await chromium.launch();
  const probe = await browser.newPage();
  await probe.goto('file://' + path.resolve(__dirname, process.env.PAGE || 'index.html') + '?theme=' + (process.env.THEME || 'noir') + '&format=' + (process.env.FORMAT || 'horizontal'));
  const total = Math.round((await probe.evaluate(() => window.DURATION)) * FPS);
  await probe.close();
  const segs = [], jobs = [];
  for (let k = 0; k < N; k++) {
    const a = Math.floor(total * k / N), b = Math.floor(total * (k + 1) / N), seg = path.join(dir, `seg_${k}.mp4`);
    segs.push(seg); jobs.push(worker(browser, a, b, seg));
  }
  await Promise.all(jobs);
  await browser.close();
  const list = path.join(dir, 'segs.txt');
  fs.writeFileSync(list, segs.map(s => `file '${s}'`).join('\n'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out]);
  console.log('done', total, 'frames');
})();
