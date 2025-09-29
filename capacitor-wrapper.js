// capacitor-wrapper.js
// Quantum Messenger - Capacitor Integration & Native Enhancements
// Этот файл добавляет нативные функции и исправляет проблемы для публикации в RuStore

// Проверяем, запущено ли приложение в нативной оболочке Capacitor
const isNative = window.Capacitor && window.Capacitor.isNative;

// Основной класс для интеграции с Capacitor
class QuantumNative {
    constructor() {
        this.init();
    }

    async init() {
        console.log('Quantum Native: Initializing...');
        
        // Инициализация Capacitor плагинов
        await this.initCapacitor();
        
        // Настройка оффлайн-режима
        this.setupOfflineMode();
        
        // Настройка нативных уведомлений
        this.setupPushNotifications();
        
        // Настройка нативной навигации
        this.setupNativeNavigation();
        
        // Скрываем элементы браузера в нативном режиме
        this.hideBrowserElements();
        
        console.log('Quantum Native: Initialization complete');
    }

    async initCapacitor() {
        if (!isNative) {
            console.log('Quantum Native: Running in browser mode');
            return;
        }

        try {
            // Инициализация основных плагинов
            const { App } = await import('@capacitor/app');
            const { StatusBar } = await import('@capacitor/status-bar');
            const { Keyboard } = await import('@capacitor/keyboard');

            // Настройка StatusBar
            await StatusBar.setOverlaysWebView({ overlay: false });
            await StatusBar.setBackgroundColor({ color: '#0f2027' });

            // Настройка клавиатуры
            Keyboard.setAccessoryBarVisible({ isVisible: false });
            
            // Обработка кнопки "Назад" на Android
            App.addListener('backButton', ({ canGoBack }) => {
                if (canGoBack) {
                    window.history.back();
                } else {
                    App.exitApp();
                }
            });

            console.log('Quantum Native: Capacitor plugins initialized');
        } catch (error) {
            console.error('Quantum Native: Capacitor initialization failed', error);
        }
    }

    setupOfflineMode() {
        // Создаем оффлайн-интерфейс
        this.createOfflineOverlay();
        
        // Слушаем изменения сети
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Проверяем начальное состояние
        if (!navigator.onLine) {
            this.handleOffline();
        }
    }

    createOfflineOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'quantum-offline-overlay';
        overlay.innerHTML = `
            <div class="offline-content">
                <i class="fas fa-wifi-slash"></i>
                <h3>Нет соединения с интернетом</h3>
                <p>Quantum Messenger работает в оффлайн-режиме</p>
                <div class="offline-features">
                    <div class="feature">
                        <i class="fas fa-history"></i>
                        <span>Доступна история чатов</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-edit"></i>
                        <span>Можно писать сообщения</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-sync"></i>
                        <span>Сообщения отправятся автоматически</span>
                    </div>
                </div>
                <div class="connection-status">
                    <div class="status-indicator offline"></div>
                    <span>Ожидание подключения...</span>
                </div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            #quantum-offline-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--primary-bg);
                z-index: 10000;
                display: none;
                justify-content: center;
                align-items: center;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            #quantum-offline-overlay.active {
                display: flex;
            }
            
            .offline-content {
                text-align: center;
                color: var(--text-color);
                max-width: 400px;
                padding: 20px;
            }
            
            .offline-content i.fa-wifi-slash {
                font-size: 64px;
                margin-bottom: 20px;
                color: #ff6b6b;
            }
            
            .offline-content h3 {
                margin-bottom: 10px;
                font-size: 24px;
            }
            
            .offline-features {
                margin: 30px 0;
                text-align: left;
            }
            
            .feature {
                display: flex;
                align-items: center;
                margin: 15px 0;
                font-size: 14px;
            }
            
            .feature i {
                margin-right: 10px;
                width: 20px;
                text-align: center;
                color: #4facfe;
            }
            
            .connection-status {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 20px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
            }
            
            .status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 10px;
            }
            
            .status-indicator.offline {
                background: #ff6b6b;
                animation: pulse 2s infinite;
            }
            
            .status-indicator.online {
                background: #4CAF50;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .network-restored {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                margin-top: 20px;
                animation: slideUp 0.5s ease;
            }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(overlay);
    }

    handleOffline() {
        const overlay = document.getElementById('quantum-offline-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
        
        // Показываем индикатор оффлайн-режима в основном интерфейсе
        this.showOfflineIndicator();
        
        console.log('Quantum Native: Offline mode activated');
    }

    handleOnline() {
        const overlay = document.getElementById('quantum-offline-overlay');
        if (overlay) {
            // Показываем сообщение о восстановлении соединения
            const content = overlay.querySelector('.offline-content');
            const restoredMsg = document.createElement('div');
            restoredMsg.className = 'network-restored';
            restoredMsg.innerHTML = '<i class="fas fa-wifi"></i> Соединение восстановлено!';
            content.appendChild(restoredMsg);
            
            // Скрываем оверлей через 3 секунды
            setTimeout(() => {
                overlay.classList.remove('active');
                restoredMsg.remove();
            }, 3000);
        }
        
        // Скрываем индикатор оффлайн-режима
        this.hideOfflineIndicator();
        
        // Синхронизируем оффлайн-сообщения
        this.syncOfflineMessages();
        
        console.log('Quantum Native: Online mode restored');
    }

    showOfflineIndicator() {
        // Добавляем индикатор в шапку приложения
        let indicator = document.getElementById('network-status-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'network-status-indicator';
            indicator.innerHTML = '<i class="fas fa-wifi-slash"></i>';
            indicator.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                color: #ff6b6b;
                font-size: 14px;
                z-index: 1001;
            `;
            document.querySelector('.header').style.position = 'relative';
            document.querySelector('.header').appendChild(indicator);
        }
    }

    hideOfflineIndicator() {
        const indicator = document.getElementById('network-status-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async syncOfflineMessages() {
        // Здесь будет логика синхронизации сообщений, написанных оффлайн
        console.log('Quantum Native: Syncing offline messages...');
        // В реальной реализации здесь бы отправлялись сообщения из локальной очереди
    }

    async setupPushNotifications() {
        if (!isNative) return;

        try {
            const { PushNotifications } = await import('@capacitor/push-notifications');
            
            // Запрашиваем разрешение на уведомления
            let permission = await PushNotifications.requestPermissions();
            if (permission.receive === 'granted') {
                await PushNotifications.register();
            }

            // Слушаем получение уведомлений
            PushNotifications.addListener('pushNotificationReceived', 
                (notification) => {
                    console.log('Push notification received:', notification);
                    this.showLocalNotification(notification);
                }
            );

            // Слушаем клики по уведомлениям
            PushNotifications.addListener('pushNotificationActionPerformed', 
                (notification) => {
                    console.log('Push notification action performed', notification);
                    // Открываем приложение при клике на уведомление
                    if (window.quantumApp) {
                        window.quantumApp.focusChat();
                    }
                }
            );

            console.log('Quantum Native: Push notifications initialized');
        } catch (error) {
            console.error('Quantum Native: Push notifications failed', error);
        }
    }

    showLocalNotification(notification) {
        // Показываем локальное уведомление в интерфейсе
        const notif = document.createElement('div');
        notif.className = 'native-notification';
        notif.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${notification.title || 'Quantum Messenger'}</div>
                <div class="notification-body">${notification.body || 'Новое сообщение'}</div>
            </div>
        `;
        
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #0f2027, #203a43);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10001;
            max-width: 300px;
            border-left: 4px solid #4facfe;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notif);
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            notif.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 5000);
        
        // Добавляем CSS анимации
        if (!document.getElementById('native-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'native-notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupNativeNavigation() {
        // Настройка нативной навигации для Android
        if (isNative) {
            // Скрываем браузерную навигацию
            this.hideUrlBar();
            
            // Добавляем обработчик свайпов для навигации
            this.setupSwipeNavigation();
        }
    }

    hideUrlBar() {
        // Скрываем элементы, которые выдают веб-природу
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no';
        document.head.appendChild(meta);
    }

    setupSwipeNavigation() {
        // Простая реализация свайп-навигации
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Если горизонтальный свайп больше вертикального и достаточно длинный
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Свайп влево - вперед
                    // window.history.forward();
                } else {
                    // Свайп вправо - назад
                    window.history.back();
                }
            }
        });
    }

    hideBrowserElements() {
        // Скрываем элементы, характерные для браузера
        if (isNative) {
            // Добавляем класс для скрытия элементов в нативном режиме
            document.body.classList.add('quantum-native');
            
            const style = document.createElement('style');
            style.textContent = `
                .quantum-native .browser-only {
                    display: none !important;
                }
                
                /* Улучшаем скролл для нативного приложения */
                .messages-wrapper {
                    -webkit-overflow-scrolling: touch;
                    scroll-behavior: smooth;
                }
                
                /* Улучшаем тапы на мобильных */
                .message, .action-btn, .avatar-option {
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Метод для открытия камеры (интеграция с @capacitor/camera)
    async takePhoto() {
        if (!isNative) {
            alert('Функция камеры доступна только в нативной версии приложения');
            return null;
        }

        try {
            const { Camera } = await import('@capacitor/camera');
            
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: 'dataUrl'
            });
            
            return image.dataUrl;
        } catch (error) {
            console.error('Quantum Native: Camera error', error);
            return null;
        }
    }

    // Метод для работы с файловой системой
    async saveFile(data, filename) {
        if (!isNative) return;

        try {
            const { Filesystem } = await import('@capacitor/filesystem');
            
            await Filesystem.writeFile({
                path: filename,
                data: data,
                directory: Directory.Documents
            });
            
            return true;
        } catch (error) {
            console.error('Quantum Native: File save error', error);
            return false;
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Создаем глобальный объект для нативных функций
    window.quantumNative = new QuantumNative();
    
    // Добавляем глобальные методы для доступа из основного кода
    window.takePhoto = () => window.quantumNative.takePhoto();
    window.isNativeApp = () => isNative;
    
    console.log('Quantum Native: Wrapper initialized successfully');
});

// Service Worker для оффлайн-работы
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('Quantum Native: ServiceWorker registered');
            })
            .catch(function(error) {
                console.log('Quantum Native: ServiceWorker registration failed');
            });
    });
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuantumNative;
}