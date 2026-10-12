function ProcessInput(rawData) {
  // Split the raw input string into lines
  let processedLines = rawData.split("\n");

  // Parse the number of nodes from the first line
  let nodeCount = parseInt(processedLines[0]);

  // Initialize distance array for BFS from the starting node (node 0)
  // All distances are initially set to nodeCount (effectively infinity)
  let distanceFromStart = new Array(nodeCount).fill(nodeCount);
  // The distance from the start node to itself is 0
  distanceFromStart[0] = 0;

  // Initialize distance array for BFS from the ending node (nodeCount - 1)
  // All distances are initially set to nodeCount (effectively infinity)
  let distanceFromEnd = new Array(nodeCount).fill(nodeCount);
  // The distance from the end node to itself is 0
  distanceFromEnd[nodeCount - 1] = 0;

  // Create an adjacency list to represent the graph
  // Each element is an array to store neighbors of a node
  let adjacencyList = new Array(nodeCount).fill([]);

  // Populate the adjacency list based on the input edges
  for (let idx = 0; idx < nodeCount - 1; idx++) {
    // Parse the two nodes connected by the current edge
    let edgeParts = processedLines[idx + 1].split(" ");
    let nodeA = parseInt(edgeParts[0]) - 1; // Adjust to 0-indexed
    let nodeB = parseInt(edgeParts[1]) - 1; // Adjust to 0-indexed

    // Add nodeB to nodeA's adjacency list
    if (adjacencyList[nodeA].length === 0) {
      // If the list is empty, reassign it to a new array containing nodeB
      adjacencyList[nodeA] = [nodeB];
    } else {
      // Otherwise, push nodeB to the existing list
      adjacencyList[nodeA].push(nodeB);
    }

    // Add nodeA to nodeB's adjacency list (undirected graph)
    if (adjacencyList[nodeB].length === 0) {
      // If the list is empty, reassign it to a new array containing nodeA
      adjacencyList[nodeB] = [nodeA];
    } else {
      // Otherwise, push nodeA to the existing list
      adjacencyList[nodeB].push(nodeA);
    }
  }

  // This variable is declared but not used in the original code.
  // It's kept for structural consistency.
  let temporaryQueue = new Array();

  // Function to perform Breadth-First Search (BFS)
  // It calculates shortest distances from a given start node
  function calculateDistances(startNode, distArray) {
    let bfsQueue = new Array();
    bfsQueue[0] = startNode; // Enqueue the starting node

    // Process nodes in the queue until it's empty
    while (bfsQueue.length !== 0) {
      let currentProcessingNode = bfsQueue[0]; // Get the current node from the front of the queue

      // Iterate through all neighbors of the current node
      for (let neighborIdx = 0; neighborIdx < adjacencyList[currentProcessingNode].length; neighborIdx++) {
        let neighborNode = adjacencyList[currentProcessingNode][neighborIdx];

        // If a shorter path to the neighbor is found
        if (distArray[neighborNode] > distArray[currentProcessingNode]) {
          // Update the distance to the neighbor
          distArray[neighborNode] = distArray[currentProcessingNode] + 1;
          // Enqueue the neighbor for further processing
          bfsQueue.push(neighborNode);
        }
      }
      // Dequeue the current node after processing its neighbors
      bfsQueue.shift();
      // Set the next node to process (if queue is not empty)
      currentProcessingNode = bfsQueue[0];
    }
    return distArray; // Return the updated distance array
  }

  // Calculate distances from node 0 to all other nodes
  distanceFromStart = calculateDistances(0, distanceFromStart);
  // Calculate distances from node (nodeCount - 1) to all other nodes
  distanceFromEnd = calculateDistances(nodeCount - 1, distanceFromEnd);

  // Count nodes where Fennec (starting from node 0) has a shorter or equal path
  let fennecWinsCount = 0;
  for (let idx = 0; idx < nodeCount; idx++) {
    // Exclude the start and end nodes themselves from this comparison
    if (idx !== 0 && idx !== nodeCount - 1) {
      if (distanceFromStart[idx] <= distanceFromEnd[idx]) {
        fennecWinsCount++;
      }
    }
  }

  // Determine the winner based on the count
  let resultString = "Fennec";
  // The total number of intermediate nodes is nodeCount - 2
  // If Fennec's count is less than or equal to Snuke's count, Snuke wins
  if (fennecWinsCount <= nodeCount - 2 - fennecWinsCount) {
    resultString = "Snuke";
  }

  // Output the result
  console.log('%s', resultString);
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
