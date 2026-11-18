// STEEL RUSH 1.2: race mode selector, three AI difficulties, free practice.
// Additive overlay for the deployed WebGL2 game and existing showroom.
export function installModes(game) {
 const $ = id => document.getElementById(id);
 const levels = {
   easy: {name:'НОВИЧОК', count:4, pace:.86, aggression:.65},
   normal:{name:'БОЕЦ', count:6, pace:1, aggression:1},
   hard:{name:'АС', count:6, pace:1.16, aggression:1.55}
 };
 game.raceType = 'race';
 game.difficulty = 'normal';
 game.lapLimit = 3;
 const styling=document.createElement('style');
 styling.textContent = '.sr12-nav{display:flex;gap:9px;margin:15px 0 20px;flex-wrap:wrap}.sr12-nav button{flex:1 1 205px;min-height:63px;text-align:center;font-size:12px;letter-spacing:.06em}.sr12-nav button.practice{border-color:#5eaeaa;color:#9ff1e5;background:#17353b}.sr12-nav button.practice:hover{background:#23565c}.sr12-label{display:block;color:#f5c589;font-size:11px;letter-spacing:.18em;font-weight:900;margin:15px 0 8px}.sr12-menu-line{font-size:12px!important}.sr12-setup{position:absolute;inset:0;z-index:12;pointer-events:auto;overflow-y:auto;display:flex;align-items:center;justify-content:center;padding:100px 18px 18px;background:radial-gradient(ellipse at 65% 20%,#364447e8,#07161bf6 65%)}.sr12-setup.hidden{display:none!important}.sr12-panel{max-width:960px;width:100%;border:1px solid #7a938b;border-left:5px solid #ecad72;background:linear-gradient(120deg,#10242af7,#08171cf9);padding:clamp(20px,3.5vw,44px);box-shadow:0 25px 100px #000b}.sr12-top{display:flex;justify-content:space-between;align-items:center;gap:12px}.sr12-kicker{color:#ebbe80;font-size:11px;letter-spacing:.16em}.sr12-top button{min-width:unset;font-size:11px}.sr12-panel h2{font:clamp(40px,5.2vw,70px) Impact,sans-serif;letter-spacing:.075em;margin:19px 0 8px}.sr12-panel h2 em{color:#faab77;font-style:normal}.sr12-panel p{font-size:13px;color:#bdceca;line-height:1.6}.sr12-levels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:22px 0}.sr12-level{min-height:195px;text-align:left;background:#21383c;border:1px solid #6d8982;color:#f0dfc6;padding:20px 17px;display:flex;flex-direction:column;align-items:flex-start;gap:15px}.sr12-level:hover{border-color:#f9d09a;background:#344e50}.sr12-level.active{border:2px solid #efb77c;background:linear-gradient(135deg,#4a4233,#253b3b);padding:19px 16px}.sr12-level small{font-size:10px;letter-spacing:.13em;color:#f4c58b}.sr12-level strong{font:34px Impact,sans-serif;letter-spacing:.07em}.sr12-level span{font-size:12px;line-height:1.5;color:#c4d2d1}.sr12-summary{border-top:1px solid #647b77;border-bottom:1px solid #647b77;padding:16px 0;margin:20px 0;display:flex;gap:28px;flex-wrap:wrap;font-size:12px;color:#d1dcd4}.sr12-summary b{color:#ffd39a}.sr12-start{display:flex;align-items:center;gap:22px;flex-wrap:wrap}.sr12-start span{font-size:11px;color:#aebeb8}.sr12-setup button:focus-visible{outline:2px solid #8edddd;outline-offset:3px}@media(max-width:700px){.sr12-levels{grid-template-columns:1fr}.sr12-level{min-height:105px;gap:7px;padding:12px}.sr12-level.active{padding:11px}.sr12-level strong{font-size:25px}.sr12-panel h2{font-size:39px}.sr12-setup{align-items:flex-start;padding-top:80px}.sr12-top button{padding:9px;font-size:9px}}';
 document.head.append(styling);
 const menu=$('menu'), lineup=menu.querySelector('.menu-line');
 const nav=document.createElement('div');
 nav.innerHTML='<span class="sr12-label">ВЫБЕРИТЕ РЕЖИМ ИГРЫ</span><div class="sr12-nav"><button type="button" id="sr12-race" class="primary">▰ ГОНОЧНЫЙ ЗАЕЗД →</button><button type="button" id="sr12-practice" class="outline practice">◎ ТРЕНИРОВОЧНЫЙ ЗАЕЗД</button></div>';
 lineup.parentNode.insertBefore(nav,lineup);
 lineup.classList.add('sr12-menu-line');
 const oldPlay=$('play'); if(oldPlay)oldPlay.style.display='none';
 const pane=document.createElement('section');
 pane.id='sr12-setup';pane.className='sr12-setup hidden';pane.setAttribute('role','dialog');pane.setAttribute('aria-modal','true');pane.setAttribute('aria-labelledby','sr12-title');
 pane.innerHTML='<div class="sr12-panel"><div class="sr12-top"><span class="sr12-kicker">STEEL RUSH / SINGLE PLAYER / DESERT CIRCUIT</span><button class="outline" id="sr12-back" type="button">← В МЕНЮ</button></div><h2 id="sr12-title">ГОНОЧНЫЙ <em>ЗАЕЗД</em></h2><p>Выберите сложность: она меняет количество соперников, их скорость и частоту применения боевых медалей. Характеристики вашего танка не изменяются.</p><span class="sr12-label">СЛОЖНОСТЬ</span><div class="sr12-levels"><button class="sr12-level" data-level="easy" aria-pressed="false"><small>01 / НАЧАЛЬНЫЙ</small><strong>НОВИЧОК</strong><span>4 соперника · спокойный темп · меньше атак</span></button><button class="sr12-level active" data-level="normal" aria-pressed="true"><small>02 / СТАНДАРТ</small><strong>БОЕЦ</strong><span>6 соперников · стандартная скорость и атаки</span></button><button class="sr12-level" data-level="hard" aria-pressed="false"><small>03 / ЭКСПЕРТ</small><strong>АС</strong><span>6 соперников · быстрые танки · активные атаки</span></button></div><div class="sr12-summary"><span>ТРАССА <b>ПЕСЧАНЫЙ КОТЁЛ</b></span><span>КРУГИ <b>3</b></span><span>ТАНК <b id="sr12-tank">Т-34-76</b></span></div><div class="sr12-start"><button id="sr12-confirm" class="primary" type="button">НА СТАРТ →</button><span>WASD — движение · ЛКМ — медаль · Esc — пауза</span></div></div>';
 $('game-ui').append(pane);
 function difficulty(level){
  if(!levels[level])return;
  game.difficulty=level;
  pane.querySelectorAll('[data-level]').forEach(b=>{const on=b.dataset.level===level;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 }
 for(const b of pane.querySelectorAll('[data-level]'))b.onclick=()=>difficulty(b.dataset.level);
 const oldStart=game.startRace.bind(game),oldFinish=game.finish.bind(game),oldUpdate=game.update.bind(game),oldUI=game.updateUI.bind(game),oldGarage=game.garage.bind(game);
 game.startRace=function(options){
  if(options&&typeof options==='object'){
   if(options.type)game.raceType=options.type;
   if(levels[options.difficulty])game.difficulty=options.difficulty;
  }
  const cfg=levels[game.difficulty]||levels.normal;
  game.lapLimit=game.raceType==='practice'?Infinity:3;
  oldStart();
  if(game.raceType==='practice') game.bots.length=0;
  else {
   game.bots.length=cfg.count;
   for(const b of game.bots){b.base*=cfg.pace;b.aiPowerTimer/=cfg.aggression;}
  }
  pane.classList.add('hidden');
  game.toast(game.raceType==='practice'?'СВОБОДНАЯ ТРЕНИРОВКА · БЕЗ СОПЕРНИКОВ':'СЛОЖНОСТЬ: '+cfg.name);
 };
 game.finish=function(){if(game.raceType==='practice')return;oldFinish();};
 game.update=function(dt){
  if(game.raceType==='race'){
   const ag=levels[game.difficulty].aggression;
   for(const b of game.bots)b.aiPowerTimer=Math.max(0,(b.aiPowerTimer||0)+dt*(1-ag));
  }
  oldUpdate(dt);
 };
 game.updateUI=function(){
  oldUI();
  const label=$('race-mode-label');
  if(label)label.textContent=game.raceType==='practice'?'СВОБОДНАЯ ТРЕНИРОВКА':'ГОНКА / '+levels[game.difficulty].name;
  if(game.raceType==='practice'){
   $('lap').textContent='ТРЕНИРОВКА · КРУГ '+game.tank.lap;
   $('position').textContent='НЕТ СОПЕРНИКОВ';
  }else{
   $('position').textContent=(1+game.bots.filter(b=>b.progress>(game.tank.lap-1+game.world.progressFor(game.tank.x,game.tank.z))).length)+' / '+(game.bots.length+1);
  }
 };
 game.garage=function(){pane.classList.add('hidden');oldGarage();};
 function openSetup(){
  if(!game.world)return;
  game.mode='setup';$('menu').classList.add('hidden');$('pause').classList.add('hidden');$('race-ui').classList.add('hidden');
  $('finish').classList.add('hidden');const showroom=$('sr-showroom');if(showroom)showroom.classList.add('hide');
  $('sr12-tank').textContent=game.selected.name;difficulty(game.difficulty);pane.classList.remove('hidden');document.exitPointerLock?.();
 }
 function closeSetup(){if(game.mode!=='setup')return;pane.classList.add('hidden');game.mode='menu';$('menu').classList.remove('hidden');}
 $('sr12-race').onclick=openSetup;
 $('sr12-practice').onclick=()=>game.startRace({type:'practice'});
 $('sr12-confirm').onclick=()=>game.startRace({type:'race',difficulty:game.difficulty});
 $('sr12-back').onclick=closeSetup;
 const showroomPlay=$('srh-race');if(showroomPlay)showroomPlay.onclick=openSetup;
 if(oldPlay)oldPlay.onclick=openSetup;
 window.addEventListener('keydown',e=>{if(e.code==='Escape'&&game.mode==='setup')closeSetup();});
 const logo=document.querySelector('.logotype small');if(logo)logo.textContent='DESERT CIRCUIT / MODES / 1.2';
 document.title='STEEL RUSH — Режимы гонки 1.2';
 return {openSetup,closeSetup,difficulty,levels};
}