let graphAdj = []; // Adjacency list representing the flow network
let numVertices, numEdges; // Variables to store the total number of vertices and edges

// Configure standard input stream to read data
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event handler for receiving input data
process.stdin.on('data', function(inputData) {
  // Split the entire input string into an array of lines
  const inputLines = inputData.split('\n');

  // Iterate through each line of input, excluding the potential empty last line
  for (let lineIndex = 0; lineIndex < inputLines.length - 1; ++lineIndex) {
    // The very first line specifies the number of vertices and edges
    if (lineIndex === 0) {
      // Parse the first line to get vertex and edge counts
      const vertexEdgeCounts = inputLines[lineIndex].split(' ').map(Number);
      numVertices = vertexEdgeCounts[0]; // Assign the number of vertices
      numEdges = vertexEdgeCounts[1];   // Assign the number of edges (not directly used in flow calculation)

      // Initialize the adjacency list for each vertex
      for (let vertexIndex = 0; vertexIndex < numVertices; ++vertexIndex) {
        graphAdj[vertexIndex] = []; // Each vertex starts with an empty list of outgoing edges
      }
    }
    // Subsequent lines define the edges of the graph
    else {
      // Parse the edge details (source, destination, capacity)
      const edgeDetails = inputLines[lineIndex].split(' ').map(Number);

      // Ensure the line contains valid edge information (three numbers)
      if (edgeDetails.length === 3) {
        // Add the edge to the graph's adjacency list
        establishConnection(edgeDetails[0], edgeDetails[1], edgeDetails[2]);
      }
    }
  }

  // Once all input is processed, compute and output the maximum flow
  console.log(computeMaximumFlow(0, numVertices - 1));
});

/**
 * Establishes a directed edge in the graph and its corresponding residual edge.
 * @param {number} sourceNode - The starting node of the edge.
 * @param {number} destinationNode - The ending node of the edge.
 * @param {number} edgeCapacity - The capacity of the forward edge.
 */
function establishConnection(sourceNode, destinationNode, edgeCapacity) {
  // Add the forward edge from source to destination
  // 'destination' is the target node, 'currentCapacity' is the edge's capacity,
  // 'reverseEdgeIndex' points to the reverse edge in the destination node's list.
  graphAdj[sourceNode].push({
    destination: destinationNode,
    currentCapacity: edgeCapacity,
    reverseEdgeIndex: graphAdj[destinationNode].length
  });

  // Add the reverse (residual) edge from destination to source
  // This edge initially has zero capacity and points back to the forward edge.
  graphAdj[destinationNode].push({
    destination: sourceNode,
    currentCapacity: 0,
    reverseEdgeIndex: graphAdj[sourceNode].length - 1
  });
}

let visitedNodes; // Array to track visited nodes during a DFS traversal

/**
 * Performs a Depth-First Search to find an augmenting path in the residual graph.
 * @param {number} currentVertex - The node currently being explored.
 * @param {number} targetVertex - The sink node of the flow network.
 * @param {number} pathFlow - The minimum capacity found along the path to the current vertex.
 * @returns {number} The amount of flow that can be pushed through this path, or 0 if no path exists.
 */
function findAugmentingPath(currentVertex, targetVertex, pathFlow) {
  // If the target vertex is reached, return the current path flow
  if (currentVertex === targetVertex) {
    return pathFlow;
  }

  // Mark the current vertex as visited to avoid cycles in this DFS run
  visitedNodes[currentVertex] = true;

  // Iterate through all outgoing edges from the current vertex
  for (let edgeIndex = 0; edgeIndex < graphAdj[currentVertex].length; ++edgeIndex) {
    const currentEdge = graphAdj[currentVertex][edgeIndex]; // Get the edge object

    // If the destination node has not been visited and the edge has remaining capacity
    if (!visitedNodes[currentEdge.destination] && currentEdge.currentCapacity > 0) {
      // Recursively call DFS for the next node, updating the bottleneck capacity
      const foundFlow = findAugmentingPath(
        currentEdge.destination,
        targetVertex,
        Math.min(pathFlow, currentEdge.currentCapacity)
      );

      // If a positive flow was found through this path
      if (foundFlow > 0) {
        // Decrease the capacity of the forward edge
        currentEdge.currentCapacity -= foundFlow;
        // Increase the capacity of the reverse edge (for residual graph updates)
        graphAdj[currentEdge.destination][currentEdge.reverseEdgeIndex].currentCapacity += foundFlow;

        // Return the flow found for this path
        return foundFlow;
      }
    }
  }

  // No augmenting path found from this vertex
  return 0;
}

/**
 * Calculates the maximum flow from a specified source node to a sink node
 * using an augmenting path algorithm (e.g., Edmonds-Karp variant).
 * @param {number} sourceNode - The starting node for flow.
 * @param {number} sinkNode - The ending node for flow.
 * @returns {number} The total maximum flow that can be sent from source to sink.
 */
function computeMaximumFlow(sourceNode, sinkNode) {
  let totalFlow = 0; // Initialize the total flow to zero

  // Continue finding augmenting paths until no more flow can be pushed
  while (true) {
    // Reset the visited nodes array for each new DFS traversal
    visitedNodes = new Array(numVertices).fill(false);

    // Find an augmenting path using DFS, starting with infinite capacity
    const currentPathFlow = findAugmentingPath(sourceNode, sinkNode, Number.POSITIVE_INFINITY);

    // Add the flow found in this path to the overall total flow
    totalFlow += currentPathFlow;

    // If no more flow can be pushed through any path, break the loop
    if (currentPathFlow === 0) {
      break;
    }
  }

  // Return the accumulated maximum flow
  return totalFlow;
}
