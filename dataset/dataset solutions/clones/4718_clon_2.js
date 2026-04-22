'use strict'; // Enforce strict parsing rules for better code quality.

// This utility function verifies if every single node has been marked as visited.
function checkAllNodesVisited(nodeStates) {
  let allReached = true; // Assume all nodes are visited by default.

  for (let nodeStatus of nodeStates) { // Iterate through the status of each node.
    if (nodeStatus !== 1) { // If we find any node not marked with '1' (meaning visited).
      allReached = false; // Then it's not true that all nodes have been visited.
      break; // No need to check further, we've found an unvisited node.
    }
  }
  return allReached; // Deliver the outcome of the check.
}


// Implements a recursive Depth-First Search algorithm to traverse the graph.
function depthFirstSearch(currentVertex, numVertices, adjacencyMatrix, visitedStatus) {
  // If the current path has successfully visited all nodes, increment the global counter.
  if (checkAllNodesVisited(visitedStatus)) {
    pathCount++; // Increment the number of complete traversal paths found.
  }


  // Explore all possible neighbors from the current vertex.
  for (let idx = 0; idx < numVertices; idx++) {
    // Check if there's an edge from 'currentVertex' to 'idx' AND 'idx' hasn't been visited yet.
    if (adjacencyMatrix[currentVertex][idx] === 1 && visitedStatus[idx] === 0) {
      visitedStatus[idx] = 1; // Mark the 'idx' vertex as visited for this path.
      depthFirstSearch(idx, numVertices, adjacencyMatrix, visitedStatus); // Recursively call for the next vertex.
      visitedStatus[idx] = 0; // Backtrack: Unmark 'idx' to allow exploration of other paths.
    }
  }

  return pathCount; // Return the current total count of full paths.

}

// The primary function orchestrating input parsing and graph traversal.
function executeTraversal(rawData) {
  const inputLines = rawData.split('\n'); // Break the raw input into individual lines.
  const dimensions = inputLines.shift().split(' ').map((itemStr) => parseInt(itemStr, 10)); // Parse graph dimensions.

  const vertexCount = dimensions[0]; // Total number of vertices in the graph.
  const edgeCount = dimensions[1]; // Total number of edges in the graph.

  // Initialize the graph's adjacency matrix with zeros, indicating no connections initially.
  let adjMatrix = Array(vertexCount)
    .fill(0)
    .map((_) => Array(vertexCount).fill(0)); // Create a V x V matrix.

  // Populate the adjacency matrix based on the provided edge data.
  for (let edgeLine of inputLines) {
    const edgeEndpoints = edgeLine.split(' ').map((itemStr) => parseInt(itemStr, 10)); // Parse edge vertices.
    const nodeA = edgeEndpoints[0]; // The first node of the edge.
    const nodeB = edgeEndpoints[1]; // The second node of the edge.

    // Mark the connection in the adjacency matrix for an undirected graph.
    adjMatrix[nodeA - 1][nodeB - 1] = 1;
    adjMatrix[nodeB - 1][nodeA - 1] = 1;
  }

  // Prepare the visitation status array, initially all nodes are unvisited.
  let visitedNodes = Array(vertexCount).fill(0);
  visitedNodes[0] = 1; // Mark the starting node (node 0) as visited to begin the search.

  // Initiate the Depth-First Search from node 0 and output the final path count.
  console.log(depthFirstSearch(0, vertexCount, adjMatrix, visitedNodes));
}

let pathCount = 0; // A global counter to store the number of Hamiltonian paths.
// Read input from the standard input stream and pass it to the main execution function.
executeTraversal(require('fs').readFileSync('/dev/stdin', 'utf8'));