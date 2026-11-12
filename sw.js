/* 냥이플 서비스워커 - 웹앱 설치용 (항상 네트워크 우선, 오프라인일 때만 저장해 둔 화면 사용) */
const CACHE = 'nyangiple-shell-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (req.mode === 'navigate' && res && res.ok) { const c = await caches.open(CACHE); c.put('./', res.clone()); }
      return res;
    } catch (err) {
      const c = await caches.open(CACHE);
      return (await c.match(req)) || (req.mode === 'navigate' && (await c.match('./'))) || Response.error();
    }
  })());
});
