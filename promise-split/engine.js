/* 약속의 분배 · 규칙 v2 · 외부 의존성 없는 순수 엔진 */
(function(root){
'use strict';
const A=['C','T','G'];
function hash(s){let h=2166136261;for(const b of new TextEncoder().encode(s)){h^=b;h=Math.imul(h,16777619);}return h>>>0;}
function rng(s){let x=hash(s)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function day(now=new Date()){const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(t=>p.find(x=>x.type===t).value).join('-');}
function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
function shift(s,n){return new Date(Date.parse(s+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);}
function seed(date){return 'promise-split|2|'+date;}
function condition(date){return hash(seed(date))%3;}
function score(actions,scores){if(actions.length!==4||actions.some(a=>!A.includes(a)))throw Error('행동 오류');const k=actions.filter(a=>a==='T').length;const raw=actions.map(a=>k===0?(a==='C'?3:1):k===1?(a==='T'?5:a==='C'?-2:0):(a==='T'?-2:a==='G'?1:0));const next=scores.map((s,i)=>Math.max(0,s+raw[i]));return {k,scores:next,deltas:next.map((s,i)=>s-scores[i])};}
function distributions(s,i,promises){return s.scores.map((_,j)=>{let counts=[1,1,1];s.history.forEach(h=>counts[A.indexOf(h.actions[j])]++);const sum=counts.reduce((a,b)=>a+b,0);return counts.map((c,k)=>promises?.[j]?0.7*c/sum+0.3*(promises[j]===A[k]):c/sum);});}
function best(s,i,promises){const ds=distributions(s,i,promises),others=[0,1,2,3].filter(j=>j!==i);let winner='C',highest=-Infinity;for(const a of ['C','G','T']){let ev=0;for(const b of A)for(const c of A)for(const d of A){const acts=[];acts[i]=a;let pr=1;[b,c,d].forEach((v,k)=>{acts[others[k]]=v;pr*=ds[others[k]][A.indexOf(v)];});const projected=score(acts,s.scores).scores;ev+=pr*(projected[i]-Math.max(...others.map(j=>projected[j])));}if(ev>highest+1e-10){winner=a;highest=ev;}}return winner;}
function pick(r,weights){const v=r();return v<weights[0]?'C':v<weights[0]+weights[1]?'T':'G';}
// 공개 이력의 연속 가로채기에 한 명이 맞서고 나머지는 보호한다. 비공개 행동은 읽지 않는다.
function bot(s,i,phase,promises){
 const r=rng(seed(s.date)+'|bot='+i+'|round='+s.round+'|phase='+phase);
 if(s.history.length>=2&&s.history.slice(-2).every(h=>h.actions[0]==='T'))return i===1+(s.round%3)?'T':'G';
 // 공통 분위기와 개별 판단을 섞어, 같은 행동만 고르는 전략을 완화한다.
 const shared=rng(seed(s.date)+'|climate|'+s.round+'|'+phase);
 if(shared()<.43)return pick(shared,[.2,.4]);
 return pick(r,[.4,.34]);
}
function prepare(s){s.phase='promise';s.promises=[null,...[1,2,3].map(i=>bot(s,i,'promise'))];s.committedBotActions=null;return s;}
function create(date,mode='daily'){return prepare({version:2,date,mode,round:1,phase:'promise',scores:[10,10,10,10],history:[],promises:[],committedBotActions:null});}
function promise(s,a){if(s.phase!=='promise'||!A.includes(a))throw Error('약속 단계 오류');const n=structuredClone(s);n.promises[0]=a;const publicSnapshot=structuredClone(n);n.committedBotActions=[1,2,3].map(i=>bot(publicSnapshot,i,'action',publicSnapshot.promises));n.phase='action';return n;}
function act(s,a){if(s.phase!=='action'||!A.includes(a))throw Error('행동 단계 오류');const n=structuredClone(s),actions=[a,...s.committedBotActions],r=score(actions,s.scores);n.scores=r.scores;n.history.push({round:s.round,promises:[...s.promises],actions,...r});n.phase='reveal';return n;}
function next(s){if(s.phase!=='reveal')throw Error('공개 단계 오류');const n=structuredClone(s);if(n.round===6){n.phase='result';return n;}n.round++;return prepare(n);}
function result(s){return {rank:1+s.scores.filter(v=>v>s.scores[0]).length,tied:s.scores.filter(v=>v===s.scores[0]).length>1,score:s.scores[0],kept:s.history.filter(h=>h.promises[0]===h.actions[0]).length,deltas:s.history.map(h=>h.deltas[0])};}
// 저장은 행동 이력을 재실행하여 점수·비밀 봇 행동까지 검증한다.
function validate(s){try{if(!s||s.version!==2||!validDate(s.date)||!['daily','practice'].includes(s.mode)||!Array.isArray(s.history)||s.history.length>6)return false;let n=create(s.date,s.mode);for(const h of s.history){n=promise(n,h.promises[0]);n=act(n,h.actions[0]);if(s.history.length>n.round||s.phase!=='reveal')n=next(n);}if(n.phase==='promise'&&s.phase==='action')n=promise(n,s.promises[0]);const fields=['version','date','mode','round','phase','scores','history','promises','committedBotActions'];return fields.every(k=>JSON.stringify(n[k])===JSON.stringify(s[k]));}catch{return false;}}
const api={A,hash,rng,day,validDate,shift,seed,condition,score,best,bot,create,promise,act,next,result,validate};if(typeof module!=='undefined')module.exports=api;else root.PS=api;
})(globalThis);
