// Pixel art sprite renderer — each "pixel" is 4x4 canvas pixels
const SCALE = 3;

const PAL = {
  '.': null,
  'S': '#e8d5a3', // skin
  'H': '#4a3728', // dark hair/brown
  'B': '#2a4a8a', // blue shirt
  'K': '#3a3a3a', // dark pants
  'G': '#888888', // gun grey
  'g': '#aaaaaa', // gun light
  'R': '#cc2222', // red
  'r': '#ff4444', // light red
  'E': '#22aa44', // enemy green
  'e': '#44cc66', // enemy light green
  'Y': '#ccaa22', // yellow
  'W': '#ffffff', // white
  'N': '#1a1a1a', // near black outline
  'T': '#886644', // tank brown
  't': '#aa8855', // tank light
  'P': '#cc44cc', // runner purple
  'p': '#ee66ee', // runner light purple
  'F': '#ffcc00', // flash yellow
  'O': '#ff8800', // orange
  'D': '#aa2200', // dark red (blood)
  'X': '#cc0000', // blood red
};

function drawSprite(ctx, pixels, x, y, flipX = false) {
  const rows = pixels.length;
  const cols = pixels[0].length;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ch = flipX ? pixels[row][cols - 1 - col] : pixels[row][col];
      const color = PAL[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(
        Math.round(x + col * SCALE),
        Math.round(y + row * SCALE),
        SCALE, SCALE
      );
    }
  }
}

// Player: 10x14 logical pixels, top-down view
const PLAYER_FRAMES = [
  // Frame 0: idle / walk A
  [
    '..NNNNN...',
    '.NSSSSN..',
    '.NSSSSN..',
    'NNBBBBNN.',
    'NBBBBBBNN',
    'NBBBBBBN.',
    '.NBBBBNN.',
    '..NKKNNN.',
    '..NKKN...',
    '.NKKKKN..',
    '.NK..KN..',
    '..N..N...',
  ],
  // Frame 1: walk B (legs shifted)
  [
    '..NNNNN...',
    '.NSSSSN..',
    '.NSSSSN..',
    'NNBBBBNN.',
    'NBBBBBBNN',
    'NBBBBBBN.',
    '.NBBBBNN.',
    '..NKKNNN.',
    '.NKKKN...',
    '..NK.KN..',
    '..N..KN..',
    '..N...N..',
  ],
];

const GUN_PIXELS = [
  'NGGNN',
  'NgggN',
  'NGGNN',
];

// Basic enemy: zombie green, 10x12
const ENEMY_BASIC_FRAMES = [
  [
    '..NNNNN.',
    '.NEEEEN.',
    '.NEEEEN.',
    'NNEEEENN',
    'NEEEEEEN',
    'NEEEEEEN',
    '.NEEEENN',
    '..NKKNNN',
    '.NKKKN..',
    '.NK.KN..',
    '..N.N...',
  ],
  [
    '..NNNNN.',
    '.NEEEEN.',
    '.NEEEEN.',
    'NNEEEENN',
    'NEEEEEEN',
    'NEEEEEEN',
    '.NEEEENN',
    '..NKKNNN',
    '..NKKKN.',
    '..NK.KN.',
    '...N.N..',
  ],
];

// Runner enemy: purple, slimmer
const ENEMY_RUNNER_FRAMES = [
  [
    '.NNNNN.',
    'NPEEPNN',
    'NPEEPNN',
    'NPPPPPN',
    'NPPPPPN',
    '.NPPNN.',
    '.NKKNNN',
    '.NK.KN.',
    '..N.N..',
  ],
  [
    '.NNNNN.',
    'NPEEPNN',
    'NPEEPNN',
    'NPPPPPN',
    'NPPPPPN',
    '.NPPNN.',
    '.NKKNNN',
    '..NKKN.',
    '...NN..',
  ],
];

// Tank enemy: big brown, 14x14
const ENEMY_TANK_FRAMES = [
  [
    '..NNNNNNN..',
    '.NTTTTTTTN.',
    '.NTTTTTTN..',
    'NNTTTTTTNNN',
    'NTTTTTTTTN.',
    'NTTTTTTTTN.',
    'NTTTTTTTTN.',
    '.NTTTTTNN..',
    '..NNKKKNN..',
    '..NK.K.KN..',
    '..N..K..N..',
    '..N..N..N..',
  ],
  [
    '..NNNNNNN..',
    '.NTTTTTTTN.',
    '.NTTTTTTN..',
    'NNTTTTTTNNN',
    'NTTTTTTTTN.',
    'NTTTTTTTTN.',
    'NTTTTTTTTN.',
    '.NTTTTTNN..',
    '..NNKKKNN..',
    '..NK.KKN...',
    '..N..K.N...',
    '..N..N.N...',
  ],
];

const BLOOD_SPLAT = [
  '.X.D.',
  'XXDXX',
  'XDDDD',
  'XXDXX',
  '.X.D.',
];

function drawPlayer(ctx, x, y, frame, facing) {
  const px = frame % 2;
  const pixels = PLAYER_FRAMES[px];
  const w = pixels[0].length * SCALE;
  const h = pixels.length * SCALE;
  drawSprite(ctx, pixels, x - w / 2, y - h / 2);
}

function drawGun(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const w = GUN_PIXELS[0].length * SCALE;
  const h = GUN_PIXELS.length * SCALE;
  drawSprite(ctx, GUN_PIXELS, 0, -h / 2);
  ctx.restore();
}

function drawEnemy(ctx, x, y, type, frame) {
  let pixels;
  if (type === 'basic') pixels = ENEMY_BASIC_FRAMES[frame % 2];
  else if (type === 'runner') pixels = ENEMY_RUNNER_FRAMES[frame % 2];
  else pixels = ENEMY_TANK_FRAMES[frame % 2];
  const w = pixels[0].length * SCALE;
  const h = pixels.length * SCALE;
  drawSprite(ctx, pixels, x - w / 2, y - h / 2);
}

function drawBloodSplat(ctx, x, y, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const w = BLOOD_SPLAT[0].length * SCALE;
  const h = BLOOD_SPLAT.length * SCALE;
  drawSprite(ctx, BLOOD_SPLAT, x - w / 2, y - h / 2);
  ctx.restore();
}

function drawMuzzleFlash(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(0, -4, 12, 8);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(2, -2, 6, 4);
  ctx.restore();
}
