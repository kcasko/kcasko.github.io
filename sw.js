// TaurusTech Service Worker - Offline Support
const CACHE_NAME = 'taurustech-v1';
const STATIC_ASSETS = [
  '/',
  '/css/styles.css',
  '/js/core.js',
  '/js/theme-polyfill.js',
  '/js/typewriter.js',
  '/js/visits.js',
  '/js/projects.js',
  '/js/guestbook.js',
  '/partials/header.html',
  '/partials/nav.html',
  '/partials/footer.html',
  '/images/hero.png',
  '/images/under-construction.gif',
  '/data/projects.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache files individually to handle missing files gracefully
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      })
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error('Service worker installation failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests and external domains
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request).then(networkResponse => {
          // Cache successful responses for future use
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(err => console.warn('Failed to cache response:', err));
          }
          
          return networkResponse;
        });
      })
      .catch(err => {
        console.warn('Fetch failed:', err);
        // Offline fallback for HTML pages
        if (event.request.destination === 'document') {
          return caches.match('/').catch(() => {
            return new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        }
        // Return a basic error response for other resources
        return new Response('Resource unavailable offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});