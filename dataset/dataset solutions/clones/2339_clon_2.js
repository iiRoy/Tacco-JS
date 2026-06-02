'use strict'; // Enforce strict mode for cleaner code practices

/**
 * Processes the input data to find a specific maximum distance in a graph.
 * This function simulates a graph traversal problem.
 *
 * @param {string} rawData - The raw input string, typically from stdin.
 */
function ProcessInput(rawData) {
  // Clean and parse the initial input lines
  const processedLines = rawData.trim().split('\n');

  // Extract N, u, v from the first line
  const initialParameters = processedLines[0].split(' ').map(strVal => parseInt(strVal, 10));
  const nodeCount = initialParameters[0]; // Total number of nodes in the graph
  const startNodeA = initialParameters[1]; // Starting node for the first DFS traversal
  const startNodeB = initialParameters[2]; // Starting node for the second DFS traversal

  // Get the remaining lines which describe the edges
  const edgeDescriptions = processedLines.slice(1);

  // Parse edge descriptions into an array of [node1, node2] pairs
  const edgePairs = edgeDescriptions.map(lineStr => {
    return lineStr.split(' ').map(numStr => parseInt(numStr, 10));
  });

  // Initialize an adjacency list to represent the graph
  // Keys are node identifiers, values are arrays of connected nodes.
  var adjacencyList = {};

  // Populate the adjacency list based on the edge pairs
  for (var edgeIndex = 0; edgeIndex < nodeCount - 1; ++edgeIndex) {
    var currentEdge = edgePairs[edgeIndex];
    var nodeOne = currentEdge[0];
    var nodeTwo = currentEdge[1];

    // Ensure arrays exist for both nodes in the adjacency list
    if (!adjacencyList[nodeOne]) adjacencyList[nodeOne] = [];
    if (!adjacencyList[nodeTwo]) adjacencyList[nodeTwo] = [];

    // Add bidirectional connections
    adjacencyList[nodeOne].push(nodeTwo);
    adjacencyList[nodeTwo].push(nodeOne);
  }

  // Initialize distance arrays for both starting nodes
  // Array size is nodeCount + 1 to accommodate 1-indexed nodes
  var distancesFromA = Array(nodeCount + 1);
  distancesFromA.fill(0); // Initialize all distances to zero

  var distancesFromB = Array(nodeCount + 1);
  distancesFromB.fill(0); // Initialize all distances to zero

  /**
   * Performs a Depth-First Search (DFS) to calculate distances from a starting node.
   *
   * @param {number} currentNode - The current node being visited.
   * @param {number} parentNode - The node from which `currentNode` was visited (to avoid going back).
   * @param {number} currentDepth - The distance from the DFS starting point to `currentNode`.
   * @param {number[]} distanceArray - The array to store calculated distances.
   */
  const calculateDistances = (currentNode, parentNode, currentDepth, distanceArray) => {
    distanceArray[currentNode] = currentDepth; // Record the distance for the current node

    // Iterate over neighbors of the current node
    for (var neighborIndex in adjacencyList[currentNode]) {
      // Convert the string key from 'for...in' to an integer node identifier
      var nextNode = parseInt(adjacencyList[currentNode][neighborIndex], 10);

      // If the neighbor is not the parent node (avoid backtracking immediately)
      if (nextNode !== parentNode) {
        // Recursively call DFS for the neighbor, incrementing depth
        calculateDistances(nextNode, currentNode, currentDepth + 1, distanceArray);
      }
    }
  };

  // Run DFS from startNodeA to populate distancesFromA
  calculateDistances(startNodeA, -1, 0, distancesFromA); // -1 indicates no parent for the starting node

  // Run DFS from startNodeB to populate distancesFromB
  calculateDistances(startNodeB, -1, 0, distancesFromB); // -1 indicates no parent for the starting node

  // Determine the maximum distance for nodes where A is closer than B
  var maximumDistance = 0;
  for (var nodeIdentifier = 0; nodeIdentifier < nodeCount + 1; ++nodeIdentifier) {
    // If the distance from A to the current node is less than the distance from B
    if (distancesFromA[nodeIdentifier] < distancesFromB[nodeIdentifier]) {
      // Update the maximum distance found so far
      maximumDistance = Math.max(maximumDistance, distancesFromA[nodeIdentifier]);
    }
  }

  // Output the final calculated maximum distance
  console.log(maximumDistance);
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
