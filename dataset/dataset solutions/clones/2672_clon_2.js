var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8')
  .split("\n").map((lineStr) => {
    return lineStr.split(" ").map((numStr) => {
      // Convert string segment to numeric value
      return numStr - 0;
    });
  });


var totalNodes = fileContent[0][0];
// var unusedLinkCount = fileContent[0][1]; // This variable is not utilized
var unusedParam = fileContent[0][2];

// Remove the header line from the processed data
fileContent.shift();


// Initialize an adjacency list to store graph connections
var graphConnections = {};
for (var nodeCounter = 1; nodeCounter <= totalNodes; nodeCounter++) {
  graphConnections[nodeCounter] = [];
}


// Populate the adjacency list with edges and their associated gains
fileContent.forEach((connectionInfo) => {
  // connectionInfo[0] is the source node
  // connectionInfo[1] is the destination node
  // connectionInfo[2] is the gain for traversing this edge
  graphConnections[connectionInfo[0]].push([connectionInfo[1], connectionInfo[2]]);
});


// Variable to store the maximum profit found, initialized to a non-achievable value
var maxProfit = -1;


// Immediately Invoked Function Expression for managing scope
(() => {

  // Stores the sequence of nodes in the current traversal path
  var visitedNodes = [1];
  // Stores the gains accumulated at each step of the current path
  var segmentProfits = [0];

  // Stack to hold sets of alternative edges when backtracking is needed
  var branchingPaths = [Array.from(graphConnections[1])];
  // The current set of edges to explore from the last node
  var availableBranches = branchingPaths.pop();


  // Main loop for depth-first search like traversal
  do {
    // Get the next available edge (destination node and its gain)
    var traverseOption = availableBranches.pop();
    var targetVertex = traverseOption[0];

    // console.log("Currently exploring: " + visitedNodes + " -> " + targetVertex); // Debug output

    // Check if the current target vertex is the desired end node
    if (targetVertex == totalNodes) {
      // If end node reached, calculate total profit for this path
      var edgeProfit = traverseOption[1];
      // Sum all segment profits and add the last edge's profit
      var currentPathTotalGain = segmentProfits.reduce((currentSum, individualProfit) => {
        return currentSum + individualProfit;
      }, 0) + edgeProfit;

      // Update the overall maximum profit if this path yielded a higher profit
      maxProfit = Math.max(currentPathTotalGain, maxProfit);
    }

    // Check if the target vertex has not been visited in the current path to avoid cycles
    if (visitedNodes.indexOf(targetVertex) == -1) {
      // If the target vertex has outgoing edges, push current branches and explore
      if (graphConnections[targetVertex].length > 0) {
        branchingPaths.push(availableBranches); // Save current branch options
        availableBranches = Array.from(graphConnections[targetVertex]); // Load new branch options
        visitedNodes.push(targetVertex); // Add target to current path
        segmentProfits.push(traverseOption[1]); // Add its gain to path gains
        continue; // Continue with the new path
      }
    } else {
      // console.log("Cycle identified."); // Inform about detected cycle
    }


    // Backtrack if all branches from the current node are exhausted
    while (availableBranches.length == 0) {
      visitedNodes.pop(); // Remove last node from path
      segmentProfits.pop(); // Remove its corresponding gain

      if (branchingPaths.length > 0) {
        availableBranches = branchingPaths.pop(); // Restore previous branch options
      } else {
        // console.log("Traversal complete."); // All paths explored
        return; // Exit the IIFE as exploration is finished
      }
    }
  } while (true); // Loop indefinitely until explicit return


})(); // End of IIFE


// Output the final maximum profit found
console.log(maxProfit);