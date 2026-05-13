# Ferrers Gray Code Visualizer — Design Spec

**Date:** 2026-05-13  
**Scope:** Single HTML/CSS/JS file, hosted on GitHub Pages at `luhaza/gray_codes`

---

## Overview

An interactive browser-based visualizer for the Warnsdorff greedy Gray code on integer partitions of n. The user sees an integer partition as a left-aligned Ferrers diagram (rows of dots), can manually navigate through partitions by moving dots, and can watch the algorithm auto-solve in the Warnsdorff order. A history panel shows every partition visited and the operation used to reach it.

---

## Algorithm (reference, not to be changed)

Implemented in JavaScript, ported directly from the Python in `Project/presentation.ipynb`:

- **Objects:** integer partitions of n (arrays in weakly-decreasing order)
- **Operations:**
  - `neighborsMove(p)` — move 1 unit from any part to any other part, or split a unit off into a new part-of-1
  - `neighborsSplitMerge(p)` — split one part into two, or merge any two parts into one
  - `neighborsCombined(p)` — union of the above two
- **Algorithm:** `greedyWarnsdorff(n)` — start from `(1,1,...,1)`, at each step pick the unvisited neighbor with the fewest unvisited neighbors of its own (Warnsdorff's rule), break ties lexicographically
- **Verified:** produces a Hamiltonian path through all partitions of n for n = 1–30
- **n range supported:** 1–12 (up to 77 partitions)
- **Operation classification:** `classifyOp(p, q)` returns `'move'`, `'split'`, or `'merge'`

The full sequence for a given n is precomputed once when n changes.

---

## Layout — Three-Column

```
┌─────────────────────────────────────────────────────────────────┐
│  Ferrers Gray Code Visualizer          n = [slider 1–12]        │  ← topbar
├─────────────────┬───────────────────────────┬───────────────────┤
│  LEFT SIDEBAR   │     CENTER (diagram)       │  RIGHT HISTORY    │
│  300px fixed    │     flex: 1, centered      │  240px fixed      │
│                 │                            │                   │
│  Mode toggle    │   ●  ●  ●  ○  (ghost)      │  1 · (1,1,1,1,1,1)│
│  Current part.  │   ●  ◉  (selected)         │  2 ● (2,1,1,1,1)  │
│  Last op badge  │   ◎  (moveable)            │  3 ● (3,1,1,1)    │
│  Progress bar   │   ○  (ghost new row)       │  ▶ 6 ● (3,2,1)    │  ← current
│  Playback ctrl  │                            │  7 · —            │
│  Reset          │                            │  legend           │
└─────────────────┴───────────────────────────┴───────────────────┘
```

### Topbar
- Title: "Ferrers Gray Code Visualizer"
- `n` slider (range 1–12) with current value displayed. Changing n resets everything and recomputes the Warnsdorff sequence.

### Left Sidebar (300px)
Sections from top to bottom:

1. **Mode** — two-tab toggle: `Interactive` / `Auto-solve`
2. **Current partition** — monospace display of the current partition, e.g. `(3, 2, 1)`
3. **Last operation** — colored badge (`move` green / `split` purple / `merge` orange) plus a monospace line showing `(prev) → (current)`; hidden on the first partition
4. **Progress** — progress bar + `X / Y partitions visited` text
5. **Auto-solve controls** — always visible; greyed out (opacity 0.4, pointer-events none) in Interactive mode, fully active in Auto-solve mode:
   - Row: `⏮ Prev` · `▶ Play / ⏸ Pause` · `Next ⏭`
   - Speed slider: Slow ↔ Fast (controls step interval, range ~100ms–2000ms)
   - Step counter: `Step X / Y`
6. **Reset** (bottom, pinned) — returns to the starting partition `(1,1,...,1)`, clears history

### Center — Ferrers Diagram
- Dots are **left-aligned**, arranged in rows top-to-bottom
- Dot size: 32px, gap: 12px
- Diagram is centered horizontally and vertically in the available space
- **Dot states:**
  - Normal — blue (`#7eb8f7`)
  - Moveable — amber glow (`#f59e0b`), cursor pointer; shown when no dot is selected
  - Selected — bright gold (`#fbbf24`), slightly enlarged; shown after a dot is clicked
  - Ghost slot — green dashed circle (`#4ade80`); shown at valid destinations after a dot is selected
- A dot at the end of row `i` is **moveable** when: `partition[i] - 1 >= partition[i+1]` (or `i` is the last row)
- Ghost slots are computed on the **intermediate partition** `p'` (the partition after removing the selected dot). A slot is shown for each row `j` of `p'` where `p'[j] + 1 <= p'[j-1]` (or `j = 0`) and `p'[j] + 1 >= p'[j+1]` (or `j` is the last row). A new-bottom-row ghost is always shown. Any target that would produce the original partition (i.e. placing back in the same row at the same position) is excluded.

### Right History Panel (240px)
- Scrollable list of every partition reached so far, in order
- Each row: step number · colored op dot · partition in monospace
- Current step is highlighted (blue left border, bold text)
- In interactive mode, future slots are not shown (history grows as you move)
- In auto-solve mode, the full Warnsdorff sequence is precomputed; future steps are shown greyed out and fill in as the algorithm advances
- Legend at the bottom: green = move, purple = split, orange = merge
- Auto-scrolls to keep the current step visible

---

## Interactive Mode

**Goal:** visit all partitions of n by moving dots. The puzzle is to find your own Hamiltonian path through the move-one-unit neighborhood.

**Interaction — two-click:**
1. Amber-glowing dots mark the moveable ends. Click one to select it (turns gold, enlarges). Moveable dots on other rows are hidden while one is selected.
2. Green ghost slots appear at all valid destinations. Click a ghost to complete the move.
3. Clicking the selected dot again deselects it (cancels the pick-up).
4. After a move, the new partition is rendered, history grows by one entry, and the sidebar updates.

**Valid moves (interactive mode only):**  
Any partition reachable by removing the last dot of some row and placing it elsewhere, such that the result is weakly decreasing. This is exactly the `neighborsMove` neighborhood. Split/merge operations that require moving more than one dot are **not** available in interactive mode; they only appear in auto-solve.

**Visited tracking:**  
Visited partitions are stored in a Set. The progress bar reflects `visited.size / totalPartitions(n)`. There is no win-state animation required — the progress bar reaching 100% is sufficient indication.

**Stuck state:**  
If all `neighborsMove` neighbors of the current partition have already been visited, no amber dots are shown. A small message below the diagram reads: "No unvisited moves available — try Reset or switch to Auto-solve."

---

## Auto-solve Mode

Uses the precomputed `greedyWarnsdorff(n)` sequence (full combined neighborhood, including split/merge steps).

- **Play/Pause:** toggles automatic stepping at the configured speed
- **Prev / Next:** step backward or forward one partition at a time; pauses playback
- **Speed slider:** maps linearly to step interval: leftmost = 2000ms, rightmost = 100ms
- **History panel:** shows the full sequence; grey future steps fill in as the algorithm advances; auto-scrolls to current
- **Switching back to Interactive** from Auto-solve mid-sequence resets to the start

---

## File Structure

Single file: `Project/visualizer.html` (following the pattern of `ziggu-puzzle/index.html`)

Internal structure:
- `<style>` — all CSS, dark theme matching the existing repo style (`#0f0f1a` background, `#7eb8f7` accent)
- `<script>` — all JavaScript, organized into logical sections:
  - **Partition math** — `allPartitions`, `neighborsMove`, `neighborsSplitMerge`, `neighborsCombined`, `classifyOp`
  - **Warnsdorff** — `greedyWarnsdorff` (returns full sequence array for given n)
  - **State** — `appState` object: `{ n, mode, sequence, currentIdx, visited, selected, autoplayTimer }`
  - **Rendering** — `renderDiagram()`, `renderSidebar()`, `renderHistory()`
  - **Interaction** — click handlers for dots, ghost slots, mode toggle, playback controls, n slider, reset

---

## GitHub Pages

The file lives at `Project/visualizer.html`. GitHub Pages is already configured on the `luhaza/gray_codes` repo. The page will be accessible at the repo's Pages URL under `/Project/visualizer.html`. No build step required.

---

## Out of Scope

- Mobile/touch drag support (two-click works on touch)
- Saving/loading state
- Any n > 12
- Animations between partition states (instantaneous re-render is sufficient)
- Sound or haptic feedback
