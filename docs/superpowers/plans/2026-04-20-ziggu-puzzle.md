# Zigguhooked Puzzle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shareable Google Apps Script web app that interactively simulates the Zigguhooked puzzle with educational hints, auto-solve, and move history.

**Architecture:** Two files — `Code.gs` (serves the page) and `index.html` (all logic client-side). No external dependencies. Deployed as an Apps Script web app at a public URL.

**Tech Stack:** Google Apps Script, vanilla HTML/CSS/JavaScript

---

### Task 1: Apps Script server (`Code.gs`)

**Files:**
- Create: `ziggu-puzzle/Code.gs`

- [ ] Create `Code.gs` with the following content:

```javascript
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Zigguhooked Puzzle')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

- [ ] Commit:
```bash
git add ziggu-puzzle/Code.gs
git commit -m "feat: add Apps Script doGet server"
```

---

### Task 2: HTML shell + CSS (`index.html`)

**Files:**
- Create: `ziggu-puzzle/index.html`

- [ ] Create `ziggu-puzzle/index.html` with the HTML structure and all CSS:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Zigguhooked Puzzle</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0f0f1a;
    color: #e0e0e0;
    font-family: 'Segoe UI', system-ui, sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Top bar ── */
  #topbar {
    background: #1a1a2e;
    border-bottom: 1px solid #2a2a4a;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  #topbar h1 { font-size: 1.2rem; color: #7eb8f7; letter-spacing: 0.04em; }
  #state-display {
    font-family: monospace;
    font-size: 1.5rem;
    letter-spacing: 0.2em;
    color: #4a9eff;
    background: #111;
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid #2a2a4a;
  }
  .topbar-spacer { flex: 1; }
  button {
    cursor: pointer;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    padding: 7px 16px;
    transition: opacity 0.15s, transform 0.1s;
  }
  button:hover { opacity: 0.85; }
  button:active { transform: scale(0.97); }
  #btn-reset { background: #3a3a5a; color: #ccc; }
  #btn-solve { background: #1e5f9a; color: #fff; }
  #btn-solve.solving { background: #6b3a1e; }

  /* ── Main layout ── */
  #main {
    display: flex;
    flex: 1;
    gap: 0;
  }

  /* ── Dial panel (left) ── */
  #dial-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 12px;
  }
  #dials-row {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .dial-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .dial-label {
    font-size: 0.75rem;
    color: #666;
    letter-spacing: 0.05em;
  }
  .dial-btn {
    width: 36px;
    height: 28px;
    background: #2a2a4a;
    color: #aaa;
    font-size: 1.1rem;
    line-height: 1;
    border-radius: 5px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dial-btn:disabled { opacity: 0.2; cursor: not-allowed; }
  .dial-btn:not(:disabled):hover { background: #3a3a6a; }

  /* circular dial */
  .dial {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #1e1e30;
    border: 3px solid #3a3a5a;
    position: relative;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .dial.can-move {
    border-color: #3cb371;
    box-shadow: 0 0 12px #3cb37166;
  }
  .dial.optimal {
    border-color: #ffd700;
    box-shadow: 0 0 16px #ffd70088;
    animation: pulse-gold 1.2s ease-in-out infinite;
  }
  @keyframes pulse-gold {
    0%, 100% { box-shadow: 0 0 10px #ffd70066; }
    50%       { box-shadow: 0 0 22px #ffd700cc; }
  }

  /* arrow hand */
  .dial-hand {
    position: absolute;
    width: 4px;
    height: 28px;
    background: #ff6b6b;
    border-radius: 2px 2px 0 0;
    left: 50%;
    bottom: 50%;
    transform-origin: bottom center;
    transform: translateX(-50%) rotate(0deg);
    transition: transform 0.3s cubic-bezier(.4,2,.6,1);
  }
  /* dial value label inside dial */
  .dial-value {
    position: absolute;
    bottom: 6px;
    width: 100%;
    text-align: center;
    font-size: 0.7rem;
    color: #555;
    font-family: monospace;
  }

  /* direction hint under dials */
  #direction-hint {
    font-size: 0.85rem;
    color: #666;
    letter-spacing: 0.15em;
    margin-top: 4px;
  }

  /* ── Info panel (right) ── */
  #info-panel {
    width: 320px;
    background: #13131f;
    border-left: 1px solid #2a2a4a;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 16px;
    overflow-y: auto;
  }
  .info-section h3 {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #555;
    margin-bottom: 8px;
  }

  /* progress bar */
  #progress-bar-bg {
    background: #222;
    border-radius: 4px;
    height: 10px;
    overflow: hidden;
  }
  #progress-bar-fill {
    background: #4a9eff;
    height: 100%;
    width: 0%;
    transition: width 0.3s;
    border-radius: 4px;
  }
  #progress-label {
    font-size: 0.8rem;
    color: #666;
    margin-top: 4px;
  }

  /* hint boxes */
  .hint-box {
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  .hint-box.shortest { border-color: #ffd70055; }
  .hint-box.longest  { border-color: #9370db55; }
  .hint-label { font-size: 0.7rem; color: #555; margin-bottom: 2px; }
  .hint-text  { color: #ccc; }
  .hint-text span { color: #ffd700; font-weight: bold; }
  .hint-box.longest .hint-text span { color: #b39ddb; }

  /* move history */
  #history-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 3px;
    max-height: 340px;
  }
  .history-entry {
    font-size: 0.78rem;
    font-family: monospace;
    color: #666;
    padding: 2px 4px;
    border-radius: 3px;
  }
  .history-entry:last-child { color: #aaa; background: #1e1e30; }

  /* solved banner */
  #solved-banner {
    display: none;
    background: linear-gradient(135deg, #1a4a1a, #2a6a2a);
    border: 1px solid #3cb371;
    border-radius: 8px;
    padding: 14px;
    text-align: center;
    color: #3cb371;
    font-size: 1rem;
    font-weight: bold;
    letter-spacing: 0.05em;
  }
</style>
</head>
<body>

<!-- Top bar -->
<div id="topbar">
  <h1>Zigguhooked Puzzle</h1>
  <div id="state-display">000000</div>
  <span class="topbar-spacer"></span>
  <button id="btn-reset" onclick="reset()">Reset</button>
  <button id="btn-solve" onclick="toggleAutoSolve()">Auto-Solve</button>
</div>

<!-- Main area -->
<div id="main">

  <!-- Left: dials -->
  <div id="dial-panel">
    <div id="dials-row"></div>
    <div id="direction-hint"></div>
  </div>

  <!-- Right: info -->
  <div id="info-panel">

    <div class="info-section">
      <h3>Progress (Shortest Path)</h3>
      <div id="progress-bar-bg"><div id="progress-bar-fill"></div></div>
      <div id="progress-label">0 / 360 moves</div>
    </div>

    <div class="info-section">
      <h3>Hints</h3>
      <div class="hint-box shortest">
        <div class="hint-label">Shortest next move</div>
        <div class="hint-text" id="hint-short">—</div>
      </div>
      <div class="hint-box longest" style="margin-top:8px;">
        <div class="hint-label">Longest next move</div>
        <div class="hint-text" id="hint-long">—</div>
      </div>
    </div>

    <div id="solved-banner">🎉 Puzzle Solved! 333333</div>

    <div class="info-section" style="flex:1;display:flex;flex-direction:column;min-height:0;">
      <h3>Move History</h3>
      <div id="history-list"></div>
    </div>

  </div>
</div>

<script>
// ── Constants ──────────────────────────────────────────────────────────────
const N = 6;
const SHORTEST_MOVES = 360;
// Arrow directions for each digit value
const ARROWS = ['↙', '→', '↗', '↑'];
// Rotation angles (degrees) for the dial hand: 0=↙(SW), 1=→(E), 2=↗(NE), 3=↑(N)
// Using CSS rotation from 12 o'clock (pointing up = 0deg):
// ↑ = 0deg, ↗ = 45deg, → = 90deg, ↙ = 225deg
const HAND_ANGLES = [225, 90, 45, 0];

// ── State ──────────────────────────────────────────────────────────────────
let state = [0,0,0,0,0,0];
let moveCount = 0;
let solveInterval = null;
let historyEntries = [];

// ── Puzzle Logic ───────────────────────────────────────────────────────────

function isValid(s) {
  for (let i = 0; i < N - 1; i++) {
    if (s[i] === 3 && s[i+1] !== 3) return false;
  }
  return true;
}

function isSolved(s) {
  return s.every(d => d === 3);
}

function applyMove(s, dial, dir) {
  const ns = [...s];
  ns[dial] += dir;
  return ns;
}

function validMoves(s) {
  const moves = [];
  for (let dial = 0; dial < N; dial++) {
    for (const dir of [+1, -1]) {
      const v = s[dial] + dir;
      if (v < 0 || v > 3) continue;
      const ns = applyMove(s, dial, dir);
      if (isValid(ns)) moves.push({ dial, dir });
    }
  }
  return moves;
}

// nextV: longest-solution successor (eq. 11)
// nextS: shortest-solution successor (eq. 12)
// Scan i from 1 (rightmost, dIdx=N-1) to N (leftmost, dIdx=0).
// parity(i) = sum of s[0..dIdx-1] (digits to the LEFT of dIdx).
// rightNeighbor = s[dIdx+1] (digit to the RIGHT, i.e. lower paper-index)
// leftNeighbor  = s[dIdx-1] (digit to the LEFT,  i.e. higher paper-index)
function nextSuccessor(s, shortest) {
  for (let i = 1; i <= N; i++) {
    const dIdx = N - i;
    const parity = s.slice(0, dIdx).reduce((a, b) => a + b, 0) % 2;
    const rightNeighbor = (dIdx + 1 < N) ? s[dIdx + 1] : null;
    const leftNeighbor  = (dIdx - 1 >= 0) ? s[dIdx - 1] : null;

    if (parity === 0 && s[dIdx] < 3) {
      // Case 1: increment
      return applyMove(s, dIdx, +1);
    }
    if (parity === 1 && s[dIdx] > 0 && rightNeighbor !== 3) {
      // Case 2: decrement
      if (shortest && leftNeighbor === 0 && s[dIdx] === 3) continue; // extra nextS skip
      return applyMove(s, dIdx, -1);
    }
  }
  return null; // solved
}

function nextV(s) { return nextSuccessor(s, false); }
function nextS(s) { return nextSuccessor(s, true);  }

// ── DOM / Rendering ────────────────────────────────────────────────────────

function buildDials() {
  const row = document.getElementById('dials-row');
  row.innerHTML = '';
  for (let i = 0; i < N; i++) {
    const w = document.createElement('div');
    w.className = 'dial-wrapper';
    w.innerHTML = `
      <button class="dial-btn" id="btn-plus-${i}" onclick="doMove(${i}, +1)">+</button>
      <div class="dial" id="dial-${i}">
        <div class="dial-hand" id="hand-${i}"></div>
        <div class="dial-value" id="dval-${i}">0</div>
      </div>
      <button class="dial-btn" id="btn-minus-${i}" onclick="doMove(${i}, -1)">−</button>
      <div class="dial-label">d<sub>${i+1}</sub></div>
    `;
    row.appendChild(w);
  }
}

function renderDials(s, optimalDial) {
  const moves = validMoves(s);
  const canInc = new Set(moves.filter(m => m.dir === +1).map(m => m.dial));
  const canDec = new Set(moves.filter(m => m.dir === -1).map(m => m.dial));

  for (let i = 0; i < N; i++) {
    const dial  = document.getElementById(`dial-${i}`);
    const hand  = document.getElementById(`hand-${i}`);
    const dval  = document.getElementById(`dval-${i}`);
    const btnP  = document.getElementById(`btn-plus-${i}`);
    const btnM  = document.getElementById(`btn-minus-${i}`);

    // rotate hand
    hand.style.transform = `translateX(-50%) rotate(${HAND_ANGLES[s[i]]}deg)`;
    dval.textContent = s[i];

    // glow
    const canMove = canInc.has(i) || canDec.has(i);
    dial.classList.toggle('can-move', canMove && optimalDial !== i);
    dial.classList.toggle('optimal', optimalDial === i);

    // buttons
    btnP.disabled = !canInc.has(i);
    btnM.disabled = !canDec.has(i);
  }

  // direction hint row
  document.getElementById('direction-hint').textContent =
    s.map(d => ARROWS[d]).join('  ');
}

function updateInfoPanel(s) {
  // state string
  document.getElementById('state-display').textContent = s.join('');

  // progress
  const pct = Math.min(100, (moveCount / SHORTEST_MOVES) * 100);
  document.getElementById('progress-bar-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent =
    `${moveCount} / ${SHORTEST_MOVES} moves`;

  // hints
  const ns = nextS(s);
  const nv = nextV(s);

  function hintText(next, current) {
    if (!next) return 'Puzzle solved!';
    for (let i = 0; i < N; i++) {
      if (next[i] !== current[i]) {
        const dir = next[i] > current[i] ? '+1 ↑' : '-1 ↓';
        return `Rotate <span>d${i+1}</span> ${dir} → ${ARROWS[next[i]]}`;
      }
    }
    return '—';
  }
  document.getElementById('hint-short').innerHTML = hintText(ns, s);
  document.getElementById('hint-long').innerHTML  = hintText(nv, s);

  // solved
  document.getElementById('solved-banner').style.display =
    isSolved(s) ? 'block' : 'none';
}

function getOptimalDial(s) {
  const ns = nextS(s);
  if (!ns) return -1;
  for (let i = 0; i < N; i++) {
    if (ns[i] !== s[i]) return i;
  }
  return -1;
}

function render() {
  const opt = getOptimalDial(state);
  renderDials(state, opt);
  updateInfoPanel(state);
}

// ── Move History ───────────────────────────────────────────────────────────

function addHistory(dial, dir, newState) {
  const entry = `Move ${moveCount}: d${dial+1} ${dir > 0 ? '+1' : '-1'} → ${newState.join('')}`;
  historyEntries.push(entry);
  const list = document.getElementById('history-list');
  const el = document.createElement('div');
  el.className = 'history-entry';
  el.textContent = entry;
  list.appendChild(el);
  list.scrollTop = list.scrollHeight;
}

// ── User Actions ───────────────────────────────────────────────────────────

function doMove(dial, dir) {
  const ns = applyMove(state, dial, dir);
  if (!isValid(ns) || ns[dial] < 0 || ns[dial] > 3) return;
  state = ns;
  moveCount++;
  addHistory(dial, dir, state);
  render();
  if (isSolved(state)) stopAutoSolve();
}

function reset() {
  stopAutoSolve();
  state = [0,0,0,0,0,0];
  moveCount = 0;
  historyEntries = [];
  document.getElementById('history-list').innerHTML = '';
  document.getElementById('btn-solve').textContent = 'Auto-Solve';
  document.getElementById('btn-solve').classList.remove('solving');
  render();
}

function toggleAutoSolve() {
  if (solveInterval) {
    stopAutoSolve();
  } else {
    startAutoSolve();
  }
}

function startAutoSolve() {
  if (isSolved(state)) return;
  document.getElementById('btn-solve').textContent = 'Pause';
  document.getElementById('btn-solve').classList.add('solving');
  solveInterval = setInterval(() => {
    const ns = nextS(state);
    if (!ns) { stopAutoSolve(); return; }
    for (let i = 0; i < N; i++) {
      if (ns[i] !== state[i]) {
        doMove(i, ns[i] - state[i]);
        break;
      }
    }
    if (isSolved(state)) stopAutoSolve();
  }, 400);
}

function stopAutoSolve() {
  if (solveInterval) { clearInterval(solveInterval); solveInterval = null; }
  document.getElementById('btn-solve').textContent = 'Auto-Solve';
  document.getElementById('btn-solve').classList.remove('solving');
}

// ── Init ───────────────────────────────────────────────────────────────────
buildDials();
render();
</script>
</body>
</html>
```

- [ ] Commit:
```bash
git add ziggu-puzzle/index.html
git commit -m "feat: add Zigguhooked puzzle HTML/CSS/JS"
```

---

### Task 3: Verify logic correctness

- [ ] Open `index.html` directly in a browser (file://) and confirm:
  - 6 circular dials render at state 000000
  - Arrow hands point ↙ for all dials (state 0)
  - Only dial d₆ has "+1" enabled (first valid move per nextS)
  - "Shortest next move" hint says `d6 +1`
  - Clicking + on d₆ advances state to 000001
  - Auto-Solve runs through states and eventually reaches 333333
  - Solved banner appears at 333333
  - Reset returns to 000000

- [ ] Commit if any fixes needed:
```bash
git add ziggu-puzzle/index.html
git commit -m "fix: correct dial logic"
```

---

### Task 4: Deploy to Google Apps Script

- [ ] Go to [script.google.com](https://script.google.com) → New Project
- [ ] In `Code.gs`, paste the contents of `ziggu-puzzle/Code.gs`
- [ ] Create a new file `index.html` → paste the contents of `ziggu-puzzle/index.html`
- [ ] Deploy → New Deployment → Web app → Execute as: Me → Who has access: Anyone → Deploy
- [ ] Copy the deployment URL and verify it loads in an incognito window
