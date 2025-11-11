# 优化实施指南

本文档提供了具体的优化实施方案和代码示例。

## 🚀 高优先级优化

### 1. 添加键盘快捷键支持

#### 实施方案
在 `app.js` 中添加键盘事件监听：

```javascript
// 添加到 bindEvents() 函数中
document.addEventListener('keydown', (e) => {
  // 如果焦点在输入框中，不响应快捷键
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }
  
  switch(e.key) {
    case '/':
      e.preventDefault();
      document.getElementById('searchInput')?.focus();
      break;
    case 'ArrowLeft':
      if (AppState.currentMenuIndex > 0) {
        AppState.currentMenuIndex--;
        selectMenu(AppState.allMenus[AppState.currentMenuIndex].id);
      }
      break;
    case 'ArrowRight':
      if (AppState.currentMenuIndex < AppState.allMenus.length - 1) {
        AppState.currentMenuIndex++;
        selectMenu(AppState.allMenus[AppState.currentMenuIndex].id);
      }
      break;
    case 'Escape':
      const modal = document.getElementById('friendLinksModal');
      if (modal.style.display === 'flex') {
        modal.style.display = 'none';
      }
      break;
  }
});
```

### 2. 暗色模式支持

#### 步骤1: 在 CSS 中添加 CSS 变量
```css
:root {
  --bg-primary: rgba(255, 255, 255, 0.15);
  --bg-secondary: rgba(255, 255, 255, 0.3);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.8);
  --overlay: rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] {
  --bg-primary: rgba(0, 0, 0, 0.4);
  --bg-secondary: rgba(0, 0, 0, 0.6);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --overlay: rgba(0, 0, 0, 0.5);
}

[data-theme="light"] {
  --bg-primary: rgba(255, 255, 255, 0.8);
  --bg-secondary: rgba(255, 255, 255, 0.95);
  --text-primary: #333333;
  --text-secondary: #666666;
  --overlay: rgba(255, 255, 255, 0.3);
}
```

#### 步骤2: 在 HTML 中添加主题切换按钮
```html
<button id="themeToggle" class="theme-toggle" title="切换主题">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>
</button>
```

#### 步骤3: JavaScript 实现
```javascript
function initTheme() {
  const theme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// 在 initApp() 中调用
initTheme();

// 绑定按钮事件
document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
```

### 3. 数据备份功能

#### LocalStorage 自动保存
```javascript
// 添加到 editor.js
function autoSave() {
  try {
    const backup = {
      timestamp: Date.now(),
      data: editorData
    };
    localStorage.setItem('nav_data_backup', JSON.stringify(backup));
    console.log('✅ 数据已自动保存');
  } catch (error) {
    console.error('自动保存失败:', error);
  }
}

// 每30秒自动保存一次
setInterval(autoSave, 30000);

// 加载备份
function loadBackup() {
  try {
    const backup = localStorage.getItem('nav_data_backup');
    if (backup) {
      const { timestamp, data } = JSON.parse(backup);
      const backupDate = new Date(timestamp).toLocaleString('zh-CN');
      if (confirm(`发现备份数据 (${backupDate})，是否恢复？`)) {
        editorData = data;
        loadSettings();
        renderMenus();
        renderCards();
        renderFriends();
        alert('✅ 备份已恢复！');
      }
    }
  } catch (error) {
    console.error('加载备份失败:', error);
  }
}
```

## 🎯 中优先级优化

### 4. 搜索高亮功能

```javascript
function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// 修改 createCardHTML
function createCardHTML(card) {
  const query = AppState.selectedEngine.name === 'site' ? AppState.searchQuery : '';
  const title = highlightText(card.title, query);
  const description = highlightText(card.description || '', query);
  // ... 其余代码
}
```

### 5. 撤销/重做功能

```javascript
class CommandHistory {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }

  execute(command) {
    // 清除当前位置之后的历史
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(command);
    this.currentIndex++;
    command.execute();
  }

  undo() {
    if (this.currentIndex >= 0) {
      this.history[this.currentIndex].undo();
      this.currentIndex--;
    }
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.history[this.currentIndex].execute();
    }
  }
}

// 使用示例
const commandHistory = new CommandHistory();

// 添加菜单命令
class AddMenuCommand {
  constructor(menu) {
    this.menu = menu;
  }

  execute() {
    editorData.menus.push(this.menu);
    renderMenus();
  }

  undo() {
    editorData.menus = editorData.menus.filter(m => m.id !== this.menu.id);
    renderMenus();
  }
}

// 绑定快捷键
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    commandHistory.undo();
  }
  if (e.ctrlKey && e.key === 'y') {
    e.preventDefault();
    commandHistory.redo();
  }
});
```

### 6. 性能监控

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }

  mark(name) {
    performance.mark(name);
  }

  measure(name, startMark, endMark) {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    this.metrics[name] = measure.duration;
    console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
  }

  report() {
    console.table(this.metrics);
  }
}

// 使用示例
const monitor = new PerformanceMonitor();

function renderCards() {
  monitor.mark('renderCards-start');
  // ... 渲染逻辑
  monitor.mark('renderCards-end');
  monitor.measure('renderCards', 'renderCards-start', 'renderCards-end');
}
```

## 🔧 低优先级优化

### 7. 书签导入功能

```javascript
function importBookmarks() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.html,.json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target.result;
      
      if (file.name.endsWith('.html')) {
        parseHTMLBookmarks(content);
      } else if (file.name.endsWith('.json')) {
        parseJSONBookmarks(content);
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

function parseHTMLBookmarks(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = doc.querySelectorAll('a');
  
  links.forEach(link => {
    const card = {
      id: getNextCardId(),
      title: link.textContent,
      url: link.href,
      description: '',
      icon: '',
      tags: [],
      order: editorData.cards.length + 1,
      menuId: 11 // 默认放到第一个子菜单
    };
    editorData.cards.push(card);
  });
  
  renderCards();
  alert(`✅ 成功导入 ${links.length} 个书签！`);
}
```

### 8. PWA支持

#### manifest.json
```json
{
  "name": "静态导航网站",
  "short_name": "导航",
  "description": "简洁美观的导航网站",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Service Worker (sw.js)
```javascript
const CACHE_NAME = 'nav-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/editor.html',
  '/css/style.css',
  '/js/app.js',
  '/js/editor.js',
  '/js/data.js',
  '/js/stars.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

#### 注册 Service Worker
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('✅ Service Worker 注册成功'))
    .catch((error) => console.error('❌ Service Worker 注册失败:', error));
}
```

## 📊 性能优化清单

### 代码层面
- [x] 使用懒加载图片 (`loading="lazy"`)
- [x] 优化动画性能 (使用 `transform` 代替 `position`)
- [x] 减少DOM操作 (批量更新)
- [ ] 代码分割 (按需加载编辑器代码)
- [ ] 图片压缩优化
- [ ] 使用 Web Workers 处理复杂计算

### 资源优化
- [ ] CSS精简和压缩
- [ ] JavaScript压缩和混淆
- [ ] 启用Gzip压缩
- [ ] 使用CDN加速
- [ ] 图片使用WebP格式
- [ ] 字体子集化

### 缓存策略
- [ ] 设置合适的HTTP缓存头
- [ ] 实现Service Worker缓存
- [ ] 使用LocalStorage缓存数据
- [ ] 实现资源预加载

## 🎨 用户体验优化

### 视觉反馈
```javascript
// 添加加载状态
function showLoading() {
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(loader);
}

function hideLoading() {
  const loader = document.querySelector('.loader');
  loader?.remove();
}

// 添加操作提示
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
```

### 无障碍访问
```html
<!-- 添加ARIA标签 -->
<button aria-label="切换到下一个菜单" class="cards-nav-btn">
  <svg aria-hidden="true">...</svg>
</button>

<!-- 添加键盘焦点样式 -->
<style>
*:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>
```

## 📝 实施优先级建议

1. **立即实施** (1周内)
   - 键盘快捷键
   - 数据备份功能
   - 搜索高亮

2. **短期实施** (1-2周)
   - 暗色模式
   - 撤销/重做
   - 性能监控

3. **中期实施** (1个月)
   - 书签导入
   - PWA支持
   - 代码优化

4. **长期计划** (持续优化)
   - 性能持续监控
   - 用户反馈收集
   - 功能迭代

---

**注意**: 每次实施优化后，都应进行充分的测试，确保不影响现有功能。