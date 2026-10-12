function ProcessInput(rawData) {
  // Trim leading/trailing whitespace and split input into lines
  rawData = rawData.trim().split("\n");

  // Parse grid dimensions and number of items from the first line
  const [numRows, numCols, numItems] = rawData.shift().split(" ").map((strVal) => parseInt(strVal, 10));

  // Parse item data (row, column, value) from remaining lines
  const itemData = rawData.map((lineStr) => lineStr.split(" ").map((strVal) => parseInt(strVal, 10)));

  // Declare loop counters
  let rowIdx, colIdx, valIdx;

  // Initialize a sparse grid to store item values
  let gridValues = [];
  // Initialize the dynamic programming memoization table
  let memoTable = [];

  // Pre-fill the memoization table with initial values
  // The dimensions are slightly larger than max possible R, C to avoid out-of-bounds access
  // during DP transitions (e.g., dp[i+1][j] or dp[i][j+1])
  for (rowIdx = 0; rowIdx < 3005; rowIdx++) {
    const innerArray = []; // Temporary array for the current row
    for (colIdx = 0; colIdx < 3005; colIdx++) {
      innerArray.push([0, 0, 0, 0]); // Each cell stores an array of 4 values
    }
    memoTable.push(innerArray);
  }

  // Populate the sparse grid with the provided item data
  for (let i = 0; i < numItems; i++) {
    const [itemRow, itemCol, itemVal] = itemData[i];
    // Adjust to 0-based indexing and ensure the row array exists
    gridValues[itemRow - 1] = gridValues[itemRow - 1] || [];
    gridValues[itemRow - 1][itemCol - 1] = itemVal;
  }

  // Perform dynamic programming calculations
  // Iterate through each cell of the grid
  for (rowIdx = 0; rowIdx < numRows; rowIdx++) {
    for (colIdx = 0; colIdx < numCols; colIdx++) {
      // Calculate values for the current cell based on previous states
      // This loop processes the 'k' dimension from right to left
      for (valIdx = 2; valIdx >= 0; valIdx--) {
        // Update the next state (k+1) by taking the maximum of its current value
        // and the current state (k) plus the value at the current grid cell (if any)
        memoTable[rowIdx][colIdx][valIdx + 1] = Math.max(
          memoTable[rowIdx][colIdx][valIdx + 1],
          memoTable[rowIdx][colIdx][valIdx] + (gridValues[rowIdx] && gridValues[rowIdx][colIdx] || 0)
        );
      }

      // Propagate values to adjacent cells (down and right)
      // This loop processes all 'k' dimensions
      for (valIdx = 0; valIdx < 4; valIdx++) {
        // Propagate to the cell directly below (rowIdx+1, colIdx) for the first 'k' state
        memoTable[rowIdx + 1][colIdx][0] = Math.max(
          memoTable[rowIdx + 1][colIdx][0],
          memoTable[rowIdx][colIdx][valIdx]
        );
        // Propagate to the cell directly to the right (rowIdx, colIdx+1) for the current 'k' state
        memoTable[rowIdx][colIdx + 1][valIdx] = Math.max(
          memoTable[rowIdx][colIdx + 1][valIdx],
          memoTable[rowIdx][colIdx][valIdx]
        );
      }
    }
  }

  // Determine the final maximum result from the last cell of the grid
  let finalResult = 0;
  for (valIdx = 0; valIdx < 4; valIdx++) {
    finalResult = Math.max(finalResult, memoTable[numRows - 1][numCols - 1][valIdx]);
  }

  // Output the computed maximum value
  console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
