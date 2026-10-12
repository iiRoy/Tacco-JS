console.log((function(inputStr){
  // Helper function to parse a space-separated string of numbers into an array of integers
  const parseNumericLine = (lineString) => lineString.split(' ').map(s => parseInt(s, 10));

  // Split the entire input string into individual lines
  const allInputLines = inputStr.trim().split('\n');

  // The first line contains the number of nodes
  const [numNodes] = parseNumericLine(allInputLines[0]);

  // The rest of the lines contain edge data
  const edgeDataLines = allInputLines.slice(1);

  // Initialize the adjacency list for the graph.
  // Each element `graphAdjList[i]` will be an array of `[neighborNodeId, edgeWeightParity]` tuples.
  const graphAdjList = new Array(numNodes).fill(null).map(() => []);

  // Constants for clarity in node indexing and loop bounds
  const NODE_ID_OFFSET = 1; // Input node IDs are 1-based, convert to 0-based
  const TOTAL_EDGES_TO_PROCESS = numNodes - 1;

  // Populate the adjacency list with edges
  for (let edgeIndex = 0; edgeIndex < TOTAL_EDGES_TO_PROCESS; edgeIndex++) {
    const [nodeA_raw, nodeB_raw, edgeWeight] = parseNumericLine(edgeDataLines[edgeIndex]);
    
    // Convert 1-based node IDs to 0-based
    const nodeA_zeroBased = nodeA_raw - NODE_ID_OFFSET;
    const nodeB_zeroBased = nodeB_raw - NODE_ID_OFFSET;
    
    // Determine the parity of the edge weight (0 for even, 1 for odd)
    const edgeWeightParity = edgeWeight % 2;

    // Add edges to the adjacency list for both nodes (undirected graph)
    graphAdjList[nodeA_zeroBased].push([nodeB_zeroBased, edgeWeightParity]);
    graphAdjList[nodeB_zeroBased].push([nodeA_zeroBased, edgeWeightParity]);
  }

  // Initialize an array to store the assigned color (0 or 1) for each node.
  // Use Number.NaN as a sentinel value to indicate an uncolored node.
  const nodeColorAssignments = new Array(numNodes).fill(Number.NaN);

  // Perform a Depth-First Search (DFS) to color the graph
  const STARTING_NODE_ID = 0;
  const INITIAL_NODE_COLOR = 0; // Assign color 0 to the starting node

  nodeColorAssignments[STARTING_NODE_ID] = INITIAL_NODE_COLOR;
  const dfsTraversalStack = [STARTING_NODE_ID];

  while (dfsTraversalStack.length > 0) {
    const currentNodeId = dfsTraversalStack.pop();

    // Iterate through all neighbors of the current node
    for (const [neighborNodeId, edgeParity] of graphAdjList[currentNodeId]) {
      // If the neighbor has already been colored, skip it
      if (!Number.isNaN(nodeColorAssignments[neighborNodeId])) {
        continue;
      }

      // Push the uncolored neighbor onto the stack for future processing
      dfsTraversalStack.push(neighborNodeId);

      // Determine the neighbor's color based on the current node's color and edge weight parity
      const parentColor = nodeColorAssignments[currentNodeId];
      if (edgeParity === 1) { // If edge weight is odd, the neighbor's color must be opposite
        nodeColorAssignments[neighborNodeId] = 1 - parentColor;
      } else { // If edge weight is even, the neighbor's color must be the same
        nodeColorAssignments[neighborNodeId] = parentColor;
      }
    }
  }

  // Join the final node colors with newline characters and return the result
  return nodeColorAssignments.join('\n');
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
