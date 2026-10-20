'use strict';
const PREFIX='promise-split-cache-',CACHE=PREFIX+'v2-7-mobile-grid';
const FILES=['./','./index.html','./engine.js','./app.js','./tokens.css','./style.css','./manifest.webmanifest','./assets/Pretendard-Regular.woff','./assets/Pretendard-SemiBold.woff','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable-512.png'];
// 업데이트는 게임 탭을 모두 닫은 뒤 활성화해 진행 중 판을 교체하지 않는다.
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url),scope=new URL(self.registration.scope);if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;event.respondWith(caches.open(CACHE).then(async cache=>{const hit=await cache.match(event.request,{ignoreSearch:true});if(hit)return hit;try{return await fetch(event.request);}catch(e){if(event.request.mode==='navigate')return cache.match('./index.html');throw e;}}));});
