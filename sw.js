// sw.js - Service Worker untuk PWA Push Notifications
const CACHE_NAME = 'power-monitor-v1';
const urlsToCache = [
    '/',
    '/index.html'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Fetch dengan cache-first strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

// Handle Push Notifications
self.addEventListener('push', event => {
    let data = {
        title: 'Power Monitor Alert',
        body: 'Terjadi fault pada sistem',
        icon: 'https://via.placeholder.com/192x192?text=⚠️',
        badge: 'https://via.placeholder.com/96x96?text=Power'
    };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    const options = {
        body: data.body,
        icon: data.icon || 'https://via.placeholder.com/192x192?text=⚠️',
        badge: data.badge || 'https://via.placeholder.com/96x96?text=Power',
        vibrate: [200, 100, 200, 100, 200],
        tag: data.tag || 'fault',
        renotify: true,
        requireInteraction: true,
        data: {
            timestamp: Date.now(),
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle Notification Click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                for (let client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Clean up old caches
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
});