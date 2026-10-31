'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),{products,scenes}=require('../scripts/catalog.cjs').loadCatalog();
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('76 distinct real references have descriptive names and original identities',()=>{
 assert.equal(products.length,76);
 for(const key of ['id','source','name'])assert.equal(new Set(products.map(p=>p[key])).size,products.length);
 for(const p of products){
  assert.match(p.id,/^[a-z]+$/);assert.ok(p.name.length>=15&&p.name.length<=80);assert.ok(p.name.includes(' '));
  assert.ok(p.model&&p.maker&&p.description);assert.equal(p.facts.length,3);
  assert.ok(['black','white','gray','wood'].includes(p.material));
  for(const key of ['source','image'])assert.equal(new URL(p[key]).protocol,'https:');
  assert.equal(p.price,undefined);
 }
 assert.equal(scenes.length,2);
 assert.equal(products.find(p=>p.id==='aero').name,'Herman Miller Aeron irodaszék');
 assert.equal(products.find(p=>p.id==='walkingpad').maker,'WalkingPad');
});
test('Ten categories and a cross-category creative filter are represented',()=>{
 const expected=['chairs','desks','stands','docks','tech','network','details','light','focus','active'];
 assert.deepEqual([...new Set(products.map(p=>p.group))].sort(),expected.sort());
 for(const group of [...expected,'creative'])assert.ok(html.includes('data-filter="'+group+'"'));
 assert.ok(products.filter(p=>p.creative).length>=20);
 for(const id of ['chargingorganizer','deskwhiteboard','laptopsleevemat','walkingpad'])assert.ok(products.find(p=>p.id===id)?.creative);
});
test('Accessible controls and demo-only disclosure remain truthful',()=>{
 assert.match(html,/lang="hu"/);
 for(const id of ['grid','search','filters','productDialog','cartDialog','cartCount','favoritesTrigger'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/Nem rendelhető demó/);assert.match(html,/nincs rendelés, fizetés/);
 assert.doesNotMatch(html,/<form[^>]*action=/i);assert.doesNotMatch(html,/saját bemutatónevekkel/);
 assert.match(html,/refinements\.css/);
});
test('Cards stay image-and-name only; focus, routing and storage validation survive',()=>{
 const js=fs.readFileSync(path.join(root,'app.js'),'utf8');new vm.Script(js);
 const card=js.slice(js.indexOf('function render()'),js.indexOf('function show('));
 assert.ok(card.includes('product-name'));assert.ok(!card.includes('p.price'));assert.ok(!card.includes('detail-description'));
 assert.ok(js.includes('showModal'));assert.ok(js.includes('Number.isInteger'));assert.ok(js.includes('beforeProductHash'));
 assert.doesNotMatch(js,/saját bemutatónév/);
});
test('Build and browser QA use the same expanded catalog',()=>{
 for(const f of ['build.cjs','qa.cjs'])assert.ok(fs.readFileSync(path.join(root,'scripts',f),'utf8').includes("require('./catalog.cjs').loadCatalog()"));
 const build=fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8');
 for(const f of ['styles.css','refinements.css','app.js'])assert.ok(build.includes("'"+f+"'"));
 assert.ok(build.includes('Photograph validation failed; publication blocked'));
});
