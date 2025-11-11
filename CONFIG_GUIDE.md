# 📖 数据配置指南

这是一份完整的数据配置说明，帮助您快速修改导航网站的内容。

## 🎯 快速开始

所有数据配置都在 `js/data.js` 文件中，您只需要修改这一个文件即可更新整个网站的内容。

---

## 📁 文件结构

```
static-nav/
├── index.html          # 主页面（无需修改）
├── js/
│   ├── data.js        # ⭐ 数据配置文件（主要修改此文件）
│   ├── app.js         # 应用逻辑（无需修改）
│   └── stars.js       # 星空背景（无需修改）
├── css/
│   └── style.css      # 样式文件（可选修改）
└── CONFIG_GUIDE.md    # 本配置指南
```

---

## 🔧 数据结构说明

### 1️⃣ 网站基本信息

```javascript
const NAV_DATA = {
  siteTitle: "我的导航网站",        // 网站标题
  siteDescription: "快速访问您喜爱的网站",  // 网站描述
  
  menus: [...],      // 菜单配置
  cards: [...],      // 卡片配置
  friendLinks: [...] // 友情链接配置
};
```

---

### 2️⃣ 菜单配置 (menus)

菜单是顶部的主要导航分类。

#### 菜单结构：
```javascript
{
  id: 1,              // 唯一标识，不能重复
  name: "常用工具",    // 菜单名称
  icon: "🔧",         // 菜单图标（可使用 emoji）
  order: 1,           // 排序序号，数字越小越靠前
  subMenus: [...]     // 子菜单数组
}
```

#### 子菜单结构：
```javascript
{
  id: 11,             // 唯一标识，不能重复
  name: "开发工具",    // 子菜单名称
  parentId: 1,        // 父菜单ID（对应上面的菜单ID）
  order: 1            // 排序序号
}
```

#### 示例 - 添加新菜单：
```javascript
{
  id: 5,              // 新的唯一ID
  name: "在线工具",    // 菜单名称
  icon: "⚡",         // 图标
  order: 5,           // 排序（显示在第5位）
  subMenus: [
    { id: 51, name: "格式转换", parentId: 5, order: 1 },
    { id: 52, name: "代码工具", parentId: 5, order: 2 }
  ]
}
```

---

### 3️⃣ 卡片配置 (cards)

卡片是每个子菜单下显示的网站链接。

#### 卡片结构：
```javascript
{
  id: 1,                    // 唯一标识，不能重复
  menuId: 11,               // 所属子菜单ID
  title: "GitHub",          // 卡片标题
  description: "代码托管平台", // 卡片描述
  url: "https://github.com", // 网站链接
  icon: "",                 // 图标（可选，留空自动获取）
  tags: ["代码", "开源"],    // 标签（可选）
  order: 1                  // 排序序号
}
```

#### 图标说明：
- **留空**：系统自动从网站获取 favicon
- **指定链接**：使用指定的图片URL
- **推荐**：留空让系统自动获取

#### 示例 - 添加新卡片：
```javascript
{
  id: 100,                      // 新的唯一ID
  menuId: 51,                   // 显示在"格式转换"子菜单下
  title: "JSON格式化",
  description: "在线JSON格式化和验证工具",
  url: "https://www.json.cn",
  icon: "",                     // 留空自动获取
  tags: ["JSON", "格式化", "验证"],
  order: 1
}
```

---

### 4️⃣ 友情链接配置 (friendLinks)

友情链接显示在页脚的弹窗中。

#### 友情链接结构：
```javascript
{
  id: 1,                        // 唯一标识
  title: "GitHub",              // 链接标题
  url: "https://github.com",    // 链接地址
  logo: "https://github.com/favicon.ico"  // 图标（可选）
}
```

#### 示例 - 添加友情链接：
```javascript
{
  id: 7,
  title: "我的博客",
  url: "https://myblog.com",
  logo: ""  // 留空使用首字母作为图标
}
```

---

## 🚀 常见操作

### ✅ 添加新菜单

1. **找到 `menus` 数组**
2. **在数组末尾添加新菜单对象**
3. **设置唯一的 `id`**
4. **添加子菜单**

```javascript
// 在 menus 数组中添加
{
  id: 6,
  name: "资源下载",
  icon: "📥",
  order: 6,
  subMenus: [
    { id: 61, name: "软件下载", parentId: 6, order: 1 },
    { id: 62, name: "素材资源", parentId: 6, order: 2 }
  ]
}
```

### ✅ 添加新卡片

1. **找到 `cards` 数组**
2. **确定要添加到哪个子菜单（找到对应的 `menuId`）**
3. **在数组末尾添加新卡片对象**

```javascript
// 在 cards 数组中添加
{
  id: 101,
  menuId: 61,  // 显示在"软件下载"子菜单下
  title: "腾讯软件中心",
  description: "安全的软件下载平台",
  url: "https://pc.qq.com",
  icon: "",  // 留空自动获取
  tags: ["软件", "下载", "安全"],
  order: 1
}
```

### ✅ 删除菜单/卡片

直接删除对应的对象即可，注意保持数组格式正确。

### ✅ 修改顺序

修改 `order` 字段的数值，数字越小越靠前。

### ✅ 修改网站标题

修改顶部的 `siteTitle` 和 `siteDescription`。

---

## ⚠️ 注意事项

1. **ID 必须唯一**
   - 每个菜单、子菜单、卡片的 `id` 都不能重复
   - 建议使用递增的数字

2. **menuId 要对应**
   - 卡片的 `menuId` 必须对应某个子菜单的 `id`
   - 子菜单的 `parentId` 必须对应某个菜单的 `id`

3. **保持 JSON 格式正确**
   - 注意逗号：最后一个对象后面不要加逗号
   - 注意括号：确保所有括号成对出现
   - 注意引号：字符串必须用引号包裹

4. **修改后刷新页面**
   - 保存 `data.js` 文件后
   - 刷新浏览器页面（Ctrl+F5 强制刷新）

---

## 📝 完整示例

这是一个完整的添加新分类的示例：

```javascript
// 1. 添加新菜单（在 menus 数组中）
{
  id: 7,
  name: "实用工具",
  icon: "🛠️",
  order: 7,
  subMenus: [
    { id: 71, name: "翻译工具", parentId: 7, order: 1 },
    { id: 72, name: "图片处理", parentId: 7, order: 2 }
  ]
}

// 2. 添加对应的卡片（在 cards 数组中）
{
  id: 201,
  menuId: 71,  // 显示在"翻译工具"下
  title: "Google 翻译",
  description: "全球领先的翻译服务",
  url: "https://translate.google.com",
  icon: "",
  tags: ["翻译", "多语言"],
  order: 1
},
{
  id: 202,
  menuId: 71,
  title: "DeepL",
  description: "高质量AI翻译",
  url: "https://www.deepl.com",
  icon: "",
  tags: ["翻译", "AI"],
  order: 2
},
{
  id: 203,
  menuId: 72,  // 显示在"图片处理"下
  title: "TinyPNG",
  description: "在线图片压缩工具",
  url: "https://tinypng.com",
  icon: "",
  tags: ["图片", "压缩"],
  order: 1
}
```

---

## 🎨 高级自定义

### 修改样式

如果需要修改颜色、字体、间距等样式：
- 编辑 `css/style.css` 文件
- 主要变量在文件开头的 `:root` 部分

### 修改背景

在 `css/style.css` 中找到 `.background-image` 类：
```css
.background-image {
  background-image: url('../public/background.webp');
}
```

---

## 💡 技巧和建议

1. **使用有意义的ID**
   - 菜单：1, 2, 3, 4...
   - 子菜单：11, 12, 13... (第一位数字对应父菜单)
   - 卡片：按顺序递增

2. **合理分类**
   - 每个菜单建议 2-5 个子菜单
   - 每个子菜单建议 3-12 个卡片

3. **优化加载速度**
   - icon 留空让系统自动获取
   - 使用 CDN 图片链接

4. **定期备份**
   - 修改前备份 `data.js` 文件
   - 避免误删重要数据

---

## 🔗 相关文件

- `js/data.js` - 数据配置文件（主要修改）
- `index.html` - HTML结构
- `js/app.js` - 应用逻辑
- `css/style.css` - 样式文件
- `README.md` - 项目说明

---

## ❓ 常见问题

**Q: 修改后页面没有更新？**
A: 使用 Ctrl+F5 强制刷新浏览器缓存

**Q: 图标不显示？**
A: icon 字段留空，让系统自动获取网站 favicon

**Q: 添加新卡片后找不到？**
A: 检查 menuId 是否正确对应子菜单的 id

**Q: 页面显示空白？**
A: 可能是 JSON 格式错误，检查括号和逗号是否正确

**Q: 如何调整卡片显示顺序？**
A: 修改卡片的 order 字段，数字越小越靠前

---

## 📞 需要帮助？

如果遇到问题：
1. 检查浏览器控制台是否有错误提示（F12打开）
2. 确认 JSON 格式是否正确
3. 参考本文档的示例代码
4. 对比原有的数据结构

---

**祝您使用愉快！** 🎉