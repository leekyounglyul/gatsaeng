(function(){
'use strict';
const C=DailyThree,$=id=>document.getElementById(id);
let state=C.empty(),today=C.dateKey(),corrupt=false,saveOK=true,editing=false,editIds=[],deferredInstall=null;
function status(text){$('status').textContent=text;}
function warn(text){$('storage-warning').hidden=!text;$('storage-warning').textContent=text;}
function load(){try{const raw=localStorage.getItem(C.KEY);state=raw?C.validate(JSON.parse(raw)):C.empty();}catch(e){state=C.empty();saveOK=false;try{corrupt=!!localStorage.getItem(C.KEY);}catch(_){}warn(corrupt?'저장된 기록을 읽을 수 없어요. 기존 데이터는 덮어쓰지 않아요. 정상 백업을 가져오거나 전체 삭제 후 다시 시작해 주세요.':'이 브라우저에 저장할 수 없어 현재 화면에서만 사용할 수 있어요. 화면을 닫기 전에 백업을 내보내세요.');}}
function save(){if(corrupt){saveOK=false;return false;}try{localStorage.setItem(C.KEY,JSON.stringify(state));saveOK=true;warn('');return true;}catch(e){saveOK=false;warn('이 브라우저에 저장할 수 없어 현재 화면에서만 사용할 수 있어요. 화면을 닫기 전에 백업을 내보내세요.');return false;}}
function dateLabel(key){return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',weekday:'short'}).format(new Date(key+'T03:00:00Z'));}
function syncDate(){const next=C.dateKey();if(next===today)return false;today=next;editing=false;C.ensureDay(state,today);save();render();status('한국 시간 기준으로 날짜가 바뀌었어요. 오늘 체크를 새로 시작해요.');return true;}
function openEditor(){editing=true;editIds=state.habits.map(h=>h.id);for(let i=0;i<3;i++)$('habit-'+(i+1)).value=state.habits[i]?.name||'';renderEditor();$('habit-1').focus();}
function renderEditor(){const isNew=!state.habits.length;$('editor').hidden=!editing&&!isNew;$('edit').hidden=isNew||editing;$('cancel-edit').hidden=isNew;$('editor-title').textContent=isNew?'내가 이어갈 습관':'오늘부터 습관 수정';$('editor').querySelector('[type=submit]').textContent=isNew?'이 습관으로 시작':'수정 저장';}
function render(){
 $('hero').setAttribute('data-ready',String(state.habits.length>0));
 const d=state.days[today]||{habits:[],checked:[]},s=C.streak(state,today);
 $('date').dateTime=today;$('date').textContent=dateLabel(today)+' · KST';
 $('count').textContent='';$('count').append(document.createTextNode(String(d.checked.length)+' '));const small=document.createElement('small');small.textContent='/ '+d.habits.length;$('count').append(small);
 $('card-count').textContent=d.checked.length+' / '+d.habits.length;
 $('card-date').textContent=dateLabel(today)+' · KST';
 $('card-motto').textContent=d.checked.length?'대단한 하루는 몰라도, 해낸 건 있지.':'거창하지 않아도, 하나부터 해보지.';
 $('fill').style.width=(d.habits.length?d.checked.length/d.habits.length*100:0)+'%';
 $('encourage').textContent=!d.habits.length?'습관을 정하고 첫 체크를 남겨 보세요.':d.checked.length===d.habits.length?'오늘의 작은 실천, 모두 마쳤어요.':d.checked.length?'한 개도 충분해요. 나머지는 내 속도로.':'가장 가벼운 하나부터 시작해 볼까요?';
 $('habits').replaceChildren();for(const h of d.habits){const checked=d.checked.includes(h.id),button=document.createElement('button');button.type='button';button.className='habit';button.dataset.id=h.id;button.setAttribute('aria-pressed',String(checked));button.setAttribute('aria-label',h.name+' · '+(checked?'완료, 누르면 취소':'미완료, 누르면 체크'));for(const [cls,text] of [['check',checked?'✓':''],['habit-name',h.name],['habit-state',checked?'완료':'체크']]){const el=document.createElement('span');el.className=cls;el.textContent=text;if(cls==='check')el.setAttribute('aria-hidden','true');button.append(el);}button.addEventListener('click',()=>{if(syncDate())return;C.toggle(state,today,h.id);save();render();const replacement=[...$('habits').children].find(b=>b.dataset.id===h.id);replacement?.focus();status(checked?'체크를 취소했어요.':saveOK?'체크했어요. 이 기기에 저장했어요.':'체크했어요. 기기 저장은 사용할 수 없어요.');});$('habits').append(button);}
 $('streak-number').textContent=String(s.current);const unit=document.createElement('small');unit.textContent='일';$('streak-number').append(unit);
 $('streak-label').textContent=s.today?'오늘까지 연속 참여':s.current?'오늘 이어가면 '+(s.current+1)+'일':'첫 참여를 기다려요';$('best').textContent=s.best+'일';
 $('week').replaceChildren();for(const w of C.week(state,today)){const cell=document.createElement('div');cell.className='day'+(w.date===today?' today':'');cell.dataset.active=String(w.count>0);cell.setAttribute('aria-label',w.date+' '+(w.mark==='·'?'기록 없음':w.count+'/'+w.total+'개, '+(w.count?'참여':'미참여')));const date=document.createElement('span');date.className='day-date';date.textContent=w.date===today?'오늘':w.date.slice(5).replace('-','/');const stamp=document.createElement('span');stamp.className='stamp';stamp.textContent=w.mark;stamp.setAttribute('aria-hidden','true');const n=document.createElement('span');n.textContent=w.mark==='·'?'—':w.count+'/'+w.total;cell.append(date,stamp,n);$('week').append(cell);}
 $('tomorrow').textContent=s.today?'오늘 남긴 실천, 내일은 새 체크로 이어가요.':'내일 찾을 자리, 오늘 한 번 만들어 봐요.';
 const visits=state.visits.filter(k=>k<=today&&k>=C.offset(today,-13)).length,full=Object.entries(state.days).filter(([k,d])=>k<=today&&d.habits.length&&d.checked.length===d.habits.length).length;
 $('local-stats').textContent='이 기기의 최근 14일 방문 '+visits+'일 · 전체 달성 '+full+'일. 회사로 전송되지 않는 내 기록이에요.';
 if(!$('share-fallback').hidden)$('share-text').value=C.shareText(state,today);
 renderEditor();
}
function fallback(){syncDate();$('share-text').value=C.shareText(state,today);$('share-fallback').hidden=false;$('share-text').focus();$('share-text').select();}
load();C.ensureDay(state,today);save();render();
$('edit').addEventListener('click',openEditor);$('cancel-edit').addEventListener('click',()=>{editing=false;renderEditor();$('edit').focus();});
$('editor').addEventListener('submit',event=>{event.preventDefault();if(syncDate())return;const habits=[];for(let i=0;i<3;i++){const name=$('habit-'+(i+1)).value.trim();if(name)habits.push({id:editIds[i]||('h_'+Date.now().toString(36)+'_'+i),name});}if(!habits.length){status('습관을 하나 이상 적어 주세요.');$('habit-1').focus();return;}C.edit(state,today,habits);editing=false;save();render();$('habits').firstElementChild?.focus();status(saveOK?'습관을 저장했어요. 끝낸 일부터 체크해 보세요.':'습관을 정했어요. 기기 저장은 사용할 수 없어요.');});
$('share').addEventListener('click',async()=>{syncDate();const text=C.shareText(state,today);if(navigator.share){try{await navigator.share({title:'오늘의 습관 3개',text});status('공유 창을 열었어요.');}catch(e){if(e.name==='AbortError'){status('공유를 취소했어요.');return;}fallback();status('공유 창 대신 텍스트를 복사해 주세요.');}}else fallback();});
$('copy').addEventListener('click',async()=>{syncDate();const text=C.shareText(state,today);$('share-text').value=text;try{await navigator.clipboard.writeText(text);status('공유할 결과를 복사했어요.');}catch(e){$('share-text').focus();$('share-text').select();status('자동 복사를 사용할 수 없어요. 선택한 내용을 직접 복사해 주세요.');}});
$('export').addEventListener('click',()=>{syncDate();const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='daily-three-'+today+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status('백업 파일 다운로드를 요청했어요. 파일에는 습관명도 포함돼요.');});
$('import-button').addEventListener('click',()=>$('import').click());
$('import').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>8*1024*1024)throw Error('8MB 이하의 JSON 파일만 가져올 수 있어요.');const next=C.validate(JSON.parse(await file.text()));if(!confirm('가져온 백업으로 이 도구의 현재 습관과 기록을 덮어쓸까요? 기존 기록이 필요하면 먼저 내보내세요.'))return;state=next;corrupt=false;today=C.dateKey();editing=false;C.ensureDay(state,today);save();render();status(saveOK?'백업을 가져와 저장했어요.':'백업을 열었지만 기기에 저장할 수 없어요.');}catch(e){status('가져오지 않았어요. '+(e instanceof SyntaxError?'올바른 JSON 파일인지 확인해 주세요.':e.message));}finally{event.target.value='';}});
$('delete').addEventListener('click',()=>{if(!confirm('이 도구의 습관·체크·방문일을 모두 삭제할까요? 백업 없이는 복구할 수 없어요.'))return;try{localStorage.removeItem(C.KEY);corrupt=false;saveOK=true;warn('');state=C.empty();today=C.dateKey();editing=false;editIds=[];for(let i=1;i<=3;i++)$('habit-'+i).value='';$('share-fallback').hidden=true;render();status('이 도구의 기록을 모두 삭제했어요. 다음 사용부터 새 기록을 시작해요.');}catch(e){status('기록을 삭제하지 못했어요. 브라우저의 사이트 데이터 설정을 확인해 주세요.');}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('install').hidden=false;});
$('install').addEventListener('click',async()=>{if(!deferredInstall)return;const prompt=deferredInstall;deferredInstall=null;$('install').hidden=true;try{await prompt.prompt();await prompt.userChoice;}catch(e){status('설치 메뉴를 사용할 수 없어요. 홈 화면 추가 방법을 확인해 주세요.');}});
window.addEventListener('appinstalled',()=>{$('install').hidden=true;status('홈 화면에 추가했어요. 내일도 여기에서 이어가요.');});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncDate();});window.addEventListener('focus',syncDate);
function dateTimer(){const until=Date.parse(C.offset(C.dateKey(),1)+'T00:00:00+09:00')-Date.now();setTimeout(()=>{syncDate();dateTimer();},Math.max(50,Math.min(60000,until+30)));}dateTimer();
window.addEventListener('storage',e=>{if(e.key!==C.KEY)return;try{state=e.newValue?C.validate(JSON.parse(e.newValue)):C.empty();corrupt=false;today=C.dateKey();editing=false;if(!state.habits.length){editIds=[];for(let i=1;i<=3;i++)$('habit-'+i).value='';$('share-fallback').hidden=true;}render();status('다른 탭의 변경을 반영했어요.');}catch(_){warn('다른 탭의 기록을 읽지 못했어요. 정상 백업을 가져오거나 새로고침해 주세요.');corrupt=true;}});
if('serviceWorker' in navigator&&location.protocol!=='file:'){navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(()=>navigator.serviceWorker.ready).then(()=>{$('offline').textContent='오프라인 사용 준비가 됐어요. 이 브라우저에서 다음에도 열고 체크할 수 있어요. 브라우저가 저장 공간을 비우면 다시 연결해야 해요.';}).catch(()=>{$('offline').textContent='오프라인 준비를 마치지 못했어요. 온라인에서 사용하거나 다시 연결해 주세요. 기록 저장과 홈 화면 설치는 별도 기능이에요.';});}
})();
