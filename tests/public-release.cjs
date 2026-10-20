const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const root=path.resolve(__dirname,'../_public');
const pages=['index.html','services.html','blockchain.html','milestones.html','privacy.html','waitlist.html','waitlist-privacy.html'];
const retired=['sandbox.html','preview/index.html','preview/main.js','dashboard.html','dashboard.js','portfolio.js','signin.html','access.js'];
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 const target=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
 if(!target.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(target,(error,data)=>{
  if(error){res.writeHead(404,{'Content-Type':'text/html'});return res.end(fs.readFileSync(path.join(root,'404.html')));}
  res.setHeader('Content-Type',target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':target.endsWith('.webp')?'image/webp':'text/html');res.end(data);
 });
});
(async()=>{
 assert.equal(fs.existsSync(path.resolve(__dirname,'../.nojekyll')),false,'Root nojekyll bypasses the legacy exclusion boundary');
 const legacy=fs.readFileSync(path.resolve(__dirname,'../_config.yml'),'utf8');
 for(const entry of ['dashboard.html','dashboard.js','portfolio.js','signin.html','access.js','sandbox.html','preview'])assert.ok(legacy.includes('  - '+entry+'\n'),'Legacy deployment must exclude '+entry);
 for(const file of retired)assert.equal(fs.existsSync(path.join(root,file)),false,'Unready route shipped: '+file);
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [1440,1024,768,390,320]){
   const page=await browser.newPage({viewport:{width,height:950}}),errors=[],outbound=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(!r.url().startsWith(base))outbound.push(r.url());});
   for(const file of pages){
    const response=await page.goto(base+'/'+file);
    assert.equal(response.status(),200,file);
    assert.equal(await page.locator('h1').count(),1,file);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${file} at ${width}`);
    assert.equal(await page.locator('a[href*="dashboard.html"],a[href*="signin.html"],a[href*="sandbox.html"],a[href*="preview/"],a[href*="buy.stripe.com/test_"]').count(),0,file);
    assert.equal(await page.locator('input[type=password]').count(),0,file);
    assert.doesNotMatch(await page.locator('main').innerText(),/fictional|test checkout|test subscription|public demonstration/i);
    if(width<=390){await page.locator('.menu-toggle').click();assert.equal(await page.locator('#site-nav').isVisible(),true);await page.keyboard.press('Escape');}
   }
   // Follow actual customer entry points in the artifact, not merely source links.
   await page.goto(base+'/');
   await page.locator('.entry-copy a.button:not(.outline)').click();
   assert.equal(new URL(page.url()).pathname,'/services.html');
   assert.equal(new URL(page.url()).hash,'#inquiry-delivery');
   assert.equal(await page.locator('#delivery-fields').isEnabled(),true);
   assert.equal(await page.locator('#send-inquiry').isEnabled(),true);
   await page.goto(base+'/waitlist.html');
   assert.equal(await page.locator('#waitlist-send').isEnabled(),true);
   assert.equal(await page.locator('a[href="mailto:primebridgesalesgroup@gmail.com"]').count(),1);
   assert.deepEqual(errors,[]);assert.deepEqual(outbound,[],'No external request before explicit CAPTCHA consent');
   if([1440,390].includes(width)){
    fs.mkdirSync(path.resolve(__dirname,'../screenshots'),{recursive:true});
    for(const file of ['index.html','services.html','blockchain.html']){
     await page.goto(base+'/'+file);await page.screenshot({path:path.resolve(__dirname,`../screenshots/public-${file.replace('.html','')}-${width}.png`),fullPage:true});
    }
   }
   await page.close();
  }
  const page=await browser.newPage();
  for(const file of retired){const response=await page.goto(base+'/'+file);assert.equal(response.status(),404,file);assert.equal(await page.locator('h1').innerText(),'This page is not published.');}
  await page.close();
  console.log('Customer release verified at five widths: ready pages, working inquiry entry points, no test/preview/private app routes, explicit 404s, no unsolicited external requests.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
