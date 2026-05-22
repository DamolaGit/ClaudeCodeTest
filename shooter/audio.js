const Audio = (() => {
  let ctx = null;

  function init() {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }

  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

  function beep(freq, duration, type = 'square', vol = 0.15, freqEnd = null) {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (freqEnd !== null) osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + duration);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  return {
    init, resume,
    shoot()       { beep(880, 0.08, 'square', 0.1, 440); },
    hit()         { beep(220, 0.12, 'sawtooth', 0.15, 110); },
    enemyDie()    { beep(330, 0.18, 'square', 0.12, 80); },
    playerHit()   { beep(150, 0.25, 'sawtooth', 0.2, 80); },
    levelComplete(){
      [440, 550, 660, 880].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'square', 0.15), i * 120));
    },
    gameOver() {
      [440, 330, 220, 110].forEach((f, i) => setTimeout(() => beep(f, 0.3, 'sawtooth', 0.2), i * 150));
    },
    menuSelect()  { beep(660, 0.1, 'square', 0.1); },
  };
})();
