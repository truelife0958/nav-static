/**
 * PWA 管理模块
 * 处理 Service Worker 注册和 PWA 安装
 */

class PWAManager {
    constructor() {
        this.registration = null;
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        this.checkInstallation();
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupUpdateCheck();
    }

    /**
     * 检查是否已安装
     */
    checkInstallation() {
        // 检查是否在独立模式下运行
        this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true;

        if (this.isInstalled) {
            console.log('[PWA] 应用已安装');
            this.notifyInstallStatus(true);
        }
    }

    /**
     * 注册 Service Worker
     */
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('[PWA] Service Worker 不支持');
            return;
        }

        try {
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('[PWA] Service Worker 注册成功:', this.registration.scope);

            // 监听更新
            this.registration.addEventListener('updatefound', () => {
                this.handleUpdate(this.registration);
            });

            // 检查是否有更新
            this.registration.update();

        } catch (error) {
            console.error('[PWA] Service Worker 注册失败:', error);
        }
    }

    /**
     * 处理更新
     */
    handleUpdate(registration) {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] 发现新版本');
                this.showUpdateNotification();
            }
        });
    }

    /**
     * 显示更新通知
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <div class="update-icon">🔄</div>
                <div class="update-text">
                    <div class="update-title">发现新版本</div>
                    <div class="update-message">点击更新以获取最新功能</div>
                </div>
            </div>
            <div class="update-actions">
                <button class="btn-later">稍后</button>
                <button class="btn-update">立即更新</button>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);

        // 绑定事件
        notification.querySelector('.btn-later').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });

        notification.querySelector('.btn-update').addEventListener('click', () => {
            this.applyUpdate();
        });
    }

    /**
     * 应用更新
     */
    applyUpdate() {
        if (this.registration && this.registration.waiting) {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }

    /**
     * 设置安装提示
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            console.log('[PWA] 可以安装');
            this.showInstallButton();
        });

        // 监听安装成功
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] 安装成功');
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.hideInstallButton();
            this.showNotification('应用安装成功！', 'success');
            this.notifyInstallStatus(true);
        });
    }

    /**
     * 显示安装按钮
     */
    showInstallButton() {
        const event = new CustomEvent('pwa:canInstall');
        document.dispatchEvent(event);
    }

    /**
     * 隐藏安装按钮
     */
    hideInstallButton() {
        const event = new CustomEvent('pwa:installed');
        document.dispatchEvent(event);
    }

    /**
     * 提示安装
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            this.showNotification('当前浏览器不支持安装', 'warning');
            return false;
        }

        this.deferredPrompt.prompt();

        const { outcome } = await this.deferredPrompt.userChoice;
        console.log('[PWA] 用户选择:', outcome);

        if (outcome === 'accepted') {
            this.deferredPrompt = null;
            return true;
        }

        return false;
    }

    /**
     * 设置定期更新检查
     */
    setupUpdateCheck() {
        // 每小时检查一次更新
        setInterval(() => {
            if (this.registration) {
                this.registration.update();
            }
        }, 60 * 60 * 1000);

        // 页面可见时检查
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.registration) {
                this.registration.update();
            }
        });
    }

    /**
     * 清除缓存
     */
    async clearCache() {
        if (!this.registration) return false;

        try {
            const messageChannel = new MessageChannel();
            
            return new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data.success);
                };

                this.registration.active.postMessage(
                    { type: 'CLEAR_CACHE' },
                    [messageChannel.port2]
                );
            });
        } catch (error) {
            console.error('[PWA] 清除缓存失败:', error);
            return false;
        }
    }

    /**
     * 获取缓存大小
     */
    async getCacheSize() {
        if (!this.registration) return 0;

        try {
            const messageChannel = new MessageChannel();
            
            return new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data.size);
                };

                this.registration.active.postMessage(
                    { type: 'GET_CACHE_SIZE' },
                    [messageChannel.port2]
                );
            });
        } catch (error) {
            console.error('[PWA] 获取缓存大小失败:', error);
            return 0;
        }
    }

    /**
     * 请求通知权限
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    /**
     * 发送通知
     */
    async sendNotification(title, options = {}) {
        const hasPermission = await this.requestNotificationPermission();
        
        if (!hasPermission || !this.registration) {
            return false;
        }

        try {
            await this.registration.showNotification(title, {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                ...options
            });
            return true;
        } catch (error) {
            console.error('[PWA] 发送通知失败:', error);
            return false;
        }
    }

    /**
     * 注册后台同步
     */
    async registerBackgroundSync(tag) {
        if (!this.registration || !('sync' in this.registration)) {
            return false;
        }

        try {
            await this.registration.sync.register(tag);
            return true;
        } catch (error) {
            console.error('[PWA] 注册后台同步失败:', error);
            return false;
        }
    }

    /**
     * 通知安装状态
     */
    notifyInstallStatus(installed) {
        const event = new CustomEvent('pwa:installStatus', {
            detail: { installed }
        });
        document.dispatchEvent(event);
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        const event = new CustomEvent('showNotification', {
            detail: { message, type }
        });
        document.dispatchEvent(event);
    }

    /**
     * 创建安装按钮
     */
    createInstallButton() {
        const button = document.createElement('button');
        button.className = 'pwa-install-btn';
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a1 1 0 011 1v8.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 11.586V3a1 1 0 011-1z"/>
                <path d="M4 14a1 1 0 011 1v2h10v-2a1 1 0 112 0v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a1 1 0 011-1z"/>
            </svg>
            安装应用
        `;

        button.addEventListener('click', () => {
            this.promptInstall();
        });

        return button;
    }

    /**
     * 获取安装状态
     */
    getStatus() {
        return {
            isInstalled: this.isInstalled,
            canInstall: !!this.deferredPrompt,
            hasServiceWorker: !!this.registration,
            notificationPermission: 'Notification' in window ? Notification.permission : 'unsupported'
        };
    }
}

// 导出单例
const pwaManager = new PWAManager();