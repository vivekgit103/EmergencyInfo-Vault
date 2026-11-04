const puppeteer = require('puppeteer');

async function check() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 320, height: 600 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  const overflowingElements = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const elements = document.querySelectorAll('*');
    const list = [];
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 1 || rect.width > docWidth + 1) {
        list.push({
          tag: el.tagName,
          className: el.className,
          id: el.id,
          width: Math.round(rect.width),
          right: Math.round(rect.right)
        });
      }
    }
    return list;
  });

  console.log('Overflowing elements on 320px:', JSON.stringify(overflowingElements.slice(0, 10), null, 2));
  await browser.close();
}

check();
