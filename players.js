class Player {
    constructor(number, game) {
        this.number = number;
        this.game = game;
        this.tokens = [];
        this.color = this.getPlayerColor();
        this.createTokens();
    }

    getPlayerColor() {
        const colors = {
            1: '#e74c3c', // Red
            2: '#3498db', // Blue
            3: '#2ecc71', // Green
            4: '#f1c40f'  // Yellow
        };
        return colors[this.number] || '#ffffff';
    }

    createTokens() {
        for (let i = 0; i < 4; i++) {
            this.tokens.push(new Token(this, i + 1, this.game));
        }
    }

    createBase() {
        const base = document.createElement('div');
        base.className = `player-base player-${this.number}`;
        this.game.playerBases.appendChild(base);
        
        // Place tokens in base
        this.tokens.forEach(token => {
            token.element.style.position = 'absolute';
            base.appendChild(token.element);
        });
    }

    createHomeArea() {
        const homeArea = document.createElement('div');
        homeArea.className = `home-area player-${this.number}`;
        this.game.playerBases.appendChild(homeArea);
    }

    checkMovableTokens(steps) {
        let movableTokens = [];
        
        this.tokens.forEach(token => {
            if (token.canMove(steps)) {
                movableTokens.push(token);
            }
        });
        
        if (movableTokens.length === 0) {
            return false;
        }
        
        // In a real game, you'd let the player choose which token to move
        // For simplicity, we'll just move the first movable token
        if (movableTokens.length > 0) {
            this.game.moveToken(movableTokens[0], steps);
        }
        
        return true;
    }

    moveToken(token, steps) {
        // Simplified movement logic
        // In a real Ludo game, the path is more complex
        token.position += steps;
        
        // Check if token reached home
        if (token.position >= 50) { // Arbitrary home position
            token.isHome = true;
            token.element.style.display = 'none'; // Hide token (simplified)
        } else {
            // Move token on board
            const pathPosition = this.game.pathPositions[token.position % this.game.pathPositions.length];
            token.element.style.left = `${pathPosition.x * 100 / this.game.boardSize}%`;
            token.element.style.top = `${pathPosition.y * 100 / this.game.boardSize}%`;
            token.element.style.position = 'absolute';
            this.game.gameBoard.appendChild(token.element);
        }
    }

    checkWin() {
        return this.tokens.every(token => token.isHome);
    }
}

class Token {
    constructor(player, id, game) {
        this.player = player;
        this.id = id;
        this.game = game;
        this.position = 0; // Starting position
        this.isHome = false;
        this.createElement();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = `token player-${this.player.number}`;
        this.element.dataset.player = this.player.number;
        this.element.dataset.tokenId = this.id;
        
        this.element.addEventListener('click', () => {
            if (this.game.currentPlayerIndex + 1 === this.player.number && 
                this.game.diceValue > 0 && 
                this.canMove(this.game.diceValue)) {
                this.game.moveToken(this, this.game.diceValue);
            }
        });
    }

    canMove(steps) {
        if (this.isHome) return false;
        
        // Check if move would take token home
        const newPosition = this.position + steps;
        if (newPosition >= 50) return true;
        
        // Check if new position is valid
        // In a real game, you'd check for special rules like knocking other tokens
        return true;
    }
             }
