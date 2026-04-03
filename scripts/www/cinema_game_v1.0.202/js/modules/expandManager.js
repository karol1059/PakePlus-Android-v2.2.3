// 扩张管理模块

import { gameData, formatAssets } from './gameData.js';
import { updateUI, openModal, closeModal } from './gameLogic.js';
import { checkScrollNeeded } from './uiManager.js';

// 店铺信息数据
const shopData = {
    convenience: {
        halls: 3,
        seats: 200,
        cost: 1000000,
        rent: 300000,
        equipment: 200000,
        people: 1,
        staff: {
            min: 3,
            low: 4,
            standard: 5,
            high: 6
        }
    },
    premium: {
        halls: 5,
        seats: 500,
        cost: 2000000,
        rent: 1000000,
        equipment: 500000,
        people: 5,
        staff: {
            min: 6,
            low: 8,
            standard: 10,
            high: 12
        }
    },
    flagship: {
        halls: 10,
        seats: 1000,
        cost: 5000000,
        rent: 3000000,
        equipment: 2000000,
        people: 20,
        staff: {
            min: 12,
            low: 16,
            standard: 20,
            high: 24
        }
    },
    super: {
        halls: 20,
        seats: 2000,
        cost: 20000000,
        rent: 10000000,
        equipment: 8000000,
        people: 100,
        staff: {
            min: 30,
            low: 40,
            standard: 50,
            high: 60
        }
    }
};

// 更新店铺信息
function updateShopInfo() {
    // 首先处理店铺等级相关的元素
    const shopLevelElement = document.getElementById('shop-level');
    if (shopLevelElement) {
        const shopLevel = shopLevelElement.value;
        const shop = shopData[shopLevel];
        
        // 检查元素是否存在
        const shopHallsElement = document.getElementById('shop-halls');
        const shopSeatsElement = document.getElementById('shop-seats');
        const shopCostElement = document.getElementById('shop-cost');
        const shopRentElement = document.getElementById('shop-rent');
        const shopEquipmentElement = document.getElementById('shop-equipment');
        
        if (shopHallsElement) shopHallsElement.textContent = shop.halls;
        if (shopSeatsElement) shopSeatsElement.textContent = shop.seats;
        if (shopCostElement) shopCostElement.textContent = formatAssets(shop.cost);
        if (shopRentElement) shopRentElement.textContent = formatAssets(shop.rent);
        if (shopEquipmentElement) shopEquipmentElement.textContent = formatAssets(shop.equipment);
    }
    
    // 获取当前班制
    const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    
    // 计算所有店铺的员工数量总和
    let totalMinStaff = 0;
    let totalLowStaff = 0;
    let totalStandardStaff = 0;
    let totalHighStaff = 0;
    
    // 计算总店的员工数量（默认是便民店）
    const mainShop = shopData.convenience;
    totalMinStaff += mainShop.staff.min;
    totalLowStaff += mainShop.staff.low;
    totalStandardStaff += mainShop.staff.standard;
    totalHighStaff += mainShop.staff.high;
    
    // 计算所有分店的员工数量
    if (gameData.shopRanges) {
        gameData.shopRanges.forEach(range => {
            const shopInfo = shopData[range.level] || shopData.convenience;
            totalMinStaff += shopInfo.staff.min * range.count;
            totalLowStaff += shopInfo.staff.low * range.count;
            totalStandardStaff += shopInfo.staff.standard * range.count;
            totalHighStaff += shopInfo.staff.high * range.count;
        });
    } else if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            const shopInfo = shopData[shop.level] || shopData.convenience;
            totalMinStaff += shopInfo.staff.min;
            totalLowStaff += shopInfo.staff.low;
            totalStandardStaff += shopInfo.staff.standard;
            totalHighStaff += shopInfo.staff.high;
        });
    }
    
    // 更新每个档位对应的人员数量（考虑班制）
    const minStaffCountElement = document.getElementById('min-staff-count');
    const lowStaffCountElement = document.getElementById('low-staff-count');
    const standardStaffCountElement = document.getElementById('standard-staff-count');
    const highStaffCountElement = document.getElementById('high-staff-count');
    
    if (minStaffCountElement) minStaffCountElement.textContent = totalMinStaff * workSchedule;
    if (lowStaffCountElement) lowStaffCountElement.textContent = totalLowStaff * workSchedule;
    if (standardStaffCountElement) standardStaffCountElement.textContent = totalStandardStaff * workSchedule;
    if (highStaffCountElement) highStaffCountElement.textContent = totalHighStaff * workSchedule;
    
    // 更新人员信息
    updateStaffInfo();
}

// 更新人员信息
function updateStaffInfo() {
    const shopLevelElement = document.getElementById('shop-level');
    const staffLevelElement = document.getElementById('staff-level');
    
    if (shopLevelElement && staffLevelElement) {
        const shopLevel = shopLevelElement.value;
        const staffLevel = parseInt(staffLevelElement.value);
        const shop = shopData[shopLevel];
        
        let staffCount;
        switch (staffLevel) {
            case 1:
                staffCount = shop.staff.min;
                break;
            case 2:
                staffCount = shop.staff.low;
                break;
            case 3:
                staffCount = shop.staff.standard;
                break;
            case 4:
                staffCount = shop.staff.high;
                break;
        }
        
        const staffCountElement = document.getElementById('staff-count');
        if (staffCountElement) {
            staffCountElement.textContent = staffCount;
        }
    }
}

// 开店函数
function openShop() {
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    const shopLevelElement = document.getElementById('shop-level');
    
    if (shopLevelElement) {
        const shopLevel = shopLevelElement.value;
        const staffLevel = parseInt(localStorage.getItem('staffLevel')) || 3;
        const shop = shopData[shopLevel];
        
        // 计算当前店铺总数（包括总店）
        const currentTotalShops = (gameData.totalShopCount || 1);
        
        // 检查是否已达到10万家店铺上限
        if (currentTotalShops >= 100000) {
            alert('已达到10万家店铺上限，你已经称霸全球了，成为行业传奇！');
            // 恢复游戏计时
            closeModal();
            return;
        }
        
        // 计算最大可开数量（按最大资金计算）
        const maxCount = Math.floor(gameData.money / shop.cost);
        
        // 计算剩余可开数量（不超过10万家上限）
        const remainingSlots = 100000 - currentTotalShops;
        let finalMaxCount = Math.min(maxCount, remainingSlots);
        
        // 超级店需要5家限制
        if (shopLevel === 'super') {
            let superShopCount = 0;
            if (gameData.shops) {
                gameData.shops.forEach(existingShop => {
                    if (existingShop.level === 'super') {
                        superShopCount++;
                    }
                });
            }
            
            // 超级店包含总店不超过5家
            if (superShopCount >= 5) {
                alert('超级店数量不能超过5家！');
                // 恢复游戏计时
                closeModal();
                return;
            }
            
            // 限制最大数量
            const availableSuperSlots = 5 - superShopCount;
            finalMaxCount = Math.min(finalMaxCount, availableSuperSlots);
            
            if (finalMaxCount <= 0) {
                alert('资金不足或已达到超级店数量上限！');
                // 恢复游戏计时
                closeModal();
                return;
            }
        } else {
            // 非超级店按资金和店铺上限计算
            if (finalMaxCount <= 0) {
                alert('资金不足！');
                // 恢复游戏计时
                closeModal();
                return;
            }
        }
        
        // 存储当前操作的参数
        window.openShopParams = {
            shopLevel: shopLevel,
            finalMaxCount: finalMaxCount,
            shop: shop,
            staffLevel: staffLevel
        };
        
        // 显示店铺数量输入弹窗
            document.getElementById('shop-count-modal-message').textContent = `请输入要开的${getShopLevelName(shopLevel)}数量（最多${finalMaxCount}家）：`;
            
            // 设置滑块范围和值
            const slider = document.getElementById('shop-count-slider');
            slider.max = finalMaxCount;
            slider.value = '1';
            
            // 更新显示值
            document.getElementById('shop-count-value').textContent = `当前选择：1家`;
            
            // 显示弹窗
            openModal();
            document.getElementById('shop-count-modal').style.display = 'flex';
        
        return; // 暂停执行，等待用户输入
    }
}

// 更新店铺数量显示值
window.updateShopCountValue = function(value) {
    document.getElementById('shop-count-value').textContent = `当前选择：${value}家`;
};

// 确认店铺数量
window.confirmShopCount = function() {
    const params = window.openShopParams;
    if (!params) return;
    
    const countSlider = document.getElementById('shop-count-slider');
    const count = countSlider.value;
    const shopCount = parseInt(count);
    
    if (isNaN(shopCount) || shopCount < 1 || shopCount > params.finalMaxCount) {
        alert('请输入有效的数量！');
        return;
    }
    
    // 扣除资金
    const totalCost = params.shop.cost * shopCount;
    gameData.money -= totalCost;
    
    // 迁移现有店铺数据到范围格式
    migrateShopsToRanges();
    
    // 添加店铺范围
    addShopRange(params.shopLevel, shopCount, params.staffLevel, params.shop.rent, params.shop.equipment, params.shop.people);
    
    gameData.shopCount += shopCount;
    gameData.totalShopCount = (gameData.totalShopCount || 1) + shopCount;
    
    // 更新总设备价值
    const totalEquipmentValue = params.shop.equipment * shopCount;
    gameData.equipment.totalValue += totalEquipmentValue;
    gameData.equipment.currentValue += totalEquipmentValue;
    
    // 更新设备批次信息
    if (!gameData.equipmentBatches) {
        gameData.equipmentBatches = {
            '放映机': [],
            '音响设备': [],
            '银幕': []
        };
    }
    
    // 根据店铺等级计算设备数量
    let projectorCount = 3; // 便民店默认3台
    switch (params.shopLevel) {
        case 'premium':
            projectorCount = 5;
            break;
        case 'flagship':
            projectorCount = 8;
            break;
        case 'super':
            projectorCount = 12;
            break;
    }
    
    // 计算总放映机数量
    const totalProjectors = projectorCount * shopCount;
    
    // 检查当前年份是否已有批次
    let existingBatch = gameData.equipmentBatches['放映机'].find(batch => batch.year === gameData.date.year);
    
    if (existingBatch) {
        // 如果当前年份已有批次，更新该批次的设备数量
        existingBatch.count += totalProjectors;
    } else {
        // 如果当前年份没有批次，创建新批次
        // 限制总批次数量为10个
        if (gameData.equipmentBatches['放映机'].length >= 10) {
            // 如果已达到10个批次，替换最早的批次
            // 按照年份排序找到最早的批次
            const oldestBatch = gameData.equipmentBatches['放映机'].reduce((oldest, current) => {
                return current.year < oldest.year ? current : oldest;
            });
            const oldestBatchIndex = gameData.equipmentBatches['放映机'].indexOf(oldestBatch);
            if (oldestBatchIndex !== -1) {
                gameData.equipmentBatches['放映机'][oldestBatchIndex] = {
                    batch: oldestBatch.batch,
                    year: gameData.date.year,
                    count: totalProjectors,
                    electricity: 200
                };
            }
        } else {
            // 添加新批次
            const batchNumber = gameData.equipmentBatches['放映机'].length + 1;
            gameData.equipmentBatches['放映机'].push({
                batch: batchNumber,
                year: gameData.date.year,
                count: totalProjectors,
                electricity: 200
            });
        }
    }
    
    // 确保批次按年份排序
    gameData.equipmentBatches['放映机'].sort((a, b) => a.year - b.year);
    // 重新编号批次
    gameData.equipmentBatches['放映机'].forEach((batch, index) => {
        batch.batch = index + 1;
    });
    
    // 更新放映机总数
    if (!gameData.equipment['放映机']) {
        gameData.equipment['放映机'] = 0;
    }
    gameData.equipment['放映机'] += totalProjectors;
    
    // 关闭弹窗
    window.closeShopCountModal();
    
    updateUI();
    
    // 更新总员工数量
    updateTotalStaffCount();
    
    // 检查是否达到10万家店铺上限
    const totalShopsAfter = (gameData.totalShopCount || 1);
    if (totalShopsAfter >= 100000) {
        alert('恭喜！你已经拥有10万家店铺，称霸全球，成为行业传奇！');
    }
    
    // 显示店铺建设通知
    showNotification(`${getShopLevelName(params.shopLevel)}建设开始：成功建设${shopCount}家，花费¥${formatAssets(totalCost)}，预计3个月后开业`);
};

// 关闭店铺数量输入弹窗
window.closeShopCountModal = function() {
    document.getElementById('shop-count-modal').style.display = 'none';
    window.openShopParams = null;
    // 恢复游戏计时
    closeModal();
};

// 获取店铺等级名称
function getShopLevelName(level) {
    const levelNames = {
        convenience: '便民店',
        premium: '精品店',
        flagship: '旗舰店',
        super: '超级店'
    };
    return levelNames[level] || '便民店';
}

// 初始化店铺范围数据
function initShopRanges() {
    if (!gameData.shopRanges) {
        gameData.shopRanges = [];
    }
}

// 将现有店铺数据转换为范围格式
function migrateShopsToRanges() {
    if (gameData.shops && gameData.shops.length > 0) {
        initShopRanges();
        
        // 按等级分组店铺
        const shopsByLevel = {};
        gameData.shops.forEach(shop => {
            if (!shopsByLevel[shop.level]) {
                shopsByLevel[shop.level] = [];
            }
            shopsByLevel[shop.level].push(shop);
        });
        
        // 为每个等级创建范围
        for (const level in shopsByLevel) {
            const shops = shopsByLevel[level];
            if (shops.length > 0) {
                // 按ID排序
                shops.sort((a, b) => a.id - b.id);
                
                // 创建范围
                const firstShop = shops[0];
                const lastShop = shops[shops.length - 1];
                
                const shopRange = {
                    startId: firstShop.id,
                    endId: lastShop.id,
                    count: shops.length,
                    level: level,
                    commonProps: {
                        staffLevel: firstShop.staffLevel,
                        rent: firstShop.rent,
                        equipment: firstShop.equipment,
                        people: firstShop.people
                    }
                };
                
                gameData.shopRanges.push(shopRange);
            }
        }
        
        // 清空旧的店铺数据
        gameData.shops = null;
    }
}

// 添加店铺范围
function addShopRange(level, count, staffLevel, rent, equipment, people) {
    initShopRanges();
    
    // 计算新范围的 ID
    let startId = 2; // 从 2 开始，1 是总店
    if (gameData.shopRanges.length > 0) {
        const lastRange = gameData.shopRanges[gameData.shopRanges.length - 1];
        startId = lastRange.endId + 1;
    }
    const endId = startId + count - 1;
    
    // 计算开业日期（3 个月后）
    const openingDate = new Date();
    openingDate.setMonth(gameData.date.month + 2); // 3 个月后开业（当前月 +2）
    const openingDay = gameData.expenseCounters.days + 90; // 90 天后开业
    
    // 创建新范围
    const newRange = {
        startId: startId,
        endId: endId,
        count: count,
        level: level,
        status: '建设中', // 设置为建设中
        openingDay: openingDay, // 开业日期
        commonProps: {
            staffLevel: staffLevel,
            rent: rent,
            equipment: equipment,
            people: people
        }
    };
    
    gameData.shopRanges.push(newRange);
    return newRange;
}

// 获取店铺总数
function getTotalShopCount() {
    let count = 1; // 总店
    if (gameData.shopRanges) {
        count += gameData.shopRanges.reduce((sum, range) => sum + range.count, 0);
    } else if (gameData.shops) {
        count += gameData.shops.length;
    }
    return count;
}

// 获取指定等级的店铺数量
function getShopCountByLevel(level) {
    let count = 0;
    // 检查总店
    if (level === 'convenience') {
        count += 1;
    }
    // 检查分店
    if (gameData.shopRanges) {
        gameData.shopRanges.forEach(range => {
            if (range.level === level) {
                count += range.count;
            }
        });
    } else if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.level === level) {
                count += 1;
            }
        });
    }
    return count;
}

// 计算总厅数
function calculateTotalHalls() {
    let totalHalls = 3; // 总店3个厅
    if (gameData.shopRanges) {
        gameData.shopRanges.forEach(range => {
            const shopDataInfo = shopData[range.level];
            if (shopDataInfo) {
                totalHalls += shopDataInfo.halls * range.count;
            }
        });
    } else if (gameData.shops) {
        gameData.shops.forEach(shop => {
            const shopDataInfo = shopData[shop.level];
            if (shopDataInfo) {
                totalHalls += shopDataInfo.halls;
            }
        });
    }
    return totalHalls;
}

// 计算总员工数量
function calculateTotalStaff() {
    let totalStaff = 0;
    // 总店员工
    const mainShop = shopData.convenience;
    totalStaff += mainShop.staff.standard;
    
    // 分店员工
    if (gameData.shopRanges) {
        gameData.shopRanges.forEach(range => {
            const shopDataInfo = shopData[range.level];
            if (shopDataInfo) {
                let staffCount;
                switch (range.commonProps.staffLevel) {
                    case 1:
                        staffCount = shopDataInfo.staff.min;
                        break;
                    case 2:
                        staffCount = shopDataInfo.staff.low;
                        break;
                    case 3:
                        staffCount = shopDataInfo.staff.standard;
                        break;
                    case 4:
                        staffCount = shopDataInfo.staff.high;
                        break;
                    default:
                        staffCount = shopDataInfo.staff.standard;
                }
                totalStaff += staffCount * range.count;
            }
        });
    } else if (gameData.shops) {
        gameData.shops.forEach(shop => {
            totalStaff += shop.staffCount;
        });
    }
    return totalStaff;
}

// 计算总租金
function calculateTotalRent() {
    let totalRent = 0;
    // 总店租金
    totalRent += shopData.convenience.rent;
    
    // 分店租金
    if (gameData.shopRanges) {
        gameData.shopRanges.forEach(range => {
            totalRent += range.commonProps.rent * range.count;
        });
    } else if (gameData.shops) {
        gameData.shops.forEach(shop => {
            totalRent += shop.rent;
        });
    }
    return totalRent;
}

// 获取店铺名称
function getShopName(level) {
    const prefixes = ['星光', '银河', '环球', '时代', '未来', '梦幻', '豪华', '精品'];
    const suffixes = {
        convenience: '影城',
        premium: '影院',
        flagship: '影城',
        super: '电影城'
    };
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix}${suffixes[level]}`;
}

// 获取人员数量
function getStaffCount(shop, level) {
    switch (level) {
        case 1:
            return shop.staff.min;
        case 2:
            return shop.staff.low;
        case 3:
            return shop.staff.standard;
        case 4:
            return shop.staff.high;
        default:
            return shop.staff.standard;
    }
}

// 确认支出页面人员配置等级
function confirmExpenseStaffLevel(level) {
    const staffLevel = level || parseInt(localStorage.getItem('staffLevel')) || 3;
    const levelText = getStaffLevelText(staffLevel);
    
    // 获取当前店铺等级对应的人员数量
    let staffCount;
    const shopLevel = document.getElementById('shop-level') ? document.getElementById('shop-level').value : 'convenience';
    const shop = shopData[shopLevel];
    
    switch (staffLevel) {
        case 1:
            staffCount = shop.staff.min;
            break;
        case 2:
            staffCount = shop.staff.low;
            break;
        case 3:
            staffCount = shop.staff.standard;
            break;
        case 4:
            staffCount = shop.staff.high;
            break;
    }
    
    // 弹窗确认
    if (confirm(`确定将人员配置等级设置为${levelText}，人员数量为${staffCount}人吗？`)) {
        localStorage.setItem('staffLevel', staffLevel);
        // 更新多店人员汇总
        updateTotalStaffCount();
    } else {
        // 取消时恢复原来的值
        const originalLevel = parseInt(localStorage.getItem('staffLevel')) || 3;
        // 更新血条
        if (window.updateStaffBloodBar) {
            window.updateStaffBloodBar(originalLevel);
        }
    }
}

// 获取人员配置等级文本
function getStaffLevelText(level) {
    switch (level) {
        case 1:
            return '必备';
        case 2:
            return '低配';
        case 3:
            return '标配';
        case 4:
            return '高配';
        default:
            return '标配';
    }
}

// 计算辐射人群
function calculateRadiationPopulation() {
    let totalRadiation = 0;
    
    // 根据总店等级计算辐射人群
    let headquarterLevel = 'convenience';
    if (gameData.cinemaLevel === '精品店') {
        headquarterLevel = 'premium';
    } else if (gameData.cinemaLevel === '旗舰店') {
        headquarterLevel = 'flagship';
    } else if (gameData.cinemaLevel === '超级店') {
        headquarterLevel = 'super';
    }
    
    // 总店基础辐射人群：座位数 × 100
    totalRadiation += shopData[headquarterLevel].seats * 100;
    
    // 根据分店计算辐射人群
    if (gameData.shops) {
        gameData.shops.forEach(shop => {
            // 分店辐射人群：座位数 × 50
            totalRadiation += shopData[shop.level].seats * 50;
        });
    }
    
    return totalRadiation;
}

// 更新整体人员配置等级
function updateOverallStaffLevel() {
    const staffLevel = parseInt(document.getElementById('overall-staff-level').value);
    const levelText = getStaffLevelText(staffLevel);
    
    document.getElementById('current-staff-level').textContent = levelText;
    
    // 这里可以添加根据配置等级调整人员数量和支出的逻辑
    // 例如：根据配置等级调整各类型人员的数量和薪资
}

// 更新人员支出统计
function updateStaffExpense(staffCount) {
    // 计算总支出
    const monthlySalaryPerPerson = 3000; // 平均每人月薪
    const monthlyTotal = staffCount * monthlySalaryPerPerson;
    const yearlyTotal = monthlyTotal * 12;
    
    // 更新支出统计
    const expenseSummary = document.querySelector('.expense-summary');
    if (expenseSummary) {
        expenseSummary.innerHTML = `
            <h3>人员支出汇总</h3>
            <p>总人数：${staffCount}人</p>
            <p>月总支出：¥${formatAssets(monthlyTotal)}</p>
            <p>年总支出：¥${formatAssets(yearlyTotal)}</p>
        `;
    }
    
    // 更新游戏数据中的人员工资支出
    gameData.expenses.monthlySalaries = monthlyTotal;
    
    // 更新UI，包括盈亏平衡线
    updateUI();
}

// 增加1亿资产
function addOneBillion() {
    gameData.money += 100000000; // 增加1亿资产
    updateUI(); // 更新UI
    
    // 显示资产增加通知
    showNotification('资产增加：成功增加1亿资产！');
}

// 确认人员配置等级
function confirmStaffLevel() {
    const staffLevel = parseInt(document.getElementById('staff-level').value);
    const shopLevel = document.getElementById('shop-level').value;
    const shop = shopData[shopLevel];
    
    let staffCount;
    switch (staffLevel) {
        case 1:
            staffCount = shop.staff.min;
            break;
        case 2:
            staffCount = shop.staff.low;
            break;
        case 3:
            staffCount = shop.staff.standard;
            break;
        case 4:
            staffCount = shop.staff.high;
            break;
    }
    
    // 弹窗确认
    if (confirm(`确定将人员配置等级设置为${getStaffLevelText(staffLevel)}，人员数量为${staffCount}人吗？`)) {
        document.getElementById('staff-count').textContent = staffCount;
    } else {
        // 取消时恢复原来的值
        document.getElementById('staff-level').value = 3; // 默认标配
        document.getElementById('staff-count').textContent = shop.staff.standard;
    }
}

// 更新多店人员汇总
function updateTotalStaffCount() {
    // 获取当前班制
    const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    
    // 计算总店员工数（默认3人）
    let totalStaff = 3 * workSchedule;
    
    // 计算所有分店员工数
    if (gameData.shopRanges) {
        gameData.shopRanges.forEach(range => {
            const shopInfo = shopData[range.level] || shopData.convenience;
            let staffCount;
            switch (range.commonProps.staffLevel) {
                case 1:
                    staffCount = shopInfo.staff.min;
                    break;
                case 2:
                    staffCount = shopInfo.staff.low;
                    break;
                case 3:
                    staffCount = shopInfo.staff.standard;
                    break;
                case 4:
                    staffCount = shopInfo.staff.high;
                    break;
                default:
                    staffCount = shopInfo.staff.standard;
            }
            totalStaff += staffCount * range.count * workSchedule;
        });
    } else if (gameData.shops && gameData.shops.length > 0) {
        gameData.shops.forEach(shop => {
            totalStaff += (shop.staffCount || 0) * workSchedule;
        });
    }
    
    // 更新人员支出
    updateStaffExpense(totalStaff);
    
    // 更新员工数量显示
    const staffCountElement = document.getElementById('staff-count');
    if (staffCountElement) {
        staffCountElement.textContent = totalStaff;
    }
    
    // 更新current-staff-display元素（员工数量血条显示）
    const currentStaffDisplayElement = document.getElementById('current-staff-display');
    if (currentStaffDisplayElement) {
        currentStaffDisplayElement.textContent = totalStaff;
    }
    
    console.log(`总人员数量：${totalStaff}人 (${workSchedule}班制)`);
}

// 更新开店按钮状态
function updateShopButtonStatus() {
    const openShopButton = document.querySelector('.open-shop-btn');
    if (openShopButton) {
        const shopLevelElement = document.getElementById('shop-level');
        if (shopLevelElement) {
            const shopLevel = shopLevelElement.value;
            const shop = shopData[shopLevel];
            
            // 检查资金是否足够
            const canOpenShop = gameData.money >= shop.cost;
            
            // 设置按钮状态
            openShopButton.disabled = !canOpenShop;
        }
    }
}

// 店铺升级函数
function upgradeShopLevel(currentLevel) {
    // 检查是否为超级店
    if (currentLevel === 'super') {
        alert('超级店不可升级！');
        return;
    }
    
    // 确定目标等级
    const levelOrder = ['convenience', 'premium', 'flagship', 'super'];
    const currentIndex = levelOrder.indexOf(currentLevel);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= levelOrder.length) {
        alert('已经是最高等级了！');
        return;
    }
    
    const targetLevel = levelOrder[nextIndex];
    const currentShop = shopData[currentLevel];
    const targetShop = shopData[targetLevel];
    
    // 计算升级成本（价差*1.2）
    const costDifference = targetShop.cost - currentShop.cost;
    const upgradeCost = Math.round(costDifference * 1.2);
    
    // 计算最大可升级数量
    const maxCount = Math.floor(gameData.money / upgradeCost);
    
    // 统计可升级的店铺数量
    let availableCount = 0;
    
    // 检查总店
    let headquarterLevel = 'convenience';
    if (gameData.cinemaLevel === '精品店') {
        headquarterLevel = 'premium';
    } else if (gameData.cinemaLevel === '旗舰店') {
        headquarterLevel = 'flagship';
    } else if (gameData.cinemaLevel === '超级店') {
        headquarterLevel = 'super';
    }
    
    if (headquarterLevel === currentLevel) {
        availableCount++;
    }
    
    // 检查分店
    if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.level === currentLevel && shop.status === '营业中') {
                availableCount++;
            }
        });
    }
    
    // 按最大资金显示最大数量
    const finalMaxCount = Math.min(maxCount, availableCount);
    
    if (finalMaxCount <= 0) {
        alert('资金不足或没有可升级的店铺！');
        return;
    }
    
    // 让用户选择数量
    const count = prompt(`请输入要升级的${getShopLevelName(currentLevel)}数量（最多${finalMaxCount}家）：`, '1');
    const upgradeCount = parseInt(count);
    
    if (isNaN(upgradeCount) || upgradeCount < 1 || upgradeCount > finalMaxCount) {
        alert('请输入有效的数量！');
        return;
    }
    
    // 扣除资金
    const totalCost = upgradeCost * upgradeCount;
    gameData.money -= totalCost;
    
    // 查找需要升级的店铺
    let upgradedCount = 0;
    
    // 升级总店（如果总店是当前等级且营业中）
    if (headquarterLevel === currentLevel && upgradedCount < upgradeCount) {
        // 检查总店是否需要升级
        if (gameData.cinemaLevel !== '超级店') {
            // 更新总店等级
            gameData.cinemaLevel = getShopLevelName(targetLevel);
            upgradedCount++;
        }
    }
    
    // 升级分店
    if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.level === currentLevel && shop.status === '营业中' && upgradedCount < upgradeCount) {
                shop.level = targetLevel;
                // 更可靠的店铺名称更新逻辑
                const levelName = getShopLevelName(targetLevel);
                if (shop.name.includes('号')) {
                    shop.name = shop.name.replace(/号.*$/, `号${levelName}`);
                } else {
                    shop.name += `(${levelName})`;
                }
                shop.rent = targetShop.rent;
                shop.equipment = targetShop.equipment;
                shop.people = targetShop.people;
                upgradedCount++;
            }
        });
    }
    
    // 检查是否有店铺被升级
    if (upgradedCount > 0) {
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>店铺升级：成功升级${upgradedCount}家${getShopLevelName(currentLevel)}为${getShopLevelName(targetLevel)}，扣除升级成本¥${formatAssets(totalCost)}</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    } else {
        alert('没有可升级的店铺！');
        // 退还升级成本
        gameData.money += totalCost;
        return;
    }
    
    // 更新UI
    updateShopLevelsDisplay();
    updateUI();
}

// 更新店铺等级显示
function updateShopLevelsDisplay() {
    // 统计各等级店铺数量，区分营业中和建设中
    const levelCounts = {
        convenience: { operating: 0, building: 0 },
        premium: { operating: 0, building: 0 },
        flagship: { operating: 0, building: 0 },
        super: { operating: 0, building: 0 }
    };
    
    // 加上总店，使用实际等级和状态
    let headquarterLevel = 'convenience';
    if (gameData.cinemaLevel === '精品店') {
        headquarterLevel = 'premium';
    } else if (gameData.cinemaLevel === '旗舰店') {
        headquarterLevel = 'flagship';
    } else if (gameData.cinemaLevel === '超级店') {
        headquarterLevel = 'super';
    }
    
    // 检查总店状态
    if (gameData.headquarterStatus === '建设中' && gameData.headquarterUpgrade) {
        // 总店升级中，计入目标等级的建设中
        const targetLevel = gameData.headquarterUpgrade.targetLevel;
        levelCounts[targetLevel].building += 1;
    } else {
        // 总店正常营业，计入当前等级的营业中
        levelCounts[headquarterLevel].operating += 1;
    }
    
    if (gameData.shopRanges) {
        gameData.shopRanges.forEach(range => {
            // 店铺范围默认按营业中处理
            if (levelCounts.hasOwnProperty(range.level)) {
                levelCounts[range.level].operating += range.count;
            }
        });
    } else if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.status === '建设中' && shop.upgradeTargetLevel) {
                // 店铺升级中，计入目标等级的建设中
                const targetLevel = shop.upgradeTargetLevel;
                if (levelCounts.hasOwnProperty(targetLevel)) {
                    levelCounts[targetLevel].building++;
                }
            } else if (levelCounts.hasOwnProperty(shop.level)) {
                // 店铺正常营业或非升级建设中，计入当前等级
                if (shop.status === '营业中') {
                    levelCounts[shop.level].operating++;
                } else if (shop.status === '建设中') {
                    levelCounts[shop.level].building++;
                }
            }
        });
    }
    
    // 更新显示，区分营业中和建设中（可点击查看详情）
    document.getElementById('d-level-count').innerHTML = `<span class="clickable-status" onclick="showShopList('convenience', '营业中')">营业中: ${levelCounts.convenience.operating}</span> <span class="clickable-status" onclick="showShopList('convenience', '建设中')">建设中: ${levelCounts.convenience.building}</span>`;
    document.getElementById('c-level-count').innerHTML = `<span class="clickable-status" onclick="showShopList('premium', '营业中')">营业中: ${levelCounts.premium.operating}</span> <span class="clickable-status" onclick="showShopList('premium', '建设中')">建设中: ${levelCounts.premium.building}</span>`;
    document.getElementById('b-level-count').innerHTML = `<span class="clickable-status" onclick="showShopList('flagship', '营业中')">营业中: ${levelCounts.flagship.operating}</span> <span class="clickable-status" onclick="showShopList('flagship', '建设中')">建设中: ${levelCounts.flagship.building}</span>`;
    document.getElementById('a-level-count').innerHTML = `<span class="clickable-status" onclick="showShopList('super', '营业中')">营业中: ${levelCounts.super.operating}</span> <span class="clickable-status" onclick="showShopList('super', '建设中')">建设中: ${levelCounts.super.building}</span>`;
    
    // 更新升级按钮状态
    const upgradeButtons = document.querySelectorAll('.upgrade-btn');
    upgradeButtons.forEach(button => {
        // 修复：匹配openUpgradeModal函数中的等级参数
        const match = button.getAttribute('onclick').match(/openUpgradeModal\('([^']+)'\)/);
        if (match) {
            const level = match[1];
            if (level === 'super') {
                button.disabled = true;
            } else {
                // 检查升级条件是否满足
                const levelOrder = ['convenience', 'premium', 'flagship', 'super'];
                const currentIndex = levelOrder.indexOf(level);
                const nextIndex = currentIndex + 1;
                
                if (nextIndex < levelOrder.length) {
                    const targetLevel = levelOrder[nextIndex];
                    const currentShop = shopData[level];
                    const targetShop = shopData[targetLevel];
                    
                    // 计算升级成本
                    const costDifference = targetShop.cost - currentShop.cost;
                    const upgradeCost = Math.round(costDifference * 1.2);
                    
                    // 检查超级店是否已满
                    let superShopCount = 0;
                    if (gameData.shops) {
                        gameData.shops.forEach(shop => {
                            if (shop.level === 'super') {
                                superShopCount++;
                            }
                        });
                    }
                    
                    // 检查是否有可升级的店铺
                    let hasUpgradeableShops = false;
                    
                    // 检查总店
                    let headquarterLevel = 'convenience';
                    if (gameData.cinemaLevel === '精品店') {
                        headquarterLevel = 'premium';
                    } else if (gameData.cinemaLevel === '旗舰店') {
                        headquarterLevel = 'flagship';
                    } else if (gameData.cinemaLevel === '超级店') {
                        headquarterLevel = 'super';
                    }
                    
                    if (headquarterLevel === level) {
                        hasUpgradeableShops = true;
                    }
                    
                    // 检查分店
                    if (gameData.shops) {
                        gameData.shops.forEach(shop => {
                            if (shop.level === level && shop.status === '营业中') {
                                hasUpgradeableShops = true;
                            }
                        });
                    }
                    
                    // 检查升级条件
                    // 只有当目标是超级店时，才检查超级店数量限制
                    let isDisabled = gameData.money < upgradeCost || !hasUpgradeableShops;
                    if (targetLevel === 'super') {
                        isDisabled = isDisabled || superShopCount >= 5;
                    }
                    button.disabled = isDisabled;
                } else {
                    button.disabled = true;
                }
            }
        }
    });
}

// 店铺升级弹窗相关函数
let currentUpgradeLevel = '';
let selectedUpgradeCount = 1;

// 打开升级弹窗
function openUpgradeModal(level) {
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    currentUpgradeLevel = level;
    selectedUpgradeCount = 1;
    
    // 检查是否为超级店
    if (level === 'super') {
        alert('超级店不可升级！');
        // 恢复游戏计时
        closeModal();
        return;
    }
    
    // 确定目标等级
    const levelOrder = ['convenience', 'premium', 'flagship', 'super'];
    const currentIndex = levelOrder.indexOf(level);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= levelOrder.length) {
        alert('已经是最高等级了！');
        // 恢复游戏计时
        closeModal();
        return;
    }
    
    const targetLevel = levelOrder[nextIndex];
    const currentShop = shopData[level];
    const targetShop = shopData[targetLevel];
    
    // 计算升级成本
    const costDifference = targetShop.cost - currentShop.cost;
    const upgradeCost = Math.round(costDifference * 1.2);
    
    // 统计可升级的店铺数量
    let availableCount = 0;
    if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.level === level && shop.status === '营业中') {
                availableCount++;
            }
        });
    }
    
    // 加上总店（根据总店当前等级判断）
    let headquarterLevel = 'convenience';
    if (gameData.cinemaLevel === '精品店') {
        headquarterLevel = 'premium';
    } else if (gameData.cinemaLevel === '旗舰店') {
        headquarterLevel = 'flagship';
    } else if (gameData.cinemaLevel === '超级店') {
        headquarterLevel = 'super';
    }
    
    if (headquarterLevel === level) {
        availableCount++;
    }
    
    // 更新弹窗内容
    document.getElementById('upgrade-title').textContent = `${getShopLevelName(level)} → ${getShopLevelName(targetLevel)}`;
    document.getElementById('upgrade-description').textContent = `将${getShopLevelName(level)}升级为${getShopLevelName(targetLevel)}，提升店铺等级和收益。`;
    document.getElementById('upgrade-cost').textContent = `升级成本：¥${formatAssets(upgradeCost)}/家`;
    document.getElementById('available-shops').textContent = `可升级店铺：${availableCount}家`;
    
    // 计算最大可升级数量（按资金计算）
    const maxByMoney = Math.floor(gameData.money / upgradeCost);
    
    // 计算超级店限制（如果目标是超级店）
    let maxBySuperLimit = availableCount;
    if (targetLevel === 'super') {
        let currentSuperCount = 0;
        if (gameData.shops) {
            gameData.shops.forEach(shop => {
                if (shop.level === 'super') {
                    currentSuperCount++;
                }
            });
        }
        // 检查总店是否是超级店
        if (gameData.cinemaLevel === '超级店') {
            currentSuperCount++;
        }
        // 计算剩余超级店槽位
        maxBySuperLimit = Math.max(0, 5 - currentSuperCount);
    }
    
    // 最大可升级数量 = 可升级店铺数量、资金允许的数量和超级店限制中的较小值
    const maxUpgradeCount = Math.min(availableCount, maxByMoney, maxBySuperLimit);
    
    // 设置滑块范围
    const slider = document.getElementById('upgrade-quantity-slider');
    slider.max = maxUpgradeCount;
    slider.value = 1;
    updateUpgradeQuantity(1);
    
    // 显示弹窗
    openModal();
    document.getElementById('upgrade-modal').style.display = 'flex';
}

// 关闭升级弹窗
function closeUpgradeModal() {
    document.getElementById('upgrade-modal').style.display = 'none';
    currentUpgradeLevel = '';
    selectedUpgradeCount = 1;
    // 恢复游戏计时
    closeModal();
}

// 更新升级数量
function updateUpgradeQuantity(value) {
    selectedUpgradeCount = parseInt(value);
    document.getElementById('upgrade-quantity-value').textContent = `当前选择：${selectedUpgradeCount}家`;
    
    // 更新升级成本
    if (currentUpgradeLevel) {
        const levelOrder = ['convenience', 'premium', 'flagship', 'super'];
        const currentIndex = levelOrder.indexOf(currentUpgradeLevel);
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < levelOrder.length) {
            const targetLevel = levelOrder[nextIndex];
            const currentShop = shopData[currentUpgradeLevel];
            const targetShop = shopData[targetLevel];
            
            const costDifference = targetShop.cost - currentShop.cost;
            const upgradeCost = Math.round(costDifference * 1.2);
            const totalCost = upgradeCost * selectedUpgradeCount;
            
            document.getElementById('upgrade-cost').textContent = `升级成本：¥${formatAssets(upgradeCost)}/家 (总计：¥${formatAssets(totalCost)})`;
        }
    }
}

// 确认升级
function confirmUpgrade() {
    if (!currentUpgradeLevel) return;
    
    // 确定目标等级
    const levelOrder = ['convenience', 'premium', 'flagship', 'super'];
    const currentIndex = levelOrder.indexOf(currentUpgradeLevel);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= levelOrder.length) {
        alert('已经是最高等级了！');
        closeUpgradeModal();
        return;
    }
    
    const targetLevel = levelOrder[nextIndex];
    const currentShop = shopData[currentUpgradeLevel];
    const targetShop = shopData[targetLevel];
    
    // 计算升级成本
    const costDifference = targetShop.cost - currentShop.cost;
    const upgradeCostPerShop = Math.round(costDifference * 1.2);
    const totalCost = upgradeCostPerShop * selectedUpgradeCount;
    
    // 检查资金是否足够
    if (gameData.money < totalCost) {
        alert(`资金不足，升级${selectedUpgradeCount}家店铺需要¥${formatAssets(totalCost)}！`);
        return;
    }
    
    // 检查超级店数量限制
    if (targetLevel === 'super') {
        let superShopCount = 0;
        if (gameData.shops) {
            gameData.shops.forEach(shop => {
                if (shop.level === 'super') {
                    superShopCount++;
                }
            });
        }
        
        // 检查总店是否是超级店
        if (gameData.cinemaLevel === '超级店') {
            superShopCount++;
        }
        
        if (superShopCount + selectedUpgradeCount > 5) {
            alert('超级店数量不能超过5家！');
            return;
        }
    }
    
    // 扣除升级成本
    gameData.money -= totalCost;
    
    // 升级店铺
    let upgradedCount = 0;
    
    // 升级总店（如果总店是当前等级且营业中）
    let headquarterLevel = 'convenience';
    if (gameData.cinemaLevel === '精品店') {
        headquarterLevel = 'premium';
    } else if (gameData.cinemaLevel === '旗舰店') {
        headquarterLevel = 'flagship';
    } else if (gameData.cinemaLevel === '超级店') {
        headquarterLevel = 'super';
    }
    
    if (headquarterLevel === currentUpgradeLevel && upgradedCount < selectedUpgradeCount) {
        // 检查总店是否需要升级
        if (gameData.cinemaLevel !== '超级店') {
            // 开始升级总店，设置为建设中
            gameData.headquarterStatus = '建设中';
            gameData.headquarterUpgrade = {
                targetLevel: targetLevel,
                startDate: {...gameData.date}
            };
            upgradedCount++;
        }
    }
    
    // 升级分店
    if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.level === currentUpgradeLevel && shop.status === '营业中' && upgradedCount < selectedUpgradeCount) {
                // 开始升级分店，设置为建设中
                shop.status = '建设中';
                shop.upgradeStartDate = {...gameData.date};
                shop.upgradeTargetLevel = targetLevel;
                // 移除openingDay属性，避免被checkShopOpening函数错误处理
                delete shop.openingDay;
                upgradedCount++;
            }
        });
    }
    
    // 检查是否有店铺被升级
    if (upgradedCount > 0) {
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>店铺升级：成功升级${upgradedCount}家${getShopLevelName(currentUpgradeLevel)}为${getShopLevelName(targetLevel)}，扣除升级成本¥${formatAssets(totalCost)}</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    } else {
        alert('没有可升级的店铺！');
        // 退还升级成本
        gameData.money += totalCost;
        closeUpgradeModal();
        return;
    }
    
    // 更新UI
    updateShopLevelsDisplay();
    updateUI();
    
    // 关闭弹窗
    closeUpgradeModal();
}

// 显示店铺列表弹窗
function showShopList(level, status) {
    // 打开弹窗，增加计数器并暂停游戏
    openModal();
    
    // 过滤出符合条件的店铺
    const filteredShops = [];
    
    // 检查总店
    if (status === '营业中') {
        // 确定总店的实际等级
        let headquarterLevel = 'convenience';
        if (gameData.cinemaLevel === '精品店') {
            headquarterLevel = 'premium';
        } else if (gameData.cinemaLevel === '旗舰店') {
            headquarterLevel = 'flagship';
        } else if (gameData.cinemaLevel === '超级店') {
            headquarterLevel = 'super';
        }
        
        // 只在匹配当前筛选等级时添加总店
        if (headquarterLevel === level) {
            filteredShops.push({ id: 1, name: '1号店（总店）', level: headquarterLevel, status: '营业中' });
        }
    } else if (status === '建设中') {
        // 检查总店是否在升级中且目标等级是当前筛选等级
        if (gameData.headquarterStatus === '建设中' && gameData.headquarterUpgrade && gameData.headquarterUpgrade.targetLevel === level) {
            filteredShops.push({ id: 1, name: '1号店（总店）', level: gameData.headquarterUpgrade.targetLevel, status: '建设中' });
        }
    }
    
    // 检查分店
    if (gameData.shopRanges) {
        gameData.shopRanges.forEach(range => {
            if (range.level === level) {
                // 根据实际状态判断
                const rangeStatus = range.status || '营业中';
                if (rangeStatus === status) {
                    filteredShops.push({
                        id: range.startId,
                        name: `${range.startId}-${range.endId}号${getShopLevelName(range.level)}`,
                        level: range.level,
                        status: rangeStatus,
                        count: range.count,
                        openingDay: range.openingDay
                    });
                }
            }
        });
    } else if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if ((shop.status === status && (shop.upgradeTargetLevel ? shop.upgradeTargetLevel === level : shop.level === level))) {
                filteredShops.push(shop);
            }
        });
    }
    
    // 更新弹窗标题
    const modalTitle = document.getElementById('shop-list-modal-title');
    if (modalTitle) {
        modalTitle.textContent = `${getShopLevelName(level)} - ${status}店铺列表`;
    }
    
    // 生成店铺列表HTML
    const modalContent = document.getElementById('shop-list-modal-content');
    if (modalContent) {
        if (filteredShops.length > 0) {
            // 为不同状态设置不同的标注样式
            const statusClass = status === '营业中' ? 'status-operating' : 'status-building';
            const statusColor = status === '营业中' ? '#4CAF50' : '#FF9800';
            
            let listHTML = `
                <div class="shop-list-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h4 style="margin: 0; color: #333;">${getShopLevelName(level)} - <span class="${statusClass}" style="color: ${statusColor}; font-weight: bold;">${status}</span></h4>
                    <span class="shop-count-badge" style="background-color: ${statusColor}; color: white; padding: 4px 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">${filteredShops.length}家</span>
                </div>
                <div class="shop-list-container" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; border-left: 4px solid ${statusColor};">
            `;
            
            filteredShops.forEach(shop => {
                // 优化店铺名称显示，1.2.3.号店省略显示
                let displayName = shop.name;
                if (shop.name.includes('号店')) {
                    displayName = shop.name.replace(/号店.*$/, '号店');
                }
                
                // 获取店铺等级名称，建设中且有升级目标时使用目标等级
                const displayLevel = shop.status === '建设中' && shop.upgradeTargetLevel ? shop.upgradeTargetLevel : shop.level;
                const levelName = getShopLevelName(displayLevel);
                
                // 为不同状态设置不同的样式
                const shopStatusClass = shop.status === '营业中' ? 'shop-status-operating' : 'shop-status-building';
                const shopStatusColor = shop.status === '营业中' ? '#4CAF50' : '#FF9800';
                
                listHTML += `
                    <div class="shop-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background-color: white; border-radius: 6px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 3px solid ${shopStatusColor}; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                        <div class="shop-info" style="flex: 1;">
                            <div class="shop-name" style="font-weight: bold; color: #333; margin-bottom: 4px;">${displayName}</div>
                            <div class="shop-details" style="font-size: 13px; color: #666;">
                                ${levelName} · ${shop.status}
                                ${shop.count ? ` · 数量：${shop.count}家` : ''}
                                ${shop.status !== '营业中' ? (shop.upgradeStartDate ? ` · 预计开业：${Math.max(0, 30 - (gameData.date.day - shop.upgradeStartDate.day))}天` : shop.openingDay ? ` · 预计开业：${Math.max(0, shop.openingDay - gameData.expenseCounters.days)}天` : '') : ''}
                            </div>
                        </div>
                        <div class="shop-status-badge" style="background-color: ${shopStatusColor}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                            ${shop.status}
                        </div>
                    </div>
                `;
            });
            
            listHTML += `</div>`;
            modalContent.innerHTML = listHTML;
        } else {
            // 无店铺时的显示
            const statusColor = status === '营业中' ? '#4CAF50' : '#FF9800';
            modalContent.innerHTML = `
                <div class="no-shops" style="text-align: center; padding: 40px 20px; background-color: #f9f9f9; border-radius: 8px; border: 2px dashed #ddd;">
                    <div style="font-size: 64px; margin-bottom: 20px;">🏪</div>
                    <p style="margin: 0 0 10px 0; color: #666; font-size: 16px;">暂无${getShopLevelName(level)} - <span style="color: ${statusColor}; font-weight: bold;">${status}</span>的店铺</p>
                    <p style="margin: 0; color: #999; font-size: 14px;">请稍后再查看</p>
                </div>
            `;
        }
    }
    
    // 显示弹窗
    const modal = document.getElementById('shop-list-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 关闭店铺列表弹窗
function closeShopListModal() {
    const modal = document.getElementById('shop-list-modal');
    if (modal) {
        modal.style.display = 'none';
        // 恢复游戏计时
        closeModal();
    }
}

// 检查并完成升级建设
function checkUpgradeConstruction() {
    // 检查总店升级
    if (gameData.headquarterStatus === '建设中' && gameData.headquarterUpgrade) {
        const upgrade = gameData.headquarterUpgrade;
        const monthsPassed = (gameData.date.year - upgrade.startDate.year) * 12 + (gameData.date.month - upgrade.startDate.month);
        
        if (monthsPassed >= 1) {
            // 完成总店升级
            gameData.cinemaLevel = getShopLevelName(upgrade.targetLevel);
            gameData.headquarterStatus = '营业中';
            delete gameData.headquarterUpgrade;
            
            // 显示升级完成通知
            const notificationContent = document.getElementById('notification-content');
            if (notificationContent) {
                notificationContent.innerHTML = `<span>店铺升级：总店升级完成，已升级为${getShopLevelName(upgrade.targetLevel)}</span>`;
                checkScrollNeeded();
                
                setTimeout(() => {
                    notificationContent.innerHTML = '';
                    checkScrollNeeded();
                }, 3000);
            }
        }
    }
    
    // 检查分店升级
    if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.status === '建设中' && shop.upgradeStartDate && shop.upgradeTargetLevel) {
                const monthsPassed = (gameData.date.year - shop.upgradeStartDate.year) * 12 + (gameData.date.month - shop.upgradeStartDate.month);
                
                if (monthsPassed >= 1) {
                    // 完成分店升级
                    shop.level = shop.upgradeTargetLevel;
                    shop.status = '营业中';
                    
                    // 更新店铺名称
                    const levelName = getShopLevelName(shop.upgradeTargetLevel);
                    if (shop.name.includes('号')) {
                        shop.name = shop.name.replace(/号.*$/, `号${levelName}`);
                    } else {
                        shop.name += `(${levelName})`;
                    }
                    
                    // 更新店铺属性
                    const targetShop = shopData[shop.upgradeTargetLevel];
                    shop.rent = targetShop.rent;
                    shop.equipment = targetShop.equipment;
                    shop.people = targetShop.people;
                    
                    // 清理升级数据
                    delete shop.upgradeStartDate;
                    delete shop.upgradeTargetLevel;
                    
                    // 显示升级完成通知
                    const notificationContent = document.getElementById('notification-content');
                    if (notificationContent) {
                        notificationContent.innerHTML = `<span>店铺升级：分店${shop.name}升级完成，已升级为${levelName}</span>`;
                        checkScrollNeeded();
                        
                        setTimeout(() => {
                            notificationContent.innerHTML = '';
                            checkScrollNeeded();
                        }, 3000);
                    }
                }
            }
        });
    }
    
    // 更新UI以反映完成的升级
    updateShopLevelsDisplay();
    if (typeof updateUI === 'function') {
        updateUI();
    }
}

// 导出模块
export {
    shopData,
    updateShopInfo,
    updateStaffInfo,
    openShop,
    confirmExpenseStaffLevel,
    getStaffLevelText,
    updateOverallStaffLevel,
    updateStaffExpense,
    addOneBillion,
    confirmStaffLevel,
    updateTotalStaffCount,
    updateShopButtonStatus,
    upgradeShopLevel,
    updateShopLevelsDisplay,
    openUpgradeModal,
    closeUpgradeModal,
    updateUpgradeQuantity,
    confirmUpgrade,
    showShopList,
    closeShopListModal,
    calculateRadiationPopulation,
    checkUpgradeConstruction
};
