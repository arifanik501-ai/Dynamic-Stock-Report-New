const CACHE_NAME = 'mep-ledger-standalone-v1';
// Only real, referenced files are precached: a single 404 makes cache.addAll()
// reject and breaks the install step.
const urlsToCache = [
  './index.html',
  './app.css',
  './erp-topbar.css',
  './premium_clock.css',
  './premium_clock.js',
  './themes.js',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  './assets/avatar-male.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-first strategy with a filtered cache. Cross-origin traffic
// (Firebase/Google/Fonts) is never written to the cache.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFirebaseOrApi = /firebase|googleapis|gstatic|firebaseio/.test(url.hostname);

  if (!sameOrigin || isFirebaseOrApi) return; // let the browser handle it normally

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
