var rawData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk;
});
process.stdin.on('end', function() {
  executeProgram();
});

function executeProgram() {
  // Split the entire input into individual lines for processing.
  var inputLines = rawData.split('\n');

  // Parse the first line to get graph dimensions and initial water level.
  var firstLineParts = inputLines[0].split(' ');
  var nodeCount = parseInt(firstLineParts[0], 10); // Number of nodes (vertices)
  var edgeCount = parseInt(firstLineParts[1], 10); // Number of edges
  var initialWaterLevel = parseInt(firstLineParts[2], 10); // Starting water level

  var idxA, idxB; // Loop counters
  var nodeHeights = Array(nodeCount); // Array to store height of each node
  var adjList = Array(nodeCount); // Adjacency list for graph traversal
  var visitedStates = Array(nodeCount); // Stores visited states (time, height) for each node
  var processingQueue = []; // Stack for DFS-like traversal

  // Initialize node heights, adjacency list, and visited states.
  for (idxA = 0; idxA < nodeCount; idxA++) {
    nodeHeights[idxA] = parseInt(inputLines[idxA + 1], 10);
    adjList[idxA] = [];
    visitedStates[idxA] = [];
  }

  var lineParts, nodeU, nodeV, travelTime;
  var graphEdges = Array(edgeCount); // Array to store all edges for Bellman-Ford
  // Read and process edge information.
  for (idxA = 0; idxA < edgeCount; idxA++) {
    lineParts = inputLines[idxA + nodeCount + 1].split(' ');
    nodeU = parseInt(lineParts[0], 10) - 1; // Adjust to 0-indexed
    nodeV = parseInt(lineParts[1], 10) - 1; // Adjust to 0-indexed
    travelTime = parseInt(lineParts[2], 10);

    // Add edges to the adjacency list (undirected graph).
    adjList[nodeU].push({
      destination: nodeV,
      duration: travelTime
    });
    adjList[nodeV].push({
      destination: nodeU,
      duration: travelTime
    });
    // Store edges for Bellman-Ford algorithm.
    graphEdges[idxA] = [nodeU, nodeV, travelTime];
  }

  /**
   * Implements the Bellman-Ford algorithm to find shortest paths from a source vertex.
   * This version is adapted to consider node heights as a constraint.
   * @param {number} vertexCount - Total number of vertices in the graph.
   * @param {number} startVertex - The starting vertex for path calculation.
   * @param {Array<Array<number>>} allEdges - List of all edges [u, v, weight].
   * @returns {Array<number>} An array of shortest distances from the source to all other vertices.
   */
  function calculateShortestPaths(vertexCount, startVertex, allEdges) {
    var distances = Array(vertexCount);
    var loopIdx;
    // Initialize all distances to infinity, except for the source.
    for (loopIdx = 0; loopIdx < vertexCount; loopIdx++) {
      distances[loopIdx] = Infinity;
    }
    distances[startVertex] = 0;

    var hasUpdated = true; // Flag to track if any distance was updated in an iteration
    var vertexOne, vertexTwo, costValue;

    // Relax edges repeatedly until no more updates occur.
    // The loop runs at most (vertexCount - 1) times for standard Bellman-Ford,
    // but here it's a generic relaxation loop.
    while (hasUpdated) {
      hasUpdated = false; // Reset update flag for the current iteration
      for (loopIdx = 0; loopIdx < allEdges.length; loopIdx++) {
        vertexOne = allEdges[loopIdx][0];
        vertexTwo = allEdges[loopIdx][1];
        costValue = allEdges[loopIdx][2];

        // Check path from vertexOne to vertexTwo
        if (distances[vertexTwo] > distances[vertexOne] + costValue && nodeHeights[vertexTwo] >= costValue) {
          distances[vertexTwo] = distances[vertexOne] + costValue;
          hasUpdated = true;
        }
        // Check path from vertexTwo to vertexOne (for undirected edges)
        if (distances[vertexOne] > distances[vertexTwo] + costValue && nodeHeights[vertexOne] >= costValue) {
          distances[vertexOne] = distances[vertexTwo] + costValue;
          hasUpdated = true;
        }
      }
    }
    return distances;
  }

  // Calculate shortest paths from the destination node (n-1) to all other nodes.
  // This helps in pruning paths that are already too long.
  var minDistances = calculateShortestPaths(nodeCount, nodeCount - 1, graphEdges);

  // Initialize the processing queue with the starting state.
  processingQueue.push({
    currentVertex: 0,
    duration: 0,
    currentWaterLevel: initialWaterLevel
  });

  var minimumTime = Infinity; // Stores the minimum time found to reach the destination.

  // Record the initial state for the starting node.
  visitedStates[0].push({
    duration: 0,
    currentWaterLevel: initialWaterLevel
  });

  var currentPath, nextNodeIdx, edgeDetails, nextPathState;

  // Main loop for graph traversal (DFS-like with pruning and state management).
  while (processingQueue.length > 0) {
    // Pop the last element (DFS behavior).
    currentPath = processingQueue.pop();

    // Pruning: If the current path's estimated total time (current time + 2 * shortest path to end - current water level)
    // is already greater than or equal to the minimum time found so far, skip this path.
    // The `2 * minDistances` part is a heuristic, likely related to round trip or some specific problem constraint.
    if (currentPath.duration + minDistances[currentPath.currentVertex] * 2 - currentPath.currentWaterLevel >= minimumTime) {
      continue;
    }

    // Explore neighbors of the current node.
    for (idxA = 0; idxA < adjList[currentPath.currentVertex].length; idxA++) {
      edgeDetails = adjList[currentPath.currentVertex][idxA];
      nextNodeIdx = edgeDetails.destination;

      // Constraint: Cannot traverse an edge if the current node's height is less than the edge's travel time.
      if (nodeHeights[currentPath.currentVertex] < edgeDetails.duration) {
        continue;
      }

      // Calculate the new state (time and water level) after traversing the edge.
      if (nodeHeights[nextNodeIdx] + edgeDetails.duration < currentPath.currentWaterLevel) {
        // Case 1: Water level drops significantly.
        nextPathState = {
          currentVertex: nextNodeIdx,
          duration: currentPath.duration + edgeDetails.duration + currentPath.currentWaterLevel - (nodeHeights[nextNodeIdx] + edgeDetails.duration),
          currentWaterLevel: nodeHeights[nextNodeIdx]
        };
      } else if (nodeHeights[nextNodeIdx] + edgeDetails.duration >= currentPath.currentWaterLevel && currentPath.currentWaterLevel >= edgeDetails.duration) {
        // Case 2: Water level drops by the travel time.
        nextPathState = {
          currentVertex: nextNodeIdx,
          duration: currentPath.duration + edgeDetails.duration,
          currentWaterLevel: currentPath.currentWaterLevel - edgeDetails.duration
        };
      } else {
        // Case 3: Water level drops below zero, effectively becoming zero.
        nextPathState = {
          currentVertex: nextNodeIdx,
          duration: currentPath.duration + edgeDetails.duration + edgeDetails.duration - currentPath.currentWaterLevel,
          currentWaterLevel: 0
        };
      }

      // If the next node is the destination node (n-1).
      if (nextNodeIdx === nodeCount - 1) {
        // Update the minimum time found to reach the destination.
        // The final adjustment `nodeHeights[nodeCount - 1] - nextPathState.currentWaterLevel`
        // seems to account for the remaining water level at the destination.
        minimumTime = Math.min(minimumTime, nextPathState.duration + nodeHeights[nodeCount - 1] - nextPathState.currentWaterLevel);
      } else {
        // If not the destination, check if this new state is better than any previously visited state for this node.
        // A state is considered "better" if it has a lower duration AND a higher or equal water level.
        // The `some` method checks if any existing state makes the current one redundant.
        if (!visitedStates[nextNodeIdx].some(function(pastState) {
            return pastState.duration < nextPathState.duration && pastState.currentWaterLevel >= nextPathState.currentWaterLevel;
          })) {
          // If this state is not redundant, add it to visited states and the processing queue.
          visitedStates[nextNodeIdx].push({
            duration: nextPathState.duration,
            currentWaterLevel: nextPathState.currentWaterLevel
          });
          processingQueue.push(nextPathState);
        }
      }
    }

    // Sort the stack to prioritize paths with higher duration (for DFS-like behavior, or specific heuristic).
    // This sort makes it more like a priority queue if we were always taking the "best" (e.g., lowest time)
    // but here it's sorting by highest duration, which is unusual for shortest path.
    // It might be a specific heuristic for this problem.
    processingQueue.sort(function(pathA, pathB) {
      return pathB.duration - pathA.duration;
    });
  }

  // Output the result.
  if (minimumTime === Infinity) {
    console.log(-1); // No path found
  } else {
    console.log(minimumTime); // The minimum time to reach the destination
  }
}
