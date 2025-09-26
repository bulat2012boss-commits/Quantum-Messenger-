// profile-color.js - Система изменения цвета профиля для Quantum Messenger

class ProfileColorSystem {
    constructor() {
        this.currentUser = '';
        this.userId = '';
        this.userColor = '';
        this.isInitialized = false;
        
        // Палитра доступных цветов
        this.colorPalette = [
            '#4facfe', '#00f2fe', '#a0d2eb', '#7fdbda', '#6a9bd8',
            '#ff6b6b', '#ff9ff3', '#f368e0', '#00d2d3', '#54a0ff',
            '#5f27cd', '#c8d6e5', '#ff9f43', '#ee5253', '#0abde3',
            '#10ac84', '#222f3e', '#feca57', '#48dbfb', '#ff9ff3'
        ];
    }

    // Инициализация системы
    init(currentUser, userId) {
        if (!currentUser || !userId) {
            console.error('ProfileColorSystem: Не указаны currentUser или userId');
            return;
        }

        this.currentUser = currentUser;
        this.userId = userId;
        this.isInitialized = true;

        // Загружаем сохраненный цвет
        this.loadUserColor();
        
        // Создаем интерфейс выбора цвета
        this.createColorPicker();
        
        console.log('ProfileColorSystem инициализирована');
    }

    // Загрузка сохраненного цвета пользователя
    loadUserColor() {
        const savedColor = localStorage.getItem(`quantumUserColor_${this.userId}`);
        
        if (savedColor) {
            this.userColor = savedColor;
        } else {
            // Генерируем случайный цвет из палитры
            this.userColor = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
            this.saveUserColor();
        }
        
        this.applyUserColor();
    }

    // Сохранение цвета пользователя
    saveUserColor() {
        localStorage.setItem(`quantumUserColor_${this.userId}`, this.userColor);
        
        // Сохраняем в базу данных Firebase (если подключена)
        if (typeof database !== 'undefined') {
            database.ref('profiles/' + this.userId).update({
                userColor: this.userColor,
                lastColorChange: Date.now()
            });
        }
    }

    // Применение цвета к интерфейсу
    applyUserColor() {
        if (!this.userColor) return;

        // Применяем цвет к аватару пользователя
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.style.background = this.userColor;
        }

        // Применяем цвет к сообщениям пользователя
        this.colorizeUserMessages();
        
        // Обновляем CSS переменные для дополнительных элементов
        this.updateCSSVariables();
    }

    // Окрашивание сообщений пользователя
    colorizeUserMessages() {
        const userMessages = document.querySelectorAll('.my-message');
        userMessages.forEach(message => {
            message.style.borderLeft = `3px solid ${this.userColor}`;
            message.style.background = `linear-gradient(to right, ${this.userColor}20, ${this.userColor}40)`;
        });
    }

    // Создание интерфейса выбора цвета
    createColorPicker() {
        // Создаем кнопку для открытия палитры цветов
        const colorPickerBtn = document.createElement('div');
        colorPickerBtn.className = 'action-btn';
        colorPickerBtn.id = 'colorPickerBtn';
        colorPickerBtn.innerHTML = '<i class="fas fa-palette"></i> <span>Цвет профиля</span>';
        colorPickerBtn.addEventListener('click', () => this.showColorPickerModal());

        // Добавляем кнопку в панель управления пользователя
        const userControls = document.querySelector('.user-controls');
        if (userControls) {
            userControls.appendChild(colorPickerBtn);
        }

        // Создаем модальное окно выбора цвета
        this.createColorPickerModal();
    }

    // Создание модального окна выбора цвета
    createColorPickerModal() {
        const modalHTML = `
            <div class="modal" id="colorPickerModal">
                <div class="modal-content">
                    <h3>🎨 Выберите цвет профиля</h3>
                    
                    <div class="current-color-preview">
                        <div class="color-preview-box" id="currentColorPreview"></div>
                        <span>Текущий цвет</span>
                    </div>
                    
                    <div class="color-palette-container">
                        <h4>Доступные цвета:</h4>
                        <div class="color-palette" id="colorPalette"></div>
                    </div>
                    
                    <div class="custom-color-section">
                        <h4>Или выберите свой цвет:</h4>
                        <input type="color" id="customColorPicker" value="${this.userColor}">
                        <button class="action-btn" id="applyCustomColorBtn">Применить</button>
                    </div>
                    
                    <div class="color-presets">
                        <h4>Готовые комбинации:</h4>
                        <div class="preset-buttons">
                            <button class="preset-btn" data-preset="blue">Синяя тема</button>
                            <button class="preset-btn" data-preset="green">Зеленая тема</button>
                            <button class="preset-btn" data-preset="purple">Фиолетовая тема</button>
                            <button class="preset-btn" data-preset="sunset">Закатная тема</button>
                        </div>
                    </div>
                    
                    <div class="modal-buttons">
                        <button class="modal-btn secondary" id="closeColorPickerBtn">Закрыть</button>
                        <button class="modal-btn primary" id="saveColorBtn">Сохранить</button>
                    </div>
                </div>
            </div>
        `;

        // Добавляем модальное окно в DOM
        if (!document.getElementById('colorPickerModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            this.setupColorPickerEvents();
        }
    }

    // Настройка событий для палитры цветов
    setupColorPickerEvents() {
        const modal = document.getElementById('colorPickerModal');
        const closeBtn = document.getElementById('closeColorPickerBtn');
        const saveBtn = document.getElementById('saveColorBtn');
        const customColorBtn = this.getElementById('applyCustomColorBtn');
        const presetBtns = document.querySelectorAll('.preset-btn');

        // Закрытие модального окна
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Сохранение цвета
        saveBtn.addEventListener('click', () => {
            this.saveUserColor();
            modal.classList.remove('active');
            this.showNotification('Цвет профиля изменен! 🎨');
        });

        // Применение кастомного цвета
        document.getElementById('applyCustomColorBtn').addEventListener('click', () => {
            const customColor = document.getElementById('customColorPicker').value;
            this.changeColor(customColor);
        });

        // Обработка пресетов
        presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.getAttribute('data-preset');
                this.applyColorPreset(preset);
            });
        });

        // Заполнение палитры цветов
        this.populateColorPalette();

        // Закрытие по клику вне окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Заполнение палитры цветов
    populateColorPalette() {
        const paletteContainer = document.getElementById('colorPalette');
        if (!paletteContainer) return;

        paletteContainer.innerHTML = '';

        this.colorPalette.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorOption.setAttribute('data-color', color);
            
            if (color === this.userColor) {
                colorOption.classList.add('selected');
            }

            colorOption.addEventListener('click', () => {
                this.changeColor(color);
                
                // Сбрасываем выделение у всех вариантов
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Выделяем выбранный вариант
                colorOption.classList.add('selected');
            });

            paletteContainer.appendChild(colorOption);
        });

        // Обновляем превью текущего цвета
        this.updateColorPreview();
    }

    // Смена цвета
    changeColor(newColor) {
        this.userColor = newColor;
        this.applyUserColor();
        this.updateColorPreview();
        
        // Обновляем кастомный пикер цвета
        document.getElementById('customColorPicker').value = newColor;
    }

    // Обновление превью цвета
    updateColorPreview() {
        const preview = document.getElementById('currentColorPreview');
        if (preview) {
            preview.style.backgroundColor = this.userColor;
        }
    }

    // Применение готовых пресетов
    applyColorPreset(preset) {
        const presets = {
            'blue': '#4facfe',
            'green': '#00d2d3', 
            'purple': '#5f27cd',
            'sunset': '#ff9f43'
        };

        if (presets[preset]) {
            this.changeColor(presets[preset]);
        }
    }

    // Показ модального окна выбора цвета
    showColorPickerModal() {
        const modal = document.getElementById('colorPickerModal');
        if (modal) {
            this.updateColorPreview();
            modal.classList.add('active');
        }
    }

    // Обновление CSS переменных
    updateCSSVariables() {
        document.documentElement.style.setProperty('--user-color', this.userColor);
        document.documentElement.style.setProperty('--user-color-light', this.userColor + '40');
        document.documentElement.style.setProperty('--user-color-dark', this.darkenColor(this.userColor, 20));
    }

    // Затемнение цвета
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    // Вспомогательная функция для поиска элементов
    getElementById(id) {
        return document.getElementById(id);
    }

    // Показ уведомлений
    showNotification(message) {
        if (typeof showNotification === 'function') {
            showNotification(message);
        } else {
            alert(message);
        }
    }

    // Получение текущего цвета
    getCurrentColor() {
        return this.userColor;
    }

    // Сброс к цвету по умолчанию
    resetToDefault() {
        const defaultColor = this.colorPalette[0];
        this.changeColor(defaultColor);
        this.saveUserColor();
        this.showNotification('Цвет сброшен к стандартному');
    }
}

// Создаем глобальный экземпляр системы цветов
window.profileColorSystem = new ProfileColorSystem();

// CSS стили для системы цветов
const profileColorStyles = `
    .color-palette-container {
        margin: 20px 0;
    }

    .color-palette {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
        margin: 15px 0;
    }

    .color-option {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.3s ease;
    }

    .color-option:hover {
        transform: scale(1.1);
        border-color: #fff;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    .color-option.selected {
        border-color: #fff;
        transform: scale(1.1);
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
    }

    .current-color-preview {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }

    .color-preview-box {
        width: 50px;
        height: 50px;
        border-radius: 10px;
        border: 2px solid var(--border-color);
    }

    .custom-color-section {
        margin: 20px 0;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
    }

    #customColorPicker {
        width: 100%;
        height: 50px;
        margin: 10px 0;
        border: none;
        background: transparent;
    }

    .color-presets {
        margin: 20px 0;
    }

    .preset-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 10px;
    }

    .preset-btn {
        padding: 10px;
        border: none;
        border-radius: 5px;
        background: var(--action-btn-bg);
        color: var(--text-color);
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .preset-btn:hover {
        transform: translateY(-2px);
        opacity: 0.9;
    }

    @media (max-width: 768px) {
        .color-palette {
            grid-template-columns: repeat(4, 1fr);
        }

        .preset-buttons {
            grid-template-columns: 1fr;
        }
    }
`;

// Добавляем стили в документ
const styleElement = document.createElement('style');
styleElement.textContent = profileColorStyles;
document.head.appendChild(styleElement);

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Ждем немного, чтобы основные скрипты загрузились
    setTimeout(() => {
        const currentUser = localStorage.getItem('quantumUsername');
        const userId = localStorage.getItem('quantumUserId');
        
        if (currentUser && userId) {
            profileColorSystem.init(currentUser, userId);
        }
        
        // Также инициализируем при входе в чат
        const originalEnterChat = window.enterChat;
        if (originalEnterChat) {
            window.enterChat = function() {
                const result = originalEnterChat.apply(this, arguments);
                const currentUser = localStorage.getItem('quantumUsername');
                const userId = localStorage.getItem('quantumUserId');
                
                if (currentUser && userId) {
                    profileColorSystem.init(currentUser, userId);
                }
                
                return result;
            };
        }
    }, 1000);
});
