// auth-system.js - Система аутентификации для Quantum Messenger

// Конфигурация системы аутентификации
const AUTH_CONFIG = {
    minPasswordLength: 6,
    maxLoginAttempts: 5,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 часа
    requireEmail: false
};

// Переменные состояния аутентификации
let currentSession = null;
let loginAttempts = 0;
let isLoggedIn = false;

// Инициализация системы аутентификации
function initAuthSystem() {
    console.log("🔐 Инициализация системы аутентификации...");
    
    // Проверяем существующую сессию
    checkExistingSession();
    
    // Модифицируем интерфейс для поддержки аутентификации
    modifyAuthInterface();
    
    // Настраиваем обработчики событий
    setupAuthEventListeners();
    
    console.log("✅ Система аутентификации готова");
}

// Модификация интерфейса для аутентификации
function modifyAuthInterface() {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;
    
    // Сохраняем оригинальный контейнер аутентификации
    const originalAuthHTML = authContainer.innerHTML;
    
    // Создаем улучшенный интерфейс аутентификации
    authContainer.innerHTML = `
        <div class="auth-tabs">
            <div class="auth-tab active" data-tab="login">Вход</div>
            <div class="auth-tab" data-tab="register">Регистрация</div>
        </div>
        
        <div class="auth-content">
            <!-- Форма входа -->
            <div class="auth-form active" id="loginForm">
                <div class="auth-title">Вход в Quantum Messenger</div>
                
                <div class="auth-alert" id="loginAlert" style="display: none;"></div>
                
                <input type="text" id="loginUsername" placeholder="Логин или email" autocomplete="username">
                <input type="password" id="loginPassword" placeholder="Пароль" autocomplete="current-password">
                
                <div class="auth-options">
                    <label class="auth-checkbox">
                        <input type="checkbox" id="rememberMe">
                        <span>Запомнить меня</span>
                    </label>
                    <a href="#" class="auth-link" id="forgotPasswordLink">Забыли пароль?</a>
                </div>
                
                <button id="loginBtn" class="auth-submit-btn">Войти</button>
                
                <div class="auth-divider">
                    <span>или войдите быстро</span>
                </div>
                
                <div class="quick-auth-options">
                    <button class="quick-auth-btn" onclick="quickLogin('demo')">
                        <i class="fas fa-user"></i> Демо-аккаунт
                    </button>
                    <button class="quick-auth-btn" onclick="quickLogin('guest')">
                        <i class="fas fa-user-clock"></i> Гостевой вход
                    </button>
                </div>
            </div>
            
            <!-- Форма регистрации -->
            <div class="auth-form" id="registerForm">
                <div class="auth-title">Регистрация в Quantum Messenger</div>
                
                <div class="auth-alert" id="registerAlert" style="display: none;"></div>
                
                <input type="text" id="registerUsername" placeholder="Придумайте логин" autocomplete="username">
                <input type="email" id="registerEmail" placeholder="Email (необязательно)" autocomplete="email">
                <input type="password" id="registerPassword" placeholder="Придумайте пароль" autocomplete="new-password">
                <input type="password" id="registerConfirmPassword" placeholder="Повторите пароль" autocomplete="new-password">
                
                <div class="password-strength" id="passwordStrength">
                    <div class="strength-bar">
                        <div class="strength-fill" id="strengthFill"></div>
                    </div>
                    <div class="strength-text" id="strengthText">Надежность пароля</div>
                </div>
                
                <div class="auth-options">
                    <label class="auth-checkbox">
                        <input type="checkbox" id="agreeTerms" checked>
                        <span>Я согласен с <a href="#" onclick="showTerms()">правилами использования</a></span>
                    </label>
                </div>
                
                <button id="registerBtn" class="auth-submit-btn">Зарегистрироваться</button>
            </div>
        </div>
        
        <!-- Секция для быстрого входа (старая система) -->
        <div class="legacy-auth-section">
            <div class="auth-divider">
                <span>или войдите по старой системе</span>
            </div>
            ${originalAuthHTML}
        </div>
    `;
    
    // Добавляем стили для системы аутентификации
    addAuthStyles();
}

// Добавление стилей для системы аутентификации
function addAuthStyles() {
    const styles = `
        .auth-tabs {
            display: flex;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 15px;
        }
        
        .auth-tab {
            flex: 1;
            padding: 12px;
            text-align: center;
            cursor: pointer;
            opacity: 0.7;
            transition: all 0.3s ease;
            border-bottom: 2px solid transparent;
        }
        
        .auth-tab:hover {
            opacity: 0.9;
            background: rgba(255, 255, 255, 0.05);
        }
        
        .auth-tab.active {
            opacity: 1;
            border-bottom: 2px solid #4facfe;
            background: rgba(79, 172, 254, 0.1);
        }
        
        .auth-form {
            display: none;
        }
        
        .auth-form.active {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .auth-alert {
            padding: 10px;
            border-radius: 8px;
            font-size: 14px;
            text-align: center;
        }
        
        .auth-alert.error {
            background: rgba(255, 100, 100, 0.2);
            color: #ff6464;
            border: 1px solid rgba(255, 100, 100, 0.3);
        }
        
        .auth-alert.success {
            background: rgba(100, 255, 100, 0.2);
            color: #64ff64;
            border: 1px solid rgba(100, 255, 100, 0.3);
        }
        
        .auth-alert.warning {
            background: rgba(255, 200, 100, 0.2);
            color: #ffc864;
            border: 1px solid rgba(255, 200, 100, 0.3);
        }
        
        .auth-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
        }
        
        .auth-checkbox {
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
        }
        
        .auth-checkbox input {
            margin: 0;
        }
        
        .auth-link {
            color: #4facfe;
            text-decoration: none;
            font-size: 12px;
        }
        
        .auth-link:hover {
            text-decoration: underline;
        }
        
        .auth-submit-btn {
            padding: 12px;
            background: linear-gradient(to right, #4facfe, #00f2fe);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: transform 0.2s, opacity 0.2s;
        }
        
        .auth-submit-btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        
        .auth-submit-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .auth-divider {
            text-align: center;
            margin: 15px 0;
            position: relative;
            color: rgba(255, 255, 255, 0.5);
            font-size: 12px;
        }
        
        .auth-divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: var(--border-color);
            z-index: 1;
        }
        
        .auth-divider span {
            background: var(--primary-bg);
            padding: 0 10px;
            position: relative;
            z-index: 2;
        }
        
        .quick-auth-options {
            display: flex;
            gap: 10px;
        }
        
        .quick-auth-btn {
            flex: 1;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-color);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            font-size: 12px;
        }
        
        .quick-auth-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
        }
        
        .password-strength {
            margin-top: -5px;
        }
        
        .strength-bar {
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 5px;
        }
        
        .strength-fill {
            height: 100%;
            width: 0%;
            transition: width 0.3s ease, background 0.3s ease;
            border-radius: 2px;
        }
        
        .strength-text {
            font-size: 11px;
            text-align: center;
            opacity: 0.7;
        }
        
        .legacy-auth-section {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
        }
        
        .session-info {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Настройка обработчиков событий аутентификации
function setupAuthEventListeners() {
    // Переключение между вкладками входа и регистрации
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.getAttribute('data-tab');
            
            // Убираем активный класс у всех вкладок и форм
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            
            // Добавляем активный класс к выбранной вкладке и форме
            tab.classList.add('active');
            document.getElementById(tabType + 'Form').classList.add('active');
        });
    });
    
    // Обработчик входа
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    
    // Обработчик регистрации
    document.getElementById('registerBtn').addEventListener('click', handleRegister);
    
    // Быстрый вход по Enter
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    document.getElementById('registerConfirmPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
    
    // Проверка силы пароля
    document.getElementById('registerPassword').addEventListener('input', checkPasswordStrength);
    
    // Восстановление пароля
    document.getElementById('forgotPasswordLink').addEventListener('click', handleForgotPassword);
}

// Проверка существующей сессии
function checkExistingSession() {
    const savedSession = localStorage.getItem('quantumAuthSession');
    
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            
            // Проверяем срок действия сессии
            if (session.expires > Date.now()) {
                currentSession = session;
                isLoggedIn = true;
                
                // Автоматически входим в систему
                autoLogin(session);
                return true;
            } else {
                // Сессия истекла
                localStorage.removeItem('quantumAuthSession');
                showAuthAlert('loginAlert', 'Сессия истекла. Пожалуйста, войдите снова.', 'warning');
            }
        } catch (e) {
            console.error('Ошибка восстановления сессии:', e);
            localStorage.removeItem('quantumAuthSession');
        }
    }
    
    return false;
}

// Обработчик входа
async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Валидация
    if (!username || !password) {
        showAuthAlert('loginAlert', 'Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    // Проверка количества попыток
    if (loginAttempts >= AUTH_CONFIG.maxLoginAttempts) {
        showAuthAlert('loginAlert', 'Слишком много неудачных попыток. Попробуйте позже.', 'error');
        return;
    }
    
    // Блокируем кнопку
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Вход...';
    
    try {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Проверяем учетные данные
        const user = await authenticateUser(username, password);
        
        if (user) {
            // Успешный вход
            loginAttempts = 0;
            await createUserSession(user, rememberMe);
            showAuthAlert('loginAlert', 'Успешный вход!', 'success');
            
            // Переходим в чат
            setTimeout(() => {
                enterChatWithAuth(user);
            }, 1000);
            
        } else {
            // Неверные учетные данные
            loginAttempts++;
            const attemptsLeft = AUTH_CONFIG.maxLoginAttempts - loginAttempts;
            showAuthAlert('loginAlert', `Неверный логин или пароль. Осталось попыток: ${attemptsLeft}`, 'error');
        }
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        showAuthAlert('loginAlert', 'Ошибка входа. Попробуйте позже.', 'error');
    } finally {
        // Разблокируем кнопку
        loginBtn.disabled = false;
        loginBtn.textContent = 'Войти';
    }
}

// Обработчик регистрации
async function handleRegister() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Валидация
    if (!username || !password || !confirmPassword) {
        showAuthAlert('registerAlert', 'Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAuthAlert('registerAlert', 'Пароли не совпадают', 'error');
        return;
    }
    
    if (password.length < AUTH_CONFIG.minPasswordLength) {
        showAuthAlert('registerAlert', `Пароль должен содержать минимум ${AUTH_CONFIG.minPasswordLength} символов`, 'error');
        return;
    }
    
    if (!agreeTerms) {
        showAuthAlert('registerAlert', 'Необходимо согласие с правилами использования', 'error');
        return;
    }
    
    // Блокируем кнопку
    const registerBtn = document.getElementById('registerBtn');
    registerBtn.disabled = true;
    registerBtn.textContent = 'Регистрация...';
    
    try {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Регистрируем пользователя
        const user = await registerUser(username, password, email);
        
        if (user) {
            showAuthAlert('registerAlert', 'Регистрация успешна! Выполняется вход...', 'success');
            
            // Автоматически входим после регистрации
            setTimeout(() => {
                createUserSession(user, true);
                enterChatWithAuth(user);
            }, 2000);
            
        } else {
            showAuthAlert('registerAlert', 'Пользователь с таким логином уже существует', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showAuthAlert('registerAlert', 'Ошибка регистрации. Попробуйте позже.', 'error');
    } finally {
        // Разблокируем кнопку
        registerBtn.disabled = false;
        registerBtn.textContent = 'Зарегистрироваться';
    }
}

// Аутентификация пользователя
async function authenticateUser(username, password) {
    // Получаем зарегистрированных пользователей из localStorage
    const users = getStoredUsers();
    
    // Ищем пользователя
    const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() || 
        u.email.toLowerCase() === username.toLowerCase()
    );
    
    if (!user) {
        return null;
    }
    
    // Проверяем пароль (в реальном приложении должно быть хеширование)
    if (user.password === password) {
        return user;
    }
    
    return null;
}

// Регистрация пользователя
async function registerUser(username, password, email = '') {
    const users = getStoredUsers();
    
    // Проверяем, не занят ли логин
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        return null;
    }
    
    // Проверяем email, если указан
    if (email) {
        const existingEmail = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingEmail) {
            return null;
        }
    }
    
    // Создаем нового пользователя
    const newUser = {
        id: generateUserId(),
        username: username,
        email: email || '',
        password: password, // В реальном приложении должно быть хеширование!
        registeredAt: Date.now(),
        lastLogin: Date.now(),
        isActive: true,
        profile: {
            displayName: username,
            avatar: '',
            status: 'online'
        }
    };
    
    // Сохраняем пользователя
    users.push(newUser);
    localStorage.setItem('quantumUsers', JSON.stringify(users));
    
    return newUser;
}

// Создание сессии пользователя
async function createUserSession(user, rememberMe = false) {
    const session = {
        userId: user.id,
        username: user.username,
        loginTime: Date.now(),
        expires: rememberMe ? Date.now() + AUTH_CONFIG.sessionTimeout : Date.now() + (8 * 60 * 60 * 1000), // 8 часов или 24 часа
        token: generateSessionToken()
    };
    
    currentSession = session;
    isLoggedIn = true;
    
    // Сохраняем сессию
    if (rememberMe) {
        localStorage.setItem('quantumAuthSession', JSON.stringify(session));
    } else {
        sessionStorage.setItem('quantumAuthSession', JSON.stringify(session));
    }
    
    // Обновляем время последнего входа
    updateUserLastLogin(user.id);
    
    console.log('✅ Сессия создана для пользователя:', user.username);
    return session;
}

// Автоматический вход
function autoLogin(session) {
    const users = getStoredUsers();
    const user = users.find(u => u.id === session.userId);
    
    if (user) {
        enterChatWithAuth(user);
    } else {
        // Пользователь не найден, разлогиниваем
        logout();
    }
}

// Вход в чат с аутентификацией
function enterChatWithAuth(user) {
    // Устанавливаем данные пользователя
    currentUser = user.profile.displayName || user.username;
    userId = user.id;
    
    // Обновляем интерфейс
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('chatWrapper').style.display = 'flex';
    
    // Показываем информацию о сессии
    showSessionInfo();
    
    // Инициализируем чат
    initializeChatForAuthUser(user);
}

// Инициализация чата для аутентифицированного пользователя
function initializeChatForAuthUser(user) {
    // Здесь можно добавить дополнительную инициализацию
    console.log('🚀 Инициализация чата для:', user.username);
    
    // Загружаем сообщения и настраиваем онлайн-пользователей
    if (typeof loadMessages === 'function') loadMessages();
    if (typeof setupOnlineUsers === 'function') setupOnlineUsers();
    if (typeof setupTypingIndicator === 'function') setupTypingIndicator();
    if (typeof setupProfiles === 'function') setupProfiles();
    
    // Показываем уведомление
    showNotification(`Добро пожаловать, ${user.username}!`);
}

// Выход из системы
function logout() {
    if (currentSession) {
        // Обновляем статус пользователя
        updateUserStatus(currentSession.userId, 'offline');
    }
    
    // Очищаем сессии
    currentSession = null;
    isLoggedIn = false;
    localStorage.removeItem('quantumAuthSession');
    sessionStorage.removeItem('quantumAuthSession');
    
    // Показываем экран аутентификации
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('chatWrapper').style.display = 'none';
    
    // Очищаем поля формы
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    
    console.log('✅ Выход из системы выполнен');
}

// Восстановление пароля
function handleForgotPassword(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    
    if (!username) {
        showAuthAlert('loginAlert', 'Введите ваш логин или email для восстановления пароля', 'warning');
        return;
    }
    
    // В реальном приложении здесь бы отправлялся email
    showAuthAlert('loginAlert', 'Функция восстановления пароля в разработке', 'warning');
}

// Проверка силы пароля
function checkPasswordStrength() {
    const password = document.getElementById('registerPassword').value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    let text = 'Слабый';
    let color = '#ff4757';
    
    if (password.length >= AUTH_CONFIG.minPasswordLength) {
        strength += 25;
    }
    
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
        strength += 25;
    }
    
    if (password.match(/\d/)) {
        strength += 25;
    }
    
    if (password.match(/[^a-zA-Z\d]/)) {
        strength += 25;
    }
    
    // Устанавливаем цвет и текст в зависимости от силы
    if (strength >= 75) {
        text = 'Сильный';
        color = '#2ed573';
    } else if (strength >= 50) {
        text = 'Средний';
        color = '#ffa502';
    } else if (strength >= 25) {
        text = 'Слабый';
        color = '#ff4757';
    } else {
        text = 'Очень слабый';
        color = '#ff4757';
    }
    
    strengthFill.style.width = strength + '%';
    strengthFill.style.background = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
}

// Показать уведомление аутентификации
function showAuthAlert(alertId, message, type = 'info') {
    const alertElement = document.getElementById(alertId);
    if (!alertElement) return;
    
    alertElement.textContent = message;
    alertElement.className = `auth-alert ${type}`;
    alertElement.style.display = 'block';
    
    // Скрываем уведомление через 5 секунд
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}

// Показать информацию о сессии
function showSessionInfo() {
    const sessionInfo = document.createElement('div');
    sessionInfo.className = 'session-info';
    sessionInfo.innerHTML = `
        <i class="fas fa-user"></i> ${currentSession.username}
        <button onclick="logout()" style="margin-left: 5px; background: none; border: none; color: inherit; cursor: pointer;">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `;
    
    document.body.appendChild(sessionInfo);
}

// Быстрый вход (демо/гость)
function quickLogin(type) {
    let username, password;
    
    switch (type) {
        case 'demo':
            username = 'demo';
            password = 'demo123';
            break;
        case 'guest':
            username = 'Гость_' + Math.floor(Math.random() * 1000);
            password = 'guest123';
            break;
        default:
            return;
    }
    
    // Заполняем форму
    document.getElementById('loginUsername').value = username;
    document.getElementById('loginPassword').value = password;
    
    // Выполняем вход
    handleLogin();
}

// Вспомогательные функции

function getStoredUsers() {
    try {
        return JSON.parse(localStorage.getItem('quantumUsers')) || [];
    } catch (e) {
        return [];
    }
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateSessionToken() {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
}

function updateUserLastLogin(userId) {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].lastLogin = Date.now();
        users[userIndex].profile.status = 'online';
        localStorage.setItem('quantumUsers', JSON.stringify(users));
    }
}

function updateUserStatus(userId, status) {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].profile.status = status;
        localStorage.setItem('quantumUsers', JSON.stringify(users));
    }
}

function showTerms() {
    alert(`
    Условия использования Quantum Messenger:
    
    1. Не распространять спам и вредоносный контент
    2. Уважать других пользователей
    3. Соблюдать законодательство РФ
    4. Администрация вправе блокировать нарушителей
    
    Полная версия правил доступна по запросу.
    `);
}

// Защита от XSS и инъекций
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Экспорт функций для глобального использования
window.authSystem = {
    init: initAuthSystem,
    login: handleLogin,
    register: handleRegister,
    logout: logout,
    quickLogin: quickLogin,
    isLoggedIn: () => isLoggedIn,
    getCurrentUser: () => currentSession
};

// Автоматическая инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthSystem);
} else {
    initAuthSystem();
}