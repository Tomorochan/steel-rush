import {M4} from './renderer.js';
import {TANKS} from './game.js';
import {LIVERIES} from './livery.js';
import {factionSvg} from './powerups.js';

// STEEL RUSH 1.1: real 3D inspection bay, sharing all nine race GLBs.
export function installShowroom(game){
 const oldDraw=game.draw.bind(game);
 const css=document.createElement('style');
 css.textContent='.srh{position:absolute;inset:0;z-index:8;pointer-events:none;font-family:Segoe UI,Trebuchet MS,sans-serif;color:#e9e3d3}.srh.hide{display:none}.srh header,.srh aside,.srh footer{pointer-events:auto;background:linear-gradient(135deg,#0b1d22f5,#0b1619f5);border:1px solid #71918a9a;backdrop-filter:blur(12px)}.srh header{position:absolute;top:0;left:0;right:0;height:88px;display:flex;justify-content:space-between;align-items:center;padding:12px 28px;border-top:0}.srh h2{font:36px Impact,sans-serif;letter-spacing:.09em;margin:3px 0}.srh h2 em{font-style:normal;color:#f3ad74}.srh small{color:#f6bc7f;letter-spacing:.15em;font-size:10px}.srh button{background:#22363a;border:1px solid #789791;color:#fff0d8;padding:11px;cursor:pointer;font-weight:bold}.srh button:hover,.srh button.active{border-color:#ffc079;background:#395356}.srh .primary{background:#f1b97c;color:#152528}.srh aside{position:absolute;top:101px;bottom:93px;overflow-y:auto}.srh .list{left:13px;width:252px;padding:13px}.srh .spec{right:13px;width:235px;padding:19px}.srh .entry{display:flex;align-items:center;width:100%;padding:5px 8px;margin:5px 0;gap:8px;text-align:left}.srh .entry img{width:74px;height:49px;object-fit:contain}.srh .entry strong{display:block;font-size:12px}.srh .entry small{display:block;font-size:8px;letter-spacing:.03em}.srh .view{position:absolute;top:94px;bottom:89px;left:271px;right:258px;pointer-events:auto;cursor:grab;touch-action:none;outline:none}.srh .view:active{cursor:grabbing}.srh .view .hint{position:absolute;left:14px;bottom:13px;color:#d9ddd1;font-size:10px;text-shadow:0 1px 9px #000;pointer-events:none}.srh .spec h3{font:32px Impact,sans-serif;margin:12px 0 5px}.srh .stat{border-top:1px solid #546e68;padding:11px 0;font-size:11px}.srh .stat b{float:right;color:#ffdcaa}.srh .meter{height:5px;background:#30464d;margin-top:9px}.srh .meter i{display:block;height:100%;background:#eca86f}.srh .logo{margin:11px 0}.srh footer{position:absolute;bottom:0;left:0;right:0;min-height:81px;display:flex;align-items:center;justify-content:center;gap:10px;padding:9px}.srh footer button{font-size:11px}.srh .counter{font:25px Impact,sans-serif;color:#ffcc95}.srh .open{margin-left:5px;border-color:#d6a676;color:#f3c395}.srh .open:hover{background:#365058}@media(max-width:900px){.srh header{height:73px;padding:8px}.srh h2{font-size:23px}.srh aside{top:81px;bottom:108px}.srh .list{left:5px;width:165px;padding:5px}.srh .spec{right:5px;width:165px;padding:8px}.srh .entry img{width:46px;height:38px}.srh .entry{gap:4px}.srh .entry strong{font-size:10px}.srh .spec h3{font-size:24px}.srh .view{top:77px;bottom:104px;left:171px;right:170px}.srh footer{min-height:98px;flex-wrap:wrap;gap:4px}.srh footer button{font-size:9px;padding:7px}}@media(max-width:550px){.srh .list{top:auto;bottom:91px;left:3px;right:3px;width:auto;height:74px;white-space:nowrap;overflow-x:auto;overflow-y:hidden}.srh .entry{display:inline-flex;width:92px;height:57px;vertical-align:top;flex-direction:column;gap:0}.srh .entry img{width:68px;height:33px}.srh .entry small{display:none}.srh .spec{top:76px;bottom:171px;width:115px}.srh .spec h3{font-size:17px}.srh .stat{padding:5px 0;font-size:8px}.srh .logo svg{width:28px;height:28px}.srh .view{top:76px;left:0;right:121px;bottom:170px}.srh .view .hint{font-size:8px}.srh footer{min-height:91px}}';
 document.head.append(css);
 const open=document.createElement('button');open.id='sr-showroom-open';open.className='outline srh-open';open.textContent='◈ ОСМОТР ТАНКОВ В 3D';open.type='button';
 const cta=document.querySelector('.cta-row');cta.insertBefore(open,cta.children[1]||null);
 const overlay=document.createElement('section');overlay.className='srh hide';overlay.id='sr-showroom';
 overlay.innerHTML='<header><div><small>STEEL RUSH / ВЫСТАВОЧНЫЙ АНГАР</small><h2>СТЕНД <em>БРОНЕТЕХНИКИ</em></h2></div><div><span id="srh-counter" class="counter"></span> <button id="srh-back">← В МЕНЮ</button></div></header><aside class="list"><small>9 ЭКСПОНАТОВ · 3 ФРАКЦИИ</small><div id="srh-vehicles"></div></aside><div class="view" id="srh-view" tabindex="0"><div class="hint">ПЕРЕТАСКИВАТЬ — ВРАЩАТЬ · КОЛЁСИКО — МАСШТАБ</div></div><aside class="spec"><small id="srh-faction">ТЕХНИЧЕСКИЙ ПАСПОРТ</small><h3 id="srh-name"></h3><div id="srh-kind"></div><div id="srh-insignia" class="logo"></div><div id="srh-stats"></div><small id="srh-color"></small></aside><footer><button id="srh-prev">◀</button><button id="srh-auto">⟳ АВТОВРАЩЕНИЕ: ВКЛ</button><button id="srh-turret">ПОВОРОТ БАШНИ</button><button id="srh-reset">СБРОС КАМЕРЫ</button><button id="srh-next">▶</button><button class="primary" id="srh-race">ВЫБРАТЬ И В ГОНКУ →</button></footer>';
 document.getElementById('game-ui').append(overlay);
 const $=id=>document.getElementById(id);
 const list=$('srh-vehicles');
 let angle=2.35,tilt=.16,zoom=16,auto=true,turret=false,dragging=false,px=0,py=0;
 for(const t of TANKS){const b=document.createElement('button');b.type='button';b.className='entry';b.dataset.id=t.id;b.innerHTML='<img alt="" src="./assets/previews/'+t.id+'.png"><span><strong>'+t.name+'</strong><small>'+t.faction+' · '+t.class+'</small></span>';b.onclick=()=>choose(t.id);list.appendChild(b);}
 function refresh(){
  const t=game.selected,idx=TANKS.findIndex(x=>x.id===t.id);
  $('srh-counter').textContent=String(idx+1).padStart(2,'0')+' / 09';
  $('srh-faction').textContent=t.faction;
  $('srh-name').textContent=t.name;
  $('srh-kind').textContent=t.class+' ТАНК';
  $('srh-insignia').innerHTML=factionSvg(t.faction,43);
  const fields=[['СКОРОСТЬ',t.speed,150,'км/ч'],['БРОНЯ',t.health,150,'ед.'],['РАЗГОН',t.accel,1.4,''],['ПОВОРОТ',t.turn,1.4,'']];
  $('srh-stats').innerHTML=fields.map(f=>'<div class="stat">'+f[0]+'<b>'+f[1]+' '+f[3]+'</b><div class="meter"><i style="width:'+Math.round(f[1]/f[2]*100)+'%"></i></div></div>').join('');
  const hex=LIVERIES[t.id]||'#f1bc7b';$('srh-color').textContent='ГОНОЧНЫЙ ЦВЕТ: '+hex;
  for(const b of list.children){b.classList.toggle('active',b.dataset.id===t.id);if(b.dataset.id===t.id)b.style.borderColor=hex;else b.style.borderColor='';}
 }
 function choose(id){game.select(id);refresh();}
 function step(n){let i=TANKS.findIndex(t=>t.id===game.selected.id);choose(TANKS[(i+n+TANKS.length)%TANKS.length].id);}
 function sync(){ $('srh-auto').textContent=auto?'⟳ АВТОВРАЩЕНИЕ: ВКЛ':'⟳ АВТОВРАЩЕНИЕ: ВЫКЛ';$('srh-turret').textContent=turret?'БАШНЯ ВРАЩАЕТСЯ':'ПОВОРОТ БАШНИ';}
 function enter(){game.mode='showroom';overlay.classList.remove('hide');$('menu').classList.add('hidden');$('pause').classList.add('hidden');$('race-ui').classList.add('hidden');$('finish').classList.add('hidden');document.exitPointerLock?.();game.controls.clear();refresh();}
 function exit(){overlay.classList.add('hide');game.garage();}
 open.onclick=enter;$('srh-back').onclick=exit;$('srh-prev').onclick=()=>step(-1);$('srh-next').onclick=()=>step(1);
 $('srh-race').onclick=()=>{overlay.classList.add('hide');game.startRace();};
 $('srh-auto').onclick=()=>{auto=!auto;sync();};$('srh-turret').onclick=()=>{turret=!turret;sync();};
 $('srh-reset').onclick=()=>{angle=2.35;tilt=.16;zoom=16;auto=true;sync();};
 const view=$('srh-view');
 view.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;px=e.clientX;py=e.clientY;auto=false;sync();view.setPointerCapture?.(e.pointerId);});
 view.addEventListener('pointermove',e=>{if(!dragging)return;angle+=(e.clientX-px)*.01;tilt=Math.max(-.35,Math.min(.7,tilt+(e.clientY-py)*.004));px=e.clientX;py=e.clientY;});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])view.addEventListener(name,()=>{dragging=false;});
 view.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(10.5,Math.min(27,zoom+Math.sign(e.deltaY)*1.1));},{passive:false});
 window.addEventListener('keydown',e=>{if(game.mode!=='showroom'||e.repeat)return;
  if(e.code==='Escape')exit();if(e.code==='KeyQ')step(-1);if(e.code==='KeyE')step(1);if(e.code==='ArrowLeft'){auto=false;angle-=.16;sync();}if(e.code==='ArrowRight'){auto=false;angle+=.16;sync();}
 });
 const r=game.r;
 game.draw=function(dt){
  if(game.mode!=='showroom')return oldDraw(dt);
  if(auto)angle+=dt*.15;
  const eye=[Math.sin(angle)*zoom,5.8+tilt*5,Math.cos(angle)*zoom];
  r.begin(eye,[0,2.55,0]);
  r.cube(0,-.3,0,100,.35,100,[.12,.18,.19]);
  r.cube(0,12,-28,65,24,.5,[.16,.24,.25]);
  r.cube(0,12,28,65,24,.5,[.16,.24,.25]);
  r.cube(-28,12,0,.5,24,56,[.17,.25,.26]);r.cube(28,12,0,.5,24,56,[.17,.25,.26]);
  for(let i=-3;i<=3;i++){r.cube(i*8,11,-27.6,.5,22,.55,[.27,.35,.36]);r.cube(i*8,11,27.6,.5,22,.55,[.27,.35,.36]);}
  for(let i=-5;i<=5;i++){r.cube(i*2.3,-.11,0,.05,.015,36,[.25,.33,.34]);r.cube(0,-.11,i*2.3,36,.015,.05,[.25,.33,.34]);}
  r.cube(0,.25,0,18,.65,18,[.2,.28,.29]);r.cube(0,.72,0,16,.31,16,[.31,.38,.39]);
  r.cube(0,1.0,0,14,.24,14,[.27,.35,.36]);
  for(let k=-6;k<=6;k++)for(const s of [-1,1]){r.cube(k,1.145,s*7,.83,.07,.14,[.25,.84,.86]);r.cube(s*7,1.145,k,.14,.07,.83,[.25,.84,.86]);}
  for(const x of [-12,12])for(const z of [-9,9])r.cube(x,9,z,.8,.5,.8,[.9,.7,.42]);
  const model=game.assets.get(game.selected.id);
  if(model)model.draw(M4.compose(M4.t(0,1.22,0),M4.ry(Math.PI)),r,turret?Math.sin(game.now*.85)*.75:0,0,'metal',0);
  r.end();
 };
 refresh();
 return {enter,exit,step};
}
