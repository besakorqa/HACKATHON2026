let difficulty = "easy";
let timeMode = "stopwatch";
let duration = 120;
let soundOn = true;
let currentGame = "puzzle";
let currentLevel = 1;
let maxLevelCount = 5;
let timerInterval = null;
let elapsed = 0;
let remaining = 0;
let gameFinished = false;
let reactionTimeout = null;
let reactionStart = 0;
let selectedTile = null;
let memoryFirst = null;
let memoryLock = false;
let memoryMatches = 0;
let wordleAttempts = 0;
let wordleAnswer = "";
let wordleFinished = false;
let typingSentence = "";
let mathAnswer = 0;
let scrambleAnswer = "";
let puzzlePreviewing = false;
let puzzleCountdown = null;
let puzzleSize = 3;
let hintsUsed = 0;
let brainHint = () => "Take your time!";
const puzzlePhotos = [
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=900",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=900",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900",
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900"
];
const scrambleWords = [
  "PLANET", "GARDEN", "PUZZLE", "CASTLE", "BRIDGE",
  "FLOWER", "ORANGE", "SILVER", "POCKET", "JUNGLE"
];
const wordleWords = [
  "BRAIN", "PLANT", "LIGHT", "DREAM", "SPACE",
  "CLOUD", "STONE", "WATER", "FLAME", "SMILE"
];
const GAME_ORDER = [
  "puzzle", "memory", "scramble", "wordle", "math", "reaction", "brain", "odd",
  "typing", "flags", "hangman", "sudoku", "cube", "crossword", "simon"
];
const START_UNLOCKED = 3;
const gameMeta = {
  memory: { icon: "▦", cls: "purple", desc: "Find matching pairs" },
  scramble: { icon: "Aa", cls: "orange", desc: "Unscramble the word" },
  wordle: { icon: "▣", cls: "green", desc: "Guess the hidden word" },
  math: { icon: "＋", cls: "blue", desc: "Solve it quickly" },
  reaction: { icon: "⚡", cls: "pink", desc: "Test your reaction" },
  brain: { icon: "?", cls: "yellow", desc: "Move things to solve it" },
  odd: { icon: "◈", cls: "teal", desc: "Spot the differences" },
  typing: { icon: "⌨", cls: "red", desc: "Type the sentence" }
};
const ACHIEVEMENTS = [
  { id: "first_win", icon: "🎉", name: "First Victory", desc: "Finish any game" },
  { id: "puzzle_pro", icon: "🧩", name: "Puzzle Master", desc: "Finish the Picture Puzzle" },
  { id: "no_hints", icon: "🧠", name: "Pure Brain", desc: "Finish a game without hints" },
  { id: "lightning", icon: "⚡", name: "Lightning Fast", desc: "Solve a level in under 10 seconds" },
  { id: "hard_hero", icon: "🔥", name: "Hard Mode Hero", desc: "Finish a game on Hard" },
  { id: "beat_clock", icon: "⏳", name: "Beat the Clock", desc: "Finish a game in Fun mode" },
  { id: "word_wiz", icon: "🔤", name: "Word Wizard", desc: "Finish Wordle" },
  { id: "globe", icon: "🌍", name: "Globe Trotter", desc: "Finish Guess the Flag" },
  { id: "collector", icon: "🗝️", name: "Collector", desc: "Unlock 6 games" },
  { id: "unstoppable", icon: "👑", name: "Unstoppable", desc: "Unlock every game" }
];
let progress = { unlocked: GAME_ORDER.slice(0, START_UNLOCKED), done: [], ach: [] };
try {
  const saved = JSON.parse(localStorage.getItem("mindrush_progress"));
  if (saved && Array.isArray(saved.unlocked)) progress = { ...progress, ...saved };
} catch (error) {}
if (!progress.unlocked.includes("puzzle")) progress.unlocked.unshift("puzzle");
const say = text => { document.getElementById("gameMessage").textContent = text; };
const shuffleArr = list => [...list].sort(() => Math.random() - 0.5);
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const isUnlocked = id => progress.unlocked.includes(id);
function saveProgress() {
  try { localStorage.setItem("mindrush_progress", JSON.stringify(progress)); } catch (error) {}
}
function showToast(text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
function earn(id) {
  if (progress.ach.includes(id)) return;
  progress.ach.push(id);
  saveProgress();
  const a = ACHIEVEMENTS.find(item => item.id === id);
  if (a) showToast(`🏅 Achievement unlocked: ${a.name}!`);
  renderAchievements();
}
function renderAchievements() {
  const grid = document.getElementById("achGrid");
  if (!grid) return;
  grid.innerHTML = ACHIEVEMENTS.map(a => {
    const on = progress.ach.includes(a.id);
    return `<div class="ach ${on ? "on" : ""}"><span class="ach-icon">${on ? a.icon : "🔒"}</span><b>${a.name}</b><small>${a.desc}</small></div>`;
  }).join("");
  document.getElementById("achSummary").textContent =
    `${progress.ach.length} / ${ACHIEVEMENTS.length} achievements · ${progress.unlocked.length} / ${GAME_ORDER.length} games unlocked`;
}
function renderGames() {
  const grid = document.getElementById("miniGrid");
  if (!grid) return;
  grid.innerHTML = "";
  GAME_ORDER.filter(id => id !== "puzzle" && gameMeta[id] && gameNames[id]).forEach(id => {
    const meta = gameMeta[id];
    const open = isUnlocked(id);
    const card = document.createElement("button");
    card.className = "mini-card" + (open ? "" : " locked");
    card.innerHTML = `
      <span class="mini-icon ${meta.cls}">${meta.icon}</span>
      <span class="mini-name">${gameNames[id]}</span>
      <span class="mini-desc">${open ? meta.desc : "Locked - finish a game"}</span>
      <span class="mini-arrow">${open ? "↗" : ""}</span>
      ${open ? "" : '<span class="chain c1">⛓️⛓️⛓️⛓️⛓️⛓️⛓️⛓️⛓️</span><span class="chain c2">⛓️⛓️⛓️⛓️⛓️⛓️⛓️⛓️⛓️</span><span class="lock">🔒</span>'}
    `;
    card.onclick = () => {
      if (open) { openGame(id); return; }
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 400);
      showToast("🔒 Locked! Finish any game to unlock a new one.");
    };
    grid.appendChild(card);
  });
  const minis = GAME_ORDER.filter(id => id !== "puzzle");
  const open = minis.filter(isUnlocked).length;
  document.getElementById("miniCount").textContent = `${open} / ${minis.length} UNLOCKED`;
}
function onGameWon() {
  if (!progress.done.includes(currentGame)) progress.done.push(currentGame);
  const next = GAME_ORDER.find(id => !isUnlocked(id));
  let unlockedName = null;
  if (next) {
    progress.unlocked.push(next);
    unlockedName = gameNames[next];
  }
  earn("first_win");
  if (currentGame === "puzzle") earn("puzzle_pro");
  if (hintsUsed === 0) earn("no_hints");
  if (difficulty === "hard") earn("hard_hero");
  if (timeMode === "fun") earn("beat_clock");
  if (currentGame === "wordle") earn("word_wiz");
  if (currentGame === "flags") earn("globe");
  if (progress.unlocked.length >= 6) earn("collector");
  if (progress.unlocked.length >= GAME_ORDER.length) earn("unstoppable");
  saveProgress();
  renderGames();
  renderAchievements();
  return unlockedName;
}
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}
function goHome() {
  stopTimer();
  clearTimeout(reactionTimeout);
  document.body.classList.toggle("hard", difficulty === "hard");
  showScreen("home");
}
function backToGames() {
  stopTimer();
  clearTimeout(reactionTimeout);
  document.body.classList.toggle("hard", difficulty === "hard");
  showScreen("games");
}
document.getElementById("startBtn").addEventListener("click", () => {
  document.body.classList.toggle("hard", difficulty === "hard");
  updateModeInfo();
  showScreen("games");
});
document.querySelectorAll("[data-difficulty]").forEach(button => {
  button.addEventListener("click", () => {
    difficulty = button.dataset.difficulty;
    document.querySelectorAll("[data-difficulty]").forEach(item => {
      item.classList.toggle("active", item === button);
    });
    document.body.classList.toggle("hard", difficulty === "hard");
  });
});
document.querySelectorAll("[data-timemode]").forEach(button => {
  button.addEventListener("click", () => {
    timeMode = button.dataset.timemode;
    document.querySelectorAll("[data-timemode]").forEach(item => {
      item.classList.toggle("active", item === button);
    });
    document.getElementById("duration").disabled = timeMode !== "fun";
  });
});
document.getElementById("duration").addEventListener("change", event => {
  duration = Number(event.target.value);
});
function updateModeInfo() {
  const difficultyName = difficulty === "easy" ? "Easy mode" : "Hard mode";
  const timeName = timeMode === "fun" ? "Fun mode" : "Stopwatch";
  document.getElementById("modeInfo").textContent = `${difficultyName} · ${timeName}`;
}
function toggleSound() {
  soundOn = !soundOn;
  document.getElementById("soundBtn").textContent = soundOn ? "🔊" : "🔇";
}
function playSound(frequency = 500) {
  if (!soundOn) return;
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.07;
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.12);
    oscillator.onended = () => audio.close();
  } catch (error) {
  }
}
const gameNames = {
  puzzle: "Picture Puzzle",
  memory: "Memory Match",
  scramble: "Word Scramble",
  wordle: "Wordle",
  math: "Quick Math",
  reaction: "Reaction Rush",
  brain: "Brain Fix",
  odd: "Odd One Out",
  typing: "Typing Sprint"
};
const games = {
  puzzle: startPuzzle,
  memory: startMemory,
  scramble: startScramble,
  wordle: startWordle,
  math: startMath,
  reaction: startReaction,
  brain: startBrain,
  odd: startOdd,
  typing: startTyping
};
function focusFirst() {
  setTimeout(() => {
    const el = document.querySelector("#gameArea input:not(:disabled), #gameArea textarea");
    if (el) el.focus();
  }, 60);
}
function openGame(game) {
  if (!isUnlocked(game)) { showToast("🔒 Locked! Finish any game to unlock a new one."); return; }
  hintsUsed = 0;
  currentGame = game;
  currentLevel = 1;
  maxLevelCount = 5;
  document.body.classList.toggle("hard", difficulty === "hard");
  document.getElementById("nextBtn").classList.add("hidden");
  showScreen("play");
  startLevel();
}
function startLevel() {
  stopTimer();
  clearTimeout(reactionTimeout);
  gameFinished = false;
  elapsed = 0;
  remaining = duration;
  selectedTile = null;
  document.getElementById("nextBtn").classList.add("hidden");
  document.getElementById("gameMessage").textContent = "";
  document.getElementById("levelLabel").textContent = `LEVEL ${currentLevel} / ${maxLevelCount}`;
  document.getElementById("progressBar").style.width = `${((currentLevel - 1) / maxLevelCount) * 100}%`;
  document.getElementById("gameTitle").textContent = gameNames[currentGame];
  games[currentGame]();
  updateTimerDisplay();
  startTimer();
  focusFirst();
}
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (gameFinished || puzzlePreviewing) return;
    if (timeMode === "fun") {
      remaining--;
      updateTimerDisplay();
      if (remaining <= 0) {
        stopTimer();
        gameFinished = true;
        showResult(false);
      }
    } else {
      elapsed++;
      updateTimerDisplay();
    }
  }, 1000);
}
function stopTimer() {
  clearInterval(puzzleCountdown);
  puzzlePreviewing = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
function updateTimerDisplay() {
  const timer = document.getElementById("timer");
  timer.textContent = timeMode === "fun"
    ? formatTime(Math.max(0, remaining))
    : formatTime(elapsed);
}
function completeLevel(message = "Great job! Level completed!") {
  if (gameFinished) return;
  gameFinished = true;
  stopTimer();
  playSound(700);
  const levelSeconds = timeMode === "fun" ? duration - remaining : elapsed;
  if (levelSeconds < 10 && currentGame !== "reaction") earn("lightning");
  document.getElementById("gameMessage").textContent = message;
  document.getElementById("progressBar").style.width = `${(currentLevel / maxLevelCount) * 100}%`;
  const nextBtn = document.getElementById("nextBtn");
  nextBtn.classList.remove("hidden");
  nextBtn.textContent = currentLevel >= maxLevelCount ? "FINISH GAME →" : "NEXT LEVEL →";
  nextBtn.onclick = () => {
    if (currentLevel >= maxLevelCount) {
      showResult(true);
    } else {
      currentLevel++;
      startLevel();
    }
  };
}
function showResult(won) {
  stopTimer();
  clearTimeout(reactionTimeout);
  showScreen("result");
  document.getElementById("resultIcon").textContent = won ? "🏆" : "⏰";
  document.getElementById("resultTitle").textContent = won ? "You're amazing!" : "Time's up!";
  let resultMessage = won
    ? "You completed all five levels. Your brain is on fire!"
    : "The timer ran out. Try the challenge again!";
  if (won) {
    const unlocked = onGameWon();
    if (unlocked) resultMessage += ` 🔓 New game unlocked: ${unlocked}!`;
  }
  document.getElementById("resultText").textContent = resultMessage;
  document.getElementById("resultTime").textContent =
    timeMode === "fun" ? formatTime(duration - remaining) : formatTime(elapsed);
  document.getElementById("resultLevel").textContent = `${currentLevel} / ${maxLevelCount}`;
}
let puzzlePhoto = "";
let puzzleSlots = [];
let puzzleSel = null;
let pieceEls = [];
let slotEls = [];
let customPhoto = null;
function startPuzzle() {
  puzzlePreviewing = true; // the clock waits while choosing and memorising
  const pictures = (customPhoto ? [customPhoto] : []).concat(puzzlePhotos);
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Choose the picture you want to rebuild:</p>
    <div class="pic-grid" id="picGrid"></div>
    <div class="pic-actions">
      <button class="game-action" id="picRandom">🎲 Surprise me</button>
      <label class="game-action upload">📁 Use my own photo
        <input type="file" id="picFile" accept="image/*" hidden>
      </label>
    </div>
  `;
  const grid = document.getElementById("picGrid");
  pictures.forEach(url => {
    const button = document.createElement("button");
    button.className = "pic-thumb";
    button.style.backgroundImage = `url("${url.replace("w=900", "w=240")}")`;
    button.onclick = () => beginPuzzle(url);
    grid.appendChild(button);
  });
  document.getElementById("picRandom").onclick = () =>
    beginPuzzle(pictures[Math.floor(Math.random() * pictures.length)]);
  document.getElementById("picFile").onchange = event => {
    const file = event.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 700;
      canvas.getContext("2d").drawImage(
        img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 700, 700
      );
      customPhoto = canvas.toDataURL("image/jpeg", 0.9);
      beginPuzzle(customPhoto);
    };
    img.src = URL.createObjectURL(file);
  };
}
function beginPuzzle(photo) {
  const size = difficulty === "easy"
    ? Math.min(3 + Math.floor((currentLevel - 1) / 2), 4)
    : Math.min(5 + currentLevel - 1, 8);
  puzzleSize = size;
  puzzlePhoto = photo;
  puzzleSlots = Array(size * size).fill(null);
  puzzleSel = null;
  pieceEls = [];
  slotEls = [];
  const pieceSize = { 3: 78, 4: 52, 5: 44, 6: 40, 7: 38, 8: 36 }[size];
  document.getElementById("gameArea").innerHTML = `
    <button class="eye" id="eye" title="Peek at the picture" aria-label="Peek at the picture"
      style="background-image:url('${photo}')"></button>
    <p class="game-hint" id="puzzleHint">Memorise the picture! The pieces fly out in 5…</p>
    <div class="puzzle-stage" style="--ps:${pieceSize}px">
      <div class="tray" id="trayL"></div>
      <div class="puzzle-board preview" id="puzzleBoard"
        style="grid-template-columns:repeat(${size},1fr);background-image:url('${photo}')"></div>
      <div class="tray" id="trayR"></div>
    </div>
  `;
  document.getElementById("eye").onclick = event => {
    event.currentTarget.classList.toggle("open");
  };
  puzzlePreviewing = true;
  let count = 5;
  puzzleCountdown = setInterval(() => {
    count--;
    const hint = document.getElementById("puzzleHint");
    if (count > 0) {
      if (hint) hint.textContent = `Memorise the picture! The pieces fly out in ${count}…`;
      return;
    }
    clearInterval(puzzleCountdown);
    puzzlePreviewing = false;
    elapsed = 0;
    remaining = duration;
    updateTimerDisplay();
    if (hint) hint.textContent = "Drag (or tap) a piece, then tap its square on the board. Tap the 👁 to peek.";
    scatterPieces(photo, size);
    playSound(520);
  }, 1000);
}
function scatterPieces(photo, size) {
  const board = document.getElementById("puzzleBoard");
  board.classList.remove("preview");
  board.style.backgroundImage = "none";
  for (let i = 0; i < size * size; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.onclick = () => slotClick(i);
    slot.ondragover = event => event.preventDefault();
    slot.ondrop = event => {
      event.preventDefault();
      const piece = Number(event.dataTransfer.getData("text/plain"));
      if (!Number.isNaN(piece)) placePiece(piece, i);
    };
    board.appendChild(slot);
    slotEls[i] = slot;
  }
  const trays = [document.getElementById("trayL"), document.getElementById("trayR")];
  trays.forEach(tray => {
    tray.onclick = () => {
      if (puzzleSel !== null && puzzleSlots.includes(puzzleSel)) sendToTray(puzzleSel, tray);
    };
    tray.ondragover = event => event.preventDefault();
    tray.ondrop = event => {
      event.preventDefault();
      const piece = Number(event.dataTransfer.getData("text/plain"));
      if (puzzleSlots.includes(piece)) sendToTray(piece, tray);
    };
  });
  shuffleArr([...Array(size * size).keys()]).forEach((piece, n) => {
    const el = makePiece(piece, photo, size);
    el.style.setProperty("--r", `${rnd(-14, 14)}deg`);
    el.style.setProperty("--fx", n % 2 ? "-240px" : "240px");
    el.style.animationDelay = `${n * 30}ms`;
    pieceEls[piece] = el;
    trays[n % 2].appendChild(el);
  });
}
function makePiece(piece, photo, size) {
  const el = document.createElement("button");
  el.className = "piece";
  el.draggable = true;
  const row = Math.floor(piece / size);
  const col = piece % size;
  el.style.backgroundImage = `url("${photo}")`;
  el.style.backgroundSize = `${size * 100}% ${size * 100}%`;
  el.style.backgroundPosition = `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`;
  el.onclick = event => {
    event.stopPropagation();
    const at = puzzleSlots.indexOf(piece);
    if (puzzleSel !== null && puzzleSel !== piece && at >= 0) placePiece(puzzleSel, at);
    else selectPiece(piece);
  };
  el.ondragstart = event => event.dataTransfer.setData("text/plain", String(piece));
  return el;
}
function clearSel() {
  if (puzzleSel !== null && pieceEls[puzzleSel]) pieceEls[puzzleSel].classList.remove("sel");
  puzzleSel = null;
}
function selectPiece(piece) {
  if (gameFinished || puzzlePreviewing) return;
  const same = puzzleSel === piece;
  clearSel();
  if (!same) {
    puzzleSel = piece;
    pieceEls[piece].classList.add("sel");
  }
}
function slotClick(i) {
  if (gameFinished || puzzlePreviewing) return;
  if (puzzleSel === null) {
    if (puzzleSlots[i] !== null) selectPiece(puzzleSlots[i]);
    return;
  }
  placePiece(puzzleSel, i);
}
function sendToTray(piece, tray) {
  const from = puzzleSlots.indexOf(piece);
  if (from >= 0) puzzleSlots[from] = null;
  const left = document.getElementById("trayL");
  const right = document.getElementById("trayR");
  const target = tray || (left.children.length <= right.children.length ? left : right);
  target.appendChild(pieceEls[piece]);
  clearSel();
}
function placePiece(piece, i) {
  if (gameFinished || puzzlePreviewing) return;
  const from = puzzleSlots.indexOf(piece);
  const other = puzzleSlots[i];
  if (other === piece) { clearSel(); return; }
  if (from >= 0) puzzleSlots[from] = null;
  puzzleSlots[i] = piece;
  slotEls[i].appendChild(pieceEls[piece]);
  if (other !== null) {
    if (from >= 0) {
      puzzleSlots[from] = other;
      slotEls[from].appendChild(pieceEls[other]);
    } else {
      sendToTray(other);
    }
  }
  clearSel();
  playSound(420);
  if (puzzleSlots.every((value, index) => value === index)) {
    completeLevel("Perfect! You solved the picture puzzle!");
  }
}
function startMemory() {
  const pairCount = difficulty === "easy"
    ? 4 + Math.floor((currentLevel - 1) / 2)
    : 6 + currentLevel;
  const symbols = ["🍓", "🍋", "🍉", "🍇", "🍒", "🥝", "🍍", "🥑", "🍑", "🍊", "🍐", "🥥"];
  const cards = symbols.slice(0, pairCount);
  const deck = [...cards, ...cards].sort(() => Math.random() - 0.5);
  memoryFirst = null;
  memoryLock = false;
  memoryMatches = 0;
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Find all matching pairs!</p>
    <div class="memory-grid" id="memoryGrid"></div>
  `;
  const grid = document.getElementById("memoryGrid");
  grid.style.gridTemplateColumns = "repeat(4,1fr)";
  deck.forEach(symbol => {
    const card = document.createElement("button");
    card.className = "memory-card";
    card.textContent = "?";
    card.dataset.symbol = symbol;
    card.addEventListener("click", () => {
      if (memoryLock || card.classList.contains("flipped") ||
          card.classList.contains("matched") || gameFinished) return;
      card.textContent = symbol;
      card.classList.add("flipped");
      playSound(450);
      if (!memoryFirst) {
        memoryFirst = card;
      } else {
        if (memoryFirst.dataset.symbol === card.dataset.symbol) {
          memoryFirst.classList.add("matched");
          card.classList.add("matched");
          memoryFirst = null;
          memoryMatches++;
          if (memoryMatches === pairCount) {
            completeLevel("Amazing memory! All pairs found!");
          }
        } else {
          memoryLock = true;
          const first = memoryFirst;
          memoryFirst = null;
          setTimeout(() => {
            if (!gameFinished) {
              first.textContent = "?";
              card.textContent = "?";
              first.classList.remove("flipped");
              card.classList.remove("flipped");
            }
            memoryLock = false;
          }, 750);
        }
      }
    });
    grid.appendChild(card);
  });
}
function startScramble() {
  const word = scrambleWords[
    (currentLevel - 1 + (difficulty === "hard" ? 4 : 0)) % scrambleWords.length
  ];
  scrambleAnswer = word;
  let scrambled = word.split("").sort(() => Math.random() - 0.5).join("");
  if (scrambled === word) scrambled = word.slice(1) + word[0];
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Put the letters in the correct order.</p>
    <div class="big-word">${scrambled}</div>
    <input class="game-input" id="scrambleInput" placeholder="Your answer..." autocomplete="off">
    <br>
    <button class="game-action" id="scrambleCheck">CHECK WORD</button>
  `;
  const input = document.getElementById("scrambleInput");
  document.getElementById("scrambleCheck").onclick = () => {
    if (input.value.trim().toUpperCase() === word) {
      completeLevel("Correct! You found the word!");
    } else {
      document.getElementById("gameMessage").textContent = "Not quite! Try again.";
    }
  };
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") document.getElementById("scrambleCheck").click();
  });
}
const commonWords = new Set(`about above abuse actor adult after again agree ahead alarm album alert alike alive allow alone along among angel anger angle angry apart apple apply arena argue arise array aside asset audio avoid award aware badly baker basic beach begin being below bench birth black blame blank blind block blood board boost bound brave bread break brick brief bring broad brown build buyer cable carry catch cause chain chair chart chase cheap check chest chief child claim class clean clear click climb clock close coach coast count court cover craft crash crazy cream crime cross crowd crown curve cycle daily dance death delay depth doubt draft drama drawn drink drive early earth eight elite empty enemy enjoy enter entry equal error event every exact exist extra faith false fault field fifth fifty fight final first fixed flash floor focus force frame fresh front fruit funny giant given glass globe going grace grade grand grant grass great green group guard guess guest guide happy heart heavy hence horse hotel house human ideal image index inner input issue joint judge knife known label large laser later laugh layer learn least leave legal level lemon local loose lower lucky lunch magic major maker march match maybe mayor meant media metal might minor model money month moral motor mount mouse mouth movie music needs never newly night noise north novel nurse occur ocean offer often order other ought paint panel paper party peace phase phone photo piece pilot pitch place plain plane point pound power press price pride prime print prior prize proof proud prove queen quick quiet quite radio raise range rapid ratio reach ready refer right river rough round route royal rural scale scene scope score sense serve seven shall shape share sharp sheet shelf shell shift shine shirt shock shoot short shown sight since sixth skill sleep slice small smart smile smoke solid solve sorry sound south space spare speak speed spend split sport staff stage stand start state steam steel stick still stock stone store storm story strip study stuff style sugar super sweet table taken taste teach thank theme there thick thing think third those three throw tight title today tooth topic total touch tough tower track trade train treat trend trial tribe truck truly trust truth twice uncle under union unity until upper upset urban usage usual valid value video virus visit vital voice waste watch water wheel where which while white whole whose woman world worry worse worth would write wrong young youth`.split(" "));
const wordCache = {};
async function isRealWord(word) {
  if (commonWords.has(word) || wordleWords.includes(word)) return true;
  if (word in wordCache) return wordCache[word];
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
    );
    if (response.status === 404) return (wordCache[word] = false);
    return (wordCache[word] = true);
  } catch (error) {
    return true;
  }
}
function startWordle() {
  wordleAnswer = wordleWords[
    (currentLevel - 1 + (difficulty === "hard" ? 5 : 0)) % wordleWords.length
  ];
  wordleAttempts = 0;
  wordleFinished = false;
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Guess the five-letter word in six tries.</p>
    <div class="wordle-grid" id="wordleGrid"></div>
    <input class="game-input" id="wordleInput" maxlength="5" placeholder="ENTER WORD" autocomplete="off">
    <br>
    <button class="game-action" id="wordleCheck">SUBMIT GUESS</button>
  `;
  const grid = document.getElementById("wordleGrid");
  for (let i = 0; i < 30; i++) {
    const cell = document.createElement("div");
    cell.className = "wordle-cell";
    grid.appendChild(cell);
  }
  const input = document.getElementById("wordleInput");
  let checking = false;
  async function submitGuess() {
    if (wordleFinished || gameFinished || checking) return;
    const message = document.getElementById("gameMessage");
    const guess = input.value.trim().toUpperCase();
    if (!/^[A-Z]{5}$/.test(guess)) {
      message.textContent = "Enter a five-letter word.";
      return;
    }
    checking = true;
    message.textContent = "Checking the word...";
    const real = await isRealWord(guess);
    checking = false;
    if (gameFinished || wordleFinished) return;
    if (!real) {
      message.textContent = `"${guess}" is not a real word. This try doesn't count!`;
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 400);
      playSound(220);
      return;
    }
    const cells = grid.children;
    const start = wordleAttempts * 5;
    for (let i = 0; i < 5; i++) {
      const cell = cells[start + i];
      cell.textContent = guess[i];
      if (guess[i] === wordleAnswer[i]) {
        cell.classList.add("correct");
      } else if (wordleAnswer.includes(guess[i])) {
        cell.classList.add("present");
      } else {
        cell.classList.add("absent");
      }
    }
    wordleAttempts++;
    input.value = "";
    if (guess === wordleAnswer) {
      wordleFinished = true;
      completeLevel("You guessed the hidden word!");
    } else if (wordleAttempts >= 6) {
      wordleFinished = true;
      completeLevel(`The word was ${wordleAnswer}. Moving on!`);
    } else {
      message.textContent = `${6 - wordleAttempts} guesses left.`;
    }
  }
  document.getElementById("wordleCheck").onclick = submitGuess;
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") submitGuess();
  });
}
function startMath() {
  let a, b, operator;
  if (difficulty === "easy") {
    a = Math.floor(Math.random() * (10 + currentLevel * 3)) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    operator = currentLevel >= 3 ? "+" : ["+", "-"][Math.floor(Math.random() * 2)];
  } else {
    a = Math.floor(Math.random() * (20 + currentLevel * 10)) + 5;
    b = Math.floor(Math.random() * 15) + 2;
    operator = ["+", "-", "×"][Math.floor(Math.random() * 3)];
  }
  if (operator === "-" && b > a) [a, b] = [b, a];
  if (operator === "×") mathAnswer = a * b;
  else if (operator === "+") mathAnswer = a + b;
  else mathAnswer = a - b;
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Solve the equation.</p>
    <div class="big-problem">${a} ${operator} ${b} = ?</div>
    <input class="game-input" id="mathInput" type="number" placeholder="Your answer">
    <br>
    <button class="game-action" id="mathCheck">CHECK ANSWER</button>
  `;
  const input = document.getElementById("mathInput");
  document.getElementById("mathCheck").onclick = () => {
    if (Number(input.value) === mathAnswer && input.value !== "") {
      completeLevel("Correct calculation! Well done!");
    } else {
      document.getElementById("gameMessage").textContent = "Incorrect. Try again!";
    }
  };
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") document.getElementById("mathCheck").click();
  });
}
function startReaction() {
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Wait for green, then click as quickly as possible!</p>
    <div class="reaction-box waiting" id="reactionBox">WAIT FOR GREEN...</div>
  `;
  const box = document.getElementById("reactionBox");
  const delay = 1500 + Math.random() * 3500;
  let ready = false;
  let clickedTooEarly = false;
  box.onclick = () => {
    if (gameFinished) return;
    if (!ready) {
      if (!clickedTooEarly) {
        clickedTooEarly = true;
        box.textContent = "Too early! Wait for green.";
        document.getElementById("gameMessage").textContent = "You clicked too soon. Try the level again.";
        clearTimeout(reactionTimeout);
        setTimeout(() => {
          if (!gameFinished) startReaction();
        }, 1200);
      }
      return;
    }
    const reactionTime = Date.now() - reactionStart;
    box.textContent = `${reactionTime} ms`;
    completeLevel(`Your reaction time was ${reactionTime} milliseconds!`);
  };
  reactionTimeout = setTimeout(() => {
    if (gameFinished || clickedTooEarly) return;
    ready = true;
    reactionStart = Date.now();
    box.classList.remove("waiting");
    box.classList.add("ready");
    box.textContent = "CLICK NOW!";
    playSound(800);
  }, delay);
}
function startBrain() {
  brainHint = () => "Think about what moves where!";
  const levels = [brainSorter, brainBalance, brainSlide, brainHanoi, brainTubes];
  levels[(currentLevel - 1) % levels.length]();
}
function brainSorter() {
  const kinds = difficulty === "hard"
    ? ["circle", "square", "triangle", "star", "heart"]
    : ["circle", "square", "triangle"];
  const colors = { circle: "#4cc9f0", square: "#ffd166", triangle: "#06d6a0", star: "#ff9f1c", heart: "#ff5d73" };
  const paths = {
    circle: '<circle cx="25" cy="25" r="20"/>',
    square: '<rect x="6" y="6" width="38" height="38" rx="4"/>',
    triangle: '<polygon points="25,5 46,44 4,44"/>',
    star: '<polygon points="25,3 31,19 48,19 34,30 39,46 25,36 11,46 16,30 2,19 19,19"/>',
    heart: '<path d="M25 44C5 29 3 14 14 9c6-3 10 0 11 5 1-5 5-8 11-5 11 5 9 20-11 35z"/>'
  };
  const shape = (kind, fill) => `<svg viewBox="0 0 50 50" fill="${fill}">${paths[kind]}</svg>`;
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Drag (or tap) each shape into the hole with the same shape.</p>
    <div class="holes" id="holes">
      ${shuffleArr(kinds).map(k => `<div class="hole" data-k="${k}">${shape(k, "rgba(128,128,128,.3)")}</div>`).join("")}
    </div>
    <div class="bin" id="bin">
      ${shuffleArr(kinds).map(k => `<button class="shape" draggable="true" data-k="${k}">${shape(k, colors[k])}</button>`).join("")}
    </div>
  `;
  let selected = null;
  let left = kinds.length;
  brainHint = () => {
    const first = document.querySelector("#bin .shape");
    return first ? `Find the hole shaped like the ${first.dataset.k}.` : "Almost there!";
  };
  const tryDrop = (kind, hole) => {
    if (gameFinished || !kind) return;
    if (hole.dataset.k === kind && !hole.classList.contains("filled")) {
      hole.classList.add("filled");
      hole.innerHTML = shape(kind, colors[kind]);
      document.querySelector(`#bin .shape[data-k="${kind}"]`).remove();
      selected = null;
      playSound(600);
      if (--left === 0) completeLevel("Every shape found its home!");
    } else {
      hole.classList.add("shake");
      setTimeout(() => hole.classList.remove("shake"), 400);
      playSound(220);
      say("That shape doesn't fit there!");
    }
  };
  document.querySelectorAll("#bin .shape").forEach(item => {
    item.onclick = () => {
      selected = item.dataset.k;
      document.querySelectorAll("#bin .shape").forEach(x => x.classList.toggle("sel", x === item));
    };
    item.ondragstart = event => {
      selected = item.dataset.k;
      event.dataTransfer.setData("text/plain", selected);
    };
  });
  document.querySelectorAll("#holes .hole").forEach(hole => {
    hole.onclick = () => tryDrop(selected, hole);
    hole.ondragover = event => event.preventDefault();
    hole.ondrop = event => {
      event.preventDefault();
      tryDrop(event.dataTransfer.getData("text/plain"), hole);
    };
  });
}
function brainBalance() {
  const hard = difficulty === "hard";
  let w = [];
  let ok = false;
  while (!ok) {
    if (hard) {
      const [a, b, c, d, e] = [0, 0, 0, 0, 0].map(() => rnd(1, 9));
      const f = a + b + c - d - e;
      w = [a, b, c, d, e, f];
      ok = f >= 1 && f <= 12;
    } else {
      const [a, b, c] = [0, 0, 0].map(() => rnd(1, 9));
      const d = a + b - c;
      w = [a, b, c, d];
      ok = d >= 1 && d <= 12;
    }
  }
  const together = hard ? `${w[0]}, ${w[1]} and ${w[2]}` : `${w[0]} and ${w[1]}`;
  brainHint = () => `The weights ${together} belong on the same pan.`;
  const zone = w.map(() => 0); // 0 = pile, 1 = left pan, 2 = right pan
  const ids = ["pile", "pan1", "pan2"];
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Tap a weight to move it: pile → left pan → right pan. Make the scale balance!</p>
    <div class="scale">
      <div class="beam" id="beam"><div class="pan" id="pan1"></div><div class="pan" id="pan2"></div></div>
      <div class="stand"></div>
    </div>
    <div class="pile" id="pile"></div>
  `;
  const draw = () => {
    ids.forEach(id => (document.getElementById(id).innerHTML = ""));
    w.forEach((value, i) => {
      const block = document.createElement("button");
      block.className = "weight";
      block.textContent = value;
      block.style.setProperty("--s", `${34 + value * 3}px`);
      block.onclick = () => {
        if (gameFinished) return;
        zone[i] = (zone[i] + 1) % 3;
        playSound(380 + zone[i] * 70);
        draw();
      };
      document.getElementById(ids[zone[i]]).appendChild(block);
    });
    const sum = z => w.reduce((total, value, i) => total + (zone[i] === z ? value : 0), 0);
    const diff = sum(1) - sum(2);
    const angle = Math.max(-16, Math.min(16, -diff * 3));
    document.getElementById("beam").style.setProperty("--a", `${angle}deg`);
    if (zone.every(z => z !== 0) && diff === 0) completeLevel("Perfectly balanced!");
  };
  draw();
}
function brainSlide() {
  const n = difficulty === "hard" ? 4 : 3;
  const total = n * n;
  const b = [...Array(total).keys()].map(i => (i + 1) % total);
  let gap = total - 1;
  const neighbours = i => [i - n, i + n, i % n ? i - 1 : -1, (i + 1) % n ? i + 1 : -1]
    .filter(x => x >= 0 && x < total);
  for (let k = 0; k < (n === 3 ? 30 : 70); k++) {
    const options = neighbours(gap);
    const target = options[rnd(0, options.length - 1)];
    [b[gap], b[target]] = [b[target], b[gap]];
    gap = target;
  }
  brainHint = () => "Solve the top row first, then the next row, and so on.";
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Slide the tiles into order (1, 2, 3 …) with the gap at the end.</p>
    <div class="slide" id="slide"></div>
  `;
  const board = document.getElementById("slide");
  const els = {};
  const place = () => b.forEach((value, i) => {
    if (!value) return;
    els[value].style.left = `${(i % n) * 100 / n}%`;
    els[value].style.top = `${Math.floor(i / n) * 100 / n}%`;
  });
  const move = value => {
    if (gameFinished) return;
    const i = b.indexOf(value);
    if (!neighbours(gap).includes(i)) return;
    [b[i], b[gap]] = [b[gap], b[i]];
    gap = i;
    place();
    playSound(400);
    if (b.every((v, index) => v === (index + 1) % total)) completeLevel("Sliding champion!");
  };
  for (let value = 1; value < total; value++) {
    const tile = document.createElement("button");
    tile.className = "stile";
    tile.textContent = value;
    tile.style.width = `${100 / n}%`;
    tile.style.height = `${100 / n}%`;
    tile.onclick = () => move(value);
    board.appendChild(tile);
    els[value] = tile;
  }
  place();
}
function brainHanoi() {
  const n = difficulty === "hard" ? 4 : 3;
  const pegs = [[...Array(n).keys()].map(i => n - i), [], []];
  let selected = null;
  let moves = 0;
  brainHint = () => "Move the smallest disk first. Every other turn, move the smallest disk again!";
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Move the whole tower to the right-hand peg. A big disk can never sit on a smaller one.
      Tap a peg to lift its top disk, tap another peg to drop it. Moves: <b id="hMoves">0</b></p>
    <div class="hanoi" id="hanoi"></div>
  `;
  const draw = () => {
    document.getElementById("hanoi").innerHTML = pegs.map((peg, index) => `
      <div class="peg ${selected === index ? "lift" : ""}" data-p="${index}">
        <div class="pole"></div>
        ${peg.map(d => `<i class="disk" style="width:${28 + d * 15}%;background:hsl(${d * 65} 80% 60%)"></i>`).join("")}
      </div>`).join("");
    document.querySelectorAll("#hanoi .peg").forEach(el => {
      el.onclick = () => pegClick(Number(el.dataset.p));
    });
  };
  const pegClick = index => {
    if (gameFinished) return;
    if (selected === null) {
      if (pegs[index].length) selected = index;
    } else if (selected === index) {
      selected = null;
    } else {
      const disk = pegs[selected][pegs[selected].length - 1];
      const top = pegs[index][pegs[index].length - 1];
      if (top !== undefined && top < disk) {
        say("A big disk can't go on a smaller one!");
        playSound(220);
        selected = null;
        draw();
        return;
      }
      pegs[index].push(pegs[selected].pop());
      selected = null;
      moves++;
      document.getElementById("hMoves").textContent = moves;
      playSound(450);
      say("");
      if (pegs[2].length === n) {
        draw();
        completeLevel(`Tower moved in ${moves} moves!`);
        return;
      }
    }
    draw();
  };
  draw();
}
function brainTubes() {
  const colors = ["#ff5d73", "#4cc9f0", "#ffd166", "#06d6a0", "#a78bfa"]
    .slice(0, difficulty === "hard" ? 4 : 3);
  const cap = 4;
  const units = shuffleArr(colors.flatMap(c => Array(cap).fill(c)));
  const tubes = colors.map((_, i) => units.slice(i * cap, i * cap + cap));
  tubes.push([], []);
  let selected = null;
  brainHint = () => "Pour onto the same colour, or into an empty tube. Aim for one colour per tube.";
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Tap a tube, then tap another tube to pour. Sort the colours so every tube has just one colour.</p>
    <div class="tubes" id="tubes"></div>
  `;
  const draw = () => {
    const box = document.getElementById("tubes");
    box.innerHTML = "";
    tubes.forEach((tube, index) => {
      const el = document.createElement("button");
      el.className = "tube" + (selected === index ? " lift" : "");
      el.innerHTML = tube.map(c => `<i style="background:${c}"></i>`).join("");
      el.onclick = () => tubeClick(index);
      box.appendChild(el);
    });
  };
  const tubeClick = index => {
    if (gameFinished) return;
    if (selected === null) {
      if (tubes[index].length) selected = index;
    } else if (selected === index) {
      selected = null;
    } else {
      const from = tubes[selected];
      const to = tubes[index];
      const color = from[from.length - 1];
      if (to.length < cap && (to.length === 0 || to[to.length - 1] === color)) {
        while (from.length && from[from.length - 1] === color && to.length < cap) {
          to.push(from.pop());
        }
        playSound(500);
        say("");
      } else {
        say("You can't pour there!");
        playSound(220);
      }
      selected = null;
    }
    draw();
    if (tubes.every(t => t.length === 0 || (t.length === cap && t.every(c => c === t[0])))) {
      completeLevel("Every colour is sorted!");
    }
  };
  draw();
}
const ODD_SCENES = [
  {
    bg: `<rect width="400" height="300" fill="#cdeafe"/>
      <g class="rayspin" style="transform-origin:330px 60px"><circle cx="330" cy="60" r="42" fill="none" stroke="#ffd23f" stroke-width="6" stroke-dasharray="4 10"/></g>
      <g class="cloudmove"><ellipse cx="225" cy="38" rx="30" ry="12" fill="#fff" opacity=".9"/><ellipse cx="245" cy="32" rx="20" ry="10" fill="#fff" opacity=".9"/></g>
      <ellipse cx="80" cy="262" rx="230" ry="60" fill="#8bd17c"/><rect y="256" width="400" height="44" fill="#7ccf6b"/>
      <rect x="130" y="170" width="140" height="90" fill="#f4e3c1"/>
      <rect x="314" y="215" width="12" height="45" fill="#7a4a2b"/>`,
    diffs: [
      { x: 330, y: 60, r: 36, base: '<circle cx="330" cy="60" r="26" fill="#ffd23f"/>', alt: '<circle cx="330" cy="60" r="26" fill="#ff8a3d"/>' },
      { x: 100, y: 56, r: 36, base: '<g fill="#fff"><ellipse cx="90" cy="60" rx="34" ry="16"/><ellipse cx="115" cy="52" rx="26" ry="14"/></g>', alt: '' },
      { x: 200, y: 148, r: 40, base: '<polygon points="120,170 200,120 280,170" fill="#d1495b"/>', alt: '<polygon points="120,170 200,120 280,170" fill="#6a4c93"/>' },
      { x: 201, y: 232, r: 28, base: '<rect x="185" y="205" width="32" height="55" rx="3" fill="#6b4226"/>', alt: '<rect x="185" y="205" width="32" height="55" rx="3" fill="#2a9d8f"/>' },
      { x: 152, y: 200, r: 24, base: '<rect x="135" y="185" width="34" height="30" fill="#bde0fe"/><path d="M152 185v30M135 200h34" stroke="#fff" stroke-width="3"/>', alt: '<rect x="135" y="185" width="34" height="30" fill="#bde0fe"/>' },
      { x: 320, y: 185, r: 42, base: '<circle cx="320" cy="185" r="38" fill="#3a9d5d"/>', alt: '<circle cx="320" cy="185" r="26" fill="#3a9d5d"/>' },
      { x: 85, y: 268, r: 22, base: '<g fill="#ff6b9d"><circle cx="60" cy="262" r="8"/><circle cx="85" cy="270" r="8"/><circle cx="110" cy="260" r="8"/></g>', alt: '<g fill="#ff6b9d"><circle cx="60" cy="262" r="8"/><circle cx="85" cy="270" r="8" fill="#ffd23f"/><circle cx="110" cy="260" r="8"/></g>' },
      { x: 245, y: 68, r: 26, base: '<path d="M225 70q10-12 20 0q10-12 20 0" fill="none" stroke="#333" stroke-width="3"/>', alt: '' }
    ]
  },
  {
    bg: `<defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ad1f5"/><stop offset="1" stop-color="#0b5394"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#sea)"/>
      <path d="M0 268q100-30 200 0t200 0v32H0z" fill="#f2d49b"/>
      <circle class="bubble" cx="60" cy="210" r="5" fill="#fff" opacity=".6"/>
      <circle class="bubble b2" cx="360" cy="225" r="7" fill="#fff" opacity=".6"/>
      <circle class="bubble b3" cx="225" cy="190" r="4" fill="#fff" opacity=".6"/>`,
    diffs: [
      { x: 113, y: 97, r: 30, base: '<text x="95" y="110" font-size="36">🐠</text>', alt: '<text x="95" y="110" font-size="36">🐟</text>' },
      { x: 291, y: 150, r: 32, base: '<text x="270" y="165" font-size="42">🐙</text>', alt: '' },
      { x: 57, y: 272, r: 26, base: '<text x="40" y="285" font-size="34">🦀</text>', alt: '<text x="40" y="285" font-size="22">🦀</text>' },
      { x: 200, y: 279, r: 24, base: '<text x="185" y="290" font-size="30">⭐</text>', alt: '<text x="185" y="290" font-size="30" style="filter:hue-rotate(150deg)">⭐</text>' },
      { x: 345, y: 276, r: 24, base: '<text x="330" y="288" font-size="30">🐚</text>', alt: '' },
      { x: 137, y: 268, r: 26, base: '<text x="120" y="282" font-size="34">🌿</text>', alt: '<text x="146" y="282" font-size="34">🌿</text>' },
      { x: 252, y: 228, r: 26, base: '<text x="235" y="240" font-size="34">⚓</text>', alt: '<text x="235" y="240" font-size="34" transform="rotate(30 252 228)">⚓</text>' },
      { x: 202, y: 58, r: 28, base: '<text x="185" y="70" font-size="34">🐡</text>', alt: '<text x="185" y="70" font-size="34" transform="translate(404 0) scale(-1 1)">🐡</text>' }
    ]
  }
];
let oddChosen = [];
let oddFound = new Set();
function startOdd() {
  const scene = ODD_SCENES[(currentLevel - 1) % ODD_SCENES.length];
  const total = difficulty === "easy" ? 4 : 6;
  oddChosen = shuffleArr(scene.diffs).slice(0, total);
  oddFound = new Set();
  const draw = right => `<svg viewBox="0 0 400 300" class="spot-svg">${scene.bg}${
    scene.diffs.map(d => (right && oddChosen.includes(d) ? d.alt : d.base)).join("")
  }<g class="marks"></g></svg>`;
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Click the spots where the two pictures are different.
      Found: <b id="foundCount">0</b> / ${total}</p>
    <div class="spot">
      <div class="spot-box">${draw(false)}</div>
      <div class="spot-box">${draw(true)}</div>
    </div>
  `;
  document.querySelectorAll(".spot-svg").forEach(svg => {
    svg.onclick = event => {
      if (gameFinished) return;
      const rect = svg.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 400;
      const y = ((event.clientY - rect.top) / rect.height) * 300;
      const hit = oddChosen.find(d => !oddFound.has(d) && Math.hypot(x - d.x, y - d.y) <= d.r);
      if (hit) {
        oddFound.add(hit);
        document.querySelectorAll(".marks").forEach(group => {
          group.insertAdjacentHTML("beforeend",
            `<circle class="ring" cx="${hit.x}" cy="${hit.y}" r="${Math.min(hit.r, 32)}"/>`);
        });
        playSound(650);
        document.getElementById("foundCount").textContent = oddFound.size;
        say("");
        if (oddFound.size === total) completeLevel("Sharp eyes! You found every difference!");
      } else {
        say("Nothing different there - look again!");
        playSound(220);
      }
    };
  });
}
function startTyping() {
  const sentences = difficulty === "easy"
    ? [
        "The quick brown fox jumps over the lazy dog.",
        "Every day is a new chance to learn.",
        "Small steps can lead to big achievements.",
        "Keep thinking and never stop learning.",
        "A curious mind discovers new things."
      ]
    : [
        "Creative thinking turns difficult problems into opportunities.",
        "Consistency and patience are important parts of success.",
        "Challenge your assumptions and explore different solutions.",
        "The best ideas often come from asking better questions.",
        "Focus on the process and learn from every challenge."
      ];
  typingSentence = sentences[(currentLevel - 1) % sentences.length];
  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Type the sentence exactly as shown.</p>
    <div class="typing-target">${typingSentence}</div>
    <textarea class="game-input" id="typingInput" rows="3" placeholder="Start typing here..."></textarea>
    <br>
    <button class="game-action" id="typingCheck">CHECK TEXT</button>
  `;
  const input = document.getElementById("typingInput");
  document.getElementById("typingCheck").onclick = () => {
    if (input.value.trim() === typingSentence) {
      completeLevel("Perfect typing! Every word is correct!");
    } else {
      document.getElementById("gameMessage").textContent = "There are still some differences. Check your typing!";
    }
  };
}
const hintFns = {
  puzzle() {
    const slot = [...Array(puzzleSize * puzzleSize).keys()].find(k => puzzleSlots[k] !== k);
    if (slot === undefined) return "It already looks perfect!";
    [pieceEls[slot], slotEls[slot]].forEach(el => {
      el.classList.add("hint");
      setTimeout(() => el.classList.remove("hint"), 2500);
    });
    return "Put the glowing piece in the glowing square!";
  },
  memory() {
    if (memoryLock) return "Wait a moment, then try again.";
    const cards = [...document.querySelectorAll(".memory-card:not(.matched):not(.flipped)")];
    memoryLock = true;
    cards.forEach(card => (card.textContent = card.dataset.symbol));
    setTimeout(() => {
      cards.forEach(card => {
        if (!card.classList.contains("flipped") && !card.classList.contains("matched")) {
          card.textContent = "?";
        }
      });
      memoryLock = false;
    }, 1300);
    return "Peek! Remember where the pairs are.";
  },
  scramble() {
    return `The word starts with "${scrambleAnswer[0]}" and has ${scrambleAnswer.length} letters.`;
  },
  wordle() {
    const cells = document.querySelectorAll("#wordleGrid .wordle-cell");
    const open = [0, 1, 2, 3, 4].filter(i =>
      ![0, 1, 2, 3, 4, 5].some(row => cells[row * 5 + i].classList.contains("correct"))
    );
    if (!open.length) return "You already have every letter in place!";
    const i = open[Math.floor(Math.random() * open.length)];
    return `Letter ${i + 1} is "${wordleAnswer[i]}".`;
  },
  math() {
    const low = Math.floor(mathAnswer / 10) * 10;
    return `The answer is between ${low} and ${low + 10}.`;
  },
  reaction() {
    return "Don't click until the box turns GREEN. Clicking early restarts the round!";
  },
  brain() {
    return brainHint();
  },
  odd() {
    const target = oddChosen.find(d => !oddFound.has(d));
    if (!target) return "You found them all!";
    document.querySelectorAll(".marks").forEach(group => {
      group.insertAdjacentHTML("beforeend",
        `<circle class="hintring" cx="${target.x}" cy="${target.y}" r="${target.r + 14}"/>`);
      setTimeout(() => {
        const ring = group.querySelector(".hintring");
        if (ring) ring.remove();
      }, 2500);
    });
    return "Look inside the dashed circle!";
  },
  typing() {
    return `It starts with: "${typingSentence.split(" ").slice(0, 3).join(" ")}..." - watch the capitals and the full stop!`;
  }
};
function showHint() {
  if (gameFinished) return;
  if (currentGame === "puzzle" && puzzlePreviewing) {
    document.getElementById("gameMessage").textContent = "Get the picture ready first!";
    return;
  }
  const hintFn = hintFns[currentGame];
  if (!hintFn) return;
  const text = hintFn();
  hintsUsed++;
  if (timeMode === "fun") remaining = Math.max(1, remaining - 5);
  else elapsed += 5;
  updateTimerDisplay();
  if (!gameFinished) {
    document.getElementById("gameMessage").textContent = `💡 ${text}`;
  }
}
/* MINDRUSH extras: settings, music, Enter key, 6 new mini games.
   Load AFTER script.js (see the 2 lines to add in index.html). */
(() => {
  const $ = id => document.getElementById(id);
  const area = h => ($('gameArea').innerHTML = h);
  const msg = t => ($('gameMessage').textContent = t);
  const shuf = a => [...a].sort(() => Math.random() - 0.5);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const hard = () => difficulty === 'hard';
  const mk = (tag, cls, txt) => { const e = document.createElement(tag); e.className = cls; if (txt != null) e.textContent = txt; return e; };
    let mCtx, mGain, mTimer, step = 0, musicOn = true, vol = 0.5;
  const chords = [[261.6, 329.6, 392, 493.9], [220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [196, 246.9, 293.7, 392]];
  function note(f, t, d) {
    const o = mCtx.createOscillator(), g = mCtx.createGain();
    o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(mGain);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + d); o.start(t); o.stop(t + d);
  }
  function tick() {
    const c = chords[Math.floor(step / 8) % 4], n = c[[0, 1, 2, 3, 2, 1, 3, 1][step % 8]];
    note(n, mCtx.currentTime + 0.05, 1.4);
    if (step % 8 === 0) note(c[0] / 2, mCtx.currentTime + 0.05, 3);
    step++;
  }
  function musicStart() {
    if (!musicOn || !soundOn) return;
    if (!mCtx) { mCtx = new AudioContext(); mGain = mCtx.createGain(); mGain.connect(mCtx.destination); }
    mCtx.resume(); mGain.gain.value = vol * 0.3;
    if (!mTimer) mTimer = setInterval(tick, 500);
  }
  function musicStop() { clearInterval(mTimer); mTimer = null; if (mGain) mGain.gain.value = 0; }
  ['click', 'keydown'].forEach(ev => document.addEventListener(ev, musicStart));
    document.body.insertAdjacentHTML('beforeend', `
    <div id="settings" class="modal hidden"><div class="modal-card">
      <h2>Settings</h2>
      <label>Background music <input type="checkbox" id="setMusic" checked></label>
      <label>Music volume <input type="range" id="setVol" min="0" max="100" value="50"></label>
      <label>Sound effects <input type="checkbox" id="setSfx" checked></label>
      <div class="modal-row">
        <button class="mini-btn" id="unlockAll">🔓 Unlock all games</button>
        <button class="mini-btn" id="resetProg">↺ Reset progress</button>
      </div>
      <p class="modal-tip">Tip: press Enter to continue, 1-4 to pick answers, Esc to close this.</p>
      <button class="primary-btn" id="setClose">Done</button>
    </div></div>`);
  const sBtn = mk('button', 'icon-btn', '⚙️'); sBtn.title = 'Settings';
  $('soundBtn').after(sBtn);
  const openSet = () => $('settings').classList.remove('hidden');
  const closeSet = () => $('settings').classList.add('hidden');
  sBtn.onclick = openSet; $('setClose').onclick = closeSet;
  $('unlockAll').onclick = () => { progress.unlocked = [...GAME_ORDER]; saveProgress(); renderGames(); renderAchievements(); showToast('🔓 Every game is unlocked!'); };
  $('resetProg').onclick = () => {
    if (!confirm('Reset all unlocked games and achievements?')) return;
    progress = { unlocked: GAME_ORDER.slice(0, START_UNLOCKED), done: [], ach: [] };
    saveProgress(); renderGames(); renderAchievements();
  };
  $('settings').onclick = e => { if (e.target.id === 'settings') closeSet(); };
  const sync = () => {
    $('soundBtn').textContent = soundOn ? '🔊' : '🔇';
    $('setSfx').checked = soundOn;
    soundOn && musicOn ? musicStart() : musicStop();
  };
  window.toggleSound = () => { soundOn = !soundOn; sync(); };
  $('setMusic').onchange = e => { musicOn = e.target.checked; sync(); };
  $('setSfx').onchange = e => { soundOn = e.target.checked; sync(); };
  $('setVol').oninput = e => { vol = e.target.value / 100; if (mGain && musicOn && soundOn) mGain.gain.value = vol * 0.3; };
    const cl = completeLevel;
  completeLevel = m => { cl(m); document.activeElement && document.activeElement.blur(); };
  document.addEventListener('keydown', e => {
    if (!$('settings').classList.contains('hidden')) {
      if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); closeSet(); }
      return;
    }
    const t = e.target.tagName;
    if (e.key === 'Enter' && e.target.id === 'typingInput') { e.preventDefault(); $('typingCheck').click(); return; }
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t) || e.ctrlKey || e.metaKey || e.altKey) return;
    const on = id => $(id).classList.contains('active');
    if (e.key === 'Enter') {
      if (on('play') && !$('nextBtn').classList.contains('hidden')) { e.preventDefault(); $('nextBtn').click(); }
      else if (on('home') && e.target.id !== 'startBtn') { e.preventDefault(); $('startBtn').click(); }
      else if (on('result') && t !== 'BUTTON') document.querySelector('#result .primary-btn').click();
    } else if (on('play')) {
      if (/^[1-4]$/.test(e.key)) document.querySelectorAll('#gameArea .option-btn,#gameArea .pad')[e.key - 1]?.click();
      else if (currentGame === 'hangman' && /^[a-z]$/i.test(e.key)) guess(e.key.toUpperCase());
    }
  });
    const G = {};
  let flagName = '', sdState = null, cubeState = null, cwState = null, simonState = null;
  const FL = {
    easy: { fr: 'France', de: 'Germany', it: 'Italy', es: 'Spain', gb: 'United Kingdom', us: 'United States', jp: 'Japan', br: 'Brazil', ca: 'Canada', al: 'Albania', 'in': 'India', mx: 'Mexico' },
    hard: { td: 'Chad', ro: 'Romania', np: 'Nepal', bt: 'Bhutan', kg: 'Kyrgyzstan', mz: 'Mozambique', sz: 'Eswatini', sr: 'Suriname', bz: 'Belize', cy: 'Cyprus', xk: 'Kosovo', lk: 'Sri Lanka' }
  };
  const ALIAS = {
    'United Kingdom': ['uk', 'greatbritain', 'britain', 'england'],
    'United States': ['usa', 'us', 'america', 'unitedstatesofamerica'],
    'Eswatini': ['swaziland']
  };
  const clean = t => t.toLowerCase().replace(/[^a-z]/g, '');
  let usedFlags = [];
  G.flags = { name: 'Guess the Flag', icon: '🏁', cls: 'blue', desc: 'Name the country', start() {
    if (currentLevel === 1) usedFlags = [];
    const all = Object.entries(FL[difficulty]);
    const [code, name] = pick(all.filter(x => !usedFlags.includes(x[0]))); usedFlags.push(code); flagName = name;
    const opts = shuf([name, ...shuf(all.filter(x => x[1] !== name)).slice(0, 3).map(x => x[1])]);
    area(`<p class="game-hint">Which country has this flag? Tap an answer, or type it yourself.</p>
      <img class="flag-img" src="https://flagcdn.com/w320/${code}.png" alt="Flag">
      <div class="option-grid" id="fo"></div>
      <div class="flag-type"><input class="game-input" id="flagInput" placeholder="...or type the country" autocomplete="off">
      <button class="game-action" id="flagCheck">CHECK</button></div>`);
    const answers = [name, ...(ALIAS[name] || [])].map(clean);
    const check = text => {
      if (gameFinished) return;
      if (!clean(text)) { msg('Type a country name first.'); return; }
      if (answers.includes(clean(text))) completeLevel(`Yes! That's ${name}!`);
      else { msg('Not that one, try again!'); playSound(220); }
    };
    opts.forEach(o => { const b = mk('button', 'option-btn', o); b.onclick = () => check(o); $('fo').appendChild(b); });
    $('flagCheck').onclick = () => check($('flagInput').value);
    $('flagInput').onkeydown = e => { if (e.key === 'Enter') $('flagCheck').click(); };
  } };
  let hm = null;
  const HM_PARTS = [
    '<circle cx="130" cy="68" r="18"/>',
    '<path d="M130 86V140"/>',
    '<path d="M130 100L105 126"/>',
    '<path d="M130 100L155 126"/>',
    '<path d="M130 140L108 182"/>',
    '<path d="M130 140L152 182"/>'
  ];
  function drawHm() {
    if (!$('hw')) return;
    const wrong = hm.m - hm.l;
    document.querySelectorAll('.hm-part').forEach((p, i) => p.classList.toggle('on', i < wrong));
    $('hmFace').classList.toggle('on', hm.l <= 0);
    $('hl').textContent = `Wrong guesses: ${wrong} / ${hm.m}`;
    $('hw').textContent = [...hm.w].map(x => (hm.g.includes(x) || hm.l <= 0 ? x : '_')).join(' ');
    document.querySelectorAll('#hk .key').forEach(b => (b.disabled = hm.g.includes(b.dataset.k)));
  }
  function guess(c) {
    if (!hm || gameFinished || hm.g.includes(c)) return;
    hm.g.push(c); const hit = hm.w.includes(c); playSound(hit ? 520 : 220);
    if (!hit) hm.l--;
    drawHm();
    if ([...hm.w].every(x => hm.g.includes(x))) completeLevel(`Saved! The word was ${hm.w}.`);
    else if (hm.l <= 0) completeLevel(`Oh no! The word was ${hm.w}.`);
  }
  G.hangman = { name: 'Hangman', icon: '🪢', cls: 'orange', desc: 'Save the stick man', start() {
    const W = hard() ? ['ELEPHANT', 'KEYBOARD', 'ADVENTURE', 'MYSTERY', 'UNIVERSE', 'CHOCOLATE', 'BUTTERFLY', 'TREASURE']
                     : ['APPLE', 'TIGER', 'PIZZA', 'GUITAR', 'ROCKET', 'PENCIL', 'BANANA', 'CASTLE'];
    const m = hard() ? 6 : 7; hm = { w: pick(W), g: [], l: m, m };
    area(`<p class="game-hint">Tap letters or just type them on your keyboard.</p>
      <svg viewBox="0 0 200 220" class="hm-svg">
        <path class="hm-gallows" d="M20 210H150M50 210V20H130V50"/>
        <g class="hm-body">${HM_PARTS.map(p => `<g class="hm-part">${p}</g>`).join('')}</g>
        <path id="hmFace" class="hm-face" d="M121 62l6 6m0-6l-6 6M133 62l6 6m0-6l-6 6M122 78q8-6 16 0"/>
      </svg>
      <div class="hm-lives" id="hl"></div><div class="hm-word" id="hw"></div><div class="keys" id="hk"></div>`);
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(c => {
      const b = mk('button', 'key', c); b.dataset.k = c; b.onclick = () => guess(c); $('hk').appendChild(b);
    });
    drawHm();
  } };
  G.sudoku = { name: 'Sudoku', icon: '🔢', cls: 'purple', desc: 'Fill the grid', start() {
    const [n, br, bc, holes] = hard() ? [9, 3, 3, 36 + currentLevel * 3] : [4, 2, 2, 5 + currentLevel];
    const order = k => shuf([...Array(n / k).keys()]).flatMap(b => shuf([...Array(k).keys()]).map(i => b * k + i));
    const R = order(br), C = order(bc), perm = shuf([...Array(n).keys()].map(x => x + 1));
    const sol = R.map(r => C.map(c => perm[(bc * (r % br) + Math.floor(r / br) + c) % n]));
    const hole = new Set(shuf([...Array(n * n).keys()]).slice(0, holes));
    area(`<p class="game-hint">Every row, column and box needs 1-${n} exactly once.</p>
      <div class="sd" id="sd" style="grid-template-columns:repeat(${n},auto)"></div>
      <button class="game-action" id="sdc">CHECK GRID</button>`);
    const ins = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const i = mk('input', 'sd-c'); i.maxLength = 1; i.inputMode = 'numeric';
      if (hole.has(r * n + c)) {
        i.oninput = () => { i.value = i.value.replace(new RegExp(`[^1-${n}]`, 'g'), ''); };
        i.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $('sdc').click(); } };
      } else { i.value = sol[r][c]; i.disabled = true; }
      if ((c + 1) % bc === 0 && c < n - 1) i.classList.add('rb');
      if ((r + 1) % br === 0 && r < n - 1) i.classList.add('bb');
      ins.push(i); $('sd').appendChild(i);
    }
    sdState = { ins, sol, hole, n };
    $('sdc').onclick = () => {
      if (gameFinished) return;
      const g = [...Array(n)].map((_, r) => [...Array(n)].map((_, c) => +ins[r * n + c].value || 0));
      let good = true;
      for (let i = 0; i < n && good; i++) {
        const s = [new Set(), new Set(), new Set()], top = br * Math.floor(i / (n / bc)), left = bc * (i % (n / bc));
        for (let j = 0; j < n; j++) { s[0].add(g[i][j]); s[1].add(g[j][i]); s[2].add(g[top + Math.floor(j / bc)][left + j % bc]); }
        if (s.some(x => x.size < n || x.has(0))) good = false;
      }
      good ? completeLevel('Sudoku solved! Brilliant!') : msg('Not yet - look for repeats or empty boxes.');
    };
  } };
  G.cube = { name: 'Cube Fix', icon: '🧊', cls: 'teal', desc: 'Twist it back', start() {
    const n = hard() ? 4 : 3, col = ['#ff5d73', '#ffd166', '#06d6a0', '#4cc9f0'];
    const g = Array.from({ length: n }, (_, r) => Array(n).fill(r)); let mv = 0;
    const rowS = (r, d) => { d > 0 ? g[r].unshift(g[r].pop()) : g[r].push(g[r].shift()); };
    const colS = (c, d) => { const x = g.map(r => r[c]); d > 0 ? x.unshift(x.pop()) : x.push(x.shift()); x.forEach((v, r) => (g[r][c] = v)); };
    const solved = () => g.every((row, r) => row.every(v => v === r));
    cubeState = { g };
    do { for (let i = 0; i < (hard() ? 14 : 6); i++) { const d = Math.random() < 0.5 ? 1 : -1, k = Math.floor(Math.random() * n); Math.random() < 0.5 ? rowS(k, d) : colS(k, d); } } while (solved());
    area(`<p class="game-hint">Goal: one colour per row, top to bottom ${[...Array(n).keys()].map(r => `<i class="dot" style="background:${col[r]}"></i>`).join('')}<br>Moves: <b id="mv">0</b></p>
      <div class="cube" id="cu" style="grid-template-columns:repeat(${n + 2},1fr)"></div>`);
    const bt = (m, l) => `<button class="cb" data-m="${m}">${l}</button>`;
    const draw = () => {
      $('cu').innerHTML = '<span></span>' + g[0].map((_, c) => bt(`c,${c},-1`, '▲')).join('') + '<span></span>'
        + g.map((row, r) => bt(`r,${r},-1`, '◀') + row.map(v => `<i class="st" style="background:${col[v]}"></i>`).join('') + bt(`r,${r},1`, '▶')).join('')
        + '<span></span>' + g[0].map((_, c) => bt(`c,${c},1`, '▼')).join('') + '<span></span>';
    };
    $('cu').onclick = e => {
      const b = e.target.closest('.cb'); if (!b || gameFinished) return;
      const [t, i, d] = b.dataset.m.split(','); (t === 'r' ? rowS : colS)(+i, +d);
      mv++; $('mv').textContent = mv; playSound(400); draw();
      if (solved()) completeLevel(`Cube fixed in ${mv} moves!`);
    };
    draw();
  } };
  const CW = {
    easy: [
      { a: 'PLANT', ac: 'Grows in a garden', d: [[0, 'APE', 'Clever primate'], [2, 'CAT', 'Purring pet'], [4, 'ATE', 'Had lunch']] },
      { a: 'CLOUD', ac: 'Floats in the sky', d: [[0, 'ICE', 'Frozen water'], [2, 'TOP', 'Spinning toy'], [4, 'ODD', 'Strange']] },
      { a: 'BREAD', ac: 'Baked loaf', d: [[0, 'ABS', 'Six-pack muscles'], [2, 'BED', 'You sleep in it'], [4, 'ADD', 'Plus']] }
    ],
    hard: [
      { a: 'PLANETS', ac: 'Mars and Venus', d: [[0, 'APE', 'Tailless primate'], [3, 'ANT', 'Tiny colony worker'], [6, 'ASK', 'Pose a question']] },
      { a: 'MYSTERY', ac: 'Something unsolved', d: [[0, 'EMU', 'Flightless bird'], [3, 'ATE', 'Consumed'], [6, 'AYE', 'Vote in favour']] },
      { a: 'CAPITAL', ac: 'London, for England', d: [[0, 'ICE', 'Skating surface'], [3, 'AIM', 'Take a target'], [6, 'ALE', 'Pub drink']] }
    ]
  };
  G.crossword = { name: 'Mini Crossword', icon: '✎', cls: 'green', desc: 'Words that cross', start() {
    const p = CW[hard() ? 'hard' : 'easy'][(currentLevel - 1) % 3], L = p.a.length;
    const S = [...Array(3)].map(() => Array(L).fill(''));
    [...p.a].forEach((ch, c) => (S[1][c] = ch)); p.d.forEach(([c, w]) => { S[0][c] = w[0]; S[2][c] = w[2]; });
    let h = `<div class="cw" style="grid-template-columns:repeat(${L},1fr)">`;
    for (let r = 0; r < 3; r++) for (let c = 0; c < L; c++) {
      const d = p.d.findIndex(x => x[0] === c);
      h += S[r][c] ? `<span class="cw-c"><input maxlength="1" data-r="${r}" data-c="${c}">${r === 0 ? `<b>${d + 1}</b>` : r === 1 && c === 0 ? '<b>A</b>' : ''}</span>` : '<span class="cw-x"></span>';
    }
    h += `</div><div class="clues"><p><b>Across (middle row):</b> ${p.ac}</p>${p.d.map((x, i) => `<p><b>Down ${i + 1}:</b> ${x[2]}</p>`).join('')}</div>
      <button class="game-action" id="cwc">CHECK CROSSWORD</button>`;
    area(h);
    const ins = [...document.querySelectorAll('.cw input')];
    ins.forEach((i, k) => {
      i.oninput = () => { i.value = i.value.replace(/[^a-z]/gi, '').toUpperCase(); if (i.value && ins[k + 1]) ins[k + 1].focus(); };
      i.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $('cwc').click(); } };
    });
    cwState = { ins, S };
    $('cwc').onclick = () => {
      if (gameFinished) return;
      ins.every(i => i.value === S[+i.dataset.r][+i.dataset.c]) ? completeLevel('Crossword complete! Nice one!') : msg('Some letters are wrong or missing.');
    };
  } };
  G.simon = { name: 'Pattern Echo', icon: '🎵', cls: 'pink', desc: 'Repeat the pattern', start() {
    const L = (hard() ? 5 : 3) + currentLevel, gap = hard() ? 450 : 700;
    const seq = Array.from({ length: L }, () => Math.floor(Math.random() * 4)); let pos = 0, lock = true;
    area(`<p class="game-hint" id="sh">Watch the pattern...</p>
      <div class="simon">${[0, 1, 2, 3].map(i => `<button class="pad sp${i}" data-i="${i}"></button>`).join('')}</div>`);
    const pads = [...document.querySelectorAll('.pad')];
    const flash = i => { pads[i].classList.add('lit'); playSound(300 + i * 120); setTimeout(() => pads[i].classList.remove('lit'), 300); };
    const play = () => {
      lock = true; pos = 0; $('sh') && ($('sh').textContent = 'Watch the pattern...');
      seq.forEach((s, k) => setTimeout(() => { if (!gameFinished && $('sh')) flash(s); }, 800 + k * gap));
      setTimeout(() => { if ($('sh')) { lock = false; $('sh').textContent = 'Your turn! (keys 1-4 work too)'; } }, 800 + L * gap);
    };
    pads.forEach(p => (p.onclick = () => {
      if (lock || gameFinished) return;
      const i = +p.dataset.i; flash(i);
      if (i !== seq[pos]) { msg('Oops! Watch again.'); setTimeout(() => { msg(''); play(); }, 800); lock = true; return; }
      if (++pos === L) completeLevel('Perfect memory!');
    }));
    simonState = { replay: () => { if (lock || gameFinished) return false; play(); return true; } };
    play();
  } };
    hintFns.flags = () => {
    const wrong = [...document.querySelectorAll('#fo .option-btn')].filter(b => !b.disabled && b.textContent !== flagName);
    if (!wrong.length) return 'Only the right answer is left!';
    pick(wrong).disabled = true;
    return 'Crossed out one wrong country.';
  };
  hintFns.hangman = () => {
    const left = [...hm.w].filter(c => !hm.g.includes(c));
    if (!left.length) return 'You already have every letter!';
    const c = pick(left); guess(c);
    return `Revealed the letter ${c}.`;
  };
  hintFns.sudoku = () => {
    const { ins, sol, hole, n } = sdState;
    const bad = [...hole].filter(i => ins[i].value !== String(sol[Math.floor(i / n)][i % n]));
    if (!bad.length) return 'Everything matches - press CHECK GRID!';
    const i = pick(bad); ins[i].value = sol[Math.floor(i / n)][i % n]; ins[i].classList.add('hinted');
    return 'Filled in one square for you.';
  };
  hintFns.cube = () => {
    const names = ['red', 'yellow', 'green', 'blue'], g = cubeState.g;
    const r = g.findIndex((row, i) => row.some(v => v !== i));
    return r === -1 ? 'Looks solved!' : `Row ${r + 1} should be all ${names[r]}. Fix one row at a time, top to bottom.`;
  };
  hintFns.crossword = () => {
    const { ins, S } = cwState;
    const bad = ins.filter(i => i.value !== S[+i.dataset.r][+i.dataset.c]);
    if (!bad.length) return 'All correct - press CHECK!';
    const i = pick(bad); i.value = S[+i.dataset.r][+i.dataset.c]; i.classList.add('hinted');
    return 'Revealed one letter.';
  };
  hintFns.simon = () => (simonState.replay() ? 'Watch the pattern again!' : 'Wait until the pattern finishes.');
    Object.entries(G).forEach(([k, g]) => { games[k] = g.start; gameNames[k] = g.name; });
  Object.entries(G).forEach(([k, g]) => { gameMeta[k] = { icon: g.icon, cls: g.cls, desc: g.desc }; });
  gameMeta.hangman.desc = 'Save the stick man';
  renderGames();
  renderAchievements();
})();

