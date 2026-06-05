// Self-destructing service worker.
// This file exists ONLY to replace a previously registered SW that is now stale.
// On activation it clears all caches, takes control of all clients, and then
// unregisters itself so no service worker runs for this origin going forward.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((name) => caches.delete(name)))
    ).then(() => self.clients.claim())
     .then(() => self.registration.unregister())
  );
});

// Do NOT intercept any fetch events — let the network handle everything.
