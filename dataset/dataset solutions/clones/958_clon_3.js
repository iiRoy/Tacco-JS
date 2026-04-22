// This module computes shortest path distances from a source node (node 0)
// to all other nodes in a directed, weighted graph. It employs a multi-phase
// algorithm combining BFS-like level assignment and a dynamic programming
// approach with specialized path exploration.

// Configuration object for managing external dependencies and input/output.
const ioConfiguration = {
  dataSourcePath: '/dev/stdin', // Specifies the input source, typically standard input for Linux.
  lineSeparator: '\n'             // Defines the character sequence used to split input lines.
};

// --- Utility Functions (Type III Additions) ---

// Helper function to safely convert a string to an integer.
// Returns 0 if parsing fails, but could be extended for stricter error handling.
const parseNumericValue = (str, radix = 10) => {
  const num = parseInt(str, radix);
  return isNaN(num) ? 0 : num;
};

// Extend String prototype for clearer input processing, mimicking original behavior.
// These are Type III additions for renaming and structural clarity.
if (!String.prototype.stripWhitespace) {
  String.prototype.stripWhitespace = function() {
    return this.trim();
  };
}
if (!String.prototype.segmentByDelimiter) {
  String.prototype.segmentByDelimiter = function(delimiter) {
    return this.split(delimiter);
  };
}

// --- Graph Data Loading (Type III: Wrapped in Function, Added Validations) ---

/**
 * Reads graph data from a specified source, parses it, and constructs adjacency lists.
 * @param {object} configParams Configuration containing dataSourcePath and lineSeparator.
 * @returns {object} An object containing nodeCount, forwardEdges, and reverseEdges.
 */
function loadGraphData(configParams) {
  let rawInputContent;
  try {
    const nodeIoModule = require('fs'); // Dynamically require file system module.
    rawInputContent = nodeIoModule.readFileSync(configParams.dataSourcePath, 'ascii');
  } catch (error) {
    console.error(`ERROR: Failed to read input from ${configParams.dataSourcePath}. Details: ${error.message}`);
    return { nodeCount: 0, forwardEdges: {}, reverseEdges: {} }; // Return empty structures on error.
  }

  const inputLines = rawInputContent
    .stripWhitespace()
    .segmentByDelimiter(configParams.lineSeparator);

  const initialLine = inputLines.shift();
  if (!initialLine) {
    console.warn("Input stream appears empty or malformed. No graph data found.");
    return { nodeCount: 0, forwardEdges: {}, reverseEdges: {} };
  }

  const nodeCount = parseNumericValue(initialLine);
  if (nodeCount <= 0) {
    console.warn(`Invalid node count (${nodeCount}) detected. Graph will be empty.`);
    return { nodeCount: 0, forwardEdges: {}, reverseEdges: {} };
  }

  const forwardEdges = {}; // Adjacency list: { sourceNode: { destinationNode: weight } }
  const reverseEdges = {}; // Inverse adjacency list: { destinationNode: { sourceNode: weight } }

  // Helper to add an edge to both forward and reverse graph representations.
  const establishEdge = (graphObject, originNode, destinationNode, weight) => {
    if (!graphObject.hasOwnProperty(originNode)) {
      graphObject[originNode] = {};
    }
    graphObject[originNode][destinationNode] = weight;
  };

  // Process each subsequent line to build the graph's edges.
  for (let lineIdx = 0; lineIdx < inputLines.length; lineIdx++) {
    const currentLine = inputLines[lineIdx];
    if (!currentLine || !currentLine.stripWhitespace()) continue; // Skip empty or whitespace-only lines.

    const parsedSegment = currentLine.segmentByDelimiter(' ').map(parseNumericValue);
    // Expected format: [sourceNode, numEdges, dest1, cost1, dest2, cost2, ...]
    if (parsedSegment.length < 3 || parsedSegment.length % 2 !== 0) {
      console.warn(`Skipping malformed graph line ${lineIdx + 2}: "${currentLine}". Expected format: u k v1 c1 v2 c2...`);
      continue;
    }

    const currentSourceNode = parsedSegment[0];
    // The second element (parsedSegment[1]) is 'k', the count of neighbors,
    // which is implicitly handled by iterating over the rest of the array.

    for (let edgeDataIdx = 2; edgeDataIdx < parsedSegment.length; edgeDataIdx += 2) {
      const destinationNode = parsedSegment[edgeDataIdx];
      const edgeWeight = parsedSegment[edgeDataIdx + 1];

      // Basic validation for node indices.
      if (currentSourceNode < 0 || currentSourceNode >= nodeCount ||
          destinationNode < 0 || destinationNode >= nodeCount) {
        console.warn(`Invalid node index encountered for edge: ${currentSourceNode} -> ${destinationNode}. Skipping.`);
        continue;
      }

      establishEdge(forwardEdges, currentSourceNode, destinationNode, edgeWeight);
      establishEdge(reverseEdges, destinationNode, currentSourceNode, edgeWeight);
    }
  }
  return { nodeCount, forwardEdges, reverseEdges };
}

// Execute graph data loading.
const { nodeCount, forwardEdges, reverseEdges } = loadGraphData(ioConfiguration);

// --- Phase 1: Initial Shortest Path Calculation using BFS (Type III: Queue-based BFS) ---
// This phase determines initial shortest path distances from node 0 (source)
// and assigns a 'level' to each node based on its discovery order in BFS.

const bfsLevelMap = new Array(nodeCount).fill(null);        // Stores BFS discovery level for each node.
const minDistances = new Array(nodeCount).fill(Number.POSITIVE_INFINITY); // Stores shortest distances from source 0.

// Initialize for the source node (node 0).
if (nodeCount > 0) {
  bfsLevelMap[0] = 0;
  minDistances[0] = 0;
} else {
  console.log("No nodes in the graph to process. Outputting empty results.");
  // Skip further processing if no nodes.
}

// Implement a standard queue-based BFS (Type III change from original level-by-level scan).
const bfsQueue = [];
if (nodeCount > 0) {
  bfsQueue.push(0); // Start BFS from node 0.
}

let queueHeadPointer = 0; // Optimized queue head for array-based queue.
while (queueHeadPointer < bfsQueue.length) {
  const currentVertex = bfsQueue[queueHeadPointer++];
  const currentVertexLevel = bfsLevelMap[currentVertex];
  const currentVertexDistance = minDistances[currentVertex];

  // Iterate through all outgoing edges from the current vertex.
  const outgoingNeighbors = forwardEdges[currentVertex] || {};
  for (const neighborKey in outgoingNeighbors) {
    const neighborNode = parseNumericValue(neighborKey);
    const edgeCost = outgoingNeighbors[neighborKey];

    // If the neighbor hasn't been visited yet (level is null), assign its level and enqueue it.
    if (bfsLevelMap[neighborNode] === null) {
      bfsLevelMap[neighborNode] = currentVertexLevel + 1;
      bfsQueue.push(neighborNode);
    }

    // Attempt to relax the distance to the neighbor.
    const newPathDistance = currentVertexDistance + edgeCost;
    if (newPathDistance < minDistances[neighborNode]) {
      minDistances[neighborNode] = newPathDistance;
    }
  }
}

// --- Phase 2: Node Ordering (Type II: Renamed Identifiers) ---
// Nodes are sorted based on their initial shortest distance from node 0.
// This ordering is fundamental for the subsequent dynamic programming phase.

const nodesSortedByMinDistance = new Array(nodeCount);
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
  nodesSortedByMinDistance[nodeIdx] = nodeIdx;
}

// Sort the nodes.
nodesSortedByMinDistance.sort((nodeA, nodeB) => minDistances[nodeA] - minDistances[nodeB]);

// Create an inverse mapping to quickly retrieve a node's rank (index) in the sorted list.
const nodeRankInSortedList = {};
for (let sortedNodeIdx = 0; sortedNodeIdx < nodeCount; sortedNodeIdx++) {
  nodeRankInSortedList[nodesSortedByMinDistance[sortedNodeIdx]] = sortedNodeIdx;
}

// --- Phase 3: Dynamic Programming with DFS-like Path Exploration (Type III: Refined Function, Comments) ---
// This phase refines the shortest path distances by considering additional paths,
// particularly those that might traverse edges "backwards" in the BFS-sorted order.

// `globalPathVisited` array: This array acts as a global, persistent visited tracker
// across all calls to `findAlternativePath`. Once a node is marked `true` by any
// `findAlternativePath` call, it remains `true` for the entire DP phase.
// This is a specific pruning mechanism inherited from the original code's behavior.
const globalPathVisited = new Array(nodeCount).fill(false);

const pathTraversalStack = new Array(nodeCount);       // Stores nodes in the current DFS path.
const unexploredNeighborsStack = new Array(nodeCount); // Stores remaining neighbors for nodes in `pathTraversalStack`.

/**
 * Performs a DFS-like backward exploration from an `initialPredecessor` towards `targetNode`
 * to find an optimal path segment that, when combined with a known distance `minDistances[nextNodeInPath]`,
 * could improve `minDistances[targetNode]`.
 *
 * @param {number} initialPredecessor The starting node for this backward path exploration.
 * @param {number} targetNode The node whose shortest distance is being refined.
 * @param {number} pathCostBound The current best known path cost to `targetNode`, used for pruning.
 * @returns {number} The minimum path cost found from some intermediate node `x` to `initialPredecessor`
 *                   such that `minDistances[x] + path_cost(x -> ... -> initialPredecessor)` is minimized.
 */
function findAlternativePath(initialPredecessor, targetNode, pathCostBound) {
  let stackDepth = 0;
  let currentTraversalCost = 0;
  let bestPathSegmentValue = pathCostBound; // Initialize with the current path cost bound.

  // Mark the target and initial predecessor as visited within the global context
  // for the duration of this and subsequent `findAlternativePath` calls.
  globalPathVisited[targetNode] = true;
  globalPathVisited[initialPredecessor] = true;

  pathTraversalStack[0] = initialPredecessor;
  const initialPredecessorIncomingEdges = reverseEdges[initialPredecessor];
  unexploredNeighborsStack[0] = initialPredecessorIncomingEdges ? Object.keys(initialPredecessorIncomingEdges) : [];

  // Iterative DFS loop.
  while (true) {
    // If all neighbors of the current node in the stack have been explored.
    if (unexploredNeighborsStack[stackDepth].length === 0) {
      // If the stack is empty, the exploration from `initialPredecessor` is complete.
      if (stackDepth === 0) {
        return bestPathSegmentValue;
      }
      // Backtrack: move up the stack and adjust the `currentTraversalCost`.
      const previousNodeInPath = pathTraversalStack[stackDepth - 1];
      const currentNodeInPath = pathTraversalStack[stackDepth];

      // Retrieve edge weight. Guard against non-existent edges (graph inconsistencies).
      const edgeWeightToSubtract = reverseEdges[previousNodeInPath]?.[currentNodeInPath];
      if (typeof edgeWeightToSubtract === 'number') {
        currentTraversalCost -= edgeWeightToSubtract;
      }
      // Unmark the current node from the global visited list only if it's not the targetNode
      // and not the initialPredecessor. (Original code does not unmark; maintaining this behavior).
      // globalPathVisited[currentNodeInPath] = false; // Original code does NOT do this.
      stackDepth--;
      continue;
    }

    // Get the next neighbor to explore from the current node's remaining incoming edges.
    const nextNodeKey = unexploredNeighborsStack[stackDepth].pop();
    const nextNodeInPath = parseNumericValue(nextNodeKey);

    // If `nextNodeInPath` has been globally visited, skip it. This prevents cycles
    // and re-exploration of paths already considered in the overall DP.
    if (globalPathVisited[nextNodeInPath]) {
      continue;
    }

    // Get the edge weight from `nextNodeInPath` to the `currentNodeOnPath`.
    const currentNodeOnPath = pathTraversalStack[stackDepth];
    const edgeWeightToNext = reverseEdges[currentNodeOnPath]?.[nextNodeInPath];
    if (typeof edgeWeightToNext !== 'number') {
      // This indicates a malformed edge or graph inconsistency, skip this neighbor.
      continue;
    }

    // Pruning: if extending the current path segment already exceeds the best known path cost,
    // this branch cannot lead to a better solution, so prune it.
    if (currentTraversalCost + edgeWeightToNext >= pathCostBound) {
      continue;
    }

    // Relaxation check for nodes that have a lower BFS rank than `targetNode`.
    // These nodes have already had their `minDistances` finalized (or mostly finalized)
    // earlier in the `nodesSortedByMinDistance` iteration.
    if (nodeRankInSortedList[nextNodeInPath] < nodeRankInSortedList[targetNode]) {
      const potentialNewDistance = currentTraversalCost + edgeWeightToNext + minDistances[nextNodeInPath];
      bestPathSegmentValue = Math.min(bestPathSegmentValue, potentialNewDistance);
      continue; // This path segment is evaluated, no need to go deeper from here.
    }

    // If none of the above conditions met, extend the current path.
    currentTraversalCost += edgeWeightToNext;
    stackDepth++;
    pathTraversalStack[stackDepth] = nextNodeInPath;
    globalPathVisited[nextNodeInPath] = true; // Mark as globally visited.

    // Prepare for the next level of DFS: get incoming edges for `nextNodeInPath`.
    const nextNodeIncomingEdges = reverseEdges[nextNodeInPath];
    unexploredNeighborsStack[stackDepth] = nextNodeIncomingEdges ? Object.keys(nextNodeIncomingEdges) : [];
  }
}

// Main Dynamic Programming loop: iterates through nodes in increasing order of their initial shortest distance.
for (let sortedNodeIdx = 0; sortedNodeIdx < nodeCount; sortedNodeIdx++) {
  const currentNode = nodesSortedByMinDistance[sortedNodeIdx];

  // Step 1: Direct relaxation from predecessors with a lower BFS rank.
  // This is a standard Bellman-Ford-like relaxation step, ensuring paths from
  // already 'processed' nodes (earlier in sorted order) are considered.
  const currentIncomingEdges = reverseEdges[currentNode];
  if (currentIncomingEdges) { // Ensure `currentNode` has incoming edges.
    for (const predecessorKey in currentIncomingEdges) {
      const predecessorVertex = parseNumericValue(predecessorKey);
      const edgeWeight = currentIncomingEdges[predecessorKey];

      // Only consider predecessors that appear earlier in the BFS-sorted list.
      if (nodeRankInSortedList[predecessorVertex] < nodeRankInSortedList[currentNode]) {
        const candidateDistance = minDistances[predecessorVertex] + edgeWeight;
        minDistances[currentNode] = Math.min(minDistances[currentNode], candidateDistance);
      }
    }
  }

  // Step 2: Explore alternative paths using `findAlternativePath` for predecessors with a higher BFS rank.
  // This handles complex paths where an optimal route might involve traversing 'backwards'
  // relative to the initial BFS ordering.
  if (currentIncomingEdges) { // Ensure `currentNode` has incoming edges.
    for (const predecessorKey in currentIncomingEdges) {
      const predecessorVertex = parseNumericValue(predecessorKey);
      const edgeWeight = currentIncomingEdges[predecessorKey];

      // Only consider predecessors that appear later in the BFS-sorted list.
      if (nodeRankInSortedList[predecessorVertex] > nodeRankInSortedList[currentNode]) {
        // Calculate the `pathCostBound` for `findAlternativePath`.
        // This is `minDistances[currentNode]` if it's not infinity, otherwise infinity.
        // It represents the upper bound for the path segment being searched by `findAlternativePath`.
        const currentMinDistToTarget = minDistances[currentNode];
        const effectivePathCostBound = (currentMinDistToTarget === Number.POSITIVE_INFINITY)
                                        ? Number.POSITIVE_INFINITY
                                        : currentMinDistToTarget - edgeWeight;

        const foundPathSegmentCost = findAlternativePath(predecessorVertex, currentNode, effectivePathCostBound);
        const newPotentialDistance = foundPathSegmentCost + edgeWeight;
        minDistances[currentNode] = Math.min(minDistances[currentNode], newPotentialDistance);
      }
    }
  }
}

// --- Phase 4: Output Results (Type III: Wrapped in Function) ---

/**
 * Prints the final shortest distance for a given node.
 * @param {number} nodeIndex The index of the node.
 * @param {number} distance The shortest distance to the node from source 0.
 */
function outputNodeDistance(nodeIndex, distance) {
  console.log(`${nodeIndex} ${distance}`);
}

// Output the calculated shortest distances for all nodes.
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
  outputNodeDistance(nodeIdx, minDistances[nodeIdx]);
}