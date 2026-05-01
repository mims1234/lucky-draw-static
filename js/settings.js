// ============================================================
//  settings.js — Prize CRUD and storage reset
// ============================================================

function addPrize() {
  state.prizes.push({
    name: "New Prize",
    rarity: "Common",
    color: "#ff5a1f",
    fontColor: "#000000",
    quantity: 1,
    mediaUrl: "",
    mediaType: "image",
  });
  shuffleAndAssignPrizes();
  saveState();
  renderPrizeList();
  renderPrizeImages();
}

function updatePrize(index, field, value) {
  if (field === "mediaUrl") {
    state.prizes[index].mediaType = detectMediaType(value);
  }
  state.prizes[index][field] = value;
  shuffleAndAssignPrizes();
  saveState();
  renderBoxes(false);
  renderPrizeImages();
  renderPrizeList(); // Re-render list to update badges
}

function updateNoPrize(field, value) {
  if (field === "mediaUrl") {
    // If URL is empty, set to none, otherwise detect type
    state.noPrize.mediaType = value ? detectMediaType(value) : "none";
  }
  state.noPrize[field] = value;
  shuffleAndAssignPrizes();
  saveState();
  renderBoxes(false);
  renderPrizeImages();
  renderNoPrizeSettings(); // Re-render to update badge
}

function updateAnimationHighlightColor(value) {
  state.animationHighlightColor = value;
  saveState();
  // Update CSS variable for highlighting
  document.documentElement.style.setProperty("--anim-highlight", value);
  renderAnimationSettings();
}

function deletePrize(index) {
  if (index >= 0 && index < state.prizes.length) {
    state.prizes.splice(index, 1);
    shuffleAndAssignPrizes();
    saveState();
    renderPrizeList();
    renderBoxes(false);
    renderPrizeImages();
  }
}

function clearLocalStorage() {
  try {
    localStorage.removeItem("luckyDrawState");
    state = {
      prizes: deepCopyDefaultPrizes(),
      noPrize: {
        name: "No Prize",
        rarity: "Common",
        color: "#333333",
        fontColor: "#FFFFFF",
        mediaUrl: "",
        mediaType: "none",
      },
      animationHighlightColor: "#ff5a1f",
      boxCount: 25,
      isAnimating: false,
      disabledBoxes: new Set(),
      prizeAssignments: new Array(25),
      revealedBoxes: new Set(),
    };
    shuffleAndAssignPrizes();
    saveState();
    renderPrizeList();
    renderNoPrizeSettings();
    renderAnimationSettings();
    renderBoxes(false);
    renderPrizeImages();
    // Reset animation highlight CSS variable only
    document.documentElement.style.setProperty("--anim-highlight", "#ff5a1f");
    showToast("Reset to default state.");
  } catch (err) {
    console.error("Reset error:", err);
    showToast("Error resetting state. Please try again.", true);
  }
}

// ── Toast notification (replaces alert) ──────────────────────

function showToast(message, isError = false) {
  const existing = document.getElementById("sd-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "sd-toast";
  toast.className = `sd-toast${isError ? " sd-toast--error" : ""}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add("sd-toast--visible"));

  setTimeout(() => {
    toast.classList.remove("sd-toast--visible");
    setTimeout(() => toast.remove(), 400);
  }, 2800);
}
