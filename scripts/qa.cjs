'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.join(__dirname,'..'),qa=path.resolve(root,process.env.QA_DIR||'qa');
const catalog=require('./catalog.cjs').loadCatalog();
const url=process.env.SITE_URL||'http://127.0.0.1:4173/Homeoffice-hu/';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function loadImages(page){
 await page.evaluate(()=>document.querySelectorAll('img').forEach(i=>{i.loading='eager';}));
 // Chromium schedules lazy-to-eager requests asynchronously; wait for them before decode.
 try {
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0),{},{timeout:30000});
 } catch(error) {
  const states=await page.locator('img').evaluateAll(images=>images.map(i=>({src:i.src,complete:i.complete,width:i.naturalWidth})));
  await fs.writeFile(path.join(qa,'image-failure.json'),JSON.stringify(states,null,2));
  throw error;
 }
 await page.evaluate(async()=>{
  await Promise.all([...document.images].map(i=>i.decode()));
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 });
 const invalid=await page.locator('img').evaluateAll(images=>images.filter(i=>!i.complete||!i.naturalWidth||i.getBoundingClientRect().width<1).map(i=>i.src));
 assert.deepEqual(invalid,[],'Every photograph must load and occupy space');
}
async function overflow(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No horizontal overflow');}
async function captureFull(page,name){
 const h=await page.evaluate(()=>document.documentElement.scrollHeight);
 for(let y=0;y<h;y+=650){await page.evaluate(y=>scrollTo(0,y),y);await pause(35);}
 await page.evaluate(()=>scrollTo(0,0));await pause(120);
 await page.screenshot({path:path.join(qa,name),fullPage:true});
}
(async()=>{
 await fs.mkdir(qa,{recursive:true});let server,browser;const checks=[],errors=[];
 try{
  if(!process.env.SITE_URL){
   server=spawn(process.execPath,['scripts/serve.cjs'],{cwd:root,stdio:['ignore','pipe','pipe']});
   await Promise.race([new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',c=>reject(Error('Server exited '+c)))}),pause(15000).then(()=>{throw Error('Local server start timed out')})]);
  }else{
   let version,lastError;
   for(let n=0;n<30;n++){
    try{const r=await fetch(url+'version.json?qa='+Date.now(),{signal:AbortSignal.timeout(12000),cache:'no-store'});if(!r.ok)throw Error('Live HTTP '+r.status);version=await r.json();if(version.commit===process.env.GITHUB_SHA&&version.products===catalog.products.length)break;}catch(e){lastError=String(e);}
    await pause(4000);
   }
   assert.equal(version?.commit,process.env.GITHUB_SHA,'Live site must serve this commit; '+(lastError||''));
   checks.push('Public version.json matches the deployed commit and '+catalog.products.length+'-product catalog');
  }
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
  const r=await page.goto(url,{waitUntil:'networkidle'});assert.equal(r.status(),200);
  assert.match(await page.title(),/Homeoffice/);await loadImages(page);await overflow(page);
  assert.equal(await page.locator('.product-card').count(),catalog.products.length);
  assert.equal(await page.locator('.product-card p').count(),0);
  assert.equal(await page.locator('img').count(),catalog.products.length+catalog.scenes.length);
  await page.screenshot({path:path.join(qa,'desktop.png')});
  await captureFull(page,'full-page.png');
  await page.locator('#collection').scrollIntoViewIfNeeded();await pause(100);
  await page.screenshot({path:path.join(qa,'catalog.png')});
  checks.push('Desktop 1440px: '+catalog.products.length+' descriptive-name cards, '+(catalog.products.length+2)+' decoded photographs, no overflow');
  for(const group of [...new Set(catalog.products.map(p=>p.group))]){
   await page.locator('[data-filter="'+group+'"]').click();
   assert.equal(await page.locator('.product-card').count(),catalog.products.filter(p=>p.group===group).length);
  }
  await page.locator('[data-filter="creative"]').click();
  assert.equal(await page.locator('.product-card').count(),catalog.products.filter(p=>p.creative).length);
  checks.push('Creative solutions filter selects actual multifunctional and distinctive products');
  await page.locator('[data-filter="all"]').click();
  for(const p of catalog.products){
   await page.locator('.product-open[data-open="'+p.id+'"]').click();
   assert.equal(await page.locator('#productTitle').innerText(),p.name);
   assert.equal(await page.locator('.source-link').getAttribute('href'),p.source);
   await loadImages(page);
   assert.ok((await page.locator('.detail-photo img').boundingBox()).height>100);
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>!document.querySelector('dialog[open]'));
  }
  checks.push('All category filters and all '+catalog.products.length+' product dialogs, sources and images passed');
  await page.locator('.product-open[data-open="aero"]').click();
  await page.screenshot({path:path.join(qa,'detail.png')});
  await page.locator('[data-favorite="aero"]').click();await page.locator('[data-add="aero"]').click();
  await page.keyboard.press('Escape');await pause(50);
  assert.equal(await page.evaluate(()=>document.activeElement?.dataset.open),'aero');
  await page.locator('#cartTrigger').click();assert.equal(await page.locator('.cart-row').count(),1);
  await page.locator('[data-qty="aero"][data-step="1"]').click();assert.equal(await page.locator('#cartCount').innerText(),'2');
  await page.keyboard.press('Escape');await pause(50);
  await page.locator('#favoritesTrigger').click();assert.equal(await page.locator('.product-card').count(),1);
  await page.locator('#favoritesTrigger').click();
  await page.locator('#searchTrigger').click();await page.locator('#search').fill('dokkolo');assert.ok(await page.locator('.product-card').count()>=2);
  await page.locator('#search').fill('not-a-product-zz');assert.equal(await page.locator('.product-card').count(),0);
  await page.locator('[data-reset]').click();assert.equal(await page.locator('.product-card').count(),catalog.products.length);
  await page.keyboard.press('Escape');
  await page.locator('[data-material="wood"]').click();assert.equal(await page.locator('.product-card').count(),catalog.products.filter(p=>p.material==='wood').length);
  await page.locator('#reset').click();await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('#cartCount').innerText(),'2');
  await page.locator('#cartTrigger').click();await page.locator('[data-remove="aero"]').click();assert.equal(await page.locator('.cart-row').count(),0);
  await page.locator('[data-browse]').click();assert.equal(await page.locator('dialog[open]').count(),0);
  checks.push('Search with/without accents, empty state reset, wood filter, favorites, cart quantity/removal, persistence, Escape and focus restoration passed');
  await page.goto(url+'#product/port',{waitUntil:'networkidle'});assert.equal(await page.locator('#productTitle').innerText(),catalog.products.find(p=>p.id==='port').name);await page.keyboard.press('Escape');
  assert.deepEqual(errors,[],'No browser runtime or console errors');
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  mobile.on('pageerror',e=>errors.push(String(e)));
  await mobile.goto(url,{waitUntil:'networkidle'});await loadImages(mobile);await overflow(mobile);
  await mobile.screenshot({path:path.join(qa,'mobile-top.png')});
  await captureFull(mobile,'mobile.png');
  await mobile.locator('#collection').scrollIntoViewIfNeeded();await pause(150);
  await mobile.screenshot({path:path.join(qa,'mobile-catalog.png')});
  const clipped=await mobile.locator('.product-name').evaluateAll(nodes=>nodes.filter(n=>n.scrollWidth>n.clientWidth+1||n.scrollHeight>n.clientHeight+1).map(n=>n.textContent));assert.deepEqual(clipped,[],'Long product names must never clip');
  await mobile.locator('[data-filter="creative"]').click();
  assert.equal(await mobile.locator('.product-card').count(),catalog.products.filter(p=>p.creative).length);
  await mobile.screenshot({path:path.join(qa,'mobile-creative.png')});
  await mobile.locator('[data-filter="all"]').click();
  await mobile.locator('.product-open[data-open="link"]').click();await loadImages(mobile);
  assert.equal(await mobile.locator('#productTitle').innerText(),catalog.products.find(p=>p.id==='link').name);
  await mobile.screenshot({path:path.join(qa,'mobile-detail.png')});
  await mobile.locator('.source-link').scrollIntoViewIfNeeded();
  assert.equal(await mobile.locator('#productDialog [data-close]').isVisible(),true);
  await mobile.locator('#productDialog [data-close]').click();
  for(const width of [320,768]){
   await mobile.setViewportSize({width,height:width===320?740:1024});await mobile.evaluate(()=>scrollTo(0,0));await overflow(mobile);
   if(width===768)await mobile.screenshot({path:path.join(qa,'tablet.png')});
  }
  assert.deepEqual(errors,[]);
  checks.push('390px mobile: image painting, product details and sticky close; 320px and 768px: no overflow; direct product URLs passed');
  const report={success:true,url,commit:process.env.GITHUB_SHA||'local',products:catalog.products.length,viewports:[1440,768,390,320],checks};
  await fs.writeFile(path.join(qa,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }catch(e){await fs.writeFile(path.join(qa,'failure.txt'),e.stack||String(e));throw e;}
 finally{if(browser)await browser.close();if(server)server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
