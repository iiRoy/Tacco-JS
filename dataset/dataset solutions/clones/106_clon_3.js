// A global buffer to collect incoming data chunks from standard input.
// This approach is commonly used in environments where input is streamed.
let rawDataBuffer = '';

/**
 * Determines the maximum of two numeric values.
 * This function provides the same functionality as Math.max(valA, valB).
 * It replaces the original bitwise 'mx' function with a standard library call
 * for improved readability and as a structural change while maintaining exact equivalence.
 * @param {number} valA - The first numerical value for comparison.
 * @param {number} valB - The second numerical value for comparison.
 * @returns {number} The greater of the two provided values.
 */
function findMaximumValue(valA, valB) {
  return Math.max(valA, valB);
}

/**
 * The primary function responsible for processing the input lines and
 * calculating impact metrics based on the data.
 * This function has been renamed from 'main' to offer a more descriptive
 * indication of its core purpose.
 * @param {string[]} inputLines - An array of strings, where each string represents a line of input data.
 */
function processInputData(inputLines) {
  // Input validation: Ensures that the provided input is a valid array of lines and not empty.
  if (!Array.isArray(inputLines) || inputLines.length === 0) {
    console.error("Processing halted: No valid input lines were provided for analysis.");
    // Terminate execution if the input is deemed invalid to prevent further errors.
    return;
  }

  // Constants defining the dimensions of the processing grid and coordinate adjustments.
  // The grid is a 14x14 matrix, as observed in the original implementation.
  const GRID_DIMENSION = 14;
  // Coordinates from the input (typically 0-9) are shifted by 2 units.
  // This effectively centers a 10x10 active region within the 14x14 grid,
  // providing a 2-unit border for patterns that extend outwards.
  const COORDINATE_OFFSET = 2;

  // Dynamically initialize a two-dimensional array (matrix) filled with zeros.
  // This matrix, referred to as 'impactMatrix', will store the cumulative impact values.
  let impactMatrix = Array.from({ length: GRID_DIMENSION }, () =>
    Array.from({ length: GRID_DIMENSION }, () => 0)
  );

  /**
   * Safely increments the value of a specific cell within the impact matrix.
   * Includes boundary checks to prevent operations on out-of-bounds indices,
   * though the design of the problem implies coordinates will generally be valid.
   * @param {number[][]} grid - The 2D array representing the impact matrix.
   * @param {number} row - The row index of the cell targeted for increment.
   * @param {number} col - The column index of the cell targeted for increment.
   */
  const incrementGridCell = (grid, row, col) => {
    if (row >= 0 && row < GRID_DIMENSION && col >= 0 && col < GRID_DIMENSION) {
      grid[row][col]++;
    } else {
      // This warning helps identify potential issues if coordinates are miscalculated.
      console.warn(`Attempted to increment cell outside of grid boundaries: [${row}, ${col}]`);
    }
  };

  /**
   * Applies a specific pattern of impacts to the grid starting from a base coordinate.
   * This function encapsulates and rewrites the logic from the original 'switch' statement,
   * explicitly preserving its fall-through behavior using sequential conditional blocks.
   * @param {number[][]} grid - The impact matrix where impacts will be recorded.
   * @param {number} baseRow - The central row coordinate for applying the pattern.
   * @param {number} baseCol - The central column coordinate for applying the pattern.
   * @param {string} patternType - A string ('1', '2', or '3') indicating the type of impact pattern.
   */
  const applySpecificImpacts = (grid, baseRow, baseCol, patternType) => {
    // Type '3' impact: Applies 4 specific increments, then falls through to '2' and '1'.
    if (patternType === '3') {
      incrementGridCell(grid, baseRow + 2, baseCol);
      incrementGridCell(grid, baseRow - 2, baseCol);
      incrementGridCell(grid, baseRow, baseCol - 2);
      incrementGridCell(grid, baseRow, baseCol + 2);
    }

    // Type '2' impact: Applies 4 diagonal increments. This block executes if
    // 'patternType' is '3' (due to fall-through) OR '2'.
    if (patternType === '3' || patternType === '2') {
      incrementGridCell(grid, baseRow + 1, baseCol - 1);
      incrementGridCell(grid, baseRow + 1, baseCol + 1);
      incrementGridCell(grid, baseRow - 1, baseCol - 1);
      incrementGridCell(grid, baseRow - 1, baseCol + 1);
    }

    // Type '1' impact: Applies 5 cardinal/center increments. This block executes if
    // 'patternType' is '3', '2' (due to fall-through), OR '1'.
    if (patternType === '3' || patternType === '2' || patternType === '1') {
      incrementGridCell(grid, baseRow + 1, baseCol);
      incrementGridCell(grid, baseRow, baseCol - 1);
      incrementGridCell(grid, baseRow, baseCol); // The central point of impact
      incrementGridCell(grid, baseRow, baseCol + 1);
      incrementGridCell(grid, baseRow - 1, baseCol);
    } else {
      // A warning is logged for any input pattern types that are not recognized.
      // This is a new fragment for robustness and debugging.
      console.warn(`Unrecognized impact pattern type encountered: '${patternType}' on an input line.`);
    }
  };

  // Iterate over each line of the input data to apply the defined impact patterns to the grid.
  // A standard 'for' loop is used for explicit control over iteration.
  for (let i = 0; i < inputLines.length; i++) {
    const currentInputEntry = inputLines[i];

    // Guard clause: Skips processing for any input lines that are empty or
    // too short to contain the required coordinate and type information (e.g., less than 5 characters).
    if (!currentInputEntry || currentInputEntry.length < 5) {
      continue; // Move to the next line without processing.
    }

    // Extract numerical coordinates and the impact type specifier from the current line.
    // 'Number()' is used for explicit type conversion from string characters.
    const effectiveXCoordinate = Number(currentInputEntry[0]) + COORDINATE_OFFSET;
    const effectiveYCoordinate = Number(currentInputEntry[2]) + COORDINATE_OFFSET;
    const impactDesignation = currentInputEntry[4];

    // Apply the impact pattern to the grid using the dedicated helper function.
    applySpecificImpacts(impactMatrix, effectiveYCoordinate, effectiveXCoordinate, impactDesignation);
  }

  // --- Grid Analysis Phase ---
  // The original problem specified an analysis of a 10x10 sub-region of the grid.
  const ACTIVE_REGION_SIZE = 10;
  let countOfZeroImpactCells = 0; // This variable tracks cells with no recorded impact (renamed from 'nd').
  let highestRecordedImpact = 0; // This variable stores the maximum impact value found (renamed from 'md').

  // Iterate through the specified 10x10 active region for analysis.
  // This region corresponds to grid indices [2][2] through [11][11] in the larger 14x14 matrix.
  for (let analysisRow = 0; analysisRow < ACTIVE_REGION_SIZE; analysisRow++) {
    for (let analysisCol = 0; analysisCol < ACTIVE_REGION_SIZE; analysisCol++) {
      // Calculate the actual coordinates within the full impact matrix.
      const matrixRow = analysisRow + COORDINATE_OFFSET;
      const matrixCol = analysisCol + COORDINATE_OFFSET;

      // Retrieve the impact value for the current cell in the active region.
      const cellValue = impactMatrix[matrixRow][matrixCol];

      // If the cell's value is zero, it means no impact pattern reached this position.
      if (cellValue === 0) {
        countOfZeroImpactCells++;
      }

      // Update the highest impact value found so far using the custom maximum function.
      highestRecordedImpact = findMaximumValue(cellValue, highestRecordedImpact);
    }
  }

  // Output the final computed results, providing clear and descriptive labels.
  console.log(`Number of positions with zero impact: ${countOfZeroImpactCells}`);
  console.log(`Maximum impact observed in any single position: ${highestRecordedImpact}`);
}

// --- Standard Input Stream Setup ---
// Resume the standard input stream to ensure that data can be read from it.
process.stdin.resume();
// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for when data chunks are received from the standard input.
process.stdin.on('data', (inputChunk) => {
  rawDataBuffer += inputChunk; // Appends each received chunk to the global buffer.
});

// Event listener for when the entire input stream has finished sending data.
process.stdin.on('end', () => {
  // Split the accumulated raw data into an array of individual lines.
  // It handles both Windows-style (\r\n) and Unix-style (\n) line endings.
  // A filter is applied to remove any empty strings that might result from splitting,
  // especially if the input ends with a newline. This is a new fragment for robustness.
  const cleanedInputLines = rawDataBuffer.split(/\r?\n/).filter(line => line.trim() !== '');

  // Once all input has been received and processed into lines,
  // invoke the main processing function with the prepared data.
  processInputData(cleanedInputLines);
});