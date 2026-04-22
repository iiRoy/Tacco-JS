/*
 * Main entry point for processing graph data from standard input.
 * This function aims to partition a graph and calculate a specific metric.
 */
function ProcessGraphData(inputStringData) {
  // Split the entire input string into individual lines for easier parsing.
  const inputLines = inputStringData.split("\n");

  // Parse the first line to get the total number of nodes and edges.
  // The first element is the total number of nodes, the second is the number of edges.
  let parsedCounts = inputLines[0].split(" ").map(valStr => parseInt(valStr, 10));

  const edgeCount = parsedCounts[1]; // Store the number of edges.
  let totalNodes = parsedCounts[0]; // Store the total number of nodes.

  // Initialize an adjacency matrix where all nodes are initially considered connected.
  // A value of 1 indicates a connection, 0 indicates no connection.
  const connectivityMatrix = Array(totalNodes).fill(null).map(() => Array(totalNodes).fill(1));

  // Process each edge from the input to mark disconnections in the matrix.
  // Edges are 0-indexed in the problem description after parsing.
  for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    // Parse the current edge definition (e.g., "0 1" means node 0 and 1 are connected).
    const currentEdge = inputLines[edgeIdx + 1].split(" ").map(valStr => parseInt(valStr, 10) - 1);
    const nodeA = currentEdge[0];
    const nodeB = currentEdge[1];

    // Mark the nodes as disconnected in both directions (undirected graph).
    connectivityMatrix[nodeA][nodeB] = connectivityMatrix[nodeB][nodeA] = 0;
  }

  // Array to keep track of visited nodes during graph traversal.
  // 0: unvisited, 1: visited.
  const nodeStatus = Array(totalNodes).fill(0);
  // Cursor to track the current component being processed.
  let componentCursor = 0;

  // Arrays to store the sizes of the two partitions (A and B) for each connected component.
  const partitionASizes = [];
  const partitionBSizes = [];

  // Iterate through all nodes to find and process connected components.
  for (let nodeIdx = 0; nodeIdx < totalNodes; nodeIdx++) {
    // If the current node has already been visited as part of another component, skip it.
    if (nodeStatus[nodeIdx]) {
      continue;
    }

    // Initialize sizes for the new component's partitions.
    partitionASizes[componentCursor] = 0;
    partitionBSizes[componentCursor] = 0;

    // Mark the current node as visited.
    nodeStatus[nodeIdx] = 1;

    // Find all direct neighbors of the current node.
    const connectedNeighbors = [];
    for (let neighborIdx = nodeIdx + 1; neighborIdx < totalNodes; neighborIdx++) {
      // If there's a connection, it means this node is part of a component.
      if (connectivityMatrix[nodeIdx][neighborIdx]) {
        partitionASizes[componentCursor] = 1; // Mark this component as having at least one node in partition A.
        connectedNeighbors.push(neighborIdx); // Add neighbor to be explored.
      }
    }

    // If there are neighbors, explore the component recursively.
    if (connectedNeighbors.length) {
      // If the exploration finds an invalid partition (e.g., a cycle within a partition),
      // output -1 and terminate. (This typically means it's not a bipartite graph).
      if (explorePartition(connectedNeighbors, 1)) { // Start exploring from side B.
        console.log(-1);
        return;
      }
    } else {
      // If no neighbors, this node forms a component of size 1.
      // It is placed in partition A by default.
      partitionASizes[componentCursor] = 1;
    }
    // Move to the next component index.
    componentCursor++;
  }

  // Array to track all possible sums of partition sizes.
  // The index represents a sum, and the value indicates if that sum is achievable (1) or not (0).
  const possiblePartitionSums = Array(totalNodes).fill(0);

  // The initial state: sums of the first component's partitions are achievable.
  possiblePartitionSums[partitionASizes[0]] = 1;
  possiblePartitionSums[partitionBSizes[0]] = 1;

  // Iterate through the remaining components to build up all possible partition sums.
  for (let compIdx = 1; compIdx < partitionASizes.length; compIdx++) {
    // Iterate backwards through existing possible sums to avoid using newly added sums in the same iteration.
    for (let currentSumIdx = totalNodes - 1; currentSumIdx >= 0; currentSumIdx--) {
      if (possiblePartitionSums[currentSumIdx]) { // If currentSumIdx is an achievable sum
        // Add the current component's partition A size to the achievable sum.
        // In JavaScript, assigning to an index beyond the current array length will extend the array.
        possiblePartitionSums[totalNodes + partitionASizes[compIdx]] = 1;
        // Add the current component's partition B size to the achievable sum.
        possiblePartitionSums[totalNodes + partitionBSizes[compIdx]] = 1;
      }
    }
  }

  // Find the largest valid group size 'largestValidGroup'.
  // This is the largest 'i' such that 'i' is a possible partition sum,
  // and 'i' is less than or equal to 'totalNodes / 2'.
  let largestValidGroup = 0;
  for (let sumIdx = 0; sumIdx < possiblePartitionSums.length; sumIdx++) { // Loop through all potential sums
    if (possiblePartitionSums[sumIdx]) {
      // We want to maximize min(i, totalNodes - i). This is maximized when i is closest to totalNodes/2.
      // So, iterate through possible sums and update largestValidGroup.
      largestValidGroup = Math.max(largestValidGroup, Math.min(sumIdx, totalNodes - sumIdx));
    }
  }

  // Output the final calculated result.
  // This formula appears to be for counting pairs within two groups of sizes largestValidGroup and (totalNodes - largestValidGroup).
  console.log(largestValidGroup * (largestValidGroup - 1) / 2 + (totalNodes - largestValidGroup) * (totalNodes - largestValidGroup - 1) / 2);

  /*
   * Recursive helper function to explore a connected component and assign nodes to partitions.
   * It attempts to perform a 2-coloring (bipartitioning) of the component.
   * @param {Array<number>} nodesInQueue - List of nodes to process in the current step.
   * @param {number} currentPartitionSide - The partition side (0 or 1) to assign the current nodes to.
   * @returns {number | undefined} - 1 if an invalid partitioning is found, otherwise undefined.
   */
  function explorePartition(nodesInQueue, currentPartitionSide) {
    // Base case: if there are no nodes left to process, return.
    if (!nodesInQueue.length) {
      return;
    }

    const nextNodesToExplore = []; // Nodes that are neighbors of current nodes and need to be processed next.

    // Iterate through the nodes provided in the current queue.
    for (let nodeQueueIdx = 0; nodeQueueIdx < nodesInQueue.length; nodeQueueIdx++) {
      const currentNode = nodesInQueue[nodeQueueIdx];

      // If the current node has already been visited, skip it.
      if (nodeStatus[currentNode]) {
        continue;
      }

      // Mark the current node as visited.
      nodeStatus[currentNode] = 1;

      // Assign the node to the appropriate partition based on 'currentPartitionSide'.
      if (currentPartitionSide) {
        partitionBSizes[componentCursor]++;
      } else {
        partitionASizes[componentCursor]++;
      }

      // Check for conflicts: ensure no two nodes within the current `nodesInQueue` (which are all supposed to be on the same 'side') are connected.
      // This is a crucial check for bipartiteness.
      for (let otherNodeQueueIdx = nodeQueueIdx + 1; otherNodeQueueIdx < nodesInQueue.length; otherNodeQueueIdx++) {
        const otherNode = nodesInQueue[otherNodeQueueIdx];
        if (nodeStatus[otherNode]) { // If the other node is already visited, means it's been processed.
          continue;
        }
        // If two nodes within the same partition side are connected, it's not a bipartite graph.
        if (connectivityMatrix[currentNode][otherNode]) {
          return 1; // Indicate an error (non-bipartite component).
        }
      }

      // Find all unvisited neighbors of the current node and add them to the next queue.
      for (let graphNodeIdx = 0; graphNodeIdx < totalNodes; graphNodeIdx++) {
        if (connectivityMatrix[currentNode][graphNodeIdx] && !nodeStatus[graphNodeIdx]) {
          nextNodesToExplore.push(graphNodeIdx);
        }
      }
    }

    // Recursively call `explorePartition` with the next set of nodes and flip the partition side.
    // The `^ 1` operator efficiently flips between 0 and 1.
    if (explorePartition(nextNodesToExplore, currentPartitionSide ^ 1)) {
      return 1; // Propagate the error if any.
    }
  }
}

// Read input from stdin and pass it to the main processing function.
ProcessGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));