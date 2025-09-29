// channels-enhanced-fixed.js - Улучшенная система каналов с исправлением двойной отправки

class EnhancedChannelSystem {
    constructor() {
        this.currentChannel = 'general';
        this.channels = {
            'general': { name: '📢 Общий', description: 'Основной канал для общения', color: '#4FACE5' },
            'random': { name: '🎲 Случайности', description: 'Обсуждение случайных тем', color: '#9B59B6' },
            'games': { name: '🎮 Игры', description: 'Обсуждение игр и игровых новостей', color: '#E74C3C' },
            'help': { name: '❓ Помощь', description: 'Помощь и поддержка', color: '#2ECC71' },
            'offtopic': { name: '💬 Флудилка', description: 'Свободное общение', color: '#F39C12' }
        };
        this.channelMembers = {};
        this.messagesListener = null;
        this.unreadCounts = {};
        this.lastReadTimestamps = {};
        this.isDropdownOpen = false;
        this.isSendingMessage = false; // Флаг для предотвращения двойной отправки
        this.originalSendFunction = null; // Сохраняем оригинальную функцию
        
        this.init();
    }

    init() {
        console.log('🔄 Инициализация улучшенной системы каналов...');
        this.loadUserPreferences();
        this.createChannelUI();
        this.loadChannelMessages();
        this.overrideSendMessage();
        this.setupEventListeners();
        this.initializeChannelStats();
    }

    loadUserPreferences() {
        try {
            const savedChannel = localStorage.getItem('lastChannel');
            const savedTimestamps = localStorage.getItem('channelReadTimestamps');
            
            if (savedChannel && this.channels[savedChannel]) {
                this.currentChannel = savedChannel;
            }
            
            if (savedTimestamps) {
                this.lastReadTimestamps = JSON.parse(savedTimestamps);
            }
            
            // Инициализируем счетчики непрочитанных
            Object.keys(this.channels).forEach(channel => {
                this.unreadCounts[channel] = 0;
                if (!this.lastReadTimestamps[channel]) {
                    this.lastReadTimestamps[channel] = Date.now();
                }
            });
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
        }
    }

    saveUserPreferences() {
        try {
            localStorage.setItem('lastChannel', this.currentChannel);
            localStorage.setItem('channelReadTimestamps', JSON.stringify(this.lastReadTimestamps));
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
        }
    }

    createChannelUI() {
        this.addChannelStyles();
        this.createChannelButton();
        this.createChannelDropdown();
        this.createChannelSidebar();
    }

    createChannelButton() {
        // Удаляем старую кнопку если есть
        const oldBtn = document.getElementById('channelBtn');
        if (oldBtn) oldBtn.remove();

        const channelBtn = document.createElement('button');
        channelBtn.id = 'channelBtn';
        channelBtn.className = 'channel-btn';
        channelBtn.innerHTML = `
            <span class="channel-btn-icon">📢</span>
            <span class="channel-btn-text">${this.channels[this.currentChannel].name}</span>
            <span class="channel-btn-arrow">▼</span>
        `;
        channelBtn.title = 'Сменить канал - Текущий: ' + this.channels[this.currentChannel].description;
        
        const header = document.querySelector('.chat-header');
        if (header) {
            const existingBtn = header.querySelector('#channelBtn');
            if (!existingBtn) {
                header.appendChild(channelBtn);
            }
        }

        channelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleChannelDropdown();
        });
    }

    createChannelDropdown() {
        // Удаляем старый dropdown если есть
        const oldDropdown = document.getElementById('channelDropdown');
        if (oldDropdown) oldDropdown.remove();

        const dropdown = document.createElement('div');
        dropdown.id = 'channelDropdown';
        dropdown.className = 'channel-dropdown hidden';
        
        const header = document.createElement('div');
        header.className = 'channel-dropdown-header';
        header.innerHTML = `
            <span>Каналы</span>
            <span class="channel-count">${Object.keys(this.channels).length}</span>
        `;
        dropdown.appendChild(header);

        const channelsList = document.createElement('div');
        channelsList.className = 'channel-list';
        
        for (const [channelId, channelData] of Object.entries(this.channels)) {
            const channelItem = this.createChannelItem(channelId, channelData);
            channelsList.appendChild(channelItem);
        }
        
        dropdown.appendChild(channelsList);
        
        // Добавляем информацию о текущем пользователе
        const footer = this.createDropdownFooter();
        dropdown.appendChild(footer);
        
        document.body.appendChild(dropdown);
    }

    createChannelItem(channelId, channelData) {
        const channelItem = document.createElement('div');
        channelItem.className = `channel-item ${this.currentChannel === channelId ? 'active' : ''}`;
        channelItem.setAttribute('data-channel', channelId);
        
        const unreadCount = this.unreadCounts[channelId] || 0;
        const hasUnread = unreadCount > 0;
        
        channelItem.innerHTML = `
            <div class="channel-item-main">
                <span class="channel-icon" style="color: ${channelData.color}">${channelData.name.split(' ')[0]}</span>
                <div class="channel-info">
                    <span class="channel-name">${channelData.name}</span>
                    <span class="channel-desc">${channelData.description}</span>
                </div>
            </div>
            <div class="channel-meta">
                ${hasUnread ? `<span class="unread-badge">${unreadCount}</span>` : ''}
                <span class="member-count">${this.getChannelMemberCount(channelId)}</span>
            </div>
        `;
        
        channelItem.addEventListener('click', (e) => {
            e.stopPropagation();
            this.switchChannel(channelId);
            this.hideChannelDropdown();
        });
        
        return channelItem;
    }

    createDropdownFooter() {
        const footer = document.createElement('div');
        footer.className = 'channel-dropdown-footer';
        
        if (currentUser) {
            footer.innerHTML = `
                <div class="user-info">
                    <span class="user-avatar">${userAvatarUrl ? `<img src="${userAvatarUrl}" alt="${currentUser}">` : '👤'}</span>
                    <span class="user-name">${currentUser}</span>
                </div>
                <div class="channel-stats">
                    <span>Активен в: ${this.getCurrentChannelName()}</span>
                </div>
            `;
        } else {
            footer.innerHTML = `<div class="user-info">Войдите для использования каналов</div>`;
        }
        
        return footer;
    }

    createChannelSidebar() {
        // Создаем боковую панель каналов для десктопной версии
        if (window.innerWidth < 768) return;

        const existingSidebar = document.getElementById('channelSidebar');
        if (existingSidebar) return;

        const sidebar = document.createElement('div');
        sidebar.id = 'channelSidebar';
        sidebar.className = 'channel-sidebar';
        
        const sidebarHeader = document.createElement('div');
        sidebarHeader.className = 'sidebar-header';
        sidebarHeader.innerHTML = `
            <h3>Каналы</h3>
            <button class="sidebar-toggle">−</button>
        `;
        sidebar.appendChild(sidebarHeader);

        const channelsList = document.createElement('div');
        channelsList.className = 'sidebar-channels';
        
        for (const [channelId, channelData] of Object.entries(this.channels)) {
            const sidebarItem = this.createSidebarChannelItem(channelId, channelData);
            channelsList.appendChild(sidebarItem);
        }
        
        sidebar.appendChild(channelsList);
        
        // Вставляем сайдбар перед основным чатом
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.parentNode.insertBefore(sidebar, chatContainer);
        }

        // Обработчик сворачивания сайдбара
        sidebarHeader.querySelector('.sidebar-toggle').addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    createSidebarChannelItem(channelId, channelData) {
        const item = document.createElement('div');
        item.className = `sidebar-channel-item ${this.currentChannel === channelId ? 'active' : ''}`;
        item.setAttribute('data-channel', channelId);
        
        const unreadCount = this.unreadCounts[channelId] || 0;
        
        item.innerHTML = `
            <span class="channel-icon" style="color: ${channelData.color}">${channelData.name.split(' ')[0]}</span>
            <span class="channel-name">${channelData.name}</span>
            ${unreadCount > 0 ? `<span class="sidebar-unread-badge">${unreadCount}</span>` : ''}
            <span class="member-count">${this.getChannelMemberCount(channelId)}</span>
        `;
        
        item.addEventListener('click', () => {
            this.switchChannel(channelId);
        });
        
        return item;
    }

    addChannelStyles() {
        const styles = `
            .channel-btn {
                background: var(--button-bg);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 14px;
                margin-left: 10px;
                color: var(--text-color);
                min-width: 140px;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                position: relative;
            }

            .channel-btn:hover {
                background: var(--button-hover-bg);
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }

            .channel-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .channel-btn-icon {
                font-size: 16px;
            }

            .channel-btn-text {
                flex: 1;
                text-align: left;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .channel-btn-arrow {
                font-size: 10px;
                transition: transform 0.3s ease;
            }

            .channel-btn.open .channel-btn-arrow {
                transform: rotate(180deg);
            }

            .channel-dropdown {
                position: fixed;
                background: var(--header-bg);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 0;
                z-index: 10000;
                width: 280px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                backdrop-filter: blur(10px);
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.3s ease;
            }

            .channel-dropdown:not(.hidden) {
                opacity: 1;
                transform: translateY(0);
            }

            .channel-dropdown.hidden {
                display: none;
            }

            .channel-dropdown-header {
                padding: 16px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
                background: rgba(0,0,0,0.1);
            }

            .channel-count {
                background: var(--accent-color);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
            }

            .channel-list {
                max-height: 300px;
                overflow-y: auto;
                padding: 8px;
            }

            .channel-item {
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                margin: 4px 0;
                color: var(--text-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s ease;
            }

            .channel-item:hover {
                background: rgba(79, 172, 254, 0.15);
            }

            .channel-item.active {
                background: rgba(79, 172, 254, 0.25);
                border-left: 3px solid var(--accent-color);
            }

            .channel-item-main {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }

            .channel-icon {
                font-size: 18px;
                width: 24px;
                text-align: center;
            }

            .channel-info {
                display: flex;
                flex-direction: column;
                flex: 1;
            }

            .channel-name {
                font-weight: 600;
                font-size: 14px;
            }

            .channel-desc {
                font-size: 12px;
                opacity: 0.7;
                margin-top: 2px;
            }

            .channel-meta {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .unread-badge {
                background: #E74C3C;
                color: white;
                border-radius: 10px;
                padding: 2px 6px;
                font-size: 11px;
                font-weight: bold;
                min-width: 18px;
                text-align: center;
            }

            .member-count {
                background: rgba(255,255,255,0.1);
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 11px;
            }

            .channel-dropdown-footer {
                padding: 12px 16px;
                border-top: 1px solid var(--border-color);
                background: rgba(0,0,0,0.05);
                font-size: 12px;
            }

            .user-info {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }

            .user-avatar img {
                width: 20px;
                height: 20px;
                border-radius: 50%;
            }

            .channel-sidebar {
                width: 250px;
                background: var(--sidebar-bg, rgba(30, 30, 40, 0.95));
                border-right: 1px solid var(--border-color);
                height: 100vh;
                position: fixed;
                left: 0;
                top: 0;
                z-index: 100;
                transition: transform 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .sidebar-header {
                padding: 20px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .sidebar-header h3 {
                margin: 0;
                color: var(--text-color);
            }

            .sidebar-toggle {
                background: none;
                border: none;
                color: var(--text-color);
                cursor: pointer;
                font-size: 18px;
                padding: 4px;
            }

            .sidebar-channels {
                padding: 16px 0;
            }

            .sidebar-channel-item {
                padding: 12px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }

            .sidebar-channel-item:hover {
                background: rgba(255,255,255,0.05);
            }

            .sidebar-channel-item.active {
                background: rgba(79, 172, 254, 0.2);
                border-right: 3px solid var(--accent-color);
            }

            .sidebar-unread-badge {
                background: #E74C3C;
                color: white;
                border-radius: 8px;
                padding: 2px 6px;
                font-size: 10px;
                margin-left: auto;
            }

            .channel-system-notification {
                background: rgba(79, 172, 254, 0.1);
                border: 1px solid rgba(79, 172, 254, 0.3);
                border-radius: 8px;
                padding: 12px 16px;
                margin: 8px 0;
                text-align: center;
                font-size: 13px;
                color: var(--text-color);
            }

            .channel-system-notification .channel-name {
                font-weight: bold;
                color: var(--accent-color);
            }

            .loading {
                text-align: center;
                padding: 20px;
                color: var(--text-color);
                opacity: 0.7;
            }

            .send-btn-loading {
                position: relative;
                color: transparent !important;
            }

            .send-btn-loading::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                top: 50%;
                left: 50%;
                margin: -8px 0 0 -8px;
                border: 2px solid transparent;
                border-top: 2px solid var(--text-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @media (max-width: 768px) {
                .channel-sidebar {
                    transform: translateX(-100%);
                }
                
                .channel-sidebar:not(.collapsed) {
                    transform: translateX(0);
                }
                
                .channel-btn {
                    min-width: 120px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    toggleChannelDropdown() {
        if (this.isDropdownOpen) {
            this.hideChannelDropdown();
        } else {
            this.showChannelDropdown();
        }
    }

    showChannelDropdown() {
        const dropdown = document.getElementById('channelDropdown');
        const btn = document.getElementById('channelBtn');
        
        if (dropdown && btn) {
            const rect = btn.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + 5) + 'px';
            dropdown.style.left = (rect.left) + 'px';
            dropdown.classList.remove('hidden');
            btn.classList.add('open');
            this.isDropdownOpen = true;
        }
    }

    hideChannelDropdown() {
        const dropdown = document.getElementById('channelDropdown');
        const btn = document.getElementById('channelBtn');
        
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
        if (btn) {
            btn.classList.remove('open');
        }
        this.isDropdownOpen = false;
    }

    switchChannel(channelId) {
        if (this.currentChannel === channelId) return;

        console.log('🔄 Переключаем канал на:', channelId);
        
        // Обновляем timestamp предыдущего канала
        this.lastReadTimestamps[this.currentChannel] = Date.now();
        
        const previousChannel = this.currentChannel;
        this.currentChannel = channelId;
        
        // Сбрасываем счетчик непрочитанных для нового канала
        this.unreadCounts[channelId] = 0;
        
        // Сохраняем настройки
        this.saveUserPreferences();
        
        // Обновляем UI
        this.updateChannelUI();
        
        // Показываем уведомление
        this.showChannelSwitchNotification(previousChannel, channelId);
        
        // Загружаем сообщения нового канала
        this.loadChannelMessages();
        
        // Обновляем статистику каналов
        this.updateChannelStats();
    }

    updateChannelUI() {
        // Обновляем кнопку
        const btn = document.getElementById('channelBtn');
        if (btn) {
            const channelData = this.channels[this.currentChannel];
            btn.innerHTML = `
                <span class="channel-btn-icon">${channelData.name.split(' ')[0]}</span>
                <span class="channel-btn-text">${channelData.name}</span>
                <span class="channel-btn-arrow">▼</span>
            `;
            btn.title = `Сменить канал - Текущий: ${channelData.description}`;
        }

        // Обновляем активные элементы в dropdown
        document.querySelectorAll('.channel-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-channel') === this.currentChannel);
        });

        // Обновляем сайдбар
        document.querySelectorAll('.sidebar-channel-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-channel') === this.currentChannel);
        });

        // Обновляем бейджи непрочитанных
        this.updateUnreadBadges();
    }

    showChannelSwitchNotification(previousChannel, newChannel) {
        const previousName = this.channels[previousChannel].name;
        const newName = this.channels[newChannel].name;
        
        showNotification(`📢 Переход: ${previousName} → ${newName}`);
        
        // Добавляем системное сообщение в чат
        this.addSystemMessage(`Вы перешли из канала "${previousName}" в канал "${newName}"`);
    }

    addSystemMessage(text) {
        const messageData = {
            text: text,
            name: 'Система',
            userId: 'system',
            timestamp: Date.now(),
            isSystem: true,
            userColor: '#4FACE5'
        };

        this.sendChannelMessage(messageData, true);
    }

    loadChannelMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) {
            console.error('❌ Контейнер сообщений не найден');
            return;
        }

        // Показываем загрузку
        messagesContainer.innerHTML = '<div class="loading">📥 Загрузка сообщений...</div>';

        // Отписываемся от старых сообщений
        if (this.messagesListener) {
            database.ref(`channels/${this.currentChannel}/messages`).off('child_added', this.messagesListener);
        }

        // Загружаем сообщения текущего канала
        this.messagesListener = database.ref(`channels/${this.currentChannel}/messages`)
            .orderByChild('timestamp')
            .limitToLast(100)
            .on('child_added', (snapshot) => {
                const message = snapshot.val();
                if (!message) return;

                message.id = snapshot.key;

                // Убираем загрузку
                const loading = messagesContainer.querySelector('.loading');
                if (loading) {
                    loading.remove();
                }

                // Проверяем непрочитанные сообщения для других каналов
                if (message.channel !== this.currentChannel && !message.isSystem) {
                    this.handleUnreadMessage(message.channel, message.timestamp);
                }

                // Дешифруем если нужно
                if (!message.isSystem && message.type !== 'gift') {
                    try {
                        message.text = decryptMessage(message.text);
                        if (message.quotedMessage) {
                            message.quotedMessage.text = decryptMessage(message.quotedMessage.text);
                        }
                    } catch (e) {
                        console.error('❌ Ошибка дешифровки:', e);
                    }
                }

                // Добавляем сообщение только если это текущий канал
                if (message.channel === this.currentChannel || message.isSystem) {
                    addMessageToChat(message);
                }

                // Прокрутка к новым сообщениям
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 100);
            });

        // Если нет сообщений, показываем информационное сообщение
        setTimeout(() => {
            const loading = messagesContainer.querySelector('.loading');
            if (loading) {
                loading.innerHTML = '💬 Этот канал пуст. Будьте первым, кто напишет сообщение!';
            }
        }, 3000);
    }

    handleUnreadMessage(channelId, timestamp) {
        if (channelId === this.currentChannel) return;
        
        const lastRead = this.lastReadTimestamps[channelId] || 0;
        if (timestamp > lastRead) {
            this.unreadCounts[channelId] = (this.unreadCounts[channelId] || 0) + 1;
            this.updateUnreadBadges();
        }
    }

    updateUnreadBadges() {
        // Обновляем бейджи в dropdown
        document.querySelectorAll('.channel-item').forEach(item => {
            const channelId = item.getAttribute('data-channel');
            const unreadCount = this.unreadCounts[channelId] || 0;
            const badge = item.querySelector('.unread-badge');
            const meta = item.querySelector('.channel-meta');
            
            if (unreadCount > 0) {
                if (!badge) {
                    const newBadge = document.createElement('span');
                    newBadge.className = 'unread-badge';
                    newBadge.textContent = unreadCount;
                    meta.insertBefore(newBadge, meta.querySelector('.member-count'));
                } else {
                    badge.textContent = unreadCount;
                }
            } else if (badge) {
                badge.remove();
            }
        });

        // Обновляем бейджи в сайдбаре
        document.querySelectorAll('.sidebar-channel-item').forEach(item => {
            const channelId = item.getAttribute('data-channel');
            const unreadCount = this.unreadCounts[channelId] || 0;
            let badge = item.querySelector('.sidebar-unread-badge');
            
            if (unreadCount > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'sidebar-unread-badge';
                    item.appendChild(badge);
                }
                badge.textContent = unreadCount;
            } else if (badge) {
                badge.remove();
            }
        });

        // Обновляем title кнопки
        const btn = document.getElementById('channelBtn');
        if (btn) {
            const totalUnread = Object.values(this.unreadCounts).reduce((sum, count) => sum + count, 0);
            const channelData = this.channels[this.currentChannel];
            let title = `Текущий: ${channelData.description}`;
            
            if (totalUnread > 0) {
                title += ` (${totalUnread} непрочитанных)`;
            }
            
            btn.title = title;
        }
    }

    sendChannelMessage(messageData, isSystem = false) {
        if (!this.currentChannel && !isSystem) return;

        const messageWithChannel = {
            ...messageData,
            channel: this.currentChannel,
            timestamp: Date.now(),
            isSystem: isSystem
        };

        // Показываем индикатор отправки
        this.setSendButtonLoading(true);

        database.ref(`channels/${this.currentChannel}/messages`).push(messageWithChannel, (error) => {
            // Снимаем индикатор отправки
            this.setSendButtonLoading(false);
            
            if (error) {
                console.error("❌ Ошибка отправки:", error);
                showNotification("❌ Ошибка отправки сообщения");
            } else {
                updateMessageCount();
                if (typeof addXP === 'function' && !isSystem) {
                    addXP(5, 'сообщение в канале');
                }
                
                // Обновляем статистику активности
                this.updateUserActivity();
            }
        });
    }

    setSendButtonLoading(isLoading) {
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            if (isLoading) {
                sendBtn.disabled = true;
                sendBtn.classList.add('send-btn-loading');
            } else {
                sendBtn.disabled = false;
                sendBtn.classList.remove('send-btn-loading');
            }
        }
    }

    updateUserActivity() {
        if (!currentUser) return;
        
        const userActivityRef = database.ref(`channels/${this.currentChannel}/activeUsers/${userId}`);
        userActivityRef.set({
            username: currentUser,
            timestamp: Date.now(),
            avatar: userAvatarUrl
        });
        
        // Автоматически удаляем запись через 5 минут неактивности
        setTimeout(() => {
            userActivityRef.remove();
        }, 5 * 60 * 1000);
    }

    getChannelMemberCount(channelId) {
        // В реальном приложении здесь бы была логика подсчета активных пользователей
        const baseCount = Math.floor(Math.random() * 5) + 1;
        return `${baseCount}👤`;
    }

    initializeChannelStats() {
        // Инициализируем статистику для каждого канала
        Object.keys(this.channels).forEach(channelId => {
            database.ref(`channels/${channelId}/activeUsers`).on('value', (snapshot) => {
                const users = snapshot.val() || {};
                this.channelMembers[channelId] = Object.keys(users).length;
                this.updateMemberCounts();
            });
        });
    }

    updateMemberCounts() {
        document.querySelectorAll('.member-count').forEach(element => {
            const channelId = element.closest('[data-channel]')?.getAttribute('data-channel');
            if (channelId && this.channelMembers[channelId] !== undefined) {
                element.textContent = `${this.channelMembers[channelId]}👤`;
            }
        });
    }

    updateChannelStats() {
        // Обновляем статистику канала при переключении
        this.updateMemberCounts();
    }

    overrideSendMessage() {
        // Сохраняем оригинальную функцию
        this.originalSendFunction = window.sendMessage;

        window.sendMessage = () => {
            // Защита от двойной отправки
            if (this.isSendingMessage) {
                console.log('🛑 Предотвращена двойная отправка сообщения');
                return;
            }

            const messageInput = document.getElementById('messageInput');
            const messageText = messageInput ? messageInput.value.trim() : '';
            
            if (!messageText) {
                // Если нет текста, вызываем оригинальную функцию (если она есть)
                if (this.originalSendFunction) {
                    this.originalSendFunction();
                }
                return;
            }

            if (!currentUser) {
                showNotification('❌ Войдите в систему для отправки сообщений');
                return;
            }

            // Устанавливаем флаг отправки
            this.isSendingMessage = true;

            try {
                // Шифруем сообщение
                const encryptedText = encryptMessage(messageText);
                
                const messageData = {
                    text: encryptedText,
                    name: currentUser,
                    userId: userId,
                    timestamp: Date.now(),
                    isDeveloper: isDeveloper,
                    isTester: isTester,
                    userColor: userColor,
                    avatar: userAvatarUrl,
                    channel: this.currentChannel
                };

                // Добавляем цитируемое сообщение если есть
                if (window.quotedMessage) {
                    messageData.quotedMessage = {
                        id: window.quotedMessage.id,
                        name: window.quotedMessage.name,
                        text: encryptMessage(window.quotedMessage.text),
                        channel: window.quotedMessage.channel || this.currentChannel
                    };
                }

                // Отправляем в канал
                this.sendChannelMessage(messageData);

                // Очищаем поле ввода
                if (messageInput) {
                    messageInput.value = '';
                }
                
                // Сбрасываем цитирование
                window.quotedMessage = null;
                
            } catch (error) {
                console.error('❌ Ошибка при отправке сообщения:', error);
                showNotification('❌ Ошибка при отправке сообщения');
            } finally {
                // Сбрасываем флаг отправки через небольшую задержку
                setTimeout(() => {
                    this.isSendingMessage = false;
                }, 1000);
            }
        };
    }

    setupEventListeners() {
        // Закрытие dropdown при клике вне его
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('channelDropdown');
            const btn = document.getElementById('channelBtn');
            
            if (dropdown && !dropdown.contains(e.target) && btn && !btn.contains(e.target)) {
                this.hideChannelDropdown();
            }
        });

        // Обработка клавиатуры
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.toggleChannelDropdown();
            }
            
            // Защита от двойного Enter
            if (e.key === 'Enter' && !e.shiftKey) {
                const messageInput = document.getElementById('messageInput');
                if (document.activeElement === messageInput) {
                    if (this.isSendingMessage) {
                        e.preventDefault();
                        return;
                    }
                }
            }
        });

        // Адаптация к изменению размера окна
        window.addEventListener('resize', () => {
            this.hideChannelDropdown();
        });

        // Защита от быстрых повторных кликов на кнопку отправки
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            const originalClickHandler = sendBtn.onclick;
            sendBtn.onclick = (e) => {
                if (this.isSendingMessage) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                if (originalClickHandler) {
                    return originalClickHandler.call(sendBtn, e);
                }
            };
        }
    }

    getCurrentChannel() {
        return this.currentChannel;
    }

    getCurrentChannelName() {
        return this.channels[this.currentChannel]?.name || 'Неизвестный канал';
    }

    // Публичные методы для внешнего использования
    addCustomChannel(channelId, channelData) {
        if (this.channels[channelId]) {
            console.warn(`Канал ${channelId} уже существует`);
            return false;
        }
        
        this.channels[channelId] = channelData;
        this.unreadCounts[channelId] = 0;
        this.lastReadTimestamps[channelId] = Date.now();
        
        // Обновляем UI
        this.createChannelDropdown();
        this.createChannelSidebar();
        
        return true;
    }

    removeChannel(channelId) {
        if (!this.channels[channelId] || channelId === 'general') {
            console.warn(`Нельзя удалить канал ${channelId}`);
            return false;
        }
        
        delete this.channels[channelId];
        delete this.unreadCounts[channelId];
        delete this.lastReadTimestamps[channelId];
        
        // Если текущий канал удален, переключаемся на general
        if (this.currentChannel === channelId) {
            this.switchChannel('general');
        }
        
        // Обновляем UI
        this.createChannelDropdown();
        this.createChannelSidebar();
        
        return true;
    }

    getChannelInfo(channelId) {
        return this.channels[channelId];
    }

    getAllChannels() {
        return { ...this.channels };
    }

    // Метод для ручного сброса флага отправки (на случай ошибок)
    resetSendingFlag() {
        this.isSendingMessage = false;
        this.setSendButtonLoading(false);
    }
}

// Глобальная переменная
let channelSystem;

// Функция инициализации
function initChannels() {
    try {
        console.log('🚀 Запуск улучшенной системы каналов...');
        
        // Проверяем, не инициализирована ли система уже
        if (window.channelSystem) {
            console.log('⚠️ Система каналов уже инициализирована');
            return;
        }
        
        channelSystem = new EnhancedChannelSystem();
        console.log('✅ Система каналов готова');
        
        // Добавляем глобальные методы для внешнего использования
        window.channelSystem = channelSystem;
        window.switchChannel = (channelId) => channelSystem.switchChannel(channelId);
        window.getCurrentChannel = () => channelSystem.getCurrentChannel();
        window.resetSendingFlag = () => channelSystem.resetSendingFlag();
        
    } catch (error) {
        console.error('❌ Ошибка инициализации каналов:', error);
    }
}

// Вспомогательные функции
function showChannelNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `channel-notification channel-notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Запускаем когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChannels);
} else {
    // Задержка для полной загрузки других скриптов
    setTimeout(initChannels, 1000);
}

// Защита от множественной инициализации
let channelsInitialized = false;
const originalInitChannels = initChannels;
initChannels = function() {
    if (channelsInitialized) {
        console.log('⚠️ Система каналов уже инициализирована');
        return;
    }
    channelsInitialized = true;
    originalInitChannels();
};

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedChannelSystem, initChannels };
}