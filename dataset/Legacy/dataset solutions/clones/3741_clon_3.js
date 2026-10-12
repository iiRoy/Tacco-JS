// GraphPartitionSolver: This module analyzes an input graph to determine if it can be partitioned
// into two sets of nodes, say V1 and V2, such that all edges exist within V1 (forming a clique)
// and all edges exist within V2 (forming another clique), and no edges exist between V1 and V2.
// This problem is equivalent to checking if the complement of the input graph is bipartite.
// If the complement graph is bipartite, the algorithm proceeds to find the optimal partition
// sizes to maximize the total number of edges within these two cliques.

// Type III Clone: Extensive changes applied including identifier renaming, data type adjustments,
// structural rewrites (e.g., BFS instead of recursive DFS), bug fixes, and added validations.

function GraphPartitionSolver(rawInputDataString) {
  // --- Input Data Processing and Initial Setup ---

  // Split the raw input string into individual lines for easier parsing.
  const inputLines = rawInputDataString.split("\n");

  // Parse the first line which contains the total number of nodes (N) and edges (M).
  const dimensions = inputLines[0].split(" ").map(Number);
  const totalNodeCount = dimensions[0];
  const initialEdgeCount = dimensions[1];

  // Implement robust input validation for fundamental parameters.
  // Type III: Added guard clauses and validation checks.
  if (totalNodeCount < 0 || initialEdgeCount < 0) {
    console.log(-1); // Indicate invalid graph dimensions.
    return;
  }
  if (totalNodeCount === 0) {
    console.log(0); // A graph with no nodes has zero edges.
    return;
  }
  if (totalNodeCount === 1) {
    console.log(0); // A single node cannot form an edge with itself in this context.
    return;
  }

  // Initialize the complement adjacency matrix.
  // `complementAdjacency[u][v]` will be `true` if there is NO edge between `u` and `v`
  // in the original input graph. This means there IS an edge in the complement graph.
  // All entries are initially `true` (assuming a complete graph complement, i.e., no edges initially).
  // Type II: Renamed `b` to `complementAdjacency`, changed from `0/1` to `boolean` representation.
  const complementAdjacency = Array.from({ length: totalNodeCount }, () =>
    Array(totalNodeCount).fill(true)
  );

  // Read and process each edge from the input.
  // For every given edge (u, v), mark `complementAdjacency[u][v]` and `[v][u]` as `false`,
  // indicating that this pair of nodes is *connected* in the original graph.
  for (let edgeIndex = 0; edgeIndex < initialEdgeCount; edgeIndex++) {
    const currentEdgeNodes = inputLines[edgeIndex + 1].split(" ").map(val => Number(val) - 1); // Convert to 0-indexed.
    const nodeU = currentEdgeNodes[0];
    const nodeV = currentEdgeNodes[1];

    // Additional validation for node indices.
    if (nodeU < 0 || nodeU >= totalNodeCount || nodeV < 0 || nodeV >= totalNodeCount) {
      console.log(-1); // Invalid node index encountered in an edge definition.
      return;
    }

    complementAdjacency[nodeU][nodeV] = false;
    complementAdjacency[nodeV][nodeU] = false;
  }

  // --- Bipartite Graph Check on the Complement Graph using BFS ---

  // `nodeVisitationStatus` array to keep track of visited nodes and their partition assignments.
  // -1: Node has not been visited yet.
  //  0: Node has been visited and assigned to Partition A.
  //  1: Node has been visited and assigned to Partition B.
  // Type II: Renamed `c` to `nodeVisitationStatus`, changed type from `0/1` to `-1/0/1`.
  const nodeVisitationStatus = Array(totalNodeCount).fill(-1);

  // `componentPartitionSizesA` and `componentPartitionSizesB` will store the
  // counts of nodes in each partition (A and B) for every connected component
  // found in the complement graph.
  // Type II: Renamed `x, y` to more descriptive names.
  const componentPartitionSizesA = [];
  const componentPartitionSizesB = [];
  let currentComponentIdentifier = 0; // Tracks the index of the current component. Renamed from `z`.

  /**
   * Performs a Breadth-First Search (BFS) to check if a connected component
   * of the complement graph is bipartite. It also calculates the sizes of
   * the two partitions for this component.
   * Type III: Replaced original recursive `f` function with an iterative BFS.
   * This improves robustness against stack overflows for large graphs and clarifies logic.
   *
   * @param {number} startNode - The starting node for the BFS traversal.
   * @param {number} componentId - The identifier for the current connected component.
   * @returns {boolean} - `true` if the component is bipartite, `false` otherwise.
   */
  const performBipartiteCheckBFS = (startNode, componentId) => {
    // The BFS queue stores objects with `node` and its `partitionAssignment`.
    const bfsTraversalQueue = [{ node: startNode, partitionAssignment: 0 }]; // Start node is assigned to Partition A.
    nodeVisitationStatus[startNode] = 0; // Mark the starting node as visited and assigned to Partition A.

    let currentComponentNodesInA = 0;
    let currentComponentNodesInB = 0;
    currentComponentNodesInA++; // Increment count for the starting node.

    let queueReadPointer = 0; // Efficient queue implementation using a pointer.
    while (queueReadPointer < bfsTraversalQueue.length) {
      const { node: currentNode, partitionAssignment: currentPartition } =
        bfsTraversalQueue[queueReadPointer++];

      // Iterate through all other possible nodes to find neighbors in the complement graph.
      for (let neighborNode = 0; neighborNode < totalNodeCount; neighborNode++) {
        // Type III: Explicitly skip self-loops.
        if (currentNode === neighborNode) {
          continue;
        }

        // Check if there is an edge between `currentNode` and `neighborNode` in the complement graph.
        // (i.e., no edge in the original input graph).
        if (complementAdjacency[currentNode][neighborNode]) {
          if (nodeVisitationStatus[neighborNode] === -1) {
            // If the neighbor is unvisited, assign it to the opposite partition.
            const neighborPartition = 1 - currentPartition;
            nodeVisitationStatus[neighborNode] = neighborPartition;

            if (neighborPartition === 0) {
              currentComponentNodesInA++;
            } else {
              currentComponentNodesInB++;
            }
            bfsTraversalQueue.push({ node: neighborNode, partitionAssignment: neighborPartition });
          } else if (nodeVisitationStatus[neighborNode] === currentPartition) {
            // If the neighbor is already visited AND it's in the same partition as `currentNode`,
            // then the component is NOT bipartite. This is a conflict.
            return false;
          }
        }
      }
    }

    // Store the calculated partition sizes for this bipartite component.
    // Type III: Fix for original code's `x[z]=1` bug, ensuring accurate counts are stored.
    componentPartitionSizesA[componentId] = currentComponentNodesInA;
    componentPartitionSizesB[componentId] = currentComponentNodesInB;
    return true; // The component is bipartite.
  };

  // Iterate through all nodes to discover and process each connected component
  // in the complement graph.
  for (let nodeIterator = 0; nodeIterator < totalNodeCount; nodeIterator++) {
    if (nodeVisitationStatus[nodeIterator] === -1) {
      // If a node is unvisited, it's the root of a new connected component.
      if (!performBipartiteCheckBFS(nodeIterator, currentComponentIdentifier)) {
        console.log(-1); // If any component is not bipartite, the whole graph structure fails the condition.
        return;
      }
      currentComponentIdentifier++; // Move to the next component ID for the next unvisited node.
    }
  }

  // --- Dynamic Programming to Combine Component Partition Sizes ---

  // `possibleGlobalPartitionSums` is a boolean array where `possibleGlobalPartitionSums[s]`
  // is `true` if it's possible to form one of the two final partitions with a total size of `s` nodes.
  // Type III: Corrected array size from `totalNodeCount` to `totalNodeCount + 1` to prevent out-of-bounds access.
  const possibleGlobalPartitionSums = Array(totalNodeCount + 1).fill(false);
  possibleGlobalPartitionSums[0] = true; // It's always possible to form a partition of size 0 (an empty set).

  // Iterate through the partition sizes of each connected component.
  for (let compIdx = 0; compIdx < currentComponentIdentifier; compIdx++) {
    const currentComponentSizePartA = componentPartitionSizesA[compIdx];
    const currentComponentSizePartB = componentPartitionSizesB[compIdx];

    // Iterate backwards through `possibleGlobalPartitionSums`. This ensures that when we update
    // `possibleGlobalPartitionSums[currentSum + newSize]`, we are using `currentSum` values
    // computed from *previous* components, not from the current component's additions.
    for (let currentSum = totalNodeCount; currentSum >= 0; currentSum--) {
      if (possibleGlobalPartitionSums[currentSum]) {
        // Option 1: Add `currentComponentSizePartA` to the current sum.
        const sumWithPartA = currentSum + currentComponentSizePartA;
        if (sumWithPartA <= totalNodeCount) {
          possibleGlobalPartitionSums[sumWithPartA] = true;
        }

        // Option 2: Add `currentComponentSizePartB` to the current sum.
        const sumWithPartB = currentSum + currentComponentSizePartB;
        if (sumWithPartB <= totalNodeCount) {
          possibleGlobalPartitionSums[sumWithPartB] = true;
        }
      }
    }
  }

  // --- Determine the Optimal Partition Size (k) ---

  // We need to find a partition size `k` (where `possibleGlobalPartitionSums[k]` is true)
  // that maximizes the expression: `k*(k-1)/2 + (totalNodeCount-k)*(totalNodeCount-k-1)/2`.
  // This expression is symmetric around `totalNodeCount / 2`.
  // Maximizing this is equivalent to finding a `k` that minimizes `|k - (totalNodeCount / 2)|`.
  // Or, equivalently, maximizing `min(k, totalNodeCount - k)`.
  // Type II: Renamed `k` to `optimalCliquePartitionSize`.
  let optimalCliquePartitionSize = 0;

  for (let currentPossibleSize = 0; currentPossibleSize <= totalNodeCount; currentPossibleSize++) {
    if (possibleGlobalPartitionSums[currentPossibleSize]) {
      optimalCliquePartitionSize = Math.max(
        optimalCliquePartitionSize,
        Math.min(currentPossibleSize, totalNodeCount - currentPossibleSize)
      );
    }
  }

  // --- Final Result Calculation and Output ---

  // Calculate the number of edges for the two cliques formed by the optimal partition.
  // Type III: Added intermediate variables for clarity.
  const sizeOfFirstClique = optimalCliquePartitionSize;
  const sizeOfSecondClique = totalNodeCount - optimalCliquePartitionSize;

  const edgesInFirstClique = sizeOfFirstClique * (sizeOfFirstClique - 1) / 2;
  const edgesInSecondClique = sizeOfSecondClique * (sizeOfSecondClique - 1) / 2;

  console.log(edgesInFirstClique + edgesInSecondClique);
}

// Entry point: Read input from standard input and pass it to the solver.
GraphPartitionSolver(require("fs").readFileSync("/dev/stdin", "utf8"));