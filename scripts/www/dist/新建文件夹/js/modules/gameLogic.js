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

// 星期几
const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

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

// 宣传方式数据
const promotionData = {
    flyer: {
        name: '传单宣传',
        cost: 1000,
        minPopularity: 90,
        maxPopularity: 110
    },
    newspaper: {
        name: '报纸广告',
        cost: 10000,
        minPopularity: 1800,
        maxPopularity: 2200
    },
    online: {
        name: '网络营销',
        cost: 100000,
        minPopularity: 36000,
        maxPopularity: 44000
    },
    tv: {
        name: '电视台广告',
        cost: 1000000,
        minPopularity: 720000,
        maxPopularity: 880000
    },
    megaStar: {
        name: '超级明星代言',
        cost: 10000000,
        minPopularity: 14400000,
        maxPopularity: 17600000
    },
    tournament: {
        name: '赛事赞助',
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
    
    executePromotion(promotionType, promotion);
}

function closeAdModal() {
    const adModal = document.getElementById('ad-modal');
    if (adModal) {
        adModal.classList.remove('show');
    }
    
    closeModal();
}

window.closeAdModal = closeAdModal;

// 执行宣传的具体逻辑
function executePromotion(promotionType, promotion) {
    // 扣除费用
    gameData.money -= promotion.cost;

    // 随机增加知名度
    const popularityGain = Math.floor(promotion.minPopularity + Math.random() * (promotion.maxPopularity - promotion.minPopularity + 1));
    gameData.popularity += popularityGain;

    // 更新宣传记录
    gameData.promotions.todayPromotionCount++;
    gameData.promotions.monthlyPromotionCount++;
    gameData.promotions.totalPromotionCost += promotion.cost;
    gameData.monthlyPromotionCost += promotion.cost;
    gameData.promotions.totalPopularityGained += popularityGain;
    
    // 更新数据计算
    initializeDataCalculation();
    
    // 更新UI
    updateUI();
    updatePromotionDisplay();
    
    // 显示宣传效果
    showNotification(`宣传效果：${promotion.name}宣传成功，花费¥${formatAssets(promotion.cost)}`);
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

// 更新维护周期
function updateMaintenanceCycle(cycle) {
    gameData.maintenance.cycle = cycle;
    
    // 基于当前游戏日期重新计算下一次维护日期
    gameData.maintenance.nextMaintenanceDate = {...gameData.date};
    updateNextMaintenanceDate();
    
    // 显示通知
    const cycleText = {
        weekly: '周',
        monthly: '月',
        quarterly: '季',
        yearly: '年'
    }[cycle];
    showNotification(`维护周期已更新为${cycleText}维护`);
    
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

// 更新空调状态
function updateAirConditionerStatus(status) {
    const statusNum = parseInt(status);
    gameData.airConditioner.status = statusNum;
    
    // 更新客诉率
    updateComplaintRate();
    
    // 显示通知
    const statusText = {
        0: '不开',
        1: '半开',
        2: '全开'
    }[statusNum];
    
    // 计算总店铺数量
    const totalShops = (gameData.shops ? gameData.shops.length : 0) + 1; // 加1包含总店
    
    // 计算电费变化
    const baseElectricity = gameData.expenses.monthlyUtilities * totalShops;
    const airConditionerElectricityRate = gameData.airConditioner.electricityRates[statusNum];
    const additionalElectricity = Math.floor(baseElectricity * airConditionerElectricityRate);
    const totalElectricity = baseElectricity + additionalElectricity;
    
    showNotification(`空调状态已更新为${statusText}，月度电费：¥${formatAssets(totalElectricity)}`);
    
    updateEquipmentDisplay();
}

// 更新客诉率
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

// 更新宣传页面显示
function updatePromotionDisplay() {
    const todayCountElement = document.getElementById('today-promotion-count');
    if (todayCountElement) {
        todayCountElement.textContent = gameData.promotions.todayPromotionCount;
    }
    
    const monthlyCountElement = document.getElementById('monthly-promotion-count');
    if (monthlyCountElement) {
        monthlyCountElement.textContent = gameData.promotions.monthlyPromotionCount;
    }
    
    const totalCostElement = document.getElementById('total-promotion-cost');
    if (totalCostElement) {
        totalCostElement.textContent = '¥' + formatAssets(gameData.promotions.totalPromotionCost);
    }
    
    const totalPopularityElement = document.getElementById('total-popularity-gained');
    if (totalPopularityElement) {
        totalPopularityElement.textContent = gameData.promotions.totalPopularityGained;
    }
    
    updatePromotionButtonsStatus();
}

// 更新设备页面显示
function updateEquipmentDisplay() {
    // 计算店铺数量（包括总店）
    const totalShops = gameData.shopCount || 1;
    
    // 计算设备数量
    // 放映设备：根据厅数计算，每个厅 1 台放映设备
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
    const projectorCount = totalHalls; // 每个厅 1 台放映设备
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
    
    // 更新维护频率显示
    const maintenanceFrequencyElement = document.getElementById('maintenance-frequency');
    if (maintenanceFrequencyElement) {
        const cycleText = {
            weekly: '周维护',
            monthly: '月维护',
            quarterly: '季维护',
            yearly: '年维护'
        };
        maintenanceFrequencyElement.textContent = cycleText[gameData.maintenance.cycle] || '月维护';
    }
    
    // 更新下次维护日期
    const nextMaintenanceElement = document.getElementById('next-maintenance');
    if (nextMaintenanceElement) {
        const date = gameData.maintenance.nextMaintenanceDate;
        nextMaintenanceElement.textContent = `${date.year}年${date.month}月${date.day}日`;
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
    
    // 更新空调状态显示
    const airConditionerStatusElement = document.getElementById('air-conditioner-status');
    if (airConditionerStatusElement) {
        const statusText = {
            0: '不开',
            1: '半开',
            2: '全开'
        };
        airConditionerStatusElement.textContent = statusText[gameData.airConditioner.status];
    }
    
    // 更新客诉率显示
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
        
        // 计算场地设备电费并计入基础电费
        const equipmentTypes = [
            { name: '游戏机', electricity: 100 },
            { name: '娃娃机', electricity: 50 },
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
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    // 创建设备明细弹窗
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
    title.textContent = '氙灯明细';
    title.style.marginTop = '0';
    modalContent.appendChild(title);
    
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
    
    // 关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
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
    showNotification(`氙灯更换：成功更换第${batch}批次的氙灯，花费¥${formatAssets(cost)}`);
    
    // 重新显示氙灯明细
    showXenonLampDetail();
}

// 初始化数据计算
// 计算合作收入
function calculateCooperationIncome() {
    // 重置合作收入
    gameData.cooperation.monthlyIncome = 0;
    gameData.cooperation.activeCooperations = [];
    
    // 计算场地设备的月收入
    if (gameData.equipment) {
        const equipmentTypes = [
            { name: '游戏机', income: 500 },
            { name: '娃娃机', income: 300 },
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

// 显示月度收支明细弹窗
function showMonthlyReportModal(monthlyRecord) {
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    // 创建设弹窗
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
        max-width: 800px;
        max-height: 80%;
        overflow-y: auto;
    `;
    
    // 弹窗标题
    const title = document.createElement('h3');
    title.textContent = `${monthlyRecord.year}年${monthlyRecord.month}月收支明细`;
    title.style.marginTop = '0';
    modalContent.appendChild(title);
    
    // 收支明细表格
    const table = document.createElement('table');
    table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
    `;
    
    // 表格内容
    table.innerHTML = `
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">项目</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">金额（¥）</th>
            </tr>
        </thead>
        <tbody>
            <tr style="background-color: #e3f2fd;">
                <td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">收入</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">票房收入</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.revenue.boxOffice)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">卖品收入</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.revenue.product)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">合作收入</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.revenue.cooperation)}</td>
            </tr>
            <tr style="font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px;">总收入</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.revenue.total)}</td>
            </tr>
            <tr style="background-color: #ffebee;">
                <td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">支出</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">水电费</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.utilities)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">人员工资</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.salaries)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">票房分账</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.revenueShare)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">进货支出</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.purchase || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">维护支出</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.maintenance || 0)}</td>
            </tr>

            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">宣传费用</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.promotion || 0)}</td>
            </tr>
            <tr style="font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px;">总支出</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(monthlyRecord.expense.total)}</td>
            </tr>
            <tr style="background-color: #e8f5e8; font-weight: bold; font-size: 16px;">
                <td style="border: 1px solid #ddd; padding: 12px;">月度净利润</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right; color: ${monthlyRecord.profit >= 0 ? '#4caf50' : '#f44336'};">
                    ${monthlyRecord.profit >= 0 ? '+' : ''}${formatAssets(monthlyRecord.profit)}
                </td>
            </tr>
        </tbody>
    `;
    
    modalContent.appendChild(table);
    
    // 关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
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

// 显示年度收支明细弹窗
function showAnnualReportModal(annualRecord) {
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    // 创建设弹窗
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
        max-width: 800px;
        max-height: 80%;
        overflow-y: auto;
    `;
    
    // 弹窗标题
    const title = document.createElement('h3');
    title.textContent = `${annualRecord.year}年度收支明细`;
    title.style.marginTop = '0';
    modalContent.appendChild(title);
    
    // 收支明细表格
    const table = document.createElement('table');
    table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
    `;
    
    // 表格内容
    table.innerHTML = `
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">项目</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">金额（¥）</th>
            </tr>
        </thead>
        <tbody>
            <tr style="background-color: #e3f2fd;">
                <td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">收入</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">票房收入</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.revenue.boxOffice || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">卖品收入</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.revenue.product || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">合作收入</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.revenue.cooperation || 0)}</td>
            </tr>
            <tr style="font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px;">年度总收入</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.revenue.total || 0)}</td>
            </tr>
            <tr style="background-color: #ffebee;">
                <td colspan="2" style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">支出</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">水电费</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.expense.utilities || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">人员工资</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.expense.salaries || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">票房分账</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.expense.revenueShare || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">宣传费用</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatAssets(annualRecord.expense.promotion || 0)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">维护支出</td>
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
                <td style="border: 1px solid #ddd; padding: 12px;">年度净利润</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right; color: ${annualRecord.profit >= 0 ? '#4caf50' : '#f44336'};">
                    ${annualRecord.profit >= 0 ? '+' : ''}${formatAssets(annualRecord.profit)}
                </td>
            </tr>
        </tbody>
    `;
    
    modalContent.appendChild(table);
    
    // 关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
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
            notificationContent.innerHTML = `<span>设备维护：已完成${cycleText}维护，花费¥${formatAssets(maintenanceCost)}，故障率降低</span>`;
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
            notificationContent.innerHTML = `<span>设备折旧：已折旧¥${formatAssets(depreciationAmount)}，当前设备价值¥${formatAssets(gameData.equipment.currentValue)}</span>`;
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
            // 计算总店铺数量
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
        const monthlyBoxOffice = gameData.weekBoxOffice; // 使用周票房作为月度票房近似值
        const filmStudioShare = Math.floor(monthlyBoxOffice * 0.39); // 片方分账39%
        const cinemaChainShare = isCinemaChain ? 0 : Math.floor(monthlyBoxOffice * 0.05); // 院线分成5%（成立院线后删除此项）
        const fundShare = Math.floor(monthlyBoxOffice * 0.083); // 8.3%上缴基金
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
        
        // 显示年度收支明细弹窗
        showAnnualReportModal(annualRecord);
        
        // 显示年度支出通知
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>年度支出：已扣除租金¥${formatAssets(totalAnnualRent)}</span>`;
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
    
    // 计算到店人数：根据星期、节日和档期的倍数
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
    
    // 根据档期调整倍数
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
            notificationContent.innerHTML = `<span>缺货报警：${outOfStockProducts.join('、')}已缺货，请及时补货！</span>`;
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
    
    // 按档期倍数调整大盘倍数
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
        // 检查欢迎页面是否已关闭（通过检查游戏是否已开始）
        const hasSavedGame = localStorage.getItem('hasSavedGame');
        if (gameData.promotionReminderEnabled && gameData.date.year === 1 && hasSavedGame) {
            const currentWeek = Math.floor(gameData.expenseCounters.days / 7);
            if (currentWeek !== gameData.lastPromotionReminderWeek) {
                gameData.lastPromotionReminderWeek = currentWeek;
                showNotification('提示：记得进行宣传活动以扩大知名度！');
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
            notificationContent.innerHTML = '<span>排片提醒：当前没有排片，请尽快添加电影到排片中！</span>';
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
    // 检查 shopRanges 中的店铺
    if (gameData.shopRanges && gameData.shopRanges.length > 0) {
        gameData.shopRanges.forEach(range => {
            if (range.status === '建设中' && gameData.expenseCounters.days >= range.openingDay) {
                range.status = '营业中';
                
                // 显示店铺开业通知
                const notificationContent = document.getElementById('notification-content');
                if (notificationContent) {
                    notificationContent.innerHTML = `<span>${getShopLevelName(range.level)}：${range.count}家店铺已正式开业！</span>`;
                    checkScrollNeeded();
                    
                    setTimeout(() => {
                        notificationContent.innerHTML = '';
                        checkScrollNeeded();
                    }, 3000);
                }
            }
        });
    }
    
    // 检查 shops 中的店铺（兼容旧数据）
    if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            if (shop.status === '建设中' && gameData.expenseCounters.days >= shop.openingDay) {
                shop.status = '营业中';
                
                // 显示店铺开业通知
                const notificationContent = document.getElementById('notification-content');
                if (notificationContent) {
                    notificationContent.innerHTML = `<span>${shop.name}：已正式开业！</span>`;
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
                // 收入类型合作
                { name: '场地设备', type: 'income', basePrice: 5000, probability: 0.1 },
                { name: '映前广告', type: 'income', basePrice: 2000, probability: 0.3 },
                { name: '影厅冠名', type: 'income', basePrice: 10000, probability: 0.15 },
                { name: '企业包场', type: 'income', basePrice: 20000, probability: 0.25 },
                { name: '私人包场', type: 'income', basePrice: 3000, probability: 0.3 },
                { name: '明星见面会', type: 'income', basePrice: 100000, probability: 0.1 }
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
                    // 生成咨询方名称
                    let consultantName;
                    if (randomCooperation.name === '私人包场') {
                        // 生成人物名称（姓氏+先生/女士）
                        const lastName = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'][Math.floor(Math.random() * 10)];
                        const gender = Math.random() > 0.5 ? '先生' : '女士';
                        consultantName = lastName + gender;
                    } else {
                        // 生成虚拟公司名称
                        const virtualPrefixes = ['星云', '银河', '未来', '创新', '科技', '梦幻', '星际', '环球', '宇宙', '无限', '量子', '数字', '智慧', '智能', '卓越', '精英', '先锋', '领袖', '王者', '传奇'];
                        const companyNames = ['科技', '传媒', '文化', '娱乐', '投资', '影视', '广告', '创意', '网络', '数字'];
                        const prefix = virtualPrefixes[Math.floor(Math.random() * virtualPrefixes.length)];
                        const companyName = companyNames[Math.floor(Math.random() * companyNames.length)];
                        consultantName = prefix + companyName + '公司';
                    }
                    notificationContent.innerHTML = `<span>合作机会：${consultantName}咨询${randomCooperation.name}合作事宜，基础收入¥${formatAssets(randomCooperation.basePrice)}</span>`;
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
                    notificationContent.innerHTML = `<span>电影下映：《${movie.name}》已下映</span>`;
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
                notificationContent.innerHTML = `<span>新片上映：今日上映${movieCount}部新片</span>`;
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



// 根据月份获取合理的档期
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

// 检查档期事件
function checkScheduleEvent() {
    const year = gameData.date.year;
    const month = gameData.date.month;
    const day = gameData.date.day;
    
    // 检查是否在档期内
    let currentSchedule = '';
    
    // 寒假档：1月1号-2月28号
    if ((month === 1 && day >= 1) || (month === 2 && day <= 28)) {
        currentSchedule = '寒假档';
    }
    // 暑期档：6月1号-8月31号
    else if ((month === 6 && day >= 1) || (month === 7 && day >= 1) || (month === 8 && day <= 31)) {
        currentSchedule = '暑期档';
    }
    
    // 更新档期状态
    if (currentSchedule !== gameData.currentSchedule) {
        if (currentSchedule) {
            // 档期开始
            gameData.currentSchedule = currentSchedule;
            
            // 显示档期开始通知
            const notificationContent = document.getElementById('notification-content');
            if (notificationContent) {
                notificationContent.innerHTML = `<span>档期通知：${currentSchedule}开始了！建议调整排片策略。</span>`;
                checkScrollNeeded();
                
                // 3秒后恢复默认内容
                setTimeout(() => {
                    notificationContent.innerHTML = '';
                    checkScrollNeeded();
                }, 3000);
            }
        } else {
            // 档期结束
            if (gameData.currentSchedule) {
                gameData.currentSchedule = '';
                
                // 显示档期结束通知
                const notificationContent = document.getElementById('notification-content');
                if (notificationContent) {
                    notificationContent.innerHTML = '<span>档期通知：当前档期已结束。</span>';
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

// 更新UI
function updateUI() {
    // 检查是否触发档期事件
    checkScheduleEvent();
    
    // 更新游戏内时间显示
    const gameDateElement = document.getElementById('game-date');
    if (gameDateElement) {
        // 获取当前星期
        const currentWeekDay = weekDays[gameData.weekDay];
        // 构建日期显示文本
        let dateText = `${gameData.date.year}年${gameData.date.month}月${gameData.date.day}日 ${currentWeekDay}`;
        // 如果有档期，添加档期信息
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
        totalAssetsElement.textContent = `${displayName}${shopText} | 总资产：¥${formatAssets(gameData.money)}`;
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
        const shopCount = (gameData.shops ? gameData.shops.length : 0) + 1; // 加1包含总店
        const isCinemaChain = shopCount > 100;
        shopTabBtn.textContent = isCinemaChain ? '院线' : '店铺';
    }
    
    // 更新按钮状态

    
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
    
    // 更新场地设备数量显示
    const currentEquipmentCountElement = document.getElementById('current-equipment-count');
    const maxEquipmentCountElement = document.getElementById('max-equipment-count');
    if (currentEquipmentCountElement && maxEquipmentCountElement) {
        // 计算总设备数量
        let totalCurrentEquipment = 0;
        
        // 设备类型
        const equipmentTypes = ['游戏机', '娃娃机', 'KTV'];
        
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
        
        // 更新场地设备按钮状态
        const equipmentButton = document.querySelector('.cooperation-item[onclick="openEquipmentQuantityModal()"]');
        if (equipmentButton) {
            // 首先检查是否有合作机会
            const hasOpportunity = !!gameData.cooperationOpportunities['场地设备'];
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
    const totalStock = gameData.products.reduce((sum, product) => sum + product.stock, 0);
    
    // 更新总库存和缺货商品显示
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
                outOfStockElement.textContent = '库存预警';
                outOfStockElement.style.color = 'red';
            } else {
                outOfStockElement.textContent = '无';
                outOfStockElement.style.color = 'black';
            }
        }
    }
    
    // 更新库存上限显示
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
        let totalStaff = 3 * workSchedule; // 总店 3 人，乘以班制数
        // 检查 shopRanges（新格式）
        if (gameData.shopRanges && gameData.shopRanges.length > 0) {
            gameData.shopRanges.forEach(range => {
                const shopDataInfo = shopData[range.level];
                if (shopDataInfo) {
                    totalStaff += shopDataInfo.staff.standard * range.count * workSchedule;
                }
            });
        } else if (gameData.shops && gameData.shops.length > 0) {
            // 兼容旧格式
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
        
        // 分账比例
        let filmStudioShare = 39;
        let cinemaChainShare = 5;
        let fundShare = 8.3;
        
        // 如果是院线，删除院线分成
        if (isCinemaChain) {
            cinemaChainShare = 0;
        }
        
        // 计算影院实际收入比例
        const cinemaActualShare = 100 - filmStudioShare - cinemaChainShare - fundShare;
        
        // 更新显示
        filmStudioSharingElement.textContent = filmStudioShare + '%';
        cinemaChainSharingElement.textContent = cinemaChainShare + '%';
        fundSharingElement.textContent = fundShare + '%';
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
                // 场地设备按钮需要专门检查"场地设备"合作机会
                const isAvailable = !!gameData.cooperationOpportunities['场地设备'];
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
    

    
    // 更新血条和UI
    if (window.updateStaffBloodBar) {
        window.updateStaffBloodBar(newStaffLevel);
    }
    updateUI();
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
                    <p>类型：${movie.type}</p>

                    <p>档位：${tierText}</p>
                    <p>排片占比：${movie.schedule}%</p>
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
                    // 获取电影信息
                    const movieType = currentMovie.type;
                    const tierText = currentMovie.tier === 1 ? '1档' : currentMovie.tier === 2 ? '2档' : '3档';
                    // 更新电影信息文本
                    scheduleText.textContent = `${movieType}片，${tierText}，${currentValue}%`;
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
                                    // 获取电影信息
                                    const movieType = movie.type;
                                    const tierText = movie.tier === 1 ? '1档' : movie.tier === 2 ? '2档' : '3档';
                                    // 更新电影信息文本
                                    otherScheduleText.textContent = `${movieType}片，${tierText}，${allocation}%`;
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
                            
                            // 更新排片文本
                            const otherMovieItem = firstSlider.closest('.movie-item');
                            const otherScheduleText = otherMovieItem.querySelector('.movie-info p:last-child');
                            if (otherScheduleText) {
                                const movieType = firstOtherMovie.type;
                                const tierText = firstOtherMovie.tier === 1 ? '1档' : firstOtherMovie.tier === 2 ? '2档' : '3档';
                                // 更新电影信息文本
                                otherScheduleText.textContent = `${movieType}片，${tierText}，${newValue}%`;
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
    const batches = gameData.equipmentBatches && gameData.equipmentBatches['放映机'] ? gameData.equipmentBatches['放映机'] : [];
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
                notificationContent.innerHTML = `<span>设备更换：成功更换${batchYear}年的设备，花费¥${formatAssets(cost)}</span>`;
                checkScrollNeeded();
                
                setTimeout(() => {
                    notificationContent.innerHTML = '';
                    checkScrollNeeded();
                }, 3000);
            }
            
            // 重新显示设备明细
            showEquipmentDetail();
        }
        
        // 如果是强制更换，直接执行更换操作
        if (isForced) {
            performReplacement();
        } else {
            // 显示自定义确认对话框
            showCustomConfirm(`确定要更换${batchYear}年的设备吗？需要花费¥${formatAssets(cost)}`, performReplacement, () => {
                // 用户取消更换
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
    
    const batches = gameData.equipmentBatches && gameData.equipmentBatches['放映机'] ? gameData.equipmentBatches['放映机'] : [];
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
        
        // 强制弹窗，没有取消按钮
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
        title.textContent = '设备更换提醒';
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
    title.textContent = '确认操作';
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
        justify-content: space-between;
        margin-top: 20px;
    `;
    
    // 取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
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
    
    // 确认按钮
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '确认';
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
    title.textContent = '提示';
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
    confirmButton.textContent = '确定';
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

// 显示设备明细
function showEquipmentDetail(type = '放映') {
    // 暂停游戏计时
    gameData.timePaused = true;
    
    // 创建设备明细弹窗
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
    title.textContent = `${type}设备明细`;
    title.style.marginTop = '0';
    modalContent.appendChild(title);
    
    // 根据类型选择设备列表
    let equipmentTypes = [];
    if (type === '场地') {
        equipmentTypes = [
            { name: '游戏机', income: 500, electricity: 100, limit: { convenience: 10, premium: 20, flagship: 50, super: 100 } },
            { name: '娃娃机', income: 300, electricity: 50, limit: { convenience: 10, premium: 20, flagship: 50, super: 100 } },
            { name: 'KTV', income: 200, electricity: 100, limit: { convenience: 10, premium: 20, flagship: 50, super: 100 } }
        ];
    } else if (type === '放映') {
        // 只显示放映机
        equipmentTypes = [
            { name: '放映机', income: 0, electricity: 200, limit: { convenience: 3, premium: 5, flagship: 8, super: 12 } }
        ];
    }
    
    // 计算店铺数量和等级
    let shopStats = {
        convenience: 0,
        premium: 0,
        flagship: 0,
        super: 0
    };
    
    // 总店默认是便民店
    shopStats.convenience = 1;
    
    // 计算分店
    if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            if (shop.level && shopStats.hasOwnProperty(shop.level)) {
                shopStats[shop.level]++;
            }
        });
    }
    
    // 计算每种设备的最大数量（总上限就是单种上限）
    function getMaxEquipmentCount(equipmentType) {
        let totalMaxCount = 0;
        for (let level in shopStats) {
            totalMaxCount += shopStats[level] * equipmentType.limit[level];
        }
        return totalMaxCount;
    }
    
    // 获取当前设备数量（从gameData中获取，默认0）
    function getCurrentEquipmentCount(equipmentType) {
        return gameData.equipment && gameData.equipment[equipmentType.name] ? gameData.equipment[equipmentType.name] : 0;
    }
    
    // 计算总设备数量和总资产值
    let totalCurrentEquipment = 0;
    let totalAssetValue = 0;
    
    // 先计算总设备数量和总资产值
    if (type === '放映') {
        // 计算放映设备的总资产值
        const batches = gameData.equipmentBatches && gameData.equipmentBatches['放映机'] ? gameData.equipmentBatches['放映机'] : [];
        if (batches.length > 0) {
            batches.forEach(batch => {
                const initialValue = 200000; // 初始设备价值（开店值）
                const tenYearValue = initialValue * (batch.count / 3); // 按3台设备计算比例
                const depreciationRate = 0.1; // 年折旧率10%
                const yearsUsed = gameData.date.year - batch.year + 1;
                const currentValue = Math.max(0, tenYearValue * (1 - depreciationRate * yearsUsed));
                totalAssetValue += currentValue;
                totalCurrentEquipment += batch.count;
            });
        } else {
            // 如果没有批次信息，使用默认计算
            const currentCount = getCurrentEquipmentCount({ name: '放映机' });
            const initialValue = 200000; // 初始设备价值（开店值）
            const tenYearValue = initialValue * (currentCount / 3); // 按3台设备计算比例
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
        if (type === '放映' && equipmentType.name === '放映机') {
            // 按批次显示放映机
            const batches = gameData.equipmentBatches && gameData.equipmentBatches['放映机'] ? gameData.equipmentBatches['放映机'] : [];
            
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
                    const tenYearValue = initialValue * (batch.count / 3); // 按3台设备计算比例
                    const depreciationRate = 0.1; // 年折旧率10%
                    const currentValue = Math.max(0, tenYearValue * (1 - depreciationRate * yearsUsed));
                    
                    // 构建显示内容（单行显示，不显示批次信息）
                    let content = `${yearsUsed}年，${batch.count}台，¥${Math.round(currentValue).toLocaleString()}`;
                    
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
                const tenYearValue = initialValue * (currentCount / 3); // 按3台设备计算比例
                const depreciationRate = 0.1; // 年折旧率10%
                const yearsUsed = gameData.date.year;
                const currentValue = Math.max(0, tenYearValue * (1 - depreciationRate * yearsUsed));
                
                equipmentItem.innerHTML = `
                    <strong>${equipmentType.name}</strong>
                    <br>
数量：${currentCount}台 | 资产值：¥${Math.round(currentValue).toLocaleString()}
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
月租金收入：¥${equipmentType.income} | 月电费：¥${equipmentType.electricity} | 年利润：¥${yearlyProfit} | 当前数量：${currentCount}台
            `;
            
            modalContent.appendChild(equipmentItem);
        }
    });
    
    // 关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
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

// 破产话术列表
const bankruptcyMessages = [
    '你真是商业鬼才！居然用有限的资金撑了整整{days}天，这波操作我给满分',
    '天纵奇才啊！能在如此艰难的环境下坚持{days}天，换我早跑路了',
    '厉害厉害！就凭这点启动资金居然撑了{days}天，这经营能力不服不行',
    '你这是在玩极限挑战吗？居然坚持了{days}天，我敬你是条汉子',
    '商业传奇啊！用最少的资源创造了{days}天的经营神话',
    '我的天！就这点本钱能撑{days}天，你不去华尔街真是屈才了',
    '牛批！破产都破得这么有技术含量，整整{days}天的坚持',
    '这波操作我给跪了！居然用这点钱玩了{days}天，太会过日子了',
    '你才是真正的经营大师！在破产边缘疯狂试探了{days}天',
    '传说中的省钱小能手！{days}天的经营记录了解一下',
    '膜拜大佬！用最少的投入换来了{days}天的精彩经营',
    '这哪是破产啊，分明是经营艺术表演！持续了整整{days}天',
    '你这是在挑战人类极限吗？居然硬撑了{days}天，我服了',
    '商业奇才就是你！用这点钱玩出了{days}天的精彩',
    '我宣布你为破产界的标杆！坚持{days}天的纪录无人能破',
    '简直是经营界的奇迹！{days}天的生存记录，我要记到小本本上',
    '你才是真正的成本控制大师！{days}天的经营证明了一切',
    '破产都破得这么有面子，{days}天的坚持足以写入教科书',
    '服了服了！就这点钱居然玩了{days}天，在下佩服得五体投地',
    '你才是真正的商业天才！用最少的投入换来了{days}天的精彩'
];

// 显示破产弹窗
function showBankruptcyModal() {
    // 暂停游戏计时
    gameData.timePaused = true;
    
    // 暂停沙漏动画
    const hourglass = document.querySelector('.hourglass');
    if (hourglass) {
        hourglass.classList.add('paused');
    }
    
    const modal = document.getElementById('bankruptcy-modal');
    if (!modal) return;
    
    // 增加破产次数
    gameData.bankruptcy.count++;
    
    // 检查破产成就
    checkBankruptcyAchievements();
    
    // 随机选择一个破产话术
    const randomMessage = bankruptcyMessages[Math.floor(Math.random() * bankruptcyMessages.length)];
    const days = gameData.expenseCounters.days;
    const formattedMessage = randomMessage.replace('{days}', days);
    
    // 填充破产信息（只保留存在的元素）
    document.getElementById('bankruptcy-message').textContent = formattedMessage;
    document.getElementById('bankruptcy-debt').textContent = `¥${formatAssets(Math.abs(gameData.money))}`;
    
    // 每破产一次加10万启动资金
    gameData.money = 500000 + (gameData.bankruptcy.count - 1) * 100000;
    
    // 显示弹窗
    modal.style.display = 'flex';
}

// 检查破产成就
function checkBankruptcyAchievements() {
    const count = gameData.bankruptcy.count;
    const achievements = gameData.bankruptcy.achievements;
    
    // 检查是否达成新成就
    if (count === 1 && !achievements.includes('破产新秀')) {
        achievements.push('破产新秀');
    } else if (count === 5 && !achievements.includes('破产常客')) {
        achievements.push('破产常客');
    } else if (count === 10 && !achievements.includes('破产专业户')) {
        achievements.push('破产专业户');
    } else if (count === 20 && !achievements.includes('破产大师')) {
        achievements.push('破产大师');
    } else if (count === 50 && !achievements.includes('破产传奇')) {
        achievements.push('破产传奇');
    } else if (count === 100 && !achievements.includes('破产神话')) {
        achievements.push('破产神话');
    }
}

// 显示破产成就
function showBankruptcyAchievements() {
    // 这里可以添加显示破产成就的逻辑
    // 例如在游戏结束或成绩页面显示
    console.log('破产次数:', gameData.bankruptcy.count);
    console.log('破产成就:', gameData.bankruptcy.achievements);
}

// 开始新游戏
window.startNewGame = function() {
    // 重置游戏数据
    resetGameData();
    
    // 隐藏破产弹窗
    const modal = document.getElementById('bankruptcy-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // 生成随机影院名称
    const randomCinemaName = generateCinemaName();
    
    // 直接显示影院名称输入弹窗，不依赖外部函数
    setTimeout(() => {
        // 获取DOM元素
        const inputElement = document.getElementById('cinema-name-input');
        const modalElement = document.getElementById('cinema-name-modal');
        
        if (inputElement && modalElement) {
            // 设置随机名称到输入框
            inputElement.value = randomCinemaName;
            
            // 显示弹窗
            openModal();
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
    skipYear,
    openModal,
    closeModal
};
