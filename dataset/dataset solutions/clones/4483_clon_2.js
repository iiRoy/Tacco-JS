function ProcessInput(rawData) {
  // Split the raw input string into individual lines based on newline characters.
  let dataLines = rawData.split('\n');

  // Parse the total number of nodes from the first line of input.
  const nodeCount = parseInt(dataLines[0], 10);

  // Initialize an array to store shortest path distances from the initial node (node 0).
  // All distances are set to 'nodeCount', serving as an "infinity" value.
  let distancesFromStart = new Array(nodeCount).fill(nodeCount);
  // The distance from the starting node (node 0) to itself is zero.
  distancesFromStart[0] = 0;

  // Initialize an array to store shortest path distances from the final node (node nodeCount - 1).
  // All distances are also set to 'nodeCount'.
  let distancesFromEnd = new Array(nodeCount).fill(nodeCount);
  // The distance from the ending node (node nodeCount - 1) to itself is zero.
  distancesFromEnd[nodeCount - 1] = 0;

  // Create an adjacency list to represent the graph structure.
  // Using `fill([])` initially makes all elements reference the same empty array.
  // However, the subsequent loop logic reassigns these references to new arrays as needed.
  let adjacencyList = new Array(nodeCount).fill([]);

  // Iterate through the input lines to construct the graph's edges.
  // Each line (after the first) describes an edge between two nodes.
  for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
    // Parse the two node identifiers for the current edge.
    const edgeIdentifiers = dataLines[edgeIndex + 1].split(' ');
    const firstNode = parseInt(edgeIdentifiers[0], 10) - 1; // Convert to 0-based index
    const secondNode = parseInt(edgeIdentifiers[1], 10) - 1; // Convert to 0-based index

    // Add the second node to the adjacency list of the first node.
    // If the list for 'firstNode' is still the initial shared empty array, reassign it.
    if (adjacencyList[firstNode].length === 0) {
      adjacencyList[firstNode] = [secondNode];
    } else {
      // Otherwise, push the second node to the existing list.
      adjacencyList[firstNode].push(secondNode);
    }

    // Add the first node to the adjacency list of the second node (for an undirected graph).
    // Similar logic: reassign if it's the initial shared empty array, otherwise push.
    if (adjacencyList[secondNode].length === 0) {
      adjacencyList[secondNode] = [firstNode];
    } else {
      adjacencyList[secondNode].push(firstNode);
    }
  }

  // This helper function computes shortest path distances from a specified starting node
  // to all other nodes in the graph. It uses a Dijkstra-like algorithm.
  function calculateDistances(initialNode, distanceArray) {
    // Initialize a list of all nodes that have not yet been visited.
    let unvisitedNodes = new Array(nodeCount);
    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
      unvisitedNodes[nodeIdx] = nodeIdx;
    }

    // Set the current node for processing to the initial node.
    let currentNode = initialNode;

    // Continue the process as long as there are nodes remaining to be visited.
    while (unvisitedNodes.length !== 0) {
      // Examine all neighbors of the current node.
      for (let neighborIndex = 0; neighborIndex < adjacencyList[currentNode].length; neighborIndex++) {
        const neighborNode = adjacencyList[currentNode][neighborIndex];
        // If a shorter path to the neighbor is found through the current node, update its distance.
        if (distanceArray[neighborNode] > distanceArray[currentNode]) {
          distanceArray[neighborNode] = distanceArray[currentNode] + 1;
        }
      }

      // Remove the current node from the set of unvisited nodes.
      // The current node is guaranteed to be in 'unvisitedNodes' at this point.
      unvisitedNodes.splice(unvisitedNodes.indexOf(currentNode), 1);

      // Find the next node to process: the unvisited node with the smallest known distance.
      let minDistance = nodeCount + 1; // Initialize with a value greater than any possible distance
      let nextNodeToVisit = -1; // Placeholder for the next node with minimum distance

      for (let queueIndex = 0; queueIndex < unvisitedNodes.length; queueIndex++) {
        const candidateNode = unvisitedNodes[queueIndex];
        if (distanceArray[candidateNode] < minDistance) {
          nextNodeToVisit = candidateNode;
          minDistance = distanceArray[candidateNode];
        }
      }
      // Update the current node to the one found with the minimum distance for the next iteration.
      // If 'unvisitedNodes' became empty, 'nextNodeToVisit' remains -1, but the 'while' loop
      // condition will correctly terminate the function in the next iteration.
      currentNode = nextNodeToVisit;
    }
    // Return the array containing the calculated shortest distances.
    return distanceArray;
  }

  // Calculate shortest distances from node 0 (Fennec's starting position).
  distancesFromStart = calculateDistances(0, distancesFromStart);
  // Calculate shortest distances from node nodeCount - 1 (Snuke's starting position).
  distancesFromEnd = calculateDistances(nodeCount - 1, distancesFromEnd);

  // Count the number of nodes that are closer to Fennec's start (node 0)
  // than to Snuke's start (node nodeCount - 1).
  // Exclude the actual start and end nodes from this count.
  let fennecNodesCount = 0;
  for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
    // Only consider intermediate nodes, not the start (0) or end (nodeCount - 1) nodes.
    if (nodeIndex !== 0 && nodeIndex !== nodeCount - 1) {
      // If the distance from Fennec's start is less than or equal to Snuke's start,
      // Fennec "controls" this node.
      if (distancesFromStart[nodeIndex] <= distancesFromEnd[nodeIndex]) {
        fennecNodesCount++;
      }
    }
  }

  // Determine the winner based on the count of controlled nodes.
  // Fennec controls 'fennecNodesCount' nodes.
  // Snuke controls the remaining 'nodeCount - 2 - fennecNodesCount' nodes.
  let winnerName = "Fennec";
  if (fennecNodesCount <= (nodeCount - 2 - fennecNodesCount)) {
    winnerName = "Snuke";
  }

  // Output the name of the determined winner to the console.
  console.log('%s', winnerName);
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
