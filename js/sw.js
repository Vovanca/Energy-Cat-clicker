// Имя кэша и версия игры
const CACHE_NAME = 'energy-cat-v1.0.0';

// Список всех файлов, которые нужно закэшировать для офлайн-работы
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './js/config.js',
    './js/app.js',
    'https://em-content.zobj.net/source/apple/354/cat_1f408.png'
];

// 1. Событие Установки (Install): Скачиваем и кэшируем все ресурсы
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Установка и кэширование ресурсов...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. Событие Активации (Activate): Удаляем старые версии кэша
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Активация...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Удаление старого кэша:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Перехват запросов (Fetch): Сначала ищем в кэше, если нет — грузим из сети
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Если файл найден в кэше — отдаем его
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Иначе загружаем из сети
                return fetch(event.request).catch(() => {
                    // Опционально: здесь можно вернуть запасную офлайн-страницу
                });
            })
    );
});
