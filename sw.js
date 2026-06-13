const CACHE_VERSION = 'wedding-fbbf55a9';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './config.yaml',
  './styles/main.css',
  './scripts/theme.js',
  './scripts/main.js',
  './sw.js'
];

// Install - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => !n.startsWith(CACHE_VERSION)).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch - network-first for HTML, cache-first for images and static assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || !url.origin.includes(location.origin)) return;

  if (request.mode === 'navigate') {
    // HTML - network first, fall back to cached index
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
  } else if (request.destination === 'image') {
    // Images - cache first
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache =>
        cache.match(request).then(cached =>
          cached || fetch(request).then(res => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
        )
      )
    );
  } else {
    // CSS, JS, JSON - cache first
    event.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          }
          return res;
        })
      )
    );
  }
});

// Message handling for cache control
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') self.skipWaiting();
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
    );
  }
});
