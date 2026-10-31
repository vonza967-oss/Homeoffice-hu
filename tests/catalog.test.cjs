const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const html = readFileSync(join(__dirname,'..','index.html'),'utf8');

test('HTML is self-contained and displays the Homeoffice brand', () => {
  assert.match(html, /^<!DOCTYPE html>/i);
  assert.match(html, /Homeoffice\.hu/);
  assert.match(html, /<\/html>\s*$/);
});
test('The inline concept catalog has 45 products, 9 categories and 3 collections', () => {
  const rows = html.match(/const rows = \[([\s\S]*?)\n\];/);
  const categories = html.match(/const categories = \[([\s\S]*?)\n\];/);
  const collections = html.match(/const collections = \[([\s\S]*?)\n\];/);
  assert.ok(rows && categories && collections, 'catalog sections');
  assert.equal((rows[1].match(/^ \['/gm) || []).length, 45);
  assert.equal((categories[1].match(/^ \{id:/gm) || []).length, 9);
  assert.equal((collections[1].match(/^ \{id:/gm) || []).length, 3);
});
test('Alibaba leads are distinct from concept entries', () => {
  const block=html.match(/const alibaba = \{([\s\S]*?)\n\};/);
  assert.ok(block);
  assert.equal((block[1].match(/https:\/\/www\.alibaba\.com\/product-detail\//g)||[]).length,9);
  assert.match(html,/source: alibaba\[id\] \? \{type:'alibaba'/);
});
test('Store is clearly demo-only and order/payment disabled', () => {
  assert.match(html,/Bemutatóár/);
  assert.match(html,/Megrendelés nem elérhető/);
  assert.match(html,/<button[^>]*disabled[^>]*>Megrendelés nem elérhető<\/button>/);
});
