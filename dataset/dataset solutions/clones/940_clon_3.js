(function processGraphDataStructure() {
  // Retrieve the raw input data from standard input.
  // The data is read as a single string, then trimmed and split into an array of lines.
  const rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // Implement a basic guard clause for cases where no input is provided.
  if (rawInputLines.length === 0) {
    console.error("Execution halted: No input data was found.");
    return;
  }

  // The initial line of input is expected to contain the total number of nodes in the graph.
  const firstLineContent = rawInputLines[0];
  const totalGraphNodes = parseInt(firstLineContent, 10);

  // Validate the parsed number of nodes. It must be a positive integer.
  if (isNaN(totalGraphNodes) || totalGraphNodes <= 0) {
    console.error(`Fatal error: Invalid or non-positive number of nodes provided: "${firstLineContent}".`);
    return;
  }

  // Define constants for the values representing connectivity in the matrix.
  // This enhances readability compared to using raw '0' and '1'.
  const NODE_IS_CONNECTED = 1;
  const NODE_IS_DISCONNECTED = 0;

  // Initialize a square adjacency matrix to represent the graph's connections.
  // The matrix dimensions are `totalGraphNodes` by `totalGraphNodes`.
  // All cells are initially set to `NODE_IS_DISCONNECTED`.
  const adjacencyMatrix = [];
  for (let rIndex = 0; rIndex < totalGraphNodes; ++rIndex) {
    // Each row is an array, pre-filled with the 'disconnected' state.
    adjacencyMatrix.push(new Array(totalGraphNodes).fill(NODE_IS_DISCONNECTED));
  }

  // Iterate through the remaining input lines, starting from the second line (index 1).
  // Each of these lines describes the connections originating from a specific source node.
  for (let currentLineIdx = 1; currentLineIdx < rawInputLines.length; ++currentLineIdx) {
    const detailedConnectionInfo = rawInputLines[currentLineIdx];
    
    // Split the current line into individual string components based on spaces.
    const lineComponents = detailedConnectionInfo.split(' ');

    // The source node's 0-indexed position corresponds to its line index minus one.
    // (Since the first line was for total nodes, and nodes are typically 1-indexed in problem statements).
    const sourceNodeZeroBasedIndex = currentLineIdx - 1;

    // Add a sanity check to ensure the derived source node index is within the expected bounds.
    if (sourceNodeZeroBasedIndex < 0 || sourceNodeZeroBasedIndex >= totalGraphNodes) {
        console.warn(`Warning: Skipping line ${currentLineIdx} due to an out-of-bounds source node index (${sourceNodeZeroBasedIndex}).`);
        continue; 
    }

    // The actual connected node identifiers start from the third component (index 2) onwards.
    // The first two components are typically the source node ID and its connection count, which we skip.
    for (let componentPosition = 2; componentPosition < lineComponents.length; ++componentPosition) {
      const targetNodeStringId = lineComponents[componentPosition];
      const targetNodeZeroBasedIndex = parseInt(targetNodeStringId, 10) - 1; // Convert to 0-indexed.

      // Validate the target node index to prevent errors like `NaN` or out-of-bounds access.
      if (isNaN(targetNodeZeroBasedIndex) || targetNodeZeroBasedIndex < 0 || targetNodeZeroBasedIndex >= totalGraphNodes) {
        console.warn(`Warning: Invalid target node ID '${targetNodeStringId}' encountered for source node ${sourceNodeZeroBasedIndex + 1} on line ${currentLineIdx}. This connection will be ignored.`);
        continue; 
      }

      // Establish the connection in the adjacency matrix.
      // A '1' indicates that there is an edge from the source node to the target node.
      adjacencyMatrix[sourceNodeZeroBasedIndex][targetNodeZeroBasedIndex] = NODE_IS_CONNECTED;
    }
  }

  // Prepare the final output string by formatting the adjacency matrix.
  // Each row's elements are joined by a space, and each formatted row is then joined by a newline.
  const finalFormattedOutput = adjacencyMatrix.map(matrixRow => {
    // Convert each row array into a space-separated string.
    return matrixRow.join(' ');
  }).join('\n'); // Join all row strings with newline characters.

  // Print the complete adjacency matrix to standard output.
  console.log(finalFormattedOutput);
})();