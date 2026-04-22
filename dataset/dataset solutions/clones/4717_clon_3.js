'use strict'; // Retaining strict mode for good practice

/**
 * Executes a graph traversal process based on provided input data.
 * This function parses graph dimensions and edges, then initiates a
 * Depth First Search (DFS) to find all Hamiltonian paths starting from node 0.
 *
 * @param {string} rawInputString - The raw string input containing graph data.
 */
function executeGraphTraversal(rawInputString) {
  // Split the input into individual lines for processing.
  // Renamed 'tmp' to 'inputLines' for clarity.
  const inputLines = rawInputString.split('\n');

  // Parse graph dimensions (number of vertices and edges) from the first line.
  // Renamed 'NM' to 'graphDimensions' and 'N', 'M' to 'numberOfVertices', 'numberOfEdges'.
  const graphDimensions = inputLines.shift().split(' ').map(val => Number(val));
  const numberOfVertices = graphDimensions[0];
  const numberOfEdges = graphDimensions[1];

  // Basic validation for the number of vertices.
  if (numberOfVertices <= 0) {
    console.error("Error: Number of vertices must be greater than 0.");
    return; // Exit if input is invalid.
  }

  // Initialize the adjacency matrix for the graph.
  // Renamed 'graph' to 'connectionMatrix'.
  // Rewritten initialization using Array.from for diversity.
  const connectionMatrix = Array.from({
    length: numberOfVertices
  }, () => new Array(numberOfVertices).fill(0));

  // Populate the adjacency matrix based on edge definitions.
  // Using a traditional for loop instead of for...of and explicit index.
  for (let edgeIdx = 0; edgeIdx < numberOfEdges; edgeIdx++) {
    // Renamed 'line' to 'edgeDefinitionLine', 'splited' to 'parsedEdgeNodes'.
    const edgeDefinitionLine = inputLines[edgeIdx];
    // Added a guard clause for potentially malformed input lines.
    if (!edgeDefinitionLine || edgeDefinitionLine.trim() === '') {
      console.warn(`Skipping malformed edge definition at line ${edgeIdx + 2}: '${edgeDefinitionLine}'`);
      continue;
    }
    const parsedEdgeNodes = edgeDefinitionLine.split(' ').map(Number);

    // Renamed 'a', 'b' to 'nodeAIndex', 'nodeBIndex'.
    // Adjusted parsing to 0-indexed values directly.
    const nodeAIndex = parsedEdgeNodes[0] - 1;
    const nodeBIndex = parsedEdgeNodes[1] - 1;

    // Ensure indices are within bounds before setting connections.
    if (nodeAIndex >= 0 && nodeAIndex < numberOfVertices &&
      nodeBIndex >= 0 && nodeBIndex < numberOfVertices) {
      connectionMatrix[nodeAIndex][nodeBIndex] = 1;
      connectionMatrix[nodeBIndex][nodeAIndex] = 1; // Graph is undirected
    } else {
      console.warn(`Invalid node indices encountered for edge: ${parsedEdgeNodes[0]}, ${parsedEdgeNodes[1]}`);
    }
  }

  // Initialize an array to keep track of visited nodes during traversal.
  // Renamed 'visited' to 'nodeVisitState'.
  const nodeVisitState = new Array(numberOfVertices).fill(0);

  // Mark the starting node (node 0) as visited.
  nodeVisitState[0] = 1;

  // Encapsulate the path counter within an object to pass by reference.
  // Renamed 'count' to 'traversalStatistics.successfulPaths'.
  const traversalStatistics = {
    successfulPaths: 0
  };

  // Start the Depth First Search from the initial node.
  // Renamed 'dfs' to 'exploreGraphPaths'.
  exploreGraphPaths(0, numberOfVertices, connectionMatrix, nodeVisitState, traversalStatistics);

  // Output the total number of unique paths found.
  console.log(traversalStatistics.successfulPaths);
}

/**
 * Checks if all nodes in the graph have been visited.
 * Renamed 'visitedAll' to 'areAllNodesTraversed'.
 *
 * @param {number[]} currentVisitState - An array indicating the visit status of each node.
 * @returns {boolean} True if all nodes are marked as visited (1), false otherwise.
 */
function areAllNodesTraversed(currentVisitState) {
  // Rewritten using Array.prototype.every() for conciseness and efficiency.
  return currentVisitState.every(status => status === 1);
}

/**
 * Performs a Depth First Search (DFS) to explore all possible paths in the graph.
 * This recursive function counts paths that visit every node exactly once (Hamiltonian paths).
 * Renamed 'dfs' to 'exploreGraphPaths'.
 *
 * @param {number} currentVertexIndex - The index of the current node being visited.
 * @param {number} totalVertices - The total number of vertices in the graph.
 * @param {number[][]} adjacencyMap - The adjacency matrix representing graph connections.
 * @param {number[]} vertexVisitedFlags - An array tracking which vertices have been visited in the current path.
 * @param {object} pathTracker - An object holding the count of successful paths.
 */
function exploreGraphPaths(currentVertexIndex, totalVertices, adjacencyMap, vertexVisitedFlags, pathTracker) {
  // Base case: If all nodes have been visited in the current path, increment the counter.
  if (areAllNodesTraversed(vertexVisitedFlags)) {
    pathTracker.successfulPaths++;
    // No need to continue exploring from this path as all nodes are covered.
    return;
  }

  // Explore all adjacent (neighboring) vertices.
  for (let nextVertex = 0; nextVertex < totalVertices; nextVertex++) {
    // Check if there's an edge from the current vertex to the next vertex
    // AND if the next vertex has not been visited in the current path.
    if (adjacencyMap[currentVertexIndex][nextVertex] === 1 && vertexVisitedFlags[nextVertex] === 0) {
      // Mark the next vertex as visited for this path.
      vertexVisitedFlags[nextVertex] = 1;

      // Recursively call DFS for the next vertex.
      exploreGraphPaths(nextVertex, totalVertices, adjacencyMap, vertexVisitedFlags, pathTracker);

      // Backtrack: Unmark the next vertex as visited.
      // This is crucial to explore other paths that might use this vertex later.
      vertexVisitedFlags[nextVertex] = 0;
    }
  }

  // The function implicitly returns through modifications to pathTracker.successfulPaths.
  // For consistency, we can return the current count, though it's not strictly necessary for the caller.
  return pathTracker.successfulPaths;
}

// Read input from stdin and initiate the graph traversal process.
executeGraphTraversal(require('fs').readFileSync('/dev/stdin', 'utf8'));