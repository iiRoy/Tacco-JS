const inputRows = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

const gridSize = inputRows[0] | 0; // Convert the first line to an integer for grid dimension
const matrixData = inputRows.slice(1); // Get the rest of the lines as the matrix content

/**
 * Determines if a given transformation of the matrix maintains symmetry.
 * A matrix is considered symmetric if element at (x, y) equals element at (y, x).
 * This function checks if `matrixData[(row + rOff) % gridSize][(col + cOff) % gridSize]`
 * is equal to `matrixData[(col + rOff) % gridSize][(row + cOff) % gridSize]` for all `row`, `col`.
 * @param {number} rOff - The row offset to apply.
 * @param {number} cOff - The column offset to apply.
 * @returns {number} Returns 1 if the transformed matrix is symmetric, otherwise 0.
 */
function checkSymmetry(rOff, cOff) {
  // Iterate through all possible original row indices
  for (let rowIdx = 0; rowIdx < gridSize; ++rowIdx) {
    // Iterate through all possible original column indices
    for (let colIdx = 0; colIdx < gridSize; ++colIdx) {
      // Calculate the effective positions after applying offsets and wrapping around the grid
      const val1 = matrixData[(rowIdx + rOff) % gridSize][(colIdx + cOff) % gridSize];
      const val2 = matrixData[(colIdx + rOff) % gridSize][(rowIdx + cOff) % gridSize];

      // If any pair of transformed elements (i,j) and (j,i) do not match, it's not symmetric
      if (val1 !== val2) {
        return 0; // Not symmetric
      }
    }
  }
  return 1; // All checks passed, the transformation results in a symmetric matrix
}

let symmetricCount = 0; // Initialize a counter for symmetric configurations

// Iterate through all possible row offsets (from 0 to gridSize-1)
for (let rowOffset = 0; rowOffset < gridSize; ++rowOffset) {
  // Iterate through all possible column offsets (from 0 to gridSize-1)
  for (let colOffset = 0; colOffset < gridSize; ++colOffset) {
    // Add the result of the symmetry check for the current offsets to the total count
    symmetricCount += checkSymmetry(rowOffset, colOffset);
  }
}

// Output the final total count of symmetric configurations
console.log(symmetricCount);
