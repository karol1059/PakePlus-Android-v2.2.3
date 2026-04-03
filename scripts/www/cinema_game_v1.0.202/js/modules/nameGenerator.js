// 名称生成模块

// 随机电影名字生成器
function generateMovieName() {
    // 按类型分类的电影名字词汇
    const movieTypes = {
        action: {
            prefixes: ['热血', '极速', '致命', '霹雳', '雷霆', '极限', '狂野', '硬汉', '勇者', '王牌'],
            middles: ['追击', '战警', '特工', '战士', '保镖', '突击队', '敢死队', '特警', '精英', '神兵'],
            suffixes: ['无间道', '生死战', '巅峰对决', '总动员', '传奇', '归来', '崛起', '使命', '复仇', '之战']
        },
        comedy: {
            prefixes: ['开心', '欢乐', '搞笑', '幽默', '轻松', '疯狂', '荒诞', '诙谐', '逗比', '喜剧'],
            middles: ['家族', '伙伴', '兄弟', '姐妹', '情侣', '朋友', '邻居', '同事', '同学', '冤家'],
            suffixes: ['大冒险', '奇遇记', '之旅', '故事', '外传', '特别篇', '大作战', '总动员', '乐翻天', '笑传']
        },
        romance: {
            prefixes: ['浪漫', '甜蜜', '爱情', '恋恋', '痴心', '深情', '温柔', '心动', '缘起', '情定'],
            middles: ['告白', '约定', '邂逅', '相恋', '别离', '重逢', '守护', '等待', '陪伴', '相惜'],
            suffixes: ['之恋', '情歌', '誓言', '传说', '日记', '故事', '回忆', '奇迹', '童话', '奇缘']
        },
        sciFi: {
            prefixes: ['星际', '银河', '宇宙', '未来', '科幻', '太空', '星际', '时光', '量子', '数字'],
            middles: ['探索', '穿越', '迷航', '觉醒', '革命', '危机', '使命', '远征', '殖民地', '空间站'],
            suffixes: ['漫游', '历险', '传奇', '时代', '纪元', '之战', '崛起', '归来', '使命', '秘密']
        },
        fantasy: {
            prefixes: ['魔幻', '奇幻', '仙境', '童话', '神话', '魔法', '精灵', '龙族', '骑士', '王国'],
            middles: ['传说', '历险记', '奇遇记', '魔法', '咒语', '宝藏', '预言', '诅咒', '觉醒', '使命'],
            suffixes: ['传奇', '传说', '历险记', '奇遇记', '之旅', '故事', '王国', '时代', '战争', '预言']
        },
        mystery: {
            prefixes: ['神秘', '悬疑', '惊悚', '恐怖', '诡异', '离奇', '未解', '黑暗', '死亡', '幽灵'],
            middles: ['迷案', '谜团', '秘密', '传说', '诅咒', '悬疑', '惊悚', '恐怖', '诡异', '离奇'],
            suffixes: ['揭秘', '真相', '传说', '诅咒', '秘密', '迷局', '疑云', '悬案', '奇案', '谜案']
        },
        animation: {
            prefixes: ['卡通', '动画', '奇幻', '快乐', '冒险', '童话', '可爱', '精灵', '动物', '机器人'],
            middles: ['总动员', '大冒险', '奇遇记', '魔法', '咒语', '宝藏', '预言', '诅咒', '觉醒', '使命'],
            suffixes: ['大电影', '历险记', '奇遇记', '总动员', '传奇', '故事', '之旅', '世界', '王国', '联盟']
        },
        drama: {
            prefixes: ['人间', '都市', '青春', '成长', '家庭', '社会', '人性', '命运', '生活', '现实'],
            middles: ['故事', '历程', '变迁', '情感', '关系', '矛盾', '挣扎', '追求', '梦想', '希望'],
            suffixes: ['故事', '人生', '历程', '变迁', '情感', '关系', '矛盾', '挣扎', '追求', '梦想']
        }
    };
    
    // 随机选择一个电影类型
    const typeKeys = Object.keys(movieTypes);
    const randomType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const typeVocab = movieTypes[randomType];
    
    // 随机选择词汇组合
    const prefix = typeVocab.prefixes[Math.floor(Math.random() * typeVocab.prefixes.length)];
    const middle = typeVocab.middles[Math.floor(Math.random() * typeVocab.middles.length)];
    const suffix = typeVocab.suffixes[Math.floor(Math.random() * typeVocab.suffixes.length)];
    
    // 生成电影名字
    let movieName = '';
    
    // 随机组合方式，增加多样性
    const comboType = Math.floor(Math.random() * 3);
    switch (comboType) {
        case 0:
            // 前缀 + 中间 + 后缀
            movieName = `${prefix}${middle}${suffix}`;
            break;
        case 1:
            // 前缀 + 后缀
            movieName = `${prefix}${suffix}`;
            break;
        case 2:
            // 中间 + 后缀
            movieName = `${middle}${suffix}`;
            break;
    }
    
    return movieName;
}

// 随机影院名称生成器
function generateCinemaName() {
    // 影院名称词汇
    const cinemaVocab = {
        prefixes: ['星光', '银河', '环球', '时代', '未来', '梦幻', '豪华', '精品', '金色', '钻石', '星空', '海洋', '大地', '阳光', '月光', '霓虹', '彩虹', '风云', '雷电', '火焰'],
        suffixes: ['影城', '影院', '电影城', '影都', '影苑', '影厅', '影宫', '影阁', '影坊', '影园']
    };
    
    // 随机选择前缀和后缀
    let prefix, suffix;
    do {
        prefix = cinemaVocab.prefixes[Math.floor(Math.random() * cinemaVocab.prefixes.length)];
        suffix = cinemaVocab.suffixes[Math.floor(Math.random() * cinemaVocab.suffixes.length)];
        // 确保前缀和后缀没有重复字符
    } while (hasDuplicateCharacters(prefix + suffix));
    
    // 生成影院名称
    const cinemaName = `${prefix}${suffix}`;
    
    return cinemaName;
}

// 检查字符串是否有重复字符
function hasDuplicateCharacters(str) {
    const charMap = {};
    for (let char of str) {
        if (charMap[char]) {
            return true;
        }
        charMap[char] = true;
    }
    return false;
}

// 获取随机电影类型
function getRandomMovieType() {
    const types = ['动作', '喜剧', '爱情', '科幻', '奇幻', '悬疑', '恐怖', '动画'];
    return types[Math.floor(Math.random() * types.length)];
}

// 导出模块
export { generateMovieName, generateCinemaName, getRandomMovieType };
