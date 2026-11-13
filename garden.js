/* Sibol dot-garden — pendereckisgarden.pl-inspired chapter shell.
   Classic script, zero deps, file:// safe. */
(function(){
"use strict";
const CHAPTERS=[
 {id:"outdoor",n:"01",t:"Outdoor / Entrance",d:"Brand wall, hours, bloom arch. The cafe exhales.",c:"#9ccb8f"},
 {id:"interior",n:"02",t:"Main Interior",d:"Hotspot hub: counter, blooms, freedom wall.",c:"#e8d9a0"},
 {id:"counter",n:"03",t:"Counter / Cashier",d:"Chibi Loreen greets. Order, claim, track.",c:"#f7f2e9",link:"prototype-cafe.html"},
 {id:"blooms",n:"04",t:"Bites & Blooms",d:"Toca-Boca customize: dishes, drinks, bouquets.",c:"#e8a7c3",link:"prototype-cafe.html"},
 {id:"wall",n:"05",t:"Freedom Wall",d:"Anonymous notes. Let coffee connect us.",c:"#a0c8e8"}
];
const visited=new Set(JSON.parse(sessionStorage.getItem("sibolGarden")||"[]"));
function save(){try{sessionStorage.setItem("sibolGarden",JSON.stringify([...visited]))}catch(e){}}
const cv=document.getElementById("dots"),ctx=cv.getContext("2d");
let W,H,parts=[],mood="#9ccb8f",burst=[];
function size(){W=cv.width=cv.clientWidth*2;H=cv.height=cv.clientHeight*2}
addEventListener("resize",size);size();
function seed(n){parts=[];for(let i=0;i<n;i++)parts.push({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*3.2,vx:(Math.random()-.5)*.5,vy:-.1-Math.random()*.5,a:.25+Math.random()*.6,hue:Math.random()})}
seed(900);
function bloom(x,y,c,n){for(let i=0;i<(n||40);i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*3;burst.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,l:1,c})}}
function dotColor(p){
 if(p.hue<.12)return "232,167,195"; // petal pink
 if(p.hue<.3)return "156,203,143";  // leaf
 if(p.hue<.36)return "232,217,160"; // warm light
 return "247,242,233";               // cream
}
let T=0;
// Photo-dots: sample /assets photos into pointillism. Needs http.server
// (browsers block pixel reads on file://) — falls back to drift.
const PHOTOS={outdoor:"assets/logo-sibol.jpg",interior:"assets/food-wings.jpg",
 counter:"assets/counterview.png",blooms:"assets/bouquet-1.jpg",wall:"assets/freedomwall-view.png"};
const photo={active:false,dots:[],label:""};
function srcFor(id){if(window.SIBOL_DOTS&&window.SIBOL_DOTS[id])return window.SIBOL_DOTS[id];return PHOTOS[id]}
function loadPhoto(id){
 const f=srcFor(id);if(!f){photo.active=false;return}
 const img=new Image();
 img.onload=()=>{
  try{
   const off=document.createElement("canvas");
   const cols=150, sW=img.naturalWidth, sH=img.naturalHeight;
   off.width=cols;off.height=Math.max(1,Math.round(cols*sH/sW));
   const octx=off.getContext("2d",{willReadFrequently:true});
   octx.drawImage(img,0,0,off.width,off.height);
   const d=octx.getImageData(0,0,off.width,off.height).data;
   const dots=[];
   const dx=W/off.width, dy=(H*.9)/off.height;
   for(let y=0;y<off.height;y+=2)for(let x=0;x<off.width;x+=2){
    const i=(y*off.width+x)*4;
    if(d[i+3]<128)continue;
    const lum=(d[i]*.3+d[i+1]*.6+d[i+2]*.1)/255;
    if(lum<.04)continue;
    dots.push({x:x*dx+dx/2,y:H*.05+y*dy,r:.8+lum*3.2,
     c:`rgb(${d[i]},${d[i+1]},${d[i+2]})`,tw:Math.random()*7});
   }
   photo.dots=dots;photo.active=true;photo.label=f;
  }catch(e){photo.active=false;photo.label="pixel-read blocked (serve over http for photo-dots)"}
 };
 img.onerror=()=>{photo.active=false};
 img.src=f;
}
(function loop(){
 T+=.016;ctx.fillStyle="#10231c";ctx.fillRect(0,0,W,H);
 if(photo.active){
  // photo-dots field with shimmer
  photo.dots.forEach(p=>{
   const a=.55+.4*Math.sin(T*2+p.tw);
   ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);
   ctx.fillStyle=p.c;ctx.globalAlpha=Math.max(.15,a);ctx.fill();
  });
  ctx.globalAlpha=1;
 }else{
 // gentle sway field
 parts.forEach(p=>{
  p.x+=p.vx+Math.sin(T+p.y*.01)*.3;p.y+=p.vy;
  if(p.y<-10){p.y=H+10;p.x=Math.random()*W}
  if(p.x<-10)p.x=W+10;if(p.x>W+10)p.x=-10;
  ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);
  ctx.fillStyle=`rgba(${dotColor(p)},${p.a*.8})`;ctx.fill();
 });}
 // mood glow
 const g=ctx.createRadialGradient(W/2,H*.42,10,W/2,H*.42,W*.45);
 g.addColorStop(0,mood+"33");g.addColorStop(1,"transparent");
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 // bursts
 burst=burst.filter(b=>b.l>0);
 burst.forEach(b=>{b.x+=b.vx;b.y+=b.vy;b.vy+=.05;b.l-=.02;
  ctx.beginPath();ctx.arc(b.x,b.y,3*b.l+1,0,7);ctx.fillStyle=b.c;ctx.globalAlpha=Math.max(0,b.l);ctx.fill();ctx.globalAlpha=1});
 requestAnimationFrame(loop);
})();
// chapters
const list=document.getElementById("chapters");
function pct(){return Math.round(visited.size/CHAPTERS.length*100)}
function draw(){
 list.innerHTML="";
 CHAPTERS.forEach(ch=>{
  const seen=visited.has(ch.id);
  const el=document.createElement("button");
  el.className="ch"+(seen?" seen":"");
  el.innerHTML=`<span class="cn">${ch.n}</span><span class="ct">${ch.t}</span>
   <span class="cd">${seen?"✔ explored":ch.d}</span>
   <span class="cp">${seen?"100%":"0%"}</span>`;
  el.onclick=()=>openChapter(ch,el);
  list.appendChild(el);
 });
 document.getElementById("totalPct").textContent=pct()+"%";
 document.getElementById("totalBar").style.width=pct()+"%";
}
function openChapter(ch,el){
 visited.add(ch.id);save();draw();
 mood=ch.c;loadPhoto(ch.id);
 const r=el.getBoundingClientRect();
 bloom(r.left+r.width/2+scrollX,0,ch.c,60);
 const p=document.getElementById("panel");
 p.classList.add("open");
 p.innerHTML=`<div class="pn">${ch.n}</div><h2>${ch.t}</h2><p>${ch.d}</p>
  ${ch.link
   ?`<a class="btn" href="${ch.link}">Open live ordering demo →</a>`
   :`<span class="wip">🌱 Planting this scene — dots for now, a deliberate WIP. Views arrive as assets do.</span>`}
  <div class="note" id="dotSrc" style="margin-top:8px">composing dots…</div>
  <button class="ghost" id="pclose">Back to garden</button>`;
 setTimeout(()=>{const s=document.getElementById("dotSrc");
  if(s)s.textContent=photo.active?("dots formed from "+photo.label):("drift field — "+(photo.label||"photo pending"));},900);
 document.getElementById("pclose").onclick=()=>p.classList.remove("open");
}
draw();
document.getElementById("enterBtn").onclick=e=>{
 bloom(innerWidth/2,innerHeight*.4,"#e8a7c3",80);
 document.getElementById("chapters").scrollIntoView({behavior:"smooth"});
};
})();
