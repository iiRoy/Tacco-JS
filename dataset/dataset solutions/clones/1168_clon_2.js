var adjList = []; // Adjacency list for the graph
var numNodes, numEdges; // Number of vertices and edges

// Resume standard input and set encoding
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data on standard input
process.stdin.on('data', function(rawData) {
  // Split the input into individual lines
  var inputLines = rawData.split('\n');

  // Iterate through each line of input
  for (var lineIndex = 0; lineIndex < inputLines.length; ++lineIndex) {
    // The first line contains the number of vertices and edges
    if (lineIndex === 0) {
      var vertexEdgeCounts = inputLines[lineIndex].split(' ').map(Number);
      numNodes = vertexEdgeCounts[0];
      numEdges = vertexEdgeCounts[1];

      // Initialize the adjacency list for each node
      for (var nodeIndex = 0; nodeIndex < numNodes; ++nodeIndex) {
        adjList[nodeIndex] = [];
      }
    }
    // Subsequent lines define the edges
    else {
      var edgeDetails = inputLines[lineIndex].split(' ').map(Number);
      // Add the edge to the graph
      connectNodes(edgeDetails[0], edgeDetails[1], edgeDetails[2]);
    }
  }

  // Calculate and print the maximum flow from source (0) to sink (V-1)
  console.log(calculateMaxFlow(0, numNodes - 1));
});

/**
 * Adds a directed edge to the graph with a given capacity.
 * Also adds a reverse edge with 0 capacity for residual graph.
 * @param {number} origin - The starting node of the edge.
 * @param {number} destination - The ending node of the edge.
 * @param {number} capacity - The capacity of the edge.
 */
function connectNodes(origin, destination, capacity) {
  // Add forward edge
  adjList[origin].push({
    target: destination,
    flowCapacity: capacity,
    reverseIndex: adjList[destination].length
  });
  // Add backward (residual) edge
  adjList[destination].push({
    target: origin,
    flowCapacity: 0,
    reverseIndex: adjList[origin].length - 1
  });
}

var visitedNodes; // Array to keep track of visited nodes during DFS

/**
 * Performs a Depth First Search to find an augmenting path in the residual graph.
 * @param {number} currentNode - The current node in the DFS traversal.
 * @param {number} targetNode - The sink node.
 * @param {number} currentFlow - The minimum capacity found so far on the path to currentNode.
 * @returns {number} The amount of flow pushed through the found path, or 0 if no path.
 */
function depthFirstSearch(currentNode, targetNode, currentFlow) {
  // If we reached the sink node, return the current flow
  if (currentNode === targetNode) {
    return currentFlow;
  }

  // Mark the current node as visited
  visitedNodes[currentNode] = true;

  // Iterate through all edges from the current node
  for (var edgeIndex = 0; edgeIndex < adjList[currentNode].length; ++edgeIndex) {
    var currentEdge = adjList[currentNode][edgeIndex];

    // If the neighbor is not visited and the edge has remaining capacity
    if (!visitedNodes[currentEdge.target] && currentEdge.flowCapacity > 0) {
      // Recursively call DFS for the neighbor
      var resultantFlow = depthFirstSearch(
        currentEdge.target,
        targetNode,
        Math.min(currentFlow, currentEdge.flowCapacity)
      );

      // If flow was pushed through this path
      if (resultantFlow > 0) {
        // Reduce capacity of forward edge
        currentEdge.flowCapacity -= resultantFlow;
        // Increase capacity of reverse edge
        adjList[currentEdge.target][currentEdge.reverseIndex].flowCapacity += resultantFlow;

        return resultantFlow; // Return the flow found
      }
    }
  }

  return 0; // No augmenting path found from this node
}

/**
 * Calculates the maximum flow from a source node to a sink node using the Edmonds-Karp algorithm.
 * @param {number} sourceNode - The starting node for flow.
 * @param {number} sinkNode - The ending node for flow.
 * @returns {number} The total maximum flow.
 */
function calculateMaxFlow(sourceNode, sinkNode) {
  var totalFlow = 0; // Initialize total flow to zero

  // Loop until no more augmenting paths can be found
  while (true) {
    // Reset visited nodes for each DFS iteration
    visitedNodes = new Array(numNodes).fill(false);

    // Find an augmenting path using DFS
    var resultantFlow = depthFirstSearch(sourceNode, sinkNode, Number.POSITIVE_INFINITY);

    // Add the flow found in this path to the total flow
    totalFlow += resultantFlow;

    // If no flow was pushed, it means no more augmenting paths exist
    if (resultantFlow === 0) {
      break; // Exit the loop
    }
  }

  return totalFlow; // Return the maximum flow
}
