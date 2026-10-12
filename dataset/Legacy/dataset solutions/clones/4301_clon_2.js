'use strict'; // Enforce strict parsing and error handling for better code quality

let nodeCount, edgeCount, exploredNodes, adjacencyMatrix; // Declare global variables to store graph properties

/**
 * Utility function to print the adjacency matrix to the console.
 * This function is present in the original code but commented out in the main logic,
 * so its structure and purpose are preserved here.
 * @param {boolean[][]} matrixData - The 2D array representing graph connections.
 */
const displayGraphState = (matrixData) => {
  let outputBuffer = ''; // Initialize an empty string to build the output
  for (let rowIdx in matrixData) { // Iterate over each row index in the matrix
    for (let colIdx in matrixData[rowIdx]) { // Iterate over each column index in the current row
      outputBuffer += matrixData[rowIdx][colIdx] ? 'X' : '.'; // Append 'X' for a connection, '.' for no connection
    }
    outputBuffer += '\n'; // Add a newline character after processing each row
  }
  console.log(outputBuffer); // Output the complete formatted string to the console
};

/**
 * Performs a Depth First Search (DFS) traversal starting from a specified node.
 * This function recursively explores all reachable nodes from the starting point
 * and marks them as visited in the global 'exploredNodes' array.
 * @param {number} startNodeIdx - The 0-based index of the node to begin the DFS from.
 */
const performDFS = (startNodeIdx) => {
  exploredNodes[startNodeIdx] = true; // Mark the current node as visited
  for (let nextNodeIdx = 0; nextNodeIdx < nodeCount; nextNodeIdx++) { // Iterate through all potential neighbors
    // Check if the potential neighbor has not been visited AND if there is an edge
    // between the current node and this neighbor in the adjacency matrix.
    if (!exploredNodes[nextNodeIdx] && adjacencyMatrix[startNodeIdx][nextNodeIdx]) {
      performDFS(nextNodeIdx); // Recursively call DFS on the unvisited and connected neighbor
    }
  }
};

/**
 * Main entry point for processing graph input and identifying bridge edges.
 * A bridge edge is one whose removal increases the number of connected components in the graph.
 * @param {string} rawInputData - The raw string input, typically read from standard input.
 */
function analyzeGraph(rawInputData) {
  // Parse the input string:
  // 1. Split the string by newline characters to get individual lines.
  // 2. For each line, split it by space characters.
  // 3. Convert each resulting string part into an integer using the bitwise NOT operator (~~).
  let processedLines = rawInputData.split('\n').map(lineStr => lineStr.split(' ').map(valStr => ~~valStr));

  nodeCount = processedLines[0][0]; // The first number on the first line represents N (number of nodes)
  edgeCount = processedLines[0][1]; // The second number on the first line represents M (number of edges)
  const connectionDefinitions = processedLines.slice(1, -1); // Extract edge definitions, excluding the header and potential empty last line

  // Initialize the adjacency matrix for the graph.
  // It's a square matrix of size N x N, where each element is initially 'false',
  // indicating no direct connection between nodes.
  adjacencyMatrix = Array.apply(null, {
    length: nodeCount
  }).map(
    _ =>
      (Array.apply(null, {
        length: nodeCount
      }).fill(false)) // Create a new row array, filled with 'false'
  );

  // Populate the adjacency matrix based on the provided edge definitions.
  // Since the graph is undirected, an edge between 'u' and 'v' means both
  // adjacencyMatrix[u][v] and adjacencyMatrix[v][u] should be set to 'true'.
  for (let k = 0; k < edgeCount; k++) {
    let firstVertex = connectionDefinitions[k][0] - 1; // Convert 1-based node index to 0-based
    let secondVertex = connectionDefinitions[k][1] - 1; // Convert 1-based node index to 0-based
    adjacencyMatrix[firstVertex][secondVertex] = true; // Mark connection from first to second
    adjacencyMatrix[secondVertex][firstVertex] = true; // Mark connection from second to first
  }

  // Initialize the 'exploredNodes' array. This boolean array keeps track of
  // which nodes have been visited during a DFS traversal. All nodes are
  // initially marked as not visited ('false').
  exploredNodes = Array.apply(null, {
    length: nodeCount
  }).fill(false);

  let bridgeCounter = 0; // Initialize a counter for bridge edges

  // Iterate through all possible pairs of nodes (currentSrcNode, currentDestNode)
  // to test each edge in the graph. This double loop ensures every edge (and its reverse)
  // is considered for removal.
  for (let currentSrcNode = 0; currentSrcNode < nodeCount; currentSrcNode++) {
    for (let currentDestNode = 0; currentDestNode < nodeCount; currentDestNode++) {
      // If an edge exists between currentSrcNode and currentDestNode
      if (adjacencyMatrix[currentSrcNode][currentDestNode]) {
        // Temporarily remove the edge to test if it's a bridge.
        // Both directions must be removed for an undirected graph.
        adjacencyMatrix[currentSrcNode][currentDestNode] = false;
        adjacencyMatrix[currentDestNode][currentSrcNode] = false;

        // Reset the visited status for all nodes before performing a new DFS traversal.
        // This ensures a fresh check for connectivity.
        exploredNodes.fill(false);

        // Perform DFS starting from node 0.
        // If the graph becomes disconnected after removing an edge,
        // then not all nodes will be reachable from node 0.
        performDFS(0);

        // Check if all nodes were visited during the DFS.
        // If 'exploredNodes.every' returns false, it means some nodes are unreachable,
        // indicating that the removed edge was a bridge.
        if (!exploredNodes.every(isNodeVisited => isNodeVisited === true)) {
          bridgeCounter++; // Increment the bridge count
        }

        // Restore the removed edge to its original state.
        // This is crucial for subsequent checks of other edges.
        adjacencyMatrix[currentSrcNode][currentDestNode] = true;
        adjacencyMatrix[currentDestNode][currentSrcNode] = true;
      }
    }
  }

  // The final count is divided by 2 because each bridge (u,v) is effectively
  // counted twice in the nested loops (once when (u,v) is removed, and once when (v,u) is removed).
  console.log(bridgeCounter / 2);
  // displayGraphState(adjacencyMatrix); // Debugging line, commented out as per original code
}

// Read the entire content of standard input synchronously using Node.js 'fs' module
// and pass it to the main graph analysis function.
analyzeGraph(require("fs").readFileSync("/dev/stdin", "utf8"));
