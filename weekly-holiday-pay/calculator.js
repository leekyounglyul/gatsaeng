/* 순수 계산: 시간은 소수 둘째 자리까지, 시급은 원 단위 */
(function(root){
function calculate(v){
 const errors={};const n={};
 for(const key of ['wage','hours','average']){
  const s=String(v[key]??'').trim();
  if(!/^\d+(?:\.\d{1,2})?$/.test(s)){errors[key]='숫자를 입력하세요. 시간은 소수 둘째 자리까지 가능합니다.';continue;}
  n[key]=Number(s);
  if(!Number.isFinite(n[key]) || (key==='wage' ? n[key]<=0 || n[key]>1000000 || !Number.isInteger(n[key]) : n[key]<0 || n[key]>40)) errors[key]=key==='wage'?'시급은 1~1,000,000원의 정수로 입력하세요.':'시간은 0~40 사이로 입력하세요. 40시간 초과는 지원 범위 밖입니다.';
 }
 if(Object.keys(errors).length)return {state:'invalid',errors,reason:'입력값을 고쳐 주세요. 이전 결과는 표시하지 않습니다.'};
 if(v.scope!=='yes')return {state:'unknown',reason:v.scope==='unknown' && v.attendance==='unknown'?'개근 여부와 계산 범위, 두 항목을 모두 선택해 주세요. 확인 전에는 수당과 주급을 표시하지 않습니다.':'계산 범위 확인이 필요합니다. 범위 밖 근로조건은 일반 산식으로 확정하지 않습니다.'};
 if(n.hours!==n.average)return {state:'unknown',reason:'이번 주와 평균 시간이 다릅니다. 변동 일정은 4주 총 소정시간과 통상근로일수로 별도 확인해야 합니다.'};
 if(v.attendance!=='yes' && v.attendance!=='no')return {state:'unknown',reason:'개근 여부를 확인해 주세요. 모르는 상태에서는 수당과 주급을 계산하지 않습니다.'};
 if(n.average<15)return {state:'excluded',holiday:0,reason:'평균 주 15시간 미만으로 법정 주휴 적용 대상에서 제외됩니다. 별도 약정에 따른 지급은 확인하세요.'};
 if(v.attendance==='no')return {state:'absent',holiday:0,reason:'미개근 입력 기준 주휴수당은 0원입니다. 실제 근로시간이 없어 결근 주의 주급은 계산하지 않습니다.'};
 const holidayHours=n.hours/40*8;const holiday=holidayHours*n.wage;const base=n.hours*n.wage;
 return {state:'eligible',holidayHours,holiday,base,total:base+holiday,reason:'입력한 조건에 따른 예상액입니다. 실제 지급액은 근로계약과 급여명세서를 함께 확인하세요.'};
}
function monthly(wage,hours,withHoliday=true){const paid=hours+(withHoliday&&hours>=15?hours/5:0);return wage*(hours===40&&withHoliday?209:paid*365/7/12);}
root.minimumWages={2026:10320};root.monthly=monthly;root.calculate=calculate;
})(typeof module==='object'?module.exports:window);
