// connection-overlay.js - Заглушка для отображения статуса соединения

document.addEventListener('DOMContentLoaded', function() {
    // Создаем оверлей для статуса соединения
    const connectionOverlay = document.createElement('div');
    connectionOverlay.id = 'connectionOverlay';
    connectionOverlay.innerHTML = `
        <div class="connection-container">
            <div class="connection-header">
                <div class="connection-logo">⚡</div>
                <div class="connection-title">Соединение...</div>
            </div>
            <div class="connection-status">
                <div class="status-text" id="statusText">Установка соединения с сервером</div>
                <div class="loading-animation">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
            <div class="connection-progress">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">0%</div>
            </div>
            <div class="connection-hint">
                Пожалуйста, подождите. Чат загружается...
            </div>
        </div>
    `;
    
    // Добавляем стили
    const overlayStyles = `
        <style>
            #connectionOverlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: white;
            }
            
            .connection-container {
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
            }
            
            .connection-header {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .connection-logo {
                font-size: 48px;
                animation: pulse 2s infinite;
            }
            
            .connection-title {
                font-size: 28px;
                font-weight: bold;
                background: linear-gradient(to right, #4facfe, #00f2fe);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .connection-status {
                margin-bottom: 25px;
            }
            
            .status-text {
                font-size: 16px;
                margin-bottom: 15px;
                opacity: 0.9;
            }
            
            .loading-animation {
                display: flex;
                justify-content: center;
                gap: 8px;
            }
            
            .loading-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: linear-gradient(to right, #4facfe, #00f2fe);
                animation: loadingBounce 1.4s infinite ease-in-out both;
            }
            
            .loading-dot:nth-child(1) { animation-delay: -0.32s; }
            .loading-dot:nth-child(2) { animation-delay: -0.16s; }
            
            .connection-progress {
                margin-bottom: 20px;
            }
            
            .progress-bar {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(to right, #4facfe, #00f2fe);
                border-radius: 3px;
                width: 0%;
                transition: width 0.5s ease;
            }
            
            .progress-text {
                font-size: 14px;
                opacity: 0.8;
            }
            
            .connection-hint {
                font-size: 12px;
                opacity: 0.7;
                margin-top: 15px;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
            }
            
            @keyframes loadingBounce {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                40% { transform: scale(1.2); opacity: 1; }
            }
            
            /* Анимация для смены статусов */
            @keyframes fadeInOut {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }
            
            .fade-text {
                animation: fadeInOut 2s infinite;
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', overlayStyles);
    document.body.appendChild(connectionOverlay);
    
    // Функции для управления оверлеем
    window.connectionOverlay = {
        // Обновление статуса соединения
        updateStatus: function(text) {
            const statusText = document.getElementById('statusText');
            if (statusText) {
                statusText.textContent = text;
                statusText.classList.add('fade-text');
                setTimeout(() => statusText.classList.remove('fade-text'), 1000);
            }
        },
        
        // Обновление прогресса
        updateProgress: function(percent) {
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            
            if (progressFill) {
                progressFill.style.width = percent + '%';
            }
            if (progressText) {
                progressText.textContent = percent + '%';
            }
        },
        
        // Скрытие оверлея
        hide: function() {
            const overlay = document.getElementById('connectionOverlay');
            if (overlay) {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 500);
            }
        },
        
        // Показ оверлея (на случай если нужно будет показать снова)
        show: function() {
            const existingOverlay = document.getElementById('connectionOverlay');
            if (!existingOverlay) {
                document.body.appendChild(connectionOverlay);
            }
        }
    };
    
    // Симуляция процесса подключения
    simulateConnectionProcess();
});

// Функция симуляции процесса подключения
function simulateConnectionProcess() {
    let progress = 0;
    const statusMessages = [
        "Установка соединения с сервером...",
        "Проверка подключения к базе данных...",
        "Загрузка профиля пользователя...",
        "Подключение к чату...",
        "Получение истории сообщений...",
        "Инициализация интерфейса...",
        "Почти готово..."
    ];
    
    let currentStatus = 0;
    
    const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        
        window.connectionOverlay.updateProgress(Math.floor(progress));
        
        // Меняем статус каждые 15%
        if (progress >= (currentStatus + 1) * (100 / statusMessages.length)) {
            if (currentStatus < statusMessages.length) {
                window.connectionOverlay.updateStatus(statusMessages[currentStatus]);
                currentStatus++;
            }
        }
        
        // Когда прогресс достигает 100%, скрываем оверлей
        if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                window.connectionOverlay.hide();
            }, 1000);
        }
    }, 300);
}

// Функция для принудительного скрытия оверлея (можно вызвать извне)
function forceHideConnectionOverlay() {
    if (window.connectionOverlay) {
        window.connectionOverlay.hide();
    }
}

// Автоматическое скрытие оверлея при полной загрузке страницы
window.addEventListener('load', function() {
    setTimeout(() => {
        if (window.connectionOverlay) {
            window.connectionOverlay.updateStatus("Соединение установлено!");
            window.connectionOverlay.updateProgress(100);
            setTimeout(() => {
                window.connectionOverlay.hide();
            }, 1500);
        }
    }, 2000);
});

// Отслеживание состояния загрузки Firebase
let firebaseLoaded = false;

// Функция для проверки готовности Firebase
function checkFirebaseReady() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        firebaseLoaded = true;
        window.connectionOverlay.updateStatus("База данных подключена!");
        window.connectionOverlay.updateProgress(90);
        
        setTimeout(() => {
            window.connectionOverlay.updateStatus("Чат готов к использованию!");
            window.connectionOverlay.updateProgress(100);
            
            setTimeout(() => {
                window.connectionOverlay.hide();
            }, 1000);
        }, 1000);
    } else {
        setTimeout(checkFirebaseReady, 500);
    }
}

// Запускаем проверку Firebase
setTimeout(checkFirebaseReady, 1000);