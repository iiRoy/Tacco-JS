(function(inputContent) {
  // This self-executing function processes graph data from standard input.

  var inputRecords = inputContent.trim().split('\n'); // Clean and split the raw input into an array of lines.
  var vertexCount = parseInt(inputRecords.shift(), 10); // The first line specifies the total number of vertices.
  var adjacencies = []; // This array will store the adjacency lists for each vertex.
  var nodeStatus = []; // This array tracks the visitation state of each node (e.g., 'WHITE', 'GRAY', 'BLACK').

  inputRecords.forEach(function(recordLine) {
    // For each subsequent line, parse the connected nodes.
    // The first two elements (ID and degree) are skipped, as per problem format.
    var neighborIndices = recordLine.split(' ').map(Number).slice(2);
    adjacencies.push(neighborIndices); // Add the list of neighbors for the current node.
    nodeStatus.push('WHITE'); // Initialize all nodes as 'WHITE' (unvisited).
  });

  var globalTimestamp = 0; // A counter for tracking discovery and finish times during traversal.
  var discoveryTimestamps = []; // Stores the time when each node is first visited.
  var finishTimestamps = []; // Stores the time when all descendants of a node have been visited.

  /**
   * Implements a Depth-First Search (DFS) algorithm.
   * Explores as far as possible along each branch before backtracking.
   * @param {number} currentVertexId - The 1-based identifier of the node to start the traversal from.
   */
  function traverseGraphDepthFirst(currentVertexId) {
    var zeroBasedIndex = currentVertexId - 1; // Convert the 1-based ID to a 0-based array index.
    nodeStatus[zeroBasedIndex] = 'GRAY'; // Mark the current node as 'GRAY' (currently being explored).
    discoveryTimestamps[zeroBasedIndex] = ++globalTimestamp; // Assign a discovery timestamp.

    // Iterate through all nodes adjacent to the current node.
    adjacencies[zeroBasedIndex].forEach(function(adjacentVertex) {
      // If an adjacent node is 'WHITE' (unvisited), recursively call DFS on it.
      if (nodeStatus[adjacentVertex - 1] === 'WHITE') {
        traverseGraphDepthFirst(adjacentVertex);
      }
    });

    nodeStatus[zeroBasedIndex] = 'BLACK'; // Mark the current node as 'BLACK' (finished exploring).
    finishTimestamps[zeroBasedIndex] = ++globalTimestamp; // Assign a finish timestamp.
  }

  traverseGraphDepthFirst(1); // Begin the DFS traversal from the first vertex (typically vertex 1).

  // Output the results: Node ID, Discovery Time, and Finish Time for each node.
  for (var loopIndex = 0; loopIndex < vertexCount; loopIndex++) {
    console.log([loopIndex + 1, discoveryTimestamps[loopIndex], finishTimestamps[loopIndex]].join(' '));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input using Node.js 'fs' module.