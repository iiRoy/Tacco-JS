function processInputData(rawData) {
  // Parse the raw input string into an array of lines.
  const parsedLines = rawData.trim().split('\n');

  // Extract the number of nodes (vertices) and edges (connections).
  // Using Number() for explicit type conversion.
  let totalVertices = Number(parsedLines[0].split(' ')[0]);
  let totalEdges = Number(parsedLines[0].split(' ')[1]);

  // Initialize an adjacency list to represent the graph.
  // Each element in graphAdjacency[k] will be a list of nodes connected to node k.
  var graphAdjacency = [];
  for (let vertexIndex = 0; vertexIndex < totalVertices; vertexIndex++) {
    graphAdjacency.push([]);
  }

  // Populate the adjacency list based on the provided edge data.
  // Edges are 1-indexed in input, convert to 0-indexed for array access.
  for (let edgeLineIndex = 1; edgeLineIndex <= totalEdges; edgeLineIndex++) {
    const edgeData = parsedLines[edgeLineIndex].split(' ');
    let firstVertex = Number(edgeData[0]) - 1;
    let secondVertex = Number(edgeData[1]) - 1;

    // For an undirected graph, add connection in both directions.
    graphAdjacency[firstVertex].push(secondVertex);
    graphAdjacency[secondVertex].push(firstVertex);
  }

  // --- Breadth-First Search (BFS) for shortest path to all reachable nodes ---

  // Keep track of visited nodes to avoid cycles and redundant processing.
  // Start with node 0 as visited.
  var visitedVertices = [0];

  // Flag to control the BFS loop.
  let bfsInProgress = true;

  // Current depth/level in the BFS tree.
  var currentDepth = 0;

  // Nodes to be processed in the current depth level.
  var nodesToProcessInCurrentDepth = [0];

  // Stores nodes grouped by their depth level from the starting node.
  var depthLevels = [];

  // Main BFS traversal loop.
  while (bfsInProgress) {
    // Prepare for the current depth level's nodes.
    depthLevels.push([]);
    let newlyReachedCount = 0;
    var nodesForNextDepth = [];

    // Iterate through all nodes at the current depth.
    for (let k = 0; k < nodesToProcessInCurrentDepth.length; k++) {
      const currentNode = nodesToProcessInCurrentDepth[k];

      // Examine all neighbors of the current node.
      for (let l = 0; l < graphAdjacency[currentNode].length; l++) {
        const neighborNode = graphAdjacency[currentNode][l];

        // If the neighbor hasn't been visited yet, process it.
        if (!visitedVertices.includes(neighborNode)) {
          newlyReachedCount++; // Increment count of newly discovered nodes.
          nodesForNextDepth.push(neighborNode); // Add to the next depth's processing queue.
          depthLevels[currentDepth].push(neighborNode); // Assign to current depth level.
          visitedVertices.push(neighborNode); // Mark as visited.
        }
      }
    }

    // Move to the next depth level.
    currentDepth++;
    // Update nodes for the next iteration. Using slice() to create a shallow copy.
    nodesToProcessInCurrentDepth = nodesForNextDepth.slice();

    // If no new nodes were discovered in this depth, the BFS is complete.
    if (newlyReachedCount === 0) {
      bfsInProgress = false;
    }
  }

  // --- Process BFS results ---

  // Initialize an array to store the shortest distance (depth) for each node.
  var distanceResults = [];
  for (let m = 0; m < totalVertices; m++) {
    distanceResults.push(0); // Default to 0, will be overwritten.
  }

  // Populate the distanceResults array with the depth level of each node.
  for (let n = 0; n < depthLevels.length; n++) {
    for (let p = 0; p < depthLevels[n].length; p++) {
      distanceResults[depthLevels[n][p]] = n;
    }
  }

  // The problem implies that node 0 is the starting node and might not be
  // part of the final output, or its depth is implicitly 0.
  // Removing the first element (corresponding to node 0).
  distanceResults.shift();

  // --- Final Output Decision ---

  // Check if all nodes were reachable from the starting node (node 0).
  if (visitedVertices.length !== totalVertices) {
    console.log('No'); // Not all nodes were visited.
  } else {
    console.log('Yes'); // All nodes were visited.
    // Print the depth (distance + 1 for 1-based output) for each node.
    for (let q = 0; q < distanceResults.length; q++) {
      console.log(distanceResults[q] + 1);
    }
  }
  // Outputting the full level structure for debugging is sometimes useful.
}

// Read input from standard input and pass it to the processing function.
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));