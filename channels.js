// СИСТЕМА КАНАЛОВ ДЛЯ QUANTUM MESSENGER

class QuantumChannels {
    constructor() {
        this.currentChannel = null;
        this.userSubscriptions = new Set();
        this.channels = new Map();
        this.isSidebarVisible = true;
        this.init();
    }

    init() {
        this.createChannelsSidebar();
        this.loadDefaultChannels();
        this.setupEventListeners();
        this.loadUserSubscriptions();
    }

    createChannelsSidebar() {
        const sidebarHTML = `
            <div class="channels-sidebar" id="channelsSidebar">
                <div class="channels-header">
                    <h3>Каналы</h3>
                    <button class="action-btn" id="createChannelBtn" style="display: none;">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="channels-list" id="channelsList">
                    <div class="channel-category">
                        <div class="channel-category-title">Официальные</div>
                    </div>
                    <div class="channel-category">
                        <div class="channel-category-title">Подписки</div>
                    </div>
                </div>
                
                <button class="create-channel-btn" id="createChannelBtnMain" style="display: none;">
                    <i class="fas fa-plus"></i> Создать канал
                </button>
            </div>
        `;

        // Вставляем сайдбар в основной контейнер
        const appContainer = document.querySelector('.app-container');
        appContainer.insertAdjacentHTML('afterbegin', sidebarHTML);

        // Создаем контент для каналов
        this.createChannelContent();
    }

    createChannelContent() {
        const contentHTML = `
            <div class="channel-content" id="channelContent" style="display: none;">
                <div class="channel-header">
                    <div class="channel-title">
                        <div class="channel-icon" id="channelIcon">#</div>
                        <div>
                            <div style="display: flex; align-items: center;">
                                <h3 id="channelName">Название канала</h3>
                                <span class="channel-official-badge" id="channelOfficialBadge" style="display: none;">Официальный</span>
                            </div>
                            <div class="channel-description" id="channelDescription">Описание канала</div>
                        </div>
                    </div>
                    <button class="channel-subscribe-btn" id="channelSubscribeBtn">
                        Подписаться
                    </button>
                </div>
                
                <div class="channel-posts" id="channelPosts">
                    <div class="empty-chat">
                        <i class="fas fa-broadcast-tower"></i>
                        <p>В этом канале пока нет публикаций</p>
                    </div>
                </div>
            </div>
        `;

        const mainContainer = document.querySelector('.main-container');
        mainContainer.insertAdjacentHTML('beforeend', contentHTML);
    }

    loadDefaultChannels() {
        // Официальный канал Quantum Messenger
        this.createChannel({
            id: 'quantum_official',
            name: 'Quantum Messenger',
            description: 'Официальный канал мессенджера. Новости, обновления и анонсы.',
            type: 'official',
            icon: '⚛',
            createdBy: 'system',
            isOfficial: true
        });

        // Другие каналы по умолчанию
        this.createChannel({
            id: 'general_chat',
            name: 'Общий чат',
            description: 'Обсуждение любых тем',
            type: 'public',
            icon: '💬',
            createdBy: 'system'
        });

        this.createChannel({
            id: 'help_support',
            name: 'Помощь и поддержка',
            description: 'Вопросы и ответы по использованию мессенджера',
            type: 'public',
            icon: '❓',
            createdBy: 'system'
        });
    }

    createChannel(channelData) {
        this.channels.set(channelData.id, channelData);
        this.renderChannelInSidebar(channelData);
    }

    renderChannelInSidebar(channelData) {
        const category = channelData.isOfficial ? 'official' : 'subscriptions';
        const categoryElement = document.querySelector(`.channel-category:nth-child(${channelData.isOfficial ? 1 : 2})`);
        
        const channelHTML = `
            <div class="channel-item" data-channel-id="${channelData.id}">
                <div class="channel-icon">${channelData.icon}</div>
                <div class="channel-info">
                    <div class="channel-name">
                        ${channelData.name}
                        ${channelData.isOfficial ? '<span class="channel-official-badge">Официальный</span>' : ''}
                    </div>
                    <div class="channel-members">0 подписчиков</div>
                </div>
            </div>
        `;

        categoryElement.insertAdjacentHTML('beforeend', channelHTML);

        // Добавляем обработчик клика
        const channelElement = categoryElement.querySelector(`[data-channel-id="${channelData.id}"]`);
        channelElement.addEventListener('click', () => {
            this.openChannel(channelData.id);
        });
    }

    openChannel(channelId) {
        const channel = this.channels.get(channelId);
        if (!channel) return;

        this.currentChannel = channel;

        // Обновляем UI
        document.getElementById('channelName').textContent = channel.name;
        document.getElementById('channelDescription').textContent = channel.description;
        document.getElementById('channelIcon').textContent = channel.icon;
        
        if (channel.isOfficial) {
            document.getElementById('channelOfficialBadge').style.display = 'inline';
        } else {
            document.getElementById('channelOfficialBadge').style.display = 'none';
        }

        // Обновляем кнопку подписки
        this.updateSubscribeButton();

        // Показываем контент канала
        document.getElementById('channelContent').style.display = 'flex';
        document.getElementById('chatWrapper').style.display = 'none';

        // Загружаем посты канала
        this.loadChannelPosts(channelId);
    }

    updateSubscribeButton() {
        const btn = document.getElementById('channelSubscribeBtn');
        const isSubscribed = this.userSubscriptions.has(this.currentChannel.id);

        if (isSubscribed) {
            btn.textContent = 'Отписаться';
            btn.classList.add('subscribed');
        } else {
            btn.textContent = 'Подписаться';
            btn.classList.remove('subscribed');
        }
    }

    toggleSubscribe() {
        if (!this.currentChannel || !currentUser) return;

        const channelId = this.currentChannel.id;
        
        if (this.userSubscriptions.has(channelId)) {
            this.userSubscriptions.delete(channelId);
            this.unsubscribeFromChannel(channelId);
        } else {
            this.userSubscriptions.add(channelId);
            this.subscribeToChannel(channelId);
        }

        this.updateSubscribeButton();
        this.saveUserSubscriptions();
    }

    subscribeToChannel(channelId) {
        // Сохраняем в Firebase
        database.ref(`channelSubscriptions/${channelId}/${userId}`).set({
            subscribedAt: Date.now(),
            userName: currentUser
        });

        showNotification(`Вы подписались на канал "${this.currentChannel.name}"`);
    }

    unsubscribeFromChannel(channelId) {
        // Удаляем из Firebase
        database.ref(`channelSubscriptions/${channelId}/${userId}`).remove();
        showNotification(`Вы отписались от канала "${this.currentChannel.name}"`);
    }

    loadChannelPosts(channelId) {
        const postsContainer = document.getElementById('channelPosts');
        postsContainer.innerHTML = '<div class="loading"><div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div></div>';

        database.ref(`channelPosts/${channelId}`).orderByChild('timestamp').limitToLast(50).once('value')
            .then(snapshot => {
                postsContainer.innerHTML = '';

                if (!snapshot.exists()) {
                    postsContainer.innerHTML = `
                        <div class="empty-chat">
                            <i class="fas fa-broadcast-tower"></i>
                            <p>В этом канале пока нет публикаций</p>
                        </div>
                    `;
                    return;
                }

                const posts = [];
                snapshot.forEach(childSnapshot => {
                    const post = childSnapshot.val();
                    post.id = childSnapshot.key;
                    posts.push(post);
                });

                // Сортируем по времени (новые сверху)
                posts.reverse().forEach(post => {
                    this.renderPost(post);
                });
            });
    }

    renderPost(post) {
        const postsContainer = document.getElementById('channelPosts');
        
        const postHTML = `
            <div class="channel-post" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-author-avatar">
                        ${post.authorAvatar || post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div class="post-author-info">
                        <div class="post-author-name">
                            ${post.authorName}
                            ${post.isOfficial ? '<span class="verified-badge">✓</span>' : ''}
                        </div>
                        <div class="post-time">${new Date(post.timestamp).toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="post-content">
                    <div class="post-text">${this.escapeHtml(post.text)}</div>
                    ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" onclick="quantumChannels.openImageModal('${post.imageUrl}')">` : ''}
                </div>
                
                <div class="post-actions">
                    <div class="post-action" onclick="quantumChannels.likePost('${post.id}')">
                        <i class="fas fa-heart"></i> <span>${post.likes || 0}</span>
                    </div>
                    <div class="post-action" onclick="quantumChannels.sharePost('${post.id}')">
                        <i class="fas fa-share"></i> Поделиться
                    </div>
                </div>
            </div>
        `;

        postsContainer.insertAdjacentHTML('beforeend', postHTML);
    }

    createPost(text, imageFile = null) {
        if (!this.currentChannel || !currentUser) return;

        const postData = {
            text: text,
            authorName: currentUser,
            authorId: userId,
            timestamp: Date.now(),
            channelId: this.currentChannel.id,
            isOfficial: this.currentChannel.isOfficial,
            likes: 0
        };

        if (imageFile) {
            this.uploadImage(imageFile).then(imageUrl => {
                postData.imageUrl = imageUrl;
                this.savePost(postData);
            });
        } else {
            this.savePost(postData);
        }
    }

    savePost(postData) {
        database.ref(`channelPosts/${this.currentChannel.id}`).push(postData)
            .then(() => {
                showNotification('Публикация добавлена в канал!');
                this.loadChannelPosts(this.currentChannel.id);
            })
            .catch(error => {
                console.error('Ошибка публикации:', error);
                showNotification('Ошибка при публикации');
            });
    }

    uploadImage(file) {
        return new Promise((resolve, reject) => {
            // В реальном приложении здесь бы была загрузка на сервер
            // Для демо используем Data URL
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    likePost(postId) {
        if (!currentUser) return;

        database.ref(`channelPosts/${this.currentChannel.id}/${postId}/likes`).transaction(likes => {
            return (likes || 0) + 1;
        });

        database.ref(`channelPosts/${this.currentChannel.id}/${postId}/likedBy/${userId}`).set(true);
    }

    openImageModal(imageUrl) {
        // Создаем модальное окно для просмотра изображения
        const modalHTML = `
            <div class="modal active" id="imageModal">
                <div class="modal-content" style="max-width: 90vw; max-height: 90vh;">
                    <img src="${imageUrl}" style="width: 100%; height: auto; border-radius: 10px;">
                    <div class="modal-buttons">
                        <button class="modal-btn secondary" onclick="document.getElementById('imageModal').remove()">
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    setupEventListeners() {
        // Кнопка подписки
        document.getElementById('channelSubscribeBtn').addEventListener('click', () => {
            this.toggleSubscribe();
        });

        // Показываем кнопку создания канала только разработчикам
        if (isDeveloper) {
            document.getElementById('createChannelBtn').style.display = 'block';
            document.getElementById('createChannelBtnMain').style.display = 'block';
            
            document.getElementById('createChannelBtn').addEventListener('click', () => {
                this.showCreateChannelModal();
            });
            
            document.getElementById('createChannelBtnMain').addEventListener('click', () => {
                this.showCreateChannelModal();
            });
        }
    }

    showCreateChannelModal() {
        const modalHTML = `
            <div class="modal active" id="createChannelModal">
                <div class="modal-content">
                    <h3>Создать новый канал</h3>
                    <div class="create-channel-modal">
                        <input type="text" id="newChannelName" placeholder="Название канала" class="poll-input">
                        <textarea id="newChannelDescription" placeholder="Описание канала" class="poll-input" rows="3"></textarea>
                        
                        <div class="channel-type-selector">
                            <div class="channel-type-option selected" data-type="public">
                                <div class="channel-type-icon">🌐</div>
                                <div>Публичный</div>
                                <small>Виден всем</small>
                            </div>
                            <div class="channel-type-option" data-type="private">
                                <div class="channel-type-icon">🔒</div>
                                <div>Приватный</div>
                                <small>Только по ссылке</small>
                            </div>
                        </div>
                        
                        <div class="modal-buttons">
                            <button class="modal-btn secondary" onclick="document.getElementById('createChannelModal').remove()">
                                Отмена
                            </button>
                            <button class="modal-btn primary" onclick="quantumChannels.createNewChannel()">
                                Создать канал
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Обработчики для выбора типа канала
        document.querySelectorAll('.channel-type-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.channel-type-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
            });
        });
    }

    createNewChannel() {
        const name = document.getElementById('newChannelName').value.trim();
        const description = document.getElementById('newChannelDescription').value.trim();
        const type = document.querySelector('.channel-type-option.selected').dataset.type;

        if (!name) {
            showNotification('Введите название канала');
            return;
        }

        const channelData = {
            id: 'channel_' + Date.now(),
            name: name,
            description: description,
            type: type,
            icon: '📢',
            createdBy: userId,
            createdByName: currentUser,
            createdAt: Date.now(),
            isOfficial: false
        };

        // Сохраняем в Firebase
        database.ref('channels/' + channelData.id).set(channelData)
            .then(() => {
                this.createChannel(channelData);
                document.getElementById('createChannelModal').remove();
                showNotification('Канал успешно создан!');
            })
            .catch(error => {
                console.error('Ошибка создания канала:', error);
                showNotification('Ошибка при создании канала');
            });
    }

    loadUserSubscriptions() {
        if (!userId) return;

        // Загружаем подписки пользователя из localStorage
        const savedSubs = localStorage.getItem('quantumChannelSubscriptions');
        if (savedSubs) {
            this.userSubscriptions = new Set(JSON.parse(savedSubs));
        }

        // Загружаем из Firebase
        database.ref('channelSubscriptions').orderByChild(userId).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    snapshot.forEach(channelSnapshot => {
                        this.userSubscriptions.add(channelSnapshot.key);
                    });
                    this.saveUserSubscriptions();
                }
            });
    }

    saveUserSubscriptions() {
        localStorage.setItem('quantumChannelSubscriptions', JSON.stringify([...this.userSubscriptions]));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Публичные методы для использования в основном коде
    showChannels() {
        document.getElementById('channelsSidebar').classList.add('active');
        document.getElementById('channelContent').style.display = 'flex';
        document.getElementById('chatWrapper').style.display = 'none';
    }

    hideChannels() {
        document.getElementById('channelsSidebar').classList.remove('active');
        document.getElementById('channelContent').style.display = 'none';
        document.getElementById('chatWrapper').style.display = 'flex';
    }

    toggleSidebar() {
        this.isSidebarVisible = !this.isSidebarVisible;
        document.getElementById('channelsSidebar').classList.toggle('active', this.isSidebarVisible);
    }
}

// Создаем глобальный экземпляр
let quantumChannels;

// Инициализация при загрузке
function initChannelsSystem() {
    quantumChannels = new QuantumChannels();
}