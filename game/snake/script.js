const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const lengthEl = document.getElementById("length");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const grid = 24;
const cell = canvas.width / grid;

let snake, food, direction, nextDirection, score, loop, running;
let best = Number(localStorage.getItem("playpixelSnakeBest")) || 0;

bestEl.textContent = best;

function resetGame(){
  snake = [{x:12,y:12}];
  direction = {x:1,y:0};
  nextDirection = {x:1,y:0};
  score = 0;
  running = false;
  placeFood();
  updateUI();
  draw();
}

function startGame(){
  if(running) return;
  running = true;
  clearInterval(loop);
  loop = setInterval(update, 170); // slower speed
}

function restartGame(){
  clearInterval(loop);
  resetGame();
  startGame();
}

function updateUI(){
  scoreEl.textContent = score;
  lengthEl.textContent = snake.length;

  if(score > best){
    best = score;
    localStorage.setItem("playpixelSnakeBest", best);
  }

  bestEl.textContent = best;
}

function placeFood(){
  food = {
    x: Math.floor(Math.random() * grid),
    y: Math.floor(Math.random() * grid)
  };

  if(snake.some(p => p.x === food.x && p.y === food.y)){
    placeFood();
  }
}

function update(){
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  if(
    head.x < 0 || head.x >= grid ||
    head.y < 0 || head.y >= grid ||
    snake.some(p => p.x === head.x && p.y === head.y)
  ){
    clearInterval(loop);
    running = false;
    alert("Game Over!");
    return;
  }

  snake.unshift(head);

  if(head.x === food.x && head.y === food.y){
    score += 10;
    placeFood();
  }else{
    snake.pop();
  }

  updateUI();
  draw();
}

function draw(){
  drawBackground();
  drawFood();
  drawSnake();
}

function drawBackground(){
  ctx.fillStyle = "#061426";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle = "rgba(56,189,248,.13)";
  ctx.lineWidth = 1;

  for(let i=0;i<=grid;i++){
    ctx.beginPath();
    ctx.moveTo(i*cell,0);
    ctx.lineTo(i*cell,canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,i*cell);
    ctx.lineTo(canvas.width,i*cell);
    ctx.stroke();
  }
}

function drawFood(){
  const x = food.x * cell + cell/2;
  const y = food.y * cell + cell/2;

  ctx.shadowColor = "#ef4444";
  ctx.shadowBlur = 25;
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x,y,cell/2.8,0,Math.PI*2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#86efac";
  ctx.beginPath();
  ctx.arc(x+5,y-10,5,0,Math.PI*2);
  ctx.fill();
}

function drawSnake(){
  snake.forEach((part,index)=>{
    const x = part.x * cell;
    const y = part.y * cell;

    const gradient = ctx.createLinearGradient(x,y,x+cell,y+cell);
    gradient.addColorStop(0,index===0 ? "#a3e635" : "#65a30d");
    gradient.addColorStop(1,index===0 ? "#22c55e" : "#84cc16");

    ctx.shadowColor = "#84cc16";
    ctx.shadowBlur = index===0 ? 18 : 8;

    ctx.fillStyle = gradient;
    roundRect(x+3,y+3,cell-6,cell-6,10);
    ctx.fill();

    ctx.shadowBlur = 0;

    if(index === 0){
      drawEyes(x,y);
    }
  });
}

function drawEyes(x,y){
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x+cell*0.35,y+cell*0.35,4,0,Math.PI*2);
  ctx.arc(x+cell*0.65,y+cell*0.35,4,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x+cell*0.35,y+cell*0.35,2,0,Math.PI*2);
  ctx.arc(x+cell*0.65,y+cell*0.35,2,0,Math.PI*2);
  ctx.fill();
}

function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y);
}

function setDirection(dir){
  if(dir==="up" && direction.y !== 1) nextDirection = {x:0,y:-1};
  if(dir==="down" && direction.y !== -1) nextDirection = {x:0,y:1};
  if(dir==="left" && direction.x !== 1) nextDirection = {x:-1,y:0};
  if(dir==="right" && direction.x !== -1) nextDirection = {x:1,y:0};
}

document.addEventListener("keydown", e => {
  const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

  if (keys.includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === "ArrowUp") setDirection("up");
  if (e.key === "ArrowDown") setDirection("down");
  if (e.key === "ArrowLeft") setDirection("left");
  if (e.key === "ArrowRight") setDirection("right");
});

document.querySelectorAll("[data-dir]").forEach(btn=>{
  btn.addEventListener("click",()=>setDirection(btn.dataset.dir));
});

startBtn.onclick = startGame;
restartBtn.onclick = restartGame;

resetGame();