// === Constants ================================================================

const TILE_SIZE = 32;

const CANVAS_W = 640,
  CANVAS_H = 480;

const MAP_W = 40,
  MAP_H = 30; // 1280x960 world

const STORAGE_KEY = "tilegame:v1";

const SAVE_VERSION = 2;

const SAVE_INTERVAL_MS = 500;

const CAMERA_LERP = 0.18;

const CAMERA_MAX_SPEED = 420;

const MINIMAP_W = 60,
  MINIMAP_H = 60;

const TILE = {
  GRASS: 0,

  WATER: 1,

  TREE: 2,

  SAND: 3,

  GRASS_ALT: 4,

  GRASS_ALT2: 5,
};

const TILE_INFO = {
  [TILE.GRASS]: { name: "Grass", solid: false, img: "assets/grass.png" },

  [TILE.GRASS_ALT]: { name: "Grass", solid: false, img: "assets/grass2.png" },

  [TILE.GRASS_ALT2]: { name: "Grass", solid: false, img: "assets/grass3.png" },

  [TILE.WATER]: { name: "Water", solid: true, img: "assets/water.png" },

  [TILE.TREE]: { name: "Tree", solid: true, img: "assets/tree.png" },

  [TILE.SAND]: { name: "Sand", solid: false, img: "assets/sand.png" },
};

const MINIMAP_COLORS = {
  [TILE.GRASS]: "#3fa866",

  [TILE.GRASS_ALT]: "#3fa866",

  [TILE.GRASS_ALT2]: "#3fa866",

  [TILE.WATER]: "#2f5fa8",

  [TILE.TREE]: "#27613a",

  [TILE.SAND]: "#d6c178",
};

const MINIMAP_SCALE_X = MINIMAP_W / MAP_W;

const MINIMAP_SCALE_Y = MINIMAP_H / MAP_H;

const isGrassTile = (tileId) =>
  tileId === TILE.GRASS ||
  tileId === TILE.GRASS_ALT ||
  tileId === TILE.GRASS_ALT2;
const FOOTSTEP_PRESETS = {
  [TILE.GRASS]: { freq: 220, duration: 0.13, gain: 0.08 },

  [TILE.GRASS_ALT]: { freq: 220, duration: 0.13, gain: 0.08 },

  [TILE.GRASS_ALT2]: { freq: 220, duration: 0.13, gain: 0.08 },

  [TILE.SAND]: { freq: 170, duration: 0.17, gain: 0.1 },
};

const MOVE_KEYS = {
  arrowup: { dx: 0, dy: -1 },

  w: { dx: 0, dy: -1 },

  arrowdown: { dx: 0, dy: 1 },

  s: { dx: 0, dy: 1 },

  arrowleft: { dx: -1, dy: 0 },

  a: { dx: -1, dy: 0 },

  arrowright: { dx: 1, dy: 0 },

  d: { dx: 1, dy: 0 },
};

const MOVE_HOLD_DELAY = 0.5; // seconds between auto-steps when holding a key

const PLAYER_RENDER_LERP = 14;

const ENEMY_RENDER_LERP = 12;

const MENU_MUSIC_VOLUME = 0.48;

const GAME_MUSIC_VOLUME = 0.44;

const GAME_MUSIC_BATTLE_VOLUME = 0.2;

const LEVEL_MUSIC_VOLUME = 0.6;

const ENEMY_SPRITES = [
  "assets/enemy1.png",

  "assets/enemy2.png",

  "assets/enemy3.png",

  "assets/enemy4.png",

  "assets/enemy5.png",
];

const ENEMY_SIZE = 28;

const ENEMY_AGGRO_DISTANCE_BASE = TILE_SIZE * 2;

const ENEMY_AGGRO_DISTANCE_STEP = TILE_SIZE * 0.25;

const PLAYER_BATTLE_HP = 30;

const PLAYER_HP_PER_LEVEL = 5;

const XP_BASE_REQUIREMENT = 60;

const XP_REQUIREMENT_STEP = 18;

const XP_REWARD_COIN = [1, 3];

const XP_REWARD_ENEMY = [14, 22];

const XP_REWARD_LEVEL = [35, 55];

const XP_FLOAT_COLOR = "#9ad4ff";

const LEVEL_UP_FLOAT_COLOR = "#ffe38d";

const ENEMY_BATTLE_HP = 20;

const EXTRA_SKILL_SLOTS = 3;

const CORE_MOVES = [
  {
    id: "quick",

    label: "Quick Jab",

    iconClass: "bi-lightning-charge-fill",

    summary: "Fast and reliable.",

    hit: 0.9,

    dmg: [4, 7],
  },

  {
    id: "heavy",

    label: "Heavy Swing",

    iconClass: "bi-hammer",

    summary: "Crush foes with power.",

    hit: 0.65,

    dmg: [7, 12],
  },
];

const POTION_HEAL_AMOUNT = 15;

const POTION_COST = 40;

const SKILL_LIBRARY = [
  {
    id: "wind_slice",

    label: "Wind Slice",

    iconClass: "bi-wind",

    summary: "Precise cut that restores 5 HP on hit.",

    hit: 0.9,

    dmg: [4, 6],

    cost: 45,

    effects: [{ type: "heal", amount: 5 }],
  },

  {
    id: "meteor_crash",

    label: "Meteor Crash",

    iconClass: "bi-stars",

    summary: "Savage swing with brutal damage potential.",

    hit: 0.6,

    dmg: [11, 17],

    cost: 70,
  },

  {
    id: "guardian_wave",

    label: "Guardian Wave",

    iconClass: "bi-shield-fill-check",

    summary: "Solid strike that grants a 6 dmg shield.",

    hit: 0.8,

    dmg: [5, 8],

    cost: 55,

    effects: [{ type: "shield", amount: 6 }],
  },

  {
    id: "spark_burst",

    label: "Spark Burst",

    iconClass: "bi-lightning-fill",

    summary: "Twin hits that each deal 3-4 damage.",

    hit: 0.85,

    dmg: [3, 4],

    cost: 50,

    effects: [{ type: "multiHit", count: 2 }],
  },

  {
    id: "lucky_strike",

    label: "Lucky Strike",

    iconClass: "bi-coin",

    summary: "Snag an extra 3 coins if it lands.",

    hit: 0.75,

    dmg: [6, 9],

    cost: 60,

    effects: [{ type: "coins", amount: 3 }],
  },

  {
    id: "frost_chill",

    label: "Frost Chill",

    iconClass: "bi-snow",

    summary: "Hit that drags enemy accuracy down for a turn.",

    hit: 0.8,

    dmg: [5, 7],

    cost: 50,

    effects: [{ type: "accuracyDebuff", amount: 0.2 }],
  },

  {
    id: "ember_edge",

    label: "Ember Edge",

    iconClass: "bi-fire",

    summary: "Deal +4 damage to wounded foes.",

    hit: 0.78,

    dmg: [6, 9],

    cost: 65,

    effects: [{ type: "execute", bonus: 4, threshold: 0.5 }],
  },
];

function makeLockedSkillPlaceholder(slotIndex = 0) {
  return {
    id: `locked-slot-${slotIndex + 1}`,

    label: "Locked Skill",

    iconClass: "bi-lock-fill",

    locked: true,

    hint: "Find a merchant to unlock.",

    slotIndex,
  };
}

function makePotionMove(count = 0) {
  const hasPotions = count > 0;

  return {
    id: "potion",

    label: "Drink Potion",

    iconClass: "bi-prescription2",

    summary: hasPotions
      ? `Restores ${POTION_HEAL_AMOUNT} HP.`
      : "Carry potions to heal mid-battle.",

    metaText: `Potions: ${count}`,

    locked: !hasPotions,

    hint: "No potions in your satchel.",
  };
}

function createInitialPlayerProgress() {
  return {
    maxHp: PLAYER_BATTLE_HP,

    currentHp: PLAYER_BATTLE_HP,

    level: 1,

    xp: 0,

    ownedSkillIds: CORE_MOVES.map((move) => move.id),

    equippedExtraSkillIds: [],

    potions: 0,
  };
}

function clonePlayerProgress(progress = playerProgress) {
  const source = progress ?? createInitialPlayerProgress();

  let level = Math.max(1, Math.floor(source.level ?? 1));

  let xp = Math.max(0, Math.floor(source.xp ?? 0));

  while (xp >= xpRequiredForNextLevel(level)) {
    xp -= xpRequiredForNextLevel(level);

    level += 1;
  }

  const baseMaxHp = PLAYER_BATTLE_HP + (level - 1) * PLAYER_HP_PER_LEVEL;

  const rawMaxHp =
    typeof source.maxHp === "number" && Number.isFinite(source.maxHp)
      ? Math.floor(source.maxHp)
      : baseMaxHp;

  const maxHp = Math.max(baseMaxHp, rawMaxHp);

  const owned = Array.isArray(source.ownedSkillIds)
    ? Array.from(new Set(source.ownedSkillIds))
    : CORE_MOVES.map((move) => move.id);

  const equipped = Array.isArray(source.equippedExtraSkillIds)
    ? source.equippedExtraSkillIds
        .filter((id) => owned.includes(id))
        .slice(0, EXTRA_SKILL_SLOTS)
    : [];

  return {
    maxHp,

    currentHp: clamp(
      typeof source.currentHp === "number" && Number.isFinite(source.currentHp)
        ? Math.floor(source.currentHp)
        : maxHp,

      0,

      maxHp
    ),

    level,

    xp,

    ownedSkillIds: owned,

    equippedExtraSkillIds: equipped,

    potions: Math.max(0, Math.floor(source.potions ?? 0)),
  };
}

function xpRequiredForNextLevel(currentLevel) {
  const level = Math.max(1, Math.floor(currentLevel ?? 1));

  return Math.round(XP_BASE_REQUIREMENT + (level - 1) * XP_REQUIREMENT_STEP);
}

function cloneSkill(move) {
  return move
    ? { ...move, effects: move.effects ? [...move.effects] : undefined }
    : null;
}

function getSkillDefinition(id) {
  if (!id) return null;

  const base = CORE_MOVES.find((move) => move.id === id);

  if (base) return cloneSkill(base);

  const extra = SKILL_LIBRARY.find((move) => move.id === id);

  return cloneSkill(extra);
}

function buildBattleMoves(progress = playerProgress) {
  const equipped = Array.isArray(progress?.equippedExtraSkillIds)
    ? progress.equippedExtraSkillIds.filter((id) =>
        Array.isArray(progress.ownedSkillIds)
          ? progress.ownedSkillIds.includes(id)
          : false
      )
    : [];

  const extras = [];

  for (let i = 0; i < EXTRA_SKILL_SLOTS; i++) {
    const skillId = equipped[i];

    if (skillId) {
      const skill = getSkillDefinition(skillId);

      if (skill) {
        extras.push(skill);

        continue;
      }
    }

    extras.push(makeLockedSkillPlaceholder(i));
  }

  const moves = [...CORE_MOVES.map((move) => cloneSkill(move)), ...extras];

  const potionCount = Math.max(0, progress?.potions ?? 0);

  moves.push(makePotionMove(potionCount));

  return moves;
}

function refreshBattleMoves() {
  battleMoves = buildBattleMoves();

  if (battleUI.buttons?.length) {
    battleUI.buttons.forEach((btn, idx) => {
      setMoveButtonContent(btn, battleMoves[idx]);
    });
  }
}

function playerHasSkill(skillId) {
  return (
    !!skillId &&
    Array.isArray(playerProgress?.ownedSkillIds) &&
    playerProgress.ownedSkillIds.includes(skillId)
  );
}

function unlockSkill(skillId) {
  if (!skillId || playerHasSkill(skillId)) return false;

  if (!Array.isArray(playerProgress.ownedSkillIds)) {
    playerProgress.ownedSkillIds = CORE_MOVES.map((move) => move.id);
  }

  playerProgress.ownedSkillIds = Array.from(
    new Set([...playerProgress.ownedSkillIds, skillId])
  );

  if (!Array.isArray(playerProgress.equippedExtraSkillIds)) {
    playerProgress.equippedExtraSkillIds = [];
  }

  playerProgress.equippedExtraSkillIds =
    playerProgress.equippedExtraSkillIds.filter((id) =>
      playerProgress.ownedSkillIds.includes(id)
    );

  if (playerProgress.equippedExtraSkillIds.length < EXTRA_SKILL_SLOTS) {
    playerProgress.equippedExtraSkillIds.push(skillId);
  }

  refreshBattleMoves();

  return true;
}

function availableMerchantSkills() {
  return SKILL_LIBRARY.filter((skill) => !playerHasSkill(skill.id));
}

function scheduleNextMerchant(baseLevel = level) {
  const from = Math.max(1, baseLevel);

  const span = from <= 1 ? randInt(1, 2) : randInt(2, 3);

  nextMerchantLevel = from + span;
}

function healCostForLevel(lvl = level) {
  if (lvl <= 1) return 8;

  if (lvl === 2) return 10;

  return Math.max(12, 10 + Math.floor(Math.max(0, lvl - 2) * 3));
}

function setMerchantWorldPosition(entity) {
  const offset = (TILE_SIZE - MERCHANT_SIZE) / 2;

  entity.x = entity.tileX * TILE_SIZE + offset;

  entity.y = entity.tileY * TILE_SIZE + offset;

  entity.renderX = entity.x;

  entity.renderY = entity.y;
}

function pickMerchantSkillIds(maxCount = 3) {
  const available = availableMerchantSkills();

  if (!available.length) return [];

  const shuffled = [...available];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randInt(0, i);

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled

    .slice(0, Math.min(maxCount, shuffled.length))

    .map((skill) => skill.id);
}

function createMerchantEntity() {
  if (!map) return null;

  const used = new Set();

  if (player.lastTileX != null && player.lastTileY != null) {
    used.add(tileKey(player.lastTileX, player.lastTileY));
  }

  for (const enemy of enemies) {
    if (enemy.alive) used.add(tileKey(enemy.tileX, enemy.tileY));
  }

  let tile = null;

  for (let attempt = 0; attempt < 160; attempt++) {
    const candidate = findOpenTile(2);

    const key = tileKey(candidate.x, candidate.y);

    if (used.has(key)) continue;

    tile = candidate;

    break;
  }

  if (!tile) return null;

  const entity = {
    id: `merchant-${Date.now()}`,

    tileX: tile.x,

    tileY: tile.y,

    w: MERCHANT_SIZE,

    h: MERCHANT_SIZE,

    skillIds: pickMerchantSkillIds(),

    healCost: healCostForLevel(level),

    level: level,
  };

  setMerchantWorldPosition(entity);

  return entity;
}

function setupMerchantForLevel() {
  shopState.open = false;

  shopState.selectedSkill = null;

  merchant = null;

  if (!map) return;

  if (!nextMerchantLevel) {
    scheduleNextMerchant(level);
  }

  if (level < nextMerchantLevel) return;

  const entity = createMerchantEntity();

  if (entity) {
    merchant = entity;

    scheduleNextMerchant(level);
  } else {
    scheduleNextMerchant(level + 1);
  }
}

function merchantAtTile(tx, ty) {
  return merchant && merchant.tileX === tx && merchant.tileY === ty;
}

function tryOpenMerchantShop() {
  if (!merchant) return false;

  openMerchantShop();

  return true;
}

function openMerchantShop() {
  if (!merchant) return;

  if (shopHealPulseTimer) {
    clearTimeout(shopHealPulseTimer);

    shopHealPulseTimer = null;
  }

  shopState.open = true;

  shopState.selectedSkill = null;

  clearMovementKeys();

  gameState = "shop";

  if (shopUI.root) shopUI.root.classList.remove("is-hidden");

  updateShopUI();

  setShopMessage("Spend your coins wisely.");

  updateGameMusicVolume();
}

function closeMerchantShop() {
  const wasOpen = shopState.open;

  shopState.open = false;

  shopState.selectedSkill = null;

  if (shopUI.root) shopUI.root.classList.add("is-hidden");

  setShopMessage("");

  if (wasOpen && gameState === "shop") {
    gameState = "playing";

    clearMovementKeys();
  }

  if (shopHealPulseTimer) {
    clearTimeout(shopHealPulseTimer);

    shopHealPulseTimer = null;
  }

  shopUI.healStatus?.classList.remove("is-healed");

  updateHUD();

  updateMinimap();

  updateGameMusicVolume();
}

function setShopMessage(text = "", tone = "info") {
  if (!shopUI.message) return;

  shopUI.message.textContent = text;

  shopUI.message.classList.remove("is-warn", "is-success");

  if (tone === "warn") shopUI.message.classList.add("is-warn");
  else if (tone === "success") shopUI.message.classList.add("is-success");
}

function updateShopUI() {
  if (!shopUI.root) return;

  if (!merchant) {
    shopUI.root.classList.add("is-hidden");

    return;
  }

  if (shopUI.merchantImg) {
    shopUI.merchantImg.src = MERCHANT_IMG;
  }

  const maxHp = playerProgress?.maxHp ?? PLAYER_BATTLE_HP;

  const currentHp = clamp(playerProgress?.currentHp ?? maxHp, 0, maxHp);

  const healCost = merchant?.healCost ?? healCostForLevel(level);

  const missing = Math.max(0, maxHp - currentHp);

  if (shopUI.playerHp) {
    shopUI.playerHp.textContent = `Your HP: ${currentHp}/${maxHp}`;
  }

  if (shopUI.healStatus) {
    shopUI.healStatus.classList.remove("is-healed");

    if (missing <= 0) {
      shopUI.healStatus.textContent = `Fully restored (${currentHp}/${maxHp})`;
    } else {
      shopUI.healStatus.textContent = `Missing ${missing} HP (${currentHp}/${maxHp}) - Cost ${healCost} coins`;
    }
  }

  if (shopUI.healBtn) {
    const canHeal = merchantCanHeal();

    const enoughCoins = coins >= healCost;

    shopUI.healBtn.disabled = !canHeal || !enoughCoins;

    if (!canHeal) {
      shopUI.healBtn.textContent = "Healed";

      shopUI.healBtn.title = "You are already at full health.";
    } else if (!enoughCoins) {
      shopUI.healBtn.textContent = `Buy Heal (${healCost})`;

      shopUI.healBtn.title = "Not enough coins.";
    } else {
      shopUI.healBtn.textContent = `Buy Heal (${healCost})`;

      shopUI.healBtn.title = "Restore your health to full.";
    }
  }

  if (shopUI.potionCount) {
    shopUI.potionCount.textContent = `${playerProgress?.potions ?? 0}`;
  }

  if (shopUI.potionBtn) {
    const enoughCoins = coins >= POTION_COST;

    shopUI.potionBtn.disabled = !enoughCoins;

    shopUI.potionBtn.textContent = `Buy Potion (${POTION_COST})`;

    shopUI.potionBtn.title = enoughCoins
      ? "Adds a potion to your satchel."
      : "Not enough coins.";
  }

  if (shopUI.skillList) {
    shopUI.skillList.innerHTML = "";

    const ids = Array.isArray(merchant.skillIds) ? merchant.skillIds : [];

    if (!ids.length) {
      const empty = document.createElement("div");

      empty.className = "shop-empty";

      empty.textContent = "All advanced skills unlocked!";

      shopUI.skillList.appendChild(empty);
    } else {
      const slotsFilled =
        (playerProgress?.equippedExtraSkillIds?.length ?? 0) >=
        EXTRA_SKILL_SLOTS;

      for (const skillId of ids) {
        const skill = getSkillDefinition(skillId);

        if (!skill) continue;

        const cost = Math.max(0, Math.floor(skill.cost ?? 0));

        const hitChance = Math.round((skill.hit ?? 0) * 100);

        const multi = Array.isArray(skill.effects)
          ? skill.effects.find((effect) => effect?.type === "multiHit")
          : null;

        const multiHits = multi
          ? Math.max(2, Math.floor(multi.count ?? 2))
          : null;

        const metaText = multiHits
          ? `${hitChance}% hit | ${multiHits}x ${skill.dmg[0]}-${skill.dmg[1]} dmg`
          : `${hitChance}% hit | ${skill.dmg[0]}-${skill.dmg[1]} dmg`;

        const iconMarkup = skill.iconClass
          ? `<span class="shop-skill-icon"><i class="bi ${skill.iconClass}"></i></span>`
          : "";

        const btn = document.createElement("button");

        btn.type = "button";

        btn.className = "shop-skill-card";

        btn.dataset.skillId = skillId;

        btn.innerHTML = `

          <div class="shop-skill-name">${iconMarkup}${skill.label}</div>

          <div class="shop-skill-summary">${skill.summary}</div>

          <div class="shop-skill-meta">${metaText}</div>

          <div class="shop-skill-cost">Cost ${cost} coins</div>

        `;

        const insufficientCoins = coins < cost;

        btn.disabled = insufficientCoins || slotsFilled;

        if (insufficientCoins) btn.title = "Not enough coins";
        else if (slotsFilled) btn.title = "All skill slots are filled";

        shopUI.skillList.appendChild(btn);
      }
    }
  }
}

function pulseShopHealStatus() {
  if (!shopUI.healStatus) return;

  shopUI.healStatus.classList.remove("is-healed");

  // trigger reflow for animation restart

  void shopUI.healStatus.offsetWidth;

  shopUI.healStatus.classList.add("is-healed");

  if (shopHealPulseTimer) clearTimeout(shopHealPulseTimer);

  shopHealPulseTimer = setTimeout(() => {
    shopUI.healStatus?.classList.remove("is-healed");

    shopHealPulseTimer = null;
  }, MERCHANT_HEAL_ANIM_MS);
}

function handleShopHeal() {
  if (!merchant) return;

  const healCost = merchant?.healCost ?? healCostForLevel(level);

  if (!merchantCanHeal()) {
    setShopMessage("You are already at full health.", "warn");

    return;
  }

  if (coins < healCost) {
    setShopMessage("Not enough coins.", "warn");

    return;
  }

  if (purchaseMerchantHeal()) {
    setShopMessage("You feel rejuvenated!", "success");

    updateShopUI();

    pulseShopHealStatus();

    playMerchantSound("heal");

    updateHUD();
  } else {
    setShopMessage("Could not complete that purchase.", "warn");
  }
}

function handleShopPotionBuy() {
  const cost = POTION_COST;

  if (coins < cost) {
    setShopMessage("Not enough coins.", "warn");

    return;
  }

  if (purchaseMerchantPotion()) {
    setShopMessage("Potion tucked into your satchel.", "success");

    playMerchantSound("buy");

    updateShopUI();
  } else {
    setShopMessage("Could not buy a potion.", "warn");
  }
}

function handleShopSkillClick(event) {
  const target = event.target;

  const btn =
    target instanceof Element ? target.closest(".shop-skill-card") : null;

  if (!btn || btn.disabled) return;

  const skillId = btn.dataset.skillId;

  if (!skillId) return;

  if (!merchant) return;

  const skill = getSkillDefinition(skillId);

  if (!skill) return;

  if (
    Array.isArray(playerProgress?.equippedExtraSkillIds) &&
    playerProgress.equippedExtraSkillIds.length >= EXTRA_SKILL_SLOTS
  ) {
    setShopMessage("All skill slots are filled.", "warn");

    return;
  }

  const cost = Math.max(0, Math.floor(skill.cost ?? 0));

  if (coins < cost) {
    setShopMessage("Not enough coins.", "warn");

    return;
  }

  const success = purchaseMerchantSkill(skillId);

  if (success) {
    setShopMessage(`${skill.label} unlocked!`, "success");

    updateShopUI();

    playMerchantSound("buy");

    updateHUD();
  } else {
    setShopMessage("Could not unlock that skill.", "warn");
  }
}

function merchantMissingHp() {
  const maxHp = playerProgress?.maxHp ?? PLAYER_BATTLE_HP;

  const currentHp = playerProgress?.currentHp ?? maxHp;

  return Math.max(0, maxHp - currentHp);
}

function merchantCanHeal() {
  return merchant && merchantMissingHp() > 0;
}

function purchaseMerchantHeal() {
  if (!merchantCanHeal()) return false;

  const cost = merchant?.healCost ?? healCostForLevel(level);

  if (coins < cost) return false;

  coins -= cost;

  const maxHp = playerProgress?.maxHp ?? PLAYER_BATTLE_HP;

  playerProgress.currentHp = maxHp;

  updateHUD();

  refreshBattleMoves();

  saveState();

  return true;
}

function purchaseMerchantPotion() {
  const cost = POTION_COST;

  if (coins < cost) return false;

  coins -= cost;

  const current = Math.max(0, Math.floor(playerProgress?.potions ?? 0));

  playerProgress.potions = current + 1;

  updateHUD();

  refreshBattleMoves();

  saveState();

  return true;
}

function purchaseMerchantSkill(skillId) {
  if (!merchant || !skillId) return false;

  if (playerHasSkill(skillId)) return false;

  if (
    Array.isArray(playerProgress?.equippedExtraSkillIds) &&
    playerProgress.equippedExtraSkillIds.length >= EXTRA_SKILL_SLOTS
  ) {
    return false;
  }

  const skill = getSkillDefinition(skillId);

  if (!skill) return false;

  const cost = Math.max(0, Math.floor(skill.cost ?? 0));

  if (coins < cost) return false;

  coins -= cost;

  const unlocked = unlockSkill(skillId);

  if (!unlocked) {
    coins += cost;

    return false;
  }

  if (Array.isArray(merchant.skillIds)) {
    merchant.skillIds = merchant.skillIds.filter((id) => id !== skillId);
  }

  updateHUD();

  refreshBattleMoves();

  saveState();

  return true;
}

function restoreMerchant(data) {
  merchant = null;

  if (!map || !data) return;

  const rawTileX =
    typeof data.tileX === "number"
      ? data.tileX
      : typeof data.x === "number"
      ? Math.floor(data.x / TILE_SIZE)
      : 0;

  const rawTileY =
    typeof data.tileY === "number"
      ? data.tileY
      : typeof data.y === "number"
      ? Math.floor(data.y / TILE_SIZE)
      : 0;

  const tileX = clamp(Math.floor(rawTileX), 0, MAP_W - 1);

  const tileY = clamp(Math.floor(rawTileY), 0, MAP_H - 1);

  const skillIds = Array.isArray(data.skillIds)
    ? data.skillIds.filter((id) => !playerHasSkill(id))
    : pickMerchantSkillIds();

  const entity = {
    id: data.id ?? `merchant-${Date.now()}`,

    tileX,

    tileY,

    w: MERCHANT_SIZE,

    h: MERCHANT_SIZE,

    skillIds,

    healCost: data.healCost ?? healCostForLevel(level),

    level: data.level ?? level,
  };

  if (enemyAtTile(entity.tileX, entity.tileY)) {
    const tile = findOpenTile(2);

    entity.tileX = tile.x;

    entity.tileY = tile.y;
  }

  setMerchantWorldPosition(entity);

  merchant = entity;

  shopState.open = false;

  shopState.selectedSkill = null;
}

function serializeMerchant() {
  if (!merchant) return null;

  return {
    id: merchant.id,

    tileX: merchant.tileX,

    tileY: merchant.tileY,

    skillIds: Array.isArray(merchant.skillIds)
      ? merchant.skillIds.map((id) => id)
      : [],

    healCost: merchant.healCost,

    level: merchant.level,
  };
}

function enemyProfileForLevel(lvl) {
  const playerLvl = Math.max(1, Math.floor(playerProgress?.level ?? 1));

  const playerFactor = Math.max(0, playerLvl - 1);

  if (lvl <= 1) {
    const bonusHp = Math.round(playerFactor * 1.5);

    const bonusHit = Math.min(0.06, playerFactor * 0.01);

    return {
      maxHp: 14 + bonusHp,

      attackHit: clamp(0.58 + bonusHit, 0.5, 0.72),

      dmg: [
        2 + Math.floor(playerFactor * 0.4),

        5 + Math.floor(playerFactor * 0.6),
      ],

      detectionRadius: Math.max(
        TILE_SIZE * 1.5,

        ENEMY_AGGRO_DISTANCE_BASE * 0.75 +
          playerFactor * ENEMY_AGGRO_DISTANCE_STEP * 0.2
      ),
    };
  }

  if (lvl === 2) {
    const bonusHp = Math.round(playerFactor * 2);

    const bonusHit = Math.min(0.07, playerFactor * 0.012);

    return {
      maxHp: 18 + bonusHp,

      attackHit: clamp(0.62 + bonusHit, 0.55, 0.78),

      dmg: [
        3 + Math.floor(playerFactor * 0.6),

        7 + Math.floor(playerFactor * 0.9),
      ],

      detectionRadius: Math.max(
        TILE_SIZE * 1.7,

        ENEMY_AGGRO_DISTANCE_BASE * 0.9 +
          playerFactor * ENEMY_AGGRO_DISTANCE_STEP * 0.25
      ),
    };
  }

  const stageFactor = Math.max(0, lvl - 2);

  const combined = stageFactor * 0.7 + playerFactor * 0.5;

  const maxHp = Math.round(20 + combined * 4);

  const hit = clamp(0.64 + combined * 0.018, 0.58, 0.9);

  const minDmg = Math.round(3 + combined * 1.1);

  const maxDmg = Math.round(7 + combined * 1.6);

  const detectionRadius =
    ENEMY_AGGRO_DISTANCE_BASE +
    Math.min(stageFactor, 6) * ENEMY_AGGRO_DISTANCE_STEP +
    Math.min(playerFactor, 5) * ENEMY_AGGRO_DISTANCE_STEP * 0.3;

  return {
    maxHp,

    attackHit: hit,

    dmg: [minDmg, Math.max(minDmg + 1, maxDmg)],

    detectionRadius,
  };
}

const ENEMY_COUNTER = { hit: 0.7, dmg: [3, 8] };

const MERCHANT_IMG = "assets/merchant.png";

const MERCHANT_HEAL_ANIM_MS = 820;

const SHOP_VOLUME_MULTIPLIER = 0.45;

const MERCHANT_SIZE = 26;

const HEART_VALUE = 5;

const HEART_IMG = "assets/heart.png";

const COIN_IMG = "assets/coin.png";

const COIN_GROUND_COUNT = 5;

const COIN_REWARD = [3, 10];

const COIN_DRAW_SCALE = 2;

const FLOATER_LIFETIME = 0.9;

const FLOATER_RISE = 36;

const COIN_FLOAT_COLOR = "#ffd86b";

// === Globals =================================================================

let canvas, ctx;

let keys = Object.create(null);

let moveQueue = [];

let heldMoveKey = null;

let holdElapsed = 0;

let images = {};

let map = null;

let worldSeed = null;

let player = {
  x: 5 * TILE_SIZE,

  y: 5 * TILE_SIZE,

  w: 24,

  h: 24,

  lastTileX: null,

  lastTileY: null,

  renderX: 5 * TILE_SIZE,

  renderY: 5 * TILE_SIZE,
};

let camera = { x: 0, y: 0, targetX: 0, targetY: 0 };

let stats = { steps: 0, playTimeMs: 0 };

let settings = { mute: false, showMinimap: true };

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

let shopUI = {};

let ambientMusic = { gain: null, timer: null };

let accessibleTiles = new Set();

let music = {
  menu: null,

  game: null,

  levelUp: null,

  current: null,
};

let pendingMenuMusic = false;

let audioUnlocked = false;

let pendingLevelConfig = null;

let levelUpUI = {};

let coins = 0;

let groundCoins = [];

let floaters = [];

let battlePaused = false;

let playerProgress = createInitialPlayerProgress();

let battleMoves = buildBattleMoves(playerProgress);

let merchant = null;

let nextMerchantLevel = 0;

let shopState = { open: false, selectedSkill: null };

let shopHealPulseTimer = null;

// === Utilities ================================================================

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const randRange = (min, max) => min + Math.random() * (max - min);

const randInt = (min, max) => Math.floor(randRange(min, max + 1));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const tileKey = (x, y) => y * MAP_W + x;

function coinDrawSize() {
  const img = images[COIN_IMG];

  const base = img ? img.width : 16;

  return Math.min(base * COIN_DRAW_SCALE, TILE_SIZE);
}

const tileCenter = (x, y) => ({
  x: (x + 0.5) * TILE_SIZE,

  y: (y + 0.5) * TILE_SIZE,
});

const smoothTowards = (current, target, rate, dt) =>
  current + (target - current) * Math.min(1, dt * rate);

function shuffledCardinalDirs() {
  const dirs = [
    { dx: 1, dy: 0 },

    { dx: -1, dy: 0 },

    { dx: 0, dy: 1 },

    { dx: 0, dy: -1 },
  ];

  for (let i = dirs.length - 1; i > 0; i--) {
    const j = randInt(0, i);

    [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
  }

  return dirs;
}

function floaterAnchor() {
  const baseX = (player.renderX ?? player.x ?? 0) + (player.w ?? TILE_SIZE) / 2;

  const baseY =
    (player.renderY ?? player.y ?? 0) +
    Math.max(player.h ?? TILE_SIZE, 16) * 0.3;

  return { x: baseX, y: baseY };
}

function spawnFloater(text, color = COIN_FLOAT_COLOR, worldX, worldY, icon) {
  const anchor = floaterAnchor();

  floaters.push({
    id: `floater-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,

    text,

    color,

    x: worldX ?? anchor.x,

    y: worldY ?? anchor.y,

    age: 0,

    life: FLOATER_LIFETIME,

    icon,
  });
}

function spawnCoinFloater(amount, options = {}) {
  const { worldX, worldY, color = COIN_FLOAT_COLOR } = options;

  const label = options.label ?? `+${amount} coin${amount === 1 ? "" : "s"}`;

  spawnFloater(label, color, worldX, worldY, COIN_IMG);
}

function rollXp(range) {
  if (!Array.isArray(range) || range.length < 2) return 0;

  const [min, max] = range;

  return randInt(Math.max(0, Math.floor(min)), Math.max(0, Math.floor(max)));
}

function grantXp(amount, options = {}) {
  const gained = Math.max(0, Math.floor(amount ?? 0));

  if (gained <= 0) return 0;

  if (!playerProgress) playerProgress = createInitialPlayerProgress();

  const anchor = floaterAnchor();

  const worldX = options.worldX ?? anchor.x;

  const worldY = options.worldY ?? anchor.y - TILE_SIZE * 0.25;

  playerProgress.level = Math.max(1, Math.floor(playerProgress.level ?? 1));

  playerProgress.xp = Math.max(0, Math.floor(playerProgress.xp ?? 0)) + gained;

  let levelsGained = 0;

  while (playerProgress.xp >= xpRequiredForNextLevel(playerProgress.level)) {
    playerProgress.xp -= xpRequiredForNextLevel(playerProgress.level);

    playerProgress.level += 1;

    levelsGained += 1;
  }

  if (options.showFloater !== false) {
    spawnFloater(`+${gained} XP`, XP_FLOAT_COLOR, worldX, worldY);
  }

  if (levelsGained > 0) {
    const hpBonus = levelsGained * PLAYER_HP_PER_LEVEL;

    const baseMaxHp =
      PLAYER_BATTLE_HP + (playerProgress.level - 1) * PLAYER_HP_PER_LEVEL;

    const currentMax =
      typeof playerProgress.maxHp === "number" &&
      Number.isFinite(playerProgress.maxHp)
        ? Math.floor(playerProgress.maxHp)
        : PLAYER_BATTLE_HP;

    playerProgress.maxHp = Math.max(currentMax + hpBonus, baseMaxHp);

    playerProgress.currentHp = playerProgress.maxHp;

    spawnFloater(
      `Level ${playerProgress.level}!`,

      LEVEL_UP_FLOAT_COLOR,

      worldX,

      worldY - TILE_SIZE * 0.4
    );

    flash(`Level up! Reached level ${playerProgress.level}. Max HP increased.`);
  }

  const enforcedBase =
    PLAYER_BATTLE_HP + (playerProgress.level - 1) * PLAYER_HP_PER_LEVEL;

  const normalizedMax =
    typeof playerProgress.maxHp === "number" &&
    Number.isFinite(playerProgress.maxHp)
      ? Math.max(Math.floor(playerProgress.maxHp), enforcedBase)
      : enforcedBase;

  playerProgress.maxHp = normalizedMax;

  playerProgress.currentHp = clamp(
    typeof playerProgress.currentHp === "number" &&
      Number.isFinite(playerProgress.currentHp)
      ? Math.floor(playerProgress.currentHp)
      : normalizedMax,

    0,

    normalizedMax
  );

  if (activeBattle) {
    activeBattle.playerMaxHp = playerProgress.maxHp;

    const battleHp =
      typeof activeBattle.playerHp === "number" &&
      Number.isFinite(activeBattle.playerHp)
        ? Math.floor(activeBattle.playerHp)
        : playerProgress.maxHp;

    activeBattle.playerHp = clamp(battleHp, 1, playerProgress.maxHp);
  }

  if (typeof updateBattleUI === "function") updateBattleUI();

  updateHUD();

  return gained;
}

function grantXpForCoins(count, options = {}) {
  const coinsCount = Math.max(0, Math.floor(count ?? 0));

  if (!coinsCount) return 0;

  let totalXp = 0;

  for (let i = 0; i < coinsCount; i++) {
    totalXp += rollXp(XP_REWARD_COIN);
  }

  return grantXp(totalXp, options);
}

function updateFloaters(dt) {
  if (!floaters.length) return;

  for (let i = floaters.length - 1; i >= 0; i--) {
    const floater = floaters[i];

    floater.age += dt;

    if (floater.age >= floater.life) {
      floaters.splice(i, 1);
    }
  }
}

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
    new Set([
      ...entries,

      "assets/player.png",

      COIN_IMG,

      MERCHANT_IMG,

      HEART_IMG,

      ...ENEMY_SPRITES,
    ])
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

  applyGrassVariants(m, rnd);

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

function applyGrassVariants(m, rnd) {
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[0].length; x++) {
      if (m[y][x] === TILE.GRASS) {
        const roll = rnd();

        if (roll < 0.02) {
          m[y][x] = TILE.GRASS_ALT2;
        } else if (roll < 0.08) {
          m[y][x] = TILE.GRASS_ALT;
        }
      }
    }
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
      if (isGrassTile(m[y][x]) || m[y][x] === TILE.SAND) return true;

  return false;
}

function pickRandomGrassSpawn(m, seed) {
  const rnd = srand(seed ^ 0x9e3779b9);

  const open = [];

  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[0].length; x++) {
      if (isGrassTile(m[y][x]) || m[y][x] === TILE.SAND) {
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

function spawnGroundCoins(count = COIN_GROUND_COUNT) {
  groundCoins = [];

  const used = new Set();

  // Avoid player start & enemy tiles

  if (player.lastTileX != null && player.lastTileY != null) {
    used.add(tileKey(player.lastTileX, player.lastTileY));
  }

  for (const e of enemies) {
    if (e.alive) used.add(tileKey(e.tileX, e.tileY));
  }

  if (merchant) {
    used.add(tileKey(merchant.tileX, merchant.tileY));
  }

  let tries = 0;

  while (groundCoins.length < count && tries < 1000) {
    tries++;

    const tile = findOpenTile(6); // keep them away a bit; "uncommon"

    const key = tileKey(tile.x, tile.y);

    if (used.has(key)) continue;

    if (!isPassableTile(tileAt(tile.x, tile.y))) continue;

    if (accessibleTiles.size && !accessibleTiles.has(key)) continue;

    used.add(key);

    groundCoins.push({
      id: `coin-${tile.x}-${tile.y}-${Math.floor(Math.random() * 1e6)}`,

      tileX: tile.x,

      tileY: tile.y,

      collected: false,
    });
  }
}

function coinAtTile(tx, ty) {
  return (
    groundCoins.find((c) => !c.collected && c.tileX === tx && c.tileY === ty) ||
    null
  );
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
  if (lvl <= 1) return 1;

  if (lvl === 2) return 2;

  return Math.min(6, Math.floor(lvl * 0.8) + 1);
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

  const usedTiles = new Set();

  if (player.lastTileX != null && player.lastTileY != null) {
    usedTiles.add(tileKey(player.lastTileX, player.lastTileY));
  }

  if (merchant) {
    usedTiles.add(tileKey(merchant.tileX, merchant.tileY));
  }

  const profile = enemyProfileForLevel(level);

  for (let i = 0; i < count; i++) {
    let tile;

    let tries = 0;

    do {
      tile = findOpenTile(3);

      tries++;
    } while (
      tries < 120 &&
      (usedTiles.has(tileKey(tile.x, tile.y)) ||
        (accessibleTiles.size && !accessibleTiles.has(tileKey(tile.x, tile.y))))
    );

    const baseHp = Math.max(
      6,

      Math.round(profile.maxHp + randRange(-2, 2))
    );

    const detectionRadius = profile.detectionRadius;

    const attackHit = profile.attackHit;

    const attackMin = profile.dmg[0];

    const attackMax = profile.dmg[1];

    const enemy = {
      id: `enemy-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,

      tileX: tile.x,

      tileY: tile.y,

      x: 0,

      y: 0,

      w: ENEMY_SIZE,

      h: ENEMY_SIZE,

      state: "idle",

      alive: true,

      sprite: ENEMY_SPRITES[randInt(0, ENEMY_SPRITES.length - 1)],

      maxHp: baseHp,

      battleHp: baseHp,

      detectionRadius,

      attack: { hit: attackHit, dmg: [attackMin, attackMax] },
    };

    setEnemyWorldPosition(enemy, { syncRender: true });

    enemies.push(enemy);

    usedTiles.add(tileKey(enemy.tileX, enemy.tileY));
  }

  minimapDirty = true;
}

function serializeEnemies() {
  return enemies

    .filter((e) => e.alive)

    .map((e) => ({
      id: e.id,

      tileX: e.tileX,

      tileY: e.tileY,

      x: e.x,

      y: e.y,

      w: e.w,

      h: e.h,

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
  const profile = enemyProfileForLevel(level);

  enemies = list.map((data, idx) => {
    const width = data.w ?? ENEMY_SIZE;

    const height = data.h ?? ENEMY_SIZE;

    const rawTileX =
      typeof data.tileX === "number" && Number.isFinite(data.tileX)
        ? data.tileX
        : ((data.x ?? 0) + width / 2) / TILE_SIZE;

    const rawTileY =
      typeof data.tileY === "number" && Number.isFinite(data.tileY)
        ? data.tileY
        : ((data.y ?? 0) + height / 2) / TILE_SIZE;

    const tileX = clamp(Math.floor(rawTileX), 0, MAP_W - 1);

    const tileY = clamp(Math.floor(rawTileY), 0, MAP_H - 1);

    const storedMaxHp =
      typeof data.maxHp === "number" && Number.isFinite(data.maxHp)
        ? data.maxHp
        : profile.maxHp;

    const maxHp = Math.max(6, Math.min(storedMaxHp, profile.maxHp));

    const storedBattleHp =
      typeof data.battleHp === "number" && Number.isFinite(data.battleHp)
        ? data.battleHp
        : maxHp;

    const enemy = {
      id: data.id ?? `enemy-${Date.now()}-${idx}`,

      tileX,

      tileY,

      x: 0,

      y: 0,

      w: width,

      h: height,

      state: "idle",

      alive: true,

      sprite:
        data.sprite && ENEMY_SPRITES.includes(data.sprite)
          ? data.sprite
          : ENEMY_SPRITES[idx % ENEMY_SPRITES.length],

      maxHp,

      battleHp: clamp(storedBattleHp, 1, maxHp),

      detectionRadius: profile.detectionRadius,

      attack: { hit: profile.attackHit, dmg: [...profile.dmg] },
    };

    setEnemyWorldPosition(enemy, { syncRender: true });

    return enemy;
  });

  for (const enemy of enemies) {
    const key = tileKey(enemy.tileX, enemy.tileY);

    if (accessibleTiles.size && !accessibleTiles.has(key)) {
      const tile = findOpenTile(2);

      enemy.tileX = tile.x;

      enemy.tileY = tile.y;

      setEnemyWorldPosition(enemy, { syncRender: true });
    }

    if (
      merchant &&
      enemy.tileX === merchant.tileX &&
      enemy.tileY === merchant.tileY
    ) {
      const tile = findOpenTile(2);

      enemy.tileX = tile.x;

      enemy.tileY = tile.y;

      setEnemyWorldPosition(enemy, { syncRender: true });
    }
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

    coins,

    groundCoins: groundCoins.map((c) => ({ ...c })),

    enemies: serializeEnemies(),

    playerProgress: clonePlayerProgress(),

    merchant: serializeMerchant(),

    nextMerchantLevel,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  savedSnapshot = {
    ...state,

    player: { ...state.player },

    settings: { ...state.settings },

    stats: { ...state.stats },

    enemies: state.enemies.map((e) => ({ ...e })),

    groundCoins: state.groundCoins.map((c) => ({ ...c })),

    playerProgress: clonePlayerProgress(state.playerProgress),

    merchant: state.merchant
      ? {
          ...state.merchant,

          skillIds: Array.isArray(state.merchant.skillIds)
            ? [...state.merchant.skillIds]
            : [],
        }
      : null,

    nextMerchantLevel: state.nextMerchantLevel,
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

    data.settings = { mute: false, showMinimap: true, ...data.settings };

    data.stats = { steps: 0, playTimeMs: 0, ...data.stats };

    data.level = data.level ?? 1;

    data.score = data.score ?? 0;

    data.coins = data.coins ?? 0;

    data.groundCoins = Array.isArray(data.groundCoins) ? data.groundCoins : [];

    data.enemies = Array.isArray(data.enemies) ? data.enemies : [];

    data.playerProgress = clonePlayerProgress(
      data.playerProgress ?? createInitialPlayerProgress()
    );

    data.nextMerchantLevel =
      typeof data.nextMerchantLevel === "number" ? data.nextMerchantLevel : 0;

    data.merchant =
      data.merchant && typeof data.merchant === "object" ? data.merchant : null;

    return data;
  } catch {
    return null;
  }
}

function migrateSave(old) {
  const upgraded = {
    ...old,

    v: SAVE_VERSION,

    level: old.level ?? 1,

    score: old.score ?? 0,

    enemies: Array.isArray(old.enemies) ? old.enemies : [],
  };

  upgraded.playerProgress = clonePlayerProgress(
    old.playerProgress ?? createInitialPlayerProgress()
  );

  upgraded.nextMerchantLevel =
    typeof old.nextMerchantLevel === "number" ? old.nextMerchantLevel : 0;

  upgraded.merchant =
    old.merchant && typeof old.merchant === "object" ? old.merchant : null;

  return upgraded;
}

function resetState(withNewSeed = true) {
  coins = 0;

  groundCoins = [];

  closeMerchantShop();

  merchant = null;

  shopState.open = false;

  shopState.selectedSkill = null;

  playerProgress = createInitialPlayerProgress();

  nextMerchantLevel = 0;

  const nextSeed = withNewSeed
    ? (Math.random() * 2 ** 32) | 0
    : worldSeed ?? (Math.random() * 2 ** 32) | 0;

  pendingLevelConfig = null;

  hideLevelUpScreen();

  battlePaused = false;

  localStorage.removeItem(STORAGE_KEY);

  savedSnapshot = null;

  floaters = [];

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

  const recordMoveHold = (key) => {
    heldMoveKey = key;

    holdElapsed = 0;
  };

  window.addEventListener(
    "keydown",

    (e) => {
      const key = e.key.toLowerCase();

      const move = MOVE_KEYS[key];

      if (gameState === "battle") {
        if (!e.repeat) {
          if (key === "escape") {
            pauseBattleToMenu();

            e.preventDefault();

            return;
          }

          if (key === "m") toggleMute();
        }

        if (block.has(e.key)) e.preventDefault();

        return;
      }

      const isPlaying = gameState === "playing";

      if (!isPlaying) {
        if (!e.repeat && key === "m") toggleMute();

        if (gameState === "shop") {
          if (
            !e.repeat &&
            (key === "escape" || key === " " || key === "enter")
          ) {
            closeMerchantShop();

            e.preventDefault();
          }

          if (block.has(e.key)) e.preventDefault();

          return;
        }

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

      if (move) {
        if (!keys[key]) {
          keys[key] = true;

          moveQueue.push(move);

          recordMoveHold(key);
        } else if (!e.repeat) {
          recordMoveHold(key);
        }

        resumeAudio();

        if (block.has(e.key)) e.preventDefault();

        return;
      }

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

      const key = e.key.toLowerCase();

      const move = MOVE_KEYS[key];

      keys[key] = false;

      if (move) {
        if (heldMoveKey === key) {
          heldMoveKey = findHeldMoveKey();

          holdElapsed = 0;
        }

        if (block.has(e.key)) e.preventDefault();

        return;
      }

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
  return isGrassTile(tileId) || tileId === TILE.SAND;
}

function tileAt(tx, ty) {
  if (!Number.isFinite(tx) || !Number.isFinite(ty)) return TILE.WATER;

  if (!map) return TILE.WATER;

  const ix = Math.floor(tx);

  const iy = Math.floor(ty);

  if (iy < 0 || ix < 0 || iy >= MAP_H || ix >= MAP_W) return TILE.WATER; // out of bounds solid

  const row = map[iy];

  if (!row) return TILE.WATER;

  return row[ix];
}

function clearMovementKeys() {
  for (const key of Object.keys(keys)) keys[key] = false;

  moveQueue = [];

  heldMoveKey = null;

  holdElapsed = 0;
}

function findHeldMoveKey() {
  for (const key of Object.keys(MOVE_KEYS)) {
    if (keys[key]) return key;
  }

  return null;
}

function syncPlayerRender() {
  player.renderX = player.x;

  player.renderY = player.y;
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

  btn.style.display = "flex";

  btn.dataset.moveId = move.id ?? "";

  if (!btn.dataset.enhanced) {
    btn.innerHTML = `

      <span class="battle-icon"></span>

      <span class="battle-title"></span>

      <span class="battle-summary"></span>

      <span class="battle-meta"></span>

    `;

    btn.dataset.enhanced = "true";
  }

  const iconEl = btn.querySelector(".battle-icon");

  const titleEl = btn.querySelector(".battle-title");

  const summaryEl = btn.querySelector(".battle-summary");

  const metaEl = btn.querySelector(".battle-meta");

  btn.classList.toggle("is-locked", !!move.locked);

  if (move.locked) {
    btn.disabled = true;

    btn.title = move.hint ?? "Locked ability";

    if (iconEl) {
      const lockedIcon = move.iconClass ?? "bi-lock-fill";

      iconEl.innerHTML = `<i class="bi ${lockedIcon}"></i>`;
    }

    titleEl.textContent = move.label ?? "Locked";

    summaryEl.textContent = move.hint ?? "Unlock this ability later.";

    metaEl.textContent = move.metaText ?? "";

    return;
  }

  btn.disabled = false;

  btn.title = move.summary ?? move.label ?? "Attack";

  if (iconEl) {
    if (move.iconClass) {
      iconEl.innerHTML = `<i class="bi ${move.iconClass}"></i>`;
    } else if (move.icon) {
      iconEl.textContent = move.icon;
    } else {
      iconEl.textContent = "??";
    }
  }

  titleEl.textContent = move.label ?? "Attack";

  summaryEl.textContent = move.summary ?? "";

  if (move.metaText != null) {
    metaEl.textContent = move.metaText;
  } else {
    const chance = Math.round((move.hit ?? 0) * 100);

    if (Array.isArray(move.dmg)) {
      const multi = Array.isArray(move.effects)
        ? move.effects.find((effect) => effect?.type === "multiHit")
        : null;

      if (multi) {
        const hits = Math.max(2, Math.floor(multi.count ?? 2));

        metaEl.textContent = `${chance}% | ${hits}x ${move.dmg[0]}-${move.dmg[1]} dmg`;
      } else {
        metaEl.textContent = `${chance}% | ${move.dmg[0]}-${move.dmg[1]} dmg`;
      }
    } else {
      metaEl.textContent = `${chance}% chance`;
    }
  }
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
  syncPlayerRender();

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

function placePlayerOnTile(tx, ty, options = {}) {
  const { snapCamera = false, syncRender = false } = options;

  player.lastTileX = tx;

  player.lastTileY = ty;

  player.x = (tx + 0.5) * TILE_SIZE - player.w / 2;

  player.y = (ty + 0.5) * TILE_SIZE - player.h / 2;

  if (snapCamera) {
    syncPlayerRender();

    focusCameraImmediate();
  } else {
    if (syncRender) syncPlayerRender();

    camera.targetX = player.renderX + player.w / 2 - CANVAS_W / 2;

    camera.targetY = player.renderY + player.h / 2 - CANVAS_H / 2;
  }

  refreshAccessibility();
}

function spawnPlayerRandom() {
  const spawn = pickRandomGrassSpawn(map, worldSeed);

  placePlayerOnTile(spawn.x, spawn.y, { snapCamera: true });
}

function enemyAtTile(tx, ty) {
  return enemies.find(
    (enemy) => enemy.alive && enemy.tileX === tx && enemy.tileY === ty
  );
}

function setEnemyWorldPosition(enemy, options = {}) {
  const { syncRender = false } = options;

  enemy.x = enemy.tileX * TILE_SIZE + (TILE_SIZE - enemy.w) / 2;

  enemy.y = enemy.tileY * TILE_SIZE + (TILE_SIZE - enemy.h) / 2;

  if (
    syncRender ||
    enemy.renderX == null ||
    Number.isNaN(enemy.renderX) ||
    enemy.renderY == null ||
    Number.isNaN(enemy.renderY)
  ) {
    enemy.renderX = enemy.x;

    enemy.renderY = enemy.y;
  }
}

function performPlayerTurn(dx, dy) {
  if (!dx && !dy) return false;

  if (gameState !== "playing" || activeBattle) return false;

  if (player.lastTileX == null || player.lastTileY == null) return false;

  const targetX = player.lastTileX + dx;

  const targetY = player.lastTileY + dy;

  if (targetX < 0 || targetY < 0 || targetX >= MAP_W || targetY >= MAP_H) {
    return false;
  }

  const blockingEnemy = enemyAtTile(targetX, targetY);

  if (blockingEnemy) {
    startBattle(blockingEnemy);

    return true;
  }

  const targetTile = tileAt(targetX, targetY);

  if (!isPassableTile(targetTile)) return false;

  placePlayerOnTile(targetX, targetY);

  const steppedOnMerchant = merchantAtTile(targetX, targetY);

  const onCoin = coinAtTile(targetX, targetY);

  if (onCoin) {
    onCoin.collected = true;

    coins += 1;

    const center = tileCenter(targetX, targetY);

    spawnCoinFloater(1, {
      worldX: center.x,

      worldY: center.y - TILE_SIZE * 0.2,
    });

    grantXpForCoins(1, {
      worldX: center.x,

      worldY: center.y - TILE_SIZE * 0.8,
    });

    updateHUD();
  }

  stats.steps++;

  lastMiniPlayer = { x: targetX, y: targetY };

  minimapDirty = true;

  if (isGrassTile(targetTile) || targetTile === TILE.SAND) {
    playFootstep(targetTile);
  }

  if (steppedOnMerchant) {
    tryOpenMerchantShop();

    updateHUD();

    updateMinimap();

    return true;
  }

  const ctx = resumeAudio();

  startAmbientMusic(ctx);

  if (!takeEnemyTurn()) {
    updateHUD();

    updateMinimap();
  }

  return true;
}

// === Movement & Collision (tile AABB) ========================================

function update(dt) {
  updateFloaters(dt);

  if (!map || gameState !== "playing") return;

  if (moveQueue.length && gameState === "playing") {
    const move = moveQueue.shift();

    if (move && performPlayerTurn(move.dx, move.dy)) {
      holdElapsed = 0;
    }
  } else if (heldMoveKey) {
    holdElapsed += dt;

    if (holdElapsed >= MOVE_HOLD_DELAY) {
      holdElapsed = 0;

      const heldMove = MOVE_KEYS[heldMoveKey];

      if (heldMove) moveQueue.push(heldMove);
    }
  }

  player.renderX = smoothTowards(
    player.renderX,

    player.x,

    PLAYER_RENDER_LERP,

    dt
  );

  player.renderY = smoothTowards(
    player.renderY,

    player.y,

    PLAYER_RENDER_LERP,

    dt
  );

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const targetX = enemy.x ?? 0;

    const targetY = enemy.y ?? 0;

    if (enemy.renderX == null) enemy.renderX = targetX;

    if (enemy.renderY == null) enemy.renderY = targetY;

    enemy.renderX = smoothTowards(
      enemy.renderX,

      targetX,

      ENEMY_RENDER_LERP,

      dt
    );

    enemy.renderY = smoothTowards(
      enemy.renderY,

      targetY,

      ENEMY_RENDER_LERP,

      dt
    );
  }

  // camera easing toward player

  camera.targetX = player.renderX + player.w / 2 - CANVAS_W / 2;

  camera.targetY = player.renderY + player.h / 2 - CANVAS_H / 2;

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

  // time + throttled autosave

  stats.playTimeMs += dt * 1000;

  accTimeForSave += dt * 1000;

  if (accTimeForSave > SAVE_INTERVAL_MS) {
    saveState();

    accTimeForSave = 0;
  }

  updateHUD();

  if (
    player.lastTileX !== lastMiniPlayer.x ||
    player.lastTileY !== lastMiniPlayer.y
  ) {
    lastMiniPlayer = {
      x: player.lastTileX ?? Math.floor((player.x + player.w / 2) / TILE_SIZE),

      y: player.lastTileY ?? Math.floor((player.y + player.h / 2) / TILE_SIZE),
    };

    minimapDirty = true;
  }

  updateMinimap();
}

function takeEnemyTurn() {
  if (gameState !== "playing") return false;

  if (player.lastTileX == null || player.lastTileY == null) return false;

  const occupied = new Set();

  for (const enemy of enemies) {
    if (!enemy.alive || enemy.state === "battle") continue;

    occupied.add(tileKey(enemy.tileX, enemy.tileY));
  }

  occupied.add(tileKey(player.lastTileX, player.lastTileY));

  let movedAny = false;

  for (const enemy of enemies) {
    if (!enemy.alive || enemy.state === "battle") continue;

    const currentKey = tileKey(enemy.tileX, enemy.tileY);

    occupied.delete(currentKey);

    const dx = player.lastTileX - enemy.tileX;

    const dy = player.lastTileY - enemy.tileY;

    const distance = Math.abs(dx) + Math.abs(dy);

    const detectionTiles = Math.max(
      1,

      Math.floor(
        (enemy.detectionRadius ?? ENEMY_AGGRO_DISTANCE_BASE) / TILE_SIZE
      )
    );

    const candidates = [];

    if (distance > 0 && distance <= detectionTiles) {
      if (Math.abs(dx) >= Math.abs(dy)) {
        candidates.push({ dx: Math.sign(dx), dy: 0 });

        if (dy) candidates.push({ dx: 0, dy: Math.sign(dy) });
      } else {
        candidates.push({ dx: 0, dy: Math.sign(dy) });

        if (dx) candidates.push({ dx: Math.sign(dx), dy: 0 });
      }
    }

    for (const dir of shuffledCardinalDirs()) {
      if (!candidates.some((c) => c.dx === dir.dx && c.dy === dir.dy)) {
        candidates.push(dir);
      }
    }

    let moved = false;

    for (const dir of candidates) {
      const tx = enemy.tileX + dir.dx;

      const ty = enemy.tileY + dir.dy;

      if (tx === enemy.tileX && ty === enemy.tileY) continue;

      if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) continue;

      const key = tileKey(tx, ty);

      if (tx === player.lastTileX && ty === player.lastTileY) {
        enemy.tileX = tx;

        enemy.tileY = ty;

        setEnemyWorldPosition(enemy);

        startBattle(enemy);

        return true;
      }

      const tile = tileAt(tx, ty);

      if (!isPassableTile(tile)) continue;

      if (accessibleTiles.size && !accessibleTiles.has(key)) continue;

      if (occupied.has(key)) continue;

      enemy.tileX = tx;

      enemy.tileY = ty;

      setEnemyWorldPosition(enemy);

      occupied.add(key);

      moved = true;

      movedAny = true;

      break;
    }

    if (!moved) {
      occupied.add(currentKey);

      setEnemyWorldPosition(enemy);
    }
  }

  if (movedAny) minimapDirty = true;

  return false;
}

function startBattle(enemy) {
  if (!enemy || gameState !== "playing") return;

  clearMovementKeys();

  battlePaused = false;

  playBattleSound("start");

  enemy.battleHp = enemy.maxHp;

  const maxHp = playerProgress?.maxHp ?? PLAYER_BATTLE_HP;

  const startingHp = clamp(
    playerProgress?.currentHp ?? maxHp,

    1,

    maxHp
  );

  playerProgress.currentHp = startingHp;

  activeBattle = {
    enemy,

    playerHp: startingHp,

    playerMaxHp: maxHp,

    enemyHp: Math.max(1, enemy.battleHp),

    enemyMaxHp: enemy.maxHp,

    busy: true,

    result: null,

    nextDamageReduction: 0,

    skipEnemyTurn: false,

    enemyHitPenalty: 0,
  };

  enemy.state = "battle";

  gameState = "battle";

  updateGameMusicVolume();

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
      setMoveButtonContent(btn, battleMoves[idx]);
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

  const effects = Array.isArray(move.effects) ? move.effects : [];

  const multiEffect = effects.find((effect) => effect?.type === "multiHit");

  const plannedHits = multiEffect
    ? Math.max(2, Math.floor(multiEffect.count ?? 2))
    : 1;

  const detail = multiEffect
    ? `${Math.round(move.hit * 100)}%  ${plannedHits}x ${move.dmg[0]}-${
        move.dmg[1]
      } dmg`
    : `${Math.round(move.hit * 100)}%  ${move.dmg[0]}-${move.dmg[1]} dmg`;

  setBattleMessage(`You used ${move.label}!\n(${detail})`);

  await animateBattleSprite(battleUI.playerSprite, "attack-player");

  const enemyMaxHp =
    activeBattle.enemyMaxHp ?? activeBattle.enemyHp ?? ENEMY_BATTLE_HP;

  let remainingEnemyHp = activeBattle.enemyHp;

  let totalDamage = 0;

  let hitsLanded = 0;

  const executeEffect = effects.find((effect) => effect?.type === "execute");

  const rollDamage = () => {
    let dmg = randInt(move.dmg[0], move.dmg[1]);

    if (executeEffect) {
      const threshold =
        typeof executeEffect.threshold === "number"
          ? executeEffect.threshold
          : 0.5;

      const bonus =
        typeof executeEffect.bonus === "number" ? executeEffect.bonus : 0;

      if (remainingEnemyHp <= enemyMaxHp * threshold) {
        dmg += bonus;
      }
    }

    return dmg;
  };

  const rollHit = () => Math.random() <= move.hit;

  if (multiEffect) {
    for (let i = 0; i < plannedHits; i++) {
      if (!rollHit()) continue;

      const dmg = rollDamage();

      totalDamage += dmg;

      remainingEnemyHp = Math.max(0, remainingEnemyHp - dmg);

      hitsLanded++;
    }
  } else if (rollHit()) {
    totalDamage = rollDamage();

    remainingEnemyHp = Math.max(0, remainingEnemyHp - totalDamage);

    hitsLanded = 1;
  }

  if (!hitsLanded) {
    playBattleSound("miss");

    setBattleMessage(`It missed!\n(${detail})`);

    return false;
  }

  activeBattle.enemyHp = Math.max(0, activeBattle.enemyHp - totalDamage);

  if (activeBattle.enemy) activeBattle.enemy.battleHp = activeBattle.enemyHp;

  playBattleSound("player-hit");

  await animateBattleHit(battleUI.enemySprite);

  const summaryLines = [];

  if (multiEffect && hitsLanded > 1) {
    summaryLines.push(
      `Combo landed ${hitsLanded} hits for ${totalDamage} damage.`
    );
  } else {
    summaryLines.push(`Hit! Dealt ${totalDamage} damage.`);
  }

  let healedAmount = 0;

  let coinsGained = 0;

  let coinXpCount = 0;

  let shieldAmount = 0;

  let accuracyReduced = false;

  for (const effect of effects) {
    if (!effect || typeof effect !== "object") continue;

    switch (effect.type) {
      case "heal": {
        const amount = Math.max(0, Math.floor(effect.amount ?? 0));

        if (amount > 0) {
          const maxHp = activeBattle.playerMaxHp ?? PLAYER_BATTLE_HP;

          const before = activeBattle.playerHp;

          activeBattle.playerHp = Math.min(
            maxHp,
            activeBattle.playerHp + amount
          );

          healedAmount += activeBattle.playerHp - before;
        }

        break;
      }

      case "shield": {
        const amount = Math.max(0, Math.floor(effect.amount ?? 0));

        if (amount > 0) {
          const existing = activeBattle.nextDamageReduction ?? 0;

          activeBattle.nextDamageReduction = Math.max(existing, amount);

          shieldAmount = Math.max(shieldAmount, amount);
        }

        break;
      }

      case "coins": {
        const amount = Math.max(0, Math.floor(effect.amount ?? 0));

        if (amount > 0) {
          coins += amount;

          coinsGained += amount;

          coinXpCount += amount;
        }

        break;
      }

      case "accuracyDebuff": {
        const amount = clamp(effect.amount ?? 0, 0, 0.9);

        if (amount > 0) {
          const currentPenalty = activeBattle.enemyHitPenalty ?? 0;

          activeBattle.enemyHitPenalty = Math.max(currentPenalty, amount);

          accuracyReduced = true;
        }

        break;
      }

      default:
        break;
    }
  }

  if (healedAmount > 0) {
    summaryLines.push(`Recovered ${healedAmount} HP.`);
  }

  if (shieldAmount > 0) {
    summaryLines.push(`Gained a ${shieldAmount} dmg shield.`);
  }

  if (coinsGained > 0) {
    spawnCoinFloater(coinsGained, { color: "#9ad4ff" });

    grantXpForCoins(coinXpCount);

    updateHUD();

    summaryLines.push(
      `Pocketed ${coinsGained} coin${coinsGained === 1 ? "" : "s"}.`
    );
  }

  if (accuracyReduced) {
    summaryLines.push("Enemy accuracy falls for their next swing.");
  }

  updateBattleUI();

  setBattleMessage(summaryLines.join("\n"));

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

  const penalty = clamp(activeBattle.enemyHitPenalty ?? 0, 0, 0.9);

  const baseHit = attack.hit ?? ENEMY_COUNTER.hit;

  const hitChance = clamp(baseHit - penalty, 0.05, 0.97);

  const detail = `${Math.round(hitChance * 100)}%  ${attack.dmg[0]}-${
    attack.dmg[1]
  } dmg`;

  setBattleMessage(`Enemy attacks!\n(${detail})`);

  await animateBattleSprite(battleUI.enemySprite, "attack-enemy");

  activeBattle.enemyHitPenalty = 0;

  if (Math.random() <= hitChance) {
    let dmg = randInt(attack.dmg[0], attack.dmg[1]);

    let mitigated = 0;

    const shield = activeBattle.nextDamageReduction ?? 0;

    if (shield > 0) {
      mitigated = Math.min(dmg, shield);

      dmg = Math.max(0, dmg - mitigated);

      activeBattle.nextDamageReduction = Math.max(0, shield - mitigated);
    }

    activeBattle.playerHp = Math.max(0, activeBattle.playerHp - dmg);

    playBattleSound("enemy-hit");

    await animateBattleHit(battleUI.playerSprite);

    let message;

    if (mitigated > 0 && dmg > 0) {
      message = `Enemy hit you for ${dmg} damage. Shield absorbed ${mitigated}.`;
    } else if (mitigated > 0 && dmg === 0) {
      message = "Your shield absorbed the entire blow!";
    } else {
      message = `Enemy hit you for ${dmg} damage!`;
    }

    setBattleMessage(message);
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

async function performPotionTurn() {
  if (!activeBattle) return;

  const availablePotions = Math.max(
    0,
    Math.floor(playerProgress?.potions ?? 0)
  );

  if (availablePotions <= 0) {
    flash("You're out of potions!");

    refreshBattleMoves();

    return;
  }

  const maxHp = activeBattle.playerMaxHp ?? PLAYER_BATTLE_HP;

  const before = Math.max(0, activeBattle.playerHp ?? maxHp);

  const healAmount = Math.min(POTION_HEAL_AMOUNT, Math.max(0, maxHp - before));

  if (healAmount <= 0) {
    setBattleMessage("Already at full health!");

    refreshBattleMoves();

    return;
  }

  activeBattle.busy = true;

  if (battleUI.buttons)
    battleUI.buttons.forEach((btn) => (btn.disabled = true));

  applyPotionHeal(healAmount);

  refreshBattleMoves();

  setBattleMessage(`You drank a potion and recovered ${healAmount} HP!`);

  if (battleUI.buttons)
    battleUI.buttons.forEach((btn) => (btn.disabled = true));

  await wait(360);

  if (!activeBattle || activeBattle.result) return;

  const playerDefeated = await performEnemyAttack();

  if (!activeBattle || activeBattle.result || playerDefeated) return;

  await wait(260);

  setBattleMessage("Choose your next move!");

  activeBattle.busy = false;

  refreshBattleMoves();
}

function applyPotionHeal(amount) {
  if (!activeBattle) return;

  const maxHp = activeBattle.playerMaxHp ?? PLAYER_BATTLE_HP;

  const before = Math.max(0, activeBattle.playerHp ?? maxHp);

  const heal = Math.min(amount, Math.max(0, maxHp - before));

  if (heal <= 0) return;

  const currentPotions = Math.max(0, Math.floor(playerProgress?.potions ?? 0));

  playerProgress.potions = Math.max(0, currentPotions - 1);

  activeBattle.playerHp = Math.min(maxHp, before + heal);

  playerProgress.currentHp = activeBattle.playerHp;

  spawnFloater(`+${heal} HP`, "#b3ffb3");

  playMerchantSound("heal");

  updateBattleUI();

  saveState();
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

  const move = battleMoves[index];

  if (!move || move.locked) {
    flash(move?.hint ?? "That ability is not available yet.");

    return;
  }

  if (move.id === "potion") {
    await performPotionTurn();

    return;
  }

  activeBattle.busy = true;

  if (battleUI.buttons)
    battleUI.buttons.forEach((btn) => (btn.disabled = true));

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

function pauseBattleToMenu(message = "Battle paused") {
  if (!activeBattle || activeBattle.result) {
    showMenu(message);

    return;
  }

  if (activeBattle.busy) return;

  battlePaused = true;

  battleUI.root?.classList.add("is-hidden");

  battleUI.continue?.classList.add("is-hidden");

  showMenu(message);
}

function finishBattle(result) {
  if (!activeBattle) return;

  battlePaused = false;

  activeBattle.result = result;

  updateGameMusicVolume();

  activeBattle.busy = false;

  if (result === "victory") {
    const maxHp = playerProgress?.maxHp ?? PLAYER_BATTLE_HP;

    const hp = clamp(activeBattle.playerHp ?? maxHp, 1, maxHp);

    playerProgress.currentHp = hp;
  } else if (result === "defeat") {
    playerProgress.currentHp = 0;
  }

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

  battlePaused = false;

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

    const reward = randInt(COIN_REWARD[0], COIN_REWARD[1]);

    coins += reward;

    const playerTileX =
      player.lastTileX ?? Math.floor((player.x + player.w / 2) / TILE_SIZE);

    const playerTileY =
      player.lastTileY ?? Math.floor((player.y + player.h / 2) / TILE_SIZE);

    const center = tileCenter(playerTileX, playerTileY);

    spawnCoinFloater(reward, {
      worldX: center.x,

      worldY: center.y - TILE_SIZE * 0.2,

      color: "#ffb347",
    });

    const xpAnchor = {
      worldX: center.x,

      worldY: center.y - TILE_SIZE * 0.9,
    };

    grantXp(rollXp(XP_REWARD_ENEMY), xpAnchor);

    grantXpForCoins(reward, {
      worldX: center.x,

      worldY: center.y - TILE_SIZE * 1.25,
    });

    flash(`Looted ${reward} coin${reward === 1 ? "" : "s"}!`);

    updateHUD();

    saveState();

    activeBattle = null;

    updateGameMusicVolume();

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

  coins = 0;

  groundCoins = [];

  playerProgress = createInitialPlayerProgress();

  refreshBattleMoves();

  merchant = null;

  shopState.open = false;

  shopState.selectedSkill = null;

  scheduleNextMerchant(1);

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

  battlePaused = false;

  floaters = [];

  if (hud.world) hud.world.textContent = "--";

  if (hud.seed) hud.seed.textContent = "--";

  clearMovementKeys();

  updateHUD();

  updateMenuButtons();

  showMenu("You were defeated! Start a new adventure.");

  playMenuMusic();

  updateGameMusicVolume();
}

function advanceLevel() {
  const clearedLevel = level;

  level += 1;

  grantXp(rollXp(XP_REWARD_LEVEL));

  updateHUD();

  const nextSeed = (Math.random() * 2 ** 32) | 0;

  pendingLevelConfig = {
    seed: nextSeed,

    options: {
      preserveScore: true,

      preserveLevel: true,

      levelOverride: level,

      scoreOverride: score,

      statsOverride: { ...stats },

      enemyCount: enemiesForLevel(level),
    },
  };

  flash(`Level ${clearedLevel} cleared!`);

  showLevelUpScreen(clearedLevel, level);
}

// === Render ==================================================================

function renderFloaters() {
  if (!floaters.length || !ctx) return;

  ctx.save();

  ctx.font = "16px 'Segoe UI', sans-serif";

  ctx.textAlign = "center";

  ctx.textBaseline = "middle";

  ctx.shadowColor = "rgba(0,0,0,0.5)";

  ctx.shadowBlur = 6;

  for (const floater of floaters) {
    const progress = Math.min(1, floater.age / floater.life);

    const alpha = 1 - progress;

    const rise = progress * FLOATER_RISE;

    const screenX = Math.floor(floater.x - camera.x);

    const screenY = Math.floor(floater.y - camera.y - rise);

    ctx.globalAlpha = alpha;

    ctx.fillStyle = floater.color;

    ctx.strokeStyle = "rgba(0,0,0,0.5)";

    ctx.lineWidth = 3;

    const iconImg =
      floater.icon && images[floater.icon] ? images[floater.icon] : null;

    if (iconImg) {
      const baseIcon = iconImg.width || 16;

      const iconSize = Math.round(baseIcon * 1.5);

      const spacing = 6;

      const metrics = ctx.measureText(floater.text);

      const totalWidth = iconSize + spacing + metrics.width;

      const baseX = screenX - totalWidth / 2;

      const iconX = Math.floor(baseX);

      const iconY = Math.floor(screenY - iconSize / 2);

      ctx.drawImage(iconImg, iconX, iconY, iconSize, iconSize);

      const textX = baseX + iconSize + spacing;

      ctx.save();

      ctx.textAlign = "left";

      ctx.strokeText(floater.text, textX, screenY);

      ctx.fillText(floater.text, textX, screenY);

      ctx.restore();
    } else {
      ctx.strokeText(floater.text, screenX, screenY);

      ctx.fillText(floater.text, screenX, screenY);
    }
  }

  ctx.restore();

  ctx.globalAlpha = 1;
}

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

  const cimg = images[COIN_IMG];

  if (cimg) {
    const drawSize = coinDrawSize();

    for (const c of groundCoins) {
      if (c.collected) continue;

      const wx = c.tileX * TILE_SIZE + (TILE_SIZE - drawSize) / 2;

      const wy = c.tileY * TILE_SIZE + (TILE_SIZE - drawSize) / 2;

      const { x: sx, y: sy } = worldToScreen(wx, wy);

      // culling

      if (
        sx + drawSize < 0 ||
        sy + drawSize < 0 ||
        sx > CANVAS_W ||
        sy > CANVAS_H
      )
        continue;

      ctx.drawImage(cimg, sx, sy, drawSize, drawSize);
    }
  }

  if (merchant) {
    const drawX = merchant.renderX ?? merchant.x ?? 0;

    const drawY = merchant.renderY ?? merchant.y ?? 0;

    const ms = worldToScreen(drawX, drawY);

    const mimg = images[MERCHANT_IMG];

    if (mimg) {
      ctx.drawImage(
        mimg,

        ms.x,

        ms.y - 2,

        MERCHANT_SIZE,

        MERCHANT_SIZE
      );
    } else {
      ctx.save();

      ctx.fillStyle = "#f6c86d";

      ctx.fillRect(ms.x, ms.y - 2, MERCHANT_SIZE, MERCHANT_SIZE);

      ctx.strokeStyle = "rgba(80, 45, 20, 0.8)";

      ctx.strokeRect(ms.x, ms.y - 2, MERCHANT_SIZE, MERCHANT_SIZE);

      ctx.restore();
    }
  }

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    const drawX = enemy.renderX ?? enemy.x ?? 0;

    const drawY = enemy.renderY ?? enemy.y ?? 0;

    const es = worldToScreen(drawX, drawY);

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

  const ps = worldToScreen(player.renderX, player.renderY);

  if (pimg) {
    const offset = (TILE_SIZE - player.w) / 2;

    ctx.drawImage(pimg, ps.x - offset, ps.y - offset, TILE_SIZE, TILE_SIZE);
  } else {
    ctx.fillStyle = "#fff";

    const offset = (TILE_SIZE - player.w) / 2;

    ctx.fillRect(ps.x - offset, ps.y - offset, TILE_SIZE, TILE_SIZE);
  }

  const playerBadgeAnchor = {
    x: ps.x + player.w / 2,

    y: ps.y,
  };

  renderFloaters();

  drawMinimapOverlay();
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

    const ex = enemy.tileX * MINIMAP_SCALE_X;

    const ey = enemy.tileY * MINIMAP_SCALE_Y;

    minimapCtx.fillRect(ex, ey, dotW, dotH);
  }

  if (merchant) {
    minimapCtx.fillStyle = "#ffe082";

    const mx = merchant.tileX * MINIMAP_SCALE_X;

    const my = merchant.tileY * MINIMAP_SCALE_Y;

    minimapCtx.fillRect(mx, my, dotW, dotH);
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

function drawMinimapOverlay() {
  if (!ctx || !minimapCanvas || !map) return;
  if (settings.showMinimap === false) return;

  const overlayX = 20;

  const overlayY = 55;

  const padding = 6;

  const bgX = overlayX - padding;

  const bgY = overlayY - padding;

  const bgW = MINIMAP_W + padding * 2;

  const bgH = MINIMAP_H + padding * 2;

  ctx.save();

  ctx.globalAlpha = 0.94;

  ctx.fillStyle = "rgba(8, 12, 24, 0.74)";

  ctx.fillRect(bgX, bgY, bgW, bgH);

  ctx.strokeStyle = "rgba(122, 162, 255, 0.35)";

  ctx.lineWidth = 1;

  ctx.strokeRect(bgX + 0.5, bgY + 0.5, bgW - 1, bgH - 1);

  ctx.globalAlpha = 1;

  const prevSmoothing = ctx.imageSmoothingEnabled;

  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(minimapCanvas, overlayX, overlayY, MINIMAP_W, MINIMAP_H);

  ctx.imageSmoothingEnabled = prevSmoothing;

  ctx.restore();
}

// === Game Flow & Menu =========================================================

function switchMenuTab(tabId = "play") {
  if (!menu.tabs || !menu.panes) return;

  menu.activeTab = tabId;

  for (const tab of menu.tabs) {
    const active = tab.dataset.tab === tabId;

    tab.classList.toggle("is-active", active);

    tab.setAttribute("aria-selected", String(active));
  }

  for (const pane of menu.panes) {
    const active = pane.dataset.pane === tabId;

    pane.classList.toggle("is-active", active);
  }
}

function updateMenuSoundLabel() {
  if (!menu.soundLabel) return;

  menu.soundLabel.textContent = settings.mute ? "Off" : "On";
}

function updateMenuMinimapLabel() {
  if (!menu.minimapLabel) return;

  const visible = settings.showMinimap !== false;

  menu.minimapLabel.textContent = visible ? "On" : "Off";
}

function toggleMinimapOverlay() {
  settings.showMinimap = settings.showMinimap === false;

  updateMenuMinimapLabel();

  minimapDirty = true;

  render();

  if (map && worldSeed != null) {
    saveState();

    accTimeForSave = 0;
  } else if (savedSnapshot) {
    savedSnapshot = {
      ...savedSnapshot,

      settings: {
        ...savedSnapshot.settings,

        showMinimap: settings.showMinimap,
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSnapshot));
  }
}

function deleteSaveData() {
  if (
    typeof window !== "undefined" &&
    typeof window.confirm === "function" &&
    !window.confirm("Clear all saved progress? This cannot be undone.")
  ) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);

  savedSnapshot = null;

  switchMenuTab("play");

  setMenuMessage("Save data cleared. Start a fresh journey!");

  updateMenuButtons();

  if (menu.seedInput) {
    menu.seedInput.value = "";

    menu.seedInput.focus();

    menu.seedInput.select();
  }
}

function setMenuMessage(text = "") {
  if (menu.msg) menu.msg.textContent = text;
}

function updateMenuButtons() {
  if (!menu.continue) return;

  const canResumeCurrent = !!map && player.lastTileX !== null;

  const hasSave = !!savedSnapshot;

  const hasPendingLevel = !!pendingLevelConfig;

  const battleResume = battlePaused && activeBattle && !activeBattle.result;

  if (hasPendingLevel) {
    menu.continue.textContent = "Advance to Next Level";

    menu.continue.disabled = false;
  } else if (battleResume) {
    menu.continue.textContent = "Rejoin Battle";

    menu.continue.disabled = false;
  } else if (canResumeCurrent) {
    menu.continue.textContent = "Resume Exploration";

    menu.continue.disabled = false;
  } else {
    menu.continue.textContent = "Continue Adventure";

    menu.continue.disabled = !hasSave;
  }

  updateMenuSoundLabel();
  updateMenuMinimapLabel();
}

function hideLevelUpScreen() {
  levelUpUI.root?.classList.add("is-hidden");

  stopLevelUpMusic();
}

function showLevelUpScreen(clearedLevel, nextLevel) {
  gameState = "menu";

  clearMovementKeys();

  stopAmbientMusic();

  if (levelUpUI.msg) {
    levelUpUI.msg.textContent = `Level ${clearedLevel} cleared! Ready for level ${nextLevel}?`;
  }

  menu.root?.classList.add("is-hidden");

  levelUpUI.root?.classList.remove("is-hidden");

  playLevelUpMusic();

  updateMenuButtons();
}

function showMenu(message = "") {
  gameState = "menu";

  for (const key of Object.keys(keys)) keys[key] = false;

  floaters = [];

  hideLevelUpScreen();

  menu.root?.classList.remove("is-hidden");

  battleUI.continue?.classList.add("is-hidden");

  battleUI.root?.classList.add("is-hidden");

  updateMenuButtons();

  setMenuMessage(message);

  switchMenuTab(menu.activeTab || "play");

  if (menu.seedInput && menu.activeTab === "play") {
    menu.seedInput.value = menu.seedInput.value.trim();

    menu.seedInput.focus();

    menu.seedInput.select();
  }

  playMenuMusic();

  warmStartMenuMusic();
}

function hideMenu() {
  menu.root?.classList.add("is-hidden");

  setMenuMessage("");
}

function proceedToNextLevel() {
  if (!pendingLevelConfig) {
    hideLevelUpScreen();

    playGameMusic();

    return;
  }

  const { seed, options } = pendingLevelConfig;

  pendingLevelConfig = null;

  hideLevelUpScreen();

  battlePaused = false;

  startFreshGame(seed, options);
}

function enterGame() {
  hideMenu();

  if (battlePaused && activeBattle && !activeBattle.result) {
    battlePaused = false;

    gameState = "battle";

    battleUI.root?.classList.remove("is-hidden");

    battleUI.continue?.classList.add("is-hidden");

    updateBattleUI();

    prevTs = performance.now();

    updateGameMusicVolume();

    playGameMusic();

    return;
  }

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

    preserveSkills,
  } = opts;

  pendingLevelConfig = null;

  hideLevelUpScreen();

  battlePaused = false;

  activeBattle = null;

  battleUI.root?.classList.add("is-hidden");

  battleUI.continue?.classList.add("is-hidden");

  setBattleMessage("");

  const ctx = resumeAudio();

  startAmbientMusic(ctx);

  playGameMusic();

  floaters = [];

  closeMerchantShop();

  merchant = null;

  shopState.open = false;

  shopState.selectedSkill = null;

  coins = preserveScore ? coins : 0;

  level = preserveLevel ? levelOverride ?? level : levelOverride ?? 1;

  score = preserveScore ? scoreOverride ?? score : scoreOverride ?? 0;

  const keepSkills =
    typeof preserveSkills === "boolean"
      ? preserveSkills
      : preserveScore && preserveLevel;

  if (!keepSkills) {
    playerProgress = createInitialPlayerProgress();

    nextMerchantLevel = 0;
  } else {
    playerProgress = clonePlayerProgress(playerProgress);
  }

  if (!nextMerchantLevel) {
    scheduleNextMerchant(level);
  }

  const maxHp = playerProgress?.maxHp ?? PLAYER_BATTLE_HP;

  playerProgress.maxHp = maxHp;

  playerProgress.currentHp = clamp(
    playerProgress.currentHp ?? maxHp,

    1,

    maxHp
  );

  refreshBattleMoves();

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

  setupMerchantForLevel();

  spawnGroundCoins();

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

  pendingLevelConfig = null;

  hideLevelUpScreen();

  battlePaused = false;

  floaters = [];

  const ctx = resumeAudio();

  startAmbientMusic(ctx);

  playGameMusic();

  battlePaused = false;

  floaters = [];

  closeMerchantShop();

  merchant = null;

  shopState.open = false;

  shopState.selectedSkill = null;

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

  syncPlayerRender();

  stats = {
    steps: snapshot.stats?.steps ?? 0,

    playTimeMs: snapshot.stats?.playTimeMs ?? 0,
  };

  settings = { mute: false, ...settings, ...snapshot.settings };
  if (settings.showMinimap === undefined) settings.showMinimap = true;

  coins = snapshot.coins ?? 0;

  playerProgress = clonePlayerProgress(
    snapshot.playerProgress ?? createInitialPlayerProgress()
  );

  refreshBattleMoves();

  nextMerchantLevel =
    typeof snapshot.nextMerchantLevel === "number"
      ? snapshot.nextMerchantLevel
      : nextMerchantLevel ?? 0;

  groundCoins = Array.isArray(snapshot.groundCoins)
    ? snapshot.groundCoins.map((c) => ({ ...c }))
    : [];

  refreshAccessibility();

  if (Array.isArray(snapshot.enemies) && snapshot.enemies.length) {
    restoreEnemies(snapshot.enemies);
  } else {
    spawnEnemies(enemiesForLevel(level));
  }

  let restoredMerchant = false;

  if (snapshot.merchant) {
    restoreMerchant(snapshot.merchant);

    restoredMerchant = !!merchant;
  }

  if (!restoredMerchant) {
    if (!nextMerchantLevel) {
      scheduleNextMerchant(level);
    }

    setupMerchantForLevel();
  } else if (!nextMerchantLevel) {
    scheduleNextMerchant(level);
  }

  if (Array.isArray(snapshot.groundCoins)) {
    groundCoins = snapshot.groundCoins.map((c) => ({ ...c }));
  } else {
    spawnGroundCoins();
  }

  coins = snapshot.coins ?? 0;

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

  updateMenuSoundLabel();

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
  const isMuted = !!settings.mute;
  hud.btnMute.classList.toggle("is-muted", isMuted);

  if (hud.btnMuteLabel) {
    hud.btnMuteLabel.textContent = isMuted ? "Unmute" : "Mute";
  } else {
    hud.btnMute.setAttribute("aria-label", isMuted ? "Unmute" : "Mute");
  }

  if (hud.btnMuteIcon) {
    hud.btnMuteIcon.className = "bi " + (isMuted ? "bi-volume-mute" : "bi-volume-up");
  }
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

function startAmbientMusic(ctx = audioCtx) {
  if (settings.mute) return;

  if (!ctx) return;

  if (ambientMusic.gain) return;

  ambientMusic.gain = ctx.createGain();

  ambientMusic.gain.gain.value = 0.08;

  ambientMusic.gain.connect(ctx.destination);

  const schedule = () => {
    if (!ambientMusic.gain) return;

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

function playMerchantSound(type = "heal") {
  const ctx = resumeAudio();

  if (!ctx) return;

  const now = ctx.currentTime;

  const sequences =
    type === "buy"
      ? [
          {
            freq: 540,
            duration: 0.18,
            volume: 0.12,
            wave: "triangle",
            delay: 0,
          },

          { freq: 680, duration: 0.22, volume: 0.1, wave: "sine", delay: 0.04 },
        ]
      : [
          { freq: 520, duration: 0.2, volume: 0.14, wave: "sine", delay: 0 },

          {
            freq: 760,
            duration: 0.28,
            volume: 0.12,
            wave: "triangle",
            delay: 0.06,
          },
        ];

  for (const tone of sequences) {
    const { freq, duration, volume, wave, delay = 0 } = tone;

    const startTime = now + delay;

    const endTime = startTime + duration;

    const gain = ctx.createGain();

    gain.gain.setValueAtTime(volume, startTime);

    gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();

    osc.type = wave;

    osc.frequency.setValueAtTime(freq, startTime);

    osc.connect(gain);

    osc.start(startTime);

    osc.stop(endTime + 0.02);
  }
}

// === Music (menu & game) =====================================================

function setupMusic() {
  music.menu = new Audio("./assets/audio/menu-music.mp3");

  music.game = new Audio("./assets/audio/game.mp3");

  music.levelUp = new Audio("./assets/audio/next-level.mp3");

  if (music.menu) {
    music.menu.loop = true;

    music.menu.volume = MENU_MUSIC_VOLUME;
  }

  if (music.game) {
    music.game.loop = true;

    music.game.volume = GAME_MUSIC_VOLUME;
  }

  if (music.levelUp) {
    music.levelUp.loop = false;

    music.levelUp.volume = LEVEL_MUSIC_VOLUME;
  }

  for (const track of [music.menu, music.game, music.levelUp]) {
    if (!track) continue;

    track.preload = "auto";

    track.autoplay = false;

    track.playsInline = true;

    track.crossOrigin = "anonymous";

    if (typeof track.load === "function") {
      try {
        track.load();
      } catch {}
    }
  }

  updateMusicMute();

  updateGameMusicVolume();

  warmStartMenuMusic();
}

function unlockAudioOnce() {
  if (audioUnlocked) return;

  audioUnlocked = true;

  // Wake up WebAudio (SFX/ambient) and sync mute state

  resumeAudio();

  updateMusicMute();

  // If menu music is warm-started muted, unmute & set proper volume

  if (music.menu) {
    if (gameState === "menu") {
      music.current = music.menu;

      music.menu.muted = false;

      music.menu.volume = MENU_MUSIC_VOLUME;

      // ensure its playing

      music.menu.play().catch(() => {
        /* ignore */
      });
    } else {
      // not on menu, stop any menu playback

      if (!settings.mute) {
        stopMusic();
      }
    }
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

  const attemptPlay = () => {
    stopMusic();

    music.current = music.menu;

    music.menu.currentTime = 0;

    music.menu.volume = MENU_MUSIC_VOLUME;

    music.menu.muted = false;

    const promise = music.menu.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        pendingMenuMusic = true;
      });
    }
  };

  if (!audioUnlocked) {
    pendingMenuMusic = true;

    attemptPlay();

    return;
  }

  pendingMenuMusic = false;

  attemptPlay();
}

function playGameMusic() {
  if (!music.game) return;

  stopAmbientMusic();

  stopMenuMusic();

  if (settings.mute) return;

  const attemptPlay = () => {
    stopMusic();

    music.current = music.game;

    music.game.currentTime = 0;

    updateGameMusicVolume();

    music.game.muted = false;

    const promise = music.game.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  };

  if (!audioUnlocked) {
    pendingMenuMusic = false;

    attemptPlay();

    return;
  }

  pendingMenuMusic = false;

  attemptPlay();
}

function playLevelUpMusic() {
  if (!music.levelUp) return;

  stopAmbientMusic();

  if (settings.mute) return;

  stopMusic();

  music.current = music.levelUp;

  music.levelUp.currentTime = 0;

  music.levelUp.volume = LEVEL_MUSIC_VOLUME;

  music.levelUp.muted = false;

  music.current.play().catch(() => {});
}

function stopLevelUpMusic() {
  if (!music.levelUp) return;

  music.levelUp.pause();

  music.levelUp.currentTime = 0;

  if (music.current === music.levelUp) {
    music.current = null;
  }
}

function stopMenuMusic() {
  if (!music.menu) return;

  music.menu.pause();

  music.menu.currentTime = 0;

  if (music.current === music.menu) {
    music.current = null;
  }
}

function updateMusicMute() {
  const muted = !!settings.mute;

  [music.menu, music.game, music.levelUp].forEach((a) => {
    if (a) a.muted = muted;
  });

  if (muted) {
    stopMusic();
  } else {
    if (music.menu) music.menu.volume = MENU_MUSIC_VOLUME;

    if (music.levelUp) music.levelUp.volume = LEVEL_MUSIC_VOLUME;

    updateGameMusicVolume();
  }
}

function updateGameMusicVolume() {
  if (!music.game) return;

  let target =
    activeBattle && !activeBattle.result
      ? GAME_MUSIC_BATTLE_VOLUME
      : GAME_MUSIC_VOLUME;

  if (shopState.open) {
    target = clamp(target * SHOP_VOLUME_MULTIPLIER, 0, 1);
  }

  music.game.volume = target;
}

function warmStartMenuMusic() {
  if (!music.menu || audioUnlocked) return;

  if (music.current === music.menu && !music.menu.paused) return;

  music.menu.muted = true;

  music.menu.volume = 0;

  music.menu.loop = true;

  music.current = music.menu;

  music.menu.currentTime = 0;

  const playback = music.menu.play();

  if (playback && typeof playback.then === "function") {
    playback

      .then(() => {
        if (!audioUnlocked) {
          pendingMenuMusic = false;

          music.menu.muted = false;

          music.menu.volume = MENU_MUSIC_VOLUME;
        }
      })

      .catch(() => {
        pendingMenuMusic = true;
      });
  } else {
    pendingMenuMusic = true;
  }
}

// === HUD =====================================================================

function updateHUD() {
  if (hud.level) hud.level.textContent = `${level}`;

  if (hud.score) hud.score.textContent = `${score}`;

  if (hud.enemies) hud.enemies.textContent = `${aliveEnemiesCount()}`;

  if (hud.coins) hud.coins.textContent = Number(coins).toLocaleString();

  const playerLevelValue = Math.max(1, Math.floor(playerProgress?.level ?? 1));

  if (hud.playerLevel) hud.playerLevel.textContent = `${playerLevelValue}`;

  const playerXpValue = Math.max(0, Math.floor(playerProgress?.xp ?? 0));

  const xpNext = xpRequiredForNextLevel(playerLevelValue);

  if (hud.playerXp) hud.playerXp.textContent = `${playerXpValue}/${xpNext}`;

  const maxHp = playerProgress?.maxHp ?? PLAYER_BATTLE_HP;

  const currentHp = clamp(playerProgress?.currentHp ?? maxHp, 0, maxHp);

  if (hud.hpText) hud.hpText.textContent = `${currentHp}/${maxHp}`;

  const tileX =
    player.lastTileX ?? Math.floor((player.x + player.w / 2) / TILE_SIZE);

  const tileY =
    player.lastTileY ?? Math.floor((player.y + player.h / 2) / TILE_SIZE);

  if (hud.tileCoords) hud.tileCoords.textContent = `${tileX},${tileY}`;

  if (hud.playerPos)
    hud.playerPos.textContent = `${Math.floor(player.x ?? 0)},${Math.floor(
      player.y ?? 0
    )}`;

  const tileId = tileAt(tileX, tileY);

  if (hud.tileName) hud.tileName.textContent = TILE_INFO[tileId]?.name ?? "?";

  const stepsValue = `${stats.steps}`;

  const timeValue = `${Math.floor(stats.playTimeMs / 1000)}s`;

  if (hud.steps) hud.steps.textContent = stepsValue;

  if (hud.time) hud.time.textContent = timeValue;
}

// === Boot ====================================================================

async function init() {
  canvas = document.getElementById("game");

  ctx = canvas.getContext("2d");

  if (ctx) ctx.imageSmoothingEnabled = false;

  setupMusic();

  window.addEventListener("pointerdown", unlockAudioOnce, { once: true });

  window.addEventListener("keydown", unlockAudioOnce, { once: true });

  minimapCanvas = document.createElement("canvas");

  minimapCanvas.width = MINIMAP_W;

  minimapCanvas.height = MINIMAP_H;

  minimapCtx = minimapCanvas.getContext("2d");

  if (minimapCtx) minimapCtx.imageSmoothingEnabled = false;

  hud.world = document.getElementById("worldName");

  hud.steps = document.getElementById("steps");

  hud.time = document.getElementById("time");

  hud.msg = document.getElementById("hud-msg");

  hud.btnMute = document.getElementById("btnMute");

  hud.btnMuteIcon = hud.btnMute?.querySelector("i");
  hud.btnMuteLabel = hud.btnMute?.querySelector("span");

  hud.level = document.getElementById("level");

  hud.playerLevel = document.getElementById("playerLevel");

  hud.score = document.getElementById("score");

  hud.enemies = document.getElementById("enemies");

  hud.playerXp = document.getElementById("playerXp");

  hud.hpText = document.getElementById("hudHpText");
  if (hud.hpText)
    hud.hpText.textContent = `${PLAYER_BATTLE_HP}/${PLAYER_BATTLE_HP}`;

  hud.tileCoords = document.getElementById("txy");

  hud.playerPos = document.getElementById("pxy");

  hud.tileName = document.getElementById("tileName");

  if (hud.tileCoords) hud.tileCoords.textContent = "0,0";

  if (hud.playerPos) hud.playerPos.textContent = "0,0";

  if (hud.tileName) hud.tileName.textContent = "--";

  if (hud.world) hud.world.textContent = "--";

  hud.seed = document.getElementById("worldSeed");

  if (hud.seed) hud.seed.textContent = "--";

  hud.coins = document.getElementById("coins");

  menu.root = document.getElementById("menu");

  menu.seedInput = document.getElementById("menuSeed");

  menu.startRandom = document.getElementById("btnMenuStartRandom");

  menu.startSeed = document.getElementById("btnMenuStartSeed");

  menu.continue = document.getElementById("btnMenuContinue");

  menu.msg = document.getElementById("menuMsg");

  menu.tabs = Array.from(document.querySelectorAll(".menu-tab"));
  menu.panes = Array.from(document.querySelectorAll(".menu-pane"));
  menu.soundLabel = document.getElementById("menuSoundLabel");
  menu.minimapLabel = document.getElementById("menuMinimapLabel");
  menu.toggleMute = document.getElementById("btnMenuToggleMute");
  menu.toggleMinimap = document.getElementById("btnMenuToggleMinimap");
  menu.deleteSave = document.getElementById("btnMenuDeleteSave");

  menu.tabs.forEach((tab) =>
    tab.addEventListener("click", () =>
      switchMenuTab(tab.dataset.tab || "play")
    )
  );
  menu.activeTab = menu.activeTab || "play";

  menu.toggleMute?.addEventListener("click", toggleMute);

  menu.toggleMinimap?.addEventListener("click", () => toggleMinimapOverlay());

  menu.deleteSave?.addEventListener("click", deleteSaveData);

  updateMenuSoundLabel();
  updateMenuMinimapLabel();

  levelUpUI.root = document.getElementById("levelUp");

  levelUpUI.msg = document.getElementById("levelUpMsg");

  levelUpUI.next = document.getElementById("btnLevelNext");

  levelUpUI.next?.addEventListener("click", proceedToNextLevel);

  battleUI.root = document.getElementById("battle");

  battleUI.msg = document.getElementById("battleMsg");

  battleUI.playerSprite = document.getElementById("battlePlayerSprite");

  battleUI.enemySprite = document.getElementById("battleEnemySprite");

  battleUI.playerHP = document.getElementById("battlePlayerHP");

  battleUI.enemyHP = document.getElementById("battleEnemyHP");

  battleUI.buttons = Array.from(document.querySelectorAll(".battle-btn"));

  battleUI.continue = document.getElementById("battleContinue");

  battleUI.buttons.forEach((btn, idx) => {
    btn.addEventListener("click", () => handleBattleMove(idx));
  });

  refreshBattleMoves();

  battleUI.continue?.addEventListener("click", handleBattleContinue);

  shopUI.root = document.getElementById("shop");

  shopUI.message = document.getElementById("shopMessage");

  shopUI.healBtn = document.getElementById("shopHealBtn");

  shopUI.healStatus = document.getElementById("shopHealStatus");

  shopUI.merchantImg = document.getElementById("shopMerchantImg");

  shopUI.playerHp = document.getElementById("shopPlayerHP");

  shopUI.potionBtn = document.getElementById("shopPotionBtn");

  shopUI.potionCount = document.getElementById("shopPotionCount");

  shopUI.skillList = document.getElementById("shopSkillList");

  shopUI.close = document.getElementById("shopClose");

  shopUI.healBtn?.addEventListener("click", handleShopHeal);

  shopUI.potionBtn?.addEventListener("click", handleShopPotionBuy);

  shopUI.close?.addEventListener("click", closeMerchantShop);

  shopUI.skillList?.addEventListener("click", handleShopSkillClick);

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
    if (gameState === "battle" && activeBattle && !activeBattle.result) {
      pauseBattleToMenu();

      updateMenuButtons();

      return;
    }

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
    if (pendingLevelConfig) {
      setMenuMessage("");

      proceedToNextLevel();

      return;
    }

    if (battlePaused && activeBattle && !activeBattle.result) {
      setMenuMessage("");

      enterGame();

      return;
    }

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

      savedSnapshot.playerProgress = clonePlayerProgress(
        loaded.playerProgress ?? createInitialPlayerProgress()
      );

      savedSnapshot.merchant = loaded.merchant
        ? {
            ...loaded.merchant,

            skillIds: Array.isArray(loaded.merchant.skillIds)
              ? [...loaded.merchant.skillIds]
              : [],
          }
        : null;

      savedSnapshot.nextMerchantLevel =
        typeof loaded.nextMerchantLevel === "number"
          ? loaded.nextMerchantLevel
          : 0;

      settings = { mute: false, ...savedSnapshot.settings };
      if (settings.showMinimap === undefined) settings.showMinimap = true;

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
      settings.showMinimap = true;

      stats = { steps: 0, playTimeMs: 0 };

      if (hud.world) hud.world.textContent = "--";

      if (hud.seed) hud.seed.textContent = "--";

      initialMenuMessage = "Save was corrupted. Start a new island.";
    }
  } else {
    savedSnapshot = null;

    settings = { mute: false };
    settings.showMinimap = true;

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

function flash(text, duration = 1200) {
  if (hud.msg) hud.msg.textContent = text || "";

  clearTimeout(flash._t);

  flash._t = setTimeout(() => {
    if (hud.msg) hud.msg.textContent = "";
  }, duration);
}

window.addEventListener("load", init);
