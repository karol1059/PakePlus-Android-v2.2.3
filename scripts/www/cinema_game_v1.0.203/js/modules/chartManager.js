// 图表管理模块

import { gameData } from './gameData.js';

// 获取当前活跃页面
function getActivePage() {
    const activePage = document.querySelector('.page.active');
    return activePage ? activePage.id : 'home';
}

// 更新图表
function updateChart() {
    // 根据当前页面更新对应的图表
    const activePage = getActivePage();
    
    // 首页图表：显示总收入（票房+卖品）
    if (activePage === 'home') {
        drawChart('homeBoxOfficeChart', 'total');
    }
    
    // 收入页面图表：根据激活的标签显示相应图表
    if (activePage === 'revenue') {
        // 检查排片管理标签是否激活
        if (document.getElementById('schedule-tab').classList.contains('active')) {
            drawChart('boxOfficeChart', 'boxOffice');
        }
        // 检查售卖管理标签是否激活
        if (document.getElementById('sell-tab').classList.contains('active')) {
            drawChart('productChart', 'product');
        }
    }
    
    // 支出页面图表：根据激活的标签显示相应图表
    if (activePage === 'expense') {
        // 检查人员标签是否激活
        if (document.getElementById('personnel-tab').classList.contains('active')) {
            drawChart('personnelChart', 'personnel');
        }
        // 检查设备标签是否激活
        if (document.getElementById('equipment-tab').classList.contains('active')) {
            drawChart('equipmentChart', 'equipment');
        }
    }
    
    // 扩张页面图表：显示市场份额
    if (activePage === 'expand') {
        drawChart('marketShareChart', 'marketShare');
    }
}

// 计算日平均支出（盈亏平衡线）
function calculateDailyBreakEven() {
    // 计算维护费用（按设备价值和维护周期）
    const maintenanceRate = gameData.equipment.maintenanceRates[gameData.maintenance.cycle];
    const maintenanceCost = gameData.equipment.currentValue * maintenanceRate;
    
    // 根据维护周期计算日维护费用
    let dailyMaintenance = 0;
    switch (gameData.maintenance.cycle) {
        case 'weekly':
            dailyMaintenance = maintenanceCost / 7;
            break;
        case 'monthly':
            dailyMaintenance = maintenanceCost / 30;
            break;
        case 'quarterly':
            dailyMaintenance = maintenanceCost / 90;
            break;
        case 'yearly':
            dailyMaintenance = maintenanceCost / 365;
            break;
    }
    
    // 月度水电费和人员工资的日均分摊（30天）
    const monthlyExpensesDaily = (gameData.expenses.monthlyUtilities + gameData.expenses.monthlySalaries) / 30;
    // 年度租金的日均分摊（365天）
    const annualRentDaily = gameData.expenses.annualRent / 365;
    // 总日平均支出
    return dailyMaintenance + monthlyExpensesDaily + annualRentDaily;
}

// 绘制单个图表
function drawChart(canvasId, dataType) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 检测屏幕尺寸
    const isMobile = window.innerWidth < 768;
    const displayDays = isMobile ? 7 : 30;
    
    // 绘制网格
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // 水平线
    for (let i = 0; i <= 5; i++) {
        const y = i * (canvas.height / 5);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // 垂直线
    const gridLines = isMobile ? 7 : 10;
    for (let i = 0; i <= gridLines; i++) {
        const x = i * (canvas.width / gridLines);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制图表标题（市场份额图表的标题在 drawMarketShareChart 函数中绘制）
    if (dataType !== 'marketShare') {
        let chartTitle = '';
        switch (dataType) {
            case 'total':
                chartTitle = '总收入趋势';
                break;
            case 'boxOffice':
                chartTitle = '影片票房趋势';
                break;
            case 'product':
                chartTitle = '卖品收入趋势';
                break;
            default:
                chartTitle = '票房趋势';
        }
        
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#333';
        ctx.fillText(chartTitle, 10, 20);
    }
    
    // 绘制盈亏平衡线（仅在首页总收入趋势图显示）
    if (dataType === 'total' && canvasId === 'homeBoxOfficeChart') {
        const breakEvenPoint = calculateDailyBreakEven();
        drawBreakEvenLine(ctx, canvas.width, canvas.height, breakEvenPoint);
        
        // 绘制盈亏平衡线标签
        ctx.font = '12px Arial';
        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'right';
        ctx.fillText(`盈亏平衡线: ¥${Math.round(breakEvenPoint)}`, canvas.width - 10, 35);
    }
    
    // 绘制数据
    if (dataType === 'boxOffice' && canvasId === 'boxOfficeChart') {
        // 排片页面：显示所有影片的曲线
        drawAllMoviesChart(ctx, canvas.width, canvas.height, displayDays);
    } else if (dataType === 'marketShare' && canvasId === 'marketShareChart') {
        // 扩张页面：显示市场占比对比
        drawMarketShareChart(ctx, canvas.width, canvas.height);
    } else {
        // 其他页面：显示单一数据曲线
        let displayData = [];
        let lineColor = '#ff6b35';
        
        switch (dataType) {
            case 'total':
                // 总收入（票房+卖品）
                displayData = gameData.boxOfficeHistory.slice(-displayDays).map((boxOffice, index) => {
                    const productRevenue = gameData.productSalesHistory.slice(-displayDays)[index] || 0;
                    return boxOffice + productRevenue;
                });
                lineColor = '#ff6b35';
                break;
            case 'product':
                // 卖品收入
                displayData = gameData.productSalesHistory.slice(-displayDays);
                lineColor = '#2196F3';
                break;
            case 'personnel':
                // 人员支出
                displayData = Array(displayDays).fill().map(() => Math.floor(Math.random() * 10000) + 60000);
                lineColor = '#FF9800';
                break;
            case 'equipment':
                // 设备支出
                displayData = Array(displayDays).fill().map(() => Math.floor(Math.random() * 2000) + 10000);
                lineColor = '#4CAF50';
                break;
            default:
                displayData = gameData.boxOfficeHistory.slice(-displayDays);
                lineColor = '#4CAF50';
        }
        
        drawSingleLineChart(ctx, displayData, canvas.width, canvas.height, lineColor);
    }
    
    // 绘制标签
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    const labelCount = isMobile ? 7 : 6;
    for (let i = 0; i < labelCount; i++) {
        const x = (i * canvas.width) / (labelCount - 1);
        const dayLabel = isMobile ? `第${i+1}天` : `第${(displayDays/labelCount)*i+1}天`;
        ctx.fillText(dayLabel, x, canvas.height - 5);
    }
}

// 绘制单一数据曲线
function drawSingleLineChart(ctx, data, width, height, color) {
    const maxValue = Math.max(...data, 10000);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = (index * width) / (data.length - 1);
        const y = height - (value / maxValue) * height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // 绘制数据点
    ctx.fillStyle = color;
    data.forEach((value, index) => {
        const x = (index * width) / (data.length - 1);
        const y = height - (value / maxValue) * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制数据点数值
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, x, y - 10);
    });
}

// 绘制盈亏平衡线
function drawBreakEvenLine(ctx, width, height, breakEvenPoint) {
    // 获取实际的最大数据值
    const displayDays = window.innerWidth < 768 ? 7 : 30;
    const displayData = gameData.boxOfficeHistory.slice(-displayDays).map((boxOffice, index) => {
        const productRevenue = gameData.productSalesHistory.slice(-displayDays)[index] || 0;
        return boxOffice + productRevenue;
    });
    const maxValue = Math.max(...displayData, breakEvenPoint * 1.5, 10000);
    
    // 计算盈亏平衡线的Y坐标
    const y = height - (breakEvenPoint / maxValue) * height;
    
    // 确保线在画布内
    const clampedY = Math.max(0, Math.min(height, y));
    
    // 绘制盈亏平衡线
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // 虚线
    ctx.beginPath();
    ctx.moveTo(0, clampedY);
    ctx.lineTo(width, clampedY);
    ctx.stroke();
    ctx.setLineDash([]); // 恢复实线
}

// 绘制所有影片的曲线
function drawAllMoviesChart(ctx, width, height, displayDays) {
    // 动态票房数据显示
    const movieColors = ['#ff6b35', '#4CAF50', '#2196F3', '#9C27B0'];
    
    // 获取真实的票房历史数据
    const boxOfficeHistory = gameData.boxOfficeHistory.slice(-displayDays);
    const maxValue = Math.max(...boxOfficeHistory, 10000); // 使用真实数据的最大值
    
    // 只显示排片列表中的电影
    const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
    scheduledMovies.forEach((movie, index) => {
        // 根据电影的排片率计算其在总票房中的比例
        const movieData = boxOfficeHistory.map(dayBoxOffice => {
            // 根据排片率计算该电影的票房贡献
            const scheduleFactor = movie.schedule / 100; // 排片率（转换为小数）
            // 计算电影当日票房贡献
            const movieRevenue = Math.floor(dayBoxOffice * scheduleFactor);
            return movieRevenue;
        });
        
        // 绘制电影曲线
        ctx.strokeStyle = movieColors[index % movieColors.length];
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        movieData.forEach((value, i) => {
            const x = (i * width) / (displayDays - 1);
            const y = height - (value / maxValue) * height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // 绘制数据点
        ctx.fillStyle = movieColors[index % movieColors.length];
        movieData.forEach((value, i) => {
            const x = (i * width) / (displayDays - 1);
            const y = height - (value / maxValue) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // 绘制数据点数值
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, x, y - 10);
        });
        
        // 绘制电影名称标签
        ctx.fillStyle = movieColors[index % movieColors.length];
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${movie.name} (${movie.schedule}%)`, 10, 40 + index * 15);
    });
}

// 绘制市场占比对比图表
function drawMarketShareChart(ctx, width, height) {
    const isMobile = window.innerWidth < 768;
    const displayDays = isMobile ? 7 : 30;
    
    // 计算市场级别
    function getMarketLevel(shopCount) {
        if (shopCount >= 1000) return '全球';
        if (shopCount >= 100) return '全国';
        if (shopCount >= 20) return '省级';
        if (shopCount >= 3) return '市级';
        return '县级';
    }
    
    // 计算当前店铺数量
    const shopCount = (gameData.shops ? gameData.shops.length : 0) + 1; // 加1包含总店
    const marketLevel = getMarketLevel(shopCount);
    
    // 绘制市场级别和市场份额趋势标题在同一行
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333';
    ctx.fillText(`${marketLevel}市场份额趋势`, 10, 20);
    
    const marketShareData = generateMarketShareTrendData(displayDays);
    
    const maxValue = 100;
    const movieColors = ['#ff6b35', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#607D8B'];
    
    marketShareData.forEach((cinema, index) => {
        ctx.strokeStyle = cinema.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        cinema.data.forEach((value, i) => {
            const x = (i * width) / (displayDays - 1);
            const y = height - (value / maxValue) * height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        ctx.fillStyle = cinema.color;
        cinema.data.forEach((value, i) => {
            const x = (i * width) / (displayDays - 1);
            const y = height - (value / maxValue) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 显示份额数字跟在名称后面
        const lastValue = parseFloat(cinema.data[cinema.data.length - 1]);
        const formattedValue = parseFloat(lastValue.toFixed(2));
        ctx.fillStyle = cinema.color;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${cinema.name} ${formattedValue}%`, 10, 40 + index * 15);
    });
}

// 生成市场占比趋势数据
function generateMarketShareTrendData(displayDays) {
    const playerData = gameData.marketShareHistory.slice(-displayDays);
    
    // 计算当前店铺数量
    const shopCount = (gameData.shops ? gameData.shops.length : 0) + 1; // 加1包含总店
    const isCinemaChain = shopCount > 100;
    
    // 竞争对手数据
    const competitors = [
        { name: '星光影城', baseShare: 25, color: '#4CAF50' },
        { name: '银河影院', baseShare: 20, color: '#2196F3' },
        { name: '环球影城', baseShare: 15, color: '#9C27B0' },
        { name: '时代影院', baseShare: 12, color: '#FF9800' },
        { name: '其他影院', baseShare: 28, color: '#607D8B' }
    ];
    
    const totalBaseShare = competitors.reduce((sum, competitor) => sum + competitor.baseShare, 0);
    
    // 玩家名称
    let playerName = gameData.cinemaName || '我的影院';
    if (isCinemaChain) {
        // 替换原有的后缀为"院线"
        const suffixes = ['影城', '影院', '电影城', '影都', '影苑', '影厅', '影宫', '影阁', '影坊', '影园'];
        let hasSuffix = false;
        for (const suffix of suffixes) {
            if (playerName.endsWith(suffix)) {
                playerName = playerName.replace(suffix, '院线');
                hasSuffix = true;
                break;
            }
        }
        if (!hasSuffix) {
            playerName += '院线';
        }
    }
    
    const result = [
        { name: playerName, data: playerData, color: '#ff6b35' }
    ];
    
    competitors.forEach(competitor => {
        const competitorData = [];
        for (let i = 0; i < displayDays; i++) {
            const playerShare = playerData[i] || 0;
            const remainingShare = 100 - playerShare;
            const share = Math.round((competitor.baseShare / totalBaseShare) * remainingShare);
            const randomFactor = 0.9 + Math.random() * 0.2;
            const finalShare = parseFloat((share * randomFactor).toFixed(2));
            competitorData.push(finalShare);
        }
        
        // 修改竞争对手名称为院线
        let competitorName = competitor.name;
        if (isCinemaChain) {
            competitorName = competitorName.replace('影城', '院线').replace('影院', '院线');
        }
        
        result.push({
            name: competitorName,
            data: competitorData,
            color: competitor.color
        });
    });
    
    return result;
}

// 导出模块
export {
    updateChart,
    drawChart,
    getActivePage
};
