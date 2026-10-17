const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const target = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!target.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.readFile(target, (err, data) => {
    if (err) return res.writeHead(404).end();
    res.setHeader('Content-Type', target.endsWith('.js') ? 'text/javascript' : target.endsWith('.css') ? 'text/css' : 'text/html');
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, ...(process.env.TEST_BROWSER_PATH ? { executablePath: process.env.TEST_BROWSER_PATH } : {}) });
  try {
    // Rollback gate: disabled delivery must never load CAPTCHA or send requests.
    const locked = await browser.newPage();
    await locked.route('**/inquiry-delivery.js', route => route.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(path.join(root, 'inquiry-delivery.js'), 'utf8').replace('const DELIVERY_ENABLED = true;', 'const DELIVERY_ENABLED = false;') }));
    const network = [];
    locked.on('request', req => { if (!req.url().startsWith(origin)) network.push(req.url()); });
    await locked.goto(origin + '/services.html');
    assert.equal(await locked.locator('#inquiry-delivery').isVisible(), false);
    assert.equal(await locked.locator('#delivery-fields').getAttribute('disabled'), '');
    assert.deepEqual(network, []);
    await locked.close();
    const cases = [
      ['success', 1440], ['success', 390], ['success', 320],
      ['rejection', 390], ['limited', 390], ['server', 390], ['malformed', 390],
      ['offline', 390], ['transport', 390], ['timeout', 390], ['captcha-failure', 390]
    ];
    for (const [scenario, width] of cases) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const calls = [], errors = [], unexpected = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.route('**/*', async route => {
        const req = route.request(), url = req.url();
        if (url === origin + '/inquiry-delivery.js') {
          let source = fs.readFileSync(path.join(root, 'inquiry-delivery.js'), 'utf8');
          source = source.replace('const DELIVERY_ENABLED = false;', 'const DELIVERY_ENABLED = true;');
          if (scenario === 'timeout') source = source.replace('}, 15000)', '}, 20)').replace('controller.abort(), 15000', 'controller.abort(), 20');
          return route.fulfill({ contentType: 'text/javascript', body: source });
        }
        if (url === 'https://web3forms.com/client/script.js') {
          if (scenario === 'captcha-failure') return route.abort();
          return route.fulfill({ contentType: 'text/javascript', body: `const el=document.createElement('textarea');el.name='h-captcha-response';el.value='synthetic-captcha';el.hidden=true;document.getElementById('delivery-form').append(el);window.hcaptcha={reset:()=>{el.value='';}};` });
        }
        if (url === 'https://api.web3forms.com/submit') {
          calls.push({ method: req.method(), headers: req.headers(), data: req.postDataJSON() });
          if (scenario === 'transport') return route.abort();
          if (scenario === 'timeout') { await new Promise(resolve => setTimeout(resolve, 100)); return route.abort(); }
          const code = scenario === 'limited' ? 429 : scenario === 'rejection' ? 400 : scenario === 'server' ? 503 : 200;
          return route.fulfill({ status: code, contentType: 'application/json', body: scenario === 'malformed' ? '<raw-sensitive-response>' : JSON.stringify({ success: scenario === 'success', message: '<script>untrusted</script>' }) });
        }
        if (url.startsWith(origin)) return route.continue();
        unexpected.push(url);
        return route.abort();
      });
      await page.goto(origin + '/services.html');
      await page.locator('#inquiry-delivery').waitFor({ state: 'visible' });
      await page.locator('#send-inquiry').click();
      assert.equal(calls.length, 0);
      await page.locator('#delivery-name').fill('Synthetic verification');
      await page.locator('#delivery-email').fill('test@example.com');
      await page.locator('#delivery-service').selectOption('assets');
      await page.locator('#delivery-kind').selectOption('quote');
      await page.locator('#delivery-area').fill('Hartford');
      await page.locator('#delivery-message').fill('<img src=x onerror=alert(1)> Synthetic test only');
      await page.locator('#delivery-consent').check();
      await page.locator('#send-inquiry').click();
      assert.match(await page.locator('#delivery-status').innerText(), /spam check/);
      assert.equal(calls.length, 0);
      await page.locator('#load-inquiry-captcha').click();
      if (scenario === 'captcha-failure') {
        await page.waitForFunction(() => document.querySelector('#delivery-status').textContent.includes('could not load'));
        assert.equal(await page.locator('#load-inquiry-captcha').isEnabled(), true);
      } else {
        await page.waitForFunction(() => document.querySelector('[name="h-captcha-response"]')?.value);
        if (scenario === 'offline') await page.evaluate(() => Object.defineProperty(navigator, 'onLine', { value: false }));
        // Two simultaneous events exercise the synchronous in-flight guard.
        await page.evaluate(() => { const form = document.getElementById('delivery-form'); for (let i=0;i<2;i++) form.dispatchEvent(new Event('submit', { cancelable: true })); });
        if (scenario === 'offline') {
          assert.equal(calls.length, 0);
          assert.match(await page.locator('#delivery-status').innerText(), /offline/);
        } else {
          await page.waitForFunction(() => !document.querySelector('#delivery-form').hasAttribute('aria-busy'));
          assert.equal(calls.length, 1, scenario);
          const sent = calls[0];
          assert.equal(sent.method, 'POST');
          assert.equal(sent.headers.cookie, undefined);
          assert.equal(sent.headers.authorization, undefined);
          assert.equal(sent.headers.referer, undefined);
          assert.equal(sent.data.email, 'test@example.com');
          assert.equal(sent.data.access_key, '6aace9f5-88b7-41d8-a387-4b20f43378d7');
          assert.equal(sent.data['h-captcha-response'], 'synthetic-captcha');
          assert.equal(sent.data.botcheck, false);
          assert.equal(Object.hasOwn(sent.data, 'redirect'), false);
          assert.equal(await page.locator('#delivery-form img').count(), 0);
          const message = await page.locator('#delivery-status').innerText();
          assert.equal(message.includes('untrusted'), false);
          if (scenario === 'success') {
            assert.match(message, /does not confirm inbox delivery/);
            assert.equal(await page.locator('#delivery-name').inputValue(), '');
            assert.equal(await page.locator('#send-inquiry').isEnabled(), false);
          } else {
            assert.equal(await page.locator('#delivery-name').inputValue(), 'Synthetic verification');
            if (['rejection', 'limited'].includes(scenario)) {
              assert.equal(await page.locator('#send-inquiry').isEnabled(), true);
              assert.equal(await page.locator('[name="h-captcha-response"]').inputValue(), '');
            } else {
              assert.match(message, /may have arrived/);
              assert.equal(await page.locator('#send-inquiry').isEnabled(), false);
            }
          }
        }
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      assert.deepEqual(unexpected, []);
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Delivery mocks passed: release gate, desktop/mobile, validation, CAPTCHA load/failure, one POST, accepted/rejected/limited/ambiguous/offline/timeout, retained errors, no private APIs/storage');
  } finally { await browser.close(); }
})().catch(err => { console.error(err); process.exitCode = 1; }).finally(() => server.close());
