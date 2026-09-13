
// База данных и конфигурация игры
const CONFIG = {
    // Список котов-бойцов
    fighters: {
        f1: { name: "Энерго Кот", rarity: "common", power: 1, icon: "🐱" },
        f2: { name: "Водный Кот", rarity: "common", power: 2, icon: "💧" },
        f3: { name: "Кот в Плаще", rarity: "rare", power: 5, icon: "🧥" },
        f4: { name: "Силач", rarity: "rare", power: 10, icon: "💪" },
        f5: { name: "Электро-Кот", rarity: "epic", power: 25, icon: "⚡" },
        f6: { name: "Лавовый Кот", rarity: "epic", power: 35, icon: "🔥" },
        f7: { name: "Кибер-Кот", rarity: "mythic", power: 75, icon: "🤖" },
        f8: { name: "Призрак", rarity: "mythic", power: 100, icon: "👻" },
        f9: { name: "Зевс", rarity: "legendary", power: 250, icon: "🔱" },
        f10: { name: "Космо-Кот", rarity: "legendary", power: 500, icon: "🪐" }
    },

    // Генераторы энергии (Заводы)
    buildings: [
        { id: 'b1', name: 'Миска с молоком', baseCost: 15, baseEps: 1, icon: '🥛' },
        { id: 'b2', name: 'Лазерная указка', baseCost: 100, baseEps: 8, icon: '🔦' },
        { id: 'b3', name: 'Кото-генератор', baseCost: 1100, baseEps: 48, icon: '⚙️' },
        { id: 'b4', name: 'Орбитальная лавка', baseCost: 12000, baseEps: 260, icon: '🛰️' }
    ],

    // Фиксированные промокоды и ЧИТ-КОДЫ
    promos: {
        "START2026": { energy: 1000, gems: 100, dm: 0, msg: "Стартовый буст получен!" },
        "ENERGY_CAT": { energy: 5000, gems: 300, dm: 10, msg: "Кото-набор зачислен!" },
        "OP_BOOST": { energy: 100000, gems: 2500, dm: 50, msg: "Чит-код активирован: Огромный буст!" },
        "GODMODE": { energy: 999999999, gems: 999999, dm: 99999, msg: "👑 РЕЖИМ BOG-CAT ВКЛЮЧЕН!" }
    },

    // Секретные зашифрованные фразы (Hash-коды)
    secrets: {
        "qaz": { energy: 777777777777, gems: 7777777, dm: 777777, msg: "🔓 СЕКРЕТНЫЙ ШИФР 'QAZ' ВЗЛОМАН! ВЫ БОГ ВСЕЛЕННОЙ!" }
    }
};

/**
 * Генератор случайных уникальных промокодов (для эвентов или раздач)
 */
function generateRandomPromo() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "CAT-";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Генерируем случайные читерские награды
    const randomReward = {
        energy: Math.floor(Math.random() * 500000) + 10000,
        gems: Math.floor(Math.random() * 1000) + 50,
        dm: Math.floor(Math.random() * 50) + 5,
        msg: `🎉 Случайный промокод ${code} активирован!`
    };

    CONFIG.promos[code] = randomReward;
    return { code, reward: randomReward };
      }
