// music-player.js - Улучшенный музыкальный плеер для Quantum Messenger

class QuantumMusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.volume = 0.7;
        this.isPlayerVisible = false;
        this.isMiniPlayerVisible = false;
        this.repeatMode = 'none'; // none, one, all
        this.shuffleMode = false;
        this.equalizerBands = new Array(10).fill(0.5);
        
        this.initializePlayer();
        this.setupEventListeners();
        this.setupAudioAnalyser();
    }

    initializePlayer() {
        this.createPlayerHTML();
        this.createMiniPlayerHTML();
        this.audio.volume = this.volume;
        
        // Загружаем сохраненные настройки
        this.loadSettings();
    }

    createPlayerHTML() {
        const playerContainer = document.createElement('div');
        playerContainer.id = 'music-player';
        playerContainer.innerHTML = `
            <div class="player-header">
                <div class="player-title">
                    <i class="fas fa-music"></i>
                    <span>Музыкальный плеер</span>
                </div>
                <div class="player-controls-buttons">
                    <button class="player-btn" id="miniPlayerBtn" title="Свернуть">
                        <i class="fas fa-window-minimize"></i>
                    </button>
                    <button class="player-btn" id="closePlayerBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="player-main">
                <div class="album-art-container">
                    <div class="album-art" id="albumArt">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="visualizer" id="visualizer"></div>
                </div>
                
                <div class="track-info">
                    <div class="track-title" id="trackTitle">Выберите трек</div>
                    <div class="track-artist" id="trackArtist">Unknown Artist</div>
                    <div class="track-album" id="trackAlbum">Unknown Album</div>
                </div>
                
                <div class="progress-section">
                    <div class="time-display">
                        <span id="currentTime">0:00</span>
                        <span id="duration">0:00</span>
                    </div>
                    <input type="range" id="progressBar" class="progress-bar" min="0" max="100" value="0">
                </div>
                
                <div class="main-controls">
                    <button class="control-btn" id="shuffleBtn" title="Перемешать">
                        <i class="fas fa-random"></i>
                    </button>
                    <button class="control-btn" id="prevBtn" title="Предыдущий">
                        <i class="fas fa-step-backward"></i>
                    </button>
                    <button class="control-btn play-btn" id="playBtn" title="Воспроизвести">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="control-btn" id="nextBtn" title="Следующий">
                        <i class="fas fa-step-forward"></i>
                    </button>
                    <button class="control-btn" id="repeatBtn" title="Повтор">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
                
                <div class="volume-section">
                    <i class="fas fa-volume-down volume-icon"></i>
                    <input type="range" id="volumeSlider" class="volume-slider" min="0" max="100" value="70">
                    <i class="fas fa-volume-up volume-icon"></i>
                </div>
            </div>
            
            <div class="player-footer">
                <div class="equalizer-toggle" id="equalizerToggle">
                    <i class="fas fa-sliders-h"></i>
                    <span>Эквалайзер</span>
                </div>
                
                <div class="playlist-toggle" id="playlistToggle">
                    <i class="fas fa-list"></i>
                    <span>Плейлист</span>
                    <span class="track-count" id="trackCount">0</span>
                </div>
            </div>
            
            <div class="equalizer-panel" id="equalizerPanel">
                <div class="equalizer-header">
                    <h4>Эквалайзер</h4>
                    <button class="equalizer-preset" id="resetEqBtn">Сброс</button>
                </div>
                <div class="equalizer-bands" id="equalizerBands"></div>
                <div class="equalizer-presets">
                    <button class="preset-btn" data-preset="flat">Плоско</button>
                    <button class="preset-btn" data-preset="pop">Поп</button>
                    <button class="preset-btn" data-preset="rock">Рок</button>
                    <button class="preset-btn" data-preset="jazz">Джаз</button>
                    <button class="preset-btn" data-preset="classical">Классика</button>
                </div>
            </div>
            
            <div class="playlist-panel" id="playlistPanel">
                <div class="playlist-header">
                    <h4>Плейлист</h4>
                    <div class="playlist-actions">
                        <button class="playlist-btn" id="addTracksBtn">
                            <i class="fas fa-plus"></i> Добавить
                        </button>
                        <button class="playlist-btn" id="clearPlaylistBtn">
                            <i class="fas fa-trash"></i> Очистить
                        </button>
                    </div>
                </div>
                <div class="playlist-tracks" id="playlistTracks">
                    <div class="empty-playlist">
                        <i class="fas fa-music"></i>
                        <p>Плейлист пуст</p>
                        <p class="empty-hint">Добавьте треки для воспроизведения</p>
                    </div>
                </div>
            </div>
            
            <input type="file" id="fileInput" accept="audio/*" multiple style="display: none;">
        `;

        document.body.appendChild(playerContainer);
        this.addPlayerStyles();
        
        // Сохраняем ссылки на элементы
        this.elements = {
            player: playerContainer,
            closeBtn: document.getElementById('closePlayerBtn'),
            miniPlayerBtn: document.getElementById('miniPlayerBtn'),
            playBtn: document.getElementById('playBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            shuffleBtn: document.getElementById('shuffleBtn'),
            repeatBtn: document.getElementById('repeatBtn'),
            volumeSlider: document.getElementById('volumeSlider'),
            progressBar: document.getElementById('progressBar'),
            trackTitle: document.getElementById('trackTitle'),
            trackArtist: document.getElementById('trackArtist'),
            trackAlbum: document.getElementById('trackAlbum'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration'),
            albumArt: document.getElementById('albumArt'),
            visualizer: document.getElementById('visualizer'),
            equalizerToggle: document.getElementById('equalizerToggle'),
            playlistToggle: document.getElementById('playlistToggle'),
            equalizerPanel: document.getElementById('equalizerPanel'),
            playlistPanel: document.getElementById('playlistPanel'),
            playlistTracks: document.getElementById('playlistTracks'),
            trackCount: document.getElementById('trackCount'),
            addTracksBtn: document.getElementById('addTracksBtn'),
            clearPlaylistBtn: document.getElementById('clearPlaylistBtn'),
            resetEqBtn: document.getElementById('resetEqBtn'),
            equalizerBands: document.getElementById('equalizerBands'),
            fileInput: document.getElementById('fileInput')
        };
    }

    createMiniPlayerHTML() {
        const miniPlayer = document.createElement('div');
        miniPlayer.id = 'mini-music-player';
        miniPlayer.innerHTML = `
            <div class="mini-player-content">
                <div class="mini-album-art">
                    <i class="fas fa-music"></i>
                </div>
                <div class="mini-track-info">
                    <div class="mini-track-title">Нет трека</div>
                    <div class="mini-track-artist">—</div>
                </div>
                <div class="mini-controls">
                    <button class="mini-control-btn" id="miniPrevBtn">
                        <i class="fas fa-step-backward"></i>
                    </button>
                    <button class="mini-control-btn" id="miniPlayBtn">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="mini-control-btn" id="miniNextBtn">
                        <i class="fas fa-step-forward"></i>
                    </button>
                </div>
                <div class="mini-progress">
                    <div class="mini-progress-bar">
                        <div class="mini-progress-fill"></div>
                    </div>
                </div>
                <button class="mini-control-btn" id="expandPlayerBtn">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        `;

        document.body.appendChild(miniPlayer);
        
        this.elements.miniPlayer = miniPlayer;
        this.elements.miniPlayBtn = document.getElementById('miniPlayBtn');
        this.elements.miniPrevBtn = document.getElementById('miniPrevBtn');
        this.elements.miniNextBtn = document.getElementById('miniNextBtn');
        this.elements.expandPlayerBtn = document.getElementById('expandPlayerBtn');
        this.elements.miniProgressFill = document.querySelector('.mini-progress-fill');
        this.elements.miniTrackTitle = document.querySelector('.mini-track-title');
        this.elements.miniTrackArtist = document.querySelector('.mini-track-artist');
        this.elements.miniAlbumArt = document.querySelector('.mini-album-art');
    }

    addPlayerStyles() {
        const styles = `
            <style>
                /* Основные стили плеера */
                #music-player {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 420px;
                    background: var(--profile-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    font-family: 'Segoe UI', sans-serif;
                }

                #music-player.active {
                    display: flex;
                    animation: playerSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                @keyframes playerSlideIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -40%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }

                .player-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.1));
                    border-bottom: 1px solid var(--border-color);
                }

                .player-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                    font-size: 18px;
                    color: var(--text-color);
                }

                .player-controls-buttons {
                    display: flex;
                    gap: 5px;
                }

                .player-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid var(--border-color);
                    color: var(--text-color);
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .player-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.05);
                }

                .player-main {
                    padding: 30px;
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                }

                .album-art-container {
                    position: relative;
                    width: 200px;
                    height: 200px;
                    margin: 0 auto;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .album-art {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #4facfe, #00f2fe);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 60px;
                    color: white;
                }

                .visualizer {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 30px;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-around;
                    padding: 0 10px;
                }

                .visualizer-bar {
                    width: 3px;
                    background: linear-gradient(to top, #4facfe, #00f2fe);
                    border-radius: 2px 2px 0 0;
                    transition: height 0.1s ease;
                }

                .track-info {
                    text-align: center;
                }

                .track-title {
                    font-size: 22px;
                    font-weight: 600;
                    margin-bottom: 5px;
                    color: var(--text-color);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .track-artist {
                    font-size: 16px;
                    opacity: 0.8;
                    margin-bottom: 3px;
                    color: var(--text-color);
                }

                .track-album {
                    font-size: 14px;
                    opacity: 0.6;
                    color: var(--text-color);
                }

                .progress-section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .time-display {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    opacity: 0.7;
                    color: var(--text-color);
                }

                .progress-bar {
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    background: rgba(255, 255, 255, 0.1);
                    outline: none;
                    cursor: pointer;
                    -webkit-appearance: none;
                }

                .progress-bar::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #4facfe;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                }

                .main-controls {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 15px;
                }

                .control-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid var(--border-color);
                    color: var(--text-color);
                    padding: 12px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 50px;
                    height: 50px;
                }

                .control-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }

                .control-btn.active {
                    background: linear-gradient(135deg, #4facfe, #00f2fe);
                    color: white;
                    border-color: transparent;
                }

                .play-btn {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #4facfe, #00f2fe);
                    color: white;
                    border: none;
                    font-size: 20px;
                }

                .play-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
                }

                .volume-section {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .volume-icon {
                    opacity: 0.7;
                    color: var(--text-color);
                }

                .volume-slider {
                    flex: 1;
                    height: 4px;
                    border-radius: 2px;
                    background: rgba(255, 255, 255, 0.1);
                    outline: none;
                    cursor: pointer;
                    -webkit-appearance: none;
                }

                .volume-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #4facfe;
                    cursor: pointer;
                }

                .player-footer {
                    display: flex;
                    border-top: 1px solid var(--border-color);
                }

                .equalizer-toggle, .playlist-toggle {
                    flex: 1;
                    padding: 15px;
                    text-align: center;
                    cursor: pointer;
                    transition: background 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: var(--text-color);
                }

                .equalizer-toggle:hover, .playlist-toggle:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .equalizer-toggle.active, .playlist-toggle.active {
                    background: rgba(79, 172, 254, 0.1);
                    color: #4facfe;
                }

                .track-count {
                    background: #4facfe;
                    color: white;
                    border-radius: 10px;
                    padding: 2px 6px;
                    font-size: 12px;
                    min-width: 20px;
                    text-align: center;
                }

                .equalizer-panel, .playlist-panel {
                    display: none;
                    padding: 20px;
                    background: rgba(0, 0, 0, 0.2);
                    border-top: 1px solid var(--border-color);
                    max-height: 200px;
                    overflow-y: auto;
                }

                .equalizer-panel.active, .playlist-panel.active {
                    display: block;
                    animation: panelSlideDown 0.3s ease;
                }

                @keyframes panelSlideDown {
                    from {
                        opacity: 0;
                        max-height: 0;
                    }
                    to {
                        opacity: 1;
                        max-height: 200px;
                    }
                }

                .equalizer-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .equalizer-header h4 {
                    margin: 0;
                    color: var(--text-color);
                }

                .equalizer-preset {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid var(--border-color);
                    color: var(--text-color);
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .equalizer-bands {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    height: 80px;
                    margin-bottom: 15px;
                    gap: 5px;
                }

                .eq-band {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    flex: 1;
                }

                .eq-band-label {
                    font-size: 10px;
                    color: var(--text-color);
                    opacity: 0.7;
                }

                .eq-band-slider {
                    writing-mode: bt-lr;
                    -webkit-appearance: slider-vertical;
                    width: 20px;
                    height: 60px;
                }

                .equalizer-presets {
                    display: flex;
                    gap: 5px;
                    justify-content: center;
                }

                .preset-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid var(--border-color);
                    color: var(--text-color);
                    padding: 5px 8px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 11px;
                    transition: all 0.3s ease;
                }

                .preset-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .playlist-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .playlist-header h4 {
                    margin: 0;
                    color: var(--text-color);
                }

                .playlist-actions {
                    display: flex;
                    gap: 5px;
                }

                .playlist-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid var(--border-color);
                    color: var(--text-color);
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .playlist-tracks {
                    max-height: 150px;
                    overflow-y: auto;
                }

                .track-item {
                    display: flex;
                    align-items: center;
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.3s ease;
                    margin-bottom: 5px;
                }

                .track-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .track-item.active {
                    background: rgba(79, 172, 254, 0.2);
                }

                .track-item-icon {
                    margin-right: 10px;
                    opacity: 0.7;
                }

                .track-item-info {
                    flex: 1;
                    min-width: 0;
                }

                .track-item-title {
                    font-size: 14px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: var(--text-color);
                }

                .track-item-artist {
                    font-size: 12px;
                    opacity: 0.7;
                    color: var(--text-color);
                }

                .track-item-duration {
                    font-size: 12px;
                    opacity: 0.7;
                    color: var(--text-color);
                    margin-left: 10px;
                }

                .empty-playlist {
                    text-align: center;
                    padding: 30px;
                    color: var(--text-color);
                    opacity: 0.7;
                }

                .empty-playlist i {
                    font-size: 40px;
                    margin-bottom: 10px;
                }

                .empty-hint {
                    font-size: 12px;
                    margin-top: 5px;
                }

                /* Мини-плеер */
                #mini-music-player {
                    position: fixed;
                    top: 70px;
                    right: 20px;
                    width: 300px;
                    background: var(--profile-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--border-color);
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    z-index: 9999;
                    display: none;
                    overflow: hidden;
                }

                #mini-music-player.active {
                    display: block;
                    animation: miniPlayerSlideIn 0.3s ease;
                }

                @keyframes miniPlayerSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .mini-player-content {
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .mini-album-art {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #4facfe, #00f2fe);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .mini-track-info {
                    flex: 1;
                    min-width: 0;
                }

                .mini-track-title {
                    font-size: 14px;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: var(--text-color);
                }

                .mini-track-artist {
                    font-size: 12px;
                    opacity: 0.7;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: var(--text-color);
                }

                .mini-controls {
                    display: flex;
                    gap: 5px;
                    flex-shrink: 0;
                }

                .mini-control-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid var(--border-color);
                    color: var(--text-color);
                    padding: 8px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                }

                .mini-control-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .mini-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                }

                .mini-progress-bar {
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.1);
                }

                .mini-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #4facfe, #00f2fe);
                    width: 0%;
                    transition: width 0.1s ease;
                }

                /* Адаптивность */
                @media (max-width: 480px) {
                    #music-player {
                        width: 95vw;
                        height: 95vh;
                        border-radius: 0;
                    }
                    
                    .player-main {
                        padding: 20px;
                    }
                    
                    .album-art-container {
                        width: 150px;
                        height: 150px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupEventListeners() {
        // Основные кнопки управления
        this.elements.closeBtn.addEventListener('click', () => this.hidePlayer());
        this.elements.miniPlayerBtn.addEventListener('click', () => this.toggleMiniPlayer());
        this.elements.playBtn.addEventListener('click', () => this.togglePlay());
        this.elements.prevBtn.addEventListener('click', () => this.previousTrack());
        this.elements.nextBtn.addEventListener('click', () => this.nextTrack());
        this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Мини-плеер кнопки
        this.elements.miniPlayBtn.addEventListener('click', () => this.togglePlay());
        this.elements.miniPrevBtn.addEventListener('click', () => this.previousTrack());
        this.elements.miniNextBtn.addEventListener('click', () => this.nextTrack());
        this.elements.expandPlayerBtn.addEventListener('click', () => this.showPlayer());
        
        // Регуляторы
        this.elements.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));
        this.elements.progressBar.addEventListener('input', (e) => this.seek(e.target.value));
        
        // Панели
        this.elements.equalizerToggle.addEventListener('click', () => this.toggleEqualizer());
        this.elements.playlistToggle.addEventListener('click', () => this.togglePlaylist());
        this.elements.addTracksBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.clearPlaylistBtn.addEventListener('click', () => this.clearPlaylist());
        
        // Файловый инпут
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Эквалайзер
        this.elements.resetEqBtn.addEventListener('click', () => this.resetEqualizer());
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.applyEqualizerPreset(e.target.dataset.preset));
        });
        
        // События аудио
        this.audio.addEventListener('loadedmetadata', () => this.updateTrackInfo());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('error', (e) => this.handleAudioError(e));
        
        // Закрытие плеера при клике вне его
        document.addEventListener('click', (e) => {
            if (this.isPlayerVisible && !this.elements.player.contains(e.target) && 
                !this.elements.miniPlayer.contains(e.target) && 
                e.target.id !== 'musicPlayerBtn') {
                this.hidePlayer();
            }
        });
    }

    setupAudioAnalyser() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.source = this.audioContext.createMediaElementSource(this.audio);
            
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.analyser.fftSize = 256;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            
            this.animateVisualizer();
        } catch (e) {
            console.warn('Audio analyzer not supported:', e);
        }
    }

    animateVisualizer() {
        if (!this.analyser) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        if (this.isPlaying && this.elements.visualizer) {
            this.elements.visualizer.innerHTML = '';
            const barCount = 20;
            const step = Math.floor(this.bufferLength / barCount);
            
            for (let i = 0; i < barCount; i++) {
                const bar = document.createElement('div');
                bar.className = 'visualizer-bar';
                const value = this.dataArray[i * step] / 255;
                bar.style.height = `${value * 100}%`;
                this.elements.visualizer.appendChild(bar);
            }
        }
        
        requestAnimationFrame(() => this.animateVisualizer());
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        files.forEach(file => {
            if (!file.type.startsWith('audio/')) {
                this.showNotification('Пожалуйста, выбирайте только аудиофайлы', 'error');
                return;
            }

            this.addTrackToPlaylist(file);
        });

        event.target.value = '';
    }

    addTrackToPlaylist(file) {
        const track = {
            id: Date.now() + Math.random(),
            name: file.name.replace(/\.[^/.]+$/, ""),
            file: file,
            url: URL.createObjectURL(file),
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            duration: '0:00'
        };

        this.playlist.push(track);
        this.renderPlaylist();
        this.updateTrackCount();

        if (this.playlist.length === 1) {
            this.currentTrackIndex = 0;
            this.loadTrack(0);
        }

        this.showNotification(`Добавлен трек: ${track.name}`);
    }

    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;

        this.currentTrackIndex = index;
        const track = this.playlist[index];

        this.audio.src = track.url;
        this.elements.trackTitle.textContent = track.name;
        this.elements.trackArtist.textContent = track.artist;
        this.elements.trackAlbum.textContent = track.album;
        
        // Обновляем мини-плеер
        this.elements.miniTrackTitle.textContent = track.name;
        this.elements.miniTrackArtist.textContent = track.artist;

        this.renderPlaylist();

        this.audio.addEventListener('loadedmetadata', () => {
            track.duration = this.formatTime(this.audio.duration);
            this.renderPlaylist();
        }, { once: true });

        if (this.isPlaying) {
            this.play();
        }
    }

    togglePlay() {
        if (this.playlist.length === 0) {
            this.showNotification('Добавьте треки в плейлист', 'warning');
            return;
        }

        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (this.playlist.length === 0) return;

        if (!this.audio.src) {
            this.loadTrack(this.currentTrackIndex);
            return;
        }

        // Восстанавливаем аудиоконтекст если нужно
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.audio.play().then(() => {
            this.isPlaying = true;
            this.elements.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.elements.miniPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
            
            // Показываем мини-плеер если основной закрыт
            if (!this.isPlayerVisible) {
                this.showMiniPlayer();
            }
        }).catch(error => {
            this.showNotification('Ошибка воспроизведения', 'error');
        });
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.elements.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.elements.miniPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    nextTrack() {
        if (this.playlist.length === 0) return;

        let nextIndex;
        if (this.shuffleMode) {
            nextIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        }

        this.loadTrack(nextIndex);
        this.play();
    }

    previousTrack() {
        if (this.playlist.length === 0) return;

        let prevIndex;
        if (this.shuffleMode) {
            prevIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            prevIndex = this.currentTrackIndex === 0 ? 
                this.playlist.length - 1 : this.currentTrackIndex - 1;
        }

        this.loadTrack(prevIndex);
        this.play();
    }

    handleTrackEnd() {
        switch (this.repeatMode) {
            case 'one':
                this.audio.currentTime = 0;
                this.play();
                break;
            case 'all':
                this.nextTrack();
                break;
            default:
                if (this.currentTrackIndex < this.playlist.length - 1) {
                    this.nextTrack();
                } else {
                    this.pause();
                }
        }
    }

    toggleShuffle() {
        this.shuffleMode = !this.shuffleMode;
        this.elements.shuffleBtn.classList.toggle('active', this.shuffleMode);
        this.saveSettings();
    }

    toggleRepeat() {
        const modes = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        this.elements.repeatBtn.innerHTML = this.getRepeatIcon();
        this.elements.repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
        this.saveSettings();
    }

    getRepeatIcon() {
        switch (this.repeatMode) {
            case 'one': return '<i class="fas fa-redo-alt"></i>';
            case 'all': return '<i class="fas fa-infinity"></i>';
            default: return '<i class="fas fa-redo"></i>';
        }
    }

    setVolume(volume) {
        this.volume = volume;
        this.audio.volume = volume;
        this.elements.volumeSlider.value = volume * 100;
        this.saveSettings();
    }

    seek(percentage) {
        if (this.audio.duration) {
            this.audio.currentTime = (percentage / 100) * this.audio.duration;
        }
    }

    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.elements.progressBar.value = progress;
            this.elements.currentTime.textContent = this.formatTime(this.audio.currentTime);
            this.elements.duration.textContent = this.formatTime(this.audio.duration);
            
            // Обновляем мини-плеер
            if (this.elements.miniProgressFill) {
                this.elements.miniProgressFill.style.width = `${progress}%`;
            }
        }
    }

    updateTrackInfo() {
        this.elements.duration.textContent = this.formatTime(this.audio.duration);
        this.elements.progressBar.value = 0;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    renderPlaylist() {
        if (this.playlist.length === 0) {
            this.elements.playlistTracks.innerHTML = `
                <div class="empty-playlist">
                    <i class="fas fa-music"></i>
                    <p>Плейлист пуст</p>
                    <p class="empty-hint">Добавьте треки для воспроизведения</p>
                </div>
            `;
            return;
        }

        this.elements.playlistTracks.innerHTML = this.playlist.map((track, index) => `
            <div class="track-item ${index === this.currentTrackIndex ? 'active' : ''}" 
                 onclick="musicPlayer.loadTrack(${index})">
                <div class="track-item-icon">
                    <i class="fas fa-music"></i>
                </div>
                <div class="track-item-info">
                    <div class="track-item-title">${track.name}</div>
                    <div class="track-item-artist">${track.artist}</div>
                </div>
                <div class="track-item-duration">${track.duration}</div>
            </div>
        `).join('');
    }

    updateTrackCount() {
        this.elements.trackCount.textContent = this.playlist.length;
    }

    clearPlaylist() {
        if (this.playlist.length === 0) return;
        
        if (confirm('Очистить весь плейлист?')) {
            this.pause();
            this.playlist.forEach(track => URL.revokeObjectURL(track.url));
            this.playlist = [];
            this.currentTrackIndex = 0;
            this.audio.src = '';
            this.renderPlaylist();
            this.updateTrackCount();
            this.elements.trackTitle.textContent = 'Выберите трек';
            this.elements.trackArtist.textContent = 'Unknown Artist';
            this.elements.trackAlbum.textContent = 'Unknown Album';
            this.hideMiniPlayer();
        }
    }

    toggleEqualizer() {
        this.elements.equalizerPanel.classList.toggle('active');
        this.elements.equalizerToggle.classList.toggle('active');
        
        if (this.elements.equalizerPanel.classList.contains('active')) {
            this.elements.playlistPanel.classList.remove('active');
            this.elements.playlistToggle.classList.remove('active');
            this.renderEqualizer();
        }
    }

    togglePlaylist() {
        this.elements.playlistPanel.classList.toggle('active');
        this.elements.playlistToggle.classList.toggle('active');
        
        if (this.elements.playlistPanel.classList.contains('active')) {
            this.elements.equalizerPanel.classList.remove('active');
            this.elements.equalizerToggle.classList.remove('active');
        }
    }

    renderEqualizer() {
        this.elements.equalizerBands.innerHTML = '';
        
        for (let i = 0; i < 10; i++) {
            const band = document.createElement('div');
            band.className = 'eq-band';
            band.innerHTML = `
                <input type="range" class="eq-band-slider" min="0" max="100" 
                       value="${this.equalizerBands[i] * 100}" 
                       data-band="${i}" orient="vertical">
                <div class="eq-band-label">${(i + 1) * 100}Hz</div>
            `;
            
            const slider = band.querySelector('.eq-band-slider');
            slider.addEventListener('input', (e) => {
                this.equalizerBands[i] = e.target.value / 100;
                this.applyEqualizer();
            });
            
            this.elements.equalizerBands.appendChild(band);
        }
    }

    applyEqualizer() {
        // В реальном приложении здесь бы применялись фильтры к аудио
        console.log('Equalizer applied:', this.equalizerBands);
        this.saveSettings();
    }

    resetEqualizer() {
        this.equalizerBands = new Array(10).fill(0.5);
        this.renderEqualizer();
        this.applyEqualizer();
    }

    applyEqualizerPreset(preset) {
        const presets = {
            flat: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
            pop: [0.8, 0.7, 0.6, 0.5, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7],
            rock: [0.9, 0.8, 0.7, 0.6, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6],
            jazz: [0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.6, 0.7, 0.8, 0.7],
            classical: [0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.6, 0.7, 0.8]
        };
        
        if (presets[preset]) {
            this.equalizerBands = [...presets[preset]];
            this.renderEqualizer();
            this.applyEqualizer();
        }
    }

    showPlayer() {
        this.isPlayerVisible = true;
        this.elements.player.classList.add('active');
        this.hideMiniPlayer();
    }

    hidePlayer() {
        this.isPlayerVisible = false;
        this.elements.player.classList.remove('active');
        
        // Если музыка играет, показываем мини-плеер
        if (this.isPlaying) {
            this.showMiniPlayer();
        }
    }

    showMiniPlayer() {
        this.isMiniPlayerVisible = true;
        this.elements.miniPlayer.classList.add('active');
    }

    hideMiniPlayer() {
        this.isMiniPlayerVisible = false;
        this.elements.miniPlayer.classList.remove('active');
    }

    toggleMiniPlayer() {
        if (this.isMiniPlayerVisible) {
            this.hideMiniPlayer();
            this.showPlayer();
        } else {
            this.hidePlayer();
            this.showMiniPlayer();
        }
    }

    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? '#ff4757' : type === 'warning' ? '#ffa502' : '#2ed573'};
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 10001;
                animation: slideInRight 0.3s ease;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }

    handleAudioError(error) {
        console.error('Audio error:', error);
        this.showNotification('Ошибка загрузки аудиофайла', 'error');
        this.pause();
    }

    saveSettings() {
        const settings = {
            volume: this.volume,
            shuffleMode: this.shuffleMode,
            repeatMode: this.repeatMode,
            equalizerBands: this.equalizerBands
        };
        localStorage.setItem('quantumMusicPlayer', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('quantumMusicPlayer');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.volume = settings.volume || 0.7;
                this.shuffleMode = settings.shuffleMode || false;
                this.repeatMode = settings.repeatMode || 'none';
                this.equalizerBands = settings.equalizerBands || new Array(10).fill(0.5);
                
                this.setVolume(this.volume);
                this.elements.shuffleBtn.classList.toggle('active', this.shuffleMode);
                this.elements.repeatBtn.innerHTML = this.getRepeatIcon();
                this.elements.repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
            } catch (e) {
                console.warn('Error loading music player settings:', e);
            }
        }
    }
}

// Добавляем кнопку плеера в верхнюю панель
function addMusicPlayerButton() {
    // Удаляем старую кнопку если есть
    const oldBtn = document.getElementById('musicPlayerBtn');
    if (oldBtn) oldBtn.remove();

    const musicBtn = document.createElement('div');
    musicBtn.className = 'action-btn';
    musicBtn.id = 'musicPlayerBtn';
    musicBtn.innerHTML = '<i class="fas fa-music"></i> <span>Музыка</span>';
    musicBtn.style.marginLeft = '10px';

    // Вставляем кнопку в верхнюю панель управления
    const userControls = document.querySelector('.user-controls');
    if (userControls) {
        // Вставляем перед кнопкой выхода
        const logoutBtn = userControls.querySelector('.logout-btn');
        if (logoutBtn) {
            userControls.insertBefore(musicBtn, logoutBtn);
        } else {
            userControls.appendChild(musicBtn);
        }
    }

    // Инициализируем плеер при первом клике
    let playerInitialized = false;
    musicBtn.addEventListener('click', () => {
        if (!playerInitialized) {
            window.musicPlayer = new QuantumMusicPlayer();
            playerInitialized = true;
        }
        window.musicPlayer.showPlayer();
    });
}

// Инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addMusicPlayerButton);
} else {
    addMusicPlayerButton();
}