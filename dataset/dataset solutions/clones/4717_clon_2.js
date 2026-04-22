'use strict';
/*
 * This function serves as the primary entry point for processing input data.
 * It reads configuration, constructs a graph representation, and initiates
 * a depth-first search to find distinct paths.
 */
function primaryProcessor(rawData) {
  // Split the input into individual lines for further parsing.
  const temporaryLines = rawData.split('\n');

  /*
   * The first line contains global dimensions: number of vertices (nodes)
   * and number of edges.
   */
  const dimensions = temporaryLines.shift().split(' ').map((item) => Number.parseInt(item, 10));

  // Extract the total number of vertices from the parsed dimensions.
  const numVertices = dimensions[0];
  // Extract the total number of edges (though not directly used in DFS logic, it's parsed).
  const numEdges = dimensions[1];

  // Initialize an adjacency matrix to represent the graph.
  // All connections are initially set to zero (no edge).
  let adjacencyMatrix = Array.from({ length: numVertices }, () => Array.from({ length: numVertices }, () => 0));

  // Iterate over the remaining lines, each representing an edge.
  for (const currentLine of temporaryLines) {
    // Parse the current line to extract the two connected nodes.
    const parsedNumbers = currentLine.split(' ').map((val) => Number.parseInt(val, 10));

    // Get the indices of the first and second nodes in the edge.
    // Adjust for 0-based indexing.
    const firstNode = parsedNumbers[0];
    const secondNode = parsedNumbers[1];

    // Mark the connection in the adjacency matrix for both directions (undirected graph).
    adjacencyMatrix[firstNode - 1][secondNode - 1] = 1;
    adjacencyMatrix[secondNode - 1][firstNode - 1] = 1;
  }

  // Initialize an array to keep track of visited nodes during the traversal.
  // All nodes are initially marked as unvisited (0).
  let visitedNodesStatus = Array.from({ length: numVertices }, () => 0);

  // Mark the starting node (index 0) as visited.
  visitedNodesStatus[0] = 1;

  // Execute the depth-first search starting from node 0 and print the final count.
  console.log(depthFirstSearch(0, numVertices, adjacencyMatrix, visitedNodesStatus));
}


/*
 * Checks if all nodes in the graph have been visited during the current path.
 * Returns true if every node's status is 1 (visited), false otherwise.
 */
function checkAllNodesVisited(nodeStates) {
  let allReached = true; // Assume all nodes are visited initially.
  // Iterate through the status of each node.
  for (const state of nodeStates) {
    // If any node is found to be unvisited (status is not 1),
    // set the flag to false and break the loop.
    if (state !== 1) {
      allReached = false;
      break;
    }
  }
  return allReached; // Return the final status.
}

/*
 * Performs a depth-first search (DFS) on the graph to count
 * the number of distinct paths that visit all nodes.
 */
function depthFirstSearch(currentNodeIndex, totalNodes, adjMatrix, visitedNodes) {
  // Base case: If all nodes have been visited in the current path,
  // increment the global path counter.
  if (checkAllNodesVisited(visitedNodes)) {
    pathCounter++;
  }

  // Explore all possible neighbors from the current node.
  for (let vertexIndex = 0; vertexIndex < totalNodes; vertexIndex++) {
    // Check if there is an edge between the current node and the potential neighbor,
    // and if the neighbor has not been visited yet.
    if (adjMatrix[currentNodeIndex][vertexIndex] === 1 && visitedNodes[vertexIndex] === 0) {
      // Mark the neighbor as visited.
      visitedNodes[vertexIndex] = 1;
      // Recursively call DFS for the neighbor.
      depthFirstSearch(vertexIndex, totalNodes, adjMatrix, visitedNodes);
      // Backtrack: Unmark the neighbor as visited to explore other paths.
      visitedNodes[vertexIndex] = 0;
    }
  }

  // Return the accumulated count of valid paths.
  return pathCounter;
}

// Global variable to store the count of valid paths.
let pathCounter = 0;

// Read input from standard input and initiate the processing.
primaryProcessor(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));