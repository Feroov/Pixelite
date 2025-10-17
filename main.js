// === Constants ================================================================
const TILE_SIZE = 32;
const CANVAS_W = 640,
  CANVAS_H = 480;
const MAP_W = 40,
  MAP_H = 30; // 1280x960 world
const STORAGE_KEY = "tilegame:v1";
const SAVE_VERSION = 1;
const SAVE_INTERVAL_MS = 500;
const CAMERA_LERP = 0.18;
const CAMERA_MAX_SPEED = 420;
const MINIMAP_W = 100,
  MINIMAP_H = 75;
const TILE = { GRASS: 0, WATER: 1, TREE: 2, SAND: 3 };
const TILE_INFO = {
  [TILE.GRASS]: { name: "Grass", solid: false, img: "assets/grass.png" },
  [TILE.WATER]: { name: "Water", solid: true, img: "assets/water.png" },
  [TILE.TREE]: { name: "Tree", solid: true, img: "assets/tree.png" },
  [TILE.SAND]: { name: "Sand", solid: false, img: "assets/sand.png" },
};
const MINIMAP_COLORS = {
  [TILE.GRASS]: "#3fa866",
  [TILE.WATER]: "#2f5fa8",
  [TILE.TREE]: "#27613a",
  [TILE.SAND]: "#d6c178",
};
const MINIMAP_SCALE_X = MINIMAP_W / MAP_W;
const MINIMAP_SCALE_Y = MINIMAP_H / MAP_H;
const FOOTSTEP_PRESETS = {
  [TILE.GRASS]: { freq: 220, duration: 0.13, gain: 0.08 },
  [TILE.SAND]: { freq: 170, duration: 0.17, gain: 0.1 },
};
const ENEMY_SPRITES = [
  "assets/enemy1.png",
  "assets/enemy2.png",
  "assets/enemy3.png",
  "assets/enemy4.png",
  "assets/enemy5.png",
];
const ENEMY_SIZE = 28;
const ENEMY_SPEED_BASE = 70;
const ENEMY_SPEED_STEP = 6;
const ENEMY_WANDER_INTERVAL = { min: 1.5, max: 3.5 };
const ENEMY_AGGRO_DISTANCE_BASE = TILE_SIZE * 2;
const ENEMY_AGGRO_DISTANCE_STEP = TILE_SIZE * 0.25;
const ENEMY_COLLIDE_DISTANCE = TILE_SIZE * 0.6;
const PLAYER_BATTLE_HP = 30;
const ENEMY_BATTLE_HP = 20;
const BATTLE_MOVES = [
  { id: "quick", label: "Quick Jab ", hit: 0.9, dmg: [4, 7] },
  { id: "heavy", label: "Heavy Swing ", hit: 0.65, dmg: [7, 12] },
  { id: "feint", label: "Cunning Feint ", hit: 0.5, dmg: [0, 15] },
];
const ENEMY_COUNTER = { hit: 0.7, dmg: [3, 8] };
const HEART_VALUE = 5;
// === Globals =================================================================
let canvas, ctx;
let keys = Object.create(null);
let images = {};
let map = null;
let worldSeed = null;
let player = {
  x: 5 * TILE_SIZE,
  y: 5 * TILE_SIZE,
  w: 24,
  h: 24,
  speed: 140,
  lastTileX: null,
  lastTileY: null,
};
let camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
let stats = { steps: 0, playTimeMs: 0 };
let settings = { mute: false };
let worldId = "demo";
let hud = {};
let accTimeForSave = 0;
let prevTs = 0;
let minimapCanvas, minimapCtx;
let minimapDirty = true;
let lastMiniPlayer = { x: -1, y: -1 };
let lastMiniCamera = { x: -1, y: -1 };
let audioCtx = null;
let menu = {};
let savedSnapshot = null;
let gameState = "menu";
let loopStarted = false;
let level = 1;
let score = 0;
let enemies = [];
let activeBattle = null;
let battleUI = {};
let ambientMusic = { gain: null, timer: null };
let accessibleTiles = new Set();
let music = {
  menu: null,
  game: null,
  current: null,
};
let audioUnlocked = false;

// === Utilities ================================================================
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const randRange = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(randRange(min, max + 1));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function srand(seed) {
  // mulberry32
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function makeWorldId(seed) {
  return `isle-${(seed >>> 0).toString(16).padStart(8, "0").slice(-6)}`;
}
function seedFromInput(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^0x[0-9a-f]+$/i.test(trimmed)) {
    const parsed = parseInt(trimmed, 16);
    if (!Number.isNaN(parsed)) return parsed >>> 0;
  }
  if (/^[+-]?\d+$/.test(trimmed)) {
    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed)) return parsed >>> 0;
  }
  let hash = 0x811c9dc5;
  for (let i = 0; i < trimmed.length; i++) {
    hash ^= trimmed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
async function loadAssets() {
  const entries = Object.values(TILE_INFO).map((t) => t.img);
  const unique = Array.from(
    new Set([...entries, "assets/player.png", ...ENEMY_SPRITES])
  );
  const loaded = await Promise.all(unique.map(loadImage));
  for (let i = 0; i < unique.length; i++) images[unique[i]] = loaded[i];
}
// === Map Generation (random island) ==========================================
// Produces: mostly water outside, blob of land inside, sand along coasts, tree clumps
function generateIslandMap(w, h, seed) {
  const rnd = srand(seed);
  const m = Array.from({ length: h }, () => Array(w).fill(TILE.WATER));
  // start with an ellipse of grass (island core)
  const cx = w / 2,
    cy = h / 2;
  const rx = w * (0.32 + rnd() * 0.08);
  const ry = h * (0.32 + rnd() * 0.08);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      const d = nx * nx + ny * ny;
      if (d < 1.0 + (rnd() - 0.5) * 0.2) {
        m[y][x] = TILE.GRASS;
      }
    }
  }
  // erode edges: carve bays with a few random circles
  for (let i = 0; i < 5; i++) {
    const ex = Math.floor(rnd() * w);
    const ey = Math.floor(rnd() * h);
    const rr = 3 + Math.floor(rnd() * 6);
    for (let y = -rr; y <= rr; y++) {
      for (let x = -rr; x <= rr; x++) {
        const xx = ex + x,
          yy = ey + y;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const dist2 = x * x + y * y;
        if (dist2 <= rr * rr && rnd() < 0.5) m[yy][xx] = TILE.WATER;
      }
    }
  }
  // sand along coasts (grass next to water)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (m[y][x] === TILE.GRASS && touchesTile(m, x, y, TILE.WATER)) {
        m[y][x] = TILE.SAND;
      }
    }
  }
  // sprinkle trees on interior grass (not on sand)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (
        m[y][x] === TILE.GRASS &&
        rnd() < 0.08 &&
        !touchesTile(m, x, y, TILE.WATER)
      ) {
        m[y][x] = TILE.TREE;
      }
    }
  }
  // ensure at least some grass
  if (!findAnyGrass(m)) {
    // fallback: center patch
    for (let y = Math.floor(cy) - 2; y <= Math.floor(cy) + 2; y++)
      for (let x = Math.floor(cx) - 2; x <= Math.floor(cx) + 2; x++)
        if (x >= 0 && y >= 0 && x < w && y < h) m[y][x] = TILE.GRASS;
  }
  smoothCoastlines(m);
  smoothCoastlines(m);
  return m;
}
function smoothCoastlines(m) {
  const h = m.length,
    w = m[0].length;
  const clone = m.map((row) => row.slice());
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tile = m[y][x];
      if (tile === TILE.WATER) {
        let landNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const ny = y + dy,
              nx = x + dx;
            if (ny < 0 || nx < 0 || ny >= h || nx >= w) continue;
            const nt = m[ny][nx];
            if (nt === TILE.SAND || nt === TILE.GRASS) landNeighbors++;
          }
        }
        if (landNeighbors >= 5) clone[y][x] = TILE.SAND;
      } else if (tile === TILE.SAND) {
        let sandNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const ny = y + dy,
              nx = x + dx;
            if (ny < 0 || nx < 0 || ny >= h || nx >= w) continue;
            if (m[ny][nx] === TILE.SAND) sandNeighbors++;
          }
        }
        if (sandNeighbors <= 1) clone[y][x] = TILE.GRASS;
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) m[y][x] = clone[y][x];
  }
}
function touchesTile(m, x, y, tile) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const xx = x + dx,
        yy = y + dy;
      if (yy < 0 || xx < 0 || yy >= m.length || xx >= m[0].length) continue;
      if (m[yy][xx] === tile) return true;
    }
  }
  return false;
}
function findAnyGrass(m) {
  for (let y = 0; y < m.length; y++)
    for (let x = 0; x < m[0].length; x++)
      if (m[y][x] === TILE.GRASS || m[y][x] === TILE.SAND) return true;
  return false;
}
function pickRandomGrassSpawn(m, seed) {
  const rnd = srand(seed ^ 0x9e3779b9);
  const open = [];
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[0].length; x++) {
      if (m[y][x] === TILE.GRASS || m[y][x] === TILE.SAND) {
        open.push({ x, y });
      }
    }
  }
  if (open.length === 0) return { x: 5, y: 5 };
  const pick = open[Math.floor(rnd() * open.length)];
  return pick;
}
function findOpenTile(minDistanceTiles = 2) {
  if (!map) return { x: 0, y: 0 };
  let pool = [];
  if (accessibleTiles.size) {
    pool = Array.from(accessibleTiles).map((key) => ({
      x: key % MAP_W,
      y: Math.floor(key / MAP_W),
    }));
  } else {
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const t = map[y][x];
        if (isPassableTile(t)) pool.push({ x, y });
      }
    }
  }
  if (!pool.length) return { x: 0, y: 0 };
  const px =
    player.lastTileX ?? Math.floor((player.x + player.w / 2) / TILE_SIZE);
  const py =
    player.lastTileY ?? Math.floor((player.y + player.h / 2) / TILE_SIZE);
  const minDist2 = minDistanceTiles * minDistanceTiles;
  for (let attempt = 0; attempt < 120; attempt++) {
    const tile = pool[Math.floor(Math.random() * pool.length)];
    if (player.lastTileX == null) return tile;
    const dx = tile.x - px;
    const dy = tile.y - py;
    if (dx * dx + dy * dy >= minDist2) return tile;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
function computeAccessibleTiles(startX, startY) {
  const result = new Set();
  if (!map || startX == null || startY == null) return result;
  const queue = [{ x: startX, y: startY }];
  const seen = new Set();
  while (queue.length) {
    const { x, y } = queue.shift();
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
    const key = y * MAP_W + x;
    if (seen.has(key)) continue;
    seen.add(key);
    const tile = map[y][x];
    if (!isPassableTile(tile)) continue;
    result.add(key);
    queue.push({ x: x + 1, y });
    queue.push({ x: x - 1, y });
    queue.push({ x, y: y + 1 });
    queue.push({ x, y: y - 1 });
  }
  return result;
}
function refreshAccessibility() {
  if (!map || player.lastTileX == null || player.lastTileY == null) {
    accessibleTiles = new Set();
    return;
  }
  accessibleTiles = computeAccessibleTiles(player.lastTileX, player.lastTileY);
}
function enemiesForLevel(lvl) {
  return 2 + Math.max(0, lvl - 1);
}
function aliveEnemiesCount() {
  return enemies.reduce((sum, e) => sum + (e.alive ? 1 : 0), 0);
}
function spawnEnemies(count) {
  enemies = [];
  if (!map) return;
  if (!accessibleTiles.size && player.lastTileX != null) {
    refreshAccessibility();
  }
  const levelFactor = Math.max(0, level - 1);
  for (let i = 0; i < count; i++) {
    let tile;
    let tries = 0;
    do {
      tile = findOpenTile(3);
      tries++;
    } while (
      tries < 60 &&
      enemies.some(
        (e) =>
          Math.hypot(
            e.x + e.w / 2 - (tile.x + 0.5) * TILE_SIZE,
            e.y + e.h / 2 - (tile.y + 0.5) * TILE_SIZE
          ) < TILE_SIZE
      )
    );
    const baseHp = ENEMY_BATTLE_HP + levelFactor * 5;
    const speed =
      ENEMY_SPEED_BASE + levelFactor * ENEMY_SPEED_STEP + randRange(-10, 20);
    const detectionRadius =
      ENEMY_AGGRO_DISTANCE_BASE + levelFactor * ENEMY_AGGRO_DISTANCE_STEP;
    const attackHit = clamp(ENEMY_COUNTER.hit + levelFactor * 0.03, 0, 0.97);
    const attackMin = ENEMY_COUNTER.dmg[0] + levelFactor;
    const attackMax = ENEMY_COUNTER.dmg[1] + levelFactor * 2;
    const enemy = {
      id: `enemy-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
      x: (tile.x + 0.5) * TILE_SIZE - ENEMY_SIZE / 2,
      y: (tile.y + 0.5) * TILE_SIZE - ENEMY_SIZE / 2,
      w: ENEMY_SIZE,
      h: ENEMY_SIZE,
      speed,
      state: "wander",
      wanderTimer: randRange(
        ENEMY_WANDER_INTERVAL.min,
        ENEMY_WANDER_INTERVAL.max
      ),
      dirX: 0,
      dirY: 0,
      alive: true,
      sprite: ENEMY_SPRITES[randInt(0, ENEMY_SPRITES.length - 1)],
      maxHp: baseHp,
      battleHp: baseHp,
      detectionRadius,
      attack: { hit: attackHit, dmg: [attackMin, attackMax] },
    };
    enemies.push(enemy);
  }
  minimapDirty = true;
}
function serializeEnemies() {
  return enemies
    .filter((e) => e.alive)
    .map((e) => ({
      id: e.id,
      x: e.x,
      y: e.y,
      w: e.w,
      h: e.h,
      speed: e.speed,
      dirX: e.dirX,
      dirY: e.dirY,
      wanderTimer: e.wanderTimer,
      sprite: e.sprite,
      maxHp: e.maxHp,
      battleHp: e.battleHp,
      detectionRadius: e.detectionRadius,
      attack: e.attack
        ? {
            hit: e.attack.hit,
            dmg: Array.isArray(e.attack.dmg)
              ? [...e.attack.dmg]
              : [...ENEMY_COUNTER.dmg],
          }
        : null,
    }));
}
function restoreEnemies(list = []) {
  const lvlFactor = Math.max(0, level - 1);
  enemies = list.map((data, idx) => ({
    id: data.id ?? `enemy-${Date.now()}-${idx}`,
    x: data.x ?? 0,
    y: data.y ?? 0,
    w: data.w ?? ENEMY_SIZE,
    h: data.h ?? ENEMY_SIZE,
    speed: data.speed ?? ENEMY_SPEED_BASE,
    dirX: data.dirX ?? 0,
    dirY: data.dirY ?? 0,
    wanderTimer:
      data.wanderTimer ??
      randRange(ENEMY_WANDER_INTERVAL.min, ENEMY_WANDER_INTERVAL.max),
    sprite:
      data.sprite && ENEMY_SPRITES.includes(data.sprite)
        ? data.sprite
        : ENEMY_SPRITES[idx % ENEMY_SPRITES.length],
    maxHp: data.maxHp ?? ENEMY_BATTLE_HP,
    battleHp: data.battleHp ?? ENEMY_BATTLE_HP,
    state: "wander",
    alive: true,
    detectionRadius:
      data.detectionRadius ??
      ENEMY_AGGRO_DISTANCE_BASE + lvlFactor * ENEMY_AGGRO_DISTANCE_STEP,
    attack: (() => {
      const attackData = data.attack;
      if (attackData && typeof attackData === "object") {
        const dmgArr =
          Array.isArray(attackData.dmg) && attackData.dmg.length >= 2
            ? [...attackData.dmg]
            : [...ENEMY_COUNTER.dmg];
        return {
          hit: clamp(
            attackData.hit ?? ENEMY_COUNTER.hit + lvlFactor * 0.03,
            0,
            0.97
          ),
          dmg: dmgArr,
        };
      }
      return {
        hit: clamp(ENEMY_COUNTER.hit + lvlFactor * 0.03, 0, 0.97),
        dmg: [
          ENEMY_COUNTER.dmg[0] + lvlFactor,
          ENEMY_COUNTER.dmg[1] + lvlFactor * 2,
        ],
      };
    })(),
  }));
  for (const enemy of enemies) {
    const tx = Math.floor((enemy.x + enemy.w / 2) / TILE_SIZE);
    const ty = Math.floor((enemy.y + enemy.h / 2) / TILE_SIZE);
    const key = ty * MAP_W + tx;
    if (accessibleTiles.size && !accessibleTiles.has(key)) {
      const tile = findOpenTile(2);
      enemy.x = (tile.x + 0.5) * TILE_SIZE - enemy.w / 2;
      enemy.y = (tile.y + 0.5) * TILE_SIZE - enemy.h / 2;
    }
    enemy.battleHp = Math.min(enemy.battleHp, enemy.maxHp);
  }
  minimapDirty = true;
}
// === State (localStorage) =====================================================
function saveState() {
  if (worldSeed == null || map == null) return;
  const state = {
    v: SAVE_VERSION,
    player: { x: player.x, y: player.y },
    worldId,
    seed: worldSeed,
    settings: { ...settings },
    stats: { ...stats },
    level,
    score,
    enemies: serializeEnemies(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  savedSnapshot = {
    ...state,
    player: { ...state.player },
    settings: { ...state.settings },
    stats: { ...state.stats },
    enemies: state.enemies.map((e) => ({ ...e })),
  };
}
function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    let data = JSON.parse(raw);
    if (!data) return null;
    if (data.v !== SAVE_VERSION) data = migrateSave(data);
    if (!data) return null;
    data.settings = { mute: false, ...data.settings };
    data.stats = { steps: 0, playTimeMs: 0, ...data.stats };
    data.level = data.level ?? 1;
    data.score = data.score ?? 0;
    data.enemies = Array.isArray(data.enemies) ? data.enemies : [];
    return data;
  } catch {
    return null;
  }
}
function migrateSave(old) {
  // placeholder for future migrations
  return {
    ...old,
    v: SAVE_VERSION,
    level: old.level ?? 1,
    score: old.score ?? 0,
    enemies: Array.isArray(old.enemies) ? old.enemies : [],
  };
}
function resetState(withNewSeed = true) {
  const nextSeed = withNewSeed
    ? (Math.random() * 2 ** 32) | 0
    : worldSeed ?? (Math.random() * 2 ** 32) | 0;
  localStorage.removeItem(STORAGE_KEY);
  savedSnapshot = null;
  if (withNewSeed) {
    startFreshGame(nextSeed);
  } else {
    startFreshGame(nextSeed, {
      preserveScore: true,
      preserveLevel: true,
      levelOverride: level,
      scoreOverride: score,
    });
  }
}
// === Input ===================================================================
function setupInput() {
  const block = new Set([
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    " ",
  ]);
  window.addEventListener(
    "keydown",
    (e) => {
      const key = e.key.toLowerCase();
      if (gameState === "battle") {
        if (!e.repeat && key === "m") toggleMute();
        e.preventDefault();
        return;
      }
      const isPlaying = gameState === "playing";
      if (!isPlaying) {
        if (!e.repeat && key === "m") toggleMute();
        if (!e.repeat && key === "escape" && map && player.lastTileX !== null) {
          setMenuMessage("");
          showMenu();
          updateMenuButtons();
        }
        return;
      }
      if (key === "escape") {
        showMenu();
        updateMenuButtons();
        e.preventDefault();
        return;
      }
      keys[key] = true;
      if (!e.repeat && key === "m") toggleMute();
      resumeAudio();
      if (block.has(e.key)) e.preventDefault();
    },
    { passive: false }
  );
  window.addEventListener(
    "keyup",
    (e) => {
      if (gameState !== "playing") return;
      keys[e.key.toLowerCase()] = false;
      if (block.has(e.key)) e.preventDefault();
    },
    { passive: false }
  );
}
// === Helpers =================================================================
function isSolid(tileId) {
  const info = TILE_INFO[tileId];
  return info ? info.solid : true;
}
function isPassableTile(tileId) {
  return tileId === TILE.GRASS || tileId === TILE.SAND;
}
function tileAt(tx, ty) {
  if (ty < 0 || tx < 0 || ty >= MAP_H || tx >= MAP_W) return TILE.WATER; // out of bounds solid
  if (!map) return TILE.WATER;
  return map[ty][tx];
}
function clearMovementKeys() {
  for (const key of Object.keys(keys)) keys[key] = false;
}
function worldToScreen(wx, wy) {
  return { x: Math.floor(wx - camera.x), y: Math.floor(wy - camera.y) };
}
function clampCamera() {
  const worldW = MAP_W * TILE_SIZE;
  const worldH = MAP_H * TILE_SIZE;
  camera.x = clamp(camera.x, 0, Math.max(0, worldW - CANVAS_W));
  camera.y = clamp(camera.y, 0, Math.max(0, worldH - CANVAS_H));
}
function renderHearts(current, max) {
  const hearts = Math.max(1, Math.ceil(max / HEART_VALUE));
  let remaining = Math.max(0, current);
  const parts = [];
  for (let i = 0; i < hearts; i++) {
    const value = Math.max(0, Math.min(HEART_VALUE, remaining));
    let cls = "empty";
    if (value >= HEART_VALUE - 0.01) cls = "full";
    else if (value >= HEART_VALUE / 2) cls = "half";
    else if (value > 0) cls = "low";
    parts.push(`<span class="battle-heart ${cls}"></span>`);
    remaining -= HEART_VALUE;
  }
  return parts.join("");
}
function setMoveButtonContent(btn, move) {
  if (!btn) return;
  if (!move) {
    btn.style.display = "none";
    btn.disabled = true;
    return;
  }
  btn.style.display = "block";
  btn.disabled = false;
  const chance = Math.round(move.hit * 100);
  btn.innerHTML = `<span class="move-title">${move.label}</span><span class="move-detail">${chance}% • ${move.dmg[0]}-${move.dmg[1]} dmg</span>`;
}
function applySeed(seed) {
  worldSeed = seed >>> 0;
  worldId = makeWorldId(worldSeed);
  map = generateIslandMap(MAP_W, MAP_H, worldSeed);
  accessibleTiles = new Set();
  minimapDirty = true;
  if (hud.world) hud.world.textContent = worldId;
  if (hud.seed)
    hud.seed.textContent = `0x${worldSeed.toString(16).padStart(8, "0")}`;
}
function focusCameraImmediate() {
  camera.targetX = player.x + player.w / 2 - CANVAS_W / 2;
  camera.targetY = player.y + player.h / 2 - CANVAS_H / 2;
  camera.x = camera.targetX;
  camera.y = camera.targetY;
  clampCamera();
  lastMiniCamera = {
    x: Math.floor(camera.x / TILE_SIZE),
    y: Math.floor(camera.y / TILE_SIZE),
  };
  lastMiniPlayer = { x: player.lastTileX, y: player.lastTileY };
  minimapDirty = true;
}
function placePlayerOnTile(tx, ty) {
  player.lastTileX = tx;
  player.lastTileY = ty;
  player.x = (tx + 0.5) * TILE_SIZE - player.w / 2;
  player.y = (ty + 0.5) * TILE_SIZE - player.h / 2;
  focusCameraImmediate();
  refreshAccessibility();
}
function spawnPlayerRandom() {
  const spawn = pickRandomGrassSpawn(map, worldSeed);
  placePlayerOnTile(spawn.x, spawn.y);
}
// === Movement & Collision (tile AABB) ========================================
function update(dt) {
  if (gameState !== "playing") {
    return;
  }
  if (!map) return;
  // input vector
  let vx = 0,
    vy = 0;
  if (keys["arrowleft"] || keys["a"]) vx -= 1;
  if (keys["arrowright"] || keys["d"]) vx += 1;
  if (keys["arrowup"] || keys["w"]) vy -= 1;
  if (keys["arrowdown"] || keys["s"]) vy += 1;
  if (vx && vy) {
    const inv = 1 / Math.sqrt(2);
    vx *= inv;
    vy *= inv;
  }
  const spd = player.speed;
  let nx = player.x + vx * spd * dt;
  let ny = player.y + vy * spd * dt;
  // Resolve X then Y against solid tiles
  nx = collideAxis(player, nx, player.y, "x");
  ny = collideAxis(player, nx, ny, "y"); // note: use nx for x already resolved
  // commit
  player.x = nx;
  player.y = ny;
  // steps: when changing tile
  const tx = Math.floor((player.x + player.w / 2) / TILE_SIZE);
  const ty = Math.floor((player.y + player.h / 2) / TILE_SIZE);
  if (tx !== player.lastTileX || ty !== player.lastTileY) {
    stats.steps++;
    player.lastTileX = tx;
    player.lastTileY = ty;
    minimapDirty = true;
    const stepped = tileAt(tx, ty);
    if (stepped === TILE.GRASS || stepped === TILE.SAND) playFootstep(stepped);
  }
  // camera easing toward player
  camera.targetX = player.x + player.w / 2 - CANVAS_W / 2;
  camera.targetY = player.y + player.h / 2 - CANVAS_H / 2;
  const dx = camera.targetX - camera.x;
  const dy = camera.targetY - camera.y;
  const maxStep = CAMERA_MAX_SPEED * dt;
  camera.x += clamp(dx * CAMERA_LERP, -maxStep, maxStep);
  camera.y += clamp(dy * CAMERA_LERP, -maxStep, maxStep);
  clampCamera();
  const camTileX = Math.floor(camera.x / TILE_SIZE);
  const camTileY = Math.floor(camera.y / TILE_SIZE);
  if (camTileX !== lastMiniCamera.x || camTileY !== lastMiniCamera.y) {
    lastMiniCamera = { x: camTileX, y: camTileY };
    minimapDirty = true;
  }
  updateEnemies(dt);
  if (gameState === "battle") return;
  // time + throttled autosave
  stats.playTimeMs += dt * 1000;
  accTimeForSave += dt * 1000;
  if (accTimeForSave > SAVE_INTERVAL_MS) {
    saveState();
    accTimeForSave = 0;
  }
  updateHUD();
  if (tx !== lastMiniPlayer.x || ty !== lastMiniPlayer.y) {
    lastMiniPlayer = { x: tx, y: ty };
    minimapDirty = true;
  }
  updateMinimap();
}
function collideAxis(p, nx, ny, axis) {
  const px = axis === "x" ? nx : p.x;
  const py = axis === "y" ? ny : p.y;
  const halfW = p.w / 2,
    halfH = p.h / 2;
  // bbox corners (centered inside tile)
  const cx = px + halfW,
    cy = py + halfH;
  const left = Math.floor((cx - halfW) / TILE_SIZE);
  const right = Math.floor((cx + halfW) / TILE_SIZE);
  const top = Math.floor((cy - halfH) / TILE_SIZE);
  const bottom = Math.floor((cy + halfH) / TILE_SIZE);
  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      if (isSolid(tileAt(tx, ty))) {
        // compute tile rect
        const rx = tx * TILE_SIZE,
          ry = ty * TILE_SIZE;
        const rw = TILE_SIZE,
          rh = TILE_SIZE;
        // simple resolution along the moving axis
        if (axis === "x") {
          if (p.x + p.w <= rx && nx + p.w > rx) nx = rx - p.w; // moving right, hit left face
          if (p.x >= rx + rw && nx < rx + rw) nx = rx + rw; // moving left, hit right face
        } else {
          if (p.y + p.h <= ry && ny + p.h > ry) ny = ry - p.h; // moving down, hit top face
          if (p.y >= ry + rh && ny < ry + rh) ny = ry + rh; // moving up, hit bottom face
        }
      }
    }
  }
  return axis === "x" ? nx : ny;
}
function moveActor(actor, vx, vy, dt) {
  if (!vx && !vy) return;
  let nx = actor.x + vx * dt;
  let ny = actor.y + vy * dt;
  nx = collideAxis(actor, nx, actor.y, "x");
  ny = collideAxis(actor, nx, ny, "y");
  actor.x = nx;
  actor.y = ny;
}
function updateEnemies(dt) {
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;
  for (const enemy of enemies) {
    if (!enemy.alive || enemy.state === "battle") continue;
    const ex = enemy.x + enemy.w / 2;
    const ey = enemy.y + enemy.h / 2;
    const dist = Math.hypot(ex - px, ey - py);
    const detection = enemy.detectionRadius ?? ENEMY_AGGRO_DISTANCE_BASE;
    if (dist <= detection) {
      enemy.state = "chase";
    } else if (enemy.state === "chase" && dist > detection * 1.8) {
      enemy.state = "wander";
      enemy.wanderTimer = 0;
    }
    let vx = 0,
      vy = 0;
    if (enemy.state === "chase") {
      const len = Math.max(dist, 0.0001);
      vx = ((px - ex) / len) * enemy.speed;
      vy = ((py - ey) / len) * enemy.speed;
    } else {
      enemy.wanderTimer -= dt;
      if (enemy.wanderTimer <= 0) {
        enemy.wanderTimer = randRange(
          ENEMY_WANDER_INTERVAL.min,
          ENEMY_WANDER_INTERVAL.max
        );
        if (Math.random() < 0.35) {
          enemy.dirX = 0;
          enemy.dirY = 0;
        } else {
          const angle = Math.random() * Math.PI * 2;
          enemy.dirX = Math.cos(angle);
          enemy.dirY = Math.sin(angle);
        }
      }
      vx = enemy.dirX * enemy.speed * 0.4;
      vy = enemy.dirY * enemy.speed * 0.4;
    }
    moveActor(enemy, vx, vy, dt);
    const nx = enemy.x + enemy.w / 2;
    const ny = enemy.y + enemy.h / 2;
    const newDist = Math.hypot(nx - px, ny - py);
    if (newDist <= ENEMY_COLLIDE_DISTANCE + Math.max(player.w, player.h) / 2) {
      startBattle(enemy);
      return;
    }
  }
}
function startBattle(enemy) {
  if (!enemy || gameState !== "playing") return;
  clearMovementKeys();
  playBattleSound("start");
  enemy.battleHp = enemy.maxHp;
  activeBattle = {
    enemy,
    playerHp: PLAYER_BATTLE_HP,
    playerMaxHp: PLAYER_BATTLE_HP,
    enemyHp: Math.max(1, enemy.battleHp),
    enemyMaxHp: enemy.maxHp,
    busy: true,
    result: null,
  };
  enemy.state = "battle";
  gameState = "battle";
  battleUI.root?.classList.remove("is-hidden");
  battleUI.continue?.classList.add("is-hidden");
  battleUI.playerSprite?.classList.remove(
    "attack-player",
    "attack-enemy",
    "hit"
  );
  battleUI.enemySprite?.classList.remove(
    "attack-player",
    "attack-enemy",
    "hit"
  );
  if (battleUI.playerSprite) {
    const sprite = images["assets/player.png"];
    battleUI.playerSprite.src = sprite ? sprite.src : "assets/player.png";
  }
  if (battleUI.enemySprite) {
    const sprite = images[enemy.sprite];
    battleUI.enemySprite.src = sprite ? sprite.src : enemy.sprite;
  }
  if (battleUI.buttons) {
    battleUI.buttons.forEach((btn, idx) => {
      setMoveButtonContent(btn, BATTLE_MOVES[idx]);
    });
  }
  updateBattleUI();
  setBattleMessage("An enemy challenges you! Choose an action.");
  if (battleUI.buttons)
    battleUI.buttons.forEach((btn) => (btn.disabled = false));
  activeBattle.busy = false;
}
function setBattleMessage(text) {
  if (battleUI.msg) battleUI.msg.textContent = text;
}
async function animateBattleSprite(sprite, className, duration = 320) {
  if (!sprite) {
    await wait(duration);
    return;
  }
  sprite.classList.remove(className);
  // force reflow so the animation can retrigger
  void sprite.offsetWidth;
  sprite.classList.add(className);
  await wait(duration);
  sprite.classList.remove(className);
}
function animateBattleHit(sprite, duration = 380) {
  return animateBattleSprite(sprite, "hit", duration);
}
async function performPlayerAttack(move) {
  if (!activeBattle) return false;
  const detail = `${Math.round(move.hit * 100)}% ? ${move.dmg[0]}-${
    move.dmg[1]
  } dmg`;
  setBattleMessage(`You used ${move.label}!\n(${detail})`);
  await animateBattleSprite(battleUI.playerSprite, "attack-player");
  const hitSuccess = Math.random() <= move.hit;
  if (hitSuccess) {
    const dmg = randInt(move.dmg[0], move.dmg[1]);
    activeBattle.enemyHp = Math.max(0, activeBattle.enemyHp - dmg);
    if (activeBattle.enemy) activeBattle.enemy.battleHp = activeBattle.enemyHp;
    playBattleSound("player-hit");
    await animateBattleHit(battleUI.enemySprite);
    setBattleMessage(`Hit! Dealt ${dmg} damage.`);
  } else {
    playBattleSound("miss");
    setBattleMessage(`It missed!\n(${detail})`);
  }
  updateBattleUI();
  await wait(320);
  if (activeBattle && activeBattle.enemyHp <= 0) {
    setBattleMessage("Enemy fainted!");
    await wait(420);
    finishBattle("victory");
    return true;
  }
  return false;
}
async function performEnemyAttack() {
  if (!activeBattle) return false;
  const enemy = activeBattle.enemy;
  const attack = enemy?.attack ?? ENEMY_COUNTER;
  const detail = `${Math.round(attack.hit * 100)}% ? ${attack.dmg[0]}-${
    attack.dmg[1]
  } dmg`;
  setBattleMessage(`Enemy attacks!\n(${detail})`);
  await animateBattleSprite(battleUI.enemySprite, "attack-enemy");
  if (Math.random() <= attack.hit) {
    const dmg = randInt(attack.dmg[0], attack.dmg[1]);
    activeBattle.playerHp = Math.max(0, activeBattle.playerHp - dmg);
    playBattleSound("enemy-hit");
    await animateBattleHit(battleUI.playerSprite);
    setBattleMessage(`Enemy hit you for ${dmg} damage!`);
  } else {
    playBattleSound("miss");
    setBattleMessage(`Enemy attack missed!\n(${detail})`);
  }
  updateBattleUI();
  await wait(320);
  if (activeBattle && activeBattle.playerHp <= 0) {
    setBattleMessage("You were defeated...");
    await wait(420);
    finishBattle("defeat");
    return true;
  }
  return false;
}
function updateBattleUI() {
  if (!activeBattle) return;
  if (battleUI.playerHP) {
    battleUI.playerHP.innerHTML = renderHearts(
      activeBattle.playerHp,
      activeBattle.playerMaxHp ?? PLAYER_BATTLE_HP
    );
  }
  if (battleUI.enemyHP) {
    const maxHp =
      activeBattle.enemyMaxHp ??
      activeBattle.enemy?.maxHp ??
      activeBattle.enemyHp;
    battleUI.enemyHP.innerHTML = renderHearts(activeBattle.enemyHp, maxHp);
  }
}
async function handleBattleMove(index) {
  if (!activeBattle || activeBattle.busy || activeBattle.result) return;
  activeBattle.busy = true;
  if (battleUI.buttons)
    battleUI.buttons.forEach((btn) => (btn.disabled = true));
  const move = BATTLE_MOVES[index] ?? BATTLE_MOVES[0];
  const enemyDefeated = await performPlayerAttack(move);
  if (!activeBattle || activeBattle.result || enemyDefeated) return;
  await wait(420);
  const playerDefeated = await performEnemyAttack();
  if (!activeBattle || activeBattle.result || playerDefeated) return;
  await wait(260);
  setBattleMessage("Choose your next move!");
  activeBattle.busy = false;
  if (battleUI.buttons)
    battleUI.buttons.forEach((btn) => (btn.disabled = false));
}
function finishBattle(result) {
  if (!activeBattle) return;
  activeBattle.result = result;
  activeBattle.busy = false;
  clearMovementKeys();
  playBattleSound(result === "victory" ? "victory" : "defeat");
  if (battleUI.buttons)
    battleUI.buttons.forEach((btn) => (btn.disabled = true));
  if (battleUI.continue) {
    battleUI.continue.textContent =
      result === "victory" ? "Continue" : "Return to Menu";
    battleUI.continue.classList.remove("is-hidden");
  }
}
function handleBattleContinue() {
  if (!activeBattle) return;
  const { enemy, result } = activeBattle;
  clearMovementKeys();
  if (battleUI.buttons)
    battleUI.buttons.forEach((btn) => (btn.disabled = false));
  if (battleUI.continue) battleUI.continue.classList.add("is-hidden");
  battleUI.root?.classList.add("is-hidden");
  setBattleMessage("");
  if (result === "victory") {
    if (enemy) enemy.alive = false;
    enemies = enemies.filter((e) => e.alive);
    score += 100;
    updateHUD();
    saveState();
    activeBattle = null;
    if (aliveEnemiesCount() === 0) {
      advanceLevel();
      return;
    }
    clearMovementKeys();
    gameState = "playing";
    return;
  }
  // defeat
  level = 1;
  score = 0;
  stats = { steps: 0, playTimeMs: 0 };
  enemies = [];
  map = null;
  accessibleTiles = new Set();
  minimapDirty = true;
  activeBattle = null;
  player.lastTileX = null;
  player.lastTileY = null;
  localStorage.removeItem(STORAGE_KEY);
  savedSnapshot = null;
  if (hud.world) hud.world.textContent = "--";
  if (hud.seed) hud.seed.textContent = "--";
  clearMovementKeys();
  updateHUD();
  updateMenuButtons();
  showMenu("You were defeated! Start a new adventure.");
  playMenuMusic();
}
function advanceLevel() {
  level += 1;
  flash(`Level ${level}! More foes approach.`);
  const nextSeed = (Math.random() * 2 ** 32) | 0;
  startFreshGame(nextSeed, {
    preserveScore: true,
    preserveLevel: true,
    levelOverride: level,
    scoreOverride: score,
    statsOverride: stats,
    enemyCount: enemiesForLevel(level),
  });
}
// === Render ==================================================================
function render() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  if (!map) return;
  const startTx = Math.floor(camera.x / TILE_SIZE);
  const startTy = Math.floor(camera.y / TILE_SIZE);
  const endTx = Math.ceil((camera.x + CANVAS_W) / TILE_SIZE);
  const endTy = Math.ceil((camera.y + CANVAS_H) / TILE_SIZE);
  // floor & solids in one pass by draw order:
  for (let ty = startTy; ty < endTy; ty++) {
    for (let tx = startTx; tx < endTx; tx++) {
      const t = tileAt(tx, ty);
      const info = TILE_INFO[t] || TILE_INFO[TILE.WATER];
      const img = images[info.img];
      if (!img) continue;
      const sx = Math.floor(tx * TILE_SIZE - camera.x);
      const sy = Math.floor(ty * TILE_SIZE - camera.y);
      ctx.drawImage(img, sx, sy, TILE_SIZE, TILE_SIZE);
    }
  }
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const es = worldToScreen(enemy.x, enemy.y);
    const offset = (TILE_SIZE - enemy.w) / 2;
    const eimg = images[enemy.sprite];
    if (eimg) {
      ctx.drawImage(eimg, es.x - offset, es.y - offset, TILE_SIZE, TILE_SIZE);
    } else {
      ctx.fillStyle = "#f25f5c";
      ctx.fillRect(es.x - offset, es.y - offset, TILE_SIZE, TILE_SIZE);
    }
  }
  // player
  const pimg = images["assets/player.png"];
  const ps = worldToScreen(player.x, player.y);
  if (pimg) {
    const offset = (TILE_SIZE - player.w) / 2;
    ctx.drawImage(pimg, ps.x - offset, ps.y - offset, TILE_SIZE, TILE_SIZE);
  } else {
    ctx.fillStyle = "#fff";
    const offset = (TILE_SIZE - player.w) / 2;
    ctx.fillRect(ps.x - offset, ps.y - offset, TILE_SIZE, TILE_SIZE);
  }
}

// === Minimap =================================================================
function updateMinimap() {
  if (!minimapCtx || !map || !minimapDirty) return;
  minimapDirty = false;
  minimapCtx.clearRect(0, 0, MINIMAP_W, MINIMAP_H);
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      minimapCtx.fillStyle = MINIMAP_COLORS[map[y][x]] || "#000";
      minimapCtx.fillRect(
        x * MINIMAP_SCALE_X,
        y * MINIMAP_SCALE_Y,
        MINIMAP_SCALE_X + 0.5,
        MINIMAP_SCALE_Y + 0.5
      );
    }
  }
  const px =
    (player.lastTileX ?? Math.floor(player.x / TILE_SIZE)) * MINIMAP_SCALE_X;
  const py =
    (player.lastTileY ?? Math.floor(player.y / TILE_SIZE)) * MINIMAP_SCALE_Y;
  const dotW = Math.max(2, MINIMAP_SCALE_X);
  const dotH = Math.max(2, MINIMAP_SCALE_Y);
  minimapCtx.fillStyle = "#fff";
  minimapCtx.fillRect(px, py, dotW, dotH);
  minimapCtx.fillStyle = "#f25f5c";
  for (const enemy of enemies) {
    if (!enemy.alive || enemy.state === "battle") continue;
    const ex =
      Math.floor((enemy.x + enemy.w / 2) / TILE_SIZE) * MINIMAP_SCALE_X;
    const ey =
      Math.floor((enemy.y + enemy.h / 2) / TILE_SIZE) * MINIMAP_SCALE_Y;
    minimapCtx.fillRect(ex, ey, dotW, dotH);
  }
  const camX =
    (lastMiniCamera.x >= 0
      ? lastMiniCamera.x
      : Math.floor(camera.x / TILE_SIZE)) * MINIMAP_SCALE_X;
  const camY =
    (lastMiniCamera.y >= 0
      ? lastMiniCamera.y
      : Math.floor(camera.y / TILE_SIZE)) * MINIMAP_SCALE_Y;
  minimapCtx.strokeStyle = "rgba(255,255,255,0.6)";
  minimapCtx.lineWidth = 1;
  minimapCtx.strokeRect(
    camX + 0.5,
    camY + 0.5,
    (CANVAS_W / TILE_SIZE) * MINIMAP_SCALE_X,
    (CANVAS_H / TILE_SIZE) * MINIMAP_SCALE_Y
  );
}
// === Game Flow & Menu =========================================================
function setMenuMessage(text = "") {
  if (menu.msg) menu.msg.textContent = text;
}
function updateMenuButtons() {
  if (!menu.continue) return;
  const canResumeCurrent = !!map && player.lastTileX !== null;
  const hasSave = !!savedSnapshot;
  menu.continue.textContent = canResumeCurrent ? "Resume" : "Continue";
  menu.continue.disabled = !(canResumeCurrent || hasSave);
}
function showMenu(message = "") {
  gameState = "menu";
  for (const key of Object.keys(keys)) keys[key] = false;
  menu.root?.classList.remove("is-hidden");
  battleUI.continue?.classList.add("is-hidden");
  battleUI.root?.classList.add("is-hidden");
  updateMenuButtons();
  setMenuMessage(message);
  if (menu.seedInput) {
    menu.seedInput.value = menu.seedInput.value.trim();
    menu.seedInput.focus();
    menu.seedInput.select();
  }
  playMenuMusic();
}
function hideMenu() {
  menu.root?.classList.add("is-hidden");
  setMenuMessage("");
}
function enterGame() {
  hideMenu();
  gameState = "playing";
  prevTs = performance.now();
  updateHUD();
  minimapDirty = true;
  updateMinimap();
  playGameMusic();
}
function startFreshGame(seed, opts = {}) {
  const {
    preserveScore = false,
    preserveLevel = false,
    levelOverride,
    scoreOverride,
    statsOverride,
    enemyCount,
  } = opts;
  const ctx = resumeAudio();
  startAmbientMusic(ctx);
  playGameMusic();
  level = preserveLevel ? levelOverride ?? level : levelOverride ?? 1;
  score = preserveScore ? scoreOverride ?? score : scoreOverride ?? 0;
  if (statsOverride) {
    stats = {
      steps: statsOverride.steps ?? stats.steps ?? 0,
      playTimeMs: statsOverride.playTimeMs ?? stats.playTimeMs ?? 0,
    };
  } else {
    stats = { steps: 0, playTimeMs: 0 };
  }
  applySeed(seed);
  spawnPlayerRandom();
  spawnEnemies(enemyCount ?? enemiesForLevel(level));
  focusCameraImmediate();
  accTimeForSave = 0;
  savedSnapshot = null;
  updateHUD();
  minimapDirty = true;
  updateMenuButtons();
  clearMovementKeys();
  enterGame();
  saveState();
}
function resumeFromSnapshot(snapshot) {
  if (!snapshot) return false;
  const ctx = resumeAudio();
  startAmbientMusic(ctx);
  playGameMusic();

  const seed = snapshot.seed ?? (Math.random() * 2 ** 32) | 0;
  applySeed(seed);
  level = snapshot.level ?? 1;
  score = snapshot.score ?? 0;
  const savedPlayer = snapshot.player ?? {
    x: (MAP_W * TILE_SIZE) / 2,
    y: (MAP_H * TILE_SIZE) / 2,
  };
  player.x = savedPlayer.x;
  player.y = savedPlayer.y;
  player.lastTileX = Math.floor((player.x + player.w / 2) / TILE_SIZE);
  player.lastTileY = Math.floor((player.y + player.h / 2) / TILE_SIZE);
  stats = {
    steps: snapshot.stats?.steps ?? 0,
    playTimeMs: snapshot.stats?.playTimeMs ?? 0,
  };
  settings = { mute: false, ...settings, ...snapshot.settings };
  refreshAccessibility();
  if (Array.isArray(snapshot.enemies) && snapshot.enemies.length) {
    restoreEnemies(snapshot.enemies);
  } else {
    spawnEnemies(enemiesForLevel(level));
  }
  focusCameraImmediate();
  accTimeForSave = 0;
  updateMuteButton();
  updateHUD();
  minimapDirty = true;
  updateMenuButtons();
  clearMovementKeys();
  enterGame();
  return true;
}
// === Audio ===================================================================
function resumeAudio() {
  if (settings.mute) return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  startAmbientMusic(audioCtx);
  return audioCtx;
}
function toggleMute() {
  settings.mute = !settings.mute;
  if (settings.mute) {
    stopAmbientMusic();
    audioCtx?.suspend?.();
  } else {
    const ctx = resumeAudio();
    startAmbientMusic(ctx);
  }
  updateMuteButton();
  updateMusicMute();
  if (map && worldSeed != null) {
    saveState();
    accTimeForSave = 0;
  } else if (savedSnapshot) {
    savedSnapshot = {
      ...savedSnapshot,
      settings: { ...savedSnapshot.settings, mute: settings.mute },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSnapshot));
  }
}
function updateMuteButton() {
  if (!hud.btnMute) return;
  hud.btnMute.textContent = settings.mute ? "Unmute" : "Mute";
  hud.btnMute.classList.toggle("is-muted", settings.mute);
}
function playFootstep(tile) {
  const preset = FOOTSTEP_PRESETS[tile];
  if (!preset) return;
  const ctx = resumeAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(preset.gain, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + preset.duration);
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  const jitter = 1 + (Math.random() - 0.5) * 0.15;
  osc.frequency.setValueAtTime(preset.freq * jitter, now);
  osc.frequency.exponentialRampToValueAtTime(
    preset.freq * 0.6,
    now + preset.duration
  );
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + preset.duration);
}
function playAmbientChirp(ctx, gain) {
  const duration = 0.35 + Math.random() * 0.25;
  const buffer = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * duration),
    ctx.sampleRate
  );
  const data = buffer.getChannelData(0);
  const startFreq = 200 + Math.random() * 240;
  const endFreq = startFreq * (1.4 + Math.random() * 0.6);
  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    const progress = t / duration;
    const freq = startFreq + (endFreq - startFreq) * Math.pow(progress, 0.85);
    const envelope = Math.pow(1 - progress, 2);
    data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.9;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = 0.95 + Math.random() * 0.1;
  source.connect(gain);
  source.start();
}
function startAmbientMusic(ctx = audioCtx) {
  if (settings.mute) return;
  if (!ctx) return;
  if (ambientMusic.gain) return;
  ambientMusic.gain = ctx.createGain();
  ambientMusic.gain.gain.value = 0.08;
  ambientMusic.gain.connect(ctx.destination);
  const schedule = () => {
    if (!ambientMusic.gain) return;
    playAmbientChirp(ctx, ambientMusic.gain);
    const interval = 2200 + Math.random() * 2200;
    ambientMusic.timer = setTimeout(schedule, interval);
  };
  schedule();
}
function stopAmbientMusic() {
  if (ambientMusic.timer) {
    clearTimeout(ambientMusic.timer);
    ambientMusic.timer = null;
  }
  if (ambientMusic.gain) {
    ambientMusic.gain.disconnect();
    ambientMusic.gain = null;
  }
}
function ensureAmbientMusic(ctx = audioCtx) {
  if (!settings.mute) startAmbientMusic(ctx);
}
function playBattleSound(type) {
  const ctx = resumeAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const schedule = (freq, duration, options = {}) => {
    const { volume = 0.14, wave = "sine", delay = 0, freqEnd = null } = options;
    const gain = ctx.createGain();
    const startTime = now + delay;
    const endTime = startTime + duration;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, endTime);
    gain.connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, startTime);
    if (freqEnd != null) {
      osc.frequency.linearRampToValueAtTime(freqEnd, endTime);
    }
    osc.connect(gain);
    osc.start(startTime);
    osc.stop(endTime);
  };
  switch (type) {
    case "start":
      schedule(480, 0.22, { wave: "triangle", volume: 0.14 });
      schedule(640, 0.18, { wave: "sine", volume: 0.1, delay: 0.05 });
      break;
    case "player-hit":
      schedule(560, 0.2, { wave: "square", volume: 0.2 });
      schedule(820, 0.14, { wave: "triangle", volume: 0.12, delay: 0.04 });
      break;
    case "enemy-hit":
      schedule(320, 0.22, { wave: "sawtooth", volume: 0.18 });
      schedule(190, 0.18, { wave: "sine", volume: 0.12, delay: 0.05 });
      break;
    case "miss":
      schedule(940, 0.14, { wave: "triangle", volume: 0.08 });
      break;
    case "victory":
      schedule(620, 0.32, { wave: "sine", volume: 0.18 });
      schedule(780, 0.28, { wave: "triangle", volume: 0.14, delay: 0.08 });
      schedule(930, 0.24, { wave: "sine", volume: 0.12, delay: 0.16 });
      break;
    case "defeat":
      schedule(220, 0.45, { wave: "sawtooth", volume: 0.2 });
      schedule(140, 0.5, { wave: "sine", volume: 0.14, delay: 0.1 });
      break;
  }
}

// === Music (menu & game) =====================================================
function setupMusic() {
  music.menu = new Audio(
    "https://www.fesliyanstudios.com/musicfiles/2019-01-02_-_8_Bit_Menu_-_David_Renda_-_FesliyanStudios.com.mp3"
  );
  music.game = new Audio(
    "https://www.fesliyanstudios.com/musicfiles/2021-08-16_-_8_Bit_Adventure_-_www.FesliyanStudios.com/fast-2021-08-16_-_8_Bit_Adventure_-_www.FesliyanStudios.com.mp3"
  );
  [music.menu, music.game].forEach((a) => {
    a.loop = true;
    a.volume = 0.4; // tweak to taste
  });
  updateMusicMute();
}

function unlockAudioOnce() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  // Wake up WebAudio (SFX/ambient) and sync mute state
  resumeAudio();
  updateMusicMute();

  // If we're on the menu at first load, start menu music now
  if (gameState === "menu") {
    playMenuMusic();
  }

  // remove listeners once unlocked
  window.removeEventListener("pointerdown", unlockAudioOnce);
  window.removeEventListener("keydown", unlockAudioOnce);
}

function stopMusic() {
  if (music.current) {
    music.current.pause();
    music.current.currentTime = 0;
    music.current = null;
  }
}

function playMenuMusic() {
  if (!music.menu) return;
  stopAmbientMusic();
  if (settings.mute) return;
  stopMusic();
  music.current = music.menu;
  music.current.play().catch(() => {});
}

function playGameMusic() {
  if (!music.game) return;
  stopAmbientMusic();
  if (settings.mute) return;
  stopMusic();
  music.current = music.game;
  music.current.play().catch(() => {});
}

function updateMusicMute() {
  const muted = !!settings.mute;
  [music.menu, music.game].forEach((a) => {
    if (a) a.muted = muted;
  });
  if (muted) stopMusic();
}

// === HUD =====================================================================
function updateHUD() {
  if (hud.level) hud.level.textContent = `${level}`;
  if (hud.score) hud.score.textContent = `${score}`;
  if (hud.enemies) hud.enemies.textContent = `${aliveEnemiesCount()}`;
  if (!map) {
    hud.txy.textContent = "--";
    hud.pxy.textContent = "--";
    hud.tileName.textContent = "?";
    hud.steps.textContent = `${stats.steps}`;
    hud.time.textContent = `${Math.floor(stats.playTimeMs / 1000)}s`;
    return;
  }
  const tx = Math.floor((player.x + player.w / 2) / TILE_SIZE);
  const ty = Math.floor((player.y + player.h / 2) / TILE_SIZE);
  const t = tileAt(tx, ty);
  hud.txy.textContent = `${tx},${ty}`;
  hud.pxy.textContent = `${Math.floor(player.x)},${Math.floor(player.y)}`;
  hud.tileName.textContent = TILE_INFO[t]?.name ?? "Unknown";
  hud.steps.textContent = `${stats.steps}`;
  hud.time.textContent = `${Math.floor(stats.playTimeMs / 1000)}s`;
}
// === Boot ====================================================================
async function init() {
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  if (ctx) ctx.imageSmoothingEnabled = false;
  setupMusic();
  window.addEventListener("pointerdown", unlockAudioOnce, { once: true });
  window.addEventListener("keydown", unlockAudioOnce, { once: true });
  minimapCanvas = document.getElementById("minimap");
  if (minimapCanvas) {
    minimapCanvas.width = MINIMAP_W;
    minimapCanvas.height = MINIMAP_H;
    minimapCtx = minimapCanvas.getContext("2d");
    if (minimapCtx) minimapCtx.imageSmoothingEnabled = false;
  }
  hud.world = document.getElementById("worldName");
  hud.txy = document.getElementById("txy");
  hud.pxy = document.getElementById("pxy");
  hud.tileName = document.getElementById("tileName");
  hud.steps = document.getElementById("steps");
  hud.time = document.getElementById("time");
  hud.msg = document.getElementById("hud-msg");
  hud.btnMute = document.getElementById("btnMute");
  hud.level = document.getElementById("level");
  hud.score = document.getElementById("score");
  hud.enemies = document.getElementById("enemies");
  if (hud.world) hud.world.textContent = "--";
  hud.seed = document.getElementById("worldSeed");
  if (hud.seed) hud.seed.textContent = "--";
  menu.root = document.getElementById("menu");
  menu.seedInput = document.getElementById("menuSeed");
  menu.startRandom = document.getElementById("btnMenuStartRandom");
  menu.startSeed = document.getElementById("btnMenuStartSeed");
  menu.continue = document.getElementById("btnMenuContinue");
  menu.msg = document.getElementById("menuMsg");
  battleUI.root = document.getElementById("battle");
  battleUI.msg = document.getElementById("battleMsg");
  battleUI.playerSprite = document.getElementById("battlePlayerSprite");
  battleUI.enemySprite = document.getElementById("battleEnemySprite");
  battleUI.playerHP = document.getElementById("battlePlayerHP");
  battleUI.enemyHP = document.getElementById("battleEnemyHP");
  battleUI.buttons = Array.from(document.querySelectorAll(".battle-btn"));
  battleUI.continue = document.getElementById("battleContinue");
  battleUI.buttons.forEach((btn, idx) => {
    setMoveButtonContent(btn, BATTLE_MOVES[idx]);
    btn.addEventListener("click", () => handleBattleMove(idx));
  });
  battleUI.continue?.addEventListener("click", handleBattleContinue);
  const btnSave = document.getElementById("btnSave");
  const btnRestart = document.getElementById("btnRestart");
  const btnReset = document.getElementById("btnReset");
  const btnMenu = document.getElementById("btnMenu");
  btnSave?.addEventListener("click", () => {
    if (gameState !== "playing" || !map) {
      flash("Start a game first.");
      return;
    }
    saveState();
    flash("Saved.");
    accTimeForSave = 0;
  });
  btnRestart?.addEventListener("click", () => {
    if (!map) {
      flash("No island to restart.");
      return;
    }
    resetState(false);
    flash("Restarted island.");
  });
  btnReset?.addEventListener("click", () => {
    resetState(true);
    flash("New island!");
  });
  btnMenu?.addEventListener("click", () => {
    showMenu();
    updateMenuButtons();
  });
  hud.btnMute?.addEventListener("click", toggleMute);
  menu.startRandom?.addEventListener("click", () => {
    if (menu.seedInput) menu.seedInput.value = "";
    setMenuMessage("");
    startFreshGame((Math.random() * 2 ** 32) | 0);
  });
  menu.startSeed?.addEventListener("click", () => {
    const value = menu.seedInput?.value ?? "";
    const seed = seedFromInput(value);
    if (seed == null) {
      setMenuMessage("Enter a seed or use random.");
      return;
    }
    setMenuMessage("");
    startFreshGame(seed);
  });
  menu.continue?.addEventListener("click", () => {
    if (map && player.lastTileX !== null) {
      setMenuMessage("");
      enterGame();
      return;
    }
    if (!resumeFromSnapshot(savedSnapshot)) {
      setMenuMessage("No save found.");
    }
  });
  menu.seedInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      menu.startSeed?.click();
    }
  });
  setupInput();
  await loadAssets();
  let initialMenuMessage = "";
  const loaded = loadState();
  if (loaded) {
    try {
      savedSnapshot = {
        ...loaded,
        player: { ...(loaded.player ?? {}) },
        stats: { ...(loaded.stats ?? {}) },
        settings: { ...(loaded.settings ?? {}) },
      };
      settings = { mute: false, ...savedSnapshot.settings };
      stats = {
        steps: savedSnapshot.stats.steps ?? 0,
        playTimeMs: savedSnapshot.stats.playTimeMs ?? 0,
      };
      level = savedSnapshot.level ?? 1;
      score = savedSnapshot.score ?? 0;
      if (hud.world)
        hud.world.textContent =
          savedSnapshot.worldId ?? makeWorldId(savedSnapshot.seed ?? 0);
      if (hud.seed)
        hud.seed.textContent =
          savedSnapshot.seed != null
            ? `0x${(savedSnapshot.seed >>> 0).toString(16).padStart(8, "0")}`
            : "--";
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      savedSnapshot = null;
      settings = { mute: false };
      stats = { steps: 0, playTimeMs: 0 };
      if (hud.world) hud.world.textContent = "--";
      if (hud.seed) hud.seed.textContent = "--";
      initialMenuMessage = "Save was corrupted. Start a new island.";
    }
  } else {
    savedSnapshot = null;
    settings = { mute: false };
    stats = { steps: 0, playTimeMs: 0 };
    if (hud.world) hud.world.textContent = "--";
    if (hud.seed) hud.seed.textContent = "--";
  }
  if (!initialMenuMessage && savedSnapshot) {
    initialMenuMessage = "Continue your island or start a new one.";
  }
  updateHUD();
  updateMuteButton();
  updateMenuButtons();
  showMenu(initialMenuMessage);
  ensureLoop();
}
function ensureLoop() {
  if (loopStarted) return;
  loopStarted = true;
  prevTs = performance.now();
  const loop = (ts) => {
    const dt = Math.min(0.033, (ts - prevTs) / 1000);
    prevTs = ts;
    update(dt);
    render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
function flash(text) {
  hud.msg.textContent = text;
  clearTimeout(flash._t);
  flash._t = setTimeout(() => (hud.msg.textContent = ""), 1200);
}
window.addEventListener("load", init);
