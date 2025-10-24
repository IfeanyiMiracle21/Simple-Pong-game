const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const pauseBtn = document.getElementById('pauseBtn');
const canvasWrapper = document.getElementById('canvasWrapper');

// Game settings
const paddleWidth = 12, paddleHeight = 80;
const ballRadius = 10;
let playerX = 10;
let aiX = 0; // Will set after canvas resize
let playerY = 0;
let aiY = 0;
let ballX = 0, ballY = 0;
let ballSpeedX = 0, ballSpeedY = 0;
let playerScore = 0, aiScore = 0;
let paused = false;
let animationFrame;

// Responsive resize
function resizeCanvas() {
  // Use max-width for responsive
  let w = Math.min(window.innerWidth, 800);
  let h = w * 0.5; // Keep aspect ratio
  canvas.width = w;
  canvas.height = h;
  aiX = canvas.width - paddleWidth - 10;
  // Reset positions for new size
  playerY = (canvas.height - paddleHeight) / 2;
  aiY = (canvas.height - paddleHeight) / 2;
  resetBall();
}
window.addEventListener('resize', resizeCanvas);

// Paddle control: mouse & touch
function setPlayerPaddle(y) {
  playerY = y - paddleHeight / 2;
  if (playerY < 0) playerY = 0;
  if (playerY + paddleHeight > canvas.height) playerY = canvas.height - paddleHeight;
}
canvas.addEventListener('mousemove', function(e) {
  if (paused) return;
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  setPlayerPaddle(mouseY);
});
canvas.addEventListener('touchmove', function(e) {
  if (paused) return;
  const rect = canvas.getBoundingClientRect();
  if (e.touches.length > 0) {
    const touchY = e.touches[0].clientY - rect.top;
    setPlayerPaddle(touchY);
  }
}, {passive: false});

// Pause/play button
pauseBtn.addEventListener('click', function() {
  paused = !paused;
  pauseBtn.textContent = paused ? 'Play' : 'Pause';
  if (!paused) gameLoop();
});

// Draw everything
function draw() {
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
  ctx.font = `${canvas.width > 400 ? 32 : 20}px Arial`;
  ctx.fillText(playerScore, canvas.width / 2 - 60, 50);
  ctx.fillText(aiScore, canvas.width / 2 + 40, 50);

  if (paused) {
    ctx.font = `${canvas.width > 400 ? 48 : 28}px Arial`;
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.7;
    ctx.fillText('Paused', canvas.width / 2 - 80, canvas.height / 2);
    ctx.globalAlpha = 1;
  }
}

// Ball and game logic
function update() {
  // Only update when not paused
  if (paused) return;

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
    aiY += Math.max(2, Math.abs(ballSpeedY) * 0.7);
  } else if (aiCenter > ballY + 10) {
    aiY -= Math.max(2, Math.abs(ballSpeedY) * 0.7);
  }
  // Clamp AI paddle
  if (aiY < 0) aiY = 0;
  if (aiY + paddleHeight > canvas.height) aiY = canvas.height - paddleHeight;
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = (canvas.width > 400 ? 5 : 3) * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = (canvas.height > 200 ? 3 : 2) * (Math.random() > 0.5 ? 1 : -1);
}

// Main game loop
function gameLoop() {
  update();
  draw();
  if (!paused) {
    animationFrame = requestAnimationFrame(gameLoop);
  }
}

// Initial resize and start
resizeCanvas();
gameLoop();
