const fs = require("fs");
const path = require("path");

const slug = process.argv[2];
const title = process.argv[3];
const category = process.argv[4] || "Arcade";

if (!slug || !title) {
  console.log('\nUsage: node add-game.js game-slug "Game Title" "Category"\n');
  process.exit(1);
}

const ROOT = __dirname;
const gameDir = path.join(ROOT, "game", slug);
const homePath = path.join(ROOT, "index.html");
const sitemapPath = path.join(ROOT, "sitemap.xml");

const gameUrl = `game/${slug}/`;
const liveUrl = `https://sky-hopper.lakshyasingh2567.workers.dev/game/${slug}/`;

fs.mkdirSync(gameDir, { recursive: true });

createGameFiles();
updateHomepage();
updateSitemap();

console.log(`\n✅ ${title} setup complete!`);
console.log(`📁 Folder: game/${slug}/`);
console.log(`🌐 Local: http://127.0.0.1:5500/game/${slug}/`);
console.log(`\nNext: paste/import the real game engine inside game/${slug}/\n`);

function createGameFiles() {
  const indexFile = path.join(gameDir, "index.html");
  const styleFile = path.join(gameDir, "style.css");
  const scriptFile = path.join(gameDir, "script.js");

  if (!fs.existsSync(indexFile)) {
    fs.writeFileSync(indexFile, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${title} - Play Free Online ${category} Game | PlayPixel Games</title>
  <meta name="description" content="Play ${title} online for free on PlayPixel Games. Enjoy this ${category.toLowerCase()} browser game instantly on mobile and desktop." />

  <link rel="stylesheet" href="style.css" />
</head>
<body>

<nav class="game-nav">
  <strong>🎮 PlayPixel Games</strong>
  <div>
    <a href="../../index.html">Home</a>
    <a href="../sky-hopper/">Sky Hopper</a>
    <a href="../2048/">2048</a>
    <a href="../snake/">Snake</a>
  </div>
</nav>

<main class="page">
  <h1>${title}</h1>
  <p class="intro">Play ${title} online for free.</p>

  <div class="ad-slot">Advertisement</div>

  <section class="game-wrapper">
    <div class="game-placeholder">
      <h2>${title}</h2>
      <p>Paste or import the real game engine here.</p>
    </div>
  </section>

  <section class="info">
    <h2>About ${title}</h2>
    <p>${title} is a free online ${category.toLowerCase()} game you can play directly in your browser without downloading anything.</p>

    <h2>How to Play</h2>
    <p>Use keyboard, mouse, touch, or on-screen controls depending on the game.</p>

    <h2>FAQ</h2>
    <p><strong>Is ${title} free?</strong><br>Yes, ${title} is free to play online.</p>
    <p><strong>Do I need to download anything?</strong><br>No, the game runs directly in your browser.</p>
  </section>

  <div class="ad-slot">Advertisement</div>
</main>

<script src="script.js"></script>
</body>
</html>`);
  }

  if (!fs.existsSync(styleFile)) {
    fs.writeFileSync(styleFile, `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: radial-gradient(circle at top, #17002e, #020008 75%);
  color: white;
  text-align: center;
}

.game-nav {
  max-width: 1100px;
  margin: 18px auto;
  padding: 16px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(124,58,237,.5);
  border-radius: 18px;
}

.game-nav a {
  color: white;
  text-decoration: none;
  margin-left: 12px;
  font-weight: bold;
}

.page {
  max-width: 1100px;
  margin: auto;
  padding: 18px;
}

h1 {
  font-size: 42px;
  margin-bottom: 8px;
}

.intro {
  color: #c4b5fd;
  font-size: 18px;
}

.ad-slot {
  max-width: 760px;
  height: 90px;
  margin: 24px auto;
  border: 1px dashed rgba(255,255,255,.35);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  background: rgba(255,255,255,.05);
}

.game-wrapper {
  max-width: 800px;
  margin: 24px auto;
  padding: 22px;
  background: #050b1c;
  border: 2px solid #7c3aed;
  border-radius: 24px;
  box-shadow: 0 0 35px rgba(124,58,237,.55);
}

.game-placeholder {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(255,255,255,.25);
  border-radius: 18px;
}

.info {
  max-width: 800px;
  margin: 24px auto;
  padding: 24px;
  background: white;
  color: #111827;
  border-radius: 20px;
  text-align: left;
  line-height: 1.7;
}

.info h2 {
  color: #7c3aed;
}

@media(max-width: 700px) {
  .game-nav {
    flex-direction: column;
    gap: 12px;
    margin: 12px;
  }

  .game-nav div {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  h1 {
    font-size: 30px;
  }

  .ad-slot {
    height: 220px;
  }
}`);
  }

  if (!fs.existsSync(scriptFile)) {
    fs.writeFileSync(scriptFile, `console.log("${title} loaded");`);
  }
}

function updateHomepage() {
  if (!fs.existsSync(homePath)) return;

  let home = fs.readFileSync(homePath, "utf8");

  if (home.includes(`href="${gameUrl}"`)) {
    console.log("ℹ️ Homepage already contains this game.");
    return;
  }

  const card = `
    <div class="card" data-name="${slug} ${title.toLowerCase()} ${category.toLowerCase()}">
      <div class="thumb">🎮</div>
      <div class="card-content">
        <h3>${title}</h3>
        <p>Play ${title} online for free.</p>
        <div class="meta">
          <span>${category}</span>
          <span>New</span>
        </div>
        <a class="play-small" href="${gameUrl}">▶ Play Now</a>
      </div>
    </div>
`;

  const marker = `<div class="card" data-name="ai games prompt challenge">`;

  if (home.includes(marker)) {
    home = home.replace(marker, `${card}\n    ${marker}`);
  } else {
    home = home.replace(`</div>\n</section>`, `${card}\n  </div>\n</section>`);
  }

  fs.writeFileSync(homePath, home);
  console.log("✅ Homepage updated.");
}

function updateSitemap() {
  if (!fs.existsSync(sitemapPath)) return;

let sitemap = fs.readFileSync(sitemapPath, "utf8");

  if (sitemap.includes(liveUrl)) {
    console.log("ℹ️ Sitemap already contains this game.");
    return;
  }

  const entry = `
  <url>
    <loc>${liveUrl}</loc>
  </url>`;

  sitemap = sitemap.replace("</urlset>", `${entry}\n</urlset>`);

  fs.writeFileSync(sitemapPath, sitemap);
  console.log("✅ Sitemap updated.");
}