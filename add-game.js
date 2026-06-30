const fs = require("fs");
const path = require("path");

const slug = process.argv[2];
const title = process.argv[3];
const category = process.argv[4] || "Arcade";

if (!slug || !title) {
  console.log('Usage: node add-game.js "game-slug" "Game Title" "Category"');
  process.exit(1);
}

const gameDir = path.join(__dirname, "game", slug);

if (!fs.existsSync(gameDir)) {
  fs.mkdirSync(gameDir, { recursive: true });
}

const indexPath = path.join(gameDir, "index.html");
const stylePath = path.join(gameDir, "style.css");
const scriptPath = path.join(gameDir, "script.js");

if (!fs.existsSync(indexPath)) {
  fs.writeFileSync(indexPath, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${title} - Play Free Online Game | PlayPixel Games</title>
  <meta name="description" content="Play ${title} online for free on PlayPixel Games. Enjoy this ${category.toLowerCase()} browser game instantly on mobile and desktop." />

  <link rel="stylesheet" href="style.css" />
</head>
<body>

<nav class="nav">
  <strong>🎮 PlayPixel Games</strong>
  <a href="../../index.html">Home</a>
</nav>

<main class="page">
  <h1>${title}</h1>
  <p class="intro">Play ${title} online for free.</p>

  <div class="ad">Advertisement</div>

  <section class="game-box">
    <h2>Game Area</h2>
    <p>Paste or build your game here.</p>
  </section>

  <section class="info">
    <h2>About ${title}</h2>
    <p>${title} is a free online ${category.toLowerCase()} game playable directly in your browser.</p>

    <h2>How to Play</h2>
    <p>Use keyboard, mouse, or mobile controls depending on the game.</p>

    <h2>FAQ</h2>
    <p><strong>Is ${title} free?</strong><br>Yes, it is free to play online.</p>
  </section>

  <div class="ad">Advertisement</div>
</main>

<script src="script.js"></script>
</body>
</html>`);
}

if (!fs.existsSync(stylePath)) {
  fs.writeFileSync(stylePath, `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #050014;
  color: white;
  text-align: center;
}

.nav {
  max-width: 1000px;
  margin: 20px auto;
  padding: 16px 22px;
  display: flex;
  justify-content: space-between;
  background: rgba(255,255,255,.08);
  border-radius: 16px;
}

.nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

.page {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

.game-box,
.info {
  margin: 25px auto;
  padding: 25px;
  max-width: 760px;
  background: rgba(255,255,255,.08);
  border-radius: 20px;
}

.ad {
  max-width: 760px;
  height: 90px;
  margin: 25px auto;
  border: 1px dashed rgba(255,255,255,.3);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
}

.info {
  text-align: left;
  line-height: 1.7;
}

@media(max-width: 700px) {
  .nav {
    flex-direction: column;
    gap: 10px;
    margin: 12px;
  }

  .ad {
    height: 220px;
  }
}`);
}

if (!fs.existsSync(scriptPath)) {
  fs.writeFileSync(scriptPath, `console.log("${title} loaded");`);
}

updateHomepage(slug, title, category);
updateSitemap(slug);

console.log(`✅ ${title} added successfully!`);
console.log(`📁 Folder created: game/${slug}`);
console.log(`🔗 Local URL: http://127.0.0.1:5500/game/${slug}/`);

function updateHomepage(slug, title, category) {
  const homePath = path.join(__dirname, "index.html");

  if (!fs.existsSync(homePath)) {
    console.log("⚠️ index.html not found. Homepage not updated.");
    return;
  }

  let home = fs.readFileSync(homePath, "utf8");

  if (home.includes(`game/${slug}/`)) {
    console.log("ℹ️ Homepage already has this game.");
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
        <a class="play-small" href="game/${slug}/">▶ Play Now</a>
      </div>
    </div>
`;

  home = home.replace("</div>\n</section>", `${card}</div>\n</section>`);

  fs.writeFileSync(homePath, home);
  console.log("✅ Homepage updated.");
}

function updateSitemap(slug) {
  const sitemapPath = path.join(__dirname, "sitemap.xml");

  if (!fs.existsSync(sitemapPath)) {
    console.log("⚠️ sitemap.xml not found. Sitemap not updated.");
    return;
  }

  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  const url = `https://sky-hopper.lakshyasingh2567.workers.dev/game/${slug}/`;

  if (sitemap.includes(url)) {
    console.log("ℹ️ Sitemap already has this game.");
    return;
  }

  const entry = `
  <url>
    <loc>${url}</loc>
  </url>`;

  sitemap = sitemap.replace("</urlset>", `${entry}\n</urlset>`);

  fs.writeFileSync(sitemapPath, sitemap);
  console.log("✅ Sitemap updated.");
}