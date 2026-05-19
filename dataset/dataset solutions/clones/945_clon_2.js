(function executeGraphTraversal() {
  // This section handles reading input data and initializing graph structures.
  const inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line of input specifies the total number of nodes in the graph.
  const nodeCount = Number(inputDataRows.shift());

  // Create an array of arrays to represent the adjacency list for the graph.
  // Each index 'k' in 'adjacencyStructures' will hold an array of nodes directly reachable from node 'k'.
  const adjacencyStructures = Array.from(Array(nodeCount), () => []);

  // This array will store the shortest path distance from the source node (node 0) to every other node.
  const distanceValues = [];

  // Iterate through the remaining input lines to populate the adjacency lists.
  // Each line describes a node and its connections.
  inputDataRows.forEach((currentRow, currentIdx) => {
    // Parse the current line: split by space, discard the first two elements (node ID and degree),
    // then process the remaining elements which are the neighbors.
    currentRow.split(' ').splice(2).forEach(edgeTarget => {
      // Convert the neighbor string to a number and adjust to 0-based indexing, then add to the list.
      adjacencyStructures[currentIdx].push(Number(edgeTarget) - 1);
    });
  });

  // Execute the Breadth-First Search algorithm to compute shortest distances.
  breadthFirstSearch(adjacencyStructures, distanceValues);

  // After BFS, print the results: node ID (1-based) and its calculated shortest distance.
  for (let currentIdx = 0; currentIdx < nodeCount; ++currentIdx) {
    console.log(currentIdx + 1, distanceValues[currentIdx]);
  }
})(); // End of the immediately invoked function expression.


/**
 * Implements the Breadth-First Search (BFS) algorithm to find shortest paths
 * from a source node (assumed to be node 0) in an unweighted graph.
 *
 * @param {Array<Array<number>>} adjacencyStructures - The graph's adjacency list.
 * @param {Array<number>} distanceValues - An output array to store computed distances.
 */
function breadthFirstSearch(adjacencyStructures, distanceValues) {
  // Define constants for node states during the traversal.
  const UNVISITED = 0; // Node has not been discovered yet.
  const VISITING = 1;  // Node has been discovered and added to the queue.
  const VISITED = 2;   // Node has been fully processed (all its neighbors explored).

  // Initialize an array to keep track of the state of each node.
  const nodeStatus = Array.from(adjacencyStructures, () => UNVISITED);

  // The distance from the source node (node 0) to itself is 0.
  distanceValues[0] = 0;

  // Initialize distances for all other nodes to -1, indicating they are unreachable initially.
  for (let nodeIdx = 1; nodeIdx < adjacencyStructures.length; ++nodeIdx) {
    distanceValues[nodeIdx] = -1;
  }

  // Initialize the queue for BFS. It starts with the source node (node 0).
  // This variable is intentionally declared without 'let' or 'const' to match the original's implicit global scope.
  processingQueue = [0];

  let currentNodeIdentifier; // Variable to hold the node being processed from the queue.

  // Continue the BFS traversal as long as there are nodes in the queue.
  while ((currentNodeIdentifier = processingQueue.shift()) !== undefined) {
    // Iterate over each neighbor of the current node.
    adjacencyStructures[currentNodeIdentifier].forEach(neighborNodeIdentifier => {
      // If the neighbor has not been visited yet.
      if (nodeStatus[neighborNodeIdentifier] === UNVISITED) {
        nodeStatus[neighborNodeIdentifier] = VISITING; // Mark the neighbor as discovered.
        // Set the neighbor's distance as one more than the current node's distance.
        distanceValues[neighborNodeIdentifier] = distanceValues[currentNodeIdentifier] + 1;
        processingQueue.push(neighborNodeIdentifier); // Add the neighbor to the queue for processing.
      }
    });
    nodeStatus[currentNodeIdentifier] = VISITED; // Mark the current node as fully processed.
  }
}
