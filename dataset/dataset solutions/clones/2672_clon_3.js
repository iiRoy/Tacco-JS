const processInputData = () => {
  // Read raw content from standard input, assuming UTF-8 encoding.
  // This is an essential step for competitive programming environments.
  const rawContent = require('fs').readFileSync('/dev/stdin', 'utf8');

  // Split the content into individual lines, then filter out any empty lines.
  // Each non-empty line is further split by spaces, and each segment is converted to a number.
  // Using Number() for conversion ensures explicit numeric types.
  return rawContent.split('\n')
                   .filter(lineSegment => lineSegment.trim() !== '')
                   .map(lineSegment => lineSegment.split(' ').map(Number));
};

// Retrieve and parse all input lines.
const parsedInputRecords = processInputData();

// Extract global configuration parameters from the first line of input.
// The .shift() method removes the first element from the array and returns it.
const globalConfiguration = parsedInputRecords.shift();
const totalNodeCount = globalConfiguration[0]; // Represents the 'N' from the original problem.
// The original 'E' (edge count) was commented out and is now completely removed.
const maximumAllowedPathWeight = globalConfiguration[2]; // Represents the 'P' from the original problem.

// Initialize the graph using a Map for node connections.
// A Map is used for potentially better performance with non-sequential keys and clearer semantics.
const graphAdjacencyMap = new Map(); // Replaces the 'data' object.

// Pre-populate the map with an entry for each possible node ID,
// ensuring every node has an empty array to hold its outgoing edges.
for (let nodeId = 1; nodeId <= totalNodeCount; nodeId++) {
  graphAdjacencyMap.set(nodeId, []);
}

// Iterate through the remaining parsed input records to build the graph's adjacency lists.
// Each record represents an edge: [source_node, destination_node, edge_weight].
parsedInputRecords.forEach(edgeDetail => {
  const [sourceNode, destinationNode, weightValue] = edgeDetail;
  // Only add edges if the source node exists in our pre-initialized graph.
  // This implicitly handles cases where sourceNode > totalNodeCount by ignoring them.
  if (graphAdjacencyMap.has(sourceNode)) {
    graphAdjacencyMap.get(sourceNode).push([destinationNode, weightValue]);
  }
});

// Variable to store the highest cumulative weight found for a path to the target node.
let peakPathAccumulation = -1; // Replaces 'ans'.

// Define the constant for the starting node of the path exploration.
const ENTRY_NODE = 1;

/**
 * Executes a depth-first search (DFS) like traversal to find the maximum path sum
 * from the ENTRY_NODE to the totalNodeCount.
 * This function encapsulates the main pathfinding logic.
 */
const performPathExploration = () => {
  // Stack to keep track of the sequence of nodes visited in the current active path.
  let currentTraversalSequence = [ENTRY_NODE]; // Replaces 'route'.
  // A Set for efficient O(1) lookup to detect cycles within the current path.
  let currentTraversalSet = new Set([ENTRY_NODE]);

  // Stack to store the weights of the edges taken to reach each node in `currentTraversalSequence`.
  let edgeWeightsAlongPath = [0]; // Replaces 'gain'. The initial 0 represents no cost to start.
  // A running total of the accumulated weight for the current active path.
  let accumulatedPathValue = 0;

  // Stack to store arrays of pending edges (branches) when backtracking.
  // Each element is an array of [destination_node, edge_weight] pairs.
  let branchPointStack = []; // Replaces 'pathStack'.

  // The current set of edges to explore from the present node.
  // Initialized with edges from the starting node. Use a spread operator for a shallow copy.
  let edgesToVisit = [...(graphAdjacencyMap.get(ENTRY_NODE) || [])]; // Replaces 'paths'.

  // Main loop for iterative path exploration. Continues until all possible paths are exhausted.
  while (true) {
    // Check if there are no more edges to explore from the current node.
    if (edgesToVisit.length === 0) {
      // If the `branchPointStack` is empty, it means all paths have been fully explored.
      if (branchPointStack.length === 0) {
        break; // Exit the main exploration loop.
      }

      // Backtrack: Restore the state from the previous branching point.
      const poppedNode = currentTraversalSequence.pop();
      currentTraversalSet.delete(poppedNode); // Remove from set as we're leaving this node.
      const poppedEdgeWeight = edgeWeightsAlongPath.pop();
      accumulatedPathValue -= poppedEdgeWeight; // Subtract the weight of the edge just left.

      // Retrieve the next set of edges to explore from the previous node.
      edgesToVisit = branchPointStack.pop();
      continue; // Restart the loop to process the newly restored `edgesToVisit`.
    }

    // Get the next edge segment (destination node and its weight) from the current node.
    const activeEdgeSegment = edgesToVisit.pop(); // Replaces 'path'.
    const nextVertexIdentifier = activeEdgeSegment[0];     // Replaces 'p'.
    const segmentWeight = activeEdgeSegment[1];             // Replaces 'g'.

    // Check if the current path has reached the designated target node.
    if (nextVertexIdentifier === totalNodeCount) {
      const currentPathTotal = accumulatedPathValue + segmentWeight;
      // Update the highest recorded path sum if the current path's total is greater.
      peakPathAccumulation = Math.max(peakPathAccumulation, currentPathTotal);
      // No 'continue' here, as other paths from the current node still need to be explored.
    }

    // Cycle detection: Check if the `nextVertexIdentifier` is already in the `currentTraversalSet`.
    // If it is, this means we've found a cycle, and we should not extend this path further
    // to avoid infinite loops and redundant exploration.
    if (!currentTraversalSet.has(nextVertexIdentifier)) {
      // Optional: A Type III addition - a dummy check using 'maximumAllowedPathWeight'.
      // If this path segment would push the accumulated weight over a threshold, we could log a warning.
      // This is a non-functional addition for this problem's goal (max gain), but demonstrates Type III.
      if (maximumAllowedPathWeight !== -1 && (accumulatedPathValue + segmentWeight > maximumAllowedPathWeight)) {
          // console.warn(`Path to ${nextVertexIdentifier} exceeds max allowed weight (${maximumAllowedPathWeight}).`);
      }

      // Retrieve the outgoing connections from the `nextVertexIdentifier`.
      const subsequentConnections = graphAdjacencyMap.get(nextVertexIdentifier);

      // If the `nextVertexIdentifier` has valid outgoing connections, extend the path.
      if (subsequentConnections && subsequentConnections.length > 0) {
        // Push the remaining `edgesToVisit` onto the `branchPointStack` for later backtracking.
        branchPointStack.push(edgesToVisit);

        // Update the active path state.
        currentTraversalSequence.push(nextVertexIdentifier);
        currentTraversalSet.add(nextVertexIdentifier);
        edgeWeightsAlongPath.push(segmentWeight);
        accumulatedPathValue += segmentWeight; // Add the weight of the new edge.

        // Set the new `edgesToVisit` to be the connections from the `nextVertexIdentifier`.
        edgesToVisit = [...subsequentConnections]; // Use spread for a shallow copy.
        continue; // Continue to the next iteration to explore these new edges.
      }
    }
    // If a cycle was detected, or if the destination node has no outgoing edges,
    // the loop will proceed to the next `edgesToVisit.pop()` without extending the path.
  }
};

// Initiate the path exploration process.
performPathExploration();

// Output the final result: the highest path sum found.
console.log(peakPathAccumulation);