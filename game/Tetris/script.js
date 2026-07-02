(function () {
  var isStart = false;

  var tetris = {
    board: [],
    canvas: null,
    pSize: 26,
    canvasHeight: 520,
    canvasWidth: 260,
    boardHeight: 0,
    boardWidth: 0,
    spawnX: 4,
    spawnY: 1,

    shapes: [
      [[-1, 1], [0, 1], [1, 1], [0, 0]],
      [[-1, 0], [0, 0], [1, 0], [2, 0]],
      [[-1, -1], [-1, 0], [0, 0], [1, 0]],
      [[1, -1], [-1, 0], [0, 0], [1, 0]],
      [[0, -1], [1, -1], [-1, 0], [0, 0]],
      [[-1, -1], [0, -1], [0, 0], [1, 0]],
      [[0, -1], [1, -1], [0, 0], [1, 0]]
    ],

    tempShapes: null,
    curShape: null,
    curShapeIndex: null,
    curX: 0,
    curY: 0,
    curSqs: [],
    nextShape: null,
    nextShapeIndex: null,
    sqs: [],

    score: 0,
    level: 1,
    lines: 0,
    time: 0,
    numLevels: 10,
    maxTime: 1000,
    speed: 700,
    isActive: 0,
    curComplete: false,
    timer: null,
    pTimer: null,

    init: function () {
      isStart = true;
      this.board = [];
      this.sqs = [];
      this.canvas = document.getElementById("canvas");
      this.canvas.innerHTML = "";
      this.initBoard();
      this.initInfo();
      this.initLevelScores();
      this.initShapes();
      this.bindKeyEvents();
      this.play();
    },

    initBoard: function () {
      this.boardHeight = this.canvasHeight / this.pSize;
      this.boardWidth = this.canvasWidth / this.pSize;

      for (var i = 0; i < this.boardHeight * this.boardWidth; i++) {
        this.board.push(0);
      }
    },

    initInfo: function () {
      this.nextShapeDisplay = document.getElementById("next_shape");
      this.levelDisplay = document.getElementById("level").getElementsByTagName("span")[0];
      this.timeDisplay = document.getElementById("time").getElementsByTagName("span")[0];
      this.scoreDisplay = document.getElementById("score").getElementsByTagName("span")[0];
      this.linesDisplay = document.getElementById("lines").getElementsByTagName("span")[0];

      this.setInfo("time");
      this.setInfo("score");
      this.setInfo("level");
      this.setInfo("lines");
    },

    initLevelScores: function () {
      var c = 1;
      for (var i = 1; i <= this.numLevels; i++) {
        this["level" + i] = [c * 1000, 40 * i, 5 * i];
        c = c + c;
      }
    },

    setInfo: function (el) {
      this[el + "Display"].innerHTML = this[el];
    },

    initTempShapes: function () {
      this.tempShapes = [];
      for (var i = 0; i < this.shapes.length; i++) this.tempShapes.push(i);

      for (var k = this.tempShapes.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1));
        var temp = this.tempShapes[k];
        this.tempShapes[k] = this.tempShapes[j];
        this.tempShapes[j] = temp;
      }
    },

    shiftTempShapes: function () {
      if (!this.tempShapes || this.tempShapes.length < 2) this.initTempShapes();
      else this.tempShapes.shift();
    },

    initShapes: function () {
      this.curSqs = [];
      this.curComplete = false;
      this.shiftTempShapes();

      this.curShapeIndex = this.tempShapes[0];
      this.curShape = this.shapes[this.curShapeIndex];

      this.initNextShape();
      this.setCurCoords(this.spawnX, this.spawnY);
      this.drawShape(this.curX, this.curY, this.curShape);
    },

    initNextShape: function () {
      if (typeof this.tempShapes[1] === "undefined") this.initTempShapes();

      this.nextShapeIndex = this.tempShapes[1];
      this.nextShape = this.shapes[this.nextShapeIndex];
      this.drawNextShape();
    },

    drawNextShape: function () {
      var ns = [];

      for (var i = 0; i < this.nextShape.length; i++) {
        ns[i] = this.createSquare(
          this.nextShape[i][0] + 2,
          this.nextShape[i][1] + 2,
          this.nextShapeIndex
        );
      }

      this.nextShapeDisplay.innerHTML = "";
      ns.forEach(sq => this.nextShapeDisplay.appendChild(sq));
    },

    createSquare: function (x, y, type) {
      var el = document.createElement("div");
      el.className = "square type" + type;
      el.style.left = x * this.pSize + "px";
      el.style.top = y * this.pSize + "px";
      return el;
    },

    drawShape: function (x, y, p) {
      for (var i = 0; i < p.length; i++) {
        var newX = p[i][0] + x;
        var newY = p[i][1] + y;
        this.curSqs[i] = this.createSquare(newX, newY, this.curShapeIndex);
      }

      this.curSqs.forEach(sq => this.canvas.appendChild(sq));
    },

    removeCur: function () {
      this.curSqs.forEach(sq => this.canvas.removeChild(sq));
      this.curSqs = [];
    },

    setCurCoords: function (x, y) {
      this.curX = x;
      this.curY = y;
    },

    bindKeyEvents: function () {
      var me = this;

      document.addEventListener("keydown", function (e) {
        me.handleKey(e);
      });

      document.getElementById("btnLeft").onclick = () => me.move("L");
      document.getElementById("btnRight").onclick = () => me.move("R");
      document.getElementById("btnRotate").onclick = () => me.move("RT");
      document.getElementById("btnDown").onclick = () => me.move("D");
    },

    handleKey: function (e) {
      const blocked = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape"];

      if (blocked.includes(e.key)) e.preventDefault();

      if (e.key === "ArrowLeft") this.move("L");
      if (e.key === "ArrowRight") this.move("R");
      if (e.key === "ArrowUp") this.move("RT");
      if (e.key === "ArrowDown") this.move("D");
      if (e.key === "Escape") this.togglePause();
    },

    incTime: function () {
      this.time++;
      this.setInfo("time");
    },

    incScore: function (amount) {
      this.score += amount;
      this.setInfo("score");
    },

    incLevel: function () {
      this.level++;
      this.speed = Math.max(150, this.speed - 75);
      this.setInfo("level");
    },

    incLines: function (num) {
      this.lines += num;
      this.setInfo("lines");
    },

    calcScore: function (args) {
      var lines = args.lines || 0;
      var shape = args.shape || false;
      var score = 0;

      if (lines > 0) {
        score += lines * this["level" + this.level][1];
        this.incLines(lines);
      }

      if (shape === true) {
        score += this["level" + this.level][2];
      }

      this.incScore(score);
    },

    checkScore: function () {
      if (this.score >= this["level" + this.level][0]) this.incLevel();
    },

    initTimer: function () {
      var me = this;
      var tLoop = function () {
        me.incTime();
        me.timer = setTimeout(tLoop, 2000);
      };
      this.timer = setTimeout(tLoop, 2000);
    },

    play: function () {
      var me = this;

      if (this.timer === null) this.initTimer();

      var gameLoop = function () {
        me.move("D");

        if (me.curComplete) {
          me.markBoardShape(me.curX, me.curY, me.curShape);

          me.curSqs.forEach(sq => me.sqs.push(sq));

          me.calcScore({ shape: true });
          me.checkRows();
          me.checkScore();
          me.initShapes();
          me.play();
        } else {
          me.pTimer = setTimeout(gameLoop, me.speed);
        }
      };

      this.pTimer = setTimeout(gameLoop, me.speed);
      this.isActive = 1;
    },

    togglePause: function () {
      if (this.isActive === 1) {
        this.clearTimers();
        this.isActive = 0;
      } else {
        this.play();
      }
    },

    clearTimers: function () {
      clearTimeout(this.timer);
      clearTimeout(this.pTimer);
      this.timer = null;
      this.pTimer = null;
    },

    move: function (dir) {
      var s = "";
      var tempX = this.curX;
      var tempY = this.curY;

      switch (dir) {
        case "L":
          s = "left";
          tempX -= 1;
          break;
        case "R":
          s = "left";
          tempX += 1;
          break;
        case "D":
          s = "top";
          tempY += 1;
          break;
        case "RT":
          this.rotate();
          return true;
      }

      if (this.checkMove(tempX, tempY, this.curShape)) {
        this.curSqs.forEach(sq => {
          var l = parseInt(sq.style[s], 10);
          dir === "L" ? (l -= this.pSize) : (l += this.pSize);
          sq.style[s] = l + "px";
        });

        this.curX = tempX;
        this.curY = tempY;
      } else if (dir === "D") {
        if (this.curY === 1 || this.time === this.maxTime) {
          this.gameOver();
          return false;
        }
        this.curComplete = true;
      }
    },

    rotate: function () {
      if (this.curShapeIndex !== 6) {
        var temp = [];

        this.curShape.forEach(p => {
          temp.push([p[1] * -1, p[0]]);
        });

        if (this.checkMove(this.curX, this.curY, temp)) {
          this.curShape = temp;
          this.removeCur();
          this.drawShape(this.curX, this.curY, this.curShape);
        }
      }
    },

    checkMove: function (x, y, p) {
      return !(this.isOB(x, y, p) || this.isCollision(x, y, p));
    },

    isCollision: function (x, y, p) {
      var bool = false;

      p.forEach(point => {
        var newX = point[0] + x;
        var newY = point[1] + y;

        if (this.boardPos(newX, newY) === 1) bool = true;
      });

      return bool;
    },

    isOB: function (x, y, p) {
      var w = this.boardWidth - 1;
      var h = this.boardHeight - 1;
      var bool = false;

      p.forEach(point => {
        var newX = point[0] + x;
        var newY = point[1] + y;

        if (newX < 0 || newX > w || newY < 0 || newY > h) bool = true;
      });

      return bool;
    },

    boardPos: function (x, y) {
      return this.board[x + y * this.boardWidth];
    },

    getBoardIdx: function (x, y) {
      return x + y * this.boardWidth;
    },

    markBoardAt: function (x, y, val) {
      this.board[this.getBoardIdx(x, y)] = val;
    },

    markBoardShape: function (x, y, p) {
      p.forEach(point => {
        var newX = point[0] + x;
        var newY = point[1] + y;
        this.markBoardAt(newX, newY, 1);
      });
    },

    getRowState: function (y) {
      var c = 0;

      for (var x = 0; x < this.boardWidth; x++) {
        if (this.boardPos(x, y) === 1) c++;
      }

      if (c === 0) return "E";
      if (c === this.boardWidth) return "F";
      return "U";
    },

    checkRows: function () {
      var c = 0;
      var stopCheck = false;

      for (var y = this.boardHeight - 1; y >= 0; y--) {
        switch (this.getRowState(y)) {
          case "F":
            this.removeRow(y);
            c++;
            break;
          case "E":
            if (c === 0) stopCheck = true;
            break;
          case "U":
            if (c > 0) this.shiftRow(y, c);
            break;
        }

        if (stopCheck) break;
      }

      if (c > 0) this.calcScore({ lines: c });
    },

    shiftRow: function (y, amount) {
      for (var x = 0; x < this.boardWidth; x++) {
        this.sqs.forEach(block => {
          if (this.isAt(x, y, block)) this.setBlock(x, y + amount, block);
        });
      }

      this.emptyBoardRow(y);
    },

    emptyBoardRow: function (y) {
      for (var x = 0; x < this.boardWidth; x++) {
        this.markBoardAt(x, y, 0);
      }
    },

    removeRow: function (y) {
      for (var x = 0; x < this.boardWidth; x++) {
        this.removeBlock(x, y);
      }
    },

    removeBlock: function (x, y) {
      this.markBoardAt(x, y, 0);

      for (var i = this.sqs.length - 1; i >= 0; i--) {
        var block = this.sqs[i];

        if (this.getPos(block)[0] === x && this.getPos(block)[1] === y) {
          this.canvas.removeChild(block);
          this.sqs.splice(i, 1);
        }
      }
    },

    setBlock: function (x, y, block) {
      this.markBoardAt(x, y, 1);
      block.style.left = x * this.pSize + "px";
      block.style.top = y * this.pSize + "px";
    },

    isAt: function (x, y, block) {
      return this.getPos(block)[0] === x && this.getPos(block)[1] === y;
    },

    getPos: function (block) {
      return [
        parseInt(block.style.left, 10) / this.pSize,
        parseInt(block.style.top, 10) / this.pSize
      ];
    },

    gameOver: function () {
      this.clearTimers();
      isStart = false;
      this.canvas.innerHTML = "<h1>GAME OVER</h1>";
    }
  };

  const btn = document.querySelector("#start");
  const restartBtn = document.querySelector("#restart");
restartBtn.addEventListener("click", function () {
  location.reload();
});

  btn.addEventListener("click", function () {
    btn.style.display = "none";

    if (!isStart) {
      tetris.init();
    }
  });
})();
