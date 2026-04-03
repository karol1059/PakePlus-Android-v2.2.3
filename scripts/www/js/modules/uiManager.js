// UI管理模块

import { gameData } from './gameData.js';

// 页面切换函数
function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    document.getElementById(pageId).classList.add('active');
    
    // 更新导航栏状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 激活对应导航按钮
    const navMap = {
        'home': 0,
        'revenue': 1,
        'expense': 3,
        'expand': 4
    };
    
    if (navMap[pageId] !== undefined) {
        document.querySelectorAll('.nav-btn')[navMap[pageId]].classList.add('active');
    }
    
    // 如果显示的是成绩页面，更新游戏信息
    if (pageId === 'achievement') {
        // 更新解锁成就称号
        const achievementElement = document.querySelector('#achievement .achievement-section p');
        if (achievementElement) {
            const achievementCount = gameData.bankruptcy.achievements.length;
            let achievementText = '';
            
            // 如果有成就，显示最新的称号
            if (achievementCount > 0) {
                const latestAchievement = gameData.bankruptcy.achievements[achievementCount - 1];
                achievementText = latestAchievement;
            } else {
                achievementText = '新手店长';
            }
            
            achievementElement.textContent = achievementText;
        }
        

        
        // 移除旧的成就列表（如果存在）
        const oldAchievementsList = document.getElementById('achievements-list');
        if (oldAchievementsList) {
            oldAchievementsList.remove();
        }
        
        // 移除游戏信息中可能存在的解锁成就行
        const userInfoElement = document.querySelector('#achievement .user-info');
        if (userInfoElement) {
            const paragraphs = userInfoElement.querySelectorAll('p');
            paragraphs.forEach(p => {
                if (p.textContent.includes('解锁成就')) {
                    p.remove();
                }
            });
        }
        
        // 更新开店数显示
        const totalShopCountElement = document.getElementById('total-shop-count');
        if (totalShopCountElement) {
            totalShopCountElement.textContent = gameData.totalShopCount || 1;
        }
    }
}

// 标签页切换函数
function switchTab(tabId) {
    // 隐藏所有标签内容
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // 显示选中的标签内容
    document.getElementById(tabId).classList.add('active');
    
    // 更新标签按钮状态
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // 如果切换到电影库，生成电影库列表
    if (tabId === 'movie-library') {
        generateMovieLibrary();
    }
}

// 收入页面标签切换函数
function switchRevenueTab(tabType) {
    // 隐藏所有标签内容
    const tabContents = document.querySelectorAll('#revenue .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // 显示选中的标签内容
    document.getElementById(`${tabType}-tab`).classList.add('active');
    
    // 更新标签按钮状态
    const tabBtns = document.querySelectorAll('#revenue .tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // 更新图表
    import('./chartManager.js').then(({ updateChart }) => {
        updateChart();
    });
}

// 支出页面标签切换函数
function switchExpenseTab(tabType, event) {
    // 隐藏所有标签内容
    const tabContents = document.querySelectorAll('#expense .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // 显示选中的标签内容
    document.getElementById(`${tabType}-tab`).classList.add('active');
    
    // 更新标签按钮状态
    const tabBtns = document.querySelectorAll('#expense .tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    // 更新图表
    import('./chartManager.js').then(({ updateChart }) => {
        updateChart();
    });
}

// 升级页面标签切换函数
function switchExpandTab(tabType, event) {
    // 隐藏所有标签内容
    const tabContents = document.querySelectorAll('#expand .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // 显示选中的标签内容
    document.getElementById(`${tabType}-tab`).classList.add('active');
    
    // 更新标签按钮状态
    const tabBtns = document.querySelectorAll('#expand .tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    // 更新图表
    import('./chartManager.js').then(({ updateChart }) => {
        updateChart();
    });
}

// 显示浮动通知（用于按钮操作）
window.showNotification = function(message) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification-item';
    notification.textContent = message;
    
    // 添加到容器
    container.appendChild(notification);
    
    // 3秒后移除
    setTimeout(() => {
        if (container.contains(notification)) {
            container.removeChild(notification);
        }
    }, 3000);
}

// 初始化通知栏
function initNotificationBar() {
    const notificationContent = document.getElementById('notification-content');
    if (notificationContent) {
        notificationContent.innerHTML = '';
        // 测试通知
        setTimeout(() => {
            notificationContent.innerHTML = '<span>欢迎来到影院倒闭模拟器！</span>';
            checkScrollNeeded();
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }, 1000);
    }
}

// 检查是否需要滚动
function checkScrollNeeded() {
    const notificationContent = document.getElementById('notification-content');
    const notificationBar = document.getElementById('notification-bar');
    
    if (notificationContent && notificationBar) {
        if (notificationContent.scrollWidth > notificationBar.offsetWidth) {
            notificationContent.classList.add('scroll');
        } else {
            notificationContent.classList.remove('scroll');
        }
    }
}

// 动态生成电影库列表
function generateMovieLibrary() {
    // 这里可以添加电影库列表的生成逻辑
    console.log('生成电影库列表');
}

// 首页标签切换函数
function switchHomeTab(tabType, event) {
    // 隐藏所有标签内容
    const tabContents = document.querySelectorAll('#home .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // 显示选中的标签内容
    document.getElementById(`${tabType}-tab`).classList.add('active');
    
    // 更新标签按钮状态
    const tabBtns = document.querySelectorAll('#home .tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    // 如果切换到成绩标签，更新游戏信息
    if (tabType === 'achievement') {
        // 更新解锁成就称号
        const achievementElement = document.querySelector('#achievement-tab .achievement-section p');
        if (achievementElement) {
            const achievementCount = gameData.bankruptcy.achievements.length;
            let achievementText = '';
            
            // 如果有成就，显示最新的称号
            if (achievementCount > 0) {
                const latestAchievement = gameData.bankruptcy.achievements[achievementCount - 1];
                achievementText = latestAchievement;
            } else {
                achievementText = '新手店长';
            }
            
            achievementElement.textContent = achievementText;
        }
        
        // 更新开店数显示
        const totalShopCountElement = document.getElementById('total-shop-count');
        if (totalShopCountElement) {
            totalShopCountElement.textContent = gameData.totalShopCount || 1;
        }
    }
}

// 导出模块
export {
    showPage,
    switchTab,
    switchRevenueTab,
    switchExpenseTab,
    switchExpandTab,
    switchHomeTab,
    initNotificationBar,
    checkScrollNeeded
};
