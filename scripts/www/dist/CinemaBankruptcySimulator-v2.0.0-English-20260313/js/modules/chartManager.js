// 图表ManagementModule

import { gameData } from './gameData.js';

// 获取Current活跃页面
function getActivePage() {
    const activePage = document.querySelector('.page.active');
    return activePage ? activePage.id : 'home';
}

// Update图表
function updateChart() {
    // 根据Current页面Update对应的图表
    const activePage = getActivePage();
    
    // 首页图表：DisplayTotalRevenue（Box Office+Concessions）
    if (activePage === 'home') {
        drawChart('homeBoxOfficeChart', 'total');
    }
    
    // Revenue页面图表：根据激活的标签Display相应图表
    if (activePage === 'revenue') {
        // CheckSchedule Management标签是否激活
        if (document.getElementById('schedule-tab').classList.contains('active')) {
            drawChart('boxOfficeChart', 'boxOffice');
        }
        // Check售卖Management标签是否激活
        if (document.getElementById('sell-tab').classList.contains('active')) {
            drawChart('productChart', 'product');
        }
    }
    
    // Expense页面图表：根据激活的标签Display相应图表
    if (activePage === 'expense') {
        // CheckEquipment标签是否激活
        if (document.getElementById('equipment-tab').classList.contains('active')) {
            drawChart('equipmentChart', 'equipment');
        }
    }
    
    // Expansion页面图表：Display市showingsShare
    if (activePage === 'expand') {
        drawChart('marketShareChart', 'marketShare');
    }
}

// CalculateDay平均Expense（Break-even Point）
function calculateDailyBreakEven() {
    // CalculateMaintenance用（按Equipment价值和MaintenanceWeek期）
    const maintenanceRate = gameData.equipment.maintenanceRates[gameData.maintenance.cycle];
    const maintenanceCost = gameData.equipment.currentValue * maintenanceRate;
    
    // 根据MaintenanceWeek期CalculateDayMaintenance用
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
    
    // Month度Utilities和Staff Salary的Day均分摊（30Day）
    const monthlyExpensesDaily = (gameData.expenses.monthlyUtilities + gameData.expenses.monthlySalaries) / 30;
    // Year度Rent的Day均分摊（365Day）
    const annualRentDaily = gameData.expenses.annualRent / 365;
    // TotalDay平均Expense
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
    
    // Draw chart title (market share chart title is drawn in drawMarketShareChart function)
    if (dataType !== 'marketShare') {
        let chartTitle = '';
        switch (dataType) {
            case 'total':
                chartTitle = 'Total Revenue Trend';
                break;
            case 'boxOffice':
                chartTitle = 'Film Box Office Trend';
                break;
            case 'product':
                chartTitle = 'Concession Revenue Trend';
                break;
            default:
                chartTitle = 'Box Office Trend';
        }
        
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#333';
        ctx.fillText(chartTitle, 10, 20);
    }
    
    // Draw break-even point (only displayed on home page total revenue chart)
    if (dataType === 'total' && canvasId === 'homeBoxOfficeChart') {
        const breakEvenPoint = calculateDailyBreakEven();
        drawBreakEvenLine(ctx, canvas.width, canvas.height, breakEvenPoint);
        
        // 绘制Break-even Point标签
        ctx.font = '12px Arial';
        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'right';
        ctx.fillText(`Break-even Point: $${Math.round(breakEvenPoint)}`, canvas.width - 10, 35);
    }
    
    // 绘制Data
    if (dataType === 'boxOffice' && canvasId === 'boxOfficeChart') {
        // Schedule页面：DisplayAllFilm的曲线
        drawAllMoviesChart(ctx, canvas.width, canvas.height, displayDays);
    } else if (dataType === 'marketShare' && canvasId === 'marketShareChart') {
        // Expansion页面：Display市showings占比对比
        drawMarketShareChart(ctx, canvas.width, canvas.height);
    } else {
        // 其他页面：Display单一Data曲线
        let displayData = [];
        let lineColor = '#ff6b35';
        
        switch (dataType) {
            case 'total':
                // TotalRevenue（Box Office+Concessions）
                displayData = gameData.boxOfficeHistory.slice(-displayDays).map((boxOffice, index) => {
                    const productRevenue = gameData.productSalesHistory.slice(-displayDays)[index] || 0;
                    return boxOffice + productRevenue;
                });
                lineColor = '#ff6b35';
                break;
            case 'product':
                // Concession Revenue
                displayData = gameData.productSalesHistory.slice(-displayDays);
                lineColor = '#2196F3';
                break;
            case 'equipment':
                // 员Expense
                displayData = Array(displayDays).fill().map(() => Math.floor(Math.random() * 10000) + 60000);
                lineColor = '#FF9800';
                break;
            case 'equipment':
                // EquipmentExpense
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
        const dayLabel = isMobile ? `Day \$\{i\+1\}` : `Day \$\{\(displayDays/labelCount\)\*i\+1\}`;
        ctx.fillText(dayLabel, x, canvas.height - 5);
    }
}

// 绘制单一Data曲线
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
    
    // 绘制Data点
    ctx.fillStyle = color;
    data.forEach((value, index) => {
        const x = (index * width) / (data.length - 1);
        const y = height - (value / maxValue) * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制Data点数值
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, x, y - 10);
    });
}

// 绘制Break-even Point
function drawBreakEvenLine(ctx, width, height, breakEvenPoint) {
    // 获取实际的MaximumData值
    const displayDays = window.innerWidth < 768 ? 7 : 30;
    const displayData = gameData.boxOfficeHistory.slice(-displayDays).map((boxOffice, index) => {
        const productRevenue = gameData.productSalesHistory.slice(-displayDays)[index] || 0;
        return boxOffice + productRevenue;
    });
    const maxValue = Math.max(...displayData, breakEvenPoint * 1.5, 10000);
    
    // CalculateBreak-even Point的Y坐标
    const y = height - (breakEvenPoint / maxValue) * height;
    
    // 确保线在画布内
    const clampedY = Math.max(0, Math.min(height, y));
    
    // 绘制Break-even Point
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // 虚线
    ctx.beginPath();
    ctx.moveTo(0, clampedY);
    ctx.lineTo(width, clampedY);
    ctx.stroke();
    ctx.setLineDash([]); // 恢复实线
}

// 绘制AllFilm的曲线
function drawAllMoviesChart(ctx, width, height, displayDays) {
    // 动态Box OfficeDataDisplay
    const movieColors = ['#ff6b35', '#4CAF50', '#2196F3', '#9C27B0'];
    
    // 获取真实的Box Office历史Data
    const boxOfficeHistory = gameData.boxOfficeHistory.slice(-displayDays);
    const maxValue = Math.max(...boxOfficeHistory, 10000); // Use真实Data的Maximum值
    
    // 只DisplaySchedule列表中的Movie
    const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
    scheduledMovies.forEach((movie, index) => {
        // 根据Movie的Schedule RateCalculate其在TotalBox Office中的比例
        const movieData = boxOfficeHistory.map(dayBoxOffice => {
            // 根据Schedule RateCalculate该Movie的Box Office贡献
            const scheduleFactor = movie.schedule / 100; // Schedule Rate（转换为小数）
            // CalculateMovie当DayBox Office贡献
            const movieRevenue = Math.floor(dayBoxOffice * scheduleFactor);
            return movieRevenue;
        });
        
        // 绘制Movie曲线
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
        
        // 绘制Data点
        ctx.fillStyle = movieColors[index % movieColors.length];
        movieData.forEach((value, i) => {
            const x = (i * width) / (displayDays - 1);
            const y = height - (value / maxValue) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // 绘制Data点数值
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, x, y - 10);
        });
        
        // 绘制Movie名称标签
        ctx.fillStyle = movieColors[index % movieColors.length];
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${movie.name} (${movie.schedule}%)`, 10, 40 + index * 15);
    });
}

// 绘制市showings占比对比图表
function drawMarketShareChart(ctx, width, height) {
    const isMobile = window.innerWidth < 768;
    const displayDays = isMobile ? 7 : 30;
    
    // Calculate市showings级别
    function getMarketLevel(shopCount) {
        if (shopCount >= 1000) return 'Global';
        if (shopCount >= 100) return 'National';
        if (shopCount >= 20) return 'Provincial';
        if (shopCount >= 3) return 'Municipal';
        return 'County';
    }
    
    // // Calculate current shop quantity
    const shopCount = (gameData.shops ? gameData.shops.length : 0) + 1; // 加1包含Total店
    const marketLevel = getMarketLevel(shopCount);
    
    // Draw market level and share trend title on same line
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333';
    ctx.fillText(`${marketLevel} Market Share Trend`, 10, 20);
    
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
        
        // DisplayShare数字跟在名称后面
        const lastValue = parseFloat(cinema.data[cinema.data.length - 1]);
        const formattedValue = parseFloat(lastValue.toFixed(2));
        ctx.fillStyle = cinema.color;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${cinema.name} ${formattedValue}%`, 10, 40 + index * 15);
    });
}

// 生成市showings占比趋势Data
function generateMarketShareTrendData(displayDays) {
    const playerData = gameData.marketShareHistory.slice(-displayDays);
    
    // // Calculate current shop quantity
    const shopCount = (gameData.shops ? gameData.shops.length : 0) + 1; // 加1包含Total店
    const isCinemaChain = shopCount > 100;
    
    // Competitors Data
    const competitors = [
        { name: 'Starlight Cinema', baseShare: 25, color: '#4CAF50' },
        { name: 'Galaxy Cinema', baseShare: 20, color: '#2196F3' },
        { name: 'Universal Cinema', baseShare: 15, color: '#9C27B0' },
        { name: 'Times Cinema', baseShare: 12, color: '#FF9800' },
        { name: 'Other Cinemas', baseShare: 28, color: '#607D8B' }
    ];
    
    const totalBaseShare = competitors.reduce((sum, competitor) => sum + competitor.baseShare, 0);
    
    // Player name
    let playerName = gameData.cinemaName || 'My Cinema';
    if (isCinemaChain) {
        // Replace original suffix with "Cinema Chain"
        const suffixes = ['影城', 'Cinema', 'Movie城', '影都', '影苑', '影Hall', '影宫', '影阁', '影坊', '影园'];
        let hasSuffix = false;
        for (const suffix of suffixes) {
            if (playerName.endsWith(suffix)) {
                playerName = playerName.replace(suffix, 'Cinema Chain');
                hasSuffix = true;
                break;
            }
        }
        if (!hasSuffix) {
            playerName += 'Cinema Chain';
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
        
        // 修改竞争对手名称为Cinema Chain
        let competitorName = competitor.name;
        if (isCinemaChain) {
            competitorName = competitorName.replace('影城', 'Cinema Chain').replace('Cinema', 'Cinema Chain');
        }
        
        result.push({
            name: competitorName,
            data: competitorData,
            color: competitor.color
        });
    });
    
    return result;
}

// 导出Module
export {
    updateChart,
    drawChart,
    getActivePage
};
