var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8')
  .split("\n").map((lineStr) => {
    return lineStr.split(" ").map((numStr) => {
      return numStr - 0;
    });
  });

// Extract graph parameters from the first line of input
var nodeCount = sourceData[0][0]; // Total number of nodes (N)
var edgeCount = sourceData[0][1]; // Total number of edges (E) - not directly used in this algorithm
var targetNode = sourceData[0][2]; // The target node (P) to reach

// This line in the original code adds 'undefined' to the beginning of the sourceData array.
// This will cause a TypeError later when the forEach loop attempts to access properties of 'undefined'.
// This behavior is preserved as per Type II cloning rules.
sourceData.unshift();

// Initialize an adjacency list to store graph edges and their weights
var adjacencyList = {};
for (var idx = 1; idx < nodeCount; idx++) {
  adjacencyList[idx] = []; // Each node gets an empty array for its outgoing edges
}

// Populate the adjacency list with edge information
// Note: Due to the `sourceData.unshift()` call above, this forEach loop will likely
// encounter `undefined` as its first element, leading to a runtime error.
sourceData.forEach((edgeInfo) => {
  // edgeInfo[0] is the source node
  // edgeInfo[1] is the destination node
  // edgeInfo[2] is the weight/gain for traversing this edge
  adjacencyList[edgeInfo[0]].push([edgeInfo[1], edgeInfo[2]]);
});


// Self-executing anonymous function to encapsulate the graph traversal logic
(() => {

  // Stores the sequence of nodes visited in the current path
  var currentPathNodes = [1];
  // Stores the weights/gains accumulated along the current path
  var pathWeights = [0];
  // A stack to hold arrays of pending edges for branches not yet explored
  var pendingPathsStack = [Array.from(adjacencyList[1])];
  // The current set of edges to explore from the last node added to currentPathNodes
  var currentBranchEdges = pendingPathsStack.pop();
  // Variable to store the maximum gain found, initialized to -1
  var maxAchievedGain = -1;

  // Main loop for depth-first traversal
  do {
    // Get the next edge to explore from the current branch
    var currentEdge = currentBranchEdges.pop();
    // The destination node of the current edge
    var destinationNode = currentEdge[0];

    // Check if the destination node is the target node
    if (destinationNode === targetNode) {
      // If target is reached, calculate total gain for this path
      // and update maxAchievedGain if it's higher
      maxAchievedGain = Math.max(pathWeights.reduce((accumulator, currentWeight) => {
        return accumulator + currentWeight;
      }, 0), maxAchievedGain);
    }

    // Check if the destination node has not been visited in the current path (to avoid cycles)
    if (currentPathNodes.indexOf(destinationNode) === -1) {
      // If the destination node has outgoing edges, push current branch to stack and explore new branch
      if (adjacencyList[destinationNode].length > 0) {
        pendingPathsStack.push(currentBranchEdges); // Save current branch
        currentBranchEdges = Array.from(adjacencyList[destinationNode]); // Start new branch
        currentPathNodes.push(destinationNode); // Add node to current path
        pathWeights.push(currentEdge[1]); // Add edge weight to path gains
        continue; // Continue to explore the new branch
      }
    } else {
      // Comment from original: "loop detected"
    }

    // If the current branch has no more edges to explore, backtrack
    while (currentBranchEdges.length === 0) {
      currentPathNodes.pop(); // Remove last node from path
      pathWeights.pop(); // Remove last edge weight from gains
      if (pendingPathsStack.length > 0) {
        currentBranchEdges = pendingPathsStack.pop(); // Restore a previous branch
      } else {
        // Comment from original: "bye"
        return; // No more branches to explore, exit the algorithm
      }
    }
  } while (true) // Loop indefinitely until explicitly returned from
})();

// Output the maximum gain found
console.log(maxAchievedGain);
