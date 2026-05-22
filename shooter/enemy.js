const ENEMY_STATS = {
  basic:  { hp: 30,  speed: 80,  damage: 10, radius: 18, points: 10 },
  runner: { hp: 15,  speed: 180, damage: 8,  radius: 14, points: 15 },
  tank:   { hp: 120, speed: 45,  damage: 25, radius: 24, points: 30 },
};

class Enemy {
  constructor(x, y, type = 'basic') {
    this.x = x;
    this.y = y;
    this.type = type;
    const s = ENEMY_STATS[type];
    this.hp = s.hp;
    this.maxHp = s.hp;
    this.speed = s.speed;
    this.damage = s.damage;
    this.radius = s.radius;
    this.points = s.points;
    this.dead = false;
    this.animTimer = 0;
    this.frame = 0;
    this.animSpeed = type === 'runner' ? 0.12 : 0.2;
    this.deathTimer = 0;
    this.dying = false;
    this.hitFlash = 0;
    // slight angular wander
    this.wanderAngle = (Math.random() - 0.5) * 0.4;
  }

  update(dt, playerX, playerY) {
    if (this.dying) {
      this.deathTimer += dt;
      if (this.deathTimer > 0.5) this.dead = true;
      return;
    }

    if (this.hitFlash > 0) this.hitFlash -= dt;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      // nudge wander angle slightly so enemies don't all stack
      this.wanderAngle += (Math.random() - 0.5) * 0.01;
      this.wanderAngle = Math.max(-0.5, Math.min(0.5, this.wanderAngle));
      const angle = Math.atan2(dy, dx) + this.wanderAngle;
      this.x += Math.cos(angle) * this.speed * dt;
      this.y += Math.sin(angle) * this.speed * dt;
    }

    this.animTimer += dt;
    if (this.animTimer >= this.animSpeed) {
      this.animTimer = 0;
      this.frame ^= 1;
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.hitFlash = 0.12;
    if (this.hp <= 0) {
      this.dying = true;
      return true; // killed
    }
    return false;
  }

  render(ctx) {
    if (this.dying) {
      const alpha = 1 - this.deathTimer / 0.5;
      drawBloodSplat(ctx, this.x, this.y, alpha);
      return;
    }

    if (this.hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawEnemy(ctx, this.x, this.y, this.type, this.frame);

    // health bar (only if not full)
    if (this.hp < this.maxHp) {
      const bw = this.radius * 2;
      const bx = this.x - bw / 2;
      const by = this.y - this.radius - 8;
      ctx.fillStyle = '#440000';
      ctx.fillRect(bx, by, bw, 4);
      ctx.fillStyle = '#cc2222';
      ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), 4);
    }
  }
}

function spawnEnemy(type, W, H) {
  const side = Math.floor(Math.random() * 4);
  let x, y;
  const margin = 30;
  if (side === 0) { x = Math.random() * W; y = -margin; }
  else if (side === 1) { x = W + margin; y = Math.random() * H; }
  else if (side === 2) { x = Math.random() * W; y = H + margin; }
  else { x = -margin; y = Math.random() * H; }
  return new Enemy(x, y, type);
}
