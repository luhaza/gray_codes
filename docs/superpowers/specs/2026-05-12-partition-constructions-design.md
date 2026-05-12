# Integer Partition Gray Code Constructions — Design Spec

**Date:** 2026-05-12
**Notebook:** `gray_codes/Project/integer_partitions_constructions.ipynb`

## Goal

Determine whether a deterministic Gray code construction for integer partitions is possible without a heuristic tie-breaker like Warnsdorff's rule. Explore four approaches and document findings.

**Definition of success:** A construction is "deterministic" if the next partition in the listing is uniquely determined by the current partition (or by a small, fixed amount of state), with no lookahead or degree counting. A Gray code is "correct" if it visits every partition of n exactly once and each consecutive pair differs by exactly one operation (move-one-unit, split, or merge).

---

## Section 0 — Setup

Shared utilities used across all sections:

- `allPartitions(n)` — returns all integer partitions of n as sorted tuples
- `neighborsMove(partition)` — move-one-unit neighbors (transfer 1 unit, includes split-off-1)
- `neighborsSplitMerge(partition)` — split and merge neighbors
- `neighborsCombined(partition)` — union of the above
- `toBinary(partition)` — encode partition as length-n binary string per the LAGOS 2025 paper (part a_k → 0^(a_k-1)1, concatenated)
- `verify(listing, n)` — checks: (1) length == P(n), (2) all partitions present, (3) each consecutive pair is in neighborsCombined

All functions copied or adapted from `integer_partitions_greedy.ipynb` for self-containment.

---

## Section 1 — Recursive by Largest Part (Revisit)

**Background:** Attempted in a prior session. The layering P(n,k) = P(n,k-1) ∪ {partitions with largest part = k} works cleanly for n ≤ 5 but fails at n=6: GC(6,2) ends at (2,2,2), which has no 1s and can't connect to layer 3.

**Experiments:**
1. **Reproduce the failure** — generate Gray codes layer-by-layer for n=6, show exactly where the dead end is.
2. **Try flexible exit** — instead of traversing layer k fully before moving to layer k+1, allow exiting a layer early when the natural endpoint would be an all-equal partition. Specifically: when GC(n, k-1) would end at (m, m, ..., m), attempt to detour out of that partition before arriving there.
3. **Document the verdict** — if the fix works for n=6, test up to n=15. If it introduces new failures, document why and mark this approach as a dead end.

**Success criteria:** Works for all n=1..15, or yields a clear structural impossibility proof.

---

## Section 2 — Recursive by Number of Parts

**Approach:** Layer partitions by L(k) = {partitions of n with exactly k parts}, k = 1..n. L(1) = {(n,)}, L(n) = {(1,...,1)}. A split operation moves a partition from L(k) to L(k+1); a merge moves it from L(k+1) to L(k).

**Experiments:**
1. **Gray code within a layer** — for each L(k), find an ordering where consecutive partitions differ by a move-one-unit. L(k) = partitions of n with exactly k parts. Try lex order, reverse-lex, and "balanced-first" (partitions closest to uniform first). Check which orderings yield a Hamiltonian path within the layer for small n.
2. **Inter-layer connection** — after ordering each layer, find which endpoint of L(k)'s Gray code can connect to L(k+1) via a single split, and which endpoint of L(k+1) can be entered via that split. Try both orientations (L(k) forward then L(k+1) forward, and L(k+1) reversed).
3. **Full recursive assembly** — combine the above: assemble the full Gray code by chaining layers L(1) → L(2) → ... → L(n). Test for n=1..15.
4. **Reflection trick** — if direct chaining fails, try reflecting alternate layers (like BRGC), so L(k) runs forward and L(k+1) runs backward.

**Key question:** Does every layer L(k) have a Hamiltonian path under move-one-unit that exposes a "connectable" endpoint for the next layer?

**Success criteria:** Deterministic layer-by-layer construction verified for n=1..20.

---

## Section 3 — Change Sequence Analysis

**Approach:** Extract and analyze the step-by-step operation sequence used by `greedyWarnsdorff`. If a pattern exists, it can be turned into a deterministic rule.

**Experiments:**
1. **Operation statistics** — for n=1..15, count what fraction of steps use move vs. split vs. merge. Display as a table.
2. **Operation labeling** — for each step in the Gray code listing, label with: operation type, the part(s) involved (by index and value), and the "shape" of the current partition (# parts, largest part, # distinct parts).
3. **Pattern search** — look for rules of the form "if the current partition has property X, the operation is always Y." Candidates: "if partition has a part of size 1, next op is merge"; "if all parts equal, next op is split."
4. **Simple priority rules** — test deterministic rules derived from observations: always take the lex-smallest valid neighbor, always prefer move over split over merge (in fixed priority), always pick the operation that results in the most "balanced" partition. Verify each rule for n=1..20.
5. **Sorted-neighbor rule** — test: "sort all valid neighbors lexicographically; take the first one not yet visited." This is a deterministic greedy without any lookahead. Check how far it gets before failing.

**Key question:** Is there any simple, stateless rule (depending only on the current partition, not the history) that always picks the correct next step?

---

## Section 4 — Successor Rule Candidates

**Approach:** Based on Section 3 findings, formalize and test explicit `next(λ)` functions. Each candidate is a direct formula that maps a partition to its successor without visiting-set tracking.

**Candidates to try (regardless of Section 3 findings):**
1. **Lex successor** — among all neighbors of λ, return the lex-smallest one that is not λ itself. (No visited-set, pure formula.) This won't work in general but establishes a baseline.
2. **Operation-priority successor** — fixed priority: (1) try all merges in lex order, (2) try all splits in lex order, (3) try all moves in lex order. Return the first valid one that hasn't been visited.
3. **Canonical path rule** — define a total order on operations (e.g., by (operation type, affected part indices)) and always pick the smallest operation that advances the listing. Test if this traces a Hamiltonian path.
4. **Reversal-aware rule** — maintain a single bit of state (direction: forward or backward) in addition to the current partition. On each step, try to continue in the current direction; flip direction if stuck. Similar to how BRGC works.
5. **Rotation rule** — inspired by the todo.md note: assign operation priorities on a rotating basis (cycle through merge, split, move on successive steps). Test several rotation patterns.

**For each candidate:**
- Run for n=1..20
- Report: first n where it fails (if any), path length at failure, which partition it gets stuck at
- If a candidate works for all n=1..20, mark as "promising" and test up to n=30

---

## Implementation Notes

- Each section is self-contained: imports and utility definitions at the top, no dependency on other sections.
- All experiments use `verify(listing, n)` to confirm correctness.
- Results tables use consistent columns: `n | P(n) | path_length | complete? | first_fail`.
- The notebook is exploratory — negative results (approaches that fail) are documented with analysis of why.

---

## Out of Scope

- Section 5 (paper's postorder algorithm and binary word extensions) — deferred.
- Efficiency optimization (degree table, CAT algorithms) — tracked in `todo.md`, not in this notebook.
- Proofs of correctness — document conjectures where found, but formal proofs are future work.
