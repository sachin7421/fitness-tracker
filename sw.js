// GymIQ Service Worker
// Version bump this string whenever you deploy a new version
const CACHE_NAME = 'gymiq-v1';

// Files to cache for offline use
const PRECACHE_URLS = [
  '/fitness-tracker/',
  '/fitness-tracker/index.html',
  '/fitness-tracker/manifest.json',
  '/fitness-tracker/icon-192.png',
  '/fitness-tracker/icon-512.png',
  '/fitness-tracker/apple-touch-icon.png',
];

// Install: cache all core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first, fall back to cache
self.addEventListener('fetch', event => {
  // Skip non-GET and external requests (Oura API, Google Sheets, fonts)
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network failed — serve from cache
        return caches.match(event.request)
          .then(cached => cached || caches.match('/fitness-tracker/index.html'));
      })
  );
});

// Background sync placeholder for future Sheets sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    // Future: sync queued data when back online
    console.log('GymIQ: background sync triggered');
  }
});
