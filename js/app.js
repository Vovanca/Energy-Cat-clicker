function usePromo() {
    const input = document.getElementById('promo-in');
    const code = input.value.trim().toLowerCase();
    const rawCode = input.value.trim().toUpperCase();

    // 1. Проверка секретной фразы (qaz)
    if (CONFIG.secrets[code]) {
        const secret = CONFIG.secrets[code];
        state.energy += secret.energy;
        state.gems += secret.gems;
        state.darkMatter += secret.dm;
        alert(secret.msg);
        updateUI();
        input.value = '';
        return;
    }

    // 2. Генерировать случайный промокод прямо в игре по команде GEN
    if (code === 'gen') {
        const newPromo = generateRandomPromo();
        state.energy += newPromo.reward.energy;
        state.gems += newPromo.reward.gems;
        state.darkMatter += newPromo.reward.dm;
        alert(`Сгенерирован чит-код [${newPromo.code}]!\n${newPromo.reward.msg}`);
        updateUI();
        input.value = '';
        return;
    }

    // 3. Проверка стандартных промокодов
    if (CONFIG.promos[rawCode]) {
        if (state.usedPromos.includes(rawCode)) {
            alert("Этот промокод уже был использован!");
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
        return;
    }

    alert("Неверный промокод или шифр!");
}
