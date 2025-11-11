/**
 * 暗色模式管理模块
 * 提供主题切换和自动模式功能
 */

class DarkMode {
    constructor() {
        this.currentTheme = 'light';
        this.autoMode = false;
        this.init();
    }

    init() {
        this.loadTheme();
        this.applyTheme();
        this.registerEventListeners();
        this.watchSystemTheme();
    }

    /**
     * 加载主题设置
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const savedAutoMode = localStorage.getItem('autoMode');
        
        this.autoMode = savedAutoMode === 'true';
        
        if (this.autoMode) {
            this.currentTheme = this.getSystemTheme();
        } else if (savedTheme) {
            this.currentTheme = savedTheme;
        }
    }

    /**
     * 保存主题设置
     */
    saveTheme() {
        localStorage.setItem('theme', this.currentTheme);
        localStorage.setItem('autoMode', this.autoMode);
    }

    /**
     * 获取系统主题
     */
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * 监听系统主题变化
     */
    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                if (this.autoMode) {
                    this.currentTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme();
                }
            });
        }
    }

    /**
     * 注册事件监听器
     */
    registerEventListeners() {
        // 监听快捷键触发的主题切换
        document.addEventListener('shortcut:darkMode', () => {
            this.toggle();
        });
    }

    /**
     * 应用主题
     */
    applyTheme() {
        const body = document.body;
        
        if (this.currentTheme === 'dark') {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
        } else {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
        }

        // 更新元标签
        this.updateMetaThemeColor();
        
        // 触发主题变化事件
        const event = new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme }
        });
        document.dispatchEvent(event);
        
        this.saveTheme();
    }

    /**
     * 更新浏览器主题颜色
     */
    updateMetaThemeColor() {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = this.currentTheme === 'dark' ? '#1f2937' : '#ffffff';
    }

    /**
     * 切换主题
     */
    toggle() {
        this.autoMode = false;
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        
        this.showNotification(
            `已切换到${this.currentTheme === 'dark' ? '暗色' : '亮色'}模式`
        );
    }

    /**
     * 设置主题
     */
    setTheme(theme) {
        if (theme !== 'dark' && theme !== 'light') {
            console.error('无效的主题:', theme);
            return;
        }
        
        this.autoMode = false;
        this.currentTheme = theme;
        this.applyTheme();
    }

    /**
     * 设置自动模式
     */
    setAutoMode(enabled) {
        this.autoMode = enabled;
        
        if (enabled) {
            this.currentTheme = this.getSystemTheme();
            this.applyTheme();
            this.showNotification('已启用自动主题模式');
        } else {
            this.showNotification('已禁用自动主题模式');
        }
    }

    /**
     * 获取当前主题
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * 是否为暗色模式
     */
    isDark() {
        return this.currentTheme === 'dark';
    }

    /**
     * 显示通知
     */
    showNotification(message) {
        const event = new CustomEvent('showNotification', {
            detail: { message, type: 'info' }
        });
        document.dispatchEvent(event);
    }

    /**
     * 创建主题切换器
     */
    createToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', '切换主题');
        toggle.innerHTML = `
            <svg class="theme-icon theme-icon-light" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
            </svg>
            <svg class="theme-icon theme-icon-dark" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
        `;
        
        toggle.addEventListener('click', () => this.toggle());
        
        return toggle;
    }

    /**
     * 创建主题选择器
     */
    createSelector() {
        const container = document.createElement('div');
        container.className = 'theme-selector';
        container.innerHTML = `
            <div class="theme-selector-header">
                <h3>主题设置</h3>
            </div>
            <div class="theme-selector-options">
                <label class="theme-option">
                    <input type="radio" name="theme" value="light" ${this.currentTheme === 'light' && !this.autoMode ? 'checked' : ''}>
                    <div class="theme-option-content">
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
                        </svg>
                        <span>亮色</span>
                    </div>
                </label>
                <label class="theme-option">
                    <input type="radio" name="theme" value="dark" ${this.currentTheme === 'dark' && !this.autoMode ? 'checked' : ''}>
                    <div class="theme-option-content">
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                        </svg>
                        <span>暗色</span>
                    </div>
                </label>
                <label class="theme-option">
                    <input type="radio" name="theme" value="auto" ${this.autoMode ? 'checked' : ''}>
                    <div class="theme-option-content">
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
                        </svg>
                        <span>自动</span>
                    </div>
                </label>
            </div>
        `;
        
        // 绑定事件
        const radios = container.querySelectorAll('input[name="theme"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const value = e.target.value;
                if (value === 'auto') {
                    this.setAutoMode(true);
                } else {
                    this.setTheme(value);
                }
            });
        });
        
        return container;
    }
}

// 导出单例
const darkMode = new DarkMode();