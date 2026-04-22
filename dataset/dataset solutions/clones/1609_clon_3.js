// Function to process grid-based data and calculate maximum collectible value
// This function takes raw string input, parses it, and applies dynamic programming
// to find the optimal path for collecting items within a grid.
function ProcessGridData(rawDataString) {
  // Input processing stage: Clean and parse the raw string data.
  // We'll use a helper to ensure robustness during parsing.

  // First, remove leading/trailing whitespace and split the input into an array of lines.
  const dataLines = rawDataString.trim().split("\n");

  // Helper function to safely parse an integer from a string.
  // It handles potential non-numeric inputs gracefully by logging an error and returning 0.
  const parseNumericValue = (str) => {
    const val = parseInt(str.trim(), 10);
    if (isNaN(val)) {
      // In a production system, this might throw an error or handle input more robustly.
      // For this clone, we log a warning and return a default, mimicking original's implicit behavior.
      console.warn("Invalid numeric input detected; defaulting to 0:", str);
      return 0; // Fallback for invalid numbers.
    }
    return val;
  };

  // Extract grid dimensions (number of rows, columns) and the total count of items to be placed.
  // The first line of input provides these configuration parameters.
  const gridConfigLine = dataLines.shift(); // Remove and get the first line.

  // Basic validation: Ensure the configuration line exists.
  if (!gridConfigLine) {
    console.error("Critical error: Grid configuration line is missing from input.");
    return 0; // Cannot proceed without configuration.
  }

  // Split the configuration line into its constituent parts and parse them.
  const configParts = gridConfigLine.split(" ");

  // Renamed variables for improved readability: R -> numRows, C -> numCols, n -> totalItemsToPlace.
  const numRows = parseNumericValue(configParts[0]);
  const numCols = parseNumericValue(configParts[1]);
  const totalItemsToPlace = parseNumericValue(configParts[2]);

  // Perform sanity checks on the parsed grid dimensions and item count.
  // A grid must have positive dimensions, and item count should not be negative.
  if (numRows <= 0 || numCols <= 0 || totalItemsToPlace < 0) {
    console.error("Input validation failed: Invalid grid dimensions or item count detected.",
                  { rows: numRows, cols: numCols, items: totalItemsToPlace });
    return 0; // Abort if dimensions are invalid.
  }

  // Parse details for each valuable item (its 1-based row, 1-based column, and intrinsic value).
  // Renamed from 'values' to 'itemPlacementDetails' for clarity.
  const itemPlacementDetails = dataLines.map((line) =>
    line.split(" ").map(parseNumericValue)
  );

  // Initialize core data structures required for the dynamic programming solution.

  // `gridItems` (formerly `a`): A sparse 2D array (matrix) to store the values of items
  // at their respective grid coordinates. If a cell has no item, its entry will be undefined.
  // We initialize rows with `null` to indicate sparsity and only create sub-arrays when needed.
  const gridItems = Array(numRows).fill(null);

  // `memoTable` (formerly `dp`): This is a 3D array that serves as the dynamic programming table.
  // `memoTable[row][col][pickedCount]` stores the maximum value obtainable when reaching
  // cell `(row, col)`, having picked `pickedCount` items *from the current contiguous
  // row segment ending at (row, col)*.
  // The `pickedCount` can range from 0 to 3, meaning 4 distinct states.
  const MAX_PICK_STATES_PER_SEGMENT = 4; // Represents states for 0, 1, 2, or 3 items picked.

  // Initialize `memoTable` with dimensions (numRows+1) x (numCols+1) x MAX_PICK_STATES_PER_SEGMENT,
  // with all values set to 0. The extra row and column simplify boundary checks
  // when accessing `memoTable[row+1]` or `memoTable[col+1]`.
  const memoTable = Array.from({ length: numRows + 1 }, () =>
    Array.from({ length: numCols + 1 }, () =>
      Array(MAX_PICK_STATES_PER_SEGMENT).fill(0)
    )
  );

  // Populate the `gridItems` sparse matrix using the parsed item details.
  // Input coordinates are 1-indexed, so we convert them to 0-indexed for array access.
  for (let itemIndex = 0; itemIndex < totalItemsToPlace; itemIndex++) {
    const [itemRowOneBased, itemColOneBased, itemValue] = itemPlacementDetails[itemIndex];

    // Additional validation for item coordinates to ensure they fall within the grid boundaries.
    if (itemRowOneBased < 1 || itemRowOneBased > numRows ||
        itemColOneBased < 1 || itemColOneBased > numCols) {
      console.warn(`Skipping item at invalid coordinates: (${itemRowOneBased}, ${itemColOneBased}). Item must be within 1 to ${numRows} rows and 1 to ${numCols} columns.`);
      continue; // Skip this invalid item and proceed with the next.
    }

    const zeroBasedRow = itemRowOneBased - 1;
    const zeroBasedCol = itemColOneBased - 1;

    // Ensure the specific row array exists in `gridItems` before attempting to assign a value.
    // Using nullish coalescing assignment (??=) for a concise check and initialization.
    gridItems[zeroBasedRow] ??= []; // Equivalent to: `gridItems[zeroBasedRow] = gridItems[zeroBasedRow] ?? [];`
    gridItems[zeroBasedRow][zeroBasedCol] = itemValue;
  }

  // Dynamic Programming Calculation Phase.
  // This nested loop iterates through each cell `(currentRow, currentCol)` in the grid.
  for (let currentRow = 0; currentRow < numRows; currentRow++) {
    for (let currentCol = 0; currentCol < numCols; currentCol++) {

      // Safely retrieve the value of an item at the current cell.
      // Uses optional chaining (`?.`) and nullish coalescing (`??`) to handle sparse `gridItems`.
      const currentCellItemValue = gridItems[currentRow]?.[currentCol] ?? 0;

      // Stage 1: Consider the option of picking items at the current cell `(currentRow, currentCol)`.
      // We iterate backwards from `MAX_PICK_STATES_PER_SEGMENT - 2` (which is 2, corresponding to 3rd pick state)
      // down to 0. This ensures that when `memoTable[...][nextPickedCount]` is updated,
      // it uses a `memoTable[...][prevPickedCount]` value that hasn't yet accounted for picking
      // the current cell's item in this iteration.
      for (let prevPickedCount = MAX_PICK_STATES_PER_SEGMENT - 2; prevPickedCount >= 0; prevPickedCount--) {
        const nextPickedCount = prevPickedCount + 1; // Represents picking one more item.

        // If there's a valuable item at the current cell, we can choose to pick it.
        // This updates the DP state for `nextPickedCount` by adding the item's value.
        if (currentCellItemValue > 0) {
          memoTable[currentRow][currentCol][nextPickedCount] = Math.max(
            memoTable[currentRow][currentCol][nextPickedCount],
            memoTable[currentRow][currentCol][prevPickedCount] + currentCellItemValue
          );
        } else {
           // Even if there's no item, we must propagate the previous state.
           // This handles cases where `memoTable[currentRow][currentCol][nextPickedCount]`
           // might have been reached by a path not involving picking, but we still need
           // to ensure it holds the maximum value possible from `prevPickedCount` state
           // without adding an item. This line is technically redundant if `currentCellItemValue` is 0
           // and `memoTable[currentRow][currentCol][nextPickedCount]` was already correctly initialized
           // or updated by other means, but it explicitly clones the original logic's structure.
           memoTable[currentRow][currentCol][nextPickedCount] = Math.max(
            memoTable[currentRow][currentCol][nextPickedCount],
            memoTable[currentRow][currentCol][prevPickedCount]
           );
        }
      }

      // Stage 2: Propagate values to adjacent cells (representing movement).
      // We iterate through all possible `pickedCount` states (0 to 3) achieved at the current cell.
      for (let currentPickedState = 0; currentPickedState < MAX_PICK_STATES_PER_SEGMENT; currentPickedState++) {
        // The maximum value accumulated up to the current cell with `currentPickedState` items picked.
        const valueFromCurrentCellState = memoTable[currentRow][currentCol][currentPickedState];

        // Option A: Move Down to the next row (currentRow + 1).
        // When moving to a new row, the `pickedCount` for the *new row segment* resets to 0.
        const nextRow = currentRow + 1;
        // Ensure we are within the bounds of the memoTable (which includes numRows itself).
        if (nextRow < numRows + 1) {
          memoTable[nextRow][currentCol][0] = Math.max(
            memoTable[nextRow][currentCol][0],
            valueFromCurrentCellState
          );
        }

        // Option B: Move Right to the next column (currentCol + 1).
        // When moving right *within the same row*, the `pickedCount` from the current segment
        // is carried over to the next column's segment. This implies continuity within a row.
        const nextCol = currentCol + 1;
        // Ensure we are within the bounds of the memoTable (which includes numCols itself).
        if (nextCol < numCols + 1) {
          memoTable[currentRow][nextCol][currentPickedState] = Math.max(
            memoTable[currentRow][nextCol][currentPickedState],
            valueFromCurrentCellState
          );
        }
      }
    }
  }

  // Final Result Aggregation.
  // After filling the entire `memoTable`, the maximum collected value will be found
  // at the bottom-right cell of the grid (`numRows-1`, `numCols-1`).
  // We need to check all possible `pickedCount` states at this final cell.
  let maxCollectedValue = 0;
  for (let finalPickedState = 0; finalPickedState < MAX_PICK_STATES_PER_SEGMENT; finalPickedState++) {
    maxCollectedValue = Math.max(
      maxCollectedValue,
      memoTable[numRows - 1][numCols - 1][finalPickedState]
    );
  }

  // Output the final computed maximum value to the console.
  console.log(maxCollectedValue);

  // Return the value. This is an addition for potential modularity or testing,
  // not strictly part of the original competitive programming output pattern.
  return maxCollectedValue;
}

// Standard boilerplate for reading input from stdin in competitive programming environments.
// The raw input is read synchronously from '/dev/stdin' and passed to the main processing function.
ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));