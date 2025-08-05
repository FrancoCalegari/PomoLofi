const CACHE_NAME = "PomoLofi-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./test.html",
  "./test2.html",
  "./manifest.json",
  "./assets/css/style.css",
  "./assets/css/musicplayer.css",
  "./assets/js/script.js",
  "./assets/js/musicplayer.js",
  "./assets/js/btnconfig.js",
  "./assets/img/icon-192.png",
  "./assets/img/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
