class LudoGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.diceValue = 0;
        this.gameStarted = false;
        this.settings = {
            playerCount: 4,
            soundEnabled: true,
            animationsEnabled: true
        };
        this.boardSize = 15; // 15x15 grid
        this.pathPositions = this.generatePathPositions();
        this.initElements();
        this.initEventListeners();
        this.loadSettings();
    }

    initElements() {
        this.menuScreen = document.getElementById('menu-screen');
        this.howToPlayScreen = document.getElementById('how-to-play-screen');
        this.settingsScreen = document.getElementById('settings-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.winningScreen = document.getElementById('winning-screen');
        
        this.startGameBtn = document.getElementById('start-game');
        this.howToPlayBtn = document.getElementById('how-to-play');
        this.settingsBtn = document.getElementById('settings');
        this.backFromHelpBtn = document.getElementById('back-from-help');
        this.backFromSettingsBtn = document.getElementById('back-from-settings');
        this.saveSettingsBtn = document.getElementById('save-settings');
        this.playAgainBtn = document.getElementById('play-again');
        this.backToMenuBtn = document.getElementById('back-to-menu');
        
        this.playerCountSelect = document.getElementById('player-count');
        this.soundToggle = document.getElementById('sound-toggle');
        this.animationToggle = document.getElementById('animation-toggle');
        
        this.currentPlayerText = document.getElementById('current-player-text');
        this.diceElement = document.getElementById('dice');
        this.rollDiceBtn = document.getElementById('roll-dice');
        this.gameBoard = document.querySelector('.game-board');
        this.playerBases = document.querySelector('.player-bases');
        this.winnerText = document.getElementById('winner-text');
        this.confettiContainer = document.querySelector('.confetti-container');
        
        this.diceRollSound = document.getElementById('dice-roll-sound');
        this.tokenMoveSound = document.getElementById('token-move-sound');
        this.winSound = document.getElementById('win-sound');
        this.backgroundMusic = document.getElementById('background-music');
    }

    initEventListeners() {
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.howToPlayBtn.addEventListener('click', () => this.showScreen('how-to-play'));
        this.settingsBtn.addEventListener('click', () => this.showScreen('settings'));
        this.backFromHelpBtn.addEventListener('click', () => this.showScreen('menu'));
        this.backFromSettingsBtn.addEventListener('click', () => this.showScreen('menu'));
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        this.backToMenuBtn.addEventListener('click', () => this.backToMenu());
        this.rollDiceBtn.addEventListener('click', () => this.rollDice());
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        document.getElementById(`${screenName}-screen`).classList.add('active');
        
        if (screenName === 'menu') {
            if (this.settings.soundEnabled) {
                this.backgroundMusic.play().catch(e => console.log("Autoplay prevented:", e));
            }
        } else if (screenName === 'game') {
            this.backgroundMusic.pause();
        }
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('ludoSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            this.playerCountSelect.value = this.settings.playerCount;
            this.soundToggle.checked = this.settings.soundEnabled;
            this.animationToggle.checked = this.settings.animationsEnabled;
        }
    }

    saveSettings() {
        this.settings = {
            playerCount: parseInt(this.playerCountSelect.value),
            soundEnabled: this.soundToggle.checked,
            animationsEnabled: this.animationToggle.checked
        };
        
        localStorage.setItem('ludoSettings', JSON.stringify(this.settings));
        this.showScreen('menu');
    }

    startGame() {
        this.showScreen('game');
        this.initializeGame();
        this.gameStarted = true;
        
        if (this.settings.soundEnabled) {
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }

    initializeGame() {
        this.gameBoard.innerHTML = '';
        this.playerBases.innerHTML = '';
        this.players = [];
        this.currentPlayerIndex = 0;
        this.diceValue = 0;
        this.diceElement.textContent = '0';
        
        // Create players
        for (let i = 0; i < this.settings.playerCount; i++) {
            this.players.push(new Player(i + 1, this));
        }
        
        // Create board
        this.createBoard();
        
        // Update UI
        this.updateCurrentPlayerDisplay();
        this.rollDiceBtn.disabled = false;
    }

    createBoard() {
        // Create path cells
        this.pathPositions.forEach(pos => {
            const cell = document.createElement('div');
            cell.className = 'cell path-cell';
            cell.style.left = `${pos.x * 100 / this.boardSize}%`;
            cell.style.top = `${pos.y * 100 / this.boardSize}%`;
            this.gameBoard.appendChild(cell);
        });
        
        // Create home areas and bases for each player
        this.players.forEach(player => {
            player.createBase();
            player.createHomeArea();
        });
    }

    generatePathPositions() {
        const positions = [];
        const boardMiddle = Math.floor(this.boardSize / 2);
        
        // Horizontal paths
        for (let x = 0; x < this.boardSize; x++) {
            if (x !== boardMiddle) {
                positions.push({ x, y: boardMiddle });
            }
        }
        
        // Vertical paths
        for (let y = 0; y < this.boardSize; y++) {
            if (y !== boardMiddle) {
                positions.push({ x: boardMiddle, y });
            }
        }
        
        // Add some special cells (start, home, etc.)
        // This is simplified - a real Ludo board has a more complex path
        return positions;
    }

    rollDice() {
        if (!this.gameStarted) return;
        
        this.rollDiceBtn.disabled = true;
        this.diceValue = Math.floor(Math.random() * 6) + 1;
        
        // Play sound
        if (this.settings.soundEnabled) {
            this.diceRollSound.currentTime = 0;
            this.diceRollSound.play();
        }
        
        // Animate dice
        if (this.settings.animationsEnabled) {
            this.diceElement.classList.add('dice-roll');
            setTimeout(() => {
                this.diceElement.classList.remove('dice-roll');
                this.diceElement.textContent = this.diceValue;
                this.handleDiceRoll();
            }, 500);
        } else {
            this.diceElement.textContent = this.diceValue;
            this.handleDiceRoll();
        }
    }

    handleDiceRoll() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        const hasMovableTokens = currentPlayer.checkMovableTokens(this.diceValue);
        
        if (!hasMovableTokens) {
            this.nextPlayer();
        }
    }

    moveToken(token, steps) {
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        if (this.settings.soundEnabled) {
            this.tokenMoveSound.currentTime = 0;
            this.tokenMoveSound.play();
        }
        
        if (this.settings.animationsEnabled) {
            token.element.classList.add('token-move');
        }
        
        currentPlayer.moveToken(token, steps);
        
        setTimeout(() => {
            if (this.settings.animationsEnabled) {
                token.element.classList.remove('token-move');
            }
            
            // Check if player has won
            if (currentPlayer.checkWin()) {
                this.showWinningScreen(currentPlayer);
                return;
            }
            
            // If dice roll was 6, player gets another turn
            if (this.diceValue === 6) {
                this.rollDiceBtn.disabled = false;
            } else {
                this.nextPlayer();
            }
        }, 500);
    }

    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.updateCurrentPlayerDisplay();
        this.diceValue = 0;
        this.diceElement.textContent = '0';
        this.rollDiceBtn.disabled = false;
    }

    updateCurrentPlayerDisplay() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        this.currentPlayerText.textContent = `Player ${currentPlayer.number}'s Turn`;
        this.currentPlayerText.style.color = currentPlayer.color;
    }

    showWinningScreen(player) {
        this.winnerText.textContent = `Player ${player.number} Wins!`;
        this.winnerText.style.color = player.color;
        
        if (this.settings.soundEnabled) {
            this.winSound.currentTime = 0;
            this.winSound.play();
        }
        
        if (this.settings.animationsEnabled) {
            this.createConfetti();
        }
        
        this.showScreen('winning');
    }

    createConfetti() {
        this.confettiContainer.innerHTML = '';
        const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 3}s`;
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            this.confettiContainer.appendChild(confetti);
        }
    }

    resetGame() {
        this.showScreen('game');
        this.initializeGame();
    }

    backToMenu() {
        this.gameStarted = false;
        this.showScreen('menu');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new LudoGame();
    window.ludoGame = game; // Make game accessible from console for debugging
});
