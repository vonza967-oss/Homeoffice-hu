'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
// Keep original references archived; exclude retired products from every published surface.
const retiredProductIds=new Set(['speakershelf','shelfphone']);
const retiredGroups=new Set(['focus','light']);
function loadCatalog(){
 const base=JSON.parse(fs.readFileSync(path.join(root,'catalog.json'),'utf8'));
 const extra=JSON.parse(fs.readFileSync(path.join(root,'catalog-expansion.json'),'utf8'));
 const original=base.products.map(p=>({...p,name:extra.names[p.id]||p.name,creative:extra.creativeExisting.includes(p.id)}));
 const all=[...original,...extra.products].filter(p=>!retiredProductIds.has(p.id)&&!retiredGroups.has(p.group)&&!p.creative);
 for(const key of ['id','name','source'])if(new Set(all.map(p=>p[key])).size!==all.length)throw Error('Duplicate catalog '+key);
 const first=['aero','rise','link','flow','sail','walnutdesk','soft','keys'];
 const byId=new Map(all.map(p=>[p.id,p]));
 const products=[...first.filter(id=>byId.has(id)).map(id=>byId.get(id)),...all.filter(p=>!first.includes(p.id))];
 return {...base,products};
}
// Compile the existing HTML templates against the active catalog. This removes navigation,
// filters and product campaigns together instead of merely hiding retired products with CSS.
function applyCatalogCount(html,count){
 const {products}=loadCatalog(),ids=new Set(products.map(p=>p.id)),groups=new Set(products.map(p=>p.group));
 let result=html
  .replace(/<section class="feature tile [^"]*"[\s\S]*?<\/section>/g,section=>[...section.matchAll(/data-open="([^"]+)"/g)].every(match=>ids.has(match[1]))?section:'')
  .replace(/<section class="discovery"[\s\S]*?<\/section>/g,'')
  .replace(/<a\b[^>]*\bhref="shop\.html\?category=([^"&]+)"[^>]*>[\s\S]*?<\/a>/g,(anchor,group)=>groups.has(group)?anchor:'')
  .replace(/<button\b[^>]*\bdata-filter="([^"]+)"[^>]*>[\s\S]*?<\/button>/g,(button,group)=>group==='all'||groups.has(group)?button:'')
  .replace(/Mind a \d+ termék/g,'Mind a '+count+' termék')
  .replace(/\b\d+(?= valódi termék)/g,String(count))
  .replace(/Tíz kategória\./g,groups.size+' kategória.');
 // Category thumbnails must not refer to images of retired products.
 result=result.replace(/<a\b[^>]*\bclass="category-item"[^>]*>[\s\S]*?<\/a>/g,anchor=>{
  const group=anchor.match(/data-category="([^"]+)"/)?.[1];
  const image=anchor.match(/src="assets\/([^"]+)\.webp"/)?.[1];
  if(!image||ids.has(image))return anchor;
  const replacement=products.find(p=>group==='all'||p.group===group);
  if(!replacement)throw Error('No active category image for '+group);
  return anchor.replace(/src="assets\/[^\"]+\.webp"/,'src="assets/'+replacement.id+'.webp"');
 });
 for(const match of result.matchAll(/data-open="([^"]+)"/g))if(!ids.has(match[1]))throw Error('Retired product remains in HTML: '+match[1]);
 return result;
}
module.exports={loadCatalog,applyCatalogCount};
