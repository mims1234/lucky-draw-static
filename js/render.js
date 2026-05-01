// ============================================================
//  render.js — All DOM rendering functions
// ============================================================

// ── Media helper ─────────────────────────────────────────────

function buildMediaElement(prize) {
  if (!prize || !prize.mediaUrl || prize.mediaType === "none") return "";
  if (prize.mediaType === "video") {
    return `<video src="${prize.mediaUrl}" autoplay loop muted playsinline crossorigin="anonymous"></video>`;
  }
  const fallbackSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%23111e35'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%237a9cc4' font-size='12'>${encodeURIComponent(prize.name || "Prize")}</text></svg>`;
  return `<img src="${prize.mediaUrl}" alt="${prize.name || "Prize"}" crossorigin="anonymous" onerror="this.onerror=null;this.src='${fallbackSvg}';">`;
}

// ── Boxes ────────────────────────────────────────────────────

function renderBoxes(shouldShuffle = true) {
  if (shouldShuffle) shuffleAndAssignPrizes();

  const container = document.getElementById("boxesContainer");
  container.innerHTML = "";

  for (let i = 0; i < state.boxCount; i++) {
    const prize = state.prizeAssignments[i];
    const isDisabled = state.disabledBoxes.has(i);
    const isRevealed = state.revealedBoxes.has(i);

    // Wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "box-wrapper";

    // Box
    const box = document.createElement("div");
    box.className = "box";
    box.dataset.index = i;
    if (isDisabled) box.classList.add("disabled");

    if (isRevealed) {
      box.classList.add("revealed");
      box.dataset.rarity = prize.rarity;
      box.style.setProperty("--prize-color", prize.color);
      box.style.backgroundColor = prize.color;

      if (prize.mediaType === "none" || !prize.mediaUrl) {
        box.classList.add("text-only");
        box.innerHTML = `<div class="box-title" style="color:${prize.fontColor}">${prize.name}</div>`;
      } else {
        box.innerHTML = `
                    <div class="box-media">${buildMediaElement(prize)}</div>
                    <div class="box-title" style="color:${prize.fontColor}">${prize.name}</div>
                `;
      }
    } else {
      box.innerHTML = `<span class="box-question">?</span>`;
    }

    // Click to reveal
    box.addEventListener("click", function () {
      const idx = parseInt(this.dataset.index);
      if (
        state.revealedBoxes.has(idx) ||
        state.isAnimating ||
        state.disabledBoxes.has(idx)
      )
        return;

      const p = state.prizeAssignments[idx];
      this.classList.add("revealed");
      this.classList.remove("final-select");
      this.dataset.rarity = p.rarity;
      this.style.setProperty("--prize-color", p.color);
      this.style.backgroundColor = p.color;

      if (p.mediaType === "none" || !p.mediaUrl) {
        this.classList.add("text-only");
        this.innerHTML = `<div class="box-title" style="color:${p.fontColor}">${p.name}</div>`;
      } else {
        this.innerHTML = `
                    <div class="box-media">${buildMediaElement(p)}</div>
                    <div class="box-title" style="color:${p.fontColor}">${p.name}</div>
                `;
      }
      state.revealedBoxes.add(idx);
      saveState();
    });

    // Toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.className = `toggle-box${isDisabled ? " is-disabled" : ""}`;
    toggleBtn.textContent = isDisabled ? "Enable" : "Disable";
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleBox(i);
    });

    wrapper.appendChild(box);
    wrapper.appendChild(toggleBtn);
    container.appendChild(wrapper);
  }
}

// ── Prize Preview Modal ─────────────────────────────────

function showPrizePreview(index) {
  if (index < 0 || index >= state.prizes.length) return;

  const prize = state.prizes[index];
  if (!prize) return;

  const modal = document.createElement("div");
  modal.className = "prize-preview-modal";

  const mediaContent =
    prize.mediaType === "none" || !prize.mediaUrl
      ? `<div class="prize-preview-modal-text" style="color:${prize.fontColor || "#FFFFFF"}; background:${prize.color || "#808080"};">${prize.name || "No Name"}</div>`
      : buildMediaElement(prize);

  modal.innerHTML = `
        <div class="prize-preview-modal-content">
            <span class="prize-preview-modal-close">&times;</span>
            <div class="prize-preview-modal-media">
                ${mediaContent}
            </div>
            <div class="prize-preview-modal-info">
                <h3 class="prize-preview-modal-name" style="color:${prize.fontColor || "#FFFFFF"}">${prize.name || "No Name"}</h3>
                <div class="prize-preview-modal-rarity rarity-${prize.rarity ? prize.rarity.toLowerCase() : "common"}">${prize.rarity || "Common"}</div>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Close modal when clicking the close button or outside the modal
  modal
    .querySelector(".prize-preview-modal-close")
    .addEventListener("click", () => {
      modal.classList.remove("prize-preview-modal--visible");
      setTimeout(() => modal.remove(), 300);
    });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("prize-preview-modal--visible");
      setTimeout(() => modal.remove(), 300);
    }
  });

  // Trigger animation
  requestAnimationFrame(() => {
    modal.classList.add("prize-preview-modal--visible");
  });
}

// ── Prize Images (side panel) ────────────────────────────────

function renderPrizeImages() {
  const container = document.getElementById("prizeImages");
  container.innerHTML = state.prizes
    .filter((p) => p.mediaUrl || p.mediaType === "none" || !p.mediaUrl)
    .map(
      (p) => `
            <div class="prize-preview" data-rarity="${p.rarity}" data-index="${state.prizes.indexOf(p)}" style="background-color: ${p.color};">
                <div class="prize-preview-media">${buildMediaElement(p)}</div>
                <div class="prize-preview-name rarity-${p.rarity.toLowerCase()}">${p.name}</div>
                <div class="prize-preview-rarity">${p.rarity}</div>
            </div>
        `,
    )
    .join("");

  // Add click event listeners to prize previews
  container.querySelectorAll(".prize-preview").forEach((preview) => {
    preview.addEventListener("click", function () {
      const index = parseInt(this.dataset.index);
      if (index >= 0 && index < state.prizes.length) {
        showPrizePreview(index);
      }
    });
  });
}

// ── No Prize Customization (settings) ───────────────────────

function renderNoPrizeSettings() {
  const container = document.getElementById("noPrizeSettings");
  if (!container) return;

  container.innerHTML = `
        <div class="settings-section">
            <h2>No Prize Settings</h2>
            <div class="no-prize-item">
                <div class="no-prize-item-header">
                    <span class="no-prize-item-name">${state.noPrize.name}</span>
                    <span class="rarity-badge rarity-${state.noPrize.rarity.toLowerCase()}">${state.noPrize.rarity}</span>
                </div>
                <div class="no-prize-item-fields">
                    <div class="field-group">
                        <label>Name</label>
                        <input type="text" value="${state.noPrize.name}"
                            onchange="updateNoPrize('name', this.value)">
                    </div>
                    <div class="field-group">
                        <label>Rarity</label>
                        <select onchange="updateNoPrize('rarity', this.value)">
                            <option value="Common" ${state.noPrize.rarity === "Common" ? "selected" : ""}>Common</option>
                            <option value="Rare" ${state.noPrize.rarity === "Rare" ? "selected" : ""}>Rare</option>
                            <option value="Epic" ${state.noPrize.rarity === "Epic" ? "selected" : ""}>Epic</option>
                            <option value="Legendary" ${state.noPrize.rarity === "Legendary" ? "selected" : ""}>Legendary</option>
                        </select>
                    </div>
                    <div class="field-group field-group--color">
                        <label>BG Color</label>
                        <input type="color" value="${state.noPrize.color}"
                            onchange="updateNoPrize('color', this.value)">
                    </div>
                    <div class="field-group field-group--color">
                        <label>Font Color</label>
                        <input type="color" value="${state.noPrize.fontColor}"
                            onchange="updateNoPrize('fontColor', this.value)">
                    </div>
                    <div class="field-group field-group--narrow">
                        <label>Media Type</label>
                        <select onchange="updateNoPrize('mediaType', this.value)">
                            <option value="none" ${state.noPrize.mediaType === "none" ? "selected" : ""}>No image/video</option>
                            <option value="image" ${state.noPrize.mediaType === "image" ? "selected" : ""}>Image</option>
                            <option value="video" ${state.noPrize.mediaType === "video" ? "selected" : ""}>Video</option>
                        </select>
                    </div>
                    <div class="field-group field-group--url">
                        <label>Media URL</label>
                        <input type="url" placeholder="https://..." value="${state.noPrize.mediaUrl}"
                            onchange="updateNoPrize('mediaUrl', this.value)">
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ── Prize List (settings) ─────────────────────────────────────

function renderPrizeList() {
  const list = document.getElementById("prizeList");
  list.innerHTML = state.prizes
    .map(
      (prize, index) => `
        <div class="prize-item" data-rarity="${prize.rarity}">
            <div class="prize-item-header">
                <span class="prize-item-index">#${index + 1}</span>
                <span class="rarity-badge rarity-${prize.rarity.toLowerCase()}">${prize.rarity}</span>
                <button class="delete-btn" data-index="${index}">✕ Delete</button>
            </div>
            <div class="prize-item-fields">
                <div class="field-group">
                    <label>Name</label>
                    <input type="text" value="${prize.name}"
                        onchange="updatePrize(${index}, 'name', this.value)">
                </div>
                <div class="field-group">
                    <label>Rarity</label>
                    <select onchange="updatePrize(${index}, 'rarity', this.value)">
                        <option value="Common"    ${prize.rarity === "Common" ? "selected" : ""}>Common</option>
                        <option value="Rare"      ${prize.rarity === "Rare" ? "selected" : ""}>Rare</option>
                        <option value="Epic"      ${prize.rarity === "Epic" ? "selected" : ""}>Epic</option>
                        <option value="Legendary" ${prize.rarity === "Legendary" ? "selected" : ""}>Legendary</option>
                    </select>
                </div>
                <div class="field-group field-group--color">
                    <label>BG Color</label>
                    <input type="color" value="${prize.color}"
                        onchange="updatePrize(${index}, 'color', this.value)">
                </div>
                <div class="field-group field-group--color">
                    <label>Font Color</label>
                    <input type="color" value="${prize.fontColor}"
                        onchange="updatePrize(${index}, 'fontColor', this.value)">
                </div>
                <div class="field-group field-group--narrow">
                    <label>Qty</label>
                    <input type="number" min="1" value="${prize.quantity}"
                        onchange="updatePrize(${index}, 'quantity', parseInt(this.value))">
                </div>
                <div class="field-group field-group--narrow">
                    <label>Media Type</label>
                    <select onchange="updatePrize(${index}, 'mediaType', this.value)">
                        <option value="none" ${prize.mediaType === "none" ? "selected" : ""}>No image/video</option>
                        <option value="image" ${prize.mediaType === "image" ? "selected" : ""}>Image</option>
                        <option value="video" ${prize.mediaType === "video" ? "selected" : ""}>Video</option>
                    </select>
                </div>
                <div class="field-group field-group--url">
                    <label>Media URL</label>
                    <input type="url" placeholder="https://..." value="${prize.mediaUrl}"
                        onchange="updatePrize(${index}, 'mediaUrl', this.value)">
                </div>
            </div>
        </div>
    `,
    )
    .join("");

  // Wire delete buttons (avoids inline onclick with index injection)
  list.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      deletePrize(parseInt(btn.dataset.index)),
    );
  });
}
