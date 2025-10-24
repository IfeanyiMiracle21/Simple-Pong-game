const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 12, paddleHeight = 80;
const ballRadius = 10;
const playerX = 10;
const aiX = canvas.width - paddleWidth - 10;

// Initial positions
let playerY = (canvas.height - paddleHeight) / 2;
let aiY = (canvas.height - paddleHeight) / 2;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);

// Score
let playerScore = 0, aiScore = 0;

// Mouse control for player paddle
canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerY = mouseY - paddleHeight / 2;
  // Clamp to canvas
  if (playerY < 0) playerY = 0;
  if (playerY + paddleHeight > canvas.height) playerY = canvas.height - paddleHeight;
});

// Draw everything
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Middle line
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw paddles
  ctx.fillStyle = '#fff';
  ctx.fillRect(playerX, playerY, paddleWidth, paddleHeight);
  ctx.fillRect(aiX, aiY, paddleWidth, paddleHeight);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw scores
  ctx.font = '32px Arial';
  ctx.fillText(playerScore, canvas.width / 2 - 60, 50);
  ctx.fillText(aiScore, canvas.width / 2 + 40, 50);
}

// Ball and game logic
function update() {
  // Move ball
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Wall collision
  if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
    ballSpeedY = -ballSpeedY;
  }

  // Player paddle collision
  if (
    ballX - ballRadius < playerX + paddleWidth &&
    ballY > playerY &&
    ballY < playerY + paddleHeight
  ) {
    ballSpeedX = Math.abs(ballSpeedX);
    // Add spin effect
    let deltaY = ballY - (playerY + paddleHeight / 2);
    ballSpeedY += deltaY * 0.08;
  }

  // AI paddle collision
  if (
    ballX + ballRadius > aiX &&
    ballY > aiY &&
    ballY < aiY + paddleHeight
  ) {
    ballSpeedX = -Math.abs(ballSpeedX);
    let deltaY = ballY - (aiY + paddleHeight / 2);
    ballSpeedY += deltaY * 0.08;
  }

  // Score check
  if (ballX - ballRadius < 0) {
    aiScore++;
    resetBall();
  } else if (ballX + ballRadius > canvas.width) {
    playerScore++;
    resetBall();
  }

  // AI paddle movement (basic tracking)
  let aiCenter = aiY + paddleHeight / 2;
  if (aiCenter < ballY - 10) {
    aiY += 5;
  } else if (aiCenter > ballY + 10) {
    aiY -= 5;
  }
  // Clamp AI paddle
  if (aiY < 0) aiY = 0;
  if (aiY + paddleHeight > canvas.height) aiY = canvas.height - paddleHeight;
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
}

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
