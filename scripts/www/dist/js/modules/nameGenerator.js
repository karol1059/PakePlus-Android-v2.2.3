// Name Generator Module

// Random Movie Name Generator
function generateMovieName() {
    // Movie name vocabulary by genre
    const movieTypes = {
        action: {
            prefixes: ['Raging', 'Extreme', 'Deadly', 'Thunder', 'Wild', 'Brave', 'Ultimate', 'Shadow', 'Iron', 'Dark'],
            middles: ['Strike', 'Force', 'Agent', 'Warrior', 'Guard', 'Squad', 'Team', 'Ops', 'Elite', 'Fury'],
            suffixes: ['Protocol', 'Mission', 'Revenge', 'Justice', 'Impact', 'Rising', 'Legacy', 'War', 'Zone', 'Point']
        },
        comedy: {
            prefixes: ['Crazy', 'Funny', 'Wacky', 'Wild', 'Super', 'Mega', 'Ultra', 'Happy', 'Silly', 'Quirky'],
            middles: ['Friends', 'Family', 'Partners', 'Buddies', 'Neighbors', 'Roommates', 'Classmates', 'Coworkers', 'Twins', 'Siblings'],
            suffixes: ['Adventure', 'Vacation', 'Reunion', 'Party', 'Wedding', 'Road Trip', 'Getaway', 'Mix-up', 'Chaos', 'Stories']
        },
        romance: {
            prefixes: ['Endless', 'Forever', 'Sweet', 'Passionate', 'Gentle', 'Tender', 'Lovely', 'Romantic', 'Divine', 'Eternal'],
            middles: ['Promise', 'Encounter', 'Affection', 'Devotion', 'Separation', 'Reunion', 'Protection', 'Waiting', 'Companionship', 'Love'],
            suffixes: ['Romance', 'Story', 'Vow', 'Tale', 'Diary', 'Dream', 'Memory', 'Miracle', 'Fantasy', 'Destiny']
        },
        sciFi: {
            prefixes: ['Stellar', 'Galactic', 'Cosmic', 'Future', 'Cyber', 'Space', 'Quantum', 'Digital', 'Neo', 'Nano'],
            middles: ['Exploration', 'Journey', 'Voyage', 'Awakening', 'Revolution', 'Crisis', 'Mission', 'Expedition', 'Colony', 'Station'],
            suffixes: ['Odyssey', 'Chronicles', 'Legacy', 'Era', 'Genesis', 'Conflict', 'Rising', 'Return', 'Protocol', 'Initiative']
        },
        fantasy: {
            prefixes: ['Mystic', 'Enchanted', 'Magical', 'Fairy', 'Mythical', 'Wizard', 'Crystal', 'Dragon', 'Knight', 'Kingdom'],
            middles: ['Legend', 'Quest', 'Adventure', 'Magic', 'Spell', 'Treasure', 'Prophecy', 'Curse', 'Awakening', 'Destiny'],
            suffixes: ['Saga', 'Legend', 'Journey', 'Tale', 'Realm', 'Chronicles', 'Kingdom', 'Age', 'War', 'Prophecy']
        },
        mystery: {
            prefixes: ['Mysterious', 'Suspense', 'Dark', 'Hidden', 'Secret', 'Strange', 'Unsolved', 'Silent', 'Deadly', 'Phantom'],
            middles: ['Case', 'Mystery', 'Secret', 'Legend', 'Curse', 'Suspicion', 'Fear', 'Horror', 'Enigma', 'Riddle'],
            suffixes: ['Revealed', 'Truth', 'Legend', 'Curse', 'Secret', 'Affair', 'Cloud', 'Files', 'Incident', 'Investigation']
        },
        animation: {
            prefixes: ['Cartoon', 'Animated', 'Magical', 'Happy', 'Adventure', 'Fairy', 'Cute', 'Spirit', 'Animal', 'Robot'],
            middles: ['Adventure', 'Journey', 'Quest', 'Magic', 'Spell', 'Treasure', 'Prophecy', 'Curse', 'Awakening', 'Destiny'],
            suffixes: ['Movie', 'Adventure', 'Journey', 'Tale', 'Legend', 'Story', 'Quest', 'World', 'Kingdom', 'Alliance']
        },
        drama: {
            prefixes: ['Human', 'Urban', 'Youth', 'Growing', 'Family', 'Social', 'Life', 'Destiny', 'Everyday', 'Reality'],
            middles: ['Story', 'Journey', 'Change', 'Emotion', 'Relationship', 'Conflict', 'Struggle', 'Pursuit', 'Dream', 'Hope'],
            suffixes: ['Story', 'Life', 'Journey', 'Change', 'Emotion', 'Relationship', 'Conflict', 'Struggle', 'Pursuit', 'Dream']
        }
    };
    
    // Randomly select a movie genre
    const typeKeys = Object.keys(movieTypes);
    const randomType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const typeVocab = movieTypes[randomType];
    
    // Randomly select vocabulary combination
    const prefix = typeVocab.prefixes[Math.floor(Math.random() * typeVocab.prefixes.length)];
    const middle = typeVocab.middles[Math.floor(Math.random() * typeVocab.middles.length)];
    const suffix = typeVocab.suffixes[Math.floor(Math.random() * typeVocab.suffixes.length)];
    
    // Generate movie name
    let movieName = '';
    
    // Random combination for variety
    const comboType = Math.floor(Math.random() * 3);
    switch (comboType) {
        case 0:
            // Prefix + Middle + Suffix
            movieName = `${prefix} ${middle} ${suffix}`;
            break;
        case 1:
            // Prefix + Suffix
            movieName = `${prefix} ${suffix}`;
            break;
        case 2:
            // Middle + Suffix
            movieName = `${middle} ${suffix}`;
            break;
    }
    
    return movieName;
}

// Random Cinema Name Generator
function generateCinemaName() {
    // Cinema name vocabulary
    const cinemaVocab = {
        prefixes: ['Starlight', 'Galaxy', 'Universal', 'Century', 'Future', 'Dream', 'Luxury', 'Premier', 'Golden', 'Diamond', 'Stellar', 'Ocean', 'Grand', 'Sunshine', 'Moonlight', 'Neon', 'Rainbow', 'Cloud', 'Thunder', 'Flame'],
        suffixes: ['Cinema', 'Theater', 'Movies', 'Picture House', 'Cineplex', 'Screen', 'Palace', 'Pavilion', 'Studio', 'Arts']
    };
    
    // Randomly select prefix and suffix
    const prefix = cinemaVocab.prefixes[Math.floor(Math.random() * cinemaVocab.prefixes.length)];
    const suffix = cinemaVocab.suffixes[Math.floor(Math.random() * cinemaVocab.suffixes.length)];
    
    // Generate cinema name
    const cinemaName = `${prefix} ${suffix}`;
    
    return cinemaName;
}

// Get random movie genre
function getRandomMovieType() {
    const types = ['Action', 'Comedy', 'Romance', 'Sci-Fi', 'Fantasy', 'Mystery', 'Horror', 'Animation'];
    return types[Math.floor(Math.random() * types.length)];
}

// Random Person Name Generator (Western names)
function generatePersonName() {
    // Western first names
    const firstNames = {
        male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
               'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth'],
        female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
                 'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna']
    };
    
    // Western surnames
    const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                      'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
                      'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
                      'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
                      'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
    
    // Randomly select gender
    const isMale = Math.random() < 0.5;
    const genderGroup = isMale ? firstNames.male : firstNames.female;
    
    // Randomly select first name and surname
    const firstName = genderGroup[Math.floor(Math.random() * genderGroup.length)];
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    
    // Generate full name
    const fullName = `${firstName} ${surname}`;
    
    return fullName;
}

// Export module
export { generateMovieName, generateCinemaName, getRandomMovieType, generatePersonName };
