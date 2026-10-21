const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const root=path.dirname(__dirname),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const store=new Map(),context=vm.createContext({Intl,Date,Uint32Array,crypto:crypto.webcrypto,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}});
const segment=(a,b)=>js.slice(js.indexOf(a),js.indexOf(b));
vm.runInContext(segment('const DATA=','const $=')+segment('function dateKey','function visit')+segment('function alias','render();setInterval'),context);
vm.runInContext(`
globalThis.api={DATA,DKEY,dateKey,validDraw,getDraw,newDraw,card,alias,bridge,character};`,context);
const a=context.api,day=a.dateKey();
assert.equal(a.DATA.cards.length,44);assert.equal(a.DATA.cards.filter(x=>x.rare).length,4);
for(const k of ['money','people','health'])assert.equal(a.DATA[k].length,20);
assert.equal(new Set(a.DATA.cards.map(c=>c.keyword)).size,44);
for(const [i,c] of a.DATA.cards.entries()){
 assert.ok(c.alias.split('\n').length<=2);assert.ok(c.title.split('\n').length<=2);
 assert.ok(c.alias.split('\n').every(t=>t.length<=10));
 assert.equal(c.art,i%7);assert.ok(a.character({...c,head:a.DATA.heads[i]}).includes('undefined')===false);
}
assert.equal(a.validDraw({day,h:43,m:19,p:19,e:19},day),true);
for(const bad of [{h:44},{m:20},{p:-1},{e:1.5},{day:'2000-01-01'}])assert.equal(!!a.validDraw({day,h:0,m:0,p:0,e:0,...bad},day),false);
store.set('gatsaeng.daily-horoscope.draw.v1',JSON.stringify({day,h:0,m:0,p:0,e:0,a:0}));assert.equal(a.getDraw(day),null);
const d=a.newDraw(day);assert.equal(JSON.stringify(a.getDraw(day)),JSON.stringify(d));
let rare=0;for(let i=0;i<100000;i++){const d=a.newDraw(day);assert.ok(a.validDraw(d,day));if(a.DATA.cards[d.h].rare)rare++}
assert.ok(rare>4500&&rare<5500);
assert.ok(html.includes("randomInt(20)===0"));assert.ok(html.includes('gatsaeng.daily-horoscope.draw.v2'));
const share=fs.readFileSync(path.join(root,'share-card.html'),'utf8');assert.equal(share.replace('content="1080x1350"','content="390x1800"'),html);
new vm.Script(js);
console.log(JSON.stringify({cards:44,normal:40,rare:4,hints:[20,20,20],trials:100000,rareDraws:rare,rareRate:rare/1000+'%',maxAliasLine:Math.max(...a.DATA.cards.flatMap(c=>c.alias.split('\n').map(t=>t.length))),storage:'v1 ignored; v2 persists; invalid ranges rejected',share:'same source; rarity in SVG and text',syntax:'pass'},null,2));
