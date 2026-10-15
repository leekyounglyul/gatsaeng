// 배포 HTML을 수정한 뒤 실행: node sync-preview.cjs
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const hash=crypto.createHash('sha256').update(source).digest('hex');
const scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1].trim()+'\n');
for(const [i,name] of ['calculator.js','app.js'].entries())fs.writeFileSync(path.join(__dirname,name),scripts[i]);
const escaped=source.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
for(const width of [360,390])for(const state of ['initial','result']){
 const filename=state==='result'?`mobile-${width}.html`:`mobile-${width}-initial.html`;
 const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="render-size" content="${width}x7200"><title>${width}px ${state} 원본 검수</title><style>*{box-sizing:border-box}body{margin:0;width:${width}px;background:#EFE7DB;color:#2E2A25;font:12px/1.5 sans-serif}#diagnostic{padding:8px;min-height:110px;overflow-wrap:anywhere;border-bottom:1px solid #A0764A}iframe{display:block;border:0;width:${width}px;height:7000px}</style></head><body><div id="diagnostic">viewport 측정 중 · 이 문구가 남으면 검증 실패</div><iframe title="배포 원본 ${width}px ${state}" srcdoc="${escaped}"></iframe><script>
const frame=document.querySelector('iframe');
function check(){
 const w=frame.contentWindow,d=frame.contentDocument;
 ${state==='result'?"for(const id of ['attendance','scope'])d.getElementById(id).value='yes';d.getElementById('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));":''}
 const vw=w.innerWidth,sw=d.documentElement.scrollWidth;
 const outside=[...d.querySelectorAll('body *')].filter(e=>e.getClientRects().length&&(()=>{const r=e.getBoundingClientRect();return r.right>vw+1||r.left < -1;})()).map(e=>e.id||e.tagName.toLowerCase());
 const font=w.getComputedStyle(d.body).fontFamily;
 document.getElementById('diagnostic').textContent='${state==='initial'?'초기 상태':'표준 결과'} · 목표 ${width}px / 실제 '+vw+'px / 문서 '+sw+'px / '+(vw===${width}&&sw<=vw&&outside.length===0?'가로폭 통과':'가로폭 확인 필요: '+outside.join(', '))+' / 외부 viewport '+innerWidth+'px / '+font+' / 원본 SHA256 ${hash.slice(0,16)}';
}
frame.onload=()=>{check();frame.contentDocument.fonts.ready.then(check);};
<\/script></body></html>`;
 fs.writeFileSync(path.join(__dirname,'docs',filename),html);
}
fs.writeFileSync(path.join(__dirname,'docs','preview-source.json'),JSON.stringify({source:'index.html',sha256:hash,widths:[360,390],states:['initial','result'],note:'srcdoc는 배포 HTML과 바이트 단위 동일. 결과 상태만 부모가 폼 선택 후 submit.'},null,2)+'\n');
console.log('배포 원본에서 JS와 360·390px 초기/결과 렌더 입력 4개 동기화');
