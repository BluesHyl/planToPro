// 设置画布

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// 生成随机数的函数

function random(min,max) {
  const num = Math.floor(Math.random() * (max - min)) + min;
  return num;
}
function randomColor() {
  return (
    "rgb(" +
    random(0, 255) +
    ", " +
    random(0, 255) +
    ", " +
    random(0, 255) +
    ")"
  );
}
let balls = []
class Shape {
  constructor(x, y, velX, velY, exists=true) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.exists = exists;
  }
}

class Ball extends Shape {
  constructor(x, y, velX, velY, exists=true, color, size ) {
    super(x, y, velX, velY, exists);
    this.color = color;
    this.size = size;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }
  update() {
    if (this.x + this.size >= width) {
      this.velX = -this.velX;
    }
    if (this.x - this.size <= 0) {
      this.velX = -this.velX;
    }
    if (this.y + this.size >= height) {
      this.velY = -this.velY;
    }
    if (this.y - this.size <= 0) {
      this.velY = -this.velY;
    }
    this.x += this.velX;
    this.y += this.velY;
  }
  collisionDetect() {
    for (const ball of balls) {
      if (!(this === ball)) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);// 勾股定理
        if (distance < this.size + ball.size) {
          ball.color = this.color = randomColor();
        }
      }
    }
  }
}
let balsNum = 25
const p = document.querySelector('p')
p.textContent = balsNum
class EvilCircle extends Shape { 
  constructor(x, y, velX, velY, exists, color, size) {
    super(x, y, velX, velY, exists);
    this.color = color;
    this.size = size;
  }
  draw() {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
  }
  checkBounds() {
    if (this.x + this.size > width) {
      this.x = this.size;
    }
    if (this.x - this.size < 0) {
      this.x = width - this.size;
    }
    if (this.y + this.size > height) {
      this.y = this.size;
    }
    if (this.y - this.size < 0) {
      this.y = height - this.size;
    }
  }
  setCountrols() {
    window.onkeydown = (e) => {
    switch (e.key) {
      case "a":
        this.x -= this.velX;
        break;
      case "d":
        this.x += this.velX;
        break;
      case "w":
        this.y -= this.velY;
        break;
      case "s":
        this.y += this.velY;
        break;
    }
  };
  }
  collisionDetect() {
    for (let j = 0; j < balls.length; j++) {
      if ( balls[j].exists) {
        let dx = this.x - balls[j].x;
        let dy = this.y - balls[j].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.size + balls[j].size) {
          balls[j].exists = false
            balsNum--
            p.textContent = balsNum
        }
      }
    }
  }
}

while (balls.length < 25) {
  let size = random(10, 20);
  let ball = new Ball(
    // 为避免绘制错误，球至少离画布边缘球本身一倍宽度的距离
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-7, 7),
    random(-7, 7),
    true,
    randomColor(),
    size,
  );
  balls.push(ball);
}
const evilCircle = new EvilCircle(100, 100, 20, 20, true, "white", 20)
evilCircle.setCountrols()
function loop() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < balls.length; i++) {
    if(balls[i].exists) {
      balls[i].draw();
      balls[i].update();
      balls[i].collisionDetect();
    }
  }
  evilCircle.draw();
  evilCircle.checkBounds();
  evilCircle.collisionDetect();
  requestAnimationFrame(loop);
}
loop()