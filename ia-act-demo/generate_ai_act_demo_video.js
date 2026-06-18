const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const workspaceRoot = 'C:/Users/PC/Documents/IA Act';
const htmlPath = path.join(workspaceRoot, 'IA-Act-Classification_V4.html');
const outDir = path.join(workspaceRoot, 'video_outputs');
const videoDir = path.join(outDir, 'raw_video');
const finalVideo = path.join(outDir, 'IA_Act_demo_v4_1_commercial.webm');
const finalZip = path.join(outDir, 'IA_Act_demo_v4_1_commercial_video.zip');
const scriptNote = path.join(outDir, 'README.txt');
const browserCandidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
];

fs.mkdirSync(videoDir, { recursive: true });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function installCursor(page) {
  await page.evaluate(() => {
    const old = document.getElementById('demo-cursor');
    if (old) old.remove();
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.style.cssText = [
      'position:fixed',
      'left:20px',
      'top:20px',
      'width:22px',
      'height:22px',
      'border-radius:50%',
      'background:rgba(220,128,86,0.92)',
      'border:2px solid #fff',
      'box-shadow:0 8px 20px rgba(44,52,70,.25)',
      'z-index:999999',
      'pointer-events:none',
      'transform:translate(-4px,-4px)',
      'transition:transform .08s ease-out'
    ].join(';');
    const inner = document.createElement('div');
    inner.style.cssText = [
      'position:absolute',
      'left:6px',
      'top:6px',
      'width:6px',
      'height:6px',
      'border-radius:50%',
      'background:#fff'
    ].join(';');
    cursor.appendChild(inner);
    document.body.appendChild(cursor);
    window.__demoCursor = {
      set(x, y) {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
      },
      down() {
        cursor.style.transform = 'translate(-4px,-4px) scale(.86)';
      },
      up() {
        cursor.style.transform = 'translate(-4px,-4px) scale(1)';
      }
    };
  });
}

async function setCursor(page, x, y) {
  await page.evaluate(({ xPos, yPos }) => {
    window.__demoCursor?.set(xPos, yPos);
  }, { xPos: x, yPos: y });
}

async function moveCursor(page, from, to, duration = 500, steps = 18) {
  for (let i = 1; i <= steps; i += 1) {
    const p = i / steps;
    const ease = 1 - Math.pow(1 - p, 2);
    const x = from.x + ((to.x - from.x) * ease);
    const y = from.y + ((to.y - from.y) * ease);
    await page.mouse.move(x, y);
    await setCursor(page, x, y);
    await wait(Math.max(12, Math.round(duration / steps)));
  }
  return { x: to.x, y: to.y };
}

async function pointFor(page, selector) {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`No bounding box for ${selector}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function humanClick(page, cursor, selector, waitAfter = 800) {
  const target = await pointFor(page, selector);
  cursor = await moveCursor(page, cursor, target, 420, 16);
  await page.evaluate(() => window.__demoCursor?.down());
  await page.mouse.down();
  await wait(90);
  await page.mouse.up();
  await page.evaluate(() => window.__demoCursor?.up());
  await wait(waitAfter);
  return cursor;
}

async function humanCheck(page, cursor, selector, waitAfter = 340) {
  cursor = await humanClick(page, cursor, selector, 100);
  await page.locator(selector).check({ force: true });
  await wait(waitAfter);
  return cursor;
}

async function humanType(page, cursor, selector, text, waitAfter = 320) {
  cursor = await humanClick(page, cursor, selector, 120);
  await page.locator(selector).fill('');
  await page.locator(selector).type(text, { delay: 26 });
  await wait(waitAfter);
  return cursor;
}

async function smoothScroll(page, fromY, toY, duration = 850, steps = 18) {
  for (let i = 1; i <= steps; i += 1) {
    const p = i / steps;
    const ease = 1 - Math.pow(1 - p, 3);
    const y = fromY + ((toY - fromY) * ease);
    await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
    await wait(Math.max(14, Math.round(duration / steps)));
  }
  return toY;
}

async function run() {
  if (!fs.existsSync(htmlPath)) throw new Error(`HTML not found: ${htmlPath}`);

  const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));
  if (!executablePath) throw new Error('No local Chrome/Edge executable found for Playwright recording.');

  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } }
  });

  const page = await context.newPage();
  page.on('pageerror', (err) => console.error('PAGEERROR', err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('CONSOLE', msg.text());
  });

  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'load' });
  await page.addStyleTag({
    content: `
      * { scroll-behavior: auto !important; }
      .card, .result, .wiz-card, #certificat-doc { transition: none !important; }
      body::after{
        content:'';
        position:fixed; inset:0; pointer-events:none;
        background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(0,0,0,.02));
        z-index:999998;
      }
    `
  });
  await installCursor(page);

  let cursor = { x: 180, y: 90 };
  let scrollY = 0;
  await setCursor(page, cursor.x, cursor.y);
  await wait(1500);

  scrollY = await smoothScroll(page, scrollY, 260, 700, 14);
  await wait(450);
  scrollY = await smoothScroll(page, scrollY, 720, 900, 18);
  await wait(550);

  cursor = await humanClick(page, cursor, 'a[href="#t1"]', 900);
  cursor = await humanCheck(page, cursor, 'input[name="t1q1"][value="2"]');
  cursor = await humanCheck(page, cursor, 'input[name="t1q2"][value="2"]');
  cursor = await humanCheck(page, cursor, 'input[name="t1q3"][value="2"]');
  cursor = await humanCheck(page, cursor, 'input[name="t1q4"][value="1"]');
  cursor = await humanClick(page, cursor, 'button[onclick="evalT1()"]', 1700);

  cursor = await humanClick(page, cursor, 'a[href="#t2"]', 900);
  cursor = await humanCheck(page, cursor, 'input[data-cat="haut"][value="Recrutement / RH"]', 260);
  cursor = await humanCheck(page, cursor, 'input[data-cat="limite"][value="Chatbot / interaction directe"]', 260);
  cursor = await humanClick(page, cursor, 'button[onclick="evalT2()"]', 1800);

  cursor = await humanClick(page, cursor, 'a[href="#arbre"]', 900);
  cursor = await humanClick(page, cursor, '#wiz-card .wiz-opt:nth-of-type(2)', 650);
  cursor = await humanClick(page, cursor, '#wiz-card .wiz-opt:nth-of-type(1)', 650);
  cursor = await humanClick(page, cursor, '#wiz-card .wiz-opt:nth-of-type(2)', 650);
  cursor = await humanClick(page, cursor, '#wiz-card .wiz-opt:nth-of-type(2)', 1700);

  cursor = await humanClick(page, cursor, 'a[href="#t3"]', 900);
  cursor = await humanCheck(page, cursor, 'input[name="t3q1"][value="oui"]');
  cursor = await humanCheck(page, cursor, 'input[name="t3q2"][value="non"]');
  cursor = await humanCheck(page, cursor, 'input[name="t3q3"][value="oui"]');
  cursor = await humanCheck(page, cursor, 'input[name="t3q4"][value="non"]');
  cursor = await humanCheck(page, cursor, 'input[name="t3q5"][value="non"]');
  cursor = await humanClick(page, cursor, 'button[onclick="evalT3()"]', 1600);

  cursor = await humanClick(page, cursor, 'a[href="#t4"]', 800);
  const t4Targets = await page.locator('section#t4 input[type="checkbox"]').evaluateAll((els) =>
    els.slice(0, 7).map((el) => {
      const box = el.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    })
  );
  for (const target of t4Targets) {
    cursor = await moveCursor(page, cursor, target, 260, 12);
    await page.evaluate(() => window.__demoCursor?.down());
    await page.mouse.down();
    await wait(55);
    await page.mouse.up();
    await page.evaluate(() => window.__demoCursor?.up());
    await page.mouse.click(target.x, target.y);
    await wait(120);
  }
  cursor = await humanClick(page, cursor, 'button[onclick="evalT4()"]', 1500);

  cursor = await humanClick(page, cursor, 'a[href="#t5"]', 850);
  cursor = await humanCheck(page, cursor, 'input[name="t5q1"][value="oui"]');
  cursor = await humanCheck(page, cursor, 'input[name="t5q2"][value="oui"]');
  cursor = await humanCheck(page, cursor, 'input[name="t5q3"][value="oui"]');
  cursor = await humanCheck(page, cursor, 'input[name="t5q4"][value="incertain"]');
  cursor = await humanCheck(page, cursor, 'input[name="t5q5"][value="non"]');
  cursor = await humanClick(page, cursor, 'button[onclick="evalT5()"]', 1500);

  cursor = await humanClick(page, cursor, 'a[href="#roadmap"]', 900);
  cursor = await humanClick(page, cursor, '#rm-horizon', 260);
  await page.selectOption('#rm-horizon', '180');
  await wait(280);
  cursor = await humanClick(page, cursor, '#rm-mode', 260);
  await page.selectOption('#rm-mode', 'risk');
  await wait(320);
  cursor = await humanClick(page, cursor, 'button[onclick="generateRoadmap()"]', 2000);

  cursor = await humanClick(page, cursor, 'a[href="#certificat"]', 950);
  cursor = await humanType(page, cursor, '#cf-ref', 'AURIA-IA-2026-DEMO', 180);
  cursor = await humanType(page, cursor, '#cf-sys', 'Assistant de présélection de candidatures', 180);
  cursor = await humanType(page, cursor, '#cf-fin', 'Outil d’analyse et de recommandation pour orienter le tri initial de candidatures à un poste sensible.', 240);
  cursor = await humanType(page, cursor, '#cf-red-nom', 'Consultant Demo', 120);
  cursor = await humanType(page, cursor, '#cf-red-fonc', 'Manager AI Act', 120);
  cursor = await humanType(page, cursor, '#cf-val-nom', 'Responsable Conformité', 120);
  cursor = await humanType(page, cursor, '#cf-val-fonc', 'Head of Compliance', 180);
  cursor = await humanClick(page, cursor, 'button[onclick="generateCert()"]', 2600);

  scrollY = await page.evaluate(() => window.scrollY);
  scrollY = await smoothScroll(page, scrollY, 9999, 1200, 24);
  await wait(2800);

  const video = page.video();
  await context.close();
  const videoPath = await video.path();
  await browser.close();

  if (fs.existsSync(finalVideo)) fs.unlinkSync(finalVideo);
  fs.copyFileSync(videoPath, finalVideo);

  const note = [
    'AI Act Demo Video v4.1 commercial cut',
    'Style: commercial rhythm with visible cursor and click path',
    `Source HTML: ${htmlPath}`,
    `Generated at: ${new Date().toISOString()}`,
    '',
    'Contents:',
    '- IA_Act_demo_v4_1_commercial.webm'
  ].join('\n');
  fs.writeFileSync(scriptNote, note, 'utf8');

  console.log(`VIDEO_READY=${finalVideo}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
