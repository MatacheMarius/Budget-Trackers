const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/data.js",
  "/manifest.webmanifest",
];

const NAME = "static-cache-v2";
const DATA = "data-cache-v1";

// install
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(NAME).then((cache) => {
      console.log("Pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== NAME && key !== DATA) {
            console.log("Delete cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch
self.addEventListener("fetch", function (evt) {
  if (evt.req.url.includes("/api/")) {
    evt.respondWith(
      caches
        .open(DATA)
        .then((cache) => {
          return fetch(evt.req)
            .then((res) => {
              // If the res 200 store it in the cache.
              if (res.status === 200) {
                cache.put(evt.req.url, res.clone());
              }

              return res;
            })
            .catch((err) => {
              // Network req failed, try to get it from the cache.
              return cache.match(evt.req);
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  evt.respondWith(
    caches.match(evt.req).then(function (res) {
      return res || fetch(evt.req);
    })
  );
});


