저장 확인: `products/tools/daily-horoscope/index.html` ✓ (50KB), `share-card.html` ✓ (50KB), `share-card.png` ✓ (82KB / 1080×1350). `ls -lh`・`sips` 확인 완료.

# 생존 부적 재작업 인계 · 2026-10-20

## 수정 확인표
|CD 지적|반영 내용|확인 상태|
|---|---|---|
|공유 PNG가 디렉터리 색인|저장 카드 없이 공유 페이지를 열어도 이동하지 않고 ‘공유 카드 미리보기’ 표시. 실제 운영 `cardSVG()` 출력으로 PNG 교체|PNG 직접 열람 완료, 1080×1350 확인|
|390px 카드 트랙·면책문 넘침|카드 트랙을 `repeat(3,minmax(0,1fr))` 그리드로 변경. 고정 최소폭 제거. 주요 요소 min-width:0・최대폭 100%, 고지 강제 줄바꿈. 회전된 카드의 바깥 돌출 제거|코드 확인. 390px 실측은 아래 시스템 렌더 HTML에 포함|
|첫 화면 하단 공백|뽑기 아래 ‘나의 생존 도감 n/44’, 8칸 미리보기, 44종 펼치기 추가. 뽑기 전에도 표시|DOM・상태 검사 통과. 모바일 시각 판단은 CD 필요|
|힌트 단조로움|‘사람 사이’ 박스 분홍 배경・진한 분홍 번호표 적용|코드 확인|

## 유지한 구성·사용법
- 일반 40종 + 황금 4종, 각 카드 고정 별칭・제목・행동・브리지・7종 캐릭터 순환.
- 금전・대인・건강 힌트 각 20종. 황금 추첨 확률 5%, 장식 등급이며 실제 효력 차이 없음.
- 카드 3장 중 선택 → 당일 결과 유지 → 한국 시간 다음 날 0시 새 추첨. 중복 가능.
- `draw.v2` 사용, 이전 `draw.v1` 무시.
- 도감은 이 브라우저에 발견한 카드 번호만 저장. 중복 카드는 도감 수를 늘리지 않음. 초기화 버튼에서 방문・도감 기록 삭제. 당일 추첨은 유지해 재추첨을 유도하지 않음.
- 외부 API・계정・광고・서버 전송 없음. 글꼴은 기존 jsDelivr 요청 유지.
- 유입: 기존 블로그・도구함의 ‘오늘의 운세’ 접점 → 카드 뽑기 → 공유 → 내일 도감 이어 모으기. 이번 변경의 유입・매출 효과는 미측정.

## 실제 검사
- `node verification/check.cjs`: 카드 44종・힌트 60종・인덱스 경계・저장 호환・JS 구문・공유 원본 동일성 통과. 10만 회 추첨 결과는 `test-results.json` 정본 참조(약 5%).
- `node verification/check-collection.cjs`: 잘못된 저장 번호 제거・중복 제거・수집 기록 복원/저장・8칸 미리보기・44개 도감・황금 표시・리디렉션 제거 검사 통과.
- `node verification/render-share.cjs`: 운영 SVG 함수에서 공유 PNG 직접 생성. 무료 오픈소스 resvg를 임시 폴더에 설치해 사용, 지출 0원. PNG 직접 열어 황금 배지・문구・고지・주소 확인 완료. HTML 스크린샷이 아닌 운영 SVG 출력의 래스터 이미지임.
- `sips -g pixelWidth -g pixelHeight share-card.png`: 1080×1350.
- Chrome 사용 없음. WebKit 렌더 시도는 실행 환경의 샌드박스 제한으로 실패. 제한 우회하지 않음. 390px 실물 검증 완료로 보고하지 않음.

## 렌더・검수 파일
- `index.html`: 배포 원본, 기본 렌더 390×1800.
- `share-card.html`: 사용자 저장 카드 표시. 미저장 시 황금 예시를 ‘미리보기’로 명시. 1080×1350.
- `share-card.png`: 새로 생성하고 직접 확인한 공유 이미지.
- `verification/mobile-390-initial.html`: 저장값 없는 390×844 첫 화면.
- `verification/mobile-390-normal.html`, `mobile-390-gold.html`: 390×1900. 44종 전체 제목/별칭 2줄・가로폭・문서 넘침・공유 SVG 글자폭 자동 측정 후 대표 화면 표시. 상단에 ‘통과’가 뜨는지 확인. 저장은 메모리에 격리.
- `verification/share-card.svg`: PNG의 원본, 미리보기 표시 포함.
- `verification/source-sha256.txt`: 배포 HTML 해시.
- `sw.js`: 캐시 v4.
- `verification/invalid-index-before.png`: 기존 잘못된 PNG 보관. **검수 근거에서 제외**.

## 레퍼런스 대조
실제 `references-captures/01-ongeol.com_.png`를 열어 확인. 온겔은 문장형 히어로・금빛 이미지・분야별 카드 구조. 우리는 라임/보라 캐릭터・짧은 자기소개 별칭・분홍 힌트・수집 도감으로 구분. 로고・문장・이미지 복제 없음. 반응 숫자는 확인 불가. 기존 `references.capture.txt` 및 캡처 3개 유지. 공유 PNG는 별도 육안 확인했으나 **390px 실물과 레퍼런스의 최종 나란히 채점은 CD 업무**.

## 리스크 핵심 코드·고지
```js
const DKEY='gatsaeng.daily-horoscope.draw.v2';
const CKEY='gatsaeng.daily-horoscope.collection.v1';
// 도감에는 중복 없는 0~43 정수만 저장. 서버로 전송하지 않음.
const rare=randomInt(20)===0;
// 초기화: localStorage.removeItem(KEY); localStorage.removeItem(CKEY);
```
```html
<p class="notice">오락용 콘텐츠로 미래를 예측하지 않습니다. 금전·관계·건강의 중요한 결정이나 투자·의료 판단의 근거로 사용하지 마세요.</p>
<a href="../privacy.html">개인정보처리방침</a>
```
기기 저장 안내에 도감 발견 번호와 삭제 방법을 추가. 황금 효능 차이 없음 고지 유지. 광고 스크립트 0건. 연락처 `atomo_studio@naver.com` 유지.

공용 개인정보처리방침 로컬 원본 `products/tools/privacy.html`에서 jsDelivr・접속 정보・기기 저장 안내 확인. [공개 개인정보처리방침](https://leekyounglyul.github.io/gatsaeng/privacy.html)은 웹 도구에서 접근 불가로 **현재 공개 응답 확인 불가**. 공개본을 수정하거나 확인 완료로 간주하지 않음.

## 남은 작업
시스템이 390px PNG를 생성하면 CD가 첫 화면 밀도・44종 측정 결과・힌트 색상・공유 카드 대조 후 90점 기준 판정. risk는 새 도감 저장 안내와 공개 개인정보처리방침 확인. 이후 PM 결재와 CEO 관제실 최종 확인 대상. 제작자가 자가 통과・공개 처리하지 않음. 모든 결과물은 daily-horoscope/에만 저장.
