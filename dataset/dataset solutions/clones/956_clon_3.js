const UNSEEN_NODE = 0; // Represents a node not yet considered or included in the growing MST
const VISITED_NODE = 1; // Represents a node that has been added to the Minimum Spanning Tree

/**
 * Computes the total minimum spanning tree weight for a given graph using Prim's algorithm.
 * Input is read from standard input, representing an adjacency matrix.
 */
(function calculateGraphMstValue() {
  // Access the file system module to read input
  const fileSystem = require('fs');
  const standardInputPath = '/dev/stdin';

  // Read the entire input content as a UTF-8 string
  const rawDataContent = fileSystem.readFileSync(standardInputPath, 'utf8');

  // Process the input: trim whitespace and split into individual lines
  const dataRows = rawDataContent.trim().split('\n');

  // --- Input Validation and Parsing ---

  // Handle empty input gracefully
  if (dataRows.length === 0) {
    console.log(0); // An empty graph has an MST cost of 0
    return;
  }

  // Extract the number of vertices from the first line
  const totalVertices = parseInt(dataRows.shift(), 10);

  // Basic validation for the number of vertices
  if (isNaN(totalVertices) || totalVertices <= 0) {
    console.error("Error: Invalid or non-positive number of vertices provided.");
    return;
  }

  // Helper function to parse a single row of the adjacency matrix
  const parseConnectionRow = (lineString) => {
    return lineString.trim().split(' ').map(strWeight => {
      const numericWeight = parseInt(strWeight, 10);
      // According to problem specification, -1 indicates no direct connection (infinite weight)
      return (numericWeight === -1) ? Number.POSITIVE_INFINITY : numericWeight;
    });
  };

  // Build the graph's adjacency matrix from the remaining input lines
  const connectivityMatrix = dataRows.slice(0, totalVertices).map(parseConnectionRow);

  // Further validation for matrix dimensions
  if (connectivityMatrix.length !== totalVertices || (totalVertices > 0 && connectivityMatrix[0].length !== totalVertices)) {
    console.error("Error: Adjacency matrix dimensions do not match the specified number of vertices.");
    return;
  }

  // --- Prim's Algorithm Initialization ---

  // `shortestEdgeToMst` array stores the minimum weight of an edge connecting
  // a vertex to the current Minimum Spanning Tree.
  const shortestEdgeToMst = Array.from({ length: totalVertices }, () => Number.POSITIVE_INFINITY);

  // `vertexStatus` array tracks whether a vertex has been included in the MST (VISITED) or not (UNSEEN).
  const vertexStatus = Array.from({ length: totalVertices }, () => UNSEEN_NODE);

  // Start Prim's algorithm from vertex 0. The cost to connect vertex 0 to the MST (which initially contains only vertex 0) is 0.
  shortestEdgeToMst[0] = 0;

  // Initialize the accumulator for the total MST weight
  let accumulatedMstWeight = 0;

  // --- Main Prim's Algorithm Loop ---

  // The loop runs `totalVertices` times, as we need to add `totalVertices` nodes to the MST.
  // Each iteration selects one new vertex to add to the MST.
  for (let currentIteration = 0; currentIteration < totalVertices; currentIteration++) {
    let minimumConnectionCost = Number.POSITIVE_INFINITY;
    let chosenVertexIndex = -1; // Index of the vertex selected in the current iteration

    // Step 1: Find the vertex with the minimum `shortestEdgeToMst` value
    // among all `UNSEEN_NODE` vertices.
    for (let vertexIdx = 0; vertexIdx < totalVertices; vertexIdx++) {
      // If the vertex is not yet in the MST and offers a cheaper connection
      if (vertexStatus[vertexIdx] === UNSEEN_NODE && shortestEdgeToMst[vertexIdx] < minimumConnectionCost) {
        minimumConnectionCost = shortestEdgeToMst[vertexIdx];
        chosenVertexIndex = vertexIdx;
      }
    }

    // Step 2: Check if a valid vertex was found
    if (chosenVertexIndex === -1 || minimumConnectionCost === Number.POSITIVE_INFINITY) {
      // If no reachable UNSEEN_NODE is found, it means the graph is disconnected
      // from the current MST, or all nodes have been processed.
      // For this problem, we simply break and output the sum for the reachable component.
      break;
    }

    // Step 3: Add the chosen vertex to the MST
    accumulatedMstWeight += minimumConnectionCost; // Add its connection cost to the total
    vertexStatus[chosenVertexIndex] = VISITED_NODE; // Mark it as visited

    // Step 4: Update `shortestEdgeToMst` for neighbors of the newly added vertex
    const connectionsFromChosenVertex = connectivityMatrix[chosenVertexIndex];
    for (let neighborIdx = 0; neighborIdx < totalVertices; neighborIdx++) {
      // Only consider neighbors that are not yet part of the MST
      if (vertexStatus[neighborIdx] === UNSEEN_NODE) {
        const weightToCurrentNeighbor = connectionsFromChosenVertex[neighborIdx];
        // If the path from the chosen vertex to this neighbor is shorter than
        // the neighbor's current shortest known path to the MST, update it.
        if (weightToCurrentNeighbor < shortestEdgeToMst[neighborIdx]) {
          shortestEdgeToMst[neighborIdx] = weightToCurrentNeighbor;
        }
      }
    }
  }

  // Output the final computed total weight of the Minimum Spanning Tree
  console.log(accumulatedMstWeight);

})();