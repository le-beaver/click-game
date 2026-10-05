const GAME_LENGTH = 30;
const BEST_KEY = "click-here-best";
const TARGET_POSITIONS = [
  { x: 50, y: 50 },
  { x: 29, y: 28 },
  { x: 70, y: 30 },
  { x: 32, y: 67 },
  { x: 69, y: 70 },
  { x: 50, y: 25 },
  { x: 50, y: 72 },
  { x: 29, y: 48 },
  { x: 71, y: 50 },
];

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const target = document.getElementById("target");
const overlay = document.getElementById("overlay");
const overlayKicker = document.getElementById("overlay-kicker");
const overlayTitle = document.getElementById("overlay-title");
const overlayResult = document.getElementById("overlay-result");
const startButton = document.getElementById("start");

let score = 0;
let bestScore = readBest();
let isPlaying = false;
let deadline = 0;
let timerId = 0;
let positionIndex = 0;

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be unavailable (private mode, file:// in some browsers).
  }
}

const pad = (n) => String(n).padStart(2, "0");

function renderScore() {
  scoreEl.textContent = pad(score);
}

function renderTime(seconds) {
  timeEl.textContent = `${pad(seconds)}s`;
}

function renderBest() {
  bestEl.textContent = pad(bestScore);
}

function moveTarget(index) {
  positionIndex = index;
  const { x, y } = TARGET_POSITIONS[index];
  target.style.setProperty("--x", `${x}%`);
  target.style.setProperty("--y", `${y}%`);
}

function nextPositionIndex() {
  const offset = 1 + Math.floor(Math.random() * (TARGET_POSITIONS.length - 1));
  return (positionIndex + offset) % TARGET_POSITIONS.length;
}

function secondsLeft() {
  return Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
}

function tick() {
  const left = secondsLeft();
  renderTime(left);
  if (left === 0) endGame();
}

function startGame() {
  score = 0;
  renderScore();
  renderTime(GAME_LENGTH);
  moveTarget(0);

  isPlaying = true;
  deadline = performance.now() + GAME_LENGTH * 1000;
  clearInterval(timerId);
  timerId = setInterval(tick, 100);

  target.disabled = false;
  overlay.classList.add("is-hidden");
  target.focus({ preventScroll: true });
}

function endGame() {
  clearInterval(timerId);
  isPlaying = false;
  target.disabled = true;

  if (score > bestScore) {
    bestScore = score;
    saveBest(bestScore);
    renderBest();
  }

  overlayKicker.textContent = "Game complete";
  overlayTitle.textContent = "You're gay";
  overlayResult.textContent = `You got ${score} clicks`;
  startButton.textContent = "Play again";
  overlay.classList.add("is-result");
  overlay.classList.remove("is-hidden");
  startButton.focus({ preventScroll: true });
}

function clickTarget() {
  if (!isPlaying) return;
  score += 1;
  renderScore();
  moveTarget(nextPositionIndex());
}

target.addEventListener("click", clickTarget);
startButton.addEventListener("click", startGame);

renderScore();
renderTime(GAME_LENGTH);
renderBest();
moveTarget(0);
