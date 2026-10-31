'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const {products,scenes}=JSON.parse(fs.readFileSync(path.join(root,'catalog.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('28 distinct real product references retain original identities and neutral finishes',()=>{
 assert.equal(products.length,28);
 for(const key of ['id','source','name'])assert.equal(new Set(products.map(p=>p[key])).size,products.length);
 for(const p of products){
  assert.match(p.id,/^[a-z]+$/);assert.ok(p.name.length<=12);
  assert.ok(p.model&&p.maker&&p.description);assert.equal(p.facts.length,3);
  assert.ok(['black','white','gray','wood'].includes(p.material));
  for(const key of ['source','image'])assert.equal(new URL(p[key]).protocol,'https:');
  assert.equal(p.price,undefined);
 }
 assert.equal(scenes.length,2);
});
test('Eight product families, including separate docks and networking, are available',()=>{
 const expected=['chairs','desks','stands','docks','tech','network','details','light'];
 assert.deepEqual([...new Set(products.map(p=>p.group))].sort(),expected.sort());
 for(const group of expected)assert.ok(html.includes('data-filter="'+group+'"'));
 assert.equal(products.filter(p=>p.group==='chairs').length,3);
 assert.equal(products.filter(p=>p.group==='desks').length,3);
 assert.equal(products.filter(p=>p.group==='docks').length,3);
 assert.equal(products.filter(p=>p.group==='network').length,2);
});
test('Accessible controls and truthful demo disclosure are retained',()=>{
 assert.match(html,/lang="hu"/);
 for(const id of ['grid','search','filters','productDialog','cartDialog','cartCount','favoritesTrigger'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/Nem rendelhető demó/);assert.match(html,/nincs rendelés, fizetés/);
 assert.doesNotMatch(html,/<form[^>]*action=/i);
 assert.match(html,/refinements\.css/);
});
test('Browser code parses; cards contain only photography and short names',()=>{
 const js=fs.readFileSync(path.join(root,'app.js'),'utf8');new vm.Script(js);
 const card=js.slice(js.indexOf('function render()'),js.indexOf('function show('));
 assert.ok(card.includes('product-name'));assert.ok(!card.includes('p.price'));assert.ok(!card.includes('detail-description'));
 assert.ok(js.includes('showModal'));assert.ok(js.includes('Number.isInteger'));assert.ok(js.includes('beforeProductHash'));
});
test('Build publishes every required local stylesheet and script',()=>{
 const build=fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8');
 for(const f of ['styles.css','refinements.css','app.js'])assert.ok(build.includes("'"+f+"'"));
 assert.ok(build.includes('Photograph validation failed; publication blocked'));
});
