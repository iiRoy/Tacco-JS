const fileSystemInterface = require('fs');

// Configuration settings for input and parsing operations.
// This object centralizes all adjustable parameters for the script.
const applicationConfiguration = {
  inputSourcePath: '/dev/stdin', // Specifies the path to the input file (standard input for Linux)
  lineBreakCharacter: '\n',      // Defines the character sequence used to delimit lines in the input
  encodingScheme: 'utf8'         // Sets the character encoding for reading the input file
};

// --- Data Acquisition Phase ---

// Attempt to read the raw textual content from the specified input source.
// A try-catch block is used to gracefully handle potential file system errors.
let rawTextualContent;
try {
  rawTextualContent = fileSystemInterface.readFileSync(applicationConfiguration.inputSourcePath, applicationConfiguration.encodingScheme);
} catch (errorReadingFile) {
  // If an error occurs during file reading, log it and terminate the process.
  console.error(`ERROR: Failed to read input data from '${applicationConfiguration.inputSourcePath}'. Details: ${errorReadingFile.message}`);
  process.exit(1); // Exit with a non-zero status code to indicate an error
}

// Basic validation: Check if any content was actually read.
if (!rawTextualContent || rawTextualContent.length === 0) {
  console.error("ERROR: Input file was empty or contained no readable data. Program cannot proceed.");
  process.exit(1);
}

// Process the raw content: convert to string, remove global whitespace, and split into individual lines.
// Empty lines resulting from splitting are filtered out to ensure clean data.
const processedInputLines = rawTextualContent
  .toString()                                       // Explicitly convert buffer to string
  .trim()                                           // Remove leading/trailing whitespace from the entire content
  .split(applicationConfiguration.lineBreakCharacter) // Divide the string into an array of lines
  .filter(lineContent => lineContent.length > 0);   // Discard any lines that are empty after trimming

// --- Graph Structure Initialization Phase ---

// Extract the total number of nodes from the first line of the input.
const totalNodesCountString = processedInputLines.shift(); // Removes and returns the first element
const totalNodesCount = Number(totalNodesCountString);     // Convert the string to a numeric value

// Validate the extracted node count. It must be a positive integer.
if (isNaN(totalNodesCount) || totalNodesCount <= 0 || !Number.isInteger(totalNodesCount)) {
  console.error(`ERROR: Invalid or non-positive node count detected: '${totalNodesCountString}'. A positive integer is required.`);
  process.exit(1);
}

// A Map is used to store the adjacency list.
// Keys will be node identifiers (strings), and values will be Sets of connected node identifiers (strings).
// Using a Set for connected nodes allows for O(1) average time complexity for checking connectivity later.
const graphAdjacencyRegistry = new Map();

// Iterate over the remaining lines in the input, each representing a node's connections.
processedInputLines.forEach((currentGraphLine, lineIndex) => {
  // Skip lines that are empty after trimming, even if they passed the initial filter.
  if (!currentGraphLine.trim()) {
    return;
  }

  // Split each line by spaces and filter out any empty string parts (e.g., from multiple spaces).
  const lineComponents = currentGraphLine.split(' ').filter(part => part.length > 0);

  // Basic validation for line format: A line must contain at least a node identifier.
  if (lineComponents.length < 1) {
    console.warn(`WARNING: Skipping malformed line ${lineIndex + 2} (input line number): "${currentGraphLine}". Expected at least a node ID.`);
    return;
  }

  const primaryNodeIdentifier = lineComponents.shift(); // The first component is the node's own identifier.
  // The original problem description implies a 'number of connections' field after the node ID,
  // which is then discarded. We simply take all remaining components as connected nodes, implicitly
  // ignoring the count if it were present and accurate. This simplifies parsing.
  const directlyConnectedNodes = lineComponents; // All subsequent components are identifiers of connected nodes.

  // Store the primary node's connections as a Set in the registry.
  graphAdjacencyRegistry.set(primaryNodeIdentifier, new Set(directlyConnectedNodes));
});

// --- Adjacency Matrix Generation and Output Phase ---

// Helper function to ensure node IDs are consistently represented as strings.
// This is important because input node IDs are strings, and the Set stores strings.
const convertNumericNodeToStringId = (nodeId) => String(nodeId);

// Output a header to clearly indicate the start of the adjacency matrix.
console.log(`--- Generated Adjacency Matrix for ${totalNodesCount} Nodes ---`);

// Loop through each possible source node, from 1 up to the total node count.
for (let currentSourceNodeNumber = 1; currentSourceNodeNumber <= totalNodesCount; currentSourceNodeNumber++) {
  const sourceNodeKey = convertNumericNodeToStringId(currentSourceNodeNumber);
  // Retrieve the set of nodes connected to the current source node.
  // If a node has no entry in the registry, its connections will be undefined.
  const connectionsFromSource = graphAdjacencyRegistry.get(sourceNodeKey);

  // Generate a row for the adjacency matrix.
  // Array.from is used to create an array of the correct size, then mapped to populate values.
  const currentMatrixRow = Array.from({ length: totalNodesCount }, (_, targetIndex) => {
    const targetNodeNumber = targetIndex + 1; // Node IDs are 1-based.
    const targetNodeKey = convertNumericNodeToStringId(targetNodeNumber);

    // Determine if there is an edge from currentSourceNode to targetNode.
    // If 'connectionsFromSource' is undefined (meaning the source node had no explicit connections defined),
    // or if the target node is not in the set of connected nodes, the value is 0 (no connection).
    // Otherwise, it's 1 (connection exists).
    return (connectionsFromSource && connectionsFromSource.has(targetNodeKey)) ? 1 : 0;
  });

  // Print the generated row, with elements separated by spaces.
  console.log(currentMatrixRow.join(' '));
}

// Output a footer to indicate the completion of the matrix generation.
console.log(`--- Adjacency Matrix Output Complete ---`);