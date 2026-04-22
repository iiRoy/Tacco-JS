(function executeProgram() {
  // Acquire raw input data from the standard input stream.
  const inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split('\n');

  // Parse the total number of graph vertices from the initial line.
  const nodeCount = Number(inputDataRows.shift());

  // Set up the adjacency list representation for the graph connections.
  const neighboringNodes = Array.from(Array(nodeCount), () => new Array());

  // Process subsequent input lines to populate the graph's connections.
  inputDataRows.forEach( ( currentLine, idx ) => {
    currentLine.split(' ').splice(2).forEach( connectedNodeStr => {
      neighboringNodes[idx].push( parseInt(connectedNodeStr, 10) - 1 );
    });
  });

  // Initialize arrays to store the discovery and finalization times for each node.
  const discoveryTimestamps = new Array(nodeCount);
  const finishTimestamps = new Array(nodeCount);

  // Initiate the Depth First Search traversal process.
  depthFirstSearchTraversal(neighboringNodes, discoveryTimestamps, finishTimestamps);

  // Build the complete string for output, formatting each node's times.
  let outputBuffer = '';
  for ( let current_index = 0; current_index < nodeCount; current_index++ ) {
    outputBuffer += `${current_index + 1} ${discoveryTimestamps[current_index]} ${finishTimestamps[current_index]}\n`;
  }

  // Print the accumulated output string to the standard output.
  process.stdout.write(outputBuffer);
})();


function depthFirstSearchTraversal(neighboringNodes, discoveryTimestamps, finishTimestamps) {
  // Define distinct numerical constants for node visitation states.
  const UNVISITED = 10;
  const VISITING = 20;
  const VISITED_DONE = 30;

  const totalNodes = neighboringNodes.length; // The total quantity of nodes in the graph.
  const nodeState = Array.from(neighboringNodes, () => UNVISITED); // Array to track the visitation status of each node.

  let globalTimestamp = 0; // A monotonically increasing counter for tracking time during traversal.

  // This internal function recursively explores a node and all its reachable, unvisited neighbors.
  const exploreNode = (currentNodeIdx) => {
    nodeState[currentNodeIdx] = VISITING; // Mark the current node as being processed.
    discoveryTimestamps[currentNodeIdx] = ++globalTimestamp; // Record the time when this node was first encountered.

    // Iterate through all adjacent nodes to the current node.
    neighboringNodes[currentNodeIdx].forEach( (neighborNodeIdx) => {
      if (nodeState[neighborNodeIdx] === UNVISITED) {
        exploreNode(neighborNodeIdx); // If a neighbor is unvisited, recursively call exploreNode on it.
      }
    });

    nodeState[currentNodeIdx] = VISITED_DONE; // Mark the current node as fully processed and all its descendants visited.
    finishTimestamps[currentNodeIdx] = ++globalTimestamp; // Record the time when processing of this node and its subtree completed.
  };

  // Ensure that every node in the graph is visited, even if the graph is disconnected.
  neighboringNodes.forEach((_element, currentNodeIdx) => {
    if (nodeState[currentNodeIdx] === UNVISITED) {
      exploreNode(currentNodeIdx); // Start a new DFS traversal from any unvisited node.
    }
  });
}