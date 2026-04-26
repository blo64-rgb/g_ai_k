export class UI {
  constructor() {
    // --- Stats elements ---
    this.scoreValue = document.getElementById("scoreValue");
    this.levelValue = document.getElementById("levelValue");
    this.speedValue = document.getElementById("speedValue");
    this.bananaValue = document.getElementById("bananaValue");
    this.cherryValue = document.getElementById("cherryValue");
    this.diamondValue = document.getElementById("diamondValue");

    // --- Overlay and action elements ---
    this.gameOverOverlay = document.getElementById("gameOverOverlay");
    this.gameOverText = document.getElementById("gameOverText");
    this.pauseBtn = document.getElementById("pauseBtn");

    // --- Shop drawer elements ---
    this.shopDrawer = document.getElementById("shopDrawer");
  }

  init(savedState, onLoad) {
    onLoad(savedState);
  }

  updateStats(state) {
    this.scoreValue.textContent = String(state.score);
    this.levelValue.textContent = `${state.level}/100`;
    this.speedValue.textContent = `${Math.round(1000 / state.speedMs)} т/с`;
    this.bananaValue.textContent = String(state.counters.banana);
    this.cherryValue.textContent = String(state.counters.cherry);
    this.diamondValue.textContent = String(state.counters.diamond);
  }

  togglePauseLabel(paused) {
    this.pauseBtn.textContent = paused ? "▶" : "⏸";
  }

  showGameOver(state) {
    this.gameOverText.textContent = `Уровень ${state.level}, очки ${state.score}`;
    this.gameOverOverlay.classList.remove("hidden");
  }

  hideGameOver() {
    this.gameOverOverlay.classList.add("hidden");
  }

  toggleShop(open) {
    this.shopDrawer.classList.toggle("hidden", !open);
  }

  renderSkins({ unlockedSkins, selectedSkin, score }) {
    document.querySelectorAll("[data-skin-id]").forEach((button) => {
      const skinId = button.dataset.skinId;
      const owned = unlockedSkins.includes(skinId);
      const active = selectedSkin === skinId;
      button.classList.toggle("owned", owned);
      button.classList.toggle("active", active);
      button.textContent = owned ? `${skinId} ${active ? "✓" : ""}` : `${skinId} (1000 🪙)`;
      button.disabled = !owned && score < 1000;
    });
  }
}
