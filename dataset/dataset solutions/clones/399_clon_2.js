/**
 * Function to compute the maximum length of a continuous sequence of '1's
 * starting from a specified cell and extending in any of the four primary
 * (horizontal/vertical) or diagonal directions.
 *
 * @param {number} startRow  - The initial row index for path exploration.
 * @param {number} startCol  - The initial column index for path exploration.
 * @returns {number} The maximum detected path length from the given starting point.
 */
function determineMaxSequence(startRow, startCol) {
  // Define changes in row index for various directions (e.g., right, down-left, down, down-right)
  const rowOffsets = [0, 1, 1, 1];

  // Define changes in column index for corresponding directions
  const colOffsets = [1, -1, 0, 1];

  let longestFound = 1; // Initialize the maximum sequence length with 1 (the starting cell itself).

  // Iterate through each of the four predefined directional vectors.
  for (let directionIndex = 0; directionIndex < 4; ++directionIndex) {
    let currentSequenceLength = 1; // Reset the length for the current direction's path.

    // Extend the path step-by-step in the current direction.
    // The loop continues as long as the steps are within the grid dimension.
    for (let stepCount = 1; stepCount <= globalGridDimension; ++stepCount) {
      // Calculate the coordinates of the next cell in the current path.
      let nextRowCoord = startRow + (rowOffsets[directionIndex] * stepCount);
      let nextColCoord = startCol + (colOffsets[directionIndex] * stepCount);

      // Check for boundary conditions: if the next cell is outside the grid,
      // the path in this direction terminates.
      if (nextRowCoord < 0 || nextColCoord < 0 || nextRowCoord >= globalGridDimension || nextColCoord >= globalGridDimension) {
        break;
      }

      // Check the value of the next cell: if it's not '1', the path is broken.
      if (mainMatrix[nextRowCoord][nextColCoord] !== 1) {
        break;
      }

      // If the cell is within bounds and contains '1', increment the sequence length.
      currentSequenceLength++;
    }

    // Update the overall longest sequence found from this starting cell.
    longestFound = Math.max(longestFound, currentSequenceLength);

    // This reset is technically redundant as currentSequenceLength is re-initialized
    // at the start of the outer loop, but it maintains the original code's flow.
    currentSequenceLength = 1;
  }

  return longestFound; // Return the maximum sequence length found from this starting point.
}


// --- Main Program Execution ---

// Load the 'fs' module for file system operations.
// Read all input from standard input synchronously and decode it as UTF-8.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input: remove leading/trailing whitespace and split into an array of lines.
let inputLines = rawInputContent.trim().split('\n');

// The primary loop for processing multiple grid configurations.
while (true) {
  // Extract the grid dimension from the first line of the remaining input.
  // The '- 0' implicitly converts the string to a number.
  var globalGridDimension = inputLines.shift() - 0;

  // Termination condition: a grid dimension of 0 signifies the end of input.
  if (globalGridDimension === 0) {
    break;
  }

  // Initialize an empty array to construct the grid matrix.
  let mainMatrix = [];

  // Populate the grid matrix based on the subsequent input lines.
  for (let rowIndex = 0; rowIndex < globalGridDimension; ++rowIndex) {
    // For each row, take the next line, split it into individual characters,
    // and then map each character to its numerical value.
    mainMatrix[rowIndex] = inputLines.shift().split('').map(Number);
  }

  // Variable to store the overall maximum path length encountered across the entire grid.
  let overallLongestPath = 0;

  // Iterate through every cell in the grid.
  for (let rowIndex = 0; rowIndex < globalGridDimension; ++rowIndex) {
    for (let colIndex = 0; colIndex < globalGridDimension; ++colIndex) {
      // If the current cell contains a '1', it's a potential starting point for a path.
      if (mainMatrix[rowIndex][colIndex] === 1) {
        // Calculate the longest path from this cell and update the overall maximum.
        overallLongestPath = Math.max(overallLongestPath, determineMaxSequence(rowIndex, colIndex));
      }
    }
  }

  // Print the calculated maximum path length for the current grid to the console.
  console.log(overallLongestPath);
}