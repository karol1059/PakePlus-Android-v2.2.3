// ExpansionManagementModule

import { gameData, formatAssets } from './gameData.js';
import { updateUI } from './gameLogic.js';
import { checkScrollNeeded } from './uiManager.js';

// ShopInfoData
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

// UpdateShopInfo
function updateShopInfo() {
    // 首先ProcessShop LevelRelated$素
    const shopLevelElement = document.getElementById('shop-level');
    if (shopLevelElement) {
        const shopLevel = shopLevelElement.value;
        const shop = shopData[shopLevel];
        
        // Check$素是否Exist
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
    
    // 获取CurrentShift System
    const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    
    // CalculateAllShop的StaffQuantityTotal和
    let totalMinStaff = 0;
    let totalLowStaff = 0;
    let totalStandardStaff = 0;
    let totalHighStaff = 0;
    
    // CalculateTotal店的StaffQuantity（Default是Convenience Store）
    const mainShop = shopData.convenience;
    totalMinStaff += mainShop.staff.min;
    totalLowStaff += mainShop.staff.low;
    totalStandardStaff += mainShop.staff.standard;
    totalHighStaff += mainShop.staff.high;
    
    // CalculateAll分店的StaffQuantity
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
    
    // Update每个Tier对应的员Quantity（考虑Shift System）
    const minStaffCountElement = document.getElementById('min-staff-count');
    const lowStaffCountElement = document.getElementById('low-staff-count');
    const standardStaffCountElement = document.getElementById('standard-staff-count');
    const highStaffCountElement = document.getElementById('high-staff-count');
    
    if (minStaffCountElement) minStaffCountElement.textContent = totalMinStaff * workSchedule;
    if (lowStaffCountElement) lowStaffCountElement.textContent = totalLowStaff * workSchedule;
    if (standardStaffCountElement) standardStaffCountElement.textContent = totalStandardStaff * workSchedule;
    if (highStaffCountElement) highStaffCountElement.textContent = totalHighStaff * workSchedule;
    
    // Update员Info
    updateStaffInfo();
}

// Update员Info
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
    // Pause Game计时
    gameData.timePaused = true;
    
    const shopLevelElement = document.getElementById('shop-level');
    
    if (shopLevelElement) {
        const shopLevel = shopLevelElement.value;
        const staffLevel = parseInt(localStorage.getItem('staffLevel')) || 3;
        const shop = shopData[shopLevel];
        
        // CalculateCurrentShopTotal数（包括Total店）
        const currentTotalShops = (gameData.totalShopCount || 1);
        
        // Check是否已达到10万Shop上限
        if (currentTotalShops >= 100000) {
            alert('已达到10万Shop上限，你已经称霸全球了，成为行业传奇！');
            // 恢复游戏计时
            gameData.timePaused = false;
            return;
        }
        
        // CalculateMaximum可开Quantity（按MaximumFundsCalculate）
        const maxCount = Math.floor(gameData.money / shop.cost);
        
        // Calculate剩余可开Quantity（不超过10万上限）
        const remainingSlots = 100000 - currentTotalShops;
        let finalMaxCount = Math.min(maxCount, remainingSlots);
        
        // Super Store需要5限制
        if (shopLevel === 'super') {
            let superShopCount = 0;
            if (gameData.shops) {
                gameData.shops.forEach(existingShop => {
                    if (existingShop.level === 'super') {
                        superShopCount++;
                    }
                });
            }
            
            // Super Store包含Total店不超过5
            if (superShopCount >= 5) {
                alert('Super StoreQuantity不能超过5！');
                // 恢复游戏计时
                gameData.timePaused = false;
                return;
            }
            
            // 限制MaximumQuantity
            const availableSuperSlots = 5 - superShopCount;
            finalMaxCount = Math.min(finalMaxCount, availableSuperSlots);
            
            if (finalMaxCount <= 0) {
                alert('FundsInsufficient或已达到Super StoreQuantity上限！');
                // 恢复游戏计时
                gameData.timePaused = false;
                return;
            }
        } else {
            // 非Super Store按Funds和Shop上限Calculate
            if (finalMaxCount <= 0) {
                alert('FundsInsufficient！');
                // 恢复游戏计时
                gameData.timePaused = false;
                return;
            }
        }
        
        // 存储Current操作的参数
        window.openShopParams = {
            shopLevel: shopLevel,
            finalMaxCount: finalMaxCount,
            shop: shop,
            staffLevel: staffLevel
        };
        
        // DisplayShopQuantityInput弹窗
            document.getElementById('shop-count-modal-message').textContent = `Enter quantity of ${getShopLevelName(shopLevel)} to open (max ${finalMaxCount}):`;
            
            // Settings滑块范围和值
            const slider = document.getElementById('shop-count-slider');
            slider.max = finalMaxCount;
            slider.value = '1';
            
            // UpdateDisplay值
            document.getElementById('shop-count-value').textContent = `Current Selection: 1`;
            
            // Display弹窗
            document.getElementById('shop-count-modal').style.display = 'flex';
        
        return; // Pause执行，等待用户Input
    }
}

// UpdateShopQuantityDisplay值
window.updateShopCountValue = function(value) {
    document.getElementById('shop-count-value').textContent = `Current Selection: ${value}`;
};

// Confirm shop quantity
window.confirmShopCount = function() {
    const params = window.openShopParams;
    if (!params) return;
    
    const countSlider = document.getElementById('shop-count-slider');
    const count = countSlider.value;
    const shopCount = parseInt(count);
    
    if (isNaN(shopCount) || shopCount < 1 || shopCount > params.finalMaxCount) {
        alert('请Input有效的Quantity！');
        return;
    }
    
    // 扣除Funds
    const totalCost = params.shop.cost * shopCount;
    gameData.money -= totalCost;
    
    // 迁移现有ShopData到范围格式
    migrateShopsToRanges();
    
    // 添加Shop范围
    addShopRange(params.shopLevel, shopCount, params.staffLevel, params.shop.rent, params.shop.equipment, params.shop.people);
    
    gameData.shopCount += shopCount;
    gameData.totalShopCount = (gameData.totalShopCount || 1) + shopCount;
    
    // UpdateTotalEquipment价值
    const totalEquipmentValue = params.shop.equipment * shopCount;
    gameData.equipment.totalValue += totalEquipmentValue;
    gameData.equipment.currentValue += totalEquipmentValue;
    
    // UpdateEquipment批timesInfo
    if (!gameData.equipmentBatches) {
        gameData.equipmentBatches = {
            'Projector': [],
            'Sound SystemEquipment': [],
            'Screen': []
        };
    }
    
    // 根据Shop LevelCalculateEquipmentQuantity
    let projectorCount = 3; // Convenience StoreDefault3台
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
    
    // CalculateTotalProjectorQuantity
    const totalProjectors = projectorCount * shopCount;
    
    // CheckCurrentYear份是否已有批times
    let existingBatch = gameData.equipmentBatches['Projector'].find(batch => batch.year === gameData.date.year);
    
    if (existingBatch) {
        // 如果CurrentYear份已有批times，Update该批times的EquipmentQuantity
        existingBatch.count += totalProjectors;
    } else {
        // 如果CurrentYear份没有批times，Create新批times
        // 限制Total批Count量为10个
        if (gameData.equipmentBatches['Projector'].length >= 10) {
            // 如果已达到10个批times，替换最早的批times
            // 按照Year份排序找到最早的批times
            const oldestBatch = gameData.equipmentBatches['Projector'].reduce((oldest, current) => {
                return current.year < oldest.year ? current : oldest;
            });
            const oldestBatchIndex = gameData.equipmentBatches['Projector'].indexOf(oldestBatch);
            if (oldestBatchIndex !== -1) {
                gameData.equipmentBatches['Projector'][oldestBatchIndex] = {
                    batch: oldestBatch.batch,
                    year: gameData.date.year,
                    count: totalProjectors,
                    electricity: 200
                };
            }
        } else {
            // 添加新批times
            const batchNumber = gameData.equipmentBatches['Projector'].length + 1;
            gameData.equipmentBatches['Projector'].push({
                batch: batchNumber,
                year: gameData.date.year,
                count: totalProjectors,
                electricity: 200
            });
        }
    }
    
    // 确保批times按Year份排序
    gameData.equipmentBatches['Projector'].sort((a, b) => a.year - b.year);
    // 重新编号批times
    gameData.equipmentBatches['Projector'].forEach((batch, index) => {
        batch.batch = index + 1;
    });
    
    // UpdateProjectorTotal数
    if (!gameData.equipment['Projector']) {
        gameData.equipment['Projector'] = 0;
    }
    gameData.equipment['Projector'] += totalProjectors;
    
    // Close弹窗
    window.closeShopCountModal();
    
    updateUI();
    
    // UpdateTotalStaffQuantity
    updateTotalStaffCount();
    
    // Check是否达到10万Shop上限
    const totalShopsAfter = (gameData.totalShopCount || 1);
    if (totalShopsAfter >= 100000) {
        alert('恭喜！你已经拥有10万Shop，称霸全球，成为行业传奇！');
    }
    
    // DisplayShop建设Notification
    showNotification(`${getShopLevelName(params.shopLevel)}建设Start：Success建设${shopCount}，花费$${formatAssets(totalCost)}，预计3个Month后开业`);
};

// CloseShopQuantityInput弹窗
window.closeShopCountModal = function() {
    document.getElementById('shop-count-modal').style.display = 'none';
    window.openShopParams = null;
    // 恢复游戏计时
    gameData.timePaused = false;
};

// 获取Shop Level名称
function getShopLevelName(level) {
    const levelNames = {
        convenience: 'Convenience Store',
        premium: 'Boutique',
        flagship: 'Flagship Store',
        super: 'Super Store'
    };
    return levelNames[level] || 'Convenience Store';
}

// InitializeShop范围Data
function initShopRanges() {
    if (!gameData.shopRanges) {
        gameData.shopRanges = [];
    }
}

// 将现有ShopData转换为范围格式
function migrateShopsToRanges() {
    if (gameData.shops && gameData.shops.length > 0) {
        initShopRanges();
        
        // 按Level分组Shop
        const shopsByLevel = {};
        gameData.shops.forEach(shop => {
            if (!shopsByLevel[shop.level]) {
                shopsByLevel[shop.level] = [];
            }
            shopsByLevel[shop.level].push(shop);
        });
        
        // 为每个LevelCreate范围
        for (const level in shopsByLevel) {
            const shops = shopsByLevel[level];
            if (shops.length > 0) {
                // 按ID排序
                shops.sort((a, b) => a.id - b.id);
                
                // Create范围
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
        
        // 清空旧的ShopData
        gameData.shops = null;
    }
}

// 添加Shop范围
function addShopRange(level, count, staffLevel, rent, equipment, people) {
    initShopRanges();
    
    // Calculate新范围的ID
    let startId = 2; // 从2Start，1是Total店
    if (gameData.shopRanges.length > 0) {
        const lastRange = gameData.shopRanges[gameData.shopRanges.length - 1];
        startId = lastRange.endId + 1;
    }
    const endId = startId + count - 1;
    
    // Create新范围
    const newRange = {
        startId: startId,
        endId: endId,
        count: count,
        level: level,
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

// 获取ShopTotal数
function getTotalShopCount() {
    let count = 1; // Total店
    if (gameData.shopRanges) {
        count += gameData.shopRanges.reduce((sum, range) => sum + range.count, 0);
    } else if (gameData.shops) {
        count += gameData.shops.length;
    }
    return count;
}

// 获取指定Level的ShopQuantity
function getShopCountByLevel(level) {
    let count = 0;
    // CheckTotal店
    if (level === 'convenience') {
        count += 1;
    }
    // Check分店
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

// CalculateTotalHall数
function calculateTotalHalls() {
    let totalHalls = 3; // Total店3个Hall
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

// CalculateTotalStaffQuantity
function calculateTotalStaff() {
    let totalStaff = 0;
    // Total店Staff
    const mainShop = shopData.convenience;
    totalStaff += mainShop.staff.standard;
    
    // 分店Staff
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

// CalculateTotalRent
function calculateTotalRent() {
    let totalRent = 0;
    // Total店Rent
    totalRent += shopData.convenience.rent;
    
    // 分店Rent
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

// 获取Shop名称
function getShopName(level) {
    const prefixes = ['星光', '银河', '环球', '时代', '未来', '梦幻', '豪华', '精品'];
    const suffixes = {
        convenience: '影城',
        premium: 'Cinema',
        flagship: '影城',
        super: 'Movie城'
    };
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix}${suffixes[level]}`;
}

// 获取员Quantity
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

// ConfirmExpense页面员ConfigurationLevel
function confirmExpenseStaffLevel(level) {
    const staffLevel = level || parseInt(localStorage.getItem('staffLevel')) || 3;
    const levelText = getStaffLevelText(staffLevel);
    
    // 获取CurrentShop Level对应的员Quantity
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
    
    // 弹窗Confirm
    if (confirm(`OK将员Configuration等级Settings为${levelText}，员Quantity为${staffCount}吗？`)) {
        localStorage.setItem('staffLevel', staffLevel);
        // Update多店员汇Total
        updateTotalStaffCount();
    } else {
        // Cancel时恢复原来的值
        const originalLevel = parseInt(localStorage.getItem('staffLevel')) || 3;
        // Update血条
        if (window.updateStaffBloodBar) {
            window.updateStaffBloodBar(originalLevel);
        }
    }
}

// 获取员ConfigurationLevel文本
function getStaffLevelText(level) {
    switch (level) {
        case 1:
            return '必备';
        case 2:
            return 'Low Config';
        case 3:
            return 'Standard Config';
        case 4:
            return 'High Config';
        default:
            return 'Standard Config';
    }
}

// CalculateReach
function calculateRadiationPopulation() {
    let totalRadiation = 0;
    
    // 根据Total店LevelCalculateReach
    let headquarterLevel = 'convenience';
    if (gameData.cinemaLevel === 'Boutique') {
        headquarterLevel = 'premium';
    } else if (gameData.cinemaLevel === 'Flagship Store') {
        headquarterLevel = 'flagship';
    } else if (gameData.cinemaLevel === 'Super Store') {
        headquarterLevel = 'super';
    }
    
    // Total店基础Reach：Seats数 × 100
    totalRadiation += shopData[headquarterLevel].seats * 100;
    
    // 根据分店CalculateReach
    if (gameData.shops) {
        gameData.shops.forEach(shop => {
            // 分店Reach：Seats数 × 50
            totalRadiation += shopData[shop.level].seats * 50;
        });
    }
    
    return totalRadiation;
}

// Update整体员ConfigurationLevel
function updateOverallStaffLevel() {
    const staffLevel = parseInt(document.getElementById('overall-staff-level').value);
    const levelText = getStaffLevelText(staffLevel);
    
    document.getElementById('current-staff-level').textContent = levelText;
    
    // 这里可以添加根据ConfigurationLevelAdjust员Quantity和Expense的逻辑
    // 例如：根据ConfigurationLevelAdjust各Type员的Quantity和Salary
}

// Update员ExpenseStatistics
function updateStaffExpense(staffCount) {
    // CalculateTotalExpense
    const monthlySalaryPerPerson = 3000; // 平均每Month薪
    const monthlyTotal = staffCount * monthlySalaryPerPerson;
    const yearlyTotal = monthlyTotal * 12;
    
    // UpdateExpenseStatistics
    const expenseSummary = document.querySelector('.expense-summary');
    if (expenseSummary) {
        expenseSummary.innerHTML = `
            <h3>员Expense汇Total</h3>
            <p>Total数：${staffCount}</p>
            <p>MonthTotalExpense：$${formatAssets(monthlyTotal)}</p>
            <p>YearTotalExpense：$${formatAssets(yearlyTotal)}</p>
        `;
    }
    
    // Update游戏Data中的Staff SalaryExpense
    gameData.expenses.monthlySalaries = monthlyTotal;
    
    // UpdateUI，包括盈亏平衡线
    updateUI();
}

// Add1亿Assets
function addOneBillion() {
    gameData.money += 100000000; // Add1亿Assets
    updateUI(); // UpdateUI
    
    // DisplayAssetsAddNotification
    showNotification('AssetsAdd：SuccessAdd1亿Assets！');
}

// Confirm员ConfigurationLevel
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
    
    // 弹窗Confirm
    if (confirm(`OK将员Configuration等级Settings为${getStaffLevelText(staffLevel)}，员Quantity为${staffCount}吗？`)) {
        document.getElementById('staff-count').textContent = staffCount;
    } else {
        // Cancel时恢复原来的值
        document.getElementById('staff-level').value = 3; // DefaultStandard Config
        document.getElementById('staff-count').textContent = shop.staff.standard;
    }
}

// Update多店员汇Total
function updateTotalStaffCount() {
    // 获取CurrentShift System
    const workSchedule = parseInt(localStorage.getItem('workSchedule')) || 2;
    
    // CalculateTotal店Staff数（Default3）
    let totalStaff = 3 * workSchedule;
    
    // CalculateAll分店Staff数
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
    
    // Update员Expense
    updateStaffExpense(totalStaff);
    
    // UpdateStaffQuantityDisplay
    const staffCountElement = document.getElementById('staff-count');
    if (staffCountElement) {
        staffCountElement.textContent = totalStaff;
    }
    
    // Updatecurrent-staff-display$素（StaffQuantity血条Display）
    const currentStaffDisplayElement = document.getElementById('current-staff-display');
    if (currentStaffDisplayElement) {
        currentStaffDisplayElement.textContent = totalStaff;
    }
    
    console.log(`Total员Quantity：${totalStaff} (${workSchedule}Shift System)`);
}

// Update开店按钮状态
function updateShopButtonStatus() {
    const openShopButton = document.querySelector('.open-shop-btn');
    if (openShopButton) {
        const shopLevelElement = document.getElementById('shop-level');
        if (shopLevelElement) {
            const shopLevel = shopLevelElement.value;
            const shop = shopData[shopLevel];
            
            // CheckFunds是否足够
            const canOpenShop = gameData.money >= shop.cost;
            
            // Settings按钮状态
            openShopButton.disabled = !canOpenShop;
        }
    }
}

// ShopUpgrade函数
function upgradeShopLevel(currentLevel) {
    // Check是否为Super Store
    if (currentLevel === 'super') {
        alert('Super Store不Available！');
        return;
    }
    
    // OK目标Level
    const levelOrder = ['convenience', 'premium', 'flagship', 'super'];
    const currentIndex = levelOrder.indexOf(currentLevel);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= levelOrder.length) {
        alert('已经是最高Level了！');
        return;
    }
    
    const targetLevel = levelOrder[nextIndex];
    const currentShop = shopData[currentLevel];
    const targetShop = shopData[targetLevel];
    
    // CalculateUpgradeCost（价差*1.2）
    const costDifference = targetShop.cost - currentShop.cost;
    const upgradeCost = Math.round(costDifference * 1.2);
    
    // CalculateMaximumAvailableQuantity
    const maxCount = Math.floor(gameData.money / upgradeCost);
    
    // StatisticsAvailable的ShopQuantity
    let availableCount = 0;
    
    // CheckTotal店
    let headquarterLevel = 'convenience';
    if (gameData.cinemaLevel === 'Boutique') {
        headquarterLevel = 'premium';
    } else if (gameData.cinemaLevel === 'Flagship Store') {
        headquarterLevel = 'flagship';
    } else if (gameData.cinemaLevel === 'Super Store') {
        headquarterLevel = 'super';
    }
    
    if (headquarterLevel === currentLevel) {
        availableCount++;
    }
    
    // Check分店
    if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.level === currentLevel && shop.status === 'Operating') {
                availableCount++;
            }
        });
    }
    
    // 按MaximumFundsDisplayMaximumQuantity
    const finalMaxCount = Math.min(maxCount, availableCount);
    
    if (finalMaxCount <= 0) {
        alert('FundsInsufficient或没有Available的Shop！');
        return;
    }
    
    // 让用户SelectQuantity
    const count = prompt(`请输入要Upgrade的${getShopLevelName(currentLevel)}Quantity（最多${finalMaxCount}）：`, '1');
    const upgradeCount = parseInt(count);
    
    if (isNaN(upgradeCount) || upgradeCount < 1 || upgradeCount > finalMaxCount) {
        alert('请Input有效的Quantity！');
        return;
    }
    
    // 扣除Funds
    const totalCost = upgradeCost * upgradeCount;
    gameData.money -= totalCost;
    
    // 查找需要Upgrade的Shop
    let upgradedCount = 0;
    
    // UpgradeTotal店（如果Total店是CurrentLevel且Operating）
    if (headquarterLevel === currentLevel && upgradedCount < upgradeCount) {
        // CheckTotal店是否需要Upgrade
        if (gameData.cinemaLevel !== 'Super Store') {
            // UpdateTotal店Level
            gameData.cinemaLevel = getShopLevelName(targetLevel);
            upgradedCount++;
        }
    }
    
    // Upgrade分店
    if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.level === currentLevel && shop.status === 'Operating' && upgradedCount < upgradeCount) {
                shop.level = targetLevel;
                // 更可靠的Shop名称Update逻辑
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
    
    // Check是否有Shop被Upgrade
    if (upgradedCount > 0) {
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>ShopUpgrade：SuccessUpgrade${upgradedCount}${getShopLevelName(currentLevel)}为${getShopLevelName(targetLevel)}，扣除UpgradeCost$${formatAssets(totalCost)}</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    } else {
        alert('没有Available的Shop！');
        // 退还UpgradeCost
        gameData.money += totalCost;
        return;
    }
    
    // UpdateUI
    updateShopLevelsDisplay();
    updateUI();
}

// UpdateShop LevelDisplay
function updateShopLevelsDisplay() {
    // Statistics各LevelShopQuantity，区分Operating和Under Construction
    const levelCounts = {
        convenience: { operating: 0, building: 0 },
        premium: { operating: 0, building: 0 },
        flagship: { operating: 0, building: 0 },
        super: { operating: 0, building: 0 }
    };
    
    // 加上Total店，Use实际Level和状态
    let headquarterLevel = 'convenience';
    if (gameData.cinemaLevel === 'Boutique') {
        headquarterLevel = 'premium';
    } else if (gameData.cinemaLevel === 'Flagship Store') {
        headquarterLevel = 'flagship';
    } else if (gameData.cinemaLevel === 'Super Store') {
        headquarterLevel = 'super';
    }
    
    // CheckTotal店状态
    if (gameData.headquarterStatus === 'Under Construction' && gameData.headquarterUpgrade) {
        // Total店Upgrade中，计入目标Level的Under Construction
        const targetLevel = gameData.headquarterUpgrade.targetLevel;
        levelCounts[targetLevel].building += 1;
    } else {
        // Total店Normal营业，计入CurrentLevel的Operating
        levelCounts[headquarterLevel].operating += 1;
    }
    
    if (gameData.shopRanges) {
        gameData.shopRanges.forEach(range => {
            // Shop范围Default按OperatingProcess
            if (levelCounts.hasOwnProperty(range.level)) {
                levelCounts[range.level].operating += range.count;
            }
        });
    } else if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.status === 'Under Construction' && shop.upgradeTargetLevel) {
                // ShopUpgrade中，计入目标Level的Under Construction
                const targetLevel = shop.upgradeTargetLevel;
                if (levelCounts.hasOwnProperty(targetLevel)) {
                    levelCounts[targetLevel].building++;
                }
            } else if (levelCounts.hasOwnProperty(shop.level)) {
                // ShopNormal营业或非UpgradeUnder Construction，计入CurrentLevel
                if (shop.status === 'Operating') {
                    levelCounts[shop.level].operating++;
                } else if (shop.status === 'Under Construction') {
                    levelCounts[shop.level].building++;
                }
            }
        });
    }
    
    // UpdateDisplay，区分Operating和Under Construction（可Click查看Details）
    document.getElementById('d-level-count').innerHTML = `<span class="clickable-status" onclick="showShopList('convenience', 'Operating')">Operating: ${levelCounts.convenience.operating}</span> <span class="clickable-status" onclick="showShopList('convenience', 'Under Construction')">Under Construction: ${levelCounts.convenience.building}</span>`;
    document.getElementById('c-level-count').innerHTML = `<span class="clickable-status" onclick="showShopList('premium', 'Operating')">Operating: ${levelCounts.premium.operating}</span> <span class="clickable-status" onclick="showShopList('premium', 'Under Construction')">Under Construction: ${levelCounts.premium.building}</span>`;
    document.getElementById('b-level-count').innerHTML = `<span class="clickable-status" onclick="showShopList('flagship', 'Operating')">Operating: ${levelCounts.flagship.operating}</span> <span class="clickable-status" onclick="showShopList('flagship', 'Under Construction')">Under Construction: ${levelCounts.flagship.building}</span>`;
    document.getElementById('a-level-count').innerHTML = `<span class="clickable-status" onclick="showShopList('super', 'Operating')">Operating: ${levelCounts.super.operating}</span> <span class="clickable-status" onclick="showShopList('super', 'Under Construction')">Under Construction: ${levelCounts.super.building}</span>`;
    
    // UpdateUpgrade按钮状态
    const upgradeButtons = document.querySelectorAll('.upgrade-btn');
    upgradeButtons.forEach(button => {
        // 修复：匹配openUpgradeModal函数中的Level参数
        const match = button.getAttribute('onclick').match(/openUpgradeModal\('([^']+)'\)/);
        if (match) {
            const level = match[1];
            if (level === 'super') {
                button.disabled = true;
            } else {
                // CheckUpgrade条件是否满足
                const levelOrder = ['convenience', 'premium', 'flagship', 'super'];
                const currentIndex = levelOrder.indexOf(level);
                const nextIndex = currentIndex + 1;
                
                if (nextIndex < levelOrder.length) {
                    const targetLevel = levelOrder[nextIndex];
                    const currentShop = shopData[level];
                    const targetShop = shopData[targetLevel];
                    
                    // CalculateUpgradeCost
                    const costDifference = targetShop.cost - currentShop.cost;
                    const upgradeCost = Math.round(costDifference * 1.2);
                    
                    // CheckSuper Store是否已满
                    let superShopCount = 0;
                    if (gameData.shops) {
                        gameData.shops.forEach(shop => {
                            if (shop.level === 'super') {
                                superShopCount++;
                            }
                        });
                    }
                    
                    // Check是否有Available的Shop
                    let hasUpgradeableShops = false;
                    
                    // CheckTotal店
                    let headquarterLevel = 'convenience';
                    if (gameData.cinemaLevel === 'Boutique') {
                        headquarterLevel = 'premium';
                    } else if (gameData.cinemaLevel === 'Flagship Store') {
                        headquarterLevel = 'flagship';
                    } else if (gameData.cinemaLevel === 'Super Store') {
                        headquarterLevel = 'super';
                    }
                    
                    if (headquarterLevel === level) {
                        hasUpgradeableShops = true;
                    }
                    
                    // Check分店
                    if (gameData.shops) {
                        gameData.shops.forEach(shop => {
                            if (shop.level === level && shop.status === 'Operating') {
                                hasUpgradeableShops = true;
                            }
                        });
                    }
                    
                    // CheckUpgrade条件
                    // 只有当目标是Super Store时，才CheckSuper StoreQuantity限制
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

// ShopUpgrade弹窗相关函数
let currentUpgradeLevel = '';
let selectedUpgradeCount = 1;

// OpenUpgrade弹窗
function openUpgradeModal(level) {
    // Pause Game计时
    gameData.timePaused = true;
    
    currentUpgradeLevel = level;
    selectedUpgradeCount = 1;
    
    // Check是否为Super Store
    if (level === 'super') {
        alert('Super Store不Available！');
        // 恢复游戏计时
        gameData.timePaused = false;
        return;
    }
    
    // OK目标Level
    const levelOrder = ['convenience', 'premium', 'flagship', 'super'];
    const currentIndex = levelOrder.indexOf(level);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= levelOrder.length) {
        alert('已经是最高Level了！');
        // 恢复游戏计时
        gameData.timePaused = false;
        return;
    }
    
    const targetLevel = levelOrder[nextIndex];
    const currentShop = shopData[level];
    const targetShop = shopData[targetLevel];
    
    // CalculateUpgradeCost
    const costDifference = targetShop.cost - currentShop.cost;
    const upgradeCost = Math.round(costDifference * 1.2);
    
    // StatisticsAvailable的ShopQuantity
    let availableCount = 0;
    if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.level === level && shop.status === 'Operating') {
                availableCount++;
            }
        });
    }
    
    // 加上Total店（根据Total店CurrentLevel判断）
    let headquarterLevel = 'convenience';
    if (gameData.cinemaLevel === 'Boutique') {
        headquarterLevel = 'premium';
    } else if (gameData.cinemaLevel === 'Flagship Store') {
        headquarterLevel = 'flagship';
    } else if (gameData.cinemaLevel === 'Super Store') {
        headquarterLevel = 'super';
    }
    
    if (headquarterLevel === level) {
        availableCount++;
    }
    
    // Update弹窗内容
    document.getElementById('upgrade-title').textContent = `${getShopLevelName(level)} → ${getShopLevelName(targetLevel)}`;
    document.getElementById('upgrade-description').textContent = `将${getShopLevelName(level)}Upgrade为${getShopLevelName(targetLevel)}，提升Shop Level和Income。`;
    document.getElementById('upgrade-cost').textContent = `Upgrade Cost: $${formatAssets(upgradeCost)}/`;
    document.getElementById('available-shops').textContent = `AvailableShop：${availableCount}`;
    
    // CalculateMaximumAvailableQuantity（按FundsCalculate）
    const maxByMoney = Math.floor(gameData.money / upgradeCost);
    
    // CalculateSuper Store限制（如果目标是Super Store）
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
        // CheckTotal店是否是Super Store
        if (gameData.cinemaLevel === 'Super Store') {
            currentSuperCount++;
        }
        // Calculate剩余Super Store槽位
        maxBySuperLimit = Math.max(0, 5 - currentSuperCount);
    }
    
    // MaximumAvailableQuantity = AvailableShopQuantity、Funds允许的Quantity和Super Store限制中的较小值
    const maxUpgradeCount = Math.min(availableCount, maxByMoney, maxBySuperLimit);
    
    // Settings滑块范围
    const slider = document.getElementById('upgrade-quantity-slider');
    slider.max = maxUpgradeCount;
    slider.value = 1;
    updateUpgradeQuantity(1);
    
    // Display弹窗
    document.getElementById('upgrade-modal').style.display = 'flex';
}

// CloseUpgrade弹窗
function closeUpgradeModal() {
    document.getElementById('upgrade-modal').style.display = 'none';
    currentUpgradeLevel = '';
    selectedUpgradeCount = 1;
    // 恢复游戏计时
    gameData.timePaused = false;
}

// UpdateUpgradeQuantity
function updateUpgradeQuantity(value) {
    selectedUpgradeCount = parseInt(value);
    document.getElementById('upgrade-quantity-value').textContent = `Current Selection: ${selectedUpgradeCount}`;
    
    // UpdateUpgradeCost
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
            
            document.getElementById('upgrade-cost').textContent = `Upgrade Cost: $${formatAssets(upgradeCost)}/ (Total计：$${formatAssets(totalCost)})`;
        }
    }
}

// ConfirmUpgrade
function confirmUpgrade() {
    if (!currentUpgradeLevel) return;
    
    // OK目标Level
    const levelOrder = ['convenience', 'premium', 'flagship', 'super'];
    const currentIndex = levelOrder.indexOf(currentUpgradeLevel);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= levelOrder.length) {
        alert('已经是最高Level了！');
        closeUpgradeModal();
        return;
    }
    
    const targetLevel = levelOrder[nextIndex];
    const currentShop = shopData[currentUpgradeLevel];
    const targetShop = shopData[targetLevel];
    
    // CalculateUpgradeCost
    const costDifference = targetShop.cost - currentShop.cost;
    const upgradeCostPerShop = Math.round(costDifference * 1.2);
    const totalCost = upgradeCostPerShop * selectedUpgradeCount;
    
    // CheckFunds是否足够
    if (gameData.money < totalCost) {
        alert(`FundsInsufficient，Upgrade${selectedUpgradeCount}Shop需要$${formatAssets(totalCost)}！`);
        return;
    }
    
    // CheckSuper StoreQuantity限制
    if (targetLevel === 'super') {
        let superShopCount = 0;
        if (gameData.shops) {
            gameData.shops.forEach(shop => {
                if (shop.level === 'super') {
                    superShopCount++;
                }
            });
        }
        
        // CheckTotal店是否是Super Store
        if (gameData.cinemaLevel === 'Super Store') {
            superShopCount++;
        }
        
        if (superShopCount + selectedUpgradeCount > 5) {
            alert('Super StoreQuantity不能超过5！');
            return;
        }
    }
    
    // 扣除UpgradeCost
    gameData.money -= totalCost;
    
    // UpgradeShop
    let upgradedCount = 0;
    
    // UpgradeTotal店（如果Total店是CurrentLevel且Operating）
    let headquarterLevel = 'convenience';
    if (gameData.cinemaLevel === 'Boutique') {
        headquarterLevel = 'premium';
    } else if (gameData.cinemaLevel === 'Flagship Store') {
        headquarterLevel = 'flagship';
    } else if (gameData.cinemaLevel === 'Super Store') {
        headquarterLevel = 'super';
    }
    
    if (headquarterLevel === currentUpgradeLevel && upgradedCount < selectedUpgradeCount) {
        // CheckTotal店是否需要Upgrade
        if (gameData.cinemaLevel !== 'Super Store') {
            // StartUpgradeTotal店，Settings为Under Construction
            gameData.headquarterStatus = 'Under Construction';
            gameData.headquarterUpgrade = {
                targetLevel: targetLevel,
                startDate: {...gameData.date}
            };
            upgradedCount++;
        }
    }
    
    // Upgrade分店
    if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.level === currentUpgradeLevel && shop.status === 'Operating' && upgradedCount < selectedUpgradeCount) {
                // StartUpgrade分店，Settings为Under Construction
                shop.status = 'Under Construction';
                shop.upgradeStartDate = {...gameData.date};
                shop.upgradeTargetLevel = targetLevel;
                // 移除opening Days属性，避免被checkShopOpening函数ErrorProcess
                delete shop.openingDays;
                upgradedCount++;
            }
        });
    }
    
    // Check是否有Shop被Upgrade
    if (upgradedCount > 0) {
        const notificationContent = document.getElementById('notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = `<span>ShopUpgrade：SuccessUpgrade${upgradedCount}${getShopLevelName(currentUpgradeLevel)}为${getShopLevelName(targetLevel)}，扣除UpgradeCost$${formatAssets(totalCost)}</span>`;
            checkScrollNeeded();
            
            setTimeout(() => {
                notificationContent.innerHTML = '';
                checkScrollNeeded();
            }, 3000);
        }
    } else {
        alert('没有Available的Shop！');
        // 退还UpgradeCost
        gameData.money += totalCost;
        closeUpgradeModal();
        return;
    }
    
    // UpdateUI
    updateShopLevelsDisplay();
    updateUI();
    
    // Close弹窗
    closeUpgradeModal();
}

// DisplayShop列表弹窗
function showShopList(level, status) {
    // Pause Game计时
    gameData.timePaused = true;
    
    // 过滤出符合条件的Shop
    const filteredShops = [];
    
    // CheckTotal店
    if (status === 'Operating') {
        // OKTotal店的实际Level
        let headquarterLevel = 'convenience';
        if (gameData.cinemaLevel === 'Boutique') {
            headquarterLevel = 'premium';
        } else if (gameData.cinemaLevel === 'Flagship Store') {
            headquarterLevel = 'flagship';
        } else if (gameData.cinemaLevel === 'Super Store') {
            headquarterLevel = 'super';
        }
        
        // 只在匹配Current筛选Level时添加Total店
        if (headquarterLevel === level) {
            filteredShops.push({ id: 1, name: '1Store（Total店）', level: headquarterLevel, status: 'Operating' });
        }
    } else if (status === 'Under Construction') {
        // CheckTotal店是否在Upgrade中且目标Level是Current筛选Level
        if (gameData.headquarterStatus === 'Under Construction' && gameData.headquarterUpgrade && gameData.headquarterUpgrade.targetLevel === level) {
            filteredShops.push({ id: 1, name: '1Store（Total店）', level: gameData.headquarterUpgrade.targetLevel, status: 'Under Construction' });
        }
    }
    
    // Check分店
    if (gameData.shopRanges) {
        gameData.shopRanges.forEach(range => {
            if (range.level === level) {
                // Shop范围Default按OperatingProcess
                if (status === 'Operating') {
                    filteredShops.push({
                        id: range.startId,
                        name: `${range.startId}-${range.endId}号${getShopLevelName(range.level)}`,
                        level: range.level,
                        status: 'Operating',
                        count: range.count
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
    
    // Update弹窗标题
    const modalTitle = document.getElementById('shop-list-modal-title');
    if (modalTitle) {
        modalTitle.textContent = `${getShopLevelName(level)} - ${status}Shop列表`;
    }
    
    // 生成Shop列表HTML
    const modalContent = document.getElementById('shop-list-modal-content');
    if (modalContent) {
        if (filteredShops.length > 0) {
            // 为不同状态Settings不同的标注样式
            const statusClass = status === 'Operating' ? 'status-operating' : 'status-building';
            const statusColor = status === 'Operating' ? '#4CAF50' : '#FF9800';
            
            let listHTML = `
                <div class="shop-list-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h4 style="margin: 0; color: #333;">${getShopLevelName(level)} - <span class="${statusClass}" style="color: ${statusColor}; font-weight: bold;">${status}</span></h4>
                    <span class="shop-count-badge" style="background-color: ${statusColor}; color: white; padding: 4px 12px; border-radius: 14px; font-size: 13px; font-weight: bold;">${filteredShops.length}</span>
                </div>
                <div class="shop-list-container" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; border-left: 4px solid ${statusColor};">
            `;
            
            filteredShops.forEach(shop => {
                // 优化Shop名称Display，1.2.3.Store省略Display
                let displayName = shop.name;
                if (shop.name.includes('Store')) {
                    displayName = shop.name.replace(/Store.*$/, 'Store');
                }
                
                // 获取Shop Level名称，Under Construction且有Upgrade目标时Use目标Level
                const displayLevel = shop.status === 'Under Construction' && shop.upgradeTargetLevel ? shop.upgradeTargetLevel : shop.level;
                const levelName = getShopLevelName(displayLevel);
                
                // 为不同状态Settings不同的样式
                const shopStatusClass = shop.status === 'Operating' ? 'shop-status-operating' : 'shop-status-building';
                const shopStatusColor = shop.status === 'Operating' ? '#4CAF50' : '#FF9800';
                
                listHTML += `
                    <div class="shop-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background-color: white; border-radius: 6px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 3px solid ${shopStatusColor}; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                        <div class="shop-info" style="flex: 1;">
                            <div class="shop-name" style="font-weight: bold; color: #333; margin-bottom: 4px;">${displayName}</div>
                            <div class="shop-details" style="font-size: 13px; color: #666;">
                                ${levelName} · ${shop.status}
                                ${shop.count ? ` · Quantity：${shop.count}` : ''}
                                ${shop.status !== 'Operating' ? (shop.upgradeStartDate ? ` · Expected Opening：${Math.max(0, 30 - (gameData.date.days - shop.upgradeStartDate.days))} Days` : shop.openingDays ? ` · Expected Opening：${Math.max(0, shop.openingDays - gameData.expenseCounters.days)} Days` : '') : ''}
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
            // 无Shop时的Display
            const statusColor = status === 'Operating' ? '#4CAF50' : '#FF9800';
            modalContent.innerHTML = `
                <div class="no-shops" style="text-align: center; padding: 40px 20px; background-color: #f9f9f9; border-radius: 8px; border: 2px dashed #ddd;">
                    <div style="font-size: 64px; margin-bottom: 20px;">🏪</div>
                    <p style="margin: 0 0 10px 0; color: #666; font-size: 16px;">No${getShopLevelName(level)} - <span style="color: ${statusColor}; font-weight: bold;">${status}</span>的Shop</p>
                    <p style="margin: 0; color: #999; font-size: 14px;">Please check again later</p>
                </div>
            `;
        }
    }
    
    // Display弹窗
    const modal = document.getElementById('shop-list-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// CloseShop列表弹窗
function closeShopListModal() {
    const modal = document.getElementById('shop-list-modal');
    if (modal) {
        modal.style.display = 'none';
        // 恢复游戏计时
        gameData.timePaused = false;
    }
}

// Check并完成Upgrade建设
function checkUpgradeConstruction() {
    // CheckTotal店Upgrade
    if (gameData.headquarterStatus === 'Under Construction' && gameData.headquarterUpgrade) {
        const upgrade = gameData.headquarterUpgrade;
        const monthsPassed = (gameData.date.year - upgrade.startDate.year) * 12 + (gameData.date.month - upgrade.startDate.month);
        
        if (monthsPassed >= 1) {
            // 完成Total店Upgrade
            gameData.cinemaLevel = getShopLevelName(upgrade.targetLevel);
            gameData.headquarterStatus = 'Operating';
            delete gameData.headquarterUpgrade;
            
            // DisplayUpgrade完成Notification
            const notificationContent = document.getElementById('notification-content');
            if (notificationContent) {
                notificationContent.innerHTML = `<span>ShopUpgrade：Total店Upgrade完成，Upgraded为${getShopLevelName(upgrade.targetLevel)}</span>`;
                checkScrollNeeded();
                
                setTimeout(() => {
                    notificationContent.innerHTML = '';
                    checkScrollNeeded();
                }, 3000);
            }
        }
    }
    
    // Check分店Upgrade
    if (gameData.shops) {
        gameData.shops.forEach(shop => {
            if (shop.status === 'Under Construction' && shop.upgradeStartDate && shop.upgradeTargetLevel) {
                const monthsPassed = (gameData.date.year - shop.upgradeStartDate.year) * 12 + (gameData.date.month - shop.upgradeStartDate.month);
                
                if (monthsPassed >= 1) {
                    // 完成分店Upgrade
                    shop.level = shop.upgradeTargetLevel;
                    shop.status = 'Operating';
                    
                    // UpdateShop名称
                    const levelName = getShopLevelName(shop.upgradeTargetLevel);
                    if (shop.name.includes('号')) {
                        shop.name = shop.name.replace(/号.*$/, `号${levelName}`);
                    } else {
                        shop.name += `(${levelName})`;
                    }
                    
                    // UpdateShop属性
                    const targetShop = shopData[shop.upgradeTargetLevel];
                    shop.rent = targetShop.rent;
                    shop.equipment = targetShop.equipment;
                    shop.people = targetShop.people;
                    
                    // ClearUpgradeData
                    delete shop.upgradeStartDate;
                    delete shop.upgradeTargetLevel;
                    
                    // DisplayUpgrade完成Notification
                    const notificationContent = document.getElementById('notification-content');
                    if (notificationContent) {
                        notificationContent.innerHTML = `<span>ShopUpgrade：分店${shop.name}Upgrade完成，Upgraded为${levelName}</span>`;
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
    
    // UpdateUI以反映完成的Upgrade
    updateShopLevelsDisplay();
    if (typeof updateUI === 'function') {
        updateUI();
    }
}

// 导出Module
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
