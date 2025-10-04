// shared-music.js - Улучшенная система совместного прослушивания музыки для Quantum Messenger

class SharedMusicPlayer {
    constructor() {
        this.isPlaying = false;
        this.currentTrack = null;
        this.audioElement = null;
        this.roomId = null;
        this.isHost = false;
        this.syncInterval = null;
        this.customTracks = []; // Массив для пользовательских треков
        this.uploadedFiles = new Map(); // Хранилище загруженных файлов
        
        this.initializeMusicPlayer();
    }
    
    initializeMusicPlayer() {
        this.createMusicUI();
        this.setupEventListeners();
        this.loadCustomTracks(); // Загружаем сохраненные треки
    }
    
    createMusicUI() {
        // Создаем кнопку для доступа к музыкальному плееру
        const musicBtn = document.createElement('div');
        musicBtn.className = 'action-btn';
        musicBtn.id = 'musicPlayerBtn';
        musicBtn.innerHTML = '<i class="fas fa-music"></i> <span>Музыка</span>';
        
        // Добавляем кнопку в интерфейс
        const userControls = document.querySelector('.user-controls');
        if (userControls) {
            userControls.insertBefore(musicBtn, userControls.querySelector('.logout-btn'));
        }
        
        // Создаем модальное окно музыкального плеера
        const musicModal = document.createElement('div');
        musicModal.className = 'modal';
        musicModal.id = 'musicModal';
        musicModal.innerHTML = `
            <div class="modal-content">
                <h3>🎵 Совместное прослушивание музыки</h3>
                
                <div class="music-room-controls">
                    <button class="action-btn" id="createMusicRoomBtn">
                        <i class="fas fa-plus"></i> Создать комнату
                    </button>
                    <button class="action-btn" id="joinMusicRoomBtn">
                        <i class="fas fa-sign-in-alt"></i> Присоединиться
                    </button>
                </div>
                
                <div class="music-room-info" id="musicRoomInfo" style="display: none;">
                    <h4>Текущая комната: <span id="currentRoomName">Неизвестно</span></h4>
                    <div class="room-users" id="roomUsersList"></div>
                </div>
                
                <div class="music-player" id="musicPlayer" style="display: none;">
                    <div class="now-playing">
                        <div class="track-info">
                            <div class="track-title" id="currentTrackTitle">Выберите трек</div>
                            <div class="track-artist" id="currentTrackArtist">-</div>
                        </div>
                        
                        <div class="player-controls">
                            <button class="music-control-btn" id="prevTrackBtn">
                                <i class="fas fa-step-backward"></i>
                            </button>
                            <button class="music-control-btn play-pause" id="playPauseBtn">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="music-control-btn" id="nextTrackBtn">
                                <i class="fas fa-step-forward"></i>
                            </button>
                        </div>
                        
                        <div class="progress-container">
                            <div class="progress-bar" id="musicProgressBar">
                                <div class="progress" id="musicProgress"></div>
                            </div>
                            <div class="time-display">
                                <span id="currentTime">0:00</span> / 
                                <span id="totalTime">0:00</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="music-tabs">
                        <button class="tab-btn active" data-tab="library">Библиотека</button>
                        <button class="tab-btn" data-tab="upload">Мои треки</button>
                    </div>
                    
                    <div class="tab-content active" id="libraryTab">
                        <div class="playlist">
                            <h5>Доступные треки:</h5>
                            <div class="track-list" id="trackList">
                                <div class="track-item" data-url="https://cdn.pixabay.com/download/audio/2022/02/22/audio_d17187f637.mp3?filename=chill-abstract-intention-12099.mp3" data-title="Chill Abstract" data-artist="Pixabay">
                                    Chill Abstract
                                </div>
                                <div class="track-item" data-url="https://cdn.pixabay.com/download/audio/2021/10/25/audio_0d0d0be55a.mp3?filename=once-in-paris-168895.mp3" data-title="Once in Paris" data-artist="Pixabay">
                                    Once in Paris
                                </div>
                                <div class="track-item" data-url="https://cdn.pixabay.com/download/audio/2022/03/15/audio_3f0d4e8c14.mp3?filename=good-night-160166.mp3" data-title="Good Night" data-artist="Pixabay">
                                    Good Night
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="uploadTab">
                        <div class="upload-section">
                            <div class="upload-area" id="uploadArea">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Перетащите сюда аудиофайлы или нажмите для выбора</p>
                                <input type="file" id="fileInput" accept="audio/*" multiple style="display: none;">
                                <button class="action-btn" id="selectFilesBtn">
                                    <i class="fas fa-folder-open"></i> Выбрать файлы
                                </button>
                            </div>
                            <div class="uploaded-tracks">
                                <h5>Мои загруженные треки:</h5>
                                <div class="track-list" id="customTrackList">
                                    <!-- Сюда добавляются пользовательские треки -->
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="volume-control">
                        <i class="fas fa-volume-down"></i>
                        <input type="range" id="volumeSlider" min="0" max="100" value="50">
                        <i class="fas fa-volume-up"></i>
                    </div>
                </div>
                
                <div class="modal-buttons">
                    <button class="modal-btn secondary" id="closeMusicBtn">Закрыть</button>
                    <button class="modal-btn primary" id="leaveRoomBtn" style="display: none;">Покинуть комнату</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(musicModal);
        this.addMusicStyles();
    }
    
    addMusicStyles() {
        const styles = `
            .music-room-controls {
                display: flex;
                gap: 10px;
                margin: 15px 0;
                justify-content: center;
            }
            
            .music-player {
                margin-top: 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 15px;
            }
            
            .now-playing {
                text-align: center;
                margin-bottom: 15px;
            }
            
            .track-info {
                margin-bottom: 15px;
            }
            
            .track-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .track-artist {
                font-size: 14px;
                opacity: 0.8;
            }
            
            .player-controls {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin: 15px 0;
            }
            
            .music-control-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                background: linear-gradient(to right, #4facfe, #00f2fe);
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                transition: transform 0.2s;
            }
            
            .music-control-btn:hover {
                transform: scale(1.1);
            }
            
            .play-pause {
                width: 60px;
                height: 60px;
                font-size: 24px;
            }
            
            .progress-container {
                margin: 15px 0;
            }
            
            .progress-bar {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 3px;
                overflow: hidden;
                cursor: pointer;
            }
            
            .progress {
                height: 100%;
                background: linear-gradient(to right, #4facfe, #00f2fe);
                width: 0%;
                transition: width 0.1s;
            }
            
            .time-display {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                margin-top: 5px;
                opacity: 0.7;
            }
            
            .music-tabs {
                display: flex;
                margin: 15px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .tab-btn {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                padding: 10px 20px;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.3s;
            }
            
            .tab-btn.active {
                color: #4facfe;
                border-bottom-color: #4facfe;
            }
            
            .tab-btn:hover {
                color: #00f2fe;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .playlist {
                margin: 15px 0;
            }
            
            .playlist h5 {
                margin-bottom: 10px;
                color: #a0d2eb;
            }
            
            .track-list {
                max-height: 150px;
                overflow-y: auto;
            }
            
            .track-item {
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                margin: 5px 0;
                border-radius: 5px;
                cursor: pointer;
                transition: background 0.2s;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .track-item:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .track-item.playing {
                background: rgba(79, 172, 254, 0.3);
                border-left: 3px solid #4facfe;
            }
            
            .track-actions {
                display: flex;
                gap: 5px;
            }
            
            .track-action-btn {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                padding: 5px;
                border-radius: 3px;
                transition: all 0.2s;
            }
            
            .track-action-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #ff6b6b;
            }
            
            .upload-section {
                margin: 15px 0;
            }
            
            .upload-area {
                border: 2px dashed rgba(255, 255, 255, 0.3);
                border-radius: 10px;
                padding: 30px;
                text-align: center;
                margin-bottom: 20px;
                transition: all 0.3s;
                cursor: pointer;
            }
            
            .upload-area:hover {
                border-color: #4facfe;
                background: rgba(79, 172, 254, 0.1);
            }
            
            .upload-area.dragover {
                border-color: #00f2fe;
                background: rgba(0, 242, 254, 0.2);
            }
            
            .upload-area i {
                font-size: 48px;
                margin-bottom: 15px;
                color: #4facfe;
            }
            
            .upload-area p {
                margin-bottom: 15px;
                opacity: 0.8;
            }
            
            .volume-control {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 15px;
            }
            
            #volumeSlider {
                flex: 1;
                height: 5px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 5px;
                outline: none;
            }
            
            .room-users {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 10px;
            }
            
            .room-user {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 5px 10px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                font-size: 12px;
            }
            
            .room-user.host::after {
                content: "👑";
                margin-left: 5px;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    setupEventListeners() {
        // Открытие/закрытие модального окна
        document.getElementById('musicPlayerBtn').addEventListener('click', () => {
            document.getElementById('musicModal').classList.add('active');
        });
        
        document.getElementById('closeMusicBtn').addEventListener('click', () => {
            document.getElementById('musicModal').classList.remove('active');
        });
        
        // Создание комнаты
        document.getElementById('createMusicRoomBtn').addEventListener('click', () => {
            this.createMusicRoom();
        });
        
        // Присоединение к комнате
        document.getElementById('joinMusicRoomBtn').addEventListener('click', () => {
            this.joinMusicRoom();
        });
        
        // Покидание комнаты
        document.getElementById('leaveRoomBtn').addEventListener('click', () => {
            this.leaveMusicRoom();
        });
        
        // Управление плеером
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        document.getElementById('prevTrackBtn').addEventListener('click', () => {
            this.previousTrack();
        });
        
        document.getElementById('nextTrackBtn').addEventListener('click', () => {
            this.nextTrack();
        });
        
        // Выбор трека из плейлиста
        document.querySelectorAll('.track-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('track-action-btn')) {
                    this.selectTrack(item);
                }
            });
        });
        
        // Контроль громкости
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.setVolume(e.target.value / 100);
        });
        
        // Прогресс трека
        document.getElementById('musicProgressBar').addEventListener('click', (e) => {
            this.seekTrack(e);
        });
        
        // Переключение вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });
        
        // Загрузка файлов
        document.getElementById('selectFilesBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
        
        // Drag and drop
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });
        
        uploadArea.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
    }
    
    switchTab(tabName) {
        // Деактивируем все вкладки
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Активируем выбранную вкладку
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }
    
    handleFileSelect(files) {
        if (files.length === 0) return;
        
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('audio/')) {
                showNotification(`Файл "${file.name}" не является аудиофайлом`, 'error');
                return;
            }
            
            // Создаем объект URL для файла
            const fileUrl = URL.createObjectURL(file);
            
            // Создаем пользовательский трек
            const customTrack = {
                id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                url: fileUrl,
                title: file.name.replace(/\.[^/.]+$/, ""), // Убираем расширение
                artist: 'Пользователь',
                isCustom: true,
                file: file
            };
            
            this.customTracks.push(customTrack);
            this.uploadedFiles.set(customTrack.id, customTrack);
            this.addCustomTrackToUI(customTrack);
        });
        
        this.saveCustomTracks();
        showNotification(`Загружено ${files.length} трек(ов)`);
    }
    
    addCustomTrackToUI(track) {
        const customTrackList = document.getElementById('customTrackList');
        const trackElement = document.createElement('div');
        trackElement.className = 'track-item';
        trackElement.dataset.url = track.url;
        trackElement.dataset.title = track.title;
        trackElement.dataset.artist = track.artist;
        trackElement.dataset.id = track.id;
        
        trackElement.innerHTML = `
            <div class="track-info">
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
            <div class="track-actions">
                <button class="track-action-btn delete-track" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Добавляем обработчик для удаления
        trackElement.querySelector('.delete-track').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteCustomTrack(track.id, trackElement);
        });
        
        // Добавляем обработчик для выбора трека
        trackElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('track-action-btn')) {
                this.selectTrack(trackElement);
            }
        });
        
        customTrackList.appendChild(trackElement);
    }
    
    deleteCustomTrack(trackId, trackElement) {
        // Удаляем из массива
        this.customTracks = this.customTracks.filter(track => track.id !== trackId);
        
        // Освобождаем объект URL
        const track = this.uploadedFiles.get(trackId);
        if (track && track.url.startsWith('blob:')) {
            URL.revokeObjectURL(track.url);
        }
        
        // Удаляем из хранилища
        this.uploadedFiles.delete(trackId);
        
        // Удаляем из UI
        trackElement.remove();
        
        // Сохраняем изменения
        this.saveCustomTracks();
        
        showNotification('Трек удален');
    }
    
    saveCustomTracks() {
        // Сохраняем только информацию о треках, без файлов
        const tracksToSave = this.customTracks.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.artist,
            isCustom: true
        }));
        
        localStorage.setItem('quantum_messenger_custom_tracks', JSON.stringify(tracksToSave));
    }
    
    loadCustomTracks() {
        const savedTracks = localStorage.getItem('quantum_messenger_custom_tracks');
        if (savedTracks) {
            try {
                const tracks = JSON.parse(savedTracks);
                tracks.forEach(track => {
                    // Восстанавливаем только информацию, файлы нужно загружать заново
                    this.customTracks.push(track);
                    this.addCustomTrackToUI(track);
                });
            } catch (e) {
                console.error('Ошибка загрузки пользовательских треков:', e);
            }
        }
    }
    
    createMusicRoom() {
        this.roomId = 'music_room_' + Date.now();
        this.isHost = true;
        
        // Создаем комнату в базе данных
        database.ref('musicRooms/' + this.roomId).set({
            host: userId,
            hostName: currentUser,
            createdAt: Date.now(),
            currentTrack: null,
            isPlaying: false,
            currentTime: 0,
            users: {
                [userId]: {
                    name: currentUser,
                    joinedAt: Date.now()
                }
            }
        });
        
        this.setupRoomListeners();
        this.showMusicPlayer();
        this.updateRoomInfo();
        
        showNotification("Музыкальная комната создана! Пригласите друзей. Код комнаты: " + this.roomId);
    }
    
    joinMusicRoom() {
        const roomCode = prompt("Введите код комнаты:");
        if (!roomCode) return;
        
        this.roomId = roomCode;
        this.isHost = false;
        
        // Проверяем существование комнаты
        database.ref('musicRooms/' + this.roomId).once('value').then(snapshot => {
            if (snapshot.exists()) {
                // Присоединяемся к комнате
                database.ref('musicRooms/' + this.roomId + '/users/' + userId).set({
                    name: currentUser,
                    joinedAt: Date.now()
                });
                
                this.setupRoomListeners();
                this.showMusicPlayer();
                this.updateRoomInfo();
                
                showNotification("Вы присоединились к музыкальной комнате!");
            } else {
                showNotification("Комната не найдена", 'error');
            }
        });
    }
    
    leaveMusicRoom() {
        if (this.roomId) {
            // Удаляем пользователя из комнаты
            database.ref('musicRooms/' + this.roomId + '/users/' + userId).remove();
            
            // Если это хост и в комнате больше нет пользователей, удаляем комнату
            if (this.isHost) {
                database.ref('musicRooms/' + this.roomId + '/users').once('value').then(snapshot => {
                    if (!snapshot.exists() || Object.keys(snapshot.val()).length === 0) {
                        database.ref('musicRooms/' + this.roomId).remove();
                    }
                });
            }
            
            this.cleanup();
            this.hideMusicPlayer();
        }
    }
    
    setupRoomListeners() {
        // Слушаем изменения в комнате
        database.ref('musicRooms/' + this.roomId).on('value', (snapshot) => {
            const roomData = snapshot.val();
            if (!roomData) {
                this.cleanup();
                showNotification("Комната была удалена", 'warning');
                return;
            }
            
            this.updateRoomInfo();
            
            // Синхронизация воспроизведения (только для не-хостов)
            if (!this.isHost && roomData.currentTrack) {
                this.syncWithHost(roomData);
            }
        });
    }
    
    syncWithHost(roomData) {
        if (roomData.currentTrack !== this.currentTrack?.url) {
            this.loadTrack(roomData.currentTrack);
        }
        
        if (roomData.isPlaying !== this.isPlaying) {
            roomData.isPlaying ? this.play() : this.pause();
        }
        
        // Синхронизация времени воспроизведения (с небольшой задержкой)
        if (this.audioElement && Math.abs(this.audioElement.currentTime - roomData.currentTime) > 2) {
            this.audioElement.currentTime = roomData.currentTime;
        }
    }
    
    updateRoomInfo() {
        database.ref('musicRooms/' + this.roomId + '/users').once('value').then(snapshot => {
            const users = snapshot.val();
            if (!users) return;
            
            const usersList = document.getElementById('roomUsersList');
            usersList.innerHTML = '';
            
            Object.keys(users).forEach(userId => {
                const user = users[userId];
                const userElement = document.createElement('div');
                userElement.className = 'room-user';
                if (userId === this.getRoomHost()) {
                    userElement.classList.add('host');
                }
                userElement.textContent = user.name;
                usersList.appendChild(userElement);
            });
            
            document.getElementById('currentRoomName').textContent = this.roomId;
            document.getElementById('musicRoomInfo').style.display = 'block';
            document.getElementById('leaveRoomBtn').style.display = 'block';
        });
    }
    
    getRoomHost() {
        // В реальном приложении здесь бы получали хост комнаты из базы данных
        return this.isHost ? userId : null;
    }
    
    showMusicPlayer() {
        document.getElementById('musicPlayer').style.display = 'block';
        document.querySelector('.music-room-controls').style.display = 'none';
    }
    
    hideMusicPlayer() {
        document.getElementById('musicPlayer').style.display = 'none';
        document.querySelector('.music-room-controls').style.display = 'flex';
        document.getElementById('musicRoomInfo').style.display = 'none';
        document.getElementById('leaveRoomBtn').style.display = 'none';
    }
    
    selectTrack(trackElement) {
        const url = trackElement.getAttribute('data-url');
        const title = trackElement.getAttribute('data-title');
        const artist = trackElement.getAttribute('data-artist');
        const trackId = trackElement.getAttribute('data-id');
        
        this.currentTrack = { url, title, artist, id: trackId };
        
        // Обновляем интерфейс
        document.getElementById('currentTrackTitle').textContent = title;
        document.getElementById('currentTrackArtist').textContent = artist;
        
        // Убираем выделение со всех треков и добавляем к выбранному
        document.querySelectorAll('.track-item').forEach(item => {
            item.classList.remove('playing');
        });
        trackElement.classList.add('playing');
        
        // Загружаем и воспроизводим трек
        this.loadTrack(url);
        
        // Если мы хост, обновляем информацию в комнате
        if (this.isHost && this.roomId) {
            database.ref('musicRooms/' + this.roomId).update({
                currentTrack: url,
                isPlaying: true,
                currentTime: 0
            });
        }
    }
    
    loadTrack(url) {
        if (!this.audioElement) {
            this.audioElement = new Audio();
            this.setupAudioEvents();
        }
        
        this.audioElement.src = url;
        this.audioElement.load();
    }
    
    setupAudioEvents() {
        this.audioElement.addEventListener('loadedmetadata', () => {
            this.updateTimeDisplay();
        });
        
        this.audioElement.addEventListener('timeupdate', () => {
            this.updateProgress();
            this.updateTimeDisplay();
            
            // Синхронизация с комнатой (только для хоста)
            if (this.isHost && this.roomId && this.isPlaying) {
                database.ref('musicRooms/' + this.roomId).update({
                    currentTime: this.audioElement.currentTime
                });
            }
        });
        
        this.audioElement.addEventListener('ended', () => {
            this.nextTrack();
        });
    }
    
    play() {
        if (this.audioElement) {
            this.audioElement.play().then(() => {
                this.isPlaying = true;
                this.updatePlayButton();
                
                if (this.isHost && this.roomId) {
                    database.ref('musicRooms/' + this.roomId).update({
                        isPlaying: true
                    });
                }
            }).catch(error => {
                console.error("Ошибка воспроизведения:", error);
                showNotification("Ошибка воспроизведения аудио", 'error');
            });
        }
    }
    
    pause() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.isPlaying = false;
            this.updatePlayButton();
            
            if (this.isHost && this.roomId) {
                database.ref('musicRooms/' + this.roomId).update({
                    isPlaying: false
                });
            }
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    previousTrack() {
        const allTracks = [
            ...document.querySelectorAll('#trackList .track-item'),
            ...document.querySelectorAll('#customTrackList .track-item')
        ];
        
        const currentIndex = allTracks.findIndex(track => 
            track.classList.contains('playing')
        );
        
        if (currentIndex > 0) {
            this.selectTrack(allTracks[currentIndex - 1]);
        }
    }
    
    nextTrack() {
        const allTracks = [
            ...document.querySelectorAll('#trackList .track-item'),
            ...document.querySelectorAll('#customTrackList .track-item')
        ];
        
        const currentIndex = allTracks.findIndex(track => 
            track.classList.contains('playing')
        );
        
        if (currentIndex < allTracks.length - 1) {
            this.selectTrack(allTracks[currentIndex + 1]);
        }
    }
    
    setVolume(volume) {
        if (this.audioElement) {
            this.audioElement.volume = volume;
        }
    }
    
    seekTrack(event) {
        if (!this.audioElement) return;
        
        const progressBar = document.getElementById('musicProgressBar');
        const clickPosition = event.offsetX;
        const progressBarWidth = progressBar.offsetWidth;
        const seekTime = (clickPosition / progressBarWidth) * this.audioElement.duration;
        
        this.audioElement.currentTime = seekTime;
    }
    
    updateProgress() {
        if (!this.audioElement) return;
        
        const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
        document.getElementById('musicProgress').style.width = progress + '%';
    }
    
    updateTimeDisplay() {
        if (!this.audioElement) return;
        
        const currentTime = document.getElementById('currentTime');
        const totalTime = document.getElementById('totalTime');
        
        currentTime.textContent = this.formatTime(this.audioElement.currentTime);
        totalTime.textContent = this.formatTime(this.audioElement.duration);
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    updatePlayButton() {
        const playButton = document.getElementById('playPauseBtn');
        const icon = playButton.querySelector('i');
        
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }
    
    cleanup() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }
        
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        this.isPlaying = false;
        this.currentTrack = null;
        this.roomId = null;
        this.isHost = false;
        
        // Убираем слушатели комнаты
        if (this.roomId) {
            database.ref('musicRooms/' + this.roomId).off();
        }
    }
}

// Инициализация музыкального плеера при загрузке страницы
let sharedMusicPlayer;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        sharedMusicPlayer = new SharedMusicPlayer();
        showNotification("Музыкальный плеер загружен! 🎵");
    }, 3000);
});