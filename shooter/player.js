class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 220;
    this.angle = 0; // facing direction (toward mouse)
    this.hp = 100;
    this.maxHp = 100;
    this.dead = false;
    this.invincible = 0;
    this.animTimer = 0;
    this.frame = 0;
    this.animSpeed = 0.15;
    this.fireTimer = 0;
    this.fireRate = 1 / 8; // seconds between shots
    this.muzzleFlashTimer = 0;
    this.radius = 16;
  }

  update(dt, W, H) {
    // Movement
    let dx = 0, dy = 0;
    if (Input.isDown('ArrowUp')    || Input.isDown('KeyW')) dy -= 1;
    if (Input.isDown('ArrowDown')  || Input.isDown('KeyS')) dy += 1;
    if (Input.isDown('ArrowLeft')  || Input.isDown('KeyA')) dx -= 1;
    if (Input.isDown('ArrowRight') || Input.isDown('KeyD')) dx += 1;

    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
    this.x = Math.max(this.radius, Math.min(W - this.radius, this.x + dx * this.speed * dt));
    this.y = Math.max(this.radius, Math.min(H - this.radius, this.y + dy * this.speed * dt));

    // Animate walk
    if (dx !== 0 || dy !== 0) {
      this.animTimer += dt;
      if (this.animTimer >= this.animSpeed) { this.animTimer = 0; this.frame ^= 1; }
    } else {
      this.frame = 0;
    }

    // Face mouse
    this.angle = Math.atan2(Input.my - this.y, Input.mx - this.x);

    // Invincibility frames
    if (this.invincible > 0) this.invincible -= dt;

    // Fire cooldown
    if (this.fireTimer > 0) this.fireTimer -= dt;
    if (this.muzzleFlashTimer > 0) this.muzzleFlashTimer -= dt;
  }

  tryFire() {
    if (this.fireTimer <= 0 && (Input.firing || Input.consumeClick())) {
      this.fireTimer = this.fireRate;
      this.muzzleFlashTimer = 0.06;
      Audio.shoot();
      // gun tip offset
      const tipDist = 28;
      return new Bullet(
        this.x + Math.cos(this.angle) * tipDist,
        this.y + Math.sin(this.angle) * tipDist,
        this.angle
      );
    }
    return null;
  }

  takeDamage(amount) {
    if (this.invincible > 0) return;
    this.hp -= amount;
    this.invincible = 0.6;
    Audio.playerHit();
    if (this.hp <= 0) { this.hp = 0; this.dead = true; }
  }

  render(ctx) {
    const flash = this.invincible > 0 && Math.floor(this.invincible / 0.1) % 2 === 0;
    if (flash) return;

    // shadow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(this.x + 2, this.y + 4, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawPlayer(ctx, this.x, this.y, this.frame, this.angle);
    drawGun(ctx, this.x, this.y, this.angle);

    if (this.muzzleFlashTimer > 0) {
      const tipDist = 28;
      drawMuzzleFlash(ctx,
        this.x + Math.cos(this.angle) * tipDist,
        this.y + Math.sin(this.angle) * tipDist,
        this.angle
      );
    }
  }
}
