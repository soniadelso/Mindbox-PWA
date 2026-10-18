const CACHE = 'mindbox-v1';
const ARCHIVOS = [
  './',
  './index.html',
  './inspiracion.html',
  './detalle.html',
  './js/componentes.js',
  './js/formulario.js',
  './js/inspiraciones.js',
  './js/swiper.js',
  './data/inspiraciones.json',
  './css/tokens.css',
  './css/tipo.css',
  './css/reset.css',
  './css/componentes.css',
  './css/formularios.css',
  './css/styles.css',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Red primero, caché como respaldo; se guarda lo que se descarga (CDNs, imágenes, fuentes).
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});