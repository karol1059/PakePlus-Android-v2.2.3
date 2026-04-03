// 游戏数据模块

import { generateMovieName } from './nameGenerator.js';

// 游戏数据
const gameData = {
    money: 500000,
    todayRevenue: 0,
    todayBoxOffice: 0,
    todayProductRevenue: 0,
    todayExpense: 0,
    weekBoxOffice: 0,
    productSales: 0,
    dailyPassengers: 0,
    reputation: 80,
    cinemaName: '', // 影院名称
    cinemaLevel: '县城影院',
    shopCount: 1,
    maxShopCount: 1,
    expandProgress: 40,
    popularity: 10, // 初始知名度，确保游戏初期有一定的粉丝数量
    radiationPopulation: 100000, // 辐射人群
    fanCount: 0, // 粉丝数量
    movieViewers: 0, // 观影人数
    arrivalCount: 0, // 到店人数
    date: {
        year: 1,
        month: 6,
        day: 1
    },
    weekDay: 4, // 0-6，0表示周日，4表示周四（6月1日）
    lunarDate: '农历四月廿八',
    // 农历内部计数
    lunarCounter: {
        month: 3, // 农历月份索引（0-11），四月对应索引3
        day: 27   // 农历日期索引（0-29），廿八对应索引27
    },
    currentSchedule: '', // 当前档期
    // 支出相关
    expenses: {
        annualRent: 180000,  // 年租金（500元/天 × 360天）
        monthlyUtilities: 6000,  // 月水电费（200元/天 × 30天）
        monthlySalaries: 9000   // 月人员工资（3人 × 3000元/人）
    },
    // 月度进货支出
    monthlyPurchaseExpense: 0,
    // 月度维护支出
    monthlyMaintenanceExpense: 0,

    // 月度宣传费用
    monthlyPromotionCost: 0,
    // 设备相关
    equipment: {
        totalValue: 200000,  // 设备总价值（按开店设备金额总和计算）
        depreciationRate: 0.1,  // 年折旧率10%
        currentValue: 200000,  // 设备当前价值
        maintenanceRates: {
            weekly: 0.005,    // 周维护率0.5%
            monthly: 0.015,   // 月维护率1.5%
            quarterly: 0.04,  // 季维护率4%
            yearly: 0.12      // 年维护率12%
        },
        故障率: 0.05, // 基础故障率
        last故障Date: null,
        current故障: null,
        故障History: []
    },
    // 空调相关
    airConditioner: {
        status: 2, // 0: 不开, 1: 半开, 2: 全开
        complaintRate: 0, // 客诉率
        lastComplaintDate: null,
        electricityRates: {
            0: 0,      // 不开：不增加电费
            1: 0.5,    // 半开：增加50%电费
            2: 1.0     // 全开：增加100%电费
        }
    },
    // 客诉相关
    complaints: {
        todayCount: 0,
        totalCount: 0,
        totalReputationLoss: 0,
        totalBoxOfficeLoss: 0
    },
    // 设备维护相关
    maintenance: {
        cycle: 'monthly', // 维护周期：weekly, monthly, quarterly, yearly
        lastMaintenanceDate: {
            year: 1,
            month: 6,
            day: 1
        },
        nextMaintenanceDate: {
            year: 1,
            month: 7,
            day: 1
        }
    },
    // 支出计数
    expenseCounters: {
        days: 0,  // 累计天数
        months: 0, // 累计月数
        years: 0   // 累计年数
    },
    movies: [
        { id: 1, name: '', type: '动作', schedule: 30, tier: 1, releaseDay: 1, daysReleased: 0, inSchedule: true }, // 1档（高优先级）
        { id: 2, name: '', type: '喜剧', schedule: 25, tier: 2, releaseDay: 1, daysReleased: 0, inSchedule: true }, // 2档（中优先级）
        { id: 3, name: '', type: '爱情', schedule: 20, tier: 3, releaseDay: 1, daysReleased: 0, inSchedule: true }, // 3档（低优先级）
        { id: 4, name: '', type: '科幻', schedule: 25, tier: 1, releaseDay: 1, daysReleased: 0, inSchedule: true }  // 1档（高优先级）
    ],
    newMovieCounter: 0, // 新片计数器
    weekCounter: 0, // 周计数器
    products: [
        { id: 1, name: '爆米花', type: '基础商品', price: 15, stock: 100, todaySales: 0 },
        { id: 2, name: '可乐', type: '基础商品', price: 10, stock: 80, todaySales: 0 },
        { id: 3, name: '电影周边', type: '衍生品', price: 50, stock: 30, todaySales: 0 }
    ],
    shopLevels: {
        d: 1,
        c: 0,
        b: 0,
        a: 0
    },
    gameTime: 0,
    level: 1,
    achievements: 0,
    boxOfficeHistory: Array(30).fill(0), // 30天票房历史数据
    productSalesHistory: Array(30).fill(0), // 30天卖品收入历史数据
    marketShareHistory: Array(30).fill(0), // 30天市场份额历史数据
    timePaused: false, // 时间暂停标志
    modalCount: 0, // 弹窗计数器，用于跟踪当前打开的弹窗数量
    cooperationOpportunities: {}, // 合作机会管理
    // 合作相关数据
    cooperation: {
        monthlyIncome: 0, // 每月合作收入
        oneTimeIncome: 0, // 单次合作收入（当月显示，次月清除）
        activeCooperations: [] // 活跃的合作项目
    },
    // 宣传相关数据
    promotions: {
        todayPromotionCount: 0, // 今日宣传次数
        monthlyPromotionCount: 0, // 月度宣传次数
        monthlyPromotionExtra: 0, // 月度额外宣传次数（通过广告获得）
        totalPromotionCost: 0, // 累计宣传费用
        totalPopularityGained: 0, // 累计知名度提升
        lastPromotionDate: { // 最后一次宣传的日期
            year: 0,
            month: 0,
            day: 0
        },
        lastPromotionMonth: { // 最后一次宣传的月份
            year: 0,
            month: 0
        }
    },
    // 破产相关数据
    bankruptcy: {
        count: 0, // 累计破产次数
        achievements: [] // 破产成就
    },
    // 累计统计数据
    totalRevenue: 0, // 累计收入
    totalScheduleCount: 0, // 累计排片次数
    totalPurchaseCount: 0, // 累计进货次数
    totalViewers: 0, // 累计观影人数
    totalScreenings: 0, // 累计放映场次
    totalMoviesScreened: 0, // 累计放映片数
    totalShopCount: 1, // 累计开店数
    // 大盘数据
    dailyMarketData: 0, // 每日大盘数据
    marketLevel: '县级', // 市场级别
    // 月度收支记录
    monthlyRecords: [], // 存储每月收支明细
    // 年度收支记录
    annualRecords: [], // 存储每年收支明细
    // 宣传提示相关
    lastPromotionReminderWeek: -1, // 上次提示宣传的周数
    promotionReminderEnabled: true // 是否启用宣传提示
};

// 重置游戏数据
function resetGameData() {
    // 保存累计统计数据
    const totalRevenue = gameData.totalRevenue;
    const totalScheduleCount = gameData.totalScheduleCount;
    const totalPurchaseCount = gameData.totalPurchaseCount;
    const totalViewers = gameData.totalViewers;
    const totalScreenings = gameData.totalScreenings;
    const totalMoviesScreened = gameData.totalMoviesScreened;
    const totalShopCount = gameData.totalShopCount || 1;
    const bankruptcyCount = gameData.bankruptcy.count;
    const achievements = [...gameData.bankruptcy.achievements];
    
    gameData.money = 500000;
    gameData.todayRevenue = 0;
    gameData.todayExpense = 0;
    gameData.weekBoxOffice = 0;
    gameData.productSales = 0;
    gameData.dailyPassengers = 0;
    gameData.reputation = 80;
    gameData.popularity = 0;
    gameData.radiationPopulation = 100000;
    gameData.fanCount = 0;
    gameData.movieViewers = 0;
    gameData.arrivalCount = 0;
    gameData.date = {
        year: 1,
        month: 6,
        day: 1
    };
    gameData.weekDay = 4;
    gameData.lunarCounter = {
        month: 3,
        day: 27
    };
    gameData.boxOfficeHistory = Array(30).fill(0);
    gameData.productSalesHistory = Array(30).fill(0);
    gameData.marketShareHistory = Array(30).fill(0);
    gameData.marketLevel = '县级'; // 重置市场级别为县级
    gameData.cooperationOpportunities = {}; // 重置合作机会
    gameData.cooperation = {
        monthlyIncome: 0, // 每月合作收入
        oneTimeIncome: 0, // 单次合作收入（当月显示，次月清除）
        activeCooperations: [] // 活跃的合作项目
    };
    gameData.promotions = {
        todayPromotionCount: 0,
        monthlyPromotionCount: 0,
        monthlyPromotionExtra: 0,
        totalPromotionCost: 0,
        totalPopularityGained: 0,
        lastPromotionDate: {
            year: 0,
            month: 0,
            day: 0
        },
        lastPromotionMonth: {
            year: 0,
            month: 0
        }
    };
    // 重新生成电影名字
    gameData.movies.forEach(movie => {
        movie.name = generateMovieName();
    });
    
    // 重置设备价值（初始为总店设备价值，便利店等级）
    gameData.equipment.totalValue = 200000;
    gameData.equipment.currentValue = 200000;
    
    // 初始化放映设备数量
    gameData.equipment['放映机'] = 3;
    gameData.equipment['音响设备'] = 3;
    gameData.equipment['银幕'] = 3;
    
    // 初始化设备批次信息
    gameData.equipmentBatches = {
        '放映机': [
            { batch: 1, year: 1, count: 3, electricity: 200 }
        ],
        '音响设备': [
            { batch: 1, year: 1, count: 3, electricity: 100 }
        ],
        '银幕': [
            { batch: 1, year: 1, count: 3, electricity: 0 }
        ]
    };
    
    // 重置时间暂停状态
    gameData.timePaused = false;
    // 重置弹窗计数器
    gameData.modalCount = 0;
    
    // 重置经营天数和支出计数器
    gameData.expenseCounters = {
        days: 0,
        months: 0,
        years: 0
    };
    
    // 重置月度收支记录
    gameData.monthlyRecords = [];
    // 重置年度收支记录
    gameData.annualRecords = [];
    // 重置宣传提示相关
    gameData.lastPromotionReminderWeek = -1;
    gameData.promotionReminderEnabled = true;
    // 重置月度进货支出
    gameData.monthlyPurchaseExpense = 0;
    // 重置月度维护支出
    gameData.monthlyMaintenanceExpense = 0;
    // 重置月度宣传费用
    gameData.monthlyPromotionCost = 0;
    
    // 注意：不要重置cinemaName和bankruptcy，破产次数需要累计
    // 注意：不要重置cinemaName，它会在startNewGame中重新设置
    
    // 恢复累计统计数据
    gameData.totalRevenue = totalRevenue;
    gameData.totalScheduleCount = totalScheduleCount;
    gameData.totalPurchaseCount = totalPurchaseCount;
    gameData.totalViewers = totalViewers;
    gameData.totalScreenings = totalScreenings;
    gameData.totalMoviesScreened = totalMoviesScreened;
    gameData.totalShopCount = totalShopCount;
    gameData.bankruptcy.count = bankruptcyCount;
    gameData.bankruptcy.achievements = achievements;
}

// 保存游戏进度到本地存储
function saveGameProgress() {
    localStorage.setItem('hasSavedGame', 'true');
    localStorage.setItem('gameData', JSON.stringify(gameData));
}

// 从本地存储加载游戏进度
function loadGameProgress() {
    const savedData = localStorage.getItem('gameData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        // 恢复游戏数据
        Object.assign(gameData, parsedData);
        
        // 确保合作收入数据存在
        if (!gameData.cooperation) {
            gameData.cooperation = {
                monthlyIncome: 0,
                activeCooperations: []
            };
        }
    }
}

// 检查本地存储中的游戏进度
function checkGameProgress() {
    const hasSavedGame = localStorage.getItem('hasSavedGame');
    const continueBtn = document.getElementById('continue-btn');
    const loadGameBtn = document.getElementById('load-game-btn');
    
    if (hasSavedGame === 'true' && continueBtn) {
        // 从本地存储加载游戏数据，更新按钮文本
        const savedData = localStorage.getItem('gameData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // 格式化游戏时间
            const gameTime = `${parsedData.date.year}年${parsedData.date.month}月${parsedData.date.day}日`;
            // 格式化资产
            const formattedAssets = formatAssets(parsedData.money);
            // 获取影院名称
            let cinemaName = parsedData.cinemaName || '未命名影院';
            // 更新按钮HTML，使用换行和小字显示
            const shopCount = (parsedData.shops ? parsedData.shops.length : 0) + 1; // 加1包含总店
            const isCinemaChain = shopCount > 100;
            let displayName = cinemaName;
            
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
            } else {
                // 不添加"影都"后缀，避免重复
            }
            
            const shopText = shopCount > 1 ? ` (${shopCount}家)` : ''; // 只有1家时不显示
            continueBtn.innerHTML = `继续游戏<br>${displayName}${shopText} | ${gameTime} | 资产: ¥${formattedAssets}`;
        }
        continueBtn.style.display = 'block';
    }
    
    // 检查是否有手动存档
    if (loadGameBtn) {
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
                    reject('IndexedDB初始化失败');
                };
            });
        }
        
        // 检查是否有存档
        async function checkSaves() {
            try {
                const db = await initIndexedDB();
                const transaction = db.transaction('saves', 'readonly');
                const store = transaction.objectStore('saves');
                
                let hasManualSave = false;
                
                for (let i = 1; i <= 3; i++) {
                    const saveData = await new Promise((resolve, reject) => {
                        const request = store.get(i);
                        request.onsuccess = function(event) {
                            resolve(event.target.result);
                        };
                        request.onerror = reject;
                    });
                    
                    if (saveData) {
                        hasManualSave = true;
                        break;
                    }
                }
                
                db.close();
                loadGameBtn.style.display = hasManualSave ? 'block' : 'none';
            } catch (error) {
                console.error('检查存档失败:', error);
                loadGameBtn.style.display = 'none';
            }
        }
        
        checkSaves();
    }
    
    // 更新版本号为当前日期时间
    const versionInfo = document.getElementById('version-info');
    if (versionInfo) {
        // 代码修改标记 - 每次修改代码时，更改此值
        const codeRevision = '20260321'; // 格式：年月日
        
        // 强制设置版本号为203
        let versionCounter = 203;
        let storedRevision = '';
        
        // 存储新的版本信息
        localStorage.setItem('versionInfo', JSON.stringify({
            counter: versionCounter,
            revision: codeRevision
        }));
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        versionInfo.innerHTML = `V 1.0.${versionCounter}<br>${year}-${month}-${day} ${hours}:${minutes}`;
    }
}

// 格式化资产金额，万以下用阿拉伯数字，万以上用中文单位
function formatAssets(amount) {
    // 处理浮点数精度问题，先取整
    amount = Math.floor(amount);
    
    if (amount >= 100000000) {
        // 亿单位
        return Math.floor(amount / 100000000) + '亿';
    } else if (amount >= 10000) {
        // 万单位
        return Math.floor(amount / 10000) + '万';
    } else {
        // 万以下用阿拉伯数字
        return amount.toString();
    }
}

// 导出模块
export { gameData, resetGameData, saveGameProgress, loadGameProgress, checkGameProgress, formatAssets };
