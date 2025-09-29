// level-system.js - Улучшенная система уровней и рейтинга для Quantum Messenger

class LevelSystem {
    constructor() {
        this.userLevel = parseInt(localStorage.getItem('quantumUserLevel')) || 1;
        this.userXP = parseInt(localStorage.getItem('quantumUserXP')) || 0;
        this.userRank = localStorage.getItem('quantumUserRank') || 'Новичок';
        this.userCoins = parseInt(localStorage.getItem('quantumUserCoins')) || 100;
        this.lastActivityTime = parseInt(localStorage.getItem('quantumLastActivityTime')) || Date.now();
        this.isActive = false;
        
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
        this.setupActivityTracking();
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
    
    // Добавление XP с защитой от фарма
    addXP(amount, reason = 'активность') {
        if (!currentUser) return;
        
        // Защита от быстрого фарма
        const now = Date.now();
        const timeSinceLastXP = now - this.lastActivityTime;
        
        // Минимальное время между начислениями XP - 30 секунд
        if (timeSinceLastXP < 30000 && reason === 'активность в чате') {
            return;
        }
        
        // Для сообщений - ограничение 1 XP в минуту
        if (reason === 'отправка сообщения' && timeSinceLastXP < 60000) {
            return;
        }
        
        const oldLevel = this.userLevel;
        this.userXP += amount;
        this.lastActivityTime = now;
        localStorage.setItem('quantumLastActivityTime', now);
        
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
    
    // Настройка отслеживания активности
    setupActivityTracking() {
        // Отслеживаем активность пользователя
        document.addEventListener('mousemove', this.handleUserActivity.bind(this));
        document.addEventListener('keypress', this.handleUserActivity.bind(this));
        document.addEventListener('click', this.handleUserActivity.bind(this));
        
        // Проверяем активность каждую минуту
        setInterval(() => {
            this.checkActiveStatus();
        }, 60000);
    }
    
    handleUserActivity() {
        this.isActive = true;
        this.lastActivityTime = Date.now();
    }
    
    checkActiveStatus() {
        const now = Date.now();
        const inactiveTime = now - this.lastActivityTime;
        
        // Если пользователь неактивен более 5 минут, сбрасываем статус
        if (inactiveTime > 300000) { // 5 минут
            this.isActive = false;
        }
        
        // Начисляем XP только если пользователь активен
        if (this.isActive) {
            this.addXP(1, 'активность в чате');
        }
    }
    
    // Вспомогательные методы
    calculateXPNeeded(level) {
        return Math.floor(100 * Math.pow(1.2, level - 1));
    }
    
    getCurrentRank() {
        return this.ranks.slice().reverse().find(rank => this.userLevel >= rank.minLevel) || this.ranks[0];
    }
    
    getNextRank() {
        const currentRankIndex = this.ranks.findIndex(rank => rank.name === this.userRank);
        return currentRankIndex < this.ranks.length - 1 ? this.ranks[currentRankIndex + 1] : null;
    }
    
    checkNewRank() {
        const newRank = this.getCurrentRank();
        if (newRank.name !== this.userRank) {
            this.userRank = newRank.name;
            this.saveData();
            this.showNotification(`🎉 Новый ранг: ${newRank.name}!`, 'success');
        }
    }
    
    checkLevelRewards(level) {
        const reward = this.levelRewards[level];
        if (reward) {
            this.addCoins(reward.coins);
            this.showNotification(reward.message, 'success');
        }
    }
    
    checkDailyReward() {
        const today = new Date().toDateString();
        const lastClaim = localStorage.getItem('lastDailyClaim');
        
        if (lastClaim !== today) {
            // Показываем уведомление о доступной награде
            setTimeout(() => {
                this.showNotification("🎁 Доступна ежедневная награда! Нажмите на бейдж уровня.", 'info');
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
        // Используем существующую систему уведомлений или создаем простую
        if (window.showNotification) {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    addLevelBadgeStyles() {
        if (document.getElementById('levelSystemStyles')) return;
        
        const styleLink = document.createElement('link');
        styleLink.id = 'levelSystemStyles';
        styleLink.rel = 'stylesheet';
        styleLink.href = 'level-system.css';
        document.head.appendChild(styleLink);
    }
    
    setupEventListeners() {
        // Слушатель для отправки сообщений
        document.addEventListener('DOMContentLoaded', () => {
            const messageInput = document.querySelector('.message-input');
            const sendButton = document.querySelector('.send-button');
            
            if (messageInput) {
                messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && messageInput.value.trim()) {
                        this.addXP(5, 'отправка сообщения');
                    }
                });
            }
            
            if (sendButton) {
                sendButton.addEventListener('click', () => {
                    if (messageInput && messageInput.value.trim()) {
                        this.addXP(5, 'отправка сообщения');
                    }
                });
            }
        });
    }
    
    // Метод для отладки (можно удалить в продакшене)
    debugInfo() {
        console.log({
            level: this.userLevel,
            xp: this.userXP,
            rank: this.userRank,
            coins: this.userCoins,
            isActive: this.isActive,
            lastActivity: new Date(this.lastActivityTime)
        });
    }
}

// Инициализация системы уровней
let levelSystem;

function initLevelSystem() {
    levelSystem = new LevelSystem();
    
    // Добавляем XP при входе в чат (только если пользователь активен)
    setTimeout(() => {
        if (currentUser && levelSystem.isActive) {
            levelSystem.addXP(10, 'вход в чат');
        }
    }, 2000);
}

// Запускаем систему уровней при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLevelSystem);
} else {
    initLevelSystem();
}