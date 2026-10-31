'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),out=path.join(root,'_site'),cache=path.join(root,'.image-cache');
const pipelineVersion='studio-v4-uniform-photo';
// Padding follows the existing neutral background; the product is not altered.
async function surfaceColor(buffer){
 const {data,info}=await sharp(buffer).resize(32,32,{fit:'fill'}).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const colors=[];for(const [x,y] of [[0,0],[31,0],[0,31],[31,31]]){const i=(y*info.width+x)*info.channels;colors.push([data[i],data[i+1],data[i+2]]);}
 const rgb=[0,1,2].map(c=>{const a=colors.map(v=>v[c]).sort((a,b)=>a-b);return Math.round((a[1]+a[2])/2)});
 return Math.min(...rgb)>205&&Math.max(...rgb)-Math.min(...rgb)<20?{r:rgb[0],g:rgb[1],b:rgb[2]}:'#ffffff';
}
async function main(){
 const catalog=JSON.parse(await fs.readFile(path.join(root,'catalog.json'),'utf8'));
 const alternatives=JSON.parse(await fs.readFile(path.join(root,'image-sources.json'),'utf8'));
 await fs.mkdir(path.join(out,'assets'),{recursive:true});await fs.mkdir(cache,{recursive:true});await fs.mkdir(path.join(root,'qa'),{recursive:true});
 const report=[],jobs=[...catalog.products,...catalog.scenes],resolved=new Map();let next=0;
 async function work(){while(next<jobs.length){
  const p=jobs[next++],isProduct=catalog.products.includes(p),candidates=[...(alternatives[p.id]||[]),p.image];
  const file=path.join(cache,crypto.createHash('sha256').update(pipelineVersion+JSON.stringify(candidates)).digest('hex')+'.webp');
  let buffer,selected=p.image;
  try{buffer=await fs.readFile(file);selected=await fs.readFile(file+'.source','utf8');}catch{buffer=null;}
  try{
   if(!buffer){
    let last;const attempts=candidates.length>1?candidates:[p.image,p.image,p.image];
    for(const image of attempts){try{
     const r=await fetch(image,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Mozilla/5.0','Accept':'image/avif,image/webp,image/*,*/*;q=0.8','Referer':p.source}});
     if(!r.ok)throw Error('HTTP '+r.status);
     const data=Buffer.from(await r.arrayBuffer()),meta=await sharp(data).metadata();
     if(!meta.width||meta.width<100)throw Error('Invalid or undersized photograph');
     let pipeline;
     if(isProduct){const flat=await sharp(data).rotate().flatten({background:'#ffffff'}).toBuffer();const background=await surfaceColor(flat);pipeline=sharp(flat).trim({threshold:12}).resize(860,860,{fit:'contain',background}).extend({top:70,bottom:70,left:70,right:70,background});}
     else pipeline=sharp(data).rotate().resize({width:1800,withoutEnlargement:true});
     buffer=await pipeline.webp({quality:88}).toBuffer();selected=image;
     await fs.writeFile(file,buffer);await fs.writeFile(file+'.source',selected);break;
    }catch(e){last=e;console.log('SOURCE RETRY',p.id,image,String(e));}}
    if(!buffer)throw last;
   }
   await fs.writeFile(path.join(out,'assets',p.id+'.webp'),buffer);resolved.set(p.id,selected);
   report.push({id:p.id,ok:true,bytes:buffer.length,source:p.source,image:selected});console.log('IMAGE OK',p.id,buffer.length,selected);
  }catch(e){report.push({id:p.id,ok:false,error:String(e),image:p.image});console.error('IMAGE FAILED',p.id,String(e));}
 }}
 await Promise.all(Array.from({length:5},work));await fs.writeFile(path.join(root,'qa','assets.json'),JSON.stringify(report,null,2));
 if(report.some(r=>!r.ok))throw Error('Photograph validation failed; publication blocked');
 const published={products:catalog.products.map(p=>({...p,image:'assets/'+p.id+'.webp',originalImage:resolved.get(p.id)}))};
 await fs.writeFile(path.join(out,'catalog.js'),'window.CATALOG='+JSON.stringify(published).replace(/</g,'\\u003c')+';\n');
 for(const f of ['index.html','styles.css','refinements.css','app.js'])await fs.copyFile(path.join(root,f),path.join(out,f));
 await fs.writeFile(path.join(out,'.nojekyll'),'');
 await fs.writeFile(path.join(out,'version.json'),JSON.stringify({commit:process.env.GITHUB_SHA||'local',products:catalog.products.length,builtAt:new Date().toISOString()}));
 await fs.writeFile(path.join(out,'sources.json'),JSON.stringify({...catalog,products:catalog.products.map(p=>({...p,image:resolved.get(p.id)}))},null,2));
 console.log('Built',catalog.products.length,'products and',catalog.scenes.length,'scenes');
}
main().catch(e=>{console.error(e);process.exitCode=1});
