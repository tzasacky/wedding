// Service Worker v2.0 - Advanced offline support with intelligent caching
const CACHE_VERSION = 'wedding-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Assets to cache immediately
const STATIC_ASSETS = [
  './',
  './index.html',
  './config.yaml',
  './sw.js'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fallback to cache
  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  },

  // Cache first, fallback to network
  cacheFirst: async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      throw error;
    }
  },

  // Stale while revalidate
  staleWhileRevalidate: async (request) => {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then(c => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    });
    
    return cachedResponse || fetchPromise;
  }
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.startsWith(CACHE_VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - intelligent routing
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (!url.origin.includes(location.origin)) {
    return;
  }
  
  // Route based on request type
  if (request.mode === 'navigate') {
    // HTML pages - network first
    event.respondWith(
      CACHE_STRATEGIES.networkFirst(request)
        .catch(() => caches.match('./index.html'))
    );
  } else if (request.destination === 'image') {
    // Images - cache first with separate cache
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache => {
        return cache.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
  } else if (url.pathname.endsWith('.yaml')) {
    // Config files - stale while revalidate
    event.respondWith(CACHE_STRATEGIES.staleWhileRevalidate(request));
  } else {
    // Everything else - cache first
    event.respondWith(CACHE_STRATEGIES.cacheFirst(request));
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'rsvp-sync') {
    event.waitUntil(syncRSVPs());
  }
});

// Periodic background sync for updates
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-check') {
    event.waitUntil(checkForUpdates());
  }
});

// Message handling for cache control
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

// Helper functions
async function syncRSVPs() {
  // In a real implementation, this would sync queued form submissions
  console.log('[SW] Syncing RSVPs...');
}

async function checkForUpdates() {
  // Check if config has changed
  try {
    const response = await fetch('./config.yaml', { cache: 'no-cache' });
    const newConfig = await response.text();
    
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match('./config.yaml');
    
    if (cachedResponse) {
      const cachedConfig = await cachedResponse.text();
      
      if (newConfig !== cachedConfig) {
        // Notify clients of update
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE',
            message: 'New content available'
          });
        });
      }
    }
  } catch (error) {
    console.error('[SW] Update check failed:', error);
  }
}

// Cache size management
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Delete oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Trim caches periodically
setInterval(() => {
  trimCache(DYNAMIC_CACHE, 50);
  trimCache(IMAGE_CACHE, 30);
}, 60 * 60 * 1000); // Every hour