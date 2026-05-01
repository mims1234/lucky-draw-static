// ============================================================
//  main.js — Entry point: wire buttons, init, starfield
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // ── Wire up buttons ──────────────────────────────────────
  document.getElementById("btnResetGame").addEventListener("click", resetGame);
  document
    .getElementById("btnStartAnimation")
    .addEventListener("click", startAnimation);
  document
    .getElementById("btnShuffleBoxes")
    .addEventListener("click", shuffleBoxes);
  document.getElementById("btnAddPrize").addEventListener("click", addPrize);
  document
    .getElementById("btnResetStorage")
    .addEventListener("click", clearLocalStorage);

  // ── Init modules ─────────────────────────────────────────
  initNavigation();
  loadState();

  // Apply saved animation highlight color (only affects final selection pulse)
  document.documentElement.style.setProperty(
    "--anim-highlight",
    state.animationHighlightColor,
  );

  // ── Starfield canvas ─────────────────────────────────────
  initStarfield();
});

// ── Starfield ────────────────────────────────────────────────

function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const STAR_COUNT = 120;
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        speed: Math.random() * 0.3 + 0.05,
        opacity: Math.random() * 0.6 + 0.2,
        // occasional subtle twinkle offset
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    stars.forEach((star) => {
      // Subtle ember pulse
      const twinkle = 0.8 + 0.2 * Math.sin(frame * 0.025 + star.twinkleOffset);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 128, 48, ${star.opacity * twinkle})`;
      ctx.fill();

      // Heat embers drift upward
      star.y -= star.speed;
      star.x += Math.sin(frame * 0.01 + star.twinkleOffset) * 0.12;
      if (star.y < 0) {
        star.y = canvas.height;
        star.x = Math.random() * canvas.width;
      }
    });

    requestAnimationFrame(draw);
  }

  resize();
  createStars();
  draw();

  window.addEventListener("resize", () => {
    resize();
    createStars();
  });
}
