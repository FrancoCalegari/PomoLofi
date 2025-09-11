const CACHE_NAME = "PomoLofi-cache-v2"; // nueva versión de cache
const urlsToCache = [
  "./",
  "./index.html",
  "./test.html",
  "./test2.html",
  "./manifest.json",
  // CSS
  "./assets/css/style.css",
  "./assets/css/musicplayer.css",
  "./assets/css/responsive.css",
  // JS
  "./assets/js/script.js",
  "./assets/js/musicplayer.js",
  "./assets/js/btnconfig.js",
  // Fuentes
  "./assets/fonts/FontLofi.ttf",
  // Imágenes
  "./assets/img/icon-192.png",
  "./assets/img/icon-512.png",
  "./assets/img/photositev1.png",
  // Sonidos
  "./assets/sounds/RelaxTimer.wav",
  "./assets/sounds/WorkTimer.mp3",
];

// INSTALACIÓN: cache inicial
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ACTIVACIÓN: limpiar caches viejas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH: estrategia cache-first con fallback a red
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() =>
          caches.match("./index.html") // fallback offline
        )
      );
    })
  );
});
