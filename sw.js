// Offline support: keeps the app working with no signal (e.g. underground parking).
const CACHE="car-expense-v28";
const RETIRED=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Car Expense Log</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f4ee;color:#142c2b;font:16px/1.6 system-ui,sans-serif;padding:24px;box-sizing:border-box}
main{max-width:420px;display:flex;flex-direction:column;gap:18px;text-align:center}h1{font-size:20px;margin:0}p{margin:0}.fa{direction:rtl}</style></head>
<body><main><h1>Car Expense Log</h1>
<p>This app is no longer available. You can delete it from your home screen.</p>
<p>Cette application n'est plus disponible. Vous pouvez la retirer de votre écran d'accueil.</p>
<p class="fa">این اپ دیگر در دسترس نیست. می‌توانید آن را از صفحهٔ گوشی حذف کنید.</p></main></body></html>`;
const SHELL=["./","./index.html","./manifest.webmanifest","./vendor/jspdf.umd.min.js","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png","./icons/icon-maskable-512.png","./brand/bizkonic.mp4"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const keep=(req,res)=>{if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res};
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;const url=new URL(req.url);
  if(req.mode==="navigate"){e.respondWith(fetch(req,{cache:"no-cache"}).then(r=>{
    // Site switched off (GitHub Pages set to None or repository deleted): retire the app on this phone.
    if(r.status===404){e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))).then(()=>self.registration.unregister()));
      return new Response(RETIRED,{headers:{"content-type":"text/html; charset=utf-8"}})}
    return keep("./index.html",r)}).catch(()=>caches.match("./index.html")));return}
  if(url.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>keep(req,r))))}
});
