// Marketing video for the guided-build feature of lego-studio.
// Drives the real app in Chrome with Playwright, injects a visible cursor + text overlays + zoom into the page (so they are
// captured by recordVideo), then transcodes to MP4. Edit texts/durations in scenes.json; edit the story in run() below.
//
//   1. serve the repo:   cd <repo root> && python3 -m http.server 8765
//   2. record:           node lego-studio/video/record.js            (needs the sandbox disabled: launches Chrome, writes ~/Library)
//
// Output: video/out/lego-guided-build.webm + .mp4

const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const CFG = JSON.parse(fs.readFileSync(path.join(__dirname, 'scenes.json'), 'utf8'));
const OUT = path.join(__dirname, 'out');

function loadPlaywright() {
  try { return require('playwright'); } catch {}
  const roots = [path.join(os.homedir(), '.npm/_npx')];
  for (const r of roots) if (fs.existsSync(r)) for (const d of fs.readdirSync(r)) { const c = path.join(r, d, 'node_modules/playwright'); if (fs.existsSync(c)) return require(c); }
  throw new Error('playwright not found; run: npx playwright --version');
}
// Prefer a full ffmpeg (libx264): $FFMPEG, then ffmpeg-static from `npm i ffmpeg-static` (any prefix), then Playwright's minimal build (WebM only).
const findFfmpeg = () => {
  if (process.env.FFMPEG && fs.existsSync(process.env.FFMPEG)) return process.env.FFMPEG;
  for (const c of [path.join(__dirname, 'node_modules/ffmpeg-static/ffmpeg'), path.join(process.env.TMPDIR || '/tmp', 'ff/node_modules/ffmpeg-static/ffmpeg'), '/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg']) if (fs.existsSync(c)) return c;
  return findPwFfmpeg();
};
const findPwFfmpeg = () => { const dir = path.join(os.homedir(), 'Library/Caches/ms-playwright'); for (const d of fs.readdirSync(dir)) if (d.startsWith('ffmpeg-')) for (const f of fs.readdirSync(path.join(dir, d))) if (f.startsWith('ffmpeg')) return path.join(dir, d, f); return null; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── in-page helpers: cursor, overlays, zoom, highlight ──────────────────────────────────────────────────────────────────
const INJECT = `
(() => {
  const css = document.createElement('style'); css.textContent = \`
    #vc { position: fixed; left: 0; top: 0; width: 22px; height: 30px; z-index: 9999; pointer-events: none; transform: translate(-3px,-3px); filter: drop-shadow(0 2px 3px rgba(0,0,0,.45)); transition: transform .08s; }
    #vc.down { transform: translate(-3px,-3px) scale(.85); }
    .vripple { position: fixed; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #e3000b; z-index: 9998; pointer-events: none; transform: translate(-50%,-50%); animation: vr .5s ease-out forwards; }
    @keyframes vr { to { width: 70px; height: 70px; opacity: 0; } }
    #vov { position: fixed; left: 50%; bottom: 150px; transform: translateX(-50%) translateY(20px); z-index: 9997; pointer-events: none; text-align: center; opacity: 0; transition: opacity .45s, transform .45s; font-family: Rubik, system-ui, sans-serif; direction: rtl; }
    #vov.on { opacity: 1; transform: translateX(-50%) translateY(0); }
    #vov b { display: block; background: rgba(20,22,30,.86); color: #fff; font-size: 34px; font-weight: 800; padding: 14px 30px; border-radius: 18px; letter-spacing: -.3px; box-shadow: 0 12px 40px rgba(0,0,0,.35); }
    #vov small { display: inline-block; margin-top: 10px; background: rgba(255,255,255,.94); color: #1e2230; font-size: 19px; font-weight: 600; padding: 8px 18px; border-radius: 999px; box-shadow: 0 6px 20px rgba(0,0,0,.18); }
    #vov.top { bottom: auto; top: 90px; }
    #vov.center { bottom: auto; top: 40%; }
    #vov.center b { font-size: 48px; padding: 18px 40px; }
    #vspot { position: fixed; z-index: 9996; pointer-events: none; border: 4px solid #f7d117; border-radius: 16px; box-shadow: 0 0 0 9999px rgba(0,0,0,.28); opacity: 0; transition: all .5s; }
    #vspot.on { opacity: 1; }
    body { transition: transform .8s cubic-bezier(.2,.7,.2,1); }
  \`; document.head.appendChild(css);
  const cur = document.createElement('div'); cur.id = 'vc';
  cur.innerHTML = '<svg viewBox="0 0 22 30" width="22" height="30"><path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 17 L20 17 Z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  document.body.appendChild(cur);
  const ov = document.createElement('div'); ov.id = 'vov'; document.body.appendChild(ov);
  const spot = document.createElement('div'); spot.id = 'vspot'; document.body.appendChild(spot);
  window.__cursor = (x, y) => { cur.style.left = x + 'px'; cur.style.top = y + 'px'; };
  window.__press = (down) => { cur.classList.toggle('down', down); if (down) { const r = document.createElement('div'); r.className = 'vripple'; r.style.left = cur.style.left; r.style.top = cur.style.top; document.body.appendChild(r); setTimeout(() => r.remove(), 600); } };
  window.__overlay = (title, sub, pos) => { ov.className = pos || ''; ov.innerHTML = (title ? '<b>' + title + '</b>' : '') + (sub ? '<small>' + sub + '</small>' : ''); requestAnimationFrame(() => ov.classList.add('on')); };
  window.__overlayOff = () => ov.classList.remove('on');
  window.__spot = (sel, pad = 10) => { const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!el) return spot.classList.remove('on'); const r = el.getBoundingClientRect(); spot.style.left = (r.left - pad) + 'px'; spot.style.top = (r.top - pad) + 'px'; spot.style.width = (r.width + pad * 2) + 'px'; spot.style.height = (r.height + pad * 2) + 'px'; spot.classList.add('on'); };
  window.__spotOff = () => spot.classList.remove('on');
  window.__zoom = (scale, ox, oy) => { document.body.style.transformOrigin = ox + 'px ' + oy + 'px'; document.body.style.transform = scale === 1 ? '' : 'scale(' + scale + ')'; };
})();`;

// ─── driver ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
class Driver {
  constructor(page) { this.page = page; this.x = 640; this.y = 400; }
  async init() { await this.page.evaluate(INJECT); await this.page.evaluate(([x, y]) => window.__cursor(x, y), [this.x, this.y]); }
  async moveTo(x, y, steps = CFG.cursorSpeed) { steps = Math.max(3, Math.round(steps * (this.speed || 1)));
    // ease-in-out path so the cursor looks hand-driven
    const x0 = this.x, y0 = this.y;
    for (let i = 1; i <= steps; i++) { const k = i / steps, e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; const px = x0 + (x - x0) * e, py = y0 + (y - y0) * e; await this.page.mouse.move(px, py); await this.page.evaluate(([a, b]) => window.__cursor(a, b), [px, py]); }
    this.x = x; this.y = y;
  }
  async click(x, y, opts = {}) {
    if (x != null) await this.moveTo(x, y, opts.steps);
    await sleep((opts.pause ?? 220) * (this.speed || 1));
    await this.page.evaluate(() => window.__press(true)); await this.page.mouse.down(); await sleep(90); await this.page.mouse.up(); await this.page.evaluate(() => window.__press(false));
    await sleep((opts.after ?? 350) * (this.speed || 1));
  }
  async clickEl(sel, opts = {}) { const r = await this.rect(sel); if (!r) throw new Error('no element ' + sel); await this.click(r.x + r.w / 2, r.y + r.h / 2, opts); }
  async rect(sel) { return this.page.evaluate(s => { const el = document.querySelector(s); if (!el) return null; el.scrollIntoView({ block: 'nearest' }); const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, sel); }
  async overlay(key, pos) { const s = CFG.scenes[key]; await this.page.evaluate(([t, u, p]) => window.__overlay(t, u, p), [s.title, s.sub, pos || '']); return s.hold; }
  async overlayOff() { await this.page.evaluate(() => window.__overlayOff()); }
  async spot(sel) { await this.page.evaluate(s => window.__spot(s), sel); }
  async spotOff() { await this.page.evaluate(() => window.__spotOff()); }
  async zoom(scale, x, y) { await this.page.evaluate(([s, a, b]) => window.__zoom(s, a, b), [scale, x, y]); }
  // screen position of the first unplaced guided-build ghost (projected through the app camera)
  async ghostPos() {
    return this.page.evaluate(() => { const L = window.__lego; const kids = L.guideGroup.children; const m = kids.find(k => k.userData.target.t === L.state.type && k.userData.target.c === L.state.color) || kids[0]; if (!m) return null; m.geometry.computeBoundingBox(); const c = m.geometry.boundingBox.getCenter(m.position.clone()); c.add(m.position); c.project(L.camera); const r = document.getElementById('gl').getBoundingClientRect(); return { x: r.left + (c.x + 1) / 2 * r.width, y: r.top + (1 - c.y) / 2 * r.height, t: m.userData.target.t, c: m.userData.target.c }; });
  }
  async pickPart(t, c, opts = {}) {
    const cur = await this.page.evaluate(() => ({ t: window.__lego.state.type, c: window.__lego.state.color, tab: document.querySelector('#tabs button.on').dataset.tab }));
    if (t && t !== cur.t) { if (cur.tab !== 'parts') await this.clickEl('#tabs button[data-tab="parts"]', { after: 180, steps: 14 }); await this.clickEl(`.part[data-type="${t}"]`, { after: 240, steps: 18 }); cur.tab = 'parts'; }
    if (c && c !== cur.c) { if (cur.tab !== 'colors') await this.clickEl('#tabs button[data-tab="colors"]', { after: 180, steps: 14 }); await this.clickEl(`.swatch[data-color="${c}"]`, { after: 240, steps: 18 }); cur.tab = 'colors'; }
    if (opts.back !== false && cur.tab !== 'parts') await this.clickEl('#tabs button[data-tab="parts"]', { after: 150, steps: 12 });
  }
}

// ─── the story ──────────────────────────────────────────────────────────────────────────────────────────────────────────
async function run() {
  const pw = loadPlaywright();
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await pw.chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: CFG.viewport, deviceScaleFactor: 1, recordVideo: { dir: OUT, size: CFG.viewport }, locale: 'he-IL' });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem('lego-studio:seen', '1'); localStorage.removeItem('lego-studio:auto'); localStorage.removeItem('lego-studio:ai'); } catch {} });
  await page.goto(CFG.url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__legoReady === true, null, { timeout: 30000 });
  await page.evaluate(() => document.fonts.ready); await sleep(600);
  const d = new Driver(page); await d.init();
  const stageRect = await d.rect('#stage'); const cx = stageRect.x + stageRect.w / 2, cy = stageRect.y + stageRect.h / 2;

  // 1 · intro: the car preset spinning in showcase
  await page.evaluate(() => { window.__lego.check('car'); document.querySelector('#modes button[data-mode="showcase"]').click(); });
  await sleep(500); let h = await d.overlay('intro', 'center'); await sleep(h); await d.overlayOff(); await sleep(300);

  // 2 · problem: the passive instructions viewer
  await d.clickEl('#modes button[data-mode="steps"]', { after: 500 });
  h = await d.overlay('problem', 'top'); await d.spot('#steps');
  await d.clickEl('#stepPrev', { after: 350 }); await d.clickEl('#stepPrev', { after: 350 }); await d.clickEl('#stepNext', { after: 350 });
  await sleep(Math.max(0, h - 1500)); await d.spotOff(); await d.overlayOff(); await sleep(250);

  // 3 · feature: models tab, difficulty groups, guided-build button
  await d.clickEl('#tabs button[data-tab="models"]', { after: 500 });
  h = await d.overlay('feature', 'top');
  await page.evaluate(() => document.querySelector('.guideBtn[data-guide="car"]').scrollIntoView({ block: 'center' })); await sleep(400);
  await d.spot('.guideBtn[data-guide="car"]'); await sleep(900); await d.spotOff();
  await d.clickEl('.guideBtn[data-guide="car"]', { after: 900 }); await d.overlayOff();

  // 4 · the ghost: zoom onto the plate, then show the panel
  await sleep(500); await d.zoom(1.25, cx, cy + 60); h = await d.overlay('ghost', 'top'); await sleep(1600); await d.zoom(1, cx, cy); await sleep(700); await d.spot('#guide'); await sleep(800); await d.spotOff(); await d.overlayOff();

  // 5 · a wrong part → gentle feedback
  let g = await d.ghostPos();
  await d.pickPart('2x4', 'red');
  await d.click(g.x, g.y, { after: 300 }); h = await d.overlay('wrong', 'top'); await d.spot('#guideMsg'); await sleep(h); await d.spotOff(); await d.overlayOff();

  // 6 · hint flashes the right tile
  await d.clickEl('#guideHint', { after: 400 }); h = await d.overlay('hint', 'top'); await sleep(h); await d.overlayOff();

  // 7 · correct part + color, then build through the steps with real clicks on each ghost
  await d.pickPart(g.t, g.c);
  g = await d.ghostPos(); await d.click(g.x, g.y, { after: 500 });
  let overlaidFlow = false; let guard = 0;
  while (guard++ < 80) {
    g = await d.ghostPos(); if (!g) break;
    const cur = await page.evaluate(() => ({ t: window.__lego.state.type, c: window.__lego.state.color, step: window.__lego.guide().step }));
    if (cur.t !== g.t || cur.c !== g.c) await d.pickPart(g.t, g.c, { back: false });
    if (!overlaidFlow && cur.step >= 2) { overlaidFlow = true; await d.overlay('flow', 'top'); setTimeout(() => {}, 0); }
    d.speed = cur.step >= 3 ? 0.22 : cur.step >= 2 ? 0.45 : cur.step >= 1 ? 0.7 : 1; await d.click(g.x, g.y, { steps: 16, pause: 140, after: 240 });
    if (overlaidFlow && cur.step >= 4) await d.overlayOff();
    const done = await page.evaluate(() => document.getElementById('doneDlg').classList.contains('on')); if (done) break;
  }

  // 8 · success
  d.speed = 1; await sleep(600); h = await d.overlay('done', 'top'); await d.zoom(1.15, cx, cy); await sleep(h); await d.zoom(1, cx, cy); await d.overlayOff(); await sleep(300);
  await d.clickEl('#doneFree', { after: 800 });
  await page.evaluate(() => document.querySelector('#modes button[data-mode="showcase"]').click()); await sleep(600);
  h = await d.overlay('outro', 'center'); await sleep(h); await d.overlayOff(); await sleep(500);

  const video = page.video(); await ctx.close(); await browser.close();
  const src = await video.path(); const webm = path.join(OUT, 'lego-guided-build.webm'); fs.renameSync(src, webm);
  const ff = findFfmpeg(); const mp4 = webm.replace(/\.webm$/, '.mp4');
  if (ff) { execFileSync(ff, ['-y', '-i', webm, '-ss', String(CFG.trimHead ?? 1.2), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', '19', '-profile:v', 'high', '-movflags', '+faststart', '-r', '30', mp4], { stdio: 'inherit' }); console.log('MP4:', mp4); }
  else console.log('ffmpeg not found; WebM only:', webm);
}
run().catch(e => { console.error(e); process.exit(1); });
