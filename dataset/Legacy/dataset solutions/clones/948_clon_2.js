(function executeProgram() {
  // Read all input from standard input, decode as UTF-8, trim whitespace, and split into an array of lines.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line contains the number of nodes in the graph.
  const nodeCount = Number(inputLines.shift());

  // Initialize an adjacency list representation for the graph.
  // Each element in 'neighborLists' will be an array of neighbors for a given node.
  const neighborLists = Array.from({ length: nodeCount }, () => []);

  // Process each subsequent line to populate the adjacency lists.
  // Each line describes a node and its neighbors.
  inputLines.forEach((lineContent, currentIndex) => {
    // Split the line by spaces, discard the first two elements (node ID and degree),
    // then iterate over the remaining elements which are neighbor IDs.
    lineContent.split(' ').splice(2).forEach(neighborNodeId => {
      // Add the neighbor (adjusted to be 0-indexed) to the current node's adjacency list.
      neighborLists[currentIndex].push(Number(neighborNodeId) - 1);
    });
  });

  // Arrays to store discovery times (d) and finish times (f) for each node.
  const discoveryTimes = [];
  const finishTimes = [];

  // Execute the Depth First Search algorithm.
  performDepthFirstSearch(neighborLists, discoveryTimes, finishTimes);

  // Build the output string.
  let outputBuffer = '';
  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    // Format each node's ID (1-indexed), discovery time, and finish time.
    outputBuffer += `${nodeIdx + 1} ${discoveryTimes[nodeIdx]} ${finishTimes[nodeIdx]}\n`;
  }

  // Write the accumulated output string to standard output.
  process.stdout.write(outputBuffer);
})(); // End of IIFE

/**
 * Performs a Depth First Search (DFS) on a graph.
 *
 * @param {Array<Array<number>>} adjacencies - The adjacency list representation of the graph.
 * @param {Array<number>} discoverTimes - Array to store the discovery time for each node.
 * @param {Array<number>} finishTimes - Array to store the finish time for each node.
 */
function performDepthFirstSearch(adjacencies, discoverTimes, finishTimes) {
  // Define states for nodes during DFS traversal.
  const UNVISITED_NODE = 0; // Node has not been visited yet.
  const VISITING_NODE = 1;  // Node is currently in the recursion stack (being visited).
  const VISITED_NODE = 2;   // Node and all its descendants have been visited.

  // The total number of nodes in the graph.
  const graphSize = adjacencies.length;

  // Initialize the state of all nodes to UNVISITED.
  // Using Array.from with a mapping function to ensure a new array is created.
  const nodeStates = Array.from({ length: graphSize }, () => UNVISITED_NODE);

  // A global timer to track discovery and finish times.
  let globalTimer = 0;

  /**
   * Recursive helper function to visit a node and its neighbors.
   *
   * @param {number} currentNodeIndex - The index of the node to visit.
   */
  function exploreNode(currentNodeIndex) {
    // Mark the current node as VISITING.
    nodeStates[currentNodeIndex] = VISITING_NODE;
    // Increment the global timer and record the discovery time for the current node.
    discoverTimes[currentNodeIndex] = ++globalTimer;

    // Iterate over all neighbors of the current node.
    adjacencies[currentNodeIndex].forEach(adjacentNodeIndex => {
      // If a neighbor has not been visited yet, recursively explore it.
      if (nodeStates[adjacentNodeIndex] === UNVISITED_NODE) {
        exploreNode(adjacentNodeIndex);
      }
    });

    // Mark the current node as VISITED after all its descendants have been explored.
    nodeStates[currentNodeIndex] = VISITED_NODE;
    // Increment the global timer and record the finish time for the current node.
    finishTimes[currentNodeIndex] = ++globalTimer;
  }

  // Iterate through all nodes in the graph.
  // If a node has not been visited, start a new DFS traversal from it.
  // This handles disconnected components in the graph.
  adjacencies.forEach((_, nodeIndex) => { // The first parameter (element) is not used, so it's named '_'
    if (nodeStates[nodeIndex] === UNVISITED_NODE) {
      exploreNode(nodeIndex);
    }
  });
}
