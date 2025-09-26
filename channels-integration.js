// ИНТЕГРАЦИЯ СИСТЕМЫ КАНАЛОВ С ОСНОВНЫМ МЕССЕНДЖЕРОМ

// Расширяем функциональность основного мессенджера
function integrateChannelsSystem() {
    // Добавляем кнопку переключения между чатом и каналами
    addChannelsToggleButton();
    
    // Модифицируем функцию входа в систему
    modifyEnterChatFunction();
    
    // Добавляем команды для работы с каналами
    extendCommandsSystem();
    
    // Интегрируем с системой уведомлений
    integrateWithNotifications();
}

function addChannelsToggleButton() {
    // Добавляем кнопку в header
    const channelsToggleHTML = `
        <button class="action-btn" id="channelsToggleBtn">
            <i class="fas fa-broadcast-tower"></i> <span>Каналы</span>
        </button>
    `;
    
    document.querySelector('.user-controls').insertAdjacentHTML('afterbegin', channelsToggleHTML);
    
    // Обработчик переключения
    document.getElementById('channelsToggleBtn').addEventListener('click', () => {
        if (document.getElementById('channelContent').style.display === 'flex') {
            quantumChannels.hideChannels();
        } else {
            quantumChannels.showChannels();
        }
    });
}

function modifyEnterChatFunction() {
    // Сохраняем оригинальную функцию
    const originalEnterChat = window.enterChat;
    
    // Расширяем функцию
    window.enterChat = function() {
        // Вызываем оригинальную функцию
        originalEnterChat();
        
        // Инициализируем систему каналов после входа
        setTimeout(() => {
            initChannelsSystem();
        }, 1000);
    };
}

function extendCommandsSystem() {
    // Сохраняем оригинальную функцию обработки команд
    const originalHandleCommands = window.handleCommands;
    
    window.handleCommands = function(text) {
        const command = text.toLowerCase().trim();
        
        // Команды для каналов
        if (command === '/каналы') {
            quantumChannels.showChannels();
            return true;
        }
        
        if (command === '/чат') {
            quantumChannels.hideChannels();
            return true;
        }
        
        if (command.startsWith('/канал')) {
            const channelName = command.replace('/канал', '').trim();
            if (channelName) {
                // Поиск канала по имени
                for (const [id, channel] of quantumChannels.channels) {
                    if (channel.name.toLowerCase().includes(channelName.toLowerCase())) {
                        quantumChannels.openChannel(id);
                        return true;
                    }
                }
                showNotification('Канал не найден');
            }
            return true;
        }
        
        // Если не наша команда, передаем оригинальной функции
        return originalHandleCommands ? originalHandleCommands(text) : false;
    };
}

function integrateWithNotifications() {
    // Слушаем новые посты в подписанных каналах
    if (quantumChannels && quantumChannels.userSubscriptions) {
        quantumChannels.userSubscriptions.forEach(channelId => {
            database.ref(`channelPosts/${channelId}`).orderByChild('timestamp')
                .startAt(Date.now())
                .on('child_added', (snapshot) => {
                    if (!snapshot.exists()) return;
                    
                    const post = snapshot.val();
                    
                    // Показываем уведомление о новом посте
                    if (document.hidden && post.authorId !== userId) {
                        showNotification(`📢 Новый пост в канале: ${post.text.substring(0, 50)}...`, 'channels');
                    }
                });
        });
    }
}

// Функция для создания поста с изображением
function createChannelPostWithImage() {
    if (!quantumChannels.currentChannel) {
        showNotification('Сначала выберите канал');
        return;
    }
    
    const text = prompt('Введите текст поста:');
    if (!text) return;
    
    // Создаем input для выбора файла
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = (e) => {
        if (e.target.files.length > 0) {
            quantumChannels.createPost(text, e.target.files[0]);
        } else {
            quantumChannels.createPost(text);
        }
    };
    
    fileInput.click();
}

// Добавляем кнопку создания поста для разработчиков
function addCreatePostButton() {
    if (isDeveloper) {
        const createPostBtn = document.createElement('button');
        createPostBtn.className = 'action-btn';
        createPostBtn.innerHTML = '<i class="fas fa-plus"></i> Новый пост';
        createPostBtn.onclick = createChannelPostWithImage;
        
        document.querySelector('.channel-header').appendChild(createPostBtn);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Ждем загрузки основного мессенджера
    setTimeout(() => {
        integrateChannelsSystem();
    }, 2000);
});