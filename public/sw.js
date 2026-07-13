/* Sterith Back Office — service worker (installability) */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
// A fetch handler must exist for the app to be installable. Network pass-through.
self.addEventListener('fetch', function () { /* pass-through */ });
