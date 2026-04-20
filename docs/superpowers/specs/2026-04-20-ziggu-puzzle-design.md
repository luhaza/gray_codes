# Zigguhooked Puzzle — Google Apps Script Web App Design

**Date:** 2026-04-20
**Reference:** Goertz & Williams, "The Quaternary Gray Code and Ziggu Puzzles" (FUN 2026)

---

## Overview

An interactive, educational web app that simulates the Zigguhooked variant of the Ziggu puzzle family. Users can explore the puzzle freely, get hints toward the shortest or longest solution, and watch the puzzle auto-solve. The app is deployed as a Google Apps Script web app accessible via a shareable link with no sign-in required.

---

## Puzzle Model

- **Variant:** Zigguhooked (2-neighbor, p=6 dials, m=5 mazes, n=6 digits)
- **State:** A 6-element array of integers [d₁, d₂, d₃, d₄, d₅, d₆], each in {0, 1, 2, 3}, read left-to-right (d₁ = most significant)
- **Start state:** [0, 0, 0, 0, 0, 0] (`000000`)
- **Target state:** [3, 3, 3, 3, 3, 3] (`333333`)
- **Total valid states:** 1093 = (3⁷ − 1)/2
- **Shortest solution length:** 361 states (360 moves), formula: 6·2⁶ − 3·6 − 5
- **Longest solution length:** 1093 states (1092 moves), visits every valid state

### Validity Rule

A state is valid if and only if no digit 3 is immediately followed (left-to-right) by a digit other than 3. Equivalently: once a 3 appears, all digits to its right must also be 3.

### Dial Directions

Each digit maps to a dial arrow direction:
- 0 → ↙
- 1 → →
- 2 → ↗
- 3 → ↑

### Successor Rules (from paper equations 11 & 12)

Both rules scan digit positions right-to-left (i = 1 to 6, where i=1 is the rightmost digit d₆). Let `parity(i)` = sum of all digits to the left of position i.

**`nextV(state)`** — longest-path successor (equation 11):
Find the minimum i such that:
- Case 1: `parity(i)` is even and `d[i] < 3`, OR
- Case 2: `parity(i)` is odd and `d[i] > 0` and `d[i-1] ≠ 3`

When i=1 (rightmost), `d[i-1]` is out of bounds — treat `d[i-1] ≠ 3` as vacuously satisfied.
Increment `d[i]` in Case 1, decrement in Case 2. If no such i exists, state = `333333` (solved).

**`nextS(state)`** — shortest-path successor (equation 12):
Same as `nextV` but Case 2 adds the extra condition: the two-digit substring `d[i-1]d[i]` must not equal `03` (i.e., skip when `d[i-1]=0` and `d[i]=3`). Again, `d[i-1]` is treated as non-zero when out of bounds.

If undefined, state = `333333` (solved).

---

## Architecture

### Files

| File | Purpose |
|------|---------|
| `Code.gs` | `doGet()` — serves `index.html` as a Google Apps Script web app |
| `index.html` | Complete app: HTML structure, CSS styles, JavaScript logic |

### Deployment

- Execute as: Me (developer)
- Who has access: Anyone (no sign-in required)
- Result: permanent shareable URL `https://script.google.com/macros/s/.../exec`

All puzzle logic runs client-side in the browser. The server only serves the static HTML.

---

## UI Layout

### Top Bar

- App title: "Zigguhooked Puzzle"
- Current state string display (large monospace, e.g., `012310`)
- Reset button → returns to `000000`, clears move history
- Auto-Solve button → starts/pauses animated shortest-path solution

### Main Area (two-column layout)

**Left — Dial Panel:**
- 6 circular dials displayed in a horizontal row
- Each dial shows a rotating arrow hand indicating its current position (0–3)
- Visual states:
  - Default: neutral border
  - Can move: green glow (valid move available)
  - Optimal shortest-path dial: gold pulse animation
  - Disabled: grayed-out buttons
- Each dial has a "+" button (above) and "−" button (below)
- Invalid moves: buttons grayed out and non-interactive
- Dial labels: d₁ through d₆

**Right — Info Panel:**
- **State string:** large monospace display of current 6-digit quaternary state
- **Progress bar:** filled proportionally to moves-made / 361; shows move count
- **Hint section:**
  - "Shortest next: rotate dial N ↑ / ↓"
  - "Longest next: rotate dial N ↑ / ↓"
- **Move history:** full scrollable log of all moves made in the session (format: "Move 12: dial 3 +1 → 012310")
- **Solved banner:** displayed when state = `333333`

---

## Core JavaScript Functions

| Function | Description |
|----------|-------------|
| `isValid(state)` | Returns true if no 3 is immediately followed by a non-3 |
| `validMoves(state)` | Returns array of `{dial, direction}` pairs for all legal single-dial moves |
| `nextV(state)` | Returns the next state in the longest solution (equation 11) |
| `nextS(state)` | Returns the next state in the shortest solution (equation 12) |
| `applyMove(state, dial, dir)` | Returns new state after incrementing/decrementing dial by dir (+1/−1) |
| `renderDials(state)` | Updates dial arrow rotations and button states in the DOM |
| `updateInfoPanel(state)` | Refreshes state string, progress bar, hints, history |
| `autoSolve()` | Runs `nextS` on an interval (~400ms/step); toggles on Auto-Solve button |
| `reset()` | Resets state to `000000`, clears history, stops auto-solve |

---

## Auto-Solve Animation

- Triggered by the Auto-Solve button
- Uses `setInterval` at ~400ms per step
- Each step: compute `nextS(currentState)`, apply the move, update UI
- Button toggles between "Auto-Solve" and "Pause"
- Stops automatically when `333333` is reached
- User can make manual moves at any time (auto-solve continues from new state if running)

---

## Constraints & Non-Goals

- No server-side state: all logic is client-side JavaScript
- No user accounts or score persistence
- No mobile-specific layout (desktop browser assumed)
- No ranking/unranking functions (out of scope)
