/**
 * 性能监控模块
 * 提供应用性能监控和分析功能
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: {},
            runtime: {},
            memory: {},
            resources: []
        };
        this.observers = [];
        this.isMonitoring = false;
        this.init();
    }

    init() {
        this.collectPageLoadMetrics();
        this.startMonitoring();
        this.observePerformance();
    }

    /**
     * 收集页面加载性能指标
     */
    collectPageLoadMetrics() {
        if (!window.performance || !window.performance.timing) {
            console.warn('Performance API 不可用');
            return;
        }

        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = performance.timing;
                const navigation = performance.navigation;

                this.metrics.pageLoad = {
                    // DNS 查询时间
                    dns: timing.domainLookupEnd - timing.domainLookupStart,
                    
                    // TCP 连接时间
                    tcp: timing.connectEnd - timing.connectStart,
                    
                    // SSL 握手时间
                    ssl: timing.secureConnectionStart > 0 
                        ? timing.connectEnd - timing.secureConnectionStart 
                        : 0,
                    
                    // 请求时间
                    request: timing.responseStart - timing.requestStart,
                    
                    // 响应时间
                    response: timing.responseEnd - timing.responseStart,
                    
                    // DOM 解析时间
                    domParse: timing.domInteractive - timing.domLoading,
                    
                    // DOM 内容加载时间
                    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                    
                    // 页面完全加载时间
                    pageLoad: timing.loadEventEnd - timing.navigationStart,
                    
                    // 首次渲染时间
                    firstPaint: this.getFirstPaint(),
                    
                    // 首次内容渲染时间
                    firstContentfulPaint: this.getFirstContentfulPaint(),
                    
                    // 导航类型
                    navigationType: this.getNavigationType(navigation.type),
                    
                    // 重定向次数
                    redirectCount: navigation.redirectCount,
                    
                    // 时间戳
                    timestamp: Date.now()
                };

                this.saveMetrics();
                this.notifyUpdate();
            }, 0);
        });
    }

    /**
     * 获取首次绘制时间
     */
    getFirstPaint() {
        const paint = performance.getEntriesByType('paint');
        const fp = paint.find(entry => entry.name === 'first-paint');
        return fp ? Math.round(fp.startTime) : 0;
    }

    /**
     * 获取首次内容绘制时间
     */
    getFirstContentfulPaint() {
        const paint = performance.getEntriesByType('paint');
        const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? Math.round(fcp.startTime) : 0;
    }

    /**
     * 获取导航类型
     */
    getNavigationType(type) {
        const types = ['navigate', 'reload', 'back_forward', 'prerender'];
        return types[type] || 'unknown';
    }

    /**
     * 开始监控运行时性能
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.monitorInterval = setInterval(() => {
            this.collectRuntimeMetrics();
        }, 5000); // 每5秒收集一次

        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseMonitoring();
            } else {
                this.resumeMonitoring();
            }
        });
    }

    /**
     * 收集运行时性能指标
     */
    collectRuntimeMetrics() {
        // 收集内存使用情况
        if (performance.memory) {
            this.metrics.memory = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                usagePercent: Math.round(
                    (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
                ),
                timestamp: Date.now()
            };
        }

        // 收集 FPS
        this.metrics.runtime.fps = this.measureFPS();
        
        // 收集长任务
        this.metrics.runtime.longTasks = this.getLongTasks();

        this.saveMetrics();
    }

    /**
     * 测量 FPS
     */
    measureFPS() {
        if (!this.lastFrameTime) {
            this.lastFrameTime = performance.now();
            this.frameCount = 0;
            requestAnimationFrame(() => this.measureFPS());
            return 0;
        }

        const now = performance.now();
        const delta = now - this.lastFrameTime;

        if (delta >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / delta);
            this.frameCount = 0;
            this.lastFrameTime = now;
            return fps;
        }

        this.frameCount++;
        requestAnimationFrame(() => this.measureFPS());
        
        return this.metrics.runtime.fps || 60;
    }

    /**
     * 获取长任务信息
     */
    getLongTasks() {
        const longTasks = performance.getEntriesByType('longtask');
        return longTasks.map(task => ({
            duration: task.duration,
            startTime: task.startTime,
            name: task.name
        }));
    }

    /**
     * 观察性能指标
     */
    observePerformance() {
        // 观察资源加载
        if (PerformanceObserver) {
            // 资源观察器
            try {
                const resourceObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        this.metrics.resources.push({
                            name: entry.name,
                            type: entry.initiatorType,
                            duration: Math.round(entry.duration),
                            size: entry.transferSize || 0,
                            timestamp: Date.now()
                        });
                    });
                    
                    // 限制资源记录数量
                    if (this.metrics.resources.length > 100) {
                        this.metrics.resources = this.metrics.resources.slice(-100);
                    }
                });
                
                resourceObserver.observe({ entryTypes: ['resource'] });
                this.observers.push(resourceObserver);
            } catch (e) {
                console.warn('资源观察器初始化失败:', e);
            }

            // 长任务观察器
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        console.warn('检测到长任务:', {
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    });
                });
                
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.push(longTaskObserver);
            } catch (e) {
                console.warn('长任务观察器初始化失败:', e);
            }
        }
    }

    /**
     * 暂停监控
     */
    pauseMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
    }

    /**
     * 恢复监控
     */
    resumeMonitoring() {
        if (!this.monitorInterval && this.isMonitoring) {
            this.startMonitoring();
        }
    }

    /**
     * 停止监控
     */
    stopMonitoring() {
        this.isMonitoring = false;
        this.pauseMonitoring();
        
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }

    /**
     * 保存性能指标
     */
    saveMetrics() {
        try {
            localStorage.setItem('performanceMetrics', JSON.stringify(this.metrics));
        } catch (error) {
            console.error('保存性能指标失败:', error);
        }
    }

    /**
     * 加载性能指标
     */
    loadMetrics() {
        try {
            const saved = localStorage.getItem('performanceMetrics');
            if (saved) {
                this.metrics = JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载性能指标失败:', error);
        }
    }

    /**
     * 获取性能指标
     */
    getMetrics() {
        return {
            ...this.metrics,
            score: this.calculatePerformanceScore()
        };
    }

    /**
     * 计算性能评分
     */
    calculatePerformanceScore() {
        let score = 100;
        const pageLoad = this.metrics.pageLoad;

        if (!pageLoad.pageLoad) return null;

        // 页面加载时间评分（权重40%）
        if (pageLoad.pageLoad > 3000) score -= 40;
        else if (pageLoad.pageLoad > 2000) score -= 30;
        else if (pageLoad.pageLoad > 1000) score -= 20;
        else if (pageLoad.pageLoad > 500) score -= 10;

        // FCP 评分（权重30%）
        if (pageLoad.firstContentfulPaint > 2500) score -= 30;
        else if (pageLoad.firstContentfulPaint > 1800) score -= 20;
        else if (pageLoad.firstContentfulPaint > 1000) score -= 10;

        // 内存使用评分（权重30%）
        if (this.metrics.memory.usagePercent > 90) score -= 30;
        else if (this.metrics.memory.usagePercent > 70) score -= 20;
        else if (this.metrics.memory.usagePercent > 50) score -= 10;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * 获取性能等级
     */
    getPerformanceGrade(score) {
        if (score >= 90) return { grade: 'A', label: '优秀', color: '#10b981' };
        if (score >= 75) return { grade: 'B', label: '良好', color: '#3b82f6' };
        if (score >= 60) return { grade: 'C', label: '一般', color: '#f59e0b' };
        if (score >= 40) return { grade: 'D', label: '较差', color: '#ef4444' };
        return { grade: 'F', label: '差', color: '#dc2626' };
    }

    /**
     * 格式化时间
     */
    formatTime(ms) {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    }

    /**
     * 格式化字节
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * 通知更新
     */
    notifyUpdate() {
        const event = new CustomEvent('performanceUpdate', {
            detail: this.getMetrics()
        });
        document.dispatchEvent(event);
    }

    /**
     * 生成性能报告
     */
    generateReport() {
        const metrics = this.getMetrics();
        const score = metrics.score;
        const grade = this.getPerformanceGrade(score);

        return {
            summary: {
                score,
                grade: grade.grade,
                label: grade.label,
                color: grade.color
            },
            pageLoad: {
                total: this.formatTime(metrics.pageLoad.pageLoad),
                fcp: this.formatTime(metrics.pageLoad.firstContentfulPaint),
                domContentLoaded: this.formatTime(metrics.pageLoad.domContentLoaded)
            },
            memory: {
                used: this.formatBytes(metrics.memory.usedJSHeapSize),
                total: this.formatBytes(metrics.memory.totalJSHeapSize),
                percent: metrics.memory.usagePercent
            },
            runtime: {
                fps: metrics.runtime.fps
            },
            resources: {
                count: metrics.resources.length,
                totalSize: this.formatBytes(
                    metrics.resources.reduce((sum, r) => sum + r.size, 0)
                )
            }
        };
    }

    /**
     * 创建性能面板
     */
    createPanel() {
        const report = this.generateReport();
        
        const panel = document.createElement('div');
        panel.className = 'performance-panel';
        panel.innerHTML = `
            <div class="performance-header">
                <h3>性能监控</h3>
                <button class="refresh-btn">刷新</button>
            </div>
            <div class="performance-score">
                <div class="score-circle" style="--score-color: ${report.summary.color}">
                    <div class="score-value">${report.summary.score}</div>
                    <div class="score-grade">${report.summary.grade}</div>
                </div>
                <div class="score-label">${report.summary.label}</div>
            </div>
            <div class="performance-metrics">
                <div class="metric-item">
                    <span class="metric-label">页面加载</span>
                    <span class="metric-value">${report.pageLoad.total}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">首次内容渲染</span>
                    <span class="metric-value">${report.pageLoad.fcp}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">内存使用</span>
                    <span class="metric-value">${report.memory.percent}%</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">帧率</span>
                    <span class="metric-value">${report.runtime.fps} FPS</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">资源数量</span>
                    <span class="metric-value">${report.resources.count}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">资源大小</span>
                    <span class="metric-value">${report.resources.totalSize}</span>
                </div>
            </div>
        `;

        // 绑定刷新按钮
        const refreshBtn = panel.querySelector('.refresh-btn');
        refreshBtn.addEventListener('click', () => {
            location.reload();
        });

        return panel;
    }
}

// 导出单例
const performanceMonitor = new PerformanceMonitor();