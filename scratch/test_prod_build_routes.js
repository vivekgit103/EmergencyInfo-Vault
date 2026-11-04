const { spawn } = require('child_process');
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
  '/e/test-token'
];

async function main() {
  console.log('Starting vite preview on port 4173...');
  const preview = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    cwd: 'm:/GitHub/Backend CIA Prject/client',
    shell: true
  });

  preview.stdout.on('data', data => console.log('[preview]', data.toString().trim()));
  preview.stderr.on('data', data => console.error('[preview err]', data.toString().trim()));

  // Wait for preview server to start
  await new Promise(r => setTimeout(r, 2500));

  console.log('Launching headless browser against production build...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const issues = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    // Catch real warnings/errors, ignoring expected 401/404 fetch network status
    if (type === 'error' || type === 'warn' || type === 'warning') {
      if (!text.includes('Failed to load resource: the server responded with a status of 401') &&
          !text.includes('Failed to load resource: the server responded with a status of 404')) {
        issues.push({ type, text, location: msg.location() });
      }
    }
  });

  page.on('pageerror', err => {
    issues.push({ type: 'pageerror', text: err.toString() });
  });

  let totalIssues = 0;
  for (const route of ROUTES) {
    issues.length = 0;
    try {
      await page.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle2', timeout: 5000 });
      await new Promise(r => setTimeout(r, 300));
      console.log(`Route ${route}: Issues count = ${issues.length}`);
      if (issues.length > 0) {
        totalIssues += issues.length;
        console.log('  Details:', JSON.stringify(issues, null, 2));
      }
    } catch (e) {
      console.error(`Route ${route} navigation error:`, e.message);
    }
  }

  await browser.close();
  preview.kill();

  console.log(`\nProduction Build Route Audit complete. Total issues: ${totalIssues}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
