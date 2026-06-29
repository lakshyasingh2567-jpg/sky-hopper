window.onload = function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const startScreen = document.getElementById("startScreen");
  const gameOverScreen = document.getElementById("gameOverScreen");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const finalScore = document.getElementById("finalScore");
  const highScoreText = document.getElementById("highScoreText");
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");

  canvas.width = 420;
  canvas.height = 620;

  const playerImg = new Image();
  playerImg.src = "assets/images/player.png";
  const platformImg = new Image();
  platformImg.src = "assets/images/platform.png";
  const coinImg = new Image();
  coinImg.src = "assets/images/coin.png";
  const cloudImg = new Image();
  cloudImg.src = "assets/images/cloud.png";

  const bgMusic = new Audio("assets/sounds/background.wav");
  const jumpSound = new Audio("assets/sounds/jump.wav");
  const coinSound = new Audio("assets/sounds/coin.wav");
  const gameOverSound = new Audio("assets/sounds/gameover.wav");

  bgMusic.loop = true;
  bgMusic.volume = 0.22;
  jumpSound.volume = 0.35;
  coinSound.volume = 0.55;
  gameOverSound.volume = 0.5;

  function playSound(sound) {
    try {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    } catch (error) {}
  }

  function startMusic() {
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
  }

  function stopMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  let player, platforms, coins, particles, score, coinCount, animationId;
  let highScore = Number(localStorage.getItem("skyHopperHighScore")) || 0;
  let gravity = 0.55;
  let jumpPower = -11.8;
  let moveSpeed = 4.7;
  let scrollSpeed = 1.15;
  let keys = {};
  let gameRunning = false;
  let cloudOffset = 0;

  function resetGame() {
    player = { x: 190, y: 430, width: 36, height: 36, velocityY: jumpPower };

    platforms = [
      { x: 155, y: 470, width: 70, height: 18 },
      { x: 70, y: 405, width: 62, height: 18 },
      { x: 245, y: 340, width: 62, height: 18 },
      { x: 120, y: 275, width: 58, height: 18 },
      { x: 260, y: 210, width: 55, height: 18 },
      { x: 80, y: 145, width: 55, height: 18 }
    ];

    coins = [];
    particles = [];
    platforms.forEach(p => maybeAddCoin(p));

    score = 0;
    coinCount = 0;
    scrollSpeed = 1.15;
  }

  function maybeAddCoin(platform) {
    if (Math.random() < 0.55) {
      coins.push({
        x: platform.x + platform.width / 2,
        y: platform.y - 24,
        radius: 10,
        collected: false,
        spin: Math.random() * 10
      });
    }
  }

  function startGame() {
    cancelAnimationFrame(animationId);
    resetGame();
    gameRunning = true;
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    startMusic();
    playSound(jumpSound);
    gameLoop();
  }

  function movePlayer() {
    if (keys["ArrowLeft"] || keys["KeyA"] || keys["left"]) player.x -= moveSpeed;
    if (keys["ArrowRight"] || keys["KeyD"] || keys["right"]) player.x += moveSpeed;

    if (player.x < -player.width) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -player.width;
  }

  function applyGravity() {
    player.velocityY += gravity;
    player.y += player.velocityY;
  }

  function moveScreenUp() {
    platforms.forEach(platform => platform.y += scrollSpeed);
    coins.forEach(coin => coin.y += scrollSpeed);
    particles.forEach(p => p.y += scrollSpeed);

    scrollSpeed = 1.15 + score * 0.016;
    if (scrollSpeed > 3) scrollSpeed = 3;
  }

  function addParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 25,
        color
      });
    }
  }

  function updateParticles() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });
    particles = particles.filter(p => p.life > 0);
  }

  function checkCollision() {
    platforms.forEach(platform => {
      const playerBottom = player.y + player.height;
      const previousBottom = playerBottom - player.velocityY;

      if (
        player.velocityY >= 0 &&
        player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        playerBottom >= platform.y &&
        previousBottom <= platform.y + scrollSpeed + 6
      ) {
        player.y = platform.y - player.height;
        player.velocityY = jumpPower;
        addParticles(player.x + player.width / 2, player.y + player.height, "#ffffff");
        playSound(jumpSound);
      }
    });
  }

  function checkCoinCollection() {
    coins.forEach(coin => {
      if (coin.collected) return;

      const closestX = Math.max(player.x, Math.min(coin.x, player.x + player.width));
      const closestY = Math.max(player.y, Math.min(coin.y, player.y + player.height));
      const dx = coin.x - closestX;
      const dy = coin.y - closestY;

      if (dx * dx + dy * dy < coin.radius * coin.radius) {
        coin.collected = true;
        coinCount++;
        score += 2;
        addParticles(coin.x, coin.y, "#ffbe0b");
        playSound(coinSound);
      }
    });
  }

  function updatePlatforms() {
    platforms = platforms.filter(platform => platform.y < canvas.height + 40);
    coins = coins.filter(coin => coin.y < canvas.height + 40 && !coin.collected);

    while (platforms.length < 8) {
      const highestY = Math.min(...platforms.map(p => p.y));
      const difficulty = Math.min(score, 100);
      const platformWidth = Math.max(42, 65 - difficulty * 0.25);
      const gap = 52 + Math.random() * 18;

      const newPlatform = {
        x: Math.random() * (canvas.width - platformWidth),
        y: highestY - gap,
        width: platformWidth,
        height: 18
      };

      platforms.push(newPlatform);
      maybeAddCoin(newPlatform);
    }
  }

  function updateScore() {
    score += 0.02;
  }

  function checkGameOver() {
    if (player.y > canvas.height || player.y < -70) endGame();
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#72d6ff");
    gradient.addColorStop(1, "#eafaff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    cloudOffset += 0.25;
    drawCloud((60 + cloudOffset) % 520 - 100, 85, 1);
    drawCloud((270 + cloudOffset * 0.6) % 520 - 100, 185, 0.75);
  }

  function drawCloud(x, y, s) {
    if (cloudImg.complete) {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(cloudImg, x, y, 140 * s, 70 * s);
      ctx.globalAlpha = 1;
    }
  }

  function drawPlatforms() {
    platforms.forEach(platform => {
      if (platformImg.complete) {
        ctx.drawImage(platformImg, platform.x, platform.y - 6, platform.width, platform.height + 12);
      } else {
        ctx.fillStyle = "#2ed573";
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      }
    });
  }

  function drawCoins() {
    coins.forEach(coin => {
      if (coin.collected) return;
      coin.spin += 0.1;
      const w = 22 + Math.sin(coin.spin) * 5;
      if (coinImg.complete) {
        ctx.drawImage(coinImg, coin.x - w / 2, coin.y - 11, w, 22);
      }
    });
  }

  function drawPlayer() {
    if (playerImg.complete) {
      ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    } else {
      ctx.fillStyle = "#ff4757";
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.life / 25;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function drawScore() {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.roundRect(12, 12, 130, 92, 12);
    ctx.fill();
    ctx.fillStyle = "#123";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + Math.floor(score), 22, 38);
    ctx.fillText("Best: " + highScore, 22, 65);
    ctx.fillText("Coins: " + coinCount, 22, 92);
  }

  function endGame() {
    if (!gameRunning) return;

    gameRunning = false;
    cancelAnimationFrame(animationId);
    stopMusic();
    playSound(gameOverSound);

    const final = Math.floor(score);

    if (final > highScore) {
      highScore = final;
      localStorage.setItem("skyHopperHighScore", highScore);
    }

    finalScore.textContent = final;
    highScoreText.textContent = highScore;
    gameOverScreen.classList.remove("hidden");
  }

  function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    applyGravity();
    moveScreenUp();
    checkCollision();
    checkCoinCollection();
    updatePlatforms();
    updateParticles();
    updateScore();
    checkGameOver();

    drawBackground();
    drawPlatforms();
    drawCoins();
    drawParticles();
    drawPlayer();
    drawScore();

    animationId = requestAnimationFrame(gameLoop);
  }

  function holdButton(key, value) {
    keys[key] = value;
  }

  startBtn.onclick = startGame;
  restartBtn.onclick = startGame;

  document.addEventListener("keydown", e => keys[e.code] = true);
  document.addEventListener("keyup", e => keys[e.code] = false);

  leftBtn.addEventListener("pointerdown", e => {
    e.preventDefault();
    holdButton("left", true);
  });
  leftBtn.addEventListener("pointerup", () => holdButton("left", false));
  leftBtn.addEventListener("pointerleave", () => holdButton("left", false));
  leftBtn.addEventListener("pointercancel", () => holdButton("left", false));

  rightBtn.addEventListener("pointerdown", e => {
    e.preventDefault();
    holdButton("right", true);
  });
  rightBtn.addEventListener("pointerup", () => holdButton("right", false));
  rightBtn.addEventListener("pointerleave", () => holdButton("right", false));
  rightBtn.addEventListener("pointercancel", () => holdButton("right", false));
};
