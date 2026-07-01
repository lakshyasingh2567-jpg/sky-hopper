const canvas = document.getElementById("flappyCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const bestText = document.getElementById("bestText");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

let bird, pipes, score, best, frame, running, gameOver, animationId;
best = Number(localStorage.getItem("playpixelFlappyBest")) || 0;
bestText.textContent = best;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function sound(freq, duration, type = "sine") {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.08;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function flapSound() { sound(520, 0.07, "square"); }
function scoreSound() { sound(760, 0.1, "sine"); }
function hitSound() { sound(120, 0.18, "sawtooth"); }

function resetGame() {
  bird = { x: 120, y: 230, r: 20, v: 0 };
  pipes = [];
  score = 0;
  frame = 0;
  running = false;
  gameOver = false;
  updateScore();
  draw();
}

function startGame() {
  if (running) return;
  audioCtx.resume();
  running = true;
  gameOver = false;
  cancelAnimationFrame(animationId);
  gameLoop();
}

function restartGame() {
  cancelAnimationFrame(animationId);
  resetGame();
  startGame();
}

function flap() {
  if (!running) startGame();
  if (gameOver) return;
  bird.v = -7.8;
  flapSound();
}

function updateScore() {
  scoreText.textContent = score;
  if (score > best) {
    best = score;
    localStorage.setItem("playpixelFlappyBest", best);
  }
  bestText.textContent = best;
}

function addPipe() {
  const gap = 145;
  const top = Math.random() * 210 + 60;
  pipes.push({
    x: canvas.width,
    top,
    bottom: top + gap,
    w: 70,
    passed: false
  });
}

function update() {
  frame++;

  bird.v += 0.38;
  bird.y += bird.v;

  if (frame % 105 === 0) addPipe();

  pipes.forEach(pipe => {
    pipe.x -= 2.6;

    if (!pipe.passed && pipe.x + pipe.w < bird.x) {
      pipe.passed = true;
      score++;
      scoreSound();
      updateScore();
    }

    const hitX = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + pipe.w;
    const hitY = bird.y - bird.r < pipe.top || bird.y + bird.r > pipe.bottom;

    if (hitX && hitY) endGame();
  });

  pipes = pipes.filter(pipe => pipe.x > -100);

  if (bird.y + bird.r > canvas.height || bird.y - bird.r < 0) {
    endGame();
  }
}

function endGame() {
  if (gameOver) return;
  running = false;
  gameOver = true;
  hitSound();
  cancelAnimationFrame(animationId);
  draw();
}

function draw() {
  drawBackground();
  drawPipes();
  drawBird();
  drawOverlay();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#38bdf8");
  gradient.addColorStop(1, "#dff7ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,.75)";
  drawCloud(120, 90);
  drawCloud(420, 150);
  drawCloud(610, 80);

  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, canvas.height - 45, canvas.width, 45);
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.arc(x + 28, y - 12, 32, 0, Math.PI * 2);
  ctx.arc(x + 62, y, 24, 0, Math.PI * 2);
  ctx.fill();
}

function drawPipes() {
  pipes.forEach(pipe => {
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(pipe.x, 0, pipe.w, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipe.w, canvas.height - pipe.bottom - 45);

    ctx.fillStyle = "#16a34a";
    ctx.fillRect(pipe.x - 6, pipe.top - 18, pipe.w + 12, 18);
    ctx.fillRect(pipe.x - 6, pipe.bottom, pipe.w + 12, 18);
  });
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(Math.min(Math.max(bird.v * 0.05, -0.5), 0.8));

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fb923c";
  ctx.beginPath();
  ctx.moveTo(bird.r, 0);
  ctx.lineTo(bird.r + 18, -8);
  ctx.lineTo(bird.r + 18, 8);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(7, -8, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(9, -8, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawOverlay() {
  ctx.fillStyle = "#111827";
  ctx.font = "bold 28px Arial";
  ctx.fillText("Score: " + score, 22, 38);

  if (!running && !gameOver) {
    showCenterText("Press Start", "Tap / Click / Space to fly");
  }

  if (gameOver) {
    showCenterText("Game Over", "Click Restart and beat your score!");
  }
}

function showCenterText(title, subtitle) {
  ctx.fillStyle = "rgba(0,0,0,.45)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.font = "bold 42px Arial";
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 25);

  ctx.font = "20px Arial";
  ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 20);
  ctx.textAlign = "left";
}

function gameLoop() {
  if (!running) return;
  update();
  draw();
  animationId = requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", e => {
  if (e.code === "Space" || e.key === "ArrowUp") {
    e.preventDefault();
    flap();
  }
});

canvas.addEventListener("click", flap);
canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  flap();
}, { passive: false });

startBtn.onclick = startGame;
restartBtn.onclick = restartGame;

resetGame();