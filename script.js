// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballRadius = 8;
const paddleSpeed = 6;
const ballBaseSpeed = 5;

// Player paddle
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: paddleSpeed
};

// Computer paddle
const computerPaddle = {
    x: canvas.width - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: paddleSpeed * 0.8 // Slightly slower for balance
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    dx: ballBaseSpeed,
    dy: ballBaseSpeed,
    speed: ballBaseSpeed
};

// Scores
let playerScore = 0;
let computerScore = 0;

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Move paddle to follow mouse
    playerPaddle.y = mouseY - playerPaddle.height / 2;
    
    // Keep paddle in bounds
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
});

// Handle arrow keys as alternative control
function updatePlayerInput() {
    if (keys['ArrowUp']) {
        playerPaddle.y -= playerPaddle.speed;
    }
    if (keys['ArrowDown']) {
        playerPaddle.y += playerPaddle.speed;
    }
    
    // Keep player paddle in bounds
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
}

// Computer AI
function updateComputerAI() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    const predictionOffset = ball.dy * 10; // Predict ball position
    
    if (computerCenter < ballCenter + predictionOffset - 35) {
        computerPaddle.y += computerPaddle.speed;
    } else if (computerCenter > ballCenter + predictionOffset + 35) {
        computerPaddle.y -= computerPaddle.speed;
    }
    
    // Keep computer paddle in bounds
    if (computerPaddle.y < 0) computerPaddle.y = 0;
    if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

// Collision detection
function checkPaddleCollision(paddle) {
    if (ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y) {
        
        // Reverse ball direction
        ball.dx = -ball.dx;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
        ball.dy = hitPos * ball.speed;
        
        // Increase ball speed slightly
        ball.speed += 0.5;
        ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
        
        // Move ball away from paddle to prevent double collision
        ball.x = paddle === playerPaddle ? paddle.x + paddle.width + ball.radius : paddle.x - ball.radius;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        // Keep ball in bounds
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }
    
    // Paddle collision
    checkPaddleCollision(playerPaddle);
    checkPaddleCollision(computerPaddle);
    
    // Ball out of bounds - score points
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
    }
    
    // Update scoreboard
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = ballBaseSpeed;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballBaseSpeed;
    ball.dy = (Math.random() - 0.5) * ballBaseSpeed;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = paddle === playerPaddle ? '#00ff00' : '#ff00ff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawCenter() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawCenter();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();
}

// Game loop
function gameLoop() {
    updatePlayerInput();
    updateComputerAI();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();