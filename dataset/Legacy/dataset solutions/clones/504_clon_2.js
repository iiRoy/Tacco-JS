let rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into individual lines and remove any leading/trailing whitespace.
let lineSegments = rawData.trim().split('\n');

// Main processing loop for multiple test cases.
while (true) {
  // Read the number of nodes and edges for the current test case.
  let nodeEdgeCounts = lineSegments.shift().split(' ').map(Number);

  // If both N and M are 0, it's the termination condition.
  if (nodeEdgeCounts.join(' ') === '0 0') {
    break;
  }

  // Extract N (number of nodes) and M (number of edges).
  let numNodes = nodeEdgeCounts[0];
  let numEdges = nodeEdgeCounts[1];

  // Define the number of cost categories for DP (0, 1, 2).
  const costCategories = 2; // Represents indices 0, 1, 2 (total 3 categories)

  // Define the start and destination nodes.
  const startNode = 1;
  const destinationNode = numNodes;

  // Store all edges.
  let edgeList = [];
  for (let idx = 0; idx < numEdges; idx++) {
    edgeList.push(lineSegments.shift().split(' ').map(Number));
  }

  // Initialize the dynamic programming table.
  // minCosts[node][category] stores the minimum cost to reach 'node' with 'category' conditions.
  let minCosts = [];
  for (let idx = 0; idx <= numNodes; idx++) {
    minCosts[idx] = [];
    for (let catIdx = 0; catIdx <= costCategories; catIdx++) {
      minCosts[idx][catIdx] = Infinity; // Initialize with a very large value.
    }
  }

  // Set the initial cost for the starting node and category 0.
  minCosts[startNode][0] = 0;

  // Use a queue for a breadth-first-like traversal.
  let nodeQueue = [startNode];
  // Keep track of visited nodes to avoid redundant processing in this specific algorithm.
  let visitedNodes = {};

  // Process nodes from the queue.
  while (true) {
    if (nodeQueue.length === 0) {
      break; // No more nodes to process.
    }

    let currentNode = nodeQueue.shift(); // Get the next node from the queue.

    // If this node has already been fully processed, skip it.
    if (visitedNodes.hasOwnProperty(currentNode)) {
      continue;
    }
    visitedNodes[currentNode] = true; // Mark the node as processed.

    // Iterate through all edges to find connections from/to the current node.
    edgeList.forEach(function(currentEdge) {
      let nodeA = currentEdge[0];
      let nodeB = currentEdge[1];
      let edgeWeight = currentEdge[2];

      // If the current node is 'nodeA' in an edge.
      if (nodeA === currentNode) {
        // Update costs for 'nodeB'.
        minCosts[nodeB][0] = Math.min(minCosts[nodeB][0], minCosts[nodeA][0] + edgeWeight);
        minCosts[nodeB][1] = Math.min(minCosts[nodeB][1], minCosts[nodeA][0]);
        minCosts[nodeB][2] = Math.min(minCosts[nodeB][2], minCosts[nodeA][1]);
        minCosts[nodeB][2] = Math.min(minCosts[nodeB][2], minCosts[nodeA][2] + edgeWeight);
        nodeQueue.push(nodeB); // Add 'nodeB' to the queue for further processing.
      }
      // If the current node is 'nodeB' in an edge.
      else if (nodeB === currentNode) {
        // Update costs for 'nodeA'.
        minCosts[nodeA][0] = Math.min(minCosts[nodeA][0], minCosts[nodeB][0] + edgeWeight);
        minCosts[nodeA][1] = Math.min(minCosts[nodeA][1], minCosts[nodeB][0]);
        minCosts[nodeA][2] = Math.min(minCosts[nodeA][2], minCosts[nodeB][1]);
        minCosts[nodeA][2] = Math.min(minCosts[nodeA][2], minCosts[nodeB][2] + edgeWeight);
        nodeQueue.push(nodeA); // Add 'nodeA' to the queue.
      }
    });
  }

  // Calculate the final minimum cost to reach the destination node.
  let finalResult = Infinity;
  minCosts[destinationNode].forEach(function(costValue, categoryIndex) {
    // Exclude category 1 from the final answer calculation.
    if (categoryIndex !== 1) {
      finalResult = Math.min(finalResult, costValue);
    }
  });

  // Output the calculated minimum cost.
  console.log(finalResult);
}
