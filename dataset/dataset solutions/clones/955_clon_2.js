let priorityQueue = [];
let queueSize = 0; // Current number of elements in the queue
priorityQueue[0] = Array(2);
priorityQueue[0][0] = -1; // First element placeholder for 1-based indexing
priorityQueue[0][1] = -1; // Sentinel value to simplify parent comparisons

function enqueueItem(itemToAdd) { // Adds a new element to the min-priority queue
  priorityQueue[++queueSize] = itemToAdd; // Place new item at the end
  let currentIndex = queueSize; // Start from the newly added item's position
  // Bubble up the item if its priority is higher than its parent's
  while (priorityQueue[currentIndex][1] < priorityQueue[Math.floor(currentIndex / 2)][1]) {
    let tempElement = priorityQueue[currentIndex]; // Store current element temporarily
    priorityQueue[currentIndex] = priorityQueue[Math.floor(currentIndex / 2)]; // Move parent down
    priorityQueue[Math.floor(currentIndex / 2)] = tempElement; // Move current element up
    currentIndex = Math.floor(currentIndex / 2); // Move up to the parent's position
  }
}

function dequeueMin() { // Retrieves and removes the smallest element from the queue
  if (queueSize <= 0) { // Check if the queue is empty
    return; // Nothing to extract
  }
  let extractedItem = priorityQueue[1]; // The minimum element is always at index 1
  priorityQueue[1] = priorityQueue[queueSize--]; // Move the last element to the root and decrement size
  let currentIndex = 1; // Start bubbling down from the root

  // Continue re-heapifying as long as the current node is larger than at least one child
  while (
    (currentIndex * 2 <= queueSize && priorityQueue[currentIndex][1] > priorityQueue[currentIndex * 2][1]) ||
    (currentIndex * 2 + 1 <= queueSize && priorityQueue[currentIndex][1] > priorityQueue[currentIndex * 2 + 1][1])
  ) {
    let leftChildIndex = currentIndex * 2; // Calculate left child index
    let rightChildIndex = currentIndex * 2; // Initialize right child index
    // If a right child exists, update its index
    if (currentIndex * 2 + 1 <= queueSize) {
      rightChildIndex++;
    }
    // Determine which child has the smaller value
    let minChildIndex = (priorityQueue[leftChildIndex][1] <= priorityQueue[rightChildIndex][1]) ? leftChildIndex : rightChildIndex;

    let tempElement = priorityQueue[currentIndex]; // Store current element for swap
    priorityQueue[currentIndex] = priorityQueue[minChildIndex]; // Move smaller child up
    priorityQueue[minChildIndex] = tempElement; // Move current element down
    currentIndex = minChildIndex; // Continue bubbling down from the new position
  }
  return extractedItem; // Return the smallest element that was extracted
}

function ProcessInput(rawData) { // Main function to process graph data and calculate MST weight
  // Split the raw input string into lines
  rawData = rawData.split("\n");
  // Parse the number of nodes from the first line
  const numNodes = parseInt(rawData[0], 10);

  // Initialize the adjacency matrix for the graph
  let adjacencyMatrix = [];
  // Loop through each row to populate the adjacency matrix
  for (let rowIndex = 0; rowIndex < numNodes; rowIndex++) {
    adjacencyMatrix[rowIndex] = Array(numNodes); // Create a new row for the matrix
    // Split the current line of input into individual weight strings
    rawData[rowIndex + 1] = rawData[rowIndex + 1].split(" ");
    // Loop through each column to parse edge weights
    for (let colIndex = 0; colIndex < numNodes; colIndex++) {
      adjacencyMatrix[rowIndex][colIndex] = parseInt(rawData[rowIndex + 1][colIndex + 1], 10);
    }
  }

  // Initialize a result matrix to store the edges of the Minimum Spanning Tree (MST)
  let resultMatrix = [];
  for (let rowIndex = 0; rowIndex < numNodes; rowIndex++) {
    resultMatrix[rowIndex] = Array(numNodes); // Create row
    for (let colIndex = 0; colIndex < numNodes; colIndex++) {
      resultMatrix[rowIndex][colIndex] = -1; // Initialize all weights to -1 (no edge)
    }
  }

  // Variables for Prim's algorithm
  let processedNodesCount = 1; // Count of nodes included in the MST, starts with 1 (node 0)
  let isNodeVisited = Array(numNodes); // Tracks if a node has been added to the MST

  // Initialize all nodes as unvisited
  for (let nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
    isNodeVisited[nodeIdx] = false;
  }
  isNodeVisited[0] = true; // Mark the starting node (node 0) as visited

  // Add all edges connected to the starting node to the priority queue
  for (let neighborIdx = 0; neighborIdx < numNodes; neighborIdx++) {
    if (adjacencyMatrix[0][neighborIdx] > -1) { // If there's a valid edge
      let edgeData = [];
      edgeData[0] = neighborIdx; // Destination node
      edgeData[1] = adjacencyMatrix[0][neighborIdx]; // Edge weight
      edgeData[2] = 0; // Source node (from node 0)
      enqueueItem(edgeData); // Add edge to the priority queue
    }
  }

  // Main loop of Prim's algorithm: continue until all nodes are included in MST
  while (processedNodesCount < numNodes) {
    let extractedEdge = dequeueMin(); // Get the edge with the smallest weight from the queue

    // If the destination node of this edge has already been visited, skip it
    if (isNodeVisited[extractedEdge[0]]) {
      continue;
    }

    isNodeVisited[extractedEdge[0]] = true; // Mark the new node as visited
    // Add this edge to the MST result matrix (symmetrically)
    resultMatrix[extractedEdge[0]][extractedEdge[2]] = resultMatrix[extractedEdge[2]][extractedEdge[0]] = extractedEdge[1];
    processedNodesCount++; // Increment the count of processed nodes

    // Add all edges from the newly visited node to the priority queue
    for (let neighborIdx = 0; neighborIdx < numNodes; neighborIdx++) {
      if (adjacencyMatrix[extractedEdge[0]][neighborIdx] > -1) { // If there's a valid edge
        let newEdgeData = [];
        newEdgeData[0] = neighborIdx; // Destination node
        newEdgeData[1] = adjacencyMatrix[extractedEdge[0]][neighborIdx]; // Edge weight
        newEdgeData[2] = extractedEdge[0]; // Source node
        enqueueItem(newEdgeData); // Add new edge to the priority queue
      }
    }
  }

  // Calculate the total weight of the MST
  let totalWeight = 0;
  for (let rowIndex = 0; rowIndex < numNodes; rowIndex++) {
    for (let colIndex = 0; colIndex < numNodes; colIndex++) {
      // Only sum each edge once (upper triangle) and ensure it's a valid MST edge
      if (rowIndex < colIndex && resultMatrix[rowIndex][colIndex] > -1) {
        totalWeight += resultMatrix[rowIndex][colIndex];
      }
    }
  }
  console.log(totalWeight); // Output the final total weight
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));