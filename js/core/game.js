import {
  BASE_SPEED_MS,
  EXCHANGE_RATES,
  GRID_SIZE,
  LEVEL_UP_EVERY,
  MAX_LEVEL,
  MIN_SPEED_MS,
  SNAKE_SKINS,
  SPEED_STEP_MS,
} from "../config/constants.js";
import { createFood } from "./food.js";
import { Snake } from "./snake.js";
import { clearAllProgress, saveLevelState, saveSessionCheckpoint } from "../services/storage.js";

const FOOD_ICONS = {
  apple: "🍎",
  banana: "🍌",
  cherry: "🍒",
  diamond: "💎",
};

function cloneState(state) {
  if (typeof structuredClone === "function") return structuredClone(state);
  return JSON.parse(JSON.stringify(state));
}

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ui = ui;
    this.gridSize = GRID_SIZE;
    this.cellSize = 0;
    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.lastTick = 0;
    this.accumulator = 0;
  }

  setupInitialState(seed = {}) {
    const start = Math.floor(this.gridSize / 2);
    this.snake = new Snake(start, start);
    this.food = createFood(this.gridSize, this.snake.segments);
    this.state = {
      score: seed.score ?? 0,
      level: seed.level ?? 1,
      speedMs: seed.speedMs ?? BASE_SPEED_MS,
      selectedSkin: seed.selectedSkin ?? "neon",
      unlockedSkins: seed.unlockedSkins ?? ["neon"],
      counters: {
        banana: seed.counters?.banana ?? 0,
        cherry: seed.counters?.cherry ?? 0,
        diamond: seed.counters?.diamond ?? 0,
      },
    };
    this.levelStartSnapshot = cloneState(this.state);
    this.resumeSnapshot = cloneState(this.state);
    this.currentSkin = SNAKE_SKINS[this.state.selectedSkin] ?? SNAKE_SKINS.neon;
  }

  start(seed) {
    this.setupInitialState(seed);
    this.running = true;
    this.paused = false;
    this.gameOver = false;
    this.ui.hideGameOver();
    this.ui.togglePauseLabel(false);
    this.updateCanvasSize();
    this.ui.updateStats(this.state);
    this.ui.renderSkins(this.state);
    this.persistProgress();
    requestAnimationFrame((t) => this.loop(t));
  }

  restartFromCheckpoint() {
    this.start(this.resumeSnapshot);
  }

  resetAllProgress() {
    clearAllProgress();
    this.start({
      level: 1,
      score: 0,
      speedMs: BASE_SPEED_MS,
      selectedSkin: "neon",
      unlockedSkins: ["neon"],
      counters: { banana: 0, cherry: 0, diamond: 0 },
    });
  }

  setDirection(direction) {
    if (!this.gameOver) this.snake.setDirection(direction);
  }

  togglePause() {
    if (this.gameOver) return;
    this.paused = !this.paused;
    this.ui.togglePauseLabel(this.paused);
  }

  buyOrSelectSkin(skinId) {
    if (!SNAKE_SKINS[skinId]) return;
    const owned = this.state.unlockedSkins.includes(skinId);
    if (!owned) {
      if (this.state.score < 1000) return;
      this.state.score -= 1000;
      this.state.unlockedSkins.push(skinId);
    }
    this.state.selectedSkin = skinId;
    this.currentSkin = SNAKE_SKINS[skinId];
    this.persistProgress();
    this.ui.updateStats(this.state);
    this.ui.renderSkins(this.state);
  }

  exchangeCollectible(type) {
    const currentAmount = this.state.counters[type];
    const rate = EXCHANGE_RATES[type];
    if (!currentAmount || !rate) return;
    this.state.counters[type] = 0;
    this.state.score += currentAmount * rate;
    this.updateLevelByScore();
    this.persistProgress();
    this.ui.updateStats(this.state);
    this.ui.renderSkins(this.state);
  }

  updateCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const fallbackSide = Math.min(window.innerWidth - 24, window.innerHeight - 240);
    const rawSide = Math.min(rect.width, rect.height);
    const side = Math.max(220, Math.floor(rawSide || fallbackSide || 320));
    this.canvas.width = side;
    this.canvas.height = side;
    this.cellSize = side / this.gridSize;
  }

  loop(timestamp) {
    if (!this.running) return;
    if (!this.lastTick) this.lastTick = timestamp;
    const delta = timestamp - this.lastTick;
    this.lastTick = timestamp;

    if (!this.paused && !this.gameOver) {
      this.accumulator += delta;
      while (this.accumulator >= this.state.speedMs) {
        this.accumulator -= this.state.speedMs;
        this.tick();
      }
    }

    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }

  tick() {
    this.snake.move();
    const head = this.snake.getHead();

    if (this.hasWallCollision(head) || this.snake.hitsSelf()) {
      this.gameOver = true;
      this.persistProgress();
      this.ui.showGameOver(this.state);
      return;
    }

    if (head.x === this.food.x && head.y === this.food.y) {
      this.handleEatFood();
    }
  }

  handleEatFood() {
    this.state.score += this.food.score;
    if (this.food.type === "banana") this.state.counters.banana += 1;
    if (this.food.type === "cherry") this.state.counters.cherry += 1;
    if (this.food.type === "diamond") this.state.counters.diamond += 1;
    this.snake.grow(1);
    this.food = createFood(this.gridSize, this.snake.segments);
    this.updateLevelByScore();
    this.persistProgress();
    this.ui.updateStats(this.state);
    this.ui.renderSkins(this.state);
  }

  updateLevelByScore() {
    const targetLevel = Math.min(MAX_LEVEL, Math.floor(this.state.score / LEVEL_UP_EVERY) + 1);
    if (targetLevel > this.state.level) {
      this.state.level = targetLevel;
      this.state.speedMs = Math.max(MIN_SPEED_MS, BASE_SPEED_MS - (this.state.level - 1) * SPEED_STEP_MS);
      saveLevelState({
        level: this.state.level,
        speedMs: this.state.speedMs,
        score: this.state.score,
        counters: this.state.counters,
      });
      this.levelStartSnapshot = cloneState(this.state);
    }
  }

  persistProgress() {
    this.resumeSnapshot = cloneState(this.state);
    saveLevelState(this.resumeSnapshot);
    saveSessionCheckpoint(this.resumeSnapshot);
  }

  hasWallCollision(head) {
    return head.x < 0 || head.y < 0 || head.x >= this.gridSize || head.y >= this.gridSize;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawFood();
    this.drawSnake();
  }

  drawGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(255,255,255,0.05)";
    this.ctx.lineWidth = 1;
    for (let i = 1; i < this.gridSize; i += 1) {
      const p = i * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(p, 0);
      this.ctx.lineTo(p, this.canvas.height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, p);
      this.ctx.lineTo(this.canvas.width, p);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawFood() {
    const icon = FOOD_ICONS[this.food.type] || "🍎";
    const centerX = this.food.x * this.cellSize + this.cellSize / 2;
    const centerY = this.food.y * this.cellSize + this.cellSize / 2;
    const fontSize = Math.floor(this.cellSize * 0.9);

    this.ctx.save();
    this.ctx.shadowBlur = 18;
    this.ctx.shadowColor = this.food.color;
    this.ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(icon, centerX, centerY);
    this.ctx.restore();
  }

  drawSnake() {
    this.snake.segments.forEach((segment, index) => {
      const isHead = index === 0;
      this.ctx.save();
      this.ctx.fillStyle = isHead ? this.currentSkin.head : this.currentSkin.body;
      this.ctx.shadowBlur = 16;
      this.ctx.shadowColor = this.currentSkin.body;
      this.ctx.fillRect(segment.x * this.cellSize, segment.y * this.cellSize, this.cellSize, this.cellSize);
      this.ctx.restore();
      if (isHead) this.drawSnakeHeadDetails(segment);
    });
  }

  drawSnakeHeadDetails(segment) {
    const x = segment.x * this.cellSize;
    const y = segment.y * this.cellSize;
    const size = this.cellSize;
    const eyeRadius = Math.max(1.6, size * 0.09);
    const pupilRadius = Math.max(1, size * 0.045);
    const dir = this.snake.direction;

    const forward = { x: dir.x || 0, y: dir.y || 0 };
    const side = { x: -forward.y, y: forward.x };
    const centerX = x + size / 2 + forward.x * size * 0.16;
    const centerY = y + size / 2 + forward.y * size * 0.16;

    const eye1 = {
      x: centerX + side.x * size * 0.18,
      y: centerY + side.y * size * 0.18,
    };
    const eye2 = {
      x: centerX - side.x * size * 0.18,
      y: centerY - side.y * size * 0.18,
    };

    this.ctx.save();
    this.ctx.fillStyle = this.currentSkin.eye;
    this.ctx.shadowBlur = 6;
    this.ctx.shadowColor = "#b7ffff";
    this.ctx.beginPath();
    this.ctx.arc(eye1.x, eye1.y, eyeRadius, 0, Math.PI * 2);
    this.ctx.arc(eye2.x, eye2.y, eyeRadius, 0, Math.PI * 2);
    this.ctx.fill();

    const pupilOffsetX = forward.x * eyeRadius * 0.45;
    const pupilOffsetY = forward.y * eyeRadius * 0.45;
    this.ctx.fillStyle = "#0f0f1a";
    this.ctx.beginPath();
    this.ctx.arc(eye1.x + pupilOffsetX, eye1.y + pupilOffsetY, pupilRadius, 0, Math.PI * 2);
    this.ctx.arc(eye2.x + pupilOffsetX, eye2.y + pupilOffsetY, pupilRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
}
