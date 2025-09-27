// Функции для встроенного браузера Quantum Messenger

let currentBrowserUrl = '';
let browserHistory = [];
let historyIndex = -1;

// Инициализация браузера
function initBrowser() {
    const browserModal = document.getElementById('browserModal');
    const browserIframe = document.getElementById('browserIframe');
    const browserUrlInput = document.getElementById('browserUrlInput');
    const browserBackBtn = document.getElementById('browserBackBtn');
    const browserForwardBtn = document.getElementById('browserForwardBtn');
    const browserRefreshBtn = document.getElementById('browserRefreshBtn');
    const browserCloseBtn = document.getElementById('browserCloseBtn');
    const browserGoBtn = document.getElementById('browserGoBtn');
    const browserLoading = document.getElementById('browserLoading');

    // Функция открытия браузера
    window.openBrowser = function(url = '') {
        browserModal.classList.add('active');
        
        if (url) {
            loadUrl(url);
        } else {
            browserUrlInput.value = 'https://';
            browserUrlInput.focus();
        }
        
        // Обновляем состояние кнопок навигации
        updateNavigationButtons();
    };

    // Функция закрытия браузера
    function closeBrowser() {
        browserModal.classList.remove('active');
        browserIframe.src = 'about:blank';
        currentBrowserUrl = '';
        browserHistory = [];
        historyIndex = -1;
    }

    // Загрузка URL
    function loadUrl(url) {
        if (!url) return;
        
        // Добавляем протокол если отсутствует
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        // Показываем загрузку
        browserLoading.style.display = 'flex';
        browserIframe.style.display = 'none';
        
        // Обновляем URL в поле ввода
        browserUrlInput.value = url;
        currentBrowserUrl = url;
        
        // Добавляем в историю
        if (browserHistory[historyIndex] !== url) {
            browserHistory = browserHistory.slice(0, historyIndex + 1);
            browserHistory.push(url);
            historyIndex = browserHistory.length - 1;
        }
        
        // Загружаем страницу в iframe
        browserIframe.src = url;
        
        // Обновляем кнопки навигации
        updateNavigationButtons();
    }

    // Обновление состояния кнопок навигации
    function updateNavigationButtons() {
        browserBackBtn.disabled = historyIndex <= 0;
        browserForwardBtn.disabled = historyIndex >= browserHistory.length - 1;
    }

    // Обработчики событий
    browserIframe.addEventListener('load', function() {
        browserLoading.style.display = 'none';
        browserIframe.style.display = 'block';
    });

    browserIframe.addEventListener('error', function() {
        browserLoading.style.display = 'none';
        browserIframe.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--text-color);">
                <h3>Ошибка загрузки страницы</h3>
                <p>Не удалось загрузить: ${currentBrowserUrl}</p>
                <p>Проверьте URL и подключение к интернету</p>
            </div>
        `;
        browserIframe.style.display = 'block';
    });

    browserUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loadUrl(browserUrlInput.value);
        }
    });

    browserGoBtn.addEventListener('click', function() {
        loadUrl(browserUrlInput.value);
    });

    browserBackBtn.addEventListener('click', function() {
        if (historyIndex > 0) {
            historyIndex--;
            loadUrl(browserHistory[historyIndex]);
        }
    });

    browserForwardBtn.addEventListener('click', function() {
        if (historyIndex < browserHistory.length - 1) {
            historyIndex++;
            loadUrl(browserHistory[historyIndex]);
        }
    });

    browserRefreshBtn.addEventListener('click', function() {
        if (currentBrowserUrl) {
            loadUrl(currentBrowserUrl);
        }
    });

    browserCloseBtn.addEventListener('click', closeBrowser);

    // Закрытие по клику вне окна
    browserModal.addEventListener('click', function(e) {
        if (e.target === browserModal) {
            closeBrowser();
        }
    });
}

// Функция для отправки ссылки в чат
function sendLinkMessage(url, title = '') {
    if (!currentUser) return;
    
    const messageText = title ? `🔗 ${title}\n${url}` : `🔗 ${url}`;
    
    const messageData = {
        text: encryptMessage(messageText),
        name: currentUser,
        userId: userId,
        timestamp: Date.now(),
        isDeveloper: isDeveloper,
        isTester: isTester,
        userColor: userColor,
        avatar: userAvatarUrl,
        type: 'link',
        linkUrl: url,
        linkTitle: title
    };
    
    database.ref('messages').push(messageData, (error) => {
        if (error) {
            console.error("Ошибка отправки ссылки:", error);
            showNotification("Ошибка отправки ссылки");
        } else {
            showNotification("Ссылка отправлена в чат");
        }
    });
}

// Автоматическое определение ссылок в сообщениях
function detectLinksInMessage(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="#" onclick="openBrowser(\'$1\'); return false;" class="message-link">$1</a>');
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Создаем модальное окно браузера если его нет
    if (!document.getElementById('browserModal')) {
        createBrowserModal();
    }
    
    // Инициализируем браузер
    setTimeout(initBrowser, 1000);
});

// Создание модального окна браузера
function createBrowserModal() {
    const browserModal = document.createElement('div');
    browserModal.id = 'browserModal';
    browserModal.className = 'modal';
    browserModal.innerHTML = `
        <div class="modal-content browser-modal-content">
            <div class="browser-header">
                <div class="browser-controls">
                    <button class="browser-btn" id="browserBackBtn" title="Назад">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <button class="browser-btn" id="browserForwardBtn" title="Вперед">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    <button class="browser-btn" id="browserRefreshBtn" title="Обновить">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
                <div class="browser-url-bar">
                    <input type="text" id="browserUrlInput" placeholder="Введите URL...">
                    <button class="browser-btn" id="browserGoBtn">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                <button class="browser-btn browser-close-btn" id="browserCloseBtn" title="Закрыть">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="browser-content">
                <div class="browser-loading" id="browserLoading">
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                    <p>Загрузка...</p>
                </div>
                <iframe id="browserIframe" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
            </div>
            <div class="browser-footer">
                <button class="action-btn" onclick="sendLinkMessage(currentBrowserUrl, browserIframe.contentDocument?.title || '')">
                    <i class="fas fa-share"></i> Поделиться в чате
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(browserModal);
}