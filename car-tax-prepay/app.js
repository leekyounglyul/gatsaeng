const $=id=>document.getElementById(id),money=n=>Math.round(n).toLocaleString('ko-KR')+'원';
const keys=['year','type','cc','registered','made','month','rate'];let current=null;
function setYear(){const official=$('year').value==='2026';$('rate').value=official?'5':'';$('rate').readOnly=official;$('rateHelp').textContent=official?'2026년 확인 기준: 잔여기간 5% 적용':'확정 공제율 확인 불가 · 직접 입력한 가정으로만 계산합니다.';update(false);}
function update(showErrors=false){const v=Object.fromEntries(keys.map(k=>[k,$(k).value]));current=carTax.calculate(v);$('fallback').hidden=true;$('notice').textContent='';$('error').textContent=current.error&&showErrors?current.error:'';$('numbers').hidden=!!current.error;
 if(current.error){$('status').textContent='입력 조건 확인 필요';$('pay').textContent='—';$('saving').textContent=current.error;return;}
 const r=current;$('status').textContent=r.scenario?'가정한 연납 후 연간 부담':'연납 후 예상 연간 부담';$('pay').textContent=money(r.pay);$('saving').textContent=`정기납 대비 ${money(r.discount)} 절약 (${(r.discount/r.annual*100).toFixed(2)}%)${r.scenario?' · 확정액 아님':''}`;
 const rows=[['차령 경감 전 본세',money(r.raw)],['1·2기 차령 경감률',r.reductions.map(x=>Math.round(x*100)+'%').join(' / ')],['경감 후 연 본세',money(r.tax)],['지방교육세 (30%)',money(r.education)],['정기납 연간 합계',money(r.annual)],['연납 공제액',money(r.discount)]];
 $('rows').innerHTML=rows.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');$('formula').textContent=`${v.cc}cc × ${r.unit}원 = ${money(r.raw)}. 1기 차령 ${r.age1}년 / 본세 ${money(r.halves[0])}, 2기 차령 ${r.age2}년 / 본세 ${money(r.halves[1])}. 공제: ${money(r.annual)} × ${r.remaining}/${r.days}일 × ${r.rate}%. 공제기간 ${r.month+1}월 1일~12월 31일. 표시만 원 단위 반올림.`;
}
function resultText(){if(!current||current.error)return null;const r=current;return `갓생 연구소 자동차세 연납 ${r.scenario?'가정 계산':'예상 계산'}\n${r.year}년 / ${$('cc').value}cc / 최초등록 ${$('registered').value} / 제작 ${$('made').value}년\n${r.month}월 연납 / 잔여기간 공제율 ${r.rate}%${r.scenario?' (직접 입력 가정·확정 아님)':''}\n정기납 연간 ${money(r.annual)} → 연납 후 연간 ${money(r.pay)}\n절약 ${money(r.discount)} / ${r.remaining}/${r.days}일\n6·9월 결과는 기존 1기분 포함 연간 합계. 실제 고지서 확인 필요.\n2026-10-18 확인\nhttps://leekyounglyul.github.io/gatsaeng/car-tax-prepay/`;}
async function copy(text){try{await navigator.clipboard.writeText(text);$('notice').textContent='복사했습니다.';}catch(e){$('fallback').hidden=false;$('fallback').value=text;$('fallback').focus();$('fallback').select();$('notice').textContent='아래 내용을 직접 복사하세요.';}}
$('form').onsubmit=e=>{e.preventDefault();update(true);};keys.forEach(k=>$(k).addEventListener('input',()=>update(false)));$('year').onchange=setYear;
$('copy').onclick=()=>{const text=resultText();if(text)copy(text);else $('notice').textContent='조건을 입력해 먼저 계산하세요.';};
$('share').onclick=async()=>{const text=resultText();if(!text){$('notice').textContent='조건을 입력해 먼저 계산하세요.';return;}if(!navigator.share)return copy(text);try{await navigator.share({title:'자동차세 연납 비교',text});}catch(e){if(e.name!=='AbortError')await copy(text);}};
update(false);
