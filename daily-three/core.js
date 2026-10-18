/* 오늘의 습관 3개 · 순수 날짜/기록 로직. 외부 의존성 없음. */
(function(root){
'use strict';
const KEY='gatsaeng.daily-three.v1';
function dateKey(now=new Date()) { return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now); }
function offset(key,n) { const d=new Date(key+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
function validDate(s){return typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s+'T00:00:00Z')) && new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
function empty(){return {version:1,habits:[],days:{},visits:[]};}
function copy(x){return JSON.parse(JSON.stringify(x));}
function habitsValid(list){return Array.isArray(list)&&list.length<=3&&new Set(list.map(h=>h.id)).size===list.length&&list.every(h=>h&&typeof h.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(h.id)&&typeof h.name==='string'&&h.name.trim().length>0&&h.name.length<=40);}
function validate(data){
 if(!data||data.version!==1||!habitsValid(data.habits)||!data.days||Array.isArray(data.days)||typeof data.days!=='object'||Object.keys(data.days).length>20000||!Array.isArray(data.visits)||data.visits.length>20000||!data.visits.every(validDate)) throw Error('지원하는 백업 형식이 아니에요.');
 const out=empty();out.habits=copy(data.habits);out.visits=[...new Set(data.visits)].sort();
 for(const [key,d] of Object.entries(data.days)){
  if(!validDate(key)||!d||!habitsValid(d.habits)||!Array.isArray(d.checked)||new Set(d.checked).size!==d.checked.length||!d.checked.every(id=>d.habits.some(h=>h.id===id))) throw Error('날짜 또는 체크 기록이 올바르지 않아요.');
  out.days[key]={habits:copy(d.habits),checked:[...d.checked]};
 }return out;
}
function ensureDay(state,key){if(!state.days[key]) state.days[key]={habits:copy(state.habits),checked:[]};if(!state.visits.includes(key))state.visits.push(key);return state.days[key];}
function edit(state,key,habits){if(!habitsValid(habits)||!habits.length)throw Error('습관을 1~3개 입력해 주세요.');const day=ensureDay(state,key);state.habits=copy(habits);day.habits=copy(habits);day.checked=day.checked.filter(id=>habits.some(h=>h.id===id));}
function toggle(state,key,id){const d=ensureDay(state,key);if(!d.habits.some(h=>h.id===id))return;d.checked=d.checked.includes(id)?d.checked.filter(x=>x!==id):[...d.checked,id];}
function participated(d){return !!d&&d.checked.length>0;}
function streak(state,key){let end=participated(state.days[key])?key:offset(key,-1),current=0;while(participated(state.days[end])){current++;end=offset(end,-1);}let best=0,run=0,prev=null;for(const k of Object.keys(state.days).filter(k=>k<=key).sort()){if(!participated(state.days[k])){run=0;prev=k;continue;}run=prev&&offset(prev,1)===k?run+1:1;best=Math.max(best,run);prev=k;}return {current,best,today:participated(state.days[key])};}
function week(state,key){return Array.from({length:7},(_,i)=>{const date=offset(key,i-6),d=state.days[date];return {date,mark:!d?'·':participated(d)?'●':'○',count:d?d.checked.length:0,total:d?d.habits.length:0};});}
function shareText(state,key){const d=state.days[key],s=streak(state,key);return `오늘의 습관 3개 · ${key.replaceAll('-','.') }\n오늘 ${d?d.checked.length:0}/${d?d.habits.length:state.habits.length}개 · ${s.today?'참여 '+s.current+'일째':'어제까지 연속 '+s.current+'일'}\n최근 7일  ${week(state,key).map(x=>x.mark).join(' ')}\n● 참여  ○ 미참여  · 기록 없음\n내일도 가볍게 이어가기\nhttps://leekyounglyul.github.io/gatsaeng/daily-three/`;}
const api={KEY,dateKey,offset,validDate,empty,validate,ensureDay,edit,toggle,streak,week,shareText};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DailyThree=api;
})(typeof globalThis!=='undefined'?globalThis:this);
