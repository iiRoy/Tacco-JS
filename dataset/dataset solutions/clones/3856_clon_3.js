'use strict';

/**
 * Analyzes an input character grid to determine if every '#' (hash) cell
 * is adjacent to at least one other '#' cell in one of the four cardinal directions.
 *
 * @param {string} rawInputContent - The complete input string, typically read from stdin.
 *                                   It is expected to start with a line containing two space-separated
 *                                   integers representing grid dimensions (height and width),
 *                                   followed by lines forming the grid itself. The last line
 *                                   of the grid content may be ignored based on original logic.
 */
function processGridAdjacencyCheck(rawInputContent) {
  // Step 1: Normalize and parse the raw input into individual lines.
  // Trimming the input first helps in handling potential leading/trailing blank lines.
  const contentLines = rawInputContent.trim().split('\n');

  // Guard clause for entirely empty input.
  if (contentLines.length === 0) {
    console.log('Yes'); // An empty grid trivially satisfies the condition.
    return;
  }

  // Step 2: Extract grid dimensions from the first line of input.
  // The original problem statement implies that 'width' is derived from the 'height' value.
  const dimensionSegments = contentLines[0].split(' ');
  const gridHeight = parseInt(dimensionSegments[0], 10);
  const gridWidth = parseInt(dimensionSegments[0], 10); // Deliberately mirroring original behavior: width equals height from input.

  // Step 3: Validate the parsed dimensions.
  // Ensure that both height and width are positive integers.
  if (isNaN(gridHeight) || gridHeight <= 0 || isNaN(gridWidth) || gridWidth <= 0) {
    console.log('No'); // Invalid dimensions imply a failed check.
    return;
  }

  // Step 4: Extract the actual grid data from the remaining lines.
  // The original code uses `slice(1, -1)`, which means it omits the first and last lines
  // of the `s.split('\n')` array. We will maintain this behavior.
  const rawGridRows = contentLines.slice(1, -1);

  // Step 5: Convert raw grid rows into a 2D array (matrix) of characters.
  const charGridMatrix = rawGridRows.map(rowStr => rowStr.split(''));

  // Step 6: Perform additional structural validation of the grid matrix.
  // Ensure the parsed matrix dimensions match the declared dimensions.
  if (charGridMatrix.length !== gridHeight) {
    console.log('No'); // Row count mismatch.
    return;
  }
  for (let rIdx = 0; rIdx < gridHeight; ++rIdx) {
    if (charGridMatrix[rIdx].length !== gridWidth) {
      console.log('No'); // Column count mismatch in a row.
      return;
    }
  }

  // Define an array of coordinate offsets for checking 4-directional neighbors.
  // This array represents: [Up, Down, Left, Right].
  const cardinalNeighborOffsets = [
    [-1, 0], // Row above, same column
    [1, 0],  // Row below, same column
    [0, -1], // Same row, column to the left
    [0, 1]   // Same row, column to the right
  ];

  /**
   * Helper function to determine the number of adjacent '#' cells for a given cell.
   * @param {number} currentR - The row index of the cell to check.
   * @param {number} currentC - The column index of the cell to check.
   * @param {Array<Array<string>>} matrixRef - Reference to the 2D grid array.
   * @param {number} totalR - Total number of rows in the grid.
   * @param {number} totalC - Total number of columns in the grid.
   * @param {Array<Array<number>>} offsetsArray - Array of [dR, dC] offsets for neighbors.
   * @returns {number} The count of '#' neighbors.
   */
  const calculateHashNeighbors = (currentR, currentC, matrixRef, totalR, totalC, offsetsArray) => {
    let adjacentHashCount = 0;
    // Iterate through each possible neighbor direction.
    for (const [dR, dC] of offsetsArray) {
      const neighborR = currentR + dR;
      const neighborC = currentC + dC;

      // Check if the potential neighbor is within the grid boundaries.
      const isWithinBounds = (
        neighborR >= 0 && neighborR < totalR &&
        neighborC >= 0 && neighborC < totalC
      );

      // If the neighbor is valid and contains '#', increment the counter.
      if (isWithinBounds && matrixRef[neighborR][neighborC] === '#') {
        adjacentHashCount++;
      }
    }
    return adjacentHashCount;
  };

  // Step 7: Main grid traversal and validation logic.
  let conditionSatisfied = true; // Assume 'Yes' until a violation is found.

  // Iterate over each cell in the grid using nested loops.
  for (let rowIterator = 0; rowIterator < gridHeight; ++rowIterator) {
    // Optimization: If a violation has already been found, no need to continue checking.
    if (!conditionSatisfied) {
      break; // Exit outer loop.
    }

    for (let colIterator = 0; colIterator < gridWidth; ++colIterator) {
      // Optimization: If a violation has already been found, no need to continue checking.
      if (!conditionSatisfied) {
        break; // Exit inner loop.
      }

      const currentCellCharacter = charGridMatrix[rowIterator][colIterator];

      // The problem statement implies we only care about '#' cells.
      // '.' cells are effectively ignored for this check.
      if (currentCellCharacter === '#') {
        // Calculate how many adjacent cells are also '#'.
        const numAdjacentHashes = calculateHashNeighbors(
          rowIterator, colIterator, charGridMatrix, gridHeight, gridWidth, cardinalNeighborOffsets
        );

        // If a '#' cell has no '#' neighbors, the overall condition is not met.
        if (numAdjacentHashes === 0) {
          conditionSatisfied = false; // Mark as 'No'.
          break; // Exit inner loop immediately as the result is determined.
        }
      }
    }
  }

  // Step 8: Output the final result based on the boolean flag.
  const finalOutcomeMessage = conditionSatisfied ? 'Yes' : 'No';
  console.log(finalOutcomeMessage);
}

// --- Execution Entry Point ---
// This block handles reading input from the standard input stream
// and calling the main processing function.

// Obtain the Node.js 'fs' (file system) module.
const fileSystemModule = require('fs');

// Specify the standard input file path, common in Unix-like environments.
const standardInputFilePath = '/dev/stdin';

try {
  // Read the entire content of the standard input as a UTF-8 string.
  const inputDataBuffer = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');

  // Invoke the primary function to process the grid.
  processGridAdjacencyCheck(inputDataBuffer);
} catch (executionError) {
  // Handle any potential errors during file reading or initial processing.
  console.error("An operational error occurred:", executionError.message);
  console.log('No'); // Output 'No' as a safe default in case of unexpected errors.
}