export const GRID_SIZE = 20;
export const MAX_LEVEL = 100;
export const LEVEL_UP_EVERY = 5;

export const BASE_SPEED_MS = 230;
export const SPEED_STEP_MS = 2;
export const MIN_SPEED_MS = 50;

export const COLORS = {
  snake: "#00ffcc",
  snakeHead: "#5ffff0",
  apple: "#00ffcc",
  banana: "#ffe066",
  cherry: "#ff3b81",
  diamond: "#70d6ff",
};

export const FOOD_TYPES = {
  APPLE: "apple",
  BANANA: "banana",
  CHERRY: "cherry",
  DIAMOND: "diamond",
};

export const FOOD_SCORES = {
  [FOOD_TYPES.APPLE]: 1,
  [FOOD_TYPES.BANANA]: 2,
  [FOOD_TYPES.CHERRY]: 3,
  [FOOD_TYPES.DIAMOND]: 10,
};

export const SPECIAL_FOOD_CHANCES = {
  [FOOD_TYPES.BANANA]: 0.15,
  [FOOD_TYPES.CHERRY]: 0.05,
  [FOOD_TYPES.DIAMOND]: 0.02,
};

export const STORAGE_KEYS = {
  levelState: "snake.levelState",
  sessionCheckpoint: "snake.sessionCheckpoint",
};

// --- Shop and exchange config ---
export const SKIN_PRICE = 1000;

export const SNAKE_SKINS = {
  neon: { id: "neon", name: "Neon", body: "#00ffcc", head: "#5ffff0", eye: "#f2feff" },
  plasma: { id: "plasma", name: "Plasma", body: "#b388ff", head: "#d6b3ff", eye: "#ffffff" },
  ember: { id: "ember", name: "Ember", body: "#ff7a18", head: "#ffb067", eye: "#fff4e6" },
  frost: { id: "frost", name: "Frost", body: "#70d6ff", head: "#b5ecff", eye: "#f8ffff" },
};

// Exchange ratio based on original reward value:
// 1 banana = 2 points, 1 cherry = 3 points, 1 diamond = 10 points.
export const EXCHANGE_RATES = {
  banana: 2,
  cherry: 3,
  diamond: 10,
};
