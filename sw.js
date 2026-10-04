const CACHE='wortschatz-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // app shell: network first for the page (to get updates), cache fallback offline
    if(req.mode==='navigate'){ e.respondWith(fetch(req).then(r=>{const cp=r.clone(); caches.open(CACHE).then(c=>c.put('./index.html',cp)); return r;}).catch(()=>caches.match('./index.html'))); return; }
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{const cp=n.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); return n;})));
    return;
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{const cp=n.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); return n;}).catch(()=>new Response('',{status:503}))));
  }
});
