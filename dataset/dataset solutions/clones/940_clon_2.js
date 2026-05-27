(function executeProgram() {
  // This program reads adjacency list data from standard input
  // and converts it into an adjacency matrix representation.

  // Read all lines from standard input, decode as UTF-8,
  // remove any leading/trailing whitespace, and split into an array of strings.
  const inputRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The very first line of the input specifies the number of nodes (N).
  // We parse this string into a numerical value and remove it from the input array.
  const matrixSize = Number(inputRows.shift());

  // Initialize an N x N square matrix with all elements set to zero.
  // This will represent the adjacency matrix where 0 means no connection and 1 means a connection.
  const adjacencyMatrix = Array.from(Array(matrixSize), () => Array.from(Array(matrixSize), () => 0));

  // Iterate through the remaining input lines. Each line describes the connections for a specific node.
  // 'currentRow' is the string content of the current line, 'rowIndex' is its zero-based index.
  inputRows.forEach((currentRow, rowIndex) => {
    // For each line:
    // 1. Split the line by spaces to get individual string elements.
    // 2. Use 'splice(2)' to remove the first two elements. These are typically the node ID and the count of its neighbors,
    //    which are not needed for populating the adjacency matrix in this specific algorithm.
    // 3. Iterate over the remaining elements, which represent the indices of connected nodes.
    currentRow.split(' ').splice(2).forEach(elementValue => {
      // Convert the neighbor's index string to a number and adjust it to be zero-based (e.g., if input is 1-based).
      // Set the corresponding cell in the adjacency matrix to 1, indicating a connection.
      adjacencyMatrix[rowIndex][elementValue - 1] = 1;
    });
  });

  // After populating the matrix, format it for output.
  // 1. For each row in the adjacency matrix, join its elements with a single space.
  // 2. Then, join all the resulting row strings with a newline character to form the final output string.
  // 3. Print the formatted string to the console.
  console.log(adjacencyMatrix.map(matrixRow => matrixRow.join(' ')).join('\n'));
})();
