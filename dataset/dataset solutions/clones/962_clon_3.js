const processingOptions = {
  sourcePath: '/dev/stdin',
  lineSeparator: '\n',
  encoding: 'ascii'
};

const parseInteger = (str) => {
  const num = parseInt(str, 10);
  if (isNaN(num)) {
    console.error(`Warning: Attempted to parse non-numeric value "${str}". Defaulting to 0.`);
    return 0;
  }
  return num;
};

const rawGraphData = require('fs').readFileSync(processingOptions.sourcePath, processingOptions.encoding)
  .toString()
  .trim()
  .split(processingOptions.lineSeparator);

const initialVertexCountStr = rawGraphData.shift();
const numVertices = parseInteger(initialVertexCountStr);

if (numVertices <= 0 || isNaN(numVertices)) {
  console.error("Critical Error: Invalid or non-positive number of vertices provided. Exiting.");
  process.exit(1);
}

const adjacencyMap = Object.create(null);

const establishEdge = (graphStructure, originNode, targetNode, edgeWeight) => {
  if (originNode < 0 || originNode >= numVertices || targetNode < 0 || targetNode >= numVertices) {
    console.warn(`Skipping invalid edge: Node index out of bounds [0, ${numVertices - 1}] for (${originNode}, ${targetNode}).`);
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(graphStructure, originNode)) {
    graphStructure[originNode] = Object.create(null);
  }
  graphStructure[originNode][targetNode] = edgeWeight;
};

rawGraphData.forEach((currentLine, lineIdx) => {
  const trimmedLine = currentLine.trim();
  if (!trimmedLine) {
    return; // Skip empty lines
  }

  const currentLineValues = trimmedLine.split(' ').map(parseInteger);

  if (currentLineValues.length < 1) {
    console.warn(`Line ${lineIdx + 2}: Malformed line (expected at least node identifier). Skipping.`);
    return;
  }

  const currentNodeIdentifier = currentLineValues[0];

  for (let segmentIndex = 2; segmentIndex < currentLineValues.length; segmentIndex += 2) {
    if (segmentIndex + 1 >= currentLineValues.length) {
      console.warn(`Line ${lineIdx + 2}: Incomplete edge definition (missing weight). Skipping.`);
      break;
    }
    const destinationNode = currentLineValues[segmentIndex];
    const connectionWeight = currentLineValues[segmentIndex + 1];
    establishEdge(adjacencyMap, currentNodeIdentifier, destinationNode, connectionWeight);
  }
});

const shortestDistances = Array(numVertices).fill(Number.POSITIVE_INFINITY);
const predecessorNodes = Array(numVertices).fill(null); // Used for path reconstruction, not directly outputted here.

const resetPathData = (startVertex) => {
  if (startVertex < 0 || startVertex >= numVertices) {
    console.error(`Critical Error: Start vertex ${startVertex} is outside valid range [0, ${numVertices - 1}]. Exiting.`);
    process.exit(1);
  }

  for (let vtxIdx = 0; vtxIdx < numVertices; vtxIdx++) {
    shortestDistances[vtxIdx] = Number.POSITIVE_INFINITY;
    predecessorNodes[vtxIdx] = null;
  }
  shortestDistances[startVertex] = 0;
};

const attemptRelaxation = (srcVtx, destVtx, weightVal) => {
  if (shortestDistances[srcVtx] === Number.POSITIVE_INFINITY) {
    return; // Cannot relax from an unreachable node
  }

  const newPotentialDistance = shortestDistances[srcVtx] + weightVal;

  if (shortestDistances[destVtx] > newPotentialDistance) {
    shortestDistances[destVtx] = newPotentialDistance;
    predecessorNodes[destVtx] = srcVtx;
  }
};

const calculateShortestPathsBF = (graphAdjList, sourceVertex) => {
  if (sourceVertex < 0 || sourceVertex >= numVertices) {
    console.error(`Error: Provided source vertex ${sourceVertex} is invalid.`);
    return false;
  }

  resetPathData(sourceVertex);

  // Perform V-1 iterations to propagate shortest path distances.
  // In each iteration, we try to relax all edges.
  for (let iterationCount = 1; iterationCount < numVertices; iterationCount++) {
    let anyRelaxationOccurredInPass = false;

    // Iterate over all possible source nodes in the graph.
    // Using Object.keys ensures we only iterate over nodes that actually have outgoing edges.
    Object.keys(graphAdjList).forEach(currentSourceNodeKey => {
      const currentSource = parseInteger(currentSourceNodeKey);

      // Iterate over all outgoing edges from the current source node.
      Object.keys(graphAdjList[currentSource]).forEach(currentDestNodeKey => {
        const currentDestination = parseInteger(currentDestNodeKey);
        const edgeWeight = graphAdjList[currentSource][currentDestination];

        const oldDistanceToDestination = shortestDistances[currentDestination];
        attemptRelaxation(currentSource, currentDestination, edgeWeight);

        // Check if the distance to currentDestination was updated.
        if (shortestDistances[currentDestination] < oldDistanceToDestination) {
          anyRelaxationOccurredInPass = true;
        }
      });
    });

    // Optimization: If no distances were updated in a full pass,
    // all shortest paths have been found, so we can exit early.
    if (!anyRelaxationOccurredInPass) {
      break;
    }
  }

  // After V-1 passes, perform a V-th pass to detect negative cycles.
  // If any edge can still be relaxed, it indicates a negative cycle reachable from the source.
  let hasNegativeCycle = false;
  Object.keys(graphAdjList).forEach(currentSourceNodeKey => {
    const currentSource = parseInteger(currentSourceNodeKey);
    Object.keys(graphAdjList[currentSource]).forEach(currentDestNodeKey => {
      const currentDestination = parseInteger(currentDestNodeKey);
      const edgeWeight = graphAdjList[currentSource][currentDestination];

      // A negative cycle exists if we can still relax an edge.
      // Also, ensure the source of the edge is reachable, otherwise it's not a reachable negative cycle.
      if (shortestDistances[currentSource] !== Number.POSITIVE_INFINITY &&
          shortestDistances[currentDestination] > shortestDistances[currentSource] + edgeWeight) {
        hasNegativeCycle = true;
      }
    });
  });

  return !hasNegativeCycle; // Returns true if no negative cycle, false otherwise.
};

const graphValidity = calculateShortestPathsBF(adjacencyMap, 0);

if (!graphValidity) {
  console.log("Error: A negative cycle was detected in the graph reachable from the source.");
} else {
  shortestDistances.forEach((distanceValue, vertexIndex) => {
    const displayDistance = distanceValue === Number.POSITIVE_INFINITY ? "INF" : distanceValue;
    console.log(`${vertexIndex} ${displayDistance}`);
  });
}

// The 'predecessorNodes' array holds information for path reconstruction,
// but its contents are not printed as part of the problem's output requirements.