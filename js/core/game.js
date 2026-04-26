import {
  BASE_SPEED_MS,
  COLORS,
  GRID_SIZE,
  LEVEL_UP_EVERY,
  MAX_LEVEL,
  MIN_SPEED_MS,
  SPEED_STEP_MS,
} from "../config/constants.js";
import { createFood } from "./food.js";
import { Snake } from "./snake.js";
import { clearAllProgress, saveLevelState, saveSessionCheckpoint } from "../services/storage.js";

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
      counters: {
        banana: seed.counters?.banana ?? 0,
        cherry: seed.counters?.cherry ?? 0,
        diamond: seed.counters?.diamond ?? 0,
      },
    };
    this.levelStartSnapshot = cloneState(this.state);
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
    requestAnimationFrame((t) => this.loop(t));
  }

  restartFromCheckpoint() {
    this.start(this.levelStartSnapshot);
  }

  resetAllProgress() {
    clearAllProgress();
    this.start({ level: 1, score: 0, speedMs: BASE_SPEED_MS, counters: { banana: 0, cherry: 0, diamond: 0 } });
  }

  setDirection(direction) {
    if (!this.gameOver) this.snake.setDirection(direction);
  }

  togglePause() {
    if (this.gameOver) return;
    this.paused = !this.paused;
    this.ui.togglePauseLabel(this.paused);
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
    this.ui.updateStats(this.state);
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
      saveSessionCheckpoint(this.levelStartSnapshot);
    }
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
    this.ctx.save();
    this.ctx.fillStyle = this.food.color;
    this.ctx.shadowBlur = 18;
    this.ctx.shadowColor = this.food.color;
    this.ctx.fillRect(this.food.x * this.cellSize, this.food.y * this.cellSize, this.cellSize, this.cellSize);
    this.ctx.restore();
  }

  drawSnake() {
    this.snake.segments.forEach((segment, index) => {
      const isHead = index === 0;
      this.ctx.save();
      this.ctx.fillStyle = isHead ? COLORS.snakeHead : COLORS.snake;
      this.ctx.shadowBlur = 16;
      this.ctx.shadowColor = COLORS.snake;
      this.ctx.fillRect(segment.x * this.cellSize, segment.y * this.cellSize, this.cellSize, this.cellSize);
      this.ctx.restore();
    });
  }
}
