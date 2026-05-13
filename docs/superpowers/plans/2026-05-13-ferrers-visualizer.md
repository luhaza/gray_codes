# Ferrers Gray Code Visualizer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `Project/visualizer.html` — a single-file browser app where users navigate integer partitions of n via a left-aligned Ferrers diagram (interactive puzzle mode) or watch the Warnsdorff Gray code auto-solve.

**Architecture:** Single HTML file with all CSS and JS inline, following the pattern of `ziggu-puzzle/index.html`. State lives in a plain `appState` object; all rendering is imperative DOM manipulation triggered by state changes. The Warnsdorff sequence is precomputed once per n-value change.

**Tech Stack:** Vanilla HTML5/CSS3/JavaScript (ES6+). No dependencies. Deployed to GitHub Pages at `luhaza/gray_codes`.

---

### Task 1: HTML/CSS Scaffold

**Files:**
- Create: `Project/visualizer.html`

- [ ] **Step 1: Create the file with full layout and CSS**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ferrers Gray Code Visualizer</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0f0f1a;
  color: #e0e0e0;
  font-family: 'Segoe UI', system-ui, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Topbar ── */
#topbar {
  background: #1a1a2e;
  border-bottom: 1px solid #2a2a4a;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}
#topbar h1 { font-size: 1.1rem; color: #7eb8f7; letter-spacing: 0.05em; flex: 1; }
.n-control { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
.n-control label { color: #aaa; }
#n-slider { width: 110px; accent-color: #7eb8f7; }
#n-value { color: #7eb8f7; font-weight: bold; min-width: 20px; }

/* ── Main three-column layout ── */
#main { display: flex; flex: 1; overflow: hidden; }

/* ── Left sidebar (300px) ── */
#sidebar {
  width: 300px;
  min-width: 300px;
  background: #1a1a2e;
  border-right: 1px solid #2a2a4a;
  display: flex;
  flex-direction: column;
  padding: 18px 16px;
  gap: 18px;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-section { display: flex; flex-direction: column; gap: 8px; }
.sidebar-label {
  font-size: 0.7rem; color: #7eb8f7;
  text-transform: uppercase; letter-spacing: 0.1em;
  padding-bottom: 4px; border-bottom: 1px solid #2a2a4a;
}

/* Mode tabs */
.mode-tabs { display: flex; gap: 6px; }
.mode-tab {
  flex: 1; text-align: center; padding: 7px 0; border-radius: 5px;
  font-size: 0.82rem; cursor: pointer;
  border: 1px solid #2a2a4a; background: #2a2a4a; color: #aaa;
  user-select: none; transition: background 0.15s, color 0.15s;
}
.mode-tab.active { background: #7eb8f7; color: #0f0f1a; font-weight: bold; border-color: #7eb8f7; }

/* Operation badge */
.op-badge {
  display: inline-block; padding: 5px 14px; border-radius: 12px;
  font-size: 0.82rem; font-weight: bold;
}
.op-move  { background: #1e3a2f; color: #4ade80; border: 1px solid #4ade80; }
.op-split { background: #2d1e3a; color: #c084fc; border: 1px solid #c084fc; }
.op-merge { background: #3a2a1e; color: #fb923c; border: 1px solid #fb923c; }

.partition-display {
  font-size: 0.95rem; color: #e0e0e0;
  background: #0f0f1a; border-radius: 5px; padding: 8px 10px;
  font-family: monospace;
}
.op-detail {
  font-size: 0.8rem; color: #aaa; background: #0f0f1a;
  border-radius: 5px; padding: 6px 10px; font-family: monospace;
}

/* Progress */
.progress-bar-outer { background: #0f0f1a; border-radius: 3px; height: 8px; }
.progress-bar-inner { background: #7eb8f7; border-radius: 3px; height: 8px; width: 0%; transition: width 0.3s; }
#progress-text { font-size: 0.8rem; color: #aaa; margin-top: 4px; }

/* Playback controls */
.playback-controls { display: flex; flex-direction: column; gap: 10px; }
.play-row { display: flex; gap: 8px; }
.btn {
  padding: 7px 14px; border-radius: 5px; font-size: 0.82rem; cursor: pointer;
  border: 1px solid #2a2a4a; background: #2a2a4a; color: #e0e0e0;
  user-select: none; transition: background 0.15s;
}
.btn:hover { background: #3a3a5a; }
.btn-primary { background: #7eb8f7; color: #0f0f1a; border-color: #7eb8f7; font-weight: bold; flex: 1; }
.btn-primary:hover { background: #9ecfff; }
.speed-row { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #aaa; }
#speed-slider { flex: 1; accent-color: #7eb8f7; }
#step-info { font-size: 0.82rem; color: #aaa; text-align: center; }
#autosolve-controls { transition: opacity 0.2s; }
#autosolve-controls.disabled { opacity: 0.4; pointer-events: none; }

.btn-reset {
  background: #2a1a1a; color: #f87171; border: 1px solid #f87171;
  font-size: 0.82rem; text-align: center; padding: 7px;
  border-radius: 5px; cursor: pointer;
}
.btn-reset:hover { background: #3a1a1a; }

/* ── Center diagram ── */
#diagram-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: auto;
}

.ferrers { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
.ferrers-row { display: flex; gap: 12px; align-items: center; }

.dot {
  width: 32px; height: 32px; border-radius: 50%;
  background: #7eb8f7;
  box-shadow: 0 0 8px rgba(126,184,247,0.3);
  flex-shrink: 0;
}
.dot.moveable {
  background: #f59e0b;
  box-shadow: 0 0 14px rgba(245,158,11,0.8);
  cursor: pointer;
}
.dot.selected {
  background: #fbbf24;
  box-shadow: 0 0 18px rgba(251,191,36,0.95);
  transform: scale(1.15);
  cursor: pointer;
}
.dot-ghost {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  border: 2px dashed #4ade80;
  background: rgba(74,222,128,0.1);
  cursor: pointer;
  transition: background 0.15s;
}
.dot-ghost:hover { background: rgba(74,222,128,0.25); }

.stuck-msg {
  margin-top: 20px; font-size: 0.82rem; color: #666; font-style: italic; text-align: center;
}

/* ── Right history panel (240px) ── */
#history-panel {
  width: 240px; min-width: 240px;
  background: #1a1a2e;
  border-left: 1px solid #2a2a4a;
  display: flex; flex-direction: column;
  flex-shrink: 0; overflow: hidden;
}
#history-header {
  padding: 14px 14px 10px;
  border-bottom: 1px solid #2a2a4a;
  font-size: 0.7rem; color: #7eb8f7;
  text-transform: uppercase; letter-spacing: 0.1em;
  flex-shrink: 0;
}
#history-list { flex: 1; overflow-y: auto; padding: 6px 0; }

.history-entry {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 14px;
  border-left: 3px solid transparent;
  cursor: default;
}
.history-entry.current {
  background: rgba(126,184,247,0.08);
  border-left-color: #7eb8f7;
}
.history-entry.future { opacity: 0.3; }

.history-step { font-size: 0.7rem; color: #555; min-width: 22px; text-align: right; }
.history-op-dot {
  width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
}
.op-dot-none   { background: #333; }
.op-dot-move   { background: #4ade80; }
.op-dot-split  { background: #c084fc; }
.op-dot-merge  { background: #fb923c; }

.history-partition {
  font-family: monospace; font-size: 0.76rem; color: #c0c0c0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.history-entry.current .history-partition { color: #7eb8f7; font-weight: bold; }

#history-legend {
  padding: 10px 14px; border-top: 1px solid #2a2a4a;
  display: flex; flex-direction: column; gap: 4px; flex-shrink: 0;
}
.legend-row { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: #666; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
</style>
</head>
<body>

<div id="topbar">
  <h1>Ferrers Gray Code Visualizer</h1>
  <div class="n-control">
    <label for="n-slider">n =</label>
    <input type="range" id="n-slider" min="1" max="12" value="6">
    <span id="n-value">6</span>
  </div>
</div>

<div id="main">

  <div id="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-label">Mode</div>
      <div class="mode-tabs">
        <div class="mode-tab active" id="tab-interactive">Interactive</div>
        <div class="mode-tab" id="tab-autosolve">Auto-solve</div>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Current partition</div>
      <div class="partition-display" id="current-partition">—</div>
    </div>

    <div class="sidebar-section" id="last-op-section" style="display:none;">
      <div class="sidebar-label">Last operation</div>
      <div id="op-badge" class="op-badge"></div>
      <div class="op-detail" id="op-detail"></div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Progress</div>
      <div class="progress-bar-outer">
        <div class="progress-bar-inner" id="progress-bar"></div>
      </div>
      <div id="progress-text">0 / 0 partitions visited</div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Auto-solve controls</div>
      <div class="playback-controls" id="autosolve-controls">
        <div class="play-row">
          <div class="btn" id="btn-prev">⏮ Prev</div>
          <div class="btn btn-primary" id="btn-play">▶ Play</div>
          <div class="btn" id="btn-next">Next ⏭</div>
        </div>
        <div class="speed-row">
          <span>Slow</span>
          <input type="range" id="speed-slider" min="1" max="10" value="5">
          <span>Fast</span>
        </div>
        <div id="step-info">Step — / —</div>
      </div>
    </div>

    <div class="sidebar-section" style="margin-top:auto;">
      <div class="btn-reset" id="btn-reset">↺ Reset</div>
    </div>
  </div>

  <div id="diagram-area">
    <div id="diagram"></div>
  </div>

  <div id="history-panel">
    <div id="history-header">History</div>
    <div id="history-list"></div>
    <div id="history-legend">
      <div class="legend-row"><div class="legend-dot" style="background:#4ade80;"></div> move</div>
      <div class="legend-row"><div class="legend-dot" style="background:#c084fc;"></div> split</div>
      <div class="legend-row"><div class="legend-dot" style="background:#fb923c;"></div> merge</div>
    </div>
  </div>

</div>

<script>
// JS added in later tasks
</script>
</body>
</html>
```

- [ ] **Step 2: Open `Project/visualizer.html` in a browser**

Verify the three-column layout renders correctly: dark background, topbar with slider, left sidebar sections, empty center, right panel with legend. No JS errors in console.

- [ ] **Step 3: Commit**

```bash
git add Project/visualizer.html
git commit -m "feat: add visualizer HTML/CSS scaffold"
```

---

### Task 2: Partition Math Module

**Files:**
- Modify: `Project/visualizer.html` — replace the `<script>` comment block with the partition math functions and inline tests

- [ ] **Step 1: Add partition math functions inside `<script>`**

```js
// ── Partition Math ──────────────────────────────────────────────

function partKey(p) { return JSON.stringify(p); }

// All partitions of n as sorted-descending arrays.
function allPartitions(n) {
  const result = [];
  function helper(remaining, maxPart, current) {
    if (remaining === 0) { result.push([...current]); return; }
    for (let part = Math.min(remaining, maxPart); part >= 1; part--) {
      current.push(part);
      helper(remaining - part, part, current);
      current.pop();
    }
  }
  helper(n, n, []);
  return result;
}

// Move-one-unit neighbors: move 1 between any two parts, or split off a new singleton.
function neighborsMove(p) {
  const seen = new Map();
  const orig = partKey(p);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < p.length; j++) {
      if (i === j) continue;
      const np = [...p]; np[i]--; np[j]++;
      const sorted = np.filter(x => x > 0).sort((a, b) => b - a);
      const k = partKey(sorted);
      if (k !== orig) seen.set(k, sorted);
    }
    if (p[i] > 1) {
      const np = [...p]; np[i]--;
      const sorted = [...np, 1].sort((a, b) => b - a);
      const k = partKey(sorted);
      if (k !== orig) seen.set(k, sorted);
    }
  }
  return [...seen.values()];
}

// Split/merge neighbors.
function neighborsSplitMerge(p) {
  const seen = new Map();
  const orig = partKey(p);
  // Splits
  for (let i = 0; i < p.length; i++) {
    for (let a = 1; a < p[i]; a++) {
      const b = p[i] - a;
      const np = [...p.slice(0, i), ...p.slice(i + 1), a, b].sort((a, b) => b - a);
      const k = partKey(np);
      if (k !== orig) seen.set(k, np);
    }
  }
  // Merges
  for (let i = 0; i < p.length; i++) {
    for (let j = i + 1; j < p.length; j++) {
      const merged = p[i] + p[j];
      const np = p.filter((_, idx) => idx !== i && idx !== j).concat(merged).sort((a, b) => b - a);
      const k = partKey(np);
      if (k !== orig) seen.set(k, np);
    }
  }
  return [...seen.values()];
}

// Combined neighborhood.
function neighborsCombined(p) {
  const seen = new Map();
  for (const n of neighborsMove(p)) seen.set(partKey(n), n);
  for (const n of neighborsSplitMerge(p)) seen.set(partKey(n), n);
  return [...seen.values()];
}

// Classify the operation from p to q.
function classifyOp(p, q) {
  const qk = partKey(q);
  const smKeys = neighborsSplitMerge(p).map(partKey);
  if (smKeys.includes(qk)) return q.length > p.length ? 'split' : 'merge';
  return 'move';
}
```

- [ ] **Step 2: Add inline tests immediately after the math functions**

```js
// ── Inline Tests (run on page load, check browser console) ──────
(function runTests() {
  function assert(cond, msg) {
    if (!cond) console.error('FAIL:', msg);
    else console.log('PASS:', msg);
  }

  // allPartitions
  assert(allPartitions(1).length === 1, 'allPartitions(1)=1');
  assert(allPartitions(4).length === 5, 'allPartitions(4)=5');
  assert(allPartitions(6).length === 11, 'allPartitions(6)=11');

  // neighborsMove
  const nm111 = neighborsMove([1,1,1]).map(partKey);
  assert(nm111.includes(partKey([2,1])), 'move [1,1,1]->[2,1]');
  assert(!nm111.includes(partKey([1,1,1])), 'move no self');

  const nm321 = neighborsMove([3,2,1]).map(partKey);
  assert(nm321.includes(partKey([4,1,1])), 'move [3,2,1]->[4,1,1]');
  assert(nm321.includes(partKey([3,3])),   'move [3,2,1]->[3,3]');

  // neighborsSplitMerge
  const nsm4 = neighborsSplitMerge([4]).map(partKey);
  assert(nsm4.includes(partKey([2,2])), 'sm [4]->[2,2]');
  assert(nsm4.includes(partKey([3,1])), 'sm [4]->[3,1]');

  const nsm22 = neighborsSplitMerge([2,2]).map(partKey);
  assert(nsm22.includes(partKey([4])), 'sm [2,2]->[4]');

  // classifyOp
  assert(classifyOp([1,1,1], [2,1])  === 'move',  'classifyOp move');
  assert(classifyOp([4],     [2,2])  === 'split', 'classifyOp split');
  assert(classifyOp([2,2],   [4])    === 'merge', 'classifyOp merge');
  assert(classifyOp([3,2,1], [3,3])  === 'move',  'classifyOp [3,2,1]->[3,3] is move');
})();
```

- [ ] **Step 3: Open the browser, open DevTools console**

All lines should print `PASS:`. If any print `FAIL:` fix the corresponding function before continuing.

- [ ] **Step 4: Commit**

```bash
git add Project/visualizer.html
git commit -m "feat: add partition math module with inline tests"
```

---

### Task 3: Warnsdorff Algorithm

**Files:**
- Modify: `Project/visualizer.html` — add `greedyWarnsdorff` after the math functions, extend the inline tests

- [ ] **Step 1: Add `greedyWarnsdorff` after the math functions (before the tests block)**

```js
// ── Warnsdorff Algorithm ────────────────────────────────────────

// Returns the full sequence of partitions of n as an array of arrays,
// starting from [1,1,...,1], using Warnsdorff's rule on neighborsCombined.
function greedyWarnsdorff(n) {
  const visited = new Set();
  let word = Array(n).fill(1);
  visited.add(partKey(word));
  const sequence = [word];

  while (true) {
    const candidates = neighborsCombined(word).filter(c => !visited.has(partKey(c)));
    if (candidates.length === 0) break;
    word = candidates.reduce((best, c) => {
      const cDeg = neighborsCombined(c).filter(x => !visited.has(partKey(x))).length;
      const bDeg = neighborsCombined(best).filter(x => !visited.has(partKey(x))).length;
      if (cDeg !== bDeg) return cDeg < bDeg ? c : best;
      // Tiebreak: lexicographic
      for (let i = 0; i < Math.max(c.length, best.length); i++) {
        if ((c[i] || 0) < (best[i] || 0)) return c;
        if ((c[i] || 0) > (best[i] || 0)) return best;
      }
      return best;
    });
    visited.add(partKey(word));
    sequence.push(word);
  }
  return sequence;
}
```

- [ ] **Step 2: Extend the inline tests to verify the sequence covers all partitions**

Add inside `runTests()`, after the existing assertions:

```js
  // greedyWarnsdorff — verifies Hamiltonian coverage for n=1..6
  // (n=7+ is slow enough to skip in dev; n=12 is precomputed once at runtime)
  for (let n = 1; n <= 6; n++) {
    const seq = greedyWarnsdorff(n);
    const expected = allPartitions(n).length;
    assert(seq.length === expected, `greedyWarnsdorff(${n}): ${seq.length}==${expected}`);
    // First partition is (1,...,1)
    assert(partKey(seq[0]) === partKey(Array(n).fill(1)), `greedyWarnsdorff(${n}) starts at (1,...,1)`);
  }
```

- [ ] **Step 3: Open browser console — all lines should print PASS**

- [ ] **Step 4: Commit**

```bash
git add Project/visualizer.html
git commit -m "feat: add greedyWarnsdorff algorithm with tests"
```

---

### Task 4: App State and Initialization

**Files:**
- Modify: `Project/visualizer.html` — add `appState`, `init()`, and the n-slider handler after the tests block

- [ ] **Step 1: Add `appState` and `init()` after the tests block**

```js
// ── App State ───────────────────────────────────────────────────

const appState = {
  n: 6,
  mode: 'interactive',      // 'interactive' | 'autosolve'
  sequence: [],             // precomputed greedyWarnsdorff sequence
  allParts: [],             // all partitions of n (for total count)
  currentPartition: null,   // current partition (array)
  history: [],              // [{partition, op, from}] growing list
  visited: new Set(),       // Set of partKey strings
  selected: null,           // null | rowIndex of selected dot
  autoplayTimer: null,      // setInterval ID or null
  autoIdx: 0,               // current step index in autosolve
};

// Speed slider: value 1..10 → interval ms (2000ms..100ms)
function speedToMs(sliderVal) {
  return Math.round(2000 - (sliderVal - 1) * (1900 / 9));
}

function init() {
  const n = appState.n;
  appState.allParts = allPartitions(n);
  appState.sequence = greedyWarnsdorff(n);
  appState.currentPartition = Array(n).fill(1);
  appState.history = [{ partition: appState.currentPartition, op: null, from: null }];
  appState.visited = new Set([partKey(appState.currentPartition)]);
  appState.selected = null;
  appState.autoIdx = 0;
  clearInterval(appState.autoplayTimer);
  appState.autoplayTimer = null;
  document.getElementById('btn-play').textContent = '▶ Play';
  renderAll();
}

// n slider
document.getElementById('n-slider').addEventListener('input', e => {
  appState.n = parseInt(e.target.value, 10);
  document.getElementById('n-value').textContent = appState.n;
  init();
});

// Mode tabs
document.getElementById('tab-interactive').addEventListener('click', () => setMode('interactive'));
document.getElementById('tab-autosolve').addEventListener('click',   () => setMode('autosolve'));

function setMode(mode) {
  if (appState.mode === mode) return;
  clearInterval(appState.autoplayTimer);
  appState.autoplayTimer = null;
  appState.mode = mode;
  appState.selected = null;
  // Reset to start when switching modes
  appState.currentPartition = appState.sequence[0];
  appState.history = [{ partition: appState.sequence[0], op: null, from: null }];
  appState.visited = new Set([partKey(appState.sequence[0])]);
  appState.autoIdx = 0;
  document.getElementById('btn-play').textContent = '▶ Play';
  document.getElementById('tab-interactive').classList.toggle('active', mode === 'interactive');
  document.getElementById('tab-autosolve').classList.toggle('active', mode === 'autosolve');
  document.getElementById('autosolve-controls').classList.toggle('disabled', mode === 'interactive');
  renderAll();
}

// Reset button
document.getElementById('btn-reset').addEventListener('click', init);

// Stub renderAll — replaced in later tasks
function renderAll() {
  renderSidebar();
  renderDiagram();
  renderHistory();
}
function renderSidebar() {}
function renderDiagram() {}
function renderHistory() {}

// Boot
init();
```

- [ ] **Step 2: Open browser — page loads without errors, n slider changes `n-value` text**

Check console: no errors. Slide the n-slider from 1 to 12; the number next to it updates. Clicking mode tabs doesn't crash.

- [ ] **Step 3: Commit**

```bash
git add Project/visualizer.html
git commit -m "feat: add app state, init, mode and n-slider wiring"
```

---

### Task 5: Ferrers Diagram Rendering

**Files:**
- Modify: `Project/visualizer.html` — replace the stub `renderDiagram()` with a real implementation, plus helpers `getMoveableRows()` and `renderSidebar()`

- [ ] **Step 1: Replace `renderDiagram()` with the full implementation**

```js
// Returns indices of rows whose last dot can be removed (partition remains valid).
function getMoveableRows(p) {
  const rows = [];
  for (let i = 0; i < p.length; i++) {
    const afterRemoval = p[i] - 1;
    if (i === p.length - 1 || afterRemoval >= p[i + 1]) rows.push(i);
  }
  return rows;
}

function renderDiagram() {
  const { currentPartition: p, selected, mode } = appState;
  const diagramEl = document.getElementById('diagram');
  diagramEl.innerHTML = '';

  const moveableRows = (mode === 'interactive' && selected === null)
    ? getMoveableRows(p) : [];

  const ghosts = (mode === 'interactive' && selected !== null)
    ? getGhostSlots(p, selected) : [];

  const ferrers = document.createElement('div');
  ferrers.className = 'ferrers';

  for (let rowIdx = 0; rowIdx < p.length; rowIdx++) {
    const row = document.createElement('div');
    row.className = 'ferrers-row';

    for (let col = 0; col < p[rowIdx]; col++) {
      const isEnd = col === p[rowIdx] - 1;
      const dot = document.createElement('div');

      if (selected === rowIdx && isEnd) {
        dot.className = 'dot selected';
        dot.addEventListener('click', deselectDot);
      } else if (mode === 'interactive' && moveableRows.includes(rowIdx) && isEnd) {
        dot.className = 'dot moveable';
        dot.addEventListener('click', () => selectDot(rowIdx));
      } else {
        dot.className = 'dot';
      }
      row.appendChild(dot);
    }

    // Ghost slot at end of this row (if one targets this row)
    if (selected !== null) {
      const ghost = ghosts.find(g => g.type === 'row' && g.displayRow === rowIdx);
      if (ghost) {
        const ghostEl = document.createElement('div');
        ghostEl.className = 'dot-ghost';
        ghostEl.addEventListener('click', () => executeMove(ghost.result));
        row.appendChild(ghostEl);
      }
    }

    ferrers.appendChild(row);
  }

  // New-row ghost at the bottom
  if (selected !== null) {
    const newRowGhost = ghosts.find(g => g.type === 'newrow');
    if (newRowGhost) {
      const row = document.createElement('div');
      row.className = 'ferrers-row';
      const ghostEl = document.createElement('div');
      ghostEl.className = 'dot-ghost';
      ghostEl.addEventListener('click', () => executeMove(newRowGhost.result));
      row.appendChild(ghostEl);
      ferrers.appendChild(row);
    }
  }

  diagramEl.appendChild(ferrers);

  // Stuck state: all move-one-unit neighbors are visited
  if (mode === 'interactive' && selected === null) {
    const allNeighborsVisited = neighborsMove(p).every(nb => appState.visited.has(partKey(nb)));
    if (allNeighborsVisited && appState.visited.size < appState.allParts.length) {
      const msg = document.createElement('p');
      msg.className = 'stuck-msg';
      msg.textContent = 'No unvisited moves available — try Reset or switch to Auto-solve.';
      diagramEl.appendChild(msg);
    }
  }
}

// Stubs filled in next tasks
function getGhostSlots(p, selectedRow) { return []; }
function selectDot(rowIdx) {}
function deselectDot() {}
function executeMove(result) {}
```

- [ ] **Step 2: Replace `renderSidebar()` stub with a real implementation**

```js
function renderSidebar() {
  const { currentPartition: p, visited, allParts, history, mode } = appState;

  document.getElementById('current-partition').textContent =
    '(' + p.join(', ') + ')';

  const total = allParts.length;
  const done  = visited.size;
  const pct   = total > 0 ? (done / total) * 100 : 0;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').textContent =
    `${done} / ${total} partitions visited`;

  const lastEntry = history[history.length - 1];
  const opSection = document.getElementById('last-op-section');
  if (history.length < 2 || !lastEntry.op) {
    opSection.style.display = 'none';
  } else {
    opSection.style.display = '';
    const badge = document.getElementById('op-badge');
    badge.textContent = lastEntry.op;
    badge.className = 'op-badge op-' + lastEntry.op;
    document.getElementById('op-detail').textContent =
      '(' + lastEntry.from.join(', ') + ') → (' + lastEntry.partition.join(', ') + ')';
  }

  // Auto-solve step counter
  document.getElementById('step-info').textContent =
    mode === 'autosolve'
      ? `Step ${appState.autoIdx + 1} / ${appState.sequence.length}`
      : `Step — / —`;
}
```

- [ ] **Step 3: Open browser**

For n=6, the center panel shows a left-aligned Ferrers diagram of 6 rows of 1 dot each. All end dots glow amber (all rows are moveable since removing any last-row singleton is valid — but wait, only the last row of `[1,1,1,1,1,1]` is moveable: rows 0–4 each have `partition[i]−1=0 < partition[i+1]=1`, so NOT moveable; only row 5 is moveable). Verify: only the bottom dot glows amber. Sidebar shows `(1, 1, 1, 1, 1, 1)` and `1 / 11 partitions visited`.

- [ ] **Step 4: Commit**

```bash
git add Project/visualizer.html
git commit -m "feat: render Ferrers diagram with moveable dot detection"
```

---

### Task 6: Interactive Selection, Ghost Slots, and Move Execution

**Files:**
- Modify: `Project/visualizer.html` — replace the stubs `getGhostSlots`, `selectDot`, `deselectDot`, `executeMove`

- [ ] **Step 1: Implement `getGhostSlots(p, selectedRow)`**

```js
// Computes where a dot picked up from selectedRow can validly land.
// Returns array of {type:'row', displayRow, result} | {type:'newrow', result}.
function getGhostSlots(p, selectedRow) {
  // Build intermediate partition after removing the end dot of selectedRow.
  const inter = [...p];
  inter[selectedRow]--;
  const rowDeleted = inter[selectedRow] === 0;
  if (rowDeleted) inter.splice(selectedRow, 1);

  const origKey = partKey(p);
  const ghosts = [];

  // Try placing the dot at the end of each row in the intermediate partition.
  for (let j = 0; j < inter.length; j++) {
    // Adding 1 to inter[j] must not exceed the row above.
    if (j > 0 && inter[j] + 1 > inter[j - 1]) continue;
    const result = [...inter]; result[j]++;
    if (partKey(result) === origKey) continue; // no-op

    // Map intermediate row index j back to original diagram row index.
    const displayRow = (rowDeleted && j >= selectedRow) ? j + 1 : j;
    ghosts.push({ type: 'row', displayRow, result });
  }

  // Try placing the dot as a new bottom row (size 1).
  const newRowResult = [...inter, 1];
  if (partKey(newRowResult) !== origKey) {
    ghosts.push({ type: 'newrow', result: newRowResult });
  }

  return ghosts;
}
```

- [ ] **Step 2: Implement `selectDot`, `deselectDot`, `executeMove`**

```js
function selectDot(rowIdx) {
  appState.selected = rowIdx;
  renderDiagram(); // re-render to show selected dot + ghost slots
}

function deselectDot() {
  appState.selected = null;
  renderDiagram();
}

function executeMove(result) {
  const prev = appState.currentPartition;
  const op   = classifyOp(prev, result);
  appState.currentPartition = result;
  appState.selected = null;
  appState.history.push({ partition: result, op, from: prev });
  appState.visited.add(partKey(result));
  renderAll();
}
```

- [ ] **Step 3: Verify interactive mode in browser**

Use n=4. Starting partition is `(1,1,1,1)`. Only the bottom dot (row 3) should glow amber. Click it — it turns gold and a green ghost slot appears at end of row 0 (placing there gives `(2,1,1,1)`). Click the ghost. The diagram should show `(2,1,1,1)`. The sidebar shows `last op: move`, history shows `(1,1,1,1) → (2,1,1,1)`. Progress updates to `2 / 5`.

Try n=6 and navigate through a few steps. The right history panel is still a stub — that's fine.

- [ ] **Step 4: Commit**

```bash
git add Project/visualizer.html
git commit -m "feat: interactive dot selection, ghost slots, move execution"
```

---

### Task 7: History Panel Rendering

**Files:**
- Modify: `Project/visualizer.html` — replace stub `renderHistory()` with a real implementation

- [ ] **Step 1: Implement `renderHistory()`**

```js
function renderHistory() {
  const { history, mode, sequence, autoIdx } = appState;
  const listEl = document.getElementById('history-list');
  listEl.innerHTML = '';

  if (mode === 'interactive') {
    // Show only visited history, growing as user moves.
    history.forEach((entry, i) => {
      const el = buildHistoryRow(i + 1, entry.op, entry.partition, i === history.length - 1);
      listEl.appendChild(el);
    });
  } else {
    // Auto-solve: show full precomputed sequence.
    // Past and current steps are filled in; future steps are greyed out.
    sequence.forEach((part, i) => {
      const op = i === 0 ? null : classifyOp(sequence[i - 1], part);
      const isCurrent = i === autoIdx;
      const isFuture  = i > autoIdx;
      const el = buildHistoryRow(i + 1, op, isFuture ? null : part, isCurrent);
      if (isFuture) el.classList.add('future');
      listEl.appendChild(el);
    });
  }

  // Auto-scroll: keep current entry visible.
  const currentEl = listEl.querySelector('.history-entry.current');
  if (currentEl) currentEl.scrollIntoView({ block: 'nearest' });
}

function buildHistoryRow(stepNum, op, partition, isCurrent) {
  const entry = document.createElement('div');
  entry.className = 'history-entry' + (isCurrent ? ' current' : '');

  const stepEl = document.createElement('span');
  stepEl.className = 'history-step';
  stepEl.textContent = stepNum;

  const opDot = document.createElement('div');
  opDot.className = 'history-op-dot ' + (op ? 'op-dot-' + op : 'op-dot-none');

  const partEl = document.createElement('span');
  partEl.className = 'history-partition';
  partEl.textContent = partition ? '(' + partition.join(', ') + ')' : '—';

  entry.appendChild(stepEl);
  entry.appendChild(opDot);
  entry.appendChild(partEl);
  return entry;
}
```

- [ ] **Step 2: Verify in browser**

n=6, interactive mode. Make a few moves. The right panel should show each visited partition in order with a colored dot (green for move). The current partition should be highlighted with a blue left border.

Switch to auto-solve mode. The full 11-step sequence should appear, with future steps greyed out, current step highlighted.

- [ ] **Step 3: Commit**

```bash
git add Project/visualizer.html
git commit -m "feat: history panel rendering with auto-scroll"
```

---

### Task 8: Auto-solve Playback Controls

**Files:**
- Modify: `Project/visualizer.html` — wire `btn-prev`, `btn-next`, `btn-play`, `speed-slider` to step through the Warnsdorff sequence

- [ ] **Step 1: Add step functions and wire the playback buttons**

```js
// ── Auto-solve Controls ─────────────────────────────────────────

function autoStep(direction) {
  const { sequence } = appState;
  const nextIdx = appState.autoIdx + direction;
  if (nextIdx < 0 || nextIdx >= sequence.length) return;

  appState.autoIdx = nextIdx;
  appState.currentPartition = sequence[nextIdx];

  // Build history up to current index for sidebar op display.
  appState.history = sequence.slice(0, nextIdx + 1).map((part, i) => ({
    partition: part,
    op: i === 0 ? null : classifyOp(sequence[i - 1], part),
    from: i === 0 ? null : sequence[i - 1],
  }));
  appState.visited = new Set(sequence.slice(0, nextIdx + 1).map(partKey));
  renderAll();
}

function startAutoplay() {
  const ms = speedToMs(parseInt(document.getElementById('speed-slider').value, 10));
  appState.autoplayTimer = setInterval(() => {
    if (appState.autoIdx >= appState.sequence.length - 1) {
      stopAutoplay();
      return;
    }
    autoStep(1);
  }, ms);
  document.getElementById('btn-play').textContent = '⏸ Pause';
}

function stopAutoplay() {
  clearInterval(appState.autoplayTimer);
  appState.autoplayTimer = null;
  document.getElementById('btn-play').textContent = '▶ Play';
}

document.getElementById('btn-play').addEventListener('click', () => {
  if (appState.mode !== 'autosolve') return;
  if (appState.autoplayTimer) stopAutoplay();
  else startAutoplay();
});

document.getElementById('btn-prev').addEventListener('click', () => {
  if (appState.mode !== 'autosolve') return;
  stopAutoplay();
  autoStep(-1);
});

document.getElementById('btn-next').addEventListener('click', () => {
  if (appState.mode !== 'autosolve') return;
  stopAutoplay();
  autoStep(1);
});

// Speed slider restarts autoplay at new speed if currently playing.
document.getElementById('speed-slider').addEventListener('input', () => {
  if (appState.autoplayTimer) { stopAutoplay(); startAutoplay(); }
});
```

- [ ] **Step 2: Verify auto-solve in browser**

Switch to auto-solve mode. Click ▶ Play — the diagram should step through all 11 partitions for n=6, advancing once per interval. The history panel fills in from top. Click ⏸ Pause to stop. Use Prev/Next to step manually. Drag the speed slider to fast — verify the interval changes.

At the end of the sequence, playback stops automatically and the button returns to ▶ Play.

- [ ] **Step 3: Verify that `autosolve-controls` are greyed out in interactive mode**

Switch back to Interactive tab. The playback controls should appear faded (opacity 0.4) and clicking Prev/Next/Play should do nothing.

- [ ] **Step 4: Commit**

```bash
git add Project/visualizer.html
git commit -m "feat: auto-solve playback with play/pause, prev/next, speed slider"
```

---

### Task 9: Edge Cases and Final Polish

**Files:**
- Modify: `Project/visualizer.html` — fix edge cases for n=1, verify n=12 loads, ensure mode switching is clean

- [ ] **Step 1: Test n=1**

Set slider to n=1. Partition is `(1,)`. There are no valid moves (only 1 partition exists). The diagram shows one dot. No amber glow (no moveable dots since no valid neighbors). Stuck message should NOT appear (all partitions are visited already — `visited.size === allParts.length`). Progress shows `1 / 1 partitions visited`. Switch to auto-solve — Play does nothing (sequence length = 1, no steps to advance). No JS errors.

Verify the stuck-message logic in `renderDiagram()` only fires when `visited.size < allParts.length`:
```js
if (allNeighborsVisited && appState.visited.size < appState.allParts.length) { ... }
```
This is already in the Task 5 code. Confirm it's there.

- [ ] **Step 2: Test n=12**

Set slider to n=12. The sequence computation (`greedyWarnsdorff(12)`, 77 partitions) may take ~1–3 seconds. While it runs, the UI is temporarily unresponsive. This is acceptable given the scope (n ≤ 12, no async required). Verify: the diagram renders with `(1,...,1)` (12 dots, 12 rows), progress shows `1 / 77 partitions visited`. Switch to auto-solve and use Next to advance a few steps.

If n=12 takes more than 5 seconds, add a `console.time`/`console.timeEnd` around `greedyWarnsdorff(12)` to measure; the Python reference runs in under 1s so JS should be comparable.

- [ ] **Step 3: Verify mode-switch resets cleanly**

While in interactive mode with several moves made, switch to auto-solve. State should reset to step 1 `(1,...,1)`. Switch back to interactive — again at step 1, history cleared. No stale `selected` dot, no ghost slots lingering.

- [ ] **Step 4: Verify auto-solve history in auto-solve mode shows the operation type correctly**

For n=6, the Warnsdorff sequence includes a step `(3,3) → (6,)` which is a `merge` (orange dot in history). Step through or play until you reach it and confirm the history panel shows an orange dot for that row.

- [ ] **Step 5: Final commit**

```bash
git add Project/visualizer.html
git commit -m "feat: polish edge cases, verify n=1 and n=12, finalize visualizer"
```

---

### Task 10: Deploy to GitHub Pages

**Files:**
- No file changes — deploy existing `Project/visualizer.html`

- [ ] **Step 1: Confirm GitHub Pages is configured for the repo**

```bash
gh api repos/luhaza/gray_codes/pages
```

Expected: JSON with `"source": {"branch": "main", "path": "/"}` or similar. If Pages isn't enabled, enable it via `gh api --method POST repos/luhaza/gray_codes/pages --field source='{"branch":"main","path":"/"}'`.

- [ ] **Step 2: Push to remote**

```bash
git push origin main
```

- [ ] **Step 3: Wait ~60 seconds, then open the Pages URL**

The URL is `https://luhaza.github.io/gray_codes/Project/visualizer.html`. Verify:
- Layout renders correctly (three columns)
- n slider works (change n, diagram updates)
- Interactive mode: amber dot on bottom of starting partition, can click to move
- Auto-solve mode: Play steps through the full Warnsdorff sequence
- History panel updates and auto-scrolls

---

## Self-Review Against Spec

| Spec requirement | Task |
|---|---|
| Left-aligned Ferrers diagram | Task 5 (`ferrers` uses `align-items: flex-start`) |
| Dots at ends of rows are moveable | Task 5 (`getMoveableRows`) |
| Two-click: select dot → ghost slots | Task 6 (`selectDot`, `getGhostSlots`) |
| Ghost slots only at valid (weakly-decreasing) destinations | Task 6 (`getGhostSlots` constraint check) |
| Deselect by clicking selected dot | Task 6 (`deselectDot`) |
| Visited tracking + progress bar | Tasks 6–7 (`visited` Set, `renderSidebar`) |
| Op badge: move/split/merge with color | Task 7 (`renderSidebar`, `.op-move/.op-split/.op-merge`) |
| History panel: step, colored dot, partition | Task 7 (`renderHistory`, `buildHistoryRow`) |
| History auto-scrolls to current | Task 7 (`scrollIntoView`) |
| Auto-solve: full Warnsdorff sequence (includes split/merge) | Tasks 3 + 8 |
| Future steps greyed out in auto-solve history | Task 7 (`'future'` class) |
| Play/Pause + speed slider + Prev/Next | Task 8 |
| Auto-solve controls greyed out in interactive mode | Task 4 (`setMode` → `disabled` class) |
| Stuck state message | Task 5 |
| Reset button | Task 4 (`btn-reset`) |
| n slider 1–12 | Tasks 4–5 |
| n change recomputes sequence and resets | Task 4 (`init`) |
| Mode switch resets to start | Task 4 (`setMode`) |
| Single HTML file, no build step | Task 1 |
| GitHub Pages deployment | Task 10 |
| Dark theme matching repo style | Task 1 (CSS variables match `#0f0f1a`, `#7eb8f7`) |
