function ProcessInput(inputString) {
  // Split the input string into individual lines.
  inputString = inputString.split("\n");

  // Parse the first line to extract the total number of nodes and edges.
  const graphDimensions = inputString[0].split(" ").map(value => +value);
  let totalEdgeCount = graphDimensions[1];
  let totalNodeCount = graphDimensions[0];

  // Initialize an adjacency matrix for the graph.
  // A value of 0 in `connectionMatrix[u][v]` signifies an existing edge between node u and node v.
  // A value of 1 signifies no direct edge between node u and node v.
  // Initially, all pairs are assumed to have no edge (value 1), representing a complete graph complement.
  const connectionMatrix = Array(totalNodeCount).fill(0).map(() => Array(totalNodeCount).fill(1));

  // Process each specified edge from the input.
  // For every given edge (u, v), set `connectionMatrix[u][v]` and `connectionMatrix[v][u]` to 0.
  // This marks these specific pairs as having an edge.
  for (let currentEdgeIndex = 0; currentEdgeIndex < totalEdgeCount; currentEdgeIndex++) {
    const edgeNodePair = inputString[currentEdgeIndex + 1].split(" ").map(value => value - 1);
    const nodeOne = edgeNodePair[0];
    const nodeTwo = edgeNodePair[1];
    connectionMatrix[nodeOne][nodeTwo] = connectionMatrix[nodeTwo][nodeOne] = 0;
  }

  // An array to keep track of nodes that have been visited during the component exploration.
  // `0` means unvisited, `1` means visited.
  const nodeVisitedStatus = Array(totalNodeCount).fill(0);
  // A counter for the current connected component being processed.
  let currentComponentIdentifier = 0;
  // Arrays to store the counts of nodes assigned to the 'X' and 'Y' partitions
  // for each identified connected component.
  const componentXPartitionSizes = [];
  const componentYPartitionSizes = [];

  // Iterate through all nodes to discover and process each connected component.
  for (let nodeIterator = 0; nodeIterator < totalNodeCount; nodeIterator++) {
    // If the current node has already been processed as part of a previous component, skip it.
    if (nodeVisitedStatus[nodeIterator]) {
      continue;
    }

    // Initialize partition counts for the newly discovered component.
    componentXPartitionSizes[currentComponentIdentifier] = 0;
    componentYPartitionSizes[currentComponentIdentifier] = 0;
    // Mark the current node as visited.
    nodeVisitedStatus[nodeIterator] = 1;

    // A list to hold nodes that are not directly connected to the current node.
    // These nodes will be candidates for the opposite partition.
    const nodesForOppositePartition = [];
    // Check connections from the current node to all subsequent nodes.
    for (let potentialNeighborIndex = nodeIterator + 1; potentialNeighborIndex < totalNodeCount; potentialNeighborIndex++) {
      // If `connectionMatrix[nodeIterator][potentialNeighborIndex]` is 1, it means there is NO edge
      // between `nodeIterator` and `potentialNeighborIndex`.
      // In a two-clique partition, nodes without an edge must belong to different cliques.
      // So, `nodeIterator` is implicitly in one clique (e.g., X), and `potentialNeighborIndex` goes to the other (Y).
      if (connectionMatrix[nodeIterator][potentialNeighborIndex]) {
        componentXPartitionSizes[currentComponentIdentifier] = 1; // Indicate that this component has at least one node in X.
        nodesForOppositePartition.push(potentialNeighborIndex);
      }
    }

    // Recursively explore the current component to attempt a two-clique partition.
    // The `1` indicates that `nodesForOppositePartition` will be assigned to the second partition (Y).
    // If `traverseComponent` returns 1, it means a conflict was found (not partitionable into two cliques).
    if (traverseComponent(nodesForOppositePartition, 1)) {
      console.log(-1); // Output -1 for an invalid partition.
      return; // Terminate execution.
    }
    // Increment the component identifier for the next component.
    currentComponentIdentifier++;
  }

  // An array to track all possible sums of partition sizes that can be formed across components.
  // `possiblePartitionSums[s] = 1` means a partition of size `s` is achievable for one of the cliques.
  // JavaScript arrays will dynamically extend if indices exceed their initial length.
  const possiblePartitionSums = Array(totalNodeCount).fill(0);
  // Initialize with the partition sizes from the first component.
  // The first component can contribute either its 'X' count or its 'Y' count to the total sum.
  possiblePartitionSums[componentXPartitionSizes[0]] = 1;
  possiblePartitionSums[componentYPartitionSizes[0]] = 1;

  // Iterate through the remaining components (starting from the second one).
  for (let currentCompIdx = 1; currentCompIdx < componentXPartitionSizes.length; currentCompIdx++) {
    // Iterate backwards through the `possiblePartitionSums` array.
    // This ensures that newly marked sums in the current iteration are not used to form further sums
    // within the same iteration, preventing incorrect combinations.
    for (let currentSumValue = totalNodeCount - 1; currentSumValue >= 0; currentSumValue--) {
      // If `currentSumValue` is a reachable sum from previous components,
      // then adding the current component's 'X' or 'Y' partition sizes will also be reachable.
      if (possiblePartitionSums[currentSumValue]) {
        // Mark the new sum formed by adding the current component's 'X' partition size.
        possiblePartitionSums[totalNodeCount + componentXPartitionSizes[currentCompIdx]] = 1;
        // Mark the new sum formed by adding the current component's 'Y' partition size.
        possiblePartitionSums[totalNodeCount + componentYPartitionSizes[currentCompIdx]] = 1;
      }
    }
  }

  // Determine the optimal size `k` for one of the two cliques.
  // We want to maximize `min(k, totalNodeCount - k)` among all reachable `k`.
  // This aims to make the two resulting clique sizes as balanced as possible.
  let optimalCliqueSizeK = 0;
  for (let sizeCandidate = 0; sizeCandidate < totalNodeCount; sizeCandidate++) {
    if (possiblePartitionSums[sizeCandidate]) {
      optimalCliqueSizeK = Math.max(optimalCliqueSizeK, Math.min(sizeCandidate, totalNodeCount - sizeCandidate));
    }
  }

  // Calculate and print the final result.
  // The formula `k * (k - 1) / 2` represents the number of edges within a clique of size `k`.
  // The total result is the sum of edges within the two cliques formed by the optimal partition.
  console.log(optimalCliqueSizeK * (optimalCliqueSizeK - 1) / 2 + (totalNodeCount - optimalCliqueSizeK) * (totalNodeCount - optimalCliqueSizeK - 1) / 2);

  /**
   * Recursive helper function to explore a connected component and attempt to partition it into two cliques.
   * This function performs a modified traversal, similar to BFS/DFS.
   * @param {number[]} nodesToExplore - An array of nodes to process in the current step. These nodes are assumed to belong to the current partition.
   * @param {number} isSecondPartitionFlag - A flag (0 for first partition 'X', 1 for second partition 'Y') indicating which partition `nodesToExplore` belong to.
   * @returns {number} Returns 1 if a conflict is detected (graph cannot be partitioned into two cliques), otherwise returns undefined.
   */
  function traverseComponent(nodesToExplore, isSecondPartitionFlag) {
    // Base case: If there are no nodes left to explore in this step, return.
    if (!nodesToExplore.length) {
      return;
    }

    // A list to accumulate nodes that are not connected to the `nodesToExplore` in the current step.
    // These will be assigned to the opposite partition for the next recursive call.
    const nextNodesForOppositePartition = [];

    // Iterate through the current set of nodes.
    for (let nodeIndexA = 0; nodeIndexA < nodesToExplore.length; nodeIndexA++) {
      const currentNode = nodesToExplore[nodeIndexA];

      // If the current node has already been visited, skip it.
      if (nodeVisitedStatus[currentNode]) {
        continue;
      }

      // Mark the current node as visited.
      nodeVisitedStatus[currentNode] = 1;

      // Increment the appropriate partition count for the current component.
      if (isSecondPartitionFlag) {
        componentYPartitionSizes[currentComponentIdentifier]++;
      } else {
        componentXPartitionSizes[currentComponentIdentifier]++;
      }

      // Check for conflicts within the current set of nodes (nodes assumed to be in the same partition).
      // If two nodes (`currentNode` and `otherNode`) within the same partition are NOT connected
      // (i.e., `connectionMatrix[currentNode][otherNode]` is 1), then it's a conflict.
      // All nodes within a clique must be connected to each other.
      for (let nodeIndexB = nodeIndexA + 1; nodeIndexB < nodesToExplore.length; nodeIndexB++) {
        const otherNode = nodesToExplore[nodeIndexB];
        // Skip if `otherNode` has already been visited (a safety check).
        if (nodeVisitedStatus[otherNode]) {
          continue;
        }
        if (connectionMatrix[currentNode][otherNode]) {
          return 1; // Conflict: Two nodes in the same partition are NOT connected.
        }
      }

      // Identify all nodes that are NOT connected to `currentNode`.
      // These nodes must belong to the opposite partition.
      for (let neighborIndex = 0; neighborIndex < totalNodeCount; neighborIndex++) {
        if (connectionMatrix[currentNode][neighborIndex]) {
          nextNodesForOppositePartition.push(neighborIndex);
        }
      }
    }

    // Recursively call `traverseComponent` for the next set of nodes,
    // flipping the partition flag (`isSecondPartitionFlag ^ 1`) to assign them to the other partition.
    // If the recursive call finds a conflict, propagate it up.
    if (traverseComponent(nextNodesForOppositePartition, isSecondPartitionFlag ^ 1)) {
      return 1;
    }
  }
}

// Read the input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
