const CACHE_NAME = "nutritracker-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/src/main.jsx",
  "/src/styles/theme.css"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("fetch", (e) => {
  // Let service worker fetch assets from cache or network
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    }).catch(() => {
      // Return cached index if offline and fetching document
      if (e.request.mode === "navigate") {
        return caches.match("/index.html");
      }
    })
  );
});
