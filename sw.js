const CACHE='anilarper-shell-v4';
const CORE=['./','./index.html','./app-full.js','./app-discover.js','./app-parity.js','./app-backup.js','./app-reading.js','./app-home-library.js','./app-franchise.js','./app-mal-details.js','./app-shell.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(CORE);await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('anilarper-shell-')&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  const isAppShell=request.mode==='navigate'||/\.(?:html|js|css|webmanifest)$/.test(url.pathname);
  if(isAppShell){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(request,{cache:'no-store'});
        if(fresh.ok){const cache=await caches.open(CACHE);await cache.put(request,fresh.clone())}
        return fresh;
      }catch(error){
        const cached=await caches.match(request);
        if(cached)return cached;
        throw error;
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(request);
    if(cached)return cached;
    const response=await fetch(request);
    if(response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone())}
    return response;
  })());
});
