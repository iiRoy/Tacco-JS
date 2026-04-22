function analyzeGraphConnectivity(rawDataInput) {
  // Guard clause to handle null, undefined, or empty input strings.
  if (!rawDataInput || typeof rawDataInput !== 'string' || rawDataInput.trim() === '') {
    // In a real application, you might throw an error or log to a specific error stream.
    console.error("Input data is empty or invalid. Cannot proceed with graph analysis.");
    return;
  }

  // A utility function to safely parse integers.
  // This adds robustness against malformed input.
  const safeParseInt = (strValue, context = "value") => {
    const parsed = parseInt(strValue, 10);
    if (isNaN(parsed)) {
      throw new Error(`Failed to parse integer for ${context}: "${strValue}"`);
    }
    return parsed;
  };

  // Split the raw input string into an array of lines, removing any leading/trailing whitespace.
  const inputLinesArray = rawDataInput.trim().split('\n');

  // Ensure there's at least one line for graph dimensions.
  if (inputLinesArray.length < 1) {
    console.error("Insufficient input lines provided. Expected at least one line for graph dimensions.");
    return;
  }

  // Extract graph dimensions from the first line.
  const dimensionParts = inputLinesArray[0].split(' ');
  if (dimensionParts.length < 2) {
    console.error("The first line must specify both the number of nodes and edges, separated by a space.");
    return;
  }

  let totalVertexCount;
  let totalEdgeCount;
  try {
    totalVertexCount = safeParseInt(dimensionParts[0], "total nodes");
    totalEdgeCount = safeParseInt(dimensionParts[1], "total edges");
  } catch (error) {
    console.error(`Error processing graph dimensions: ${error.message}`);
    return;
  }

  // Handle edge cases for graph dimensions.
  if (totalVertexCount <= 0) {
    // A graph with zero or negative nodes is considered 'No' or trivial.
    // For a single node (0), it's connected to itself with distance 0 (output 1).
    if (totalVertexCount === 0) {
        console.log('No');
    } else { // totalVertexCount < 0
        console.error("Invalid number of vertices specified (cannot be negative).");
    }
    return;
  }
  if (totalVertexCount === 1) {
      console.log('Yes');
      console.log(1); // Node 0 is at distance 0 from itself, so output 0+1=1.
      return;
  }
  if (totalEdgeCount < 0) {
      console.error("Invalid number of edges specified (cannot be negative).");
      return;
  }

  // Validate if enough lines are provided for all edges.
  if (inputLinesArray.length - 1 < totalEdgeCount) {
    console.error(`Expected ${totalEdgeCount} edge definitions, but only ${inputLinesArray.length - 1} were found.`);
    return;
  }

  // Initialize the adjacency list for graph representation.
  // Each element in the array `graphStructure` will be an array of connected nodes.
  const graphStructure = Array.from({ length: totalVertexCount }, () => []);

  // Process each edge definition line to build the adjacency list.
  // Edge definitions start from the second line (index 1).
  for (let currentEdgeIdx = 0; currentEdgeIdx < totalEdgeCount; currentEdgeIdx++) {
    const edgeLine = inputLinesArray[currentEdgeIdx + 1];
    const edgeEnds = edgeLine.split(' ');

    if (edgeEnds.length < 2) {
      console.error(`Malformed edge definition on line ${currentEdgeIdx + 2}. Skipping.`);
      continue; // Skip this malformed line, or return/throw.
    }

    let nodeEndpointA;
    let nodeEndpointB;
    try {
      // Convert node identifiers from 1-based to 0-based indexing.
      nodeEndpointA = safeParseInt(edgeEnds[0], `node A on line ${currentEdgeIdx + 2}`) - 1;
      nodeEndpointB = safeParseInt(edgeEnds[1], `node B on line ${currentEdgeIdx + 2}`) - 1;
    } catch (error) {
      console.error(`Error parsing edge endpoints: ${error.message}`);
      return;
    }

    // Basic validation for node indices to prevent out-of-bounds access.
    if (nodeEndpointA < 0 || nodeEndpointA >= totalVertexCount ||
        nodeEndpointB < 0 || nodeEndpointB >= totalVertexCount) {
      console.error(`Invalid node index (${nodeEndpointA + 1}, ${nodeEndpointB + 1}) on line ${currentEdgeIdx + 2}. Nodes must be between 1 and ${totalVertexCount}.`);
      return;
    }

    // Add connections to the adjacency list for an undirected graph.
    graphStructure[nodeEndpointA].push(nodeEndpointB);
    graphStructure[nodeEndpointB].push(nodeEndpointA);
  }

  // --- Breadth-First Search (BFS) Algorithm for Shortest Paths ---

  // Array to store the shortest distance (level) from the source node (node 0) to all other nodes.
  // Initialized with -1 to signify 'unvisited'.
  const shortestPathDepths = Array(totalVertexCount).fill(-1);

  // A queue for managing nodes to visit in BFS order.
  const bfsQueue = [];

  // A Set for efficient tracking of visited nodes, preventing redundant processing.
  const exploredNodesSet = new Set();

  const sourceVertex = 0; // The BFS process always starts from node 0.

  // Initialize BFS: add source node to queue, mark as visited, set its depth.
  bfsQueue.push(sourceVertex);
  shortestPathDepths[sourceVertex] = 0;
  exploredNodesSet.add(sourceVertex);

  // Counter for the number of distinct nodes successfully reached during the traversal.
  let visitedNodeCounter = 1;

  // Continue BFS as long as there are nodes in the queue to process.
  while (bfsQueue.length > 0) {
    // Dequeue the next node to explore.
    const currentVertex = bfsQueue.shift();
    const currentVertexDepth = shortestPathDepths[currentVertex];

    // Iterate over all adjacent neighbors of the current node.
    // Using forEach for a more concise iteration.
    graphStructure[currentVertex].forEach(connectedNeighbor => {
      // If the neighbor has not been visited yet.
      if (!exploredNodesSet.has(connectedNeighbor)) {
        exploredNodesSet.add(connectedNeighbor); // Mark as visited.
        shortestPathDepths[connectedNeighbor] = currentVertexDepth + 1; // Set its depth.
        bfsQueue.push(connectedNeighbor); // Enqueue for further exploration.
        visitedNodeCounter++; // Increment count of reachable nodes.
      }
    });
  }

  // --- Determine Connectivity and Generate Final Output ---

  // If the number of visited nodes does not equal the total number of nodes,
  // it means the graph is not fully connected from the starting node.
  if (visitedNodeCounter !== totalVertexCount) {
    console.log('No');
  } else {
    // The graph is fully connected from the source node.
    console.log('Yes');

    // Generate the output array, which contains the 'level + 1' for nodes 1 to N-1.
    // The original logic implies skipping node 0's output in this loop.
    const distancesForOutput = shortestPathDepths
                                .slice(1) // Exclude the depth of node 0
                                .map(depthValue => depthValue + 1); // Convert 0-based depth to 1-based level.

    // Print each calculated level.
    distancesForOutput.forEach(levelOutput => {
      console.log(levelOutput);
    });
  }
}

// Entry point for execution: Read input from standard input and pass to the analysis function.
// This part is typically environment-dependent and kept close to the original for execution context.
analyzeGraphConnectivity(require('fs').readFileSync('/dev/stdin', 'utf8'));