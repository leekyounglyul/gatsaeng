"""CD가 PNG 상단 증거를 확인한 receipt.json만 허용. 파일 시각은 판본 증거가 아님."""
from pathlib import Path
import hashlib,json,sys
p=Path(__file__).parent
sha=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
receipt=p/'render-receipt.json'
if not receipt.exists():
 sys.exit('미연결 유지: CD의 render-receipt.json 필요. 생성 시각만으로 연결하지 않음.')
d=json.loads((p/'verification.json').read_text());r=json.loads(receipt.read_text())
for a in d['artifacts']:
 item=next((v for v in r['artifacts'] if v['html']==a['html']),None)
 if not item: continue
 assert item['html_sha256']==a['html_sha256']==sha(p/a['html'])
 assert item['png_sha256']==sha(p/a['png'])
 assert item['visible_source_hash']==d['source_sha256'][:16]
 assert item['viewport']==item['scroll_width']==a['expected_width']
 assert item['overflow_count']==0 and item['visual_check_pass'] is True
 a.update(png_sha256=item['png_sha256'],png_matches_current_html=True,status='CD가 PNG 상단 입력 해시·폭·넘침 및 실물을 확인',receipt=item)
(p/'verification.json').write_text(json.dumps(d,ensure_ascii=False,indent=2))
print('제출된 검수 영수증 항목만 연결 완료')
