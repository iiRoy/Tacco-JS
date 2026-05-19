var rawData = require('fs').readFileSync('/dev/stdin', 'utf8')
  .split("\n")
  .map((lineStr) => {
    return lineStr.split(" ").map((numStr) => {
      return Number(numStr);
    });
  });

/* Extracting graph parameters from the first line */
var nodeCount = rawData[0][0];
// The second element (rawData[0][1]) is not used in the original logic.
var paramVal = rawData[0][2]; // This variable is declared but never utilized.

/* Remove the header line from the input data */
rawData.shift();

/* Initialize an adjacency list to store graph connections */
var adjacencyList = {};
for (var nodeIdx = 1; nodeIdx <= nodeCount; nodeIdx++) {
  adjacencyList[nodeIdx] = [];
}

/* Populate the adjacency list with edges and their associated gains */
rawData.forEach((edgeInfo) => {
  adjacencyList[edgeInfo[0]].push([edgeInfo[1], edgeInfo[2]]);
});

/* Variable to store the maximum profit found, initialized to a minimum value */
var maxProfit = -1;

/* Self-executing anonymous function to encapsulate the pathfinding logic */
(() => {

  /* Tracks the sequence of nodes in the current traversal */
  var currentPathNodes = [1];
  /* Stores the profit accumulated along each segment of the current path */
  var pathProfits = [0];
  /* A stack to manage alternative branches to explore */
  var pendingPathsStack = [Array.from(adjacencyList[1])];
  /* The set of edges to explore from the current node */
  var currentBranchPaths = pendingPathsStack.pop();

  /* Main loop for depth-first search traversal */
  do {
    /* Get the next edge to explore from the current set of paths */
    var currentEdge = currentBranchPaths.pop();
    var nextNodeId = currentEdge[0];

    // console.log("Exploring: " + currentPathNodes + " -> " + nextNodeId); // Debugging line, commented out.

    /* Check if the destination node is the target node */
    if (nextNodeId === nodeCount) {
      /* If target reached, calculate total profit for this path */
      var edgeProfit = currentEdge[1];
      var totalCurrentPathProfit = pathProfits.reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0) + edgeProfit;
      /* Update the maximum profit if this path yields a higher value */
      maxProfit = Math.max(totalCurrentPathProfit, maxProfit);
    }

    /* Check if the next node has already been visited in the current path to avoid cycles */
    if (currentPathNodes.indexOf(nextNodeId) === -1) {
      /* If the node has outgoing edges, push current paths to stack and explore new branch */
      if (adjacencyList[nextNodeId].length > 0) {
        pendingPathsStack.push(currentBranchPaths);
        currentBranchPaths = Array.from(adjacencyList[nextNodeId]);
        currentPathNodes.push(nextNodeId);
        pathProfits.push(currentEdge[1]);
        continue; // Continue to the next iteration of the do-while loop
      }
    } else {
      /* Log a message if a loop is detected (node already in current path) */
      console.log("loop detected");
    }

    /* Backtrack if the current branch has no more paths to explore */
    while (currentBranchPaths.length === 0) {
      currentPathNodes.pop(); // Remove the last node from the path
      pathProfits.pop(); // Remove the last profit from the path

      /* If there are pending branches in the stack, pop them to continue exploration */
      if (pendingPathsStack.length > 0) {
        currentBranchPaths = pendingPathsStack.pop();
      } else {
        // console.log("Traversal complete."); // Debugging line, commented out.
        return; // All paths explored, exit the IIFE
      }
    }
  } while (true); // Loop indefinitely until an explicit return statement is hit

})();

/* Output the final maximum profit found */
console.log(maxProfit);
