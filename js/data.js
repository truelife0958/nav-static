/**
 * 导航网站数据配置文件
 * 
 * 这是唯一需要修改的数据文件，用于管理所有菜单、子菜单和卡片内容
 * 修改此文件后刷新页面即可看到更新
 */

const NAV_DATA = {
  // ========== 网站设置 ==========
  settings: {
    siteTitle: "我的导航网站",
    siteDescription: "快速访问您喜爱的网站",
    siteFooter: "© 2024 我的导航",
    siteProjectUrl: "",
    siteAuthor: "",
    sitePrimaryColor: "#667eea",
    siteSecondaryColor: "#764ba2"
  },
  
  // ========== 菜单配置 ==========
  // 每个菜单可以包含多个子菜单
  menus: [
    {
      id: 1,
      name: "常用工具",
      icon: "🔧",
      order: 1,
      subMenus: [
        { id: 11, name: "开发工具", parentId: 1, order: 1 },
        { id: 12, name: "设计工具", parentId: 1, order: 2 },
        { id: 13, name: "效率工具", parentId: 1, order: 3 }
      ]
    },
    {
      id: 2,
      name: "学习资源",
      icon: "📚",
      order: 2,
      subMenus: [
        { id: 21, name: "编程学习", parentId: 2, order: 1 },
        { id: 22, name: "视频教程", parentId: 2, order: 2 },
        { id: 23, name: "文档手册", parentId: 2, order: 3 }
      ]
    },
    {
      id: 3,
      name: "社交媒体",
      icon: "💬",
      order: 3,
      subMenus: [
        { id: 31, name: "社交平台", parentId: 3, order: 1 },
        { id: 32, name: "技术社区", parentId: 3, order: 2 }
      ]
    },
    {
      id: 4,
      name: "娱乐休闲",
      icon: "🎮",
      order: 4,
      subMenus: [
        { id: 41, name: "视频网站", parentId: 4, order: 1 },
        { id: 42, name: "音乐平台", parentId: 4, order: 2 },
        { id: 43, name: "游戏娱乐", parentId: 4, order: 3 }
      ]
    }
  ],
  
  // ========== 卡片配置 ==========
  // menuId 对应上面的子菜单 id
  cards: [
    // 开发工具 (menuId: 11)
    {
      id: 1,
      menuId: 11,
      title: "GitHub",
      description: "全球最大的代码托管平台和开源社区",
      url: "https://github.com",
      icon: "https://github.com/favicon.ico",
      tags: ["代码托管", "开源", "协作"],
      order: 1
    },
    {
      id: 2,
      menuId: 11,
      title: "VS Code",
      description: "微软出品的免费开源代码编辑器",
      url: "https://code.visualstudio.com",
      icon: "https://code.visualstudio.com/favicon.ico",
      tags: ["编辑器", "IDE", "开发"],
      order: 2
    },
    {
      id: 3,
      menuId: 11,
      title: "Stack Overflow",
      description: "程序员问答社区，解决编程问题",
      url: "https://stackoverflow.com",
      icon: "https://stackoverflow.com/favicon.ico",
      tags: ["问答", "社区", "解决方案"],
      order: 3
    },
    {
      id: 4,
      menuId: 11,
      title: "CodePen",
      description: "在线代码编辑器和前端展示平台",
      url: "https://codepen.io",
      icon: "https://codepen.io/favicon.ico",
      tags: ["在线编辑", "前端", "展示"],
      order: 4
    },
    
    // 设计工具 (menuId: 12)
    {
      id: 5,
      menuId: 12,
      title: "Figma",
      description: "协作式界面设计工具",
      url: "https://www.figma.com",
      icon: "https://www.figma.com/favicon.ico",
      tags: ["UI设计", "协作", "原型"],
      order: 1
    },
    {
      id: 6,
      menuId: 12,
      title: "Canva",
      description: "在线平面设计平台",
      url: "https://www.canva.com",
      icon: "https://www.canva.com/favicon.ico",
      tags: ["平面设计", "模板", "简单"],
      order: 2
    },
    {
      id: 7,
      menuId: 12,
      title: "Adobe Color",
      description: "配色方案生成和探索工具",
      url: "https://color.adobe.com",
      icon: "https://color.adobe.com/favicon.ico",
      tags: ["配色", "色彩", "设计"],
      order: 3
    },
    
    // 效率工具 (menuId: 13)
    {
      id: 8,
      menuId: 13,
      title: "Notion",
      description: "全能型笔记和协作工具",
      url: "https://www.notion.so",
      icon: "https://www.notion.so/favicon.ico",
      tags: ["笔记", "协作", "知识管理"],
      order: 1
    },
    {
      id: 9,
      menuId: 13,
      title: "Trello",
      description: "可视化项目管理工具",
      url: "https://trello.com",
      icon: "https://trello.com/favicon.ico",
      tags: ["项目管理", "看板", "协作"],
      order: 2
    },
    
    // 编程学习 (menuId: 21)
    {
      id: 10,
      menuId: 21,
      title: "MDN Web Docs",
      description: "权威的Web开发文档",
      url: "https://developer.mozilla.org",
      icon: "https://developer.mozilla.org/favicon.ico",
      tags: ["文档", "Web", "教程"],
      order: 1
    },
    {
      id: 11,
      menuId: 21,
      title: "菜鸟教程",
      description: "提供各种编程语言的基础教程",
      url: "https://www.runoob.com",
      icon: "https://www.runoob.com/favicon.ico",
      tags: ["教程", "中文", "基础"],
      order: 2
    },
    {
      id: 12,
      menuId: 21,
      title: "LeetCode",
      description: "算法题库和编程训练平台",
      url: "https://leetcode.cn",
      icon: "https://leetcode.cn/favicon.ico",
      tags: ["算法", "刷题", "面试"],
      order: 3
    },
    
    // 视频教程 (menuId: 22)
    {
      id: 13,
      menuId: 22,
      title: "B站",
      description: "国内优质的视频学习平台",
      url: "https://www.bilibili.com",
      icon: "https://www.bilibili.com/favicon.ico",
      tags: ["视频", "学习", "中文"],
      order: 1
    },
    {
      id: 14,
      menuId: 22,
      title: "YouTube",
      description: "全球最大的视频分享平台",
      url: "https://www.youtube.com",
      icon: "https://www.youtube.com/favicon.ico",
      tags: ["视频", "教程", "全球"],
      order: 2
    },
    
    // 文档手册 (menuId: 23)
    {
      id: 15,
      menuId: 23,
      title: "Vue.js",
      description: "渐进式JavaScript框架官方文档",
      url: "https://cn.vuejs.org",
      icon: "https://cn.vuejs.org/logo.svg",
      tags: ["Vue", "框架", "文档"],
      order: 1
    },
    {
      id: 16,
      menuId: 23,
      title: "React",
      description: "用于构建用户界面的JavaScript库",
      url: "https://react.dev",
      icon: "https://react.dev/favicon.ico",
      tags: ["React", "框架", "文档"],
      order: 2
    },
    
    // 社交平台 (menuId: 31)
    {
      id: 17,
      menuId: 31,
      title: "微博",
      description: "中国领先的社交媒体平台",
      url: "https://weibo.com",
      icon: "https://weibo.com/favicon.ico",
      tags: ["社交", "资讯", "中文"],
      order: 1
    },
    {
      id: 18,
      menuId: 31,
      title: "Twitter",
      description: "全球实时公共对话平台",
      url: "https://twitter.com",
      icon: "https://twitter.com/favicon.ico",
      tags: ["社交", "全球", "资讯"],
      order: 2
    },
    
    // 技术社区 (menuId: 32)
    {
      id: 19,
      menuId: 32,
      title: "掘金",
      description: "中文技术分享社区",
      url: "https://juejin.cn",
      icon: "https://juejin.cn/favicon.ico",
      tags: ["技术", "社区", "中文"],
      order: 1
    },
    {
      id: 20,
      menuId: 32,
      title: "知乎",
      description: "中文互联网高质量问答社区",
      url: "https://www.zhihu.com",
      icon: "https://www.zhihu.com/favicon.ico",
      tags: ["问答", "知识", "社区"],
      order: 2
    },
    
    // 视频网站 (menuId: 41)
    {
      id: 21,
      menuId: 41,
      title: "爱奇艺",
      description: "中国领先的视频平台",
      url: "https://www.iqiyi.com",
      icon: "https://www.iqiyi.com/favicon.ico",
      tags: ["视频", "影视", "娱乐"],
      order: 1
    },
    {
      id: 22,
      menuId: 41,
      title: "腾讯视频",
      description: "在线视频媒体平台",
      url: "https://v.qq.com",
      icon: "https://v.qq.com/favicon.ico",
      tags: ["视频", "影视", "娱乐"],
      order: 2
    },
    
    // 音乐平台 (menuId: 42)
    {
      id: 23,
      menuId: 42,
      title: "网易云音乐",
      description: "国内领先的音乐平台",
      url: "https://music.163.com",
      icon: "https://music.163.com/favicon.ico",
      tags: ["音乐", "歌单", "社交"],
      order: 1
    },
    {
      id: 24,
      menuId: 42,
      title: "QQ音乐",
      description: "中国领先的在线音乐平台",
      url: "https://y.qq.com",
      icon: "https://y.qq.com/favicon.ico",
      tags: ["音乐", "听歌", "K歌"],
      order: 2
    },
    
    // 游戏娱乐 (menuId: 43)
    {
      id: 25,
      menuId: 43,
      title: "Steam",
      description: "全球最大的PC游戏平台",
      url: "https://store.steampowered.com",
      icon: "https://store.steampowered.com/favicon.ico",
      tags: ["游戏", "PC", "平台"],
      order: 1
    },
    {
      id: 26,
      menuId: 43,
      title: "4399小游戏",
      description: "休闲小游戏集合网站",
      url: "https://www.4399.com",
      icon: "https://www.4399.com/favicon.ico",
      tags: ["小游戏", "休闲", "免费"],
      order: 2
    }
  ],
  
  // ========== 友情链接配置 ==========
  friendLinks: [
    {
      id: 1,
      title: "GitHub",
      url: "https://github.com",
      logo: "https://github.com/favicon.ico"
    },
    {
      id: 2,
      title: "Google",
      url: "https://www.google.com",
      logo: "https://www.google.com/favicon.ico"
    },
    {
      id: 3,
      title: "百度",
      url: "https://www.baidu.com",
      logo: "https://www.baidu.com/favicon.ico"
    },
    {
      id: 4,
      title: "知乎",
      url: "https://www.zhihu.com",
      logo: "https://www.zhihu.com/favicon.ico"
    },
    {
      id: 5,
      title: "掘金",
      url: "https://juejin.cn",
      logo: "https://juejin.cn/favicon.ico"
    },
    {
      id: 6,
      title: "CSDN",
      url: "https://www.csdn.net",
      logo: "https://www.csdn.net/favicon.ico"
    }
  ]
};

// ========== 使用说明 ==========
/**
 * 如何添加新菜单：
 * 1. 在 menus 数组中添加新对象
 * 2. 设置唯一的 id、名称 name、图标 icon
 * 3. 在 subMenus 数组中添加子菜单，注意 parentId 要对应父菜单的 id
 * 
 * 如何添加新卡片：
 * 1. 在 cards 数组中添加新对象
 * 2. 设置唯一的 id
 * 3. menuId 对应要显示在哪个子菜单下
 * 4. 填写标题、描述、链接、图标和标签
 * 
 * 提示：
 * - icon 可以使用 emoji 或者图片链接
 * - 卡片的 icon 建议使用网站的 favicon
 * - tags 数组可以添加多个标签
 * - order 字段用于排序，数字越小越靠前
 */