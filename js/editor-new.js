
/**
 * 新版导航数据编辑器
 * 使用输入框快速添加，分类展示内容
 */

// 编辑器数据
let editorData = {
    settings: {
        siteTitle: '我的导航网站',
        siteDescription: '快速访问您喜爱的网站',
        siteFooter: '© 2024 我的导航',
        siteProjectUrl: '',
        siteAuthor: '',
        sitePrimaryColor: '#667eea',
        siteSecondaryColor: '#764ba2'
    },
    menus: [],
    cards: [],
    friendLinks: []
};

// 选中的卡片集合
let selectedCards = new Set();

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从 NAV_DATA 加载数据
    if (typeof NAV_DATA !== 'undefined') {
        if (NAV_DATA.settings) {
            editorData.settings = { ...editorData.settings, ...NAV_DATA.settings };
        }
        editorData.menus = JSON.parse(JSON.stringify(NAV_DATA.menus || []));
        editorData.cards = JSON.parse(JSON.stringify(NAV_DATA.cards || []));
        editorData.friendLinks = JSON.parse(JSON.stringify(NAV_DATA.friendLinks || []));
    }
    
    // 检查备份
    loadBackup();
    
    // 初始化标签页
    initTabs();
    
    // 渲染数据
    loadSettings();
    renderCategories();
    renderFriends();
    updateCardMenuSelect();
    
    // 启动自动保存
    startAutoSave();
    
    console.log('✅ 新版编辑器初始化完成');
});

// ========== 自动备份 ==========
function autoSave() {
    try {
        const backup = {
            timestamp: Date.now(),
            data: JSON.parse(JSON.stringify(editorData))
        };
        localStorage.setItem('nav_data_backup', JSON.stringify(backup));
    } catch (error) {
        console.error('自动保存失败:', error);
    }
}

function startAutoSave() {
    setInterval(autoSave, 30000);
}

function loadBackup() {
    try {
        const backup = localStorage.getItem('nav_data_backup');
        if (backup) {
            const { timestamp, data } = JSON.parse(backup);
            const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
            if (timestamp > fiveMinutesAgo) {
                editorData = data;
                console.log('✅ 已恢复最近的备份');
            }
        }
    } catch (error) {
        console.error('加载备份失败:', error);
    }
}

// ========== 标签页切换 ==========
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// ========== 通知提示 ==========
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#51cf66' : type === 'error' ? '#ff6b6b' : '#667eea'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// ========== 网站设置 ==========
function loadSettings() {
    document.getElementById('siteTitle').value = editorData.settings.siteTitle;
    document.getElementById('siteDescription').value = editorData.settings.siteDescription;
    document.getElementById('siteFooter').value = editorData.settings.siteFooter;
    document.getElementById('siteProjectUrl').value = editorData.settings.siteProjectUrl;
    document.getElementById('siteAuthor').value = editorData.settings.siteAuthor;
    document.getElementById('sitePrimaryColor').value = editorData.settings.sitePrimaryColor;
    document.getElementById('siteSecondaryColor').value = editorData.settings.siteSecondaryColor;
}

function saveSettings(e) {
    e.preventDefault();
    editorData.settings.siteTitle = document.getElementById('siteTitle').value;
    editorData.settings.siteDescription = document.getElementById('siteDescription').value;
    editorData.settings.siteFooter = document.getElementById('siteFooter').value;
    editorData.settings.siteProjectUrl = document.getElementById('siteProjectUrl').value;
    editorData.settings.siteAuthor = document.getElementById('siteAuthor').value;
    editorData.settings.sitePrimaryColor = document.getElementById('sitePrimaryColor').value;
    editorData.settings.siteSecondaryColor = document.getElementById('siteSecondaryColor').value;
    autoSave();
    showNotification('✅ 设置已保存');
}

// ========== 快速添加菜单 ==========
function quickAddMenu(e) {
    e.preventDefault();
    const name = document.getElementById('quickMenuName').value.trim();
    const icon = document.getElementById('quickMenuIcon').value.trim() || '📁';
    const subsText = document.getElementById('quickMenuSubs').value.trim();
    
    if (!name) {
        showNotification('❌ 菜单名称不能为空', 'error');
        return;
    }
    
    const newMenuId = getNextMenuId();
    const order = editorData.menus.length + 1;
    
    // 解析子菜单
    const subMenus = subsText
        .split(',')
        .map(s => s.trim())
        .filter(s => s)
        .map((subName, index) => ({
            id: newMenuId * 10 + index + 1,
            name: subName,
            parentId: newMenuId,
            order: index + 1
        }));
    
    const newMenu = {
        id: newMenuId,
        name,
        icon,
        order,
        subMenus
    };
    
    editorData.menus.push(newMenu);
    
    // 清空表单
    document.getElementById('quickMenuName').value = '';
    document.getElementById('quickMenuIcon').value = '';
    document.getElementById('quickMenuSubs').value = '';
    
    renderCategories();
    updateCardMenuSelect();
    autoSave();
    showNotification('✅ 菜单添加成功');
}

// ========== 快速添加卡片 ==========
function quickAddCard(e) {
    e.preventDefault();
    const menuId = parseInt(document.getElementById('quickCardMenu').value);
    const title = document.getElementById('quickCardTitle').value.trim();
    const url = document.getElementById('quickCardUrl').value.trim();
    const description = document.getElementById('quickCardDesc').value.trim();
    
    if (!menuId || !title || !url) {
        showNotification('❌ 请填写必填项', 'error');
        return;
    }
    
    // 验证URL
    try {
        new URL(url);
    } catch (e) {
        showNotification('❌ 网站链接格式不正确', 'error');
        return;
    }
    
    // 获取该子菜单下的卡片数量来确定order
    const cardsInMenu = editorData.cards.filter(c => c.menuId === menuId);
    const order = cardsInMenu.length + 1;
    
    const newCard = {
        id: getNextCardId(),
        menuId,
        title,
        url,
        description,
        icon: '',
        tags: [],
        order
    };
    
    editorData.cards.push(newCard);
    
    // 清空表单（保留子菜单选择）
    document.getElementById('quickCardTitle').value = '';
    document.getElementById('quickCardUrl').value = '';
    document.getElementById('quickCardDesc').value = '';
    
    renderCategories();
    autoSave();
    showNotification('✅ 卡片添加成功');
}

// ========== 快速添加友情链接 ==========
function quickAddFriend(e) {
    e.preventDefault();
    const title = document.getElementById('quickFriendTitle').value.trim();
    const url = document.getElementById('quickFriendUrl').value.trim();
    const logo = document.getElementById('quickFriendLogo').value.trim();
    
    if (!title || !url) {
        showNotification('❌ 请填写必填项', 'error');
        return;
    }
    
    // 验证URL
    try {
        new URL(url);
    } catch (e) {
        showNotification('❌ 网站链接格式不正确', 'error');
        return;
    }
    
    const newFriend = {
        id: getNextFriendId(),
        title,
        url,
        logo
    };
    
    editorData.friendLinks.push(newFriend);
    
    // 清空表单
    document.getElementById('quickFriendTitle').value = '';
    document.getElementById('quickFriendUrl').value = '';
    document.getElementById('quickFriendLogo').value = '';
    
    renderFriends();
    autoSave();
    showNotification('✅ 友情链接添加成功');
}

// ========== 批量操作辅助函数 ==========

// 切换卡片选择状态
function toggleCardSelection(cardKey) {
    if (selectedCards.has(cardKey)) {
        selectedCards.delete(cardKey);
    } else {
        selectedCards.add(cardKey);
    }
    renderCategories();
}

// 更新批量操作工具栏状态
function updateBatchToolbar() {
    const toolbar = document.getElementById('batch-toolbar');
    const countSpan = document.getElementById('selected-count');
    if (toolbar && countSpan) {
        countSpan.textContent = selectedCards.size;
        toolbar.style.display = selectedCards.size > 0 ? 'flex' : 'none';
    }
}

// ========== 分类展示渲染 ==========
function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    
    if (editorData.menus.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无菜单，请先添加菜单</div>';
        return;
    }
    
    const sortedMenus = editorData.menus.sort((a, b) => a.order - b.order);
    
    container.innerHTML = sortedMenus.map(menu => {
        const subMenusHtml = menu.subMenus && menu.subMenus.length > 0
            ? menu.subMenus.sort((a, b) => a.order - b.order).map(subMenu => {
                const cards = editorData.cards
                    .filter(c => c.menuId === subMenu.id)
                    .sort((a, b) => a.order - b.order);
                
                return `
                    <div class="submenu-section">
                        <div class="submenu-header">
                            <div>
                                <div class="submenu-title">${subMenu.name}</div>
                                <div class="submenu-meta">ID: ${subMenu.id} | ${cards.length} 个卡片</div>
                            </div>
                            <button class="btn btn-danger btn-small" onclick="deleteSubMenu(${menu.id}, ${subMenu.id})">删除子菜单</button>
                        </div>
                        ${cards.length > 0 ? `
                            <div class="card-list">
                                ${cards.map(card => {
                                    const cardKey = `${card.id}`;
                                    const isSelected = selectedCards.has(cardKey);
                                    return `
                                        <div class="card-item ${isSelected ? 'selected' : ''}" data-card-key="${cardKey}">
                                            <input type="checkbox" class="card-checkbox"
                                                ${isSelected ? 'checked' : ''}
                                                onchange="toggleCardSelection('${cardKey}')"
                                                onclick="event.stopPropagation()">
                                            <div class="card-info">
                                                <div class="card-title">${card.title}</div>
                                                <a href="${card.url}" target="_blank" class="card-url" onclick="event.stopPropagation()">${card.url}</a>
                                                ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
                                            </div>
                                            <div class="card-actions">
                                                <button class="btn btn-danger btn-small" onclick="deleteCard(${card.id})">删除</button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : '<div class="empty-state" style="padding: 20px;">暂无卡片</div>'}
                    </div>
                `;
            }).join('')
            : '<div class="empty-state" style="padding: 20px;">暂无子菜单</div>';
        
        return `
            <div class="category-section" id="menu-${menu.id}">
                <div class="category-header" onclick="toggleCategory(${menu.id})">
                    <div class="category-title">
                        <span class="category-icon">${menu.icon || '📁'}</span>
                        <span>${menu.name}</span>
                        <span class="category-badge">${menu.subMenus ? menu.subMenus.length : 0} 个子菜单</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button class="btn btn-danger btn-small" onclick="event.stopPropagation(); deleteMenu(${menu.id})">删除菜单</button>
                        <span class="collapse-indicator">▼</span>
                    </div>
                </div>
                <div class="category-body">
                    ${subMenusHtml}
                </div>
            </div>
        `;
    }).join('');
    
    updateBatchToolbar();
}

// ========== 渲染友情链接 ==========
function renderFriends() {
    const container = document.getElementById('friendsList');
    
    if (editorData.friendLinks.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无友情链接</div>';
        return;
    }
    
    container.innerHTML = editorData.friendLinks.map(friend => `
        <div class="friend-item">
            <div class="friend-info">
                <div class="friend-title">${friend.title}</div>
                <a href="${friend.url}" target="_blank" class="friend-url">${friend.url}</a>
            </div>
            <button class="btn btn-danger btn-small" onclick="deleteFriend(${friend.id})">删除</button>
        </div>
    `).join('');
}

// ========== 切换分类折叠 ==========
function toggleCategory(menuId) {
    const section = document.getElementById(`menu-${menuId}`);
    if (section) {
        section.classList.toggle('collapsed');
    }
}

// ========== 删除操作 ==========
function deleteMenu(menuId) {
    if (!confirm('确定要删除这个菜单吗？相关的子菜单和卡片也会被删除。')) return;
    
    const menu = editorData.menus.find(m => m.id === menuId);
    if (!menu) return;
    
    // 删除相关卡片
    if (menu.subMenus) {
        const subMenuIds = menu.subMenus.map(sm => sm.id);
        editorData.cards = editorData.cards.filter(c => !subMenuIds.includes(c.menuId));
    }
    
    editorData.menus = editorData.menus.filter(m => m.id !== menuId);
    renderCategories();
    updateCardMenuSelect();
    autoSave();
    showNotification('✅ 菜单已删除');
}

function deleteSubMenu(menuId, subMenuId) {
    if (!confirm('确定要删除这个子菜单吗？相关的卡片也会被删除。')) return;
    
    const menu = editorData.menus.find(m => m.id === menuId);
    if (!menu) return;
    
    // 删除相关卡片
    editorData.cards = editorData.cards.filter(c => c.menuId !== subMenuId);
    
    // 删除子菜单
    menu.subMenus = menu.subMenus.filter(sm => sm.id !== subMenuId);
    
    renderCategories();
    updateCardMenuSelect();
    autoSave();
    showNotification('✅ 子菜单已删除');
}

function deleteCard(cardId) {
    if (!confirm('确定要删除这个卡片吗？')) return;
    editorData.cards = editorData.cards.filter(c => c.id !== cardId);
    renderCategories();
    autoSave();
    showNotification('✅ 卡片已删除');
}

function deleteFriend(friendId) {
    if (!confirm('确定要删除这个友情链接吗？')) return;
    editorData.friendLinks = editorData.friendLinks.filter(f => f.id !== friendId);
    renderFriends();
    autoSave();
    showNotification('✅ 友情链接已删除');
}

// ========== 更新卡片菜单选择器 ==========
function updateCardMenuSelect() {
    const select = document.getElementById('quickCardMenu');
    if (select) {
        select.innerHTML = '<option value="">选择子菜单</option>';
        
        editorData.menus.sort((a, b) => a.order - b.order).forEach(menu => {
            if (menu.subMenus && menu.subMenus.length > 0) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = menu.name;
                
                menu.subMenus.sort((a, b) => a.order - b.order).forEach(subMenu => {
                    const option = document.createElement('option');
                    option.value = subMenu.id;
                    option.textContent = `${menu.name} / ${subMenu.name}`;
                    optgroup.appendChild(option);
                });
                
                select.appendChild(optgroup);
            }
        });
    }
}

// ========== ID生成 ==========
function getNextMenuId() {
    if (editorData.menus.length === 0) return 1;
    return Math.max(...editorData.menus.map(m => m.id)) + 1;
}

function getNextCardId() {
    if (editorData.cards.length === 0) return 1;
    return Math.max(...editorData.cards.map(c => c.id)) + 1;
}

function getNextFriendId() {
    if (editorData.friendLinks.length === 0) return 1;
    return Math.max(...editorData.friendLinks.map(f => f.id)) + 1;
}

// ========== 导出数据 ==========
function generateDataJS() {
    try {
        const data = {
            settings: editorData.settings,
            menus: editorData.menus,
            cards: editorData.cards,
            friendLinks: editorData.friendLinks
        };
        
        return `/**
 * 导航网站数据配置文件
 * 由可视化编辑器生成
 * 生成时间: ${new Date().toLocaleString('zh-CN')}
 */

const NAV_DATA = ${JSON.stringify(data, null, 2)};
`;
    } catch (error) {
        console.error('生成数据失败:', error);
        alert('❌ 生成数据失败: ' + error.message);
        return null;
    }
}

function exportData() {
    const content = generateDataJS();
    if (!content) return;
    
    try {
        const blob = new Blob([content], { type: 'text/javascript; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        localStorage.removeItem('nav_data_backup');
        showNotification('✅ data.js 文件已导出');
    } catch (error) {
        console.error('导出失败:', error);
        alert('❌ 导出失败: ' + error.message);
    }
}

function previewData() {
    const content = generateDataJS();
    document.getElementById('previewContent').textContent = content;
    document.getElementById('codePreview').style.display = 'block';
    document.getElementById('codePreview').scrollIntoView({ behavior: 'smooth' });
}

function copyData() {
    const content = generateDataJS();
    if (!content) return;
    
    if (!navigator.clipboard) {
        alert('❌ 您的浏览器不支持剪贴板功能，请使用预览功能手动复制代码。');
        previewData();
        return;
    }
    
    navigator.clipboard.writeText(content).then(() => {
        localStorage.removeItem('nav_data_backup');
        showNotification('✅ 代码已复制到剪贴板');
    }).catch((error) => {
        console.error('复制失败:', error);
        alert('❌ 复制失败！请使用预览功能手动复制代码。');
        previewData();
    });
}

// ========== 批量删除卡片 ==========
function batchDeleteCards() {
    if (selectedCards.size === 0) {
        showNotification('❌ 请先选择要删除的卡片', 'error');
        return;
    }
    
    if (!confirm(`确定要删除选中的 ${selectedCards.size} 个卡片吗？`)) return;
    
    // 将Set转换为数组，提取卡片ID
    const cardIds = Array.from(selectedCards).map(key => parseInt(key));
    
    // 过滤掉选中的卡片
    editorData.cards = editorData.cards.filter(c => !cardIds.includes(c.id));
    
    // 清空选择
    selectedCards.clear();
    
    renderCategories();
    autoSave();
    showNotification(`✅ 已删除 ${cardIds.length} 个卡片`);
}

// ========== 批量移动卡片 ==========
function showBatchMoveDialog() {
    if (selectedCards.size === 0) {
        showNotification('❌ 请先选择要移动的卡片', 'error');
        return;
    }
    
    // 构建子菜单选项列表
    let options = '';
    editorData.menus.sort((a, b) => a.order - b.order).forEach(menu => {
        if (menu.subMenus && menu.subMenus.length > 0) {
            menu.subMenus.sort((a, b) => a.order - b.order).forEach(subMenu => {
                options += `${menu.name} / ${subMenu.name} (ID: ${subMenu.id})\n`;
            });
        }
    });
    
    const targetMenuId = prompt(
        `请输入目标子菜单ID：\n\n可用的子菜单：\n${options}\n请输入ID：`
    );
    
    if (!targetMenuId) return;
    
    const menuId = parseInt(targetMenuId);
    
    // 验证子菜单是否存在
    let targetSubMenu = null;
    let targetMenu = null;
    
    for (const menu of editorData.menus) {
        if (menu.subMenus) {
            const subMenu = menu.subMenus.find(sm => sm.id === menuId);
            if (subMenu) {
                targetSubMenu = subMenu;
                targetMenu = menu;
                break;
            }
        }
    }
    
    if (!targetSubMenu) {
        showNotification('❌ 子菜单ID不存在', 'error');
        return;
    }
    
    if (!confirm(`确定要将选中的 ${selectedCards.size} 个卡片移动到「${targetMenu.name} / ${targetSubMenu.name}」吗？`)) return;
    
    // 将Set转换为数组，提取卡片ID
    const cardIds = Array.from(selectedCards).map(key => parseInt(key));
    
    // 移动卡片
    cardIds.forEach(cardId => {
        const card = editorData.cards.find(c => c.id === cardId);
        if (card) {
            card.menuId = menuId;
        }
    });
    
    // 清空选择
    selectedCards.clear();
    
    renderCategories();
    autoSave();
    showNotification(`✅ 已将 ${cardIds.length} 个卡片移动到「${targetMenu.name} / ${targetSubMenu.name}」`);
}

// ========== 清除选择 ==========
function clearSelection() {
    selectedCards.clear();
    renderCategories();
    showNotification('✅ 已清除选择');
}

console.log('✨ 新版编辑器脚本已加载');