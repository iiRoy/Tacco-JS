let network = []; // Adjacency list representation of the flow network
let totalVertices, totalConnections; // Store graph dimensions

process.stdin.resume(); // Ensure the input stream remains open
process.stdin.setEncoding('utf8'); // Set encoding for incoming data
process.stdin.on('data', function (incomingData) { // Event listener for data chunks
  const inputRows = incomingData.split('\n'); // Split raw input into individual lines

  for (let lineIndex = 0; lineIndex < inputRows.length - 1; ++lineIndex) { // Iterate through each line of input
    if (lineIndex === 0) { // Process the very first line for graph dimensions
      const graphDimensions = inputRows[lineIndex].split(' ').map(Number); // Parse vertex and edge counts
      totalVertices = graphDimensions[0]; // Assign total number of nodes
      totalConnections = graphDimensions[1]; // Assign total number of connections

      for (let nodeIterator = 0; nodeIterator < totalVertices; ++nodeIterator) { // Initialize adjacency list for each node
        network[nodeIterator] = []; // Create an empty array for node's connections
      }
    } else { // Process subsequent lines as edge definitions
      const connectionDetails = inputRows[lineIndex].split(' ').map(Number); // Parse edge details (from, to, capacity)

      if (connectionDetails.length === 3) { // Ensure all three details (u, v, c) are present
        insertConnection(connectionDetails[0], connectionDetails[1], connectionDetails[2]); // Add the connection to the network
      }
    }
  }

  console.log(determineNetworkFlow(0, totalVertices - 1)); // Print the maximum flow from source (0) to sink (V-1)
});

function insertConnection(originNode, destinationNode, flowCapacity) { // Function to add a directed edge to the network
  network[originNode].push({ destination: destinationNode, capacity: flowCapacity, reverseIndex: network[destinationNode].length }); // Add forward edge with its capacity and a reference to its reverse
  network[destinationNode].push({ destination: originNode, capacity: 0, reverseIndex: network[originNode].length - 1 }); // Add backward (residual) edge with zero capacity
}

let visitedNodes; // Array to keep track of visited nodes during DFS

function depthFirstSearch(currentNode, sinkNode, currentFlow) { // Performs DFS to find an augmenting path
  if (currentNode === sinkNode) { // If sink is reached, return the current flow as an augmenting path is found
    return currentFlow;
  }

  visitedNodes[currentNode] = true; // Mark current node as visited to avoid cycles

  for (let edgeIndex = 0; edgeIndex < network[currentNode].length; ++edgeIndex) { // Iterate through all outgoing edges from current node
    const currentEdge = network[currentNode][edgeIndex]; // Get the current edge object

    // Check if the destination node has not been visited and the edge has remaining capacity
    if (!visitedNodes[currentEdge.destination] && currentEdge.capacity > 0) {
      // Recursively find flow through the path, limited by current flow and edge capacity
      const pathFlow = depthFirstSearch(currentEdge.destination, sinkNode, Math.min(currentFlow, currentEdge.capacity));

      if (pathFlow > 0) { // If an augmenting path is found with positive flow
        currentEdge.capacity -= pathFlow; // Reduce capacity of the forward edge
        network[currentEdge.destination][currentEdge.reverseIndex].capacity += pathFlow; // Increase capacity of the reverse (residual) edge
        return pathFlow; // Return the found flow for this path
      }
    }
  }

  return 0; // No augmenting path found from this node
}

function determineNetworkFlow(sourceNode, targetNode) { // Calculates the maximum flow from source to target
  let totalFlowAccumulated = 0; // Initialize total flow accumulated

  while (true) { // Loop until no more augmenting paths can be found
    visitedNodes = new Array(totalVertices).fill(false); // Reset visited status for each DFS iteration
    const foundPathFlow = depthFirstSearch(sourceNode, targetNode, Infinity); // Find an augmenting path and its flow, starting with infinite capacity

    totalFlowAccumulated += foundPathFlow; // Add the found path flow to the total

    if (foundPathFlow === 0) { // If no flow was found in this iteration, it means no more augmenting paths exist
      break; // Exit the loop
    }
  }

  return totalFlowAccumulated; // Return the final maximum flow
}