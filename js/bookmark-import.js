/**
 * 书签导入模块
 * 支持从浏览器书签文件导入数据
 */

class BookmarkImport {
    constructor() {
        this.supportedFormats = ['html', 'json'];
        this.init();
    }

    init() {
        this.registerEventListeners();
    }

    /**
     * 注册事件监听器
     */
    registerEventListeners() {
        document.addEventListener('import:bookmarks', (e) => {
            this.handleImportRequest(e.detail);
        });
    }

    /**
     * 处理导入请求
     */
    handleImportRequest(options = {}) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html,.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importFile(file, options);
            }
        });
        
        input.click();
    }

    /**
     * 导入文件
     */
    async importFile(file, options = {}) {
        try {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            
            if (!this.supportedFormats.includes(fileExtension)) {
                throw new Error('不支持的文件格式');
            }

            const content = await this.readFile(file);
            let bookmarks;

            if (fileExtension === 'html') {
                bookmarks = this.parseHTMLBookmarks(content);
            } else if (fileExtension === 'json') {
                bookmarks = this.parseJSONBookmarks(content);
            }

            if (!bookmarks || bookmarks.length === 0) {
                throw new Error('未找到有效的书签');
            }

            // 显示预览和确认
            this.showImportPreview(bookmarks, options);

        } catch (error) {
            console.error('导入失败:', error);
            this.showNotification('导入失败: ' + error.message, 'error');
        }
    }

    /**
     * 读取文件内容
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            
            reader.readAsText(file);
        });
    }

    /**
     * 解析 HTML 格式的书签
     * 支持 Chrome、Firefox、Edge 等浏览器导出的书签
     */
    parseHTMLBookmarks(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bookmarks = [];

        const parseNode = (node, category = '未分类') => {
            if (node.tagName === 'A') {
                const bookmark = {
                    title: node.textContent.trim(),
                    url: node.getAttribute('href'),
                    icon: node.getAttribute('icon') || this.getFaviconUrl(node.getAttribute('href')),
                    category: category,
                    addDate: node.getAttribute('add_date') 
                        ? new Date(parseInt(node.getAttribute('add_date')) * 1000).toISOString()
                        : new Date().toISOString(),
                    description: node.getAttribute('description') || ''
                };

                if (bookmark.url && bookmark.title) {
                    bookmarks.push(bookmark);
                }
            }

            if (node.tagName === 'DT' || node.tagName === 'DL') {
                const h3 = node.querySelector('h3');
                const newCategory = h3 ? h3.textContent.trim() : category;

                Array.from(node.children).forEach(child => {
                    parseNode(child, newCategory);
                });
            } else {
                Array.from(node.children).forEach(child => {
                    parseNode(child, category);
                });
            }
        };

        const body = doc.body || doc.querySelector('dl');
        if (body) {
            parseNode(body);
        }

        return bookmarks;
    }

    /**
     * 解析 JSON 格式的书签
     */
    parseJSONBookmarks(jsonStr) {
        try {
            const data = JSON.parse(jsonStr);
            const bookmarks = [];

            // 支持多种 JSON 格式
            if (Array.isArray(data)) {
                // 直接是书签数组
                return data.map(item => this.normalizeBookmark(item));
            } else if (data.bookmarks && Array.isArray(data.bookmarks)) {
                // 包含 bookmarks 字段的对象
                return data.bookmarks.map(item => this.normalizeBookmark(item));
            } else if (data.roots) {
                // Chrome 书签格式
                this.parseChromeBookmarks(data.roots, bookmarks);
            }

            return bookmarks;
        } catch (error) {
            throw new Error('JSON 格式解析失败');
        }
    }

    /**
     * 解析 Chrome 书签格式
     */
    parseChromeBookmarks(node, bookmarks, category = '未分类') {
        if (node.type === 'url') {
            bookmarks.push({
                title: node.name,
                url: node.url,
                icon: this.getFaviconUrl(node.url),
                category: category,
                addDate: node.date_added ? new Date(node.date_added).toISOString() : new Date().toISOString(),
                description: ''
            });
        } else if (node.type === 'folder' && node.children) {
            node.children.forEach(child => {
                this.parseChromeBookmarks(child, bookmarks, node.name);
            });
        }

        // 递归处理根节点的子节点
        if (node.bookmark_bar) {
            this.parseChromeBookmarks(node.bookmark_bar, bookmarks, '书签栏');
        }
        if (node.other) {
            this.parseChromeBookmarks(node.other, bookmarks, '其他书签');
        }
    }

    /**
     * 标准化书签对象
     */
    normalizeBookmark(item) {
        return {
            title: item.title || item.name || '未命名',
            url: item.url || item.link || item.href || '',
            icon: item.icon || item.favicon || this.getFaviconUrl(item.url),
            category: item.category || item.folder || item.tag || '未分类',
            addDate: item.addDate || item.created || item.date || new Date().toISOString(),
            description: item.description || item.desc || ''
        };
    }

    /**
     * 获取网站图标 URL
     */
    getFaviconUrl(url) {
        try {
            const urlObj = new URL(url);
            return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
        } catch {
            return '';
        }
    }

    /**
     * 显示导入预览
     */
    showImportPreview(bookmarks, options) {
        const modal = document.createElement('div');
        modal.className = 'import-preview-modal';
        
        // 按分类分组
        const grouped = this.groupByCategory(bookmarks);
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>导入书签预览</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="import-summary">
                        <div class="summary-item">
                            <span class="summary-label">总数</span>
                            <span class="summary-value">${bookmarks.length}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">分类</span>
                            <span class="summary-value">${Object.keys(grouped).length}</span>
                        </div>
                    </div>
                    <div class="import-options">
                        <label class="import-option">
                            <input type="checkbox" id="merge-mode" ${options.merge !== false ? 'checked' : ''}>
                            <span>合并到现有书签（不覆盖）</span>
                        </label>
                        <label class="import-option">
                            <input type="checkbox" id="keep-categories" checked>
                            <span>保留原有分类</span>
                        </label>
                        <label class="import-option">
                            <input type="checkbox" id="remove-duplicates" checked>
                            <span>移除重复项</span>
                        </label>
                    </div>
                    <div class="preview-list">
                        ${this.renderPreviewList(grouped)}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel">取消</button>
                    <button class="btn-import">导入 ${bookmarks.length} 个书签</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        // 绑定事件
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const importBtn = modal.querySelector('.btn-import');
        const overlay = modal.querySelector('.modal-overlay');

        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        importBtn.addEventListener('click', () => {
            const mergeMode = modal.querySelector('#merge-mode').checked;
            const keepCategories = modal.querySelector('#keep-categories').checked;
            const removeDuplicates = modal.querySelector('#remove-duplicates').checked;

            this.performImport(bookmarks, {
                merge: mergeMode,
                keepCategories,
                removeDuplicates
            });

            closeModal();
        });
    }

    /**
     * 按分类分组
     */
    groupByCategory(bookmarks) {
        const grouped = {};
        bookmarks.forEach(bookmark => {
            const category = bookmark.category || '未分类';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(bookmark);
        });
        return grouped;
    }

    /**
     * 渲染预览列表
     */
    renderPreviewList(grouped) {
        let html = '';
        
        Object.keys(grouped).forEach(category => {
            html += `
                <div class="preview-category">
                    <div class="category-header">
                        <span class="category-name">${category}</span>
                        <span class="category-count">${grouped[category].length}</span>
                    </div>
                    <div class="category-items">
                        ${grouped[category].slice(0, 5).map(bookmark => `
                            <div class="preview-item">
                                <img src="${bookmark.icon}" alt="" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><text y=%2218%22 font-size=%2218%22>🔖</text></svg>'">
                                <div class="preview-item-info">
                                    <div class="preview-item-title">${bookmark.title}</div>
                                    <div class="preview-item-url">${bookmark.url}</div>
                                </div>
                            </div>
                        `).join('')}
                        ${grouped[category].length > 5 ? `
                            <div class="preview-more">
                                还有 ${grouped[category].length - 5} 个书签...
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        return html;
    }

    /**
     * 执行导入
     */
    performImport(bookmarks, options) {
        try {
            let existingData = {};
            
            if (options.merge) {
                // 合并模式：读取现有数据
                const saved = localStorage.getItem('bookmarks');
                if (saved) {
                    existingData = JSON.parse(saved);
                }
            }

            // 处理重复项
            if (options.removeDuplicates) {
                bookmarks = this.removeDuplicates(bookmarks, existingData);
            }

            // 触发导入事件，让应用处理实际的导入逻辑
            const event = new CustomEvent('bookmarks:imported', {
                detail: {
                    bookmarks,
                    options,
                    existingData
                }
            });
            document.dispatchEvent(event);

            this.showNotification(`成功导入 ${bookmarks.length} 个书签`, 'success');

        } catch (error) {
            console.error('导入执行失败:', error);
            this.showNotification('导入失败', 'error');
        }
    }

    /**
     * 移除重复项
     */
    removeDuplicates(bookmarks, existingData) {
        const existingUrls = new Set();
        
        // 收集现有URL
        Object.values(existingData).forEach(category => {
            if (Array.isArray(category)) {
                category.forEach(item => {
                    if (item.url) existingUrls.add(item.url);
                });
            }
        });

        // 过滤重复的书签
        const seen = new Set(existingUrls);
        return bookmarks.filter(bookmark => {
            if (seen.has(bookmark.url)) {
                return false;
            }
            seen.add(bookmark.url);
            return true;
        });
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
     * 创建导入按钮
     */
    createImportButton() {
        const button = document.createElement('button');
        button.className = 'import-bookmarks-btn';
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a.5.5 0 01.5.5v5.793l2.146-2.147a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 11.708-.708L7.5 8.293V2.5A.5.5 0 018 2z"/>
                <path d="M14 13.5a.5.5 0 01-.5.5h-11a.5.5 0 010-1h11a.5.5 0 01.5.5z"/>
            </svg>
            导入书签
        `;

        button.addEventListener('click', () => {
            this.handleImportRequest();
        });

        return button;
    }
}

// 导出单例
const bookmarkImport = new BookmarkImport();