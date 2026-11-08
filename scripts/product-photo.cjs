'use strict';
const sharp=require('sharp');

// Normalize a neutral studio backdrop without reconstructing the photographed object.
async function whiteBackdrop(input){
 const {data,info}=await sharp(input).rotate().flatten({background:'#ffffff'}).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const {width,height,channels}=info;
 const sample=(x,y)=>Array.from(data.subarray((y*width+x)*channels,(y*width+x)*channels+3));
 const corners=[sample(0,0),sample(width-1,0),sample(0,height-1),sample(width-1,height-1)];
 const color=[0,1,2].map(c=>corners.map(v=>v[c]).sort((a,b)=>a-b)[1]);
 const encode=()=>sharp(data,{raw:{width,height,channels}}).png().toBuffer();
 if(Math.min(...color)>=254)return encode();
 if(Math.min(...color)<220||Math.max(...color)-Math.min(...color)>12)return encode();
 const count=width*height,mask=new Uint8Array(count),queue=new Int32Array(count);let head=0,tail=0;
 const matches=(p,tolerance)=>{const i=p*channels,r=data[i],g=data[i+1],b=data[i+2];return Math.max(r,g,b)-Math.min(r,g,b)<=12&&Math.max(Math.abs(r-color[0]),Math.abs(g-color[1]),Math.abs(b-color[2]))<=tolerance;};
 const add=p=>{if(!mask[p]&&matches(p,22)){mask[p]=1;queue[tail++]=p;}};
 for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}
 for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
 while(head<tail){const p=queue[head++],x=p%width;if(x)add(p-1);if(x<width-1)add(p+1);if(p>=width)add(p-width);if(p<count-width)add(p+width);}
 const enclosed=Math.min(...color)<253;
 for(let p=0;p<count;p++){
  // Include the same flat backdrop visible through enclosed holes in stands and grids.
  const i=p*channels;
  if(mask[p]){
   const distance=Math.max(...color.map((value,c)=>Math.abs(data[i+c]-value)));
   const amount=1-Math.max(0,distance-2)/20;
   for(let c=0;c<3;c++)data[i+c]=Math.min(255,Math.round(data[i+c]+(255-color[c])*amount));
  }else if(enclosed&&matches(p,2)){data[i]=data[i+1]=data[i+2]=255;}
 }
 return encode();
}
module.exports={whiteBackdrop};
