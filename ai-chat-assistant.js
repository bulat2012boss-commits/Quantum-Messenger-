// ai-chat-assistant.js
// ИИ-АССИСТЕНТ ДЛЯ АНАЛИТИКИ ЧАТА И УМНЫХ ОТВЕТОВ - МОБИЛЬНАЯ ВЕРСИЯ

class AIChatAssistant {
    constructor() {
        this.isEnabled = false;
        this.sentimentAnalysis = true;
        this.topicDetection = true;
        this.smartReplies = true;
        this.chatStats = {};
        this.isMobile = this.detectMobile();
    }

    detectMobile() {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    init() {
        this.createAISettings();
        this.setupEventListeners();
        this.startChatAnalysis();
        this.addTouchOptimizations();
    }

    createAISettings() {
        const aiSettingsHTML = `
            <div class="modal mobile-optimized" id="aiAssistantModal">
                <div class="modal-content mobile-content">
                    <div class="modal-header mobile-header">
                        <h3>🤖 ИИ-Ассистент</h3>
                        <button class="close-btn mobile-close" id="closeAIBtn">&times;</button>
                    </div>
                    
                    <div class="settings-category mobile-category">
                        <h4>📊 Аналитика</h4>
                        <div class="ai-stats mobile-stats" id="aiStats">
                            <div class="stat-item mobile-stat">
                                <span class="stat-label">Активность:</span>
                                <span class="stat-value" id="chatActivity">...</span>
                            </div>
                            <div class="stat-item mobile-stat">
                                <span class="stat-label">Настроение:</span>
                                <span class="stat-value" id="chatMood">...</span>
                            </div>
                            <div class="stat-item mobile-stat">
                                <span class="stat-label">Темы:</span>
                                <span class="stat-value" id="chatTopics">...</span>
                            </div>
                        </div>
                    </div>

                    <div class="settings-category mobile-category">
                        <h4>⚙️ Функции</h4>
                        <div class="mobile-switches">
                            <label class="switch mobile-switch">
                                <input type="checkbox" id="sentimentAnalysisToggle" checked>
                                <span class="slider mobile-slider"></span>
                                <span class="switch-label mobile-label">Анализ настроения</span>
                            </label>
                            
                            <label class="switch mobile-switch">
                                <input type="checkbox" id="topicDetectionToggle" checked>
                                <span class="slider mobile-slider"></span>
                                <span class="switch-label mobile-label">Определение тем</span>
                            </label>
                            
                            <label class="switch mobile-switch">
                                <input type="checkbox" id="smartRepliesToggle" checked>
                                <span class="slider mobile-slider"></span>
                                <span class="switch-label mobile-label">Умные ответы</span>
                            </label>
                        </div>
                    </div>

                    <div class="settings-category mobile-category">
                        <h4>💡 Советы</h4>
                        <div class="ai-recommendations mobile-recommendations" id="aiRecommendations">
                            <div class="recommendation-item mobile-rec-item">
                                <i class="fas fa-lightbulb"></i>
                                <span>Анализирую чат...</span>
                            </div>
                        </div>
                    </div>

                    <div class="modal-buttons mobile-buttons">
                        <button class="modal-btn secondary mobile-btn" id="aiInsightsBtn">Полный отчёт</button>
                        <button class="modal-btn primary mobile-btn" id="quickActionBtn">Быстрый ответ</button>
                    </div>

                    <!-- Быстрые действия для мобильных -->
                    <div class="quick-actions mobile-actions" id="quickActions">
                        <button class="quick-btn" data-action="greeting">👋 Приветствие</button>
                        <button class="quick-btn" data-action="question">❓ Вопрос</button>
                        <button class="quick-btn" data-action="thanks">🙏 Благодарность</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', aiSettingsHTML);
        this.addAIStyles();
    }

    addAIStyles() {
        const styles = `
            /* Мобильная оптимизация */
            .mobile-optimized {
                font-size: 16px !important; /* Предотвращает масштабирование на iOS */
            }

            .mobile-content {
                width: 95% !important;
                max-width: 400px !important;
                margin: 10px auto !important;
                max-height: 90vh !important;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }

            .mobile-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 15px 20px 10px !important;
                border-bottom: 1px solid rgba(255,255,255,0.1) !important;
            }

            .mobile-header h3 {
                margin: 0 !important;
                font-size: 18px !important;
            }

            .mobile-close {
                background: none !important;
                border: none !important;
                color: white !important;
                font-size: 24px !important;
                cursor: pointer !important;
                padding: 0 !important;
                width: 30px !important;
                height: 30px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }

            .mobile-category {
                margin: 15px 0 !important;
                padding: 0 20px !important;
            }

            .mobile-category h4 {
                font-size: 16px !important;
                margin-bottom: 12px !important;
                color: #4facfe !important;
            }

            .mobile-stats {
                background: rgba(255, 255, 255, 0.08) !important;
                padding: 12px !important;
                border-radius: 12px !important;
                margin-bottom: 0 !important;
            }

            .mobile-stat {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                margin-bottom: 10px !important;
                padding-bottom: 10px !important;
                border-bottom: 1px solid rgba(255,255,255,0.05) !important;
                font-size: 14px !important;
            }

            .mobile-stat:last-child {
                margin-bottom: 0 !important;
                border-bottom: none !important;
            }

            .stat-label {
                font-weight: 500 !important;
                opacity: 0.9 !important;
            }

            .stat-value {
                font-weight: bold !important;
                color: #4facfe !important;
                text-align: right !important;
                max-width: 60% !important;
                word-break: break-word !important;
            }

            .mobile-switches {
                display: flex !important;
                flex-direction: column !important;
                gap: 12px !important;
            }

            .mobile-switch {
                display: flex !important;
                align-items: center !important;
                margin-bottom: 0 !important;
                padding: 10px !important;
                background: rgba(255,255,255,0.05) !important;
                border-radius: 10px !important;
                min-height: 44px !important; /* Минимальная высота для тача */
            }

            .mobile-slider {
                width: 44px !important;
                height: 24px !important;
                margin-right: 12px !important;
                flex-shrink: 0 !important;
            }

            .mobile-label {
                font-size: 14px !important;
                flex-grow: 1 !important;
            }

            .mobile-recommendations {
                background: rgba(255, 255, 255, 0.05) !important;
                padding: 15px !important;
                border-radius: 12px !important;
                border-left: 4px solid #4facfe !important;
            }

            .mobile-rec-item {
                display: flex !important;
                align-items: flex-start !important;
                gap: 12px !important;
                margin-bottom: 10px !important;
                font-size: 14px !important;
                line-height: 1.4 !important;
            }

            .mobile-rec-item:last-child {
                margin-bottom: 0 !important;
            }

            .mobile-rec-item i {
                color: #4facfe !important;
                margin-top: 2px !important;
                flex-shrink: 0 !important;
            }

            .mobile-buttons {
                display: flex !important;
                gap: 10px !important;
                padding: 15px 20px !important;
                border-top: 1px solid rgba(255,255,255,0.1) !important;
            }

            .mobile-btn {
                flex: 1 !important;
                padding: 12px 16px !important;
                border: none !important;
                border-radius: 10px !important;
                font-size: 14px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                min-height: 44px !important;
                transition: all 0.2s ease !important;
            }

            .mobile-btn.secondary {
                background: rgba(255,255,255,0.1) !important;
                color: white !important;
            }

            .mobile-btn.primary {
                background: linear-gradient(135deg, #4facfe, #00f2fe) !important;
                color: white !important;
            }

            .mobile-actions {
                display: flex !important;
                gap: 8px !important;
                padding: 0 20px 15px !important;
                flex-wrap: wrap !important;
            }

            .quick-btn {
                flex: 1 !important;
                min-width: 100px !important;
                padding: 10px 12px !important;
                background: rgba(79, 172, 254, 0.2) !important;
                border: 1px solid rgba(79, 172, 254, 0.3) !important;
                border-radius: 8px !important;
                color: #4facfe !important;
                font-size: 12px !important;
                cursor: pointer !important;
                min-height: 40px !important;
                transition: all 0.2s ease !important;
            }

            .quick-btn:active {
                background: rgba(79, 172, 254, 0.4) !important;
                transform: scale(0.98) !important;
            }

            /* Анимации для мобильных */
            @keyframes mobileSlideUp {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .mobile-optimized.active {
                animation: mobileSlideUp 0.3s ease-out !important;
            }

            /* Адаптация под разные размеры экрана */
            @media (max-width: 360px) {
                .mobile-content {
                    width: 98% !important;
                    margin: 5px auto !important;
                }
                
                .mobile-category {
                    padding: 0 15px !important;
                }
                
                .mobile-buttons {
                    padding: 12px 15px !important;
                }
                
                .mobile-actions {
                    padding: 0 15px 12px !important;
                }
                
                .quick-btn {
                    min-width: 80px !important;
                    font-size: 11px !important;
                }
            }

            /* Портретная ориентация */
            @media (max-height: 600px) and (orientation: portrait) {
                .mobile-content {
                    max-height: 85vh !important;
                }
                
                .mobile-category {
                    margin: 10px 0 !important;
                }
            }

            /* Ландшафтная ориентация */
            @media (max-height: 400px) and (orientation: landscape) {
                .mobile-content {
                    max-height: 80vh !important;
                }
                
                .mobile-stats {
                    padding: 8px !important;
                }
                
                .mobile-stat {
                    margin-bottom: 6px !important;
                    padding-bottom: 6px !important;
                    font-size: 13px !important;
                }
            }

            /* Улучшения для iOS */
            @supports (-webkit-touch-callout: none) {
                .mobile-btn, .quick-btn, .mobile-switch {
                    -webkit-tap-highlight-color: transparent;
                }
                
                .mobile-content {
                    padding-bottom: env(safe-area-inset-bottom);
                }
            }

            /* Улучшения для Android */
            @supports not (-webkit-touch-callout: none) {
                .mobile-btn:active, .quick-btn:active {
                    opacity: 0.8;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    addTouchOptimizations() {
        // Улучшения для тач-устройств
        document.addEventListener('touchstart', function() {}, {passive: true});
        
        // Предотвращение масштабирования при двойном тапе
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    setupEventListeners() {
        // Адаптивная кнопка ИИ-ассистента для мобильных
        const aiBtn = document.createElement('div');
        aiBtn.className = this.isMobile ? 'mobile-ai-btn action-btn' : 'action-btn';
        aiBtn.innerHTML = this.isMobile ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-robot"></i> <span>ИИ Анализ</span>';
        aiBtn.onclick = () => this.openAIModal();
        
        const userControls = document.querySelector('.user-controls');
        if (userControls) {
            userControls.insertBefore(aiBtn, userControls.querySelector('.logout-btn'));
        }

        // Обработчики для мобильных переключателей
        document.getElementById('sentimentAnalysisToggle').addEventListener('change', (e) => {
            this.sentimentAnalysis = e.target.checked;
            this.showToast(`Анализ настроения ${e.target.checked ? 'включён' : 'выключен'}`);
        });

        document.getElementById('topicDetectionToggle').addEventListener('change', (e) => {
            this.topicDetection = e.target.checked;
            this.showToast(`Определение тем ${e.target.checked ? 'включено' : 'выключено'}`);
        });

        document.getElementById('smartRepliesToggle').addEventListener('change', (e) => {
            this.smartReplies = e.target.checked;
            this.showToast(`Умные ответы ${e.target.checked ? 'включены' : 'выключены'}`);
        });

        document.getElementById('closeAIBtn').addEventListener('click', () => {
            this.closeAIModal();
        });

        document.getElementById('aiInsightsBtn').addEventListener('click', () => {
            this.generateFullReport();
        });

        document.getElementById('quickActionBtn').addEventListener('click', () => {
            this.showQuickReplySuggestions();
        });

        // Быстрые действия
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });

        // Закрытие по клику вне модального окна
        document.getElementById('aiAssistantModal').addEventListener('click', (e) => {
            if (e.target.id === 'aiAssistantModal') {
                this.closeAIModal();
            }
        });

        // Обработка клавиши Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAIModal();
            }
        });
    }

    openAIModal() {
        const modal = document.getElementById('aiAssistantModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
        this.updateAIStats();
        
        // Фокус на первом интерактивном элементе для доступности
        setTimeout(() => {
            document.getElementById('sentimentAnalysisToggle').focus();
        }, 300);
    }

    closeAIModal() {
        const modal = document.getElementById('aiAssistantModal');
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Восстанавливаем скролл
    }

    showToast(message) {
        // Создаем тост для мобильных устройств
        const toast = document.createElement('div');
        toast.className = 'mobile-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out;
            max-width: 80%;
            text-align: center;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 2000);
    }

    startChatAnalysis() {
        // Анализируем сообщения в реальном времени
        if (typeof database !== 'undefined') {
            database.ref('messages').orderByChild('timestamp').limitToLast(50).on('value', (snapshot) => {
                if (!snapshot.exists()) return;

                const messages = [];
                snapshot.forEach((childSnapshot) => {
                    const message = childSnapshot.val();
                    if (message.text && !message.isSystem && message.type !== 'gift') {
                        try {
                            const decryptedText = typeof decryptMessage === 'function' ? 
                                decryptMessage(message.text) : message.text;
                            messages.push({
                                text: decryptedText,
                                user: message.name,
                                timestamp: message.timestamp
                            });
                        } catch (e) {
                            console.log('Не удалось расшифровать сообщение для анализа');
                        }
                    }
                });

                this.analyzeChat(messages);
            });
        } else {
            // Fallback для демо-режима
            console.log('База данных не доступна, используется демо-режим анализа');
            this.demoChatAnalysis();
        }
    }

    demoChatAnalysis() {
        // Демо-данные для тестирования на мобильных
        const demoMessages = [
            { text: "Привет всем! Как дела?", user: "User1", timestamp: Date.now() - 100000 },
            { text: "Всё отлично, спасибо! А у тебя?", user: "User2", timestamp: Date.now() - 80000 },
            { text: "Тоже хорошо, сегодня прекрасная погода", user: "User1", timestamp: Date.now() - 60000 },
            { text: "Да, солнце светит просто супер!", user: "User3", timestamp: Date.now() - 40000 },
            { text: "Что планируете на выходные?", user: "User2", timestamp: Date.now() - 20000 }
        ];

        setInterval(() => {
            this.analyzeChat(demoMessages);
        }, 10000);
    }

    analyzeChat(messages) {
        if (messages.length === 0) return;

        // Анализ активности
        const now = Date.now();
        const lastHour = now - (60 * 60 * 1000);
        const recentMessages = messages.filter(m => m.timestamp > lastHour);
        const activityLevel = recentMessages.length;

        // Анализ настроения
        const positiveWords = ['хорошо', 'отлично', 'спасибо', 'нравится', 'люблю', 'прекрасно', 'супер', 'класс', 'замечательно', 'рад'];
        const negativeWords = ['плохо', 'ужасно', 'ненавижу', 'злой', 'грустно', 'разочарован', 'проблема', 'сложно'];
        
        let positiveCount = 0;
        let negativeCount = 0;

        messages.forEach(message => {
            const text = message.text.toLowerCase();
            positiveWords.forEach(word => {
                if (text.includes(word)) positiveCount++;
            });
            negativeWords.forEach(word => {
                if (text.includes(word)) negativeCount++;
            });
        });

        const mood = positiveCount > negativeCount ? '😊 Позитивный' : 
                    negativeCount > positiveCount ? '😞 Негативный' : '😐 Нейтральный';

        // Определение популярных тем
        const commonWords = this.extractTopics(messages);

        // Анализ пользователей
        const users = {};
        messages.forEach(message => {
            users[message.user] = (users[message.user] || 0) + 1;
        });

        // Обновляем статистику
        this.chatStats = {
            activity: activityLevel,
            mood: mood,
            topics: commonWords.slice(0, 3),
            messageCount: messages.length,
            positive: positiveCount,
            negative: negativeCount,
            users: users,
            activeUsers: Object.keys(users).length
        };

        this.updateAIStats();
        this.generateRecommendations();
    }

    extractTopics(messages) {
        const stopWords = ['и', 'в', 'на', 'с', 'по', 'о', 'у', 'к', 'но', 'а', 'или', 'что', 'это', 'как', 'для', 'то', 'же', 'все', 'так'];
        const wordCount = {};

        messages.forEach(message => {
            const words = message.text.toLowerCase()
                .replace(/[^\w\sа-яё]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 2 && !stopWords.includes(word));

            words.forEach(word => {
                wordCount[word] = (wordCount[word] || 0) + 1;
            });
        });

        return Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
    }

    updateAIStats() {
        if (!this.chatStats.activity) return;

        const activityElem = document.getElementById('chatActivity');
        const moodElem = document.getElementById('chatMood');
        const topicsElem = document.getElementById('chatTopics');

        if (activityElem) {
            activityElem.textContent = `${this.chatStats.activity} сообщ./час`;
        }

        if (moodElem) {
            moodElem.textContent = this.chatStats.mood;
        }

        if (topicsElem) {
            topicsElem.textContent = this.chatStats.topics.join(', ') || 'не определены';
        }
    }

    generateRecommendations() {
        const recommendations = document.getElementById('aiRecommendations');
        if (!recommendations) return;

        const recs = [];

        if (this.chatStats.activity < 3) {
            recs.push('💬 Чат немного тихий. Попробуйте начать интересную тему!');
        }

        if (this.chatStats.negative > this.chatStats.positive) {
            recs.push('🤗 Настроение нейтральное. Добавьте позитива!');
        } else if (this.chatStats.positive > this.chatStats.negative * 2) {
            recs.push('🌟 Отличная атмосфера! Продолжайте в том же духе!');
        }

        if (this.chatStats.topics.length > 0) {
            recs.push(`🎯 Тема: "${this.chatStats.topics[0]}". Развивайте её!`);
        }

        if (this.chatStats.activeUsers < 3) {
            recs.push('👥 Мало участников. Привлеките больше людей в обсуждение!');
        }

        if (recs.length === 0) {
            recs.push('💫 Чат активен и сбалансирован. Отличная работа!');
        }

        recommendations.innerHTML = recs.map(rec => 
            `<div class="recommendation-item mobile-rec-item">${rec}</div>`
        ).join('');
    }

    generateFullReport() {
        const report = `
🤖 ОТЧЁТ ИИ-АССИСТЕНТА

📊 Статистика чата:
• Сообщений за час: ${this.chatStats.activity || 0}
• Общее настроение: ${this.chatStats.mood || 'Не определено'}
• Активных пользователей: ${this.chatStats.activeUsers || 0}

🎯 Популярные темы:
${(this.chatStats.topics && this.chatStats.topics.length > 0) ? 
    this.chatStats.topics.map(topic => `• ${topic}`).join('\n') : '• Темы не обнаружены'}

💡 Рекомендации:
${this.chatStats.activity < 5 ? '• Задайте открытый вопрос для активизации чата\\n' : ''}
${this.chatStats.negative > this.chatStats.positive ? '• Поделитесь позитивной новостью или шуткой\\n' : ''}
${this.chatStats.activeUsers < 3 ? '• Упомяните других пользователей для вовлечения\\n' : ''}

📈 Уровень активности: ${this.chatStats.activity > 15 ? 'Высокий' : this.chatStats.activity > 8 ? 'Средний' : 'Низкий'}
        `.trim();

        // Используем alert для мобильных (просто и работает везде)
        alert(report);
    }

    showQuickReplySuggestions() {
        const suggestions = [
            "Отличная мысль! 💫",
            "Интересно, расскажите подробнее? 🤔",
            "Полностью согласен! 👍",
            "Как насчёт обсудить это? 💬",
            "Спасибо за информацию! 🙏"
        ];

        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        this.showToast(`Предложение: "${randomSuggestion}"`);
        
        // Копируем в буфер обмена если возможно
        if (navigator.clipboard) {
            navigator.clipboard.writeText(randomSuggestion).then(() => {
                console.log('Текст скопирован в буфер обмена');
            });
        }
    }

    handleQuickAction(action) {
        const actions = {
            greeting: "Привет! Рад вас видеть в чате! 👋",
            question: "Интересный вопрос! У кого-то есть мысли по этому поводу? 💭",
            thanks: "Всегда рад помочь! Обращайтесь! 😊"
        };

        const message = actions[action] || "Отличная идея! 💫";
        this.showToast(`Готово: "${message}"`);
        
        // Можно интегрировать с отправкой сообщений
        if (typeof sendMessage === 'function') {
            sendMessage(message);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(message);
            this.showToast("Сообщение скопировано! 📋");
        }
    }

    // Умные ответы на основе контекста
    generateSmartReply(messageText) {
        if (!this.smartReplies) return null;

        const context = this.analyzeMessageContext(messageText);
        
        const replyTemplates = {
            question: [
                "Интересный вопрос! Что вы сами думаете?",
                "Хорошо, что спросили. Может, обсудим это?",
                "Отличный вопрос! У кого-то есть мысли?"
            ],
            greeting: [
                "Привет! Как твои дела?",
                "Здравствуй! Рад тебя видеть!",
                "Приветствую! Что нового?"
            ],
            gratitude: [
                "Всегда рад помочь!",
                "Не стоит благодарности!",
                "Обращайся! 😊"
            ],
            complaint: [
                "Понимаю твои чувства. Может, обсудим решение?",
                "Жаль это слышать. Чем могу помочь?",
                "Понимаю frustration. Давай разберёмся вместе."
            ]
        };

        const category = this.categorizeMessage(messageText);
        const replies = replyTemplates[category] || ["Интересно! Продолжайте..."];
        
        return replies[Math.floor(Math.random() * replies.length)];
    }

    categorizeMessage(text) {
        if (!text) return 'neutral';
        
        text = text.toLowerCase();
        
        if (text.includes('?') || text.includes('как') || text.includes('почему') || text.includes('что')) return 'question';
        if (text.includes('привет') || text.includes('здравствуй') || text.includes('добрый') || text.includes('hi')) return 'greeting';
        if (text.includes('спасибо') || text.includes('благодарю') || text.includes('thanks')) return 'gratitude';
        if (text.includes('плохо') || text.includes('жалоба') || text.includes('problem') || text.includes('не работает')) return 'complaint';
        
        return 'neutral';
    }

    analyzeMessageContext(text) {
        return {
            length: text.length,
            hasQuestion: text.includes('?'),
            sentiment: this.analyzeSentiment(text),
            urgency: text.includes('!') ? 'high' : 'normal'
        };
    }

    analyzeSentiment(text) {
        if (!text) return 'neutral';
        
        const positive = ['хорош', 'отличн', 'прекрасн', 'любл', 'нравится', 'супер', 'класс', 'замечательн', 'рад', 'восхитительн'];
        const negative = ['плох', 'ужасн', 'ненавиж', 'зло', 'грустн', 'разочарован', 'сложн', 'трудн', 'проблем'];
        
        text = text.toLowerCase();
        let score = 0;
        
        positive.forEach(word => { if (text.includes(word)) score++; });
        negative.forEach(word => { if (text.includes(word)) score--; });
        
        return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
    }
}

// Инициализация ИИ-ассистента с улучшенной мобильной поддержкой
let aiAssistant;

function initAIAssistant() {
    // Ждем полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            aiAssistant = new AIChatAssistant();
            // Задержка для мобильных устройств
            setTimeout(() => aiAssistant.init(), 1000);
        });
    } else {
        aiAssistant = new AIChatAssistant();
        setTimeout(() => aiAssistant.init(), 1000);
    }
}

// Автоматическая инициализация
initAIAssistant();

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIChatAssistant;
}