'use strict'; // Enforce strict parsing and error handling for better code quality.

/**
 * Main entry point for processing the input data.
 * This function orchestrates the parsing of input and initiation of the graph traversal.
 * @param {string} rawData - The raw input string, typically read from standard input.
 */
function processInput(rawData) {
  // Split the entire input string into an array of individual lines.
  const linesArray = rawData.split('\n');

  // Extract the first line, which contains the graph dimensions (N and M).
  // Split it by space, then convert each part to an integer.
  const dimensions = linesArray.shift().split(' ').map((elementValue) => parseInt(elementValue, 10));

  // Assign the number of nodes (N) and edges (M) from the parsed dimensions.
  const nodeCount = dimensions[0];
  const edgeCount = dimensions[1]; // Note: The 'edgeCount' variable is parsed but not used in the subsequent logic.

  // Initialize an adjacency matrix to represent the graph.
  // It's a square matrix of size N x N, initially filled with zeros (no connections).
  let adjacencyMatrix = new Array(nodeCount).fill(0).map(() => new Array(nodeCount).fill(0));

  // Iterate over the remaining lines in the input, each representing an edge.
  for (let currentLine of linesArray) {
    // Parse the two node indices (a and b) from the current line.
    const parsedValues = currentLine.split(' ').map((val) => parseInt(val, 10));
    const nodeA = parsedValues[0];
    const nodeB = parsedValues[1];

    // Mark the connection in the adjacency matrix.
    // Node indices are 1-based in the input, so subtract 1 for 0-based array indexing.
    adjacencyMatrix[nodeA - 1][nodeB - 1] = 1; // Connection from nodeA to nodeB.
    adjacencyMatrix[nodeB - 1][nodeA - 1] = 1; // Connection from nodeB to nodeA (undirected graph).
  }

  // Initialize a tracking array to keep record of visited nodes during the DFS traversal.
  // All nodes are initially marked as unvisited (0).
  let visitedTracker = new Array(nodeCount).fill(0);

  // Mark the starting node (node 0) as visited to begin the traversal.
  visitedTracker[0] = 1;

  // Execute the Depth First Search algorithm starting from node 0.
  // The result, which is the total count of paths visiting all nodes, is then printed to console.
  console.log(depthFirstSearch(0, nodeCount, adjacencyMatrix, visitedTracker));
}


/**
 * Checks if all nodes in the graph have been marked as visited in the current path.
 * @param {number[]} visitedTracker - An array where each element indicates the visit status of a node (1 for visited, 0 for unvisited).
 * @returns {boolean} True if every node in the `visitedTracker` array is marked as 1, false otherwise.
 */
function allNodesVisited(visitedTracker) {
  let completionStatus = true; // Assume all nodes are visited until proven otherwise.
  // Iterate through each node's visit status.
  for (let nodeStatus of visitedTracker) {
    // If any node is found to be unvisited (status is not 1),
    // then the condition that all nodes are visited is false.
    if (nodeStatus !== 1) {
      completionStatus = false;
      break; // No need to check further, we've found an unvisited node.
    }
  }
  return completionStatus;
}

/**
 * Performs a Depth First Search (DFS) traversal on the graph to count paths that visit every node.
 * This function employs a backtracking approach.
 * @param {number} currentNodeIndex - The 0-based index of the node currently being explored.
 * @param {number} totalNodes - The total number of nodes present in the graph.
 * @param {number[][]} adjMatrix - The adjacency matrix representing the connections between nodes.
 * @param {number[]} visitedTracker - An array used to keep track of which nodes have been visited in the current path.
 * @returns {number} The cumulative count of distinct paths that successfully visit all nodes.
 */
function depthFirstSearch(currentNodeIndex, totalNodes, adjMatrix, visitedTracker) {
  // Base case for the recursion: If all nodes have been visited in the current path,
  // it means we've found a valid path, so increment the global path counter.
  if (allNodesVisited(visitedTracker)) {
    pathCounter++; // Increment the global counter for valid paths.
  }

  // Explore all possible neighbors from the current node.
  for (let neighborIndex = 0; neighborIndex < totalNodes; neighborIndex++) {
    // Check two conditions:
    // 1. Is there an edge connecting the current node to the neighbor node? (adjMatrix[currentNodeIndex][neighborIndex] === 1)
    // 2. Has the neighbor node not been visited yet in the current path? (visitedTracker[neighborIndex] === 0)
    if (adjMatrix[currentNodeIndex][neighborIndex] === 1 && visitedTracker[neighborIndex] === 0) {
      // If both conditions are met, mark the neighbor as visited for the current path.
      visitedTracker[neighborIndex] = 1;
      // Recursively call DFS to continue the path from the neighbor node.
      depthFirstSearch(neighborIndex, totalNodes, adjMatrix, visitedTracker);
      // Backtrack: After the recursive call returns, unmark the neighbor as visited.
      // This allows the algorithm to explore other paths that might not include this neighbor
      // at this specific point, or to include it later in a different path.
      visitedTracker[neighborIndex] = 0;
    }
  }

  // Return the current value of the global path counter.
  return pathCounter;
}

// Declare a global variable to store the total count of paths that visit all nodes.
// This variable is initialized to zero before the main processing begins.
let pathCounter = 0;

// Read the entire content of standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
// Then, pass this raw input string to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
