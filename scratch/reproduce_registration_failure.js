const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.text()));
  page.on('pageerror', err => console.log('[BROWSER PAGE ERROR]', err.message));

  console.log('Navigating to http://localhost:5173/register ...');
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });

  console.log('Filling registration form...');
  await page.type('#register-name', 'Test User');
  await page.type('#register-email', 'testuser@example.com');
  await page.type('#register-password', 'Password123!');
  await page.type('#register-confirm-password', 'Password123!');

  console.log('Submitting registration form...');
  await page.click('button[type="submit"]');

  // Wait for response or error alert to appear
  await page.waitForSelector('.alert-danger, .alert-success', { timeout: 10000 }).catch(() => {});

  const alertText = await page.evaluate(() => {
    const el = document.querySelector('.alert');
    return el ? el.innerText.trim() : 'No alert found';
  });

  console.log('REPRODUCED RESULT ON PAGE:', alertText);
  await browser.close();
})();
