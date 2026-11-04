const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching headless browser to test registration...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to http://localhost:5173/register ...');
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });

  console.log('Filling registration form with new user...');
  const testEmail = `browseruser_${Date.now()}@example.com`;
  await page.type('#register-name', 'Elena Rostova');
  await page.type('#register-email', testEmail);
  await page.type('#register-password', 'SecurePass123!');
  await page.type('#register-confirm-password', 'SecurePass123!');

  console.log('Clicking Create Account button...');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});

  const currentUrl = page.url();
  console.log('CURRENT URL AFTER REGISTRATION:', currentUrl);

  const headingText = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1 ? h1.innerText : 'No h1 found';
  });
  console.log('PAGE HEADING ON DASHBOARD:', headingText);

  // Now test duplicate email in a clean, incognito context (logged-out)
  console.log('Testing duplicate registration in fresh incognito context...');
  const context2 = await browser.createBrowserContext();
  const page2 = await context2.newPage();
  await page2.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });

  await page2.type('#register-name', 'Elena Duplicate');
  await page2.type('#register-email', testEmail); // duplicate email
  await page2.type('#register-password', 'SecurePass123!');
  await page2.type('#register-confirm-password', 'SecurePass123!');
  await page2.click('button[type="submit"]');

  await page2.waitForSelector('.alert-danger', { timeout: 5000 }).catch(() => {});
  const duplicateAlert = await page2.evaluate(() => {
    const el = document.querySelector('.alert-danger');
    return el ? el.innerText.trim() : 'No duplicate alert found';
  });
  console.log('DUPLICATE EMAIL ALERT IN BROWSER:', duplicateAlert);

  await browser.close();

  if (currentUrl.includes('/dashboard') && duplicateAlert.includes('already exists')) {
    console.log('SUCCESS: Browser registration and duplicate email handling verified 100%!');
    process.exit(0);
  } else {
    console.error('FAILED: Browser registration check did not meet expected results.');
    process.exit(1);
  }
})();
