const CACHE_NAME = "nutritracker-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg"
];

// Install Event: Cache shell files
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Pre-caching static assets");
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.error("Failed to pre-cache assets:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clear old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Service Worker: Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Dynamic runtime caching with Network-First fallback
self.addEventListener("fetch", (e) => {
  // Only cache GET requests (do not cache POST measurements)
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Do not intercept backend API calls (let axios handle offline/online states)
  if (url.pathname.includes("/api/")) return;

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // Cache successfully fetched assets (CSS, JS, images, html) dynamically
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails (offline), search in cache
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          // React Router: Serve index.html as a fallback for router subpaths when offline
          if (e.request.mode === "navigate" || e.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/index.html");
          }
        });
      })
  );
});
