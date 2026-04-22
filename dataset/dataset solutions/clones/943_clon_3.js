const NodeStatus = {
  UNVISITED: 'WHITE',
  VISITING: 'GRAY',
  VISITED: 'BLACK'
};

(function(inputBuffer) {
  // Process raw input data from stdin
  const processedInputLines = inputBuffer.trim().split('\n');

  // Extract the total number of vertices from the first line of input
  const vertexCount = parseInt(processedInputLines.shift(), 10);

  // Perform basic validation on the parsed vertex count
  if (isNaN(vertexCount) || vertexCount <= 0) {
    console.error("Error: Invalid or non-positive vertex count provided. Exiting.");
    return; // Terminate execution for invalid input
  }

  // Initialize data structures for graph representation and traversal state
  // adjacencyList will store connected nodes for each vertex (0-indexed)
  const adjacencyList = new Array(vertexCount);
  // visitStatus tracks the state of each node during DFS (UNVISITED, VISITING, VISITED)
  const visitStatus = Array(vertexCount).fill(NodeStatus.UNVISITED);

  // Populate the adjacency list from the remaining input lines
  for (let currentLineIdx = 0; currentLineIdx < vertexCount; currentLineIdx++) {
    const lineData = processedInputLines[currentLineIdx];
    // Each line starts with vertex ID and its degree, followed by connected nodes.
    // We parse the line, convert parts to numbers, and take only the connected nodes.
    const neighborIDsOneBased = lineData.split(' ').map(Number).slice(2);
    adjacencyList[currentLineIdx] = neighborIDsOneBased; // Store 1-based indices of neighbors
  }

  // Variables to store discovery and finish times during DFS traversal
  let globalTimestampCounter = 0; // Monotonically increasing timer
  const discoveryTimestamps = Array(vertexCount).fill(0); // Time when a node is first explored
  const finishTimestamps = Array(vertexCount).fill(0); // Time when a node and all its descendants have been explored

  /**
   * Performs a Depth-First Search (DFS) traversal starting from a given vertex.
   * Updates discovery and finish times for visited nodes.
   * @param {number} currentVertexIDOneBased The 1-based ID of the vertex to start DFS from.
   */
  const performDepthFirstSearch = (currentVertexIDOneBased) => {
    // Convert 1-based vertex ID to a 0-based index for array access
    const currentVertexIndexZeroBased = currentVertexIDOneBased - 1;

    // Guard clause: Ensure the vertex index is within valid bounds
    if (currentVertexIndexZeroBased < 0 || currentVertexIndexZeroBased >= vertexCount) {
      console.warn(`Warning: Attempted DFS on an out-of-bounds vertex ID: ${currentVertexIDOneBased}. Skipping.`);
      return;
    }

    // Mark the current vertex as 'VISITING' (GRAY state)
    visitStatus[currentVertexIndexZeroBased] = NodeStatus.VISITING;
    // Record the discovery time and increment the global timer
    globalTimestampCounter++;
    discoveryTimestamps[currentVertexIndexZeroBased] = globalTimestampCounter;

    // Iterate over all direct neighbors of the current vertex
    const neighbors = adjacencyList[currentVertexIndexZeroBased];
    if (neighbors && neighbors.length > 0) { // Ensure there are neighbors to iterate
      for (const neighborIDOneBased of neighbors) {
        const neighborIndexZeroBased = neighborIDOneBased - 1;

        // If a neighbor has not been visited yet (UNVISITED/WHITE state), recurse
        if (visitStatus[neighborIndexZeroBased] === NodeStatus.UNVISITED) {
          performDepthFirstSearch(neighborIDOneBased); // Recursive call
        }
      }
    }

    // After all neighbors (and their subtrees) have been processed, mark the current vertex as 'VISITED' (BLACK state)
    visitStatus[currentVertexIndexZeroBased] = NodeStatus.VISITED;
    // Record the finish time and increment the global timer
    globalTimestampCounter++;
    finishTimestamps[currentVertexIndexZeroBased] = globalTimestampCounter;
  };

  // Initiate the DFS traversal starting from the first vertex (conventionally node 1)
  performDepthFirstSearch(1);

  // Output the discovery and finish times for each vertex
  console.log("--- DFS Traversal Results ---");
  console.log("Vertex ID | Discovery Time | Finish Time");
  console.log("-----------------------------------------");
  for (let vertexIdx = 0; vertexIdx < vertexCount; vertexIdx++) {
    // Use template literals for clean output formatting
    console.log(`${vertexIdx + 1} ${discoveryTimestamps[vertexIdx]} ${finishTimestamps[vertexIdx]}`);
  }
  console.log("-----------------------------------------");

})
(require('fs').readFileSync('/dev/stdin', 'utf8'));