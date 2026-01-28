const CACHE_NAME='stepwise-cache-v1';
const ASSETS=[
'./','./index.html','./intake.html','./assessment.html','./results.html','./recommend.html','./about.html','./privacy.html','./terms.html','./404.html',
'./manifest.json','./sw.js',
'./assets/css/stepwise.css',
'./assets/js/ui.js','./assets/js/intake.js','./assets/js/assessment.js','./assets/js/results.js','./assets/js/recommender.js',
'./assets/data/rules.json','./assets/data/questions.json'
];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE_NAME);await c.addAll(ASSETS);self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.map(k=>k!==CACHE_NAME?caches.delete(k):null));self.clients.claim();})());});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith((async()=>{
    const c=await caches.open(CACHE_NAME);
    const cached=await c.match(e.request);
    if(cached)return cached;
    try{
      const fresh=await fetch(e.request);
      if(fresh&&fresh.status===200&&fresh.type==='basic')c.put(e.request,fresh.clone());
      return fresh;
    }catch(err){
      const u=new URL(e.request.url);
      if(u.origin===location.origin){
        return (await c.match('./index.html'))||Response.error();
      }
      return Response.error();
    }
  })());
});