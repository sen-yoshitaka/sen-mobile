const CACHE_NAME = "sen-mobile-v3-pages";
const APP_SCOPE = new URL(self.registration.scope);
const scopePath = APP_SCOPE.pathname.endsWith("/") ? APP_SCOPE.pathname : `${APP_SCOPE.pathname}/`;
const shellPath = (path) => new URL(path.replace(/^\//, ""), APP_SCOPE).pathname;
const APP_SHELL = [
  scopePath,
  shellPath("index.html"),
  shellPath("manifest.webmanifest"),
  shellPath("icon-192.png"),
  shellPath("icon-512.png"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  const isAppShell =
    requestUrl.origin === APP_SCOPE.origin &&
    (event.request.mode === "navigate" || requestUrl.pathname === scopePath || requestUrl.pathname === shellPath("index.html"));
  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    }),
  );
});
