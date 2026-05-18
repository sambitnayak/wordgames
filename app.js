const DEFAULT_WORDS = [
  "APPLE",
  "BRAVE",
  "CLOUD",
  "DREAM",
  "FOREST",
  "GARDEN",
  "HAPPY",
  "JUMBLE",
  "PLANET",
  "PUZZLE"
];

const STORAGE_KEY = "wordGardenScores";
const PROFILE_KEY = "wordGardenProfile";
const THEME_KEY = "wordGardenTheme";
const GAME_NAMES = {
  mixup: "Mix-up",
  blanked: "Blanked out"
};

const state = {
  profile: "",
  scores: {},
  words: [...DEFAULT_WORDS],
  game: "",
  round: null
};

const dom = {
  body: document.body,
  homeButton: document.getElementById("homeButton"),
  activeGameLabel: document.getElementById("activeGameLabel"),
  profileName: document.getElementById("profileName"),
  wordCountLabel: document.getElementById("wordCountLabel"),
  gameTitle: document.getElementById("gameTitle"),
  scoreCounter: document.getElementById("scoreCounter"),
  gameStage: document.getElementById("gameStage"),
  profileOverlay: document.getElementById("profileOverlay"),
  gameOverlay: document.getElementById("gameOverlay"),
  wordOverlay: document.getElementById("wordOverlay"),
  profileInput: document.getElementById("profileInput"),
  profileMixScore: document.getElementById("profileMixScore"),
  profileBlankedScore: document.getElementById("profileBlankedScore"),
  saveProfileButton: document.getElementById("saveProfileButton"),
  profileCard: document.getElementById("profileCard"),
  gameChooserCard: document.getElementById("gameChooserCard"),
  wordListCard: document.getElementById("wordListCard"),
  startChoosingButton: document.getElementById("startChoosingButton"),
  wordFile: document.getElementById("wordFile"),
  wordPreview: document.getElementById("wordPreview")
};

function loadScores() {
  try {
    state.scores = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    state.scores = {};
  }
}

function saveScores() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.scores));
}

function ensureProfileScores() {
  if (!state.profile) return;
  if (!state.scores[state.profile]) {
    state.scores[state.profile] = { mixup: 0, blanked: 0 };
  }
}

function getScore(game = state.game) {
  if (!state.profile || !game) return 0;
  ensureProfileScores();
  return state.scores[state.profile][game] || 0;
}

function changeScore(game, delta) {
  ensureProfileScores();
  state.scores[state.profile][game] = getScore(game) + delta;
  saveScores();
  updateDashboard();
}

function cleanProfileName(value) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

function openOverlay(overlay) {
  overlay.classList.add("visible");
  if (overlay === dom.profileOverlay) {
    dom.profileInput.focus();
    dom.profileInput.select();
  }
}

function closeOverlay(overlay) {
  if (overlay === dom.profileOverlay && !state.profile) return;
  overlay.classList.remove("visible");
}

function closeDockMenus(exceptMenu = null) {
  document.querySelectorAll(".dock-item[open]").forEach((menu) => {
    if (menu !== exceptMenu) menu.removeAttribute("open");
  });
}

function updateDashboard() {
  ensureProfileScores();
  const mixScore = getScore("mixup");
  const blankedScore = getScore("blanked");
  dom.profileOverlay.classList.toggle("requires-profile", !state.profile);
  dom.profileName.textContent = state.profile || "PLAYER";
  dom.profileMixScore.textContent = mixScore;
  dom.profileBlankedScore.textContent = blankedScore;
  dom.wordCountLabel.textContent = `${state.words.length} words`;
  dom.gameTitle.textContent = state.game ? GAME_NAMES[state.game] : "Choose a game";
  dom.activeGameLabel.textContent = state.game ? GAME_NAMES[state.game] : "Choose a game";
  dom.scoreCounter.textContent = `Score: ${getScore()}`;
  renderWordPreview();
}

function setProfile() {
  const name = cleanProfileName(dom.profileInput.value);
  if (!name) {
    dom.profileInput.focus();
    return;
  }
  state.profile = name;
  localStorage.setItem(PROFILE_KEY, name);
  ensureProfileScores();
  saveScores();
  updateDashboard();
  closeOverlay(dom.profileOverlay);
  if (!state.game) {
    openOverlay(dom.gameOverlay);
  }
}

function setTheme(theme) {
  dom.body.classList.remove("theme-sunny", "theme-space", "theme-cute");
  dom.body.classList.add(`theme-${theme}`);
  document.querySelectorAll(".theme-chip").forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === theme);
  });
  localStorage.setItem(THEME_KEY, theme);
}

function randomWord() {
  return state.words[Math.floor(Math.random() * state.words.length)];
}

function shuffleLetters(word) {
  const letters = word.split("");
  for (let i = letters.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  if (letters.join("") === word && letters.length > 1) {
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }
  return letters;
}

function startGame(game) {
  state.game = game;
  state.round = null;
  updateDashboard();
  closeOverlay(dom.gameOverlay);
  if (game === "mixup") startMixupRound();
  if (game === "blanked") startBlankedRound();
}

function makeTile(letter, className = "letter-tile") {
  const tile = document.createElement("span");
  tile.className = className;
  tile.textContent = letter || "";
  return tile;
}

function startMixupRound() {
  state.round = {
    game: "mixup",
    word: randomWord(),
    available: [],
    guess: [],
    done: false,
    message: ""
  };
  state.round.available = shuffleLetters(state.round.word);
  renderMixup();
}

function renderMixup() {
  const round = state.round;
  dom.gameStage.innerHTML = "";

  const view = document.createElement("div");
  view.className = "round-view";

  const heading = document.createElement("h1");
  heading.textContent = "Mix-up";

  const wordDisplay = document.createElement("div");
  wordDisplay.className = "word-display";
  round.available.forEach((letter, index) => {
    const button = document.createElement("button");
    button.className = "letter-button";
    button.type = "button";
    button.textContent = letter;
    button.disabled = round.done;
    button.addEventListener("click", () => takeMixupLetter(index));
    wordDisplay.append(button);
  });

  const guessDisplay = document.createElement("div");
  guessDisplay.className = "guess-display";
  for (let i = 0; i < round.word.length; i += 1) {
    guessDisplay.append(makeTile(round.guess[i] || ""));
  }

  const message = document.createElement("div");
  message.className = `message ${round.messageType || ""}`;
  message.textContent = round.message;

  const actions = document.createElement("div");
  actions.className = "game-actions";
  actions.append(
    makeActionButton("Submit", "primary-button", submitMixup),
    makeActionButton("Backspace", "secondary-button", backspaceMixup),
    makeActionButton("New word", "secondary-button", startMixupRound)
  );

  view.append(heading, wordDisplay, guessDisplay, message, actions);
  dom.gameStage.append(view);
}

function makeActionButton(label, className, handler) {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", handler);
  return button;
}

function takeMixupLetter(index) {
  const round = state.round;
  if (!round || round.done) return;
  const letter = round.available[index];
  if (!letter || round.guess.length >= round.word.length) return;
  round.available.splice(index, 1);
  round.guess.push(letter);
  round.message = "";
  round.messageType = "";
  renderMixup();
}

function typeMixupLetter(letter) {
  const round = state.round;
  if (!round || round.done || round.game !== "mixup") return;
  const index = round.available.indexOf(letter);
  if (index !== -1) takeMixupLetter(index);
}

function backspaceMixup() {
  const round = state.round;
  if (!round || round.done || round.game !== "mixup") return;
  const letter = round.guess.pop();
  if (letter) round.available.push(letter);
  round.message = "";
  round.messageType = "";
  renderMixup();
}

function submitMixup() {
  const round = state.round;
  if (!round || round.done) return;
  const guess = round.guess.join("");
  round.done = true;
  if (guess.length < round.word.length) {
    round.message = `Round resigned. The word was ${round.word}.`;
    round.messageType = "bad";
    changeScore("mixup", -1);
  } else if (guess === round.word) {
    round.message = "Correct guess!";
    round.messageType = "good";
    changeScore("mixup", 1);
  } else {
    round.message = `Not this time. The word was ${round.word}.`;
    round.messageType = "bad";
    changeScore("mixup", -1);
  }
  renderMixup();
}

function startBlankedRound() {
  const word = randomWord();
  state.round = {
    game: "blanked",
    word,
    missing: chooseMissingIndexes(word),
    found: new Set(),
    wrong: [],
    done: false,
    message: ""
  };
  renderBlanked();
}

function chooseMissingIndexes(word) {
  const count = Math.max(1, Math.ceil(word.length * 0.45));
  const indexes = [...word].map((_, index) => index);
  for (let i = indexes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  return new Set(indexes.slice(0, count));
}

function renderBlanked() {
  const round = state.round;
  dom.gameStage.innerHTML = "";

  const view = document.createElement("div");
  view.className = "round-view";

  const heading = document.createElement("h1");
  heading.textContent = "Blanked out";

  const display = document.createElement("div");
  display.className = "blank-display";
  [...round.word].forEach((letter, index) => {
    const isMissing = round.missing.has(index) && !round.found.has(letter);
    display.append(makeTile(isMissing ? "" : letter, `blank-tile ${isMissing ? "missing" : ""}`));
  });

  const bank = document.createElement("div");
  bank.className = "letter-bank";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((letter) => {
    const button = document.createElement("button");
    button.className = "letter-button";
    button.type = "button";
    button.textContent = letter;
    button.disabled = round.done || round.found.has(letter) || round.wrong.includes(letter);
    button.addEventListener("click", () => guessBlankedLetter(letter));
    bank.append(button);
  });

  const message = document.createElement("div");
  message.className = `message ${round.messageType || ""}`;
  message.textContent = round.message;

  const wrong = document.createElement("div");
  wrong.className = "wrong-list";
  wrong.textContent = `Wrong guesses: ${round.wrong.length}/5${round.wrong.length ? ` (${round.wrong.join(", ")})` : ""}`;

  const actions = document.createElement("div");
  actions.className = "game-actions";
  actions.append(makeActionButton("New word", "secondary-button", startBlankedRound));

  view.append(heading, display, bank, message, wrong, actions);
  dom.gameStage.append(view);
}

function guessBlankedLetter(letter) {
  const round = state.round;
  if (!round || round.done || round.game !== "blanked") return;
  const hiddenLetters = [...round.missing].map((index) => round.word[index]);
  if (hiddenLetters.includes(letter)) {
    round.found.add(letter);
    round.message = "Correct letter!";
    round.messageType = "good";
    const allFound = hiddenLetters.every((hiddenLetter) => round.found.has(hiddenLetter));
    if (allFound) {
      round.done = true;
      round.message = "You found every missing letter!";
      changeScore("blanked", 1);
    }
  } else {
    round.wrong.push(letter);
    round.message = "Wrong letter.";
    round.messageType = "bad";
    if (round.wrong.length >= 5) {
      round.done = true;
      round.message = `Round lost. The word was ${round.word}.`;
      changeScore("blanked", -1);
    }
  }
  renderBlanked();
}

function typeBlankedLetter(letter) {
  const round = state.round;
  if (!round || round.done || round.game !== "blanked") return;
  if (round.found.has(letter) || round.wrong.includes(letter)) return;
  guessBlankedLetter(letter);
}

function parseWordList(text) {
  const seen = new Set();
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().toUpperCase())
    .map((word) => word.replace(/[^A-Z]/g, ""))
    .filter((word) => word.length > 1)
    .filter((word) => {
      if (seen.has(word)) return false;
      seen.add(word);
      return true;
    });
}

function handleWordFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const words = parseWordList(String(reader.result || ""));
    if (!words.length) {
      dom.wordPreview.innerHTML = '<span class="message bad">No usable words found.</span>';
      return;
    }
    state.words = words;
    updateDashboard();
    if (state.game === "mixup") startMixupRound();
    if (state.game === "blanked") startBlankedRound();
  });
  reader.readAsText(file);
}

function renderWordPreview() {
  dom.wordPreview.innerHTML = "";
  state.words.slice(0, 30).forEach((word) => {
    const pill = document.createElement("span");
    pill.className = "word-pill";
    pill.textContent = word;
    dom.wordPreview.append(pill);
  });
  if (state.words.length > 30) {
    const pill = document.createElement("span");
    pill.className = "word-pill";
    pill.textContent = `+${state.words.length - 30}`;
    dom.wordPreview.append(pill);
  }
}

function handleKeydown(event) {
  if (document.activeElement === dom.profileInput) return;
  if (!state.round || state.round.done) return;
  const key = event.key.toUpperCase();
  if (event.key === "Backspace" && state.round.game === "mixup") {
    event.preventDefault();
    backspaceMixup();
    return;
  }
  if (event.key === "Enter" && state.round.game === "mixup") {
    event.preventDefault();
    submitMixup();
    return;
  }
  if (/^[A-Z]$/.test(key)) {
    if (state.round.game === "mixup") typeMixupLetter(key);
    if (state.round.game === "blanked") typeBlankedLetter(key);
  }
}

function bindEvents() {
  dom.saveProfileButton.addEventListener("click", setProfile);
  dom.profileInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") setProfile();
  });
  dom.profileInput.addEventListener("input", () => {
    dom.profileInput.value = cleanProfileName(dom.profileInput.value);
  });
  dom.profileCard.addEventListener("click", () => openOverlay(dom.profileOverlay));
  dom.gameChooserCard.addEventListener("click", () => openOverlay(dom.gameOverlay));
  dom.wordListCard.addEventListener("click", () => openOverlay(dom.wordOverlay));
  dom.homeButton.addEventListener("click", () => openOverlay(dom.gameOverlay));
  dom.startChoosingButton.addEventListener("click", () => openOverlay(dom.gameOverlay));
  dom.wordFile.addEventListener("change", handleWordFile);
  document.addEventListener("keydown", handleKeydown);

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeOverlay(button.closest(".overlay")));
  });
  document.querySelectorAll("[data-game]").forEach((button) => {
    button.addEventListener("click", () => startGame(button.dataset.game));
  });
  document.querySelectorAll("[data-theme]").forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(button.dataset.theme);
      closeDockMenus();
    });
  });
  document.querySelectorAll(".dock-item").forEach((menu) => {
    menu.addEventListener("toggle", () => {
      if (menu.open) closeDockMenus(menu);
    });
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".quick-dock")) closeDockMenus();
  });
}

function init() {
  loadScores();
  bindEvents();
  setTheme(localStorage.getItem(THEME_KEY) || "sunny");
  const savedProfile = cleanProfileName(localStorage.getItem(PROFILE_KEY) || "");
  dom.profileInput.value = savedProfile;
  if (savedProfile) {
    state.profile = savedProfile;
    ensureProfileScores();
  }
  updateDashboard();
  openOverlay(dom.profileOverlay);
}

init();
