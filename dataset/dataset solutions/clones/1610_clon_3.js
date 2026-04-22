const MAX_GRID_DIMENSION_SIZE = 3005; // Represents the maximum possible size for a grid dimension, used for DP table pre-allocation.
const MAX_PICK_COUNT_PER_ROW = 4; // Max 3 items can be picked per row, so 4 states (0, 1, 2, 3 picks).

/**
 * Safely converts a string to a number.
 * This helper ensures that numerical conversions are consistent and robust.
 * @param {string} strValue - The string to convert.
 * @returns {number} The parsed number, or 0 if parsing fails.
 */
const convertToNumber = (strValue) => {
  const numericVal = Number(strValue); // Using Number() for conversion, an alternative to parseInt().
  return isNaN(numericVal) ? 0 : numericVal; // Return 0 for invalid numbers to prevent errors.
};

/**
 * Calculates the maximum value obtainable by traversing a grid, collecting treasures,
 * with specific rules for movement and treasure collection. This function
 * implements a dynamic programming approach.
 *
 * @param {string} rawInputString - The complete input data received as a string.
 */
function calculateOptimalTreasurePath(rawInputString) {
  // --- Input Processing and Validation ---

  // Check if the input is valid and not empty.
  if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
    console.log(0); // If no input, no treasures can be collected.
    return;
  }

  // Split the input string into an array of lines, then remove leading/trailing whitespace.
  const inputLines = rawInputString.trim().split("\n");

  // Extract grid dimensions (rows, columns) and the total number of treasure items from the first line.
  const firstLineData = inputLines.shift().split(" ");
  const totalGridRows = convertToNumber(firstLineData[0]);
  const totalGridCols = convertToNumber(firstLineData[1]);
  const numberOfTreasureItems = convertToNumber(firstLineData[2]);

  // Handle edge cases where grid dimensions are non-positive.
  if (totalGridRows <= 0 || totalGridCols <= 0) {
    console.log(0);
    return;
  }

  // --- Treasure Grid Initialization and Population ---

  // Create a 2D array (the 'treasure map') initialized with zeros.
  // This map will store the value of treasure at each grid cell.
  // Using Array.from with a mapping function for clean initialization.
  const treasureMap = Array.from({ length: totalGridRows }, () =>
    Array.from({ length: totalGridCols }, () => 0)
  );

  // Iterate through the remaining input lines to populate the treasure map.
  // Each line specifies a treasure's row, column, and value.
  for (let treasureIdx = 0; treasureIdx < numberOfTreasureItems; ++treasureIdx) {
    const currentTreasureDetails = inputLines[treasureIdx].split(" ");
    const treasureLocationRow = convertToNumber(currentTreasureDetails[0]);
    const treasureLocationCol = convertToNumber(currentTreasureDetails[1]);
    const treasureValue = convertToNumber(currentTreasureDetails[2]);

    // Convert 1-indexed coordinates from input to 0-indexed for array access.
    const mapRowCoord = treasureLocationRow - 1;
    const mapColCoord = treasureLocationCol - 1;

    // Place the treasure value on the map if the coordinates are within valid bounds.
    if (mapRowCoord >= 0 && mapRowCoord < totalGridRows &&
        mapColCoord >= 0 && mapColCoord < totalGridCols) {
      treasureMap[mapRowCoord][mapColCoord] = treasureValue;
    }
    // No explicit error handling for out-of-bounds treasures, assuming valid input as per typical competitive programming.
  }

  // --- Dynamic Programming Table Setup ---

  // Initialize a 3D dynamic programming table (memoization matrix).
  // `dpTable[r][c][k]` will store the maximum value collected when reaching cell (r, c)
  // having picked 'k' items within the current row 'r'.
  // The table is pre-allocated to MAX_GRID_DIMENSION_SIZE + 1 to handle
  // transitions to (R, C) which are outside the (R-1, C-1) loop bounds.
  const dpTable = Array.from({ length: MAX_GRID_DIMENSION_SIZE + 1 }, () =>
    Array.from({ length: MAX_GRID_DIMENSION_SIZE + 1 }, () =>
      Array.from({ length: MAX_PICK_COUNT_PER_ROW }, () => 0) // All entries initialized to 0.
    )
  );

  // --- Core Dynamic Programming Logic ---

  // Iterate over each cell in the grid from top-left to bottom-right.
  for (let currentRow = 0; currentRow < totalGridRows; ++currentRow) {
    for (let currentCol = 0; currentCol < totalGridCols; ++currentCol) {

      // Retrieve the treasure value at the current cell. Will be 0 if no treasure.
      const currentCellItemValue = treasureMap[currentRow][currentCol];

      // Step 1: Evaluate picking the treasure at the current cell.
      // We iterate 'pickCount' in reverse order (from 2 down to 0).
      // This ensures that when dpTable[...][k+1] is updated, it uses the value
      // of dpTable[...][k] from *before* any treasure was added at the current cell
      // for the k-th state. This is crucial for correctly counting items picked at (currentRow, currentCol).
      for (let previousPickState = MAX_PICK_COUNT_PER_ROW - 2; previousPickState >= 0; --previousPickState) {
        // Calculate the potential value if we decide to pick the treasure here.
        const valueIfCurrentPicked = dpTable[currentRow][currentCol][previousPickState] + currentCellItemValue;

        // Update the state for having picked one more item (previousPickState + 1).
        // Take the maximum between the current value in this state and the newly calculated value.
        dpTable[currentRow][currentCol][previousPickState + 1] = Math.max(
          dpTable[currentRow][currentCol][previousPickState + 1],
          valueIfCurrentPicked
        );
      }

      // Step 2: Propagate maximum values to adjacent cells (move right or move down).
      // Iterate through all possible item pick counts at the current cell.
      for (let currentPickCountState = 0; currentPickCountState < MAX_PICK_COUNT_PER_ROW; ++currentPickCountState) {
        const currentCellAccumulatedValue = dpTable[currentRow][currentCol][currentPickCountState];

        // Option A: Move down to the next row (currentRow + 1).
        // When moving to a new row, the item pick count for that row resets to 0.
        // We only propagate if the next row is within the bounds of the actual grid rows.
        if (currentRow + 1 < totalGridRows) {
          dpTable[currentRow + 1][currentCol][0] = Math.max(
            dpTable[currentRow + 1][currentCol][0],
            currentCellAccumulatedValue
          );
        } else if (currentRow + 1 === totalGridRows && currentCol === totalGridCols - 1) {
          // This specific case handles propagation to the final (R, C) state if it's the last cell.
          // It's covered by the large pre-allocated table and the final result extraction.
          // No explicit update here as the large table ensures indices are valid.
        }

        // Option B: Move right to the next column (currentCol + 1).
        // When moving right within the same row, the item pick count is maintained.
        // We only propagate if the next column is within the bounds of the actual grid columns.
        if (currentCol + 1 < totalGridCols) {
          dpTable[currentRow][currentCol + 1][currentPickCountState] = Math.max(
            dpTable[currentRow][currentCol + 1][currentPickCountState],
            currentCellAccumulatedValue
          );
        }
      }
    }
  }

  // --- Final Result Extraction ---

  // The maximum accumulated value is found at the bottom-right cell of the grid.
  // We need to check all possible 'pickCount' states at this final cell.
  const finalRowIndex = totalGridRows - 1;
  const finalColIndex = totalGridCols - 1;

  // Retrieve all pick states for the final cell.
  const resultsAtFinalCell = dpTable[finalRowIndex][finalColIndex];

  // Use the `reduce` method to find the maximum value among all pick states at the final cell.
  const overallMaximumValue = resultsAtFinalCell.reduce((maxSoFar, currentValue) =>
    Math.max(maxSoFar, currentValue),
    0 // Initial value for comparison.
  );

  // Output the final calculated maximum value.
  console.log(overallMaximumValue);
}

// --- Program Entry Point ---

// Read the entire input from standard input (usually "/dev/stdin" in competitive programming).
// The `utf8` encoding is specified for text input.
const fileSystem = require("fs");
const systemInput = fileSystem.readFileSync("/dev/stdin", "utf8");

// Invoke the solver function with the obtained input.
calculateOptimalTreasurePath(systemInput);