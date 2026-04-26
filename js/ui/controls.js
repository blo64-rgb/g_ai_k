const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function bindControls({
  onDirection,
  onPause,
  onRestart,
  onResetProgress,
  onToggleShop,
  onCloseShop,
  onBuySkin,
  onExchange,
  onSwitchTab,
}) {
  // --- Direction controls ---
  document.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.direction;
      onDirection(DIRECTIONS[key]);
    });
  });

  // --- Main action controls ---
  document.getElementById("pauseBtn").addEventListener("click", onPause);
  document.getElementById("restartBtn").addEventListener("click", onRestart);
  document.getElementById("overlayRestartBtn").addEventListener("click", onRestart);
  document.getElementById("resetProgressBtn").addEventListener("click", onResetProgress);

  // --- Shop drawer controls ---
  document.getElementById("shopToggleBtn").addEventListener("click", onToggleShop);
  document.getElementById("shopCloseBtn").addEventListener("click", onCloseShop);
  document.querySelectorAll("[data-skin-id]").forEach((button) => {
    button.addEventListener("click", () => onBuySkin(button.dataset.skinId));
  });
  document.querySelectorAll("[data-exchange]").forEach((button) => {
    button.addEventListener("click", () => onExchange(button.dataset.exchange));
  });
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => onSwitchTab(button.dataset.tab));
  });

  // --- Keyboard support ---
  window.addEventListener("keydown", (event) => {
    const map = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    const key = map[event.key];
    if (key) {
      event.preventDefault();
      onDirection(DIRECTIONS[key]);
    }
    if (event.code === "Space") {
      event.preventDefault();
      onPause();
    }
  });
}
