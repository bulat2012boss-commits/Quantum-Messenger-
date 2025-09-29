// Файл: private-chat-fix.js
// Исправление бага с приватными чатами

document.addEventListener('DOMContentLoaded', function() {
    // Переопределяем функцию выхода из приватного чата
    window.exitPrivateChat = function() {
        console.log("Выход из приватного чата...");
        
        // Останавливаем все слушатели приватных сообщений
        if (window.privateMessagesListeners) {
            Object.values(window.privateMessagesListeners).forEach(listener => {
                if (listener && typeof listener === 'function') {
                    listener();
                }
            });
            window.privateMessagesListeners = {};
        }
        
        // Сбрасываем состояние приватного чата
        window.isPrivateChatActive = false;
        window.privateChatWithUserId = null;
        window.privateChatWithUserName = '';
        
        // Скрываем индикатор приватного чата
        const chatModeIndicator = document.getElementById('chatModeIndicator');
        if (chatModeIndicator) {
            chatModeIndicator.style.display = 'none';
        }
        
        // Восстанавливаем обычный заголовок
        const userNameSpan = document.querySelector('.chat-header .user-name span');
        if (userNameSpan && window.currentUser) {
            userNameSpan.textContent = window.currentUser;
        }
        
        // Переключаемся на общий чат
        const tabs = document.querySelectorAll('.chat-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        const generalTab = document.querySelector('.chat-tab[data-tab="general"]');
        if (generalTab) {
            generalTab.classList.add('active');
        }
        
        // Очищаем сообщения и загружаем общие
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        // Перезагружаем слушатели для общего чата
        if (typeof window.removeAllListeners === 'function') {
            window.removeAllListeners();
        }
        
        if (typeof window.loadMessages === 'function') {
            window.loadMessages();
        }
        
        if (typeof window.setupOnlineUsers === 'function') {
            window.setupOnlineUsers();
        }
        
        if (typeof window.setupTypingIndicator === 'function') {
            window.setupTypingIndicator();
        }
        
        // Показываем уведомление
        if (typeof window.showNotification === 'function') {
            window.showNotification("Вы вышли из приватного чата");
        }
        
        console.log("Успешно переключились на общий чат");
    };

    // Улучшенная функция переключения вкладок чата
    function setupEnhancedChatTabs() {
        const tabs = document.querySelectorAll('.chat-tab');
        const messagesWrapper = document.getElementById('messagesContainer');
        
        tabs.forEach(tab => {
            // Удаляем старые обработчики
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
        });
        
        // Добавляем новые обработчики
        document.querySelectorAll('.chat-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabType = this.getAttribute('data-tab');
                console.log("Переключение на вкладку:", tabType);
                
                // Убираем активный класс у всех вкладок
                document.querySelectorAll('.chat-tab').forEach(t => {
                    t.classList.remove('active');
                });
                
                // Добавляем активный класс к выбранной вкладке
                this.classList.add('active');
                
                if (tabType === 'general') {
                    // Переключаемся на общий чат
                    if (window.isPrivateChatActive) {
                        exitPrivateChat();
                    } else {
                        // Просто обновляем общий чат
                        if (typeof window.loadMessages === 'function') {
                            window.loadMessages();
                        }
                    }
                } else if (tabType === 'private') {
                    // Переключаемся на список приватных чатов
                    if (typeof window.showPrivateChatsList === 'function') {
                        window.showPrivateChatsList();
                    }
                }
            });
        });
    }

    // Функция для принудительного переключения на общий чат
    window.forceSwitchToGeneralChat = function() {
        console.log("Принудительное переключение на общий чат");
        
        // Сбрасываем состояние
        window.isPrivateChatActive = false;
        window.privateChatWithUserId = null;
        window.privateChatWithUserName = '';
        
        // Активируем вкладку общего чата
        const generalTab = document.querySelector('.chat-tab[data-tab="general"]');
        const privateTab = document.querySelector('.chat-tab[data-tab="private"]');
        
        if (generalTab) generalTab.classList.add('active');
        if (privateTab) privateTab.classList.remove('active');
        
        // Скрываем индикатор приватного чата
        const chatModeIndicator = document.getElementById('chatModeIndicator');
        if (chatModeIndicator) {
            chatModeIndicator.style.display = 'none';
        }
        
        // Восстанавливаем заголовок
        const userNameSpan = document.querySelector('.chat-header .user-name span');
        if (userNameSpan && window.currentUser) {
            userNameSpan.textContent = window.currentUser;
        }
        
        // Перезагружаем общий чат
        if (typeof window.removeAllListeners === 'function') {
            window.removeAllListeners();
        }
        
        if (typeof window.loadMessages === 'function') {
            window.loadMessages();
        }
    };

    // Добавляем кнопку экстренного выхода
    function addEmergencyExitButton() {
        const emergencyBtn = document.createElement('div');
        emergencyBtn.className = 'action-btn';
        emergencyBtn.innerHTML = '<i class="fas fa-home"></i> <span>В общий чат</span>';
        emergencyBtn.style.background = 'rgba(255, 100, 100, 0.2)';
        emergencyBtn.style.color = '#ff6464';
        emergencyBtn.style.display = 'none';
        emergencyBtn.id = 'emergencyExitBtn';
        
        emergencyBtn.addEventListener('click', function() {
            window.forceSwitchToGeneralChat();
        });
        
        // Добавляем кнопку в интерфейс
        const userControls = document.querySelector('.user-controls');
        if (userControls) {
            userControls.appendChild(emergencyBtn);
        }
        
        // Показываем кнопку когда в приватном чате
        const observer = new MutationObserver(function() {
            const chatModeIndicator = document.getElementById('chatModeIndicator');
            const emergencyBtn = document.getElementById('emergencyExitBtn');
            
            if (chatModeIndicator && emergencyBtn) {
                if (chatModeIndicator.style.display !== 'none') {
                    emergencyBtn.style.display = 'flex';
                } else {
                    emergencyBtn.style.display = 'none';
                }
            }
        });
        
        const chatModeIndicator = document.getElementById('chatModeIndicator');
        if (chatModeIndicator) {
            observer.observe(chatModeIndicator, { attributes: true, attributeFilter: ['style'] });
        }
    }

    // Инициализация после загрузки страницы
    setTimeout(function() {
        setupEnhancedChatTabs();
        addEmergencyExitButton();
        
        console.log("Исправления для приватных чатов загружены");
        
        // Добавляем глобальный обработчик для отладки
        window.debugChatState = function() {
            console.log("Текущее состояние чата:");
            console.log("- isPrivateChatActive:", window.isPrivateChatActive);
            console.log("- privateChatWithUserId:", window.privateChatWithUserId);
            console.log("- privateChatWithUserName:", window.privateChatWithUserName);
            console.log("- currentUser:", window.currentUser);
        };
    }, 2000);
});

// Альтернативный способ переключения если основной не работает
window.switchToGeneralChatAlt = function() {
    // Просто перезагружаем страницу с сохранением данных
    const savedName = localStorage.getItem('quantumUsername');
    const savedUserId = localStorage.getItem('quantumUserId');
    
    if (savedName && savedUserId) {
        localStorage.setItem('forceGeneralChat', 'true');
        window.location.reload();
    }
};

// Проверка при загрузке - если нужно принудительно перейти в общий чат
if (localStorage.getItem('forceGeneralChat') === 'true') {
    localStorage.removeItem('forceGeneralChat');
    setTimeout(() => {
        if (typeof window.forceSwitchToGeneralChat === 'function') {
            window.forceSwitchToGeneralChat();
        }
    }, 1000);
}