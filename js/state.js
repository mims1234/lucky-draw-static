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
      "https://cdn.mazoku.cc/cards/476e1140-dccb-4e81-aa8e-62be891a3042/card?width=100",
    mediaType: "video",
  },
  {
    name: "Second Prize",
    rarity: "Epic",
    color: "#9400D3",
    fontColor: "#FFFFFF",
    quantity: 2,
    mediaUrl:
      "http://15.204.204.211:9000/mazokubucket/Berserk_Guts_SR.png?width=100",
    mediaType: "image",
  },
  {
    name: "Third Prize",
    rarity: "Rare",
    color: "#4169E1",
    fontColor: "#FFFFFF",
    quantity: 3,
    mediaUrl:
      "http://15.204.204.211:9000/mazokubucket/League_of_Legends_Yone_R.png",
    mediaType: "image",
  },
  {
    name: "Consolation",
    rarity: "Common",
    color: "#32CD32",
    fontColor: "#000000",
    quantity: 6,
    mediaUrl: "https://ibb.co/mCvKVwJ",
    mediaType: "image",
  },
];

let state = {
  prizes: [],
  noPrize: {
    name: "No Prize",
    rarity: "Common",
    color: "#808080",
    fontColor: "#FFFFFF",
    mediaUrl: "",
    mediaType: "none",
  },
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
    shuffleAndAssignPrizes();
    saveState();
  }
  renderPrizeList();
  renderBoxes(false);
  renderPrizeImages();
}
