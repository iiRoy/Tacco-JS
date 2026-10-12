'use strict';

// Helper function to determine if all nodes in the tracking array have been visited.
function checkAllVisited(nodeStates) {
  let allReached = true; // Initialize a flag to true, assuming all nodes are visited.
  // Iterate through each node's state.
  for (let nodeState of nodeStates) {
    // If any node's state is not 1 (meaning not visited), set the flag to false.
    if (nodeState !== 0x1) {
      allReached = false;
      // No need to check further, we found an unvisited node.
      break;
    }
  }
  return allReached; // Return the final status.
}

// Depth-First Search (DFS) function to find all Hamiltonian paths starting from a given node.
function explorePaths(currentNode, totalNodes, adjacencyMatrix, visitedStatus) {
  // If all nodes have been visited in the current path, increment the global path counter.
  if (checkAllVisited(visitedStatus)) {
    pathCounter++;
  }

  // Explore all possible neighbors from the current node.
  for (let neighborIndex = 0; neighborIndex < totalNodes; neighborIndex++) {
    // Check if there's an edge to the neighbor and if the neighbor hasn't been visited yet.
    if (adjacencyMatrix[currentNode][neighborIndex] === 0x1 && visitedStatus[neighborIndex] === 0x0) {
      // Mark the neighbor as visited.
      visitedStatus[neighborIndex] = 0x1;
      // Recursively call DFS for the neighbor.
      explorePaths(neighborIndex, totalNodes, adjacencyMatrix, visitedStatus);
      // Backtrack: unmark the neighbor as visited to explore other paths.
      visitedStatus[neighborIndex] = 0x0;
    }
  }

  // Return the total count of paths found so far.
  return pathCounter;
}

// Main function to process input and initiate the path finding.
function processInput(rawData) {
  // Split the input string into an array of lines.
  const lines = rawData.split('\n');

  // Extract the first line which contains the number of nodes (N) and edges (M).
  const nodeEdgeCounts = lines.shift().split(' ').map((item) => parseInt(item, 10));
  const numVertices = nodeEdgeCounts[0]; // Number of nodes.
  const numEdges = nodeEdgeCounts[1];   // Number of edges.

  // Initialize an adjacency matrix for the graph with all zeros.
  let adjMatrix = Array(numVertices).fill(0x0).map((item) => Array(numVertices).fill(0x0));

  // Populate the adjacency matrix based on the remaining input lines (edges).
  for (let edgeLine of lines) {
    const edgeNodes = edgeLine.split(' ').map((item) => parseInt(item, 10));
    const nodeA = edgeNodes[0]; // First node of the edge.
    const nodeB = edgeNodes[1]; // Second node of the edge.

    // Adjust for 0-based indexing and mark the edge in both directions (undirected graph).
    adjMatrix[nodeA - 0x1][nodeB - 0x1] = 0x1;
    adjMatrix[nodeB - 0x1][nodeA - 0x1] = 0x1;
  }

  // Initialize a tracking array for visited nodes, all set to 0 (unvisited).
  let nodeVisitTracker = Array(numVertices).fill(0x0);
  // Mark the starting node (node 0) as visited.
  nodeVisitTracker[0x0] = 0x1;

  // Start the DFS from node 0 and print the total count of paths.
  console.log(explorePaths(0x0, numVertices, adjMatrix, nodeVisitTracker));
}

// Global variable to keep track of the number of valid paths.
let pathCounter = 0x0;

// Read input from stdin and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
