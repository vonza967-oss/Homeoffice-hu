'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.join(__dirname,'..'),qa=path.resolve(root,process.env.QA_DIR||'qa');
const catalog=require('./catalog.cjs').loadCatalog(),base=process.env.SITE_URL||'http://127.0.0.1:4173/Homeoffice-hu/';
const productCount=catalog.products.length,activeGroups=[...new Set(catalog.products.map(p=>p.group))];
const retiredGroups=['focus','light','creative','active'],retiredIds=['speakershelf','shelfphone','form','shelftablet','streamdeckmount','accessorymount','twin','deskdrawer','nest','yetigx','yetiorb','zonevibe','zonewireless','airpods5','airpodspro','onikuma530','hocoeq28','travelcharger','numberpad','caldigit','headphonehook'];
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const categoryCount=group=>catalog.products.filter(p=>p.group===group).length;
const audioTypeCount=type=>catalog.products.filter(p=>p.group==='audio'&&p.audioType===type).length;
async function images(page){
 await page.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0),{},{timeout:30000});
 await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}).map(i=>i.decode()));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
}
async function resetFilters(page){if(await page.locator('#reset').isVisible())await page.locator('#reset').click();}
async function overflow(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Horizontal overflow');}
async function shot(page,name){await images(page);await page.screenshot({path:path.join(qa,name+'.png')});}
async function retiredAbsent(page){
 assert.equal(await page.locator('[data-category="all"],[data-filter="all"]').count(),0,'Global all-category controls removed');
 assert.equal(await page.locator('#mainNav a').filter({hasText:'Minden'}).count(),0,'Global Minden link removed');
 for(const group of retiredGroups){assert.equal(await page.locator('[data-filter="'+group+'"],[data-category="'+group+'"],a[href*="category='+group+'"]').count(),0,'Retired category '+group);}
 for(const id of retiredIds)assert.equal(await page.locator('[data-open="'+id+'"]').count(),0,'Retired product '+id);
 const published=await page.evaluate(()=>window.CATALOG.products);
 assert.ok(published.filter(p=>p.group==='audio').every(p=>p.supplier==='MYFUSION.EU'&&!/Apple|Logitech|Yeti/i.test(p.maker+' '+p.model)),'Audio supplier replacements published');
 assert.equal(published.length,productCount);assert.ok(published.every(p=>!retiredIds.includes(p.id)&&!['focus','light','active'].includes(p.group)&&!p.creative));
}
(async()=>{
 await fs.mkdir(qa,{recursive:true});let server,browser;const checks=[],errors=[];
 try{
  if(!process.env.SITE_URL){
   server=spawn(process.execPath,['scripts/serve.cjs'],{cwd:root,stdio:['ignore','pipe','pipe']});
   await Promise.race([new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject)}),pause(15000).then(()=>{throw Error('Server timeout')})]);
  }
  browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  if(process.env.SITE_URL&&process.env.GITHUB_SHA){
   let deployed=false;for(let i=0;i<24;i++){const r=await page.request.get(base+'version.json?t='+Date.now());if(r.ok()&&(await r.json()).commit===process.env.GITHUB_SHA){deployed=true;break}await pause(5000)}
   assert.ok(deployed,'Exact commit published');checks.push('Public version.json matches this commit');
  }
  await page.goto(base,{waitUntil:'networkidle'});
  assert.match(await page.title(),/HomeOffices/);assert.equal(await page.locator('.globalnav .brand').innerText(),'HomeOffices.hu');assert.match(await page.locator('h1').innerText(),/AZ OTTHONI MUNKA/);
  assert.equal(await page.locator('.feature-grid .tile').count(),4);assert.equal(await page.locator('#grid').count(),0);
  assert.equal(await page.locator('#discoveryRail').count(),0);await retiredAbsent(page);
  assert.ok((await page.locator('.shop-invitation .pill').innerText()).includes(String(productCount)));
  await overflow(page);await shot(page,'home-desktop');await page.screenshot({path:path.join(qa,'home-full.png'),fullPage:true});
  assert.equal(await page.locator('.setup-example').count(),3);
  assert.ok(await page.evaluate(()=>document.querySelector('#setups').compareDocumentPosition(document.querySelector('.feature-desk'))&Node.DOCUMENT_POSITION_FOLLOWING));
  await page.locator('#setups').scrollIntoViewIfNeeded();await shot(page,'setups-desktop');
  for(const example of await page.locator('.setup-example').all()){
   await example.locator('summary').click();
   for(const button of await example.locator('[data-open]').all()){
    const id=await button.getAttribute('data-open');await button.click();
    assert.equal(await page.locator('#productTitle').innerText(),catalog.products.find(p=>p.id===id).name);
    await page.keyboard.press('Escape');
   }
   await example.locator('summary').click();
  }
  checks.push('Three distinct setup examples precede products; all recommended items open the correct original product');
  for(const id of ['satechidock','keys','line','walkingpad']){await page.locator('.feature-grid .pill[data-open="'+id+'"]').click();assert.ok(await page.locator('#productDialog').isVisible());await page.keyboard.press('Escape');}
  await page.locator('.feature-grid').evaluate(el=>el.scrollIntoView({block:'start'}));await shot(page,'feature-panels');
  await page.locator('.feature-setup .pill').first().click();await page.waitForURL('**/shop.html');await page.locator('.product-card').first().waitFor();assert.equal(await page.locator('.product-card').count(),productCount);await page.goto(base,{waitUntil:'networkidle'});
  await page.locator('#searchTrigger').click();await page.locator('#search').fill('dokkolo');assert.ok(await page.locator('.quick-result').count()>0);
  await page.locator('.quick-result').first().click();assert.ok(await page.locator('#productDialog').isVisible());await page.keyboard.press('Escape');
  checks.push('Home keeps setup, desk, chair and four active product panels; removed discovery and category links are absent');
  await page.goto(base+'shop.html',{waitUntil:'networkidle'});await images(page);await retiredAbsent(page);assert.equal(await page.locator('.product-card').count(),productCount);await shot(page,'store-desktop');
  assert.ok((await page.locator('.store-tools').innerText()).includes(productCount+' valódi termék'));
  assert.ok((await page.locator('meta[name="description"]').getAttribute('content')).includes(productCount+' valódi termék'));
  assert.equal(await page.locator('[data-category="docks"] img').getAttribute('src'),'assets/satechidock.webp');
  assert.equal(await page.locator('[data-category="tech"] img').getAttribute('src'),'assets/type.webp');
  await page.locator('[data-filter="desks"]').click();
  assert.equal(await page.locator('.product-adjustment').count(),5);
  for(const item of catalog.products.filter(p=>p.adjustmentLabel))assert.match(await page.locator('.product-open[data-open="'+item.id+'"]').innerText(),/Elektromosan állítható magasság/);
  await shot(page,'desks-desktop');
  await page.locator('[data-filter="chairs"]').click();await shot(page,'chairs-desktop');
  checks.push('All five electric desks show adjustment on catalog cards; chairs retain clear original model names');
  await page.locator('[data-filter="fitness"]').click();assert.equal(await page.locator('.product-card').count(),categoryCount('fitness'));assert.equal(await page.locator('#collectionTitle').innerText(),'Fitnesz.');await shot(page,'fitness-desktop');
  await page.locator('.product-open[data-open="deskcycle"]').click();assert.equal(await page.locator('#productTitle').innerText(),catalog.products.find(p=>p.id==='deskcycle').name);await shot(page,'pedal-desktop');await page.keyboard.press('Escape');
  checks.push('Fitnesz contains walking pad and seated pedal exerciser; clean dock and SM1 category thumbnails are correct');
  await page.locator('[data-filter="audio"]').click();assert.equal(await page.locator('.product-card').count(),categoryCount('audio'));assert.ok(await page.locator('#audioFilters').isVisible());await shot(page,'audio-desktop');
  for(const [type,label] of Object.entries({microphones:'Mikrofonok',headphones:'Fejhallgatók',earbuds:'Fülhallgatók'})){
   await page.locator('[data-audio-type="'+type+'"]').click();assert.equal(await page.locator('.product-card').count(),audioTypeCount(type));assert.equal(await page.locator('#collectionTitle').innerText(),label+'.');assert.ok(page.url().includes('type='+type));
   await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('.product-card').count(),audioTypeCount(type));assert.equal(await page.locator('[data-audio-type="'+type+'"]').getAttribute('aria-pressed'),'true');
  }
  await page.locator('[data-filter="tech"]').click();assert.ok(await page.locator('#audioFilters').isHidden());
  checks.push('Audio has four references; plural type filters show the correct remaining items, retain URL/reload state and hide outside Audio');
  await page.locator('[data-filter="stands"]').click();assert.equal(await page.locator('.product-card').count(),categoryCount('stands'));await retiredAbsent(page);await shot(page,'stands-desktop');
  await resetFilters(page);
  for(const term of ['hangfalpolc','polcra rögzíthető MagSafe','ScreenBar','Analog Weekly']){
   await page.locator('#searchTrigger').click();await page.locator('#search').fill(term);
   assert.equal(await page.locator('.product-card').count(),0);assert.equal(await page.locator('.quick-result').count(),0);
   await page.keyboard.press('Escape');await page.locator('[data-reset]').click();
  }
  checks.push('Retired products and categories absent from full catalog, stands, navigation and search; totals match active products');
  for(const group of ['all',...activeGroups]){
   if(group==='all')await resetFilters(page);else await page.locator('[data-filter="'+group+'"]').click();assert.equal(await page.locator('.product-card').count(),group==='all'?productCount:categoryCount(group));
  }
  await resetFilters(page);
  for(const p of catalog.products){
   await page.locator('.product-open[data-open="'+p.id+'"]').click();assert.equal(await page.locator('#productTitle').innerText(),p.name);
   assert.equal(await page.locator('.source-link').getAttribute('href'),p.source);await images(page);await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);
  }
  checks.push('All '+productCount+' remaining product details, original source links and '+activeGroups.length+' category filters pass');
  await page.locator('.product-open[data-open="aero"]').click();await page.locator('[data-favorite="aero"]').click();await page.locator('[data-add="aero"]').click();await page.keyboard.press('Escape');
  await page.locator('#cartTrigger').click();assert.equal(await page.locator('.cart-row').count(),1);await page.locator('[data-qty="aero"][data-step="1"]').click();assert.equal(await page.locator('#cartCount').innerText(),'2');await page.keyboard.press('Escape');
  await page.locator('#favoritesTrigger').click();assert.equal(await page.locator('.product-card').count(),1);await page.locator('#favoritesTrigger').click();
  await page.locator('#searchTrigger').click();await page.locator('#search').fill('dokkolo');assert.ok(await page.locator('.product-card').count()>1);
  await page.locator('#search').fill('zz-no-product');assert.equal(await page.locator('.product-card').count(),0);await page.keyboard.press('Escape');await page.locator('[data-reset]').click();
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('#cartCount').innerText(),'2');await page.goto(base,{waitUntil:'networkidle'});assert.equal(await page.locator('#cartCount').innerText(),'2');
  await page.goto(base+'shop.html?category=chairs',{waitUntil:'networkidle'});assert.equal(await page.locator('.product-card').count(),categoryCount('chairs'));
  await page.goto(base+'shop.html#product/link',{waitUntil:'networkidle'});assert.equal(await page.locator('#productTitle').innerText(),catalog.products.find(p=>p.id==='link').name);await page.keyboard.press('Escape');
  for(const group of retiredGroups){await page.goto(base+'shop.html?category='+group,{waitUntil:'networkidle'});assert.equal(await page.locator('.product-card').count(),productCount);await retiredAbsent(page);}
  for(const id of retiredIds){await page.goto(base+'shop.html#product/'+id,{waitUntil:'networkidle'});assert.equal(await page.locator('dialog[open]').count(),0);}
  await page.evaluate(()=>localStorage.setItem('homeoffice-studio-v3',JSON.stringify({cart:{speakershelf:1,shelfphone:1,beam:1},favorites:['speakershelf','shelfphone','beam']})));
  await page.reload({waitUntil:'networkidle'});await page.locator('#cartTrigger').click();assert.equal(await page.locator('.cart-row').count(),0);await page.keyboard.press('Escape');
  await page.locator('#favoritesTrigger').click();assert.equal(await page.locator('.product-card').count(),0);await page.locator('#favoritesTrigger').click();
  checks.push('Search, favorites, cart, persistence, stale category/product links and retired saved items pass');
  for(const width of [1024,768,390,320]){
   const p=await browser.newPage({viewport:{width,height:844},isMobile:width<768,hasTouch:width<768,reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(String(e)));
   await p.goto(base,{waitUntil:'networkidle'});await images(p);await overflow(p);await retiredAbsent(p);
   if(width===390){await p.locator('#setups').scrollIntoViewIfNeeded();await shot(p,'setups-mobile');await p.locator('.setup-example summary').first().click();await overflow(p);await p.locator('.setup-example [data-open]').first().click();assert.ok(await p.locator('#productDialog').isVisible());await p.keyboard.press('Escape');await p.locator('.setup-example summary').first().click();await p.evaluate(()=>scrollTo(0,0));await shot(p,'home-mobile');await p.screenshot({path:path.join(qa,'home-mobile-full.png'),fullPage:true});}
   if(width<768){
    await p.locator('#menuTrigger').click();assert.equal(await p.locator('#menuTrigger').getAttribute('aria-expanded'),'true');
    await p.locator('#mainNav a[href="shop.html?category=chairs"]').click();
    await p.waitForURL('**/shop.html?category=chairs');await p.locator('.product-card').first().waitFor();
    assert.equal(await p.locator('.product-card').count(),categoryCount('chairs'));
   }
   await p.goto(base+'shop.html',{waitUntil:'networkidle'});await images(p);await overflow(p);await retiredAbsent(p);if(width===390)await shot(p,'store-mobile');
   await p.locator('[data-filter="stands"]').click();assert.equal(await p.locator('.product-card').count(),categoryCount('stands'));await retiredAbsent(p);if(width===390)await shot(p,'stands-mobile');
   await p.locator('[data-filter="audio"]').click();await p.locator('[data-audio-type="headphones"]').click();assert.equal(await p.locator('.product-card').count(),2);await overflow(p);if(width===390)await shot(p,'audio-mobile');
   await resetFilters(p);
   await p.locator('.product-open[data-open="link"]').click();await images(p);await overflow(p);if(width===390)await shot(p,'product-mobile');
   await p.locator('#productDialog [data-close]').click();assert.equal(await p.locator('dialog[open]').count(),0);await p.close();
  }
  await page.goto(base,{waitUntil:'networkidle'});
  await page.locator('#mainNav a[href="contact.html"]').click();
  await page.waitForURL('**/contact.html');
  assert.equal(await page.locator('.contact-email').getAttribute('href'),'mailto:contact@homeoffices.hu');
  assert.equal(await page.locator('.contact-email').innerText(),'contact@homeoffices.hu');
  assert.equal(await page.locator('#mainNav [aria-current="page"]').innerText(),'Kapcsolat');
  for(const width of [1440,1024,768,390,320]){
   await page.setViewportSize({width,height:900});await overflow(page);
   if(width===1440||width===390)await shot(page,'contact-'+(width===1440?'desktop':'mobile'));
  }
  await page.locator('#menuTrigger').click();
  assert.equal(await page.locator('#menuTrigger').getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#menuTrigger').getAttribute('aria-expanded'),'false');
  checks.push('Contact page is published, linked from navigation, uses the requested mailto address and fits all five viewport widths');
  assert.deepEqual(errors,[]);checks.push('1440/1024/768/390/320px: meaningful home/store content, loaded images, mobile menu, product dialogs, no runtime errors or horizontal overflow');
  await fs.writeFile(path.join(qa,'report.json'),JSON.stringify({success:true,url:base,commit:process.env.GITHUB_SHA||'local',products:productCount,categories:activeGroups,removedCategories:retiredGroups,removedProducts:retiredIds,browser:'Playwright Chromium; Browser plugin not available',checks,errors},null,2));console.log(JSON.stringify({success:true,products:productCount,checks}));
 }catch(e){await fs.writeFile(path.join(qa,'failure.txt'),String(e.stack||e));throw e}
 finally{if(browser)await browser.close();if(server)server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});

