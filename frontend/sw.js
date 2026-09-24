const CACHE_NAME = 'ner-dementia-care-v2';
const STATIC_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/css/patient.css',
  '/static/css/caregiver.css',
  '/static/css/doctor.css',
  '/static/css/govt.css',
  '/static/js/i18n.js',
  '/static/js/voice.js',
  '/static/js/db.js',
  '/static/js/adaptive_ai.js',
  '/static/js/reminders.js',
  '/static/js/games.js',
  '/static/js/chatbot.js',
  '/static/js/caregiver.js',
  '/static/js/doctor.js',
  '/static/js/govt.js',
  '/static/js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Pre-caching some assets failed (will cache on demand):', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // If it's an API call, try network first, fallback to offline response if disconnected
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ 
          status: 'offline', 
          message: 'Running in offline-first mode. Data is stored locally in IndexedDB.' 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // For static assets, cache first then network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => {
        return caches.match('/');
      });
    })
  );
});
