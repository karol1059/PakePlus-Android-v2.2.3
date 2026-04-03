// 重新生成已排片电影列表
function generateScheduledMoviesList() {
    const modalMovieList = document.getElementById('modal-movie-list');
    if (!modalMovieList) return;
    
    // 生成已排片电影列表
    modalMovieList.innerHTML = '';
    const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
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
                <p>${movie.type}片，${tierText}，${movie.schedule}%</p>
            </div>
            <div class="movie-controls">
                <input type="range" min="0" max="100" value="${movie.schedule}" class="schedule-slider" data-movie-id="${movie.id}">
            </div>
        `;
        modalMovieList.appendChild(movieItem);
    });
    
    // 重新绑定排片滑块事件
    const sliders = modalMovieList.querySelectorAll('.schedule-slider');
    sliders.forEach((slider, index) => {
        slider.addEventListener('input', function() {
            const currentValue = parseInt(this.value);
            const movieItem = this.closest('.movie-item');
            const scheduleText = movieItem.querySelector('.movie-info p:last-child');
            
            if (scheduleText) {
                // 获取电影信息
                const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
                const currentMovie = scheduledMovies[index];
                const movieType = currentMovie.type;

                const tierText = currentMovie.tier === 1 ? '1档' : currentMovie.tier === 2 ? '2档' : '3档';

                // 更新电影信息文本
                scheduleText.textContent = `${movieType}片，${tierText}，${currentValue}%`;
            }
            
            // 获取当前电影的档位
            const scheduledMovies = gameData.movies.filter(movie => movie.inSchedule);
            const currentMovie = scheduledMovies[index];
            const currentTier = currentMovie.tier;
            
            // 计算当前总排片
            let totalSchedule = 0;
            sliders.forEach((s, i) => {
                if (i !== index) {
                    totalSchedule += parseInt(s.value);
                }
            });
            
            // 计算剩余可分配的排片
            const remaining = Math.max(0, 100 - currentValue);
            
            // 按档分组电影
            const otherMovies = scheduledMovies.filter((_, i) => i !== index);
            const tierGroups = {};
            
            // 按档位分组
            otherMovies.forEach((movie, i) => {
                if (!tierGroups[movie.tier]) {
                    tierGroups[movie.tier] = [];
                }
                tierGroups[movie.tier].push({ movie, index: i + (i >= index ? 1 : 0) });
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
                    
                    // 平均分配到该档位的每部电影
                    if (tierMovies.length > 0) {
                        const perMovieAllocation = Math.floor(tierAllocation / tierMovies.length);
                        tierMovies.forEach(({ movie, index }) => {
                            sliders[index].value = perMovieAllocation;
                            // 更新对应电影的排片占比
                            movie.schedule = perMovieAllocation;
                        });
                    }
                });
            }
        });
    });
}