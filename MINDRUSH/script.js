// MINDRUSH - Main game settings

let difficulty = "easy";
let timeMode = "stopwatch";
let duration = 4;

let currentGame = "";
let level = 1;
let elapsed = 0;
let remaining = 0;
let timerInterval = null;
let selectedTile = null;
let soundOn = true;

let puzzleTiles = [];
let memoryFirst = null;
let memoryLocked = false;
let memoryMatches = 0;
let mathAnswer = 0;
let scrambleAnswer = "";
let wordleAnswer = "";
let wordleGuesses = [];
let wordleFinished = false;

const easyImages = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900"
];

const hardImages = [
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900",
  "https://images.unsplash.com/photo-1511497584788-876760111969?w=900",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=900"
];

const easyWords = [
  "PLANET", "GARDEN", "ORANGE", "PUZZLE", "FLOWER",
  "WINDOW", "POCKET", "SILVER", "BRIGHT", "MONKEY"
];

const hardWords = [
  "GHOST", "CRANE", "BLINK", "STORM", "FLAME",
  "SHARP", "QUEST", "TRICK", "NIGHT", "FROST"
];

const wordleWords = [
  "APPLE", "BRAIN", "CHAIR", "DREAM", "EARTH",
  "FLAME", "GRAPE", "HOUSE", "JUICE", "KNIFE",
  "LEMON", "MUSIC", "NIGHT", "OCEAN", "PIANO",
  "QUEEN", "RIVER", "SMILE", "TRAIN", "WATER",
  "ZEBRA", "CLOUD", "PLANT", "LIGHT", "STONE",
  "TIGER", "MOUSE", "SNAKE", "BEACH", "HEART"
];

const memorySymbols = [
  "🍓", "🍋", "🍇", "🍒",
  "🍉", "🍍", "🥝", "🍑"
];

// Screen navigation

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
}

function goHome() {
  stopTimer();
  showScreen("home");
}

function backToGames() {
  stopTimer();
  showScreen("games");
}

function updateTheme() {
  document.body.classList.toggle("hard", difficulty === "hard");
}

// Difficulty selection

document.querySelectorAll("[data-difficulty]").forEach(button => {
  button.addEventListener("click", () => {
    difficulty = button.dataset.difficulty;

    document.querySelectorAll("[data-difficulty]").forEach(btn => {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");
    updateTheme();
  });
});

// Time mode selection

document.querySelectorAll("[data-timemode]").forEach(button => {
  button.addEventListener("click", () => {
    timeMode = button.dataset.timemode;

    document.querySelectorAll("[data-timemode]").forEach(btn => {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");

    document.getElementById("durationBox").classList.toggle(
      "hidden",
      timeMode !== "fun"
    );
  });
});

document.getElementById("duration").addEventListener("change", event => {
  duration = Number(event.target.value);
});

document.getElementById("startBtn").addEventListener("click", () => {
  duration = Number(document.getElementById("duration").value);

  document.getElementById("modeInfo").textContent =
    difficulty.toUpperCase() + " MODE • " +
    (timeMode === "fun"
      ? duration + " MINUTE FUN MODE"
      : "STOPWATCH MODE");

  showScreen("games");
});

// Sound button

document.getElementById("soundBtn").addEventListener("click", () => {
  soundOn = !soundOn;

  document.getElementById("soundBtn").textContent =
    soundOn ? "🔊 SOUND ON" : "🔇 SOUND OFF";
});

function playSound() {
  if (!soundOn) return;

  try {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/pop.ogg"
    );

    audio.volume = 0.25;
    audio.play().catch(() => {});
  } catch (error) {
    // Sound is optional.
  }
}

// Timer system

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return String(minutes).padStart(2, "0") + ":" +
    String(secs).padStart(2, "0");
}

function updateTimerDisplay() {
  const timer = document.getElementById("timer");

  if (timeMode === "fun") {
    timer.textContent = formatTime(remaining);
  } else {
    timer.textContent = formatTime(elapsed);
  }
}

function startTimer() {
  stopTimer();

  elapsed = 0;
  remaining = duration * 60;

  document.getElementById("timerLabel").textContent =
    timeMode === "fun" ? "TIME LEFT" : "TIME TAKEN";

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    elapsed++;

    if (timeMode === "fun") {
      remaining--;

      if (remaining <= 0) {
        remaining = 0;
        updateTimerDisplay();
        stopTimer();
        showResult(false, "Time's up!", "The timer ran out. Try again!");
        return;
      }
    }

    updateTimerDisplay();
  }, 1000);
}

// Game opening

function openGame(game) {
  currentGame = game;
  level = 1;

  showScreen("play");

  document.getElementById("nextBtn").classList.add("hidden");
  document.getElementById("gameMessage").textContent = "Good luck!";

  startLevel();
}

function startLevel() {
  stopTimer();

  elapsed = 0;
  remaining = duration * 60;

  document.getElementById("nextBtn").classList.add("hidden");
  document.getElementById("gameMessage").textContent = "You can do it!";

  const titles = {
    puzzle: "Picture Puzzle",
    memory: "Memory Match",
    scramble: "Word Scramble",
    wordle: "Wordle",
    math: "Quick Math"
  };

  document.getElementById("gameTitle").textContent = titles[currentGame];

  document.getElementById("levelLabel").textContent =
    "Level " + level + " • " + difficulty.toUpperCase();

  document.getElementById("progressBar").style.width =
    ((level - 1) / maxLevels()) * 100 + "%";

  if (currentGame === "puzzle") startPuzzle();
  if (currentGame === "memory") startMemory();
  if (currentGame === "scramble") startScramble();
  if (currentGame === "wordle") startWordle();
  if (currentGame === "math") startMath();

  startTimer();
}

function maxLevels() {
  return difficulty === "easy" ? 4 : 6;
}

function completeLevel() {
  stopTimer();
  playSound();

  document.getElementById("progressBar").style.width =
    (level / maxLevels()) * 100 + "%";

  document.getElementById("gameMessage").textContent =
    "Level completed! Great job!";

  if (level >= maxLevels()) {
    showResult(true, "You did it!", "You completed all the levels!");
  } else {
    document.getElementById("nextBtn").classList.remove("hidden");
  }
}

document.getElementById("nextBtn").addEventListener("click", () => {
  level++;
  startLevel();
});

// Results

function showResult(success, title, message) {
  stopTimer();

  const totalTime = elapsed;
  const timeTaken = formatTime(totalTime);

  document.getElementById("resultIcon").textContent =
    success ? "🏆" : "⏰";

  document.getElementById("resultTitle").textContent = title;
  document.getElementById("resultText").textContent = message;

  document.getElementById("resultTime").textContent =
    timeMode === "fun"
      ? formatTime(remaining) + " left"
      : timeTaken;

  document.getElementById("resultLevel").textContent = level;

  showScreen("result");
}

// PICTURE PUZZLE

function startPuzzle() {
  const area = document.getElementById("gameArea");

  const size = difficulty === "easy"
    ? Math.min(level + 1, 4)
    : Math.min(level + 4, 8);

  const images = difficulty === "easy" ? easyImages : hardImages;
  const image = images[(level - 1) % images.length];

  const total = size * size;

  puzzleTiles = Array.from({ length: total }, (_, index) => index);

  // Shuffle the tiles.
  for (let i = puzzleTiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [puzzleTiles[i], puzzleTiles[j]] =
      [puzzleTiles[j], puzzleTiles[i]];
  }

  // Make sure the puzzle is not already solved.
  if (puzzleTiles.every((value, index) => value === index)) {
    [puzzleTiles[0], puzzleTiles[1]] =
      [puzzleTiles[1], puzzleTiles[0]];
  }

  selectedTile = null;

  area.innerHTML = `
    <div class="level-buttons">
      <span>Level ${level}</span>
      <span>${size} × ${size} puzzle</span>
    </div>

    <div class="puzzle-layout">
      <div>
        <div id="puzzleBoard" class="puzzle-board"
          style="grid-template-columns:repeat(${size},1fr)">
        </div>
      </div>

      <div class="puzzle-side">
        <img class="reference-image" src="${image}" alt="Puzzle preview">
        <p>Reference picture</p>
        <p>Click two pieces to swap them.</p>
      </div>
    </div>
  `;

  const board = document.getElementById("puzzleBoard");

  puzzleTiles.forEach((piece, position) => {
    const tile = document.createElement("button");

    tile.className = "tile";
    tile.style.backgroundImage = `url("${image}")`;
    tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;

    const originalRow = Math.floor(piece / size);
    const originalCol = piece % size;

    tile.style.backgroundPosition =
      `${originalCol * 100 / (size - 1)}% ${originalRow * 100 / (size - 1)}%`;

    // Use precise percentage positions for each puzzle piece.
    tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
    tile.style.backgroundPosition =
      `${(originalCol / (size - 1)) * 100}% ${(originalRow / (size - 1)) * 100}%`;

    tile.addEventListener("click", () => {
      selectPuzzleTile(position, size, image);
    });

    board.appendChild(tile);
  });

  // Correct background position for puzzle crops.
  drawPuzzle(size, image);
}

function drawPuzzle(size, image) {
  const board = document.getElementById("puzzleBoard");
  board.innerHTML = "";

  puzzleTiles.forEach((piece, position) => {
    const tile = document.createElement("button");
    tile.className = "tile";

    const row = Math.floor(piece / size);
    const col = piece % size;

    tile.style.backgroundImage = `url("${image}")`;
    tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
    tile.style.backgroundPosition =
      `${col * 100 / (size - 1)}% ${row * 100 / (size - 1)}%`;

    if (selectedTile === position) {
      tile.classList.add("selected");
    }

    tile.addEventListener("click", () => {
      selectPuzzleTile(position, size, image);
    });

    board.appendChild(tile);
  });
}

function selectPuzzleTile(position, size, image) {
  if (selectedTile === null) {
    selectedTile = position;
  } else {
    const first = selectedTile;
    const second = position;

    [puzzleTiles[first], puzzleTiles[second]] =
      [puzzleTiles[second], puzzleTiles[first]];

    selectedTile = null;
  }

  drawPuzzle(size, image);

  const solved = puzzleTiles.every((piece, index) => piece === index);

  if (solved) {
    completeLevel();
  }
}

// MEMORY MATCH

function startMemory() {
  const area = document.getElementById("gameArea");

  const pairs = difficulty === "easy"
    ? Math.min(4 + level, 6)
    : Math.min(6 + level, 8);

  const symbols = memorySymbols.slice(0, pairs);
  const cards = [...symbols, ...symbols]
    .sort(() => Math.random() - 0.5);

  memoryFirst = null;
  memoryLocked = false;
  memoryMatches = 0;

  area.innerHTML = `
    <div class="center-game">
      <h3>Find all matching pairs!</h3>
      <p>Matches: <span id="matchCount">0</span> / ${pairs}</p>
      <div class="memory-grid" id="memoryGrid"></div>
    </div>
  `;

  const grid = document.getElementById("memoryGrid");

  cards.forEach(symbol => {
    const card = document.createElement("button");
    card.className = "memory-card";
    card.textContent = "?";
    card.dataset.symbol = symbol;

    card.addEventListener("click", () => {
      if (
        memoryLocked ||
        card.classList.contains("revealed") ||
        card.classList.contains("matched")
      ) return;

      card.textContent = symbol;
      card.classList.add("revealed");

      if (!memoryFirst) {
        memoryFirst = card;
        return;
      }

      if (memoryFirst.dataset.symbol === card.dataset.symbol) {
        memoryFirst.classList.add("matched");
        card.classList.add("matched");

        memoryFirst = null;
        memoryMatches++;

        document.getElementById("matchCount").textContent =
          memoryMatches;

        if (memoryMatches === pairs) {
          completeLevel();
        }
      } else {
        memoryLocked = true;
        const first = memoryFirst;

        setTimeout(() => {
          first.textContent = "?";
          card.textContent = "?";

          first.classList.remove("revealed");
          card.classList.remove("revealed");

          memoryFirst = null;
          memoryLocked = false;
        }, 700);
      }
    });

    grid.appendChild(card);
  });
}

// WORD SCRAMBLE

function startScramble() {
  const area = document.getElementById("gameArea");

  const words = difficulty === "easy" ? easyWords : hardWords;
  const word = words[Math.floor(Math.random() * words.length)];

  scrambleAnswer = word;

  const scrambled = word.split("").sort(() => Math.random() - 0.5).join("");

  area.innerHTML = `
    <div class="center-game">
      <h3>Unscramble this word!</h3>
      <div class="big-word">${scrambled}</div>
      <input id="scrambleInput" class="answer-input"
        placeholder="Type the correct word" maxlength="10">
      <button id="scrambleSubmit" class="action-btn">CHECK ANSWER</button>
    </div>
  `;

  document.getElementById("scrambleSubmit").addEventListener("click", checkScramble);

  document.getElementById("scrambleInput").addEventListener("keydown", event => {
    if (event.key === "Enter") checkScramble();
  });
}

function checkScramble() {
  const answer = document.getElementById("scrambleInput")
    .value.trim().toUpperCase();

  if (answer === scrambleAnswer) {
    completeLevel();
  } else {
    document.getElementById("gameMessage").textContent =
      "Not quite! Try again.";
  }
}

// WORDLE

function startWordle() {
  const area = document.getElementById("gameArea");

  const words = difficulty === "easy"
    ? wordleWords
    : wordleWords.filter(word => wordleWords.indexOf(word) % 2 === 0);

  wordleAnswer = words[Math.floor(Math.random() * words.length)];
  wordleGuesses = [];
  wordleFinished = false;

  area.innerHTML = `
    <div class="center-game">
      <h3>Guess the five-letter word!</h3>
      <p>Green = correct spot • Yellow = wrong spot • Grey = not in word</p>

      <div class="wordle-board" id="wordleBoard"></div>

      <div class="wordle-input-row">
        <input id="wordleInput" class="answer-input"
          maxlength="5" placeholder="5 letters" autocomplete="off">
        <button id="wordleSubmit" class="action-btn">GO</button>
      </div>

      <p id="wordleMessage">You have 6 guesses.</p>
    </div>
  `;

  drawWordle();

  document.getElementById("wordleSubmit")
    .addEventListener("click", submitWordle);

  document.getElementById("wordleInput")
    .addEventListener("keydown", event => {
      if (event.key === "Enter") submitWordle();
    });
}

function drawWordle() {
  const board = document.getElementById("wordleBoard");
  board.innerHTML = "";

  for (let row = 0; row < 6; row++) {
    const rowElement = document.createElement("div");
    rowElement.className = "wordle-row";

    for (let col = 0; col < 5; col++) {
      const cell = document.createElement("div");
      cell.className = "wordle-cell";

      const guess = wordleGuesses[row];

      if (guess) {
        cell.textContent = guess.word[col];
        cell.classList.add(guess.colors[col]);
      }

      rowElement.appendChild(cell);
    }

    board.appendChild(rowElement);
  }
}

function submitWordle() {
  if (wordleFinished) return;

  const input = document.getElementById("wordleInput");
  const guess = input.value.trim().toUpperCase();

  if (!/^[A-Z]{5}$/.test(guess)) {
    document.getElementById("wordleMessage").textContent =
      "Please enter exactly five letters.";
    return;
  }

  // Simple word validation: accept words from the game word list
  // and the secret word.
  if (!wordleWords.includes(guess) && guess !== wordleAnswer) {
    document.getElementById("wordleMessage").textContent =
      "That word isn't in the word list. Try another!";
    return;
  }

  const colors = [];
  const answerLetters = wordleAnswer.split("");
  const guessLetters = guess.split("");

  // First mark letters in the correct position.
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      colors[i] = "correct";
      answerLetters[i] = null;
      guessLetters[i] = null;
    }
  }

  // Then mark letters in the wrong position.
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === null) continue;

    const foundIndex = answerLetters.indexOf(guessLetters[i]);

    if (foundIndex !== -1) {
      colors[i] = "present";
      answerLetters[foundIndex] = null;
    } else {
      colors[i] = "absent";
    }
  }

  wordleGuesses.push({ word: guess, colors });

  drawWordle();
  input.value = "";

  if (guess === wordleAnswer) {
    wordleFinished = true;
    document.getElementById("wordleMessage").textContent =
      "You found the word!";
    completeLevel();
    return;
  }

  if (wordleGuesses.length >= 6) {
    wordleFinished = true;
    document.getElementById("wordleMessage").textContent =
      "The word was " + wordleAnswer + ".";
    document.getElementById("gameMessage").textContent =
      "Try again to beat this level.";
    stopTimer();
    document.getElementById("nextBtn").classList.add("hidden");
    return;
  }

  document.getElementById("wordleMessage").textContent =
    (6 - wordleGuesses.length) + " guesses remaining.";
}

// QUICK MATH

function startMath() {
  const area = document.getElementById("gameArea");

  let a, b, operator;

  if (difficulty === "easy") {
    a = Math.floor(Math.random() * (10 + level * 5)) + 1;
    b = Math.floor(Math.random() * (10 + level * 5)) + 1;
    operator = Math.random() > 0.5 ? "+" : "-";
  } else {
    a = Math.floor(Math.random() * (15 + level * 10)) + 5;
    b = Math.floor(Math.random() * (10 + level * 5)) + 1;
    operator = ["+", "-", "×"][Math.floor(Math.random() * 3)];
  }

  if (operator === "-" && b > a) {
    [a, b] = [b, a];
  }

  if (operator === "+") mathAnswer = a + b;
  if (operator === "-") mathAnswer = a - b;
  if (operator === "×") mathAnswer = a * b;

  area.innerHTML = `
    <div class="center-game">
      <h3>Solve this question!</h3>
      <div class="math-question">${a} ${operator} ${b} = ?</div>
      <input id="mathInput" class="answer-input"
        type="number" placeholder="Your answer">
      <button id="mathSubmit" class="action-btn">SUBMIT</button>
    </div>
  `;

  document.getElementById("mathSubmit").addEventListener("click", checkMath);

  document.getElementById("mathInput").addEventListener("keydown", event => {
    if (event.key === "Enter") checkMath();
  });
}

function checkMath() {
  const answer = Number(document.getElementById("mathInput").value);

  if (answer === mathAnswer) {
    completeLevel();
  } else {
    document.getElementById("gameMessage").textContent =
      "Wrong answer. Try once more!";
  }
}