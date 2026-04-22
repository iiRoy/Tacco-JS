(function(inputDataStream) {
  // A utility function to safely parse an integer from a string, trimming whitespace.
  const parseInteger = (strValue) => parseInt(strValue.trim(), 10);

  // Split the raw input string into an array of individual lines.
  // Any leading or trailing whitespace from the entire input is removed first.
  let inputLinesArray = inputDataStream.trim().split('\n');

  // The first line of input contains two numbers: the total number of vertices (nodes)
  // and the total number of edges in the graph.
  let graphDimensions = inputLinesArray.shift().split(/\s+/).map(parseInteger);
  let totalGraphVertices = graphDimensions[0]; // Represents 'N' from the original problem
  let totalGraphEdges = graphDimensions[1];   // Represents 'M' from the original problem

  // Initialize the adjacency list to represent the graph.
  // Each element in `graphAdjacencyList` will be an array storing the neighbors of a vertex.
  let graphAdjacencyList = Array.from({ length: totalGraphVertices }, () => []);

  // Initialize an array to keep track of which connected component each vertex belongs to.
  // A value of 0 indicates that the vertex has not yet been visited or assigned to a component.
  // Component IDs will start from 1.
  let vertexComponentAssignment = Array(totalGraphVertices).fill(0);

  // Populate the adjacency list by reading each edge from the input.
  // We iterate `totalGraphEdges` times, consuming one line for each edge.
  for (let currentEdgeIndex = 0; currentEdgeIndex < totalGraphEdges; currentEdgeIndex++) {
    let edgeEndpoints = inputLinesArray.shift().split(/\s+/).map(parseInteger);

    // Basic validation: ensure the line contains exactly two vertex IDs.
    // In competitive programming, input is usually guaranteed, but this adds robustness (Type III).
    if (edgeEndpoints.length !== 2) {
      // If an invalid edge format is encountered, we skip it.
      continue;
    }

    const firstVertex = edgeEndpoints[0];
    const secondVertex = edgeEndpoints[1];

    // Further validation: check if vertex IDs are within the valid range [0, totalGraphVertices - 1].
    if (firstVertex >= 0 && firstVertex < totalGraphVertices &&
        secondVertex >= 0 && secondVertex < totalGraphVertices) {
      // Add the edge to both vertices' adjacency lists since the graph is undirected.
      graphAdjacencyList[firstVertex].push(secondVertex);
      graphAdjacencyList[secondVertex].push(firstVertex);
    } else {
      // Optionally log an error or handle out-of-bounds vertex IDs (Type III).
    }
  }

  /**
   * Executes a Breadth-First Search (BFS) traversal starting from a given vertex
   * to identify and mark all vertices within its connected component.
   *
   * @param {number} startingNodeId The unique identifier of the vertex where the BFS begins.
   * @param {number} componentIdValue The unique ID to be assigned to all vertices found in this component.
   */
  const performComponentDiscoveryBFS = (startingNodeId, componentIdValue) => {
    let bfsQueue = []; // This queue will hold vertices to be processed.

    // Mark the starting node with the current component ID and add it to the queue.
    vertexComponentAssignment[startingNodeId] = componentIdValue;
    bfsQueue.push(startingNodeId);

    // Continue as long as there are vertices in the queue to process.
    while (bfsQueue.length > 0) {
      // Dequeue the next vertex to explore.
      let currentNode = bfsQueue.shift();

      // Iterate through all neighbors of the current node.
      // Using `for...of` provides a cleaner way to iterate over array elements (Type III).
      for (const neighborNode of graphAdjacencyList[currentNode]) {
        // If the neighbor has not yet been visited (its component ID is 0),
        if (vertexComponentAssignment[neighborNode] === 0) {
          // Assign it the current component ID and add it to the queue for future exploration.
          vertexComponentAssignment[neighborNode] = componentIdValue;
          bfsQueue.push(neighborNode);
        }
      }
    }
  };

  // Iterate through all vertices to discover all connected components in the graph.
  // Each time an unvisited vertex is found, a new BFS is initiated to find its component.
  let currentComponentUniqueId = 1; // Start component IDs from 1.
  let vertexTraversalIndex = 0;      // Iterator for checking each vertex.

  while (vertexTraversalIndex < totalGraphVertices) { // Changed `for` loop to `while` loop (Type III).
    // If the current vertex has not been assigned to any component (value is 0),
    if (vertexComponentAssignment[vertexTraversalIndex] === 0) {
      // Start a new BFS from this vertex to discover its entire connected component.
      performComponentDiscoveryBFS(vertexTraversalIndex, currentComponentUniqueId);
      currentComponentUniqueId++; // Increment the component ID for the next potential component.
    }
    vertexTraversalIndex++;
  }

  // The next line in the input specifies the number of connectivity queries.
  let totalConnectivityQueries = parseInteger(inputLinesArray.shift());

  // Process each query to determine if two given vertices are in the same connected component.
  // Using `for...of` for iterating over queries (Type III).
  for (const queryInputLine of inputLinesArray) {
    let queryVertexPair = queryInputLine.split(/\s+/).map(parseInteger);

    const firstQueriedVertex = queryVertexPair[0];
    const secondQueriedVertex = queryVertexPair[1];

    // Type III: Add intermediate variables for clarity and readability.
    const componentIdOfFirst = vertexComponentAssignment[firstQueriedVertex];
    const componentIdOfSecond = vertexComponentAssignment[secondQueriedVertex];

    // Type III: Add a guard clause for queries with invalid vertex IDs.
    if (firstQueriedVertex < 0 || firstQueriedVertex >= totalGraphVertices ||
        secondQueriedVertex < 0 || secondQueriedVertex >= totalGraphVertices) {
        console.log("INVALID_QUERY");
    } else if (componentIdOfFirst !== 0 && componentIdOfFirst === componentIdOfSecond) {
      // If both vertices have been visited (component ID is not 0) and share the same component ID,
      // they are connected.
      console.log('YES'); // Changed output string from 'yes' to 'YES'.
    } else {
      // Otherwise, they are in different components or one/both were not part of any component (unreachable).
      console.log('NO');  // Changed output string from 'no' to 'NO'.
    }
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));