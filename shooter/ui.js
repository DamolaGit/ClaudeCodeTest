const UI = (() => {
  // Retro text helper
  function text(ctx, str, x, y, size, color, align = 'left') {
    ctx.font = `${size}px 'Press Start 2P', monospace`;
    ctx.textAlign = align;
    ctx.fillStyle = '#000';
    ctx.fillText(str, x + 2, y + 2);
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }

  function drawHUD(ctx, player, waveManager, score, levelNum) {
    const W = ctx.canvas.width;

    // Health bar
    ctx.fillStyle = '#220000';
    ctx.fillRect(10, 10, 200, 16);
    ctx.fillStyle = player.hp > 40 ? '#cc2222' : '#ff4400';
    ctx.fillRect(10, 10, 200 * (player.hp / player.maxHp), 16);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 200, 16);
    text(ctx, 'HP', 216, 24, 8, '#aaa');

    // Score
    text(ctx, `SCORE: ${score}`, W - 10, 24, 9, '#ffcc00', 'right');

    // Level + wave
    text(ctx, `LVL ${levelNum}`, 10, 44, 8, '#44aaff');
    if (waveManager) {
      const waveText = waveManager.betweenWave
        ? 'WAVE CLEAR!'
        : `WAVE ${waveManager.currentWave}/${waveManager.totalWaves}`;
      text(ctx, waveText, W / 2, 24, 8, '#aaffaa', 'center');
    }
  }

  function drawMenu(ctx, menuEnemyX) {
    const W = ctx.canvas.width, H = ctx.canvas.height;

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);

    // Title
    text(ctx, 'DEAD ZONE', W / 2, 120, 32, '#cc2222', 'center');
    text(ctx, 'TOP-DOWN SHOOTER', W / 2, 165, 10, '#888888', 'center');

    // Animated enemy row
    drawEnemy(ctx, menuEnemyX % (W + 60) - 30, H - 80, 'basic', Math.floor(Date.now() / 200) % 2);
    drawEnemy(ctx, (menuEnemyX + 160) % (W + 60) - 30, H - 80, 'runner', Math.floor(Date.now() / 150) % 2);
    drawEnemy(ctx, (menuEnemyX + 320) % (W + 60) - 30, H - 80, 'tank', Math.floor(Date.now() / 250) % 2);
    drawEnemy(ctx, (menuEnemyX + 480) % (W + 60) - 30, H - 80, 'basic', Math.floor(Date.now() / 200) % 2);

    // Buttons
    _button(ctx, W / 2, 260, 'PLAY GAME', '#22aa44');
    _button(ctx, W / 2, 320, 'HOW TO PLAY', '#2266cc');

    // Controls hint
    text(ctx, 'ARROWS/WASD: MOVE    MOUSE: AIM & SHOOT', W / 2, H - 30, 6, '#555', 'center');
  }

  function drawHowTo(ctx) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'HOW TO PLAY', W / 2, 80, 18, '#ffcc00', 'center');

    const lines = [
      ['MOVE',    'ARROW KEYS / WASD'],
      ['AIM',     'MOUSE CURSOR'],
      ['SHOOT',   'LEFT CLICK (HOLD TO AUTO)'],
      ['PAUSE',   'ESCAPE'],
      ['',        ''],
      ['ENEMIES', ''],
      ['GREEN',   'BASIC - SLOW & TOUGH'],
      ['PURPLE',  'RUNNER - FAST & FRAGILE'],
      ['BROWN',   'TANK - SLOW & DEADLY'],
    ];
    lines.forEach(([label, desc], i) => {
      if (label) text(ctx, label, W / 2 - 180, 150 + i * 32, 8, '#ffcc00');
      if (desc)  text(ctx, desc,  W / 2 - 60,  150 + i * 32, 7, '#cccccc');
    });

    _button(ctx, W / 2, H - 80, 'BACK', '#888888');
  }

  function drawPause(ctx) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'PAUSED', W / 2, H / 2 - 30, 24, '#ffffff', 'center');
    text(ctx, 'PRESS ESC TO RESUME', W / 2, H / 2 + 20, 8, '#888', 'center');
  }

  function drawLevelComplete(ctx, levelNum, score, countdown) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.fillStyle = 'rgba(0,0,20,0.8)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, `LEVEL ${levelNum} CLEAR!`, W / 2, H / 2 - 60, 20, '#ffcc00', 'center');
    text(ctx, `SCORE: ${score}`, W / 2, H / 2, 12, '#ffffff', 'center');
    text(ctx, `NEXT LEVEL IN ${Math.ceil(countdown)}...`, W / 2, H / 2 + 50, 9, '#aaaaaa', 'center');
  }

  function drawGameOver(ctx, score, highScore) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'GAME OVER', W / 2, 140, 28, '#cc2222', 'center');
    text(ctx, `SCORE: ${score}`, W / 2, 220, 14, '#ffffff', 'center');
    text(ctx, `BEST:  ${highScore}`, W / 2, 255, 10, '#ffcc00', 'center');
    _button(ctx, W / 2, 330, 'PLAY AGAIN', '#cc2222');
    _button(ctx, W / 2, 390, 'MAIN MENU',  '#555555');
  }

  function drawVictory(ctx, score, highScore) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.fillStyle = 'rgba(0,10,0,0.85)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'YOU WIN!', W / 2, 120, 32, '#22cc44', 'center');
    text(ctx, 'ALL ZONES CLEARED', W / 2, 175, 10, '#aaaaaa', 'center');
    text(ctx, `FINAL SCORE: ${score}`, W / 2, 240, 12, '#ffcc00', 'center');
    text(ctx, `BEST:        ${highScore}`, W / 2, 275, 10, '#ffcc00', 'center');
    _button(ctx, W / 2, 360, 'PLAY AGAIN', '#22aa44');
    _button(ctx, W / 2, 420, 'MAIN MENU',  '#555555');
  }

  function _button(ctx, cx, cy, label, color) {
    const W = 260, H = 36;
    ctx.fillStyle = color;
    ctx.fillRect(cx - W / 2, cy - H / 2, W, H);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - W / 2, cy - H / 2, W, H);
    text(ctx, label, cx, cy + 6, 9, '#ffffff', 'center');
  }

  // Returns which button was clicked given mouse coords; buttons at y positions
  function hitButton(mx, my, buttons) {
    for (const btn of buttons) {
      const bx = btn.cx - 130, by = btn.cy - 18;
      if (mx >= bx && mx <= bx + 260 && my >= by && my <= by + 36) return btn.id;
    }
    return null;
  }

  return { drawHUD, drawMenu, drawHowTo, drawPause, drawLevelComplete, drawGameOver, drawVictory, hitButton, text };
})();
