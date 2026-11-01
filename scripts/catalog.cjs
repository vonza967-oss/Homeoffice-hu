'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
// Retired references stay archived in the source data, but never enter the published catalog.
const retiredProductIds=new Set(['speakershelf']);
function applyCatalogCount(html,count){
 return html.replace(/Mind a \d+ termék/g,'Mind a '+count+' termék').replace(/\b\d+(?= valódi termék)/g,String(count));
}
function loadCatalog(){
 const base=JSON.parse(fs.readFileSync(path.join(root,'catalog.json'),'utf8'));
 const extra=JSON.parse(fs.readFileSync(path.join(root,'catalog-expansion.json'),'utf8'));
 const original=base.products.map(p=>({...p,name:extra.names[p.id]||p.name,creative:extra.creativeExisting.includes(p.id)}));
 const all=[...original,...extra.products].filter(p=>!retiredProductIds.has(p.id));
 for(const key of ['id','name','source'])if(new Set(all.map(p=>p[key])).size!==all.length)throw Error('Duplicate catalog '+key);
 // Balance established essentials with genuinely different workspace ideas.
 const first=['aero','rise','chargingorganizer','deskwhiteboard','link','walkingpad','wallorganizer','flow','sail','walnutdesk','foldinghub','soft','activestool','cablemagnet','cockpitshelf','loop','todokit','whiteboardriser','balanceboard','keys','documentmat','cubedock','beam','laptopsleevemat'];
 const byId=new Map(all.map(p=>[p.id,p]));
 const products=[...first.map(id=>{if(!byId.has(id))throw Error('Missing featured product '+id);return byId.get(id)}),...all.filter(p=>!first.includes(p.id))];
 return {...base,products};
}
module.exports={loadCatalog,applyCatalogCount};
