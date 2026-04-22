// This section handles asynchronous input reading from standard input.
// The raw data is accumulated in a buffer and processed once all input is received.
var rawDataBuffer = '';

// Resume the standard input stream to listen for data.
process.stdin.resume();

// Set the encoding for the input data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
// Each chunk is appended to the rawDataBuffer.
process.stdin.on('data', function(dataChunk) {
  rawDataBuffer += dataChunk;
});

// Event listener for the end of the input stream.
// Once all data is received, the primary processing function is invoked.
process.stdin.on('end', function() {
  // Execute the main graph processing logic.
  initiateGraphTraversal();
});

/**
 * Parses an integer from a string, ensuring it's a valid number.
 * Returns the parsed integer or NaN if the input is not a valid number.
 * @param {string} strValue - The string to parse.
 * @returns {number} The parsed integer.
 */
function safeParseInteger(strValue) {
  const parsed = Number(strValue);
  if (isNaN(parsed)) {
    // In a production system, this might throw an error or log more verbosely.
    // For this context, returning NaN allows subsequent checks to fail gracefully.
    console.error(`Warning: Could not parse "${strValue}" as a valid number.`);
  }
  return parsed;
}

/**
 * Represents a specific state within the pathfinding algorithm.
 * @typedef {object} PathState
 * @property {number} nodeId - The identifier of the current graph node.
 * @property {number} accumulatedTime - The total time elapsed to reach this state.
 * @property {number} currentWaterLevel - The current water level (resource) at this node.
 */

/**
 * Represents a connection (edge) from one node to another in the graph.
 * @typedef {object} GraphEdge
 * @property {number} neighborNodeId - The identifier of the connected node.
 * @property {number} traversalCost - The cost (time) required to traverse this edge.
 */

/**
 * The primary function responsible for orchestrating the graph problem solution.
 * It handles input parsing, graph construction, and the main search algorithm.
 */
function initiateGraphTraversal() {
  const inputLinesArray = rawDataBuffer.split('\n');

  // Guard clause: Ensure there's sufficient input data.
  if (inputLinesArray.length === 0 || inputLinesArray[0].trim() === '') {
    console.error("Error: Input data is empty or malformed. Cannot proceed.");
    return;
  }

  // Parse global graph parameters from the very first line of input.
  const firstLineParams = inputLinesArray[0].split(' ');
  const numNodes = safeParseInteger(firstLineParams[0]);
  const numEdges = safeParseInteger(firstLineParams[1]);
  const initialWaterLevel = safeParseInteger(firstLineParams[2]);

  // Validate critical graph parameters.
  if (isNaN(numNodes) || isNaN(numEdges) || isNaN(initialWaterLevel) || numNodes <= 0 || numEdges < 0) {
      console.error("Error: Invalid graph dimensions or initial water level detected. Aborting.");
      return;
  }

  // Declare variables for loop control and node/edge processing.
  let iterationCounter;
  let fromNodeIdentifier, toNodeIdentifier, edgeTraversalCost;

  // `nodeElevations`: An array storing the elevation or height associated with each node.
  // Indexed by node ID (0 to numNodes-1).
  const nodeElevations = new Array(numNodes);

  // `adjacencyList`: Represents the graph using an adjacency list.
  // Each element `adjacencyList[k]` is an array of `GraphEdge` objects
  // representing connections from node `k`.
  const adjacencyList = Array.from({ length: numNodes }, () => []);

  // `visitedStatesHistory`: Stores records of visited states for each node.
  // Used to prune redundant paths during the search, preventing cycles and inefficient re-exploration.
  // Each `visitedStatesHistory[k]` is an array of `{ accumulatedTime, currentWaterLevel }` for node `k`.
  const visitedStatesHistory = Array.from({ length: numNodes }, () => []);

  // Populate node elevations from the input lines.
  // Node elevations are typically found on lines immediately following the parameter line.
  for (iterationCounter = 0; iterationCounter < numNodes; iterationCounter++) {
    const elevationLine = inputLinesArray[iterationCounter + 1];
    nodeElevations[iterationCounter] = safeParseInteger(elevationLine);
  }

  // `allGraphEdges`: A flat list of all edges, primarily used by the Bellman-Ford algorithm.
  // Each element is an array `[sourceNode, destinationNode, weight]`.
  const allGraphEdges = [];

  // Parse edge data and construct both the adjacency list and the flat edge list.
  // Edge data lines follow the node elevation lines.
  for (iterationCounter = 0; iterationCounter < numEdges; iterationCounter++) {
     const currentEdgeDataLine = inputLinesArray[iterationCounter + numNodes + 1];
     const currentEdgeParts = currentEdgeDataLine.split(' ');

     fromNodeIdentifier = safeParseInteger(currentEdgeParts[0]) - 1; // Convert to 0-based index
     toNodeIdentifier = safeParseInteger(currentEdgeParts[1]) - 1;   // Convert to 0-based index
     edgeTraversalCost = safeParseInteger(currentEdgeParts[2]);

     // Add edges to the adjacency list for both directions (undirected graph).
     adjacencyList[fromNodeIdentifier].push({
       neighborNodeId: toNodeIdentifier,
       traversalCost: edgeTraversalCost
     });
     adjacencyList[toNodeIdentifier].push({
       neighborNodeId: fromNodeIdentifier,
       traversalCost: edgeTraversalCost
     });

     // Store the edge in the flat list for Bellman-Ford.
     allGraphEdges.push([fromNodeIdentifier, toNodeIdentifier, edgeTraversalCost]);
  }


  /**
   * Computes shortest path distances from a specified starting vertex to all other vertices
   * using a variant of the Bellman-Ford algorithm. This version incorporates a constraint
   * related to `nodeElevations` for valid edge traversal.
   * @param {number} totalVertices - The total count of vertices in the graph.
   * @param {number} startingVertex - The 0-based index of the source vertex.
   * @param {Array<Array<number>>} graphEdges - A list of edges, each as `[u, v, weight]`.
   * @returns {Array<number>} An array where `distances[k]` is the shortest path from `startingVertex` to node `k`.
   */
  function calculateConstrainedShortestPathsBF(totalVertices, startingVertex, graphEdges) {
    // Initialize all distances to positive infinity, except for the source which is 0.
    const distances = new Array(totalVertices).fill(Number.POSITIVE_INFINITY);
    distances[startingVertex] = 0;

    let didUpdateInPass; // Flag to track if any distance improved during an iteration pass.
    let currentPassCount = 0;
    // Maximum iterations for Bellman-Ford, acts as a safeguard against infinite loops
    // in graphs with negative cycles (though problem constraints usually avoid this).
    const MAX_BF_ITERATIONS = totalVertices * 2;

    // The Bellman-Ford loop continues as long as distances are being updated
    // and the maximum number of passes has not been exceeded.
    do {
      didUpdateInPass = false;
      for (let edgeIndex = 0; edgeIndex < graphEdges.length; edgeIndex++) {
        const [uNode, vNode, edgeWeight] = graphEdges[edgeIndex];

        // Attempt to relax edge (uNode -> vNode).
        // A path is considered valid only if the destination node's elevation
        // is at least as high as the edge's traversal cost.
        if (distances[uNode] !== Number.POSITIVE_INFINITY &&
            distances[vNode] > distances[uNode] + edgeWeight &&
            nodeElevations[vNode] >= edgeWeight) { // Custom constraint
          distances[vNode] = distances[uNode] + edgeWeight;
          didUpdateInPass = true;
        }
        // Attempt to relax edge (vNode -> uNode) for undirected graph behavior.
        if (distances[vNode] !== Number.POSITIVE_INFINITY &&
            distances[uNode] > distances[vNode] + edgeWeight &&
            nodeElevations[uNode] >= edgeWeight) { // Custom constraint
          distances[uNode] = distances[vNode] + edgeWeight;
          didUpdateInPass = true;
        }
      }
      currentPassCount++;
    } while (didUpdateInPass && currentPassCount < MAX_BF_ITERATIONS);

    return distances;
  }

  // Calculate shortest path distances from the designated target node (`numNodes - 1`)
  // to all other nodes. This is a crucial preprocessing step used for A*-like heuristic pruning.
  const targetNodeId = numNodes - 1;
  const shortestTimesToTarget = calculateConstrainedShortestPathsBF(numNodes, targetNodeId, allGraphEdges);

  // `explorationFrontier`: This array acts as a priority queue for states to be explored.
  // It stores `PathState` objects and is sorted to always process the state with the minimum accumulated time.
  const explorationFrontier = [];
  const startNodeId = 0;

  // Initialize the search with the starting state.
  const initialPathState = {
    nodeId: startNodeId,
    accumulatedTime: 0,
    currentWaterLevel: initialWaterLevel
  };
  explorationFrontier.push(initialPathState);

  // Record the initial state in the history for the starting node.
  // This prevents re-exploring less optimal paths to the start node.
  visitedStatesHistory[startNodeId].push({
    accumulatedTime: 0,
    currentWaterLevel: initialWaterLevel
  });

  // `minimumJourneyTime`: Stores the best (minimum) time found to reach the target node so far.
  // Initialized to positive infinity as no path has been found yet.
  let minimumJourneyTime = Number.POSITIVE_INFINITY;

  // Main search loop: continues as long as there are states awaiting exploration.
  while (explorationFrontier.length > 0) {
    // Sort the frontier to bring the state with the minimum `accumulatedTime` to the end.
    // The original code sorts in descending order of `t` and then `pop()`s,
    // which effectively retrieves the state with the *minimum* `t` from the end of the sorted array.
    explorationFrontier.sort(function (stateA, stateB) {
      return stateB.accumulatedTime - stateA.accumulatedTime;
    });
    const currentPathState = explorationFrontier.pop(); // Get the state with the lowest accumulated time.

    // Heuristic pruning: If the estimated total time to reach the target from `currentPathState`
    // is already greater than or equal to the best `minimumJourneyTime` found,
    // then this path is unlikely to yield a better solution, so it's pruned.
    // The `* 2` and `- currentWaterLevel` terms are specific to the problem's cost model.
    const estimatedTotalTime = currentPathState.accumulatedTime + shortestTimesToTarget[currentPathState.nodeId] * 2 - currentPathState.currentWaterLevel;
    if (estimatedTotalTime >= minimumJourneyTime) {
      continue; // Skip processing this state.
    }

    // Iterate through all neighbors connected to the `currentPathState.nodeId`.
    for (iterationCounter = 0; iterationCounter < adjacencyList[currentPathState.nodeId].length; iterationCounter++) {
      const edgeToNeighbor = adjacencyList[currentPathState.nodeId][iterationCounter];
      const nextNodeIdentifier = edgeToNeighbor.neighborNodeId;
      const edgeCost = edgeToNeighbor.traversalCost;

      // Critical constraint: The current node's elevation must be at least the edge's cost.
      if (nodeElevations[currentPathState.nodeId] < edgeCost) {
        continue; // This edge cannot be traversed from the current node under this condition.
      }

      let nextStateCandidate; // Placeholder for the new state after traversing the edge.

      // Calculate the `nextStateCandidate` based on complex water level dynamics,
      // which vary depending on the relationship between current water level,
      // destination elevation, and edge cost.
      if (nodeElevations[nextNodeIdentifier] + edgeCost < currentPathState.currentWaterLevel) {
        // Scenario 1: Destination node's elevation plus edge cost is less than current water level.
        // Water level drops to the destination elevation, and the "extra" water is consumed,
        // increasing the accumulated time.
        nextStateCandidate = {
          nodeId: nextNodeIdentifier,
          accumulatedTime: currentPathState.accumulatedTime + edgeCost + currentPathState.currentWaterLevel - (nodeElevations[nextNodeIdentifier] + edgeCost),
          currentWaterLevel: nodeElevations[nextNodeIdentifier]
        };
      } else if (nodeElevations[nextNodeIdentifier] + edgeCost >= currentPathState.currentWaterLevel && currentPathState.currentWaterLevel >= edgeCost) {
        // Scenario 2: Destination elevation plus edge cost is greater than or equal to current water level,
        // AND the current water level is sufficient to cover the edge cost.
        // Water level simply decreases by the edge cost.
        nextStateCandidate = {
          nodeId: nextNodeIdentifier,
          accumulatedTime: currentPathState.accumulatedTime + edgeCost,
          currentWaterLevel: currentPathState.currentWaterLevel - edgeCost
        };
      } else {
        // Scenario 3: Current water level is less than the edge cost.
        // This implies the water level drops to zero, and additional time is incurred
        // beyond the direct edge cost.
        nextStateCandidate = {
          nodeId: nextNodeIdentifier,
          accumulatedTime: currentPathState.accumulatedTime + edgeCost + edgeCost - currentPathState.currentWaterLevel,
          currentWaterLevel: 0
        };
      }

      // If the `nextNodeIdentifier` is the target node, update the best found time.
      if (nextNodeIdentifier === targetNodeId) {
        // The final path cost involves the target node's elevation and the remaining water.
        minimumJourneyTime = Math.min(minimumJourneyTime, nextStateCandidate.accumulatedTime + nodeElevations[targetNodeId] - nextStateCandidate.currentWaterLevel);
      } else {
        // For non-target nodes, check if this new state offers an improvement over
        // any previously recorded states for `nextNodeIdentifier`.
        const isRedundantPath = visitedStatesHistory[nextNodeIdentifier].some(function (pastRecord) {
          // A path is considered redundant (and thus pruned) if we've already reached `nextNodeIdentifier`
          // with an `accumulatedTime` that is less than or equal to the `nextStateCandidate`'s time,
          // AND with a `currentWaterLevel` that is greater than or equal to `nextStateCandidate`'s level.
          return pastRecord.accumulatedTime <= nextStateCandidate.accumulatedTime && pastRecord.currentWaterLevel >= nextStateCandidate.currentWaterLevel;
        });

        // If this is a novel or superior path to `nextNodeIdentifier`,
        // record it and add it to the exploration frontier.
        if (!isRedundantPath) {
          visitedStatesHistory[nextNodeIdentifier].push({
            accumulatedTime: nextStateCandidate.accumulatedTime,
            currentWaterLevel: nextStateCandidate.currentWaterLevel
          });
          explorationFrontier.push(nextStateCandidate);
        }
      }
    }
  }

  // Final output: Print the minimum journey time or -1 if no path was found.
  if (minimumJourneyTime === Number.POSITIVE_INFINITY) {
    console.log(-1); // Indicates that the target node is unreachable.
  } else {
    console.log(minimumJourneyTime);
  }
}