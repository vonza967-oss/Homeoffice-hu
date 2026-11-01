'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.join(__dirname,'..'),qa=path.resolve(root,process.env.QA_DIR||'qa');
const catalog=require('./catalog.cjs').loadCatalog(),base=process.env.SITE_URL||'http://127.0.0.1:4173/Homeoffice-hu/';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const categoryCount=group=>catalog.products.filter(p=>group==='creative'?p.creative:p.group===group).length;
async function images(page){
 await page.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0),{},{timeout:30000});
 await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}).map(i=>i.decode()));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
}
async function overflow(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Horizontal overflow');}
async function shot(page,name){await images(page);await page.screenshot({path:path.join(qa,name+'.png')});}
(async()=>{
 await fs.mkdir(qa,{recursive:true});let server,browser;const checks=[],errors=[];
 try{
  if(!process.env.SITE_URL){
   server=spawn(process.execPath,['scripts/serve.cjs'],{cwd:root,stdio:['ignore','pipe','pipe']});
   await Promise.race([new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject)}),pause(15000).then(()=>{throw Error('Server timeout')})]);
  }
  browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(String(e)));
  if(process.env.SITE_URL&&process.env.GITHUB_SHA){
   let deployed=false;for(let i=0;i<24;i++){const r=await page.request.get(base+'version.json?t='+Date.now());if(r.ok()&&(await r.json()).commit===process.env.GITHUB_SHA){deployed=true;break}await pause(5000)}
   assert.ok(deployed,'Exact commit published');checks.push('Public version.json matches this commit');
  }
  await page.goto(base,{waitUntil:'networkidle'});
  assert.match(await page.title(),/Homeoffice/);assert.match(await page.locator('h1').innerText(),/A munkatered/);
  assert.equal(await page.locator('.feature-grid .tile').count(),6);assert.equal(await page.locator('#grid').count(),0,'Homepage must not contain the catalog grid');
  await overflow(page);await shot(page,'home-desktop');await page.screenshot({path:path.join(qa,'home-full.png'),fullPage:true});
  await page.locator('.feature-desk').evaluate(el=>el.scrollIntoView({block:'start'}));await shot(page,'desk-campaign');
  await page.locator('.feature-grid').evaluate(el=>el.scrollIntoView({block:'start'}));await shot(page,'feature-panels');
  await page.locator('.feature-setup .pill').first().click();await page.waitForURL('**/shop.html');assert.equal(await page.locator('.product-card').count(),76);await page.goto(base,{waitUntil:'networkidle'});
  await page.locator('#searchTrigger').click();await page.locator('#search').fill('dokkolo');assert.ok(await page.locator('.quick-result').count()>0);
  await page.locator('.quick-result').first().click();assert.ok(await page.locator('#productDialog').isVisible());await page.keyboard.press('Escape');
  checks.push('Home: compact navigation, 2 full-width product campaigns plus the home office setup hero, 6 paired panels, original images, details and quick search');
  await page.goto(base+'shop.html',{waitUntil:'networkidle'});await images(page);assert.equal(await page.locator('.product-card').count(),76);await shot(page,'store-desktop');
  for(const group of ['all','creative',...new Set(catalog.products.map(p=>p.group))]){
   await page.locator('[data-filter="'+group+'"]').click();assert.equal(await page.locator('.product-card').count(),group==='all'?76:categoryCount(group));
  }
  await page.locator('[data-filter="all"]').click();
  for(const p of catalog.products){
   await page.locator('.product-open[data-open="'+p.id+'"]').click();assert.equal(await page.locator('#productTitle').innerText(),p.name);
   assert.equal(await page.locator('.source-link').getAttribute('href'),p.source);await images(page);await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);
  }
  checks.push('Store: all 76 product details, original source links, 10 categories and creative filter pass');
  await page.locator('.product-open[data-open="aero"]').click();await page.locator('[data-favorite="aero"]').click();await page.locator('[data-add="aero"]').click();await page.keyboard.press('Escape');
  await page.locator('#cartTrigger').click();assert.equal(await page.locator('.cart-row').count(),1);await page.locator('[data-qty="aero"][data-step="1"]').click();assert.equal(await page.locator('#cartCount').innerText(),'2');await page.keyboard.press('Escape');
  await page.locator('#favoritesTrigger').click();assert.equal(await page.locator('.product-card').count(),1);await page.locator('#favoritesTrigger').click();
  await page.locator('#searchTrigger').click();await page.locator('#search').fill('dokkolo');assert.ok(await page.locator('.product-card').count()>1);
  await page.locator('#search').fill('zz-no-product');assert.equal(await page.locator('.product-card').count(),0);await page.keyboard.press('Escape');await page.locator('[data-reset]').click();
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('#cartCount').innerText(),'2');await page.goto(base,{waitUntil:'networkidle'});assert.equal(await page.locator('#cartCount').innerText(),'2');
  await page.goto(base+'shop.html?category=chairs',{waitUntil:'networkidle'});assert.equal(await page.locator('.product-card').count(),categoryCount('chairs'));
  await page.goto(base+'shop.html#product/link',{waitUntil:'networkidle'});assert.match(await page.locator('#productTitle').innerText(),/Satechi/);await page.keyboard.press('Escape');
  checks.push('Accent-insensitive search, empty state reset, favorites, bag quantities and cross-page persistence pass');
  for(const width of [1024,768,390,320]){
   const p=await browser.newPage({viewport:{width,height:844},isMobile:width<768,hasTouch:width<768,reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(String(e)));
   await p.goto(base,{waitUntil:'networkidle'});await images(p);await overflow(p);
   if(width===390){await shot(p,'home-mobile');await p.screenshot({path:path.join(qa,'home-mobile-full.png'),fullPage:true});}
   if(width<768){
    await p.locator('#menuTrigger').click();assert.equal(await p.locator('#menuTrigger').getAttribute('aria-expanded'),'true');
    await p.locator('#mainNav a[href="shop.html?category=chairs"]').click();
    await p.waitForURL('**/shop.html?category=chairs');await p.locator('.product-card').first().waitFor();
    assert.equal(await p.locator('.product-card').count(),categoryCount('chairs'));
   }
   await p.goto(base+'shop.html',{waitUntil:'networkidle'});await images(p);await overflow(p);if(width===390)await shot(p,'store-mobile');
   await p.locator('.product-open[data-open="link"]').click();await images(p);await overflow(p);if(width===390)await shot(p,'product-mobile');
   await p.locator('#productDialog [data-close]').click();assert.equal(await p.locator('dialog[open]').count(),0);await p.close();
  }
  assert.deepEqual(errors,[]);checks.push('1024/768/390/320px: home, store, images, mobile menu, product dialogs and no horizontal overflow');
  await fs.writeFile(path.join(qa,'report.json'),JSON.stringify({success:true,url:base,commit:process.env.GITHUB_SHA||'local',products:76,checks,errors},null,2));console.log(JSON.stringify({success:true,checks}));
 }catch(e){await fs.writeFile(path.join(qa,'failure.txt'),String(e.stack||e));throw e}
 finally{if(browser)await browser.close();if(server)server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});
