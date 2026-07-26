const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const healthFill = document.getElementById('healthFill');
const scoreText = document.getElementById('score');
const joystick = document.getElementById('joystick');
const stick = document.getElementById('stick');
const shootBtn = document.getElementById('shootBtn');

let score = 0;
let health = 100;

const player = {
  x: canvas.width/2 - 20,
  y: canvas.height - 120,
  w: 40,
  h: 40,
  speedX: 0,
  speedY: 0
};

let bullets = [];
let enemies = [];
let explosions = [];

// Joystick
let dragging = false;
const center = {x:60, y:60};

joystick.addEventListener('touchstart', e => {
  dragging = true;
});

joystick.addEventListener('touchmove', e => {
  if(!dragging) return;
  const rect = joystick.getBoundingClientRect();
  const touch = e.touches[0];
  let x = touch.clientX - rect.left;
  let y = touch.clientY - rect.top;

  let dx = x - center.x;
  let dy = y - center.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const max = 40;

  if(dist > max){
    dx = dx / dist * max;
    dy = dy / dist * max;
  }

  stick.style.left = `${dx + 35}px`;
  stick.style.top = `${dy + 35}px`;

  player.speedX = dx / 8;
  player.speedY = dy / 8;
});

joystick.addEventListener('touchend', () => {
  dragging = false;
  stick.style.left = '35px';
  stick.style.top = '35px';
  player.speedX = 0;
  player.speedY = 0;
});

// Auto shooting
let shooting = false;

shootBtn.addEventListener('touchstart', () => shooting = true);
shootBtn.addEventListener('touchend', () => shooting = false);

setInterval(() => {
  if(shooting){
    bullets.push({
      x: player.x + player.w/2 - 3,
      y: player.y,
      w: 6,
      h: 14,
      speed: 12
    });
  }
}, 120);

// Spawn enemies
setInterval(() => {
  enemies.push({
    x: Math.random() * (canvas.width - 40),
    y: -40,
    w: 40,
    h: 40,
    speed: 2 + Math.random() * 3,
    type: Math.random() > 0.7 ? 'fast' : 'normal'
  });
}, 700);

function rects(a,b){
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

function createExplosion(x,y){
  for(let i=0;i<10;i++){
    explosions.push({
      x, y,
      vx:(Math.random()-0.5)*6,
      vy:(Math.random()-0.5)*6,
      life:30
    });
  }
}

function update(){
  player.x += player.speedX;
  player.y += player.speedY;

  player.x = Math.max(0, Math.min(canvas.width-player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height-player.h, player.y));

  bullets.forEach((b,i)=>{
    b.y -= b.speed;
    if(b.y < -20) bullets.splice(i,1);
  });

  enemies.forEach((e,ei)=>{
    e.y += e.speed;

    if(rects(player,e)){
      createExplosion(e.x+20,e.y+20);
      enemies.splice(ei,1);
      health -= 15;
      healthFill.style.width = health + '%';
      if(health <= 0){
        alert('Game Over! Score: ' + score);
        location.reload();
      }
    }

    bullets.forEach((b,bi)=>{
      if(rects(b,e)){
        createExplosion(e.x+20,e.y+20);
        enemies.splice(ei,1);
        bullets.splice(bi,1);
        score += e.type === 'fast' ? 20 : 10;
        scoreText.textContent = 'Score: ' + score;
      }
    });

    if(e.y > canvas.height + 50){
      enemies.splice(ei,1);
    }
  });

  explosions.forEach((p,i)=>{
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if(p.life <= 0) explosions.splice(i,1);
  });
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // stars
  ctx.fillStyle = '#444';
  for(let i=0;i<60;i++){
    ctx.fillRect((i*37)%canvas.width, (i*71)%canvas.height, 2, 2);
  }

  // player
  ctx.fillStyle = '#00aaff';
  ctx.beginPath();
  ctx.moveTo(player.x + player.w/2, player.y);
  ctx.lineTo(player.x, player.y + player.h);
  ctx.lineTo(player.x + player.w, player.y + player.h);
  ctx.closePath();
  ctx.fill();

  // bullets
  ctx.fillStyle = '#ffff00';
  bullets.forEach(b=>{
    ctx.fillRect(b.x,b.y,b.w,b.h);
  });

  // enemies
  enemies.forEach(e=>{
    ctx.fillStyle = e.type === 'fast' ? '#ff00ff' : '#ff3333';
    ctx.fillRect(e.x,e.y,e.w,e.h);
  });

  // explosions
  explosions.forEach(p=>{
    ctx.fillStyle = `rgba(255,165,0,${p.life/30})`;
    ctx.beginPath();
    ctx.arc(p.x,p.y,4,0,Math.PI*2);
    ctx.fill();
  });
}

function gameLoop(){
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
