// STEEL RUSH 1.5: unrestricted base weapons; medals remain optional bonuses.
export function installFreeWeapons(game){
 const c=game.combat;
 if(!c||game._freeWeaponsInstalled)return;
 game._freeWeaponsInstalled=true;
 const weapons=[{name:'ПУШКА',cd:.48},{name:'РАКЕТА',cd:5},{name:'ГРАД',cd:9}];
 const state={selected:0,next:[0,0,0],botNext:new WeakMap(),shots:0};
 const $=id=>document.getElementById(id);
 const hud=document.createElement('section');hud.id='sr15-weapons';
 hud.innerHTML='<div class="sr15-title">ОРУЖИЕ ДОСТУПНО СРАЗУ · ЛКМ — ОГОНЬ</div><div class="sr15-items">'+weapons.map((w,i)=>'<button type="button" class="sr15-weapon" data-w="'+i+'"><b>'+(i+1)+' · '+w.name+'</b><span class="sr15-time">ГОТОВО</span></button>').join('')+'</div>';
 $('game-ui').appendChild(hud);
 const style=document.createElement('style');style.textContent='.sr15-weapons{position:absolute;left:50%;bottom:171px;transform:translateX(-50%);z-index:5;width:min(418px,85vw);background:#10252eea;border:1px solid #7faaa7;padding:8px;color:#f2d7b7;font:800 11px Segoe UI,sans-serif;box-shadow:0 8px 30px #000a;pointer-events:none}.sr15-title{text-align:center;letter-spacing:.05em;margin-bottom:7px}.sr15-items{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;pointer-events:auto}.sr15-weapon{border:1px solid #607d80;background:#23393e;color:#f7d9af;display:flex;flex-direction:column;gap:4px;padding:7px 4px;cursor:pointer}.sr15-weapon.selected{background:#3b5245;border-color:#f4c783;box-shadow:inset 0 0 0 1px #ffd490}.sr15-time{font-size:9px;color:#a9e8bb}.sr15-time.wait{color:#edab80}@media(max-width:800px){.sr15-weapons{bottom:104px;width:min(310px,87vw);padding:5px}.sr15-title{font-size:9px}.sr15-weapon{padding:5px 2px}}@media(max-width:550px){.sr15-weapons{bottom:258px}}';document.head.appendChild(style);
 function drawUI(){for(const el of hud.querySelectorAll('[data-w]')){const i=+el.dataset.w,wait=Math.max(0,state.next[i]-game.time);el.classList.toggle('selected',i===state.selected);const t=el.querySelector('.sr15-time');t.textContent=wait>0?wait.toFixed(1)+' С':'ГОТОВО';t.classList.toggle('wait',wait>0);}const mark=$('shoot-status');if(mark){const i=state.selected,wait=Math.max(0,state.next[i]-game.time);mark.textContent=weapons[i].name+(wait>0?' · '+wait.toFixed(1)+' С':' · ГОТОВО');mark.style.color=wait>0?'#f4b482':'#a8ffc4';}}
 function select(i){if(i<0||i>2)return;state.selected=i;drawUI();}
 function fire(alt=false){if(game.mode!=='race')return false;const i=state.selected;if(game.time+1e-5<state.next[i])return false;const t=game.tank;
  if(i===0){c.createShell(t,{kind:'burst',speed:133,damage:13,stun:.22,reverse:alt});c.effects.push({kind:'flash',x:t.x,y:t.y+2,z:t.z,life:.16,ttl:.16,color:[1,.7,.28],scale:2});}
  else if(i===1)c.activate('rocket',t,alt);
  else c.activate('artillery',t,alt);
  state.next[i]=game.time+weapons[i].cd;state.shots++;drawUI();return true;
 }
 const oldUse=c.useSelected.bind(c);c.useSelected=function(alt=false){if(!this.inventory[this.selectedSlot])return false;return oldUse(alt);};
 const oldReset=c.reset.bind(c);c.reset=function(){oldReset();state.next=[0,0,0];state.selected=0;drawUI();};
 const oldRefresh=c.refreshUI.bind(c);c.refreshUI=function(){oldRefresh();const h=$('power-help');if(h)h.textContent=this.inventory.length+'/3 · МЕДАЛИ — ДОП. УСИЛЕНИЯ · F · Q/E · X';const a=$('power-active');if(a&&!this.inventory.length)a.textContent='МЕДАЛИ НЕ НУЖНЫ ДЛЯ АТАК';drawUI();};
 window.addEventListener('keydown',e=>{if(game.mode!=='race'||e.repeat)return;if(/^Digit[1-3]$/.test(e.code)){e.preventDefault();e.stopImmediatePropagation();select(+e.code.slice(5)-1);}else if(e.code==='KeyF'){e.preventDefault();e.stopImmediatePropagation();c.useSelected();}},true);
 game.canvas.addEventListener('mousedown',e=>{if(game.mode!=='race'||(e.button!==0&&e.button!==2))return;e.stopImmediatePropagation();fire(e.button===2);},true);
 for(const b of hud.querySelectorAll('[data-w]'))b.addEventListener('click',()=>select(+b.dataset.w));
 const toast=game.toast.bind(game);game.toast=function(msg){if(typeof msg==='string'&&/СНАЧАЛА ПОДБЕРИТЕ МЕДАЛЬ|ПОДБИРАЙ МЕДАЛИ ДЛЯ АТАК|НЕТ БОЕПРИПАСОВ/i.test(msg))return;return toast(msg);};
 const originalUI=game.updateUI.bind(game);game.updateUI=function(){originalUI();drawUI();const hint=$('sr14-guide');if(hint)hint.hidden=true;};
 const oldUpdate=c.update.bind(c);c.update=function(dt){oldUpdate(dt);if(game.mode!=='race')return;const speed=game.difficulty==='hard'?1.35:game.difficulty==='easy'?.72:1;for(const bot of game.bots){let next=state.botNext.get(bot);if(next===undefined){next=game.time+2+(game.bots.indexOf(bot)%3)*.7;state.botNext.set(bot,next);}if(game.time<next||bot.stun>0)continue;const target=c.closestEnemy(bot,105);if(target){bot.turretAim=c.aimTo(bot,target);c.createShell(bot,{kind:'burst',speed:115,damage:8,stun:.2});}state.botNext.set(bot,game.time+(3.6+(game.bots.indexOf(bot)%3)*.8)/speed);}};
 c.refreshUI();return {state,fire,select};
}
