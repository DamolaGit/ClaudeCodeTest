const Particles = (() => {
  const pool = [];

  function spawn(x, y, vx, vy, color, life, size = 3) {
    pool.push({ x, y, vx, vy, color, life, maxLife: life, size });
  }

  function burst(x, y, color, count = 8, speed = 120) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const spd = speed * (0.5 + Math.random() * 0.8);
      spawn(x, y, Math.cos(angle) * spd, Math.sin(angle) * spd, color, 0.35, 2 + Math.random() * 3);
    }
  }

  function muzzleFlash(x, y, angle) {
    for (let i = 0; i < 5; i++) {
      const spread = (Math.random() - 0.5) * 0.6;
      const spd = 150 + Math.random() * 100;
      spawn(x, y, Math.cos(angle + spread) * spd, Math.sin(angle + spread) * spd, '#ffcc00', 0.1, 4);
    }
  }

  function update(dt) {
    for (let i = pool.length - 1; i >= 0; i--) {
      const p = pool[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= dt;
      if (p.life <= 0) pool.splice(i, 1);
    }
  }

  function render(ctx) {
    for (const p of pool) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }

  function clear() { pool.length = 0; }

  return { spawn, burst, muzzleFlash, update, render, clear };
})();
