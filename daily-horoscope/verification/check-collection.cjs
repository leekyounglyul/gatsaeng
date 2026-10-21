const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const segment=(a,b)=>js.slice(js.indexOf(a),js.indexOf(b));
const store=new Map([['gatsaeng.daily-horoscope.collection.v1','[0,0,43,-1,44,1.5,"1"]']]),elements={};
const ctx=vm.createContext({localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},$:id=>elements[id]??(elements[id]={})});
vm.runInContext(segment('const DATA=','const KEY=')+segment('const CKEY=','function render(){')+'globalThis.test={renderCollection,cards:DATA.cards,get:()=>collection};',ctx);
const api=ctx.test;assert.equal(JSON.stringify(api.get()),'[0,43]');api.renderCollection(api.cards[40]);api.renderCollection(api.cards[40]);assert.equal(JSON.stringify(api.get()),'[0,43,40]');assert.equal(elements['collection-count'].textContent,'3 / 44');assert.equal((elements['collection-track'].innerHTML.match(/class="mini-card/g)||[]).length,8);assert.equal((elements['collection-list'].innerHTML.match(/<li /g)||[]).length,44);assert.ok(elements['collection-track'].innerHTML.includes('gold'));assert.equal(store.get('gatsaeng.daily-horoscope.collection.v1'),'[0,43,40]');
assert.ok(html.includes('grid-template-columns:repeat(3,minmax(0,1fr))'));assert.ok(!html.includes("location.replace('./')"));assert.ok(html.includes('공유 카드 미리보기'));assert.ok(html.includes('.reading:nth-child(2){background:#ffe0ed}'));assert.ok(html.includes('privacy.html'));
console.log('PASS: invalid collection entries filtered; unique cards persist; 8 preview slots; 44 catalogue entries; gold badge; no share redirect; responsive grid; pink hint; privacy link');
