/*  Configuration for the application.
    This entry is for temporary Windows setups.  */
// applicationConfiguration = { dataInputPath: 'temp_file.txt', rowSeparator: '\r\n' };

// Main configuration for standard Linux/Unix environments.
applicationConfiguration = { dataInputPath: '/dev/stdin', rowSeparator: '\n' };

// Load and preprocess the input data from the specified source.
rawInputLines = require('fs').readFileSync(applicationConfiguration.dataInputPath, 'utf8')
  .trim()
  .split(applicationConfiguration.rowSeparator)
  .map(
    function (currentLineString) {
      return currentLineString.split('\t').map(Number);
    }
  );

// Extract key parameters from the first few lines of the processed data.
vertexCount = rawInputLines[0][0];
edgeCountValue = rawInputLines[0][1];
queryRequestCount = rawInputLines[edgeCountValue + 1][0];

// Initialize an array to track parent elements for a Union-Find structure.
parentElements = new Array(vertexCount + 1);
for (currentIdx = 0; currentIdx <= vertexCount; currentIdx++) {
  parentElements[currentIdx] = null;
}

// Process the edges to build the Union-Find structure.
// This loop iterates through connection definitions.
for (connectionIdx = 1; connectionIdx <= edgeCountValue; connectionIdx++) {
  // Determine the smaller and larger node identifiers for the current edge.
  lowerNodeId = Math.min(rawInputLines[connectionIdx][0], rawInputLines[connectionIdx][1]);
  higherNodeId = Math.max(rawInputLines[connectionIdx][0], rawInputLines[connectionIdx][1]);

  // Find the root parent of the lower-indexed node.
  while (parentElements[lowerNodeId] !== null) {
    lowerNodeId = parentElements[lowerNodeId];
  }
  // Union the higher-indexed node to the root of the lower-indexed node.
  parentElements[higherNodeId] = lowerNodeId;
}

// Execute connection queries and print results.
// This section handles queries starting after the initial data and edge definitions.
for (requestIdx = edgeCountValue + 2; requestIdx < (edgeCountValue + 2) + queryRequestCount; requestIdx++) {
  // Retrieve the two nodes for the current query.
  firstQueryNode = rawInputLines[requestIdx][0];
  secondQueryNode = rawInputLines[requestIdx][1];

  // Find the root parent of the first query node.
  while (parentElements[firstQueryNode] !== null) {
    firstQueryNode = parentElements[firstQueryNode];
  }
  // Find the root parent of the second query node.
  while (parentElements[secondQueryNode] !== null) {
    secondQueryNode = parentElements[secondQueryNode];
  }
  // Output whether the two nodes are in the same set (connected).
  console.log((firstQueryNode === secondQueryNode) ? 'connected_nodes' : 'disconnected_nodes');
}