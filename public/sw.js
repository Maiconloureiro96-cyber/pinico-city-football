/* Service worker do Pinico City FC — compatível com GitHub Pages (basePath). */
const CACHE_NAME = "pinico-city-v1"

function getBasePath() {
  // Ex.: /pinico-city-football/sw.js -> /pinico-city-football
  //      /sw.js -> ''
  return self.location.pathname.replace(/\/sw\.js$/, "")
}

function withBase(path) {
  const base = getBasePath()
  if (!path.startsWith("/")) path = "/" + path
  return base + path
}

self.addEventListener("install", (event) => {
  self.skipWaiting()
  const precache = [
    withBase("/"),
    withBase("/manifest.webmanifest"),
    withBase("/logo-pinico-city.png"),
    withBase("/icon-192.png"),
    withBase("/icon-512.png"),
    withBase("/apple-icon.png"),
  ]
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        precache.map((url) =>
          cache.add(url).catch(() => {
            /* recurso opcional / 404 — não quebra o install */
          }),
        ),
      ),
    ),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navegação: rede primeiro, fallback no cache (offline)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(withBase("/"))),
        ),
    )
    return
  }

  // Assets: cache primeiro, depois rede
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})
