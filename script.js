// ===== GAME CONSTANTS =====
const CANVAS = document.getElementById('gameCanvas');
const CTX = CANVAS.getContext('2d');
const GROUND_Y = CANVAS.height - 50;
const SLIME_SIZE = 30;
const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;

// ===== GAME STATE =====
let gameState = {
    isRunning: false,
    isGameOver: false,
    score: 0,
    highScore: localStorage.getItem('highScore') || 0,
    menuOpen: false
};

// ===== PLAYER OBJECT =====
const player = {
    x: 100,
    y: GROUND_Y,
    width: SLIME_SIZE,
    height: SLIME_SIZE,
    velocityY: 0,
    isJumping: false,
    
    // Draw the player as a blue slime blob
    draw() {
        CTX.fillStyle = '#00a8ff';
        CTX.shadowColor = 'rgba(0, 168, 255, 0.6)';
        CTX.shadowBlur = 15;
        
        // Draw main body (circle)
        CTX.beginPath();
        CTX.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        CTX.fill();
        
        // Draw eyes
        CTX.fillStyle = '#fff';
        CTX.beginPath();
        CTX.arc(this.x - 8, this.y - 5, 4, 0, Math.PI * 2);
        CTX.fill();
        CTX.beginPath();
        CTX.arc(this.x + 8, this.y - 5, 4, 0, Math.PI * 2);
        CTX.fill();
        
        // Draw pupils
        CTX.fillStyle = '#000';
        CTX.beginPath();
        CTX.arc(this.x - 8, this.y - 5, 2, 0, Math.PI * 2);
        CTX.fill();
        CTX.beginPath();
        CTX.arc(this.x + 8, this.y - 5, 2, 0, Math.PI * 2);
        CTX.fill();
        
        CTX.shadowColor = 'transparent';
    },
    
    // Update player physics
    update() {
        // Apply gravity
        this.velocityY += GRAVITY;
        this.y += this.velocityY;
        
        // Ground collision - with bounce effect
        if (this.y >= GROUND_Y) {
            this.y = GROUND_Y;
            this.velocityY = 0;
            this.isJumping = false;
            
            // Slight bounce effect when landing
            if (this.velocityY === 0) {
                this.velocityY = -2;
            }
        }
    },
    
    // Jump function
    jump() {
        if (!this.isJumping) {
            this.velocityY = JUMP_STRENGTH;
            this.isJumping = true;
        }
    }
};

// ===== OBSTACLE OBJECT =====
class Obstacle {
    constructor() {
        this.x = CANVAS.width;
        this.y = GROUND_Y - 40; // Height from ground
        this.width = 30;
        this.height = 40;
        this.speed = 6;
    }
    
    // Draw obstacle as red spike/block
    draw() {
        CTX.fillStyle = '#ff0000';
        CTX.shadowColor = 'rgba(255, 0, 0, 0.6)';
        CTX.shadowBlur = 10;
        
        // Draw spike shape (triangle pointing up)
        CTX.beginPath();
        CTX.moveTo(this.x, this.y);
        CTX.lineTo(this.x + this.width / 2, this.y - this.height);
        CTX.lineTo(this.x + this.width, this.y);
        CTX.closePath();
        CTX.fill();
        
        CTX.shadowColor = 'transparent';
    }
    
    // Update obstacle position
    update() {
        this.x -= this.speed;
    }
    
    // Check if obstacle is off-screen
    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// ===== GAME VARIABLES =====
let obstacles = [];
let lastObstacleTime = 0;
const OBSTACLE_SPAWN_INTERVAL = 2000; // Milliseconds between obstacles

// ===== COLLISION DETECTION =====
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// ===== SPAWN OBSTACLES =====
function spawnObstacle() {
    const currentTime = Date.now();
    
    // Only spawn if enough time has passed and game is running
    if (currentTime - lastObstacleTime > OBSTACLE_SPAWN_INTERVAL && gameState.isRunning) {
        obstacles.push(new Obstacle());
        lastObstacleTime = currentTime;
    }
}

// ===== UPDATE GAME LOGIC =====
function updateGame() {
    if (!gameState.isRunning) return;
    
    // Update player
    player.update();
    
    // Spawn obstacles
    spawnObstacle();
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        
        // Remove obstacles that are off-screen
        if (obstacles[i].isOffScreen()) {
            obstacles.splice(i, 1);
        }
        
        // Check collision with player
        if (checkCollision(player, obstacles[i])) {
            endGame();
            return;
        }
    }
    
    // Increase score
    gameState.score++;
    document.getElementById('current-score').textContent = gameState.score;
}

// ===== DRAW GAME =====
function drawGame() {
    // Clear canvas with dark background
    CTX.fillStyle = '#0d0d0d';
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
    
    // Draw ground line
    CTX.strokeStyle = '#00a8ff';
    CTX.lineWidth = 3;
    CTX.beginPath();
    CTX.moveTo(0, GROUND_Y);
    CTX.lineTo(CANVAS.width, GROUND_Y);
    CTX.stroke();
    
    // Draw player
    player.draw();
    
    // Draw obstacles
    for (let obstacle of obstacles) {
        obstacle.draw();
    }
}

// ===== GAME LOOP =====
function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// ===== END GAME =====
function endGame() {
    gameState.isRunning = false;
    gameState.isGameOver = true;
    
    // Update high score if current score is higher
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
    }
    
    // Show game over screen
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-high-score').textContent = gameState.highScore;
    document.getElementById('game-over-screen').style.display = 'flex';
    
    // Hide canvas
    CANVAS.style.display = 'none';
    document.getElementById('score-display').style.display = 'none';
}

// ===== START GAME =====
function startGame() {
    // Reset game state
    gameState.isRunning = true;
    gameState.isGameOver = false;
    gameState.score = 0;
    gameState.menuOpen = false;
    
    // Reset player
    player.x = 100;
    player.y = GROUND_Y;
    player.velocityY = 0;
    player.isJumping = false;
    
    // Clear obstacles
    obstacles = [];
    lastObstacleTime = Date.now();
    
    // Hide menu screens
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('game-menu-screen').style.display = 'none';
    
    // Show canvas and score
    CANVAS.style.display = 'block';
    document.getElementById('score-display').style.display = 'block';
    document.getElementById('current-score').textContent = '0';
    document.getElementById('high-score').textContent = gameState.highScore;
}

// ===== RESTART GAME =====
function restartGame() {
    startGame();
}

// ===== TOGGLE MENU =====
function toggleMenu() {
    if (!gameState.isRunning) return; // Don't toggle menu if not playing
    
    gameState.menuOpen = !gameState.menuOpen;
    const menuScreen = document.getElementById('game-menu-screen');
    
    if (gameState.menuOpen) {
        menuScreen.style.display = 'flex';
    } else {
        menuScreen.style.display = 'none';
    }
}

// ===== EVENT LISTENERS =====

// Start button click
document.getElementById('start-btn').addEventListener('click', startGame);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && gameState.isRunning && !gameState.menuOpen) {
        player.jump();
        e.preventDefault(); // Prevent page scroll
    }
    
    if (e.key === 'r' || e.key === 'R') {
        if (gameState.isGameOver) {
            restartGame();
        }
    }
    
    if (e.key === 'm' || e.key === 'M') {
        toggleMenu();
    }
});

// Mouse click to jump
document.addEventListener('click', (e) => {
    // Don't jump if clicking on start button or in menus
    if (gameState.isRunning && !gameState.menuOpen && e.target.id !== 'start-btn') {
        player.jump();
    }
});

// Initialize game
window.addEventListener('load', () => {
    // Load high score from localStorage
    document.getElementById('high-score').textContent = gameState.highScore;
    gameLoop();
});