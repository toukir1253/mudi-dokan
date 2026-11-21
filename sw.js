/* অফলাইন সার্ভিস ওয়ার্কার: প্রথমবার ইন্টারনেটে খুললে অ্যাপ ফোনে জমা হয়, এরপর ইন্টারনেট ছাড়াই খোলে */
const CACHE = 'mudi-dokan-v3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && (k.startsWith('mudi-pos-') || k.startsWith('mudi-dokan-'))).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    if (req.mode === 'navigate') {
      try { const r = await fetch(req); if (r && r.ok) c.put('./index.html', r.clone()); return r; }
      catch (_) { return (await c.match('./index.html')) || (await c.match('./')) || Response.error(); }
    }
    const hit = await c.match(req, { ignoreSearch: true }); if (hit) { fetch(req).then(r => { if (r && r.ok) c.put(req, r); }).catch(() => { }); return hit; }
    try { const r = await fetch(req); if (r && r.ok) c.put(req, r.clone()); return r; } catch (_) { return Response.error(); }
  })());
});
