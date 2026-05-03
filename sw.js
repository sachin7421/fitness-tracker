// Self-cleanup service worker — unregisters itself and clears caches so
// returning users on the old domain pick up the redirect to /gymiq/.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.map(k => caches.delete(k)))
    await self.registration.unregister()
    const clients = await self.clients.matchAll({ type: 'window' })
    clients.forEach(c => c.navigate(c.url))
  })())
})

// No fetch handler — let everything go to network so the redirect HTML loads.
