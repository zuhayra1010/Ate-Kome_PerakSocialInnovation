// Minimal service worker: makes the app installable. No offline caching on purpose,
// so students never see stale events, points or carpool seats.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
