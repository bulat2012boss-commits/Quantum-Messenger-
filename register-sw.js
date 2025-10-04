// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker зарегистрирован: ', registration.scope);
      })
      .catch(function(error) {
        console.log('Ошибка регистрации ServiceWorker: ', error);
      });
  });
}

// Обработка события beforeinstallprompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Предотвращаем автоматическое отображение подсказки
  e.preventDefault();
  // Сохраняем событие для использования позже
  deferredPrompt = e;
  // Показываем кнопку установки
  showInstallPromotion();
});

function showInstallPromotion() {
  // Создаем кнопку установки
  const installBtn = document.createElement('button');
  installBtn.innerHTML = '📱 Установить приложение';
  installBtn.className = 'action-btn';
  installBtn.style.background = 'linear-gradient(to right, #ff9a9e, #fad0c4)';
  installBtn.style.color = '#333';
  installBtn.onclick = installApp;
  
  // Добавляем кнопку в интерфейс
  const userControls = document.querySelector('.user-controls');
  if (userControls) {
    userControls.insertBefore(installBtn, userControls.firstChild);
  }
}

function installApp() {
  if (deferredPrompt) {
    // Показываем подсказку установки
    deferredPrompt.prompt();
    // Ждем ответа пользователя
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Пользователь принял установку');
      } else {
        console.log('Пользователь отклонил установку');
      }
      deferredPrompt = null;
    });
  }
}