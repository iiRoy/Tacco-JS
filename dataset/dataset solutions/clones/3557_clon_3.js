const isOddNumber = (value) => {
  // Verifies if a given value is an odd integer.
  // Performs a type check and then a bitwise AND operation for efficiency.
  return typeof value === 'number' && Number.isInteger(value) && (value & 1) === 1;
};

const safelyParseInteger = (strValue) => {
  // Attempts to parse a string into an integer.
  // Returns NaN if parsing fails to distinguish from 0.
  const parsed = parseInt(strValue, 10);
  return isNaN(parsed) ? NaN : parsed;
};

// Orchestrates the grid processing and path generation.
function executeGridTransformation(inputRecordings) {
  // --- Input Validation and Dimension Extraction ---
  if (!Array.isArray(inputRecordings) || inputRecordings.length === 0) {
    console.error("System Error: No input data lines were provided for processing.");
    return; // Exit if input is invalid.
  }

  const dimensionSpecifiers = inputRecordings[0].split(" ");
  if (dimensionSpecifiers.length < 2) {
    console.error("Input Format Error: Grid dimensions (height and width) are missing or malformed.");
    return;
  }

  const gridHeight = safelyParseInteger(dimensionSpecifiers[0]);
  const gridWidth = safelyParseInteger(dimensionSpecifiers[1]);

  if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
    console.error(`Input Data Error: Invalid grid dimensions detected. Height: ${gridHeight}, Width: ${gridWidth}.`);
    return;
  }

  // --- Collection of Odd-Valued Cell Locations ---
  // This array will store 1-based [row, column] coordinates of cells
  // that contain an odd numerical value, as per the specified traversal order.
  const oddValueCellCoordinates = [];

  // Iterate through each row of the grid, starting from the first actual data row (inputRecordings[1]).
  // The original problem uses 1-based indexing for rows.
  for (let currentGridRow = 1; currentGridRow <= gridHeight; currentGridRow++) {
    const currentRowDataString = inputRecordings[currentGridRow];
    if (currentRowDataString === undefined) {
      // Defensive check for cases where inputRecordings might be shorter than expected.
      console.warn(`Data Warning: Expected row ${currentGridRow} but no data found. Skipping.`);
      continue;
    }

    // Split the row string into individual cell value strings, then parse them.
    const parsedRowValues = currentRowDataString.split(" ").map(safelyParseInteger);

    // Determine the direction of cell traversal for the current row.
    // Odd-numbered rows are processed from left to right.
    // Even-numbered rows are processed from right to left (reversed).
    const isForwardScanDirection = isOddNumber(currentGridRow);

    let cellsForTraversal;
    if (isForwardScanDirection) {
      cellsForTraversal = parsedRowValues;
    } else {
      // Create a shallow copy and reverse it to process from right-to-left.
      cellsForTraversal = [...parsedRowValues].reverse();
    }

    // Iterate over the (potentially reversed) cell values in the current row.
    cellsForTraversal.forEach((cellContent, traversalIndex) => {
      if (isNaN(cellContent)) {
        // Log a warning for non-numeric cell data but continue processing.
        console.warn(`Data Warning: Non-numeric cell content "${inputRecordings[currentGridRow].split(" ")[traversalIndex]}" found at grid position (row: ${currentGridRow}, relative index: ${traversalIndex}). Skipping this cell.`);
        return;
      }

      // If the cell's value is odd, record its 1-based grid coordinates.
      if (isOddNumber(cellContent)) {
        let actualColumnIndex;
        if (isForwardScanDirection) {
          actualColumnIndex = traversalIndex + 1; // 1-based column for left-to-right scan
        } else {
          // For reversed (right-to-left) scan, calculate the original 1-based column index.
          // If the original array has width W, and we are at `traversalIndex` in the reversed array,
          // its original index is `W - 1 - traversalIndex` (0-based).
          // So, 1-based column is `(W - 1 - traversalIndex) + 1` which simplifies to `W - traversalIndex`.
          actualColumnIndex = gridWidth - traversalIndex;
        }
        oddValueCellCoordinates.push([currentGridRow, actualColumnIndex]);
      }
    });
  }

  // --- Path Generation Between Paired Odd Cells ---
  // This array will store the sequence of individual moves.
  // Each move is represented as [from_row, from_col, to_row, to_col].
  const generatedMovementSteps = [];

  // Iterate through the collected odd cell coordinates, taking them in pairs.
  // The loop condition ensures we only process full pairs (i.e., oddValueCellCoordinates.length / 2, floored).
  for (let pairSequence = 0; pairSequence < Math.floor(oddValueCellCoordinates.length / 2); pairSequence++) {
    // Get the starting and ending positions for the current path segment.
    // Create a mutable copy of the starting position because it will be updated incrementally.
    const currentPathOrigin = [...oddValueCellCoordinates[pairSequence * 2]]; // [row, col]
    const currentPathDestination = oddValueCellCoordinates[pairSequence * 2 + 1];

    // Safety check: ensure the destination exists. (Redundant if loop condition is correct, but good for robustness).
    if (!currentPathDestination) {
      console.warn(`Path Generation Warning: Destination coordinate missing for pair ${pairSequence}. Halting path generation.`);
      break;
    }

    // Continue generating moves until the current position matches the destination.
    // Array comparison is done element-by-element, not by string conversion.
    while (currentPathOrigin[0] !== currentPathDestination[0] || currentPathOrigin[1] !== currentPathDestination[1]) {
      // Prioritize horizontal movement if columns are different.
      if (currentPathOrigin[1] !== currentPathDestination[1]) {
        const previousColumn = currentPathOrigin[1];
        if (currentPathOrigin[1] < currentPathDestination[1]) {
          currentPathOrigin[1]++; // Move right
        } else {
          currentPathOrigin[1]--; // Move left
        }
        // Record the horizontal move.
        generatedMovementSteps.push([currentPathOrigin[0], previousColumn, currentPathOrigin[0], currentPathOrigin[1]]);
      } else {
        // Columns are identical, so perform vertical movement.
        const previousRow = currentPathOrigin[0];
        // The original logic always increments the row. This implies a "downward" movement.
        // This behavior is preserved, assuming destinations are always "below" in the scan order.
        currentPathOrigin[0]++; // Move down
        // Record the vertical move.
        generatedMovementSteps.push([previousRow, currentPathOrigin[1], currentPathOrigin[0], currentPathOrigin[1]]);
      }
    }
  }

  // --- Output Results ---
  // First, output the total number of moves made.
  console.log(generatedMovementSteps.length);

  // Then, output each individual move, formatted as "from_r from_c to_r to_c", each on a new line.
  if (generatedMovementSteps.length > 0) {
    console.log(generatedMovementSteps.map(move => move.join(" ")).join("\n"));
  }
}

// --- Program Entry Point and Input Handling ---
(function() {
  try {
    // Read all input from standard input, decode as UTF-8, remove leading/trailing whitespace,
    // and split into an array of lines.
    const rawSystemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
    const cleanedInputLines = rawSystemInput.trim().split("\n");

    // Invoke the main grid processing function with the prepared input.
    executeGridTransformation(cleanedInputLines);
  } catch (executionError) {
    // Catch and report any errors that occur during file reading or main execution.
    console.error("Critical System Failure: An unexpected error occurred during program execution.");
    console.error(`Error Details: ${executionError.message}`);
    // For debugging, uncomment the following line to see the full stack trace:
    // console.error(executionError.stack);
  }
})();