function ProcessInput(rawData) {
  // Clean up the raw input string and split it into lines
  rawData = rawData.trim().split("\n");

  // Extract the dimensions (rows, columns) and number of items from the first line
  const [numRows, numCols, itemCount] = rawData.shift().split(" ").map((element) => parseInt(element, 10));

  // Parse the remaining lines to get item data (row, column, value)
  const itemData = rawData.map((element) => element.split(" ").map((subElement) => parseInt(subElement, 10)));

  // Initialize a 2D array to store item values at specific grid positions
  // This array will be sparsely populated
  let itemGrid = [];

  // Initialize a 3D array for dynamic programming memoization
  // The dimensions are (numRows + 1) x (numCols + 1) x 4
  let memoTable = [];
  const MAX_DIMENSION = 3005; // A sufficiently large constant for array initialization

  // Populate the memoTable with placeholder arrays
  for (let rowIndex = 0; rowIndex < MAX_DIMENSION; rowIndex++) {
    const rowArray = [];
    for (let colIndex = 0; colIndex < MAX_DIMENSION; colIndex++) {
      rowArray.push(new Array(4)); // Each cell stores 4 possible states
    }
    memoTable.push(rowArray);
  }

  // Fill the itemGrid with values from the input itemData
  // Adjusting for 0-based indexing
  for (let i = 0; i < itemCount; i++) {
    const [currRow, currCol, currVal] = itemData[i];
    // Ensure the row array exists before assigning a value
    itemGrid[currRow - 1] = itemGrid[currRow - 1] || [];
    itemGrid[currRow - 1][currCol - 1] = currVal;
  }

  // Main dynamic programming calculation loop
  // Iterate through each cell of the grid
  for (let rIdx = 0; rIdx < numRows; rIdx++) {
    for (let cIdx = 0; cIdx < numCols; cIdx++) {
      // Calculate maximum values for picking items at the current cell
      // Iterate backwards for state transitions related to picking items
      for (let sIdx = 2; sIdx >= 0; sIdx--) {
        // Update the next state (sIdx + 1) at the current cell (rIdx, cIdx)
        // by considering the current state (sIdx) and potentially adding the item's value
        memoTable[rIdx][cIdx][sIdx + 1] = Math.max(
          memoTable[rIdx][cIdx][sIdx + 1] || 0,
          (memoTable[rIdx][cIdx][sIdx] || 0) + (itemGrid[rIdx] ? itemGrid[rIdx][cIdx] || 0 : 0)
        );
      }

      // Propagate maximum values to adjacent cells (down and right)
      // Iterate through all 4 states for propagation
      for (let sIdx = 0; sIdx < 4; sIdx++) {
        // Propagate to the cell directly below (rIdx + 1, cIdx)
        // The state resets to 0 when moving to a new row
        memoTable[rIdx + 1][cIdx][0] = Math.max(
          memoTable[rIdx + 1][cIdx][0] || 0,
          memoTable[rIdx][cIdx][sIdx] || 0
        );
        // Propagate to the cell directly to the right (rIdx, cIdx + 1)
        // The state remains the same when moving horizontally
        memoTable[rIdx][cIdx + 1][sIdx] = Math.max(
          memoTable[rIdx][cIdx + 1][sIdx] || 0,
          memoTable[rIdx][cIdx][sIdx] || 0
        );
      }
    }
  }

  // Determine the final maximum result from all possible states at the bottom-right cell
  let finalResult = 0;
  for (let sIdx = 0; sIdx < 4; sIdx++) {
    finalResult = Math.max(finalResult, memoTable[numRows - 1][numCols - 1][sIdx]);
  }

  // Output the computed maximum value
  console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
