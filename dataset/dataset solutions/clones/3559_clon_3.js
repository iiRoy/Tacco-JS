// This module handles input/output operations, typically for reading from standard input.
const fileSystem = require('fs');

/**
 * Compares two coordinate arrays to check if they represent the same location.
 * @param {number[]} coordA - The first coordinate array [row, column].
 * @param {number[]} coordB - The second coordinate array [row, column].
 * @returns {boolean} True if coordinates are identical, false otherwise.
 */
const areCoordinatesEquivalent = (coordA, coordB) =>
  coordA[0] === coordB[0] && coordA[1] === coordB[1];

/**
 * Processes a grid of numbers to identify and log a sequence of parity transfer operations.
 * The goal is to "move" oddness from one cell to another to eventually make all cells even.
 * This specific implementation pairs up odd cells and generates a path of transfers
 * (always moving right or down) between them.
 *
 * @param {string[]} gridInputLines - An array of strings where the first string contains
 *                                    dimensions (Height Width) and subsequent strings
 *                                    represent rows of the grid with space-separated numbers.
 */
function processMatrixParityTransfers(gridInputLines) {
  // --- Step 1: Input Validation and Dimension Parsing ---
  // Ensure that input data is provided and has at least the dimension line.
  if (!gridInputLines || gridInputLines.length === 0) {
    console.error("Error: No grid input data was supplied.");
    return; // Terminate execution if input is invalid.
  }

  // Extract the grid dimensions from the very first line of the input.
  const dimensionTokens = gridInputLines[0].split(" ");
  // Use parseInt for explicit and robust conversion of string to integer.
  const gridHeight = parseInt(dimensionTokens[0], 10); // Number of rows (H)
  const gridWidth = parseInt(dimensionTokens[1], 10);  // Number of columns (W)

  // Validate parsed dimensions to ensure they are positive numbers.
  if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
    console.error("Error: Invalid or non-positive grid dimensions specified.");
    return; // Terminate if dimensions are invalid.
  }

  // --- Step 2: Identify and Collect All Odd-Valued Cell Coordinates ---
  // This array will store 1-indexed [row, column] pairs for every cell containing an odd number.
  let identifiedOddCellLocations = [];

  // Iterate through each data row of the grid, starting from the second line of input.
  // The loop runs from 1 to gridHeight (inclusive), corresponding to 1-indexed rows.
  for (let rIdx = 1; rIdx <= gridHeight; rIdx++) {
    // Split the current row string into individual cell value strings, then convert them to numbers.
    const currentRowCellValues = gridInputLines[rIdx].split(" ").map(Number);

    // Use flatMap to efficiently identify and collect coordinates of odd numbers.
    // flatMap allows returning an array (or empty array) for each element and flattens the result.
    const oddCoordsInCurrentRow = currentRowCellValues.flatMap((cellNumericValue, cIdx) => {
      // Check if the current cell's value is odd (remainder is not zero when divided by 2).
      if (cellNumericValue % 2 !== 0) {
        // If odd, return its 1-indexed [row, column] coordinates wrapped in an array.
        // `rIdx` is already 1-indexed, `cIdx` is 0-indexed, so add 1 to `cIdx`.
        return [[rIdx, cIdx + 1]];
      }
      // If even, return an empty array, which flatMap will effectively remove.
      return [];
    });

    // Append the collected odd coordinates from the current row to the main list.
    identifiedOddCellLocations = identifiedOddCellLocations.concat(oddCoordsInCurrentRow);
  }

  // --- Step 3: Generate Parity Transfer Path Steps ---
  // This array will store the sequence of "movements" or transfers,
  // each represented as [startRow, startCol, endRow, endCol].
  const generatedTransferSteps = [];
  let totalOperationsCount = 0; // A counter for the total number of individual transfer steps.

  // Process the identified odd cell locations in pairs.
  // The loop iterates `k` times, processing `oddCellLocations[k*2]` and `oddCellLocations[k*2+1]`.
  // `Math.floor(identifiedOddCellLocations.length / 2)` ensures we only process full pairs.
  for (let k = 0; k < Math.floor(identifiedOddCellLocations.length / 2); k++) {
    // Create a mutable copy of the starting odd cell's coordinates.
    // This is crucial because `currentSourceCell` will be modified during the path generation.
    let currentSourceCell = [...identifiedOddCellLocations[k * 2]];
    // The target cell coordinates, which remain constant for the current pair.
    const currentTargetCell = identifiedOddCellLocations[k * 2 + 1];

    // The original code had an `if(end == null) break;` check here. This is unnecessary
    // because the loop condition `k < Math.floor(identifiedOddCellLocations.length / 2)`
    // guarantees that `k * 2 + 1` will always be a valid index within `identifiedOddCellLocations`.

    // Simulate moving the "oddness" from `currentSourceCell` to `currentTargetCell`.
    // This loop continues until `currentSourceCell` reaches the exact coordinates of `currentTargetCell`.
    while (!areCoordinatesEquivalent(currentSourceCell, currentTargetCell)) {
      totalOperationsCount++; // Increment the counter for each unit transfer step.

      // Movement logic: Prioritize horizontal movement (right) if the target column is to the right.
      if (currentSourceCell[1] < currentTargetCell[1]) {
        // Move one step to the right: [r, c] -> [r, c+1].
        generatedTransferSteps.push([
          currentSourceCell[0],
          currentSourceCell[1],
          currentSourceCell[0],
          ++currentSourceCell[1], // Increment column and use its new value.
        ]);
      }
      // If not moving right, check if vertical movement (down) is needed.
      // This path is taken if current column is >= target column, and current row is above target row.
      else if (currentSourceCell[0] < currentTargetCell[0]) {
        // Move one step down: [r, c] -> [r+1, c].
        generatedTransferSteps.push([
          currentSourceCell[0],
          currentSourceCell[1],
          ++currentSourceCell[0], // Increment row and use its new value.
          currentSourceCell[1],
        ]);
      } else {
        // This `else` block serves as a safeguard. In typical "parity transfer" problems
        // where cells are processed in scanline order, `currentTargetCell` is always
        // "ahead" or "below" `currentSourceCell` in terms of row-major order.
        // Therefore, `currentSourceCell` should always be able to reach `currentTargetCell`
        // using only right and down movements. If this block is hit, it suggests an
        // unexpected state (e.g., target is to the left or above, or current is already at target).
        // Since `areCoordinatesEquivalent` handles the "at target" case, this break is for
        // truly unhandled scenarios.
        break;
      }
    }
  }

  // --- Step 4: Output Results ---
  // First, print the total number of transfer operations performed.
  console.log(totalOperationsCount);
  // Then, print each individual transfer step on a new line.
  // Each step's coordinates are joined by spaces.
  console.log(generatedTransferSteps.map(step => step.join(" ")).join("\n"));
}

// --- Execution Entry Point ---
// This block reads input from standard input, processes it, and calls the main function.
try {
  // Read the entire content of standard input as a string, using UTF-8 encoding.
  const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
  // Trim leading/trailing whitespace and split the content into an array of lines.
  const preparedInputLines = rawInputContent.trim().split("\n");

  // Invoke the primary function to handle the parity transfer logic.
  processMatrixParityTransfers(preparedInputLines);
} catch (error) {
  console.error("An error occurred during input processing or execution:", error.message);
}