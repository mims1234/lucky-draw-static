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

  // Apply saved animation color
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

  const STAR_COUNT = 140;
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
      // Subtle twinkle
      const twinkle = 0.85 + 0.15 * Math.sin(frame * 0.02 + star.twinkleOffset);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 220, 255, ${star.opacity * twinkle})`;
      ctx.fill();

      // Drift downward
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
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
