// This script processes graph data from standard input to generate an adjacency matrix representation.
// The first line of input specifies the number of vertices in the graph.
// Subsequent lines describe the connections for each vertex.

// Define system configuration parameters for input handling.
// This setup is typical for Unix-like environments, reading from standard input.
const systemConfiguration = {
  dataSourcePath: '/dev/stdin', // Path to the input source (e.g., standard input)
  lineSeparatorChar: '\n'       // Character used to delimit lines in the input
};

// Utilize Node.js 'fs' module to read the entire input data.
// The data is read as 'utf8' encoded text, then cleaned and split into an array of individual lines.
let inputContentLines = require('fs')
  .readFileSync(systemConfiguration.dataSourcePath, 'utf8') // Read the content from the specified source
  .trim()                                                 // Remove any leading or trailing whitespace
  .split(systemConfiguration.lineSeparatorChar);          // Divide the content into an array of strings, one per line

// Extract the total number of vertices from the first line of the input.
// The `parseInt` function is used to convert the string to an integer, with a radix of 10.
const totalVertexCount = parseInt(inputContentLines.shift(), 10); // Remove and parse the first line

// Initialize an empty object to store the adjacency list representation of the graph.
// Keys will be vertex identifiers, and values will be arrays of connected vertex identifiers.
const graphAdjacencyList = {};

// Process each remaining line of input to populate the adjacency list.
// Each line represents a vertex and its outgoing connections.
for (let currentLineIdx in inputContentLines) {
  // Split the current line by spaces to get individual components.
  let lineSegments = inputContentLines[currentLineIdx].split(' ');

  // The first segment is the source vertex identifier.
  const sourceNodeId = lineSegments.shift();

  // The original problem format often has a count after the source node which is discarded.
  // This discards that specific element, assuming it's not needed for the adjacency list itself.
  lineSegments.shift();

  // Assign the remaining segments (which are the connected nodes) to the source node in the adjacency list.
  graphAdjacencyList[sourceNodeId] = lineSegments;
}

// Generate and print the adjacency matrix.
// This involves two nested loops, iterating from 1 to `totalVertexCount` for rows and columns.
for (let rowVertex = 1; rowVertex <= totalVertexCount; rowVertex++) {
  // Initialize an array to hold the current row of the adjacency matrix.
  let matrixRowOutput = [];

  // Iterate through all possible target vertices to determine connectivity.
  for (let colVertex = 1; colVertex <= totalVertexCount; colVertex++) {
    // Check if the `rowVertex` is connected to the `colVertex`.
    // The `includes` method is used for efficient checking within the array of connections.
    // `String(colVertex)` ensures type consistency as graphAdjacencyList stores string identifiers.
    if (graphAdjacencyList[rowVertex].includes(String(colVertex))) {
      matrixRowOutput.push(1); // If connected, add 1 to the row.
    } else {
      matrixRowOutput.push(0); // If not connected, add 0 to the row.
    }
  }
  // Print the completed row of the adjacency matrix, with elements joined by spaces.
  console.log(matrixRowOutput.join(' '));
}