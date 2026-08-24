/* ===== TechnoVIT 3x3 Sliding Puzzle ===== */

const GRID = 3;
const TOTAL = GRID * GRID;
const TIME_LIMIT = 90; 

const PUZZLES = [
  {
    name: "CODE-O-FIESTA",
    img: "images/fiesta.png",
    details: [
      "A 3-round coding showdown where programming meets pop culture, puzzles & strategy.",
      "📅 Date: 2 Sept 2026",
      "🕘 Time: 9:00 AM – 6:00 PM",
      "📍 Venue: Netaji Auditorium",
      "👥 Team Size: 2 per team",
      "🏆 Exciting prizes & swag!",
    ],
  },
  {
    name: "INNOVATION UNBOUND",
    img: "images/innovation.png",
    details: [
      "AI for Financial Inclusion & Social Impact Hackathon.",
      "Theme: Technology for Financial Inclusion, Sustainable Growth & Social Impact.",
      "📅 Date: 3 Sept – 4 Sept 2026",
      "🕛 Time: 12:00 PM – 2:00 PM",
      "📍 Venue: Kamaraj Auditorium",
      "👥 Team Size: 1 to 5 per team",
    ],
  },
];

const boardEl      = document.getElementById("board");
const timerEl      = document.getElementById("timer");
const moveCountEl  = document.getElementById("moveCount");
const eventNameEl  = document.getElementById("eventName");
const refImageEl   = document.getElementById("refImage");
const counterEl    = document.getElementById("puzzleCounter");
const progressEl   = document.getElementById("progressList");
const shuffleBtn   = document.getElementById("shuffleBtn");

const overlay      = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText  = document.getElementById("overlayText");
const overlayImg   = document.getElementById("overlayImg");
const overlayBtn   = document.getElementById("overlayBtn");
const finalOverlay = document.getElementById("finalOverlay");

let current = 0;
let tiles = [];
let moves = 0;
let timeLeft = TIME_LIMIT;
let timerId = null;
let locked = false;

function buildSolved() { return Array.from({ length: TOTAL }, (_, i) => i); }

function neighbors(blank) {
  const r = Math.floor(blank / GRID), c = blank % GRID, out = [];
  if (r > 0) out.push(blank - GRID);
  if (r < GRID - 1) out.push(blank + GRID);
  if (c > 0) out.push(blank - 1);
  if (c < GRID - 1) out.push(blank + 1);
  return out;
}

function shuffle() {
  const t = buildSolved();
  let blank = TOTAL - 1, last = -1;
  const n = TOTAL * 40;
  for (let i = 0; i < n; i++) {
    const opts = neighbors(blank).filter(x => x !== last);
    const nxt = opts[Math.floor(Math.random() * opts.length)];
    [t[blank], t[nxt]] = [t[nxt], t[blank]];
    last = blank; blank = nxt;
  }
  if (t.every((v, i) => v === i)) return shuffle();
  return t;
}

function isSolved() { return tiles.every((v, i) => v === i); }

function render() {
  const img = PUZZLES[current].img;
  const tileSize = 100 / GRID;
  boardEl.innerHTML = "";

  tiles.forEach((value, index) => {
    const posRow = Math.floor(index / GRID), posCol = index % GRID;
    const srcRow = Math.floor(value / GRID), srcCol = value % GRID;
    const isBlank = value === TOTAL - 1;

    const btn = document.createElement("button");
    btn.className = "tile" + (isBlank ? " blank" : "");
    btn.style.width  = tileSize + "%";
    btn.style.height = tileSize + "%";
    btn.style.transform = `translate(${posCol * 100}%, ${posRow * 100}%)`;

    const inner = document.createElement("div");
    inner.className = "tile-inner";
    if (isBlank) {
      const dot = document.createElement("span");
      dot.className = "blank-dot";
      inner.appendChild(dot);
    } else {
      inner.style.backgroundImage = `url(${img})`;
      inner.style.backgroundSize = `${GRID * 100}% ${GRID * 100}%`;
      inner.style.backgroundPosition =
        `${(srcCol * 100) / (GRID - 1)}% ${(srcRow * 100) / (GRID - 1)}%`;
    }
    btn.appendChild(inner);
    if (!isBlank) btn.addEventListener("click", () => clickTile(index));
    boardEl.appendChild(btn);
  });

  const rev = document.createElement("div");
  rev.className = "solved-overlay";
  rev.id = "revealOverlay";
  rev.style.backgroundImage = `url(${img})`;
  boardEl.appendChild(rev);
}

function clickTile(index) {
  if (locked) return;
  const blank = tiles.indexOf(TOTAL - 1);
  if (!neighbors(blank).includes(index)) return;

  [tiles[blank], tiles[index]] = [tiles[index], tiles[blank]];
  moves++;
  moveCountEl.textContent = moves;
  render();

  if (isSolved()) win();
}

function moveWithArrow(key) {
  const blank = tiles.indexOf(TOTAL - 1);
  const row = Math.floor(blank / GRID), col = blank % GRID;
  const tileByKey = {
    ArrowUp: row < GRID - 1 ? blank + GRID : -1,
    ArrowDown: row > 0 ? blank - GRID : -1,
    ArrowLeft: col < GRID - 1 ? blank + 1 : -1,
    ArrowRight: col > 0 ? blank - 1 : -1,
  };
  const tileIndex = tileByKey[key];
  if (tileIndex !== undefined && tileIndex !== -1) clickTile(tileIndex);
}

document.addEventListener("keydown", (event) => {
  if (!Object.hasOwn({ ArrowUp: true, ArrowDown: true, ArrowLeft: true, ArrowRight: true }, event.key)) return;
  event.preventDefault();
  moveWithArrow(event.key);
});

function startTimer() {
  clearInterval(timerId);
  timeLeft = TIME_LIMIT;
  updateTimer();
  timerId = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) { clearInterval(timerId); timeUp(); }
  }, 1000);
}
function updateTimer() {
  const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");
  timerEl.textContent = `${m}:${s}`;
  timerEl.classList.toggle("low", timeLeft <= 20);
}

function renderProgress() {
  progressEl.innerHTML = "";
  PUZZLES.forEach((_, i) => {
    const d = document.createElement("span");
    d.className = "pdot" + (i < current ? " done" : i === current ? " active" : "");
    progressEl.appendChild(d);
  });
}

function loadPuzzle(i) {
  current = i;
  locked = false;
  moves = 0;
  moveCountEl.textContent = "0";
  tiles = shuffle();

  eventNameEl.textContent = PUZZLES[i].name;
  refImageEl.src = PUZZLES[i].img;
  counterEl.textContent = `${i + 1} / ${PUZZLES.length}`;

  render();
  renderProgress();
  startTimer();
}

function detailsHTML(intro) {
  const p = PUZZLES[current];
  const lines = p.details.map((d) => `<span class="detail-line">${d}</span>`).join("");
  return `<span class="detail-intro">${intro}</span><span class="detail-event">${p.name}</span>${lines}`;
}

function showResultOverlay() {
  overlayImg.src = PUZZLES[current].img;
  overlayBtn.textContent =
    current < PUZZLES.length - 1 ? "NEXT EVENT →" : "FINISH →";
  overlay.classList.remove("hidden");
}

function win() {
  locked = true;
  clearInterval(timerId);
  document.getElementById("revealOverlay").classList.add("show");

  setTimeout(() => {
    overlayTitle.textContent = "PUZZLE SOLVED — EVENT UNLOCKED";
    overlayTitle.classList.remove("neon");
    overlayText.innerHTML = detailsHTML("You revealed:");
    showResultOverlay();
  }, 700);
}

function timeUp() {
  locked = true;
  overlayTitle.textContent = "TIME'S UP!";
  overlayText.innerHTML = detailsHTML("Out of time — but here's the event anyway:");
  showResultOverlay();
}

overlayBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  if (current < PUZZLES.length - 1) {
    loadPuzzle(current + 1);
  } else {
    finalOverlay.classList.remove("hidden");
  }
});

shuffleBtn.addEventListener("click", () => {
  if (locked) return;
  moves = 0; moveCountEl.textContent = "0";
  tiles = shuffle();
  render();
});

loadPuzzle(0);