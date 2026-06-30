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

  canvas.width = 540;
  canvas.height = 960;

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
  let jumpPower = -12.2;
  let moveSpeed = 5.2;
  let scrollSpeed = 1.15;
  let keys = {};
  let gameRunning = false;
  let cloudOffset = 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function resetGame() {
    player = {
      x: canvas.width / 2 - 18,
      y: 720,
      width: 38,
      height: 38,
      velocityY: jumpPower
    };

    platforms = [];
    coins = [];
    particles = [];

    let x = canvas.width / 2 - 50;
    let y = 830;

    for (let i = 0; i < 12; i++) {
      const width = i < 3 ? 105 : 85;
      const platform = createNextPlatform(x, y, width, i);

      platforms.push(platform);
      maybeAddCoin(platform);

      x = platform.x;
      y = platform.y;
    }

    score = 0;
    coinCount = 0;
    scrollSpeed = 1.15;
  }

  function createNextPlatform(previousX, previousY, width, index = 0) {
    const platformWidth = width || 85;

    let verticalGap;

    if (index < 4) {
      verticalGap = 65 + Math.random() * 15;
    } else {
      verticalGap = 68 + Math.random() * 24;
    }

    const direction = Math.random() < 0.5 ? -1 : 1;
    const randomness = Math.random();

    let horizontalMove;

    if (randomness < 0.5) {
      horizontalMove = 35 + Math.random() * 55;
    } else if (randomness < 0.85) {
      horizontalMove = 90 + Math.random() * 55;
    } else {
      horizontalMove = 145 + Math.random() * 35;
    }

    let nextX = previousX + direction * horizontalMove;

    if (nextX < 25 || nextX > canvas.width - platformWidth - 25) {
      nextX = previousX - direction * horizontalMove;
    }

    nextX = clamp(nextX, 25, canvas.width - platformWidth - 25);

    return {
      x: nextX,
      y: previousY - verticalGap,
      width: platformWidth,
      height: 18
    };
  }

  function maybeAddCoin(platform) {
    if (Math.random() < 0.5) {
      coins.push({
        x: platform.x + platform.width / 2,
        y: platform.y - 26,
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

    scrollSpeed = 1.15 + score * 0.012;
    if (scrollSpeed > 2.6) scrollSpeed = 2.6;
  }

  function addParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      particles.push({
        x,
        y,
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
        previousBottom <= platform.y + scrollSpeed + 10
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
    platforms = platforms.filter(platform => platform.y < canvas.height + 60);
    coins = coins.filter(coin => coin.y < canvas.height + 60 && !coin.collected);

    while (platforms.length < 12) {
      const highestPlatform = platforms.reduce(
        (top, p) => (p.y < top.y ? p : top),
        platforms[0]
      );

      const difficulty = Math.min(score, 120);
      const platformWidth = Math.max(60, 95 - difficulty * 0.16);

      const newPlatform = createNextPlatform(
        highestPlatform.x,
        highestPlatform.y,
        platformWidth,
        6
      );

      platforms.push(newPlatform);
      maybeAddCoin(newPlatform);
    }
  }

  function updateScore() {
    score += 0.02;
  }

  function checkGameOver() {
    if (player.y > canvas.height + 80 || player.y < -120) {
      endGame();
    }
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#72d6ff");
    gradient.addColorStop(1, "#eafaff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    cloudOffset += 0.25;
    drawCloud((60 + cloudOffset) % 650 - 120, 100, 1);
    drawCloud((330 + cloudOffset * 0.6) % 650 - 120, 230, 0.75);
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
    ctx.roundRect(12, 12, 145, 94, 12);
    ctx.fill();

    ctx.fillStyle = "#123";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + Math.floor(score), 22, 40);
    ctx.fillText("Best: " + highScore, 22, 68);
    ctx.fillText("Coins: " + coinCount, 22, 96);
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

  document.addEventListener("keydown", e => {
    keys[e.code] = true;
  });

  document.addEventListener("keyup", e => {
    keys[e.code] = false;
  });

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