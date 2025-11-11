
/**
 * 导航网站应用逻辑 - 优化版
 * 支持滑动切换、自动获取ICO图标
 */

// ========== 应用状态管理 ==========
const AppState = {
  currentMenuId: null,
  currentSubMenuId: null,
  currentMenuIndex: 0,
  currentSubMenuIndex: 0,
  allCards: [],
  allMenus: [],
  friendLinks: [],
  searchEngines: [
    {
      name: 'google',
      label: 'Google',
      placeholder: 'Google 搜索...',
      url: q => `https://www.google.com/search?q=${encodeURIComponent(q)}`
    },
    {
      name: 'baidu',
      label: '百度',
      placeholder: '百度搜索...',
      url: q => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`
    },
    {
      name: 'bing',
      label: 'Bing',
      placeholder: 'Bing 搜索...',
      url: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}`
    },
    {
      name: 'github',
      label: 'GitHub',
      placeholder: 'GitHub 搜索...',
      url: q => `https://github.com/search?q=${encodeURIComponent(q)}&type=repositories`
    },
    {
      name: 'site',
      label: '站内',
      placeholder: '站内搜索...',
      url: null
    }
  ],
  selectedEngine: null,
  searchQuery: '',
  animationType: 'slideUp'
};

// ========== 自动获取网站ICO图标 ==========
function getAutoIcon(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // 使用Google的favicon API获取图标（sz=128获取高清图标）
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    console.warn('获取图标失败:', url, e);
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath fill="%23999" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/%3E%3C/svg%3E';
  }
}

// ========== 图标加载失败的备用方案 ==========
function getIconFallback(domain) {
  // 生成一个基于域名的彩色首字母图标
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];
  
  // 获取域名首字母
  const letter = domain.charAt(0).toUpperCase();
  
  // 返回一个带首字母的SVG图标
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${encodeURIComponent(color)}'/%3E%3Ctext x='50' y='50' dominant-baseline='central' text-anchor='middle' font-size='50' fill='white' font-family='Arial, sans-serif' font-weight='bold'%3E${letter}%3C/text%3E%3C/svg%3E`;
}

// ========== 初始化应用 ==========
function initApp() {
  console.log('🚀 导航网站初始化...');
  
  // 应用网站设置
  applySiteSettings();
  
  AppState.allMenus = NAV_DATA.menus;
  AppState.allCards = NAV_DATA.cards;
  AppState.friendLinks = NAV_DATA.friendLinks || [];
  AppState.selectedEngine = AppState.searchEngines[0];
  
  renderSearchEngines();
  renderMenuBar();
  renderFriendLinks();
  bindEvents();
  
  // 默认选中第一个菜单
  if (AppState.allMenus.length > 0) {
    AppState.currentMenuIndex = 0;
    selectMenu(AppState.allMenus[0].id);
  }
  
  console.log('✅ 导航网站初始化完成');
}

// ========== 应用网站设置 ==========
function applySiteSettings() {
  const settings = NAV_DATA.settings || {};
  
  // 设置标题
  if (settings.siteTitle) {
    const titleEl = document.getElementById('siteTitle');
    if (titleEl) {
      titleEl.textContent = settings.siteTitle;
      document.title = settings.siteTitle;
    }
  }
  
  // 设置描述
  if (settings.siteDescription) {
    const descEl = document.getElementById('siteDescription');
    if (descEl) {
      descEl.setAttribute('content', settings.siteDescription);
    }
  }
  
  // 设置页脚
  if (settings.siteFooter) {
    const footerEl = document.getElementById('siteFooter');
    if (footerEl) {
      let footerHTML = settings.siteFooter;
      
      // 如果有项目链接和作者，添加到页脚
      if (settings.siteProjectUrl && settings.siteAuthor) {
        footerHTML += ` | <a href="${settings.siteProjectUrl}" target="_blank" class="footer-link">Powered by ${settings.siteAuthor}</a>`;
      } else if (settings.siteProjectUrl) {
        footerHTML += ` | <a href="${settings.siteProjectUrl}" target="_blank" class="footer-link">项目地址</a>`;
      } else if (settings.siteAuthor) {
        footerHTML += ` | ${settings.siteAuthor}`;
      }
      
      footerEl.innerHTML = footerHTML;
    }
  }
  
  // 背景图片已改为纯星空背景，不需要动态设置
  
  // 设置主题色
  if (settings.sitePrimaryColor) {
    document.documentElement.style.setProperty('--primary-color', settings.sitePrimaryColor);
  }
  
  if (settings.siteSecondaryColor) {
    document.documentElement.style.setProperty('--secondary-color', settings.siteSecondaryColor);
  }
}

// ========== 渲染搜索引擎选择 ==========
function renderSearchEngines() {
  const container = document.getElementById('searchEngineSelect');
  if (!container) return;
  
  container.innerHTML = AppState.searchEngines.map(engine => `
    <button class="engine-btn ${engine.name === AppState.selectedEngine.name ? 'active' : ''}" 
            data-engine="${engine.name}">
      ${engine.label}
    </button>
  `).join('');
  
  container.querySelectorAll('.engine-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectSearchEngine(btn.dataset.engine);
    });
  });
}

// ========== 选择搜索引擎 ==========
function selectSearchEngine(engineName) {
  AppState.selectedEngine = AppState.searchEngines.find(e => e.name === engineName);
  
  document.querySelectorAll('.engine-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.engine === engineName);
  });
  
  const input = document.getElementById('searchInput');
  if (input) {
    input.placeholder = AppState.selectedEngine.placeholder;
  }
}

// ========== 渲染菜单栏 ==========
function renderMenuBar() {
  const menuBar = document.getElementById('menuBar');
  if (!menuBar) return;
  
  const sortedMenus = [...AppState.allMenus].sort((a, b) => a.order - b.order);
  
  menuBar.innerHTML = sortedMenus.map(menu => `
    <div class="menu-item">
      <button class="menu-btn" data-id="${menu.id}">
        ${menu.name}
      </button>
    </div>
  `).join('');
  
  // 绑定菜单点击事件
  menuBar.querySelectorAll('.menu-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const menuId = parseInt(btn.dataset.id);
      AppState.currentMenuIndex = index;
      selectMenu(menuId);
    });
  });
  
  // 设置菜单滑动切换（只设置一次）
  setupMenuSwipe(menuBar, sortedMenus);
}

// ========== 设置菜单滑动切换 ==========
function setupMenuSwipe(menuBar, menus) {
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  
  // 鼠标滑动
  menuBar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.menu-btn')) {
      isDragging = true;
      startX = e.pageX;
      startY = e.pageY;
    }
  });
  
  menuBar.addEventListener('mousemove', (e) => {
    if (isDragging && Math.abs(e.pageX - startX) > 5) {
      e.preventDefault();
    }
  });
  
  menuBar.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    
    const endX = e.pageX;
    const endY = e.pageY;
    const diffX = startX - endX;
    const diffY = Math.abs(startY - endY);
    
    // 横向滑动超过80px，且纵向移动小于50px才触发切换
    if (Math.abs(diffX) > 80 && diffY < 50) {
      e.preventDefault();
      if (diffX > 0 && AppState.currentMenuIndex < menus.length - 1) {
        // 向左滑动，显示下一个菜单
        AppState.currentMenuIndex++;
        selectMenu(menus[AppState.currentMenuIndex].id);
      } else if (diffX < 0 && AppState.currentMenuIndex > 0) {
        // 向右滑动，显示上一个菜单
        AppState.currentMenuIndex--;
        selectMenu(menus[AppState.currentMenuIndex].id);
      }
    }
  });
  
  // 触摸滑动
  let touchStartX = 0;
  let touchStartY = 0;
  
  menuBar.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].pageX;
    touchStartY = e.touches[0].pageY;
  }, { passive: true });
  
  menuBar.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].pageX;
    const touchEndY = e.changedTouches[0].pageY;
    const diffX = touchStartX - touchEndX;
    const diffY = Math.abs(touchStartY - touchEndY);
    
    // 横向滑动超过80px，且纵向移动小于50px才触发切换
    if (Math.abs(diffX) > 80 && diffY < 50) {
      if (diffX > 0 && AppState.currentMenuIndex < menus.length - 1) {
        // 向左滑动，显示下一个菜单
        AppState.currentMenuIndex++;
        selectMenu(menus[AppState.currentMenuIndex].id);
      } else if (diffX < 0 && AppState.currentMenuIndex > 0) {
        // 向右滑动，显示上一个菜单
        AppState.currentMenuIndex--;
        selectMenu(menus[AppState.currentMenuIndex].id);
      }
    }
  }, { passive: true });
}

// ========== 选择菜单 ==========
function selectMenu(menuId) {
  if (!menuId) {
    console.error('菜单ID不能为空');
    return;
  }
  
  const previousMenuId = AppState.currentMenuId;
  AppState.currentMenuId = menuId;
  
  // 更新菜单激活状态
  document.querySelectorAll('.menu-btn').forEach(btn => {
    const isActive = parseInt(btn.dataset.id) === menuId;
    btn.classList.toggle('active', isActive);
  });
  
  // 渲染子菜单
  renderSubMenus(menuId);
  
  // 如果有子菜单，选择第一个
  const menu = AppState.allMenus.find(m => m.id === menuId);
  if (menu && menu.subMenus && menu.subMenus.length > 0) {
    AppState.currentSubMenuIndex = 0;
    selectSubMenu(menu.subMenus[0].id);
    
    // 显示子菜单区域（折叠展开）
    const submenuSection = document.querySelector('.submenu-section');
    if (submenuSection) {
      submenuSection.classList.add('show');
    }
  } else {
    // 没有子菜单，直接显示该菜单的卡片
    AppState.currentSubMenuId = null;
    renderCards();
    
    // 隐藏子菜单区域
    const submenuSection = document.querySelector('.submenu-section');
    if (submenuSection) {
      submenuSection.classList.remove('show');
    }
  }
}

// ========== 渲染子菜单 ==========
function renderSubMenus(menuId) {
  const submenuScroll = document.getElementById('submenuScroll');
  const submenuSection = document.querySelector('.submenu-section');
  
  if (!submenuScroll || !submenuSection) return;
  
  const menu = AppState.allMenus.find(m => m.id === menuId);
  
  if (!menu || !menu.subMenus || menu.subMenus.length === 0) {
    submenuSection.classList.remove('show');
    return;
  }
  
  const sortedSubMenus = [...menu.subMenus].sort((a, b) => a.order - b.order);
  
  submenuScroll.innerHTML = sortedSubMenus.map(subMenu => `
    <button class="submenu-item" data-id="${subMenu.id}">
      ${subMenu.name}
    </button>
  `).join('');
  
  // 绑定子菜单点击事件
  submenuScroll.querySelectorAll('.submenu-item').forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      // 如果没有拖动，才触发点击
      if (!btn.dataset.dragging || btn.dataset.dragging === 'false') {
        AppState.currentSubMenuIndex = index;
        selectSubMenu(parseInt(btn.dataset.id));
      }
      btn.dataset.dragging = 'false';
    });
  });
  
  // 添加滑动切换功能
  setupSubMenuScroll(submenuScroll, sortedSubMenus);
}

// ========== 设置子菜单滑动切换 ==========
function setupSubMenuScroll(container, subMenus) {
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  
  // 鼠标滑动切换
  container.addEventListener('mousedown', (e) => {
    if (e.target.closest('.submenu-item')) {
      isDragging = true;
      startX = e.pageX;
      startY = e.pageY;
    }
  });
  
  container.addEventListener('mousemove', (e) => {
    if (isDragging && Math.abs(e.pageX - startX) > 5) {
      const btn = e.target.closest('.submenu-item');
      if (btn) btn.dataset.dragging = 'true';
    }
  });
  
  container.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    
    const endX = e.pageX;
    const endY = e.pageY;
    const diffX = startX - endX;
    const diffY = Math.abs(startY - endY);
    
    // 横向滑动超过80px，且纵向移动小于50px才触发切换
    if (Math.abs(diffX) > 80 && diffY < 50) {
      if (diffX > 0 && AppState.currentSubMenuIndex < subMenus.length - 1) {
        // 向左滑动，显示下一个子菜单
        AppState.currentSubMenuIndex++;
        selectSubMenu(subMenus[AppState.currentSubMenuIndex].id);
      } else if (diffX < 0 && AppState.currentSubMenuIndex > 0) {
        // 向右滑动，显示上一个子菜单
        AppState.currentSubMenuIndex--;
        selectSubMenu(subMenus[AppState.currentSubMenuIndex].id);
      }
    }
    
    // 延迟清除拖动标记
    setTimeout(() => {
      container.querySelectorAll('.submenu-item').forEach(btn => {
        btn.dataset.dragging = 'false';
      });
    }, 100);
  });
  
  container.addEventListener('mouseleave', () => {
    isDragging = false;
  });
  
  // 触摸滑动切换
  let touchStartX = 0;
  let touchStartY = 0;
  
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].pageX;
    touchStartY = e.touches[0].pageY;
  }, { passive: true });
  
  container.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].pageX;
    const touchEndY = e.changedTouches[0].pageY;
    const diffX = touchStartX - touchEndX;
    const diffY = Math.abs(touchStartY - touchEndY);
    
    // 横向滑动超过80px，且纵向移动小于50px才触发切换
    if (Math.abs(diffX) > 80 && diffY < 50) {
      if (diffX > 0 && AppState.currentSubMenuIndex < subMenus.length - 1) {
        // 向左滑动，显示下一个子菜单
        AppState.currentSubMenuIndex++;
        selectSubMenu(subMenus[AppState.currentSubMenuIndex].id);
      } else if (diffX < 0 && AppState.currentSubMenuIndex > 0) {
        // 向右滑动，显示上一个子菜单
        AppState.currentSubMenuIndex--;
        selectSubMenu(subMenus[AppState.currentSubMenuIndex].id);
      }
    }
  }, { passive: true });
}

// ========== 选择子菜单 ==========
function selectSubMenu(subMenuId) {
  if (!subMenuId) {
    console.error('子菜单ID不能为空');
    return;
  }
  
  AppState.currentSubMenuId = subMenuId;
  
  // 更新子菜单激活状态
  document.querySelectorAll('.submenu-item').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.id) === subMenuId);
  });
  
  // 渲染卡片
  renderCards();
}

// ========== 渲染卡片 ==========
function renderCards() {
  const cardGrid = document.getElementById('cardGrid');
  if (!cardGrid) return;
  
  // 筛选当前菜单/子菜单的卡片
  let cards = AppState.allCards.filter(card => {
    if (AppState.currentSubMenuId) {
      return card.menuId === AppState.currentSubMenuId;
    } else {
      // 没有子菜单，显示主菜单下的所有卡片
      const menu = AppState.allMenus.find(m => m.id === AppState.currentMenuId);
      if (menu && menu.subMenus && menu.subMenus.length > 0) {
        const subMenuIds = menu.subMenus.map(sm => sm.id);
        return subMenuIds.includes(card.menuId);
      }
      return card.menuId === AppState.currentMenuId;
    }
  }).sort((a, b) => a.order - b.order);
  
  // 站内搜索过滤
  if (AppState.searchQuery && AppState.selectedEngine.name === 'site') {
    const query = AppState.searchQuery.toLowerCase();
    cards = cards.filter(card =>
      card.title.toLowerCase().includes(query) ||
      (card.description && card.description.toLowerCase().includes(query)) ||
      card.url.toLowerCase().includes(query)
    );
  }
  
  // 渲染卡片HTML
  cardGrid.innerHTML = cards.map(card => createCardHTML(card)).join('');
  
  // 触发动画
  triggerAnimation();
  
  // 设置卡片滚动
  setupCardsScroll(cards);
}

// ========== 创建卡片HTML ==========
function createCardHTML(card) {
  // 第1层：始终使用Google Favicon API获取图标
  const icon = getAutoIcon(card.url);
  
  const description = card.description || '';
  const tooltip = [card.title, description, card.url].filter(Boolean).join('\n');
  
  // 安全地转义HTML特殊字符
  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };
  
  // 高亮搜索关键词
  const highlightText = (text, query) => {
    if (!query || AppState.selectedEngine.name !== 'site') return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
  };
  
  const query = AppState.searchQuery.trim();
  const highlightedTitle = highlightText(card.title, query);
  const displayTitle = card.title.length > 20 ?
    highlightText(card.title.slice(0, 20) + '...', query) :
    highlightedTitle;
  
  // 获取域名用于生成备用图标
  let domain = '';
  try {
    domain = new URL(card.url).hostname;
  } catch (e) {
    domain = 'unknown';
  }
  
  // 第2层备用：Google API失败时使用彩色字母图标
  const finalFallback = getIconFallback(domain);
  
  return `
    <div class="link-item">
      <a href="${escapeHtml(card.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(tooltip)}">
        <img class="link-icon"
             src="${escapeHtml(icon)}"
             alt="${escapeHtml(card.title)}"
             onerror="this.onerror=null;this.src='${finalFallback}';"
             loading="lazy">
        <span class="link-text">${displayTitle}</span>
      </a>
    </div>
  `;
}

// ========== 设置卡片滚动 ==========
function setupCardsScroll(cards) {
  const prevBtn = document.getElementById('cardsPrev');
  const nextBtn = document.getElementById('cardsNext');
  const cardGrid = document.getElementById('cardGrid');
  
  if (!prevBtn || !nextBtn || !cardGrid) return;
  
  // 简单显示/隐藏按钮逻辑
  if (cards.length <= 12) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  } else {
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
    
    let currentPage = 0;
    const itemsPerPage = 12;
    const totalPages = Math.ceil(cards.length / itemsPerPage);
    
    const updateButtons = () => {
      prevBtn.disabled = currentPage === 0;
      nextBtn.disabled = currentPage >= totalPages - 1;
    };
    
    prevBtn.addEventListener('click', () => {
      if (currentPage > 0) {
        currentPage--;
        cardGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
    
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages - 1) {
        currentPage++;
        cardGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
    
    updateButtons();
  }
}

// ========== 触发动画 ==========
function triggerAnimation() {
  const cardGrid = document.getElementById('cardGrid');
  if (!cardGrid) return;
  
  const animations = ['slideUp', 'radial', 'fadeIn', 'slideLeft', 'slideRight', 'convergeIn', 'flipIn'];
  const randomIndex = Math.floor(Math.random() * animations.length);
  AppState.animationType = animations[randomIndex];
  
  animations.forEach(anim => cardGrid.classList.remove(`animate-${anim}`));
  cardGrid.classList.add(`animate-${AppState.animationType}`);
  
  const cards = cardGrid.querySelectorAll('.link-item');
  cards.forEach((card, index) => {
    card.style.animationDelay = getAnimationDelay(index);
  });
  
  setTimeout(() => {
    cardGrid.classList.remove(`animate-${AppState.animationType}`);
  }, 1000);
}

// ========== 获取动画延迟 ==========
function getAnimationDelay(index) {
  const isMobile = window.innerWidth <= 480;
  if (isMobile) return '0s';
  
  const cols = window.innerWidth <= 768 ? 3 : (window.innerWidth <= 900 ? 4 : (window.innerWidth <= 1200 ? 5 : 6));
  
  try {
    switch (AppState.animationType) {
      case 'slideUp':
        return `${index * 0.04}s`;
      case 'radial':
        const row = Math.floor(index / cols);
        const col = index % cols;
        const centerCol = Math.floor(cols / 2);
        return `${(Math.abs(col - centerCol) + row) * 0.06}s`;
      case 'fadeIn':
        return `${Math.random() * 0.4}s`;
      case 'slideLeft':
        return `${Math.floor(index / cols) * 0.08}s`;
      case 'slideRight':
        return `${(Math.floor(index / cols) + (cols - index % cols - 1) * 0.02) * 0.06}s`;
      case 'convergeIn':
        return `${(cols - Math.abs(index % cols - Math.floor(cols / 2)) - 1) * 0.06}s`;
      case 'flipIn':
        return `${(Math.floor(index / cols) + index % cols) * 0.05}s`;
      default:
        return '0s';
    }
  } catch (error) {
    console.error('计算动画延迟失败:', error);
    return '0s';
  }
}

// ========== 渲染友情链接 ==========
function renderFriendLinks() {
  const grid = document.getElementById('friendLinksGrid');
  if (!grid) return;
  
  if (AppState.friendLinks.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">暂无友情链接</p>';
    return;
  }
  
  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };
  
  grid.innerHTML = AppState.friendLinks.map(friend => {
    const firstChar = friend.title.charAt(0).toUpperCase();
    return `
      <a href="${escapeHtml(friend.url)}" target="_blank" rel="noopener noreferrer" class="friend-link-card">
        <div class="friend-link-logo">
          ${friend.logo ?
            `<img src="${escapeHtml(friend.logo)}" alt="${escapeHtml(friend.title)}" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=\\'friend-link-placeholder\\'>${escapeHtml(firstChar)}</div>';" loading="lazy">` :
            `<div class="friend-link-placeholder">${escapeHtml(firstChar)}</div>`
          }
        </div>
        <div class="friend-link-info">
          <h4>${escapeHtml(friend.title)}</h4>
        </div>
      </a>
    `;
  }).join('');
}

// ========== 绑定事件 ==========
function bindEvents() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');
  const searchBtn = document.getElementById('searchBtn');
  
  // 键盘快捷键支持
  setupKeyboardShortcuts();
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value;
      if (clearBtn) {
        clearBtn.style.display = AppState.searchQuery ? 'flex' : 'none';
      }
      if (AppState.selectedEngine.name === 'site') {
        renderCards();
      }
    });
    
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      AppState.searchQuery = '';
      if (searchInput) searchInput.value = '';
      clearBtn.style.display = 'none';
      if (AppState.selectedEngine.name === 'site') {
        renderCards();
      }
    });
  }
  
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }
  
  // 友情链接按钮
  const friendLinkBtn = document.getElementById('friendLinkBtn');
  const modal = document.getElementById('friendLinksModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  
  if (friendLinkBtn && modal) {
    friendLinkBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
    });
  }
  
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
}

// ========== 键盘快捷键 ==========
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 如果焦点在输入框或文本区域，不响应快捷键（除了ESC）
    const isInputFocused = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    
    // ESC键总是响应
    if (e.key === 'Escape') {
      const modal = document.getElementById('friendLinksModal');
      if (modal && modal.style.display === 'flex') {
        modal.style.display = 'none';
        return;
      }
      // 如果搜索框有焦点，则失焦
      if (isInputFocused) {
        e.target.blur();
      }
      return;
    }
    
    // 其他快捷键在输入框聚焦时不响应
    if (isInputFocused) return;
    
    switch(e.key) {
      case '/':
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        break;
        
      case 'ArrowLeft':
        if (AppState.currentMenuIndex > 0) {
          e.preventDefault();
          AppState.currentMenuIndex--;
          selectMenu(AppState.allMenus[AppState.currentMenuIndex].id);
        }
        break;
        
      case 'ArrowRight':
        if (AppState.currentMenuIndex < AppState.allMenus.length - 1) {
          e.preventDefault();
          AppState.currentMenuIndex++;
          selectMenu(AppState.allMenus[AppState.currentMenuIndex].id);
        }
        break;
        
      case 'ArrowUp':
        // 切换上一个子菜单
        const currentMenu = AppState.allMenus.find(m => m.id === AppState.currentMenuId);
        if (currentMenu && currentMenu.subMenus && currentMenu.subMenus.length > 0) {
          if (AppState.currentSubMenuIndex > 0) {
            e.preventDefault();
            AppState.currentSubMenuIndex--;
            selectSubMenu(currentMenu.subMenus[AppState.currentSubMenuIndex].id);
          }
        }
        break;
        
      case 'ArrowDown':
        // 切换下一个子菜单
        const menu = AppState.allMenus.find(m => m.id === AppState.currentMenuId);
        if (menu && menu.subMenus && menu.subMenus.length > 0) {
          if (AppState.currentSubMenuIndex < menu.subMenus.length - 1) {
            e.preventDefault();
            AppState.currentSubMenuIndex++;
            selectSubMenu(menu.subMenus[AppState.currentSubMenuIndex].id);
          }
        }
        break;
        
      case 'f':
      case 'F':
        // 打开友情链接
        e.preventDefault();
        const friendLinkBtn = document.getElementById('friendLinkBtn');
        if (friendLinkBtn) {
          friendLinkBtn.click();
        }
        break;
    }
  });
  
  console.log('⌨️ 键盘快捷键已启用');
  console.log('快捷键说明: / 聚焦搜索 | ← → 切换菜单 | ↑ ↓ 切换子菜单 | F 友情链接 | ESC 关闭弹窗');
}

// ========== 处理搜索 ==========
function handleSearch() {
  const query = AppState.searchQuery.trim();
  if (!query) {
    console.warn('搜索关键词为空');
    return;
  }
  
  if (AppState.selectedEngine.name === 'site') {
    // 站内搜索已经在input事件中实时更新
    return;
  }
  
  // 外部搜索引擎
  try {
    const url = AppState.selectedEngine.url(query);
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('打开搜索页面失败:', error);
    alert('搜索失败，请稍后重试');
  }
}

// ========== 页面加载完成后初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
  try {
    if (typeof NAV_DATA === 'undefined') {
      console.error('❌ 错误: 数据文件 data.js 未加载');
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(255,0,0,0.9);color:white;padding:20px;border-radius:8px;text-align:center;z-index:9999;';
      errorMsg.innerHTML = '<h3>⚠️ 数据加载失败</h3><p>请检查 js/data.js 文件是否存在</p>';
      document.body.appendChild(errorMsg);
      return;
    }
    
    // 验证数据结构
    if (!NAV_DATA.menus || !Array.isArray(NAV_DATA.menus)) {
      throw new Error('NAV_DATA.menus 必须是数组');
    }
    if (!NAV_DATA.cards || !Array.isArray(NAV_DATA.cards)) {
      throw new Error('NAV_DATA.cards 必须是数组');
    }
    
    initApp();
  } catch (error) {
    console.error('❌ 应用初始化失败:', error);
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(255,0,0,0.9);color:white;padding:20px;border-radius:8px;text-align:center;z-index:9999;';
    errorMsg.innerHTML = `<h3>⚠️ 应用初始化失败</h3><p>${error.message}</p>`;
    document.body.appendChild(errorMsg);
  }
});

console.log('📦 app.js 加载完成');