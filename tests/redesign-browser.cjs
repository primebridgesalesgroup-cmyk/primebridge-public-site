const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req,res) => {
  const name = new URL(req.url,'http://localhost').pathname;
  const target = path.resolve(root,'.'+(name.endsWith('/') ? name+'index.html' : name));
  if (!target.startsWith(root+path.sep)) return res.writeHead(403).end();
  fs.readFile(target,(error,data) => {
    if(error) return res.writeHead(404).end();
    res.setHeader('Content-Type',target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':'text/html');
    res.end(data);
  });
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true,...(process.env.TEST_BROWSER_PATH?{executablePath:process.env.TEST_BROWSER_PATH}:{})});
  try{
    for(const width of [1440,1024,768,390,320]){
      const page=await browser.newPage({viewport:{width,height:950}});
      const errors=[],external=[];
      page.on('pageerror',err=>errors.push(err.message));
      page.on('request',req=>{if(!req.url().startsWith(base))external.push(req.url());});
      for(const file of ['index.html','services.html','milestones.html','blockchain.html','privacy.html','waitlist.html','preview/index.html']){
        await page.goto(base+'/'+file);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}px overflow: ${file}`);
        assert.equal(await page.locator('h1').count(),1,file);
        if(file!=='preview/index.html'){
          const expectedLinks = file==='index.html' ? 9 : file==='waitlist.html' ? 6 : 8;
          assert.equal(await page.locator('#site-nav a').count(),expectedLinks,file);
          const collapsed=await page.locator('.menu-toggle').isVisible();
          if(collapsed){
            await page.locator('.menu-toggle').click();
            assert.equal(await page.locator('#site-nav').isVisible(),true);
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
          }
          // Public buttons must use the expected black/white contrast pair.
          const colors=await page.locator('.button:not(.outline)').evaluateAll(items=>items.map(el=>({color:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor})));
          for(const pair of colors){
            const luminance=rgb=>{
              const v=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});
              return .2126*v[0]+.7152*v[1]+.0722*v[2];
            };
            const a=luminance(pair.color),b=luminance(pair.bg);
            assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,JSON.stringify(pair));
          }
        }
        if(file==='services.html'){
          assert.equal(await page.locator('#delivery-fields').getAttribute('disabled'),null);
          assert.equal(await page.locator('option[value=property]').count(),0);
          assert.equal(await page.locator('#draft-details').getAttribute('open'),null);
        }
        if(file==='waitlist.html'){
          assert.equal(await page.locator('#waitlist-fields').isDisabled(),true);
          assert.equal(await page.locator('#waitlist-send').isDisabled(),true);
          assert.equal(await page.locator('form').count(),1);
        }
        if(file==='milestones.html')assert.doesNotMatch(await page.locator('main').innerText(),/private pull request|535 Python|checks were still failing/);
        if(process.env.TEST_SCREENSHOT_DIR&&[1440,390].includes(width)&&['index.html','services.html'].includes(file)){
          fs.mkdirSync(process.env.TEST_SCREENSHOT_DIR,{recursive:true});
          await page.screenshot({path:path.join(process.env.TEST_SCREENSHOT_DIR,`${file.replace('.html','')}-${width}.png`),fullPage:true});
          if(file==='index.html'&&width===1440)await page.screenshot({path:path.join(process.env.TEST_SCREENSHOT_DIR,'homepage-preview.png')});
        }
      }
      assert.deepEqual(errors,[]);
      assert.deepEqual(external,[],'No third-party script should load before a customer requests CAPTCHA');
      await page.close();
    }
    console.log('Redesign passed: seven pages at 1440/1024/768/390/320px, menus/Escape, button contrast, no overflow, form readiness, retired-sector removal, no automatic third-party requests');
  }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>server.close());
