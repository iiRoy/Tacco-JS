const standardInputReader = require('fs');

// Function to parse a string into a number, handling potential non-numeric values gracefully.
const parseNumericValue = (stringValue) => {
  const parsed = Number(stringValue);
  return isNaN(parsed) ? 0 : parsed; // Default to 0 or throw error based on strictness
};

// Read all input from standard input, split by lines, and transform.
// Empty lines are filtered out to prevent errors during parsing.
// Each non-empty line is split by space and its components converted to numbers.
const processedInputRecords = standardInputReader.readFileSync('/dev/stdin', 'utf8')
  .split("\n")
  .filter(lineContent => lineContent.trim() !== '') // Ensure no empty lines are processed
  .map(lineContent => lineContent.split(" ").map(parseNumericValue));

// Extract primary graph parameters from the very first record.
// The first record contains: total nodes, total edges, and the final target node ID.
const [totalNodeQuantity, totalEdgeQuantity, finalTargetNode] = processedInputRecords.shift(); // Removes and destructures the first array

// Initialize the graph's adjacency list structure.
// Each key represents a node, and its value is an array of connected edges.
// An edge is represented as [destinationNodeId, connectionWeight].
const graphAdjacencyStructure = {};
for (let currentGraphNodeId = 1; currentGraphNodeId <= totalNodeQuantity; currentGraphNodeId++) {
  graphAdjacencyStructure[currentGraphNodeId] = []; // Ensure all potential nodes are initialized
}

// Populate the graph with all defined edges from the input records.
// Each subsequent record after the header defines an edge.
processedInputRecords.forEach(edgeDefinition => {
  const [originatingNode, terminatingNode, edgeWeightValue] = edgeDefinition;
  // Add the edge to the originating node's list of connections.
  graphAdjacencyStructure[originatingNode].push([terminatingNode, edgeWeightValue]);
});

// --- Core Graph Traversal Logic (DFS-like) ---
// This section finds the maximum possible accumulated weight from node 1 to finalTargetNode.

let highestAchievedPathSum = -1; // Stores the maximum weight found across all valid paths.

// An Immediately Invoked Function Expression (IIFE) to encapsulate the traversal.
(function performDepthFirstSearch() {

  // Stack to manage the state of exploration, enabling backtracking.
  // Each element on this stack represents a set of edges yet to be explored from a particular node.
  const explorationBacktrackStack = [];

  // Data structures to track the current path being explored.
  let activePathNodes = [1]; // Sequence of nodes visited in the current path.
  let activePathEdgeWeights = [0]; // Weights of edges taken to reach nodes in activePathNodes.
  let currentAccumulatedWeight = 0; // Running sum of weights for the active path (optimization).

  // A Set for efficient O(1) checking of nodes already present in the active path (cycle detection).
  const nodesInCurrentTraversal = new Set([1]);

  // Begin exploration from the starting node (node 1).
  // Create a shallow copy to ensure independent manipulation of this array.
  let availableBranchesToExplore = [...graphAdjacencyStructure[1]];

  // Main loop for the DFS traversal. It continues until all paths are exhausted.
  while (true) {
    // If there are no more immediate branches to explore from the current node...
    while (availableBranchesToExplore.length === 0) {
      // ...it's time to backtrack.
      const lastEdgeWeight = activePathEdgeWeights.pop();
      if (lastEdgeWeight !== undefined) { // Subtract the weight of the edge just left.
        currentAccumulatedWeight -= lastEdgeWeight;
      }

      const lastNodeVisited = activePathNodes.pop();
      if (lastNodeVisited !== undefined) { // Remove the node from the active path set.
        nodesInCurrentTraversal.delete(lastNodeVisited);
      }

      // If the backtrack stack is empty, it means all possible paths have been explored.
      if (explorationBacktrackStack.length === 0) {
        return; // Terminate the traversal.
      }
      // Restore the state from the stack to continue exploring previous branches.
      availableBranchesToExplore = explorationBacktrackStack.pop();
    }

    // Get the next edge to consider from the current set of available branches.
    const [destinationOfEdge, weightOfEdge] = availableBranchesToExplore.pop();

    // Calculate the total weight if this edge were added to the current path.
    const prospectiveTotalWeight = currentAccumulatedWeight + weightOfEdge;

    // If the destination of this edge is our target node...
    if (destinationOfEdge === finalTargetNode) {
      // ...we've found a path to the target. Update the highest sum if this path is better.
      highestAchievedPathSum = Math.max(highestAchievedPathSum, prospectiveTotalWeight);
    }

    // Check for cycles: only proceed if the destination node is not already in the current path.
    if (!nodesInCurrentTraversal.has(destinationOfEdge)) {
      // Also check if the destination node has any outgoing connections to explore further.
      const outgoingConnections = graphAdjacencyStructure[destinationOfEdge];
      if (outgoingConnections && outgoingConnections.length > 0) {
        // If it has outgoing connections, save the current state before descending deeper.
        explorationBacktrackStack.push(availableBranchesToExplore);

        // Update current path state to reflect moving to the new node.
        activePathNodes.push(destinationOfEdge);
        nodesInCurrentTraversal.add(destinationOfEdge);
        activePathEdgeWeights.push(weightOfEdge);
        currentAccumulatedWeight = prospectiveTotalWeight; // Update running sum.

        // Now, the available branches are those from the new current node.
        availableBranchesToExplore = [...outgoingConnections];
      }
      // If the destination node has no outgoing connections and is not the target (handled above),
      // it's a dead end, and the loop will simply pick the next available branch or backtrack.
    }
    // If a cycle is detected, or it's a dead-end branch (no outgoing edges),
    // the loop continues to the next available branch or triggers backtracking.
  }
})(); // End of IIFE

// Output the maximum accumulated weight found.
console.log(highestAchievedPathSum);