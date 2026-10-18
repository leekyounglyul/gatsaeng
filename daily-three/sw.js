'use strict';
const CACHE='gatsaeng-daily-three-shell-v2';
const SHELL=['./','index.html','style.css','core.js','app.js','manifest.webmanifest','assets/icon.svg','assets/icon-180.png','assets/icon-192.png','assets/icon-512.png','assets/icon-maskable-512.png','assets/Pretendard-Regular.woff','assets/Pretendard-SemiBold.woff'];
const urls=SHELL.map(p=>new URL(p,self.registration.scope).href);
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(urls)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('gatsaeng-daily-three-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=new URL(e.request.url);if(!url.href.startsWith(self.registration.scope))return;
 if(e.request.mode==='navigate'){e.respondWith(caches.open(CACHE).then(async c=>(await c.match(new URL('index.html',self.registration.scope).href))||fetch(e.request)));return;}
 if(!urls.includes(url.href))return;
 e.respondWith(caches.open(CACHE).then(async c=>(await c.match(e.request))||fetch(e.request)));
});
