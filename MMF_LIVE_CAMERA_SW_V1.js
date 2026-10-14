'use strict';
const CACHE_NAME='mmfv-camera-shell-v1';
const SHELL='./MMF_LIVE_CAMERA_V1.html';

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.add(new Request(SHELL,{cache:'reload'})))
      .catch(()=>{})
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME&&k.startsWith('mmfv-camera-shell-')).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||event.request.mode!=='navigate') return;
  event.respondWith(
    fetch(event.request)
      .then(response=>{
        if(response&&response.ok){
          const clone=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(event.request,clone)).catch(()=>{});
        }
        return response;
      })
      .catch(async()=>{
        const cache=await caches.open(CACHE_NAME);
        return (await cache.match(event.request,{ignoreSearch:true})) ||
               (await cache.match(SHELL,{ignoreSearch:true})) ||
               new Response('Camera Module belum pernah dibuka online pada perangkat ini.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
      })
  );
});
