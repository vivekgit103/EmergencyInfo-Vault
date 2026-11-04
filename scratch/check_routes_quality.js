const puppeteer = require('puppeteer');

const ROUTES = [
  '/',
  '/how-it-works',
  '/privacy',
  '/terms',
  '/login',
  '/register',
  '/dashboard',
  '/dashboard/preview',
  '/e/invalid-token'
];

const VIEWPORTS = [
  { width: 320, height: 600, name: '320px' },
  { width: 768, height: 1024, name: '768px' },
  { width: 1280, height: 800, name: '1280px' }
];

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    // Exclude informational logs
    if (type === 'error' || type === 'warning' || type === 'warn') {
      consoleLogs.push({ type, text, location: msg.location() });
    }
  });

  page.on('pageerror', err => {
    consoleLogs.push({ type: 'uncaught-error', text: err.toString() });
  });

  console.log('--- 1. TESTING ROUTES IN DEV SERVER ---');
  for (const route of ROUTES) {
    const url = `http://localhost:5173${route}`;
    consoleLogs.length = 0; // reset
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
      await new Promise(r => setTimeout(r, 400));
      console.log(`Route ${route}: status OK, errors/warnings: ${consoleLogs.length}`);
      if (consoleLogs.length > 0) {
        console.log('  Details:', JSON.stringify(consoleLogs, null, 2));
      }
    } catch (e) {
      console.error(`Route ${route} FAILED:`, e.message);
    }
  }

  console.log('\n--- 2. TESTING VIEWPORT RESPONSIVENESS (NO HORIZONTAL SCROLL) ---');
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    for (const route of ['/', '/login', '/register', '/dashboard/preview']) {
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle2' });
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      console.log(`Viewport ${vp.name} on ${route}: horizontal scroll = ${hasHorizontalScroll}`);
      if (hasHorizontalScroll) {
        const widths = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth
        }));
        console.log(`  Width mismatch:`, widths);
      }
    }
  }

  console.log('\n--- 3. TESTING ANIMATED BACKGROUND PROPERTIES ---');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  const bgAttrs = await page.evaluate(() => {
    const bg = document.querySelector('.animated-bg-container');
    if (!bg) return null;
    const computed = window.getComputedStyle(bg);
    return {
      ariaHidden: bg.getAttribute('aria-hidden'),
      pointerEvents: computed.pointerEvents,
      childCount: bg.querySelectorAll('.floating-shape').length
    };
  });
  console.log('Animated Background properties on /:', JSON.stringify(bgAttrs, null, 2));

  console.log('\n--- 4. TESTING KEYBOARD NAVIGATION & FOCUS ON /register ---');
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
  const focusOrder = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    const focusedInfo = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? { tag: el.tagName, id: el.id, className: el.className } : null;
    });
    focusOrder.push(focusedInfo);
  }
  console.log('Tab navigation on /register:', JSON.stringify(focusOrder, null, 2));

  await browser.close();
  console.log('\nHeadless browser test complete.');
}

run().catch(err => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
