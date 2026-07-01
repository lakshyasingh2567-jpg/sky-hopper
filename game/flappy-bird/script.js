const box = document.querySelector(".game-box");

box.innerHTML = `
  <canvas id="flappyCanvas" width="420" height="560"></canvas>
  <div class="flappy-controls">
    <button id="startBtn">Start Game</button>
    <button id="restartBtn">Restart</button>
  </div>
  <p class="flappy-tip">Press Space / Click / Tap to fly</p>
`;

const canvas = document.getElementById("flappyCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

let bird, pipes, score, best, gravity, jump, running, gameOver, frame, loop;

best = Number(localStorage.getItem("flappyBest")) || 0;

function resetGame() {
  bird = { x: 80, y: 240, size: 22, velocity: 0 };
  pipes = [];
  score = 0;
  gravity = 0.42;
  jump = -7.5;
  running = false;
  gameOver = false;
  frame = 0;
  draw();
}

function startGame() {
  if (running) return;
  running = true;
  clearInterval(loop);
  loop = setInterval(update, 1000 / 60);
}

function flap() {
  if (!running) startGame();
  if (!gameOver) bird.velocity = jump;
}

function update() {
  frame++;
  bird.velocity += gravity;
  bird.y += bird.velocity;

  if (frame % 95 === 0) {
    const gap = 145;
    const top = Math.random() * 230 + 60;
    pipes.push({ x: canvas.width, top, bottom: top + gap, passed: false });
  }

  pipes.forEach(pipe => {
    pipe.x -= 2.4;

    if (!pipe.passed && pipe.x + 58 < bird.x) {
      pipe.passed = true;
      score++;
      if (score > best) {
        best = score;
        localStorage.setItem("flappyBest", best);
      }
    }

    const hitX = bird.x + bird.size > pipe.x && bird.x - bird.size < pipe.x + 58;
    const hitY = bird.y - bird.size < pipe.top || bird.y + bird.size > pipe.bottom;

    if (hitX && hitY) endGame();
  });

  pipes = pipes.filter(pipe => pipe.x > -80);

  if (bird.y + bird.size > canvas.height || bird.y - bird.size < 0) {
    endGame();
  }

  draw();
}

function endGame() {
  running = false;
  gameOver = true;
  clearInterval(loop);
  draw();
}

function draw() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#38bdf8");
  sky.addColorStop(1, "#e0f7ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCloud(70, 90);
  drawCloud(270, 160);

  pipes.forEach(pipe => {
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(pipe.x, 0, 58, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, 58, canvas.height - pipe.bottom);

    ctx.fillStyle = "#16a34a";
    ctx.fillRect(pipe.x - 5, pipe.top - 18, 68, 18);
    ctx.fillRect(pipe.x - 5, pipe.bottom, 68, 18);
  });

  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.size, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fb923c";
  ctx.beginPath();
  ctx.moveTo(bird.x + bird.size, bird.y);
  ctx.lineTo(bird.x + bird.size + 15, bird.y - 7);
  ctx.lineTo(bird.x + bird.size + 15, bird.y + 7);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(bird.x + 8, bird.y - 8, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(bird.x + 10, bird.y - 8, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.font = "bold 26px Arial";
  ctx.fillText("Score: " + score, 18, 38);
  ctx.fillText("Best: " + best, 18, 70);

  if (!running && !gameOver) {
    overlay("Click Start or Press Space");
  }

  if (gameOver) {
    overlay("Game Over");
  }
}

function drawCloud(x, y) {
  ctx.fillStyle = "rgba(255,255,255,.75)";
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.arc(x + 22, y - 10, 28, 0, Math.PI * 2);
  ctx.arc(x + 50, y, 22, 0, Math.PI * 2);
  ctx.fill();
}

function overlay(text) {
  ctx.fillStyle = "rgba(0,0,0,.45)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "bold 30px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 20);

  ctx.font = "18px Arial";
  ctx.fillText("Tap / Click / Space to fly", canvas.width / 2, canvas.height / 2 + 20);
  ctx.textAlign = "left";
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
restartBtn.onclick = () => {
  clearInterval(loop);
  resetGame();
};

resetGame();