// This script processes multiple 8x8 grid configurations from standard input.
// Each grid is analyzed to detect a specific geometric pattern.
(function(rawData) {
  // Normalize the input: remove any trailing newline character, then split the
  // entire string into separate blocks based on double newlines.
  var dataBlocks = rawData.replace(/\n$/, '').split('\n\n');

  // Iterate through each distinct block of grid data.
  for (var blockIndex = 0; blockIndex < dataBlocks.length; blockIndex++) {
    // Break down the current block into individual lines.
    var currentBlockLines = dataBlocks[blockIndex].split('\n');
    // Initialize a two-dimensional array (matrix) to hold the numerical grid.
    var gridMatrix = [];

    // Populate the grid matrix by converting each character in a line to a number.
    for (var rowIndex = 0; rowIndex < currentBlockLines.length; rowIndex++) {
      gridMatrix.push(currentBlockLines[rowIndex].split('').map(Number));
    }

    // Execute the pattern detection logic on the constructed grid and output the result.
    console.log(findPattern(gridMatrix));
    // The following line is a commented-out debugging aid from the original source.
    // console.log(gridMatrix);
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read all data from standard input as a UTF-8 string.


/**
 * Scans an 8x8 grid to locate the first occurrence of the number '1'.
 * If found, it then attempts to identify a predefined geometric pattern
 * starting from that '1's position.
 *
 * @param {Array<Array<number>>} currentGrid The 2D array representing the 8x8 grid.
 * @returns {string|undefined} A single character ('A' through 'G') representing the
 *                             identified pattern, or `undefined` if no '1' is found
 *                             or no pattern matches.
 */
function findPattern(currentGrid) {
  // Loop through each row of the grid.
  for (var rIdx = 0; rIdx < 8; rIdx++) {
    // Loop through each column in the current row.
    for (var cIdx = 0; cIdx < 8; cIdx++) {
      // If a cell contains the value '1', it's a potential starting point for a pattern.
      if (currentGrid[rIdx][cIdx] === 1) {
        // Delegate to a helper function to determine the specific shape,
        // passing the grid and the (column, row) coordinates.
        return identifyShape(currentGrid, cIdx, rIdx);
      }
    }
  }
  // If the loops complete without finding any '1', no pattern can be identified.
  // The function implicitly returns `undefined`.
}

/**
 * Analyzes a set of relative coordinates around a starting point (startCol, startRow)
 * to match one of several predefined geometric shapes. This function relies on
 * `isValidCoordinate` to check if the relative points are within a conceptual 9x9 boundary.
 *
 * @param {Array<Array<number>>} currentGrid The grid matrix (passed for consistency, but not
 *                                           used for value lookups within this function).
 * @param {number} startCol The column index of the initial '1'.
 * @param {number} startRow The row index of the initial '1'.
 * @returns {string|undefined} The character ('A' through 'G') corresponding to the
 *                             matched shape, or `undefined` if no shape's coordinate
 *                             pattern is fully within bounds.
 */
function identifyShape(currentGrid, startCol, startRow) {
  // Pattern A: A 2x2 block (relative to startCol, startRow)
  if (isValidCoordinate(currentGrid, startCol + 1, startRow) &&
      isValidCoordinate(currentGrid, startCol, startRow + 1) &&
      isValidCoordinate(currentGrid, startCol + 1, startRow + 1)) {
    return 'A';
  }
  // Pattern B: A vertical line of 4 units
  if (isValidCoordinate(currentGrid, startCol, startRow + 1) &&
      isValidCoordinate(currentGrid, startCol, startRow + 2) &&
      isValidCoordinate(currentGrid, startCol, startRow + 3)) {
    return 'B';
  }
  // Pattern C: A horizontal line of 4 units
  if (isValidCoordinate(currentGrid, startCol + 1, startRow) &&
      isValidCoordinate(currentGrid, startCol + 2, startRow) &&
      isValidCoordinate(currentGrid, startCol + 3, startRow)) {
    return 'C';
  }
  // Pattern D: An L-shaped configuration
  if (isValidCoordinate(currentGrid, startCol, startRow + 1) &&
      isValidCoordinate(currentGrid, startCol - 1, startRow + 1) &&
      isValidCoordinate(currentGrid, startCol - 1, startRow + 2)) {
    return 'D';
  }
  // Pattern E: Another L-shaped configuration
  if (isValidCoordinate(currentGrid, startCol + 1, startRow) &&
      isValidCoordinate(currentGrid, startCol + 1, startRow + 1) &&
      isValidCoordinate(currentGrid, startCol + 2, startRow + 1)) {
    return 'E';
  }
  // Pattern F: Yet another L-shaped configuration
  if (isValidCoordinate(currentGrid, startCol, startRow + 1) &&
      isValidCoordinate(currentGrid, startCol + 1, startRow + 1) &&
      isValidCoordinate(currentGrid, startCol + 1, startRow + 2)) {
    return 'F';
  }
  // Pattern G: A T-shaped or similar configuration
  if (isValidCoordinate(currentGrid, startCol + 1, startRow) &&
      isValidCoordinate(currentGrid, startCol, startRow + 1) &&
      isValidCoordinate(currentGrid, startCol - 1, startRow + 1)) {
    return 'G';
  }
  // If none of the patterns match, the function implicitly returns `undefined`.
}

/**
 * Determines if a given coordinate (col, row) falls within a conceptual 9x9 boundary
 * (indices 0 through 8, inclusive, for both dimensions).
 *
 * IMPORTANT NOTE: This function strictly checks only the boundaries. It does NOT
 * access or evaluate the value at `currentGrid[row][col]`. The original code
 * had a commented-out line that would have checked the grid value, but it was
 * disabled, making this function purely a boundary validator.
 *
 * @param {Array<Array<number>>} currentGrid The grid matrix (not used for value checks).
 * @param {number} col The column index to validate.
 * @param {number} row The row index to validate.
 * @returns {boolean} `true` if the coordinate is within the conceptual 0-8 range
 *                    for both column and row; `false` otherwise.
 */
function isValidCoordinate(currentGrid, col, row) {
  // Check if the column or row index is outside the valid range [0, 8].
  if (col < 0 || col > 8 || row < 0 || row > 8) {
    return false; // Coordinate is out of bounds.
  }
  // The original implementation included a commented-out check for the cell's value:
  // if (currentGrid[row][col] == 1) {
  return true; // If within the conceptual boundaries, always return true as per original behavior.
  // }
}
