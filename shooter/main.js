const W = 800, H = 600;

const STATE = { MENU: 0, HOWTO: 1, PLAYING: 2, PAUSED: 3, LEVEL_COMPLETE: 4, GAME_OVER: 5, VICTORY: 6 };

let canvas, ctx;
let state = STATE.MENU;
let player, enemies, bullets, waveManager;
let levelIndex = 0, score = 0, highScore = 0;
let hitFlashTimer = 0;
let levelCompleteTimer = 0;
let menuEnemyX = 0;
let escPrev = false;

function init() {
  canvas = document.getElementById('gameCanvas');
  canvas.width = W;
  canvas.height = H;
  ctx = canvas.getContext('2d');

  Input.init(canvas);
  Audio.init();
  highScore = parseInt(localStorage.getItem('dz_highscore') || '0');

  canvas.addEventListener('click', handleClick);
  requestAnimationFrame(loop);
}

function startGame() {
  levelIndex = 0;
  score = 0;
  startLevel();
}

function startLevel() {
  player = new Player(W / 2, H / 2);
  enemies = [];
  bullets = [];
  Particles.clear();
  waveManager = new WaveManager(LEVELS[levelIndex], W, H);
  hitFlashTimer = 0;
  state = STATE.PLAYING;
}

let last = 0;
function loop(ts) {
  const dt = Math.min((ts - last) / 1000, 0.05);
  last = ts;

  // Resume audio on first frame (browser autoplay policy)
  Audio.resume();

  update(dt);
  render();
  requestAnimationFrame(loop);
}

function update(dt) {
  if (state === STATE.MENU || state === STATE.HOWTO) {
    menuEnemyX = (menuEnemyX + 60 * dt) % (W + 60);
    return;
  }

  if (state === STATE.PAUSED) {
    const esc = Input.isDown('Escape');
    if (esc && !escPrev) { state = STATE.PLAYING; Audio.menuSelect(); }
    escPrev = esc;
    return;
  }

  if (state === STATE.LEVEL_COMPLETE) {
    levelCompleteTimer -= dt;
    if (levelCompleteTimer <= 0) {
      levelIndex++;
      if (levelIndex >= LEVELS.length) {
        state = STATE.VICTORY;
        Audio.levelComplete();
      } else {
        startLevel();
      }
    }
    return;
  }

  if (state === STATE.GAME_OVER || state === STATE.VICTORY) return;

  // ---- PLAYING ----
  const esc = Input.isDown('Escape');
  if (esc && !escPrev) { state = STATE.PAUSED; Audio.menuSelect(); }
  escPrev = esc;

  player.update(dt, W, H);

  // Fire
  const bullet = player.tryFire();
  if (bullet) {
    bullets.push(bullet);
    Particles.muzzleFlash(
      player.x + Math.cos(player.angle) * 28,
      player.y + Math.sin(player.angle) * 28,
      player.angle
    );
  }

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update(dt);
    if (bullets[i].dead) { bullets.splice(i, 1); continue; }
    // Off-screen cull
    const b = bullets[i];
    if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
      bullets.splice(i, 1);
    }
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.update(dt, player.x, player.y);

    // Bullet collision
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (bullets[j].hits(e)) {
        const killed = e.takeDamage(10);
        bullets.splice(j, 1);
        Particles.burst(e.x, e.y, killed ? '#cc0000' : '#ff8800', killed ? 12 : 5, killed ? 150 : 80);
        if (killed) { score += e.points; Audio.enemyDie(); }
        else Audio.hit();
        break;
      }
    }

    // Player collision
    if (!e.dying) {
      const dx = player.x - e.x, dy = player.y - e.y;
      if (Math.sqrt(dx * dx + dy * dy) < player.radius + e.radius) {
        player.takeDamage(e.damage);
        hitFlashTimer = 0.25;
      }
    }

    if (e.dead) enemies.splice(i, 1);
  }

  waveManager.update(dt, enemies);
  Particles.update(dt);

  if (hitFlashTimer > 0) hitFlashTimer -= dt;

  // Death
  if (player.dead) {
    if (score > highScore) { highScore = score; localStorage.setItem('dz_highscore', highScore); }
    Audio.gameOver();
    state = STATE.GAME_OVER;
    return;
  }

  // Level complete
  if (waveManager.done && enemies.length === 0) {
    Audio.levelComplete();
    if (score > highScore) { highScore = score; localStorage.setItem('dz_highscore', highScore); }
    if (levelIndex >= LEVELS.length - 1) {
      state = STATE.VICTORY;
    } else {
      state = STATE.LEVEL_COMPLETE;
      levelCompleteTimer = 3.5;
    }
  }
}

function render() {
  // Background
  ctx.fillStyle = '#1a2e1a';
  ctx.fillRect(0, 0, W, H);
  drawGrid();

  if (state === STATE.MENU) { UI.drawMenu(ctx, menuEnemyX); return; }
  if (state === STATE.HOWTO) { UI.drawHowTo(ctx); return; }

  // Draw game world
  Particles.render(ctx);
  bullets.forEach(b => b.render(ctx));
  enemies.forEach(e => e.render(ctx));
  player.render(ctx);

  // Red screen flash on player hit
  if (hitFlashTimer > 0) {
    ctx.save();
    ctx.globalAlpha = hitFlashTimer * 0.8;
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  UI.drawHUD(ctx, player, waveManager, score, levelIndex + 1);

  if (state === STATE.PAUSED)         UI.drawPause(ctx);
  if (state === STATE.LEVEL_COMPLETE) UI.drawLevelComplete(ctx, levelIndex + 1, score, levelCompleteTimer);
  if (state === STATE.GAME_OVER)      UI.drawGameOver(ctx, score, highScore);
  if (state === STATE.VICTORY)        UI.drawVictory(ctx, score, highScore);
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  const CELL = 40;
  for (let x = 0; x <= W; x += CELL) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += CELL) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function handleClick(e) {
  if (e.button !== 0) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width, scaleY = H / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top)  * scaleY;

  Audio.resume();

  if (state === STATE.MENU) {
    // PLAY button at y=260, HOW TO at y=320
    const hit = UI.hitButton(mx, my, [
      { id: 'play',  cx: W / 2, cy: 260 },
      { id: 'howto', cx: W / 2, cy: 320 },
    ]);
    if (hit === 'play')  { Audio.menuSelect(); startGame(); }
    if (hit === 'howto') { Audio.menuSelect(); state = STATE.HOWTO; }
    return;
  }

  if (state === STATE.HOWTO) {
    const hit = UI.hitButton(mx, my, [{ id: 'back', cx: W / 2, cy: H - 80 }]);
    if (hit === 'back') { Audio.menuSelect(); state = STATE.MENU; }
    return;
  }

  if (state === STATE.GAME_OVER) {
    const hit = UI.hitButton(mx, my, [
      { id: 'retry', cx: W / 2, cy: 330 },
      { id: 'menu',  cx: W / 2, cy: 390 },
    ]);
    if (hit === 'retry') { Audio.menuSelect(); startGame(); }
    if (hit === 'menu')  { Audio.menuSelect(); state = STATE.MENU; }
    return;
  }

  if (state === STATE.VICTORY) {
    const hit = UI.hitButton(mx, my, [
      { id: 'retry', cx: W / 2, cy: 360 },
      { id: 'menu',  cx: W / 2, cy: 420 },
    ]);
    if (hit === 'retry') { Audio.menuSelect(); startGame(); }
    if (hit === 'menu')  { Audio.menuSelect(); state = STATE.MENU; }
    return;
  }
}

window.addEventListener('load', init);
