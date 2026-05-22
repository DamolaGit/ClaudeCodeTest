const LEVELS = [
  {
    level: 1,
    waves: [
      { count: 5,  types: ['basic'] },
      { count: 8,  types: ['basic'] },
      { count: 10, types: ['basic'] },
    ],
    spawnInterval: 1.8,
    title: 'THE DEAD AWAKEN',
  },
  {
    level: 2,
    waves: [
      { count: 8,  types: ['basic', 'basic', 'runner'] },
      { count: 10, types: ['basic', 'runner'] },
      { count: 12, types: ['basic', 'runner', 'runner'] },
    ],
    spawnInterval: 1.5,
    title: 'THEY RUN NOW',
  },
  {
    level: 3,
    waves: [
      { count: 10, types: ['basic', 'runner', 'runner'] },
      { count: 12, types: ['basic', 'runner', 'tank'] },
      { count: 15, types: ['basic', 'runner', 'tank'] },
      { count: 10, types: ['runner', 'tank'] },
    ],
    spawnInterval: 1.2,
    title: 'HEAVY METAL',
  },
  {
    level: 4,
    waves: [
      { count: 12, types: ['runner', 'basic', 'tank'] },
      { count: 15, types: ['runner', 'runner', 'tank'] },
      { count: 18, types: ['basic', 'runner', 'tank'] },
      { count: 12, types: ['tank', 'runner'] },
    ],
    spawnInterval: 1.0,
    title: 'OVERRUN',
  },
  {
    level: 5,
    waves: [
      { count: 15, types: ['runner', 'tank', 'basic'] },
      { count: 20, types: ['runner', 'tank'] },
      { count: 20, types: ['tank', 'runner', 'runner'] },
      { count: 25, types: ['basic', 'runner', 'tank'] },
      { count: 15, types: ['tank', 'tank', 'runner'] },
    ],
    spawnInterval: 0.8,
    title: 'FINAL STAND',
  },
];

class WaveManager {
  constructor(levelData, W, H) {
    this.W = W;
    this.H = H;
    this.waves = levelData.waves;
    this.spawnInterval = levelData.spawnInterval;
    this.waveIndex = 0;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.betweenWaveTimer = 0;
    this.betweenWave = false;
    this.done = false;
    this._loadWave();
  }

  _loadWave() {
    if (this.waveIndex >= this.waves.length) { this.done = true; return; }
    const wave = this.waves[this.waveIndex];
    this.spawnQueue = [];
    for (let i = 0; i < wave.count; i++) {
      const types = wave.types;
      this.spawnQueue.push(types[Math.floor(Math.random() * types.length)]);
    }
    this.spawnTimer = 0;
    this.betweenWave = false;
  }

  get currentWave() { return this.waveIndex + 1; }
  get totalWaves()  { return this.waves.length; }

  update(dt, enemies) {
    if (this.done) return;

    if (this.betweenWave) {
      this.betweenWaveTimer -= dt;
      if (this.betweenWaveTimer <= 0) {
        this.waveIndex++;
        this._loadWave();
      }
      return;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.spawnQueue.length > 0) {
      const type = this.spawnQueue.shift();
      enemies.push(spawnEnemy(type, this.W, this.H));
      this.spawnTimer = this.spawnInterval;
    }

    // wave clear: queue empty and all enemies dead
    if (this.spawnQueue.length === 0 && enemies.length === 0 && !this.done) {
      if (this.waveIndex < this.waves.length - 1) {
        this.betweenWave = true;
        this.betweenWaveTimer = 3.0;
      } else {
        this.done = true;
      }
    }
  }
}
