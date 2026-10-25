const CACHE_NAME = 'mep-ledger-v17';
// Optimization: only real, referenced files are precached.
// A single 404 used to make cache.addAll() reject and break the install step.
// `app.css` is the extracted stylesheet — without it the page renders unstyled
// while offline, so it must be precached together with the HTML.
const urlsToCache = [
  './index.html',
  './app.css',
  './themes.js',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
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

// Network-first strategy with a filtered cache.
// Optimization: cross-origin API traffic (Firebase/Google/Fonts) is never
// written to the cache — that used to grow IndexedDB on every request and
// slow down every subsequent fetch.
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

