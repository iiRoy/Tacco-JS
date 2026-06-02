(function(inputDataSource) {
  // Define a constant for an unassigned component ID, enhancing readability.
  const UNASSIGNED_COMPONENT_ID = null;

  // Helper function to parse the initial graph dimensions (N and M).
  const extractGraphDimensions = (dimensionLine) => {
    const dimensionParts = dimensionLine.split(' ').map(Number);
    // Return an object for clearer access to N (nodeCount) and M (edgeCount).
    return {
      nodeCount: dimensionParts[0],
      edgeCount: dimensionParts[1]
    };
  };

  // Helper function to initialize the adjacency list and component color array.
  const prepareGraphStructures = (totalNodes, initialColorState) => {
    const graphAdjacencyList = [];
    const nodeComponentColors = [];
    for (let nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
      graphAdjacencyList.push([]);
      nodeComponentColors.push(initialColorState); // Initialize all nodes as unassigned.
    }
    return { graphAdjacencyList, nodeComponentColors };
  };

  // Read and process the entire input data, splitting it into individual lines.
  const inputLines = inputDataSource.trim().split('\n');

  // Parse the first line to get N (number of nodes) and M (number of edges) using the helper.
  const { nodeCount, edgeCount } = extractGraphDimensions(inputLines.shift());

  // Initialize graph structures (adjacency list and component colors) using the helper.
  const { graphAdjacencyList, nodeComponentColors } = prepareGraphStructures(nodeCount, UNASSIGNED_COMPONENT_ID);

  // Populate the adjacency list with edges.
  // This loop processes M lines, each defining an edge between two nodes.
  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const currentEdgeNodes = inputLines.shift().split(' ').map(Number);
    const firstNode = currentEdgeNodes[0];
    const secondNode = currentEdgeNodes[1];
    // Add edges for an undirected graph, ensuring connectivity in both directions.
    graphAdjacencyList[firstNode].push(secondNode);
    graphAdjacencyList[secondNode].push(firstNode);
  }

  // Function to perform a Breadth-First Search (BFS) to find connected components.
  // Renamed from 'dfs' to 'traverseComponentBFS' to accurately reflect its BFS behavior
  // due to the use of `queue.shift()` for node processing.
  function traverseComponentBFS(startNode, currentComponentIdentifier) {
    const bfsQueue = []; // Initialize a queue for BFS traversal.
    nodeComponentColors[startNode] = currentComponentIdentifier; // Assign the starting node to the current component.
    bfsQueue.push(startNode); // Enqueue the starting node.

    while (bfsQueue.length > 0) {
      const processingNode = bfsQueue.shift(); // Dequeue the next node to process.

      // Iterate through all neighbors of the current processing node.
      for (let neighborIdx = 0; neighborIdx < graphAdjacencyList[processingNode].length; neighborIdx++) {
        const neighborNodeId = graphAdjacencyList[processingNode][neighborIdx];
        // If the neighbor has not yet been assigned to any component.
        if (nodeComponentColors[neighborNodeId] === UNASSIGNED_COMPONENT_ID) {
          nodeComponentColors[neighborNodeId] = currentComponentIdentifier; // Assign it to the current component.
          bfsQueue.push(neighborNodeId); // Enqueue the neighbor for further exploration.
        }
      }
    }
  }

  let nextComponentId = 1; // Initialize component IDs, starting from 1.

  // Iterate through all nodes to find unvisited ones and assign them to new components.
  for (let nodeIdentifier = 0; nodeIdentifier < nodeCount; nodeIdentifier++) {
    if (nodeComponentColors[nodeIdentifier] === UNASSIGNED_COMPONENT_ID) {
      // If a node hasn't been visited (i.e., not assigned to a component),
      // start a new BFS traversal from it to find its connected component.
      traverseComponentBFS(nodeIdentifier, nextComponentId++);
    }
  }

  // Parse the number of queries from the next line of input.
  const numberOfQueries = Number(inputLines.shift());

  // Process each query to check if two specified nodes are in the same connected component.
  // Changed from a forEach loop to a traditional for loop for structural variation.
  for (let queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) {
    const queryLine = inputLines[queryIndex]; // Access the query line directly by index.
    const queryNodePair = queryLine.split(' ').map(Number);
    const queryNodeA = queryNodePair[0];
    const queryNodeB = queryNodePair[1];

    // Determine if both nodes belong to the same connected component by comparing their assigned IDs.
    const areNodesConnected = (nodeComponentColors[queryNodeA] === nodeComponentColors[queryNodeB]);

    // Output 'yes' if they are in the same component, otherwise 'no'.
    console.log(areNodesConnected ? 'yes' : 'no');
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
