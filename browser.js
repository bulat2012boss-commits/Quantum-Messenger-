// enhanced-browser.js - Улучшенный браузер для Quantum Messenger

class EnhancedBrowser {
    constructor() {
        this.isOpen = false;
        this.currentUrl = 'https://google.com';
        this.init();
    }

    init() {
        this.createBrowserModal();
        this.setupEventListeners();
        console.log('Улучшенный браузер инициализирован');
    }

    createBrowserModal() {
        // Создаем модальное окно браузера
        const browserModal = document.createElement('div');
        browserModal.className = 'modal';
        browserModal.id = 'browserModal';
        browserModal.innerHTML = `
            <div class="modal-content" style="max-width: 95%; max-height: 90vh; width: 1200px;">
                <div class="browser-header">
                    <div class="browser-controls">
                        <button class="browser-btn" id="browserBack">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <button class="browser-btn" id="browserForward">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        <button class="browser-btn" id="browserRefresh">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button class="browser-btn" id="browserHome">
                            <i class="fas fa-home"></i>
                        </button>
                    </div>
                    <div class="browser-url-bar">
                        <input type="text" id="browserUrlInput" placeholder="Введите URL..." value="${this.currentUrl}">
                        <button class="browser-btn" id="browserGo">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div class="browser-actions">
                        <button class="browser-btn" id="browserNewTab">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="browser-btn" id="browserClose">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="browser-tabs">
                    <div class="browser-tab active" data-tab="main">
                        <span>Главная</span>
                        <button class="tab-close"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="browser-content">
                    <iframe 
                        id="browserFrame" 
                        src="${this.currentUrl}"
                        style="width: 100%; height: 500px; border: none; border-radius: 0 0 8px 8px;"
                        allow="camera; microphone"
                    ></iframe>
                </div>
                <div class="browser-footer">
                    <div class="browser-status" id="browserStatus">Готов</div>
                    <div class="browser-progress">
                        <div class="progress-bar" id="browserProgress"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(browserModal);
    }

    setupEventListeners() {
        // Кнопка открытия браузера в основном интерфейсе
        const browserBtn = document.createElement('div');
        browserBtn.className = 'action-btn';
        browserBtn.innerHTML = '<i class="fas fa-globe"></i> <span>Браузер</span>';
        browserBtn.onclick = () => this.openBrowser();

        // Добавляем кнопку в интерфейс
        const userControls = document.querySelector('.user-controls');
        if (userControls) {
            userControls.insertBefore(browserBtn, userControls.querySelector('.logout-btn'));
        }

        // Обработчики для элементов браузера
        document.getElementById('browserClose').onclick = () => this.closeBrowser();
        document.getElementById('browserGo').onclick = () => this.navigate();
        document.getElementById('browserUrlInput').onkeypress = (e) => {
            if (e.key === 'Enter') this.navigate();
        };
        document.getElementById('browserBack').onclick = () => this.goBack();
        document.getElementById('browserForward').onclick = () => this.goForward();
        document.getElementById('browserRefresh').onclick = () => this.refresh();
        document.getElementById('browserHome').onclick = () => this.goHome();
        document.getElementById('browserNewTab').onclick = () => this.newTab();

        // Обработчик для закрытия по клику вне окна
        document.getElementById('browserModal').onclick = (e) => {
            if (e.target.id === 'browserModal') this.closeBrowser();
        };
    }

    openBrowser() {
        document.getElementById('browserModal').classList.add('active');
        this.isOpen = true;
        document.getElementById('browserUrlInput').focus();
        this.showNotification('Браузер открыт');
    }

    closeBrowser() {
        document.getElementById('browserModal').classList.remove('active');
        this.isOpen = false;
    }

    navigate() {
        let url = document.getElementById('browserUrlInput').value.trim();
        
        // Добавляем протокол если отсутствует
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        this.currentUrl = url;
        document.getElementById('browserUrlInput').value = url;
        
        // Показываем загрузку
        this.showLoading();
        
        // Загружаем страницу в iframe
        const iframe = document.getElementById('browserFrame');
        iframe.src = url;
        
        this.showNotification(`Переход на: ${url}`);
    }

    goBack() {
        const iframe = document.getElementById('browserFrame');
        try {
            iframe.contentWindow.history.back();
        } catch (e) {
            this.showNotification('Нельзя вернуться назад');
        }
    }

    goForward() {
        const iframe = document.getElementById('browserFrame');
        try {
            iframe.contentWindow.history.forward();
        } catch (e) {
            this.showNotification('Нельзя перейти вперед');
        }
    }

    refresh() {
        const iframe = document.getElementById('browserFrame');
        iframe.src = iframe.src;
        this.showNotification('Страница обновлена');
    }

    goHome() {
        this.currentUrl = 'https://google.com';
        document.getElementById('browserUrlInput').value = this.currentUrl;
        document.getElementById('browserFrame').src = this.currentUrl;
        this.showNotification('Переход на главную');
    }

    newTab() {
        this.showNotification('Функция новых вкладок в разработке');
        // В будущем можно добавить систему вкладок
    }

    showLoading() {
        const status = document.getElementById('browserStatus');
        const progress = document.getElementById('browserProgress');
        
        status.textContent = 'Загрузка...';
        progress.style.width = '30%';
        
        // Имитация прогресса загрузки
        setTimeout(() => {
            progress.style.width = '70%';
        }, 500);
        
        setTimeout(() => {
            progress.style.width = '100%';
            status.textContent = 'Загружено';
            
            setTimeout(() => {
                progress.style.width = '0%';
            }, 1000);
        }, 1000);
    }

    showNotification(message) {
        // Используем существующую систему уведомлений
        if (window.showNotification) {
            showNotification(message);
        } else {
            console.log('Браузер: ' + message);
        }
    }
}

// Стили для браузера
const browserStyles = `
.browser-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
}

.browser-controls {
    display: flex;
    gap: 5px;
}

.browser-btn {
    padding: 8px 12px;
    background: var(--action-btn-bg);
    border: 1px solid var(--border-color);
    border-radius: 5px;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;
}

.browser-btn:hover {
    background: var(--message-bg);
    color: white;
}

.browser-url-bar {
    flex: 1;
    display: flex;
    gap: 5px;
}

#browserUrlInput {
    flex: 1;
    padding: 8px 12px;
    background: var(--input-bg);
    color: var(--input-color);
    border: 1px solid var(--border-color);
    border-radius: 5px;
    outline: none;
}

.browser-actions {
    display: flex;
    gap: 5px;
}

.browser-tabs {
    display: flex;
    background: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
    padding: 0 10px;
}

.browser-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 15px;
    background: rgba(255,255,255,0.1);
    border-radius: 5px 5px 0 0;
    margin-right: 2px;
    cursor: pointer;
}

.browser-tab.active {
    background: var(--primary-bg);
}

.tab-close {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 2px;
    border-radius: 3px;
}

.tab-close:hover {
    background: rgba(255,255,255,0.1);
}

.browser-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 10px;
    background: var(--header-bg);
    border-top: 1px solid var(--border-color);
    font-size: 12px;
}

.browser-progress {
    width: 100px;
    height: 3px;
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(to right, #4facfe, #00f2fe);
    width: 0%;
    transition: width 0.3s ease;
}

@media (max-width: 768px) {
    .browser-header {
        flex-wrap: wrap;
    }
    
    .browser-url-bar {
        order: 3;
        width: 100%;
        margin-top: 10px;
    }
}
`;

// Добавляем стили в документ
const styleSheet = document.createElement('style');
styleSheet.textContent = browserStyles;
document.head.appendChild(styleSheet);

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.quantumBrowser = new EnhancedBrowser();
    }, 2000);
});