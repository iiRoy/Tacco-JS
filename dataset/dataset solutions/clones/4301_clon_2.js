'use strict'


let vertexCount, edgeCount, exploredNodes, adjacencyMatrix;

/*
 * This helper function prints a visual representation of the graph matrix.
 * True values are represented by '@', false by '-'.
 * @param {Array<Array<boolean>>} matrixData - The 2D array representing the graph.
 */
const displayMatrix = (matrixData) => {

  let outputString = ''; // Initialize an empty string for output accumulation

  for (let rowIdx in matrixData) { // Iterate over each row in the input matrix
    for (let colIdx in matrixData[rowIdx]) { // Iterate over each column in the current row
      outputString += matrixData[rowIdx][colIdx] ? '@' : '-'; // Append '@' for true, '-' for false
    }
    outputString += '\n'; // Add a newline character after each row
  }
  console.log(outputString); // Print the accumulated string to the console
};


/*
 * Executes a Depth-First Search traversal starting from a given node.
 * Marks visited nodes in the 'exploredNodes' array.
 * @param {number} currentNodeIndex - The starting node for the DFS.
 */
const depthFirstSearch = (currentNodeIndex) => {

  exploredNodes[currentNodeIndex] = true; // Mark the current node as visited

  // Iterate through all possible neighbors
  for (let neighborIndex = 0; neighborIndex < vertexCount; neighborIndex++) {
    // If the neighbor has already been visited OR there is no edge between current and neighbor,
    // then we should skip this particular neighbor and move to the next one.
    if (exploredNodes[neighborIndex] || adjacencyMatrix[currentNodeIndex][neighborIndex] === false) {
      continue; // Move to the next potential neighbor without further processing
    }
    depthFirstSearch(neighborIndex); // Recursively call DFS for the unvisited neighbor
  }
};


/**
 * Main function to process graph input, find bridges, and output the count.
 * @param {string} rawData - The raw input string containing graph data.
 */
function processGraphData(rawData) {

  // --- Input Parsing and Initialization ---

  // Split the input string by newlines, then each line by spaces, and convert to numbers.
  let processedInput = rawData.split('\n').map(parsedValue => parsedValue.split(' ').map(parsedValue => ~~parsedValue));

  // Extract the number of vertices (N) and edges (M) from the first line.
  vertexCount = processedInput[0][0];
  edgeCount = processedInput[0][1];

  // Extract the list of edges, excluding the first (N, M) and last (empty) lines.
  const edgeList = processedInput.slice(1, -1);


  // Initialize the adjacency matrix for the graph.
  // This will be a 2D array where adjacencyMatrix[i][j] is true if an edge exists between i and j.
  adjacencyMatrix = Array.apply(null, {
    length: vertexCount
  }).map(
    val =>
      (val = Array.apply(null, {
        length: vertexCount
      }).fill(false)) // Each row is initialized with 'false' indicating no connections
  );


  // Populate the adjacency matrix based on the provided edge list.
  // Graphs are undirected, so an edge (A, B) means adjacencyMatrix[A][B] and adjacencyMatrix[B][A] are true.
  for (let loopIndex = 0; loopIndex < edgeCount; loopIndex++) {
    let nodeA = edgeList[loopIndex][0] - 1; // Adjust to 0-based indexing
    let nodeB = edgeList[loopIndex][1] - 1; // Adjust to 0-based indexing
    adjacencyMatrix[nodeA][nodeB] = true;
    adjacencyMatrix[nodeB][nodeA] = true;
  }

  // Initialize the array to keep track of visited nodes during DFS.
  exploredNodes = Array.apply(null, {
    length: vertexCount
  }).fill(false);


  // --- Bridge Detection Logic ---

  let bridgeCount = 0; // Counter for the number of bridges found

  // Iterate through all possible pairs of nodes (i, j) in the graph.
  // We only need to check each edge once, so we iterate i from 0 to N-1 and j from i+1 to N-1
  // However, the original code iterates through all i, j. To maintain structure, I will keep that.
  for (let firstNode = 0; firstNode < vertexCount; firstNode++) {
    for (let secondNode = 0; secondNode < vertexCount; secondNode++) {

      // If an edge exists between firstNode and secondNode
      if (adjacencyMatrix[firstNode][secondNode]) {

        // --- Temporarily Remove Edge ---
        // To check if an edge is a bridge, we remove it and see if the graph remains connected.
        adjacencyMatrix[firstNode][secondNode] = false;
        adjacencyMatrix[secondNode][firstNode] = false;

        // --- Perform Connectivity Check ---
        exploredNodes.fill(false); // Reset all nodes to unvisited for the new DFS traversal

        depthFirstSearch(0); // Start DFS from node 0 to check connectivity of the graph

        // If not all nodes are reachable after removing the edge, it means the edge was a bridge.
        if (!exploredNodes.every(checkVisited => checkVisited === true)) {
          bridgeCount++; // Increment the bridge counter
        }

        // --- Restore Edge ---
        // Important: Restore the edge to its original state before checking the next edge.
        adjacencyMatrix[firstNode][secondNode] = true;
        adjacencyMatrix[secondNode][firstNode] = true;
      }
    }
  }

  // The problem statement implies we count each bridge twice (once for (i,j) and once for (j,i)).
  // Therefore, we divide the total count by 2 to get the actual number of unique bridges.
  console.log(bridgeCount / 2);

  // The original code had commented out calls to displayMatrix, so I'll keep them commented out.
  // displayMatrix(adjacencyMatrix);
}

// Execute the main processing function with input read from standard input.
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));