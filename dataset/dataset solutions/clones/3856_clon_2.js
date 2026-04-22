'use strict'; // Enforce stricter rules for code execution.

// Define constants for specific character representations within the grid.
const EMPTY_SPACE_CHAR = '.';
const FILLED_SPACE_CHAR = '#';

/**
 * Evaluates a grid layout provided as a string to determine if all filled cells have at least one filled neighbor.
 * This function processes the input, constructs a grid, and then checks the adjacency condition.
 *
 * @param {string} rawInputString - The complete input as a single string, including dimensions and grid rows.
 */
function evaluateGridCondition(rawInputString) {

  // Break down the multi-line input string into an array of individual string lines.
  let stringLinesArray = rawInputString.split('\n');

  // Parse the grid's dimensions from the very first line of the input.
  // Note: The original code uses the first dimension for both height and width.
  const dimensionParts = stringLinesArray[0].split(' ');
  const matrixHeight = parseInt(dimensionParts[0], 10); // Convert string to integer for height.
  const matrixWidth = parseInt(dimensionParts[0], 10);  // Clone behavior: width also derived from first dimension.

  // Create a 2D array (matrix) of characters from the input lines.
  // We skip the first line (dimensions) and the last line (often empty from input stream).
  const characterMatrix = stringLinesArray
    .slice(1, -1) // Exclude the header line and any potential trailing newline.
    .map(currentLine => currentLine.split('')); // Transform each row string into an array of its characters.

  // Initialize a boolean-like string variable for the final outcome.
  let outcomeMessage = 'TRUE';

  // Iterate through each individual cell in the character matrix.
  for (let currentY = 0; currentY < matrixHeight; currentY++) {
    for (let currentX = 0; currentX < matrixWidth; currentX++) {

      // If the current cell is an empty space, it doesn't need filled neighbors, so we skip checking it.
      if (characterMatrix[currentY][currentX] === EMPTY_SPACE_CHAR) {
        continue;
      }

      // This cell contains a filled character. Now, count its filled neighbors.
      let adjacentFilledCount = 0;

      // Check the cell directly above.
      if (currentY - 1 >= 0) { // Ensure we are not above the top boundary.
        if (characterMatrix[currentY - 1][currentX] === FILLED_SPACE_CHAR) {
          adjacentFilledCount = adjacentFilledCount + 1;
        }
      }

      // Check the cell directly below.
      if (currentY + 1 < matrixHeight) { // Ensure we are not below the bottom boundary.
        if (characterMatrix[currentY + 1][currentX] === FILLED_SPACE_CHAR) {
          adjacentFilledCount += 1;
        }
      }

      // Check the cell to the immediate right.
      if (currentX + 1 < matrixWidth) { // Ensure we are not past the right boundary.
        if (characterMatrix[currentY][currentX + 1] === FILLED_SPACE_CHAR) {
          adjacentFilledCount++;
        }
      }

      // Check the cell to the immediate left.
      if (currentX - 1 >= 0) { // Ensure we are not past the left boundary.
        if (characterMatrix[currentY][currentX - 1] === FILLED_SPACE_CHAR) {
          adjacentFilledCount++;
        }
      }

      // If a filled cell has no filled neighbors, the condition is not met.
      if (adjacentFilledCount === 0) {
        outcomeMessage = 'FALSE';
        // The original code continues checking other cells but 'outcomeMessage' will not revert.
      }
    }
  }

  // Display the final determination to the console.
  console.info(outcomeMessage);
}

// Acquire input data from standard input using Node.js's file system module,
// then pass it to the grid evaluation function.
evaluateGridCondition(require("fs").readFileSync("/dev/stdin", "utf8"));