let dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

// The lineCollection holds individual lines from the input, processed sequentially.
let lineCollection = dataStream.trim().split("\n");

// This outer loop processes multiple graph configurations until a sentinel is found.
while (true) {
  // Read the first line of a configuration, representing the number of nodes and edges.
  let graphDimensions = lineCollection.shift().split(" ").map(Number);

  // Check if the current configuration indicates termination (0 nodes, 0 edges).
  if (graphDimensions.join(" ") === "0 0") {
    break; // Exit the main processing loop.
  }

  // Extract the specific node and edge counts.
  let totalNodes = graphDimensions[0];
  let totalEdges = graphDimensions[1];

  // Define constants for the DP table's state dimension, start node, and destination node.
  let stateDimension = 2; // Represents the number of distinct states (e.g., 0, 1, 2).
  let initialNode = 1;    // The starting point for pathfinding in the graph.
  let finalNode = totalNodes; // The ultimate target node to reach.

  // Initialize an array to store all edge information (source, destination, weight).
  let edgeDetails = [];

  // Populate the edgeDetails array by reading subsequent lines from the input.
  for (let edgeIndex = 0; edgeIndex < totalEdges; edgeIndex++) {
    edgeDetails.push(lineCollection.shift().split(" ").map(Number));
  }

  // Initialize the dynamic programming table.
  // costTable[node][state] stores the minimum cost to reach 'node' in a particular 'state'.
  let costTable = [];
  for (let nodeIdx = 0; nodeIdx <= totalNodes; nodeIdx++) {
    costTable[nodeIdx] = [];
    for (let stateIdx = 0; stateIdx <= stateDimension; stateIdx++) {
      costTable[nodeIdx][stateIdx] = Number.POSITIVE_INFINITY; // All costs start as infinite.
    }
  }

  // Set the cost to reach the initialNode in its base state (state 0) to zero.
  costTable[initialNode][0] = 0;

  // Initialize a queue for graph traversal (e.g., a variant of BFS/Dijkstra).
  let nodeQueue = [initialNode];
  // A map to keep track of nodes that have already been fully processed.
  let processedNodes = {};

  // Graph traversal loop. Continues as long as there are nodes to explore.
  while (true) {
    if (nodeQueue.length === 0) {
      break; // No more nodes in the queue, terminate traversal.
    }

    let currentFocusNode = nodeQueue.shift(); // Dequeue the next node to process.

    // If this node has already been processed, skip further operations for it.
    if (processedNodes.hasOwnProperty(currentFocusNode)) {
      continue;
    }

    // Mark the current node as processed to prevent redundant work.
    processedNodes[currentFocusNode] = true;

    // Iterate through all available edges to find connections to/from the current node.
    edgeDetails.forEach(function(currentPath) {
      let firstVertex = currentPath[0];
      let secondVertex = currentPath[1];
      let pathCost = currentPath[2];

      // Case 1: The current node is the 'firstVertex' of the edge.
      if (firstVertex === currentFocusNode) {
        // Update costs for 'secondVertex' based on paths through 'firstVertex'.
        costTable[secondVertex][0] = Math.min(costTable[secondVertex][0], costTable[firstVertex][0] + pathCost);
        costTable[secondVertex][1] = Math.min(costTable[secondVertex][1], costTable[firstVertex][0]);
        costTable[secondVertex][2] = Math.min(costTable[secondVertex][2], costTable[firstVertex][1]);
        costTable[secondVertex][2] = Math.min(costTable[secondVertex][2], costTable[firstVertex][2] + pathCost);
        nodeQueue.push(secondVertex); // Enqueue the connected node for future processing.
      }
      // Case 2: The current node is the 'secondVertex' of the edge.
      else if (secondVertex === currentFocusNode) {
        // Update costs for 'firstVertex' based on paths through 'secondVertex'.
        costTable[firstVertex][0] = Math.min(costTable[firstVertex][0], costTable[secondVertex][0] + pathCost);
        costTable[firstVertex][1] = Math.min(costTable[firstVertex][1], costTable[secondVertex][0]);
        costTable[firstVertex][2] = Math.min(costTable[firstVertex][2], costTable[secondVertex][1]);
        costTable[firstVertex][2] = Math.min(costTable[firstVertex][2], costTable[secondVertex][2] + pathCost);
        nodeQueue.push(firstVertex); // Enqueue the connected node.
      }
      // This specific line resets a cost state for the final node during each edge iteration.
      // Its exact purpose here is context-dependent but maintained for structural integrity.
      costTable[finalNode][1] = Number.POSITIVE_INFINITY;
    });
  }

  // After traversal, find the minimum cost to reach the finalNode across all its states.
  let minimumOverallCost = Number.POSITIVE_INFINITY;
  costTable[finalNode].forEach(function(currentCostValue, stateIdx) {
    minimumOverallCost = Math.min(minimumOverallCost, currentCostValue);
  });

  // Output the calculated minimum cost for the current graph configuration.
  console.log(minimumOverallCost);
}