// enhanced-actions.js
// Улучшенное компактное меню действий для Quantum Messenger

// Инициализация улучшенного компактного меню
function initEnhancedActions() {
    console.log("🔄 Инициализация улучшенного компактного меню действий...");
    
    // Добавляем стили
    addEnhancedActionsStyles();
    
    // Создаем кнопку меню
    createMenuButton();
    
    // Инициализируем обработчики
    setupEnhancedHandlers();
    
    console.log("✅ Улучшенное компактное меню инициализировано");
}

// Создание кнопки меню
function createMenuButton() {
    const inputArea = document.querySelector('.input-area');
    if (!inputArea) {
        console.error("❌ Не найдена область ввода сообщений");
        return;
    }
    
    // Удаляем старые отдельные кнопки
    removeOldActionButtons();
    
    // Создаем кнопку меню
    const menuBtn = document.createElement('button');
    menuBtn.className = 'enhanced-menu-toggle';
    menuBtn.id = 'enhancedMenuToggle';
    menuBtn.innerHTML = '<i class="fas fa-plus"></i>';
    menuBtn.title = 'Дополнительные действия';
    menuBtn.setAttribute('aria-label', 'Открыть меню действий');
    
    // Вставляем перед полем ввода
    const messageInput = document.getElementById('messageInput');
    if (messageInput && messageInput.parentNode) {
        messageInput.parentNode.insertBefore(menuBtn, messageInput);
    }
    
    // Создаем выпадающее меню
    createEnhancedMenu();
}

// Создание выпадающего меню
function createEnhancedMenu() {
    const menu = document.createElement('div');
    menu.className = 'enhanced-actions-menu';
    menu.id = 'enhancedActionsMenu';
    menu.innerHTML = `
        <div class="menu-section">
            <div class="menu-title">Медиа</div>
            <div class="menu-item" data-action="image" data-tooltip="Отправить изображение">
                <div class="menu-icon">
                    <i class="fas fa-image"></i>
                </div>
                <div class="menu-text">
                    <span class="menu-item-title">Изображение</span>
                    <span class="menu-item-desc">JPG, PNG, GIF до 5MB</span>
                </div>
            </div>
            <div class="menu-item" data-action="voice" data-tooltip="Голосовое сообщение">
                <div class="menu-icon">
                    <i class="fas fa-microphone"></i>
                </div>
                <div class="menu-text">
                    <span class="menu-item-title">Голосовое</span>
                    <span class="menu-item-desc">Запись с микрофона</span>
                </div>
            </div>
        </div>
        
        <div class="menu-section">
            <div class="menu-title">Взаимодействие</div>
            <div class="menu-item" data-action="gift" data-tooltip="Отправить подарок">
                <div class="menu-icon">
                    <i class="fas fa-gift"></i>
                </div>
                <div class="menu-text">
                    <span class="menu-item-title">Подарок</span>
                    <span class="menu-item-desc">Обычные и NFT подарки</span>
                </div>
            </div>
            <div class="menu-item" data-action="poll" data-tooltip="Создать опрос">
                <div class="menu-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <div class="menu-text">
                    <span class="menu-item-title">Опрос</span>
                    <span class="menu-item-desc">Создать голосование</span>
                </div>
            </div>
        </div>
        
        <div class="menu-section">
            <div class="menu-title">Разное</div>
            <div class="menu-item" data-action="emoji" data-tooltip="Открыть эмодзи">
                <div class="menu-icon">
                    <i class="fas fa-smile"></i>
                </div>
                <div class="menu-text">
                    <span class="menu-item-title">Эмодзи</span>
                    <span class="menu-item-desc">Выбрать смайлики</span>
                </div>
            </div>
            <div class="menu-item" data-action="file" data-tooltip="Отправить файл">
                <div class="menu-icon">
                    <i class="fas fa-paperclip"></i>
                </div>
                <div class="menu-text">
                    <span class="menu-item-title">Файл</span>
                    <span class="menu-item-desc">Любые файлы до 10MB</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(menu);
}

// Настройка обработчиков
function setupEnhancedHandlers() {
    const menuToggle = document.getElementById('enhancedMenuToggle');
    const menu = document.getElementById('enhancedActionsMenu');
    
    if (!menuToggle || !menu) {
        console.error("❌ Не найдены элементы меню");
        return;
    }
    
    // Открытие/закрытие меню
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleEnhancedMenu();
    });
    
    // Обработка выбора пунктов меню
    menu.addEventListener('click', function(e) {
        const menuItem = e.target.closest('.menu-item');
        if (menuItem) {
            const action = menuItem.getAttribute('data-action');
            handleEnhancedAction(action);
            closeEnhancedMenu();
        }
    });
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        if (!menu.contains(e.target) && e.target !== menuToggle) {
            closeEnhancedMenu();
        }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            closeEnhancedMenu();
        }
    });
}

// Переключение меню
function toggleEnhancedMenu() {
    const menu = document.getElementById('enhancedActionsMenu');
    const toggle = document.getElementById('enhancedMenuToggle');
    
    if (menu.classList.contains('active')) {
        closeEnhancedMenu();
    } else {
        openEnhancedMenu();
    }
}

function openEnhancedMenu() {
    const menu = document.getElementById('enhancedActionsMenu');
    const toggle = document.getElementById('enhancedMenuToggle');
    
    menu.classList.add('active');
    toggle.classList.add('active');
    
    // Анимация появления пунктов
    const items = menu.querySelectorAll('.menu-item');
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.05}s`;
        item.classList.add('animate-in');
    });
}

function closeEnhancedMenu() {
    const menu = document.getElementById('enhancedActionsMenu');
    const toggle = document.getElementById('enhancedMenuToggle');
    
    menu.classList.remove('active');
    toggle.classList.remove('active');
    
    // Сброс анимации
    const items = menu.querySelectorAll('.menu-item');
    items.forEach(item => {
        item.classList.remove('animate-in');
    });
}

// Обработка действий меню
function handleEnhancedAction(action) {
    console.log(`🎯 Выбрано действие: ${action}`);
    
    switch(action) {
        case 'image':
            triggerImageUpload();
            break;
            
        case 'voice':
            if (typeof toggleRecording === 'function') {
                toggleRecording();
            } else {
                showNotification("🎤 Функция голосовых сообщений временно недоступна", "warning");
            }
            break;
            
        case 'gift':
            if (typeof loadOnlineUsersForGifts === 'function') {
                loadOnlineUsersForGifts();
                const giftModal = document.getElementById('giftModal');
                if (giftModal) {
                    giftModal.classList.add('active');
                }
            } else {
                showNotification("🎁 Функция подарков временно недоступна", "warning");
            }
            break;
            
        case 'poll':
            if (typeof createPollModal === 'function') {
                createPollModal();
            } else {
                showNotification("📊 Функция опросов временно недоступна", "warning");
            }
            break;
            
        case 'emoji':
            if (typeof toggleEmojiPanel === 'function') {
                toggleEmojiPanel();
            } else {
                showNotification("😊 Функция эмодзи временно недоступна", "warning");
            }
            break;
            
        case 'file':
            showNotification("📎 Функция отправки файлов скоро будет доступна!", "info");
            break;
            
        default:
            console.warn("⚠️ Неизвестное действие:", action);
    }
}

// Загрузка изображения
function triggerImageUpload() {
    const fileInput = document.getElementById('imageFileInput');
    if (fileInput) {
        fileInput.click();
    } else {
        console.error("❌ Input для загрузки изображений не найден");
        showNotification("❌ Система загрузки изображений не инициализирована", "error");
    }
}

// Удаление старых кнопок
function removeOldActionButtons() {
    const buttonsToRemove = [
        'voiceRecordBtn',
        'giftBtn',
        'compactMenuToggle'
    ];
    
    buttonsToRemove.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn && btn.parentNode) {
            btn.parentNode.removeChild(btn);
            console.log(`🗑️ Удалена кнопка: ${btnId}`);
        }
    });
    
    // Удаляем старые меню
    const oldMenus = ['compactMenu', 'enhancedActionsMenu'];
    oldMenus.forEach(menuId => {
        const menu = document.getElementById(menuId);
        if (menu && menu.parentNode) {
            menu.parentNode.removeChild(menu);
        }
    });
}

// Стили для улучшенного меню
function addEnhancedActionsStyles() {
    if (document.querySelector('#enhanced-actions-styles')) return;
    
    const styles = `
        /* 🎨 Стили улучшенного компактного меню */
        .enhanced-menu-toggle {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            color: white;
            border: none;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            margin: 0 8px;
            box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
            font-size: 18px;
            position: relative;
            z-index: 100;
        }
        
        .enhanced-menu-toggle:hover {
            transform: scale(1.1) rotate(90deg);
            box-shadow: 0 6px 20px rgba(79, 172, 254, 0.5);
        }
        
        .enhanced-menu-toggle.active {
            transform: rotate(45deg);
            background: linear-gradient(135deg, #ff6b6b, #ffa726);
        }
        
        .enhanced-actions-menu {
            position: fixed;
            bottom: 90px;
            right: 20px;
            background: var(--header-bg);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            min-width: 320px;
            max-width: 90vw;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid var(--border-color);
            overflow: hidden;
        }
        
        .enhanced-actions-menu.active {
            opacity: 1;
            transform: translateY(0) scale(1);
            visibility: visible;
        }
        
        .menu-section {
            padding: 16px 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .menu-section:last-child {
            border-bottom: none;
        }
        
        .menu-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--action-btn-color);
            padding: 0 20px 12px 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .menu-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 12px 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--text-color);
            position: relative;
            opacity: 0;
            transform: translateX(-10px);
        }
        
        .menu-item.animate-in {
            animation: menuItemSlideIn 0.3s ease forwards;
        }
        
        @keyframes menuItemSlideIn {
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .menu-item:hover {
            background: rgba(255, 255, 255, 0.1);
            padding-left: 25px;
        }
        
        .menu-item:active {
            background: rgba(255, 255, 255, 0.15);
            transform: scale(0.98);
        }
        
        .menu-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: rgba(79, 172, 254, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: #4facfe;
            transition: all 0.2s ease;
            flex-shrink: 0;
        }
        
        .menu-item:hover .menu-icon {
            background: rgba(79, 172, 254, 0.25);
            transform: scale(1.1);
        }
        
        .menu-text {
            flex: 1;
            min-width: 0;
        }
        
        .menu-item-title {
            display: block;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 2px;
            color: var(--text-color);
        }
        
        .menu-item-desc {
            display: block;
            font-size: 11px;
            opacity: 0.7;
            color: var(--text-color);
        }
        
        /* Стили для светлой темы */
        .light-theme .enhanced-actions-menu {
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }
        
        .light-theme .menu-item:hover {
            background: rgba(0, 0, 0, 0.05);
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .enhanced-actions-menu {
                bottom: 80px;
                right: 10px;
                left: 10px;
                min-width: auto;
                max-width: none;
            }
            
            .enhanced-menu-toggle {
                width: 40px;
                height: 40px;
                margin: 0 6px;
                font-size: 16px;
            }
            
            .menu-item {
                padding: 10px 15px;
                gap: 12px;
            }
            
            .menu-icon {
                width: 36px;
                height: 36px;
                font-size: 14px;
            }
        }
        
        @media (max-width: 480px) {
            .enhanced-actions-menu {
                bottom: 70px;
                right: 5px;
                left: 5px;
                border-radius: 16px;
            }
            
            .enhanced-menu-toggle {
                width: 36px;
                height: 36px;
                margin: 0 4px;
            }
            
            .menu-section {
                padding: 12px 0;
            }
            
            .menu-title {
                padding: 0 15px 8px 15px;
            }
            
            .menu-item {
                padding: 8px 15px;
            }
            
            .menu-item-title {
                font-size: 13px;
            }
            
            .menu-item-desc {
                font-size: 10px;
            }
        }
        
        /* Стили для изображений в сообщениях */
        .image-message-container {
            margin: 10px 0;
            max-width: 100%;
            text-align: center;
        }
        
        .message-image {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            border: 2px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            transition: all 0.3s ease;
            display: block;
            margin: 0 auto;
        }
        
        .message-image:hover {
            transform: scale(1.02);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        
        .image-message-info {
            font-size: 11px;
            color: var(--text-color);
            opacity: 0.7;
            margin-top: 6px;
            text-align: center;
            padding: 4px 8px;
            background: var(--search-bg);
            border-radius: 6px;
            display: inline-block;
        }
        
        /* Модальное окно изображения */
        .image-modal {
            backdrop-filter: blur(10px);
            background: rgba(0, 0, 0, 0.8) !important;
        }
        
        .image-modal-content {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .image-modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .image-modal-close:hover {
            background: rgba(255,0,0,0.7);
            transform: scale(1.1);
        }
        
        .image-modal-info {
            position: absolute;
            bottom: 15px;
            left: 15px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'enhanced-actions-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

// Функция проверки инициализации
function checkAndInitEnhancedMenu() {
    const inputArea = document.querySelector('.input-area');
    if (inputArea && typeof currentUser !== 'undefined') {
        initEnhancedActions();
        console.log("✅ Улучшенное меню успешно установлено");
    } else {
        setTimeout(checkAndInitEnhancedMenu, 500);
    }
}

// Автоматическая инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("📄 DOM загружен, инициализируем улучшенное меню...");
        setTimeout(checkAndInitEnhancedMenu, 1500);
    });
} else {
    setTimeout(checkAndInitEnhancedMenu, 1000);
}

// Экспорт функций для глобального использования
window.initEnhancedActions = initEnhancedActions;
window.handleEnhancedAction = handleEnhancedAction;
window.triggerImageUpload = triggerImageUpload;