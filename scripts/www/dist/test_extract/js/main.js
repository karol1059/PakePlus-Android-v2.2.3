// Main entry file

import { gameData, resetGameData, saveGameProgress, loadGameProgress, checkGameProgress, formatAssets } from './modules/gameData.js';
import { generateMovieName, generateCinemaName, getRandomMovieType } from './modules/nameGenerator.js';
import { simulateDay, updateUI, generateMovieList, initializeDataCalculation, doPromotion, updatePromotionDisplay, updatePromotionButtonsStatus, updateMaintenanceCycle, updateMaintenanceBySlider, updateAirConditionerStatus, checkComplaints, updateEquipmentDisplay, showEquipmentDetail, replaceEquipment, showXenonLampDetail, replaceXenonLamp, skipMonth, skipYear } from './modules/gameLogic.js';
import { showPage, switchTab, switchRevenueTab, switchExpenseTab, switchExpandTab, switchHomeTab, initNotificationBar, checkScrollNeeded } from './modules/uiManager.js';
import { shopData, updateShopInfo, updateStaffInfo, openShop, confirmExpenseStaffLevel, getStaffLevelText, updateOverallStaffLevel, updateStaffExpense, addOneBillion, confirmStaffLevel, updateTotalStaffCount, updateShopButtonStatus, upgradeShopLevel, updateShopLevelsDisplay, openUpgradeModal, closeUpgradeModal, updateUpgradeQuantity, confirmUpgrade, showShopList, closeShopListModal, calculateRadiationPopulation } from './modules/expandManager.js';

// Western company name suffixes
const companyNames = [
    'Tech Corp', 'Trading Co', 'Media Group', 'Advertising Inc',
    'Real Estate Ltd', 'Restaurant Group', 'EduTech Corp', 'Financial Services',
    'Network Tech', 'Electronics Inc', 'Fashion Co', 'Food Industries',
    'Pharmaceutical Corp', 'Automotive Ltd', 'Construction Co', 'Logistics Inc'
];

// Western school name suffixes
const schoolNames = [
    'University', 'College', 'Polytechnic', 'High School', 'Middle School', 'Elementary School',
    'Kindergarten', 'Training Center', 'Art School', 'Sports Academy'
];

// Western surnames list
const surnames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

// Generate random company name
function generateCompanyName() {
    // Virtual brand prefixes
    const virtualPrefixes = [
        'Nebula', 'Galaxy', 'Future', 'Innovation', 'Tech', 'Dream', 'Stellar', 'Global', 'Cosmic', 'Infinite',
        'Quantum', 'Digital', 'Smart', 'Intelligent', 'Excellence', 'Elite', 'Pioneer', 'Leader', 'King', 'Legend',
        'Myth', 'Fairy', 'Fantasy', 'Creative', 'Inspiration', 'Spark', 'Lightning', 'Thunder', 'Storm',
        'Sunshine', 'Starlight', 'Moonlight', 'Aurora', 'Rainbow', 'Cloud', 'Sky', 'Ocean', 'Earth', 'Forest'
    ];
    
    const prefix = virtualPrefixes[Math.floor(Math.random() * virtualPrefixes.length)];
    const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];
    return prefix + companyName;
}

// Generate random school name
function generateSchoolName() {
    // Virtual school prefixes
    const virtualPrefixes = [
        'Nebula', 'Galaxy', 'Future', 'Innovation', 'Tech', 'Dream', 'Stellar', 'Global', 'Cosmic', 'Infinite',
        'Wisdom', 'Smart', 'Intelligent', 'Excellence', 'Elite', 'Pioneer', 'Leader', 'King', 'Legend', 'Myth'
    ];
    
    const prefix = virtualPrefixes[Math.floor(Math.random() * virtualPrefixes.length)];
    const schoolName = schoolNames[Math.floor(Math.random() * schoolNames.length)];
    return prefix + schoolName;
}

// Generate random organization name
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
    const gender = Math.random() > 0.5 ? 'Mr.' : 'Ms.';
    return surname + gender;
}

// 游戏循环变量（全局）
let gameInterval;
// 游戏Speed倍数
let gameSpeed = 1;

// Open弹窗时调用，增加弹窗计数器并Pause游戏
function openModal() {
    gameData.modalCount++;
    gameData.timePaused = true;
    
    // Pause沙漏动画
    const hourglass = document.querySelector('.hourglass');
    if (hourglass) {
        hourglass.classList.add('paused');
    }
}

// OFF弹窗时调用，减少弹窗计数器并Check是否All弹窗都已OFF
function closeModal() {
    gameData.modalCount = Math.max(0, gameData.modalCount - 1);
    
    // 只有当All弹窗都OFF时，才恢复游戏
    if (gameData.modalCount === 0) {
        gameData.timePaused = false;
        
        // 恢复沙漏动画
        const hourglass = document.querySelector('.hourglass');
        if (hourglass) {
            hourglass.classList.remove('paused');
        }
    }
}

// 班制时间Settings（Default1班制，4秒/天）
function startGameLoop() {
    // 清除现有定时器
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // 根据班制Settings时间间隔
    let interval = 4000; // Default1班制，4秒/天
    
    // 根据用户Select的班制来调整时间间隔
    const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    interval = 4000 * workSchedule; // 1班制 → 4秒/天，2班制 → 8秒/天，3班制 → 12秒/天
    
    // 根据游戏Speed调整时间间隔
    interval = Math.floor(interval / gameSpeed);
    
    // Start新的游戏循环
    gameInterval = setInterval(simulateDay, interval);
}

// Start新游戏
function startNewGame() {
    // ResetGame Data
    resetGameData();
    
    // Reset班制为1班制
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
    
    // 重新启动游戏循环（确保时间Normal流逝）
    startGameLoop();
    
    // 生成随机影院名称
    const randomCinemaName = generateCinemaName();
    
    // Display自定义的影院名称Input弹窗
    showCinemaNameModal(randomCinemaName);
}

// Reset游戏（用于破产后Start新游戏）
function resetGame() {
    // ResetGame Data
    resetGameData();
    
    // Reset班制为1班制
    localStorage.setItem('workSchedule', '2');
    
    // 直接Initialize游戏，不需要Display影院名称弹窗
    initGame();
}

// Display影院名称Input弹窗
window.showCinemaNameModal = function(randomName) {
    // Open弹窗，增加计数器并Pause游戏
    openModal();
    
    // 确保DOMElementLoad完成
    setTimeout(() => {
        // 获取DOMElement
        const inputElement = document.getElementById('cinema-name-input');
        const modalElement = document.getElementById('cinema-name-modal');
        
        if (inputElement && modalElement) {
            // Settings随机名称到Input框
            inputElement.value = randomName;
            
            // Display弹窗
            modalElement.classList.add('show');
        } else {
            // 如果DOMElement不Exist，使用Default名称并Continue游戏
            gameData.cinemaName = randomName;
            saveGameProgress();
            
            // 隐藏欢迎页面
            const welcomePage = document.getElementById('welcome-page');
            if (welcomePage) {
                welcomePage.style.display = 'none';
            }
            
            // OFF弹窗，减少计数器并Check是否All弹窗都已OFF
            closeModal();
        }
    }, 100); // 等待100毫秒，确保DOMElement已Load
}

// Open场地EquipmentQuantity洽谈模态框
window.openEquipmentQuantityModal = function() {
    // Open弹窗，增加计数器并Pause游戏
    openModal();
    
    // CreateEquipmentQuantity洽谈弹窗
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
    
    // Create弹窗内容
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
    
    // Modal title
    const title = document.createElement('h3');
    title.textContent = 'Venue Equipment Negotiation';
    title.style.marginTop = '0';
    modalContent.appendChild(title);
    
    // EquipmentType（随机生成）
    const equipmentTypes = [
        { name: 'Game Console', income: 500, electricity: 100 },
        { name: 'Claw Machine', income: 300, electricity: 50 },
        { name: 'Karaoke Booth', income: 200, electricity: 100 }
    ];
    
    // 随机Select一种EquipmentType
    const randomType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
    
    // Equipment信息Display
    const equipmentInfo = document.createElement('div');
    equipmentInfo.style.cssText = `
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        background-color: #e3f2fd;
    `;
    
    equipmentInfo.innerHTML = `
        <strong>Equipment Information</strong>
        <br>
        Equipment Type: ${randomType.name}
        <br>
        Monthly Rent Income: ¥${randomType.income} | Monthly Electricity: ¥${randomType.electricity}
    `;
    
    modalContent.appendChild(equipmentInfo);
    
    // QuantitySelect（使用滑块，限制0-5台/店）
    const quantitySection = document.createElement('div');
    quantitySection.style.cssText = `
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        background-color: #f5f5f5;
    `;
    
    // Calculate总ShopQuantity
    function getTotalShopCount() {
        let shopCount = 1; // Main Store
        if (gameData.shops && gameData.shops.length > 0) {
            shopCount += gameData.shops.length;
        }
        return shopCount;
    }
    
    // Calculate单种Equipment的最大Quantity
    function getMaxEquipmentCount(equipmentType) {
        let maxCount = 0;
        // ShopLevel对应的Equipment上限
        const levelLimits = {
            convenience: 10,
            premium: 20,
            flagship: 50,
            super: 100
        };
        // CalculateShopQuantity
        let shopStats = {
            convenience: 1,
            premium: 0,
            flagship: 0,
            super: 0
        };
        // Calculate分店
        if (gameData.shops && gameData.shops.length > 0) {
            gameData.shops.forEach(shop => {
                if (shop.level && shopStats.hasOwnProperty(shop.level)) {
                    shopStats[shop.level]++;
                }
            });
        }
        // Calculate最大Quantity
        for (let level in shopStats) {
            maxCount += shopStats[level] * levelLimits[level];
        }
        return maxCount;
    }
    
    // 获取CurrentEquipmentQuantity
    function getCurrentEquipmentCount(equipmentType) {
        return gameData.equipment && gameData.equipment[equipmentType] ? gameData.equipment[equipmentType] : 0;
    }
    
    const shopCount = getTotalShopCount();
    const maxPerShop = 5;
    const maxEquipmentCount = getMaxEquipmentCount(randomType.name);
    const currentEquipmentCount = getCurrentEquipmentCount(randomType.name);
    // Calculate最大可添加Quantity：取5*店数和剩余Capacity的Min值
    const maxQuantity = Math.min(maxPerShop * shopCount, maxEquipmentCount - currentEquipmentCount);
    
    quantitySection.innerHTML = `
        <strong>Equipment Quantity</strong>
        <br>
        <label>Select Quantity:</label>
        <input type="range" id="equipment-quantity" min="0" max="${maxQuantity}" value="0" style="margin-left: 10px;">
        <span id="quantity-value">0</span> units
        <br>


    `;
    
    modalContent.appendChild(quantitySection);
    
    // Confirm按钮
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
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
    
    // Check是否可以添加Equipment（基于总ShopQuantity）
    const canAddEquipment = maxQuantity > 0;
    if (!canAddEquipment) {
        confirmButton.disabled = true;
        confirmButton.style.backgroundColor = '#cccccc';
        confirmButton.style.cursor = 'not-allowed';
    }
    
    confirmButton.onclick = () => {
        // 获取Select的Quantity
        const quantity = parseInt(document.getElementById('equipment-quantity').value) || 0;
        
        // 如果SelectQuantity为0，DisplayNotice
        if (quantity === 0) {
            showNotification('请Select要添加的EquipmentQuantity');
            return;
        }
        
        // Calculate总ShopQuantity
        function getTotalShopCount() {
            let shopCount = 1; // Main Store
            if (gameData.shops && gameData.shops.length > 0) {
                shopCount += gameData.shops.length;
            }
            return shopCount;
        }
        
        // 总EquipmentQuantity（滑块值已经是总Quantity）
        const shopCount = getTotalShopCount();
        const totalQuantity = quantity;
        
        // CalculateCurrent总EquipmentQuantity
        function getCurrentTotalEquipmentCount() {
            let totalCount = 0;
            if (gameData.equipment) {
                // 只CalculateEquipmentType的Quantity，排除其他属性
                const equipmentTypes = ['Game Console', 'Claw Machine', 'Karaoke Booth'];
                equipmentTypes.forEach(type => {
                    if (typeof gameData.equipment[type] === 'number') {
                        totalCount += gameData.equipment[type];
                    }
                });
            }
            return totalCount;
        }
        
        // CheckEquipment上限
        const currentCount = gameData.equipment && gameData.equipment[randomType.name] ? gameData.equipment[randomType.name] : 0;
        const newCount = currentCount + totalQuantity;
        
        // CalculateCurrent总EquipmentQuantity
        const currentTotalCount = getCurrentTotalEquipmentCount();
        const newTotalCount = currentTotalCount + totalQuantity;
        
        // Calculate总Equipment上限
        function getTotalEquipmentLimit() {
            let totalLimit = 0;
            const levelLimits = {
                convenience: 10,
                premium: 20,
                flagship: 50,
                super: 100
            };
            
            // CalculateShopQuantity和Level
            let shopStats = {
                convenience: 1, // Main StoreDefault是Convenience Store
                premium: 0,
                flagship: 0,
                super: 0
            };
            
            // Calculate分店
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
        
        // Check总EquipmentQuantity是否超过上限
        if (newTotalCount > totalLimit) {
            showNotification(`Equipment quantity exceeds limit! Current limit: ${totalLimit}, Current Count: ${currentTotalCount}, after adding: ${newTotalCount}`);
            return;
        }
        
        // CalculateSuccess率（基于每店平均Quantity）
        let successRate = 0;
        if (quantity > 0) {
            const perShopQuantity = quantity / shopCount;
            successRate = Math.max(0, 100 - (perShopQuantity - 3) * 10);
        }
        
        // 随机判断是否Success
        const isSuccess = Math.random() * 100 < successRate;
        
        if (isSuccess) {
            // CalculateRevenue和电费（基于总Quantity）
            const totalIncome = totalQuantity * randomType.income;
            const totalElectricity = totalQuantity * randomType.electricity;
            const totalProfit = totalIncome - totalElectricity;
            
            // UpdateEquipmentQuantity
            if (!gameData.equipment) {
                gameData.equipment = {};
            }
            
            gameData.equipment[randomType.name] = newCount;
            
            // 将场地Equipment的MonthRentRevenue计入每Month合作Revenue
            gameData.cooperation.activeCooperations.push({
                name: randomType.name,
                income: totalIncome,
                startDate: {...gameData.date}
            });
            gameData.cooperation.monthlyIncome += totalIncome;
            
            // Display success message
            const perShopQuantity = (totalQuantity / shopCount).toFixed(1);
            showNotification(`${randomType.name} negotiation successful! Placed ${totalQuantity} units (${perShopQuantity} units/store × ${shopCount} stores), monthly rent income +¥${formatAssets(totalIncome)}, monthly electricity +¥${formatAssets(totalElectricity)}, monthly net profit +¥${formatAssets(totalProfit)}`);
        } else {
            // Display failed message
            showNotification('Negotiation Failed');
        }
        
        // OFF弹窗
                document.body.removeChild(modal);
                // OFF弹窗，减少计数器并Check是否All弹窗都已OFF
                closeModal();
                
                // UpdateUI
                updateUI();
    };
    modalContent.appendChild(confirmButton);
    
    // Cancel按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
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
        // OFF弹窗，减少计数器并Check是否All弹窗都已OFF
        closeModal();
    };
    modalContent.appendChild(cancelButton);
    
    // 添加到弹窗
    modal.appendChild(modalContent);
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 绑定滑块事items（在modal添加到DOM后执行）
    const slider = document.getElementById('equipment-quantity');
    const valueDisplay = document.getElementById('quantity-value');
    
    if (slider && valueDisplay) {
        function updateValues() {
            const value = parseInt(slider.value);
            valueDisplay.textContent = value;
        }
        
        // 绑定事items
        slider.addEventListener('input', updateValues);
        // 立即执行一次Update
        updateValues();
    }
}

// Confirm影院名称
function confirmCinemaName() {
    // CheckDOMElement是否Exist
    const inputElement = document.getElementById('cinema-name-input');
    const modalElement = document.getElementById('cinema-name-modal');
    
    if (inputElement && modalElement) {
        // 获取用户Input的名称
        const userInput = inputElement.value.trim();
        
        // 使用用户Input的名称
        gameData.cinemaName = userInput;
        
        // 隐藏弹窗
        modalElement.classList.remove('show');
        
        // OFF弹窗，减少计数器并Check是否All弹窗都已OFF
        closeModal();
        
        // Save游戏状态到本地存储
        saveGameProgress();
        
        // 隐藏欢迎页面
        const welcomePage = document.getElementById('welcome-page');
        if (welcomePage) {
            welcomePage.style.display = 'none';
        }
        
        // Initialize游戏
        initGame();
    }
}

// 使用随机影院名称
function useRandomCinemaName() {
    // CheckDOMElement是否Exist
    const inputElement = document.getElementById('cinema-name-input');
    const modalElement = document.getElementById('cinema-name-modal');
    
    if (inputElement && modalElement) {
        // 使用Input框中的随机名称
        gameData.cinemaName = inputElement.value;
        
        // 隐藏弹窗
        modalElement.classList.remove('show');
        
        // OFF弹窗，减少计数器并Check是否All弹窗都已OFF
        closeModal();
        
        // Save游戏状态到本地存储
        saveGameProgress();
        
        // 隐藏欢迎页面
        const welcomePage = document.getElementById('welcome-page');
        if (welcomePage) {
            welcomePage.style.display = 'none';
        }
        
        // Initialize游戏
        initGame();
    }
}

// Continue游戏
function continueGame() {
    // 从本地存储LoadGame Data
    loadGameProgress();
    
    // 隐藏欢迎页面
    const welcomePage = document.getElementById('welcome-page');
    if (welcomePage) {
        welcomePage.style.display = 'none';
    }
}

// 手动Load
function loadGame() {
    // OpenLoad弹窗
    openLoadModal();
}

// OpenSave弹窗
async function openSaveModal() {
    // Update存Tier信息
    await updateSaveSlotInfo();
    
    // DisplaySave弹窗
    const saveModal = document.getElementById('save-modal');
    if (saveModal) {
        saveModal.classList.add('show');
    }
}

// OFFSave弹窗
function closeSaveModal() {
    const saveModal = document.getElementById('save-modal');
    if (saveModal) {
        saveModal.classList.remove('show');
    }
}

// OpenLoad弹窗
async function openLoadModal() {
    // Update存Tier信息
    await updateLoadSlotInfo();
    
    // DisplayLoad弹窗
    const loadModal = document.getElementById('load-modal');
    if (loadModal) {
        loadModal.classList.add('show');
    }
}

// OFFLoad弹窗
function closeLoadModal() {
    const loadModal = document.getElementById('load-modal');
    if (loadModal) {
        loadModal.classList.remove('show');
    }
}

// OpenHelp弹窗
function openHelpModal() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
        helpModal.classList.add('show');
    }
}

// OFFHelp弹窗
function closeHelpModal() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
        helpModal.classList.remove('show');
    }
}

// 将System相关函数暴露到全局作用域
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

// InitializeIndexedDB
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
            console.error('IndexedDBInitializeFailed:', event.target.error);
            reject('IndexedDBInitializeFailed');
        };
    });
}

// Save游戏到指定存Tier
async function saveToSlot(slot) {
    console.log('Saving to slot:', slot);
    try {
        // 准备SaveData，优化Data大小
        const saveData = {
            gameData: optimizeGameData(JSON.parse(JSON.stringify(gameData))), // 深拷贝并优化Data
            timestamp: new Date().toLocaleString(),
            date: {...gameData.date},
            money: gameData.money,
            slot: slot
        };
        
        console.log('Save data prepared');
        
        // Save到IndexedDB
        const db = await initIndexedDB();
        const transaction = db.transaction('saves', 'readwrite');
        const store = transaction.objectStore('saves');
        
        await new Promise((resolve, reject) => {
            const request = store.put(saveData);
            request.onsuccess = resolve;
            request.onerror = reject;
        });
        
        // OFFData库连接
        db.close();
        
        // Update存Tier信息
        updateSaveSlotInfo();
        
        // DisplaySaveSuccessNotification
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>Save successful: Saved to slot ${slot}</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    } catch (error) {
        console.error('Error saving game:', error);
        // DisplaySaveFailedNotification
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            let errorMessage = error.message || 'SaveFailed';
            notificationContent.innerHTML = `<span>Save failed:${errorMessage}</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    }
}

// 优化Game Data大小
function optimizeGameData(data) {
    // 限制历史记录长度
    if (data.monthlyRecords && data.monthlyRecords.length > 12) {
        data.monthlyRecords = data.monthlyRecords.slice(-12); // 只保留最近12个Month的记录
    }
    
    if (data.annualRecords && data.annualRecords.length > 5) {
        data.annualRecords = data.annualRecords.slice(-5); // 只保留最近5Year的记录
    }
    
    if (data.equipment && data.equipment.故障History && data.equipment.故障History.length > 20) {
        data.equipment.故障History = data.equipment.故障History.slice(-20); // 只保留最近20次故障记录
    }
    
    // Clear空数组和对象
    if (data.cooperationOpportunities && Object.keys(data.cooperationOpportunities).length === 0) {
        delete data.cooperationOpportunities;
    }
    
    return data;
}

// Clear Game Data
function clearGameData() {
    showCustomConfirm('Are you sure you want to clear history data? This action cannot be undone!', function() {
        try {
            // ClearGame Data中的历史记录
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
            
            // SaveClear后的Data
            saveGameProgress();
            
            // DisplayClearSuccessNotification
            const notificationContent = document.getElementById('notification-content');
            if (notificationContent) {
                notificationContent.innerHTML = '<span>DataClearSuccess：历史Data已Clear</span>';
                checkScrollNeeded();
                
                setTimeout(() => {
                    notificationContent.innerHTML = '';
                    checkScrollNeeded();
                }, 3000);
            }
            
            // UpdateUI
            updateUI();
            
            console.log('Historical game data cleared successfully');
        } catch (error) {
            console.error('Error clearing game data:', error);
            // DisplayClearFailedNotification
            const notificationContent = document.getElementById('notification-content');
            if (notificationContent) {
                notificationContent.innerHTML = `<span>Data clear failed:${error.message}</span>`;
                checkScrollNeeded();
                
                setTimeout(() => {
                    notificationContent.innerHTML = '';
                    checkScrollNeeded();
                }, 3000);
            }
        }
    }, function() {
        // 用户CancelClear操作
        console.log('Clear data operation cancelled');
    });
}

// Settings游戏Speed
function setGameSpeed(speed) {
    // 转换为数字
    const newSpeed = parseInt(speed);
    
    // Display confirm dialog
    showCustomConfirm(`Are you sure you want to adjust game speed to ${newSpeed}x Speed?`, function() {
        // 用户Confirm后执行SpeedSwitch
        gameSpeed = newSpeed;
        
        // 重启游戏循环以应用新Speed
        startGameLoop();
        
        // DisplaySpeed变更Notification
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>Game speed adjusted to${gameSpeed}x Speed</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
        
        console.log('Game speed changed to', gameSpeed, 'x');
    }, function() {
        // 用户Cancel，恢复原SpeedSelect
        const speedSelect = document.querySelector('.speed-select');
        if (speedSelect) {
            speedSelect.value = gameSpeed;
        }
        // 恢复滑块值
        const speedSlider = document.querySelector('.speed-slider');
        if (speedSlider) {
            speedSlider.value = getSpeedIndex(gameSpeed);
        }
        // Update speed display
        updateSpeedDisplay(gameSpeed);
    });
}

// 根据滑块值Settings游戏Speed
function setGameSpeedBySlider(sliderValue) {
    // 滑块值 1: 1x Speed, 2: 2x Speed, 3: 4x Speed
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
    
    // DisplayConfirm弹窗
    showCustomConfirm(`Are you sure you want to adjust game speed to${newSpeed}x Speed吗？`, function() {
        // 用户Confirm后执行SpeedSwitch
        gameSpeed = newSpeed;
        
        // 重启游戏循环以应用新Speed
        startGameLoop();
        
        // DisplaySpeed变更Notification
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>Game speed adjusted to${gameSpeed}x Speed</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
        
        // Update speed display
        updateSpeedDisplay(gameSpeed);
        
        console.log('Game speed changed to', gameSpeed, 'x');
    }, function() {
        // 用户Cancel，恢复原SpeedSelect
        const speedSlider = document.querySelector('.speed-slider');
        if (speedSlider) {
            speedSlider.value = getSpeedIndex(gameSpeed);
        }
        // Update speed display
        updateSpeedDisplay(gameSpeed);
    });
}

// 根据游戏Speed获取滑块索引
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

// Update speed display
function updateSpeedDisplay(speed) {
    const speedValueElement = document.getElementById('speed-value');
    if (speedValueElement) {
        speedValueElement.textContent = `${speed}x Speed`;
    }
}

// 根据滑块值UpdateSpeedDisplay
function updateSpeedDisplayBySlider(sliderValue) {
    // 滑块值 1: 1x Speed, 2: 2x Speed, 3: 4x Speed
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
        speedValueElement.textContent = `${displaySpeed}x Speed`;
    }
}

// Switch游戏Pause/Continue
function toggleGamePause() {
    // SwitchPause状态
    gameData.timePaused = !gameData.timePaused;
    
    // Update按钮文本、图标和颜色
    const pauseButton = document.querySelector('.bottom-nav .nav-btn:nth-child(3)');
    if (pauseButton) {
        const iconElement = pauseButton.querySelector('.nav-icon');
        const textElement = pauseButton.querySelector('span:last-child');
        
        if (gameData.timePaused) {
            iconElement.textContent = '▶️';
            textElement.textContent = 'Continue';
            pauseButton.style.backgroundColor = '#4CAF50'; // 绿色表示可以Continue
        } else {
            iconElement.textContent = '⏸️';
            textElement.textContent = 'Pause';
            pauseButton.style.backgroundColor = '#f44336'; // 红色表示可以Pause
        }
    }
    
    // Control沙漏动画
    const hourglass = document.querySelector('.hourglass');
    if (hourglass) {
        if (gameData.timePaused) {
            hourglass.classList.add('paused');
        } else {
            hourglass.classList.remove('paused');
        }
    }
    
    // Control游戏循环
    if (!gameData.timePaused) {
        // Continue游戏，重启游戏循环
        startGameLoop();
    } else {
        // Pause游戏，清除游戏循环
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
    }
    
    // DisplayPause/ContinueNotification
    const notificationContent = document.getElementById('notification-content');
    if (notificationContent) {
        const status = gameData.timePaused ? 'Pause' : 'Continue';
        notificationContent.innerHTML = `<span>Game${status}</span>`;
        checkScrollNeeded();
        
        setTimeout(() => {
            notificationContent.innerHTML = '';
            checkScrollNeeded();
        }, 3000);
    }
    
    console.log('Game', gameData.timePaused ? 'paused' : 'resumed');
}

// 从指定存TierLoad游戏
async function loadFromSlot(slot) {
    console.log('Loading from slot:', slot);
    try {
        // 从IndexedDBLoadSave
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
        
        // OFFData库连接
        db.close();
        
        if (!saveData) {
            throw new Error('Save不Exist');
        }
        
        console.log('Save data loaded:', saveData);
        
        // 验证Data完整性
        if (!saveData.gameData) {
            throw new Error('SaveData不完整');
        }
        
        // LoadGame Data
        Object.assign(gameData, saveData.gameData);
        console.log('Game data loaded successfully');
        
        // DisplayLoadSuccessNotification
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>Load successful: Loaded from slot ${slot} loading game</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
        
        // OFFLoad弹窗
        closeLoadModal();
        
        // 隐藏欢迎页面
        const welcomePage = document.getElementById('welcome-page');
        if (welcomePage) {
            welcomePage.style.display = 'none';
        }
        
        // UpdateUI
        updateUI();
        console.log('UI updated');
        console.log('Welcome page hidden');

    } catch (error) {
        console.error('Error loading save data:', error);
        console.error('Error stack:', error.stack);
        // DisplayLoadFailedNotification
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>Load failed:${error.message}</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    }
}

// Update存Tier信息
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
                        const cinemaName = saveData.gameData.cinemaName || 'Unnamed Cinema';
                        slotInfoElement.textContent = `${saveData.timestamp} | ${cinemaName} | Assets: ¥${formatAssets(saveData.money)} | Year ${saveData.date.year}/${saveData.date.month}/${saveData.date.day}`;
                    } else {
                        slotInfoElement.textContent = 'Empty Slot';
                    }
                } catch (error) {
                    console.error('Error parsing save data for slot', i, error);
                    slotInfoElement.textContent = 'Save Damaged';
                }
            }
        }
        
        // OFFData库连接
        db.close();
    } catch (error) {
        console.error('Error updating save slot info:', error);
    }
}

// Update读Tier信息
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
                        const cinemaName = saveData.gameData.cinemaName || 'Unnamed Cinema';
                        slotInfoElement.textContent = `${saveData.timestamp} | ${cinemaName} | Assets: ¥${formatAssets(saveData.money)} | Year ${saveData.date.year}/${saveData.date.month}/${saveData.date.day}`;
                    } else {
                        slotInfoElement.textContent = 'Empty Slot';
                    }
                } catch (error) {
                    console.error('Error parsing save data for slot', i, error);
                    slotInfoElement.textContent = 'Save Damaged';
                }
            }
        }
        
        // OFFData库连接
        db.close();
    } catch (error) {
        console.error('Error updating load slot info:', error);
    }
}

// Initialize游戏
function initGame() {
    // InitializeNotification栏
    initNotificationBar();
    
    // Check游戏进度
    checkGameProgress();
    
    // 生成Movie列表
    generateMovieList();
    
    // InitializeDataCalculate
    initializeDataCalculation();
    
    // 首次进入游戏时Display新手指引
    const hasSavedGame = localStorage.getItem('hasSavedGame');
    if (!hasSavedGame) {
        setTimeout(() => {
            openHelpModal();
        }, 1000); // 延迟1秒Display，确保游戏完全Initialize
    }
    
    // Initialize血条样式
initBloodBars();
    
    // Initialize沙漏Click事items
    initExpandClick();
    
    // Initialize班制下拉菜单
    const workScheduleSelect = document.getElementById('work-schedule');
    const currentSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    if (workScheduleSelect) {
        workScheduleSelect.value = currentSchedule;
    }
    
    // Initialize游戏Speed滑块
    const speedSlider = document.querySelector('.speed-slider');
    if (speedSlider) {
        speedSlider.value = getSpeedIndex(gameSpeed);
    }
    // Update speed display
    updateSpeedDisplay(gameSpeed);
    
    // Update招聘按钮状态
    updateRecruitButtonStatus();
    
    // Update开店按钮状态
    updateShopButtonStatus();
    
    // UpdateShopLevelDisplay
    updateShopLevelsDisplay();
    
    // Update总StaffQuantity（考虑班制）
    updateTotalStaffCount();
    
    // Update血条标签Display（考虑班制）
    updateShopInfo();
    
    // UpdateUI
    updateUI();
    
    // InitializePause按钮状态
    const pauseButton = document.querySelector('.bottom-nav .nav-btn:nth-child(3)');
    if (pauseButton) {
        const iconElement = pauseButton.querySelector('.nav-icon');
        const textElement = pauseButton.querySelector('span:last-child');
        
        if (gameData.timePaused) {
            iconElement.textContent = '▶️';
            textElement.textContent = 'Continue';
            pauseButton.style.backgroundColor = '#4CAF50'; // 绿色表示可以Continue
        } else {
            iconElement.textContent = '⏸️';
            textElement.textContent = 'Pause';
            pauseButton.style.backgroundColor = '#f44336'; // 红色表示可以Pause
        }
    }
    
    // Start游戏循环
    startGameLoop();
}

// Initialize血条样式
function initBloodBars() {
    // InitializeStaffConfiguration血条
    updateStaffBloodBar(3); // DefaultStandard
}

// Expansion按钮Click计数
let expandClickCount = 0;
let expandClickTimer = null;

// InitializeExpansion按钮Click事items
function initExpandClick() {
    console.log('Initializing expand button click event...');
    // 使用更直接的Select器
    const expandButton = document.querySelector('.bottom-nav .nav-btn:nth-child(4)');
    console.log('Expand button found:', expandButton);
    
    if (expandButton) {
        console.log('Expand button found:', expandButton);
        // 添加Click事items监听器
        expandButton.addEventListener('click', function(e) {
            console.log('Expand button clicked!');
            // 清除之前的定时器
            if (expandClickTimer) {
                clearTimeout(expandClickTimer);
            }
            
            // 增加Click计数
            expandClickCount++;
            console.log('Expand button clicked:', expandClickCount);
            
            // 3秒内没有Click则Reset计数
            expandClickTimer = setTimeout(function() {
                expandClickCount = 0;
                console.log('Expand click count reset');
            }, 3000);
            
            // 连续Click20次
            if (expandClickCount === 20) {
                // Reset计数
                expandClickCount = 0;
                console.log('Password prompt triggered');
                
                // 弹出密码框
                const password = prompt('请Input密码：');
                console.log('Password entered:', password);
                if (password === 'dianyingyuan') {
                    // Displayquick-actions div
                    const quickActions = document.querySelector('.quick-actions');
                    if (quickActions) {
                        quickActions.style.display = 'flex';
                        console.log('Quick actions shown');
                        
                        // 1分钟后再次隐藏
                        setTimeout(function() {
                            quickActions.style.display = 'none';
                            console.log('Quick actions hidden');
                        }, 60000);
                    }
                }
            }
        });
    } else {
        console.error('Expand button element not found');
    }
}

// UpdateStaff血条
function updateStaffBloodBar(level) {
    const bloodBarFill = document.getElementById('staff-blood-bar-fill');
    const currentStaffDisplay = document.getElementById('current-staff-display');
    if (bloodBarFill) {
        // Calculate血条宽度：1级=25%, 2级=50%, 3级=75%, 4级=100%
        const percentage = (level / 4) * 100;
        bloodBarFill.style.width = `${percentage}%`;
        
        // Update血条颜色
        bloodBarFill.className = 'blood-bar-fill'; // Reset类名
        bloodBarFill.classList.add(`level-${level}`); // 添加对应Level的颜色类
    }
    
    // UpdateCurrentStaffQuantityDisplay
    if (currentStaffDisplay) {
        // 获取Current班制
        const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
        
        // Calculate总StaffQuantity
        let totalStaff = 3 * workSchedule; // Main Store3人，乘以班制数
        
        if (gameData.shops && gameData.shops.length > 0) {
            gameData.shops.forEach(shop => {
                totalStaff += (shop.staffCount || 0) * workSchedule;
            });
        }
        
        currentStaffDisplay.textContent = totalStaff;
    }
}

// 增加StaffConfigurationLevel
function increaseStaffLevel() {
    const currentLevel = parseInt(localStorage.getItem('staffLevel')) || 3;
    if (currentLevel < 4) {
        const newLevel = currentLevel + 1;
        localStorage.setItem('staffLevel', newLevel);
        updateStaffBloodBar(newLevel);
        confirmExpenseStaffLevel(newLevel);
    }
}

// 减少StaffConfigurationLevel
function decreaseStaffLevel() {
    const currentLevel = parseInt(localStorage.getItem('staffLevel')) || 3;
    if (currentLevel > 1) {
        const newLevel = currentLevel - 1;
        localStorage.setItem('staffLevel', newLevel);
        updateStaffBloodBar(newLevel);
        confirmExpenseStaffLevel(newLevel);
    }
}

// Update招聘按钮状态
function updateRecruitButtonStatus() {
    const recruitButton = document.querySelector('.recruit-btn');
    if (recruitButton) {
        // 获取Current人员ConfigurationLevel
        const currentStaffLevel = parseInt(localStorage.getItem('staffLevel')) || 3;
        
        // Check是否已达到High（Level4）
        const canRecruit = currentStaffLevel < 4;
        
        // Settings按钮状态
        recruitButton.disabled = !canRecruit;
    }
}

// 存储临时班制值
let tempWorkSchedule = 1;

// Update班制Settings
function updateWorkSchedule(value) {
    tempWorkSchedule = parseInt(value);
    const originalSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    
    // Confirm dialog message
    let confirmMessage = '';
    switch (tempWorkSchedule) {
        case 1:
            confirmMessage = 'Are you sure you want to change to 1 Shift, business hours 14:00-22:00?';
            break;
        case 2:
            confirmMessage = 'Are you sure you want to change to 2 Shifts, business hours 08:00-24:00?';
            break;
        case 3:
            confirmMessage = 'Are you sure you want to change to 3 Shifts, business hours 00:00-24:00?';
            break;
    }
    
    // Update dialog message
    const messageElement = document.getElementById('work-schedule-modal-message');
    if (messageElement) {
        messageElement.textContent = confirmMessage;
    }
    
    // Show dialog
    const modal = document.getElementById('work-schedule-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Confirm Shift Schedule Switch
function confirmWorkSchedule() {
    const scheduleValue = tempWorkSchedule;
    
    localStorage.setItem('workSchedule', scheduleValue);
    
    // Update Shift Schedule Info Display
    const workScheduleInfo = document.getElementById('work-schedule-info');
    if (workScheduleInfo) {
        let scheduleText = '';
        switch (scheduleValue) {
            case 1:
                scheduleText = 'Current Hours: 14:00-22:00';
                break;
            case 2:
                scheduleText = 'Current Hours: 08:00-24:00';
                break;
            case 3:
                scheduleText = 'Current Hours: 00:00-24:00';
                break;
        }
        workScheduleInfo.textContent = scheduleText;
    }
    
    // 重新启动游戏循环（确保时间间隔正确）
    startGameLoop();
    
    // UpdateStaffQuantityDisplay
    updateTotalStaffCount();
    
    // Update血条标签Display（考虑班制）
    updateShopInfo();
    
    // Update电费Display
    updateEquipmentDisplay();
    
    // Display班制UpdateNotification
    showNotification(`Schedule updated to ${scheduleValue}-shift system`);
    
    // OFF弹窗
    closeWorkScheduleModal();
}

// OFF班制Switch弹窗
function closeWorkScheduleModal() {
    const modal = document.getElementById('work-schedule-modal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // 恢复原来的Select
    const originalSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    const selectElement = document.getElementById('work-schedule');
    if (selectElement) {
        selectElement.value = originalSchedule;
    }
}

// Open招聘Staff弹窗
function openRecruitModal() {
    // Open弹窗，增加计数器并Pause游戏
    openModal();
    
    const modal = document.getElementById('recruit-modal');
    if (modal) {
        // 获取CurrentShopLevel
        const shopLevelElement = document.getElementById('shop-level');
        const currentShopLevel = shopLevelElement ? shopLevelElement.value : 'convenience';
        
        // 获取Current人员ConfigurationLevel
        const currentStaffLevel = parseInt(localStorage.getItem('staffLevel')) || 3;
        
        // 获取ShopData
        const shop = shopData[currentShopLevel];
        if (!shop) return;
        
        // 获取Current人员Quantity
        let currentStaffCount;
        switch (currentStaffLevel) {
            case 1:
                currentStaffCount = shop.staff.min;
                break;
            case 2:
                currentStaffCount = shop.staff.low;
                break;
            case 3:
                currentStaffCount = shop.staff.standard;
                break;
            case 4:
                currentStaffCount = shop.staff.high;
                break;
            default:
                currentStaffCount = shop.staff.standard;
        }
        
        // Calculate最大可招聘People
        const maxRecruitCount = 4 - currentStaffLevel;
        
        // Update弹窗信息（仅当ElementExist时）
        const currentStaffDisplay = document.getElementById('current-staff-display');
        if (currentStaffDisplay) {
            currentStaffDisplay.textContent = currentStaffCount;
        }
        
        const maxRecruitDisplay = document.getElementById('max-recruit-display');
        if (maxRecruitDisplay) {
            maxRecruitDisplay.textContent = maxRecruitCount;
        }
        
        // Update招聘PeopleInput框的最大值
        const recruitCountInput = document.getElementById('recruit-count');
        if (recruitCountInput) {
            recruitCountInput.max = maxRecruitCount;
            recruitCountInput.value = Math.min(1, maxRecruitCount);
        }
        
        // 绑定Input变化事items
        bindRecruitInputEvents();
        
        // Display弹窗
        modal.classList.add('show');
    }
}

// OFF招聘Staff弹窗
function closeRecruitModal() {
    const modal = document.getElementById('recruit-modal');
    if (modal) {
        modal.classList.remove('show');
        // OFF弹窗，减少计数器并Check是否All弹窗都已OFF
        closeModal();
    }
}

// 绑定招聘Input事items
function bindRecruitInputEvents() {
    const recruitCountInput = document.getElementById('recruit-count');
    const recruitCountValue = document.getElementById('recruit-count-value');
    const customRecruitCountInput = document.getElementById('custom-recruit-count');
    
    // 滑块事itemsProcess
    if (recruitCountInput) {
        recruitCountInput.addEventListener('input', function() {
            // 四档卡位功能：吸附到最近的整数
            const value = parseFloat(this.value);
            const snappedValue = Math.round(value);
            this.value = snappedValue;
            
            // UpdateDisplay值
            if (recruitCountValue) {
                recruitCountValue.textContent = snappedValue;
            }
            
            // Update自定义Input框
            if (customRecruitCountInput) {
                customRecruitCountInput.value = snappedValue;
            }
            
            updateRecruitInfo();
        });
    }
    
    // 自定义Input框事itemsProcess
    if (customRecruitCountInput) {
        customRecruitCountInput.addEventListener('input', function() {
            let value = parseInt(this.value) || 1;
            // 限制值范围
            value = Math.max(1, Math.min(4, value));
            this.value = value;
            
            // Update滑块
            if (recruitCountInput) {
                recruitCountInput.value = value;
            }
            
            // UpdateDisplay值
            if (recruitCountValue) {
                recruitCountValue.textContent = value;
            }
            
            updateRecruitInfo();
        });
    }
    
    // 初始Update
    if (recruitCountInput && recruitCountValue && customRecruitCountInput) {
        const initialValue = Math.round(parseFloat(recruitCountInput.value));
        recruitCountInput.value = initialValue;
        recruitCountValue.textContent = initialValue;
        customRecruitCountInput.value = initialValue;
    }
    updateRecruitInfo();
}

// Update招聘信息
function updateRecruitInfo() {
    const recruitCount = parseInt(document.getElementById('recruit-count').value) || 1;
    // Default使用标准薪资
    const salaryLevel = 100;
    
    // Calculate招聘Cost（每人1000元）
    const recruitmentCost = recruitCount * 1000;
}

// Confirm招聘
function confirmRecruitment() {
    // 获取用户Input（从滑块控items）
    const recruitCount = parseInt(document.getElementById('recruit-count').value) || 1;
    // Default使用标准薪资
    const salaryLevel = 100;
    
    // 获取CurrentShopLevel
    const shopLevelElement = document.getElementById('shop-level');
    const currentShopLevel = shopLevelElement ? shopLevelElement.value : 'convenience';
    
    // 获取Current人员ConfigurationLevel
    const currentStaffLevel = parseInt(localStorage.getItem('staffLevel')) || 3;
    
    // 获取ShopData
    const shop = shopData[currentShopLevel];
    if (!shop) return;
    
    // Calculate招聘Cost（每人1000元）
    const recruitmentCost = recruitCount * 1000;
    
    // Check资金是否足够
    if (gameData.money < recruitmentCost) {
        showMessageModal('Insufficient Funds', 'Insufficient funds, cannot hire staff!');
        return;
    }
    
    // Calculate新的人员ConfigurationLevel
    const newStaffLevel = currentStaffLevel + recruitCount;
    
    // Check是否已达到High
    if (newStaffLevel > 4) {
        showMessageModal('Staff Limit Reached', 'Staff count has reached maximum, cannot continue hiring!');
        return;
    }
    
    // 扣除招聘Cost
    gameData.money -= recruitmentCost;
    
    // Update人员ConfigurationLevel
    localStorage.setItem('staffLevel', newStaffLevel);
    
    // Update血条和ConfigurationDisplay
    updateStaffBloodBar(newStaffLevel);
    
    // 获取新的人员Quantity
    let newStaffCount;
    switch (newStaffLevel) {
        case 1:
            newStaffCount = shop.staff.min;
            break;
        case 2:
            newStaffCount = shop.staff.low;
            break;
        case 3:
            newStaffCount = shop.staff.standard;
            break;
        case 4:
            newStaffCount = shop.staff.high;
            break;
        default:
            newStaffCount = shop.staff.standard;
    }
    
    // CalculateMonthExpense增加
    const monthlyCostIncrease = salaryLevel * 30 * recruitCount;
    
    // Display招聘SuccessNotification
    const levelText = getStaffLevelText(newStaffLevel);
    showNotification(`Recruitment successful: Hired ${recruitCount} staff, current level: ${levelText}, total staff: ${newStaffCount}, monthly cost increase: ¥${formatAssets(monthlyCostIncrease)}`);
    
    // OFF弹窗
    closeRecruitModal();
    
    // Update招聘按钮状态
    updateRecruitButtonStatus();
    
    // UpdateUI
    updateUI();
}



// UpdateBox Office表格
function updateBoxOfficeTable() {
    const tableBody = document.getElementById('boxOfficeTableBody');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 获取ScheduleMovie
    const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
    if (scheduledMovies.length === 0) {
        // If no scheduled movies, display empty state
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" style="text-align: center; padding: 20px;">No Scheduled Movies</td>';
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Calculate总Box Office和人次
    let totalBoxOffice = 0;
    
    // 为每部影片添加Box Office指数级别（如果不Exist）
    scheduledMovies.forEach(movie => {
        if (!movie.boxOfficeLevel) {
            // 根据概率生成Box Office指数级别
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
    
    // Calculate各级别吸引的顾客比例
    const levelAttraction = {
        1: 0.8, // 1级：吸引80%的顾客
        2: 0.5, // 2级：吸引50%的顾客
        3: 0.3, // 3级：吸引30%的顾客
        4: 0.3, // 4级：吸引30%的顾客
        5: 0.1  // 5级：吸引10%的顾客
    };
    
    // Calculate总Schedule占比
    let totalSchedule = 0;
    scheduledMovies.forEach(movie => {
        totalSchedule += movie.schedule;
    });
    
    // Calculate每部Movie的吸引力权重（与Schedule占比无关，添加50%随机偏差）
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
    
    // Calculate每部Movie的人次和Box Office
    scheduledMovies.forEach(movie => {
        const ticketPrice = movie.tier === 1 ? 40 : movie.tier === 2 ? 30 : 20; // Tier票价
        
        // 根据吸引力权重分配到店People
        let viewers = 0;
        if (totalAttractionWeight > 0) {
            const weightRatio = movie.attractionWeight / totalAttractionWeight;
            viewers = Math.floor(gameData.arrivalCount * weightRatio);
        }
        movie.viewers = viewers;
        
        // 再根据人次CalculateBox Office
        const movieBoxOffice = viewers * ticketPrice;
        movie.currentBoxOffice = movieBoxOffice;
        totalBoxOffice += movieBoxOffice;
    });
    
    // 按Box Office排序
    scheduledMovies.sort((a, b) => b.currentBoxOffice - a.currentBoxOffice);
    
    // 填充表格
    scheduledMovies.forEach((movie, index) => {
        const row = document.createElement('tr');
        
        // CalculateBox Office占比
        const boxOfficeShare = totalBoxOffice > 0 ? (movie.currentBoxOffice / totalBoxOffice * 100).toFixed(1) : 0;
        
        // CalculateSchedule场次
        const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
        let totalHalls = 3; // Main Store3个厅
        if (gameData.shops && gameData.shops.length > 0) {
            gameData.shops.forEach(shop => {
                const shopDataInfo = shopData[shop.level];
                if (shopDataInfo) {
                    totalHalls += shopDataInfo.halls;
                }
            });
        }
        const scheduleCapacity = totalHalls * 4 * workSchedule;
        const screenings = Math.round(scheduleCapacity * (movie.schedule / 100));
        
        // 使用gameLogic.js中Calculate的人次值
        const viewers = movie.viewers || 0;
        
        row.innerHTML = `
            <td>
                <span class="rank">${index + 1}</span>
                <span class="movie-name">${movie.name}</span>
                <div class="movie-info">${movie.type}, Tier ${movie.tier}, Day ${movie.daysReleased}</div>
            </td>
            <td class="box-office">${formatAssets(movie.currentBoxOffice)}</td>
            <td class="viewers mobile-hide">${viewers}</td>
            <td class="box-office-share">${boxOfficeShare}%</td>
            <td class="screenings mobile-hide">${screenings}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// OpenPurchase弹窗
function openInventoryModal() {
    // Open弹窗，增加计数器并Pause游戏
    openModal();
    
    // Create设货弹窗
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
    
    // Create弹窗内容
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
    
    // Modal title
    const title = document.createElement('h3');
    title.textContent = 'Purchase Management';
    title.style.marginTop = '0';
    modalContent.appendChild(title);
    
    // Purchase商品列表
    const inventoryList = document.createElement('div');
    inventoryList.style.cssText = 'margin: 20px 0;';
    
    // 为每个商品添加Purchase选项
        gameData.products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.style.cssText = `
                padding: 15px;
                margin: 10px 0;
                border-radius: 4px;
                background-color: #f5f5f5;
            `;
            
            // SettingsPurchase价格
            let purchasePrice;
            switch(product.name) {
                case 'Popcorn':
                    purchasePrice = 6;
                    break;
                case 'Cola':
                    purchasePrice = 4;
                    break;
                case 'MovieWeek边':
                    purchasePrice = 15;
                    break;
                default:
                    purchasePrice = product.price * 0.4;
            }
            
            // Calculate总Halls
            let totalHalls = 3; // Main Store3个厅
            if (gameData.shops && gameData.shops.length > 0) {
                gameData.shops.forEach(shop => {
                    const shopDataInfo = shopData[shop.level];
                    if (shopDataInfo) {
                        totalHalls += shopDataInfo.halls;
                    }
                });
            }
            
            // Calculate库存总上限（Halls*200）
            const stockLimit = totalHalls * 200;
            
            // CalculateCurrent总库存
            const currentTotalStock = gameData.products.reduce((sum, p) => sum + p.stock, 0);
            
            // Calculate最大PurchaseQuantity（库存上限-Current总库存）
            const maxPurchase = Math.max(0, stockLimit - currentTotalStock);
            const initialValue = Math.min(10, maxPurchase);
            
            productItem.innerHTML = `
                <div style="display: block;">
                    <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 20px;">
                        <strong>${product.name}</strong>
                        <span>Current Stock：${product.stock}</span>
                        <span>Purchase Price：¥${purchasePrice}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; justify-content: flex-start;">
                        <label>Purchase Quantity：</label>
                        <input type="range" id="inventory-${product.id}" min="0" max="${maxPurchase}" value="${initialValue}" style="width: 100px;">
                        <span id="inventory-${product.id}-value">${initialValue}</span>items
                    </div>
                </div>
            `;
            
            inventoryList.appendChild(productItem);
        });
    
    modalContent.appendChild(inventoryList);
    
    // 为All滑块添加事items监听
    setTimeout(() => {
        // Calculate总Halls
        let totalHalls = 3; // Main Store3个厅
        if (gameData.shops && gameData.shops.length > 0) {
            gameData.shops.forEach(shop => {
                const shopDataInfo = shopData[shop.level];
                if (shopDataInfo) {
                    totalHalls += shopDataInfo.halls;
                }
            });
        }
        
        // Calculate库存总上限（Halls*200）
        const stockLimit = totalHalls * 200;
        
        // CalculateCurrent总库存
        const currentTotalStock = gameData.products.reduce((sum, p) => sum + p.stock, 0);
        
        // 初始总PurchaseQuantity
        let totalPurchase = 0;
        
        // 为每个滑块添加事items监听
        gameData.products.forEach(product => {
            const slider = document.getElementById(`inventory-${product.id}`);
            const valueDisplay = document.getElementById(`inventory-${product.id}-value`);
            if (slider && valueDisplay) {
                console.log(`绑定滑块事items: inventory-${product.id}`);
                
                // Initialize总PurchaseQuantity
                totalPurchase += parseInt(slider.value) || 0;
                
                // 使用闭包SaveCurrent的valueDisplay
                slider.addEventListener('input', function() {
                    const currentValue = parseInt(this.value) || 0;
                    console.log(`滑块值变化: ${currentValue}`);
                    valueDisplay.textContent = currentValue;
                    
                    // CalculateCurrent总PurchaseQuantity
                    let currentTotalPurchase = 0;
                    gameData.products.forEach(p => {
                        const s = document.getElementById(`inventory-${p.id}`);
                        if (s) {
                            currentTotalPurchase += parseInt(s.value) || 0;
                        }
                    });
                    
                    // Calculate库存上限
                    const maxTotalPurchase = stockLimit - currentTotalStock;
                    
                    // 如果总PurchaseQuantity超过上限，需要调整其他滑块
                    if (currentTotalPurchase > maxTotalPurchase) {
                        // Calculate超出的Quantity
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
                        
                        // 按Current值从大到小排序
                        otherSliders.sort((a, b) => b.value - a.value);
                        
                        // 减少其他滑块的值，从最大的Start
                        let remainingExcess = excess;
                        otherSliders.forEach(item => {
                            if (remainingExcess <= 0) return;
                            
                            const maxReduction = item.value; // 可以减少到0
                            const reduction = Math.min(maxReduction, remainingExcess);
                            
                            const newValue = item.value - reduction;
                            item.slider.value = newValue;
                            
                            // UpdateDisplay
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
    
    // Confirm按钮
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
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
        // Calculate总PurchaseCost
        let totalCost = 0;
        let totalQuantity = 0;
        
        gameData.products.forEach(product => {
            const inputElement = document.getElementById(`inventory-${product.id}`);
            if (inputElement) {
                const quantity = parseInt(inputElement.value) || 0;
                if (quantity > 0) {
                    // SettingsPurchase价格
                    let purchasePrice;
                    switch(product.name) {
                        case 'Popcorn':
                            purchasePrice = 6;
                            break;
                        case 'Cola':
                            purchasePrice = 4;
                            break;
                        case 'MovieWeek边':
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
        
        // Calculate总Halls
        let totalHalls = 3; // Main Store3个厅
        if (gameData.shops && gameData.shops.length > 0) {
            gameData.shops.forEach(shop => {
                const shopDataInfo = shopData[shop.level];
                if (shopDataInfo) {
                    totalHalls += shopDataInfo.halls;
                }
            });
        }
        
        // Calculate库存总上限（Halls*200）
        const stockLimit = totalHalls * 200;
        
        // CalculateCurrent总库存
        const currentTotalStock = gameData.products.reduce((sum, product) => sum + product.stock, 0);
        
        // Check资金是否足够
        if (gameData.money < totalCost) {
            showMessageModal('Insufficient Funds', 'Insufficient funds, cannot purchase!');
            return;
        }
        
        // Check库存是否会超过上限
        if (currentTotalStock + totalQuantity > stockLimit) {
            showMessageModal('Inventory Limit', `Inventory will exceed limit! Current limit: ${stockLimit}, Current Stock: ${currentTotalStock}, after purchase: ${currentTotalStock + totalQuantity}`);
            return;
        }
        
        // 扣除资金并增加库存
        gameData.money -= totalCost;
        gameData.totalPurchaseCount += 1;
        // 记录PurchaseExpense
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
        
        // DisplayPurchaseSuccessNotification
        showNotification(`Purchase successful: Purchased ${totalQuantity} items, cost: ¥${formatAssets(totalCost)}`);
        
        // OFF弹窗
                document.body.removeChild(modal);
                // OFF弹窗，减少计数器并Check是否All弹窗都已OFF
                closeModal();
                
                // UpdateUI
                updateUI();
    };
    modalContent.appendChild(confirmButton);
    
    // Cancel按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
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
        // OFF弹窗，减少计数器并Check是否All弹窗都已OFF
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
window.closeRecruitModal = closeRecruitModal;
window.confirmRecruitment = confirmRecruitment;
window.updateBoxOfficeTable = updateBoxOfficeTable;
window.openInventoryModal = openInventoryModal;
window.confirmWorkSchedule = confirmWorkSchedule;
window.closeWorkScheduleModal = closeWorkScheduleModal;

// OpenSchedule弹窗
function openScheduleModal() {
    // Open弹窗，增加计数器并Pause游戏
    openModal();

    const modal = document.getElementById('schedule-modal');
    const modalMovieList = document.getElementById('modal-movie-list');
    
    if (modal && modalMovieList) {
        // 生成已ScheduleMovie列表
        modalMovieList.innerHTML = '';
        const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
        
        // UpdateSchedule列表Quantity
        const scheduledCountElement = document.getElementById('scheduled-count');
        if (scheduledCountElement) {
            scheduledCountElement.textContent = `(${scheduledMovies.length})`;
        }
        
        // UpdateMovie库Quantity
        const libraryCountElement = document.getElementById('library-count');
        if (libraryCountElement) {
            libraryCountElement.textContent = `(${gameData.movies.length})`;
        }
        
        scheduledMovies.forEach(movie => {
            // 获取Tier文本
            const tierText = movie.tier === 1 ? '1档' : movie.tier === 2 ? '2档' : '3档';
            // Check是否为New（Release天数<=3）
            const isNew = movie.daysReleased <= 3;
            const newTag = isNew ? ' (New)' : '';
            
            const movieItem = document.createElement('div');
            movieItem.className = 'movie-item';
            movieItem.innerHTML = `
                <div class="movie-info">
                    <div class="movie-info-header">
                        <button class="remove-from-schedule-btn" onclick="removeFromSchedule(${movie.id})"></button>
                        <h3>${movie.name}${newTag}</h3>
                    </div>
                    <p>${movie.type}, ${tierText}, ${movie.schedule}%, Day ${movie.daysReleased}</p>
                </div>
                <div class="movie-controls">
                    <input type="range" min="0" max="100" value="${movie.schedule}" class="schedule-slider" data-movie-id="${movie.id}">
                </div>
            `;
            modalMovieList.appendChild(movieItem);
        });
        
        // 生成Movie库列表
        generateMovieLibrary();
        
        // 绑定Schedule滑块事items，实现按档调整Schedule百分比
        const sliders = modalMovieList.querySelectorAll('.schedule-slider');
        sliders.forEach((slider) => {
            slider.addEventListener('input', function() {
                const movieId = parseInt(this.getAttribute('data-movie-id'));
                const currentValue = parseInt(this.value);
                const movieItem = this.closest('.movie-item');
                const scheduleText = movieItem.querySelector('.movie-info p:last-child');
                
                // 获取CurrentMovie
                const currentMovie = gameData.movies.find(movie => movie.id === movieId);
                if (!currentMovie) return;
                
                if (scheduleText) {
                    // 获取Movie信息
                    const movieType = currentMovie.type;
                    const tierText = currentMovie.tier === 1 ? '1档' : currentMovie.tier === 2 ? '2档' : '3档';
                    // UpdateMovie信息文本
                    scheduleText.textContent = `${movieType}, ${tierText}，${currentValue}%`;
                }
                
                // 获取CurrentMovie的Tier
                const currentTier = currentMovie.tier;
                
                // 重新获取已ScheduleMovie
                const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
                
                // Calculate剩余可分配的Schedule
                const remaining = Math.max(0, 100 - currentValue);
                
                // 按档分组Movie
                const otherMovies = scheduledMovies.filter(movie => movie.id !== movieId);
                const tierGroups = {};
                
                // 按Tier分组
                otherMovies.forEach(movie => {
                    if (!tierGroups[movie.tier]) {
                        tierGroups[movie.tier] = [];
                    }
                    tierGroups[movie.tier].push(movie);
                });
                
                // 定义Tier权重
                const tierWeights = {
                    1: 3, // 1档权重最高
                    2: 2, // 2档权重中等
                    3: 1  // 3档权重最低
                };
                
                // Calculate总权重
                let totalWeight = 0;
                Object.keys(tierGroups).forEach(tier => {
                    const weight = tierWeights[tier] || 1;
                    totalWeight += weight * tierGroups[tier].length;
                });
                
                // 按档分配剩余Schedule
                if (totalWeight > 0) {
                    Object.keys(tierGroups).forEach(tier => {
                        const weight = tierWeights[tier] || 1;
                        const tierMovies = tierGroups[tier];
                        const tierWeight = weight * tierMovies.length;
                        const tierAllocation = Math.floor((tierWeight / totalWeight) * remaining);
                        
                        // 分配给该Tier的每部Movie
                        if (tierMovies.length > 0) {
                            const perMovieAllocation = Math.floor(tierAllocation / tierMovies.length);
                            const remainder = tierAllocation % tierMovies.length;
                            
                            tierMovies.forEach((movie, i) => {
                                let newValue = perMovieAllocation;
                                if (i < remainder) {
                                    newValue += 1;
                                }
                                // UpdateMovie的Schedule值
                                movie.schedule = newValue;
                                // 找到对应的滑块并Update
                                const otherSlider = document.querySelector(`.schedule-slider[data-movie-id="${movie.id}"]`);
                                if (otherSlider) {
                                    otherSlider.value = newValue;
                                    // Update对应Movie的Schedule文本
                                    const otherMovieItem = otherSlider.closest('.movie-item');
                                    const otherScheduleText = otherMovieItem.querySelector('.movie-info p:last-child');
                                    if (otherScheduleText) {
                                        // 获取Movie信息
                                        const movieType = movie.type;
                                        const tierText = movie.tier === 1 ? '1档' : movie.tier === 2 ? '2档' : '3档';
                                        // UpdateMovie信息文本
                                        otherScheduleText.textContent = `${movieType}, ${tierText}，${newValue}%`;
                                    }
                                }
                            });
                        }
                    });
                }
                
                // UpdateCurrentMovie的Schedule值
                currentMovie.schedule = currentValue;
            });
        });
        
        // Display弹窗
        modal.classList.add('show');
    }
}

// OFFSchedule弹窗
function closeScheduleModal() {
    const modal = document.getElementById('schedule-modal');
    if (modal) {
        modal.classList.remove('show');
        // OFF弹窗，减少计数器并Check是否All弹窗都已OFF
        closeModal();
    }
}

// 从Schedule中移除Movie
function removeFromSchedule(movieId) {
    const movie = gameData.movies.find(movie => movie.id === movieId);
    if (movie) {
        // UpdateMovie状态
        movie.inSchedule = false;
        movie.schedule = 0; // ResetSchedule占比
        
        // 重新Calculate剩余ScheduleMovie的Schedule比例，确保Total为100%
        const scheduledMovies = gameData.movies.filter(m => m.inSchedule);
        
        if (scheduledMovies.length === 1) {
            // 如果是唯一一部Movie，Settings为100%
            scheduledMovies[0].schedule = 100;
        } else if (scheduledMovies.length > 1) {
            // 多部Movie，按Level比例CalculateSchedule占比
            const tierWeights = {
                1: 3,  // 1档Movie权重最高
                2: 2,  // 2档Movie权重中等
                3: 1   // 3档Movie权重最低
            };
            
            // Calculate总权重
            let totalWeight = 0;
            scheduledMovies.forEach(m => {
                totalWeight += tierWeights[m.tier] || 1;
            });
            
            // 按权重分配Schedule
            if (totalWeight > 0) {
                let allocatedTotal = 0;
                scheduledMovies.forEach((m, index) => {
                    const weight = tierWeights[m.tier] || 1;
                    const allocation = Math.floor((weight / totalWeight) * 100);
                    m.schedule = allocation;
                    allocatedTotal += allocation;
                });
                
                // 确保Total为100%
                if (allocatedTotal < 100) {
                    const remaining = 100 - allocatedTotal;
                    // 按权重分配剩余的Schedule
                    scheduledMovies.forEach(m => {
                        const weight = tierWeights[m.tier] || 1;
                        const allocation = Math.floor((weight / totalWeight) * remaining);
                        if (allocation > 0) {
                            m.schedule += allocation;
                        }
                    });
                    
                    // 再次Check，确保Total为100%
                    const finalTotal = scheduledMovies.reduce((sum, m) => sum + m.schedule, 0);
                    if (finalTotal < 100) {
                        // 将剩余的分配给权重最高的Movie
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
        
        // DisplaySchedule移除Notification
        // 重新生成Movie库列表和Schedule列表
        generateMovieLibrary();
        generateScheduledMoviesList();
        
        // UpdateQuantityDisplay
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

// SaveScheduleSettings
function saveSchedule() {
    // 增加Schedule次数计数
    gameData.totalScheduleCount += 1;
    
    // Update图表
    import('./modules/chartManager.js').then(({ updateChart }) => {
        updateChart();
    });
    
    // DisplaySaveSuccessNotification
    showNotification('ScheduleSettings：已SaveScheduleConfiguration');
    
    // OFF弹窗
    closeScheduleModal();
}

// 生成Movie库列表
function generateMovieLibrary() {
    const movieLibraryList = document.getElementById('movie-library-list');
    if (!movieLibraryList) return;
    
    // 生成Movie库列表
    movieLibraryList.innerHTML = '';
    
    // 添加影片Quantity统计
    const countElement = document.createElement('div');
    countElement.className = 'movie-count';
    countElement.textContent = `Total ${gameData.movies.length} movie(s)`;
    movieLibraryList.appendChild(countElement);
    
    if (gameData.movies.length === 0) {
        movieLibraryList.innerHTML = '<p style="text-align: center; color: #666;">Movie Library is empty</p>';
        return;
    }
    
    // 按Release天数排序（最新的在上）
    const sortedMovies = [...gameData.movies].sort((a, b) => {
        // 优先DisplayNew（Release天数少的）
        return a.daysReleased - b.daysReleased;
    });
    
    sortedMovies.forEach(movie => {
        // 只Display未Schedule的Movie
        if (!movie.inSchedule) {
            // 获取Tier文本
            const tierText = movie.tier === 1 ? '1档' : movie.tier === 2 ? '2档' : '3档';
            // Check是否为New（Release天数<=3）
            const isNew = movie.daysReleased <= 3;
            const newTag = isNew ? ' (New)' : '';
            
            const movieItem = document.createElement('div');
               movieItem.className = 'movie-item';
               movieItem.innerHTML = `
                   <div class="movie-info">
                       <div class="movie-info-header">
                           <button class="add-to-schedule-btn" onclick="addToSchedule(${movie.id})"></button>
                           <h3>${movie.name}${newTag}</h3>
                       </div>
                       <p>${movie.type}, ${tierText}, Day ${movie.daysReleased}</p>
                   </div>
               `;
            movieLibraryList.appendChild(movieItem);
        }
    });
}

// 生成已ScheduleMovie列表
function generateScheduledMoviesList() {
    const modalMovieList = document.getElementById('modal-movie-list');
    if (!modalMovieList) return;
    
    // 清空列表
    modalMovieList.innerHTML = '';
    
    // 获取已ScheduleMovie
    const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
    
    // Calculate总Halls
    let totalHalls = 3; // Main Store3个厅
    if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            const shopDataInfo = shopData[shop.level];
            if (shopDataInfo) {
                totalHalls += shopDataInfo.halls;
            }
        });
    }
    
    // 获取Current班制
    const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    
    // CalculateScheduleQuantity：Halls * 4 * 班制数
    const scheduleCapacity = totalHalls * 4 * workSchedule;
    
    // Calculate每厅片量
    const moviesPerHall = Math.ceil(scheduledMovies.length / totalHalls);
    
    // 添加每厅片量信息
    const hallInfoElement = document.createElement('div');
    hallInfoElement.style.cssText = 'margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 4px;';
    hallInfoElement.innerHTML = `<strong>Total Halls: ${totalHalls} | Schedule Capacity: ${scheduleCapacity}</strong>`;
    modalMovieList.appendChild(hallInfoElement);
    
    // 生成已ScheduleMovie列表
    scheduledMovies.forEach(movie => {
        // 获取Tier文本
        const tierText = movie.tier === 1 ? '1档' : movie.tier === 2 ? '2档' : '3档';
        // Check是否为New（Release天数<=3）
        const isNew = movie.daysReleased <= 3;
        const newTag = isNew ? ' (New)' : '';
        
        const movieItem = document.createElement('div');
        movieItem.className = 'movie-item';
        movieItem.innerHTML = `
            <div class="movie-info">
                <div class="movie-info-header">
                    <button class="remove-from-schedule-btn" onclick="removeFromSchedule(${movie.id})"></button>
                    <h3>${movie.name}${newTag}</h3>
                </div>
                <p>${movie.type}, ${tierText}, ${movie.schedule}%, Day ${movie.daysReleased}</p>
            </div>
            <div class="movie-controls">
                <input type="range" min="0" max="100" value="${movie.schedule}" class="schedule-slider" data-movie-id="${movie.id}">
            </div>
        `;
        modalMovieList.appendChild(movieItem);
    });
    
    // 绑定Schedule滑块事items
    const sliders = modalMovieList.querySelectorAll('.schedule-slider');
    sliders.forEach((slider) => {
        slider.addEventListener('input', function() {
            const movieId = parseInt(this.getAttribute('data-movie-id'));
            const currentValue = parseInt(this.value);
            const movieItem = this.closest('.movie-item');
            const scheduleText = movieItem.querySelector('.movie-info p:last-child');
            
            // 获取CurrentMovie
            const currentMovie = gameData.movies.find(movie => movie.id === movieId);
            if (!currentMovie) return;
            
            if (scheduleText) {
                // 获取Movie信息
                const movieType = currentMovie.type;
                const tierText = currentMovie.tier === 1 ? '1档' : currentMovie.tier === 2 ? '2档' : '3档';
                // UpdateMovie信息文本
                scheduleText.textContent = `${movieType}, ${tierText}，${currentValue}%`;
            }
            
            // 获取CurrentMovie的Tier
            const currentTier = currentMovie.tier;
            
            // 重新获取已ScheduleMovie
            const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
            
            // Calculate剩余可分配的Schedule
            const remaining = Math.max(0, 100 - currentValue);
            
            // 按档分组Movie
            const otherMovies = scheduledMovies.filter(movie => movie.id !== movieId);
            const tierGroups = {};
            
            // 按Tier分组
            otherMovies.forEach(movie => {
                if (!tierGroups[movie.tier]) {
                    tierGroups[movie.tier] = [];
                }
                tierGroups[movie.tier].push(movie);
            });
            
            // 定义Tier权重
            const tierWeights = {
                1: 3, // 1档权重最高
                2: 2, // 2档权重中等
                3: 1  // 3档权重最低
            };
            
            // Calculate总权重
            let totalWeight = 0;
            Object.keys(tierGroups).forEach(tier => {
                const weight = tierWeights[tier] || 1;
                totalWeight += weight * tierGroups[tier].length;
            });
            
            // 按档分配剩余Schedule
            if (totalWeight > 0) {
                Object.keys(tierGroups).forEach(tier => {
                    const weight = tierWeights[tier] || 1;
                    const tierMovies = tierGroups[tier];
                    const tierWeight = weight * tierMovies.length;
                    const tierAllocation = Math.floor((tierWeight / totalWeight) * remaining);
                    
                    // 分配给该Tier的每部Movie
                    if (tierMovies.length > 0) {
                        const perMovieAllocation = Math.floor(tierAllocation / tierMovies.length);
                        const remainder = tierAllocation % tierMovies.length;
                        
                        tierMovies.forEach((movie, i) => {
                            let newValue = perMovieAllocation;
                            if (i < remainder) {
                                newValue += 1;
                            }
                            // UpdateMovie的Schedule值
                            movie.schedule = newValue;
                            // 找到对应的滑块并Update
                            const otherSlider = document.querySelector(`.schedule-slider[data-movie-id="${movie.id}"]`);
                            if (otherSlider) {
                                otherSlider.value = newValue;
                                // Update对应Movie的Schedule文本
                                const otherMovieItem = otherSlider.closest('.movie-item');
                                const otherScheduleText = otherMovieItem.querySelector('.movie-info p:last-child');
                                if (otherScheduleText) {
                                    // 获取Movie信息
                                    const movieType = movie.type;
                                    const tierText = movie.tier === 1 ? '1档' : movie.tier === 2 ? '2档' : '3档';
                                    // UpdateMovie信息文本
                                    otherScheduleText.textContent = `${movieType}, ${tierText}，${newValue}%`;
                                }
                            }
                        });
                    }
                });
            }
            
            // UpdateCurrentMovie的Schedule值
            currentMovie.schedule = currentValue;
        });
    });
}

// 添加Movie到Schedule
function addToSchedule(movieId) {
    const movie = gameData.movies.find(movie => movie.id === movieId);
    if (movie) {
        // UpdateMovie状态
        movie.inSchedule = true;
        
        // 重新CalculateAll已ScheduleMovie的Schedule比例，确保Total为100%
        const scheduledMovies = gameData.movies.filter(m => m.inSchedule);
        
        if (scheduledMovies.length === 1) {
            // 如果是唯一一部Movie，Settings为100%
            movie.schedule = 100;
        } else {
            // 多部Movie，按Level比例CalculateSchedule占比
            const tierWeights = {
                1: 3,  // 1档Movie权重最高
                2: 2,  // 2档Movie权重中等
                3: 1   // 3档Movie权重最低
            };
            
            // Calculate总权重
            let totalWeight = 0;
            scheduledMovies.forEach(m => {
                totalWeight += tierWeights[m.tier] || 1;
            });
            
            // 按权重分配Schedule
            if (totalWeight > 0) {
                let allocatedTotal = 0;
                scheduledMovies.forEach((m, index) => {
                    const weight = tierWeights[m.tier] || 1;
                    const allocation = Math.floor((weight / totalWeight) * 100);
                    m.schedule = allocation;
                    allocatedTotal += allocation;
                });
                
                // 确保Total为100%
                if (allocatedTotal < 100) {
                    const remaining = 100 - allocatedTotal;
                    // 按权重分配剩余的Schedule
                    scheduledMovies.forEach(m => {
                        const weight = tierWeights[m.tier] || 1;
                        const allocation = Math.floor((weight / totalWeight) * remaining);
                        if (allocation > 0) {
                            m.schedule += allocation;
                        }
                    });
                    
                    // 再次Check，确保Total为100%
                    const finalTotal = scheduledMovies.reduce((sum, m) => sum + m.schedule, 0);
                    if (finalTotal < 100) {
                        // 将剩余的分配给权重最高的Movie
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
        
        // Display添加SuccessNotification
        // 重新生成Movie库列表和Schedule列表
        generateMovieLibrary();
        generateScheduledMoviesList();
        
        // UpdateQuantityDisplay
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

// 招聘Staff
function recruitStaff() {
    // Open招聘Staff弹窗
    openRecruitModal();
}

// 合作洽谈相关变量
let currentCooperation = {
    type: '',
    name: '',
    basePrice: 0,
    currentTier: 0
};

// Open合作洽谈弹窗
function openCooperationModal(type, name, price) {
    // Pause游戏计时
    gameData.timePaused = true;
    
    // Pause沙漏动画
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
        // Generate inquiring party name
        let consultantName;
        if (name === 'Private Booking') {
            // Private Booking使用人物名称
            consultantName = generatePersonName();
        } else {
            // Other cooperation uses organization name
            consultantName = generateOrganizationName();
        }
        
        // Settings标题为 "xx inquiring about xx"
        titleElement.textContent = `${consultantName} inquiring about ${name}`;
        
        if (type === 'income') {
            descriptionElement.textContent = `Base revenue:¥${formatAssets(price)}`;
        } else {
            descriptionElement.textContent = `Base cost:¥${formatAssets(price)}`;
        }
        
        // Reset价格TierSelect
        const slider = document.getElementById('price-tier-slider');
        if (slider) {
            slider.value = 1.0;
        }
        
        // Reset价格信息
        document.getElementById('price-info').textContent = 'Quote amount:¥0';
        
        // 触发一次滑块事items，以Update初始Display
        selectPriceTier(1.0);
        
        // Display弹窗
        modal.classList.add('show');
    }
}

// OFF合作洽谈弹窗
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

// Select价格Tier
function selectPriceTier(tier) {
    // 将tier转换为数字Type
    const priceMultiplier = parseFloat(tier);
    currentCooperation.currentTier = priceMultiplier;
    
    // CalculateSuccess率：价格倍数越低，Success率越高
    // 使用线性关系：价格倍数每增加0.1，Success率降低10%
    // 基础价格（1.0）对应60%Success率
    let successRate = Math.round(60 - (priceMultiplier - 1.0) * 100);
    
    // 确保Success率在合理范围内
    successRate = Math.max(10, Math.min(95, successRate));
    
    const finalPrice = Math.floor(currentCooperation.basePrice * priceMultiplier);
    
    // UpdateDisplay
    if (currentCooperation.type === 'income') {
        document.getElementById('price-info').textContent = `Quote revenue:¥${formatAssets(finalPrice)}`;
    } else {
        document.getElementById('price-info').textContent = `Quote cost:¥${formatAssets(finalPrice)}`;
    }
}

// Confirm合作报价
function confirmCooperation() {
    if (currentCooperation.currentTier === 0) {
        showMessageModal('Quote Tier Required', 'Please select a quote tier');
        return;
    }
    
    // 获取价格倍数和CalculateSuccess率
    const priceMultiplier = currentCooperation.currentTier;
    
    // CalculateSuccess率：价格倍数越低，Success率越高
    // 使用线性关系：价格倍数每增加0.1，Success率降低10%
    // 基础价格（1.0）对应60%Success率
    let successRate = Math.round(60 - (priceMultiplier - 1.0) * 100);
    
    // 确保Success率在合理范围内
    successRate = Math.max(10, Math.min(95, successRate));
    
    const finalPrice = Math.floor(currentCooperation.basePrice * priceMultiplier);
    
    // Check资金是否足够（只对ExpenseType的合作进行Check）
    if (currentCooperation.type === 'expense' && gameData.money < finalPrice) {
        showMessageModal('Insufficient Funds', 'Insufficient funds to complete quote');
        return;
    }
    
    // 模拟Success率
    const random = Math.random() * 100;
    const isSuccess = random < successRate;
    
    // Process资金
    if (isSuccess) {
        if (currentCooperation.type === 'income') {
            // RevenueType的合作Success后增加资金
            gameData.money += finalPrice;
            
            // AllRevenueType的合作都添加到总Revenue
            gameData.totalRevenue += finalPrice;
            
            // 只有Month度持续合作才添加到Month度合作Revenue
            if (currentCooperation.type === 'income') {
                // AllRevenueType的合作都添加到活跃合作列表
                gameData.cooperation.activeCooperations.push({
                    name: currentCooperation.name,
                    income: finalPrice,
                    startDate: {...gameData.date}
                });
                // 根据合作TypeUpdate不同的合作Revenue
                if (currentCooperation.name === 'Pre-show Advertising' || currentCooperation.name === 'Hall Naming Rights') {
                    // Pre-show Advertising和Hall Naming Rights是长期合作Revenue
                    gameData.cooperation.monthlyIncome += finalPrice;
                } else {
                    // 其他合作（如包场）是单次合作Revenue
                    gameData.cooperation.oneTimeIncome += finalPrice;
                }
            }
        } else {
            // ExpenseType的合作Success后扣除资金
            gameData.money -= finalPrice;
        }
    } else {
        // 合作Failed不扣钱，但是机会消失
        // RevenueType和ExpenseType的合作Failed都不扣钱
    }
    
    // 移除合作机会（如果Exist）
    if (gameData.cooperationOpportunities[currentCooperation.name]) {
        delete gameData.cooperationOpportunities[currentCooperation.name];
    }
    
    // 只有在有分店的情况下才DisplayShop前缀
    let notificationMessage;
    if (isSuccess) {
        if (gameData.shops && gameData.shops.length > 0) {
            // 随机Select一个Shop（包括Main Store）
            const totalShops = gameData.shops.length + 1;
            const randomShopIndex = Math.floor(Math.random() * totalShops);
            let shopName;
            if (randomShopIndex === 0) {
                shopName = '1号店（Main Store）';
            } else {
                shopName = gameData.shops[randomShopIndex - 1].name;
            }
            if (currentCooperation.type === 'income') {
                notificationMessage = `${shopName}：Cooperation with ${currentCooperation.name} successful, revenue ¥${formatAssets(finalPrice)}`;
            } else {
                notificationMessage = `${shopName}：Cooperation with ${currentCooperation.name} successful, cost ¥${formatAssets(finalPrice)}`;
            }
        } else {
            if (currentCooperation.type === 'income') {
                notificationMessage = `Cooperation with ${currentCooperation.name} successful, revenue ¥${formatAssets(finalPrice)}`;
            } else {
                notificationMessage = `Cooperation with ${currentCooperation.name} successful, cost ¥${formatAssets(finalPrice)}`;
            }
        }
    } else {
        notificationMessage = 'Negotiation Failed';
    }
    
    // Display结果Notification
    showNotification(notificationMessage);
    
    // OFF弹窗
    closeCooperationModal();
    // 恢复游戏计时
    gameData.timePaused = false;
    
    // UpdateUI
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

// Initialize角标
function initBadges() {
    // 模拟NewRelease角标
    addBadge('schedule-tab-btn');
    
    // 模拟库存报警角标
    addBadge('sell-tab-btn');
    
    // Initialize合作相关角标
    updateCooperationBadges();
}

// Update合作相关角标
function updateCooperationBadges() {
    // Check是否有合作机会
    const hasCooperationOpportunities = Object.keys(gameData.cooperationOpportunities).length > 0;
    
    // 根据是否有合作机会Display或隐藏角标
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
window.recruitStaff = recruitStaff;
window.updateRecruitButtonStatus = updateRecruitButtonStatus;
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
window.startNewGame = startNewGame;
window.replaceXenonLamp = replaceXenonLamp;
window.replaceEquipment = replaceEquipment;
window.updateWorkSchedule = updateWorkSchedule;
window.setGameSpeedBySlider = setGameSpeedBySlider;
window.getSpeedIndex = getSpeedIndex;
window.updateSpeedDisplay = updateSpeedDisplay;
window.updateSpeedDisplayBySlider = updateSpeedDisplayBySlider;

// 页面Load完成后Initialize游戏
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    initBadges();
});


// Universal message modal functions
function showMessageModal(title, message) {
    const modal = document.getElementById('message-modal');
    const titleElement = document.getElementById('message-modal-title');
    const contentElement = document.getElementById('message-modal-content');
    
    if (modal && titleElement && contentElement) {
        titleElement.textContent = title;
        contentElement.textContent = message;
        modal.classList.add('show');
    }
}

function closeMessageModal() {
    const modal = document.getElementById('message-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Expose to global scope
window.showMessageModal = showMessageModal;
window.closeMessageModal = closeMessageModal;
