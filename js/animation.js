// ============================================================
//  animation.js — Draw animation and shuffle visual effect
// ============================================================

async function startAnimation() {
  if (state.isAnimating) return;
  state.isAnimating = true;

  const boxes = Array.from(document.querySelectorAll(".box"));
  const enabledBoxes = boxes.filter((box) => {
    const idx = parseInt(box.dataset.index);
    return !state.disabledBoxes.has(idx) && !state.revealedBoxes.has(idx);
  });

  if (enabledBoxes.length === 0) {
    state.isAnimating = false;
    return;
  }

  let speed = 50;
  const duration = 2000;
  const startTime = Date.now();
  let lastHighlighted = null;

  while (Date.now() - startTime < duration) {
    // Remove highlight from all boxes
    boxes.forEach((b) => {
      b.classList.remove("highlight");
      b.classList.remove("custom-highlight");
    });

    const pick = enabledBoxes[Math.floor(Math.random() * enabledBoxes.length)];
    // Add standard highlight class for the fast movement
    pick.classList.add("highlight");
    lastHighlighted = pick;

    speed = Math.min(300, speed * 1.1);
    await new Promise((resolve) => setTimeout(resolve, speed));
  }

  if (lastHighlighted) {
    // Remove standard highlight and add custom-highlight for the final blink
    lastHighlighted.classList.remove("highlight");
    lastHighlighted.classList.add("custom-highlight");
    lastHighlighted.classList.add("final-select");
    state.isAnimating = false;

    // Wait for the box to be clicked, then clean up classes
    const cleanup = () => {
      lastHighlighted.classList.remove("final-select");
      lastHighlighted.classList.remove("custom-highlight");
      lastHighlighted.removeEventListener("click", cleanup);
    };
    lastHighlighted.addEventListener("click", cleanup);
  } else {
    state.isAnimating = false;
  }
}

function shuffleBoxes() {
  shuffleAndAssignPrizes();

  const boxes = document.querySelectorAll(".box");
  boxes.forEach((box) => {
    const idx = parseInt(box.dataset.index);
    if (!state.disabledBoxes.has(idx)) {
      box.classList.add("shuffle-animation");
      setTimeout(() => box.classList.remove("shuffle-animation"), 500);
    }
  });

  setTimeout(() => renderBoxes(false), 500);
  saveState();
}

function toggleBox(index) {
  if (state.disabledBoxes.has(index)) {
    state.disabledBoxes.delete(index);
  } else {
    state.disabledBoxes.add(index);
  }
  saveState();
  renderBoxes(false);
}

function resetGame() {
  state.disabledBoxes.clear();
  state.revealedBoxes.clear();
  shuffleAndAssignPrizes();
  saveState();
  renderBoxes(false);
}
