/**
 * Little Arcade — Service Worker (sw.js)
 * Menyediakan kapabilitas Progressive Web App (PWA) & Offline-First Caching
 */

const CACHE_NAME = 'little-arcade-v2';

// Aset inti yang di-cache saat instalasi
const CORE_ASSETS = [
  './',
  'index.html',
  'index2.html',
  'index3.html',
  'arcade.css',
  'arcade.js',
  'scrabble.js',
  'carrom.js',
  'pachinko.js',
  'manifest.json',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'data/english-words.js'
];

// Install: Cache seluruh aset inti
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Bersihkan cache versi lama dan klaim kontrol klien secara instan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== 'little-arcade-external')
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Tangani request secara cerdas
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // External APIs & Google Fonts (Network-first dengan cache fallback)
  if (
    url.hostname.includes('dictionaryapi.dev') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.open('little-arcade-external').then(async (cache) => {
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          const cached = await cache.match(event.request);
          return cached || new Response('', { status: 408, statusText: 'Offline' });
        }
      })
    );
    return;
  }

  // Local assets (Cache-first dengan network fallback)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
    })
  );
});
