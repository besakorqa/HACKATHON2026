

 /* =====================================
   MINDRUSH - MAIN SETTINGS
===================================== */

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
let puzzleTiles = [];
let selectedTile = null;
let memoryFirst = null;
let memoryLock = false;
let memoryMatches = 0;
let wordleAttempts = 0;
let wordleAnswer = "";
let wordleFinished = false;
let brainQuestion = null;
let oddAnswer = 0;
let typingSentence = "";
let mathAnswer = 0;

/* =====================================
   GAME DATA
===================================== */

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

const brainQuestions = [
  {
    easy: [
      { q: "I am an odd number. Remove one letter and I become even. What am I?", a: ["Seven", "Nine", "Five", "Three"], correct: 0 },
      { q: "What comes next? 2, 4, 6, 8, ?", a: ["9", "10", "12", "14"], correct: 1 },
      { q: "A clock shows 3:00. What is the angle between its hands?", a: ["45°", "60°", "90°", "180°"], correct: 2 },
      { q: "Which number is missing? 5, 10, 15, __, 25", a: ["18", "20", "22", "30"], correct: 1 },
      { q: "If you have 3 apples and take away 2, how many do you have?", a: ["1", "2", "3", "5"], correct: 1 }
    ],
    hard: [
      { q: "What comes next? 1, 4, 9, 16, 25, ?", a: ["30", "32", "36", "49"], correct: 2 },
      { q: "A number multiplied by 3, then increased by 6, equals 24. What is it?", a: ["4", "5", "6", "8"], correct: 2 },
      { q: "Which number does not belong? 2, 3, 5, 9, 11", a: ["2", "5", "9", "11"], correct: 2 },
      { q: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops Lazzies?", a: ["Yes", "No", "Sometimes", "Cannot tell"], correct: 0 },
      { q: "What comes next? 3, 6, 12, 24, ?", a: ["36", "42", "48", "60"], correct: 2 }
    ]
  }
];

/* =====================================
   SCREEN NAVIGATION
===================================== */

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

  document.getElementById("modeInfo").textContent =
    `${difficultyName} · ${timeName}`;
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
    // Sound is optional.
  }
}

/* =====================================
   STARTING GAMES
===================================== */

function openGame(game) {
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
  document.getElementById("levelLabel").textContent =
    `LEVEL ${currentLevel} / ${maxLevelCount}`;

  document.getElementById("progressBar").style.width =
    `${((currentLevel - 1) / maxLevelCount) * 100}%`;

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

  document.getElementById("gameTitle").textContent = gameNames[currentGame];

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

  games[currentGame]();
  updateTimerDisplay();
  startTimer();
}

/* =====================================
   TIMER
===================================== */

function startTimer() {
  stopTimer();

  timerInterval = setInterval(() => {
    if (gameFinished) return;

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

  if (timeMode === "fun") {
    timer.textContent = formatTime(Math.max(0, remaining));
  } else {
    timer.textContent = formatTime(elapsed);
  }
}

/* =====================================
   LEVEL COMPLETION
===================================== */

function completeLevel(message = "Great job! Level completed!") {
  if (gameFinished) return;

  gameFinished = true;
  stopTimer();
  playSound(700);

  document.getElementById("gameMessage").textContent = message;
  document.getElementById("progressBar").style.width =
    `${(currentLevel / maxLevelCount) * 100}%`;

  const nextBtn = document.getElementById("nextBtn");
  nextBtn.classList.remove("hidden");

  if (currentLevel >= maxLevelCount) {
    nextBtn.textContent = "FINISH GAME →";
  } else {
    nextBtn.textContent = "NEXT LEVEL →";
  }

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

  document.getElementById("resultIcon").textContent =
    won ? "🏆" : "⏰";

  document.getElementById("resultTitle").textContent =
    won ? "You're amazing!" : "Time's up!";

  document.getElementById("resultText").textContent =
    won
      ? "You completed all five levels. Your brain is on fire!"
      : "The timer ran out. Try the challenge again!";

  document.getElementById("resultTime").textContent =
    timeMode === "fun"
      ? formatTime(duration - remaining)
      : formatTime(elapsed);

  document.getElementById("resultLevel").textContent =
    `${currentLevel} / ${maxLevelCount}`;
}

/* =====================================
   1. PICTURE PUZZLE
===================================== */

function startPuzzle() {
  const size = difficulty === "easy"
    ? Math.min(3 + Math.floor((currentLevel - 1) / 2), 4)
    : Math.min(5 + currentLevel - 1, 8);

  const photoIndex = (difficulty === "easy" ? 0 : 5) + currentLevel - 1;
  const photo = puzzlePhotos[photoIndex % puzzlePhotos.length];

  puzzleTiles = Array.from(
    { length: size * size },
    (_, index) => index
  );

  // Shuffle by swapping pieces so the puzzle remains solvable.
  for (let i = 0; i < size * size * 12; i++) {
    const a = Math.floor(Math.random() * puzzleTiles.length);
    const b = Math.floor(Math.random() * puzzleTiles.length);

    [puzzleTiles[a], puzzleTiles[b]] =
      [puzzleTiles[b], puzzleTiles[a]];
  }

  if (puzzleTiles.every((value, index) => value === index)) {
    [puzzleTiles[0], puzzleTiles[1]] =
      [puzzleTiles[1], puzzleTiles[0]];
  }

  const area = document.getElementById("gameArea");

  area.innerHTML = `
    <p class="game-hint">
      ${size} × ${size} puzzle · Select two pieces to swap them.
    </p>
    <div class="puzzle-board"
      id="puzzleBoard"
      style="grid-template-columns:repeat(${size},1fr)">
    </div>
  `;

  drawPuzzle(photo, size);
}

function drawPuzzle(photo, size) {
  const board = document.getElementById("puzzleBoard");
  board.innerHTML = "";

  puzzleTiles.forEach((piece, position) => {
    const tile = document.createElement("button");
    tile.className = "puzzle-tile";

    const row = Math.floor(piece / size);
    const col = piece % size;

    tile.style.backgroundImage = `url("${photo}")`;
    tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
    tile.style.backgroundPosition =
      `${size === 1 ? 0 : (col / (size - 1)) * 100}% ${size === 1 ? 0 : (row / (size - 1)) * 100}%`;

    if (piece === position) {
      tile.style.opacity = "1";
    }

    tile.addEventListener("click", () => {
      if (gameFinished) return;

      if (selectedTile === null) {
        selectedTile = position;
        tile.classList.add("selected");
      } else if (selectedTile === position) {
        selectedTile = null;
        drawPuzzle(photo, size);
      } else {
        [puzzleTiles[selectedTile], puzzleTiles[position]] =
          [puzzleTiles[position], puzzleTiles[selectedTile]];

        selectedTile = null;
        drawPuzzle(photo, size);
        playSound(420);

        if (puzzleTiles.every((value, index) => value === index)) {
          completeLevel("Perfect! You solved the picture puzzle!");
        }
      }
    });

    board.appendChild(tile);
  });

  if (selectedTile !== null) {
    board.children[selectedTile].classList.add("selected");
  }
}

/* =====================================
   2. MEMORY MATCH
===================================== */

function startMemory() {
  const pairCount = difficulty === "easy"
    ? 4 + Math.floor((currentLevel - 1) / 2)
    : 6 + currentLevel;

  const symbols = [
    "🍓", "🍋", "🍉", "🍇", "🍒", "🥝",
    "🍍", "🥑", "🍑", "🍊", "🍐", "🥥"
  ];

  const cards = symbols.slice(0, pairCount);
  const deck = [...cards, ...cards].sort(() => Math.random() - 0.5);

  memoryFirst = null;
  memoryLock = false;
  memoryMatches = 0;

  const area = document.getElementById("gameArea");

  area.innerHTML = `
    <p class="game-hint">Find all matching pairs!</p>
    <div class="memory-grid" id="memoryGrid"></div>
  `;

  const grid = document.getElementById("memoryGrid");
  grid.style.gridTemplateColumns =
    pairCount > 6 ? "repeat(4,1fr)" : "repeat(4,1fr)";

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

/* =====================================
   3. WORD SCRAMBLE
===================================== */

function startScramble() {
  const word = scrambleWords[
    (currentLevel - 1 + (difficulty === "hard" ? 4 : 0)) %
    scrambleWords.length
  ];

  let scrambled = word.split("").sort(() => Math.random() - 0.5).join("");

  if (scrambled === word) {
    scrambled = word.slice(1) + word[0];
  }

  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Put the letters in the correct order.</p>
    <div class="big-word">${scrambled}</div>
    <input class="game-input" id="scrambleInput"
      placeholder="Your answer..." autocomplete="off">
    <br>
    <button class="game-action" id="scrambleCheck">CHECK WORD</button>
  `;

  const input = document.getElementById("scrambleInput");

  document.getElementById("scrambleCheck").onclick = () => {
    if (input.value.trim().toUpperCase() === word) {
      completeLevel("Correct! You found the word!");
    } else {
      document.getElementById("gameMessage").textContent =
        "Not quite! Try again.";
    }
  };

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      document.getElementById("scrambleCheck").click();
    }
  });
}

/* =====================================
   4. WORDLE
===================================== */

function startWordle() {
  wordleAnswer = wordleWords[
    (currentLevel - 1 + (difficulty === "hard" ? 5 : 0)) %
    wordleWords.length
  ];

  wordleAttempts = 0;
  wordleFinished = false;

  const area = document.getElementById("gameArea");

  area.innerHTML = `
    <p class="game-hint">Guess the five-letter word in six tries.</p>
    <div class="wordle-grid" id="wordleGrid"></div>
    <input class="game-input" id="wordleInput"
      maxlength="5" placeholder="ENTER WORD" autocomplete="off">
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

  function submitGuess() {
    if (wordleFinished || gameFinished) return;

    const guess = input.value.trim().toUpperCase();

    if (!/^[A-Z]{5}$/.test(guess)) {
      document.getElementById("gameMessage").textContent =
        "Enter a five-letter word.";
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
      document.getElementById("gameMessage").textContent =
        `The word was ${wordleAnswer}. Try again next time!`;
      completeLevel("Wordle round finished!");
    } else {
      document.getElementById("gameMessage").textContent =
        `${6 - wordleAttempts} guesses left.`;
    }
  }

  document.getElementById("wordleCheck").onclick = submitGuess;

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") submitGuess();
  });
}

/* =====================================
   5. QUICK MATH
===================================== */

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

  if (operator === "-" && b > a) {
    [a, b] = [b, a];
  }

  if (operator === "×") {
    mathAnswer = a * b;
  } else if (operator === "+") {
    mathAnswer = a + b;
  } else {
    mathAnswer = a - b;
  }

  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Solve the equation.</p>
    <div class="big-problem">${a} ${operator} ${b} = ?</div>
    <input class="game-input" id="mathInput"
      type="number" placeholder="Your answer">
    <br>
    <button class="game-action" id="mathCheck">CHECK ANSWER</button>
  `;

  const input = document.getElementById("mathInput");

  document.getElementById("mathCheck").onclick = () => {
    if (Number(input.value) === mathAnswer && input.value !== "") {
      completeLevel("Correct calculation! Well done!");
    } else {
      document.getElementById("gameMessage").textContent =
        "Incorrect. Try again!";
    }
  };

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      document.getElementById("mathCheck").click();
    }
  });
}

/* =====================================
   6. REACTION RUSH
===================================== */

function startReaction() {
  const area = document.getElementById("gameArea");

  area.innerHTML = `
    <p class="game-hint">Wait for green, then click as quickly as possible!</p>
    <div class="reaction-box waiting" id="reactionBox">
      WAIT FOR GREEN...
    </div>
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
        document.getElementById("gameMessage").textContent =
          "You clicked too soon. Try the level again.";

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

/* =====================================
   7. BRAIN FIX
===================================== */

function startBrain() {
  const questions = brainQuestions[0][difficulty];
  brainQuestion = questions[(currentLevel - 1) % questions.length];

  document.getElementById("gameArea").innerHTML = `
    <p class="game-hint">Think carefully. Choose the correct solution.</p>
    <h2 class="big-problem" style="font-size:25px;line-height:1.4">
      ${brainQuestion.q}
    </h2>
    <div class="option-grid" id="brainOptions"></div>
  `;

  const options = document.getElementById("brainOptions");

  brainQuestion.a.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.textContent = answer;

    button.onclick = () => {
      if (gameFinished) return;

      if (index === brainQuestion.correct) {
        completeLevel("Exactly right! Problem solved!");
      } else {
        document.getElementById("gameMessage").textContent =
          "Not quite. Try another answer!";
        playSound(220);
      }
    };

    options.appendChild(button);
  });
}

/* =====================================
   8. ODD ONE OUT
===================================== */

function startOdd() {
  const groups = [
    { common: "🍎", odd: "🍌" },
    { common: "🔵", odd: "🔺" },
    { common: "🐶", odd: "🐱" },
    { common: "⭐", odd: "🌙" },
    { common: "🚗", odd: "✈️" }
  ];

  const group = groups[(currentLevel - 1) % groups.length];
  const oddPosition = Math.floor(Math.random() * 16);
  oddAnswer = oddPosition;

  const area = document.getElementById("gameArea");

  area.innerHTML = `
    <p class="game-hint">Find the one symbol that is different.</p>
    <div class="odd-grid" id="oddGrid"></div>
  `;

  const grid = document.getElementById("oddGrid");

  for (let i = 0; i < 16; i++) {
    const button = document.createElement("button");
    button.className = "odd-item";
    button.textContent = i === oddPosition ? group.odd : group.common;

    button.onclick = () => {
      if (gameFinished) return;

      if (i === oddAnswer) {
        completeLevel("Sharp eyes! You found the odd one out!");
      } else {
        document.getElementById("gameMessage").textContent =
          "Not that one. Look carefully!";
      }
    };

    grid.appendChild(button);
  }
}

/* =====================================
   9. TYPING SPRINT
===================================== */

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
    <textarea class="game-input" id="typingInput"
      rows="3" placeholder="Start typing here..."></textarea>
    <br>
    <button class="game-action" id="typingCheck">CHECK TEXT</button>
  `;

  const input = document.getElementById("typingInput");

  document.getElementById("typingCheck").onclick = () => {
    if (input.value.trim() === typingSentence) {
      completeLevel("Perfect typing! Every word is correct!");
    } else {
      document.getElementById("gameMessage").textContent =
        "There are still some differences. Check your typing!";
    }
  };
} 

