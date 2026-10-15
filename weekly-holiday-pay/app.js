const $=id=>document.getElementById(id);
const url='https://leekyounglyul.github.io/gatsaeng/weekly-holiday-pay/';
const money=n=>Math.round(n).toLocaleString('ko-KR')+'원';
const keys=['wage','hours','average','attendance','scope'];
let current;
function values(){return Object.fromEntries(keys.map(k=>[k,$(k).value]));}
function update(){
 const v=values();current=calculate(v);
 for(const k of keys.slice(0,3)){const e=current.errors?.[k]||'';$(k+'-error').textContent=e;$(k).setAttribute('aria-invalid',e?'true':'false');}
 $('status').textContent=({eligible:'예상 주휴수당',excluded:'법정 주휴 적용 제외',absent:'미개근 기준 주휴수당',invalid:'입력 확인 필요',unknown:'조건 확인 필요'})[current.state];
 $('holiday').textContent=current.holiday===undefined?'—':money(current.holiday);
 $('reason').textContent=current.reason+(Number(v.wage)>0 && Number(v.wage)<10320?' 입력 시급은 2026 최저시급보다 낮습니다. 최저임금 적용·감액 여부를 별도로 확인하세요.':'');
 $('numbers').hidden=current.state!=='eligible';
 if(current.state==='eligible'){
  $('holidayHours').textContent=Number(current.holidayHours.toFixed(6))+'시간';
  for(const k of ['base','total'])$(k).textContent=money(current[k]);
  $('formula').textContent=`주휴시간: ${v.hours} ÷ 40 × 8 = ${Number(current.holidayHours.toFixed(6))}시간 / 주휴수당: 주휴시간 × ${v.wage}원 / 기본 주급: ${v.hours} × ${v.wage}원 / 합계: 기본 주급 + 주휴수당`;
 }
 $('manual').hidden=true;$('notice').textContent='';
}
function resultText(){const v=values();return `갓생 연구소 주휴수당 계산
시급 ${v.wage}원 / 주 소정 ${v.hours}시간 / 4주 평균 주 ${v.average}시간
개근: ${$('attendance').selectedOptions[0].textContent}
범위: ${$('scope').selectedOptions[0].textContent}
${$('status').textContent}: ${current.holiday===undefined?'금액 미표시':money(current.holiday)}
${$('reason').textContent}`+(current.state==='eligible'?`
유급 주휴 ${Number(current.holidayHours.toFixed(6))}시간 / 기본 주급 ${money(current.base)} / 주휴 포함 ${money(current.total)} (세전·가산 제외·원 단위 반올림)`:'')+`
2026 적용 · 2026-10-16 확인
${url}`;}
async function copy(text){try{await navigator.clipboard.writeText(text);$('notice').textContent='복사했습니다.';}catch(e){$('manual').hidden=false;$('copytext').value=text;$('copytext').focus();$('copytext').select();$('notice').textContent='자동 복사가 지원되지 않습니다. 아래 내용을 직접 복사하세요.';}}
$('form').addEventListener('submit',e=>{e.preventDefault();update();if(current.state==='invalid'){const first=Object.keys(current.errors)[0];$(first).focus();}});
keys.forEach(k=>$(k).addEventListener('input',update));
$('copy').onclick=()=>copy(resultText());$('link').onclick=()=>copy(url);
$('share').onclick=async()=>{const text=resultText();if(!navigator.share){await copy(text);return;}try{await navigator.share({title:'주휴수당·주급 계산기',text});$('notice').textContent='공유 화면을 열었습니다.';}catch(e){if(e.name==='AbortError'){$('notice').textContent='공유를 취소했습니다. 결과 복사를 이용할 수 있어요.';}else{await copy(text);}}};
update();
