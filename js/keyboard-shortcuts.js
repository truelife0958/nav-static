/**
 * 键盘快捷键管理模块
 * 提供全局键盘快捷键支持
 */

class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.enabled = true;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.registerDefaultShortcuts();
    }

    /**
     * 注册默认快捷键
     */
    registerDefaultShortcuts() {
        // Ctrl/Cmd + S: 保存
        this.register('ctrl+s', (e) => {
            e.preventDefault();
            this.triggerSave();
        });

        // Ctrl/Cmd + F: 搜索
        this.register('ctrl+f', (e) => {
            e.preventDefault();
            this.triggerSearch();
        });

        // Ctrl/Cmd + K: 添加新书签
        this.register('ctrl+k', (e) => {
            e.preventDefault();
            this.triggerAddBookmark();
        });

        // Ctrl/Cmd + Z: 撤销
        this.register('ctrl+z', (e) => {
            e.preventDefault();
            this.triggerUndo();
        });

        // Ctrl/Cmd + Y 或 Ctrl/Cmd + Shift + Z: 重做
        this.register('ctrl+y', (e) => {
            e.preventDefault();
            this.triggerRedo();
        });

        this.register('ctrl+shift+z', (e) => {
            e.preventDefault();
            this.triggerRedo();
        });

        // Ctrl/Cmd + B: 导出备份
        this.register('ctrl+b', (e) => {
            e.preventDefault();
            this.triggerBackup();
        });

        // Ctrl/Cmd + D: 切换暗色模式
        this.register('ctrl+d', (e) => {
            e.preventDefault();
            this.triggerDarkMode();
        });

        // Esc: 关闭模态框
        this.register('escape', (e) => {
            this.triggerCloseModal();
        });

        // ?: 显示快捷键帮助
        this.register('shift+/', (e) => {
            e.preventDefault();
            this.showHelp();
        });
    }

    /**
     * 注册快捷键
     * @param {string} combination - 快捷键组合 (如 'ctrl+s')
     * @param {Function} callback - 回调函数
     */
    register(combination, callback) {
        const key = combination.toLowerCase();
        this.shortcuts.set(key, callback);
    }

    /**
     * 取消注册快捷键
     */
    unregister(combination) {
        const key = combination.toLowerCase();
        this.shortcuts.delete(key);
    }

    /**
     * 处理键盘按下事件
     */
    handleKeyDown(e) {
        if (!this.enabled) return;

        // 如果在输入框中，某些快捷键不触发
        const isInputField = e.target.tagName === 'INPUT' || 
                            e.target.tagName === 'TEXTAREA' || 
                            e.target.isContentEditable;

        const key = this.getKeyCombo(e);
        const callback = this.shortcuts.get(key);

        if (callback) {
            // 搜索快捷键在输入框中也允许
            if (isInputField && key !== 'ctrl+f' && key !== 'escape') {
                return;
            }
            callback(e);
        }
    }

    /**
     * 获取按键组合字符串
     */
    getKeyCombo(e) {
        const parts = [];
        
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        
        const key = e.key.toLowerCase();
        if (key !== 'control' && key !== 'alt' && key !== 'shift' && key !== 'meta') {
            parts.push(key);
        }
        
        return parts.join('+');
    }

    /**
     * 触发保存操作
     */
    triggerSave() {
        const event = new CustomEvent('shortcut:save');
        document.dispatchEvent(event);
        this.showToast('保存成功');
    }

    /**
     * 触发搜索操作
     */
    triggerSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
        const event = new CustomEvent('shortcut:search');
        document.dispatchEvent(event);
    }

    /**
     * 触发添加书签操作
     */
    triggerAddBookmark() {
        const event = new CustomEvent('shortcut:addBookmark');
        document.dispatchEvent(event);
    }

    /**
     * 触发撤销操作
     */
    triggerUndo() {
        const event = new CustomEvent('shortcut:undo');
        document.dispatchEvent(event);
    }

    /**
     * 触发重做操作
     */
    triggerRedo() {
        const event = new CustomEvent('shortcut:redo');
        document.dispatchEvent(event);
    }

    /**
     * 触发备份操作
     */
    triggerBackup() {
        const event = new CustomEvent('shortcut:backup');
        document.dispatchEvent(event);
    }

    /**
     * 触发暗色模式切换
     */
    triggerDarkMode() {
        const event = new CustomEvent('shortcut:darkMode');
        document.dispatchEvent(event);
    }

    /**
     * 触发关闭模态框
     */
    triggerCloseModal() {
        const event = new CustomEvent('shortcut:closeModal');
        document.dispatchEvent(event);
    }

    /**
     * 显示快捷键帮助
     */
    showHelp() {
        const helpContent = `
            <div class="shortcuts-help">
                <h3>键盘快捷键</h3>
                <div class="shortcuts-list">
                    <div class="shortcut-item">
                        <kbd>Ctrl/Cmd + S</kbd>
                        <span>保存</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl/Cmd + F</kbd>
                        <span>搜索</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl/Cmd + K</kbd>
                        <span>添加书签</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl/Cmd + Z</kbd>
                        <span>撤销</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl/Cmd + Y</kbd>
                        <span>重做</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl/Cmd + B</kbd>
                        <span>导出备份</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl/Cmd + D</kbd>
                        <span>切换暗色模式</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Esc</kbd>
                        <span>关闭模态框</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>?</kbd>
                        <span>显示帮助</span>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('快捷键帮助', helpContent);
    }

    /**
     * 显示提示消息
     */
    showToast(message, duration = 2000) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * 显示模态框
     */
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'keyboard-shortcuts-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * 启用快捷键
     */
    enable() {
        this.enabled = true;
    }

    /**
     * 禁用快捷键
     */
    disable() {
        this.enabled = false;
    }
}

// 导出单例
const keyboardShortcuts = new KeyboardShortcuts();