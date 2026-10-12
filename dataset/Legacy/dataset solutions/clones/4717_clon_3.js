'use strict';

function processGraphInput(rawInputString) {
  const RADIX_DECIMAL = 10; // Introduce a helper constant for radix

  const inputLines = rawInputString.split('\n');
  const graphDimensionsLine = inputLines.shift();

  // Use destructuring assignment for N and M
  const [numNodes, numEdges] = graphDimensionsLine.split(' ').map((elem) => parseInt(elem, RADIX_DECIMAL));

  // Initialize adjacency matrix using Array.from for a more functional approach
  let adjMatrix = Array.from({ length: numNodes }, () => Array(numNodes).fill(0));

  // Populate adjacency matrix based on edge lines
  for (let currentEdgeLine of inputLines) {
    const parsedEdgeNodes = currentEdgeLine.split(' ').map((elem) => parseInt(elem, RADIX_DECIMAL));
    const nodeIdxA_oneBased = parsedEdgeNodes[0];
    const nodeIdxB_oneBased = parsedEdgeNodes[1];

    // Introduce intermediate variables for 0-based indexing
    const nodeIdxA_zeroBased = nodeIdxA_oneBased - 1;
    const nodeIdxB_zeroBased = nodeIdxB_oneBased - 1;

    adjMatrix[nodeIdxA_zeroBased][nodeIdxB_zeroBased] = 1;
    adjMatrix[nodeIdxB_zeroBased][nodeIdxA_zeroBased] = 1; // Graph is undirected
  }

  // Initialize node visit status array
  let nodeVisitStatus = new Array(numNodes).fill(0);
  nodeVisitStatus[0] = 1; // Mark the starting node (node 0) as visited

  // Encapsulate the path counter and DFS logic within the main function's scope
  let validPathCounter = 0; // Renamed 'count' and made it a closure variable

  // Helper function rewritten using Array.prototype.every for conciseness
  const areAllNodesVisited = (statusArray) => {
    return statusArray.every(statusVal => statusVal === 1);
  };

  // Renamed 'dfs' to 'explorePaths' and made it a nested function (closure)
  const explorePaths = (currentVertex, totalNodes, matrix, visitStatus) => {
    // Base case: if all nodes have been visited, increment the counter
    if (areAllNodesVisited(visitStatus)) {
      validPathCounter++;
      // No return here, as DFS needs to backtrack and find other potential paths
    }

    // Explore neighbors
    for (let neighborVertex = 0; neighborVertex < totalNodes; neighborVertex++) {
      // Introduce intermediate boolean variables for clarity
      const isConnected = matrix[currentVertex][neighborVertex] === 1;
      const isNotVisited = visitStatus[neighborVertex] === 0;

      if (isConnected && isNotVisited) {
        visitStatus[neighborVertex] = 1; // Mark neighbor as visited
        explorePaths(neighborVertex, totalNodes, matrix, visitStatus); // Recursive call
        visitStatus[neighborVertex] = 0; // Backtrack: unmark neighbor for other path explorations
      }
    }
    // The function itself doesn't need to return a value, as validPathCounter is updated by closure.
  };

  // Initiate the depth-first search from the first node (index 0)
  explorePaths(0, numNodes, adjMatrix, nodeVisitStatus);

  // Output the final count of valid paths
  console.log(validPathCounter);
}

// Read input from stdin and pass it to the processing function
processGraphInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
