(function(inputData) {
  // This section processes the raw input string, splitting it into individual lines.
  var inputRows = inputData.trim().split('\n');

  // The initial line of input specifies the total quantity of nodes in the graph.
  var nodeCount = parseInt(inputRows.shift(), 0xA);

  // Data structures are initialized to represent the graph and track node states during traversal.
  var adjacencyList = []; // Stores the list of connected neighbors for each node (using 0-based indexing).
  var nodeStatus = [];    // An array to keep track of the current state of each node (e.g., 'UNVISITED', 'VISITING', 'VISITED').

  // We iterate through the remaining input lines, each describing a node and its connections.
  inputRows.forEach(function(rowContent) {
    // Each row is parsed to extract the indices of adjacent nodes.
    // The first two numbers in the row (node ID and degree) are typically skipped.
    var neighborIndices = rowContent.split(' ').map(Number).slice(0x2);
    adjacencyList.push(neighborIndices); // The extracted neighbors are added to the adjacency list.
    nodeStatus.push('UNVISITED');       // All nodes are initially marked as 'UNVISITED'.
  });

  // Variables are set up to record the discovery and finish times for nodes during the Depth-First Search.
  var globalTimer = 0x0;      // A global counter that increments with each significant event (discovery/finish).
  var discoveryTimes = [];    // An array to store the timestamp when a node is first encountered.
  var finishTimes = [];       // An array to store the timestamp when a node and all its descendants have been fully processed.

  /**
   * Executes a Depth-First Search traversal starting from a specified node.
   * @param {number} currentNodeId - The 1-based identifier for the node from which the DFS should commence.
   */
  function depthFirstSearch(currentNodeId) {
    // Convert the 1-based node identifier to a 0-based array index for internal use.
    var zeroBasedIndex = currentNodeId - 0x1;

    // Mark the current node as 'VISITING' to indicate it's currently being processed.
    nodeStatus[zeroBasedIndex] = 'VISITING';
    // Record the exact moment this node was discovered.
    discoveryTimes[zeroBasedIndex] = ++globalTimer;

    // Traverse through all the neighbors connected to the current node.
    adjacencyList[zeroBasedIndex].forEach(function(adjacentNodeId) {
      // If a neighboring node has not yet been visited, recursively call DFS on it.
      if (nodeStatus[adjacentNodeId - 0x1] === 'UNVISITED') {
        depthFirstSearch(adjacentNodeId);
      }
    });

    // Once all neighbors and their respective subgraphs have been explored, mark the current node as 'VISITED'.
    nodeStatus[zeroBasedIndex] = 'VISITED';
    // Record the time when the processing of this node (and its entire subtree) is completed.
    finishTimes[zeroBasedIndex] = ++globalTimer;
  }

  // Begin the Depth-First Search process starting from the first node (node 1).
  depthFirstSearch(0x1);

  // Finally, iterate through all nodes and print their ID along with their discovery and finish times.
  for (var idx = 0x0; idx < nodeCount; idx++) {
    console.log([idx + 0x1, discoveryTimes[idx], finishTimes[idx]].join(' '));
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // The entire function is immediately invoked with input read from standard input.
