
# 静态导航网站部署指南

## 📋 目录
- [GitHub Pages 部署](#github-pages-部署)
- [Cloudflare Pages 部署](#cloudflare-pages-部署)
- [数据实时更新方案](#数据实时更新方案)
- [常见问题解答](#常见问题解答)

---

## 🚀 GitHub Pages 部署

### 方法一：通过 GitHub Actions 自动部署

#### 1. 准备仓库
```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 关联远程仓库
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 推送到 GitHub
git push -u origin main
```

#### 2. 启用 GitHub Pages
1. 进入仓库设置 (Settings)
2. 找到 "Pages" 选项
3. Source 选择 "GitHub Actions"

#### 3. 创建自动部署工作流
创建文件 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Pages
        uses: actions/configure-pages@v3

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

#### 4. 访问网站
部署完成后，访问：`https://你的用户名.github.io/你的仓库名/`

---

## ☁️ Cloudflare Pages 部署

### 方法一：通过 GitHub 连接

#### 1. 推送代码到 GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

#### 2. 在 Cloudflare Pages 创建项目
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "Workers & Pages"
3. 点击 "Create application" → "Pages" → "Connect to Git"
4. 授权并选择你的仓库
5. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: 留空
   - **Build output directory**: `/`
6. 点击 "Save and Deploy"

#### 3. 访问网站
部署完成后，Cloudflare 会提供一个 `.pages.dev` 域名

### 方法二：通过 Wrangler CLI 直接部署

#### 1. 安装 Wrangler
```bash
npm install -g wrangler
```

#### 2. 登录 Cloudflare
```bash
wrangler login
```

#### 3. 部署项目
```bash
wrangler pages deploy . --project-name=my-nav-site
```

---

## 🔄 数据实时更新方案

由于这是一个**纯静态网站**，部署到 GitHub Pages 或 Cloudflare Pages 后，有以下几种更新数据的方案：

### 方案一：本地编辑 + Git 推送（推荐）⭐

**适用场景**：个人使用、完全控制数据

**流程**：
1. 在本地打开 `editor.html` 编辑数据
2. 点击"导出 data.js"按钮，下载新的 `data.js` 文件
3. 替换项目中的 `js/data.js` 文件
4. 提交并推送到 GitHub：
```bash
git add js/data.js
git commit -m "Update navigation data"
git push
```
5. GitHub Actions 或 Cloudflare Pages 会自动重新部署（1-3分钟）

**优点**：
- ✅ 完全免费
- ✅ 数据安全可控
- ✅ 有版本历史记录
- ✅ 支持回滚

**缺点**：
- ❌ 需要懂基本的 Git 操作
- ❌ 更新有延迟（1-3分钟）

---

### 方案二：使用 GitHub API 自动更新

**适用场景**：想要网页端直接更新，无需本地操作

#### 1. 创建 GitHub Personal Access Token
1. 进入 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并保存 Token（只显示一次）

#### 2. 修改编辑器，添加自动推送功能

在 `editor.html` 中添加以下代码：

```html
<script>
// GitHub 配置
const GITHUB_CONFIG = {
    owner: '你的GitHub用户名',
    repo: '你的仓库名',
    token: '你的Personal Access Token',
    branch: 'main',
    filePath: 'js/data.js'
};

// 自动推送到 GitHub
async function pushToGitHub() {
    const content = generateDataJS();
    if (!content) return;
    
    try {
        // 获取文件 SHA
        const getFileUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.filePath}`;
        const getResponse = await fetch(getFileUrl, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let sha = null;
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }
        
        // 更新文件
        const updateData = {
            message: `Update navigation data - ${new Date().toLocaleString('zh-CN')}`,
            content: btoa(unescape(encodeURIComponent(content))),
            branch: GITHUB_CONFIG.branch
        };
        
        if (sha) {
            updateData.sha = sha;
        }
        
        const updateResponse = await fetch(getFileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (updateResponse.ok) {
            showNotification('✅ 已推送到 GitHub，网站将在 1-3 分钟后更新');
        } else {
            const error = await updateResponse.json();
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('推送失败:', error);
        showNotification('❌ 推送失败: ' + error.message, 'error');
    }
}
</script>

<!-- 在导出按钮旁边添加自动推送按钮 -->
<button onclick="pushToGitHub()" class="btn btn-primary">
    🚀 保存并推送到 GitHub
</button>
```

**优点**：
- ✅ 网页端直接更新
- ✅ 自动触发部署
- ✅ 无需本地环境

**缺点**：
- ❌ Token 需要妥善保管（不要暴露在公开网页中）
- ❌ 仍有 1-3 分钟延迟

---

### 方案三：使用云数据库 + API（需要后端）

**适用场景**：多人协作、需要实时更新

#### 架构说明
```
前端页面 (GitHub/CF Pages)
    ↓
API 服务 (Cloudflare Workers / Vercel)
    ↓
云数据库 (Cloudflare KV / Supabase / Firebase)
```

#### 使用 Cloudflare Workers + KV 实现

##### 1. 创建 Cloudflare Worker

创建文件 `worker.js`：
```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 跨域设置
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // 获取数据
    if (url.pathname === '/api/data' && request.method === 'GET') {
      const data = await env.NAV_DATA.get('navigation', 'json');
      return new Response(JSON.stringify(data || {}), { headers: corsHeaders });
    }
    
    // 更新数据
    if (url.pathname === '/api/data' && request.method === 'POST') {
      const data = await request.json();
      await env.NAV_DATA.put('navigation', JSON.stringify(data));
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
```

##### 2. 配置 wrangler.toml
```toml
name = "nav-api"
main = "worker.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "NAV_DATA"
id = "你的KV命名空间ID"
```

##### 3. 部署 Worker
```bash
wrangler deploy
```

##### 4. 修改前端代码

修改 `js/app.js`，从 API 加载数据：
```javascript
// 从 API 加载数据
async function loadNavData() {
    try {
        const response = await fetch('https://你的worker.workers.dev/api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('加载数据失败:', error);
        return NAV_DATA; // 降级到本地数据
    }
}

// 初始化时加载
document.addEventListener('DOMContentLoaded', async function() {
    const data = await loadNavData();
    // 使用 data 渲染页面
});
```

修改 `editor.html`，保存数据到 API：
```javascript
async function saveToCloud() {
    try {
        const response = await fetch('https://你的worker.workers.dev/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editorData)
        });
        
        if (response.ok) {
            showNotification('✅ 数据已实时保存到云端');
        }
    } catch (error) {
        showNotification('❌ 保存失败: ' + error.message, 'error');
    }
}
```

**优点**：
- ✅ 真正的实时更新（秒级）
- ✅ 支持多人协作
- ✅ 数据集中管理

**缺点**：
- ❌ 需要配置后端服务
- ❌ 可能有流量成本（Cloudflare Workers 免费额度：每天100,000次请求）

---

### 方案四：使用第三方存储服务

#### 使用 Gist 作为数据存储

##### 1. 创建 GitHub Gist
1. 访问 https://gist.github.com/
2. 创建一个新的 Gist，文件名为 `nav-data.json`
3. 保存 Gist ID

##### 2. 修改前端加载逻辑
```javascript
// 从 Gist 加载数据
async function loadFromGist() {
    const gistId = '你的Gist_ID';
    const response = await fetch(`https://api.github.com/gists/${gistId}`);
    const gist = await response.json();
    const content = gist.files['nav-data.json'].content;
    return JSON.parse(content);
}
```

**优点**：
- ✅ 完全免费
- ✅ 简单易用

**缺点**：
- ❌ Gist 是公开的
- ❌ 有 API 请求限制

---

## 📊 方案对比

| 方案 | 实时性 | 成本 | 难度 | 推荐度 |
|------|--------|------|------|--------|
| 本地编辑 + Git 推送 | ⭐⭐⭐ (1-3分钟) | 免费 | ⭐ | ⭐⭐⭐⭐⭐ |
| GitHub API 自动推送 | ⭐⭐⭐ (1-3分钟) | 免费 | ⭐⭐ | ⭐⭐⭐⭐ |
| Cloudflare Workers + KV | ⭐⭐⭐⭐⭐ (实时) | 免费额度内 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Gist 存储 | ⭐⭐⭐⭐ (秒级) | 免费 | ⭐⭐ | ⭐⭐⭐ |

---

## 🎯 推荐方案

### 个人使用
**推荐：方案一（本地编辑 + Git 推送）**
- 操作简单，完全免费
- 数据安全，有版本控制
- 1-3分钟更新延迟可接受

### 需要网页端编辑
**推荐：方案二（GitHub API 自动推送）**
- 在编辑器中添加自动推送功能
- 无需本地环境
- 仍然完全免费

### 需要实时更新
**推荐：方案三（Cloudflare Workers）**
- 真正的实时更新
- Cloudflare 免费额度充足
- 适合多人协作场景

---

## 🛠️ 常见问题解答

### Q1: GitHub Pages 部署后看不到更新？
**A**: 清除浏览器缓存，或使用无痕模式访问。GitHub Pages 可能需要 1-5 分钟才能生效。

### Q2: Cloudflare Pages 部署失败？
**A**: 检查构建设置，确保 "Build output directory" 设置为 `/`，"Build command" 