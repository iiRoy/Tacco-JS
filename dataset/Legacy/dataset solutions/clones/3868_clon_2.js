var inputRows = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

// Determine the size of the square matrix from the first line of input.
var matrixSize = inputRows[0] | 0;

// Extract the character matrix data from the subsequent lines.
var charMatrix = inputRows.slice(1);

/**
 * Checks if a sub-matrix, offset by given row and column values,
 * exhibits a specific symmetry property.
 * @param {number} rowOffset - The row displacement for the sub-matrix.
 * @param {number} colOffset - The column displacement for the sub-matrix.
 * @returns {number} 1 if symmetric, 0 otherwise.
 */
function isSymmetric(rowOffset, colOffset) {
  // Iterate through each cell of the conceptual matrix.
  for (var rowIndex = 0; rowIndex < matrixSize; ++rowIndex) {
    for (var colIndex = 0; colIndex < matrixSize; ++colIndex) {
      // Compare elements based on the symmetry condition:
      // s[(i+a)%n][(j+b)%n] !== s[(j+a)%n][(i+b)%n]
      if (charMatrix[(rowIndex + rowOffset) % matrixSize][(colIndex + colOffset) % matrixSize] !== charMatrix[(colIndex + rowOffset) % matrixSize][(rowIndex + colOffset) % matrixSize]) {
        return 0; // Not symmetric
      }
    }
  }
  return 1; // Symmetric
}

// Initialize a counter for the total symmetric configurations.
var totalCount = 0;

// Iterate through all possible row offsets (a) while keeping column offset (b) at 0.
for (var currentOffset = 0; currentOffset < matrixSize; ++currentOffset) {
  // If the configuration is symmetric, add matrixSize to the total count.
  // This is because for each 'a', if good(a,0) is true, it implies good(a,b) is true for all b.
  totalCount += isSymmetric(currentOffset, 0) * matrixSize;
}

// Output the final calculated total count.
console.log(totalCount);
