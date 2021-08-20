'use strict';

(() => {
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  class Ball {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');
      this.x = rand(30, 250);
      this.y = 30;
      this.r = 10;
      this.vx = rand(3, 5) * (Math.random() < 0.5 ? 1 : -1);
      this.vy = rand(3, 5);
      this.isMissed = false;
    }

    getMissedStatus() {
      return this.isMissed;
    }

    getX() {
      return this.x;
    }

    getY() {
      return this.y;
    }

    getR() {
      return this.r;
    }

    bounce() {
      this.vy *= -1
    }

    reposition(paddleTop) {
      this.y = paddleTop - this.r;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.y - this.r > this.canvas.height) {
        this.isMissed = true;
      }

      if (
        this.x - this.r < 0 ||
        this.x + this.r > this.canvas.width
      ) {
        this.vx *= -1;
      }

      if (
        this.y - this.r < 0
      ) {
        this.vy *= -1;
      }
    }

    draw() {
      this.ctx.beginPath();
      this.ctx.fillStyle = '#fdfdfd';
      this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }

  class Paddle {
    constructor(canvas, game) {
      this.canvas = canvas;
      this.game = game;
      this.ctx = this.canvas.getContext('2d');
      this.w = 60;
      this.h = 16;
      this.x = this.canvas.width / 2 - (this.w / 2);
      this.y = this.canvas.height - 32;
      this.mouseX = this.x;
      this.addHandler();
    }

    addHandler() {
      document.addEventListener('mousemove', e => {
        this.mouseX = e.clientX;
      });
    }

    update(ball) {
      const ballBottom = ball.getY() + ball.getR();
      const paddleTop = this.y;
      const ballTop = ball.getY() - ball.getR();
      const paddleBottom = this.y + this.h;
      const ballCenter = ball.getX();
      const paddleLeft = this.x;
      const paddleRight = this.x + this.w;

      if (
        ballBottom > paddleTop &&
        ballTop < paddleBottom &&
        ballCenter > paddleLeft &&
        ballCenter < paddleRight
      ) {
        ball.bounce();
        ball.reposition(paddleTop);
        this.game.addScore();
      }

      const rect = this.canvas.getBoundingClientRect();
      this.x = this.mouseX - rect.left - (this.w / 2);

      if (this.x < 0) {
        this.x = 0;
      }
      if (this.x + this.w > this.canvas.width) {
        this.x = this.canvas.width - this.w;
      }
    }

    draw() {
      this.ctx.fillStyle = '#fdfdfd';
      this.ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }

  class Block {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');
      this.level = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
      ];
      this.width = this.canvas.width / this.level[0].length;
      this.height = 20;
      this.blocks = [];

      for (let row = 0; row < this.level.length; row++) {
        for (let col = 0; col < this.level[row].length; col++) {
          if (this.level[row][col]) {
            this.blocks.push({
              x: this.width * col,
              y: this.height * row,
              width: this.width,
              height: this.height
            })
          }
        }
      }
    }

    update() {
    }

    draw() {
      this.blocks.forEach(block => {
        this.ctx.strokeRect(block.x, block.y, block.width, block.height);
        this.ctx.stroke();
      })
    }
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');
      this.ball = new Ball(this.canvas);
      this.paddle = new Paddle(this.canvas, this);
      this.block = new Block(this.canvas)
      this.loop();
      this.isGameOver = false;
      this.score = 0;
    }

    addScore() {
      this.score++;
    }

    loop() {
      if (this.isGameOver) {
        return;
      }

      this.update();
      this.draw();

      requestAnimationFrame(() => {
        this.loop();
      });
    }

    update() {
      this.ball.update();
      this.paddle.update(this.ball);

      if (this.ball.getMissedStatus()) {
        this.isGameOver = true
      }
    }

    draw() {
      if (this.isGameOver) {
        this.drawGameOver();
        return;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ball.draw();
      this.paddle.draw();
      this.block.draw();
      this.drawScore();
    }

    drawGameOver() {
      this.ctx.font = '28px "Arial Black"';
      this.ctx.fillStyle = 'tomato';
      this.ctx.fillText('GAME OVER', 50, 150);
    }

    drawScore() {
      this.ctx.font = '20px Arial';
      this.ctx.fillStyle = '#fdfdfd';
      this.ctx.fillText(this.score, 10, 25);
    }
  }

  const canvas = document.querySelector('canvas');
  if (typeof canvas.getContext === 'undefined') {
    return;
  }

  new Game(canvas);
})();
