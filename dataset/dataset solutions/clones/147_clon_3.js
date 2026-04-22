const GRID_DIMENSION = 8; // Constant defining the expected dimension of the square grid (e.g., 8 for an 8x8 grid).

/**
 * Validates if a given coordinate (column, row) falls within the specific boundary rules
 * established by the original program.
 *
 * IMPORTANT NOTE: This function *only* checks the coordinate's numerical value against
 * the boundaries and *does not* inspect the actual content of the `gridMatrix` at that position.
 * It also strictly adheres to the original program's boundary definition where
 * coordinates up to and including `GRID_DIMENSION` (e.g., 8 for an 8x8 grid) are considered valid
 * for the upper bound check (e.g., `colCoord > 8` would be false for `colCoord = 8`).
 * This might seem counter-intuitive for 0-indexed arrays, but it preserves the original logic.
 *
 * @param {Array<Array<number>>} gridMatrix - The 2D array representing the grid (parameter retained for signature consistency, but unused).
 * @param {number} colCoord - The column coordinate (x-axis) to check.
 * @param {number} rowCoord - The row coordinate (y-axis) to check.
 * @returns {boolean} Returns `true` if the coordinates are within the defined bounds, otherwise `false`.
 */
const isWithinBounds = (gridMatrix, colCoord, rowCoord) => {
  // Check for out-of-bounds conditions based on the original program's logic.
  // A coordinate is considered out of bounds if it's less than 0 or strictly greater than GRID_DIMENSION.
  if (colCoord < 0 || colCoord > GRID_DIMENSION) {
    return false;
  }
  if (rowCoord < 0 || rowCoord > GRID_DIMENSION) {
    return false;
  }
  // If no out-of-bounds condition was met, the coordinate is considered valid.
  return true;
};

/**
 * Attempts to identify one of several predefined 4-block patterns (A-G)
 * starting from a given initial '1' block at (initialX, initialY).
 *
 * Each pattern is defined by a set of relative coordinate offsets from the starting point.
 * This function leverages `isWithinBounds` to check if the blocks required for a pattern
 * are within the grid's defined boundaries.
 *
 * @param {Array<Array<number>>} gridData - The 2D array representing the grid.
 * @param {number} initialX - The column coordinate of the initial '1' block.
 * @param {number} initialY - The row coordinate of the initial '1' block.
 * @returns {string} The character representing the matched pattern (e.g., 'A', 'B'),
 *                   or 'UNKNOWN_PATTERN' if no predefined pattern is found.
 */
const detectKnownShape = (gridData, initialX, initialY) => {
  // An array defining each possible shape pattern.
  // Each object specifies a `name` for the pattern and `offsets` for the additional
  // three blocks relative to the `initialX, initialY` starting point.
  const shapeDefinitions = [
    // Pattern 'A': A 2x2 block with the top-left missing (relative to initialX,initialY).
    { name: 'A', offsets: [[1, 0], [0, 1], [1, 1]] }, // (x+1, y), (x, y+1), (x+1, y+1)
    // Pattern 'B': A vertical line of four blocks.
    { name: 'B', offsets: [[0, 1], [0, 2], [0, 3]] }, // (x, y+1), (x, y+2), (x, y+3)
    // Pattern 'C': A horizontal line of four blocks.
    { name: 'C', offsets: [[1, 0], [2, 0], [3, 0]] }, // (x+1, y), (x+2, y), (x+3, y)
    // Pattern 'D': A Z-like shape.
    { name: 'D', offsets: [[0, 1], [-1, 1], [-1, 2]] }, // (x, y+1), (x-1, y+1), (x-1, y+2)
    // Pattern 'E': An L-like shape.
    { name: 'E', offsets: [[1, 0], [1, 1], [2, 1]] }, // (x+1, y), (x+1, y+1), (x+2, y+1)
    // Pattern 'F': Another L-like shape.
    { name: 'F', offsets: [[0, 1], [1, 1], [1, 2]] }, // (x, y+1), (x+1, y+1), (x+1, y+2)
    // Pattern 'G': A T-like shape.
    { name: 'G', offsets: [[1, 0], [0, 1], [-1, 1]] } // (x+1, y), (x, y+1), (x-1, y+1)
  ];

  // Iterate through each defined shape to check for a match.
  for (const currentShape of shapeDefinitions) {
    let allRelativeBlocksValid = true; // Flag to track if all blocks for the current shape are within bounds.
    // Check each offset required for the current shape.
    for (const offsetCoords of currentShape.offsets) {
      const targetX = initialX + offsetCoords[0]; // Calculate absolute X coordinate.
      const targetY = initialY + offsetCoords[1]; // Calculate absolute Y coordinate.

      // If any part of the shape falls outside the defined boundaries, this shape cannot match.
      if (!isWithinBounds(gridData, targetX, targetY)) {
        allRelativeBlocksValid = false;
        break; // No need to check further offsets for this specific shape.
      }
    }

    // If all relative blocks for the current shape were found to be within boundaries,
    // then this shape is considered a match.
    if (allRelativeBlocksValid) {
      return currentShape.name; // Return the name of the matched shape.
    }
  }

  // If no shape pattern matched after checking all definitions, return a default string.
  return 'UNKNOWN_PATTERN';
};

/**
 * Scans a 2D grid to locate the first occurrence of a '1' (which serves as a starting block)
 * and then invokes a helper function to identify a specific 4-block pattern originating from it.
 *
 * @param {Array<Array<number>>} gridMatrix - The 2D array (matrix) representing the 8x8 grid.
 * @returns {string} Returns the character code of the identified pattern (A-G),
 *                   or 'NO_START_BLOCK' if no '1' is found, or 'EMPTY_GRID_INPUT'
 *                   if the grid structure is invalid.
 */
const determinePattern = (gridMatrix) => {
  // Basic validation: Check if the grid is empty or malformed at a high level.
  if (!gridMatrix || gridMatrix.length === 0 || (gridMatrix.length > 0 && gridMatrix[0].length === 0)) {
    return 'EMPTY_GRID_INPUT';
  }

  // Iterate through each cell of the grid, row by row and then column by column.
  for (let currentRow = 0; currentRow < GRID_DIMENSION; currentRow++) {
    for (let currentCol = 0; currentCol < GRID_DIMENSION; currentCol++) {
      // Once the first '1' is encountered, it is treated as the origin for pattern detection.
      if (gridMatrix[currentRow][currentCol] === 1) {
        // Call the helper function to detect the specific pattern.
        // Note: `detectKnownShape` expects (x, y) coordinates, so `currentCol` comes before `currentRow`.
        return detectKnownShape(gridMatrix, currentCol, currentRow);
      }
    }
  }

  // If the entire grid is scanned and no '1' block is found, no pattern can be identified.
  return 'NO_START_BLOCK';
};

// Main execution block: An Immediately Invoked Function Expression (IIFE)
// This self-executing function handles reading input, parsing it, and processing each puzzle.
((rawDataBuffer) => {
  // Convert the raw buffer input to a string, remove any trailing newline characters,
  // and then split the entire input into distinct puzzle sections.
  // Each section is separated by two newline characters (`\n\n`).
  const puzzleSections = String(rawDataBuffer).replace(/\n$/, '').split('\n\n');

  // Guard clause: If no puzzle sections are found or the input is effectively empty,
  // log an error and exit.
  if (puzzleSections.length === 0 || (puzzleSections.length === 1 && puzzleSections[0].trim() === '')) {
    console.error("Input data is either empty or contains no valid puzzle sections.");
    return;
  }

  let currentPuzzleNumber = 1; // Initialize a counter for puzzle numbering in the output.

  /**
   * Helper function to parse a single string line into an array of numbers.
   * This mimics the original behavior where `"".split('').map(Number)` results in `[]`.
   * @param {string} line - The string representing a row of the grid.
   * @returns {Array<number>} An array of numbers, or an empty array if the input line is empty.
   */
  const parseGridLine = (line) => {
    return line.split('').map(char => Number(char));
  };

  // Iterate over each puzzle section retrieved from the input.
  for (const sectionContent of puzzleSections) {
    // Split the current puzzle section into individual lines (which represent rows of the grid).
    const gridRowsAsStrings = sectionContent.split('\n');

    // Initialize an empty 2D array to store the grid after parsing.
    const matrixRepresentation = [];

    // Convert each string line into an array of numbers and populate the matrix.
    for (const gridLineString of gridRowsAsStrings) {
      matrixRepresentation.push(parseGridLine(gridLineString));
    }

    // Additional validation (Type III change): Check if the parsed matrix has the expected dimensions.
    // This catches malformed puzzle inputs where rows might be missing or have incorrect lengths.
    const isValidGridDimension = matrixRepresentation.length === GRID_DIMENSION &&
                                 matrixRepresentation.every(row => row.length === GRID_DIMENSION);

    if (!isValidGridDimension) {
      console.warn(`Puzzle ${currentPuzzleNumber}: Skipping due to malformed grid dimensions. Expected ${GRID_DIMENSION}x${GRID_DIMENSION}.`);
      currentPuzzleNumber++;
      continue; // Move to the next puzzle section.
    }

    // Call the main pattern determination function with the fully parsed and validated grid.
    const detectedResult = determinePattern(matrixRepresentation);

    // Output the result for the current puzzle, including its number for clarity.
    console.log(`Puzzle ${currentPuzzleNumber}: ${detectedResult}`);
    currentPuzzleNumber++; // Increment the puzzle counter.
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read the entire content of standard input as a UTF-8 string.