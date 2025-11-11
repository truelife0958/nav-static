/**
 * Service Worker
 * 提供离线支持和缓存管理
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `static-nav-${CACHE_VERSION}`;

// 需要缓存的静态资源
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/editor.html',
    '/css/style.css',
    '/css/dark-mode.css',
    '/css/keyboard-shortcuts.css',
    '/css/search-highlight.css',
    '/css/undo-redo.css',
    '/css/performance-monitor.css',
    '/css/bookmark-import.css',
    '/js/app.js',
    '/js/data.js',
    '/js/editor-new.js',
    '/js/stars.js',
    '/js/keyboard-shortcuts.js',
    '/js/backup-manager.js',
    '/js/search-highlight.js',
    '/js/dark-mode.js',
    '/js/undo-redo.js',
    '/js/performance-monitor.js',
    '/js/bookmark-import.js',
    '/manifest.json'
];

// 动态缓存的资源模式
const DYNAMIC_CACHE_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    /\.(?:woff|woff2|ttf|eot)$/
];

/**
 * 安装事件
 */
self.addEventListener('install', (event) => {
    console.log('[SW] 安装中...', CACHE_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] 缓存静态资源');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] 安装完成');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] 安装失败:', error);
            })
    );
});

/**
 * 激活事件
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] 激活中...', CACHE_VERSION);
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] 删除旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] 激活完成');
                return self.clients.claim();
            })
    );
});

/**
 * 请求拦截
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 跳过非 GET 请求
    if (request.method !== 'GET') {
        return;
    }

    // 跳过 chrome-extension 和其他协议
    if (!url.protocol.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // 如果缓存中有，直接返回
                if (cachedResponse) {
                    return cachedResponse;
                }

                // 否则从网络获取
                return fetch(request)
                    .then((response) => {
                        // 检查是否是有效响应
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // 检查是否应该缓存
                        if (shouldCache(request.url)) {
                            const responseToCache = response.clone();
                            
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseToCache);
                                });
                        }

                        return response;
                    })
                    .catch((error) => {
                        console.error('[SW] 请求失败:', request.url, error);
                        
                        // 返回离线页面或默认响应
                        return caches.match('/index.html');
                    });
            })
    );
});

/**
 * 判断是否应该缓存
 */
function shouldCache(url) {
    return DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * 消息处理
 */
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CLEAR_CACHE':
            event.waitUntil(
                caches.keys()
                    .then((cacheNames) => {
                        return Promise.all(
                            cacheNames.map((cacheName) => caches.delete(cacheName))
                        );
                    })
                    .then(() => {
                        event.ports[0].postMessage({ success: true });
                    })
            );
            break;
            
        case 'CACHE_URLS':
            event.waitUntil(
                caches.open(CACHE_NAME)
                    .then((cache) => {
                        return cache.addAll(payload.urls);
                    })
                    .then(() => {
                        event.ports[0].postMessage({ success: true });
                    })
            );
            break;

        case 'GET_CACHE_SIZE':
            event.waitUntil(
                getCacheSize()
                    .then((size) => {
                        event.ports[0].postMessage({ size });
                    })
            );
            break;
    }
});

/**
 * 获取缓存大小
 */
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }

    return totalSize;
}

/**
 * 后台同步
 */
self.addEventListener('sync', (event) => {
    console.log('[SW] 后台同步:', event.tag);
    
    if (event.tag === 'sync-bookmarks') {
        event.waitUntil(syncBookmarks());
    }
});

/**
 * 同步书签
 */
async function syncBookmarks() {
    try {
        // 这里可以实现与服务器同步的逻辑
        console.log('[SW] 同步书签数据');
        return true;
    } catch (error) {
        console.error('[SW] 同步失败:', error);
        return false;
    }
}

/**
 * 推送通知
 */
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    
    const title = data.title || '静态导航站';
    const options = {
        body: data.body || '有新的更新',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: data.url || '/',
        actions: [
            {
                action: 'open',
                title: '查看'
            },
            {
                action: 'close',
                title: '关闭'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

/**
 * 通知点击
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data)
        );
    }
});

/**
 * 定期后台同步
 */
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-bookmarks') {
        event.waitUntil(syncBookmarks());
    }
});

console.log('[SW] Service Worker 已加载', CACHE_VERSION);