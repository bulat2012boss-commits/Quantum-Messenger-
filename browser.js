// enhanced-gifts.js
// УЛУЧШЕННАЯ СИСТЕМА ПОДАРКОВ ДЛЯ QUANTUM MESSENGER

class EnhancedGiftSystem {
    constructor(database, currentUser, userId) {
        this.database = database;
        this.currentUser = currentUser;
        this.userId = userId;
        
        // Категории подарков
        this.giftCategories = {
            regular: {
                name: "Обычные подарки",
                gifts: [
                    { id: 'gift_1', emoji: '🎁', name: 'Подарок', price: 0, rarity: 'common' },
                    { id: 'gift_2', emoji: '🎉', name: 'Праздник', price: 0, rarity: 'common' },
                    { id: 'gift_3', emoji: '❤️', name: 'Любовь', price: 0, rarity: 'common' },
                    { id: 'gift_4', emoji: '👍', name: 'Класс', price: 0, rarity: 'common' },
                    { id: 'gift_5', emoji: '✨', name: 'Блеск', price: 0, rarity: 'common' },
                    { id: 'gift_6', emoji: '🎈', name: 'Шарик', price: 0, rarity: 'common' },
                    { id: 'gift_7', emoji: '🍕', name: 'Пицца', price: 0, rarity: 'common' },
                    { id: 'gift_8', emoji: '☕', name: 'Кофе', price: 0, rarity: 'common' }
                ]
            },
            special: {
                name: "Особые подарки",
                gifts: [
                    { id: 'gift_9', emoji: '🌟', name: 'Звезда', price: 10, rarity: 'rare' },
                    { id: 'gift_10', emoji: '💎', name: 'Алмаз', price: 20, rarity: 'rare' },
                    { id: 'gift_11', emoji: '🎨', name: 'Искусство', price: 15, rarity: 'rare' },
                    { id: 'gift_12', emoji: '⚡', name: 'Энергия', price: 12, rarity: 'rare' },
                    { id: 'gift_13', emoji: '🌙', name: 'Луна', price: 18, rarity: 'rare' },
                    { id: 'gift_14', emoji: '🔥', name: 'Огонь', price: 8, rarity: 'rare' }
                ]
            },
            nft: {
                name: "NFT подарки",
                gifts: [
                    { id: 'gift_15', emoji: '🏆', name: 'Кубок', price: 50, rarity: 'legendary', animation: 'trophySpin' },
                    { id: 'gift_16', emoji: '👑', name: 'Корона', price: 100, rarity: 'legendary', animation: 'crownGlow' },
                    { id: 'gift_17', emoji: '⭐', name: 'Суперзвезда', price: 75, rarity: 'legendary', animation: 'starPulse' },
                    { id: 'gift_18', emoji: '💫', name: 'Комета', price: 60, rarity: 'legendary', animation: 'cometFly' },
                    { id: 'gift_19', emoji: '🎭', name: 'Маска', price: 45, rarity: 'legendary', animation: 'maskMystery' },
                    { id: 'gift_20', emoji: '🔮', name: 'Кристалл', price: 80, rarity: 'legendary', animation: 'crystalShine' }
                ]
            },
            seasonal: {
                name: "Сезонные подарки",
                gifts: [
                    { id: 'gift_21', emoji: '🎄', name: 'Ёлка', price: 25, rarity: 'seasonal', seasonal: 'winter' },
                    { id: 'gift_22', emoji: '🎃', name: 'Тыква', price: 25, rarity: 'seasonal', seasonal: 'autumn' },
                    { id: 'gift_23', emoji: '🌺', name: 'Цветок', price: 25, rarity: 'seasonal', seasonal: 'spring' },
                    { id: 'gift_24', emoji: '🌞', name: 'Солнце', price: 25, rarity: 'seasonal', seasonal: 'summer' }
                ]
            }
        };
        
        // Статистика подарков пользователя
        this.userGiftStats = {
            sent: 0,
            received: 0,
            coinsSpent: 0,
            favoriteGift: null,
            lastGiftSent: null
        };
        
        this.init();
    }
    
    init() {
        this.loadUserGiftStats();
        this.setupGiftModal();
        this.setupGiftInventory();
    }
    
    // Загрузка статистики подарков пользователя
    loadUserGiftStats() {
        const statsRef = this.database.ref(`giftStats/${this.userId}`);
        statsRef.once('value').then(snapshot => {
            if (snapshot.exists()) {
                this.userGiftStats = { ...this.userGiftStats, ...snapshot.val() };
            }
        });
    }
    
    // Сохранение статистики подарков
    saveUserGiftStats() {
        this.database.ref(`giftStats/${this.userId}`).set(this.userGiftStats);
    }
    
    // Настройка модального окна подарков
    setupGiftModal() {
        // Создаем улучшенное модальное окно подарков
        this.createEnhancedGiftModal();
        
        // Обработчики событий
        this.setupGiftEventListeners();
    }
    
    // Создание улучшенного модального окна
    createEnhancedGiftModal() {
        // Если модальное окно уже существует, обновляем его
        let giftModal = document.getElementById('enhancedGiftModal');
        
        if (!giftModal) {
            giftModal = document.createElement('div');
            giftModal.id = 'enhancedGiftModal';
            giftModal.className = 'modal';
            giftModal.innerHTML = this.getGiftModalHTML();
            document.body.appendChild(giftModal);
        } else {
            giftModal.innerHTML = this.getGiftModalHTML();
        }
        
        // Заполняем категории подарков
        this.renderGiftCategories();
    }
    
    // HTML для модального окна подарков
    getGiftModalHTML() {
        return `
            <div class="modal-content enhanced-gift-modal">
                <div class="gift-modal-header">
                    <h3>🎁 Отправить подарок</h3>
                    <div class="user-coins-display">
                        <i class="fas fa-coins"></i>
                        <span id="userCoinsCount">0</span> монет
                    </div>
                </div>
                
                <div class="gift-recipient-section">
                    <div class="recipient-selector">
                        <label>Получатель:</label>
                        <select id="giftRecipientSelect">
                            <option value="">Выберите получателя...</option>
                        </select>
                        <div class="recipient-preview" id="recipientPreview" style="display: none;">
                            <div class="recipient-avatar"></div>
                            <div class="recipient-name"></div>
                        </div>
                    </div>
                </div>
                
                <div class="gift-categories-tabs">
                    <div class="gift-tab active" data-category="regular">Обычные</div>
                    <div class="gift-tab" data-category="special">Особые</div>
                    <div class="gift-tab" data-category="nft">NFT</div>
                    <div class="gift-tab" data-category="seasonal">Сезонные</div>
                </div>
                
                <div class="gift-categories-container">
                    <!-- Категории будут заполнены JavaScript -->
                </div>
                
                <div class="selected-gift-preview" id="selectedGiftPreview" style="display: none;">
                    <div class="preview-title">Выбранный подарок:</div>
                    <div class="gift-preview-content">
                        <div class="gift-emoji-preview"></div>
                        <div class="gift-info-preview">
                            <div class="gift-name-preview"></div>
                            <div class="gift-price-preview"></div>
                        </div>
                    </div>
                </div>
                
                <div class="gift-message-section">
                    <textarea id="giftMessageInput" placeholder="Добавьте сообщение к подарку (необязательно)..."></textarea>
                </div>
                
                <div class="gift-modal-actions">
                    <button class="modal-btn secondary" id="closeEnhancedGiftBtn">Отмена</button>
                    <button class="modal-btn primary" id="sendEnhancedGiftBtn" disabled>Отправить подарок</button>
                </div>
            </div>
        `;
    }
    
    // Рендер категорий подарков
    renderGiftCategories() {
        const container = document.querySelector('.gift-categories-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.keys(this.giftCategories).forEach(categoryKey => {
            const category = this.giftCategories[categoryKey];
            const categoryElement = document.createElement('div');
            categoryElement.className = `gift-category ${categoryKey}`;
            categoryElement.style.display = categoryKey === 'regular' ? 'block' : 'none';
            
            let giftsHTML = '';
            category.gifts.forEach(gift => {
                const canAfford = this.canAffordGift(gift);
                giftsHTML += `
                    <div class="gift-item ${gift.rarity} ${canAfford ? '' : 'locked'}" 
                         data-gift-id="${gift.id}" 
                         data-category="${categoryKey}">
                        <div class="gift-emoji">${gift.emoji}</div>
                        <div class="gift-name">${gift.name}</div>
                        <div class="gift-price">
                            ${gift.price > 0 ? `<i class="fas fa-coins"></i> ${gift.price}` : 'Бесплатно'}
                        </div>
                        ${!canAfford ? '<div class="gift-locked-overlay"><i class="fas fa-lock"></i></div>' : ''}
                    </div>
                `;
            });
            
            categoryElement.innerHTML = `
                <h4>${category.name}</h4>
                <div class="gifts-grid">
                    ${giftsHTML}
                </div>
            `;
            
            container.appendChild(categoryElement);
        });
    }
    
    // Настройка обработчиков событий
    setupGiftEventListeners() {
        // Переключение вкладок категорий
        document.querySelectorAll('.gift-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.gift-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const category = tab.getAttribute('data-category');
                document.querySelectorAll('.gift-category').forEach(cat => {
                    cat.style.display = 'none';
                });
                document.querySelector(`.gift-category.${category}`).style.display = 'block';
            });
        });
        
        // Выбор подарка
        document.addEventListener('click', (e) => {
            if (e.target.closest('.gift-item')) {
                const giftItem = e.target.closest('.gift-item');
                if (giftItem.classList.contains('locked')) return;
                
                this.selectGift(giftItem);
            }
        });
        
        // Отправка подарка
        document.getElementById('sendEnhancedGiftBtn')?.addEventListener('click', () => {
            this.sendEnhancedGift();
        });
        
        // Закрытие модального окна
        document.getElementById('closeEnhancedGiftBtn')?.addEventListener('click', () => {
            this.closeGiftModal();
        });
        
        // Выбор получателя
        document.getElementById('giftRecipientSelect')?.addEventListener('change', (e) => {
            this.updateRecipientPreview(e.target.value);
        });
    }
    
    // Выбор подарка
    selectGift(giftItem) {
        // Снимаем выделение со всех подарков
        document.querySelectorAll('.gift-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Выделяем выбранный подарок
        giftItem.classList.add('selected');
        
        const giftId = giftItem.getAttribute('data-gift-id');
        const category = giftItem.getAttribute('data-category');
        const gift = this.findGiftById(giftId, category);
        
        if (gift) {
            this.showGiftPreview(gift);
            this.updateSendButton();
        }
    }
    
    // Поиск подарка по ID
    findGiftById(giftId, category) {
        return this.giftCategories[category].gifts.find(g => g.id === giftId);
    }
    
    // Показ превью выбранного подарка
    showGiftPreview(gift) {
        const preview = document.getElementById('selectedGiftPreview');
        const emojiPreview = preview.querySelector('.gift-emoji-preview');
        const namePreview = preview.querySelector('.gift-name-preview');
        const pricePreview = preview.querySelector('.gift-price-preview');
        
        emojiPreview.textContent = gift.emoji;
        namePreview.textContent = gift.name;
        pricePreview.innerHTML = gift.price > 0 ? 
            `<i class="fas fa-coins"></i> ${gift.price}` : 'Бесплатно';
        
        // Добавляем класс редкости для стилизации
        preview.className = `selected-gift-preview ${gift.rarity}`;
        preview.style.display = 'flex';
        
        // Добавляем анимацию, если есть
        if (gift.animation) {
            emojiPreview.className = `gift-emoji-preview ${gift.animation}`;
        } else {
            emojiPreview.className = 'gift-emoji-preview';
        }
    }
    
    // Обновление кнопки отправки
    updateSendButton() {
        const sendBtn = document.getElementById('sendEnhancedGiftBtn');
        const recipient = document.getElementById('giftRecipientSelect').value;
        const hasSelectedGift = document.querySelector('.gift-item.selected');
        
        sendBtn.disabled = !(recipient && hasSelectedGift);
    }
    
    // Обновление превью получателя
    updateRecipientPreview(recipientId) {
        const preview = document.getElementById('recipientPreview');
        
        if (!recipientId) {
            preview.style.display = 'none';
            this.updateSendButton();
            return;
        }
        
        // Загружаем информацию о получателе
        this.database.ref(`profiles/${recipientId}`).once('value').then(snapshot => {
            if (snapshot.exists()) {
                const user = snapshot.val();
                const avatar = preview.querySelector('.recipient-avatar');
                const name = preview.querySelector('.recipient-name');
                
                // Устанавливаем аватар
                if (user.avatar) {
                    if (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) {
                        avatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
                    } else {
                        avatar.textContent = user.avatar;
                    }
                } else {
                    avatar.textContent = user.name.charAt(0).toUpperCase();
                }
                
                name.textContent = user.name;
                preview.style.display = 'flex';
            }
            
            this.updateSendButton();
        });
    }
    
    // Проверка возможности покупки подарка
    canAffordGift(gift) {
        // В реальном приложении здесь бы проверялся баланс пользователя
        // Для демонстрации считаем, что у пользователя всегда есть монеты
        return true;
    }
    
    // Отправка улучшенного подарка
    sendEnhancedGift() {
        const recipientSelect = document.getElementById('giftRecipientSelect');
        const recipientId = recipientSelect.value;
        const messageInput = document.getElementById('giftMessageInput');
        const giftMessage = messageInput.value.trim();
        
        if (!recipientId) {
            showNotification("Выберите получателя подарка");
            return;
        }
        
        const selectedGiftItem = document.querySelector('.gift-item.selected');
        if (!selectedGiftItem) {
            showNotification("Выберите подарок для отправки");
            return;
        }
        
        const giftId = selectedGiftItem.getAttribute('data-gift-id');
        const category = selectedGiftItem.getAttribute('data-category');
        const gift = this.findGiftById(giftId, category);
        
        if (!gift) {
            showNotification("Ошибка: подарок не найден");
            return;
        }
        
        // Получаем информацию о получателе
        this.database.ref(`profiles/${recipientId}`).once('value').then(snapshot => {
            if (!snapshot.exists()) {
                showNotification("Получатель не найден");
                return;
            }
            
            const recipient = snapshot.val();
            this.processGiftSending(gift, recipientId, recipient.name, giftMessage);
        });
    }
    
    // Обработка отправки подарка
    processGiftSending(gift, recipientId, recipientName, giftMessage) {
        const timestamp = Date.now();
        
        const giftData = {
            type: 'enhanced_gift',
            gift: gift.emoji,
            giftId: gift.id,
            giftName: gift.name,
            giftRarity: gift.rarity,
            giftCategory: this.getGiftCategory(gift.id),
            giftAnimation: gift.animation || null,
            giftPrice: gift.price,
            name: this.currentUser,
            userId: this.userId,
            timestamp: timestamp,
            recipientId: recipientId,
            recipientName: recipientName,
            message: giftMessage || '',
            isDeveloper: window.isDeveloper || false,
            isTester: window.isTester || false
        };
        
        // Отправляем подарок в базу данных
        this.database.ref('messages').push(giftData, (error) => {
            if (error) {
                console.error("Ошибка отправки подарка:", error);
                showNotification("Ошибка отправки подарка");
            } else {
                // Обновляем статистику
                this.updateGiftStats(gift);
                
                // Воспроизводим звук
                this.playGiftSound(gift.rarity);
                
                // Показываем уведомление
                showNotification(`🎁 Подарок "${gift.name}" отправлен пользователю ${recipientName}!`);
                
                // Закрываем модальное окно
                this.closeGiftModal();
                
                // Запускаем анимацию для отправителя
                this.showGiftSentAnimation(gift);
            }
        });
    }
    
    // Получение категории подарка
    getGiftCategory(giftId) {
        for (const categoryKey in this.giftCategories) {
            const category = this.giftCategories[categoryKey];
            if (category.gifts.find(g => g.id === giftId)) {
                return categoryKey;
            }
        }
        return 'regular';
    }
    
    // Обновление статистики подарков
    updateGiftStats(gift) {
        this.userGiftStats.sent++;
        this.userGiftStats.coinsSpent += gift.price;
        this.userGiftStats.lastGiftSent = Date.now();
        
        // Обновляем самый частый подарок
        this.updateFavoriteGift(gift.id);
        
        // Сохраняем статистику
        this.saveUserGiftStats();
        
        // Обновляем статистику получателя
        this.updateRecipientGiftStats(gift);
    }
    
    // Обновление статистики получателя
    updateRecipientGiftStats(gift) {
        const recipientSelect = document.getElementById('giftRecipientSelect');
        const recipientId = recipientSelect.value;
        
        if (!recipientId) return;
        
        const recipientStatsRef = this.database.ref(`giftStats/${recipientId}`);
        recipientStatsRef.transaction(stats => {
            if (!stats) {
                stats = { received: 0, giftsByRarity: {} };
            }
            
            stats.received = (stats.received || 0) + 1;
            stats.giftsByRarity = stats.giftsByRarity || {};
            stats.giftsByRarity[gift.rarity] = (stats.giftsByRarity[gift.rarity] || 0) + 1;
            stats.lastGiftReceived = Date.now();
            
            return stats;
        });
    }
    
    // Обновление любимого подарка
    updateFavoriteGift(giftId) {
        // В реальном приложении здесь бы велась более сложная статистика
        // Для демонстрации просто устанавливаем последний отправленный подарок
        this.userGiftStats.favoriteGift = giftId;
    }
    
    // Воспроизведение звука подарка
    playGiftSound(rarity) {
        const soundMap = {
            'common': 'notification',
            'rare': 'gift',
            'legendary': 'levelup',
            'seasonal': 'gift'
        };
        
        const soundName = soundMap[rarity] || 'gift';
        
        // В реальном приложении здесь бы воспроизводились разные звуки
        if (window.playNotificationSound) {
            window.playNotificationSound();
        }
    }
    
    // Анимация отправки подарка
    showGiftSentAnimation(gift) {
        const animationContainer = document.createElement('div');
        animationContainer.className = 'gift-sent-animation';
        animationContainer.innerHTML = `
            <div class="gift-sent-content ${gift.rarity}">
                <div class="gift-sent-emoji ${gift.animation || ''}">${gift.emoji}</div>
                <div class="gift-sent-text">Подарок отправлен!</div>
            </div>
        `;
        
        document.body.appendChild(animationContainer);
        
        // Удаляем анимацию через 2 секунды
        setTimeout(() => {
            if (animationContainer.parentNode) {
                animationContainer.parentNode.removeChild(animationContainer);
            }
        }, 2000);
    }
    
    // Открытие модального окна подарков
    openGiftModal(preSelectedUserId = null) {
        this.loadOnlineUsersForGifts(preSelectedUserId);
        this.updateUserCoinsDisplay();
        
        const giftModal = document.getElementById('enhancedGiftModal');
        if (giftModal) {
            giftModal.classList.add('active');
            
            // Сбрасываем состояние
            this.resetGiftModal();
        }
    }
    
    // Закрытие модального окна подарков
    closeGiftModal() {
        const giftModal = document.getElementById('enhancedGiftModal');
        if (giftModal) {
            giftModal.classList.remove('active');
        }
    }
    
    // Сброс состояния модального окна
    resetGiftModal() {
        // Сбрасываем выбор подарка
        document.querySelectorAll('.gift-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Скрываем превью
        document.getElementById('selectedGiftPreview').style.display = 'none';
        document.getElementById('recipientPreview').style.display = 'none';
        
        // Очищаем поля
        document.getElementById('giftMessageInput').value = '';
        document.getElementById('giftRecipientSelect').value = '';
        
        // Блокируем кнопку отправки
        document.getElementById('sendEnhancedGiftBtn').disabled = true;
    }
    
    // Загрузка онлайн-пользователей для выбора получателя
    loadOnlineUsersForGifts(preSelectedUserId = null) {
        const recipientSelect = document.getElementById('giftRecipientSelect');
        if (!recipientSelect) return;
        
        recipientSelect.innerHTML = '<option value="">Загрузка пользователей...</option>';
        
        this.database.ref('onlineUsers').once('value').then((snapshot) => {
            if (!snapshot.exists()) {
                recipientSelect.innerHTML = '<option value="">Нет активных пользователей</option>';
                return;
            }
            
            recipientSelect.innerHTML = '<option value="">Выберите получателя</option>';
            
            const users = snapshot.val();
            Object.keys(users).forEach(userId => {
                if (userId !== this.userId) {
                    const user = users[userId];
                    const option = document.createElement('option');
                    option.value = userId;
                    option.textContent = user.name;
                    option.selected = (userId === preSelectedUserId);
                    recipientSelect.appendChild(option);
                }
            });
            
            // Если есть предвыбранный пользователь, устанавливаем его
            if (preSelectedUserId) {
                recipientSelect.value = preSelectedUserId;
                this.updateRecipientPreview(preSelectedUserId);
            }
        });
    }
    
    // Обновление отображения монет пользователя
    updateUserCoinsDisplay() {
        const coinsDisplay = document.getElementById('userCoinsCount');
        if (coinsDisplay) {
            // В реальном приложении здесь бы загружался реальный баланс
            // Для демонстрации используем случайное число
            const fakeCoins = Math.floor(Math.random() * 500) + 100;
            coinsDisplay.textContent = fakeCoins;
        }
    }
    
    // Настройка инвентаря подарков
    setupGiftInventory() {
        // Этот метод может быть использован для отображения
        // инвентаря полученных подарков пользователя
    }
    
    // Получение истории отправленных подарков
    getGiftHistory(limit = 10) {
        return new Promise((resolve) => {
            this.database.ref('messages')
                .orderByChild('type')
                .equalTo('enhanced_gift')
                .limitToLast(limit)
                .once('value')
                .then(snapshot => {
                    const gifts = [];
                    if (snapshot.exists()) {
                        snapshot.forEach(childSnapshot => {
                            const gift = childSnapshot.val();
                            gift.id = childSnapshot.key;
                            gifts.push(gift);
                        });
                    }
                    resolve(gifts.reverse());
                });
        });
    }
    
    // Получение топа дарителей
    getTopGivers(limit = 5) {
        return new Promise((resolve) => {
            this.database.ref('giftStats')
                .orderByChild('sent')
                .limitToLast(limit)
                .once('value')
                .then(snapshot => {
                    const topGivers = [];
                    if (snapshot.exists()) {
                        snapshot.forEach(childSnapshot => {
                            const stats = childSnapshot.val();
                            topGivers.push({
                                userId: childSnapshot.key,
                                sent: stats.sent || 0
                            });
                        });
                    }
                    resolve(topGivers.sort((a, b) => b.sent - a.sent));
                });
        });
    }
}

// Стили для улучшенной системы подарков
const enhancedGiftsStyles = `
/* Стили для улучшенной системы подарков */
.enhanced-gift-modal {
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
}

.gift-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--border-color);
}

.user-coins-display {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(255, 215, 0, 0.2);
    padding: 8px 12px;
    border-radius: 20px;
    font-weight: bold;
    color: #ffd700;
}

.gift-recipient-section {
    margin-bottom: 20px;
}

.recipient-selector {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.recipient-selector label {
    font-weight: bold;
    color: var(--action-btn-color);
}

.recipient-selector select {
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--input-bg);
    color: var(--input-color);
    outline: none;
}

.recipient-preview {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    margin-top: 10px;
}

.recipient-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(to right, #4facfe, #00f2fe);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    overflow: hidden;
}

.recipient-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.gift-categories-tabs {
    display: flex;
    gap: 5px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 10px;
}

.gift-tab {
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    opacity: 0.7;
    transition: all 0.3s ease;
}

.gift-tab:hover {
    opacity: 0.9;
    background: rgba(255, 255, 255, 0.1);
}

.gift-tab.active {
    opacity: 1;
    background: rgba(79, 172, 254, 0.2);
    border-bottom: 2px solid #4facfe;
}

.gifts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 15px;
    margin-top: 15px;
}

.gift-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 10px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    background: rgba(255, 255, 255, 0.1);
    text-align: center;
}

.gift-item:hover {
    transform: translateY(-5px);
    border-color: var(--action-btn-color);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.gift-item.selected {
    border-color: #4facfe;
    background: rgba(79, 172, 254, 0.2);
    transform: scale(1.05);
}

.gift-item.locked {
    opacity: 0.5;
    cursor: not-allowed;
}

.gift-emoji {
    font-size: 32px;
    margin-bottom: 8px;
    transition: transform 0.3s ease;
}

.gift-item:hover .gift-emoji {
    transform: scale(1.2);
}

.gift-name {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 5px;
}

.gift-price {
    font-size: 11px;
    opacity: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
}

.gift-locked-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    color: white;
}

/* Стили по редкости */
.gift-item.common {
    border-color: #95a5a6;
}

.gift-item.rare {
    border-color: #3498db;
    background: rgba(52, 152, 219, 0.1);
}

.gift-item.legendary {
    border-color: #f39c12;
    background: rgba(243, 156, 18, 0.1);
    animation: legendaryGlow 2s infinite alternate;
}

.gift-item.seasonal {
    border-color: #9b59b6;
    background: rgba(155, 89, 182, 0.1);
}

@keyframes legendaryGlow {
    from {
        box-shadow: 0 0 5px rgba(243, 156, 18, 0.5);
    }
    to {
        box-shadow: 0 0 15px rgba(243, 156, 18, 0.8);
    }
}

.selected-gift-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    margin: 20px 0;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid transparent;
}

.selected-gift-preview.common {
    border-color: #95a5a6;
}

.selected-gift-preview.rare {
    border-color: #3498db;
}

.selected-gift-preview.legendary {
    border-color: #f39c12;
    animation: legendaryGlow 2s infinite alternate;
}

.selected-gift-preview.seasonal {
    border-color: #9b59b6;
}

.preview-title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
    opacity: 0.8;
}

.gift-preview-content {
    display: flex;
    align-items: center;
    gap: 15px;
}

.gift-emoji-preview {
    font-size: 48px;
}

.gift-info-preview {
    text-align: left;
}

.gift-name-preview {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
}

.gift-price-preview {
    font-size: 14px;
    opacity: 0.8;
}

.gift-message-section {
    margin: 20px 0;
}

.gift-message-section textarea {
    width: 100%;
    min-height: 80px;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--input-bg);
    color: var(--input-color);
    resize: vertical;
    outline: none;
    font-family: inherit;
}

.gift-message-section textarea:focus {
    border-color: #4facfe;
    box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
}

.gift-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

/* Анимации для подарков */
.trophySpin {
    animation: trophySpin 3s infinite;
}

@keyframes trophySpin {
    0% { transform: rotateY(0deg) scale(1); }
    50% { transform: rotateY(180deg) scale(1.1); }
    100% { transform: rotateY(360deg) scale(1); }
}

.crownGlow {
    animation: crownGlow 2s infinite alternate;
}

@keyframes crownGlow {
    from {
        text-shadow: 0 0 5px gold;
        transform: scale(1);
    }
    to {
        text-shadow: 0 0 20px gold, 0 0 30px orange;
        transform: scale(1.1);
    }
}

.starPulse {
    animation: starPulse 1.5s infinite alternate;
}

@keyframes starPulse {
    from {
        transform: scale(1);
        filter: brightness(1);
    }
    to {
        transform: scale(1.2);
        filter: brightness(1.5);
    }
}

.cometFly {
    animation: cometFly 2s infinite;
}

@keyframes cometFly {
    0% { transform: translateX(-10px) scale(1); }
    50% { transform: translateX(10px) scale(1.1); }
    100% { transform: translateX(-10px) scale(1); }
}

.maskMystery {
    animation: maskMystery 3s infinite;
}

@keyframes maskMystery {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.crystalShine {
    animation: crystalShine 2s infinite;
}

@keyframes crystalShine {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
}

/* Анимация отправки подарка */
.gift-sent-animation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.gift-sent-content {
    text-align: center;
    padding: 30px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.95);
    color: #333;
    animation: popIn 0.5s ease;
}

.gift-sent-emoji {
    font-size: 64px;
    margin-bottom: 15px;
}

.gift-sent-text {
    font-size: 18px;
    font-weight: bold;
}

@keyframes popIn {
    0% { transform: scale(0.5); opacity: 0; }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
}

/* Адаптивность */
@media (max-width: 768px) {
    .enhanced-gift-modal {
        max-width: 95vw;
        max-height: 95vh;
    }
    
    .gifts-grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 10px;
    }
    
    .gift-emoji {
        font-size: 24px;
    }
    
    .gift-name {
        font-size: 10px;
    }
    
    .gift-categories-tabs {
        flex-wrap: wrap;
    }
    
    .gift-tab {
        padding: 6px 12px;
        font-size: 14px;
    }
}
`;

// Добавление стилей в документ
function injectEnhancedGiftsStyles() {
    if (!document.getElementById('enhanced-gifts-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'enhanced-gifts-styles';
        styleElement.textContent = enhancedGiftsStyles;
        document.head.appendChild(styleElement);
    }
}

// Функция для инициализации улучшенной системы подарков
function initializeEnhancedGifts(database, currentUser, userId) {
    injectEnhancedGiftsStyles();
    return new EnhancedGiftSystem(database, currentUser, userId);
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeEnhancedGifts, EnhancedGiftSystem };
}