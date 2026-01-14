const CACHE_NAME = 'closy-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './feed.html',
  './feed-friends.html',
  './feed-following.html',
  './my-closet.html',
  './outfits.html',
  './planner.html',
  './styles/styles.css',
  './header.js',
  './button.js',
  './clothing.js',
  './feed.js',
  './outfit.js',
  './outfits.js',
  './planner.js',
  './Bilder/ClosyLogo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // only cache GET

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // same-origin only

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
