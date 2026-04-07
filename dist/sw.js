const CACHE_NAME = 'world-cup-quest-v1';
const ASSETS_TO_CACHE = [
  '/world-cup-quest/',
  '/world-cup-quest/index.html',
  '/world-cup-quest/manifest.json',
  '/world-cup-quest/assets/players/tommy.png',
  '/world-cup-quest/assets/players/tommy_run1.png',
  '/world-cup-quest/assets/players/tommy_run2.png',
  '/world-cup-quest/assets/players/maddy.png',
  '/world-cup-quest/assets/players/maddy_run1.png',
  '/world-cup-quest/assets/players/maddy_run2.png',
  '/world-cup-quest/assets/opponents/opponent1.png',
  '/world-cup-quest/assets/opponents/opponent2.png',
  '/world-cup-quest/assets/opponents/opponent3.png',
  '/world-cup-quest/assets/keeper/keeper.png',
  '/world-cup-quest/assets/keeper/keeper_dive1.png',
  '/world-cup-quest/assets/keeper/keeper_dive2.png',
  '/world-cup-quest/assets/equipment/ball.png',
  '/world-cup-quest/assets/pitch/grass.png',
  '/world-cup-quest/assets/elements/elements.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
