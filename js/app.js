// --- СОСТОЯНИЕ ИГРЫ ---
const state = {
    energy: 0,
    gems: 0,
    darkMatter: 0,
    stardust: 0,
    clickPower: 1,
    clickLvl: 1,
    wave: 1,
    enemyHp: 50,
    enemyMaxHp: 50,
    questProg: 0,
    questTarg: 100,
    passXp: 0,
    passLvl: 1,
    hasPlus: false,
    buyMode: 1,
    usedPromos: [],
    inventory: ['f1'],
    squad: ['f1'],
    buildings: { b1: 0, b2: 0, b3: 0, b4: 0 },
    skills: {}
};

// Переменные для открытия боксов
let boxClicksLeft = 0;
let currentRewardPool = [];

// --- ИНИЦИАЛИЗАЦИЯ canvas ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

class FloatingText {
    constructor(x, y, text, color) {
        this.x = x; this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1.0;
        this.vy = -2;
    }
    update() {
        this.y += this.vy;
        this.life -= 0.025;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.font = 'bold 18px Segoe UI';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// --- КЛИКЕР И БОЙ ---
document.getElementById('tap-target').addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = rect.width / 2 + (Math.random() * 40 - 20);
    const y = rect.height / 2 + (Math.random() * 40 - 20);
    
    const mult = 1 + (state.darkMatter * 0.1);
    const dmg = state.clickPower * mult;

    addEnergy(dmg);
    damageEnemy(dmg);
    
    // Прогресс квеста
    state.questProg++;
    if (state.questProg >= state.questTarg) {
        state.questProg = 0;
        state.questTarg = Math.round(state.questTarg * 1.5);
        addXp(250);
        alert('🎯 Квест выполнен! +250 XP Пасса');
    }

    particles.push(new FloatingText(x, y, `+${formatNum(dmg)}`, '#00f2fe'));
    updateUI();
});

function addEnergy(amount) {
    state.energy += amount;
}

function damageEnemy(dmg) {
    state.enemyHp -= dmg;
    if (state.enemyHp <= 0) {
        state.wave++;
        state.enemyMaxHp = Math.round(50 * Math.pow(1.22, state.wave - 1));
        state.enemyHp = state.enemyMaxHp;
        addEnergy(state.enemyMaxHp * 0.4);
    }
}

function getEps() {
    let eps = 0;
    CONFIG.buildings.forEach(b => {
        const count = state.buildings[b.id] || 0;
        eps += count * b.baseEps;
    });

    // DPS Команды добавляет % к EPS
    let teamDps = 0;
    state.squad.forEach(id => {
        if (CONFIG.fighters[id]) teamDps += CONFIG.fighters[id].power;
    });

    return (eps + teamDps) * (1 + state.darkMatter * 0.1);
}

// --- УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ И ТАБАМИ ---
function tab(screenId, btn) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(screenId).classList.add('active');
    btn.classList.add('active');
}

function formatNum(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return Math.floor(n);
}

// --- ЛУТБОКСЫ ---
function openBox(type) {
    let cost = type === 'en' ? 1500 : (type === 'gem' ? 80 : 500);
    let currency = type === 'en' ? 'energy' : (type === 'gem' ? 'gems' : 'darkMatter');

    if (state[currency] < cost) {
        alert('Недостаточно ресурсов!');
        return;
    }

    state[currency] -= cost;
    boxClicksLeft = 3;
    
    // Формируем награды
    currentRewardPool = [
        { name: "10,000 Энергии", icon: "⚡", action: () => addEnergy(10000) },
        { name: "50 Алмазов", icon: "💎", action: () => state.gems += 50 },
        { name: "Новый Кот!", icon: "🐱", action: () => unlockRandomCat() }
    ];

    document.getElementById('box-info').innerText = `КЛИКАЙ ПО БОКСУ! (${boxClicksLeft})`;
    document.getElementById('box-render').style.display = 'block';
    document.getElementById('reward-pop').style.display = 'none';
    document.getElementById('box-scene').style.display = 'flex';
    updateUI();
}

function tapBox() {
    if (boxClicksLeft > 1) {
        boxClicksLeft--;
        document.getElementById('box-info').innerText = `КЛИКАЙ ПО БОКСУ! (${boxClicksLeft})`;
        document.getElementById('box-render').style.transform = 'scale(1.2)';
        setTimeout(() => document.getElementById('box-render').style.transform = 'scale(1)', 100);
    } else {
        document.getElementById('box-render').style.display = 'none';
        document.getElementById('reward-pop').style.display = 'block';
        document.getElementById('box-info').innerText = 'ОТКРЫТО!';
        
        const rew = currentRewardPool[Math.floor(Math.random() * currentRewardPool.length)];
        document.getElementById('rew-icon').innerText = rew.icon;
        document.getElementById('rew-name').innerText = rew.name;
        rew.action();
    }
}

function nextItem() {
    document.getElementById('box-scene').style.display = 'none';
    updateUI();
}

function unlockRandomCat() {
    const keys = Object.keys(CONFIG.fighters);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    if (!state.inventory.includes(randomKey)) {
        state.inventory.push(randomKey);
        alert(`🎉 Разблокирован новый кот: ${CONFIG.fighters[randomKey].name}!`);
    } else {
        state.gems += 100;
        alert(`Повторка! Компенсация: +100 Алмазов 💎`);
    }
}

// --- ПРОМОКОДЫ И ЧИТЫ (QAZ) ---
function usePromo() {
    const input = document.getElementById('promo-in');
    const code = input.value.trim().toLowerCase();
    const rawCode = input.value.trim().toUpperCase();

    // 1. ЧИТ-ШИФР QAZ
    if (CONFIG.secrets[code]) {
        const secret = CONFIG.secrets[code];
        state.energy += secret.energy;
        state.gems += secret.gems;
        state.darkMatter += secret.dm;
        alert(secret.msg);
        updateUI();
        input.value = '';
        saveGame();
        return;
    }

    // 2. ГЕНЕРАТОР КОДОВ (GEN)
    if (code === 'gen') {
        const newPromo = generateRandomPromo();
        state.energy += newPromo.reward.energy;
        state.gems += newPromo.reward.gems;
        state.darkMatter += newPromo.reward.dm;
        alert(`Сгенерирован чит-код [${newPromo.code}]!\n${newPromo.reward.msg}`);
        updateUI();
        input.value = '';
        saveGame();
        return;
    }

    // 3. ОБЫЧНЫЕ ПРОМОКОДЫ
    if (CONFIG.promos[rawCode]) {
        if (state.usedPromos.includes(rawCode)) {
            alert("Этот промокод уже использован!");
            return;
        }
        const reward = CONFIG.promos[rawCode];
        state.energy += reward.energy;
        state.gems += reward.gems;
        state.darkMatter += reward.dm;
        state.usedPromos.push(rawCode);
        alert(reward.msg);
        updateUI();
        input.value = '';
        saveGame();
        return;
    }

    alert("Неверный промокод или секретный шифр!");
}

// --- ПЕРЕРОЖДЕНИЕ (ASCENSION) ---
function doAscend() {
    const dmGain = Math.floor(15 * Math.pow(state.energy / 1e6, 0.2));
    if (dmGain <= 0) {
        alert('Нужно накопит больше энергии!');
        return;
    }

    if (confirm(`Вы уверены? Перерождение даст +${dmGain} 🌌 Темной Материи и сбросит энергию.`)) {
        state.darkMatter += dmGain;
        state.energy = 0;
        state.wave = 1;
        state.enemyHp = 50;
        CONFIG.buildings.forEach(b => state.buildings[b.id] = 0);
        updateUI();
        saveGame();
    }
}

// --- ОПЫТ И ПАСС ---
function addXp(amount) {
    state.passXp += amount;
    if (state.passXp >= 500) {
        state.passXp -= 500;
        state.passLvl++;
        state.gems += 50;
    }
}

function buyPlus() {
    if (state.gems >= 1000 && !state.hasPlus) {
        state.gems -= 1000;
        state.hasPlus = true;
        document.getElementById('buy-plus').innerText = 'VIP PASS АКТИВИРОВАН';
        document.getElementById('buy-plus').disabled = true;
        updateUI();
    }
}

// --- СОХРАНЕНИЯ ---
function saveGame() {
    localStorage.setItem('energy_cat_save', JSON.stringify(state));
}

function loadGame() {
    const raw = localStorage.getItem('energy_cat_save');
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            Object.assign(state, parsed);
        } catch (e) {
            console.error('Ошибка загрузки сохранения:', e);
        }
    }
}

function exportSave() {
    const str = btoa(JSON.stringify(state));
    const blob = new Blob([str], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cat_save_${Date.now()}.txt`;
    a.click();
}

function importSave(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const parsed = JSON.parse(atob(event.target.result));
            Object.assign(state, parsed);
            updateUI();
            saveGame();
            alert('Сохранение успешно импортировано!');
        } catch (err) {
            alert('Ошибка чтения файла сохранения!');
        }
    };
    reader.readAsText(file);
}

function hardReset() {
    if (confirm('ВНИМАНИЕ: Это полностью удалит весь прогресс! Продолжить?')) {
        localStorage.removeItem('energy_cat_save');
        location.reload();
    }
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// --- ОБНОВЛЕНИЕ UI ---
function updateUI() {
    document.getElementById('en-val').innerText = formatNum(state.energy);
    document.getElementById('gem-val').innerText = formatNum(state.gems);
    document.getElementById('dm-val').innerText = formatNum(state.darkMatter);
    document.getElementById('dust-val').innerText = formatNum(state.stardust);
    document.getElementById('wave-num').innerText = state.wave;

    document.getElementById('click-pwr').innerText = formatNum(state.clickPower);
    
    let teamDps = 0;
    state.squad.forEach(id => { if (CONFIG.fighters[id]) teamDps += CONFIG.fighters[id].power; });
    document.getElementById('team-dps').innerText = formatNum(teamDps);
    document.getElementById('global-mult').innerText = `x${(1 + state.darkMatter * 0.1).toFixed(1)}`;

    document.getElementById('q-prog').innerText = state.questProg;
    document.getElementById('q-targ').innerText = state.questTarg;
    document.getElementById('q-bar-fill').style.width = `${(state.questProg / state.questTarg) * 100}%`;

    document.getElementById('xp-v').innerText = state.passXp;
    document.getElementById('p-lvl').innerText = state.passLvl;
    document.getElementById('xp-f').style.width = `${(state.passXp / 500) * 100}%`;

    const dmGain = Math.floor(15 * Math.pow(state.energy / 1e6, 0.2));
    document.getElementById('dm-gain').innerText = Math.max(0, dmGain);

    // Сетка котов
    document.getElementById('f-count').innerText = state.inventory.length;
    const fGrid = document.getElementById('f-grid');
    fGrid.innerHTML = '';
    state.inventory.forEach(id => {
        const f = CONFIG.fighters[id];
        if (f) {
            fGrid.innerHTML += `
                <div class="f-card">
                    <div style="font-size:30px">${f.icon}</div>
                    <b>${f.name}</b><br>
                    <small>Урон: +${f.power}</small>
                </div>
            `;
        }
    });

    // Сетка построек
    const bContainer = document.getElementById('buildings-container');
    bContainer.innerHTML = '';
    CONFIG.buildings.forEach(b => {
        const count = state.buildings[b.id] || 0;
        const cost = Math.round(b.baseCost * Math.pow(1.15, count));
        bContainer.innerHTML += `
            <div class="f-card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <div>
                    ${b.icon} <b>${b.name}</b> (${count})<br>
                    <small>+${formatNum(b.baseEps)} ⚡/сек</small>
                </div>
                <button class="btn-shop rare" style="width:auto;" onclick="buyBuilding('${b.id}')">
                    ${formatNum(cost)} ⚡
                </button>
            </div>
        `;
    });
}

function buyBuilding(id) {
    const b = CONFIG.buildings.find(item => item.id === id);
    const count = state.buildings[id] || 0;
    const cost = Math.round(b.baseCost * Math.pow(1.15, count));

    if (state.energy >= cost) {
        state.energy -= cost;
        state.buildings[id] = count + 1;
        updateUI();
        saveGame();
    }
}

// --- ИГРОВОЙ ЦИКЛ (CANVAS И РЕНДЕР) ---
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка полосы HP Врага
    ctx.fillStyle = '#222';
    ctx.fillRect(50, 20, 350, 15);
    ctx.fillStyle = '#ff4757';
    ctx.fillRect(50, 20, Math.max(0, (state.enemyHp / state.enemyMaxHp)) * 350, 15);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(`ВРАГ: ${formatNum(state.enemyHp)} / ${formatNum(state.enemyMaxHp)}`, 225, 32);

    // Частицы урона
    particles.forEach((p, idx) => {
        p.update();
        p.draw();
        if (p.life <= 0) particles.splice(idx, 1);
    });

    requestAnimationFrame(gameLoop);
}

// Инициализация
loadGame();
updateUI();
gameLoop();

// Автоприбыль секунду и автосохранение раз в 10 сек
setInterval(() => {
    const eps = getEps();
    if (eps > 0) {
        addEnergy(eps);
        damageEnemy(eps);
    }
    updateUI();
}, 1000);

setInterval(saveGame, 10000);
