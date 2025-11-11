/**
 * 搜索高亮模块
 * 提供搜索结果高亮显示功能
 */

class SearchHighlight {
    constructor() {
        this.currentMatches = [];
        this.currentIndex = -1;
        this.highlightClass = 'search-highlight';
        this.activeClass = 'search-highlight-active';
        this.init();
    }

    init() {
        this.registerEventListeners();
    }

    /**
     * 注册事件监听器
     */
    registerEventListeners() {
        // 监听搜索事件
        document.addEventListener('search:performed', (e) => {
            const { query, results } = e.detail;
            this.highlightResults(query, results);
        });

        // 监听搜索清除事件
        document.addEventListener('search:cleared', () => {
            this.clearHighlights();
        });
    }

    /**
     * 高亮搜索结果
     * @param {string} query - 搜索关键词
     * @param {Array} results - 搜索结果元素数组
     */
    highlightResults(query, results) {
        // 先清除之前的高亮
        this.clearHighlights();

        if (!query || query.trim() === '') return;

        const searchTerm = query.trim();
        this.currentMatches = [];

        results.forEach(element => {
            this.highlightInElement(element, searchTerm);
        });

        // 如果有匹配项，激活第一个
        if (this.currentMatches.length > 0) {
            this.setActiveMatch(0);
        }
    }

    /**
     * 在元素中高亮关键词
     */
    highlightInElement(element, searchTerm) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const nodesToHighlight = [];
        let node;

        while (node = walker.nextNode()) {
            if (node.nodeValue.trim() !== '') {
                nodesToHighlight.push(node);
            }
        }

        nodesToHighlight.forEach(textNode => {
            this.highlightTextNode(textNode, searchTerm);
        });
    }

    /**
     * 高亮文本节点
     */
    highlightTextNode(textNode, searchTerm) {
        const text = textNode.nodeValue;
        const regex = new RegExp(this.escapeRegex(searchTerm), 'gi');
        
        let match;
        const matches = [];
        
        while ((match = regex.exec(text)) !== null) {
            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0]
            });
        }

        if (matches.length === 0) return;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches.forEach(match => {
            // 添加匹配前的文本
            if (match.start > lastIndex) {
                fragment.appendChild(
                    document.createTextNode(text.substring(lastIndex, match.start))
                );
            }

            // 创建高亮元素
            const highlight = document.createElement('mark');
            highlight.className = this.highlightClass;
            highlight.textContent = match.text;
            fragment.appendChild(highlight);
            
            this.currentMatches.push(highlight);

            lastIndex = match.end;
        });

        // 添加剩余文本
        if (lastIndex < text.length) {
            fragment.appendChild(
                document.createTextNode(text.substring(lastIndex))
            );
        }

        textNode.parentNode.replaceChild(fragment, textNode);
    }

    /**
     * 转义正则表达式特殊字符
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * 清除所有高亮
     */
    clearHighlights() {
        const highlights = document.querySelectorAll(`.${this.highlightClass}`);
        
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            const text = document.createTextNode(highlight.textContent);
            parent.replaceChild(text, highlight);
            parent.normalize(); // 合并相邻的文本节点
        });

        this.currentMatches = [];
        this.currentIndex = -1;
    }

    /**
     * 设置当前激活的匹配项
     */
    setActiveMatch(index) {
        if (index < 0 || index >= this.currentMatches.length) return;

        // 移除之前的激活状态
        if (this.currentIndex >= 0 && this.currentMatches[this.currentIndex]) {
            this.currentMatches[this.currentIndex].classList.remove(this.activeClass);
        }

        // 设置新的激活状态
        this.currentIndex = index;
        const activeMatch = this.currentMatches[this.currentIndex];
        activeMatch.classList.add(this.activeClass);

        // 滚动到可见区域
        this.scrollToMatch(activeMatch);
    }

    /**
     * 滚动到匹配项
     */
    scrollToMatch(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    }

    /**
     * 跳转到下一个匹配项
     */
    nextMatch() {
        if (this.currentMatches.length === 0) return;

        const nextIndex = (this.currentIndex + 1) % this.currentMatches.length;
        this.setActiveMatch(nextIndex);
    }

    /**
     * 跳转到上一个匹配项
     */
    previousMatch() {
        if (this.currentMatches.length === 0) return;

        const prevIndex = this.currentIndex - 1 < 0 
            ? this.currentMatches.length - 1 
            : this.currentIndex - 1;
        this.setActiveMatch(prevIndex);
    }

    /**
     * 获取匹配统计信息
     */
    getMatchStats() {
        return {
            total: this.currentMatches.length,
            current: this.currentIndex + 1
        };
    }

    /**
     * 高亮指定的元素集合
     * @param {string} selector - CSS选择器
     * @param {string} keyword - 关键词
     */
    highlightElements(selector, keyword) {
        const elements = document.querySelectorAll(selector);
        this.clearHighlights();
        
        if (!keyword || keyword.trim() === '') return;

        elements.forEach(element => {
            this.highlightInElement(element, keyword);
        });

        if (this.currentMatches.length > 0) {
            this.setActiveMatch(0);
        }

        return this.getMatchStats();
    }

    /**
     * 创建搜索导航控制器
     */
    createNavigationControls() {
        const container = document.createElement('div');
        container.className = 'search-navigation';
        container.innerHTML = `
            <div class="search-nav-info">
                <span class="search-nav-current">0</span>
                /
                <span class="search-nav-total">0</span>
            </div>
            <button class="search-nav-btn search-nav-prev" title="上一个 (Shift+Enter)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 12l-4-4 4-4 1.5 1.5L7 8l2.5 2.5z"/>
                </svg>
            </button>
            <button class="search-nav-btn search-nav-next" title="下一个 (Enter)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 4l4 4-4 4-1.5-1.5L9 8 6.5 5.5z"/>
                </svg>
            </button>
        `;

        // 绑定事件
        const prevBtn = container.querySelector('.search-nav-prev');
        const nextBtn = container.querySelector('.search-nav-next');

        prevBtn.addEventListener('click', () => this.previousMatch());
        nextBtn.addEventListener('click', () => this.nextMatch());

        return container;
    }

    /**
     * 更新导航信息
     */
    updateNavigationInfo(container) {
        const stats = this.getMatchStats();
        const currentSpan = container.querySelector('.search-nav-current');
        const totalSpan = container.querySelector('.search-nav-total');

        if (currentSpan) currentSpan.textContent = stats.current;
        if (totalSpan) totalSpan.textContent = stats.total;
    }
}

// 导出单例
const searchHighlight = new SearchHighlight();