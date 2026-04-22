function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  rawData = rawData.split("\n");

  // Parse the first line to get the total number of nodes
  let nodeCount = parseInt(rawData[0]);

  // Initialize an array to store distances from the starting node (node 0)
  // Fill with a large number (nodeCount) representing "infinity" or unvisited
  let distFromStart = Array(nodeCount).fill(nodeCount);
  // Set the distance of the starting node (0) to itself as 0
  distFromStart[0] = 0;

  // Initialize an array to store distances from the ending node (nodeCount - 1)
  // Fill with a large number (nodeCount)
  let distFromEnd = Array(nodeCount).fill(nodeCount);
  // Set the distance of the ending node (nodeCount - 1) to itself as 0
  distFromEnd[nodeCount - 1] = 0;

  // Create an adjacency list to represent the graph structure
  // Each element will be an array of connected nodes
  const graphEdges = Array.from({ length: nodeCount }, () => []);

  // Loop through the input lines to build the graph
  // Each line (after the first) represents an edge between two nodes
  for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
    // Parse the current line to get the two connected nodes
    const edgeParts = rawData[edgeIndex + 1].split(" ");
    let nodeA = parseInt(edgeParts[0]) - 1; // Adjust to 0-indexed
    let nodeB = parseInt(edgeParts[1]) - 1; // Adjust to 0-indexed

    // Add nodeB to nodeA's adjacency list
    if (graphEdges[nodeA].length === 0) {
      graphEdges[nodeA] = [nodeB];
    } else {
      graphEdges[nodeA].push(nodeB);
    }

    // Add nodeA to nodeB's adjacency list (undirected graph)
    if (graphEdges[nodeB].length === 0) {
      graphEdges[nodeB] = [nodeA];
    } else {
      graphEdges[nodeB].push(nodeA);
    }
  }

  // This variable is declared but not used in the original logic.
  // It's kept for structural similarity.
  let temporaryQueue = [];

  // Function to perform a Breadth-First Search (BFS) to calculate distances
  // from a given start node to all other reachable nodes.
  function computePathLengths(beginNode, distanceArray) {
    // Initialize a queue for BFS traversal
    let bfsQueue = [];
    bfsQueue[0] = beginNode; // Add the starting node to the queue

    // Continue as long as there are nodes in the queue to process
    while (bfsQueue.length !== 0) {
      // Get the current node from the front of the queue
      let currentVertex = bfsQueue.shift();

      // Iterate through all neighbors of the current node
      for (let neighborIdx = 0; neighborIdx < graphEdges[currentVertex].length; neighborIdx++) {
        const neighborNode = graphEdges[currentVertex][neighborIdx];

        // If the current path to the neighbor is shorter than a previously found path
        // (or if neighbor hasn't been visited yet, indicated by a larger distance)
        if (distanceArray[neighborNode] > distanceArray[currentVertex]) {
          // Update the neighbor's distance
          distanceArray[neighborNode] = distanceArray[currentVertex] + 1;
          // Add the neighbor to the queue for further exploration
          bfsQueue.push(neighborNode);
        }
      }
    }
    // Return the updated distance array
    return distanceArray;
  }

  // Calculate distances from node 0 to all other nodes
  distFromStart = computePathLengths(0, distFromStart);
  // Calculate distances from node (nodeCount - 1) to all other nodes
  distFromEnd = computePathLengths(nodeCount - 1, distFromEnd);

  // Initialize a counter for nodes closer to the start
  let comparisonCounter = 0;
  // Iterate through all nodes (excluding the start and end nodes)
  for (let nodeIterator = 0; nodeIterator < nodeCount; nodeIterator++) {
    if (nodeIterator !== 0 && nodeIterator !== nodeCount - 1) {
      // If a node is closer to the start than to the end
      if (distFromStart[nodeIterator] <= distFromEnd[nodeIterator]) {
        comparisonCounter++; // Increment the counter
      }
    }
  }

  // Determine the winner based on the comparison counter
  let finalResult = "Fennec"; // Default winner
  // If the number of nodes closer to Fennec (start) is less than or equal to
  // the number of nodes closer to Snuke (end)
  if (comparisonCounter <= nodeCount - 2 - comparisonCounter) {
    finalResult = "Snuke"; // Snuke wins
  }

  // Output the final result to the console
  console.log('%s', finalResult);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));