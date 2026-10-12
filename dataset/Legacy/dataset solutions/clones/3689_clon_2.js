function ProcessInput(inputData) {
  // Split the input string into individual lines
  inputData = inputData.split("\n");

  // Parse the first line to get configuration parameters
  let configParams = inputData[0].split(" ").map(val => +val);

  // Extract graph dimensions and start nodes
  let edgeCount = configParams[1];
  let startNodeA = configParams[2] - 1; // Adjust to 0-indexed
  let startNodeB = configParams[3] - 1; // Adjust to 0-indexed
  let totalNodes = configParams[0];

  // Initialize arrays to store edge details
  let sourceNodes = [], targetNodes = [], weightsA = [], weightsB = [];

  // Loop through the remaining lines to populate edge data
  for (let idx = 0; idx < edgeCount; idx++) {
    let lineParts = inputData[idx + 1].split(" ").map(val => +val);
    sourceNodes[idx] = lineParts[0] - 1; // Adjust to 0-indexed
    targetNodes[idx] = lineParts[1] - 1; // Adjust to 0-indexed
    weightsA[idx] = lineParts[2];
    weightsB[idx] = lineParts[3];
  }

  // Calculate shortest paths from startNodeA using weightsA
  let distancesFromA = calculateShortestPaths(sourceNodes, targetNodes, weightsA, startNodeA, totalNodes);

  // Calculate shortest paths from startNodeB using weightsB
  let distancesFromB = calculateShortestPaths(sourceNodes, targetNodes, weightsB, startNodeB, totalNodes);

  // Initialize an array for final computed values
  let finalValues = [];
  let currentIdx = totalNodes - 1;

  // Calculate the value for the last node
  finalValues[currentIdx] = 1e15 - distancesFromA[currentIdx] - distancesFromB[currentIdx];

  // Iterate backwards to compute maximum values
  for (; currentIdx--;) {
    finalValues[currentIdx] = Math.max(finalValues[currentIdx + 1], 1e15 - distancesFromA[currentIdx] - distancesFromB[currentIdx]);
  }

  // Output the results, each on a new line
  console.log(finalValues.join("\n"));
}

/**
 * Computes shortest paths from a source node to all other nodes using Dijkstra's algorithm.
 * @param {number[]} edgeSources - Array of source nodes for each edge.
 * @param {number[]} edgeTargets - Array of target nodes for each edge.
 * @param {number[]} edgeWeights - Array of weights for each edge.
 * @param {number} initialNode - The starting node for path calculation (0-indexed).
 * @param {number} nodeCount - The total number of nodes in the graph.
 * @returns {number[]} An array containing the shortest distance from the initialNode to each other node.
 */
function calculateShortestPaths(edgeSources, edgeTargets, edgeWeights, initialNode, nodeCount) {
  // Initialize adjacency map (effectively an adjacency list represented as an array of objects)
  let adjacencyMap = Array(nodeCount).fill(0).map(() => Object.create(null)); // Using Object.create(null) for a cleaner map

  // Populate the adjacency map with edge weights (undirected graph)
  for (let edgeIndex = 0; edgeIndex < edgeSources.length; edgeIndex++) {
    adjacencyMap[edgeSources[edgeIndex]][edgeTargets[edgeIndex]] = adjacencyMap[edgeTargets[edgeIndex]][edgeSources[edgeIndex]] = edgeWeights[edgeIndex];
  }

  // Initialize shortest distances array with a very large number, set source to 0
  let shortestDistances = Array(nodeCount).fill(9e99);
  shortestDistances[initialNode] = 0;

  // Variables for tracking minimum distance and corresponding node
  let currentMinDistance = 9e999;
  let nodeWithMinDist;
  // Array to hold nodes that are candidates for processing (acts like a simplified priority queue)
  let unprocessedNodes = [];

  // Initialize unprocessedNodes with neighbors of the initial node
  for (let neighborNode in adjacencyMap[initialNode]) {
    unprocessedNodes.push(neighborNode);
    shortestDistances[neighborNode] = adjacencyMap[initialNode][neighborNode];
    // Find the neighbor with the smallest initial distance
    if (currentMinDistance > shortestDistances[neighborNode]) {
      currentMinDistance = shortestDistances[neighborNode];
      nodeWithMinDist = neighborNode;
    }
  }

  // Main loop for Dijkstra's algorithm
  while (unprocessedNodes.length > 0) {
    currentMinDistance = 9e999; // Reset min distance for current iteration
    let minNodeIndexInUnprocessed = -1;

    // Find the node with the smallest distance among unprocessed nodes
    for (let i = 0; i < unprocessedNodes.length; i++) {
      let candidateNode = unprocessedNodes[i];
      if (currentMinDistance > shortestDistances[candidateNode]) {
        currentMinDistance = shortestDistances[candidateNode];
        nodeWithMinDist = candidateNode;
        minNodeIndexInUnprocessed = i;
      }
    }

    // Remove the selected node from the unprocessed list
    // Note: This is an inefficient way to remove from an array, but preserves original logic.
    let extractedNode = unprocessedNodes[minNodeIndexInUnprocessed];
    unprocessedNodes = unprocessedNodes.slice(0, minNodeIndexInUnprocessed).concat(unprocessedNodes.slice(minNodeIndexInUnprocessed + 1));

    // Explore neighbors of the extracted node
    for (let neighbor in adjacencyMap[extractedNode]) {
      // If a shorter path to the neighbor is found
      if (shortestDistances[neighbor] > shortestDistances[extractedNode] + adjacencyMap[extractedNode][neighbor]) {
        // Add neighbor to unprocessed list if not already processed with a better path
        // (This logic implicitly handles adding if not present, and updating if better path found)
        unprocessedNodes.push(neighbor);
        shortestDistances[neighbor] = shortestDistances[extractedNode] + adjacencyMap[extractedNode][neighbor];
      }
    }
  }
  return shortestDistances;
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
