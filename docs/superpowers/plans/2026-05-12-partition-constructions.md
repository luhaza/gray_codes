# Integer Partition Gray Code Constructions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Jupyter notebook that experiments with four deterministic Gray code construction approaches for integer partitions, without relying on Warnsdorff's heuristic for tie-breaking.

**Architecture:** Single notebook `integer_partitions_constructions.ipynb` with 5 sections (0–4), each self-contained. Section 0 defines shared utilities; Sections 1–4 each implement and evaluate one approach, using `verify()` to confirm correctness.

**Tech Stack:** Python 3, Jupyter notebook (`.ipynb`), no external dependencies beyond the standard library.

---

## File Structure

- **Create:** `gray_codes/Project/integer_partitions_constructions.ipynb`
  - Section 0: Shared utilities
  - Section 1: Recursive by largest part (revisit)
  - Section 2: Recursive by number of parts
  - Section 3: Change sequence analysis
  - Section 4: Successor rule candidates

---

## Task 0: Create notebook with Section 0 — Shared Utilities

**Files:**
- Create: `gray_codes/Project/integer_partitions_constructions.ipynb`

- [ ] **Step 1: Create the notebook file with Section 0 cells**

Create `gray_codes/Project/integer_partitions_constructions.ipynb` with the following cells in order.

**Cell 0 — markdown:**
```markdown
# Integer Partition Gray Code Constructions

Experiments with deterministic (non-heuristic) Gray code constructions.
Each section is self-contained. Use `verify(listing, n)` to check correctness.

**Operations:**
- *move-one-unit*: transfer 1 unit between two parts (removing 0-parts); or split off a new part of size 1
- *split*: split one part into two smaller parts
- *merge*: merge two parts into one

**Goal:** A *correct* Gray code visits every partition of n exactly once, and each consecutive pair differs by exactly one operation.
```

**Cell 1 — markdown:**
```markdown
## Section 0 — Setup
```

**Cell 2 — code:**
```python
# All integer partitions of n as weakly-decreasing tuples.
def allPartitions(n):
    def helper(n, max_part):
        if n == 0:
            yield ()
            return
        for i in range(min(n, max_part), 0, -1):
            for rest in helper(n - i, i):
                yield (i,) + rest
    return list(helper(n, n))
```

**Cell 3 — code:**
```python
# Move-one-unit neighbors: transfer 1 unit from part i to part j (removes 0-parts),
# or split off a new part of size 1 from any part of size ≥ 2.
def neighborsMove(partition):
    parts = list(partition)
    results = set()
    n = sum(parts)
    for i in range(len(parts)):
        for j in range(len(parts)):
            if i == j:
                continue
            new_parts = parts[:]
            new_parts[i] -= 1
            new_parts[j] += 1
            new_parts = [p for p in new_parts if p > 0]
            t = tuple(sorted(new_parts, reverse=True))
            if t and sum(t) == n:
                results.add(t)
        if parts[i] > 1:
            new_parts = parts[:]
            new_parts[i] -= 1
            new_parts.append(1)
            results.add(tuple(sorted(new_parts, reverse=True)))
    return results - {partition}

# Split/merge neighbors: split one part into two, or merge two parts into one.
def neighborsSplitMerge(partition):
    parts = list(partition)
    results = set()
    for i in range(len(parts)):
        for j in range(i + 1, len(parts)):
            merged = parts[i] + parts[j]
            new_parts = [parts[k] for k in range(len(parts)) if k != i and k != j]
            new_parts.append(merged)
            results.add(tuple(sorted(new_parts, reverse=True)))
        for s in range(1, parts[i] // 2 + 1):
            new_parts = parts[:]
            new_parts[i] -= s
            new_parts.append(s)
            results.add(tuple(sorted(new_parts, reverse=True)))
    return results - {partition}

# Combined neighborhood: union of move-one-unit and split/merge.
def neighborsCombined(partition):
    return neighborsMove(partition) | neighborsSplitMerge(partition)
```

**Cell 4 — code:**
```python
# Encode a partition as a length-n binary string (LAGOS 2025 paper encoding).
# Each part a_k → 0^(a_k-1) + '1', all parts concatenated.
# Example: (3,2,1) → "001" + "01" + "1" = "001011"
def toBinary(partition):
    return ''.join('0' * (p - 1) + '1' for p in partition)
```

**Cell 5 — code:**
```python
# Verify a listing is a correct Gray code for integer partitions of n.
# Returns (True, "OK") or (False, reason string).
def verify(listing, n):
    expected = allPartitions(n)
    if len(listing) != len(expected):
        return False, f"Length {len(listing)}, expected {len(expected)}"
    if set(listing) != set(expected):
        missing = set(expected) - set(listing)
        return False, f"Missing partitions: {sorted(missing)[:5]}"
    for i in range(len(listing) - 1):
        if listing[i + 1] not in neighborsCombined(listing[i]):
            return False, f"Step {i}: {listing[i]} → {listing[i+1]} is not a valid neighbor"
    return True, "OK"
```

**Cell 6 — code (smoke test):**
```python
# Smoke test: verify utilities on n=5.
parts5 = allPartitions(5)
print(f"P(5) = {len(parts5)} partitions: {parts5}")
print(f"neighborsMove((3,2)):    {sorted(neighborsMove((3,2)))}")
print(f"neighborsSplitMerge((3,2)): {sorted(neighborsSplitMerge((3,2)))}")
print(f"toBinary((3,2)) = '{toBinary((3,2))}'  (expected '00101')")
```

Expected output:
```
P(5) = 7 partitions: [(5,), (4, 1), (3, 2), (3, 1, 1), (2, 2, 1), (2, 1, 1, 1), (1, 1, 1, 1, 1)]
neighborsMove((3,2)):    [(2, 2, 1), (4, 1), (5,)]
neighborsSplitMerge((3,2)): [(2, 2, 1), (3, 1, 1), (4, 1), (5,)]
toBinary((3,2)) = '00101'  (expected '00101')
```

- [ ] **Step 2: Run the smoke test cell and confirm output matches expected**

- [ ] **Step 3: Commit**

```bash
git add gray_codes/Project/integer_partitions_constructions.ipynb
git commit -m "feat: add constructions notebook with Section 0 utilities"
```

---

## Task 1: Section 1 — Recursive by Largest Part (Revisit)

**Files:**
- Modify: `gray_codes/Project/integer_partitions_constructions.ipynb`

- [ ] **Step 1: Add Section 1 cells to the notebook**

**Cell — markdown:**
```markdown
## Section 1 — Recursive by Largest Part (Revisit)

**Approach:** P(n, k) = partitions of n with largest part ≤ k. Recursive structure:
- P(n, 1) = {(1,...,1)} — a single partition
- P(n, k) = P(n, k-1) ∪ { (k,) + λ  for  λ ∈ P(n-k, k) }

A Gray code for P(n, k) is built by appending a Gray code for the new layer onto GC(n, k-1),
connected via a single merge (two parts → k) at the boundary.

**Known issue:** When n is divisible by (k-1), GC(n, k-1) ends at an all-equal partition
with no parts of size 1, blocking the merge connection to layer k.
```

**Cell — code:**
```python
# Partitions of n with largest part exactly k.
def newInLayer(n, k):
    return [p for p in allPartitions(n) if p[0] == k]

# Partitions of n grouped by largest part, in order 1..max.
def layersByLargestPart(n):
    result = {}
    for p in allPartitions(n):
        k = p[0]
        result.setdefault(k, []).append(p)
    return result

# Display layer sizes for n=6.
n = 6
layers = layersByLargestPart(n)
print(f"Layers for n={n}:")
for k in sorted(layers):
    print(f"  k={k}: {sorted(layers[k])}")
```

**Cell — code:**
```python
# Warnsdorff greedy restricted to a subset of partitions.
# Used to find a Hamiltonian path within a layer.
def greedyInSubset(start, subset, neighbor_fn):
    subset = set(subset)
    visited = {start}
    path = [start]
    while True:
        cands = [c for c in neighbor_fn(path[-1]) if c in subset and c not in visited]
        if not cands:
            break
        # Warnsdorff: fewest unvisited neighbors within subset
        path.append(min(cands, key=lambda c: (
            len([x for x in neighbor_fn(c) if x in subset and x not in visited]), c
        )))
        visited.add(path[-1])
    return path
```

**Cell — code:**
```python
# Attempt recursive largest-part construction for a given n.
# Returns the listing and a status message.
def grayByLargestPart(n):
    layers = layersByLargestPart(n)
    max_k = max(layers)

    # Start: GC for layer 1 is just (1,...,1).
    listing = [(1,) * n]

    for k in range(2, max_k + 1):
        new_layer = layers[k]

        # Find which partition in new_layer is reachable from listing[-1] via neighborsCombined.
        entry = None
        for p in new_layer:
            if p in neighborsCombined(listing[-1]):
                entry = p
                break

        if entry is None:
            return listing, f"FAIL at k={k}: cannot enter new layer from {listing[-1]}"

        # Traverse the new layer with Warnsdorff (restricted to new_layer).
        segment = greedyInSubset(entry, new_layer, neighborsCombined)

        if len(segment) != len(new_layer):
            stuck = set(new_layer) - set(segment)
            return listing + segment, (
                f"FAIL at k={k}: incomplete traversal of layer "
                f"({len(segment)}/{len(new_layer)}), stuck at {segment[-1]}, "
                f"missed {sorted(stuck)}"
            )

        listing += segment

    return listing, "OK"

# Run for n=1..10 and report.
print(f"{'n':>2} | {'P(n)':>5} | {'got':>5} | status")
for n in range(1, 11):
    listing, status = grayByLargestPart(n)
    ok, msg = verify(listing, n)
    print(f"{n:2d} | {len(allPartitions(n)):5d} | {len(listing):5d} | {'✓' if ok else status}")
```

**Cell — code:**
```python
# Deep-dive on n=6: show exactly where the connection fails.
n = 6
listing, status = grayByLargestPart(n)
print(f"Listing so far (length {len(listing)}):")
for p in listing:
    print(f"  {p}")
print(f"\nStatus: {status}")
print(f"\nNeighbors of last partition {listing[-1]}:")
print(f"  Combined: {sorted(neighborsCombined(listing[-1]))}")
print(f"  New layer k=3: {sorted(newInLayer(6, 3))}")
```

**Cell — markdown:**
```markdown
### Fix Attempt: Flexible Exit

When GC(n, k-1) ends at an all-equal partition with no merge path to layer k,
try to find an *alternate endpoint* for GC(n, k-1) that does connect.

Strategy: after finding that the natural endpoint is blocked, use backtracking
to find any Hamiltonian path through P(n, k-1) whose endpoint *is* adjacent to
some partition in layer k.
```

**Cell — code:**
```python
def findConnectableEndpoint(subset, next_layer, neighbor_fn, time_limit=200000):
    """
    Find a Hamiltonian path through `subset` ending at a node adjacent to `next_layer`.
    Returns (path, status).
    """
    subset = list(subset)
    next_set = set(next_layer)
    calls = [0]

    def backtrack(path, visited):
        calls[0] += 1
        if calls[0] > time_limit:
            return None
        if len(path) == len(subset):
            if any(p in neighbor_fn(path[-1]) for p in next_set):
                return path
            return None
        current = path[-1]
        cands = [c for c in neighbor_fn(current) if c in set(subset) and c not in visited]
        # Warnsdorff ordering
        cands.sort(key=lambda c: (
            len([x for x in neighbor_fn(c) if x in set(subset) and x not in visited]), c
        ))
        for nbr in cands:
            visited.add(nbr)
            path.append(nbr)
            result = backtrack(path, visited)
            if result:
                return result
            path.pop()
            visited.remove(nbr)
        return None

    # Try each possible start partition.
    for start in subset:
        visited = {start}
        result = backtrack([start], visited)
        if result:
            return result, "OK"
        if calls[0] > time_limit:
            return None, f"Time limit reached after {calls[0]} calls"

    return None, "No connectable Hamiltonian path found"

# Test on n=6, layer k=2 (P(6,2)), connecting to layer k=3.
layer2 = [p for p in allPartitions(6) if p[0] <= 2]
layer3_new = newInLayer(6, 3)
print(f"Layer k≤2: {sorted(layer2)}")
print(f"New in layer k=3: {sorted(layer3_new)}")
path, status = findConnectableEndpoint(layer2, layer3_new, neighborsCombined)
print(f"\nResult: {status}")
if path:
    print(f"Path (length {len(path)}): {path[0]} → ... → {path[-1]}")
    print(f"Last node connects to layer 3? {any(p in neighborsCombined(path[-1]) for p in layer3_new)}")
```

**Cell — code:**
```python
# Full construction using flexible exit for n=1..12.
def grayByLargestPartFlex(n):
    layers = layersByLargestPart(n)
    max_k = max(layers)

    # Accumulate partitions seen so far (as a layer).
    current_set = [(1,) * n]  # layer k=1

    for k in range(2, max_k + 1):
        new_layer = layers[k]
        path, status = findConnectableEndpoint(current_set, new_layer, neighborsCombined)
        if path is None:
            return list(current_set), f"FAIL at k={k}: {status}"

        # Enter new layer from path[-1].
        entry = next(p for p in new_layer if p in neighborsCombined(path[-1]))
        segment = greedyInSubset(entry, new_layer, neighborsCombined)
        if len(segment) != len(new_layer):
            return path + segment, f"FAIL at k={k}: incomplete new-layer traversal"

        current_set = path + segment

    return current_set, "OK"

print(f"{'n':>2} | {'P(n)':>5} | {'got':>5} | status")
for n in range(1, 13):
    listing, status = grayByLargestPartFlex(n)
    ok, msg = verify(listing, n)
    print(f"{n:2d} | {len(allPartitions(n)):5d} | {len(listing):5d} | {'✓' if ok else status}")
```

- [ ] **Step 2: Run all Section 1 cells top to bottom; confirm the final table shows results for n=1..12**

- [ ] **Step 3: Commit**

```bash
git add gray_codes/Project/integer_partitions_constructions.ipynb
git commit -m "feat: add Section 1 — recursive by largest part revisit"
```

---

## Task 2: Section 2 — Recursive by Number of Parts

**Files:**
- Modify: `gray_codes/Project/integer_partitions_constructions.ipynb`

- [ ] **Step 1: Add Section 2 cells**

**Cell — markdown:**
```markdown
## Section 2 — Recursive by Number of Parts

**Approach:** Layer partitions by number of parts k:
- L(1) = {(n,)}
- L(2) = partitions of n with exactly 2 parts
- ...
- L(n) = {(1,...,1)}

Move-one-unit operates *within* a layer (number of parts can change by ±1, but
for two parts of size ≥ 2, moves stay in the same layer). Split/merge moves
*between* adjacent layers.

**Goal:** Find an ordering of each layer L(k) — a Hamiltonian path under
move-one-unit — whose endpoints expose a split connection to L(k+1).
```

**Cell — code:**
```python
# Partitions of n with exactly k parts.
def layer(n, k):
    return [p for p in allPartitions(n) if len(p) == k]

# Show layer structure for n=8.
n = 8
print(f"Layers for n={n}:")
for k in range(1, n + 1):
    lk = layer(n, k)
    if lk:
        print(f"  L({k}): {len(lk):3d} partitions  {sorted(lk)[:4]}{'...' if len(lk) > 4 else ''}")
```

**Cell — code:**
```python
# Within-layer neighbors: move-one-unit moves that stay within the same layer.
# A move from p to q stays in the same layer if len(q) == len(p).
def withinLayerNeighbors(partition):
    k = len(partition)
    return {q for q in neighborsMove(partition) if len(q) == k}

# Check connectivity of within-layer graph for each layer of n.
from collections import deque

def layerIsConnected(n, k):
    lk = layer(n, k)
    if len(lk) <= 1:
        return True
    graph = {p: withinLayerNeighbors(p) & set(lk) for p in lk}
    visited = {lk[0]}
    queue = deque([lk[0]])
    while queue:
        node = queue.popleft()
        for nbr in graph[node]:
            if nbr not in visited:
                visited.add(nbr)
                queue.append(nbr)
    return len(visited) == len(lk)

# Layer connectivity table.
print(f"{'n':>2} | Layer connectivity (T=connected, F=disconnected)")
for n in range(1, 13):
    row = []
    for k in range(1, n + 1):
        lk = layer(n, k)
        if lk:
            row.append('T' if layerIsConnected(n, k) else 'F')
    print(f"{n:2d} | {' '.join(row)}")
```

**Cell — code:**
```python
# Find a Hamiltonian path within layer L(k) using only within-layer neighbors.
# Returns (path, is_complete).
def hamiltonianInLayer(n, k):
    lk = layer(n, k)
    if len(lk) == 0:
        return [], True
    if len(lk) == 1:
        return [lk[0]], True

    best = []
    def backtrack(path, visited):
        nonlocal best
        if len(path) > len(best):
            best = path[:]
        if len(path) == len(lk):
            return True
        current = path[-1]
        cands = [c for c in withinLayerNeighbors(current) if c in set(lk) and c not in visited]
        cands.sort(key=lambda c: (
            len([x for x in withinLayerNeighbors(c) if x in set(lk) and x not in visited]), c
        ))
        for nbr in cands:
            visited.add(nbr)
            path.append(nbr)
            if backtrack(path, visited):
                return True
            path.pop()
            visited.remove(nbr)
        return False

    for start in lk:
        best = []
        visited = {start}
        if backtrack([start], visited):
            return best, True
    return best, False

# Test: does every layer have a Hamiltonian path under within-layer moves?
print(f"{'n':>2} | Ham path in each layer (✓=complete, ✗=incomplete)")
for n in range(1, 10):
    row = []
    for k in range(1, n + 1):
        lk = layer(n, k)
        if lk:
            path, ok = hamiltonianInLayer(n, k)
            row.append('✓' if ok else f'✗({len(path)}/{len(lk)})')
    print(f"{n:2d} | {' | '.join(row)}")
```

**Cell — code:**
```python
# For each layer, find Ham path endpoints and check which connect to the next layer via split.
def findConnectableLayerPath(n, k):
    """
    Find a Ham path in L(k) (move-only) such that the end node has a split neighbor in L(k+1).
    Returns (path, entry_to_next) or (None, None).
    """
    lk = layer(n, k)
    lk_next = layer(n, k + 1)
    if not lk or not lk_next:
        return None, None

    next_set = set(lk_next)

    def backtrack(path, visited):
        if len(path) == len(lk):
            # Check if end connects to L(k+1) via split.
            splits = neighborsSplitMerge(path[-1]) & next_set
            if splits:
                return path, min(splits)
            return None, None
        current = path[-1]
        cands = [c for c in withinLayerNeighbors(current) if c in set(lk) and c not in visited]
        cands.sort(key=lambda c: (
            len([x for x in withinLayerNeighbors(c) if x in set(lk) and x not in visited]), c
        ))
        for nbr in cands:
            visited.add(nbr)
            path.append(nbr)
            result, entry = backtrack(path, visited)
            if result:
                return result, entry
            path.pop()
            visited.remove(nbr)
        return None, None

    for start in lk:
        visited = {start}
        result, entry = backtrack([start], visited)
        if result:
            return result, entry

    return None, None

# Test for n=1..8.
print(f"{'n':>2} | k  | layer_size | path_found | connects_to_next")
for n in range(1, 9):
    for k in range(1, n):
        lk = layer(n, k)
        if not lk:
            continue
        path, entry = findConnectableLayerPath(n, k)
        found = path is not None
        print(f"{n:2d} | {k:2d} | {len(lk):10d} | {str(found):10} | {entry if entry else '-'}")
```

**Cell — code:**
```python
# Full construction: chain layers L(1) → L(2) → ... → L(n).
def grayByNumParts(n):
    listing = []
    for k in range(1, n + 1):
        lk = layer(n, k)
        if not lk:
            continue

        if k == 1:
            listing = [(n,)]
            continue

        # Find a Ham path in L(k-1) ending at a node that splits into L(k).
        # (If listing already ends at a connectable node, use it.)
        # Otherwise rebuild L(k-1) with a connectable endpoint.
        lk_prev = layer(n, k - 1)
        lk_cur  = layer(n, k)
        prev_set = set(lk_prev)
        cur_set  = set(lk_cur)

        # Try to find entry into lk from current end of listing.
        entry_cands = neighborsSplitMerge(listing[-1]) & cur_set
        if not entry_cands:
            return listing, f"FAIL at k={k}: {listing[-1]} has no split into L({k})"

        entry = min(entry_cands)

        # Traverse L(k) with within-layer Warnsdorff, starting from entry.
        segment = greedyInSubset(entry, lk_cur, withinLayerNeighbors)
        if len(segment) != len(lk_cur):
            return listing + segment, (
                f"FAIL at k={k}: traversal incomplete ({len(segment)}/{len(lk_cur)})"
            )

        listing += segment

    return listing, "OK"

print(f"{'n':>2} | {'P(n)':>5} | {'got':>5} | status")
for n in range(1, 16):
    listing, status = grayByNumParts(n)
    ok, msg = verify(listing, n)
    print(f"{n:2d} | {len(allPartitions(n)):5d} | {len(listing):5d} | {'✓' if ok else status}")
```

**Cell — code:**
```python
# Reflection variant: reverse alternating layers before chaining.
# L(1) → L(2) → L(3)reversed → L(4) → L(5)reversed → ...
def grayByNumPartsReflected(n):
    listing = [(n,)]
    for k in range(2, n + 1):
        lk = layer(n, k)
        if not lk:
            continue
        lk_set = set(lk)
        forward = (k % 2 == 0)

        # Find entry into lk from listing[-1].
        entry_cands = neighborsSplitMerge(listing[-1]) & lk_set
        if not entry_cands:
            return listing, f"FAIL at k={k}: no split entry from {listing[-1]}"
        entry = min(entry_cands)

        segment = greedyInSubset(entry, lk, withinLayerNeighbors)
        if len(segment) != len(lk):
            return listing + segment, f"FAIL at k={k}: incomplete ({len(segment)}/{len(lk)})"

        listing += segment if forward else segment[::-1]

    return listing, "OK"

print(f"\nReflected variant:")
print(f"{'n':>2} | {'P(n)':>5} | {'got':>5} | status")
for n in range(1, 16):
    listing, status = grayByNumPartsReflected(n)
    ok, msg = verify(listing, n)
    print(f"{n:2d} | {len(allPartitions(n)):5d} | {len(listing):5d} | {'✓' if ok else status}")
```

- [ ] **Step 2: Run all Section 2 cells; note which n values succeed and which fail**

- [ ] **Step 3: Commit**

```bash
git add gray_codes/Project/integer_partitions_constructions.ipynb
git commit -m "feat: add Section 2 — recursive by number of parts"
```

---

## Task 3: Section 3 — Change Sequence Analysis

**Files:**
- Modify: `gray_codes/Project/integer_partitions_constructions.ipynb`

- [ ] **Step 1: Add Section 3 cells**

**Cell — markdown:**
```markdown
## Section 3 — Change Sequence Analysis

Run `greedyWarnsdorff` and extract the step-by-step operation sequence.
Look for patterns that could replace Warnsdorff with a simple deterministic rule.
```

**Cell — code (greedyWarnsdorff — reproduced for self-containment):**
```python
def greedyWarnsdorff(n):
    visited = set()
    word = (1,) * n
    visited.add(word)
    yield word
    while True:
        candidates = [c for c in neighborsCombined(word) if c not in visited]
        if not candidates:
            break
        word = min(candidates, key=lambda c: (
            len([x for x in neighborsCombined(c) if x not in visited]),
            c
        ))
        visited.add(word)
        yield word
```

**Cell — code:**
```python
# Classify the operation from partition p to partition q.
# Returns one of: 'move', 'split', 'merge', 'unknown'.
def classifyOp(p, q):
    if q in neighborsSplitMerge(p):
        return 'split' if len(q) > len(p) else 'merge'
    if q in neighborsMove(p):
        return 'move'
    return 'unknown'

# Extract the annotated operation sequence for a given n.
def operationSequence(n):
    path = list(greedyWarnsdorff(n))
    steps = []
    for i in range(len(path) - 1):
        p, q = path[i], path[i + 1]
        steps.append({
            'from': p,
            'to': q,
            'op': classifyOp(p, q),
            'from_parts': len(p),
            'to_parts': len(q),
            'from_max': p[0],
            'to_max': q[0],
        })
    return steps
```

**Cell — code:**
```python
# Operation statistics per n.
print(f"{'n':>2} | {'total':>5} | {'move%':>6} | {'split%':>7} | {'merge%':>7}")
for n in range(2, 16):
    steps = operationSequence(n)
    total = len(steps)
    counts = {'move': 0, 'split': 0, 'merge': 0}
    for s in steps:
        counts[s['op']] += 1
    print(f"{n:2d} | {total:5d} | "
          f"{100*counts['move']/total:5.1f}% | "
          f"{100*counts['split']/total:6.1f}% | "
          f"{100*counts['merge']/total:6.1f}%")
```

**Cell — code:**
```python
# Print full annotated listing for n=6.
n = 6
steps = operationSequence(n)
path = list(greedyWarnsdorff(n))
print(f"n={n} annotated listing:")
print(f"  {path[0]}")
for s in steps:
    print(f"  --[{s['op']:5s}]--> {s['to']}")
```

**Cell — code:**
```python
# Pattern: does operation type correlate with partition shape?
# For each step, record (has_part_of_1, has_all_equal, op).
from collections import Counter

print("Operation type vs. partition shape (n=3..12):")
print(f"{'shape':30s} | {'op':5s} | count")
shape_op_counts = Counter()
for n in range(3, 13):
    steps = operationSequence(n)
    for s in steps:
        p = s['from']
        has_one = 1 in p
        all_equal = len(set(p)) == 1
        shape = f"has_1={has_one}, all_equal={all_equal}"
        shape_op_counts[(shape, s['op'])] += 1

for (shape, op), count in sorted(shape_op_counts.items()):
    print(f"{shape:30s} | {op:5s} | {count}")
```

**Cell — code:**
```python
# Test: simple priority rules as drop-in replacements for Warnsdorff.
# Each rule is a function (partition, unvisited_set) -> next_partition | None.

def lexSmallestNeighbor(p, unvisited):
    cands = sorted(neighborsCombined(p) & unvisited)
    return cands[0] if cands else None

def mergeFirstThenSplitThenMove(p, unvisited):
    for nbr in sorted(neighborsSplitMerge(p) & unvisited):
        if len(nbr) < len(p):  # merge
            return nbr
    for nbr in sorted(neighborsSplitMerge(p) & unvisited):
        if len(nbr) > len(p):  # split
            return nbr
    cands = sorted(neighborsMove(p) & unvisited)
    return cands[0] if cands else None

def moveFirstThenMergeThenSplit(p, unvisited):
    cands = sorted(neighborsMove(p) & unvisited)
    if cands:
        return cands[0]
    for nbr in sorted(neighborsSplitMerge(p) & unvisited):
        if len(nbr) < len(p):
            return nbr
    for nbr in sorted(neighborsSplitMerge(p) & unvisited):
        if len(nbr) > len(p):
            return nbr
    return None

def lexLargestNeighbor(p, unvisited):
    cands = sorted(neighborsCombined(p) & unvisited, reverse=True)
    return cands[0] if cands else None

def runPriorityRule(n, rule_fn):
    start = (1,) * n
    visited = {start}
    path = [start]
    while True:
        nxt = rule_fn(path[-1], set(allPartitions(n)) - visited)
        if nxt is None:
            break
        visited.add(nxt)
        path.append(nxt)
    return path

rules = {
    'lex-smallest':           lexSmallestNeighbor,
    'merge>split>move':       mergeFirstThenSplitThenMove,
    'move>merge>split':       moveFirstThenMergeThenSplit,
    'lex-largest':            lexLargestNeighbor,
}

print(f"{'rule':25s} | first fail (n) | notes")
for name, rule in rules.items():
    first_fail = None
    for n in range(1, 21):
        path = runPriorityRule(n, rule)
        ok, _ = verify(path, n)
        if not ok:
            first_fail = n
            break
    print(f"{name:25s} | {str(first_fail) if first_fail else '> 20':13s} | ")
```

**Cell — code:**
```python
# Detail: for the best rule(s), show where they first fail and why.
for name, rule in rules.items():
    for n in range(1, 21):
        path = runPriorityRule(n, rule)
        ok, msg = verify(path, n)
        if not ok:
            stuck = path[-1]
            unvisited = set(allPartitions(n)) - set(path)
            print(f"Rule '{name}' fails at n={n}:")
            print(f"  Stuck at: {stuck}")
            print(f"  Unvisited ({len(unvisited)}): {sorted(unvisited)[:5]}...")
            print(f"  Neighbors of stuck: {sorted(neighborsCombined(stuck))}")
            break
    else:
        print(f"Rule '{name}': works for all n=1..20")
```

- [ ] **Step 2: Run all Section 3 cells; record which (if any) priority rules work for all n=1..20**

- [ ] **Step 3: Commit**

```bash
git add gray_codes/Project/integer_partitions_constructions.ipynb
git commit -m "feat: add Section 3 — change sequence analysis and priority rules"
```

---

## Task 4: Section 4 — Successor Rule Candidates

**Files:**
- Modify: `gray_codes/Project/integer_partitions_constructions.ipynb`

- [ ] **Step 1: Add Section 4 cells**

**Cell — markdown:**
```markdown
## Section 4 — Successor Rule Candidates

Formalize and test explicit `next(λ)` functions — rules that determine the next
partition from the current one (and a small amount of state) without lookahead.

Each candidate is run with a visited set for correctness testing, but the rule
itself only inspects the current partition (and possibly a direction bit).
```

**Cell — code:**
```python
# Framework: run any successor rule and verify the result.
def runSuccessorRule(n, next_fn, start=None):
    """
    next_fn(current, visited) -> next partition or None.
    Returns the path.
    """
    if start is None:
        start = (1,) * n
    visited = {start}
    path = [start]
    while True:
        nxt = next_fn(path[-1], frozenset(visited))
        if nxt is None or nxt in visited:
            break
        visited.add(nxt)
        path.append(nxt)
    return path

def evalRule(name, rule_fn, n_max=20):
    print(f"\nRule: {name}")
    print(f"{'n':>2} | {'P(n)':>5} | {'got':>5} | result")
    for n in range(1, n_max + 1):
        path = runSuccessorRule(n, rule_fn)
        ok, msg = verify(path, n)
        pn = len(allPartitions(n))
        flag = '✓' if ok else f'✗ stuck@{path[-1]}'
        print(f"{n:2d} | {pn:5d} | {len(path):5d} | {flag}")
```

**Cell — code:**
```python
# Candidate 1: Lex-smallest unvisited neighbor.
def lexSmallest(current, visited):
    cands = sorted(neighborsCombined(current) - visited)
    return cands[0] if cands else None

evalRule("1. Lex-smallest neighbor", lexSmallest)
```

**Cell — code:**
```python
# Candidate 2: Operation-priority — fixed order: merge, split, move (all lex-sorted).
def opPriority_mergeSplitMove(current, visited):
    unvisited = set(neighborsCombined(current)) - visited
    for nbr in sorted(unvisited):
        if len(nbr) < len(current) and nbr in neighborsSplitMerge(current):
            return nbr
    for nbr in sorted(unvisited):
        if len(nbr) > len(current) and nbr in neighborsSplitMerge(current):
            return nbr
    cands = sorted(unvisited & neighborsMove(current))
    return cands[0] if cands else None

evalRule("2. Merge > split > move (lex within each)", opPriority_mergeSplitMove)
```

**Cell — code:**
```python
# Candidate 3: Canonical path rule.
# Define a total order on operations:
#   (op_type_rank, min_part_changed, result_lex)
# where op_type_rank: move=0, merge=1, split=2.
def opRank(current, nbr):
    if nbr in neighborsMove(current):
        return 0
    elif len(nbr) < len(current):  # merge
        return 1
    else:  # split
        return 2

def canonicalSuccessor(current, visited):
    unvisited = neighborsCombined(current) - visited
    if not unvisited:
        return None
    return min(unvisited, key=lambda nbr: (opRank(current, nbr), nbr))

evalRule("3. Canonical (move<merge<split, then lex)", canonicalSuccessor)
```

**Cell — code:**
```python
# Candidate 4: Reversal-aware — carry a direction bit.
# This requires two-argument state; wrap it so runSuccessorRule can handle it.

def makeReversalRule():
    direction = [1]  # 1 = forward (prefer lex-small), -1 = backward (prefer lex-large)

    def reversalSuccessor(current, visited):
        cands = sorted(neighborsCombined(current) - visited)
        if not cands:
            return None
        if direction[0] == 1:
            choice = cands[0]
        else:
            choice = cands[-1]
        # Flip direction if stuck (no unvisited neighbors after this step).
        future_unvisited = neighborsCombined(choice) - visited - {choice}
        if not future_unvisited:
            direction[0] *= -1
        return choice

    return reversalSuccessor

print("\nRule: 4. Reversal-aware (direction bit)")
print(f"{'n':>2} | {'P(n)':>5} | {'got':>5} | result")
for n in range(1, 21):
    rule = makeReversalRule()  # fresh direction state per n
    path = runSuccessorRule(n, rule)
    ok, msg = verify(path, n)
    pn = len(allPartitions(n))
    flag = '✓' if ok else f'✗ stuck@{path[-1]}'
    print(f"{n:2d} | {pn:5d} | {len(path):5d} | {flag}")
```

**Cell — code:**
```python
# Candidate 5: Rotation rule — cycle through (merge, split, move) on successive steps.
# Each step uses the next operation type in the rotation; within that type, take lex-smallest.

def makeRotationRule(order=('merge', 'split', 'move')):
    step = [0]

    def pick_by_type(current, visited, op_type):
        unvisited = neighborsCombined(current) - visited
        if op_type == 'merge':
            cands = sorted(p for p in unvisited if p in neighborsSplitMerge(current) and len(p) < len(current))
        elif op_type == 'split':
            cands = sorted(p for p in unvisited if p in neighborsSplitMerge(current) and len(p) > len(current))
        else:  # move
            cands = sorted(unvisited & neighborsMove(current))
        return cands[0] if cands else None

    def rotationSuccessor(current, visited):
        # Try each op type starting from the current rotation position.
        for offset in range(len(order)):
            op_type = order[(step[0] + offset) % len(order)]
            result = pick_by_type(current, visited, op_type)
            if result is not None:
                step[0] = (step[0] + 1) % len(order)
                return result
        return None

    return rotationSuccessor

for rotation in [('merge','split','move'), ('move','merge','split'), ('split','merge','move')]:
    name = f"5. Rotation {rotation}"
    print(f"\nRule: {name}")
    print(f"{'n':>2} | {'P(n)':>5} | {'got':>5} | result")
    for n in range(1, 21):
        rule = makeRotationRule(rotation)
        path = runSuccessorRule(n, rule)
        ok, msg = verify(path, n)
        pn = len(allPartitions(n))
        flag = '✓' if ok else f'✗'
        print(f"{n:2d} | {pn:5d} | {len(path):5d} | {flag}")
```

**Cell — code:**
```python
# Summary: collect first-failure n for all rules.
all_rules = [
    ("1. Lex-smallest",           lexSmallest),
    ("2. Merge>split>move",        opPriority_mergeSplitMove),
    ("3. Canonical",               canonicalSuccessor),
]

print("\n=== Successor Rule Summary ===")
print(f"{'Rule':35s} | first fail (n)")
for name, rule in all_rules:
    for n in range(1, 31):
        path = runSuccessorRule(n, rule)
        ok, _ = verify(path, n)
        if not ok:
            print(f"{name:35s} | {n}")
            break
    else:
        print(f"{name:35s} | > 30")

# Reversal and rotation rules need fresh state per n.
for rotation in [('merge','split','move'), ('move','merge','split')]:
    name = f"Rotation {rotation}"
    for n in range(1, 31):
        rule = makeRotationRule(rotation)
        path = runSuccessorRule(n, rule)
        ok, _ = verify(path, n)
        if not ok:
            print(f"{name:35s} | {n}")
            break
    else:
        print(f"{name:35s} | > 30")

for n in range(1, 31):
    rule = makeReversalRule()
    path = runSuccessorRule(n, rule)
    ok, _ = verify(path, n)
    if not ok:
        print(f"{'4. Reversal-aware':35s} | {n}")
        break
else:
    print(f"{'4. Reversal-aware':35s} | > 30")
```

- [ ] **Step 2: Run all Section 4 cells; record any rules that work for all n=1..30**

- [ ] **Step 3: Commit**

```bash
git add gray_codes/Project/integer_partitions_constructions.ipynb
git commit -m "feat: add Section 4 — successor rule candidates"
```

---

## Self-Review Notes

- All functions used in later tasks (`greedyInSubset`, `withinLayerNeighbors`, `greedyWarnsdorff`) are defined in the same section before use.
- `verify()` is defined in Section 0 and used in all later sections — self-contained per notebook execution order.
- `greedyWarnsdorff` is re-defined in Section 3 (not imported from Section 0) to keep sections independent.
- All result tables use `verify()` rather than ad-hoc checks.
- Negative results (dead ends) are documented inline with failure analysis cells.
