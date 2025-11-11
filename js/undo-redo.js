/**
 * 撤销/重做管理模块
 * 提供操作历史记录和回退功能
 */

class UndoRedo {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 50;
        this.batchMode = false;
        this.batchOperations = [];
        this.init();
    }

    init() {
        this.loadHistory();
        this.registerEventListeners();
    }

    /**
     * 加载历史记录
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('undoRedoHistory');
            if (saved) {
                const data = JSON.parse(saved);
                this.history = data.history || [];
                this.currentIndex = data.currentIndex || -1;
            }
        } catch (error) {
            console.error('加载历史记录失败:', error);
        }
    }

    /**
     * 保存历史记录
     */
    saveHistory() {
        try {
            const data = {
                history: this.history,
                currentIndex: this.currentIndex
            };
            localStorage.setItem('undoRedoHistory', JSON.stringify(data));
        } catch (error) {
            console.error('保存历史记录失败:', error);
        }
    }

    /**
     * 注册事件监听器
     */
    registerEventListeners() {
        // 监听快捷键触发的撤销/重做
        document.addEventListener('shortcut:undo', () => {
            this.undo();
        });

        document.addEventListener('shortcut:redo', () => {
            this.redo();
        });
    }

    /**
     * 记录操作
     * @param {Object} operation - 操作对象
     * @param {string} operation.type - 操作类型
     * @param {Function} operation.undo - 撤销函数
     * @param {Function} operation.redo - 重做函数
     * @param {Object} operation.data - 操作数据
     * @param {string} operation.description - 操作描述
     */
    record(operation) {
        if (!operation || !operation.undo || !operation.redo) {
            console.error('无效的操作记录');
            return;
        }

        // 如果在批处理模式中，添加到批处理队列
        if (this.batchMode) {
            this.batchOperations.push(operation);
            return;
        }

        // 清除当前索引之后的所有历史记录
        this.history = this.history.slice(0, this.currentIndex + 1);

        // 添加新操作
        const record = {
            ...operation,
            timestamp: Date.now(),
            id: this.generateId()
        };

        this.history.push(record);
        this.currentIndex++;

        // 限制历史记录大小
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }

        this.saveHistory();
        this.notifyChange();
    }

    /**
     * 撤销操作
     */
    undo() {
        if (!this.canUndo()) {
            this.showNotification('没有可撤销的操作', 'warning');
            return false;
        }

        const operation = this.history[this.currentIndex];
        
        try {
            operation.undo();
            this.currentIndex--;
            this.saveHistory();
            this.notifyChange();
            this.showNotification(`已撤销: ${operation.description || '操作'}`, 'success');
            return true;
        } catch (error) {
            console.error('撤销操作失败:', error);
            this.showNotification('撤销失败', 'error');
            return false;
        }
    }

    /**
     * 重做操作
     */
    redo() {
        if (!this.canRedo()) {
            this.showNotification('没有可重做的操作', 'warning');
            return false;
        }

        const operation = this.history[this.currentIndex + 1];
        
        try {
            operation.redo();
            this.currentIndex++;
            this.saveHistory();
            this.notifyChange();
            this.showNotification(`已重做: ${operation.description || '操作'}`, 'success');
            return true;
        } catch (error) {
            console.error('重做操作失败:', error);
            this.showNotification('重做失败', 'error');
            return false;
        }
    }

    /**
     * 是否可以撤销
     */
    canUndo() {
        return this.currentIndex >= 0;
    }

    /**
     * 是否可以重做
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * 开始批处理模式
     */
    startBatch(description) {
        this.batchMode = true;
        this.batchOperations = [];
        this.batchDescription = description || '批量操作';
    }

    /**
     * 结束批处理模式
     */
    endBatch() {
        if (!this.batchMode) return;

        this.batchMode = false;

        if (this.batchOperations.length === 0) return;

        // 创建批处理操作
        const batchOperation = {
            type: 'batch',
            description: this.batchDescription,
            operations: [...this.batchOperations],
            undo: () => {
                // 反向执行撤销
                for (let i = this.batchOperations.length - 1; i >= 0; i--) {
                    this.batchOperations[i].undo();
                }
            },
            redo: () => {
                // 正向执行重做
                for (let i = 0; i < this.batchOperations.length; i++) {
                    this.batchOperations[i].redo();
                }
            }
        };

        this.batchOperations = [];
        this.record(batchOperation);
    }

    /**
     * 取消批处理
     */
    cancelBatch() {
        this.batchMode = false;
        this.batchOperations = [];
    }

    /**
     * 清除历史记录
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.saveHistory();
        this.notifyChange();
        this.showNotification('已清除历史记录', 'info');
    }

    /**
     * 获取历史记录
     */
    getHistory() {
        return {
            history: this.history,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        };
    }

    /**
     * 跳转到指定历史记录
     */
    jumpTo(index) {
        if (index < -1 || index >= this.history.length) {
            return false;
        }

        try {
            // 确定方向
            if (index < this.currentIndex) {
                // 需要撤销
                while (this.currentIndex > index) {
                    this.history[this.currentIndex].undo();
                    this.currentIndex--;
                }
            } else if (index > this.currentIndex) {
                // 需要重做
                while (this.currentIndex < index) {
                    this.history[this.currentIndex + 1].redo();
                    this.currentIndex++;
                }
            }

            this.saveHistory();
            this.notifyChange();
            return true;
        } catch (error) {
            console.error('跳转失败:', error);
            return false;
        }
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 通知变化
     */
    notifyChange() {
        const event = new CustomEvent('undoRedoChange', {
            detail: this.getHistory()
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
     * 创建历史记录面板
     */
    createHistoryPanel() {
        const panel = document.createElement('div');
        panel.className = 'undo-redo-panel';
        panel.innerHTML = `
            <div class="undo-redo-header">
                <h3>操作历史</h3>
                <button class="clear-history-btn">清除</button>
            </div>
            <div class="undo-redo-controls">
                <button class="undo-btn" ${!this.canUndo() ? 'disabled' : ''}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 3a5 5 0 00-4.546 2.914.5.5 0 00.908.417 4 4 0 117.279 2.38.5.5 0 10.546.838A5 5 0 008 3z"/>
                        <path d="M3.5 6.5h3v3h-3z"/>
                    </svg>
                    撤销
                </button>
                <button class="redo-btn" ${!this.canRedo() ? 'disabled' : ''}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 3a5 5 0 014.546 2.914.5.5 0 01-.908.417 4 4 0 10-7.279 2.38.5.5 0 01-.546.838A5 5 0 018 3z"/>
                        <path d="M9.5 6.5h3v3h-3z"/>
                    </svg>
                    重做
                </button>
            </div>
            <div class="undo-redo-list"></div>
        `;

        // 绑定事件
        const undoBtn = panel.querySelector('.undo-btn');
        const redoBtn = panel.querySelector('.redo-btn');
        const clearBtn = panel.querySelector('.clear-history-btn');

        undoBtn.addEventListener('click', () => this.undo());
        redoBtn.addEventListener('click', () => this.redo());
        clearBtn.addEventListener('click', () => {
            if (confirm('确定要清除所有历史记录吗？')) {
                this.clear();
            }
        });

        // 更新列表
        this.updateHistoryList(panel);

        // 监听变化
        document.addEventListener('undoRedoChange', () => {
            this.updateHistoryList(panel);
        });

        return panel;
    }

    /**
     * 更新历史记录列表
     */
    updateHistoryList(panel) {
        const list = panel.querySelector('.undo-redo-list');
        const undoBtn = panel.querySelector('.undo-btn');
        const redoBtn = panel.querySelector('.redo-btn');

        // 更新按钮状态
        undoBtn.disabled = !this.canUndo();
        redoBtn.disabled = !this.canRedo();

        // 清空列表
        list.innerHTML = '';

        // 添加历史记录项
        this.history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            if (index === this.currentIndex) {
                historyItem.classList.add('current');
            } else if (index > this.currentIndex) {
                historyItem.classList.add('future');
            }

            historyItem.innerHTML = `
                <div class="history-item-icon">
                    ${index === this.currentIndex ? '→' : '•'}
                </div>
                <div class="history-item-content">
                    <div class="history-item-description">${item.description || '操作'}</div>
                    <div class="history-item-time">${this.formatTime(item.timestamp)}</div>
                </div>
            `;

            historyItem.addEventListener('click', () => {
                this.jumpTo(index);
            });

            list.appendChild(historyItem);
        });

        // 如果没有历史记录
        if (this.history.length === 0) {
            list.innerHTML = '<div class="no-history">暂无操作历史</div>';
        }
    }

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) {
            return '刚刚';
        } else if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}分钟前`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}小时前`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

// 导出单例
const undoRedo = new UndoRedo();