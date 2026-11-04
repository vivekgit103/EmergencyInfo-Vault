const puppeteer = require('puppeteer');

async function testKeyboard() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const pagesToTest = [
    { name: 'Landing', url: 'http://localhost:5173/' },
    { name: 'Login', url: 'http://localhost:5173/login' },
    { name: 'Register', url: 'http://localhost:5173/register' }
  ];

  for (const item of pagesToTest) {
    console.log(`\n=== Testing Keyboard Navigation: ${item.name} ===`);
    await page.goto(item.url, { waitUntil: 'networkidle2' });

    // Press Tab multiple times and inspect activeElement
    for (let step = 1; step <= 7; step++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const style = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          id: el.id,
          text: (el.innerText || el.value || el.getAttribute('aria-label') || '').slice(0, 30).trim(),
          outlineWidth: style.outlineWidth,
          outlineStyle: style.outlineStyle,
          outlineOffset: style.outlineOffset,
          outlineColor: style.outlineColor
        };
      });

      if (info) {
        console.log(`Step ${step}: <${info.tag}> id="${info.id}" text="${info.text}" outline="${info.outlineWidth} ${info.outlineStyle} ${info.outlineColor}"`);
      } else {
        console.log(`Step ${step}: (no active element or body)`);
      }
    }
  }

  await browser.close();
  console.log('\nKeyboard navigation audit complete.');
}

testKeyboard().catch(err => {
  console.error(err);
  process.exit(1);
});
