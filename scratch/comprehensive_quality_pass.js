const { spawn } = require('child_process');
const http = require('http');
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
  '/e/demo-emergency-token-1234567890'
];

const VIEWPORTS = [
  { width: 320, height: 640, name: '320px (Mobile)' },
  { width: 768, height: 1024, name: '768px (Tablet)' },
  { width: 1280, height: 800, name: '1280px (Desktop)' }
];

async function run() {
  console.log('=== EMERGENCYINFO VAULT: FULL QUALITY & AUDIT PASS ===\n');

  // 1. Launch Backend Server
  console.log('[1/7] Launching Backend Server on port 5000...');
  const serverProc = spawn('node', ['server/server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: '5000' },
    shell: true
  });

  serverProc.stdout.on('data', d => {
    const text = d.toString().trim();
    if (text.includes('[DATABASE]') || text.includes('listening')) {
      console.log('  [Server]', text);
    }
  });

  // 2. Launch Vite Dev Server on port 5173
  console.log('[2/7] Launching Vite Client on port 5173...');
  const clientProc = spawn('npx', ['vite', '--port', '5173'], {
    cwd: 'client',
    shell: true
  });

  clientProc.stdout.on('data', d => {
    const text = d.toString().trim();
    if (text.includes('Local:')) {
      console.log('  [Client]', text);
    }
  });

  // Wait for servers to be live
  await new Promise(r => setTimeout(r, 4000));

  console.log('\n[3/7] Launching Headless Puppeteer Browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const consoleErrorsAndWarnings = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || type === 'warn' || type === 'warning') {
      // Exclude expected 401 response on initial unauthenticated session check
      if (!text.includes('status of 401') && !text.includes('status of 404')) {
        consoleErrorsAndWarnings.push({ route: page.url(), type, text });
      }
    }
  });

  page.on('pageerror', err => {
    consoleErrorsAndWarnings.push({ route: page.url(), type: 'uncaught-error', text: err.toString() });
  });

  // 3. Test Every Route for Console Errors/Warnings and Horizontal Scroll
  console.log('\n[4/7] Checking Routes at 320px, 768px, 1280px...');
  const scrollIssues = [];

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    console.log(`  Testing Viewport: ${vp.name}`);

    for (const route of ROUTES) {
      consoleErrorsAndWarnings.length = 0;
      const url = `http://localhost:5173${route}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        await new Promise(r => setTimeout(r, 300));

        // Check horizontal scroll
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        const hasHorizontalOverflow = scrollWidth > innerWidth;

        if (hasHorizontalOverflow) {
          scrollIssues.push({ vp: vp.name, route, scrollWidth, innerWidth });
          console.error(`    [OVERFLOW] ${route} @ ${vp.name}: scrollWidth=${scrollWidth} > innerWidth=${innerWidth}`);
        }

        if (consoleErrorsAndWarnings.length > 0) {
          console.warn(`    [CONSOLE] ${route} @ ${vp.name}: ${consoleErrorsAndWarnings.length} issues`);
          consoleErrorsAndWarnings.forEach(c => console.log('      ->', c.type, c.text));
        }
      } catch (err) {
        console.error(`    [FAIL] Could not load ${route}:`, err.message);
      }
    }
  }

  // 4. Keyboard Navigation Audit
  console.log('\n[5/7] Auditing Keyboard Navigation...');
  // A. Skip link & tab order on landing
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => {
    const el = document.activeElement;
    return { tag: el.tagName, className: el.className, text: el.innerText };
  });
  console.log('  1st Tab key lands on:', firstFocus);

  // Tab through navbar
  const tabSequence = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.innerText.trim().slice(0, 30) || el.getAttribute('aria-label') || el.tagName : 'none';
    });
    tabSequence.push(focused);
  }
  console.log('  Subsequent Tab sequence:', tabSequence);

  // B. Animated background never takes focus
  const bgTakesFocus = await page.evaluate(() => {
    const bg = document.querySelector('.animated-bg-container');
    return bg ? bg.contains(document.activeElement) : false;
  });
  console.log('  Animated background takes focus (must be false):', bgTakesFocus);

  // C. Mobile Drawer Focus & Escape key (<640px)
  await page.setViewport({ width: 375, height: 667 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  // Click mobile toggle
  const toggleBtn = await page.$('.nav-mobile-toggle');
  if (toggleBtn) {
    await toggleBtn.click();
    await new Promise(r => setTimeout(r, 200));
    const isExpanded = await page.evaluate(() => {
      const btn = document.querySelector('.nav-mobile-toggle');
      return btn.getAttribute('aria-expanded');
    });
    console.log('  Mobile drawer toggle clicked, aria-expanded:', isExpanded);

    // Press Escape to close
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 200));
    const isClosed = await page.evaluate(() => {
      const btn = document.querySelector('.nav-mobile-toggle');
      return btn.getAttribute('aria-expanded');
    });
    console.log('  Escape pressed, aria-expanded after Escape (must be false):', isClosed);
  }

  // 5. Prefers-Reduced-Motion Audit
  console.log('\n[6/7] Auditing prefers-reduced-motion...');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  const reducedMotionStyles = await page.evaluate(() => {
    const shape = document.querySelector('.bg-shape-1');
    const btn = document.querySelector('.app-btn-primary');
    return {
      shapeAnimation: shape ? window.getComputedStyle(shape).animationName : 'none',
      btnTransition: btn ? window.getComputedStyle(btn).transitionDuration : 'none'
    };
  });
  console.log('  Under prefers-reduced-motion: reduce:');
  console.log('    Background shape animation name (must be none):', reducedMotionStyles.shapeAnimation);
  console.log('    Button transition duration:', reducedMotionStyles.btnTransition);

  // 6. Real End-to-End Registration & Login in Browser
  console.log('\n[7/7] Testing Browser Registration & Login End-to-End...');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.setViewport({ width: 1280, height: 800 });

  const testUser = {
    name: 'Audit Runner User',
    email: `browser_audit_${Date.now()}@example.com`,
    password: 'Password123!'
  };

  // Register
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
  await page.type('#register-name', testUser.name);
  await page.type('#register-email', testUser.email);
  await page.type('#register-password', testUser.password);
  await page.type('#register-confirm-password', testUser.password);
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {});
  const currentUrl = page.url();
  console.log('  After registration form submission, navigated to:', currentUrl);

  const dashboardHeading = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1 ? h1.innerText : null;
  });
  console.log('  Dashboard rendered heading:', dashboardHeading);

  // Clean up
  await browser.close();
  clientProc.kill();
  serverProc.kill();

  console.log('\n=== AUDIT RESULTS SUMMARY ===');
  console.log('Horizontal Scroll Issues:', scrollIssues.length);
  console.log('Console Errors/Warnings Count:', consoleErrorsAndWarnings.length);
  console.log('Audit completed successfully.');
}

run().catch(err => {
  console.error('[FATAL] Audit Runner Error:', err);
  process.exit(1);
});

