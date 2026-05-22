# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Games

No build step — open HTML files directly in a browser:

```
# Shooter game
shooter/index.html

# Tic Tac Toe
tictactoe.html
```

On Windows, open with: `Start-Process "shooter\index.html"`

## Git Workflow

This repo is connected to GitHub at `https://github.com/DamolaGit/ClaudeCodeTest`.

After every meaningful change: stage specific files, commit with a clean message, and push:

```powershell
git add shooter/main.js shooter/enemy.js   # stage only changed files
git commit -m "feat: add enemy dash attack on low HP"
git push
```

Commit message format: `type: short description` — types are `feat`, `fix`, `refactor`, `style`.

## Shooter Architecture (`shooter/`)

All scripts are loaded as plain `<script>` tags in `index.html` — no modules, no bundler. Load order matters: `sprites.js` → `audio.js` → `input.js` → `particles.js` → `bullet.js` → `enemy.js` → `player.js` → `levels.js` → `ui.js` → `main.js`.

### State machine (`main.js`)
Central game loop. Global `state` variable drives which update/render path runs each frame. States: `MENU → PLAYING → PAUSED → LEVEL_COMPLETE → GAME_OVER / VICTORY`. `levelIndex` (0-based) indexes into the `LEVELS` array from `levels.js`.

### Sprite system (`sprites.js`)
All visuals are drawn programmatically — no image files. Sprites are defined as 2D arrays of single-character palette keys (`PAL` object maps chars to hex colors). `drawSprite(ctx, pixels, x, y)` renders each cell as a `SCALE×SCALE` (3px) filled rectangle. Player, gun, and enemy frames are defined as arrays of these pixel arrays for animation.

### Entity pattern
`Player`, `Enemy`, and `Bullet` each have `update(dt, ...)` and `render(ctx)` methods plus a `dead` boolean. `main.js` removes dead entities by splicing arrays in reverse-index loops. `Enemy` additionally has a `dying` state (plays a death animation for 0.5s before `dead` becomes true).

### Wave system (`levels.js`)
`LEVELS` is a plain array of level configs. `WaveManager` consumes a level config and manages a `spawnQueue` — it pops an enemy type string every `spawnInterval` seconds and calls `spawnEnemy()`. A wave is "done" when the queue is empty AND the `enemies` array in `main.js` is empty. After a configurable between-wave pause, the next wave loads.

### Input (`input.js`)
Singleton `Input` object. Tracks held keys in a `keys` object keyed by `e.code`. Mouse coordinates are converted to canvas-space on `mousemove`. `Input.firing` is true while left button held; `Input.consumeClick()` returns true once per click event (for single-shot detection).

### Audio (`audio.js`)
Web Audio API only — no sound files. Each sound is a short oscillator beep with exponential gain ramp-out. `Audio.resume()` is called every frame to handle browser autoplay policy requiring a user gesture before audio context can run.

### UI (`ui.js`)
All screens (menu, HUD, pause, game-over, victory) are canvas-drawn overlays. `UI.hitButton(mx, my, buttons)` does simple AABB hit-testing against a list of `{id, cx, cy}` descriptors — button dimensions are hardcoded as 260×36px. Button `cy` values in `handleClick` in `main.js` must match the `cy` values passed to `UI.draw*` functions.

### High score
Persisted to `localStorage` under key `dz_highscore`. Updated on both death and level completion.
