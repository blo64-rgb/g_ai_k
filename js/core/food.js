import { COLORS, FOOD_SCORES, FOOD_TYPES, SPECIAL_FOOD_CHANCES } from "../config/constants.js";

export function rollFoodType() {
  const r = Math.random();
  if (r < SPECIAL_FOOD_CHANCES[FOOD_TYPES.DIAMOND]) return FOOD_TYPES.DIAMOND;
  if (r < SPECIAL_FOOD_CHANCES[FOOD_TYPES.DIAMOND] + SPECIAL_FOOD_CHANCES[FOOD_TYPES.CHERRY]) return FOOD_TYPES.CHERRY;
  if (
    r <
    SPECIAL_FOOD_CHANCES[FOOD_TYPES.DIAMOND] +
      SPECIAL_FOOD_CHANCES[FOOD_TYPES.CHERRY] +
      SPECIAL_FOOD_CHANCES[FOOD_TYPES.BANANA]
  ) {
    return FOOD_TYPES.BANANA;
  }
  return FOOD_TYPES.APPLE;
}

export function randomFoodPosition(gridSize, snakeSegments) {
  let position = null;
  do {
    position = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snakeSegments.some((s) => s.x === position.x && s.y === position.y));
  return position;
}

export function createFood(gridSize, snakeSegments) {
  const type = rollFoodType();
  return {
    ...randomFoodPosition(gridSize, snakeSegments),
    type,
    score: FOOD_SCORES[type],
    color: COLORS[type],
  };
}
