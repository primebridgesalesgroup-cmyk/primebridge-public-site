const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://local').pathname;
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  fs.readFile(file,(err,data)=>{
    if(err)return res.writeHead(404).end();
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');
    res.end(data);
  });
});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [390,1440]){
   const page=await browser.newPage({viewport:{width,height:900}});
   let posts=0;let outbound=null;
   await page.route('https://api.web3forms.com/submit',async route=>{
    posts++;outbound=JSON.parse(route.request().postData());
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true})});
   });
   await page.goto('http://127.0.0.1:'+server.address().port+'/waitlist.html');
   assert.equal(await page.locator('#waitlist-send').isDisabled(),false);
   await page.locator('#waitlist-send').click();
   assert.equal(posts,0,'Empty form must never post');
   await page.locator('#waitlist-email').fill('subscriber@example.com');
   await page.locator('#waitlist-role').selectOption('merchant');
   await page.locator('#waitlist-consent').check();
   await page.locator('#waitlist-send').click();
   assert.equal(posts,0,'Captcha absence must never post');
   assert.match(await page.locator('#waitlist-status').innerText(),/spam protection/i);
   await page.evaluate(()=>{
     const input=document.createElement('input');
     input.name='h-captcha-response';input.type='hidden';input.value='synthetic-test-token';
     document.querySelector('#waitlist-form').append(input);
   });
   await page.locator('#waitlist-send').click();
   await page.waitForFunction(()=>document.getElementById('waitlist-status').textContent.includes('accepted by our form provider'));
   assert.equal(posts,1);
   assert.equal(outbound.email,'subscriber@example.com');
   assert.equal(outbound.interest,'merchant');
   assert.match(outbound.consent,/explicitly request/);
   assert.equal(await page.locator('#waitlist-send').isDisabled(),true);
   await page.close();
  }
  console.log('Waitlist mocked registration passed: desktop/mobile validation, consent, CAPTCHA gate, accepted delivery and duplicate lock');
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1}).finally(()=>server.close());
