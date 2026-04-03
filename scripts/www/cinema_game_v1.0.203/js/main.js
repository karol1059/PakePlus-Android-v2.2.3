// 主入口文件

import { gameData, resetGameData, saveGameProgress, loadGameProgress, checkGameProgress, formatAssets } from './modules/gameData.js';
import { generateMovieName, generateCinemaName, getRandomMovieType } from './modules/nameGenerator.js';
import { simulateDay, updateUI, generateMovieList, initializeDataCalculation, doPromotion, updatePromotionDisplay, updatePromotionButtonsStatus, updateMaintenanceCycle, updateMaintenanceBySlider, updateAirConditionerStatus, checkComplaints, updateEquipmentDisplay, showEquipmentDetail, replaceEquipment, showXenonLampDetail, replaceXenonLamp, skipMonth, skipYear, openModal, closeModal, gameInterval, gameSpeed, startGameLoop } from './modules/gameLogic.js';
import { showPage, switchTab, switchRevenueTab, switchExpenseTab, switchExpandTab, switchHomeTab, initNotificationBar, checkScrollNeeded } from './modules/uiManager.js';
import { shopData, updateShopInfo, updateStaffInfo, openShop, confirmExpenseStaffLevel, getStaffLevelText, updateOverallStaffLevel, updateStaffExpense, addOneBillion, confirmStaffLevel, updateTotalStaffCount, updateShopButtonStatus, upgradeShopLevel, updateShopLevelsDisplay, openUpgradeModal, closeUpgradeModal, updateUpgradeQuantity, confirmUpgrade, showShopList, closeShopListModal, calculateRadiationPopulation } from './modules/expandManager.js';

// 随机公司名称列表（简称）
const companyNames = [
    '科技公司', '贸易公司', '文化传媒公司', '广告公司',
    '房地产公司', '餐饮公司', '教育科技公司', '金融公司',
    '网络科技公司', '电子公司', '服装公司', '食品公司',
    '医药公司', '汽车公司', '建筑公司', '物流公司'
];

// 随机学校名称列表
const schoolNames = [
    '大学', '学院', '职业技术学院', '高级中学', '初级中学', '小学',
    '幼儿园', '培训学校', '艺术学校', '体育学校'
];

// 随机姓氏列表
const surnames = [
    '张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴',
    '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'
];

// 生成随机公司名称
function generateCompanyName() {
    // 虚拟品牌前缀
    const virtualPrefixes = [
        '星云', '银河', '未来', '创新', '科技', '梦幻', '星际', '环球', '宇宙', '无限',
        '量子', '数字', '智慧', '智能', '卓越', '精英', '先锋', '领袖', '王者', '传奇',
        '神话', '童话', '梦幻', '幻想', '创意', '灵感', '火花', '闪电', '雷霆', '风暴',
        '阳光', '星光', '月光', '极光', '彩虹', '云端', '天空', '海洋', '大地', '森林'
    ];
    
    const prefix = virtualPrefixes[Math.floor(Math.random() * virtualPrefixes.length)];
    const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];
    return prefix + companyName;
}

// 生成随机学校名称
function generateSchoolName() {
    // 虚拟学校前缀
    const virtualPrefixes = [
        '星云', '银河', '未来', '创新', '科技', '梦幻', '星际', '环球', '宇宙', '无限',
        '智慧', '智能', '卓越', '精英', '先锋', '领袖', '王者', '传奇', '神话', '童话'
    ];
    
    const prefix = virtualPrefixes[Math.floor(Math.random() * virtualPrefixes.length)];
    const schoolName = schoolNames[Math.floor(Math.random() * schoolNames.length)];
    return prefix + schoolName;
}

// 生成随机企业/单位名称
function generateOrganizationName() {
    const types = [0, 1]; // 0: 公司, 1: 学校
    const type = types[Math.floor(Math.random() * types.length)];
    if (type === 0) {
        return generateCompanyName();
    } else {
        return generateSchoolName();
    }
}

// 生成随机人物名称
function generatePersonName() {
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const gender = Math.random() > 0.5 ? '先生' : '女士';
    return surname + gender;
}







// 开始新游戏
function startNewGame() {
    // 重置游戏数据
    resetGameData();
    
    // 重置班制为1班制
    localStorage.setItem('workSchedule', '2');
    
    // 隐藏破产弹窗
    const bankruptcyModal = document.getElementById('bankruptcy-modal');
    if (bankruptcyModal) {
        bankruptcyModal.style.display = 'none';
    }
    
    // 恢复沙漏动画
    const hourglass = document.querySelector('.hourglass');
    if (hourglass) {
        hourglass.classList.remove('paused');
    }
    
    // 重新启动游戏循环（确保时间正常流逝）
    startGameLoop();
    
    // 生成随机影院名称
    const randomCinemaName = generateCinemaName();
    
    // 显示自定义的影院名称输入弹窗
    showCinemaNameModal(randomCinemaName);
}

// 重置游戏（用于破产后开始新游戏）
function resetGame() {
    // 重置游戏数据
    resetGameData();
    
    // 重置班制为1班制
    localStorage.setItem('workSchedule', '2');
    
    // 直接初始化游戏，不需要显示影院名称弹窗
    initGame();
}

// 显示影院名称输入弹窗
window.showCinemaNameModal = function(randomName) {
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    // 确保DOM元素加载完成
    setTimeout(() => {
        // 获取DOM元素
        const inputElement = document.getElementById('cinema-name-input');
        const modalElement = document.getElementById('cinema-name-modal');
        
        if (inputElement && modalElement) {
            // 设置随机名称到输入框
            inputElement.value = randomName;
            
            // 显示弹窗
            modalElement.classList.add('show');
        } else {
            // 如果DOM元素不存在，使用默认名称并继续游戏
            gameData.cinemaName = randomName;
            saveGameProgress();
            
            // 隐藏欢迎页面
            const welcomePage = document.getElementById('welcome-page');
            if (welcomePage) {
                welcomePage.style.display = 'none';
            }
            
            // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
            closeModal();
        }
    }, 100); // 等待100毫秒，确保DOM元素已加载
}

// 打开场地设备数量洽谈模态框
window.openEquipmentQuantityModal = function() {
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    // 创建设备数量洽谈弹窗
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    // 创建弹窗内容
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        width: 80%;
        max-width: 500px;
        max-height: 80%;
        overflow-y: auto;
    `;
    
    // 弹窗标题
    const title = document.createElement('h3');
    title.textContent = '场地设备洽谈';
    title.style.marginTop = '0';
    modalContent.appendChild(title);
    
    // 设备类型（随机生成）
    const equipmentTypes = [
        { name: '游戏机', income: 500, electricity: 100 },
        { name: '娃娃机', income: 300, electricity: 50 },
        { name: 'KTV', income: 200, electricity: 100 }
    ];
    
    // 随机选择一种设备类型
    const randomType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
    
    // 设备信息显示
    const equipmentInfo = document.createElement('div');
    equipmentInfo.style.cssText = `
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        background-color: #e3f2fd;
    `;
    
    equipmentInfo.innerHTML = `
        <strong>设备信息</strong>
        <br>
        设备类型：${randomType.name}
        <br>
        月租金收入：¥${randomType.income} | 月电费：¥${randomType.electricity}
    `;
    
    modalContent.appendChild(equipmentInfo);
    
    // 数量选择（使用滑块，限制0-5台/店）
    const quantitySection = document.createElement('div');
    quantitySection.style.cssText = `
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        background-color: #f5f5f5;
    `;
    
    // 计算总店铺数量
    function getTotalShopCount() {
        let shopCount = 1; // 总店
        if (gameData.shops && gameData.shops.length > 0) {
            shopCount += gameData.shops.length;
        }
        return shopCount;
    }
    
    // 计算单种设备的最大数量
    function getMaxEquipmentCount(equipmentType) {
        let maxCount = 0;
        // 店铺等级对应的设备上限
        const levelLimits = {
            convenience: 10,
            premium: 20,
            flagship: 50,
            super: 100
        };
        // 计算店铺数量
        let shopStats = {
            convenience: 1,
            premium: 0,
            flagship: 0,
            super: 0
        };
        // 计算分店
        if (gameData.shops && gameData.shops.length > 0) {
            gameData.shops.forEach(shop => {
                if (shop.level && shopStats.hasOwnProperty(shop.level)) {
                    shopStats[shop.level]++;
                }
            });
        }
        // 计算最大数量
        for (let level in shopStats) {
            maxCount += shopStats[level] * levelLimits[level];
        }
        return maxCount;
    }
    
    // 获取当前设备数量
    function getCurrentEquipmentCount(equipmentType) {
        return gameData.equipment && gameData.equipment[equipmentType] ? gameData.equipment[equipmentType] : 0;
    }
    
    const shopCount = getTotalShopCount();
    const maxPerShop = 5;
    const maxEquipmentCount = getMaxEquipmentCount(randomType.name);
    const currentEquipmentCount = getCurrentEquipmentCount(randomType.name);
    // 计算最大可添加数量：取5*店数和剩余容量的最小值
    const maxQuantity = Math.min(maxPerShop * shopCount, maxEquipmentCount - currentEquipmentCount);
    
    quantitySection.innerHTML = `
        <strong>设备数量</strong>
        <br>
        <label>选择数量：</label>
        <input type="range" id="equipment-quantity" min="0" max="${maxQuantity}" value="0" style="margin-left: 10px;">
        <span id="quantity-value">0</span>台
        <br>


    `;
    
    modalContent.appendChild(quantitySection);
    
    // 确定按钮
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '确认';
    confirmButton.style.cssText = `
        margin-top: 20px;
        padding: 8px 16px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
    `;
    
    // 检查是否可以添加设备（基于总店铺数量）
    const canAddEquipment = maxQuantity > 0;
    if (!canAddEquipment) {
        confirmButton.disabled = true;
        confirmButton.style.backgroundColor = '#cccccc';
        confirmButton.style.cursor = 'not-allowed';
    }
    
    confirmButton.onclick = () => {
        // 获取选择的数量
        const quantity = parseInt(document.getElementById('equipment-quantity').value) || 0;
        
        // 如果选择数量为0，显示提示
        if (quantity === 0) {
            showNotification('请选择要添加的设备数量');
            return;
        }
        
        // 计算总店铺数量
        function getTotalShopCount() {
            let shopCount = 1; // 总店
            if (gameData.shops && gameData.shops.length > 0) {
                shopCount += gameData.shops.length;
            }
            return shopCount;
        }
        
        // 总设备数量（滑块值已经是总数量）
        const shopCount = getTotalShopCount();
        const totalQuantity = quantity;
        
        // 计算当前总设备数量
        function getCurrentTotalEquipmentCount() {
            let totalCount = 0;
            if (gameData.equipment) {
                // 只计算设备类型的数量，排除其他属性
                const equipmentTypes = ['游戏机', '娃娃机', 'KTV'];
                equipmentTypes.forEach(type => {
                    if (typeof gameData.equipment[type] === 'number') {
                        totalCount += gameData.equipment[type];
                    }
                });
            }
            return totalCount;
        }
        
        // 检查设备上限
        const currentCount = gameData.equipment && gameData.equipment[randomType.name] ? gameData.equipment[randomType.name] : 0;
        const newCount = currentCount + totalQuantity;
        
        // 计算当前总设备数量
        const currentTotalCount = getCurrentTotalEquipmentCount();
        const newTotalCount = currentTotalCount + totalQuantity;
        
        // 计算总设备上限
        function getTotalEquipmentLimit() {
            let totalLimit = 0;
            const levelLimits = {
                convenience: 10,
                premium: 20,
                flagship: 50,
                super: 100
            };
            
            // 计算店铺数量和等级
            let shopStats = {
                convenience: 1, // 总店默认是便民店
                premium: 0,
                flagship: 0,
                super: 0
            };
            
            // 计算分店
            if (gameData.shops && gameData.shops.length > 0) {
                gameData.shops.forEach(shop => {
                    if (shop.level && shopStats.hasOwnProperty(shop.level)) {
                        shopStats[shop.level]++;
                    }
                });
            }
            
            for (let level in shopStats) {
                totalLimit += shopStats[level] * levelLimits[level];
            }
            
            return totalLimit;
        }
        
        const totalLimit = getTotalEquipmentLimit();
        
        // 检查总设备数量是否超过上限
        if (newTotalCount > totalLimit) {
            showNotification(`设备数量超过上限！当前上限：${totalLimit}，添加后：${newTotalCount}`);
            return;
        }
        
        // 计算成功率（基于每店平均数量）
        let successRate = 0;
        if (quantity > 0) {
            const perShopQuantity = quantity / shopCount;
            successRate = Math.max(0, 100 - (perShopQuantity - 3) * 10);
        }
        
        // 随机判断是否成功
        const isSuccess = Math.random() * 100 < successRate;
        
        if (isSuccess) {
            // 计算收入和电费（基于总数量）
            const totalIncome = totalQuantity * randomType.income;
            const totalElectricity = totalQuantity * randomType.electricity;
            const totalProfit = totalIncome - totalElectricity;
            
            // 更新设备数量
            if (!gameData.equipment) {
                gameData.equipment = {};
            }
            
            gameData.equipment[randomType.name] = newCount;
            
            // 将场地设备的月租金收入计入每月合作收入
            gameData.cooperation.activeCooperations.push({
                name: randomType.name,
                income: totalIncome,
                startDate: {...gameData.date}
            });
            gameData.cooperation.monthlyIncome += totalIncome;
            
            // 显示成功消息
            const perShopQuantity = (totalQuantity / shopCount).toFixed(1);
            showNotification(`${randomType.name}洽谈成功！放置${totalQuantity}台（${perShopQuantity}台/店 × ${shopCount}店），月租金收入增加¥${formatAssets(totalIncome)}，月电费增加¥${formatAssets(totalElectricity)}，月净利润增加¥${formatAssets(totalProfit)}`);
        } else {
            // 显示失败消息
            showNotification('洽谈失败');
        }
        
        // 关闭弹窗
                document.body.removeChild(modal);
                // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
                closeModal();
                
                // 更新UI
                updateUI();
    };
    modalContent.appendChild(confirmButton);
    
    // 取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.style.cssText = `
        margin-top: 20px;
        padding: 8px 16px;
        background-color: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    cancelButton.onclick = () => {
        document.body.removeChild(modal);
        // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
        closeModal();
    };
    modalContent.appendChild(cancelButton);
    
    // 添加到弹窗
    modal.appendChild(modalContent);
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 绑定滑块事件（在modal添加到DOM后执行）
    const slider = document.getElementById('equipment-quantity');
    const valueDisplay = document.getElementById('quantity-value');
    
    if (slider && valueDisplay) {
        function updateValues() {
            const value = parseInt(slider.value);
            valueDisplay.textContent = value;
        }
        
        // 绑定事件
        slider.addEventListener('input', updateValues);
        // 立即执行一次更新
        updateValues();
    }
}

// 确认影院名称
function confirmCinemaName() {
    // 检查DOM元素是否存在
    const inputElement = document.getElementById('cinema-name-input');
    const modalElement = document.getElementById('cinema-name-modal');
    
    if (inputElement && modalElement) {
        // 获取用户输入的名称
        const userInput = inputElement.value.trim();
        
        // 使用用户输入的名称
        gameData.cinemaName = userInput;
        
        // 隐藏弹窗
        modalElement.classList.remove('show');
        
        // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
        closeModal();
        
        // 保存游戏状态到本地存储
        saveGameProgress();
        
        // 隐藏欢迎页面
        const welcomePage = document.getElementById('welcome-page');
        if (welcomePage) {
            welcomePage.style.display = 'none';
        }
        
        // 初始化游戏
        initGame();
    }
}

// 使用随机影院名称
function useRandomCinemaName() {
    // 检查DOM元素是否存在
    const inputElement = document.getElementById('cinema-name-input');
    const modalElement = document.getElementById('cinema-name-modal');
    
    if (inputElement && modalElement) {
        // 使用输入框中的随机名称
        gameData.cinemaName = inputElement.value;
        
        // 隐藏弹窗
        modalElement.classList.remove('show');
        
        // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
        closeModal();
        
        // 保存游戏状态到本地存储
        saveGameProgress();
        
        // 隐藏欢迎页面
        const welcomePage = document.getElementById('welcome-page');
        if (welcomePage) {
            welcomePage.style.display = 'none';
        }
        
        // 初始化游戏
        initGame();
    }
}

// 继续游戏
function continueGame() {
    // 从本地存储加载游戏数据
    loadGameProgress();
    
    // 隐藏欢迎页面
    const welcomePage = document.getElementById('welcome-page');
    if (welcomePage) {
        welcomePage.style.display = 'none';
    }
}

// 手动读档
function loadGame() {
    // 打开读档弹窗
    openLoadModal();
}

// 打开存档弹窗
async function openSaveModal() {
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    // 更新存档位信息
    await updateSaveSlotInfo();
    
    // 显示存档弹窗
    const saveModal = document.getElementById('save-modal');
    if (saveModal) {
        saveModal.classList.add('show');
    }
}

// 关闭存档弹窗
function closeSaveModal() {
    const saveModal = document.getElementById('save-modal');
    if (saveModal) {
        saveModal.classList.remove('show');
    }
    
    // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
    closeModal();
}

// 打开读档弹窗
async function openLoadModal() {
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    // 更新存档位信息
    await updateLoadSlotInfo();
    
    // 显示读档弹窗
    const loadModal = document.getElementById('load-modal');
    if (loadModal) {
        loadModal.classList.add('show');
    }
}

// 关闭读档弹窗
function closeLoadModal() {
    const loadModal = document.getElementById('load-modal');
    if (loadModal) {
        loadModal.classList.remove('show');
    }
    
    // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
    closeModal();
}

// 打开帮助弹窗
function openHelpModal() {
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
        helpModal.classList.add('show');
    }
}

// 关闭帮助弹窗
function closeHelpModal() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
        helpModal.classList.remove('show');
    }
    
    // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
    closeModal();
}

// 将系统相关函数暴露到全局作用域
window.openHelpModal = openHelpModal;
window.closeHelpModal = closeHelpModal;
window.openSaveModal = openSaveModal;
window.closeSaveModal = closeSaveModal;
window.openLoadModal = openLoadModal;
window.closeLoadModal = closeLoadModal;
window.saveToSlot = saveToSlot;
window.loadFromSlot = loadFromSlot;
window.loadGame = loadGame;
window.clearGameData = clearGameData;
window.setGameSpeed = setGameSpeed;
window.toggleGamePause = toggleGamePause;

// 初始化IndexedDB
function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CinemaGame', 1);
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('saves')) {
                db.createObjectStore('saves', {keyPath: 'slot'});
            }
        };
        
        request.onsuccess = function(event) {
            resolve(event.target.result);
        };
        
        request.onerror = function(event) {
            console.error('IndexedDB初始化失败:', event.target.error);
            reject('IndexedDB初始化失败');
        };
    });
}

// 保存游戏到指定存档位
async function saveToSlot(slot) {
    console.log('Saving to slot:', slot);
    try {
        // 准备存档数据，优化数据大小
        const saveData = {
            gameData: optimizeGameData(JSON.parse(JSON.stringify(gameData))), // 深拷贝并优化数据
            timestamp: new Date().toLocaleString(),
            date: {...gameData.date},
            money: gameData.money,
            slot: slot
        };
        
        console.log('Save data prepared');
        
        // 保存到IndexedDB
        const db = await initIndexedDB();
        const transaction = db.transaction('saves', 'readwrite');
        const store = transaction.objectStore('saves');
        
        await new Promise((resolve, reject) => {
            const request = store.put(saveData);
            request.onsuccess = resolve;
            request.onerror = reject;
        });
        
        // 关闭数据库连接
        db.close();
        
        // 更新存档位信息
        updateSaveSlotInfo();
        
        // 显示保存成功通知
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>存档成功：已保存到存档位 ${slot}</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    } catch (error) {
        console.error('Error saving game:', error);
        // 显示保存失败通知
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            let errorMessage = error.message || '存档失败';
            notificationContent.innerHTML = `<span>存档失败：${errorMessage}</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    }
}

// 优化游戏数据大小
function optimizeGameData(data) {
    // 限制历史记录长度
    if (data.monthlyRecords && data.monthlyRecords.length > 12) {
        data.monthlyRecords = data.monthlyRecords.slice(-12); // 只保留最近12个月的记录
    }
    
    if (data.annualRecords && data.annualRecords.length > 5) {
        data.annualRecords = data.annualRecords.slice(-5); // 只保留最近5年的记录
    }
    
    if (data.equipment && data.equipment.故障History && data.equipment.故障History.length > 20) {
        data.equipment.故障History = data.equipment.故障History.slice(-20); // 只保留最近20次故障记录
    }
    
    // 清理空数组和对象
    if (data.cooperationOpportunities && Object.keys(data.cooperationOpportunities).length === 0) {
        delete data.cooperationOpportunities;
    }
    
    return data;
}

// 清理游戏数据
function clearGameData() {
    showCustomConfirm('确定要清理历史数据吗？此操作不可恢复！', function() {
        try {
            // 清理游戏数据中的历史记录
            if (gameData.monthlyRecords) {
                gameData.monthlyRecords = [];
            }
            if (gameData.annualRecords) {
                gameData.annualRecords = [];
            }
            if (gameData.equipment && gameData.equipment.故障History) {
                gameData.equipment.故障History = [];
            }
            if (gameData.cooperationOpportunities) {
                gameData.cooperationOpportunities = {};
            }
            
            // 保存清理后的数据
            saveGameProgress();
            
            // 显示清理成功通知
            const notificationContent = document.getElementById('notification-content');
            if (notificationContent) {
                notificationContent.innerHTML = '<span>数据清理成功：历史数据已清理</span>';
                checkScrollNeeded();
                
                setTimeout(() => {
                    notificationContent.innerHTML = '';
                    checkScrollNeeded();
                }, 3000);
            }
            
            // 更新UI
            updateUI();
            
            console.log('Historical game data cleared successfully');
        } catch (error) {
            console.error('Error clearing game data:', error);
            // 显示清理失败通知
            const notificationContent = document.getElementById('notification-content');
            if (notificationContent) {
                notificationContent.innerHTML = `<span>数据清理失败：${error.message}</span>`;
                checkScrollNeeded();
                
                setTimeout(() => {
                    notificationContent.innerHTML = '';
                    checkScrollNeeded();
                }, 3000);
            }
        }
    }, function() {
        // 用户取消清理操作
        console.log('Clear data operation cancelled');
    });
}

// 设置游戏速度
function setGameSpeed(speed) {
    // 转换为数字
    const newSpeed = parseInt(speed);
    
    // 显示确认弹窗
    showCustomConfirm(`确定要将游戏速度调整为${newSpeed}倍速吗？`, function() {
        // 用户确认后执行速度切换
        window.gameSpeed = newSpeed;
        
        // 重启游戏循环以应用新速度
        startGameLoop();
        
        // 显示速度变更通知
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>游戏速度已调整为${window.gameSpeed}倍速</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
        
        console.log('Game speed changed to', window.gameSpeed, 'x');
    }, function() {
        // 用户取消，恢复原速度选择
        const speedSelect = document.querySelector('.speed-select');
        if (speedSelect) {
            speedSelect.value = window.gameSpeed;
        }
        // 恢复滑块值
        const speedSlider = document.querySelector('.speed-slider');
        if (speedSlider) {
            speedSlider.value = getSpeedIndex(window.gameSpeed);
        }
        // 更新速度显示
        updateSpeedDisplay(window.gameSpeed);
    });
}

// 根据滑块值设置游戏速度
function setGameSpeedBySlider(sliderValue) {
    // 滑块值 1: 1倍速, 2: 2倍速, 3: 4倍速
    let newSpeed;
    switch (parseInt(sliderValue)) {
        case 1:
            newSpeed = 1;
            break;
        case 2:
            newSpeed = 2;
            break;
        case 3:
            newSpeed = 4;
            break;
        default:
            newSpeed = 2;
    }
    
    // 显示确认弹窗
    showCustomConfirm(`确定要将游戏速度调整为${newSpeed}倍速吗？`, function() {
        // 用户确认后执行速度切换
        window.gameSpeed = newSpeed;
        
        // 重启游戏循环以应用新速度
        startGameLoop();
        
        // 显示速度变更通知
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>游戏速度已调整为${window.gameSpeed}倍速</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
        
        // 更新速度显示
        updateSpeedDisplay(window.gameSpeed);
        
        console.log('Game speed changed to', window.gameSpeed, 'x');
    }, function() {
        // 用户取消，恢复原速度选择
        const speedSlider = document.querySelector('.speed-slider');
        if (speedSlider) {
            speedSlider.value = getSpeedIndex(window.gameSpeed);
        }
        // 更新速度显示
        updateSpeedDisplay(window.gameSpeed);
    });
}

// 根据游戏速度获取滑块索引
function getSpeedIndex(speed) {
    switch (speed) {
        case 1:
            return 1;
        case 2:
            return 2;
        case 4:
            return 3;
        default:
            return 2;
    }
}

// 更新速度显示
function updateSpeedDisplay(speed) {
    const speedValueElement = document.getElementById('speed-value');
    if (speedValueElement) {
        speedValueElement.textContent = `${speed}倍速`;
    }
}

// 根据滑块值更新速度显示
function updateSpeedDisplayBySlider(sliderValue) {
    // 滑块值 1: 1倍速, 2: 2倍速, 3: 4倍速
    let displaySpeed;
    switch (parseInt(sliderValue)) {
        case 1:
            displaySpeed = 1;
            break;
        case 2:
            displaySpeed = 2;
            break;
        case 3:
            displaySpeed = 4;
            break;
        default:
            displaySpeed = 2;
    }
    
    const speedValueElement = document.getElementById('speed-value');
    if (speedValueElement) {
        speedValueElement.textContent = `${displaySpeed}倍速`;
    }
}

// 切换游戏暂停/继续
function toggleGamePause() {
    // 切换暂停状态
    gameData.timePaused = !gameData.timePaused;
    
    // 更新按钮文本、图标和颜色
    const pauseButton = document.querySelector('.bottom-nav .nav-btn:nth-child(3)');
    if (pauseButton) {
        const iconElement = pauseButton.querySelector('.nav-icon');
        const textElement = pauseButton.querySelector('span:last-child');
        
        if (gameData.timePaused) {
            iconElement.textContent = '▶️';
            textElement.textContent = '继续';
            pauseButton.style.backgroundColor = '#4CAF50'; // 绿色表示可以继续
        } else {
            iconElement.textContent = '⏸️';
            textElement.textContent = '暂停';
            pauseButton.style.backgroundColor = '#f44336'; // 红色表示可以暂停
        }
    }
    
    // 控制沙漏动画
    const hourglass = document.querySelector('.hourglass');
    if (hourglass) {
        if (gameData.timePaused) {
            hourglass.classList.add('paused');
        } else {
            hourglass.classList.remove('paused');
        }
    }
    
    // 控制游戏循环
    if (!gameData.timePaused) {
        // 继续游戏，重启游戏循环
        startGameLoop();
    } else {
        // 暂停游戏，清除游戏循环
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
    }
    
    // 显示暂停/继续通知
    const notificationContent = document.getElementById('notification-content');
    if (notificationContent) {
        const status = gameData.timePaused ? '暂停' : '继续';
        notificationContent.innerHTML = `<span>游戏已${status}</span>`;
        checkScrollNeeded();
        
        setTimeout(() => {
            notificationContent.innerHTML = '';
            checkScrollNeeded();
        }, 3000);
    }
    
    console.log('Game', gameData.timePaused ? 'paused' : 'resumed');
}

// 从指定存档位加载游戏
async function loadFromSlot(slot) {
    console.log('Loading from slot:', slot);
    try {
        // 从IndexedDB加载存档
        const db = await initIndexedDB();
        const transaction = db.transaction('saves', 'readonly');
        const store = transaction.objectStore('saves');
        
        const saveData = await new Promise((resolve, reject) => {
            const request = store.get(slot);
            request.onsuccess = function(event) {
                resolve(event.target.result);
            };
            request.onerror = reject;
        });
        
        // 关闭数据库连接
        db.close();
        
        if (!saveData) {
            throw new Error('存档不存在');
        }
        
        console.log('Save data loaded:', saveData);
        
        // 验证数据完整性
        if (!saveData.gameData) {
            throw new Error('存档数据不完整');
        }
        
        // 加载游戏数据
        Object.assign(gameData, saveData.gameData);
        console.log('Game data loaded successfully');
        
        // 显示加载成功通知
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>读档成功：已从存档位 ${slot} 加载游戏</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
        
        // 关闭读档弹窗
        closeLoadModal();
        
        // 隐藏欢迎页面
        const welcomePage = document.getElementById('welcome-page');
        if (welcomePage) {
            welcomePage.style.display = 'none';
        }
        
        // 更新UI
        updateUI();
        console.log('UI updated');
        console.log('Welcome page hidden');

    } catch (error) {
        console.error('Error loading save data:', error);
        console.error('Error stack:', error.stack);
        // 显示加载失败通知
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>读档失败：${error.message}</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    }
}

// 更新存档位信息
async function updateSaveSlotInfo() {
    try {
        const db = await initIndexedDB();
        const transaction = db.transaction('saves', 'readonly');
        const store = transaction.objectStore('saves');
        
        for (let i = 1; i <= 3; i++) {
            const slotInfoElement = document.getElementById(`save-slot-${i}-info`);
            
            if (slotInfoElement) {
                try {
                    const saveData = await new Promise((resolve, reject) => {
                        const request = store.get(i);
                        request.onsuccess = function(event) {
                            resolve(event.target.result);
                        };
                        request.onerror = reject;
                    });
                    
                    if (saveData) {
                        const cinemaName = saveData.gameData.cinemaName || '未命名影院';
                        slotInfoElement.textContent = `${saveData.timestamp} | ${cinemaName} | 资产: ¥${formatAssets(saveData.money)} | ${saveData.date.year}年${saveData.date.month}月${saveData.date.day}日`;
                    } else {
                        slotInfoElement.textContent = '空存档';
                    }
                } catch (error) {
                    console.error('Error parsing save data for slot', i, error);
                    slotInfoElement.textContent = '存档损坏';
                }
            }
        }
        
        // 关闭数据库连接
        db.close();
    } catch (error) {
        console.error('Error updating save slot info:', error);
    }
}

// 更新读档位信息
async function updateLoadSlotInfo() {
    try {
        const db = await initIndexedDB();
        const transaction = db.transaction('saves', 'readonly');
        const store = transaction.objectStore('saves');
        
        for (let i = 1; i <= 3; i++) {
            const slotInfoElement = document.getElementById(`load-slot-${i}-info`);
            
            if (slotInfoElement) {
                try {
                    const saveData = await new Promise((resolve, reject) => {
                        const request = store.get(i);
                        request.onsuccess = function(event) {
                            resolve(event.target.result);
                        };
                        request.onerror = reject;
                    });
                    
                    if (saveData) {
                        const cinemaName = saveData.gameData.cinemaName || '未命名影院';
                        slotInfoElement.textContent = `${saveData.timestamp} | ${cinemaName} | 资产: ¥${formatAssets(saveData.money)} | ${saveData.date.year}年${saveData.date.month}月${saveData.date.day}日`;
                    } else {
                        slotInfoElement.textContent = '空存档';
                    }
                } catch (error) {
                    console.error('Error parsing save data for slot', i, error);
                    slotInfoElement.textContent = '存档损坏';
                }
            }
        }
        
        // 关闭数据库连接
        db.close();
    } catch (error) {
        console.error('Error updating load slot info:', error);
    }
}

// 初始化游戏
function initGame() {
    // 初始化通知栏
    initNotificationBar();
    
    // 检查游戏进度
    checkGameProgress();
    
    // 生成电影列表
    generateMovieList();
    
    // 初始化数据计算
    initializeDataCalculation();
    
    // 首次进入游戏时显示新手指引
    const hasSavedGame = localStorage.getItem('hasSavedGame');
    if (!hasSavedGame) {
        setTimeout(() => {
            openHelpModal();
        }, 1000); // 延迟1秒显示，确保游戏完全初始化
    }
    
    // 初始化血条样式
    initBloodBars();
    
    // 初始化沙漏点击事件
    initHourglassClick();
    
    // 初始化班制下拉菜单
    const workScheduleSelect = document.getElementById('work-schedule');
    const currentSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    if (workScheduleSelect) {
        workScheduleSelect.value = currentSchedule;
    }
    
    // 初始化游戏速度滑块
    const speedSlider = document.querySelector('.speed-slider');
    if (speedSlider) {
        speedSlider.value = getSpeedIndex(gameSpeed);
    }
    // 更新速度显示
    updateSpeedDisplay(gameSpeed);
    
    // 加载声音状态
    loadSoundState();
    // 初始化背景音乐
    initBGM();

    
    // 更新开店按钮状态
    updateShopButtonStatus();
    
    // 更新店铺等级显示
    updateShopLevelsDisplay();
    
    // 更新总员工数量（考虑班制）
    updateTotalStaffCount();
    
    // 更新血条标签显示（考虑班制）
    updateShopInfo();
    
    // 更新UI
    updateUI();
    
    // 初始化暂停按钮状态
    const pauseButton = document.querySelector('.bottom-nav .nav-btn:nth-child(3)');
    if (pauseButton) {
        const iconElement = pauseButton.querySelector('.nav-icon');
        const textElement = pauseButton.querySelector('span:last-child');
        
        if (gameData.timePaused) {
            iconElement.textContent = '▶️';
            textElement.textContent = '继续';
            pauseButton.style.backgroundColor = '#4CAF50'; // 绿色表示可以继续
        } else {
            iconElement.textContent = '⏸️';
            textElement.textContent = '暂停';
            pauseButton.style.backgroundColor = '#f44336'; // 红色表示可以暂停
        }
    }
    
    // 开始游戏循环
    startGameLoop();
}

// 初始化血条样式
function initBloodBars() {
    // 初始化员工配置血条
    updateStaffBloodBar(3); // 默认标配
}

// 沙漏点击事件 - 显示密码输入框
function showPasswordPrompt() {
    // 只有游戏暂停时才生效
    if (!gameData.timePaused) {
        return;
    }
    
    console.log('Password prompt triggered');
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    // 打开密码输入框
    const passwordModal = document.getElementById('password-modal');
    if (passwordModal) {
        passwordModal.classList.add('show');
        // 聚焦到输入框
        setTimeout(() => {
            const passwordInput = document.getElementById('password-input');
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
        }, 100);
    }
}

// 关闭密码输入框
function closePasswordModal() {
    const passwordModal = document.getElementById('password-modal');
    if (passwordModal) {
        passwordModal.classList.remove('show');
    }
    
    // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
    closeModal();
}

// 确认密码
function confirmPassword() {
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
        const password = passwordInput.value;
        console.log('Password entered:', password);
        if (password === 'dianyingyuan') {
            // 关闭模态框
            closePasswordModal();
            
            // 显示 quick-actions div
            const quickActions = document.querySelector('.quick-actions');
            if (quickActions) {
                quickActions.style.display = 'flex';
                console.log('Quick actions shown');
                
                // 1 分钟后再次隐藏
                setTimeout(function() {
                    quickActions.style.display = 'none';
                    console.log('Quick actions hidden');
                }, 60000);
            }
        } else {
            alert('密码错误！');
        }
    }
}

// 暴露到全局作用域
window.showPasswordPrompt = showPasswordPrompt;
window.closePasswordModal = closePasswordModal;
window.confirmPassword = confirmPassword;

// 初始化沙漏点击事件
function initHourglassClick() {
    console.log('Hourglass click init done');
}

// 更新员工血条
function updateStaffBloodBar(level) {
    const bloodBarFill = document.getElementById('staff-blood-bar-fill');
    const currentStaffDisplay = document.getElementById('current-staff-display');
    if (bloodBarFill) {
        // 血条总是填满
        const percentage = 100;
        bloodBarFill.style.width = `${percentage}%`;
        
        // 使用最高等级的颜色
        bloodBarFill.className = 'blood-bar-fill'; // 重置类名
        bloodBarFill.classList.add('level-4'); // 添加最高等级的颜色类
    }
    
    // 更新当前员工数量显示
    if (currentStaffDisplay) {
        // 获取当前班制
        const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
        
        // 计算总员工数量
        let totalStaff = 3 * workSchedule; // 总店3人，乘以班制数
        
        if (gameData.shops && gameData.shops.length > 0) {
            gameData.shops.forEach(shop => {
                totalStaff += (shop.staffCount || 0) * workSchedule;
            });
        }
        
        currentStaffDisplay.textContent = totalStaff;
    }
}

// 增加员工配置等级
function increaseStaffLevel() {
    const currentLevel = parseInt(localStorage.getItem('staffLevel')) || 3;
    if (currentLevel < 4) {
        const newLevel = currentLevel + 1;
        localStorage.setItem('staffLevel', newLevel);
        updateStaffBloodBar(newLevel);
        confirmExpenseStaffLevel(newLevel);
    }
}

// 减少员工配置等级
function decreaseStaffLevel() {
    const currentLevel = parseInt(localStorage.getItem('staffLevel')) || 3;
    if (currentLevel > 1) {
        const newLevel = currentLevel - 1;
        localStorage.setItem('staffLevel', newLevel);
        updateStaffBloodBar(newLevel);
        confirmExpenseStaffLevel(newLevel);
    }
}



// 存储临时班制值
let tempWorkSchedule = 1;

// 更新班制设置
function updateWorkSchedule(value) {
    tempWorkSchedule = parseInt(value);
    const originalSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    
    // 设置弹窗消息
    let confirmMessage = '';
    switch (tempWorkSchedule) {
        case 1:
            confirmMessage = '确定将班制设置为1班制，营业时间为14:00-22:00吗？';
            break;
        case 2:
            confirmMessage = '确定将班制设置为2班制，营业时间为08:00-24:00吗？';
            break;
        case 3:
            confirmMessage = '确定将班制设置为3班制，营业时间为00:00-24:00吗？';
            break;
    }
    
    // 更新弹窗消息
    const messageElement = document.getElementById('work-schedule-modal-message');
    if (messageElement) {
        messageElement.textContent = confirmMessage;
    }
    
    // 显示弹窗
    const modal = document.getElementById('work-schedule-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

// 确认班制切换
function confirmWorkSchedule() {
    const scheduleValue = tempWorkSchedule;
    
    localStorage.setItem('workSchedule', scheduleValue);
    
    // 更新班制信息显示
    const workScheduleInfo = document.getElementById('work-schedule-info');
    if (workScheduleInfo) {
        let scheduleText = '';
        switch (scheduleValue) {
            case 1:
                scheduleText = '当前营业时间：14:00-22:00';
                break;
            case 2:
                scheduleText = '当前营业时间：08:00-24:00';
                break;
            case 3:
                scheduleText = '当前营业时间：00:00-24:00';
                break;
        }
        workScheduleInfo.textContent = scheduleText;
    }
    
    // 重新启动游戏循环（确保时间间隔正确）
    startGameLoop();
    
    // 更新员工数量显示
    updateTotalStaffCount();
    
    // 更新血条标签显示（考虑班制）
    updateShopInfo();
    
    // 更新电费显示
    updateEquipmentDisplay();
    
    // 显示班制更新通知
    showNotification(`班制设置已更新为${scheduleValue}班制`);
    
    // 关闭弹窗
    closeWorkScheduleModal();
}

// 关闭班制切换弹窗
function closeWorkScheduleModal() {
    const modal = document.getElementById('work-schedule-modal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // 恢复原来的选择
    const originalSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    const selectElement = document.getElementById('work-schedule');
    if (selectElement) {
        selectElement.value = originalSchedule;
    }
}

// 检查友盟广告SDK初始化状态
function checkAdSDKStatus() {
    console.log('=== 友盟广告SDK状态检查 ===');
    
    // 检查SDK加载状态
    const sdkStatus = {
        UMengAd: typeof window.UMengAd !== 'undefined',
        UM: typeof window.UM !== 'undefined',
        SDKLoaded: typeof window.UMengAd !== 'undefined' || typeof window.UM !== 'undefined'
    };
    
    console.log('SDK加载状态:', sdkStatus);
    
    // 检查网络连接
    if (navigator.onLine) {
        console.log('网络连接: 正常');
    } else {
        console.log('网络连接: 离线');
    }
    
    // 检查广告配置
    const adConfig = {
        appKey: '69be78386f259537c77f6405',
        adUnitId: '100007644',
        channel: 'cinema_game'
    };
    console.log('广告配置:', adConfig);
    
    // 显示状态信息
    let statusText = '友盟广告SDK状态检查：\n';
    statusText += `SDK加载: ${sdkStatus.SDKLoaded ? '成功' : '失败'}\n`;
    statusText += `UMengAd: ${sdkStatus.UMengAd ? '存在' : '不存在'}\n`;
    statusText += `UM: ${sdkStatus.UM ? '存在' : '不存在'}\n`;
    statusText += `网络连接: ${navigator.onLine ? '正常' : '离线'}\n\n`;
    statusText += '广告配置：\n';
    statusText += `AppKey: ${adConfig.appKey}\n`;
    statusText += `AdUnitId: ${adConfig.adUnitId}\n`;
    statusText += `Channel: ${adConfig.channel}\n\n`;
    statusText += '注意：在浏览器环境中，友盟SDK可能无法完全初始化，这是正常现象。';
    
    alert(statusText);
    showNotification('广告SDK状态检查完成');
}

// 播放广告
function playAd() {
    console.log('开始播放广告 - Dirichlet聚合SDK');
    
    // 显示广告加载中通知
    showNotification('广告加载中，请稍候...');
    
    // 检查Dirichlet Ad Bridge是否可用
    console.log('检查Dirichlet Ad Bridge状态:', {
        DirichletAdBridge: typeof window.DirichletAdBridge !== 'undefined',
        DirichletAdConfig: typeof window.DirichletAdConfig !== 'undefined'
    });
    
    // 设置广告回调
    window.onAdRewarded = function() {
        console.log('Dirichlet广告: 奖励回调');
        gameData.money += 10000; // 奖励10000元
        updateUI();
        showNotification('广告播放成功，获得10000元奖励！');
    };
    
    window.onAdError = function(error) {
        console.error('Dirichlet广告: 错误回调', error);
        showNotification('广告播放失败，请稍后重试');
    };
    
    window.onAdClose = function() {
        console.log('Dirichlet广告: 关闭回调');
    };
    
    // 尝试使用Dirichlet Ad Bridge
    if (typeof window.DirichletAdBridge !== 'undefined') {
        console.log('使用Dirichlet Ad Bridge');
        window.DirichletAdBridge.showRewardedVideo();
    } else {
        console.log('Dirichlet Ad Bridge未找到，使用模拟广告');
        // 模拟广告播放过程
        setTimeout(() => {
            gameData.money += 10000; // 奖励10000元
            updateUI();
            showNotification('广告播放成功，获得10000元奖励！');
        }, 2000); // 2秒后模拟广告完成，让体验更真实
    }
}

// 暴露checkAdSDKStatus函数到全局作用域
window.checkAdSDKStatus = checkAdSDKStatus;

// 暴露playAd函数到全局作用域
window.playAd = playAd;

// 获取设备识别码信息
function getDeviceInfo() {
    console.log('获取设备识别码信息');
    
    // 显示加载通知
    showNotification('正在获取设备信息...');
    
    // 模拟获取设备信息（浏览器环境下无法真实获取这些信息）
    setTimeout(() => {
        const deviceInfo = {
            aaid: '无法在浏览器中获取 AAID',
            imei: '无法在浏览器中获取 IMEI',
            oaid: '无法在浏览器中获取 OAID'
        };
        
        console.log('设备信息:', deviceInfo);
        
        // 显示设备信息
        let infoText = '设备识别码信息：\n';
        infoText += `AAID: ${deviceInfo.aaid}\n`;
        infoText += `IMEI: ${deviceInfo.imei}\n`;
        infoText += `OAID: ${deviceInfo.oaid}\n\n`;
        infoText += '注：这些信息在浏览器环境中无法真实获取，需要在原生应用中才能获取。';
        
        alert(infoText);
        showNotification('设备信息获取完成');
    }, 1000);
}

// 暴露getDeviceInfo函数到全局作用域
window.getDeviceInfo = getDeviceInfo;

// 声音控制
let bgm = null;
let soundEnabled = true; // 默认开启声音

// 初始化背景音乐
function initBGM() {
    // 确保只初始化一次
    if (bgm) {
        console.log('背景音乐已经初始化，跳过重复初始化');
        return;
    }
    
    try {
        bgm = new Audio('audio/bgm.mp3');
        bgm.loop = true;
        bgm.volume = 0.5;
        console.log('背景音乐初始化成功');
        
        // 尝试自动播放（可能需要用户交互）
        if (soundEnabled) {
            bgm.play().catch(error => {
                console.error('自动播放背景音乐失败:', error);
                // 自动播放失败时不影响游戏
            });
        }
    } catch (error) {
        console.error('背景音乐初始化失败:', error);
    }
}

// 切换声音状态
function toggleSound() {
    if (!bgm) {
        initBGM();
    }
    
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('sound-toggle');
    
    if (soundEnabled) {
        // 开启声音
        bgm.play().catch(error => {
            console.error('播放背景音乐失败:', error);
        });
        if (soundBtn) {
            soundBtn.textContent = '🔇 关闭声音';
            soundBtn.style.backgroundColor = '#f44336';
        }
        showNotification('声音已开启');
    } else {
        // 关闭声音
        bgm.pause();
        if (soundBtn) {
            soundBtn.textContent = '🔊 开启声音';
            soundBtn.style.backgroundColor = '#4CAF50';
        }
        showNotification('声音已关闭');
    }
    
    // 保存声音状态到本地存储
    localStorage.setItem('soundEnabled', soundEnabled);
    console.log('声音状态:', soundEnabled ? '开启' : '关闭');
}

// 加载保存的声音状态
function loadSoundState() {
    const savedState = localStorage.getItem('soundEnabled');
    if (savedState !== null) {
        soundEnabled = savedState === 'true';
        console.log('加载保存的声音状态:', soundEnabled ? '开启' : '关闭');
        
        // 更新按钮状态
        const soundBtn = document.getElementById('sound-toggle');
        if (soundBtn) {
            if (soundEnabled) {
                soundBtn.textContent = '🔇 关闭声音';
                soundBtn.style.backgroundColor = '#f44336';
            } else {
                soundBtn.textContent = '🔊 开启声音';
                soundBtn.style.backgroundColor = '#4CAF50';
            }
        }
    }
}

// 暴露toggleSound函数到全局作用域
window.toggleSound = toggleSound;












// 更新票房表格
function updateBoxOfficeTable() {
    const tableBody = document.getElementById('boxOfficeTableBody');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 获取排片电影
    const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
    if (scheduledMovies.length === 0) {
        // 如果没有排片电影，显示空状态
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" style="text-align: center; padding: 20px;">暂无排片电影</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // 计算总票房和人次
    let totalBoxOffice = 0;
    
    // 为每部影片添加票房指数级别（如果不存在）
    scheduledMovies.forEach(movie => {
        if (!movie.boxOfficeLevel) {
            // 根据概率生成票房指数级别
            const rand = Math.random();
            let level;
            if (rand < 0.01) {
                level = 1; // 1级：概率0.01，吸引80%的顾客
            } else if (rand < 0.06) {
                level = 2; // 2级：概率0.05，吸引50%的顾客
            } else if (rand < 0.16) {
                level = 3; // 3级：概率0.1，吸引30%的顾客
            } else if (rand < 0.46) {
                level = 4; // 4级：概率0.3，吸引30%的顾客
            } else {
                level = 5; // 5级：概率0.55，吸引10%的顾客
            }
            movie.boxOfficeLevel = level;
        }
    });
    
    // 计算各级别吸引的顾客比例
    const levelAttraction = {
        1: 0.8, // 1级：吸引80%的顾客
        2: 0.5, // 2级：吸引50%的顾客
        3: 0.3, // 3级：吸引30%的顾客
        4: 0.3, // 4级：吸引30%的顾客
        5: 0.1  // 5级：吸引10%的顾客
    };
    
    // 计算总排片占比
    let totalSchedule = 0;
    scheduledMovies.forEach(movie => {
        totalSchedule += movie.schedule;
    });
    
    // 计算每部电影的吸引力权重（与排片占比无关，添加50%随机偏差）
    let totalAttractionWeight = 0;
    scheduledMovies.forEach(movie => {
        const baseAttraction = levelAttraction[movie.boxOfficeLevel];
        // 添加50%的随机偏差：0.5-1.5倍的基础吸引力
        const randomFactor = 0.5 + Math.random() * 1.0;
        const attraction = baseAttraction * randomFactor;
        // 吸引力权重 = 吸引顾客比例（带随机偏差）
        movie.attractionWeight = attraction;
        totalAttractionWeight += attraction;
    });
    
    // 计算每部电影的人次和票房
    scheduledMovies.forEach(movie => {
        const ticketPrice = movie.tier === 1 ? 40 : movie.tier === 2 ? 30 : 20; // 档位票价
        
        // 根据吸引力权重分配到店人数
        let viewers = 0;
        if (totalAttractionWeight > 0) {
            const weightRatio = movie.attractionWeight / totalAttractionWeight;
            viewers = Math.floor(gameData.arrivalCount * weightRatio);
        }
        movie.viewers = viewers;
        
        // 再根据人次计算票房
        const movieBoxOffice = viewers * ticketPrice;
        movie.currentBoxOffice = movieBoxOffice;
        totalBoxOffice += movieBoxOffice;
    });
    
    // 按票房排序
    scheduledMovies.sort((a, b) => b.currentBoxOffice - a.currentBoxOffice);
    
    // 填充表格
    scheduledMovies.forEach((movie, index) => {
        const row = document.createElement('tr');
        
        // 计算票房占比
        const boxOfficeShare = totalBoxOffice > 0 ? (movie.currentBoxOffice / totalBoxOffice * 100).toFixed(1) : 0;
        
        // 计算排片场次
        const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
        // 计算总厅数
        let totalHalls = 3; // 总店 3 个厅
        if (gameData.shopRanges && gameData.shopRanges.length > 0) {
            gameData.shopRanges.forEach(range => {
                const shopDataInfo = shopData[range.level];
                if (shopDataInfo) {
                    totalHalls += shopDataInfo.halls * range.count;
                }
            });
        } else if (gameData.shops && gameData.shops.length > 0) {
            gameData.shops.forEach(shop => {
                const shopDataInfo = shopData[shop.level];
                if (shopDataInfo) {
                    totalHalls += shopDataInfo.halls;
                }
            });
        }
        const scheduleCapacity = totalHalls * 4 * workSchedule;
        const screenings = Math.round(scheduleCapacity * (movie.schedule / 100));
        
        // 使用gameLogic.js中计算的人次值
        const viewers = movie.viewers || 0;
        
        row.innerHTML = `
            <td>
                <span class="rank">${index + 1}</span>
                <span class="movie-name">${movie.name}</span>
                <div class="movie-info">${movie.type}片 | ${movie.tier}档 | 上映${movie.daysReleased}天</div>
            </td>
            <td class="box-office">${formatAssets(movie.currentBoxOffice)}</td>
            <td class="viewers mobile-hide">${viewers}</td>
            <td class="box-office-share">${boxOfficeShare}%</td>
            <td class="screenings mobile-hide">${screenings}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 打开进货弹窗
function openInventoryModal() {
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    // 创建设货弹窗
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    // 创建弹窗内容
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        width: 80%;
        max-width: 600px;
        max-height: 80%;
        overflow-y: auto;
    `;
    
    // 弹窗标题
    const title = document.createElement('h3');
    title.textContent = '进货管理';
    title.style.marginTop = '0';
    modalContent.appendChild(title);
    
    // 进货商品列表
    const inventoryList = document.createElement('div');
    inventoryList.style.cssText = 'margin: 20px 0;';
    
    // 为每个商品添加进货选项
        gameData.products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.style.cssText = `
                padding: 15px;
                margin: 10px 0;
                border-radius: 4px;
                background-color: #f5f5f5;
            `;
            
            // 设置进货价格
            let purchasePrice;
            switch(product.name) {
                case '爆米花':
                    purchasePrice = 6;
                    break;
                case '可乐':
                    purchasePrice = 4;
                    break;
                case '电影周边':
                    purchasePrice = 15;
                    break;
                default:
                    purchasePrice = product.price * 0.4;
            }
            
            // 计算总厅数
            let totalHalls = 3; // 总店 3 个厅
            // 检查 shopRanges（新格式）
            if (gameData.shopRanges && gameData.shopRanges.length > 0) {
                gameData.shopRanges.forEach(range => {
                    const shopDataInfo = shopData[range.level];
                    if (shopDataInfo) {
                        totalHalls += shopDataInfo.halls * range.count;
                    }
                });
            } else if (gameData.shops && gameData.shops.length > 0) {
                // 兼容旧格式
                gameData.shops.forEach(shop => {
                    const shopDataInfo = shopData[shop.level];
                    if (shopDataInfo) {
                        totalHalls += shopDataInfo.halls;
                    }
                });
            }
            
            // 计算库存总上限（厅数*200）
            const stockLimit = totalHalls * 200;
            
            // 计算当前总库存
            const currentTotalStock = gameData.products.reduce((sum, p) => sum + p.stock, 0);
            
            // 计算最大进货数量（库存上限-当前总库存）
            const maxPurchase = Math.max(0, stockLimit - currentTotalStock);
            const initialValue = Math.min(10, maxPurchase);
            
            productItem.innerHTML = `
                <div style="display: block;">
                    <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 20px;">
                        <strong>${product.name}</strong>
                        <span>当前库存：${product.stock}</span>
                        <span>进货价：¥${purchasePrice}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; justify-content: flex-start;">
                        <label>进货数量：</label>
                        <input type="range" id="inventory-${product.id}" min="0" max="${maxPurchase}" value="${initialValue}" style="width: 100px;">
                        <span id="inventory-${product.id}-value">${initialValue}</span>件
                    </div>
                </div>
            `;
            
            inventoryList.appendChild(productItem);
        });
    
    modalContent.appendChild(inventoryList);
    
    // 为所有滑块添加事件监听
    setTimeout(() => {
        // 计算总厅数
        let totalHalls = 3; // 总店 3 个厅
        // 检查 shopRanges（新格式）
        if (gameData.shopRanges && gameData.shopRanges.length > 0) {
            gameData.shopRanges.forEach(range => {
                const shopDataInfo = shopData[range.level];
                if (shopDataInfo) {
                    totalHalls += shopDataInfo.halls * range.count;
                }
            });
        } else if (gameData.shops && gameData.shops.length > 0) {
            // 兼容旧格式
            gameData.shops.forEach(shop => {
                const shopDataInfo = shopData[shop.level];
                if (shopDataInfo) {
                    totalHalls += shopDataInfo.halls;
                }
            });
        }
        
        // 计算库存总上限（厅数*200）
        const stockLimit = totalHalls * 200;
        
        // 计算当前总库存
        const currentTotalStock = gameData.products.reduce((sum, p) => sum + p.stock, 0);
        
        // 初始总进货数量
        let totalPurchase = 0;
        
        // 为每个滑块添加事件监听
        gameData.products.forEach(product => {
            const slider = document.getElementById(`inventory-${product.id}`);
            const valueDisplay = document.getElementById(`inventory-${product.id}-value`);
            if (slider && valueDisplay) {
                console.log(`绑定滑块事件: inventory-${product.id}`);
                
                // 初始化总进货数量
                totalPurchase += parseInt(slider.value) || 0;
                
                // 使用闭包保存当前的valueDisplay
                slider.addEventListener('input', function() {
                    const currentValue = parseInt(this.value) || 0;
                    console.log(`滑块值变化: ${currentValue}`);
                    valueDisplay.textContent = currentValue;
                    
                    // 计算当前总进货数量
                    let currentTotalPurchase = 0;
                    gameData.products.forEach(p => {
                        const s = document.getElementById(`inventory-${p.id}`);
                        if (s) {
                            currentTotalPurchase += parseInt(s.value) || 0;
                        }
                    });
                    
                    // 计算库存上限
                    const maxTotalPurchase = stockLimit - currentTotalStock;
                    
                    // 如果总进货数量超过上限，需要调整其他滑块
                    if (currentTotalPurchase > maxTotalPurchase) {
                        // 计算超出的数量
                        const excess = currentTotalPurchase - maxTotalPurchase;
                        
                        // 获取其他商品的滑块
                        const otherSliders = [];
                        gameData.products.forEach(p => {
                            if (p.id !== product.id) {
                                const s = document.getElementById(`inventory-${p.id}`);
                                if (s) {
                                    otherSliders.push({
                                        slider: s,
                                        value: parseInt(s.value) || 0,
                                        id: p.id
                                    });
                                }
                            }
                        });
                        
                        // 按当前值从大到小排序
                        otherSliders.sort((a, b) => b.value - a.value);
                        
                        // 减少其他滑块的值，从最大的开始
                        let remainingExcess = excess;
                        otherSliders.forEach(item => {
                            if (remainingExcess <= 0) return;
                            
                            const maxReduction = item.value; // 可以减少到0
                            const reduction = Math.min(maxReduction, remainingExcess);
                            
                            const newValue = item.value - reduction;
                            item.slider.value = newValue;
                            
                            // 更新显示
                            const vd = document.getElementById(`inventory-${item.id}-value`);
                            if (vd) {
                                vd.textContent = newValue;
                            }
                            
                            remainingExcess -= reduction;
                        });
                    }
                });
            } else {
                console.log(`未找到元素: inventory-${product.id} 或 inventory-${product.id}-value`);
            }
        });
    }, 500);
    
    // 确认按钮
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '确认进货';
    confirmButton.style.cssText = `
        margin-top: 20px;
        padding: 8px 16px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
    `;
    confirmButton.onclick = () => {
        // 计算总进货成本
        let totalCost = 0;
        let totalQuantity = 0;
        
        gameData.products.forEach(product => {
            const inputElement = document.getElementById(`inventory-${product.id}`);
            if (inputElement) {
                const quantity = parseInt(inputElement.value) || 0;
                if (quantity > 0) {
                    // 设置进货价格
                    let purchasePrice;
                    switch(product.name) {
                        case '爆米花':
                            purchasePrice = 6;
                            break;
                        case '可乐':
                            purchasePrice = 4;
                            break;
                        case '电影周边':
                            purchasePrice = 15;
                            break;
                        default:
                            purchasePrice = product.price * 0.4;
                    }
                    totalCost += quantity * purchasePrice;
                    totalQuantity += quantity;
                }
            }
        });
        
        // 计算总厅数
        let totalHalls = 3; // 总店 3 个厅
        if (gameData.shopRanges && gameData.shopRanges.length > 0) {
            gameData.shopRanges.forEach(range => {
                const shopDataInfo = shopData[range.level];
                if (shopDataInfo) {
                    totalHalls += shopDataInfo.halls * range.count;
                }
            });
        } else if (gameData.shops && gameData.shops.length > 0) {
            gameData.shops.forEach(shop => {
                const shopDataInfo = shopData[shop.level];
                if (shopDataInfo) {
                    totalHalls += shopDataInfo.halls;
                }
            });
        }
        
        // 计算库存总上限（厅数*200）
        const stockLimit = totalHalls * 200;
        
        // 计算当前总库存
        const currentTotalStock = gameData.products.reduce((sum, product) => sum + product.stock, 0);
        
        // 检查资金是否足够
        if (gameData.money < totalCost) {
            alert('资金不足，无法进货！');
            return;
        }
        
        // 检查库存是否会超过上限
        if (currentTotalStock + totalQuantity > stockLimit) {
            alert(`库存将超过上限！当前上限：${stockLimit}，当前库存：${currentTotalStock}，进货后：${currentTotalStock + totalQuantity}`);
            return;
        }
        
        // 扣除资金并增加库存
        gameData.money -= totalCost;
        gameData.totalPurchaseCount += 1;
        // 记录进货支出
        gameData.monthlyPurchaseExpense += totalCost;
        
        gameData.products.forEach(product => {
            const inputElement = document.getElementById(`inventory-${product.id}`);
            if (inputElement) {
                const quantity = parseInt(inputElement.value) || 0;
                if (quantity > 0) {
                    product.stock += quantity;
                }
            }
        });
        
        // 显示进货成功通知
        showNotification(`进货成功：进货${totalQuantity}件商品，花费¥${formatAssets(totalCost)}`);
        
        // 关闭弹窗
                document.body.removeChild(modal);
                // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
                closeModal();
                
                // 更新UI
                updateUI();
    };
    modalContent.appendChild(confirmButton);
    
    // 取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.style.cssText = `
        margin-top: 20px;
        padding: 8px 16px;
        background-color: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    cancelButton.onclick = () => {
        document.body.removeChild(modal);
        // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
        closeModal();
    };
    modalContent.appendChild(cancelButton);
    
    // 添加到弹窗
    modal.appendChild(modalContent);
    
    // 添加到页面
    document.body.appendChild(modal);
}

// 导出全局函数供HTML调用
window.startNewGame = startNewGame;
window.continueGame = continueGame;
window.confirmCinemaName = confirmCinemaName;
window.useRandomCinemaName = useRandomCinemaName;
window.showPage = showPage;
window.switchTab = switchTab;
window.switchRevenueTab = switchRevenueTab;
window.switchExpenseTab = switchExpenseTab;
window.switchExpandTab = switchExpandTab;
window.switchHomeTab = switchHomeTab;
window.updateShopInfo = updateShopInfo;
window.updateStaffInfo = updateStaffInfo;
window.openShop = openShop;
window.confirmExpenseStaffLevel = confirmExpenseStaffLevel;
window.updateStaffExpense = updateStaffExpense;
window.addOneBillion = addOneBillion;
window.confirmStaffLevel = confirmStaffLevel;
window.decreaseStaffLevel = decreaseStaffLevel;
window.increaseStaffLevel = increaseStaffLevel;

window.updateBoxOfficeTable = updateBoxOfficeTable;
window.openInventoryModal = openInventoryModal;
window.confirmWorkSchedule = confirmWorkSchedule;
window.closeWorkScheduleModal = closeWorkScheduleModal;

// 打开排片弹窗
function openScheduleModal() {
    // 打开弹窗，增加计数器并暂停游戏
    openModal();

    const modal = document.getElementById('schedule-modal');
    const modalMovieList = document.getElementById('modal-movie-list');
    
    if (modal && modalMovieList) {
        // 生成已排片电影列表
        modalMovieList.innerHTML = '';
        const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
        
        // 更新排片列表数量
        const scheduledCountElement = document.getElementById('scheduled-count');
        if (scheduledCountElement) {
            scheduledCountElement.textContent = `(${scheduledMovies.length})`;
        }
        
        // 更新电影库数量
        const libraryCountElement = document.getElementById('library-count');
        if (libraryCountElement) {
            libraryCountElement.textContent = `(${gameData.movies.length})`;
        }
        
        scheduledMovies.forEach(movie => {
            // 获取档位文本
            const tierText = movie.tier === 1 ? '1档' : movie.tier === 2 ? '2档' : '3档';
            // 检查是否为新片（上映天数<=3）
            const isNew = movie.daysReleased <= 3;
            const newTag = isNew ? '（新）' : '';
            
            const movieItem = document.createElement('div');
            movieItem.className = 'movie-item';
            movieItem.innerHTML = `
                <div class="movie-info">
                    <div class="movie-info-header">
                        <button class="remove-from-schedule-btn" onclick="removeFromSchedule(${movie.id})"></button>
                        <h3>${movie.name}${newTag}</h3>
                    </div>
                    <p>${movie.type}片，${tierText}，${movie.schedule}%，上映${movie.daysReleased}天</p>
                </div>
                <div class="movie-controls">
                    <input type="range" min="0" max="100" value="${movie.schedule}" class="schedule-slider" data-movie-id="${movie.id}">
                </div>
            `;
            modalMovieList.appendChild(movieItem);
        });
        
        // 生成电影库列表
        generateMovieLibrary();
        
        // 绑定排片滑块事件，实现按档调整排片百分比
        const sliders = modalMovieList.querySelectorAll('.schedule-slider');
        sliders.forEach((slider) => {
            slider.addEventListener('input', function() {
                const movieId = parseInt(this.getAttribute('data-movie-id'));
                const currentValue = parseInt(this.value);
                const movieItem = this.closest('.movie-item');
                const scheduleText = movieItem.querySelector('.movie-info p:last-child');
                
                // 获取当前电影
                const currentMovie = gameData.movies.find(movie => movie.id === movieId);
                if (!currentMovie) return;
                
                if (scheduleText) {
                    // 获取电影信息
                    const movieType = currentMovie.type;
                    const tierText = currentMovie.tier === 1 ? '1档' : currentMovie.tier === 2 ? '2档' : '3档';
                    // 更新电影信息文本
                    scheduleText.textContent = `${movieType}片，${tierText}，${currentValue}%`;
                }
                
                // 获取当前电影的档位
                const currentTier = currentMovie.tier;
                
                // 重新获取已排片电影
                const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
                
                // 计算剩余可分配的排片
                const remaining = Math.max(0, 100 - currentValue);
                
                // 按档分组电影
                const otherMovies = scheduledMovies.filter(movie => movie.id !== movieId);
                const tierGroups = {};
                
                // 按档位分组
                otherMovies.forEach(movie => {
                    if (!tierGroups[movie.tier]) {
                        tierGroups[movie.tier] = [];
                    }
                    tierGroups[movie.tier].push(movie);
                });
                
                // 定义档位权重
                const tierWeights = {
                    1: 3, // 1档权重最高
                    2: 2, // 2档权重中等
                    3: 1  // 3档权重最低
                };
                
                // 计算总权重
                let totalWeight = 0;
                Object.keys(tierGroups).forEach(tier => {
                    const weight = tierWeights[tier] || 1;
                    totalWeight += weight * tierGroups[tier].length;
                });
                
                // 按档分配剩余排片
                if (totalWeight > 0) {
                    Object.keys(tierGroups).forEach(tier => {
                        const weight = tierWeights[tier] || 1;
                        const tierMovies = tierGroups[tier];
                        const tierWeight = weight * tierMovies.length;
                        const tierAllocation = Math.floor((tierWeight / totalWeight) * remaining);
                        
                        // 分配给该档位的每部电影
                        if (tierMovies.length > 0) {
                            const perMovieAllocation = Math.floor(tierAllocation / tierMovies.length);
                            const remainder = tierAllocation % tierMovies.length;
                            
                            tierMovies.forEach((movie, i) => {
                                let newValue = perMovieAllocation;
                                if (i < remainder) {
                                    newValue += 1;
                                }
                                // 更新电影的排片值
                                movie.schedule = newValue;
                                // 找到对应的滑块并更新
                                const otherSlider = document.querySelector(`.schedule-slider[data-movie-id="${movie.id}"]`);
                                if (otherSlider) {
                                    otherSlider.value = newValue;
                                    // 更新对应电影的排片文本
                                    const otherMovieItem = otherSlider.closest('.movie-item');
                                    const otherScheduleText = otherMovieItem.querySelector('.movie-info p:last-child');
                                    if (otherScheduleText) {
                                        // 获取电影信息
                                        const movieType = movie.type;
                                        const tierText = movie.tier === 1 ? '1档' : movie.tier === 2 ? '2档' : '3档';
                                        // 更新电影信息文本
                                        otherScheduleText.textContent = `${movieType}片，${tierText}，${newValue}%`;
                                    }
                                }
                            });
                        }
                    });
                }
                
                // 更新当前电影的排片值
                currentMovie.schedule = currentValue;
            });
        });
        
        // 显示弹窗
        modal.classList.add('show');
    }
}

// 关闭排片弹窗
function closeScheduleModal() {
    const modal = document.getElementById('schedule-modal');
    if (modal) {
        modal.classList.remove('show');
        // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
        closeModal();
    }
}

// 从排片中移除电影
function removeFromSchedule(movieId) {
    const movie = gameData.movies.find(movie => movie.id === movieId);
    if (movie) {
        // 更新电影状态
        movie.inSchedule = false;
        movie.schedule = 0; // 重置排片占比
        
        // 重新计算剩余排片电影的排片比例，确保总和为100%
        const scheduledMovies = gameData.movies.filter(m => m.inSchedule);
        
        if (scheduledMovies.length === 1) {
            // 如果是唯一一部电影，设置为100%
            scheduledMovies[0].schedule = 100;
        } else if (scheduledMovies.length > 1) {
            // 多部电影，按等级比例计算排片占比
            const tierWeights = {
                1: 3,  // 1档电影权重最高
                2: 2,  // 2档电影权重中等
                3: 1   // 3档电影权重最低
            };
            
            // 计算总权重
            let totalWeight = 0;
            scheduledMovies.forEach(m => {
                totalWeight += tierWeights[m.tier] || 1;
            });
            
            // 按权重分配排片
            if (totalWeight > 0) {
                let allocatedTotal = 0;
                scheduledMovies.forEach((m, index) => {
                    const weight = tierWeights[m.tier] || 1;
                    const allocation = Math.floor((weight / totalWeight) * 100);
                    m.schedule = allocation;
                    allocatedTotal += allocation;
                });
                
                // 确保总和为100%
                if (allocatedTotal < 100) {
                    const remaining = 100 - allocatedTotal;
                    // 按权重分配剩余的排片
                    scheduledMovies.forEach(m => {
                        const weight = tierWeights[m.tier] || 1;
                        const allocation = Math.floor((weight / totalWeight) * remaining);
                        if (allocation > 0) {
                            m.schedule += allocation;
                        }
                    });
                    
                    // 再次检查，确保总和为100%
                    const finalTotal = scheduledMovies.reduce((sum, m) => sum + m.schedule, 0);
                    if (finalTotal < 100) {
                        // 将剩余的分配给权重最高的电影
                        scheduledMovies.sort((a, b) => {
                            const weightA = tierWeights[a.tier] || 1;
                            const weightB = tierWeights[b.tier] || 1;
                            return weightB - weightA;
                        });
                        if (scheduledMovies.length > 0) {
                            scheduledMovies[0].schedule += 100 - finalTotal;
                        }
                    }
                }
            }
        }
        

        
        // 重新生成电影库列表和排片列表
        generateMovieLibrary();
        generateScheduledMoviesList();
        
        // 更新数量显示
        const scheduledCountElement = document.getElementById('scheduled-count');
        if (scheduledCountElement) {
            const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
            scheduledCountElement.textContent = `(${scheduledMovies.length})`;
        }
        
        const libraryCountElement = document.getElementById('library-count');
        if (libraryCountElement) {
            libraryCountElement.textContent = `(${gameData.movies.length})`;
        }
    }
}

// 保存排片设置
function saveSchedule() {
    // 增加排片次数计数
    gameData.totalScheduleCount += 1;
    
    // 更新图表
    import('./modules/chartManager.js').then(({ updateChart }) => {
        updateChart();
    });
    
    // 显示保存成功通知
    showNotification('排片设置：已保存排片配置');
    
    // 关闭弹窗
    closeScheduleModal();
}

// 生成电影库列表
function generateMovieLibrary() {
    const movieLibraryList = document.getElementById('movie-library-list');
    if (!movieLibraryList) return;
    
    // 生成电影库列表
    movieLibraryList.innerHTML = '';
    
    // 添加影片数量统计
    const countElement = document.createElement('div');
    countElement.className = 'movie-count';
    countElement.textContent = `共 ${gameData.movies.length} 部影片`;
    movieLibraryList.appendChild(countElement);
    
    if (gameData.movies.length === 0) {
        movieLibraryList.innerHTML = '<p style="text-align: center; color: #666;">电影库为空</p>';
        return;
    }
    
    // 按上映天数排序（最新的在上）
    const sortedMovies = [...gameData.movies].sort((a, b) => {
        // 优先显示新片（上映天数少的）
        return a.daysReleased - b.daysReleased;
    });
    
    sortedMovies.forEach(movie => {
        // 只显示未排片的电影
        if (!movie.inSchedule) {
            // 获取档位文本
            const tierText = movie.tier === 1 ? '1档' : movie.tier === 2 ? '2档' : '3档';
            // 检查是否为新片（上映天数<=3）
            const isNew = movie.daysReleased <= 3;
            const newTag = isNew ? '（新）' : '';
            
            const movieItem = document.createElement('div');
               movieItem.className = 'movie-item';
               movieItem.innerHTML = `
                   <div class="movie-info">
                       <div class="movie-info-header">
                           <button class="add-to-schedule-btn" onclick="addToSchedule(${movie.id})"></button>
                           <h3>${movie.name}${newTag}</h3>
                       </div>
                       <p>${movie.type}片，${tierText}，上映${movie.daysReleased}天</p>
                   </div>
               `;
            movieLibraryList.appendChild(movieItem);
        }
    });
}

// 生成已排片电影列表
function generateScheduledMoviesList() {
    const modalMovieList = document.getElementById('modal-movie-list');
    if (!modalMovieList) return;
    
    // 清空列表
    modalMovieList.innerHTML = '';
    
    // 获取已排片电影
    const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
    
    // 计算总厅数
    let totalHalls = 3; // 总店 3 个厅
    if (gameData.shopRanges && gameData.shopRanges.length > 0) {
        gameData.shopRanges.forEach(range => {
            const shopDataInfo = shopData[range.level];
            if (shopDataInfo) {
                totalHalls += shopDataInfo.halls * range.count;
            }
        });
    } else if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            const shopDataInfo = shopData[shop.level];
            if (shopDataInfo) {
                totalHalls += shopDataInfo.halls;
            }
        });
    }
    
    // 获取当前班制
    const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    
    // 计算排片数量：厅数 * 4 * 班制数
    const scheduleCapacity = totalHalls * 4 * workSchedule;
    
    // 计算每厅片量
    const moviesPerHall = Math.ceil(scheduledMovies.length / totalHalls);
    
    // 添加每厅片量信息
    const hallInfoElement = document.createElement('div');
    hallInfoElement.style.cssText = 'margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 4px;';
    hallInfoElement.innerHTML = `<strong>总厅数：${totalHalls}个 | 排片容量：${scheduleCapacity}部</strong>`;
    modalMovieList.appendChild(hallInfoElement);
    
    // 生成已排片电影列表
    scheduledMovies.forEach(movie => {
        // 获取档位文本
        const tierText = movie.tier === 1 ? '1档' : movie.tier === 2 ? '2档' : '3档';
        // 检查是否为新片（上映天数<=3）
        const isNew = movie.daysReleased <= 3;
        const newTag = isNew ? '（新）' : '';
        
        const movieItem = document.createElement('div');
        movieItem.className = 'movie-item';
        movieItem.innerHTML = `
            <div class="movie-info">
                <div class="movie-info-header">
                    <button class="remove-from-schedule-btn" onclick="removeFromSchedule(${movie.id})"></button>
                    <h3>${movie.name}${newTag}</h3>
                </div>
                <p>${movie.type}片，${tierText}，${movie.schedule}%，上映${movie.daysReleased}天</p>
            </div>
            <div class="movie-controls">
                <input type="range" min="0" max="100" value="${movie.schedule}" class="schedule-slider" data-movie-id="${movie.id}">
            </div>
        `;
        modalMovieList.appendChild(movieItem);
    });
    
    // 绑定排片滑块事件
    const sliders = modalMovieList.querySelectorAll('.schedule-slider');
    sliders.forEach((slider) => {
        slider.addEventListener('input', function() {
            const movieId = parseInt(this.getAttribute('data-movie-id'));
            const currentValue = parseInt(this.value);
            const movieItem = this.closest('.movie-item');
            const scheduleText = movieItem.querySelector('.movie-info p:last-child');
            
            // 获取当前电影
            const currentMovie = gameData.movies.find(movie => movie.id === movieId);
            if (!currentMovie) return;
            
            if (scheduleText) {
                // 获取电影信息
                const movieType = currentMovie.type;
                const tierText = currentMovie.tier === 1 ? '1档' : currentMovie.tier === 2 ? '2档' : '3档';
                // 更新电影信息文本
                scheduleText.textContent = `${movieType}片，${tierText}，${currentValue}%`;
            }
            
            // 获取当前电影的档位
            const currentTier = currentMovie.tier;
            
            // 重新获取已排片电影
            const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
            
            // 计算剩余可分配的排片
            const remaining = Math.max(0, 100 - currentValue);
            
            // 按档分组电影
            const otherMovies = scheduledMovies.filter(movie => movie.id !== movieId);
            const tierGroups = {};
            
            // 按档位分组
            otherMovies.forEach(movie => {
                if (!tierGroups[movie.tier]) {
                    tierGroups[movie.tier] = [];
                }
                tierGroups[movie.tier].push(movie);
            });
            
            // 定义档位权重
            const tierWeights = {
                1: 3, // 1档权重最高
                2: 2, // 2档权重中等
                3: 1  // 3档权重最低
            };
            
            // 计算总权重
            let totalWeight = 0;
            Object.keys(tierGroups).forEach(tier => {
                const weight = tierWeights[tier] || 1;
                totalWeight += weight * tierGroups[tier].length;
            });
            
            // 按档分配剩余排片
            if (totalWeight > 0) {
                Object.keys(tierGroups).forEach(tier => {
                    const weight = tierWeights[tier] || 1;
                    const tierMovies = tierGroups[tier];
                    const tierWeight = weight * tierMovies.length;
                    const tierAllocation = Math.floor((tierWeight / totalWeight) * remaining);
                    
                    // 分配给该档位的每部电影
                    if (tierMovies.length > 0) {
                        const perMovieAllocation = Math.floor(tierAllocation / tierMovies.length);
                        const remainder = tierAllocation % tierMovies.length;
                        
                        tierMovies.forEach((movie, i) => {
                            let newValue = perMovieAllocation;
                            if (i < remainder) {
                                newValue += 1;
                            }
                            // 更新电影的排片值
                            movie.schedule = newValue;
                            // 找到对应的滑块并更新
                            const otherSlider = document.querySelector(`.schedule-slider[data-movie-id="${movie.id}"]`);
                            if (otherSlider) {
                                otherSlider.value = newValue;
                                // 更新对应电影的排片文本
                                const otherMovieItem = otherSlider.closest('.movie-item');
                                const otherScheduleText = otherMovieItem.querySelector('.movie-info p:last-child');
                                if (otherScheduleText) {
                                    // 获取电影信息
                                    const movieType = movie.type;
                                    const tierText = movie.tier === 1 ? '1档' : movie.tier === 2 ? '2档' : '3档';
                                    // 更新电影信息文本
                                    otherScheduleText.textContent = `${movieType}片，${tierText}，${newValue}%`;
                                }
                            }
                        });
                    }
                });
            }
            
            // 更新当前电影的排片值
            currentMovie.schedule = currentValue;
        });
    });
}

// 添加电影到排片
function addToSchedule(movieId) {
    const movie = gameData.movies.find(movie => movie.id === movieId);
    if (movie) {
        // 更新电影状态
        movie.inSchedule = true;
        
        // 重新计算所有已排片电影的排片比例，确保总和为100%
        const scheduledMovies = gameData.movies.filter(m => m.inSchedule);
        
        if (scheduledMovies.length === 1) {
            // 如果是唯一一部电影，设置为100%
            movie.schedule = 100;
        } else {
            // 多部电影，按等级比例计算排片占比
            const tierWeights = {
                1: 3,  // 1档电影权重最高
                2: 2,  // 2档电影权重中等
                3: 1   // 3档电影权重最低
            };
            
            // 计算总权重
            let totalWeight = 0;
            scheduledMovies.forEach(m => {
                totalWeight += tierWeights[m.tier] || 1;
            });
            
            // 按权重分配排片
            if (totalWeight > 0) {
                let allocatedTotal = 0;
                scheduledMovies.forEach((m, index) => {
                    const weight = tierWeights[m.tier] || 1;
                    const allocation = Math.floor((weight / totalWeight) * 100);
                    m.schedule = allocation;
                    allocatedTotal += allocation;
                });
                
                // 确保总和为100%
                if (allocatedTotal < 100) {
                    const remaining = 100 - allocatedTotal;
                    // 按权重分配剩余的排片
                    scheduledMovies.forEach(m => {
                        const weight = tierWeights[m.tier] || 1;
                        const allocation = Math.floor((weight / totalWeight) * remaining);
                        if (allocation > 0) {
                            m.schedule += allocation;
                        }
                    });
                    
                    // 再次检查，确保总和为100%
                    const finalTotal = scheduledMovies.reduce((sum, m) => sum + m.schedule, 0);
                    if (finalTotal < 100) {
                        // 将剩余的分配给权重最高的电影
                        scheduledMovies.sort((a, b) => {
                            const weightA = tierWeights[a.tier] || 1;
                            const weightB = tierWeights[b.tier] || 1;
                            return weightB - weightA;
                        });
                        if (scheduledMovies.length > 0) {
                            scheduledMovies[0].schedule += 100 - finalTotal;
                        }
                    }
                }
            }
        }
        

        
        // 重新生成电影库列表和排片列表
        generateMovieLibrary();
        generateScheduledMoviesList();
        
        // 更新数量显示
        const scheduledCountElement = document.getElementById('scheduled-count');
        if (scheduledCountElement) {
            const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
            scheduledCountElement.textContent = `(${scheduledMovies.length})`;
        }
        
        const libraryCountElement = document.getElementById('library-count');
        if (libraryCountElement) {
            libraryCountElement.textContent = `(${gameData.movies.length})`;
        }
    }
}



// 合作洽谈相关变量
let currentCooperation = {
    type: '',
    name: '',
    basePrice: 0,
    currentTier: 0
};

// 打开合作洽谈弹窗
function openCooperationModal(type, name, price) {
    // 暂停游戏计时
    gameData.timePaused = true;
    
    // 暂停沙漏动画
    const hourglass = document.querySelector('.hourglass');
    if (hourglass) {
        hourglass.classList.add('paused');
    }
    
    currentCooperation = {
        type: type,
        name: name,
        basePrice: price,
        currentTier: 0
    };
    
    const modal = document.getElementById('cooperation-modal');
    const titleElement = document.getElementById('cooperation-title');
    const descriptionElement = document.getElementById('cooperation-description');
    
    if (modal && titleElement && descriptionElement) {
        // 生成咨询方名称
        let consultantName;
        if (name === '私人包场') {
            // 私人包场使用人物名称
            consultantName = generatePersonName();
        } else {
            // 其他合作使用企业/单位名称
            consultantName = generateOrganizationName();
        }
        
        // 设置标题为 "xx咨询xx合作事宜"
        titleElement.textContent = `${consultantName}咨询${name}合作事宜`;
        
        if (type === 'income') {
            descriptionElement.textContent = `基础收入：¥${formatAssets(price)}`;
        } else {
            descriptionElement.textContent = `基础支出：¥${formatAssets(price)}`;
        }
        
        // 重置价格档位选择
        const slider = document.getElementById('price-tier-slider');
        if (slider) {
            slider.value = 1.0;
        }
        
        // 重置价格信息
        document.getElementById('price-info').textContent = '报价金额：¥0';
        
        // 触发一次滑块事件，以更新初始显示
        selectPriceTier(1.0);
        
        // 显示弹窗
        modal.classList.add('show');
    }
}

// 关闭合作洽谈弹窗
function closeCooperationModal() {
    const modal = document.getElementById('cooperation-modal');
    if (modal) {
        modal.classList.remove('show');
        // 恢复游戏计时
        gameData.timePaused = false;
        // 恢复沙漏动画
        const hourglass = document.querySelector('.hourglass');
        if (hourglass) {
            hourglass.classList.remove('paused');
        }
    }
}

// 选择价格档位
function selectPriceTier(tier) {
    // 将tier转换为数字类型
    const priceMultiplier = parseFloat(tier);
    currentCooperation.currentTier = priceMultiplier;
    
    // 计算成功率：价格倍数越低，成功率越高
    // 使用线性关系：价格倍数每增加0.1，成功率降低10%
    // 基础价格（1.0）对应60%成功率
    let successRate = Math.round(60 - (priceMultiplier - 1.0) * 100);
    
    // 确保成功率在合理范围内
    successRate = Math.max(10, Math.min(95, successRate));
    
    const finalPrice = Math.floor(currentCooperation.basePrice * priceMultiplier);
    
    // 更新显示
    if (currentCooperation.type === 'income') {
        document.getElementById('price-info').textContent = `报价收入：¥${formatAssets(finalPrice)}`;
    } else {
        document.getElementById('price-info').textContent = `报价支出：¥${formatAssets(finalPrice)}`;
    }
}

// 确认合作报价
function confirmCooperation() {
    if (currentCooperation.currentTier === 0) {
        alert('请选择报价档位');
        return;
    }
    
    // 获取价格倍数和计算成功率
    const priceMultiplier = currentCooperation.currentTier;
    
    // 计算成功率：价格倍数越低，成功率越高
    // 使用线性关系：价格倍数每增加0.1，成功率降低10%
    // 基础价格（1.0）对应60%成功率
    let successRate = Math.round(60 - (priceMultiplier - 1.0) * 100);
    
    // 确保成功率在合理范围内
    successRate = Math.max(10, Math.min(95, successRate));
    
    const finalPrice = Math.floor(currentCooperation.basePrice * priceMultiplier);
    
    // 检查资金是否足够（只对支出类型的合作进行检查）
    if (currentCooperation.type === 'expense' && gameData.money < finalPrice) {
        alert('资金不足，无法完成报价');
        return;
    }
    
    // 模拟成功率
    const random = Math.random() * 100;
    const isSuccess = random < successRate;
    
    // 处理资金
    if (isSuccess) {
        if (currentCooperation.type === 'income') {
            // 收入类型的合作成功后增加资金
            gameData.money += finalPrice;
            
            // 所有收入类型的合作都添加到总收入
            gameData.totalRevenue += finalPrice;
            
            // 只有月度持续合作才添加到月度合作收入
            if (currentCooperation.type === 'income') {
                // 所有收入类型的合作都添加到活跃合作列表
                gameData.cooperation.activeCooperations.push({
                    name: currentCooperation.name,
                    income: finalPrice,
                    startDate: {...gameData.date}
                });
                // 根据合作类型更新不同的合作收入
                if (currentCooperation.name === '映前广告' || currentCooperation.name === '影厅冠名') {
                    // 映前广告和影厅冠名是长期合作收入
                    gameData.cooperation.monthlyIncome += finalPrice;
                } else {
                    // 其他合作（如包场）是单次合作收入
                    gameData.cooperation.oneTimeIncome += finalPrice;
                }
            }
        } else {
            // 支出类型的合作成功后扣除资金
            gameData.money -= finalPrice;
        }
    } else {
        // 合作失败不扣钱，但是机会消失
        // 收入类型和支出类型的合作失败都不扣钱
    }
    
    // 移除合作机会（如果存在）
    if (gameData.cooperationOpportunities[currentCooperation.name]) {
        delete gameData.cooperationOpportunities[currentCooperation.name];
    }
    
    // 只有在有分店的情况下才显示店铺前缀
    let notificationMessage;
    if (isSuccess) {
        if (gameData.shops && gameData.shops.length > 0) {
            // 随机选择一个店铺（包括总店）
            const totalShops = gameData.shops.length + 1;
            const randomShopIndex = Math.floor(Math.random() * totalShops);
            let shopName;
            if (randomShopIndex === 0) {
                shopName = '1号店（总店）';
            } else {
                shopName = gameData.shops[randomShopIndex - 1].name;
            }
            if (currentCooperation.type === 'income') {
                notificationMessage = `${shopName}：与${currentCooperation.name}达成合作，收入¥${formatAssets(finalPrice)}`;
            } else {
                notificationMessage = `${shopName}：与${currentCooperation.name}达成合作，支出¥${formatAssets(finalPrice)}`;
            }
        } else {
            if (currentCooperation.type === 'income') {
                notificationMessage = `与${currentCooperation.name}达成合作，收入¥${formatAssets(finalPrice)}`;
            } else {
                notificationMessage = `与${currentCooperation.name}达成合作，支出¥${formatAssets(finalPrice)}`;
            }
        }
    } else {
        notificationMessage = '洽谈失败';
    }
    
    // 显示结果通知
    showNotification(notificationMessage);
    
    // 关闭弹窗
    closeCooperationModal();
    // 恢复游戏计时
    gameData.timePaused = false;
    
    // 更新UI
    updateUI();
}

// 添加角标
function addBadge(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('badge');
    }
}

// 移除角标
function removeBadge(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('badge');
    }
}

// 初始化角标
function initBadges() {
    // 模拟新片上映角标
    addBadge('schedule-tab-btn');
    
    // 模拟库存报警角标
    addBadge('sell-tab-btn');
    
    // 初始化合作相关角标
    updateCooperationBadges();
}

// 更新合作相关角标
function updateCooperationBadges() {
    // 检查是否有合作机会
    const hasCooperationOpportunities = Object.keys(gameData.cooperationOpportunities).length > 0;
    
    // 根据是否有合作机会显示或隐藏角标
    if (hasCooperationOpportunities) {
        addBadge('cooperation-tab-btn');
        addBadge('expense-cooperation-tab-btn');
    } else {
        removeBadge('cooperation-tab-btn');
        removeBadge('expense-cooperation-tab-btn');
    }
}

// 导出全局函数供HTML调用
window.openScheduleModal = openScheduleModal;
window.closeScheduleModal = closeScheduleModal;
window.removeFromSchedule = removeFromSchedule;
window.saveSchedule = saveSchedule;
window.addToSchedule = addToSchedule;
window.generateScheduledMoviesList = generateScheduledMoviesList;
window.generateMovieLibrary = generateMovieLibrary;

window.updateShopButtonStatus = updateShopButtonStatus;
window.upgradeShopLevel = upgradeShopLevel;
window.updateShopLevelsDisplay = updateShopLevelsDisplay;
window.openCooperationModal = openCooperationModal;
window.closeCooperationModal = closeCooperationModal;
window.selectPriceTier = selectPriceTier;
window.confirmCooperation = confirmCooperation;
window.updateCooperationBadges = updateCooperationBadges;
window.openUpgradeModal = openUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.updateUpgradeQuantity = updateUpgradeQuantity;
window.confirmUpgrade = confirmUpgrade;
window.showShopList = showShopList;
window.closeShopListModal = closeShopListModal;
window.calculateRadiationPopulation = calculateRadiationPopulation;
window.initializeDataCalculation = initializeDataCalculation;
window.doPromotion = doPromotion;
window.updatePromotionDisplay = updatePromotionDisplay;
window.updatePromotionButtonsStatus = updatePromotionButtonsStatus;
window.updateMaintenanceCycle = updateMaintenanceCycle;
window.updateMaintenanceBySlider = updateMaintenanceBySlider;
window.updateAirConditionerStatus = updateAirConditionerStatus;
window.updateEquipmentDisplay = updateEquipmentDisplay;
window.resetGame = resetGame;
window.skipMonth = skipMonth;
window.skipYear = skipYear;
window.showEquipmentDetail = showEquipmentDetail;
window.showXenonLampDetail = showXenonLampDetail;
window.replaceXenonLamp = replaceXenonLamp;
window.replaceEquipment = replaceEquipment;
window.updateWorkSchedule = updateWorkSchedule;
window.setGameSpeedBySlider = setGameSpeedBySlider;
window.getSpeedIndex = getSpeedIndex;
window.updateSpeedDisplay = updateSpeedDisplay;
window.updateSpeedDisplayBySlider = updateSpeedDisplayBySlider;
window.showPasswordPrompt = showPasswordPrompt;

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    initBadges();
});
