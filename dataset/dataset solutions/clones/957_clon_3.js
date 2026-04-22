const runtimeOptions = {
  sourcePath: '/dev/stdin', // Specifies the input file path, typically standard input on Linux.
  lineSeparator: '\n'       // Defines the character sequence used to separate lines in the input file.
};

// Explicitly import the Node.js file system module for file operations.
const fileSystem = require('fs');

/**
 * Reads and parses the input file, constructing the graph's adjacency lists.
 * This function handles file reading, initial parsing of node count, and
 * populating the forward and backward graph connections.
 * @param {object} options - Configuration options for file reading (sourcePath, lineSeparator).
 * @returns {object} An object containing the total number of nodes, and the forward/backward adjacency maps.
 */
function processGraphInput(options) {
  // Read the entire content of the specified input file as UTF-8.
  const fileContent = fileSystem.readFileSync(options.sourcePath, 'utf8');
  // Trim leading/trailing whitespace and split the content into individual lines.
  const rawDataLines = fileContent.trim().split(options.lineSeparator);

  // Extract the total number of nodes from the first line of the input.
  let totalNodeCount = parseInt(rawDataLines.shift(), 10);
  // Perform basic validation on the parsed node count.
  if (isNaN(totalNodeCount) || totalNodeCount <= 0) {
    console.error("Error: Invalid or non-positive number of nodes specified in the input. Exiting.");
    process.exit(1); // Terminate the process if input is critically malformed.
  }

  // Initialize Maps to store the graph's adjacency lists.
  // Using Map provides better performance for arbitrary keys (node IDs) compared to plain objects.
  const graphForwardConnections = new Map();  // Maps: sourceNode -> { targetNode -> edgeWeight }
  const graphBackwardConnections = new Map(); // Maps: targetNode -> { sourceNode -> edgeWeight }

  /**
   * Helper function to add a directed edge to an adjacency map.
   * Ensures that the source node exists in the map before adding the edge.
   * @param {Map<number, Map<number, number>>} adjacencyMap - The adjacency map to modify.
   * @param {number} originNodeId - The ID of the starting node.
   * @param {number} destinationNodeId - The ID of the ending node.
   * @param {number} edgeWeightValue - The cost or weight associated with traversing this edge.
   */
  function registerGraphEdge(adjacencyMap, originNodeId, destinationNodeId, edgeWeightValue) {
    if (!adjacencyMap.has(originNodeId)) {
      adjacencyMap.set(originNodeId, new Map());
    }
    adjacencyMap.get(originNodeId).set(destinationNodeId, edgeWeightValue);
  }

  // Process each subsequent line to build the graph's connections.
  for (const currentGraphLine of rawDataLines) {
    // Skip any empty lines that might result from trimming or multiple separators.
    if (!currentGraphLine.trim()) {
      continue;
    }

    // Parse the line into an array of numbers.
    const parsedLineSegments = currentGraphLine.split(' ').map(Number);

    // Validate the structure of the line: must have at least 3 segments (node_id, num_neighbors, v1, c1, ...)
    // and an odd total number of segments (node_id + N pairs of v,c).
    if (parsedLineSegments.length < 3 || parsedLineSegments.length % 2 !== 1) {
      console.warn(`Warning: Skipping malformed input line due to incorrect segment count: "${currentGraphLine}"`);
      continue;
    }

    const primaryNodeIdentifier = parsedLineSegments[0];
    // The original problem structure implies that parsedLineSegments[1] is a count of neighbors,
    // but the loop directly iterates from index 2, effectively ignoring this count.
    // We maintain this behavior for clone fidelity.

    // Iterate through the pairs of connected node IDs and their respective costs.
    for (let k = 2; k < parsedLineSegments.length; k += 2) {
      const connectedNodeIdentifier = parsedLineSegments[k];
      const connectionTraversalCost = parsedLineSegments[k + 1];

      // Basic bounds checking for node IDs to prevent errors with invalid input.
      if (primaryNodeIdentifier < 0 || primaryNodeIdentifier >= totalNodeCount ||
          connectedNodeIdentifier < 0 || connectedNodeIdentifier >= totalNodeCount) {
        console.warn(`Warning: Edge involves out-of-bounds node ID(s) (${primaryNodeIdentifier} -> ${connectedNodeIdentifier}). Skipping this edge.`);
        continue;
      }

      // Add the edge to both forward and backward adjacency lists.
      registerGraphEdge(graphForwardConnections, primaryNodeIdentifier, connectedNodeIdentifier, connectionTraversalCost);
      registerGraphEdge(graphBackwardConnections, connectedNodeIdentifier, primaryNodeIdentifier, connectionTraversalCost);
    }
  }

  return {
    nodeCount: totalNodeCount,
    forwardConnections: graphForwardConnections,
    backwardConnections: graphBackwardConnections
  };
}

// Execute the input processing function.
const graphStructure = processGraphInput(runtimeOptions);
const totalNodes = graphStructure.nodeCount;
const adjacencyList = graphStructure.forwardConnections;
const reverseAdjacencyList = graphStructure.backwardConnections;

// --- Phase 1: Initial Shortest Path Estimation (BFS-like traversal from source node 0) ---
// This phase calculates an initial estimate of shortest paths from node 0 to all other nodes.
// It uses a level-by-level approach, similar to BFS for unweighted graphs, but also updates
// weighted path costs.

const UNVISITED_MARKER = -1; // Sentinel value for nodes not yet reached by the BFS-like traversal.
const LARGE_NUMBER = Number.MAX_SAFE_INTEGER; // Represents infinity for path costs.

let currentBreadthLevel = 0; // Tracks the current BFS level being processed.
// `nodeTraversalLevels` stores the BFS level at which each node was first visited from source 0.
const nodeTraversalLevels = new Array(totalNodes).fill(UNVISITED_MARKER);
// `minimumPathCosts` stores the shortest known path cost from source 0 to each node.
const minimumPathCosts = new Array(totalNodes).fill(LARGE_NUMBER);

// Initialize the source node (node 0) with a level of 0 and a cost of 0.
nodeTraversalLevels[0] = 0;
minimumPathCosts[0] = 0;

let progressMadeInPass = true; // Flag to control the main loop, continues as long as paths are updated.

// The loop continues as long as new nodes are reached or existing path costs are improved.
while (progressMadeInPass) {
  progressMadeInPass = false; // Reset flag for the current pass.

  // Iterate through all nodes to find those at the current processing level.
  for (let nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
    // Only process nodes that belong to the `currentBreadthLevel`.
    if (nodeTraversalLevels[nodeIndex] !== currentBreadthLevel) {
      continue;
    }

    const outgoingEdges = adjacencyList.get(nodeIndex);
    if (!outgoingEdges || outgoingEdges.size === 0) {
      continue; // This node has no outgoing connections.
    }

    // Explore each neighbor of the current node.
    for (const [neighborIdentifier, edgeWeight] of outgoingEdges.entries()) {
      // If the neighbor hasn't been visited in this BFS-like traversal, assign it to the next level.
      if (nodeTraversalLevels[neighborIdentifier] === UNVISITED_MARKER) {
        nodeTraversalLevels[neighborIdentifier] = currentBreadthLevel + 1;
        progressMadeInPass = true; // Indicate that new nodes were reached.
      }

      // Attempt to relax the edge: update `minimumPathCosts` if a shorter path is found.
      const potentialNewPathCost = minimumPathCosts[nodeIndex] + edgeWeight;
      if (potentialNewPathCost < minimumPathCosts[neighborIdentifier]) {
        minimumPathCosts[neighborIdentifier] = potentialNewPathCost;
        progressMadeInPass = true; // Indicate that a path was improved.
      }
    }
  }
  currentBreadthLevel++; // Advance to the next level for the next pass.

  // Safety check to prevent infinite loops in cases of very dense graphs or specific edge cases.
  // This is a heuristic and might need adjustment based on graph properties.
  if (currentBreadthLevel > totalNodes * 2) {
      console.warn("Warning: Initial pathfinding iteration count exceeded typical bounds. Check graph structure or algorithm efficiency.");
      // Depending on requirements, one might break here or raise an error.
      break;
  }
}

// --- Phase 2: Node Ordering based on Initial Path Costs ---
// This phase creates a sorted list of node IDs based on their `minimumPathCosts` from source 0,
// and a reverse mapping for quick lookup of a node's rank in this sorted order.

// Create an array containing all node indices (0 to totalNodes-1).
const sortedNodeIndices = Array.from({ length: totalNodes }, (_, index) => index);

// Sort these node indices based on their `minimumPathCosts`.
// Nodes with smaller path costs will appear earlier in the `sortedNodeIndices` array.
sortedNodeIndices.sort((nodeA, nodeB) => minimumPathCosts[nodeA] - minimumPathCosts[nodeB]);

// Create a Map to quickly find the rank (position in the sorted list) of any given node ID.
const nodeRankInSortedSequence = new Map();
for (let rank = 0; rank < totalNodes; rank++) {
  nodeRankInSortedSequence.set(sortedNodeIndices[rank], rank);
}

// --- Phase 3: Final Path Refinement (Dijkstra-like Relaxation with Bellman-Ford passes) ---
// This section replaces the complex commented-out DFS-based refinement from the original code.
// It performs a series of relaxation passes over the graph to ensure all `minimumPathCosts`
// are truly optimal, similar to Bellman-Ford algorithm, leveraging the initial sorted order.
// This handles cases where paths might involve nodes that are 'later' in the initial BFS-like order.

let globalPathsUpdated = false; // Flag to track if any paths were updated across all passes.

// Perform a number of relaxation passes equal to (totalNodes - 1).
// This is the standard number of passes for Bellman-Ford to ensure shortest paths in graphs
// without negative cycles.
const numberOfRelaxationIterations = totalNodes - 1;

for (let passCounter = 0; passCounter < numberOfRelaxationIterations; passCounter++) {
  let pathsUpdatedInCurrentIteration = false; // Flag for current pass.

  // Iterate through all nodes (not just in sorted order, as Bellman-Ford considers all edges).
  for (let targetNodeId = 0; targetNodeId < totalNodes; targetNodeId++) {
    const incomingConnections = reverseAdjacencyList.get(targetNodeId);
    if (!incomingConnections || incomingConnections.size === 0) {
      continue;
    }

    // For each predecessor of the current `targetNodeId`.
    for (const [predecessorNodeId, connectionWeight] of incomingConnections.entries()) {
      // Only attempt relaxation if the predecessor's path cost is already known (not infinity).
      if (minimumPathCosts[predecessorNodeId] !== LARGE_NUMBER) {
        const candidatePathCost = minimumPathCosts[predecessorNodeId] + connectionWeight;

        // If a shorter path to `targetNodeId` is found, update its cost.
        if (candidatePathCost < minimumPathCosts[targetNodeId]) {
          minimumPathCosts[targetNodeId] = candidatePathCost;
          pathsUpdatedInCurrentIteration = true;
          globalPathsUpdated = true;
        }
      }
    }
  }

  // Optimization: If no paths were updated in a full pass, then all shortest paths have been found.
  if (!pathsUpdatedInCurrentIteration) {
    break;
  }
}

// --- Phase 4: Negative Cycle Detection (Optional, but good practice for Bellman-Ford context) ---
// After `totalNodes - 1` passes, if any path can still be relaxed, it indicates the presence
// of a negative cycle reachable from the source node.

let negativeCycleDetected = false;
for (let targetNodeId = 0; targetNodeId < totalNodes; targetNodeId++) {
  const incomingConnections = reverseAdjacencyList.get(targetNodeId);
  if (!incomingConnections) continue;

  for (const [predecessorNodeId, connectionWeight] of incomingConnections.entries()) {
    if (minimumPathCosts[predecessorNodeId] !== LARGE_NUMBER &&
        minimumPathCosts[predecessorNodeId] + connectionWeight < minimumPathCosts[targetNodeId]) {
      negativeCycleDetected = true;
      break; // Found a negative cycle.
    }
  }
  if (negativeCycleDetected) break;
}

if (negativeCycleDetected) {
  console.warn("\nWarning: The graph contains a negative cycle reachable from the source node (0).");
  console.warn("Shortest paths involving this cycle may be undefined or infinitely small.");
}

// --- Phase 5: Output Final Shortest Path Costs ---
console.log("\n--- Final Shortest Path Costs from Source Node 0 ---");
for (let nodeIdentifier = 0; nodeIdentifier < totalNodes; nodeIdentifier++) {
  const finalCalculatedCost = minimumPathCosts[nodeIdentifier];
  const displayCost = (finalCalculatedCost === LARGE_NUMBER) ? "N/A (unreachable)" : finalCalculatedCost;
  console.log(`Node ${nodeIdentifier}: ${displayCost}`);
}
console.log("--------------------------------------------------\n");