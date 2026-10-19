(function(root){
const day=86400000;
function calculate(v){
 const year=Number(v.year),cc=Number(v.cc),month=Number(v.month),rate=Number(v.rate),made=Number(v.made);
 const m=/^(\d{4})-(\d{2})$/.exec(v.registered||'');
 if(!Number.isInteger(year)||year<2026||year>2028||!m||!Number.isInteger(cc)||cc<1||cc>10000||![1,3,6,9].includes(month)||String(v.rate).trim()===''||!Number.isFinite(rate)||rate<0||rate>10||!Number.isInteger(made)||made<1900||made>year)return {error:'배기량 1~10,000cc, 등록 연월, 제작연도, 공제율 0~10%를 확인하세요.'};
 const ry=+m[1],rm=+m[2];
 if(rm<1||rm>12||ry<1900||ry>=year||made>ry)return {error:'과세연도 전부터 보유한 차량만 지원합니다. 등록연도는 과세연도보다 이전, 제작연도는 등록연도 이하여야 합니다.'};
 if(v.type!=='private')return {error:'비영업용 내연기관 승용차만 지원합니다. 전기·수소차, 영업용, 화물·승합·특수차는 위택스에서 확인하세요.'};
 // 자동차관리법 시행령 제3조: 제작연도에 미등록한 차량은 제작연도 말일 기산
 const startYear=made===ry?ry:made, startMonth=made===ry?rm:12;
 const age1=year-startYear+(startMonth<=6?1:0),age2=year-startYear+1;
 const reductions=[age1,age2].map(a=>Math.min(0.5,Math.max(0,(a-2)*0.05)));
 const unit=cc<=1000?80:cc<=1600?140:200,raw=cc*unit;
 const halves=reductions.map(r=>raw/2*(1-r));const tax=halves[0]+halves[1],education=tax*0.3,annual=tax+education;
 const days=(Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/day;
 const remaining=(Date.UTC(year+1,0,1)-Date.UTC(year,month,1))/day;
 const discount=annual*remaining/days*rate/100;
 return {year,unit,raw,age1,age2,reductions,halves,tax,education,annual,days,remaining,rate,discount,pay:annual-discount,month,scenario:year!==2026};
}
root.carTax={calculate};
})(typeof module==='object'?module.exports:window);
