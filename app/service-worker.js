// service-worker.js
// Provides robust caching and offline-first capabilities for the Smart UDC System

const CACHE_NAME = 'smart-udc-cache-v1.0';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './login.html',
    './dashboard.html',
    './js/api.js',
    './js/app.js',
    './js/auth.js',
    './js/db.js',
    './js/qr.js',
    './css/styles.css',
    './manifest.json',
    './assets/1000182319.png',
    // External CDNs
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/html5-qrcode/html5-qrcode.min.js'
];

self.addEventListener('install', event => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                // Use try/catch or fetch gracefully so that one missing file doesn't crash the entire SW installation
                return Promise.all(
                    ASSETS_TO_CACHE.map(url => {
                        return fetch(url).then(response => {
                            if (!response.ok) {
                                console.warn(`Skipping cache for missing file: ${url}`);
                            } else {
                                return cache.put(url, response);
                            }
                        }).catch(err => {
                            console.warn(`Failed to fetch and cache: ${url}`, err);
                        });
                    })
                );
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    // Delete older caches
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Do not cache API endpoints (Google script URLs)
    if (event.request.url.includes('script.google.com')) {
        return; // Let the browser handle standard network request
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Fallback to network
                return fetch(event.request).then(
                    function(networkResponse) {
                        // Check if we received a valid response
                        if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        return networkResponse;
                    }
                );
            })
    );
});
