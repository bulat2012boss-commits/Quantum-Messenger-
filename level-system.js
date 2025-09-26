// level-system.js - Улучшенная система уровней и рейтинга для Quantum Messenger

class LevelSystem {
    constructor() {
        this.userLevel = parseInt(localStorage.getItem('quantumUserLevel')) || 1;
        this.userXP = parseInt(localStorage.getItem('quantumUserXP')) || 0;
        this.userRank = localStorage.getItem('quantumUserRank') || 'Новичок';
        this.userCoins = parseInt(localStorage.getItem('quantumUserCoins')) || 100;
        
        this.ranks = [
            { name: 'Новичок', minLevel: 1, color: '#95afc0', icon: '🌱' },
            { name: 'Активный', minLevel: 5, color: '#7bed9f', icon: '🚀' },
            { name: 'Эксперт', minLevel: 10, color: '#70a1ff', icon: '⭐' },
            { name: 'Мастер', minLevel: 15, color: '#ff6b81', icon: '🏆' },
            { name: 'Легенда', minLevel: 20, color: '#eccc68', icon: '👑' },
            { name: 'БОГ ЧАТА', minLevel: 25, color: '#ff9ff3', icon: '💎' }
        ];
        
        this.levelRewards = {
            5: { coins: 100, nft: 1, message: '🎉 Уровень 5! +100 монет и 1 NFT!' },
            10: { coins: 250, nft: 2, message: '🌟 Уровень 10! +250 монет и 2 NFT!' },
            15: { coins: 500, nft: 3, message: '🏆 Уровень 15! +500 монет и 3 NFT!' },
            20: { coins: 1000, nft: 5, message: '👑 Уровень 20! +1000 монет и 5 NFT!' },
            25: { coins: 2500, nft: 10, message: '💎 Уровень 25! БОГ ЧАТА! +2500 монет и 10 NFT!' }
        };
        
        this.init();
    }
    
    init() {
        this.createLevelBadge();
        this.setupEventListeners();
        this.checkDailyReward();
    }
    
    // Создание бейджа уровня
    createLevelBadge() {
        if (document.getElementById('levelBadge')) return;
        
        const levelBadge = document.createElement('div');
        levelBadge.id = 'levelBadge';
        levelBadge.className = 'level-badge';
        levelBadge.innerHTML = this.generateBadgeHTML();
        
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.appendChild(levelBadge);
        }
        
        this.addLevelBadgeStyles();
    }
    
    generateBadgeHTML() {
        const currentRank = this.getCurrentRank();
        const xpNeeded = this.calculateXPNeeded(this.userLevel);
        const progress = (this.userXP / xpNeeded) * 100;
        
        return `
            <div class="rank-info" onclick="levelSystem.showLevelModal()">
                <span class="rank-icon">${currentRank.icon}</span>
                <span class="rank-name">${this.userRank}</span>
            </div>
            <div class="level-info">
                <span class="level-text">Ур. ${this.userLevel}</span>
                <div class="xp-container">
                    <div class="xp-bar">
                        <div class="xp-progress" style="width: ${progress}%"></div>
                    </div>
                    <span class="xp-text">${this.userXP}/${xpNeeded}</span>
                </div>
            </div>
            <div class="coins-info" onclick="levelSystem.showCoinsModal()">
                <span class="coins-icon">🪙</span>
                <span class="coins-amount">${this.userCoins}</span>
            </div>
        `;
    }
    
    // Добавление XP
    addXP(amount, reason = 'активность') {
        if (!currentUser) return;
        
        const oldLevel = this.userLevel;
        this.userXP += amount;
        
        // Показываем всплывающее уведомление о получении XP
        this.showXPPopup(amount, reason);
        
        // Проверяем повышение уровня
        const xpNeeded = this.calculateXPNeeded(this.userLevel);
        
        if (this.userXP >= xpNeeded) {
            this.levelUp(oldLevel);
        } else {
            this.saveData();
            this.updateBadge();
        }
    }
    
    // Повышение уровня
    levelUp(oldLevel) {
        this.userLevel++;
        const xpNeeded = this.calculateXPNeeded(oldLevel);
        this.userXP = this.userXP - xpNeeded;
        
        this.saveData();
        this.updateBadge();
        this.showLevelUpAnimation(oldLevel, this.userLevel);
        this.checkLevelRewards(this.userLevel);
        this.checkNewRank();
        
        // Добавляем монеты за уровень
        this.addCoins(this.userLevel * 10);
    }
    
    // Добавление монет
    addCoins(amount) {
        this.userCoins += amount;
        this.saveData();
        this.updateBadge();
        
        // Показываем анимацию монет
        this.showCoinsAnimation(amount);
    }
    
    // Показ модального окна уровня
    showLevelModal() {
        this.createLevelModal();
    }
    
    // Создание модального окна уровня
    createLevelModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'levelModal';
        modal.innerHTML = this.generateLevelModalHTML();
        
        document.body.appendChild(modal);
        
        // Анимация появления
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Закрытие при клике вне окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeLevelModal();
            }
        });
    }
    
    generateLevelModalHTML() {
        const currentRank = this.getCurrentRank();
        const nextRank = this.getNextRank();
        const xpNeeded = this.calculateXPNeeded(this.userLevel);
        const progress = (this.userXP / xpNeeded) * 100;
        
        return `
            <div class="modal-content level-modal-content">
                <div class="level-modal-header">
                    <h3>🎯 Ваш прогресс</h3>
                    <button class="modal-close" onclick="levelSystem.closeLevelModal()">×</button>
                </div>
                
                <div class="level-stats">
                    <div class="stat-item">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-info">
                            <div class="stat-value">${this.userLevel}</div>
                            <div class="stat-label">Текущий уровень</div>
                        </div>
                    </div>
                    
                    <div class="stat-item">
                        <div class="stat-icon">🪙</div>
                        <div class="stat-info">
                            <div class="stat-value">${this.userCoins}</div>
                            <div class="stat-label">Монеты</div>
                        </div>
                    </div>
                    
                    <div class="stat-item">
                        <div class="stat-icon">${currentRank.icon}</div>
                        <div class="stat-info">
                            <div class="stat-value">${this.userRank}</div>
                            <div class="stat-label">Ранг</div>
                        </div>
                    </div>
                </div>
                
                <div class="progress-section">
                    <div class="progress-header">
                        <span>Прогресс до уровня ${this.userLevel + 1}</span>
                        <span>${this.userXP}/${xpNeeded} XP</span>
                    </div>
                    <div class="xp-bar-large">
                        <div class="xp-progress-large" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-percentage">${progress.toFixed(1)}%</div>
                </div>
                
                ${nextRank ? `
                <div class="next-rank-section">
                    <div class="next-rank-header">
                        <span>Следующий ранг</span>
                        <span>Уровень ${nextRank.minLevel}</span>
                    </div>
                    <div class="next-rank-info">
                        <span class="next-rank-icon">${nextRank.icon}</span>
                        <span class="next-rank-name">${nextRank.name}</span>
                    </div>
                    <div class="levels-remaining">Осталось уровней: ${nextRank.minLevel - this.userLevel}</div>
                </div>
                ` : ''}
                
                <div class="level-actions">
                    <button class="level-action-btn" onclick="levelSystem.claimDailyReward()">
                        <span>🎁</span>
                        <span>Ежедневная награда</span>
                    </button>
                    <button class="level-action-btn" onclick="levelSystem.showAchievements()">
                        <span>🏆</span>
                        <span>Достижения</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    closeLevelModal() {
        const modal = document.getElementById('levelModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
    
    // Анимация повышения уровня
    showLevelUpAnimation(oldLevel, newLevel) {
        const animation = document.createElement('div');
        animation.className = 'level-up-animation';
        animation.innerHTML = `
            <div class="level-up-content">
                <div class="confetti"></div>
                <div class="level-up-icon">🎉</div>
                <div class="level-up-text">
                    <div class="level-up-title">НОВЫЙ УРОВЕНЬ!</div>
                    <div class="level-up-numbers">
                        <span class="old-level">${oldLevel}</span>
                        <span class="arrow">→</span>
                        <span class="new-level">${newLevel}</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(animation);
        
        // Удаляем анимацию через 3 секунды
        setTimeout(() => {
            animation.classList.add('fade-out');
            setTimeout(() => {
                animation.remove();
            }, 500);
        }, 3000);
    }
    
    // Всплывающее уведомление о XP
    showXPPopup(amount, reason) {
        const popup = document.createElement('div');
        popup.className = 'xp-popup';
        popup.innerHTML = `
            <span class="xp-icon">⭐</span>
            <span class="xp-amount">+${amount} XP</span>
            <span class="xp-reason">${reason}</span>
        `;
        
        const levelBadge = document.getElementById('levelBadge');
        if (levelBadge) {
            levelBadge.appendChild(popup);
            
            // Анимация появления и исчезновения
            setTimeout(() => {
                popup.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                popup.classList.remove('show');
                setTimeout(() => {
                    popup.remove();
                }, 300);
            }, 2000);
        }
    }
    
    // Анимация монет
    showCoinsAnimation(amount) {
        const animation = document.createElement('div');
        animation.className = 'coins-animation';
        animation.innerHTML = `
            <div class="coins-content">
                <span class="coins-icon">🪙</span>
                <span class="coins-text">+${amount}</span>
            </div>
        `;
        
        const coinsInfo = document.querySelector('.coins-info');
        if (coinsInfo) {
            coinsInfo.appendChild(animation);
            
            setTimeout(() => {
                animation.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                animation.classList.remove('show');
                setTimeout(() => {
                    animation.remove();
                }, 300);
            }, 1500);
        }
    }
    
    // Ежедневная награда
    claimDailyReward() {
        const today = new Date().toDateString();
        const lastClaim = localStorage.getItem('lastDailyClaim');
        
        if (lastClaim === today) {
            this.showNotification("Вы уже получали награду сегодня. Приходите завтра!", 'warning');
            return;
        }
        
        const reward = Math.floor(Math.random() * 50) + 50; // 50-100 монет
        const xpReward = Math.floor(Math.random() * 20) + 10; // 10-30 XP
        
        this.addCoins(reward);
        this.addXP(xpReward, 'ежедневная награда');
        
        localStorage.setItem('lastDailyClaim', today);
        
        this.showNotification(`🎁 Ежедневная награда: ${reward} монет и ${xpReward} XP!`, 'success');
        this.closeLevelModal();
    }
    
    // Вспомогательные методы
    calculateXPNeeded(level) {
        return Math.floor(100 * Math.pow(1.2, level - 1));
    }
    
    getCurrentRank() {
        return this.ranks.find(rank => this.userLevel >= rank.minLevel) || this.ranks[0];
    }
    
    getNextRank() {
        return this.ranks.find(rank => this.userLevel < rank.minLevel);
    }
    
    checkLevelRewards(level) {
        if (this.levelRewards[level]) {
            const reward = this.levelRewards[level];
            this.addCoins(reward.coins);
            this.showNotification(reward.message, 'success');
        }
    }
    
    checkNewRank() {
        const newRank = this.ranks.find(rank => this.userLevel >= rank.minLevel) || this.ranks[0];
        
        if (newRank.name !== this.userRank) {
            this.userRank = newRank.name;
            this.saveData();
            this.showNotification(`🎖️ Новый ранг: ${this.userRank}`, 'success');
        }
    }
    
    checkDailyReward() {
        const today = new Date().toDateString();
        const lastClaim = localStorage.getItem('lastDailyClaim');
        
        if (lastClaim !== today) {
            setTimeout(() => {
                this.showNotification("Не забудьте получить ежедневную награду! 🎁", 'info');
            }, 5000);
        }
    }
    
    updateBadge() {
        const levelBadge = document.getElementById('levelBadge');
        if (levelBadge) {
            levelBadge.innerHTML = this.generateBadgeHTML();
        }
    }
    
    saveData() {
        localStorage.setItem('quantumUserLevel', this.userLevel);
        localStorage.setItem('quantumUserXP', this.userXP);
        localStorage.setItem('quantumUserRank', this.userRank);
        localStorage.setItem('quantumUserCoins', this.userCoins);
    }
    
    showNotification(message, type = 'info') {
        // Используем существующую функцию showNotification или создаем новую
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
    
    setupEventListeners() {
        // Обработчики для кликабельных элементов
        document.addEventListener('click', (e) => {
            if (e.target.closest('.level-badge')) {
                this.showLevelModal();
            }
        });
    }
    
    addLevelBadgeStyles() {
        const styles = `
            <style>
                .level-badge {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(0, 0, 0, 0.3);
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    margin-left: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    position: relative;
                }
                
                .level-badge:hover {
                    background: rgba(0, 0, 0, 0.5);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
                
                .rank-info, .coins-info {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 4px 8px;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    transition: background 0.3s ease;
                }
                
                .rank-info:hover, .coins-info:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .level-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3px;
                }
                
                .level-text {
                    font-weight: bold;
                    font-size: 11px;
                }
                
                .xp-container {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .xp-bar {
                    width: 40px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 2px;
                    overflow: hidden;
                }
                
                .xp-progress {
                    height: 100%;
                    background: linear-gradient(90deg, #00b894, #00cec9);
                    border-radius: 2px;
                    transition: width 0.5s ease;
                }
                
                .xp-text {
                    font-size: 9px;
                    opacity: 0.8;
                }
                
                .rank-icon, .coins-icon {
                    font-size: 14px;
                }
                
                .rank-name {
                    font-size: 10px;
                    font-weight: bold;
                }
                
                .coins-amount {
                    font-size: 10px;
                    font-weight: bold;
                }
                
                /* Анимации */
                .xp-popup {
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 10px;
                    opacity: 0;
                    transition: all 0.3s ease;
                    pointer-events: none;
                    white-space: nowrap;
                }
                
                .xp-popup.show {
                    opacity: 1;
                    top: -40px;
                }
                
                .xp-icon {
                    color: #ffeaa7;
                }
                
                .xp-amount {
                    font-weight: bold;
                    color: #00b894;
                }
                
                .xp-reason {
                    opacity: 0.8;
                    font-size: 9px;
                }
                
                .coins-animation {
                    position: absolute;
                    top: -25px;
                    right: 0;
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                
                .coins-animation.show {
                    opacity: 1;
                    top: -35px;
                }
                
                .coins-content {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    background: rgba(255, 193, 7, 0.2);
                    padding: 3px 6px;
                    border-radius: 10px;
                    font-size: 10px;
                }
                
                /* Модальное окно уровней */
                .level-modal-content {
                    max-width: 400px;
                    background: linear-gradient(135deg, #0f2027, #203a43);
                }
                
                .level-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    color: var(--text-color);
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.3s ease;
                }
                
                .modal-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .level-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-bottom: 20px;
                }
                
                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    text-align: left;
                }
                
                .stat-icon {
                    font-size: 24px;
                }
                
                .stat-value {
                    font-size: 18px;
                    font-weight: bold;
                }
                
                .stat-label {
                    font-size: 11px;
                    opacity: 0.8;
                }
                
                .progress-section {
                    margin-bottom: 20px;
                }
                
                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 12px;
                }
                
                .xp-bar-large {
                    width: 100%;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 5px;
                }
                
                .xp-progress-large {
                    height: 100%;
                    background: linear-gradient(90deg, #00b894, #00cec9);
                    border-radius: 4px;
                    transition: width 1s ease;
                }
                
                .progress-percentage {
                    text-align: right;
                    font-size: 11px;
                    opacity: 0.8;
                }
                
                .next-rank-section {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }
                
                .next-rank-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 12px;
                }
                
                .next-rank-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 5px;
                }
                
                .next-rank-icon {
                    font-size: 20px;
                }
                
                .next-rank-name {
                    font-weight: bold;
                }
                
                .levels-remaining {
                    font-size: 11px;
                    opacity: 0.8;
                }
                
                .level-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                
                .level-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    border-radius: 8px;
                    color: var(--text-color);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 12px;
                }
                
                .level-action-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }
                
                /* Анимация повышения уровня */
                .level-up-animation {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10000;
                    pointer-events: none;
                }
                
                .level-up-content {
                    background: linear-gradient(135deg, #6a11cb, #2575fc);
                    padding: 30px 40px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                    position: relative;
                    overflow: hidden;
                    animation: levelUpScale 0.5s ease;
                }
                
                .confetti {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" font-size="10">🎊</text></svg>') repeat;
                    opacity: 0.3;
                    animation: confettiFall 2s linear infinite;
                }
                
                .level-up-icon {
                    font-size: 48px;
                    margin-bottom: 10px;
                    animation: bounce 1s infinite;
                }
                
                .level-up-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                
                .level-up-numbers {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    font-size: 24px;
                }
                
                .old-level {
                    opacity: 0.7;
                }
                
                .arrow {
                    animation: pulse 1s infinite;
                }
                
                .new-level {
                    font-size: 32px;
                    font-weight: bold;
                    color: #ffeaa7;
                    animation: glow 1s infinite alternate;
                }
                
                .fade-out {
                    opacity: 0;
                    transition: opacity 0.5s ease;
                }
                
                @keyframes levelUpScale {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    70% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                
                @keyframes confettiFall {
                    0% { transform: translateY(-100px) rotate(0deg); }
                    100% { transform: translateY(100px) rotate(360deg); }
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                @keyframes glow {
                    0% { text-shadow: 0 0 5px #ffeaa7; }
                    100% { text-shadow: 0 0 20px #ffeaa7, 0 0 30px #ffd700; }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Инициализация системы уровней
let levelSystem;

function initLevelSystem() {
    levelSystem = new LevelSystem();
    
    // Интеграция с существующей системой
    if (typeof addXP === 'function') {
        const originalAddXP = addXP;
        addXP = function(amount, reason) {
            originalAddXP(amount, reason);
            if (levelSystem) {
                levelSystem.addXP(amount, reason);
            }
        };
    }
    
    // Добавляем XP за различные действия
    setTimeout(() => {
        if (currentUser) {
            levelSystem.addXP(10, 'вход в чат');
        }
    }, 2000);
}

// Запускаем систему при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLevelSystem);
} else {
    initLevelSystem();
}