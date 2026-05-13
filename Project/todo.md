# Efficiency Improvements for greedyWarnsdorff

- [ ] Precompute the full neighbor sets for all partitions upfront
- [ ] Initialize a degree table mapping each partition to its neighbor count
- [ ] When a partition is visited, decrement the degree count for each of its neighbors
- [ ] Use the degree table for Warnsdorff priority instead of recomputing from scratch each step

# Other approach

## Recursion by largest part — roadblock
- Works cleanly for n ≤ 5 by layering P(n, k) = P(n, k-1) + {k} × P(n-k, k)
- Breaks at n=6: P(6,2) is a rigid chain ending at (2,2,2), which has no 1s
- (2,2,2) can only reach layer 3 at its interior node (3,2,1), not an endpoint
- Root cause: whenever n is divisible by k-1, GC(n, k-1) ends at an all-equal partition with no 1s, blocking the inter-layer connection
- Fix attempts were too convoluted — consider layering by number of parts or change sequence approach instead

# Visualization
- FERRER'S DIAGRAM

# Priority given on a rotating basis, ex: in permutations start with n, then n-1, n-2, etc
# Easier to work, harder to understand
