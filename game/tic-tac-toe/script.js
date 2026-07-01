const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");

const xScoreEl = document.getElementById("xScore");
const oScoreEl = document.getElementById("oScore");
const drawScoreEl = document.getElementById("drawScore");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let running = true;

let xScore = 0;
let oScore = 0;
let drawScore = 0;

const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

cells.forEach(cell => {
  cell.addEventListener("click", handleCellClick);
});

restartBtn.addEventListener("click", restartGame);

function handleCellClick() {
  const index = this.dataset.index;

  if (board[index] !== "" || !running) return;

  board[index] = currentPlayer;
  this.textContent = currentPlayer;
  this.classList.add(currentPlayer.toLowerCase());

  checkResult();
}

function checkResult() {
  let roundWon = false;
  let winningPattern = [];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      roundWon = true;
      winningPattern = pattern;
      break;
    }
  }

  if (roundWon) {
    statusText.textContent = `${currentPlayer} Wins! 🎉`;
    running = false;

    winningPattern.forEach(index => {
      cells[index].classList.add("win");
    });

    if (currentPlayer === "X") xScore++;
    else oScore++;

    updateScore();
    return;
  }

  if (!board.includes("")) {
    statusText.textContent = "It's a Draw!";
    drawScore++;
    updateScore();
    running = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `${currentPlayer}'s Turn`;
}

function updateScore() {
  xScoreEl.textContent = xScore;
  oScoreEl.textContent = oScore;
  drawScoreEl.textContent = drawScore;
}

function restartGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  running = true;
  statusText.textContent = "X's Turn";

  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "win");
  });
}