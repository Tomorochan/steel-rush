// STEEL RUSH 1.4 — cinematic track flyover and clear medal onboarding.
// Installed last, after the 1.1 showroom and 1.3 race briefing.
// All car/track state stays frozen until the 'GO' transition.

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const blend=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const $=id=>document.getElementById(id);

const TRACK_SHOTS=[
 {start:0,end:2.35,from:.019,to:.078,height:28,behind:37,side:36,caption:'01 / ПЕСЧАНЫЙ КОТЁЛ',sub:'ПЕСЧАНЫЕ ДУГИ · ТРИ АЛЬТЕРНАТИВНЫХ МАРШРУТА'},
 {start:2.35,end:4.65,from:.095,to:.152,height:10,behind:17,side:-23,caption:'БРОНЕТЕХНИКА НА ТРАССЕ',sub:'СОБИРАЙ ЦВЕТНЫЕ МЕДАЛИ · ИСПОЛЬЗУЙ УСИЛЕНИЯ'},
 {start:4.65,end:6.3,from:.013,to:0,height:8,behind:18,side:9,caption:'СТАРТОВАЯ РЕШЁТКА',sub:'WASD — ДВИЖЕНИЕ · МЫШЬ — КАМЕРА И БАШНЯ'}
];

function cameraOnRoute(world,spec,progress){
 const at=world.pointAt(progress),toward=world.tangentAt(progress);
 return {at,toward,x:at.x-toward.x*spec.behind-toward.z*spec.side,
  z:at.z-toward.z*spec.behind+toward.x*spec.side,
  y:at.y+spec.height};
}

export function installIntro(game){
 const style=document.createElement('style');
 style.textContent=`
 .sr14-intro{position:absolute;inset:0;z-index:20;pointer-events:none;font-family:Segoe UI,Trebuchet MS,sans-serif;color:#fff3db;overflow:hidden}
 .sr14-intro.hidden{display:none!important}
 .sr14-intro:before,.sr14-intro:after{content:"";position:absolute;left:0;right:0;height:72px;background:linear-gradient(#040b0df5,#071519b0);pointer-events:none}
 .sr14-intro:before{top:0}.sr14-intro:after{bottom:0;transform:rotate(180deg)}
 .sr14-brand{position:absolute;top:27px;left:clamp(15px,4vw,70px);z-index:2;font-size:12px;letter-spacing:.20em;color:#ffc98d;font-weight:900;text-shadow:0 2px 14px #000}
 .sr14-shot{position:absolute;left:clamp(20px,6vw,110px);bottom:clamp(85px,13vh,160px);max-width:min(680px,85vw);z-index:2;text-shadow:0 3px 18px #000}
 .sr14-shot strong{display:block;font:clamp(30px,5.5vw,74px) Impact,Arial Narrow,sans-serif;letter-spacing:.07em;line-height:1.05}
 .sr14-shot small{display:block;margin-top:13px;font-size:clamp(10px,1vw,13px);letter-spacing:.13em;color:#f3bc87;font-weight:900}
 .sr14-footer{position:absolute;z-index:3;left:clamp(15px,4vw,70px);right:clamp(15px,4vw,70px);bottom:27px;display:flex;justify-content:space-between;align-items:center;gap:18px}
 .sr14-footer span{font-size:11px;letter-spacing:.12em;color:#a9cac9}
 .sr14-footer button{pointer-events:auto;cursor:pointer;padding:12px 18px;background:#183239e5;border:1px solid #e5ad79;color:#ffe0b3;font-weight:900;font-size:12px;letter-spacing:.07em}
 .sr14-footer button:hover{background:#3c4b47}
 .sr14-count{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:4;font:clamp(125px,24vw,270px) Impact,Arial Narrow,sans-serif;letter-spacing:.03em;color:#fff1c9;text-shadow:0 7px 35px #000,0 0 35px #ff963788;pointer-events:none}
 .sr14-count[hidden]{display:none}.sr14-count.go{color:#a9ffdd;text-shadow:0 0 50px #48e4ac99}
 .sr14-guide{position:absolute;z-index:7;left:50%;bottom:177px;transform:translateX(-50%);width:min(470px,85vw);background:#0d2228df;border:1px solid #e5ad7988;border-radius:9px;padding:10px 14px;text-align:center;color:#ffe3b8;pointer-events:none;font:900 11px Segoe UI,sans-serif;letter-spacing:.05em;text-shadow:0 2px 8px #000}
 .sr14-guide[hidden]{display:none}
 @media(max-width:700px){.sr14-shot{bottom:104px}.sr14-intro:before,.sr14-intro:after{height:54px}.sr14-footer{bottom:17px}.sr14-guide{bottom:155px;font-size:9px}}
 `;
 document.head.appendChild(style);
 const root=document.createElement('div');root.id='sr14-intro';root.className='sr14-intro hidden';root.setAttribute('aria-live','off');
 root.innerHTML=`<div class="sr14-brand">STEEL RUSH / ПРЕДСТАРТОВЫЙ ОБЛЁТ</div><div class="sr14-shot"><strong id="sr14-title">01 / ПЕСЧАНЫЙ КОТЁЛ</strong><small id="sr14-subtitle">ПЕСЧАНЫЕ ДУГИ · ТРИ СРЕЗА</small></div><div class="sr14-count" id="sr14-count" hidden>3</div><div class="sr14-footer"><span id="sr14-details">СИНГЛПЛЕЕР / ЗНАКОМСТВО С ТРАССОЙ</span><button id="sr14-skip" type="button">ПРОПУСТИТЬ ОБЛЁТ →</button></div>`;
 $('game-ui').appendChild(root);
 const guide=document.createElement('div');guide.id='sr14-guide';guide.className='sr14-guide';guide.hidden=true;
 guide.textContent='ПРОЕДЬ ЧЕРЕЗ ЦВЕТНУЮ МЕДАЛЬ, ЧТОБЫ ПОЛУЧИТЬ ОРУЖИЕ';
 $('game-ui').appendChild(guide);
 const counter=$('sr14-count'),skip=$('sr14-skip'),title=$('sr14-title'),subtitle=$('sr14-subtitle');
 let elapsed=0,active=false,lastCount='',guideTick=0,viewIndex=-1;
 const oldStart=game.startRace.bind(game),oldDraw=game.draw.bind(game),oldUI=game.updateUI.bind(game),oldGarage=game.garage.bind(game);

 // Starting pickups: the first weapon appears on the centerline before the
 // first large curve, so an ordinary WASD driver will encounter one naturally.
 function ensureStarterMedals(){
  const c=game.combat,w=game.world;
  if(!c||!w?.pointAt||!w?.tangentAt)return;
  c.items=c.items.filter(p=>!p.starter14);
  const kinds=['burst','rocket','shield'];
  [.006,.012,.019].forEach((f,i)=>{
   const p=w.pointAt(f),t=w.tangentAt(f),side=i===0?0:i===1?-3.7:3.7;
   c.items.push({id:900140+i,kind:kinds[i],x:p.x-t.z*side,z:p.z+t.x*side,y:p.y,
    timer:0,angle:i*1.7,starter14:true});
  });
 }

 function begin(){
  active=true;elapsed=0;lastCount='';viewIndex=-1;game.mode='intro';
  game.controls?.clear?.();game.mouseDx=0;game.mouseDy=0;
  $('race-ui')?.classList.add('hidden');root.classList.remove('hidden');guide.hidden=true;
  counter.hidden=true;skip.textContent='ПРОПУСТИТЬ ОБЛЁТ →';
  document.exitPointerLock?.();
  ensureStarterMedals();
 }
 function finish(){
  if(!active)return;
  active=false;root.classList.add('hidden');counter.hidden=true;
  game.mode='race';game.controls?.clear?.();game.mouseDx=0;game.mouseDy=0;
  $('race-ui')?.classList.remove('hidden');
  game.toast?.('ПОЕХАЛИ! · ПОДБИРАЙ МЕДАЛИ ДЛЯ АТАК');
  guide.hidden=false;guideTick=0;
 }
 function cancel(){active=false;root.classList.add('hidden');guide.hidden=true;counter.hidden=true;}
 function renderCountdown(){
  const rem=8.85-elapsed;
  if(elapsed<6.3){counter.hidden=true;return;}
  const value=rem<=.55?'ПОЕХАЛИ!':String(Math.max(1,Math.ceil(rem)));
  if(lastCount!==value){counter.classList.toggle('go',value==='ПОЕХАЛИ!');counter.textContent=value;lastCount=value;}
  counter.hidden=false;
  if(elapsed>8.85)finish();
 }
 function drawFlyover(dt){
  elapsed+=dt;
  const w=game.world,r=game.r;
  if(!w){finish();return oldDraw(dt);}
  if(elapsed>=8.85){finish();return oldDraw(dt);}
  let eye,look;
  if(elapsed<6.3){
   let index=TRACK_SHOTS.findIndex(s=>elapsed>=s.start&&elapsed<s.end);
   if(index<0)index=2;
   const shot=TRACK_SHOTS[index],t=smooth((elapsed-shot.start)/(shot.end-shot.start));
   const current=cameraOnRoute(w,shot,blend(shot.from,shot.to,t));
   eye=[current.x,current.y,current.z];
   const target=w.pointAt(blend(shot.from,shot.to,t)+.018);
   look=[target.x,target.y+1.4,target.z];
   if(index!==viewIndex){title.textContent=shot.caption;subtitle.textContent=shot.sub;viewIndex=index;}
  }else{
   if(viewIndex!==3){title.textContent=game.raceType==='practice'?'ТРЕНИРОВОЧНЫЙ ЗАЕЗД':'ПРИГОТОВИТЬСЯ К ГОНКЕ';
     subtitle.textContent='ОРУЖИЕ — ТОЛЬКО ПОСЛЕ ПОДБОРА ЦВЕТНОЙ МЕДАЛИ';viewIndex=3;}
   const tank=game.tank,yaw=tank.yaw,smoothMove=smooth((elapsed-6.3)/1.5);
   const d=blend(19,11,smoothMove),h=blend(10,5.8,smoothMove);
   eye=[tank.x+Math.sin(yaw)*d,tank.y+h,tank.z+Math.cos(yaw)*d];
   look=[tank.x-Math.sin(yaw)*5,tank.y+2.3,tank.z-Math.cos(yaw)*5];
  }
  r.begin(eye,look);
  w.draw(r);
  game.drawTank(game.tank,game.selected,game.tank.turret);
  for(const b of game.bots)game.drawTank(b,b.spec,b.turretAim??(b.yaw+b.turret));
  w.drawGates?.(r,{time:game.now,active:game.tank.checkpoint,mode:'intro'});
  game.combat?.draw?.(r,game.now);
  r.end();
  renderCountdown();
 }

 game.startRace=function(options={}){oldStart(options);begin();};
 game.draw=function(dt){if(active&&game.mode==='intro')return drawFlyover(dt);return oldDraw(dt);};
 game.updateUI=function(){oldUI();if(game.mode!=='race')return;
  if((game.combat?.inventory?.length||0)>0){guide.hidden=true;return;}
  guideTick+=1;
  if(guideTick%12!==0)return;
  const choices=game.combat?.items?.filter(p=>p.timer<=0)||[];
  const me=game.tank;
  const nearest=choices.reduce((best,p)=>{const d=Math.hypot(me.x-p.x,me.z-p.z);return !best||d<best.d?{d,p}:best;},null);
  guide.textContent=nearest?`НЕТ МЕДАЛИ · ПРОЕДЬ ЧЕРЕЗ ЦВЕТНОЙ ЗНАК · БЛИЖАЙШИЙ ${Math.round(nearest.d)} М`:'НЕТ МЕДАЛИ · ДОЖДИСЬ ПОЯВЛЕНИЯ УСИЛЕНИЯ';
  guide.hidden=false;
 };
 game.garage=function(){cancel();oldGarage();};
 skip.onclick=()=>{if(!active)return;if(elapsed<6.3){elapsed=6.3;lastCount='';skip.textContent='НА СТАРТ →';}
  else{elapsed=8.85;finish();}
 };
 window.addEventListener('keydown',e=>{
  if(game.mode!=='intro')return;
  if(['Space','Enter','Escape'].includes(e.code)){
   e.preventDefault();e.stopImmediatePropagation();
   if(elapsed<6.3){elapsed=6.3;skip.textContent='НА СТАРТ →';}else{elapsed=8.85;finish();}
  }
 },true);
 return {get active(){return active;},get elapsed(){return elapsed;},skip:()=>skip.click(),cancel};
}