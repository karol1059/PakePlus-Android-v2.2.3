// 游戏逻辑模块

import { gameData, saveGameProgress, resetGameData, formatAssets } from './gameData.js';
import { generateMovieName, generateCinemaName, getRandomMovieType } from './nameGenerator.js';
import { updateChart } from './chartManager.js';
import { showPage, switchTab, switchRevenueTab, switchExpenseTab, initNotificationBar, checkScrollNeeded } from './uiManager.js';
import { shopData, getStaffLevelText, calculateRadiationPopulation, checkUpgradeConstruction } from './expandManager.js';

// 打开弹窗时调用，增加弹窗计数器并暂停游戏
function openModal() {
    gameData.modalCount++;
    gameData.timePaused = true;
    
    // 暂停沙漏动画
    const hourglass = document.querySelector('.hourglass');
    if (hourglass) {
        hourglass.classList.add('paused');
    }
}

// 关闭弹窗时调用，减少弹窗计数器并检查是否所有弹窗都已关闭
function closeModal() {
    gameData.modalCount = Math.max(0, gameData.modalCount - 1);
    
    // 只有当所有弹窗都关闭时，才恢复游戏
    if (gameData.modalCount === 0) {
        gameData.timePaused = false;
        
        // 恢复沙漏动画
        const hourglass = document.querySelector('.hourglass');
        if (hourglass) {
            hourglass.classList.remove('paused');
        }
    }
}

// Days of the week
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Month names
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// 节日数据（公历节日）
const holidays = {
    '1-1': '元旦',
    '2-14': '情人节',
    '5-1': '劳动节',
    '6-1': '儿童节',
    '10-1': '国庆节',
    '12-24': '平安夜',
    '12-25': '圣诞节'
};

// Promotion methods data
const promotionData = {
    flyer: {
        name: 'Flyer Distribution',
        cost: 1000,
        minPopularity: 90,
        maxPopularity: 110
    },
    newspaper: {
        name: 'Newspaper Ad',
        cost: 10000,
        minPopularity: 1800,
        maxPopularity: 2200
    },
    online: {
        name: 'Digital Marketing',
        cost: 100000,
        minPopularity: 36000,
        maxPopularity: 44000
    },
    tv: {
        name: 'TV Commercial',
        cost: 1000000,
        minPopularity: 720000,
        maxPopularity: 880000
    },
    megaStar: {
        name: 'Mega Star Endorsement',
        cost: 10000000,
        minPopularity: 14400000,
        maxPopularity: 17600000
    },
    tournament: {
        name: 'Tournament Sponsorship',
        cost: 100000000,
        minPopularity: 288000000,
        maxPopularity: 352000000
    }
};

// 检查今天是否是节日
function isTodayHoliday() {
    const dateKey = `${gameData.date.month}-${gameData.date.day}`;
    return holidays.hasOwnProperty(dateKey);
}


// 检查是否是手机端
function isMobileDevice() {
    return window.innerWidth <= 767;
}

// 执行宣传
function doPromotion(promotionType) {
    const promotion = promotionData[promotionType];
    if (!promotion) return;
    
    // 检查资金是否足够
    if (gameData.money < promotion.cost) {
        alert('资金不足，无法进行宣传！');
        return;
    }
    
    // 检查今天是否是新的一天，如果是，重置今日宣传次数
    const todayKey = `${gameData.date.year}-${gameData.date.month}-${gameData.date.day}`;
    const lastPromotionKey = `${gameData.promotions.lastPromotionDate.year}-${gameData.promotions.lastPromotionDate.month}-${gameData.promotions.lastPromotionDate.day}`;
    if (todayKey !== lastPromotionKey) {
        gameData.promotions.todayPromotionCount = 0;
        gameData.promotions.lastPromotionDate = {
            year: gameData.date.year,
            month: gameData.date.month,
            day: gameData.date.day
        };
    }
    
    // 检查是否是新的月份，如果是，重置月度宣传次数
    const currentMonthKey = `${gameData.date.year}-${gameData.date.month}`;
    const lastMonthKey = `${gameData.promotions.lastPromotionMonth.year}-${gameData.promotions.lastPromotionMonth.month}`;
    if (currentMonthKey !== lastMonthKey) {
        gameData.promotions.monthlyPromotionCount = 0;
        gameData.promotions.monthlyPromotionExtra = 0;
        gameData.promotions.lastPromotionMonth = {
            year: gameData.date.year,
            month: gameData.date.month
        };
    }
    
    // 基础宣传次数为1
    const baseCount = 1;
    
    // 计算总可用次数
    const totalAvailable = baseCount + gameData.promotions.monthlyPromotionExtra;
    
    // 检查是否还有宣传次数
    if (gameData.promotions.monthlyPromotionCount < totalAvailable) {
        // 还有次数可用，直接宣传
        executePromotion(promotionType, promotion);
    } else {
        // 没有次数了，显示广告弹窗
        if (isMobileDevice()) {
            openAdModal(promotionType, promotion);
        } else {
            alert('本月宣传次数已用完！');
        }
    }
}

// 打开广告弹窗
function openAdModal(promotionType, promotion) {
    // 保存当前宣传类型和宣传对象
    window.currentPromotionType = promotionType;
    window.currentPromotion = promotion;
    
    // 打开弹窗
    openModal();
    
    // 显示广告弹窗
    const adModal = document.getElementById('ad-modal');
    if (adModal) {
        adModal.classList.add('show');
    }
}

// 关闭广告弹窗
function closeAdModal(watchAd) {
    // 关闭弹窗
    const adModal = document.getElementById('ad-modal');
    if (adModal) {
        adModal.classList.remove('show');
    }
    
    // 减少弹窗计数器
    closeModal();
    
    // 如果用户选择观看广告
    if (watchAd) {
        // Simulate ad playback
        setTimeout(() => {
            // Ad watched successfully, add extra promotion count
            gameData.promotions.monthlyPromotionExtra += 5;
            
            // Update UI
            updatePromotionDisplay();
            
            // 如果有当前宣传类型，执行宣传
            if (window.currentPromotionType && window.currentPromotion) {
                executePromotion(window.currentPromotionType, window.currentPromotion);
            }
        }, 2000);
    }
}

// 将 closeAdModal 暴露到全局作用域
window.closeAdModal = closeAdModal;

// Execute promotion logic
function executePromotion(promotionType, promotion) {
    // Deduct cost
    gameData.money -= promotion.cost;

    // Randomly increase popularity
    const popularityGain = Math.floor(promotion.minPopularity + Math.random() * (promotion.maxPopularity - promotion.minPopularity + 1));
    gameData.popularity += popularityGain;

    // Update promotion records (removed count tracking)
    gameData.promotions.totalPromotionCost += promotion.cost;
    gameData.monthlyPromotionCost += promotion.cost;
    gameData.promotions.totalPopularityGained += popularityGain;
    
    // Update data calculation
    initializeDataCalculation();
    
    // Update UI
    updateUI();
    updatePromotionDisplay();
    
    // Show promotion effect
    showNotification(`Promotion Effect: ${promotion.name} successful, cost ${formatAssets(promotion.cost)}`);
}

// 观看广告增加宣传次数
function watchAdAndIncreasePromotionCount() {
    // 只有手机端显示广告弹窗
    if (isMobileDevice()) {
        // 保存当前宣传类型为null，因为这是主动观看广告
        window.currentPromotionType = null;
        window.currentPromotion = null;
        
        // 打开弹窗
        openModal();
        
        // 显示广告弹窗
        const adModal = document.getElementById('ad-modal');
        if (adModal) {
            adModal.classList.add('show');
        }
    } else {
        alert('广告功能仅限手机端！');
    }
}

// 更新宣传按钮状态
function updatePromotionButtonsStatus() {
    Object.keys(promotionData).forEach(type => {
        const button = document.getElementById(`promotion-${type}`);
        if (button) {
            const promotion = promotionData[type];
            if (gameData.money < promotion.cost) {
                button.disabled = true;
            } else {
                button.disabled = false;
            }
        }
    });
}

// 更新下一次维护日期
function updateNextMaintenanceDate() {
    // 基于当前维护日期计算下一次维护日期
    const date = {...gameData.maintenance.nextMaintenanceDate};
    
    switch (gameData.maintenance.cycle) {
        case 'weekly':
            date.day += 7;
            break;
        case 'monthly':
            date.month += 1;
            break;
        case 'quarterly':
            date.month += 3;
            break;
        case 'yearly':
            date.year += 1;
            break;
        default:
            // 默认月维护
            date.month += 1;
            break;
    }
    
    // 处理日期进位
    if (date.day > 30) {
        date.day = 1;
        date.month += 1;
    }
    if (date.month > 12) {
        date.month = 1;
        date.year += 1;
    }
    
    gameData.maintenance.lastMaintenanceDate = {...gameData.maintenance.nextMaintenanceDate};
    gameData.maintenance.nextMaintenanceDate = date;
}

// 检查设备故障
function checkEquipment故障() {
    // 如果当前已有故障，不检查新故障
    if (gameData.equipment.current故障) {
        return;
    }
    
    // 随机检查故障
    if (Math.random() < gameData.equipment.故障率) {
        // 增加故障率
        gameData.equipment.故障率 *= 1.2;
        gameData.equipment.故障率 = Math.min(0.3, gameData.equipment.故障率);
        
        // 随机选择故障类型
    const 故障Types = [
        { type: '卡顿', 口碑损失: 5, 票房损失人次: 20 },
        { type: '花屏', 口碑损失: 8, 票房损失人次: 50 },
        { type: '无声', 口碑损失: 10, 票房损失人次: 100 },
        { type: '无法放映', 口碑损失: 10, 票房损失人次: 200 }
    ];
    const 故障 = 故障Types[Math.floor(Math.random() * 故障Types.length)];
    
    // 计算票房损失金额（按平均票价30元计算）
    const 票房损失金额 = 故障.票房损失人次 * 30;
    
    // 应用故障影响
    gameData.reputation = Math.max(0, gameData.reputation - 故障.口碑损失);
    gameData.todayBoxOffice = Math.max(0, gameData.todayBoxOffice - 票房损失金额);
    gameData.todayRevenue = Math.max(0, gameData.todayRevenue - 票房损失金额);
    
    // 记录故障
    const 故障记录 = {
        type: 故障.type,
        口碑损失: 故障.口碑损失,
        票房损失人次: 故障.票房损失人次,
        票房损失金额: 票房损失金额
    };
    gameData.equipment.current故障 = 故障记录;
    gameData.equipment.last故障Date = {...gameData.date};
    gameData.equipment.故障History.push({
        date: {...gameData.date},
        type: 故障记录.type,
        口碑损失: 故障记录.口碑损失,
        票房损失人次: 故障记录.票房损失人次,
        票房损失金额: 故障记录.票房损失金额
    });
    
    // 显示故障通知
    const notificationContent = document.getElementById('notification-content');
    if (notificationContent) {
        notificationContent.innerHTML = `<span>设备故障：${故障记录.type}，口碑- ${故障记录.口碑损失}，票房损失¥${formatAssets(票房损失金额)}</span>`;
        checkScrollNeeded();
        
        setTimeout(() => {
            notificationContent.innerHTML = '';
            checkScrollNeeded();
        }, 3000);
    }
    }
}

// Update maintenance cycle by slider
function updateMaintenanceCycle(cycle) {
    gameData.maintenance.cycle = cycle;
    
    // 基于当前游戏日期重新计算下一次维护日期
    gameData.maintenance.nextMaintenanceDate = {...gameData.date};
    updateNextMaintenanceDate();
    
    // Show notification
    const cycleText = {
        weekly: '周',
        monthly: '月',
        quarterly: '季',
        yearly: '年'
    }[cycle];
    showNotification(`Maintenance cycle updated to ${cycleText}`);
    
    updateEquipmentDisplay();
}

// 通过滑块更新维护频率
function updateMaintenanceBySlider(value) {
    const cycleMap = {
        '1': 'weekly',
        '2': 'monthly',
        '3': 'quarterly',
        '4': 'yearly'
    };
    const cycle = cycleMap[value];
    updateMaintenanceCycle(cycle);
}

// Update air conditioner status
function updateAirConditionerStatus(status) {
    const statusNum = parseInt(status);
    gameData.airConditioner.status = statusNum;
    
    // Update complaint rate
    updateComplaintRate();
    
    // Show notification
    const statusText = {
        0: 'Off',
        1: 'Half On',
        2: 'Full On'
    }[statusNum];
    
    // Calculate total shops
    const totalShops = (gameData.shops ? gameData.shops.length : 0) + 1; // Add 1 for main store
    
    // Calculate electricity cost change
    const baseElectricity = gameData.expenses.monthlyUtilities * totalShops;
    const airConditionerElectricityRate = gameData.airConditioner.electricityRates[statusNum];
    const additionalElectricity = Math.floor(baseElectricity * airConditionerElectricityRate);
    const totalElectricity = baseElectricity + additionalElectricity;
    
    showNotification(`Air conditioner status updated to ${statusText}, monthly electricity: ¥${formatAssets(totalElectricity)}`);
    
    updateEquipmentDisplay();
}

// Update complaint rate
function updateComplaintRate() {
    const complaintRates = {
        0: 0.2,   // 不开：20%客诉率
        1: 0.05,  // 半开：5%客诉率
        2: 0.01   // 全开：1%客诉率
    };
    gameData.airConditioner.complaintRate = complaintRates[gameData.airConditioner.status];
}

// 检查客诉
// 检查当前月份是否是空调使用月份（6-8月和12-2月）
function isAirConditionerMonth() {
    const month = gameData.date.month;
    return (month >= 6 && month <= 8) || (month === 12 || month === 1 || month === 2);
}

function checkComplaints() {
    // 只在空调使用月份检查故障
    if (!isAirConditionerMonth()) {
        return;
    }
    
    // 检查今天是否是新的一天
    const todayKey = `${gameData.date.year}-${gameData.date.month}-${gameData.date.day}`;
    const lastComplaintKey = gameData.airConditioner.lastComplaintDate ? 
        `${gameData.airConditioner.lastComplaintDate.year}-${gameData.airConditioner.lastComplaintDate.month}-${gameData.airConditioner.lastComplaintDate.day}` : '';
    
    if (todayKey !== lastComplaintKey) {
        gameData.complaints.todayCount = 0;
        gameData.airConditioner.lastComplaintDate = {...gameData.date};
    }
    
    // 随机检查客诉
    if (Math.random() < gameData.airConditioner.complaintRate) {
        // 客诉影响
        const reputationLoss = Math.floor(5 + Math.random() * 6); // 5-10点
        const peopleLoss = Math.floor(50 + Math.random() * 51); // 50-100人次
        
        // 计算票房损失金额（按平均票价30元计算）
        const boxOfficeLoss = peopleLoss * 30;
        
        // 应用影响
        gameData.reputation = Math.max(0, gameData.reputation - reputationLoss);
        gameData.todayBoxOffice = Math.max(0, gameData.todayBoxOffice - boxOfficeLoss);
        gameData.todayRevenue = Math.max(0, gameData.todayRevenue - boxOfficeLoss);
        // 扣除资产损失
        gameData.money -= boxOfficeLoss;
        
        // 更新客诉记录
        gameData.complaints.todayCount++;
        gameData.complaints.totalCount++;
        gameData.complaints.totalReputationLoss += reputationLoss;
        gameData.complaints.totalBoxOfficeLoss += boxOfficeLoss;
        
        // 只有在有分店的情况下才显示店铺前缀
        let notificationMessage;
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
            notificationMessage = `${shopName}：客诉 - 空调问题，口碑- ${reputationLoss}，票房损失¥${formatAssets(boxOfficeLoss)}`;
        } else {
            notificationMessage = `客诉：空调问题，口碑- ${reputationLoss}，票房损失¥${formatAssets(boxOfficeLoss)}`;
        }
        
        // 显示客诉通知
        showNotification(notificationMessage);
    }
}

// Update promotion display (removed count tracking)
function updatePromotionDisplay() {
    const totalCostElement = document.getElementById('total-promotion-cost');
    if (totalCostElement) {
        totalCostElement.textContent = formatAssets(gameData.promotions.totalPromotionCost);
    }
    
    const totalPopularityElement = document.getElementById('total-popularity-gained');
    if (totalPopularityElement) {
        totalPopularityElement.textContent = gameData.promotions.totalPopularityGained;
    }
    
    // Update button status
    updatePromotionButtonsStatus();
}

// 更新设备页面显示
function updateEquipmentDisplay() {
    // 计算店铺数量（包括总店）
    const totalShops = gameData.shopCount || 1;
    
    // 计算设备数量
    // 放映设备：根据厅数计算，每个厅1放映设备
    let totalHalls = 3; // 总店3个厅
    if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            const shopDataInfo = shopData[shop.level];
            if (shopDataInfo) {
                totalHalls += shopDataInfo.halls;
            }
        });
    }
    const projectorCount = totalHalls; // 每个厅1放映设备
    const airConditionerCount = totalHalls * 2; // 空调数量为厅数的2倍
    
    // 更新放映设备数量
    const projectorCountElement = document.getElementById('projector-count');
    if (projectorCountElement) {
        projectorCountElement.textContent = projectorCount;
    }
    
    // 更新空调设备数量
    const airConditionerCountElement = document.getElementById('air-conditioner-count');
    if (airConditionerCountElement) {
        airConditionerCountElement.textContent = airConditionerCount;
    }
    
    // 更新维护滑块
    const maintenanceSlider = document.getElementById('maintenance-slider');
    if (maintenanceSlider) {
        const cycleMap = {
            'weekly': '1',
            'monthly': '2',
            'quarterly': '3',
            'yearly': '4'
        };
        maintenanceSlider.value = cycleMap[gameData.maintenance.cycle] || '2';
    }
    
    // Update maintenance frequency display
    const maintenanceFrequencyElement = document.getElementById('maintenance-frequency');
    if (maintenanceFrequencyElement) {
        const cycleText = {
            weekly: 'Weekly',
            monthly: 'Monthly',
            quarterly: 'Quarterly',
            yearly: 'Yearly'
        };
        maintenanceFrequencyElement.textContent = cycleText[gameData.maintenance.cycle] || 'Monthly';
    }
    
    // 更新下次维护日期
    const nextMaintenanceElement = document.getElementById('next-maintenance');
    if (nextMaintenanceElement) {
        const date = gameData.maintenance.nextMaintenanceDate;
        nextMaintenanceElement.textContent = `${monthNames[date.month - 1]} ${date.day}, ${date.year}`;
    }
    
    // 更新故障率
    const failureRateElement = document.getElementById('failure-rate');
    if (failureRateElement) {
        failureRateElement.textContent = `${(gameData.equipment.故障率 * 100).toFixed(1)}%`;
    }
    
    // 更新设备价值
    const equipmentValueElement = document.getElementById('equipment-value');
    if (equipmentValueElement) {
        equipmentValueElement.textContent = formatAssets(gameData.equipment.currentValue);
    }
    
    // 更新折旧率
    const depreciationRateElement = document.getElementById('depreciation-rate');
    if (depreciationRateElement) {
        depreciationRateElement.textContent = `${(gameData.equipment.depreciationRate * 100).toFixed(0)}%`;
    }
    
    // 更新空调滑块
    const airConditionerSlider = document.getElementById('air-conditioner-slider');
    if (airConditionerSlider) {
        airConditionerSlider.value = gameData.airConditioner.status;
    }
    
    // Update air conditioner status display
    const airConditionerStatusElement = document.getElementById('air-conditioner-status');
    if (airConditionerStatusElement) {
        const statusText = {
            0: 'Off',
            1: 'Half On',
            2: 'Full On'
        };
        airConditionerStatusElement.textContent = statusText[gameData.airConditioner.status];
    }
    
    // Update complaint rate显示
    const complaintRateElement = document.getElementById('complaint-rate');
    if (complaintRateElement) {
        complaintRateElement.textContent = `${(gameData.airConditioner.complaintRate * 100).toFixed(1)}%`;
    }
    
    // 更新电费显示
    const baseElectricityElement = document.getElementById('base-electricity');
    const additionalElectricityElement = document.getElementById('additional-electricity');
    const totalElectricityElement = document.getElementById('total-electricity');
    if (baseElectricityElement && additionalElectricityElement && totalElectricityElement) {
        // 获取当前班制
        const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
        
        // 计算基础电费，根据班制调整
        let baseElectricity = gameData.expenses.monthlyUtilities * totalShops; // 按店铺数量计算基础电费
        
        // 计算Venue Equipment电费并计入基础电费
        const equipmentTypes = [
            { name: 'Game Console', electricity: 100 },
            { name: 'Claw Machine', electricity: 50 },
            { name: 'KTV', electricity: 100 }
        ];
        
        equipmentTypes.forEach(type => {
            if (gameData.equipment && gameData.equipment[type.name]) {
                baseElectricity += gameData.equipment[type.name] * type.electricity;
            }
        });
        
        if (workSchedule === 2) {
            baseElectricity = Math.floor(baseElectricity * 1.5);
        } else if (workSchedule === 3) {
            baseElectricity = Math.floor(baseElectricity * 2);
        }
        
        // 只在空调使用月份计算额外的空调电费
        let additionalElectricity = 0;
        if (isAirConditionerMonth()) {
            const airConditionerElectricityRate = gameData.airConditioner.electricityRates[gameData.airConditioner.status];
            additionalElectricity = Math.floor(baseElectricity * airConditionerElectricityRate);
        }
        
        const totalElectricity = baseElectricity + additionalElectricity;
        
        baseElectricityElement.textContent = formatAssets(baseElectricity);
        additionalElectricityElement.textContent = formatAssets(additionalElectricity);
        totalElectricityElement.textContent = formatAssets(totalElectricity);
    }
    
    // 更新氙灯显示
    const xenonLampCountElement = document.getElementById('xenon-lamp-count');
    const movieHoursElement = document.getElementById('movie-hours');
    const xenonLampHoursElement = document.getElementById('xenon-lamp-hours');
    if (xenonLampCountElement && movieHoursElement && xenonLampHoursElement) {
        // 氙灯数量：每厅一个
        const xenonLampCount = totalHalls;
        
        // 每部影片2小时
        const movieHours = 2;
        
        // 计算总运行时间（每部影片2小时）
        let scheduledMoviesCount = 0;
        if (gameData.movies) {
            scheduledMoviesCount = gameData.movies.filter(movie => movie.inSchedule).length;
        }
        const xenonLampHours = scheduledMoviesCount * movieHours;
        
        xenonLampCountElement.textContent = xenonLampCount;
        movieHoursElement.textContent = movieHours;
        xenonLampHoursElement.textContent = xenonLampHours;
    }
}

// 显示氙灯明细
function showXenonLampDetail() {
    // Open modal, increase counter and pause game
    openModal();
    
    // Create equipment details modal
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
    
    // Create modal content
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
    title.textContent = 'Xenon Lamp Details';
    title.style.marginTop = '0';
    modalContent.appendChild(title);
    
    // 计算总厅数
    let totalHalls = 3; // 总店3个厅
    if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            const shopDataInfo = shopData[shop.level];
            if (shopDataInfo) {
                totalHalls += shopDataInfo.halls;
            }
        });
    }
    
    // 计算每部影片运行时间
    const movieHours = 2;
    
    // 计算总运行时间
    let scheduledMoviesCount = 0;
    if (gameData.movies) {
        scheduledMoviesCount = gameData.movies.filter(movie => movie.inSchedule).length;
    }
    
    // 计算总运行时间
    const totalHours = scheduledMoviesCount * movieHours;
    
    // 按100小时区间计算氙灯数量
    const batchSize = 100;
    const maxBatch = Math.ceil(totalHours / batchSize);
    
    // 生成氙灯明细（按100小时区间）
    const xenonLampData = [];
    for (let i = 0; i < maxBatch; i++) {
        const startHours = i * batchSize;
        const endHours = (i + 1) * batchSize;
        const count = Math.min(batchSize, totalHours - startHours);
        xenonLampData.push({ startHours, endHours, count });
    }
    
    // 按区间显示氙灯
    xenonLampData.forEach(item => {
        const xenonLampItem = document.createElement('div');
        
        xenonLampItem.style.cssText = `
            padding: 10px;
            margin: 5px 0;
            border-radius: 4px;
            background-color: #f5f5f5;
            border-left: 4px solid #4caf50;
        `;
        
        xenonLampItem.innerHTML = `
            <strong>${item.startHours}-${item.endHours}小时</strong>
            <br>
${item.count}个
        `;
        
        modalContent.appendChild(xenonLampItem);
    });
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
        margin-top: 20px;
        padding: 8px 16px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    closeButton.onclick = () => {
        document.body.removeChild(modal);
        // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
        closeModal();
    };
    modalContent.appendChild(closeButton);
    
    // 添加到弹窗
    modal.appendChild(modalContent);
    
    // 添加到页面
    document.body.appendChild(modal);
}

// 更换氙灯
function replaceXenonLamp(batch, cost) {
    if (gameData.money < cost) {
        alert('资金不足，无法更换氙灯');
        return;
    }
    
    // 扣除资金
    gameData.money -= cost;
    
    // 更新氙灯状态（这里简化处理，实际应该更新具体氙灯的运行时间）
    
    // 显示成功消息
    // Xenon lamp replacement completed
    
    // 重新显示氙灯明细
    showXenonLampDetail();
}

// 初始化数据计算
// 计算合作收入
function calculateCooperationIncome() {
    // 重置合作收入
    gameData.cooperation.monthlyIncome = 0;
    gameData.cooperation.activeCooperations = [];
    
    // 计算Venue Equipment的月收入
    if (gameData.equipment) {
        const equipmentTypes = [
            { name: 'Game Console', income: 500 },
            { name: 'Claw Machine', income: 300 },
            { name: 'KTV', income: 200 }
        ];
        
        equipmentTypes.forEach(type => {
            if (gameData.equipment[type.name]) {
                const equipmentCount = gameData.equipment[type.name];
                const monthlyIncome = equipmentCount * type.income;
                gameData.cooperation.monthlyIncome += monthlyIncome;
                gameData.cooperation.activeCooperations.push({
                    name: type.name,
                    income: monthlyIncome,
                    startDate: {...gameData.date}
                });
            }
        });
    }
}

// 清除单次合作收入（在月底调用）
function clearOneTimeCooperationIncome() {
    gameData.cooperation.oneTimeIncome = 0;
}

function initializeDataCalculation() {
    // 计算辐射人群：依据开店数据
    gameData.radiationPopulation = calculateRadiationPopulation();
    
    // 计算粉丝数量：辐射人群 × log₂(知名度) / 1000
    const safePopularity = Math.max(gameData.popularity, 1);
    const logPopularity = Math.log2(safePopularity);
    gameData.fanCount = Math.floor(gameData.radiationPopulation * logPopularity / 1000);
    
    // 计算观影人数：粉丝数量 × 1%，确保至少有1人
    gameData.movieViewers = Math.max(1, Math.floor(gameData.fanCount * 0.01));
    
    // 计算到店人数
    let multiplierMin, multiplierMax;
    if (isTodayHoliday()) {
        multiplierMin = 10.0;
        multiplierMax = 20.0;
    } else {
        switch (gameData.weekDay) {
            case 0: multiplierMin = 3.0; multiplierMax = 5.0; break;
            case 1: multiplierMin = 0.9; multiplierMax = 1.1; break;
            case 2: multiplierMin = 0.8; multiplierMax = 1.0; break;
            case 3: multiplierMin = 0.7; multiplierMax = 0.9; break;
            case 4: multiplierMin = 0.75; multiplierMax = 0.95; break;
            case 5: multiplierMin = 2.0; multiplierMax = 4.0; break;
            case 6: multiplierMin = 5.0; multiplierMax = 8.0; break;
        }
    }
    const multiplier = multiplierMin + Math.random() * (multiplierMax - multiplierMin);
    gameData.arrivalCount = Math.floor(gameData.movieViewers * multiplier);
    
    // 计算合作收入
    calculateCooperationIncome();
}

// Show monthly financial report modal
function showMonthlyReportModal(monthlyRecord) {
    // Open modal, increase counter and pause game
    openModal();
    
    // Create modal
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
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        width: 80%;
        max-width: 800px;
        max-height: 80%;
        overflow-y: auto;
    `;
    
    // Modal title
    const title = document.createElement('h3');
    title.textContent = `Financial Report: ${monthNames[monthlyRecord.month - 1]}, Year ${monthlyRecord.year}`;
    title.style.marginTop = '0';
    modalContent.appendChild(title);
    
    // Financial report table
    const table = document.createElement('table');
    table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
    `;
    
    // Table content
    table.innerHTML = `
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount (¥)</th>
            </tr>
        </thead>
        <tbody>
            <tr style="background-color: #e3f2fd;">
                <td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Revenue</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Box Office Revenue</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.revenue.boxOffice)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Concessions Revenue</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.revenue.product)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Cooperation Revenue</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.revenue.cooperation)}</td>
            </tr>
            <tr style="font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px;">Total Revenue</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.revenue.total)}</td>
            </tr>
            <tr style="background-color: #ffebee;">
                <td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Expenses</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Utilities</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.utilities)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Salaries</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.salaries)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Box Office Sharing</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.revenueShare)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Purchase Expenses</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.purchase || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Maintenance Expenses</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.maintenance || 0)}</td>
            </tr>

            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Promotion Expenses</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.promotion || 0)}</td>
            </tr>
            <tr style="font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px;">Total Expenses</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.total)}</td>
            </tr>
            <tr style="background-color: #e8f5e8; font-weight: bold; font-size: 16px;">
                <td style="border: 1px solid #ddd; padding: 12px;">Net Monthly Profit</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right; color: ${monthlyRecord.profit >= 0 ? '#4caf50' : '#f44336'};">
                    ${monthlyRecord.profit >= 0 ? '+' : ''}${formatAssets(monthlyRecord.profit)}
                </td>
            </tr>
        </tbody>
    `;
    
    modalContent.appendChild(table);
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
        margin-top: 20px;
        padding: 10px 20px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    `;
    closeButton.onclick = () => {
        document.body.removeChild(modal);
        // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
        closeModal();
    };
    modalContent.appendChild(closeButton);
    
    // 添加到弹窗
    modal.appendChild(modalContent);
    
    // 添加到页面
    document.body.appendChild(modal);
}

// Show annual financial report modal
function showAnnualReportModal(annualRecord) {
    // Open modal, increase counter and pause game
    openModal();
    
    // Create modal
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
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        width: 80%;
        max-width: 800px;
        max-height: 80%;
        overflow-y: auto;
    `;
    
    // Modal title
    const title = document.createElement('h3');
    title.textContent = `Annual Report: Year ${annualRecord.year}`;
    title.style.marginTop = '0';
    modalContent.appendChild(title);
    
    // Financial report table
    const table = document.createElement('table');
    table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
    `;
    
    // Table content
    table.innerHTML = `
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount (¥)</th>
            </tr>
        </thead>
        <tbody>
            <tr style="background-color: #e3f2fd;">
                <td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Revenue</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Box Office Revenue</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.revenue.boxOffice || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Concessions Revenue</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.revenue.product || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Cooperation Revenue</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.revenue.cooperation || 0)}</td>
            </tr>
            <tr style="font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px;">Total Annual Revenue</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.revenue.total || 0)}</td>
            </tr>
            <tr style="background-color: #ffebee;">
                <td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Expenses</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Utilities</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.expense.utilities || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Salaries</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.expense.salaries || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Box Office Sharing</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.expense.revenueShare || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Promotion Expenses</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.expense.promotion || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Maintenance Expenses</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.expense.maintenance || 0)}</td>
            </tr>

            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">年度租金</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.expense.rent || 0)}</td>
            </tr>
            <tr style="font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px;">年度总支出</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.expense.total || 0)}</td>
            </tr>
            <tr style="background-color: #e8f5e8; font-weight: bold; font-size: 16px;">
                <td style="border: 1px solid #ddd; padding: 12px;">Net Annual Profit</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right; color: ${annualRecord.profit >= 0 ? '#4caf50' : '#f44336'};">
                    ${annualRecord.profit >= 0 ? '+' : ''}${formatAssets(annualRecord.profit)}
                </td>
            </tr>
        </tbody>
    `;
    
    modalContent.appendChild(table);
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
        margin-top: 20px;
        padding: 10px 20px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    `;
    closeButton.onclick = () => {
        document.body.removeChild(modal);
        // 关闭弹窗，减少计数器并检查是否所有弹窗都已关闭
        closeModal();
    };
    modalContent.appendChild(closeButton);
    
    // 添加到弹窗
    modal.appendChild(modalContent);
    
    // 添加到页面
    document.body.appendChild(modal);
}

// 模拟游戏时间流逝
function simulateDay() {
    // 先检查是否暂停
    if (gameData.timePaused) {
        // 即使暂停，也要更新UI以显示最新日期
        updateUI();
        return;
    }
    
    // 更新游戏内日期
    gameData.date.day += 1;
    
    // 更新星期
    gameData.weekDay = (gameData.weekDay + 1) % 7;
    
    let monthChanged = false;
    
    // 定义每个月的天数（大小月）
    const daysInMonth = {
        1: 31,  // 1月
        2: 28,  // 2月
        3: 31,  // 3月
        4: 30,  // 4月
        5: 31,  // 5月
        6: 30,  // 6月
        7: 31,  // 7月
        8: 31,  // 8月
        9: 30,  // 9月
        10: 31, // 10月
        11: 30, // 11月
        12: 31  // 12月
    };
    
    // 检查日期是否超过当月天数
    if (gameData.date.day > daysInMonth[gameData.date.month]) {
        gameData.date.day = 1;
        gameData.date.month += 1;
        monthChanged = true;
        if (gameData.date.month > 12) {
            gameData.date.month = 1;
            gameData.date.year += 1;
        }
    }
    
    // 检查是否有升级建设完成
    if (monthChanged) {
        checkUpgradeConstruction();
        
        // 重置宣传次数
        gameData.promotions.monthlyPromotionCount = 0;
        gameData.promotions.monthlyPromotionExtra = 0;
        gameData.promotions.lastPromotionMonth = {
            year: gameData.date.year,
            month: gameData.date.month
        };
    }
    
    // 计算今日支出
    let totalExpense = 0;
    
    // 检查维护周期
    const todayKey = `${gameData.date.year}-${gameData.date.month}-${gameData.date.day}`;
    const nextMaintenanceKey = `${gameData.maintenance.nextMaintenanceDate.year}-${gameData.maintenance.nextMaintenanceDate.month}-${gameData.maintenance.nextMaintenanceDate.day}`;
    
    // 确保设备价值不为0且不低于最低值
    if (gameData.equipment.currentValue < 10000) {
        gameData.equipment.currentValue = 10000; // 重置设备价值为最低值
    }
    
    if (todayKey === nextMaintenanceKey) {
        // 执行维护
        const maintenanceRate = gameData.equipment.maintenanceRates[gameData.maintenance.cycle] || 0.015; // 默认月维护率
        const maintenanceCost = Math.floor(gameData.equipment.currentValue * maintenanceRate);
        totalExpense += maintenanceCost;
        
        // 累加到月度维护支出
        gameData.monthlyMaintenanceExpense += maintenanceCost;
        
        // 更新维护日期
        updateNextMaintenanceDate();
        
        // 降低故障率
        gameData.equipment.故障率 *= 0.8;
        gameData.equipment.故障率 = Math.max(0.01, gameData.equipment.故障率);
        
        // 显示维护通知
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            const cycleText = {
                weekly: '周',
                monthly: '月',
                quarterly: '季',
                yearly: '年'
            }[gameData.maintenance.cycle];
            notificationContent.innerHTML = `<span>Equipment Maintenance: Completed ${cycleText} maintenance, cost ¥${formatAssets(maintenanceCost)}, failure rate reduced</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    }
    
    // 检查是否需要折旧（每年1月1日）
    if (gameData.date.month === 1 && gameData.date.day === 1) {
        const depreciationAmount = Math.floor(gameData.equipment.currentValue * gameData.equipment.depreciationRate);
        gameData.equipment.currentValue = Math.max(0, gameData.equipment.currentValue - depreciationAmount);
        
        // 显示折旧通知
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>Equipment Depreciation: Depreciated ¥${formatAssets(depreciationAmount)}, current equipment value ¥${formatAssets(gameData.equipment.currentValue)}</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
        
        // 扣除年度租金
        totalExpense += gameData.expenses.annualRent;
    }
    
    // 月底处理（每月1号）
        if (gameData.date.day === 1) {
            gameData.expenseCounters.months += 1;
            // Calculate total shops
            let totalShops = 1; // 加1包含总店
            if (gameData.shopRanges) {
                totalShops += gameData.shopRanges.reduce((sum, range) => sum + range.count, 0);
            } else if (gameData.shops) {
                totalShops += gameData.shops.length;
            }
            // 只在空调使用月份计算额外的空调电费
            let totalUtilities = gameData.expenses.monthlyUtilities * totalShops;
            if (isAirConditionerMonth()) {
                // 根据空调状态计算额外电费
                const airConditionerElectricityRate = gameData.airConditioner.electricityRates[gameData.airConditioner.status];
                const additionalElectricity = gameData.expenses.monthlyUtilities * totalShops * airConditionerElectricityRate;
                totalUtilities = gameData.expenses.monthlyUtilities * totalShops + additionalElectricity;
            }
        
        // 计算店铺数量
        const shopCount = (gameData.shops ? gameData.shops.length : 0) + 1; // 加1包含总店
        const isCinemaChain = shopCount > 100;
        
        // 计算并扣除票房分账（月底扣除）
        const monthlyBoxOffice = gameData.weekBoxOffice; // Use weekly box office as approximation of monthly box office
        const filmStudioShare = Math.floor(monthlyBoxOffice * 0.40); // Distributor share 40% (changed from 39%)
        const cinemaChainShare = isCinemaChain ? 0 : Math.floor(monthlyBoxOffice * 0.05); // Cinema chain share 5% (removed if cinema chain established)
        const fundShare = Math.floor(monthlyBoxOffice * 0.05); // Tax 5% (changed from 8.3%)
        const totalRevenueShare = filmStudioShare + cinemaChainShare + fundShare;
        
        // 计算月度收入
        const monthlyRevenue = gameData.totalRevenue - (gameData.monthlyRecords.length > 0 ? gameData.monthlyRecords[gameData.monthlyRecords.length - 1].totalRevenue : 0);
        
        // 计算月度工资支出（考虑所有店铺）
        let totalSalaries = gameData.expenses.monthlySalaries;
        
        // 计算月度支出
        const monthlyExpense = totalUtilities + totalSalaries + totalRevenueShare + gameData.monthlyPurchaseExpense + gameData.monthlyMaintenanceExpense + gameData.monthlyPromotionCost;
        
        // 计算正确的月份（显示上个月的）
        let recordYear = gameData.date.year;
        let recordMonth = gameData.date.month - 1;
        if (recordMonth < 1) {
            recordMonth = 12;
            recordYear -= 1;
        }
        
        // 计算当月总合作收入（月度固定收入 + 单次收入）
        const totalCooperationIncome = gameData.cooperation.monthlyIncome + gameData.cooperation.oneTimeIncome;
        
        // 计算票房和卖品的总收入（减去合作收入）
        const boxOfficeAndProductRevenue = monthlyRevenue - totalCooperationIncome;
        
        // 计算卖品收入，确保不为负数
        let productRevenue = boxOfficeAndProductRevenue - monthlyBoxOffice;
        productRevenue = Math.max(0, productRevenue);
        
        // 确保票房收入不超过票房和卖品总收入
        const adjustedBoxOffice = Math.min(monthlyBoxOffice, boxOfficeAndProductRevenue);
        const adjustedProductRevenue = boxOfficeAndProductRevenue - adjustedBoxOffice;
        
        // 计算包含合作收入的总收入
        const totalRevenueWithCooperation = monthlyRevenue;
        
        // 计算月度净利润
        const monthlyProfit = totalRevenueWithCooperation - monthlyExpense;
        
        // 记录月度收支明细
        const monthlyRecord = {
            year: recordYear,
            month: recordMonth,
            revenue: {
                boxOffice: adjustedBoxOffice,
                product: adjustedProductRevenue,
                cooperation: totalCooperationIncome,
                total: totalRevenueWithCooperation
            },
            expense: {
                utilities: totalUtilities,
                salaries: totalSalaries,
                revenueShare: totalRevenueShare,
                purchase: gameData.monthlyPurchaseExpense,
                maintenance: gameData.monthlyMaintenanceExpense,
                promotion: gameData.monthlyPromotionCost,
                total: monthlyExpense
            },
            profit: monthlyProfit,
            totalRevenue: gameData.totalRevenue
        };
        
        // 添加到月度记录
        gameData.monthlyRecords.push(monthlyRecord);
        
        // 重置周票房
        gameData.weekBoxOffice = 0;
        
        // 显示月度收支明细弹窗
        showMonthlyReportModal(monthlyRecord);
        
        // 重置月度进货支出
        gameData.monthlyPurchaseExpense = 0;
        // 重置月度维护支出
        gameData.monthlyMaintenanceExpense = 0;

        // 重置月度宣传费用
        gameData.monthlyPromotionCost = 0;
        
        // 清除单次合作收入（在计算完月度报表后）
        clearOneTimeCooperationIncome();
    }
    
    // 年底处理（每年1月1号）
    if (gameData.date.day === 1 && gameData.date.month === 1) {
        gameData.expenseCounters.years += 1;
        
        // 计算年度收支
        const year = gameData.date.year - 1;
        const yearRecords = gameData.monthlyRecords.filter(record => record.year === year);
        
        let annualRevenue = {
            boxOffice: 0,
            product: 0,
            cooperation: 0,
            total: 0
        };
        let annualExpense = {
            utilities: 0,
            salaries: 0,
            revenueShare: 0,
            promotion: 0,
            maintenance: 0,
            total: 0
        };
        
        yearRecords.forEach(record => {
            annualRevenue.boxOffice += record.revenue.boxOffice || 0;
            annualRevenue.product += record.revenue.product || 0;
            annualRevenue.cooperation += record.revenue.cooperation || 0;
            annualRevenue.total += record.revenue.total || 0;
            
            annualExpense.utilities += record.expense.utilities || 0;
            annualExpense.salaries += record.expense.salaries || 0;
            annualExpense.revenueShare += record.expense.revenueShare || 0;
            annualExpense.maintenance += record.expense.maintenance || 0;
            annualExpense.promotion += record.expense.promotion || 0;
            annualExpense.total += record.expense.total || 0;
        });
        
        // 计算年度租金（考虑所有店铺）
        let totalAnnualRent = gameData.expenses.annualRent; // 总店的年度租金
        if (gameData.shopRanges) {
            gameData.shopRanges.forEach(range => {
                // 根据店铺等级计算租金
                totalAnnualRent += range.commonProps.rent * range.count;
            });
        } else if (gameData.shops && gameData.shops.length > 0) {
            gameData.shops.forEach(shop => {
                // 根据店铺等级计算租金
                const shopLevel = shop.level;
                if (shopData[shopLevel]) {
                    totalAnnualRent += shopData[shopLevel].rent;
                }
            });
        }
        
        // 添加年度租金
        annualExpense.total += totalAnnualRent;
        annualExpense.rent = totalAnnualRent;
        
        const annualProfit = annualRevenue.total - annualExpense.total;
        
        // 记录年度收支
        const annualRecord = {
            year: year,
            revenue: annualRevenue,
            expense: annualExpense,
            profit: annualProfit
        };
        
        gameData.annualRecords.push(annualRecord);
        
        // Show annual financial report modal
        showAnnualReportModal(annualRecord);
        
        // 显示年度支出通知
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>Annual Expenses: Rent deducted ¥${formatAssets(totalAnnualRent)}</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
        
        // 第二年起禁用宣传提示
        if (gameData.date.year > 1) {
            gameData.promotionReminderEnabled = false;
        }
    }
    

    
    // 计算辐射人群：依据开店数据
    gameData.radiationPopulation = calculateRadiationPopulation();
    
    // 计算粉丝数量：辐射人群 × log₂(知名度) / 1000
    // 注意：如果知名度为0，使用1避免log(0)的错误
    const safePopularity = Math.max(gameData.popularity, 1);
    const logPopularity = Math.log2(safePopularity);
    gameData.fanCount = Math.floor(gameData.radiationPopulation * logPopularity / 1000);
    
    // 计算观影人数：粉丝数量 × 10%，确保至少有1人
    gameData.movieViewers = Math.max(1, Math.floor(gameData.fanCount * 0.1));
    
    // Calculate customer arrivals: based on day of week, holidays, and schedule multipliers
    let multiplierMin, multiplierMax;
    
    // 先计算基础倍数
    if (isTodayHoliday()) {
        multiplierMin = 10.0;
        multiplierMax = 20.0;
    } else {
        switch (gameData.weekDay) {
            case 0: // 周日
                multiplierMin = 3.0;
                multiplierMax = 5.0;
                break;
            case 1: // 周一
                multiplierMin = 0.9;
                multiplierMax = 1.1;
                break;
            case 2: // 周二
                multiplierMin = 0.8;
                multiplierMax = 1.0;
                break;
            case 3: // 周三
                multiplierMin = 0.7;
                multiplierMax = 0.9;
                break;
            case 4: // 周四
                multiplierMin = 0.75;
                multiplierMax = 0.95;
                break;
            case 5: // 周五
                multiplierMin = 2.0;
                multiplierMax = 4.0;
                break;
            case 6: // 周六
                multiplierMin = 5.0;
                multiplierMax = 8.0;
                break;
        }
    }
    
    // Adjust multiplier based on schedule
    const month = gameData.date.month;
    const day = gameData.date.day;
    
    if (gameData.currentSchedule === '暑期档' || gameData.currentSchedule === '寒假档') {
        // 暑期档和寒假档是平时的3倍
        multiplierMin *= 3;
        multiplierMax *= 3;
    }
    
    const multiplier = multiplierMin + Math.random() * (multiplierMax - multiplierMin);
    
    // 计算各影片票房：先计算人次，再计算票房
    let totalBoxOffice = 0;
    const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
    
    // 排片为0时，到店人数清零
    if (scheduledMovies.length > 0) {
        gameData.arrivalCount = Math.floor(gameData.movieViewers * multiplier);
        
        // 计算今日客流
        const dailyPassengers = gameData.arrivalCount;
        gameData.dailyPassengers = dailyPassengers;
    } else {
        // 没有排片时，到店人数为0
        gameData.arrivalCount = 0;
        gameData.dailyPassengers = 0;
    }
    
    // 设置各档票价
    const ticketPrices = {
        1: 40, // 1档票价40元
        2: 30, // 2档票价30元
        3: 20  // 3档票价20元
    };
    
    if (scheduledMovies.length > 0) {
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
            const ticketPrice = ticketPrices[movie.tier] || 20; // 档位票价
            
            // 根据吸引力权重分配到店人数
            let movieViewers = 0;
            if (totalAttractionWeight > 0) {
                const weightRatio = movie.attractionWeight / totalAttractionWeight;
                movieViewers = Math.floor(gameData.arrivalCount * weightRatio);
            }
            movie.viewers = movieViewers;
            
            // 再根据人次计算票房
            const movieBoxOffice = movieViewers * ticketPrice;
            movie.currentBoxOffice = movieBoxOffice;
            totalBoxOffice += movieBoxOffice;
        });
    } else {
        // 没有排片时票房为0
        totalBoxOffice = 0;
    }
    
    // 计算总卖品销量：到店人数 × 0.2-0.3（20-30%买商品）
    const totalProductSalesQuantity = Math.floor(gameData.arrivalCount * (0.2 + Math.random() * 0.1));
    
    // 重置今日销量
    gameData.products.forEach(product => {
        product.todaySales = 0;
    });
    
    // 按指定概率分配销量
    if (totalProductSalesQuantity > 0) {
        // 定义商品概率
        const productProbabilities = {
            '爆米花': 0.3,  // 30%
            '可乐': 0.2,    // 20%
            '电影周边': 0.05 // 5%
        };
        
        // 计算总概率
        const totalProbability = Object.values(productProbabilities).reduce((sum, prob) => sum + prob, 0);
        
        // 为每个商品计算预期销量
        const productExpectedSales = {};
        let allocatedSales = 0;
        
        gameData.products.forEach(product => {
            const prob = productProbabilities[product.name] || 0;
            const maxPossibleSales = Math.min(product.stock, Math.floor(totalProductSalesQuantity * (prob / totalProbability)));
            product.todaySales = maxPossibleSales;
            product.stock -= maxPossibleSales;
            allocatedSales += maxPossibleSales;
        });
        
        // 分配剩余销量
        let remainingSales = totalProductSalesQuantity - allocatedSales;
        while (remainingSales > 0) {
            // 随机选择一个有库存的商品
            const availableProducts = gameData.products.filter(p => p.stock > 0);
            if (availableProducts.length === 0) {
                break; // 无库存，停止分配
            }
            const randomIndex = Math.floor(Math.random() * availableProducts.length);
            const selectedProduct = availableProducts[randomIndex];
            selectedProduct.todaySales += 1;
            selectedProduct.stock -= 1;
            remainingSales -= 1;
        }
    }
    
    // 计算总卖品收入：各卖品收入之和
    let totalProductRevenue = 0;
    let outOfStockProducts = [];
    gameData.products.forEach(product => {
        const productRevenue = product.todaySales * product.price;
        totalProductRevenue += productRevenue;
        
        // 检查是否缺货
        if (product.stock <= 0) {
            outOfStockProducts.push(product.name);
        }
    });
    
    // 显示缺货报警通知
    if (outOfStockProducts.length > 0) {
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>Out of Stock Alert: ${outOfStockProducts.join(', ')} - Please restock!</span>`;
            checkScrollNeeded();
            
            // 3秒后恢复默认内容
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    }
    
    // 计算店铺数量
    const shopCount = (gameData.shops ? gameData.shops.length : 0) + 1; // 加1包含总店
    const isCinemaChain = shopCount > 100;
    
    // 计算市场级别
    function getMarketLevel(shopCount) {
        if (shopCount >= 1000) return { level: '全球', base: 100000 };
        if (shopCount >= 100) return { level: '全国', base: 10000 };
        if (shopCount >= 20) return { level: '省级', base: 1000 };
        if (shopCount >= 3) return { level: '市级', base: 100 };
        return { level: '县级', base: 10 };
    }
    
    const marketLevel = getMarketLevel(shopCount);
    gameData.marketLevel = marketLevel.level;
    
    // 计算大盘数据
    let marketBase = marketLevel.base * 5000; // 基数为市场级别基数*5000
    
    // 按周一到周日浮动
    let marketMultiplier;
    switch (gameData.weekDay) {
        case 0: // 周日
            marketMultiplier = 1.5;
            break;
        case 1: // 周一
            marketMultiplier = 0.8;
            break;
        case 2: // 周二
            marketMultiplier = 0.7;
            break;
        case 3: // 周三
            marketMultiplier = 0.6;
            break;
        case 4: // 周四
            marketMultiplier = 0.7;
            break;
        case 5: // 周五
            marketMultiplier = 1.2;
            break;
        case 6: // 周六
            marketMultiplier = 1.8;
            break;
    }
    
    // Adjust box office multiplier based on schedule
    if (gameData.currentSchedule === '暑期档' || gameData.currentSchedule === '寒假档') {
        // 暑期档和寒假档是平时的3倍
        marketMultiplier *= 3;
    }
    
    // 计算最终大盘数据
    gameData.dailyMarketData = Math.floor(marketBase * marketMultiplier);
    
    // 计算每日收入（包括票房、卖品和合作收入）
    const dailyCooperationIncome = gameData.cooperation.monthlyIncome / 30; // 合作收入日均
    const dailyRevenue = totalBoxOffice + totalProductRevenue + dailyCooperationIncome;
    gameData.todayRevenue = Math.floor(dailyRevenue);
    gameData.todayBoxOffice = Math.floor(totalBoxOffice);
    gameData.todayProductRevenue = Math.floor(totalProductRevenue);
    
    // 更新支出计数
    gameData.expenseCounters.days += 1;
    
    // 检查店铺是否开业
    checkShopOpening();
    
    // 检查破产条件
    if (gameData.money < 0 && Math.abs(gameData.money) > gameData.equipment.currentValue * 0.5) {
        // 显示破产弹窗
        showBankruptcyModal();
        
        // 结束游戏
        gameData.timePaused = true;
        
        return;
    }

    // 检查客诉
checkComplaints();

// 检查设备是否需要强制更换
checkEquipmentReplacement();
    
    gameData.todayExpense = totalExpense;
    
    // 计算每日平均支出（包括月度和年度支出的日均分摊）
    const dailyUtilities = gameData.expenses.monthlyUtilities / 30;
    const dailySalaries = gameData.expenses.monthlySalaries / 30;
    const dailyRent = gameData.expenses.annualRent / 365;
    
    // 总每日支出
    const dailyTotalExpense = totalExpense + dailyUtilities + dailySalaries + dailyRent;
    
    // 更新总资产（营收 - 总每日支出）
    const netProfit = Math.floor(dailyRevenue - dailyTotalExpense);
    gameData.money += netProfit;
    gameData.weekBoxOffice += totalBoxOffice;
    
    // 更新累计统计数据
    gameData.totalRevenue += Math.floor(dailyRevenue);
    gameData.totalViewers += gameData.arrivalCount;
    gameData.totalScreenings += gameData.movies.filter(movie => movie.inSchedule).length;
    gameData.totalMoviesScreened = gameData.movies.filter(movie => movie.inSchedule).length;
    
    // 更新票房历史数据
    gameData.boxOfficeHistory.shift(); // 移除最早的数据
    gameData.boxOfficeHistory.push(totalBoxOffice); // 添加今天的票房数据
    // 确保只保留30天的数据
    if (gameData.boxOfficeHistory.length > 30) {
        gameData.boxOfficeHistory = gameData.boxOfficeHistory.slice(-30);
    }
    
    // 更新卖品收入历史数据
    gameData.productSalesHistory.shift();
    gameData.productSalesHistory.push(totalProductRevenue);
    
    // 计算并更新市场份额（基于票房和卖品收入）
    const totalRevenue = totalBoxOffice + totalProductRevenue;
    // 使用大盘数据作为分母计算市场份额
    const marketShare = parseFloat(Math.min(100, Math.max(0, (totalRevenue / gameData.dailyMarketData) * 100)).toFixed(2)); // 最多2位小数
    gameData.marketShareHistory.shift();
    gameData.marketShareHistory.push(marketShare);
    
    // 随机更新口碑
    const repChange = Math.floor(Math.random() * 5) - 2;
    gameData.reputation = Math.max(0, Math.min(100, gameData.reputation + repChange));
    
    // 知名度按店数增加
    const totalShops = (gameData.shops ? gameData.shops.length : 0) + 1; // 加1包含总店
    gameData.popularity += totalShops;
    
    // 更新电影上映天数
    updateMovieReleaseDays();
    
    // 每周添加新片（周五添加）
    if (gameData.weekDay === 5) { // 5表示周五
        addNewMovies();
        
        // 票房指数级别每周降一级
        gameData.movies.forEach(movie => {
            if (movie.boxOfficeLevel && movie.boxOfficeLevel < 5) {
                movie.boxOfficeLevel += 1; // 级别增加，吸引顾客比例降低
            }
        });
    }
    
    // 每周一提示去宣传以扩大知名度，第二年就不用了
    if (gameData.weekDay === 1) { // 1表示周一
        if (gameData.promotionReminderEnabled && gameData.date.year === 1) {
            const currentWeek = Math.floor(gameData.expenseCounters.days / 7);
            if (currentWeek !== gameData.lastPromotionReminderWeek) {
                gameData.lastPromotionReminderWeek = currentWeek;
                showNotification('Tip: Remember to run promotions to increase popularity!');
            }
        }
    }
    
    // 更新UI
    updateUI();
    
    // 检查排片是否为空
    checkEmptySchedule();
    
    // 随机触发事件
    if (Math.random() > 0.7) {
        showEvent();
    }
    
    // 检查是否生成合作机会
    checkCooperationOpportunities();
    
    // 每天自动存档
    saveGameProgress();
}

// 检查排片是否为空
function checkEmptySchedule() {
    const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
    if (scheduledMovies.length === 0) {
        // 显示排片提醒通知
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = '<span>Schedule Reminder: No movies scheduled - Please add movies to schedule!</span>';
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    }
}

// 检查店铺是否开业
function checkShopOpening() {
    if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            if (shop.status === '建设中' && gameData.expenseCounters.days >= shop.openingDay) {
                shop.status = '营业中';
                
                // 显示店铺开业通知
                const notificationContent = document.getElementById('notification-content');
                if (notificationContent) {
                    notificationContent.innerHTML = `<span>${shop.name}: Officially opened!</span>`;
                    checkScrollNeeded();
                    
                    setTimeout(() => {
                        notificationContent.innerHTML = '';
                        checkScrollNeeded();
                    }, 3000);
                }
            }
        });
    }
}

// 检查并生成合作机会
function checkCooperationOpportunities() {
    // 每天有20%的概率生成合作机会
    if (Math.random() < 0.2) {
        // 合作机会类型（只保留收入类型合作）
            const cooperationTypes = [
                // Revenue type cooperation
                { name: 'Venue Equipment', type: 'income', basePrice: 5000, probability: 0.1 },
                { name: 'Pre-show Advertising', type: 'income', basePrice: 2000, probability: 0.3 },
                { name: 'Hall Naming Rights', type: 'income', basePrice: 10000, probability: 0.15 },
                { name: 'Corporate Booking', type: 'income', basePrice: 20000, probability: 0.25 },
                { name: 'Private Booking', type: 'income', basePrice: 3000, probability: 0.3 },
                { name: 'Celebrity Meetup', type: 'income', basePrice: 100000, probability: 0.1 }
            ];
        
        // 随机选择一个合作机会
        const randomCooperation = cooperationTypes[Math.floor(Math.random() * cooperationTypes.length)];
        
        // 根据合作机会的概率判断是否生成
        if (Math.random() < randomCooperation.probability) {
            // 检查该合作机会是否已经存在
            if (!gameData.cooperationOpportunities[randomCooperation.name]) {
                // 添加合作机会
                gameData.cooperationOpportunities[randomCooperation.name] = {
                    type: randomCooperation.type,
                    basePrice: randomCooperation.basePrice,
                    createdAt: gameData.expenseCounters.days
                };
                
                // 显示合作机会通知
                const notificationContent = document.getElementById('notification-content');
                if (notificationContent) {
                    // Generate consultant name
                let consultantName;
                if (randomCooperation.name === 'Private Booking') {
                    // Generate person name (Last Name + Mr./Ms.)
                    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
                    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                    const gender = Math.random() > 0.5 ? 'Mr.' : 'Ms.';
                    consultantName = lastName + ' ' + gender;
                } else {
                    // Generate virtual company name
                    const virtualPrefixes = ['Nebula', 'Galaxy', 'Future', 'Innovation', 'Tech', 'Dream', 'Stellar', 'Universal', 'Cosmic', 'Infinite', 'Quantum', 'Digital', 'Smart', 'Excellence', 'Elite', 'Pioneer', 'Leader', 'Legend'];
                    const companyNames = ['Tech', 'Media', 'Culture', 'Entertainment', 'Investment', 'Film', 'Advertising', 'Creative', 'Network', 'Digital'];
                    const prefix = virtualPrefixes[Math.floor(Math.random() * virtualPrefixes.length)];
                    const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];
                    consultantName = prefix + ' ' + companyName + ' Inc.';
                    }
                    notificationContent.innerHTML = `<span>Cooperation Opportunity: ${consultantName} inquiring about ${randomCooperation.name}, base revenue ¥${formatAssets(randomCooperation.basePrice)}</span>`;
                    checkScrollNeeded();
                    
                    // 3秒后恢复默认内容
                    setTimeout(() => {
                        notificationContent.innerHTML = '';
                        checkScrollNeeded();
                    }, 3000);
                }
            }
        }
    }
}

// 更新电影上映天数
function updateMovieReleaseDays() {
    // 过滤掉上映超过30天的电影
    const activeMovies = gameData.movies.filter(movie => {
        // 对所有电影增加上映天数
        movie.daysReleased += 1;
        // 检查是否上映超过30天
        if (movie.daysReleased > 30) {
            // 只有排片中的影片才显示下映通知
            if (movie.inSchedule) {
                // 显示电影下映通知
                const notificationContent = document.getElementById('notification-content');
                if (notificationContent) {
                    notificationContent.innerHTML = `<span>Movie Ended: "${movie.name}" has ended</span>`;
                    checkScrollNeeded();
                    
                    setTimeout(() => {
                        notificationContent.innerHTML = '';
                        checkScrollNeeded();
                    }, 3000);
                }
            }
            return false;
        }
        return true;
    });
    
    // 检查是否有电影被移除（下映）
    const hasMoviesRemoved = activeMovies.length < gameData.movies.length;
    
    // 更新电影列表
    gameData.movies = activeMovies;
    
    // 如果有电影下映，检查是否有排片弹窗打开，如果有则重新生成排片列表
    if (hasMoviesRemoved) {
        const modal = document.getElementById('schedule-modal');
        if (modal && modal.classList.contains('show')) {
            // 重新生成排片列表
            if (window.generateScheduledMoviesList) {
                window.generateScheduledMoviesList();
            }
            // 重新生成电影库列表
            if (window.generateMovieLibrary) {
                window.generateMovieLibrary();
            }
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
}

// 每周添加新片
function addNewMovies() {
    // 增加周计数器
    gameData.weekCounter += 1;
    
    // 每周五添加3-10部新片
    if (gameData.weekDay === 5) { // 周五添加
        // 随机生成3-5部新片
        const movieCount = Math.floor(Math.random() * 3) + 3; // 3-5部
        const newMovies = [];
        
        // 生成新电影
        // 计算最大ID
        let maxId = 0;
        gameData.movies.forEach(movie => {
            if (movie.id > maxId) {
                maxId = movie.id;
            }
        });
        
        for (let i = 0; i < movieCount; i++) {
            const newMovie = {
                id: maxId + i + 1,
                name: generateMovieName(),
                type: getRandomMovieType(),
                schedule: 0, // 默认排片占比为0，未加入排片
                tier: Math.floor(Math.random() * 3) + 1, // 1-3档随机
                releaseDay: gameData.expenseCounters.days,
                daysReleased: 0,
                inSchedule: false // 默认未加入排片
            };
            newMovies.push(newMovie);
        }
        
        // 添加新电影到列表
        gameData.movies = [...gameData.movies, ...newMovies];
        
        // 增加新片计数器
        gameData.newMovieCounter += movieCount;
        
        // 显示新片上映通知（只有当新片数量大于1时才显示）
        if (movieCount > 1) {
            const notificationContent = document.getElementById('notification-content');
            if (notificationContent) {
                notificationContent.innerHTML = `<span>New Release: ${movieCount} new movies premiering today</span>`;
                checkScrollNeeded();
                
                // 3秒后恢复默认内容
                setTimeout(() => {
                    notificationContent.innerHTML = '';
                    checkScrollNeeded();
                }, 3000);
            }
        }
    }
}

// 显示随机事件（顶部滚动通知）
function showEvent() {
    // 不再显示任何事件
}



// Get reasonable schedule based on month
function getScheduleByMonth(month) {
    const scheduleMap = {
        1: ['春节档'],      // 1月
        2: ['春节档'],      // 2月
        7: ['暑期档'],      // 7月
        8: ['暑期档'],      // 8月
        10: ['国庆档']      // 10月
    };
    return scheduleMap[month] || [];
}

// Check schedule events
function checkScheduleEvent() {
    const year = gameData.date.year;
    const month = gameData.date.month;
    const day = gameData.date.day;
    
    // Check if in schedule period
    let currentSchedule = '';
    
    // Winter vacation schedule: January 1st - February 28th
    if ((month === 1 && day >= 1) || (month === 2 && day <= 28)) {
        currentSchedule = 'Winter Vacation';
    }
    // Summer vacation schedule: June 1st - August 31st
    else if ((month === 6 && day >= 1) || (month === 7 && day >= 1) || (month === 8 && day <= 31)) {
        currentSchedule = 'Summer Vacation';
    }
    
    // 更新档期状态
    if (currentSchedule !== gameData.currentSchedule) {
        if (currentSchedule) {
            // 档期开始
            gameData.currentSchedule = currentSchedule;
            
            // 显示档期开始通知
            const notificationContent = document.getElementById('notification-content');
            if (notificationContent) {
                notificationContent.innerHTML = `<span>Schedule Notice: ${currentSchedule} has started! Consider adjusting scheduling strategy.</span>`;
                checkScrollNeeded();
                
                // Restore default content after 3 seconds
                setTimeout(() => {
                    notificationContent.innerHTML = '';
                    checkScrollNeeded();
                }, 3000);
            }
        } else {
            // Schedule ended
            if (gameData.currentSchedule) {
                gameData.currentSchedule = '';
                
                // Show schedule end notification
                const notificationContent = document.getElementById('notification-content');
                if (notificationContent) {
                    notificationContent.innerHTML = '<span>Schedule Notice: Current schedule has ended.</span>';
                    checkScrollNeeded();
                    
                    // Restore default content after 3 seconds
                    setTimeout(() => {
                        notificationContent.innerHTML = '';
                        checkScrollNeeded();
                    }, 3000);
                }
            }
        }
    }
}

// 更新UI
function updateUI() {
    // 检查是否触发档期事件
    checkScheduleEvent();
    
    // Update game time display
    const gameDateElement = document.getElementById('game-date');
    if (gameDateElement) {
        // Get current day of week
        const currentWeekDay = weekDays[gameData.weekDay];
        // Get month name (month is 1-12, array is 0-11)
        const currentMonth = monthNames[gameData.date.month - 1];
        // Build date display text
        let dateText = `${currentMonth} ${gameData.date.day}, Year ${gameData.date.year} ${currentWeekDay}`;
        // If there's a schedule, add schedule info
        if (gameData.currentSchedule) {
            dateText += ` [${gameData.currentSchedule}]`;
        }
        gameDateElement.textContent = dateText;
    }
    
    // 更新顶部状态栏的影院名称和总资产
    const totalAssetsElement = document.getElementById('total-assets');
    if (totalAssetsElement) {
        const shopCount = (gameData.shops ? gameData.shops.length : 0) + 1; // 加1包含总店
        const isCinemaChain = shopCount > 100;
        let displayName = gameData.cinemaName;
        
        if (isCinemaChain) {
            // 替换原有的后缀为"院线"
            const suffixes = ['影城', '影院', '电影城', '影都', '影苑', '影厅', '影宫', '影阁', '影坊', '影园'];
            let hasSuffix = false;
            for (const suffix of suffixes) {
                if (displayName.endsWith(suffix)) {
                    displayName = displayName.replace(suffix, '院线');
                    hasSuffix = true;
                    break;
                }
            }
            if (!hasSuffix) {
                displayName += '院线';
            }
        }
        
        const shopText = shopCount > 1 ? ` (${shopCount}家)` : ''; // 只有1家时不显示
        totalAssetsElement.textContent = `${displayName}${shopText} | Total Assets: ${formatAssets(gameData.money)}`;
    }
    
    // 更新扩张进度
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${gameData.expandProgress}%`;
    }
    
    // 更新票房曲线图
    updateChart();
    
    // 更新升级页面的标签文本
    const shopTabBtn = document.getElementById('shop-tab-btn');
    if (shopTabBtn) {
        const shopCount = (gameData.shops ? gameData.shops.length : 0) + 1; // Add 1 for headquarter
        const isCinemaChain = shopCount > 100;
        shopTabBtn.textContent = isCinemaChain ? 'Cinema Chain' : 'Shop';
    }
    
    // 更新按钮状态
    if (window.updateRecruitButtonStatus) {
        window.updateRecruitButtonStatus();
    }
    
    if (window.updateShopButtonStatus) {
        window.updateShopButtonStatus();
    }
    
    // 更新合作按钮状态
    updateCooperationButtonsStatus();
    
    // 更新合作角标状态
    if (window.updateCooperationBadges) {
        window.updateCooperationBadges();
    }
    
    // 更新单次合作收入显示
    const oneTimeCooperationIncomeElement = document.getElementById('one-time-cooperation-income');
    if (oneTimeCooperationIncomeElement) {
        oneTimeCooperationIncomeElement.textContent = formatAssets(gameData.cooperation.oneTimeIncome || 0);
    }
    
    // 更新长期合作收入显示
    const monthlyFixedCooperationIncomeElement = document.getElementById('monthly-fixed-cooperation-income');
    if (monthlyFixedCooperationIncomeElement) {
        monthlyFixedCooperationIncomeElement.textContent = formatAssets(gameData.cooperation.monthlyIncome || 0);
    }
    
    // 更新客流数据显示
    const dailyPassengersElement = document.getElementById('daily-passengers');
    if (dailyPassengersElement) {
        dailyPassengersElement.textContent = gameData.dailyPassengers;
    }
    
    // 更新知名度显示
    const popularityElement = document.getElementById('popularity');
    if (popularityElement) {
        popularityElement.textContent = gameData.popularity;
    }
    
    // 更新粉丝数量显示
    const fanCountElement = document.getElementById('fan-count');
    
    // 更新累计统计数据显示
    const totalRevenueElement = document.getElementById('total-revenue');
    if (totalRevenueElement) {
        totalRevenueElement.textContent = formatAssets(gameData.totalRevenue);
    }
    
    const totalScheduleCountElement = document.getElementById('total-schedule-count');
    if (totalScheduleCountElement) {
        totalScheduleCountElement.textContent = gameData.totalScheduleCount;
    }
    
    const totalPurchaseCountElement = document.getElementById('total-purchase-count');
    if (totalPurchaseCountElement) {
        totalPurchaseCountElement.textContent = gameData.totalPurchaseCount;
    }
    
    const totalViewersElement = document.getElementById('total-viewers');
    if (totalViewersElement) {
        totalViewersElement.textContent = gameData.totalViewers;
    }
    
    const totalScreeningsElement = document.getElementById('total-screenings');
    if (totalScreeningsElement) {
        totalScreeningsElement.textContent = gameData.totalScreenings;
    }
    
    const totalMoviesScreenedElement = document.getElementById('total-movies-screened');
    if (totalMoviesScreenedElement) {
        totalMoviesScreenedElement.textContent = gameData.totalMoviesScreened;
    }
    if (fanCountElement) {
        fanCountElement.textContent = formatAssets(gameData.fanCount);
    }
    
    // 更新观影人数显示
    const movieViewersElement = document.getElementById('movie-viewers');
    if (movieViewersElement) {
        movieViewersElement.textContent = formatAssets(gameData.movieViewers);
    }
    
    // 更新到店人数显示
    const arrivalCountElement = document.getElementById('arrival-count');
    if (arrivalCountElement) {
        arrivalCountElement.textContent = formatAssets(gameData.arrivalCount);
    }
    
    // 更新今日票房显示
    const todayBoxOfficeElement = document.getElementById('today-box-office');
    if (todayBoxOfficeElement) {
        todayBoxOfficeElement.textContent = formatAssets(gameData.todayBoxOffice);
    }
    
    // 更新今日卖品收入显示
    const todayProductRevenueElement = document.getElementById('today-product-revenue');
    if (todayProductRevenueElement) {
        todayProductRevenueElement.textContent = formatAssets(gameData.todayProductRevenue);
    }
    
    // 更新大盘数据显示
    const dailyMarketDataElement = document.getElementById('daily-market-data');
    if (dailyMarketDataElement) {
        dailyMarketDataElement.textContent = formatAssets(gameData.dailyMarketData);
    }
    
    // 更新今日总收入显示
    const todayTotalRevenueElement = document.getElementById('today-total-revenue');
    if (todayTotalRevenueElement) {
        todayTotalRevenueElement.textContent = formatAssets(gameData.todayRevenue);
    }
    
    // 检查员工是否低于必备人数
    checkStaffBelowMin();
    
    // 更新店铺列表
    updateShopList();
    
    // 更新店铺等级显示
    if (window.updateShopLevelsDisplay) {
        window.updateShopLevelsDisplay();
    }
    
    // 更新宣传页面显示
    updatePromotionDisplay();
    
    // 更新设备页面显示
    updateEquipmentDisplay();
    
    // 更新Venue Equipment数量显示
    const currentEquipmentCountElement = document.getElementById('current-equipment-count');
    const maxEquipmentCountElement = document.getElementById('max-equipment-count');
    if (currentEquipmentCountElement && maxEquipmentCountElement) {
        // 计算总设备数量
        let totalCurrentEquipment = 0;
        
        // 设备类型
        const equipmentTypes = ['Game Console', 'Claw Machine', 'KTV'];
        
        // 计算店铺数量和等级
        let shopStats = {
            convenience: 1, // Headquarter defaults to convenience store
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
        
        // 计算当前总设备数量
        equipmentTypes.forEach(type => {
            // 从gameData中获取当前设备数量，默认0
            const currentCount = gameData.equipment && gameData.equipment[type] ? gameData.equipment[type] : 0;
            totalCurrentEquipment += currentCount;
        });
        
        // 计算总设备上限（总和）
        let totalMaxEquipment = 0;
        const levelLimits = {
            convenience: 10,
            premium: 20,
            flagship: 50,
            super: 100
        };
        for (let level in shopStats) {
            totalMaxEquipment += shopStats[level] * levelLimits[level];
        }
        
        // 更新显示
        currentEquipmentCountElement.textContent = totalCurrentEquipment;
        maxEquipmentCountElement.textContent = totalMaxEquipment;
        
        // 更新Venue Equipment按钮状态
        const equipmentButton = document.querySelector('.cooperation-item[onclick="openEquipmentQuantityModal()"]');
        if (equipmentButton) {
            // 首先检查是否有合作机会
            const hasOpportunity = !!gameData.cooperationOpportunities['Venue Equipment'];
            if (hasOpportunity) {
                // 有合作机会时，根据设备数量是否达到上限来决定
                if (totalCurrentEquipment >= totalMaxEquipment) {
                    equipmentButton.disabled = true;
                    equipmentButton.style.backgroundColor = '#cccccc';
                    equipmentButton.style.cursor = 'not-allowed';
                    equipmentButton.style.borderColor = '#999999';
                } else {
                    equipmentButton.disabled = false;
                    equipmentButton.style.backgroundColor = '#4CAF50';
                    equipmentButton.style.cursor = 'pointer';
                    equipmentButton.style.borderColor = '#388E3C';
                }
            } else {
                // 没有合作机会时，禁用按钮
                equipmentButton.disabled = true;
                equipmentButton.style.backgroundColor = '#cccccc';
                equipmentButton.style.cursor = 'not-allowed';
                equipmentButton.style.borderColor = '#999999';
            }
        }
    }
    
    // 更新票房表格
    if (window.updateBoxOfficeTable) {
        window.updateBoxOfficeTable();
    }
    
    // 更新商品销量和库存显示
    gameData.products.forEach(product => {
        // 找到对应的元素并更新
        let stockElement, salesElement;
        switch (product.name) {
            case '爆米花':
                stockElement = document.getElementById('popcorn-stock');
                salesElement = document.getElementById('popcorn-sales');
                break;
            case '可乐':
                stockElement = document.getElementById('cola-stock');
                salesElement = document.getElementById('cola-sales');
                break;
            case '电影周边':
                stockElement = document.getElementById('merch-stock');
                salesElement = document.getElementById('merch-sales');
                break;
        }
        
        if (stockElement) {
            stockElement.textContent = product.stock;
        }
        if (salesElement) {
            salesElement.textContent = product.todaySales;
        }
    });
    
    // 计算总厅数
    let totalHalls = 3; // 总店3个厅
    if (gameData.shops && gameData.shops.length > 0) {
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
    const totalStock = gameData.products.reduce((sum, product) => sum + product.stock, 0);
    
    // Update total stock and out of stock product display
    const totalStockElement = document.getElementById('total-stock');
    const outOfStockElement = document.getElementById('out-of-stock');
    
    if (totalStockElement) {
        totalStockElement.textContent = totalStock;
    }
    
    if (outOfStockElement) {
        const outOfStockProducts = gameData.products.filter(product => product.stock === 0);
        if (outOfStockProducts.length > 0) {
            const outOfStockNames = outOfStockProducts.map(product => product.name).join('、');
            outOfStockElement.textContent = outOfStockNames;
        } else {
            // 检查库存是否低于上限的20%
            if (totalStock < stockLimit * 0.2) {
                outOfStockElement.textContent = 'Low Stock Warning';
                outOfStockElement.style.color = 'red';
            } else {
                outOfStockElement.textContent = 'None';
                outOfStockElement.style.color = 'black';
            }
        }
    }
    
    // Update stock limit display
    const stockLimitElement = document.getElementById('stock-limit');
    if (stockLimitElement) {
        stockLimitElement.textContent = stockLimit;
    }
    
    // 更新工资信息显示
    const averageSalaryElement = document.getElementById('average-salary');
    const totalSalaryElement = document.getElementById('total-salary');
    const annualSalaryElement = document.getElementById('annual-salary');
    
    if (averageSalaryElement && totalSalaryElement && annualSalaryElement) {
        // 获取当前班制
        const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
        
        // 计算总员工数量（考虑班制）
        let totalStaff = 3 * workSchedule; // 总店3人，乘以班制数
        if (gameData.shops && gameData.shops.length > 0) {
            gameData.shops.forEach(shop => {
                totalStaff += (shop.staffCount || 0) * workSchedule;
            });
        }
        
        // 人均月薪
        const averageSalary = 3000;
        // 月工资总支出
        const totalSalary = totalStaff * averageSalary;
        // 年度工资支出
        const annualSalary = totalSalary * 12;
        
        // 更新显示
        averageSalaryElement.textContent = formatAssets(averageSalary);
        totalSalaryElement.textContent = formatAssets(totalSalary);
        annualSalaryElement.textContent = formatAssets(annualSalary);
    }
    
    // 更新票房分账显示
    const filmStudioSharingElement = document.getElementById('film-studio-sharing');
    const cinemaChainSharingElement = document.getElementById('cinema-chain-sharing');
    const fundSharingElement = document.getElementById('fund-sharing');
    const cinemaActualRevenueElement = document.getElementById('cinema-actual-revenue');
    
    if (filmStudioSharingElement && cinemaChainSharingElement && fundSharingElement && cinemaActualRevenueElement) {
        // 计算店铺数量
        const shopCount = (gameData.shops ? gameData.shops.length : 0) + 1; // 加1包含总店
        const isCinemaChain = shopCount > 100;
        
        // Revenue sharing ratios
        let filmStudioShare = 40; // Changed from 39% to 40%
        let cinemaChainShare = 5;
        let fundShare = 5; // Tax rate changed to 5%
        
        // If cinema chain, remove cinema chain share
        if (isCinemaChain) {
            cinemaChainShare = 0;
        }
        
        // Calculate cinema actual revenue ratio
        const cinemaActualShare = 100 - filmStudioShare - cinemaChainShare - fundShare;
        
        // 更新显示
        filmStudioSharingElement.textContent = filmStudioShare + '%';
        cinemaChainSharingElement.textContent = cinemaChainShare + '%';
        fundSharingElement.textContent = '5%'; // Tax rate changed to 5%
        cinemaActualRevenueElement.textContent = cinemaActualShare.toFixed(1) + '%';
    }
}

// 更新店铺列表
function updateShopList() {
    const shopListContent = document.getElementById('shop-list-content');
    if (!shopListContent) return;
    
    let shopListHTML = '<p>1号店（总店）- 营业中</p>';
    
    if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            const levelName = {
                convenience: '便民店',
                premium: '精品店',
                flagship: '旗舰店',
                super: '超级店'
            };
            const shopLevelName = levelName[shop.level] || '便民店';
            shopListHTML += `<p>${shop.name}（${shopLevelName}）- ${shop.status}</p>`;
        });
    }
    
    shopListContent.innerHTML = shopListHTML;
}

// 更新合作按钮状态
function updateCooperationButtonsStatus() {
    // 获取所有合作按钮
    const cooperationButtons = document.querySelectorAll('.cooperation-item');
    cooperationButtons.forEach(button => {
        // 从onclick属性中提取合作名称
        const onclickText = button.getAttribute('onclick');
        if (onclickText) {
            // 匹配openCooperationModal调用中的名称参数
            const match = onclickText.match(/openCooperationModal\(['"]\w+['"],\s*['"]([^'"]+)['"]/);
            if (match && match[1]) {
                const cooperationName = match[1];
                // 检查合作机会是否存在
                const isAvailable = !!gameData.cooperationOpportunities[cooperationName];
                // 更新按钮状态
                button.disabled = !isAvailable;
            } else if (onclickText.includes('openEquipmentQuantityModal')) {
                // Venue Equipment按钮需要专门检查"Venue Equipment"合作机会
                const isAvailable = !!gameData.cooperationOpportunities['Venue Equipment'];
                button.disabled = !isAvailable;
            } else if (onclickText.includes('showEquipmentDetail')) {
                // 设备列表按钮始终可用（用于查看现有设备）
                button.disabled = false;
            }
        }
    });
}





// 检查员工配置（始终保持标配）
function checkEmployeeResignation() {
    // 获取当前班制
    const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    
    // 计算总员工数量（考虑班制）
    let totalStaff = 3 * workSchedule; // 总店3人，乘以班制数
    if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            totalStaff += (shop.staffCount || 0) * workSchedule;
        });
    }
    
    // 始终保持标配状态
    const newStaffLevel = 3; // 标配
    
    // 更新员工配置等级
    localStorage.setItem('staffLevel', newStaffLevel);
    
    // 更新月工资支出
    const monthlySalaryPerPerson = 3000; // 平均每人月薪
    gameData.expenses.monthlySalaries = totalStaff * monthlySalaryPerPerson;
    
    // 检查是否低于必备人数
    checkStaffBelowMin();
    
    // 更新血条和UI
    if (window.updateStaffBloodBar) {
        window.updateStaffBloodBar(newStaffLevel);
    }
    updateUI();
}

// 检查员工是否低于必备人数
function checkStaffBelowMin() {
    // 获取当前班制
    const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    
    // 计算总员工数量（考虑班制）
    let totalStaff = 3 * workSchedule; // 总店3人，乘以班制数
    if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            totalStaff += (shop.staffCount || 0) * workSchedule;
        });
    }
    
    // 基于店铺数量计算必备员工数（考虑班制）
    const totalShops = gameData.shopCount || 1;
    const minStaffCount = totalShops * 3 * workSchedule; // Each shop needs at least 3 employees, multiplied by shifts
    
    // Staff count check disabled
    // if (totalStaff < minStaffCount) {
    //     Staff warning notification has been removed
    // }
}

// 动态生成电影列表
function generateMovieList() {
    const movieList = document.getElementById('movie-list');
    if (movieList) {
        movieList.innerHTML = '';
        gameData.movies.forEach(movie => {
            // 获取档位文本
            const tierText = movie.tier === 1 ? '1档（高优先级）' : movie.tier === 2 ? '2档（中优先级）' : '3档（低优先级）';
            
            const movieItem = document.createElement('div');
            movieItem.className = 'movie-item';
            movieItem.innerHTML = `
                <div class="movie-info">
                    <h3>${movie.name}</h3>
                    <p>Type: ${movie.type}</p>

                    <p>Tier: ${tierText}</p>
                    <p>Schedule: ${movie.schedule}%</p>
                </div>
                <input type="range" min="0" max="100" value="${movie.schedule}" class="schedule-slider" data-movie-id="${movie.id}">
            `;
            movieList.appendChild(movieItem);
        });
        
        // 绑定排片滑块事件，实现按档调整排片百分比
        const sliders = document.querySelectorAll('.schedule-slider');
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
                    // Get movie info
                    const movieType = currentMovie.type;
                    const tierText = currentMovie.tier === 1 ? 'Tier 1' : currentMovie.tier === 2 ? 'Tier 2' : 'Tier 3';
                    // Update movie info text
                    scheduleText.textContent = `${movieType}, ${tierText}, ${currentValue}%`;
                }
                
                // 计算剩余可分配的排片
                const remaining = Math.max(0, 100 - currentValue);
                
                // 获取其他电影
                const otherMovies = gameData.movies.filter(movie => movie.id !== movieId);
                
                // 定义档位权重
                const tierWeights = {
                    1: 3, // 1档权重最高
                    2: 2, // 2档权重中等
                    3: 1  // 3档权重最低
                };
                
                // 计算总权重
                let totalWeight = 0;
                otherMovies.forEach(movie => {
                    const weight = tierWeights[movie.tier] || 1;
                    totalWeight += weight;
                });
                
                // 按档分配剩余排片
                if (totalWeight > 0 && otherMovies.length > 0) {
                    let allocated = 0;
                    
                    // 按权重分配排片
                    otherMovies.forEach((movie) => {
                        const weight = tierWeights[movie.tier] || 1;
                        const allocation = Math.floor((weight / totalWeight) * remaining);
                        
                        // 确保不超过剩余可分配排片
                        if (allocated + allocation <= remaining) {
                            // 找到对应的滑块并更新
                            const otherSlider = document.querySelector(`.schedule-slider[data-movie-id="${movie.id}"]`);
                            if (otherSlider) {
                                otherSlider.value = allocation;
                                // 更新电影的排片值
                                movie.schedule = allocation;
                                // 更新对应电影的排片文本
                                const otherMovieItem = otherSlider.closest('.movie-item');
                                const otherScheduleText = otherMovieItem.querySelector('.movie-info p:last-child');
                                if (otherScheduleText) {
                                    // Get movie info
                                    const movieType = movie.type;
                                    const tierText = movie.tier === 1 ? 'Tier 1' : movie.tier === 2 ? 'Tier 2' : 'Tier 3';
                                    // Update movie info text
                                    otherScheduleText.textContent = `${movieType}, ${tierText}, ${allocation}%`;
                                }
                                allocated += allocation;
                            }
                        }
                    });
                    
                    // 处理最后剩余的排片（由于四舍五入可能产生的误差）
                    const finalRemaining = remaining - allocated;
                    if (finalRemaining > 0 && otherMovies.length > 0) {
                        // 将剩余排片分配给第一部其他电影
                        const firstOtherMovie = otherMovies[0];
                        const firstSlider = document.querySelector(`.schedule-slider[data-movie-id="${firstOtherMovie.id}"]`);
                        if (firstSlider) {
                            const currentValue = parseInt(firstSlider.value);
                            const newValue = currentValue + finalRemaining;
                            firstSlider.value = newValue;
                            firstOtherMovie.schedule = newValue;
                            
                            // Update schedule text
                            const otherMovieItem = firstSlider.closest('.movie-item');
                            const otherScheduleText = otherMovieItem.querySelector('.movie-info p:last-child');
                            if (otherScheduleText) {
                                const movieType = firstOtherMovie.type;
                                const tierText = firstOtherMovie.tier === 1 ? 'Tier 1' : firstOtherMovie.tier === 2 ? 'Tier 2' : 'Tier 3';
                                // Update movie info text
                                otherScheduleText.textContent = `${movieType}, ${tierText}, ${newValue}%`;
                            }
                        }
                    }
                }
                
                // 更新当前电影的排片值
                currentMovie.schedule = currentValue;
            });
        });
    }
}



// 显示开始界面
function showStartPage() {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示开始界面
    const startPage = document.getElementById('start-page');
    if (startPage) {
        startPage.classList.add('active');
    }
}

// 更换设备
function replaceEquipment(batchYear, cost, isForced = false) {
    if (gameData.money < cost) {
        // 显示资金不足弹窗
        showCustomAlert('资金不足，无法更换设备');
        return;
    }
    
    // 找到要更换的批次
    const batches = gameData.equipmentBatches && gameData.equipmentBatches['Projector'] ? gameData.equipmentBatches['Projector'] : [];
    const batchToReplace = batches.find(batch => batch.year === batchYear);
    
    if (batchToReplace) {
        // 定义更换设备的函数
        function performReplacement() {
            // 扣除资金
            gameData.money -= cost;
            
            // 保存要更换的设备数量
            const equipmentCount = batchToReplace.count;
            
            // 找到当前年份的批次
            const currentYearBatch = batches.find(batch => batch.year === gameData.date.year);
            
            if (currentYearBatch) {
                // 如果当前年份已有批次，更新该批次的设备数量
                currentYearBatch.count += equipmentCount;
                // 从批次列表中移除被更换的批次
                const batchIndex = batches.indexOf(batchToReplace);
                if (batchIndex !== -1) {
                    batches.splice(batchIndex, 1);
                }
            } else {
                // 如果当前年份没有批次，创建新批次
                batches.push({
                    batch: batches.length + 1,
                    year: gameData.date.year,
                    count: equipmentCount,
                    electricity: 200
                });
                // 从批次列表中移除被更换的批次
                const batchIndex = batches.indexOf(batchToReplace);
                if (batchIndex !== -1) {
                    batches.splice(batchIndex, 1);
                }
            }
            
            // 限制总批次数量为10个
            if (batches.length > 10) {
                // 如果超过10个批次，移除最早的批次
                const oldestBatch = batches.reduce((oldest, current) => {
                    return current.year < oldest.year ? current : oldest;
                });
                const oldestBatchIndex = batches.indexOf(oldestBatch);
                if (oldestBatchIndex !== -1) {
                    batches.splice(oldestBatchIndex, 1);
                }
            }
            
            // 重新排序批次
            batches.sort((a, b) => a.year - b.year);
            
            // 重新编号批次
            batches.forEach((batch, index) => {
                batch.batch = index + 1;
            });
            
            // 显示成功消息
            const notificationContent = document.getElementById('notification-content');
            if (notificationContent) {
                notificationContent.innerHTML = `<span>Equipment Replacement: Successfully replaced equipment from year ${batchYear}, cost ¥${formatAssets(cost)}</span>`;
                checkScrollNeeded();
                
                setTimeout(() => {
                    notificationContent.innerHTML = '';
                    checkScrollNeeded();
                }, 3000);
            }
            
            // 重新显示Equipment Details
            showEquipmentDetail();
        }
        
        // 如果是强制更换，直接执行更换操作
        if (isForced) {
            performReplacement();
        } else {
            // 显示自定义确认对话框
            showCustomConfirm(`Confirm要更换${batchYear}年的设备吗？需要花费¥${formatAssets(cost)}`, performReplacement, () => {
                // 用户Cancel更换
                return;
            });
        }
    } else {
        // 显示未找到批次弹窗
        showCustomAlert('未找到该年份的设备批次');
        return;
    }
}

// 检查设备是否需要强制更换
function checkEquipmentReplacement() {
    // 检查是否已经有强制更换弹窗显示
    if (document.querySelector('.equipment-replacement-modal')) {
        return; // 如果已经有弹窗显示，不重复显示
    }
    
    const batches = gameData.equipmentBatches && gameData.equipmentBatches['Projector'] ? gameData.equipmentBatches['Projector'] : [];
    const batchesNeedingReplacement = batches.filter(batch => {
        const yearsUsed = gameData.date.year - batch.year + 1;
        return yearsUsed >= 10;
    });
    
    if (batchesNeedingReplacement.length > 0) {
        // 对需要更换的批次按使用年限排序，先显示使用年限最长的
        batchesNeedingReplacement.sort((a, b) => {
            const yearsUsedA = gameData.date.year - a.year + 1;
            const yearsUsedB = gameData.date.year - b.year + 1;
            return yearsUsedB - yearsUsedA;
        });
        
        // 显示强制更换弹窗
        const batchToReplace = batchesNeedingReplacement[0];
        const yearsUsed = gameData.date.year - batchToReplace.year + 1;
        const cost = batchToReplace.count * 50000;
        
        // 强制弹窗，没有Cancel按钮
        const modal = document.createElement('div');
        modal.className = 'equipment-replacement-modal'; // 添加类名，用于检测
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
        
        const panel = document.createElement('div');
        panel.style.cssText = `
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Equipment Replacement Reminder';
        title.style.marginTop = '0';
        title.style.textAlign = 'center';
        panel.appendChild(title);
        
        const messageElement = document.createElement('p');
        messageElement.textContent = `您有一批设备已使用${yearsUsed}年，达到使用年限，需要更换。更换费用：¥${formatAssets(cost)}`;
        messageElement.style.textAlign = 'center';
        messageElement.style.margin = '20px 0';
        panel.appendChild(messageElement);
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            justify-content: center;
            margin-top: 20px;
        `;
        
        const replaceButton = document.createElement('button');
        replaceButton.textContent = '立即更换';
        replaceButton.style.cssText = `
            padding: 8px 16px;
            background-color: #f44336;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        replaceButton.onclick = () => {
            // 先关闭强制更换弹窗
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            // 调用更换设备函数
            replaceEquipment(batchToReplace.year, cost, true);
        };
        buttonContainer.appendChild(replaceButton);
        
        panel.appendChild(buttonContainer);
        modal.appendChild(panel);
        document.body.appendChild(modal);
    }
}

// 显示自定义确认对话框
function showCustomConfirm(message, confirmCallback, cancelCallback) {
    // Create modal background
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
    
    // Create modal panel
    const panel = document.createElement('div');
    panel.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        width: 80%;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    // Panel title
    const title = document.createElement('h3');
    title.textContent = 'Confirm Action';
    title.style.marginTop = '0';
    title.style.textAlign = 'center';
    panel.appendChild(title);
    
    // Message content
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.textAlign = 'center';
    messageElement.style.margin = '20px 0';
    panel.appendChild(messageElement);
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    `;
    
    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
        padding: 8px 16px;
        background-color: #f1f1f1;
        color: #333;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        flex: 1;
        margin-right: 10px;
    `;
    cancelButton.onclick = () => {
        document.body.removeChild(modal);
        if (cancelCallback) {
            cancelCallback();
        }
    };
    buttonContainer.appendChild(cancelButton);
    
    // Confirm button
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.style.cssText = `
        padding: 8px 16px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        flex: 1;
        margin-left: 10px;
    `;
    confirmButton.onclick = () => {
        document.body.removeChild(modal);
        if (confirmCallback) {
            confirmCallback();
        }
    };
    buttonContainer.appendChild(confirmButton);
    
    panel.appendChild(buttonContainer);
    modal.appendChild(panel);
    document.body.appendChild(modal);
}

// 显示自定义警告对话框
function showCustomAlert(message) {
    // 创建设置面板背景
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
    
    // 创建设置面板
    const panel = document.createElement('div');
    panel.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        width: 80%;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    // 面板标题
    const title = document.createElement('h3');
    title.textContent = 'Information';
    title.style.marginTop = '0';
    title.style.textAlign = 'center';
    panel.appendChild(title);
    
    // 消息内容
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.textAlign = 'center';
    messageElement.style.margin = '20px 0';
    panel.appendChild(messageElement);
    
    // 按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: center;
        margin-top: 20px;
    `;
    
    // 确认按钮
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.style.cssText = `
        padding: 8px 16px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    confirmButton.onclick = () => {
        document.body.removeChild(modal);
    };
    buttonContainer.appendChild(confirmButton);
    
    panel.appendChild(buttonContainer);
    modal.appendChild(panel);
    document.body.appendChild(modal);
}

// 使replaceEquipment函数全局可用
window.replaceEquipment = replaceEquipment;
window.showCustomConfirm = showCustomConfirm;

// Show equipment details
function showEquipmentDetail(type = 'Projection') {
    // Pause game timer
    gameData.timePaused = true;
    
    // Create equipment details modal
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
    
    // Create modal content
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
    title.textContent = `${type} Equipment Details`;
    title.style.marginTop = '0';
    modalContent.appendChild(title);
    
    // Select equipment list by type
    let equipmentTypes = [];
    if (type === 'Venue') {
        equipmentTypes = [
            { name: 'Game Console', income: 500, electricity: 100, limit: { convenience: 10, premium: 20, flagship: 50, super: 100 } },
            { name: 'Claw Machine', income: 300, electricity: 50, limit: { convenience: 10, premium: 20, flagship: 50, super: 100 } },
            { name: 'KTV', income: 200, electricity: 100, limit: { convenience: 10, premium: 20, flagship: 50, super: 100 } }
        ];
    } else if (type === 'Projection') {
        // 只显示Projector
        equipmentTypes = [
            { name: 'Projector', income: 0, electricity: 200, limit: { convenience: 3, premium: 5, flagship: 8, super: 12 } }
        ];
    }
    
    // 计算店铺数量和等级
    let shopStats = {
        convenience: 0,
        premium: 0,
        flagship: 0,
        super: 0
    };
    
    // Headquarter defaults to convenience store
    shopStats.convenience = 1;
    
    // 计算分店
    if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            if (shop.level && shopStats.hasOwnProperty(shop.level)) {
                shopStats[shop.level]++;
            }
        });
    }
    
    // Calculate max count for each equipment（总上限就是单种上限）
    function getMaxEquipmentCount(equipmentType) {
        let totalMaxCount = 0;
        for (let level in shopStats) {
            totalMaxCount += shopStats[level] * equipmentType.limit[level];
        }
        return totalMaxCount;
    }
    
    // Get current equipment count（从gameData中获取，默认0）
    function getCurrentEquipmentCount(equipmentType) {
        return gameData.equipment && gameData.equipment[equipmentType.name] ? gameData.equipment[equipmentType.name] : 0;
    }
    
    // Calculate total equipment count and asset value
    let totalCurrentEquipment = 0;
    let totalAssetValue = 0;
    
    // First calculate total equipment count and asset value
    if (type === '放映') {
        // Calculate total asset value for projection equipment
        const batches = gameData.equipmentBatches && gameData.equipmentBatches['Projector'] ? gameData.equipmentBatches['Projector'] : [];
        if (batches.length > 0) {
            batches.forEach(batch => {
                const initialValue = 200000; // 初始设备价值（开店值）
                const tenYearValue = initialValue * (batch.count / 3); // 按3设备计算比例
                const depreciationRate = 0.1; // 年折旧率10%
                const yearsUsed = gameData.date.year - batch.year + 1;
                const currentValue = Math.max(0, tenYearValue * (1 - depreciationRate * yearsUsed));
                totalAssetValue += currentValue;
                totalCurrentEquipment += batch.count;
            });
        } else {
            // 如果没有批次信息，使用默认计算
            const currentCount = getCurrentEquipmentCount({ name: 'Projector' });
            const initialValue = 200000; // 初始设备价值（开店值）
            const tenYearValue = initialValue * (currentCount / 3); // 按3设备计算比例
            const depreciationRate = 0.1; // 年折旧率10%
            const yearsUsed = gameData.date.year;
            totalAssetValue = Math.max(0, tenYearValue * (1 - depreciationRate * yearsUsed));
            totalCurrentEquipment = currentCount;
        }
    } else {
        // 其他设备类型的总租金收入和总电费
        let totalRentIncome = 0;
        let totalElectricity = 0;
        equipmentTypes.forEach(equipmentType => {
            const currentCount = getCurrentEquipmentCount(equipmentType);
            totalRentIncome += currentCount * equipmentType.income;
            totalElectricity += currentCount * equipmentType.electricity;
            totalCurrentEquipment += currentCount;
        });
    }
    

    
    // 显示设备类型
    equipmentTypes.forEach(equipmentType => {
        if (type === '放映' && equipmentType.name === 'Projector') {
            // 按批次显示Projector
            const batches = gameData.equipmentBatches && gameData.equipmentBatches['Projector'] ? gameData.equipmentBatches['Projector'] : [];
            
            if (batches.length > 0) {
                // 按年份排序，最老的批次显示在前面
                const sortedBatches = [...batches].sort((a, b) => a.year - b.year);
                
                sortedBatches.forEach(batch => {
                    const equipmentItem = document.createElement('div');
                    
                    // 计算使用年限
                    const yearsUsed = gameData.date.year - batch.year + 1;
                    
                    // 根据使用年限设置不同的样式
                    let borderColor = '#4caf50'; // 默认绿色
                    let bgColor = '#f5f5f5';
                    
                    if (yearsUsed >= 8 && yearsUsed < 10) {
                        borderColor = '#ff9800'; // 橙色，接近更换
                        bgColor = '#fff3e0';
                    } else if (yearsUsed >= 10) {
                        borderColor = '#f44336'; // 红色，需要更换
                        bgColor = '#ffebee';
                    }
                    
                    equipmentItem.style.cssText = `
                        padding: 15px;
                        margin: 10px 0;
                        border-radius: 4px;
                        background-color: ${bgColor};
                        border-left: 4px solid ${borderColor};
                    `;
                    
                    // 计算资产值（按开店值计算，十年寿命折算）
                    const initialValue = 200000; // 初始设备价值（开店值）
                    const tenYearValue = initialValue * (batch.count / 3); // 按3设备计算比例
                    const depreciationRate = 0.1; // 年折旧率10%
                    const currentValue = Math.max(0, tenYearValue * (1 - depreciationRate * yearsUsed));
                    
                    // 构建显示内容（单行显示，不显示批次信息）
                    let content = `${yearsUsed}年，${batch.count}，¥${Math.round(currentValue).toLocaleString()}`;
                    
                    // 如果使用年限达到10年，显示更换提示和更换按钮
                    if (yearsUsed >= 10) {
                        content += ` <span style="color: #f44336; font-weight: bold;">⚠️</span> <button onclick="replaceEquipment(${batch.year}, ${batch.count * 50000})" style="margin-left: 10px; padding: 3px 8px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">更换</button>`;
                    } else if (yearsUsed >= 8) {
                        // 接近更换的设备也显示更换按钮
                        content += ` <button onclick="replaceEquipment(${batch.year}, ${batch.count * 50000})" style="margin-left: 10px; padding: 3px 8px; background-color: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">更换</button>`;
                    }
                    
                    equipmentItem.innerHTML = content;
                    
                    modalContent.appendChild(equipmentItem);
                });
            } else {
                // 如果没有批次信息，显示默认信息
                const equipmentItem = document.createElement('div');
                equipmentItem.style.cssText = `
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 4px;
                    background-color: #f5f5f5;
                    border-left: 4px solid #4caf50;
                `;
                
                const maxCount = getMaxEquipmentCount(equipmentType);
                const currentCount = getCurrentEquipmentCount(equipmentType);
                
                // 计算资产值（按开店值计算，十年寿命折算）
                const initialValue = 200000; // 初始设备价值（开店值）
                const tenYearValue = initialValue * (currentCount / 3); // 按3设备计算比例
                const depreciationRate = 0.1; // 年折旧率10%
                const yearsUsed = gameData.date.year;
                const currentValue = Math.max(0, tenYearValue * (1 - depreciationRate * yearsUsed));
                
                equipmentItem.innerHTML = `
                    <strong>${equipmentType.name}</strong>
                    <br>
数量：${currentCount} | 资产值：¥${Math.round(currentValue).toLocaleString()}
                `;
                
                modalContent.appendChild(equipmentItem);
            }
        } else {
            // 其他设备类型保持原显示方式
            const equipmentItem = document.createElement('div');
            equipmentItem.style.cssText = `
                padding: 15px;
                margin: 10px 0;
                border-radius: 4px;
                background-color: #f5f5f5;
                border-left: 4px solid #4caf50;
            `;
            
            const maxCount = getMaxEquipmentCount(equipmentType);
            const currentCount = getCurrentEquipmentCount(equipmentType);
            const yearlyIncome = equipmentType.income * 12;
            const yearlyElectricity = equipmentType.electricity * 12;
            const yearlyProfit = yearlyIncome - yearlyElectricity;
            
            equipmentItem.innerHTML = `
                <strong>${equipmentType.name}</strong>
                <br>
Monthly Rent Income：¥${equipmentType.income} | Monthly Electricity：¥${equipmentType.electricity} | Yearly Profit：¥${yearlyProfit} | Current Count：${currentCount}
            `;
            
            modalContent.appendChild(equipmentItem);
        }
    });
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
        margin-top: 20px;
        padding: 8px 16px;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    closeButton.onclick = () => {
        document.body.removeChild(modal);
        // 恢复游戏计时
        gameData.timePaused = false;
        // 恢复沙漏动画
        const hourglass = document.querySelector('.hourglass');
        if (hourglass) {
            hourglass.classList.remove('paused');
        }
    };
    modalContent.appendChild(closeButton);
    
    // 添加到弹窗
    modal.appendChild(modalContent);
    
    // 添加到页面
    document.body.appendChild(modal);
}

// 跳转到下一个月
function skipMonth() {
    // 跳过30天
    for (let i = 0; i < 30; i++) {
        simulateDay();
    }
}

// 跳转到下一年
function skipYear() {
    // 跳过365天
    for (let i = 0; i < 365; i++) {
        simulateDay();
    }
}

// Bankruptcy messages list
const bankruptcyMessages = [
    'You\'re a business genius! Survived for {days} days with limited funds, I give you full marks',
    'Amazing talent! Persisted for {days} days in such harsh conditions, I would have quit already',
    'Impressive! Managed to last {days} days with this startup capital, your management skills are undeniable',
    'Are you playing an extreme challenge? Lasted {days} days, I salute you',
    'A business legend! Created a {days}-day management myth with minimal resources',
    'Oh my! With this capital you survived {days} days, you\'re wasted not being on Wall Street',
    'Awesome! Even bankruptcy has technical content, a full {days} days of persistence',
    'I\'m kneeling for this operation! Played for {days} days with so little money, you really know how to budget',
    'You\'re the real management master! Probed the edge of bankruptcy for {days} days',
    'The legendary money-saving expert! Check out this {days}-day management record',
    'Worshipping the big shot! Exchanged minimal investment for {days} days of brilliant management',
    'This isn\'t bankruptcy, it\'s a management art performance! Lasted a full {days} days',
    'Are you challenging human limits? Actually persisted for {days} days, I\'m convinced',
    'Business prodigy is you! Played {days} days of brilliance with this money',
    'I declare you the benchmark of bankruptcy! No one can break your {days}-day record',
    'Simply a miracle in management! A {days}-day survival record, I\'ll write it in my notebook',
    'You\'re the real cost control master! {days} days of management proves everything',
    'Even bankruptcy is so dignified, {days} days of persistence is enough to write into textbooks',
    'Convinced! With so little money you played for {days} days, I\'m completely in awe',
    'You\'re the real business genius! Exchanged minimal investment for {days} days of brilliance'
];

// Show bankruptcy modal
function showBankruptcyModal() {
    // Pause game timer
    gameData.timePaused = true;
    
    // Pause hourglass animation
    const hourglass = document.querySelector('.hourglass');
    if (hourglass) {
        hourglass.classList.add('paused');
    }
    
    const modal = document.getElementById('bankruptcy-modal');
    if (!modal) return;
    
    // Increase bankruptcy count
    gameData.bankruptcy.count++;
    
    // Check bankruptcy achievements
    checkBankruptcyAchievements();
    
    // Randomly select a bankruptcy message
    const randomMessage = bankruptcyMessages[Math.floor(Math.random() * bankruptcyMessages.length)];
    const days = gameData.expenseCounters.days;
    const formattedMessage = randomMessage.replace('{days}', days);
    
    // Fill bankruptcy information (only keep existing elements)
    document.getElementById('bankruptcy-message').textContent = formattedMessage;
    document.getElementById('bankruptcy-debt').textContent = formatAssets(Math.abs(gameData.money));
    
    // Add 100,000 startup capital for each bankruptcy
    gameData.money = 500000 + (gameData.bankruptcy.count - 1) * 100000;
    
    // Show modal
    modal.style.display = 'flex';
}

// Check bankruptcy achievements
function checkBankruptcyAchievements() {
    const count = gameData.bankruptcy.count;
    const achievements = gameData.bankruptcy.achievements;
    
    // Check if new achievement is reached
    if (count === 1 && !achievements.includes('Bankruptcy Rookie')) {
        achievements.push('Bankruptcy Rookie');
    } else if (count === 5 && !achievements.includes('Bankruptcy Regular')) {
        achievements.push('Bankruptcy Regular');
    } else if (count === 10 && !achievements.includes('Bankruptcy Expert')) {
        achievements.push('Bankruptcy Expert');
    } else if (count === 20 && !achievements.includes('Bankruptcy Master')) {
        achievements.push('Bankruptcy Master');
    } else if (count === 50 && !achievements.includes('Bankruptcy Legend')) {
        achievements.push('Bankruptcy Legend');
    } else if (count === 100 && !achievements.includes('Bankruptcy Myth')) {
        achievements.push('Bankruptcy Myth');
    }
}

// Show bankruptcy achievements
function showBankruptcyAchievements() {
    // Can add logic to display bankruptcy achievements here
    // For example, display on game over or achievements page
    console.log('破产次数:', gameData.bankruptcy.count);
    console.log('破产成就:', gameData.bankruptcy.achievements);
}

// Start new game
window.startNewGame = function() {
    // Reset game data
    resetGameData();
    
    // Hide bankruptcy modal
    const modal = document.getElementById('bankruptcy-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Generate random cinema name
    const randomCinemaName = generateCinemaName();
    
    // Directly show cinema name input modal, no dependency on external functions
    setTimeout(() => {
        // 获取DOM元素
        const inputElement = document.getElementById('cinema-name-input');
        const modalElement = document.getElementById('cinema-name-modal');
        
        if (inputElement && modalElement) {
            // Set random name to input box
            inputElement.value = randomCinemaName;
            
            // Show modal
            modalElement.style.display = 'flex';
        }
    }, 100); // 等待100毫秒，确保DOM元素已加载
}

// 导出模块
export {
    simulateDay,
    updateMovieReleaseDays,
    addNewMovies,
    showEvent,
    updateUI,
    generateMovieList,
    initializeDataCalculation,
    doPromotion,
    updatePromotionDisplay,
    updatePromotionButtonsStatus,
    updateNextMaintenanceDate,
    checkEquipment故障,
    updateMaintenanceCycle,
    updateMaintenanceBySlider,
    updateAirConditionerStatus,
    updateComplaintRate,
    checkComplaints,
    updateEquipmentDisplay,
    showEquipmentDetail,
    replaceEquipment,
    showXenonLampDetail,
    replaceXenonLamp,
    showBankruptcyModal,
    checkBankruptcyAchievements,
    showBankruptcyAchievements,
    skipMonth,
    skipYear
};
