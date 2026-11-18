import assert from 'node:assert/strict';
import {installIntro} from '../src/intro.js';

const all=new Map();
class E {
 constructor(id){this.id=id;this.hidden=false;this.textContent='';this.children=[];this.listeners=new Map();this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),contains:x=>this.classes.has(x),toggle:(x,b)=>b?this.classes.add(x):this.classes.delete(x)};}
 set className(x){this.classes=new Set(x.split(' ').filter(Boolean));}
 get className(){return [...this.classes].join(' ')}
 set innerHTML(x){this.html=x;for(const [,id] of x.matchAll(/id="([a-z0-9-]+)"/g)) all.set(id,new E(id));}
 appendChild(x){this.children.push(x);if(x.id)all.set(x.id,x);}
 setAttribute(k,v){this[k]=v;}
 addEventListener(name,fn){this.listeners.set(name,fn);}
 click(){this.onclick?.();this.listeners.get('click')?.({});}
}
const ui=new E('game-ui'),hud=new E('race-ui');all.set('game-ui',ui);all.set('race-ui',hud);
globalThis.document={head:new E('head'),createElement:type=>new E(type),getElementById:id=>all.get(id),exitPointerLock:()=>{}};
globalThis.window={handlers:new Map(),addEventListener(n,fn){this.handlers.set(n,fn);}};
const world={pointAt:f=>({x:f*1200,y:0,z:100*f}),tangentAt:f=>({x:1,z:0}),draw(){},drawGates(){}};
const r={begin(){},end(){}};
let oldDraws=0,oldStarts=0,oldUI=0,oldGarage=0,renderTanks=0;
const game={mode:'menu',now:0,time:0,world,r,raceType:'race',bots:[],tank:{x:0,y:0,z:0,yaw:0,turret:0},selected:{id:'test'},controls:new Set(['KeyW']),mouseDx:4,mouseDy:2,cam:[0,0,0],
 combat:{items:[],inventory:[],draw(){}},drawTank(){renderTanks++},
 startRace(){oldStarts++;this.mode='race';this.bots=[{spec:{id:'bot'},x:4,y:0,z:4,yaw:0,turret:0}];hud.classList.remove('hidden');},
 draw(){oldDraws++},updateUI(){oldUI++},garage(){oldGarage++;this.mode='menu'},toast(s){this.message=s}};
const intro=installIntro(game);
assert.equal(intro.active,false);
game.startRace({type:'race'});
assert.equal(oldStarts,1);assert.equal(game.mode,'intro');assert.equal(hud.classList.contains('hidden'),true);
assert.equal(game.combat.items.length,3);assert.equal(game.controls.size,0);
for(let i=0;i<250;i++){game.now+=.016;game.draw(.016);}
assert.equal(game.mode,'intro');assert.ok(renderTanks>=500,'Tanks and bots should be visible during intro');
assert.ok(game.time===0,'Race clock must stay frozen');
intro.skip();assert.ok(intro.elapsed>=6.3,'Skip goes to countdown');
assert.equal(game.mode,'intro');
intro.skip();assert.equal(game.mode,'race');assert.equal(hud.classList.contains('hidden'),false);
assert.ok(/ПОЕХАЛИ/.test(game.message));
game.updateUI();assert.equal(all.get('sr14-guide').hidden,false);
game.combat.inventory.push('burst');game.updateUI();assert.equal(all.get('sr14-guide').hidden,true);
game.garage();assert.equal(game.mode,'menu');assert.equal(oldGarage,1);
// Full-duration transition is equally valid for practice with no opponents.
game.combat.inventory=[];game.raceType='practice';game.startRace({type:'practice'});
let frames=0;while(game.mode==='intro'&&frames<800){game.now+=.016;game.draw(.016);frames++;}
assert.equal(game.mode,'race');assert.ok(frames>520&&frames<600);
assert.equal(game.combat.items.filter(x=>x.starter14).length,3,'No duplicate starter medals');
console.log('PASS: intro stages, frozen timer, free skip, bots, HUD, medal guide, restart, auto transition.');