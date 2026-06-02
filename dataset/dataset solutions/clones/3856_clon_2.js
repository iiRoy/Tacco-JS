'use strict';

/**
 * Processes the input string to determine if a grid of '#' characters
 * has any isolated '#' cells (i.e., '#' cells with no '#' neighbors).
 *
 * @param {string} inputString - The raw input string, typically from stdin.
 */
function processInput(inputString) {
  // Split the entire input into lines based on newline characters.
  const lines = inputString.split('\n');

  // Parse grid dimensions from the first line of the input.
  // The original code extracts both height and width from the first element of the split string.
  // This behavior, including any potential implications, is preserved.
  const dimensionParts = lines[0].split(' ');
  const gridHeight = Number(dimensionParts[0]);
  const gridWidth = Number(dimensionParts[0]); // Preserving the original logic for width assignment.

  // Extract the actual grid data.
  // It skips the first line (dimensions) and the last line (often empty or EOF marker).
  // Each remaining line is then split into individual characters to form a 2D array of characters.
  const charGrid = lines.slice(1, -1).map(rowString => rowString.split(''));

  // Initialize a flag to 'Yes', assuming all '#' cells have neighbors until proven otherwise.
  let resultFlag = 'Yes';

  // Iterate through each row of the character grid.
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    // Iterate through each column in the current row.
    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
      // If the current cell contains a '.', it's an empty space and doesn't need neighbor checking.
      if (charGrid[rowIdx][colIdx] === '.') {
        continue; // Move to the next cell.
      }

      // Initialize a counter for adjacent '#' characters.
      let neighborCount = 0;

      // Check the cell directly above the current cell.
      // Ensure the row index is within bounds.
      if (rowIdx - 1 >= 0) {
        if (charGrid[rowIdx - 1][colIdx] === '#') {
          neighborCount += 1;
        }
      }

      // Check the cell directly below the current cell.
      // Ensure the row index is within bounds.
      if (rowIdx + 1 < gridHeight) {
        if (charGrid[rowIdx + 1][colIdx] === '#') {
          neighborCount += 1;
        }
      }

      // Check the cell to the right of the current cell.
      // Ensure the column index is within bounds.
      if (colIdx + 1 < gridWidth) {
        if (charGrid[rowIdx][colIdx + 1] === '#') {
          neighborCount += 1;
        }
      }

      // Check the cell to the left of the current cell.
      // Ensure the column index is within bounds.
      if (colIdx - 1 >= 0) {
        if (charGrid[rowIdx][colIdx - 1] === '#') {
          neighborCount += 1;
        }
      }

      // If a '#' cell has no '#' neighbors, it means it's isolated.
      // In this case, the overall result is 'No'.
      if (neighborCount === 0) {
        resultFlag = 'No';
        // The original code continues iterating even after finding an isolated cell.
        // This behavior is maintained to preserve the exact control flow.
      }
    }
  }

  // Output the final determination to the console.
  console.log(resultFlag);
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
