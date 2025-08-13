// 游戏核心逻辑
class MisplacedGiftsGame {
    constructor() {
        this.currentScene = 'start';
        this.gameHistory = [];
        this.settings = {
            textSpeed: 50,
            autoPlay: false,
            soundEffects: true,
            theme: 'default',
            customColors: {
                primary: '#667eea',
                secondary: '#764ba2',
                accent: '#9f7aea'
            }
        };
        this.saveSlots = [];
        this.typewriterTimer = null; // 存储打字机效果的定时器
        this.isTyping = false; // 标记是否正在打字
        this.currentText = ''; // 存储当前要显示的完整文本
        this.audioManager = new AudioManager(); // 音频管理器
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadSaves();
        this.applyTheme(this.settings.theme);
        this.setupEventListeners();
        this.setupThemeListeners();
        // 初始化音频管理器
        this.audioManager.init(this.settings.soundEffects, 0.5);
        this.showScene(this.currentScene);
    }

    // 显示场景
    showScene(sceneId) {
        const scene = storyData[sceneId];
        if (!scene) {
            console.error('Scene not found:', sceneId);
            return;
        }

        this.currentScene = sceneId;
        this.gameHistory.push(sceneId);
        
        // 更新章节和时间显示
        this.updateHeader(scene);
        
        // 处理音频播放
        if (scene.audio && this.settings.soundEffects) {
            this.audioManager.play(scene.audio, {
                loop: scene.audioLoop !== false,
                fadeIn: true,
                forceRestart: false  // 不强制重新开始，实现连续播放
            });
        } else if (!scene.audio && this.audioManager.currentAudioPath) {
            // 如果新场景没有音频，暂停当前音频
            this.audioManager.pause(null, true);
        }
        
        // 显示故事文本
        this.displayText(scene.text);
        
        // 显示选项
        this.displayChoices(scene.choices);
        
        // 更新进度条
        this.updateProgress();
        
        // 如果是结局，显示特殊效果
        if (scene.isEnding) {
            this.showEndingEffect();
        }
    }

    // 更新头部信息
    updateHeader(scene) {
        if (scene.chapter) {
            document.querySelector('.chapter-display').textContent = scene.chapter;
        }
        if (scene.time) {
            document.querySelector('.time-display').textContent = scene.time;
        }
    }

    // 显示文本（带打字机效果）
    displayText(text) {
        // 清除之前的打字机效果
        this.clearTypewriter();
        
        const storyElement = document.getElementById('story-text');
        storyElement.innerHTML = '';
        
        // 保存当前文本
        this.currentText = text;
        
        if (this.settings.textSpeed === 100) {
            // 立即显示全部文本
            storyElement.textContent = text;
            this.isTyping = false;
        } else {
            // 打字机效果
            this.isTyping = true;
            let index = 0;
            const speed = 101 - this.settings.textSpeed;
            
            const typeWriter = () => {
                if (index < text.length && this.isTyping) {
                    storyElement.textContent += text.charAt(index);
                    index++;
                    this.typewriterTimer = setTimeout(typeWriter, speed);
                } else {
                    this.isTyping = false;
                    this.typewriterTimer = null;
                }
            };
            
            typeWriter();
        }
    }
    
    // 清除打字机效果
    clearTypewriter() {
        if (this.typewriterTimer) {
            clearTimeout(this.typewriterTimer);
            this.typewriterTimer = null;
        }
        this.isTyping = false;
    }

    // 显示选项
    displayChoices(choices) {
        const container = document.getElementById('choices-container');
        container.innerHTML = '';
        
        if (!choices || choices.length === 0) return;
        
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.onclick = () => this.makeChoice(choice.next);
            
            // 添加动画延迟
            button.style.animationDelay = `${index * 0.1}s`;
            
            container.appendChild(button);
        });
    }

    // 做出选择
    makeChoice(nextSceneId) {
        // 添加选择动画
        const buttons = document.querySelectorAll('.choice-btn');
        buttons.forEach(btn => btn.classList.add('fade-out'));
        
        // 播放音效
        if (this.settings.soundEffects) {
            this.playSound('click');
        }
        
        // 延迟后显示下一个场景
        setTimeout(() => {
            this.showScene(nextSceneId);
        }, 500);
    }

    // 更新进度条
    updateProgress() {
        const totalScenes = Object.keys(storyData).length;
        const currentProgress = this.gameHistory.length;
        const percentage = (currentProgress / totalScenes) * 100;
        
        document.getElementById('progress-fill').style.width = `${Math.min(percentage, 100)}%`;
    }

    // 显示结局效果
    showEndingEffect() {
        const storyContainer = document.querySelector('.story-container');
        storyContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        storyContainer.style.color = 'white';
        
        // 添加星星效果
        for (let i = 0; i < 20; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: white;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle 2s infinite;
            `;
            storyContainer.appendChild(star);
        }
    }

    // 保存游戏
    saveGame(slotIndex) {
        const saveData = {
            currentScene: this.currentScene,
            gameHistory: this.gameHistory,
            timestamp: new Date().toISOString(),
            chapter: document.querySelector('.chapter-display').textContent,
            progress: document.getElementById('progress-fill').style.width
        };
        
        this.saveSlots[slotIndex] = saveData;
        localStorage.setItem('misplacedGifts_saves', JSON.stringify(this.saveSlots));
        
        this.showNotification('游戏已保存');
    }

    // 加载游戏
    loadGame(slotIndex) {
        const saveData = this.saveSlots[slotIndex];
        if (!saveData) {
            this.showNotification('存档为空');
            return;
        }
        
        // 清除当前的打字机效果
        this.clearTypewriter();
        
        // 停止当前音频，准备加载新场景的音频
        this.audioManager.stopAll();
        
        this.currentScene = saveData.currentScene;
        this.gameHistory = saveData.gameHistory;
        this.showScene(this.currentScene);
        
        this.showNotification('游戏已加载');
    }

    // 重新开始
    restartGame() {
        if (confirm('确定要重新开始吗？当前进度将会丢失。')) {
            // 清除打字机效果
            this.clearTypewriter();
            
            // 停止所有音频
            this.audioManager.stopAll();
            
            this.currentScene = 'start';
            this.gameHistory = [];
            this.showScene(this.currentScene);
            
            // 清除结局效果
            const stars = document.querySelectorAll('.star');
            stars.forEach(star => star.remove());
            
            const storyContainer = document.querySelector('.story-container');
            storyContainer.style.background = 'white';
            storyContainer.style.color = '#333';
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 保存按钮
        document.getElementById('save-btn').onclick = () => {
            this.showSaveModal();
        };
        
        // 加载按钮
        document.getElementById('load-btn').onclick = () => {
            this.showLoadModal();
        };
        
        // 重新开始按钮
        document.getElementById('restart-btn').onclick = () => {
            this.restartGame();
        };
        
        // 设置按钮
        document.getElementById('settings-btn').onclick = () => {
            this.showSettingsModal();
        };
        
        // 帮助按钮
        document.getElementById('help-btn').onclick = () => {
            this.showHelpModal();
        };
        
        // 浮动帮助按钮
        document.getElementById('floating-help-btn').onclick = () => {
            this.showHelpModal();
        };
        
        // 模态框关闭按钮
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.onclick = function() {
                this.parentElement.parentElement.style.display = 'none';
            };
        });
        
        // 点击模态框外部关闭
        window.onclick = (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        };
        
        // 设置选项监听
        document.getElementById('text-speed').oninput = (e) => {
            this.settings.textSpeed = parseInt(e.target.value);
            this.saveSettings();
        };
        
        document.getElementById('auto-play').onchange = (e) => {
            this.settings.autoPlay = e.target.checked;
            this.saveSettings();
        };
        
        document.getElementById('sound-effects').onchange = (e) => {
            this.settings.soundEffects = e.target.checked;
            this.audioManager.setEnabled(e.target.checked);
            this.saveSettings();
            // 如果重新启用音效，恢复当前场景的音频
            if (e.target.checked) {
                const scene = storyData[this.currentScene];
                if (scene && scene.audio) {
                    this.audioManager.play(scene.audio, {
                        loop: scene.audioLoop !== false,
                        fadeIn: true,
                        forceRestart: false
                    });
                }
            }
        };
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 's':
                case 'S':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.quickSave();
                    }
                    break;
                case 'l':
                case 'L':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.quickLoad();
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    this.skipText();
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    this.toggleHelpModal();
                    break;
                case 'Escape':
                    this.closeAllModals();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    const choiceIndex = parseInt(e.key) - 1;
                    const choices = document.querySelectorAll('.choice-btn');
                    if (choices[choiceIndex]) {
                        choices[choiceIndex].click();
                    }
                    break;
            }
        });
    }

    // 显示保存模态框
    showSaveModal() {
        const modal = document.getElementById('save-modal');
        modal.style.display = 'block';
        
        const slotsContainer = document.getElementById('save-slots');
        slotsContainer.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const slot = document.createElement('div');
            slot.className = 'save-slot';
            
            if (this.saveSlots[i]) {
                const saveData = this.saveSlots[i];
                const date = new Date(saveData.timestamp);
                slot.innerHTML = `
                    <div class="save-slot-info">
                        <div>存档 ${i + 1} - ${saveData.chapter}</div>
                        <div class="save-slot-time">${date.toLocaleString()}</div>
                    </div>
                    <div class="save-slot-actions">
                        <button class="save-slot-btn save-btn-primary" onclick="game.saveGame(${i})">覆盖</button>
                        <button class="save-slot-btn save-btn-danger" onclick="game.deleteSave(${i})">删除</button>
                    </div>
                `;
            } else {
                slot.classList.add('empty');
                slot.innerHTML = `
                    <div class="save-slot-info">
                        <div>存档 ${i + 1} - 空</div>
                    </div>
                    <div class="save-slot-actions">
                        <button class="save-slot-btn save-btn-primary" onclick="game.saveGame(${i})">保存</button>
                    </div>
                `;
            }
            
            slotsContainer.appendChild(slot);
        }
    }

    // 显示加载模态框
    showLoadModal() {
        const modal = document.getElementById('save-modal');
        modal.style.display = 'block';
        
        const slotsContainer = document.getElementById('save-slots');
        slotsContainer.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const slot = document.createElement('div');
            slot.className = 'save-slot';
            
            if (this.saveSlots[i]) {
                const saveData = this.saveSlots[i];
                const date = new Date(saveData.timestamp);
                slot.innerHTML = `
                    <div class="save-slot-info">
                        <div>存档 ${i + 1} - ${saveData.chapter}</div>
                        <div class="save-slot-time">${date.toLocaleString()}</div>
                    </div>
                    <div class="save-slot-actions">
                        <button class="save-slot-btn save-btn-primary" onclick="game.loadGame(${i})">加载</button>
                    </div>
                `;
                slot.onclick = () => this.loadGame(i);
            } else {
                slot.classList.add('empty');
                slot.innerHTML = `
                    <div class="save-slot-info">
                        <div>存档 ${i + 1} - 空</div>
                    </div>
                `;
            }
            
            slotsContainer.appendChild(slot);
        }
    }

    // 显示设置模态框
    showSettingsModal() {
        const modal = document.getElementById('settings-modal');
        modal.style.display = 'block';
        
        // 更新设置显示
        document.getElementById('text-speed').value = this.settings.textSpeed;
        document.getElementById('auto-play').checked = this.settings.autoPlay;
        document.getElementById('sound-effects').checked = this.settings.soundEffects;
    }

    // 显示帮助模态框
    showHelpModal() {
        const modal = document.getElementById('help-modal');
        modal.style.display = 'block';
    }

    // 切换帮助模态框
    toggleHelpModal() {
        const modal = document.getElementById('help-modal');
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'block';
        }
    }

    // 关闭所有模态框
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // 快速保存
    quickSave() {
        this.saveGame(0);
    }

    // 快速加载
    quickLoad() {
        this.loadGame(0);
    }

    // 跳过文本
    skipText() {
        // 如果正在打字，立即显示全部文本
        if (this.isTyping) {
            // 清除打字机效果
            this.clearTypewriter();
            
            // 立即显示全部文本
            const storyElement = document.getElementById('story-text');
            storyElement.textContent = this.currentText;
        }
    }

    // 删除存档
    deleteSave(slotIndex) {
        if (confirm('确定要删除这个存档吗？')) {
            this.saveSlots[slotIndex] = null;
            localStorage.setItem('misplacedGifts_saves', JSON.stringify(this.saveSlots));
            this.showSaveModal(); // 刷新显示
            this.showNotification('存档已删除');
        }
    }

    // 保存设置
    saveSettings() {
        localStorage.setItem('misplacedGifts_settings', JSON.stringify(this.settings));
    }

    // 加载设置
    loadSettings() {
        const savedSettings = localStorage.getItem('misplacedGifts_settings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
    }

    // 加载存档
    loadSaves() {
        const savedSlots = localStorage.getItem('misplacedGifts_saves');
        if (savedSlots) {
            this.saveSlots = JSON.parse(savedSlots);
        } else {
            this.saveSlots = new Array(5).fill(null);
        }
    }

    // 显示通知
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }

    // 播放音效
    playSound(soundName) {
        // 这里可以添加实际的音效播放逻辑
        console.log('Playing sound:', soundName);
    }

    // 主题管理功能
    setupThemeListeners() {
        // 主题选择器
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.value = this.settings.theme;
            themeSelector.onchange = (e) => {
                const theme = e.target.value;
                this.applyTheme(theme);
                this.settings.theme = theme;
                this.saveSettings();
                
                // 显示/隐藏自定义颜色选择器
                const customColors = document.getElementById('custom-colors');
                if (customColors) {
                    customColors.style.display = theme === 'custom' ? 'block' : 'none';
                }
            };
        }

        // 自定义颜色选择器
        const colorPrimary = document.getElementById('color-primary');
        const colorPrimaryText = document.getElementById('color-primary-text');
        const colorSecondary = document.getElementById('color-secondary');
        const colorSecondaryText = document.getElementById('color-secondary-text');
        const colorAccent = document.getElementById('color-accent');
        const colorAccentText = document.getElementById('color-accent-text');

        // 颜色选择器同步
        if (colorPrimary && colorPrimaryText) {
            colorPrimary.value = this.settings.customColors.primary;
            colorPrimaryText.value = this.settings.customColors.primary;
            
            colorPrimary.oninput = (e) => {
                colorPrimaryText.value = e.target.value;
                this.updateCustomColorPreview();
            };
            
            colorPrimaryText.oninput = (e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    colorPrimary.value = e.target.value;
                    this.updateCustomColorPreview();
                }
            };
        }

        if (colorSecondary && colorSecondaryText) {
            colorSecondary.value = this.settings.customColors.secondary;
            colorSecondaryText.value = this.settings.customColors.secondary;
            
            colorSecondary.oninput = (e) => {
                colorSecondaryText.value = e.target.value;
                this.updateCustomColorPreview();
            };
            
            colorSecondaryText.oninput = (e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    colorSecondary.value = e.target.value;
                    this.updateCustomColorPreview();
                }
            };
        }

        if (colorAccent && colorAccentText) {
            colorAccent.value = this.settings.customColors.accent;
            colorAccentText.value = this.settings.customColors.accent;
            
            colorAccent.oninput = (e) => {
                colorAccentText.value = e.target.value;
                this.updateCustomColorPreview();
            };
            
            colorAccentText.oninput = (e) => {
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    colorAccent.value = e.target.value;
                    this.updateCustomColorPreview();
                }
            };
        }

        // 应用自定义主题按钮
        const applyCustomTheme = document.getElementById('apply-custom-theme');
        if (applyCustomTheme) {
            applyCustomTheme.onclick = () => {
                this.applyCustomTheme();
            };
        }
    }

    // 应用主题
    applyTheme(themeName) {
        // 移除所有主题类
        document.body.removeAttribute('data-theme');
        
        // 应用新主题
        if (themeName !== 'default') {
            document.body.setAttribute('data-theme', themeName);
        }
        
        // 如果是自定义主题，应用自定义颜色
        if (themeName === 'custom') {
            this.applyCustomColors();
        }
    }

    // 应用自定义颜色
    applyCustomColors() {
        const root = document.documentElement;
        const colors = this.settings.customColors;
        
        root.style.setProperty('--custom-primary', colors.primary);
        root.style.setProperty('--custom-secondary', colors.secondary);
        root.style.setProperty('--custom-accent', colors.accent);
        
        // 计算阴影颜色
        const primaryRgb = this.hexToRgb(colors.primary);
        const secondaryRgb = this.hexToRgb(colors.secondary);
        
        if (primaryRgb && secondaryRgb) {
            root.style.setProperty('--custom-shadow', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`);
            root.style.setProperty('--custom-shadow-hover', `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.3)`);
            root.style.setProperty('--custom-glow', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.4)`);
        }
    }

    // 应用自定义主题
    applyCustomTheme() {
        const colorPrimary = document.getElementById('color-primary').value;
        const colorSecondary = document.getElementById('color-secondary').value;
        const colorAccent = document.getElementById('color-accent').value;
        
        this.settings.customColors = {
            primary: colorPrimary,
            secondary: colorSecondary,
            accent: colorAccent
        };
        
        this.settings.theme = 'custom';
        this.applyTheme('custom');
        this.saveSettings();
        
        this.showNotification('自定义主题已应用');
    }

    // 更新自定义颜色预览
    updateCustomColorPreview() {
        const previewBox = document.querySelector('.preview-box');
        if (previewBox) {
            const colorPrimary = document.getElementById('color-primary').value;
            const colorSecondary = document.getElementById('color-secondary').value;
            
            const previewHeader = previewBox.querySelector('.preview-header');
            const previewBtn = previewBox.querySelector('.preview-btn');
            
            if (previewHeader) {
                previewHeader.style.background = `linear-gradient(135deg, ${colorPrimary} 0%, ${colorSecondary} 100%)`;
            }
            
            if (previewBtn) {
                previewBtn.style.background = colorPrimary;
            }
        }
    }

    // 十六进制颜色转RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}

// 添加必要的CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes twinkle {
        0%, 100% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
    }
    
    .notification {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
    }
`;
document.head.appendChild(style);

// 初始化游戏
const game = new MisplacedGiftsGame();