function ProcessInput(inputString) {
  // Split the input string into lines
  const lines = inputString.split("\n");

  // Parse the first line to get nodeCount (n) and edgeCount (m)
  // The original code uses `+a` for type conversion, here we use Number()
  let dimensions = lines[0].split(" ").map((val) => Number(val));
  let nodeCount = dimensions[0];
  const edgeCount = dimensions[1];

  // Initialize an adjacency matrix.
  // `connectionMatrix[i][j] = 1` means nodes i and j are *not* connected by an input edge.
  // `connectionMatrix[i][j] = 0` means nodes i and j *are* connected by an input edge.
  // Initially, assume all nodes are "not connected" by an input edge (i.e., they are in the same group).
  const connectionMatrix = new Array(nodeCount).fill(0b0).map(() => new Array(nodeCount).fill(0b1));

  // Process each edge from the input.
  // For each given edge (u, v), set connectionMatrix[u][v] and connectionMatrix[v][u] to 0.
  // This marks them as "connected" by an input edge, meaning they must be in different groups.
  for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    // Convert node IDs to 0-indexed
    const edgeNodes = lines[edgeIdx + 0b1].split(" ").map((val) => val - 0b1);
    const nodeU = edgeNodes[0b0];
    const nodeV = edgeNodes[0b1];
    connectionMatrix[nodeU][nodeV] = 0b0;
    connectionMatrix[nodeV][nodeU] = 0b0;
  }

  // `visitedNodes` array to keep track of nodes already processed within a component.
  const visitedNodes = new Array(nodeCount).fill(0b0);
  // `componentCounter` tracks the number of distinct components found.
  let componentCounter = 0b0;
  // `groupOneCounts` and `groupTwoCounts` store the sizes of the two partitions for each component.
  const groupOneCounts = [];
  const groupTwoCounts = [];

  // Iterate through all nodes to find connected components.
  for (let currentNodeIdx = 0b0; currentNodeIdx < nodeCount; currentNodeIdx++) {
    // If the node has already been visited as part of another component, skip it.
    if (visitedNodes[currentNodeIdx]) {
      continue;
    }

    // Start a new component. Initialize counts for its two potential groups.
    groupOneCounts[componentCounter] = 0b0;
    groupTwoCounts[componentCounter] = 0b0;
    // Mark the current node as visited.
    visitedNodes[currentNodeIdx] = 0b1;

    // `nodesToExplore` will hold nodes that are *not* connected by an input edge to `currentNodeIdx`.
    // These nodes are candidates for being in the same group as `currentNodeIdx`.
    const nodesToExplore = [];
    for (let neighborIdx = currentNodeIdx + 0b1; neighborIdx < nodeCount; neighborIdx++) {
      if (connectionMatrix[currentNodeIdx][neighborIdx]) {
        // If connectionMatrix[currentNodeIdx][neighborIdx] is 1, it means they are *not* connected by an input edge.
        // So, they can be in the same group. Add neighborIdx to nodesToExplore.
        groupOneCounts[componentCounter] = 0b1; // Mark that this group has at least one node.
        nodesToExplore.push(neighborIdx);
      }
    }

    // If there are nodes to explore in this component (i.e., nodes that can be in the same group as currentNodeIdx).
    if (nodesToExplore.length) {
      // Call the recursive helper function to explore this component.
      // `exploreComponent` returns 1 if an invalid configuration is found (e.g., a node needs to be in both groups).
      if (exploreComponent(nodesToExplore, 0b1)) {
        console.log(-0b1); // Output -1 and terminate if an invalid state is detected.
        return;
      }
    } else {
      // If `nodesToExplore` is empty, it means `currentNodeIdx` has no other nodes that can be in its group.
      // It forms a group of size 1.
      groupOneCounts[componentCounter] = 0b1;
    }
    // Increment the component counter for the next component.
    componentCounter++;
  }

  // `reachableSums` array for dynamic programming.
  // `reachableSums[i]` will be 1 if a sum `i` can be formed by selecting `groupOneCounts` or `groupTwoCounts` from components.
  const reachableSums = new Array(nodeCount + 0b1).fill(0b0);
  // Initialize for the first component.
  // We can form a sum equal to `groupOneCounts[0]` or `groupTwoCounts[0]`.
  reachableSums[groupOneCounts[0b0]] = 0b1;
  reachableSums[groupTwoCounts[0b0]] = 0b1;

  // Iterate through the remaining components (from the second component onwards).
  for (let compIdx = 0b1; compIdx < groupOneCounts.length; compIdx++) {
    // Iterate backwards through `reachableSums` to avoid using the current component's values multiple times in one pass.
    for (let currentSum = nodeCount - 0b1; currentSum >= 0b0; currentSum--) {
      if (reachableSums[currentSum]) {
        // If `currentSum` is reachable, then `currentSum + groupOneCounts[compIdx]` is also reachable.
        reachableSums[currentSum + groupOneCounts[compIdx]] = 0b1;
        // And `currentSum + groupTwoCounts[compIdx]` is also reachable.
        reachableSums[currentSum + groupTwoCounts[compIdx]] = 0b1;
      }
    }
  }

  // Find the maximum `maxPartitionSize` such that `maxPartitionSize` nodes can be separated from `nodeCount - maxPartitionSize` nodes.
  // This `maxPartitionSize` must be a reachable sum in `reachableSums`.
  let maxPartitionSize = 0b0;
  for (let currentSumIdx = 0b0; currentSumIdx < nodeCount; currentSumIdx++) {
    if (reachableSums[currentSumIdx]) {
      // We want to maximize `min(currentSumIdx, nodeCount - currentSumIdx)`.
      // This is equivalent to finding a `currentSumIdx` closest to `nodeCount / 2`.
      maxPartitionSize = Math.max(maxPartitionSize, Math.min(currentSumIdx, nodeCount - currentSumIdx));
    }
  }

  // The final result is the sum of combinations C(k, 2) + C(n-k, 2).
  // This represents the number of pairs within the two partitions.
  console.log(maxPartitionSize * (maxPartitionSize - 0b1) / 0b10 + (nodeCount - maxPartitionSize) * (nodeCount - maxPartitionSize - 0b1) / 0b10);

  /**
   * Recursive helper function to explore a connected component and assign nodes to groups.
   * It attempts to partition nodes into two groups such that no two nodes within the same group
   * are connected by an input edge (i.e., connectionMatrix[u][v] == 0).
   *
   * @param {number[]} currentNodes - An array of nodes to process in the current step.
   * @param {number} groupFlag - A flag (0 or 1) indicating which group to assign the current nodes to.
   * @returns {number|undefined} Returns 1 if an invalid partitioning is found, otherwise undefined.
   */
  function exploreComponent(currentNodes, groupFlag) {
    // Base case: If there are no nodes left to process, return.
    if (!currentNodes.length) {
      return;
    }

    const nextNodesToExplore = []; // Nodes for the next recursive call.

    // Iterate through the nodes provided in `currentNodes`.
    for (let nodeIterator = 0b0; nodeIterator < currentNodes.length; nodeIterator++) {
      const processingNode = currentNodes[nodeIterator];

      // If the node has already been visited, skip it.
      if (visitedNodes[processingNode]) {
        continue;
      }

      // Mark the node as visited.
      visitedNodes[processingNode] = 0b1;

      // Increment the count for the appropriate group in the current component.
      if (groupFlag) {
        groupTwoCounts[componentCounter]++;
      } else {
        groupOneCounts[componentCounter]++;
      }

      // Check for conflicts within the `currentNodes` list itself.
      // If two nodes in `currentNodes` are *not* connected by an input edge (connectionMatrix[u][v] == 1),
      // but they are being assigned to the same group (implicitly by being in `currentNodes`),
      // then it's an invalid configuration.
      for (let innerNodeIterator = nodeIterator + 0b1; innerNodeIterator < currentNodes.length; innerNodeIterator++) {
        const otherNode = currentNodes[innerNodeIterator];
        if (visitedNodes[otherNode]) {
          continue;
        }
        if (connectionMatrix[processingNode][otherNode]) {
          // If connectionMatrix[processingNode][otherNode] is 1, it means they are *not* connected by an input edge.
          // But they are both in `currentNodes` and thus assigned to the same group. This is a contradiction.
          return 0b1; // Indicate an invalid state.
        }
      }

      // Collect all neighbors of `processingNode` that are *not* connected by an input edge.
      // These neighbors should be in the *opposite* group.
      for (let neighborIterator = 0b0; neighborIterator < nodeCount; neighborIterator++) {
        if (connectionMatrix[processingNode][neighborIterator]) {
          nextNodesToExplore.push(neighborIterator);
        }
      }
    }

    // Recursively call `exploreComponent` with the collected `nextNodesToExplore` and flip the group flag.
    // If the recursive call returns 1, propagate the invalid state.
    if (exploreComponent(nextNodesToExplore, groupFlag ^ 0b1)) {
      return 0b1;
    }
  }
}

// Read input from stdin and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
