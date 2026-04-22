const processGraphData = (rawDataInput) => {
  // Ensure input is a string, then split into individual lines.
  const inputLines = String(rawDataInput).split("\n");

  // Basic validation: check if there's enough data.
  // We expect at least one config line and potentially many edge lines.
  if (inputLines.length < 2) {
    console.error("Insufficient input data provided. Expected at least 2 lines.");
    return;
  }

  // Parse the first line containing N, M, Q, T values.
  // These represent: total vertices, edge count, starting node for path A, starting node for path B.
  const graphConfiguration = inputLines[0].split(" ").map(Number);

  // Validate the number of configuration parameters.
  if (graphConfiguration.length < 4) {
    console.error("Invalid configuration line. Expected N M Q T.");
    return;
  }

  // Extract configuration parameters, adjusting to 0-indexed values for node IDs.
  const totalVertices = graphConfiguration[0];
  const numEdges = graphConfiguration[1];
  const initialNodeForPathA = graphConfiguration[2] - 1; // Q (0-indexed)
  const initialNodeForPathB = graphConfiguration[3] - 1; // T (0-indexed)

  // Further validation for node indices.
  if (initialNodeForPathA < 0 || initialNodeForPathA >= totalVertices ||
      initialNodeForPathB < 0 || initialNodeForPathB >= totalVertices) {
      console.error("Invalid start node index. Must be within [1, N].");
      return;
  }

  // Arrays to store edge information: source nodes, destination nodes, and two sets of weights.
  const edgeSources = [];
  const edgeDestinations = [];
  const weightsSetAlpha = [];
  const weightsSetBeta = [];

  // Loop through subsequent lines to parse edge data.
  // Each line defines an edge: U V A B
  for (let edgeIndex = 0; edgeIndex < numEdges; ++edgeIndex) {
    // Ensure there are enough lines for edges.
    if (edgeIndex + 1 >= inputLines.length) {
        console.error(`Missing edge data for edge ${edgeIndex + 1}.`);
        return;
    }
    const currentEdgeInfo = inputLines[edgeIndex + 1].split(" ").map(Number);

    // Validate the number of edge parameters.
    if (currentEdgeInfo.length < 4) {
        console.error(`Invalid edge data on line ${edgeIndex + 2}. Expected U V A B.`);
        return;
    }

    edgeSources[edgeIndex] = currentEdgeInfo[0] - 1;       // U (0-indexed)
    edgeDestinations[edgeIndex] = currentEdgeInfo[1] - 1;    // V (0-indexed)
    weightsSetAlpha[edgeIndex] = currentEdgeInfo[2];       // Weight A
    weightsSetBeta[edgeIndex] = currentEdgeInfo[3];        // Weight B
  }

  // Define a constant for a sufficiently large reward value.
  // This value is used to calculate the 'e' array elements.
  const MAX_POSSIBLE_REWARD = 1e15; // A very large number

  // Calculate shortest paths from initialNodeForPathA using weightsSetAlpha.
  const pathDistancesFromA = calculateShortestPaths(
    edgeSources,
    edgeDestinations,
    weightsSetAlpha,
    initialNodeForPathA,
    totalVertices
  );

  // Calculate shortest paths from initialNodeForPathB using weightsSetBeta.
  const pathDistancesFromB = calculateShortestPaths(
    edgeSources,
    edgeDestinations,
    weightsSetBeta,
    initialNodeForPathB,
    totalVertices
  );

  // Array to store the final maximized values for each vertex.
  const finalOptimizedValues = new Array(totalVertices);

  // Initialize the last element of the optimized values array.
  // This value is based on the reward minus the sum of shortest paths from A and B to this node.
  let currentVertexIndex = totalVertices - 1;
  finalOptimizedValues[currentVertexIndex] =
    MAX_POSSIBLE_REWARD -
    pathDistancesFromA[currentVertexIndex] -
    pathDistancesFromB[currentVertexIndex];

  // Iterate backwards from the second-to-last vertex to the first.
  // Each element is the maximum of itself or the next element in the array.
  // This forms a suffix maximum array.
  for (
    --currentVertexIndex;
    currentVertexIndex >= 0;
    --currentVertexIndex
  ) {
    const currentValueForNode =
      MAX_POSSIBLE_REWARD -
      pathDistancesFromA[currentVertexIndex] -
      pathDistancesFromB[currentVertexIndex];
    finalOptimizedValues[currentVertexIndex] = Math.max(
      finalOptimizedValues[currentVertexIndex + 1],
      currentValueForNode
    );
  }

  // Output the final optimized values, each on a new line.
  console.log(finalOptimizedValues.join("\n"));
};

const calculateShortestPaths = (
  edgeSources,
  edgeDestinations,
  edgeWeights,
  startVertex,
  totalVertices
) => {
  // Define 'Infinity' for distances, matching the original's use of very large numbers.
  const INFINITY_DISTANCE = Infinity;

  // Adjacency list representation of the graph.
  // Each element `graph[node]` will be an object mapping neighbor nodes to edge weights.
  const graphAdjacencyMap = Array(totalVertices)
    .fill(null)
    .map(() => ({}));

  // Populate the adjacency map using the provided edge data.
  // This assumes an undirected graph (edge U-V has same weight as V-U).
  for (let k = 0; k < edgeSources.length; ++k) {
    const src = edgeSources[k];
    const dest = edgeDestinations[k];
    const weight = edgeWeights[k];
    graphAdjacencyMap[src][dest] = weight;
    graphAdjacencyMap[dest][src] = weight;
  }

  // Array to store the shortest distances from the startVertex to all other vertices.
  // Initialize all distances to infinity, except for the startVertex itself (distance 0).
  const shortestDistances = Array(totalVertices).fill(INFINITY_DISTANCE);
  shortestDistances[startVertex] = 0;

  // A set of nodes that have already been processed (their shortest distance finalized).
  const processedVertices = new Set();

  // A simple array acting as a min-priority queue (not optimized, but matches original logic's spirit).
  // It stores nodes that are candidates for being processed next.
  const candidateNodes = [startVertex];

  // Main loop of the Dijkstra-like algorithm. Continues as long as there are candidate nodes.
  while (candidateNodes.length > 0) {
    let currentMinDist = INFINITY_DISTANCE;
    let currentMinNodeIdxInCandidates = -1; // Index within the candidateNodes array
    let nodeToProcess = -1; // The actual node ID

    // Find the node with the smallest known distance among the candidate nodes.
    // This is the least efficient part of a simple array-based "priority queue".
    for (let i = 0; i < candidateNodes.length; ++i) {
      const candidateNodeId = candidateNodes[i];
      // Only consider nodes not yet processed and with a smaller distance.
      if (!processedVertices.has(candidateNodeId) && shortestDistances[candidateNodeId] < currentMinDist) {
        currentMinDist = shortestDistances[candidateNodeId];
        currentMinNodeIdxInCandidates = i;
        nodeToProcess = candidateNodeId;
      }
    }

    // If no valid node was found (e.g., all remaining candidates are already processed or unreachable), break.
    if (nodeToProcess === -1) {
        break;
    }

    // Remove the selected node from the candidate list.
    // Using splice is more efficient than slice().concat() for removal.
    candidateNodes.splice(currentMinNodeIdxInCandidates, 1);

    // Mark the current node as processed.
    processedVertices.add(nodeToProcess);

    // If the current node's distance is still infinity, it means it's unreachable,
    // so no further relaxation from it is possible.
    if (shortestDistances[nodeToProcess] === INFINITY_DISTANCE) {
        continue;
    }

    // Iterate over all neighbors of the currently processed node.
    for (const neighborNodeStr in graphAdjacencyMap[nodeToProcess]) {
      const neighborNode = parseInt(neighborNodeStr, 10); // Convert string key to number

      // If the neighbor has already been processed, skip it.
      if (processedVertices.has(neighborNode)) {
        continue;
      }

      const edgeWeight = graphAdjacencyMap[nodeToProcess][neighborNode];
      const newDistance = shortestDistances[nodeToProcess] + edgeWeight;

      // If a shorter path to the neighbor is found, update its distance.
      if (newDistance < shortestDistances[neighborNode]) {
        shortestDistances[neighborNode] = newDistance;
        // Add the neighbor to the candidate list if it's not already there.
        // A more robust Dijkstra would use a true priority queue and update/decrease-key.
        // This simplified approach adds duplicates but the 'processedVertices' check handles it.
        if (!candidateNodes.includes(neighborNode)) { // Guard against adding duplicates to a simple array
            candidateNodes.push(neighborNode);
        }
      }
    }
  }
  return shortestDistances;
};

// Execute the main processing function with input from standard I/O.
// This part remains outside the function definition but is part of the overall script.
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));