import { BASE_SPEED_MS } from "./config/constants.js";
import { Game } from "./core/game.js";
import { loadLevelState, loadSessionCheckpoint } from "./services/storage.js";
import { bindControls } from "./ui/controls.js";
import { UI } from "./ui/ui.js";

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const canvas = document.getElementById("gameCanvas");
const ui = new UI();
const game = new Game(canvas, ui);
let shopOpen = false;

const savedLevelState = loadLevelState();
const sessionCheckpoint = loadSessionCheckpoint();
const initialSeed = sessionCheckpoint ||
  (savedLevelState
    ? {
        level: savedLevelState.level,
        score: savedLevelState.score,
        speedMs: savedLevelState.speedMs,
        selectedSkin: savedLevelState.selectedSkin,
        unlockedSkins: savedLevelState.unlockedSkins,
        counters: savedLevelState.counters,
      }
    : {
        level: 1,
        score: 0,
        speedMs: BASE_SPEED_MS,
        selectedSkin: "neon",
        unlockedSkins: ["neon"],
        counters: { banana: 0, cherry: 0, diamond: 0 },
      });

ui.init(savedLevelState, () => {
  game.start(initialSeed);
});

bindControls({
  onDirection: (d) => game.setDirection(d),
  onPause: () => game.togglePause(),
  onRestart: () => game.restartFromCheckpoint(),
  onResetProgress: () => game.resetAllProgress(),
  onToggleShop: () => {
    shopOpen = !shopOpen;
    ui.toggleShop(shopOpen);
  },
  onCloseShop: () => {
    shopOpen = false;
    ui.toggleShop(false);
  },
  onBuySkin: (skinId) => game.buyOrSelectSkin(skinId),
  onExchange: (type) => game.exchangeCollectible(type),
});

window.addEventListener("resize", () => game.updateCanvasSize());
