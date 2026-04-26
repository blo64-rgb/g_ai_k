const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function bindControls({ onDirection, onPause, onRestart, onResetProgress }) {
  document.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.direction;
      onDirection(DIRECTIONS[key]);
    });
  });

  document.getElementById("pauseBtn").addEventListener("click", onPause);
  document.getElementById("restartBtn").addEventListener("click", onRestart);
  document.getElementById("overlayRestartBtn").addEventListener("click", onRestart);
  document.getElementById("resetProgressBtn").addEventListener("click", onResetProgress);

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
