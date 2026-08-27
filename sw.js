const CACHE_NAME = 'original-ps4-v4';
const ASSETS = [
  './',
  'index.html',
  'PS4_13.00_Webkit.html',
  'run_lapse.html',
  'sysctl.html',
  'chain_lapse.js',
  'chain_poops.js',
  'core.js',
  'int64.js',
  'mem.js',
  'ps4_offsets.js',
  'rpc_worker.js',
  'sysctl.js',
  'payload.bin',
  'preview.png',
  'patches/1150.bin',
  'patches/1200.bin',
  'patches/1300.bin'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// الاستماع لطلبات الجلب وخدمتها من الكاش
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
