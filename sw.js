const CACHE_NAME = 'original-ps4-v7';

// فصل الملفات الحساسة لضمان نجاح التثبيت الأساسي
const CORE_ASSETS = [
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
  'preview.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // استخدام addAll للأساسيات، وجلب الـ patches بشكل منفصل لكي لا يفشل الكاش لو حدث خطأ في مسار المجلد
      return cache.addAll(CORE_ASSETS).then(() => {
        return cache.addAll([
          'patches/1150.bin',
          'patches/1200.bin',
          'patches/1300.bin'
        ]).catch(err => console.log('Patches cache warning:', err));
      });
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

// استراتيجية Cache-First القوية جداً للعمل بدون إنترنت تماماً
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // إذا انقطع الإنترنت ولم يكن الملف مخزناً، إرجاع الصفحة الرئيسية
        return caches.match('./index.html');
      });
    })
  );
});
