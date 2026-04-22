var fileSystemModule = require('fs');

var rawGraphInput = fileSystemModule
  .readFileSync('/dev/stdin', 'utf8') // Retrieve content from standard input as a string.
  .split("\n") // Split the entire content into an array of individual lines.
  .map(  ( textLine )   => {
    // For each line, further split it by spaces and convert each segment to a numeric value.
    return textLine.split(" ")
      .map(  ( stringNum )   => {
        return stringNum - 0; // Convert string representation to an actual number.
      });
  });

// Extract primary configuration parameters from the first processed line of input.
var totalVertexCount = rawGraphInput[0][0]; // Represents the total number of nodes in the graph.
var totalEdgeCount = rawGraphInput[0][1]; // Represents the total number of connections.
var desiredTargetNode = rawGraphInput[0][2]; // Specifies the node that is the ultimate destination.

// Remove the initial line from the input data now that its values have been extracted.
// (Note: The original code used `input.unshift();`. This would add `undefined` and lead to an error
// in the subsequent loop. Assuming this was a typo and `shift()` was intended to remove the header row
// to allow proper processing of edge data, which is a common pattern.)
rawGraphInput.shift();

// Initialize an adjacency list to represent the graph's structure.
var graphConnections = {};
// Pre-populate the adjacency list, ensuring every potential vertex has an empty array for its outgoing edges.
for (var vertexId = 1; vertexId <= totalVertexCount; vertexId++) {
  graphConnections[vertexId] = [];
}

// Iterate through the remaining input lines to construct the graph's connections.
rawGraphInput.forEach(  ( currentEdgeDetails )   => {
  // Each 'currentEdgeDetails' array is expected to be [source_node, destination_node, edge_weight].
  // Add the destination node and its associated weight to the list of connections for the source node.
  graphConnections[currentEdgeDetails[0]].push([currentEdgeDetails[1], currentEdgeDetails[2]]);
});


// An immediately invoked function expression (IIFE) to encapsulate the graph traversal logic.
(  (  )   => {

  // Keeps track of the sequence of nodes visited in the current path. Starts at node 1.
  var visitedNodesSequence = [1];
  // Stores the weights of the edges corresponding to the nodes in 'visitedNodesSequence'. Initial path has zero weight.
  var accumulatedPathWeights = [0];
  // A stack to manage sets of edges from branches that are yet to be fully explored during traversal.
  var pendingBranchExplorations = [ [ ...graphConnections[1] ] ]; // Begin with all edges originating from node 1.
  // The current collection of edges that need to be evaluated from the most recently added node.
  var currentEdgeSet = pendingBranchExplorations.pop(); // Retrieve the initial set of edges to start with.
  // This variable will hold the maximum sum of weights found for any path successfully reaching the target node.
  var maximumAchievedValue = -1; // Default value indicating no path to target found yet.

  // The primary loop for the graph traversal algorithm (simulating a depth-first search).
  do {
    // Extract the next available edge to explore from the current set of edges.
    var activeTraversalEdge = currentEdgeSet.pop();
    // Identify the node that this active edge leads to.
    var nextVertexInPath = activeTraversalEdge[0];

    // Check if the current node reached is the desired target node.
    if (nextVertexInPath === desiredTargetNode) {
      // If the target is reached, compute the total accumulated weight of the path.
      // Update 'maximumAchievedValue' if the current path's weight sum is greater.
      maximumAchievedValue = Math.max(accumulatedPathWeights.reduce(  ( runningSum, edgeValue )   => {
        return runningSum + edgeValue; // Sum up all edge weights in the path.
      }, 0), maximumAchievedValue);
    }

    // Verify if 'nextVertexInPath' has already been included in the current path.
    // This check helps in avoiding direct cycles within the active path.
    if (visitedNodesSequence.indexOf(nextVertexInPath) === -1) {
      // If the destination node has further outgoing connections.
      if (graphConnections[nextVertexInPath].length > 0) {
        // Before exploring a new branch, save the current set of edges for later.
        pendingBranchExplorations.push(currentEdgeSet);
        // Update 'currentEdgeSet' to contain all edges originating from the new node.
        currentEdgeSet = [ ...graphConnections[nextVertexInPath] ];
        // Add the newly visited node to the sequence of nodes in the current path.
        visitedNodesSequence.push(nextVertexInPath);
        // Include the weight of the edge just traversed in the accumulated path weights.
        accumulatedPathWeights.push(activeTraversalEdge[1]);
        // Skip to the next iteration to continue exploration from this new branch.
        continue;
      }
    } else {
      // A cycle has been detected: the 'nextVertexInPath' is already in 'visitedNodesSequence'.
      // No further action is required for this specific path extension in this iteration.
    }

    // Backtracking logic: If the 'currentEdgeSet' is empty, it means all edges from the
    // current node have been explored, so we need to backtrack.
    while (currentEdgeSet.length === 0) {
      visitedNodesSequence.pop(); // Remove the last node from the current path.
      accumulatedPathWeights.pop(); // Remove the weight of the edge leading to that node.
      if (pendingBranchExplorations.length > 0) {
        currentEdgeSet = pendingBranchExplorations.pop(); // Restore a previous set of edges from the stack.
      } else {
        // If 'pendingBranchExplorations' is also empty, all possible paths have been exhausted.
        // Terminate the graph traversal algorithm.
        return;
      }
    }
  } while (true); // This loop runs indefinitely until an explicit 'return' statement is executed.

})(); // End of the self-executing function.

// Output the final maximum value found after the entire graph traversal.
console.log(maximumAchievedValue);