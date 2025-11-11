/**
 * 数据备份管理模块
 * 提供数据导出、导入和自动备份功能
 */

class BackupManager {
    constructor() {
        this.autoBackupEnabled = false;
        this.backupInterval = 24 * 60 * 60 * 1000; // 24小时
        this.maxBackups = 5;
        this.init();
    }

    init() {
        this.loadSettings();
        this.startAutoBackup();
        this.registerEventListeners();
    }

    /**
     * 加载备份设置
     */
    loadSettings() {
        const settings = localStorage.getItem('backupSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.autoBackupEnabled = parsed.autoBackupEnabled || false;
            this.backupInterval = parsed.backupInterval || 24 * 60 * 60 * 1000;
            this.maxBackups = parsed.maxBackups || 5;
        }
    }

    /**
     * 保存备份设置
     */
    saveSettings() {
        const settings = {
            autoBackupEnabled: this.autoBackupEnabled,
            backupInterval: this.backupInterval,
            maxBackups: this.maxBackups
        };
        localStorage.setItem('backupSettings', JSON.stringify(settings));
    }

    /**
     * 注册事件监听器
     */
    registerEventListeners() {
        // 监听快捷键触发的备份
        document.addEventListener('shortcut:backup', () => {
            this.exportBackup();
        });
    }

    /**
     * 导出备份
     */
    exportBackup(filename) {
        try {
            const data = this.collectData();
            const backup = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                data: data
            };

            const jsonStr = JSON.stringify(backup, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            
            if (!filename) {
                const date = new Date().toISOString().split('T')[0];
                filename = `nav-backup-${date}.json`;
            }

            this.downloadFile(blob, filename);
            this.showNotification('备份导出成功', 'success');
            
            // 保存到本地存储作为自动备份
            this.saveLocalBackup(backup);
            
            return true;
        } catch (error) {
            console.error('导出备份失败:', error);
            this.showNotification('导出备份失败', 'error');
            return false;
        }
    }

    /**
     * 收集需要备份的数据
     */
    collectData() {
        const data = {};
        
        // 收集所有 localStorage 数据
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // 排除敏感或临时数据
            if (!this.shouldExcludeKey(key)) {
                data[key] = localStorage.getItem(key);
            }
        }

        return data;
    }

    /**
     * 判断是否应该排除某个键
     */
    shouldExcludeKey(key) {
        const excludePatterns = [
            'temp_',
            'cache_',
            'session_'
        ];
        
        return excludePatterns.some(pattern => key.startsWith(pattern));
    }

    /**
     * 导入备份
     */
    importBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    // 验证备份文件
                    if (!this.validateBackup(backup)) {
                        throw new Error('无效的备份文件');
                    }

                    // 创建恢复点
                    this.createRestorePoint();

                    // 恢复数据
                    this.restoreData(backup.data);
                    
                    this.showNotification('备份导入成功，页面将刷新', 'success');
                    
                    // 延迟刷新页面
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                    
                    resolve();
                } catch (error) {
                    console.error('导入备份失败:', error);
                    this.showNotification('导入备份失败: ' + error.message, 'error');
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * 验证备份文件
     */
    validateBackup(backup) {
        return backup && 
               backup.version && 
               backup.timestamp && 
               backup.data && 
               typeof backup.data === 'object';
    }

    /**
     * 恢复数据
     */
    restoreData(data) {
        Object.keys(data).forEach(key => {
            try {
                localStorage.setItem(key, data[key]);
            } catch (error) {
                console.error(`恢复数据失败 ${key}:`, error);
            }
        });
    }

    /**
     * 创建恢复点
     */
    createRestorePoint() {
        const restorePoint = {
            timestamp: new Date().toISOString(),
            data: this.collectData()
        };
        
        localStorage.setItem('restorePoint', JSON.stringify(restorePoint));
    }

    /**
     * 恢复到恢复点
     */
    restoreToRestorePoint() {
        try {
            const restorePoint = localStorage.getItem('restorePoint');
            if (restorePoint) {
                const data = JSON.parse(restorePoint);
                this.restoreData(data.data);
                this.showNotification('已恢复到备份点', 'success');
                setTimeout(() => location.reload(), 1000);
                return true;
            } else {
                this.showNotification('没有可用的恢复点', 'warning');
                return false;
            }
        } catch (error) {
            console.error('恢复失败:', error);
            this.showNotification('恢复失败', 'error');
            return false;
        }
    }

    /**
     * 保存本地备份
     */
    saveLocalBackup(backup) {
        try {
            let backups = this.getLocalBackups();
            backups.push(backup);
            
            // 限制备份数量
            if (backups.length > this.maxBackups) {
                backups = backups.slice(-this.maxBackups);
            }
            
            localStorage.setItem('localBackups', JSON.stringify(backups));
        } catch (error) {
            console.error('保存本地备份失败:', error);
        }
    }

    /**
     * 获取本地备份列表
     */
    getLocalBackups() {
        try {
            const backups = localStorage.getItem('localBackups');
            return backups ? JSON.parse(backups) : [];
        } catch (error) {
            console.error('读取本地备份失败:', error);
            return [];
        }
    }

    /**
     * 删除本地备份
     */
    deleteLocalBackup(timestamp) {
        try {
            let backups = this.getLocalBackups();
            backups = backups.filter(b => b.timestamp !== timestamp);
            localStorage.setItem('localBackups', JSON.stringify(backups));
            return true;
        } catch (error) {
            console.error('删除本地备份失败:', error);
            return false;
        }
    }

    /**
     * 清空所有本地备份
     */
    clearLocalBackups() {
        localStorage.removeItem('localBackups');
    }

    /**
     * 启动自动备份
     */
    startAutoBackup() {
        if (this.autoBackupEnabled) {
            this.autoBackupTimer = setInterval(() => {
                this.performAutoBackup();
            }, this.backupInterval);
        }
    }

    /**
     * 停止自动备份
     */
    stopAutoBackup() {
        if (this.autoBackupTimer) {
            clearInterval(this.autoBackupTimer);
            this.autoBackupTimer = null;
        }
    }

    /**
     * 执行自动备份
     */
    performAutoBackup() {
        try {
            const data = this.collectData();
            const backup = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                data: data,
                auto: true
            };
            
            this.saveLocalBackup(backup);
            console.log('自动备份完成:', backup.timestamp);
        } catch (error) {
            console.error('自动备份失败:', error);
        }
    }

    /**
     * 设置自动备份
     */
    setAutoBackup(enabled, interval) {
        this.autoBackupEnabled = enabled;
        if (interval) {
            this.backupInterval = interval;
        }
        
        this.saveSettings();
        
        if (enabled) {
            this.stopAutoBackup();
            this.startAutoBackup();
        } else {
            this.stopAutoBackup();
        }
    }

    /**
     * 下载文件
     */
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
     * 获取备份统计信息
     */
    getBackupStats() {
        const backups = this.getLocalBackups();
        const dataSize = new Blob([JSON.stringify(this.collectData())]).size;
        
        return {
            totalBackups: backups.length,
            lastBackupTime: backups.length > 0 ? backups[backups.length - 1].timestamp : null,
            dataSize: this.formatBytes(dataSize),
            autoBackupEnabled: this.autoBackupEnabled
        };
    }

    /**
     * 格式化字节数
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// 导出单例
const backupManager = new BackupManager();