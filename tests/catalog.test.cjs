const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const html=readFileSync(join(__dirname,'..','index.html'),'utf8');
const match=html.match(/const products=(\[[^\n]+\]);/);
const products=match?JSON.parse(match[1]):[];

test('Single-file storefront renders Hungarian Homeoffice branding',()=>{
 assert.match(html,/^<!doctype html>/i);
 assert.match(html,/homeoffice/i);
 assert.match(html,/<\/html>\s*$/);
 assert.match(html,/lang="hu"/);
});
test('All catalog entries are sourced real Alibaba products',()=>{
 assert.equal(products.length,11);
 assert.equal(new Set(products.map(p=>p.id)).size,products.length);
 for(const p of products){
  assert.match(p.link,/^https:\/\/www\.alibaba\.com\//);
  assert.match(p.image,/^https:\/\/[^/]*alicdn\.com\//);
  assert.ok(p.name&&p.cat&&p.desc&&p.facts.length>=2);
  assert.match(p.price,/USD/);
  assert.ok(p.moq);
 }
});
test('Images, filtering, product detail and demo cart hooks are present',()=>{
 for(const id of ['grid','filters','search','modal','cartTrigger','cartCount']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/data-open/);
 assert.match(html,/data-filter/);
 assert.match(html,/data-add/);
 assert.match(html,/bindImages/);
});
test('Demo only, no production order or personal-data capture',()=>{
 assert.match(html,/KONCEPCIÓBEMUTATÓ/);
 assert.match(html,/nem rendelhető demó/);
 assert.match(html,/Nincs rendelés, fizetés/);
 assert.doesNotMatch(html,/<form[^>]+action=/i);
 assert.doesNotMatch(html,/stripe\.com|checkout\.stripe/i);
});
