 const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

let score = 0;
let running = false;
let animationId;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, duration, type = "square") {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.07;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

const ball = {
  x: canvas.width / 2,
  y: canvas.height - 80,
  size: 11,
  speed: 5,
  dx: 4,
  dy: -4
};

const paddle = {
  x: canvas.width / 2 - 55,
  y: canvas.height - 35,
  w: 110,
  h: 14,
  speed: 9,
  dx: 0
};

const brick = {
  row: 5,
  col: 9,
  w: 70,
  h: 22,
  padding: 12,
  offsetX: 45,
  offsetY: 55
};

let bricks = [];

function createBricks() {
  bricks = [];

  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.col; c++) {
      bricks.push({
        x: c * (brick.w + brick.padding) + brick.offsetX,
        y: r * (brick.h + brick.padding) + brick.offsetY,
        visible: true
      });
    }
  }
}

function resetGame() {
  score = 0;
  scoreText.textContent = score;

  ball.x = canvas.width / 2;
  ball.y = canvas.height - 80;
  ball.dx = 4;
  ball.dy = -4;

  paddle.x = canvas.width / 2 - paddle.w / 2;
  paddle.dx = 0;

  createBricks();
  draw();
}

function startGame() {
  if (running) return;

  audioCtx.resume();
  running = true;
  cancelAnimationFrame(animationId);
  update();
}

function restartGame() {
  running = false;
  cancelAnimationFrame(animationId);
  resetGame();
}

function drawBackground() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(124,58,237,.18)";

  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = "#e5e7eb";
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 22;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.closePath();
}

function drawPaddle() {
  const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.w, paddle.y);
  gradient.addColorStop(0, "#38bdf8");
  gradient.addColorStop(0.5, "#e5e7eb");
  gradient.addColorStop(1, "#ff39c8");

  ctx.fillStyle = gradient;
  ctx.shadowColor = "#ff39c8";
  ctx.shadowBlur = 18;
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.shadowBlur = 0;
}

function drawBricks() {
  bricks.forEach((b, i) => {
    if (!b.visible) return;

    const colors = ["#38bdf8", "#7c3aed", "#ff39c8", "#facc15", "#22c55e"];
    const color = colors[i % colors.length];

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.fillRect(b.x, b.y, brick.w, brick.h);
    ctx.shadowBlur = 0;
  });
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Score: " + score, canvas.width - 135, 34);
}

function drawOverlay(text) {
  ctx.fillStyle = "rgba(0,0,0,.45)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.font = "bold 38px Arial";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  ctx.font = "18px Arial";
  ctx.fillText("Press Start or Space", canvas.width / 2, canvas.height / 2 + 35);

  ctx.textAlign = "left";
}

function draw() {
  drawBackground();
  drawBricks();
  drawPaddle();
  drawBall();
  drawScore();

  if (!running) {
    drawOverlay("Breakout");
  }
}

function movePaddle() {
  paddle.x += paddle.dx;

  if (paddle.x < 0) paddle.x = 0;

  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1;
    playSound(260, 0.05);
  }

  if (ball.y - ball.size < 0) {
    ball.dy *= -1;
    playSound(300, 0.05);
  }

  if (
    ball.y + ball.size >= paddle.y &&
    ball.y - ball.size <= paddle.y + paddle.h &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.w &&
    ball.dy > 0
  ) {
    const hitPoint = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
    ball.dx = hitPoint * ball.speed;
    ball.dy = -Math.abs(ball.speed);
    ball.y = paddle.y - ball.size;

    playSound(560, 0.08, "triangle");
  }

  bricks.forEach(b => {
    if (!b.visible) return;

    if (
      ball.x + ball.size > b.x &&
      ball.x - ball.size < b.x + brick.w &&
      ball.y + ball.size > b.y &&
      ball.y - ball.size < b.y + brick.h
    ) {
      b.visible = false;
      ball.dy *= -1;
      score++;
scoreText.textContent = score;
playSound(820, 0.07, "square");

const allCleared = bricks.every(brick => !brick.visible);

if (allCleared) {
  running = false;
  cancelAnimationFrame(animationId);
  draw();
  drawOverlay("Level Complete 🎉");

  setTimeout(() => {
    ball.speed += 1;
    resetGame();
    startGame();
  }, 1200);
}
      playSound(820, 0.07, "square");
    }
  });

  if (ball.y - ball.size > canvas.height) {
    running = false;
    playSound(120, 0.2, "sawtooth");
    cancelAnimationFrame(animationId);
    resetGame();
  }
}

function update() {
  if (!running) return;

  movePaddle();
  moveBall();
  draw();

  animationId = requestAnimationFrame(update);
}

document.addEventListener("keydown", e => {
  if (["ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
    e.preventDefault();
  }

  if (e.code === "ArrowRight") paddle.dx = paddle.speed;
  if (e.code === "ArrowLeft") paddle.dx = -paddle.speed;
  if (e.code === "Space") startGame();
});

document.addEventListener("keyup", e => {
  if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
    paddle.dx = 0;
  }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
const mobileLeft = document.getElementById("mobileLeft");
const mobileRight = document.getElementById("mobileRight");
const mobileStart = document.getElementById("mobileStart");

function holdMobileButton(button, direction) {
  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    paddle.dx = direction;
  });

  button.addEventListener("pointerup", () => {
    paddle.dx = 0;
  });

  button.addEventListener("pointerleave", () => {
    paddle.dx = 0;
  });

  button.addEventListener("pointercancel", () => {
    paddle.dx = 0;
  });
}

holdMobileButton(mobileLeft, -paddle.speed);
holdMobileButton(mobileRight, paddle.speed);

mobileStart.addEventListener("click", startGame);
resetGame();