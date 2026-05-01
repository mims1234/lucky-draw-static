// ============================================================
//  state.js — Central state, persistence, prize pool logic
// ============================================================

const DEFAULT_PRIZES = [
  {
    name: "Grand Prize",
    rarity: "Legendary",
    color: "#FFD700",
    fontColor: "#000000",
    quantity: 1,
    mediaUrl:
      "https://cdn7.mazoku.cc/cards/b354ec9f-cab2-48e9-837c-659b775bd443.webp",
    mediaType: "image",
  },
  {
    name: "Second Prize",
    rarity: "Epic",
    color: "#9400D3",
    fontColor: "#FFFFFF",
    quantity: 2,
    mediaUrl:
      "https://cdn7.mazoku.cc/cards/15313fbf-cb5a-4acd-9852-5b9cddc9ed6b.webp",
    mediaType: "image",
  },
  {
    name: "Third Prize",
    rarity: "Rare",
    color: "#4169E1",
    fontColor: "#FFFFFF",
    quantity: 3,
    mediaUrl:
      "https://cdn7.mazoku.cc/cards/7e223388-62a6-4ebe-99bc-778e8feba751.webp",
    mediaType: "image",
  },
  {
    name: "GOAT",
    rarity: "Common",
    color: "#32CD32",
    fontColor: "#000000",
    quantity: 6,
    mediaUrl: "",
    mediaType: "none",
  },
];

let state = {
  prizes: deepCopyDefaultPrizes(),
  noPrize: {
    name: "No Prize",
    rarity: "Common",
    color: "#333333",
    fontColor: "#FFFFFF",
    mediaUrl: "",
    mediaType: "none",
  },
  animationHighlightColor: "#00d4ff",
  boxCount: 25,
  isAnimating: false,
  disabledBoxes: new Set(),
  prizeAssignments: new Array(25),
  revealedBoxes: new Set(),
};

// ── Helpers ─────────────────────────────────────────────────

function detectMediaType(url) {
  const videoExtensions = [".mp4", ".webm", ".ogg", "mazoku.cc/cards"];
  return videoExtensions.some((ext) => url.toLowerCase().includes(ext))
    ? "video"
    : "image";
}

function deepCopyDefaultPrizes() {
  return DEFAULT_PRIZES.map((p) => ({ ...p }));
}

// ── Prize pool ───────────────────────────────────────────────

function shuffleAndAssignPrizes() {
  let prizePool = [];
  state.prizes.forEach((prize) => {
    for (let i = 0; i < prize.quantity; i++) {
      prizePool.push(prize);
    }
  });
  while (prizePool.length < state.boxCount) {
    prizePool.push({ ...state.noPrize });
  }
  prizePool.sort(() => Math.random() - 0.5);
  state.prizeAssignments = [...prizePool];
}

// ── Persistence ──────────────────────────────────────────────

function saveState() {
  const saveable = {
    ...state,
    disabledBoxes: Array.from(state.disabledBoxes),
    prizeAssignments: state.prizeAssignments,
    revealedBoxes: Array.from(state.revealedBoxes),
  };
  localStorage.setItem("luckyDrawState", JSON.stringify(saveable));
}

function loadState() {
  const saved = localStorage.getItem("luckyDrawState");
  if (saved) {
    const loaded = JSON.parse(saved);
    state = {
      ...loaded,
      noPrize: loaded.noPrize || {
        name: "No Prize",
        rarity: "Common",
        color: "#808080",
        fontColor: "#FFFFFF",
        mediaUrl: "",
        mediaType: "none",
      },
      animationHighlightColor: loaded.animationHighlightColor || "#00d4ff",
      boxCount: 25,
      isAnimating: false,
      disabledBoxes: new Set(loaded.disabledBoxes || []),
      prizeAssignments: loaded.prizeAssignments || new Array(25),
      revealedBoxes: new Set(loaded.revealedBoxes || []),
    };
  } else {
    state.prizes = deepCopyDefaultPrizes();
    state.noPrize = {
      name: "No Prize",
      rarity: "Common",
      color: "#808080",
      fontColor: "#FFFFFF",
      mediaUrl: "",
      mediaType: "none",
    };
    state.animationHighlightColor = "#00d4ff";
    shuffleAndAssignPrizes();
    saveState();
  }
  renderPrizeList();
  renderBoxes(false);
  renderPrizeImages();
}
