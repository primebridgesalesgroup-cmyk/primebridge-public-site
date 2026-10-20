const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const target=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
  if(!target.startsWith(root+path.sep))return res.writeHead(403).end();
  fs.readFile(target,(error,data)=>{if(error)return res.writeHead(404).end();res.setHeader('Content-Type',target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':'text/html');res.end(data);});
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true,...(process.env.TEST_BROWSER_PATH?{executablePath:process.env.TEST_BROWSER_PATH}:{})});
  try{
    for(const width of [1440,1024,768,390,320]){
      const page=await browser.newPage({viewport:{width,height:950}}),errors=[],external=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('request',req=>{if(!req.url().startsWith(base))external.push(req.url());});
      await page.goto(base+'/dashboard.html');
      for(const route of ['assets','wallets','ledger','blockchain','exchange','licenses','security','account']){
        await page.locator(`[data-section="${route}"]`).click();
        await page.waitForFunction(route=>document.getElementById(route).hidden===false,route);
        assert.equal(await page.locator('.workspace-section:visible').count(),1);
        assert.equal(await page.locator('[data-section][aria-current=page]').getAttribute('data-section'),route);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${route} at ${width}px`);
      }
      assert.equal(await page.locator('input[type=password]').count(),0);
      assert.match(await page.locator('#account a.button').getAttribute('href'),/one-world-preview-production\.up\.railway\.app\/\?view=home&open=account/);
      await page.goto(base+'/dashboard.html#invalid');
      await page.waitForURL('**/dashboard.html#assets');
      await page.locator('#header-connect').click();
      await page.waitForURL('**#wallets');
      assert.match(await page.locator('#workspace-message').innerText(),/No compatible browser wallet/);
      assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
      if([1440,390].includes(width)){
        fs.mkdirSync(path.join(root,'screenshots'),{recursive:true});
        await page.goto(base+'/dashboard.html');
        await page.screenshot({path:path.join(root,'screenshots',`workspace-dashboard-${width}.png`),fullPage:true});
        await page.goto(base+'/');
        await page.screenshot({path:path.join(root,'screenshots',`workspace-home-${width}.png`),fullPage:true});
      }
      await page.close();
    }
    const page=await browser.newPage();
    await page.addInitScript(()=>{
      const listeners={};window.walletCalls=[];window.walletChain='0x1';window.failBalance=false;
      window.walletAccount='0x1111111111111111111111111111111111111111';
      window.ethereum={on:(name,fn)=>{listeners[name]=fn;},removeListener:name=>{delete listeners[name];},request:async({method,params})=>{
        window.walletCalls.push({method,params});
        if(method==='eth_requestAccounts')return [window.walletAccount];
        if(method==='eth_chainId')return window.walletChain;
        if(method==='eth_getBalance'){if(window.failBalance)throw Error('private provider diagnostic');return '0xde0b6b3a7640000';}
        if(method==='eth_blockNumber')return '0x2a';
        if(method==='eth_call'){
          if(params[0].data.startsWith('0x70a08231'))return '0x2a';
          if(params[0].data==='0x313ce567')return '0x0';
          if(params[0].data==='0x95d89b41')return '0x'+Array.from('+TOKEN').map(c=>c.charCodeAt(0).toString(16)).join('').padEnd(64,'0');
        }
        throw Error('Unexpected wallet method '+method);
      }};
      window.emitWallet=(name,value)=>listeners[name]?.(value);
    });
    await page.goto(base+'/dashboard.html');
    assert.equal(await page.evaluate(()=>window.walletCalls.length),0,'Wallet calls require customer action');
    await page.locator('#header-connect').click();
    await page.waitForFunction(()=>document.getElementById('summary-holdings').textContent==='1');
    assert.match(await page.locator('#asset-rows').innerText(),/Native currency/);
    assert.match(await page.locator('#wallet-balance').innerText(),/^1 ETH$/);
    assert.equal(await page.locator('#chain-block').innerText(),'42');
    await page.locator('[data-section=wallets]').click();
    await page.locator('#token-contract').fill('0x2222222222222222222222222222222222222222');
    await page.locator('#add-token').click();
    await page.waitForFunction(()=>document.getElementById('summary-holdings').textContent==='2');
    await page.locator('[data-section=assets]').click();
    await page.locator('#asset-category').selectOption('token');
    assert.equal(await page.locator('#asset-rows tr').count(),1);
    assert.match(await page.locator('#asset-rows').innerText(),/TOKEN/);
    await page.locator('#asset-search').fill('not present');
    assert.match(await page.locator('#asset-rows').innerText(),/No displayed holdings/);
    await page.locator('#asset-search').fill('');
    const downloadEvent=page.waitForEvent('download');await page.locator('#export-assets').click();
    const download=await downloadEvent;const csv=fs.readFileSync(await download.path(),'utf8');
    assert.match(csv,/'\+TOKEN/,'CSV formula cells must be escaped');
    await page.evaluate(()=>{window.walletChain='0x343b';window.emitWallet('chainChanged','0x343b');});
    await page.waitForFunction(()=>document.getElementById('summary-chain').textContent==='Chain ID 13371'&&document.getElementById('summary-holdings').textContent==='1');
    assert.match(await page.locator('#wallet-balance').innerText(),/1000000000000000000 base units/,'Unknown network denomination must not be guessed');
    await page.locator('#asset-category').selectOption('all');
    assert.doesNotMatch(await page.locator('#asset-rows').innerText(),/\+TOKEN/);
    await page.evaluate(()=>{window.walletAccount='0x3333333333333333333333333333333333333333';window.emitWallet('accountsChanged',[window.walletAccount]);});
    await page.waitForFunction(()=>document.getElementById('summary-wallet').textContent==='0x3333…3333');
    await page.waitForFunction(()=>document.getElementById('summary-holdings').textContent==='1');
    await page.evaluate(()=>{window.failBalance=true;});await page.locator('#header-connect').click();
    await page.waitForFunction(()=>document.getElementById('workspace-message').textContent.includes('could not be read'));
    assert.equal(await page.locator('#summary-holdings').innerText(),'—');
    assert.doesNotMatch(await page.locator('body').innerText(),/private provider diagnostic/);
    await page.locator('[data-section=wallets]').click();await page.locator('#disconnect-wallet').click();
    assert.equal(await page.locator('#summary-wallet').innerText(),'Not connected');
    assert.equal(await page.evaluate(()=>localStorage.length),0);
    assert.equal(await page.evaluate(()=>sessionStorage.length),0);
    const methods=await page.evaluate(()=>window.walletCalls.map(x=>x.method));
    assert.ok(methods.every(method=>['eth_requestAccounts','eth_chainId','eth_getBalance','eth_blockNumber','eth_call'].includes(method)),'No signing or transaction methods');
    await page.close();
    console.log('Workspace verified at five widths: routing, overflow, empty states, consent-only wallet reads, exact amounts, token filtering, CSV protection, network/account changes, stale-data clearing and privacy.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
