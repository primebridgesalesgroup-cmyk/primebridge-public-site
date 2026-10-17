const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const target = path.resolve(root, '.' + pathname);
  if (!target.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.readFile(target, (err, data) => {
    if (err) return res.writeHead(404).end();
    res.setHeader('Content-Type', target.endsWith('.js') ? 'text/javascript' : target.endsWith('.css') ? 'text/css' : 'text/html');
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/services.html`;
  const browser = await chromium.launch({ headless: true, ...(process.env.TEST_BROWSER_PATH ? { executablePath: process.env.TEST_BROWSER_PATH } : {}) });
  try {
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [], requests = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(url);
      await page.waitForFunction(() => !document.querySelector('#inquiry-fields').disabled);
      page.on('request', req => requests.push(req.url()));
      await page.getByRole('button', { name: 'Prepare draft', exact: true }).click();
      assert.equal(await page.locator('#inquiry-draft').inputValue(), '');
      await page.locator('#inquiry-service').selectOption('property');
      await page.locator('#request-kind').selectOption('quote');
      await page.locator('#inquiry-area').fill('Hartford');
      await page.locator('#inquiry-summary').fill('<img src=x onerror=alert(1)> Roof project');
      await page.getByRole('button', { name: 'Prepare draft', exact: true }).click();
      assert.equal(await page.locator('#inquiry-draft').inputValue(), ''); // acknowledgment required
      await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: 'Prepare draft', exact: true }).click();
      assert.match(await page.locator('#inquiry-draft').inputValue(), /Quote inquiry/);
      assert.match(await page.locator('#inquiry-draft').inputValue(), /<img src=x/);
      assert.equal(await page.locator('#inquiries img').count(), 0);
      assert.equal(await page.locator('#inquiry-draft').evaluate(el => el === document.activeElement), true);
      await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw Error('denied'); } } }));
      await page.locator('#copy-inquiry').click();
      await page.waitForFunction(() => document.querySelector('#inquiry-status').textContent.includes('manually'));
      await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.copiedDraft = text; } } }));
      await page.locator('#copy-inquiry').click();
      await page.waitForFunction(() => document.querySelector('#inquiry-status').textContent.includes('Draft copied'));
      assert.equal(await page.evaluate(() => window.copiedDraft), await page.locator('#inquiry-draft').inputValue());
      await page.locator('#inquiry-summary').fill('Updated project');
      assert.equal(await page.locator('#inquiry-draft').inputValue(), '');
      assert.equal(await page.locator('#copy-inquiry').isDisabled(), true);
      for (const service of ['property', 'assets', 'business', 'merchant', 'blockchain', 'energy']) {
        await page.locator('#inquiry-service').selectOption(service);
        await page.getByRole('button', { name: 'Prepare draft', exact: true }).click();
        assert.match(await page.locator('#inquiry-draft').inputValue(), /Updated project/);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.getByRole('button', { name: 'Clear draft and fields' }).click();
      assert.equal(await page.locator('#inquiry-summary').inputValue(), '');
      assert.equal(await page.locator('#inquiry-draft').inputValue(), '');
      assert.equal(await page.getByRole('checkbox').isChecked(), false);
      assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie]), [0, 0, '']);
      assert.deepEqual(requests, []);
      assert.deepEqual(errors, []);
      await page.reload();
      assert.equal(await page.locator('#inquiry-summary').inputValue(), '');
      await page.close();
    }
    const page = await browser.newPage({ javaScriptEnabled: false });
    const requests = [];
    await page.goto(url);
    page.on('request', req => requests.push(req.url()));
    assert.equal(await page.locator('#inquiry-fields').getAttribute('disabled'), '');
    assert.equal(await page.getByRole('button', { name: 'Prepare draft', exact: true }).isDisabled(), true);
    assert.equal(await page.locator('noscript').isVisible(), true);
    assert.deepEqual(requests, []);
    await page.close();
    console.log('Inquiry: desktop/mobile, validation, all services, safe text, clipboard success/failure, clearing, no delivery/storage, and no-JS passed');
  } finally { await browser.close(); }
})().catch(err => { console.error(err); process.exitCode = 1; }).finally(() => server.close());
