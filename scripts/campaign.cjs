'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.join(__dirname,'..');
async function buildCampaign(){
 const catalog=require('./catalog.cjs').loadCatalog(),byId=new Map(catalog.products.map(p=>[p.id,p]));
 const out=path.join(root,'_site/assets'),cache=path.join(root,'.image-cache');
 await fs.mkdir(out,{recursive:true});await fs.mkdir(cache,{recursive:true});await fs.mkdir(path.join(root,'qa'),{recursive:true});
 const jobs=[
  {id:'flow',name:'campaign-mouse',width:1100,height:1100,transparent:true,urls:['https://resource.logitech.com/content/dam/logitech/en/products/mice/mx-master-3s/2025-update/mx-master-3s-bluetooth-edition-top-view-graphite-new-1.png']},
  {id:'rise',name:'campaign-desk',width:1500,height:1000,background:'#efefef'},
  {id:'aero',name:'campaign-chair',width:1100,height:1200,background:'#fafafa',urls:['https://www.hermanmiller.com/content/dam/hmicom/page_assets/products/aeron_chair/2026_06/ig_prd_ovw_aeron_chair_06.jpg']},
  {id:'link',name:'campaign-dock',width:1400,height:650,background:'#ffffff'},
  {id:'keys',name:'campaign-keyboard',width:1400,height:700,background:'#f5f5f7'}
 ];
 const report=[];
 for(const job of jobs.filter(job=>byId.has(job.id))){
  const p=byId.get(job.id),urls=[...(job.urls||[]),p.image];
  const key=crypto.createHash('sha256').update(JSON.stringify(job)+p.image).digest('hex');
  const file=path.join(cache,'campaign-v1-'+key+'.webp');let buffer,source;
  try{buffer=await fs.readFile(file);source=await fs.readFile(file+'.source','utf8')}catch{}
  if(!buffer){let last;
   for(const url of urls){try{
    const r=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Mozilla/5.0','Referer':p.source}});if(!r.ok)throw Error('HTTP '+r.status);
    const raw=Buffer.from(await r.arrayBuffer());const meta=await sharp(raw).metadata();if(!meta.width)throw Error('Invalid image');
    if(job.transparent){const stats=await sharp(raw).stats();if(!meta.hasAlpha||stats.channels[stats.channels.length-1].min>5)throw Error('Original transparent product photo required');}
    let pipeline=sharp(raw).rotate();
    if(!job.transparent)pipeline=pipeline.flatten({background:job.background});
    buffer=await pipeline.trim({threshold:8}).resize(job.width,job.height,{fit:'contain',background:job.transparent?{r:0,g:0,b:0,alpha:0}:job.background}).webp({quality:92}).toBuffer();source=url;
    await fs.writeFile(file,buffer);await fs.writeFile(file+'.source',source);break;
   }catch(e){last=e;console.log('Campaign retry',job.id,String(e));}}
   if(!buffer)throw last;
  }
  await fs.writeFile(path.join(out,job.name+'.webp'),buffer);report.push({id:job.id,asset:job.name,source,productPage:p.source,bytes:buffer.length,transparent:!!job.transparent});
 }
 await fs.writeFile(path.join(root,'qa/campaign-assets.json'),JSON.stringify(report,null,2));console.log('Campaign photographs ready:',report.length);
}
module.exports={buildCampaign};if(require.main===module)buildCampaign().catch(e=>{console.error(e);process.exitCode=1});
