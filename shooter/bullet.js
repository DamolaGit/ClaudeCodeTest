class Bullet {
  constructor(x, y, angle, speed = 600) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.angle = angle;
    this.life = 1.5;
    this.radius = 4;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = '#ffee44';
    ctx.fillRect(-6, -2, 12, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, -1, 6, 2);
    ctx.restore();
  }

  hits(enemy) {
    const dx = this.x - enemy.x;
    const dy = this.y - enemy.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius + enemy.radius;
  }
}
