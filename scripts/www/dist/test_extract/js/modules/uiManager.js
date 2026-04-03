// UIManagementModule

import { gameData } from './gameData.js';

// 页面Switch函数
function showPage(pageId) {
    // 隐藏All页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Display目标页面
    document.getElementById(pageId).classList.add('active');
    
    // Update 导航栏状态
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
    
    // 如果Display的是Achievement页面，UpdateGame Info
    if (pageId === 'achievement') {
        // Update解锁Achievement称号
        const achievementElement = document.querySelector('#achievement .achievement-section p');
        if (achievementElement) {
            const achievementCount = gameData.bankruptcy.achievements.length;
            let achievementText = '';
            
            // 如果有Achievement，Display最新的称号
            if (achievementCount > 0) {
                const latestAchievement = gameData.bankruptcy.achievements[achievementCount - 1];
                achievementText = latestAchievement;
            } else {
                achievementText = 'No achievements yet';
            }
            
            achievementElement.textContent = achievementText;
        }
        

        
        // 移除旧的Achievement列表（如果Exist）
        const oldAchievementsList = document.getElementById('achievements-list');
        if (oldAchievementsList) {
            oldAchievementsList.remove();
        }
        
        // 移除Game Info中可能Exist的解锁Achievement行
        const userInfoElement = document.querySelector('#achievement .user-info');
        if (userInfoElement) {
            const paragraphs = userInfoElement.querySelectorAll('p');
            paragraphs.forEach(p => {
                if (p.textContent.includes('解锁Achievement')) {
                    p.remove();
                }
            });
        }
        
        // UpdateCinemas OpenedDisplay
        const totalShopCountElement = document.getElementById('total-shop-count');
        if (totalShopCountElement) {
            totalShopCountElement.textContent = gameData.totalShopCount || 1;
        }
    }
}

// 标签页Switch函数
function switchTab(tabId) {
    // 隐藏All标签内容
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Display选中的标签内容
    document.getElementById(tabId).classList.add('active');
    
    // Update标签按钮状态
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // 如果Switch到Movie库，生成Movie库列表
    if (tabId === 'movie-library') {
        generateMovieLibrary();
    }
}

// Revenue页面标签Switch函数
function switchRevenueTab(tabType) {
    // 隐藏All标签内容
    const tabContents = document.querySelectorAll('#revenue .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Display选中的标签内容
    document.getElementById(`${tabType}-tab`).classList.add('active');
    
    // Update标签按钮状态
    const tabBtns = document.querySelectorAll('#revenue .tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Update图表
    import('./chartManager.js').then(({ updateChart }) => {
        updateChart();
    });
}

// Expense页面标签Switch函数
function switchExpenseTab(tabType, event) {
    // 隐藏All标签内容
    const tabContents = document.querySelectorAll('#expense .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Display选中的标签内容
    document.getElementById(`${tabType}-tab`).classList.add('active');
    
    // Update标签按钮状态
    const tabBtns = document.querySelectorAll('#expense .tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    // Update图表
    import('./chartManager.js').then(({ updateChart }) => {
        updateChart();
    });
}

// Upgrade页面标签Switch函数
function switchExpandTab(tabType, event) {
    // 隐藏All标签内容
    const tabContents = document.querySelectorAll('#expand .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Display选中的标签内容
    document.getElementById(`${tabType}-tab`).classList.add('active');
    
    // Update标签按钮状态
    const tabBtns = document.querySelectorAll('#expand .tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    // Update图表
    import('./chartManager.js').then(({ updateChart }) => {
        updateChart();
    });
}

// Display浮动Notification（用于按钮操作）
window.showNotification = function(message) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    // CreateNotification$素
    const notification = document.createElement('div');
    notification.className = 'notification-item';
    notification.textContent = message;
    
    // 添加到容器
    container.appendChild(notification);
    
    // 3Second后移除
    setTimeout(() => {
        if (container.contains(notification)) {
            container.removeChild(notification);
        }
    }, 3000);
}

// InitializeNotification栏
function initNotificationBar() {
    const notificationContent = document.getElementById('notification-content');
    if (notificationContent) {
        notificationContent.innerHTML = '';
        // Test notification
        setTimeout(() => {
            notificationContent.innerHTML = '<span>Welcome to Cinema Bankruptcy Simulator!</span>';
            checkScrollNeeded();
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }, 1000);
    }
}

// Check是否需要滚动
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

// 动态生成Movie库列表
function generateMovieLibrary() {
    // 这里可以添加Movie库列表的生成逻辑
    console.log('生成Movie库列表');
}

// 首页标签Switch函数
function switchHomeTab(tabType, event) {
    // 隐藏All标签内容
    const tabContents = document.querySelectorAll('#home .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Display选中的标签内容
    document.getElementById(`${tabType}-tab`).classList.add('active');
    
    // Update标签按钮状态
    const tabBtns = document.querySelectorAll('#home .tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    // 如果Switch到Achievement标签，UpdateGame Info
    if (tabType === 'achievement') {
        // Update解锁Achievement称号
        const achievementElement = document.querySelector('#achievement-tab .achievement-section p');
        if (achievementElement) {
            const achievementCount = gameData.bankruptcy.achievements.length;
            let achievementText = '';
            
            // 如果有Achievement，Display最新的称号
            if (achievementCount > 0) {
                const latestAchievement = gameData.bankruptcy.achievements[achievementCount - 1];
                achievementText = latestAchievement;
            } else {
                achievementText = 'No achievements yet';
            }
            
            achievementElement.textContent = achievementText;
        }
        
        // UpdateCinemas OpenedDisplay
        const totalShopCountElement = document.getElementById('total-shop-count');
        if (totalShopCountElement) {
            totalShopCountElement.textContent = gameData.totalShopCount || 1;
        }
    }
}

// 导出Module
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
