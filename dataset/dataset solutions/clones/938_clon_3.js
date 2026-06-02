const fileSystemModule = require('fs');

// Configuration for input source and line termination
const applicationSettings = {
  sourceFilePath: '/dev/stdin', // Default to Linux standard input
  lineSeparator: '\n'           // Default to Unix-style newline
};

// Read the entire file content, convert to ASCII, trim whitespace, and split into individual lines
const rawFileContentBuffer = fileSystemModule.readFileSync(applicationSettings.sourceFilePath, 'ascii');
const processedContentString = rawFileContentBuffer.trim();
const inputDataLines = processedContentString.split(applicationSettings.lineSeparator);

// Extract the total number of nodes from the first line
const totalNodeCount = Number(inputDataLines.shift());

// Initialize an object to store the graph's adjacency list representation
const graphAdjacencyMap = {};

// Process each subsequent line to populate the adjacency map
// Each line describes a node and its direct neighbors
for (let lineIdx = 0; lineIdx < inputDataLines.length; ++lineIdx) {
  const currentInputLine = inputDataLines[lineIdx];
  const lineSegments = currentInputLine.split(' '); // Split the line by spaces

  const sourceNodeIdentifier = lineSegments.shift(); // The first element is the source node ID
  lineSegments.shift(); // The second element is 'k' (number of neighbors), which we can discard

  const neighborNodeIdentifiers = lineSegments; // The rest are the neighbor IDs
  graphAdjacencyMap[sourceNodeIdentifier] = neighborNodeIdentifiers;
}

// Generate and print the adjacency matrix
// Iterate through each possible source node (row in the matrix)
for (let rowNodeId = 1; rowNodeId <= totalNodeCount; ++rowNodeId) {
  const currentRowMatrix = []; // Array to store the 0s and 1s for the current row

  // Retrieve the list of neighbors for the current source node.
  // If a node from 1 to totalNodeCount was not present as a source in the input,
  // graphAdjacencyMap[rowNodeId] would be undefined. The subsequent call to .includes()
  // would then throw an error, preserving the original behavior.
  const currentSourceNodeNeighbors = graphAdjacencyMap[rowNodeId];

  // Iterate through each possible target node (column in the matrix)
  for (let colNodeId = 1; colNodeId <= totalNodeCount; ++colNodeId) {
    const targetNodeIdString = String(colNodeId); // Convert target node ID to string for comparison

    // Check if the target node is present in the current source node's neighbor list
    // Using .includes() is a more modern and readable way than .indexOf() !== -1
    const isConnected = currentSourceNodeNeighbors.includes(targetNodeIdString);

    // Add 1 if connected, 0 if not connected
    currentRowMatrix.push(isConnected ? 1 : 0);
  }
  // Print the current row of the adjacency matrix, with elements joined by spaces
  console.log(currentRowMatrix.join(' '));
}
