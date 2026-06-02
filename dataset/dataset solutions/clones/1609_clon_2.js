function ProcessInput(rawData) {
  // Process the raw input string: remove leading/trailing whitespace and split into individual lines.
  rawData = rawData.trim().split("\n");

  // Extract the grid dimensions (number of rows, number of columns) and the count of value items
  // from the first line of input. Convert these string values to integers.
  const [numRows, numCols, numItems] = rawData.shift().split(" ").map((strVal) => parseInt(strVal, 10));

  // Parse the remaining lines of input, each representing an item with its row, column, and value.
  // Each line is split by space, and its components are converted to integers.
  const itemData = rawData.map((strVal) => strVal.split(" ").map((subStrVal) => parseInt(subStrVal, 10)));

  // Declare variables for loop indices and the main data structures used in the algorithm.
  let rowIdx, colIdx, valIdx;
  let gridValues = []; // This sparse array will store the actual values at specific (row, col) coordinates.
  let dynamicProg = []; // This 3D array will store the dynamic programming states.

  // Populate the 'gridValues' array using the parsed 'itemData'.
  // The input coordinates are 1-indexed, so they are adjusted to be 0-indexed for array access.
  for (let rowIdx = 0; rowIdx < numItems; rowIdx++) {
    const [itemRow, itemCol, itemVal] = itemData[rowIdx];
    // Ensure the target row array exists before attempting to assign a value to its column.
    gridValues[itemRow - 1] = gridValues[itemRow - 1] || [];
    // Assign the item's value to its corresponding 0-indexed position in the grid.
    gridValues[itemRow - 1][itemCol - 1] = itemVal;
  }

  // Initialize and compute the dynamic programming table.
  // This involves iterating through each cell of the grid.
  for (rowIdx = 0; rowIdx < numRows; rowIdx++) {
    // Ensure that the current row and the next row in the DP table are initialized as arrays.
    dynamicProg[rowIdx] = dynamicProg[rowIdx] || [];
    dynamicProg[rowIdx + 1] = dynamicProg[rowIdx + 1] || [];

    for (colIdx = 0; colIdx < numCols; colIdx++) {
      // Initialize the DP states for the current cell, the cell to its right, and the cell below it.
      // Each state is an array of 4 elements, initialized to zeros.
      dynamicProg[rowIdx][colIdx] = dynamicProg[rowIdx][colIdx] || [0, 0, 0, 0];
      dynamicProg[rowIdx][colIdx + 1] = dynamicProg[rowIdx][colIdx + 1] || [0, 0, 0, 0];
      dynamicProg[rowIdx + 1][colIdx] = dynamicProg[rowIdx + 1][colIdx] || [0, 0, 0, 0];

      // This loop calculates the maximum value for the current cell's DP states,
      // considering the possibility of picking up an item at this cell.
      // It iterates backwards through the 'valIdx' dimension.
      for (valIdx = 2; valIdx >= 0; valIdx--) {
        // Get the value at the current grid position, or 0 if no item exists there.
        const currentValue = (gridValues[rowIdx] && gridValues[rowIdx][colIdx]) || 0;
        // Update the DP state for 'valIdx + 1' by taking the maximum of its current value
        // and the sum of the 'valIdx' state and the current cell's item value.
        dynamicProg[rowIdx][colIdx][valIdx + 1] = Math.max(
          dynamicProg[rowIdx][colIdx][valIdx + 1],
          dynamicProg[rowIdx][colIdx][valIdx] + currentValue
        );
      }

      // This loop propagates the DP values from the current cell to its adjacent cells (down and right).
      for (valIdx = 0; valIdx < 4; valIdx++) {
        // Update the DP state for the cell directly below the current cell.
        // The '0' index for the next row implies a transition without picking an item.
        dynamicProg[rowIdx + 1][colIdx][0] = Math.max(
          dynamicProg[rowIdx + 1][colIdx][0],
          dynamicProg[rowIdx][colIdx][valIdx]
        );
        // Update the DP state for the cell directly to the right of the current cell.
        // The 'valIdx' is preserved, indicating the state carries over.
        dynamicProg[rowIdx][colIdx + 1][valIdx] = Math.max(
          dynamicProg[rowIdx][colIdx + 1][valIdx],
          dynamicProg[rowIdx][colIdx][valIdx]
        );
      }
    }
  }

  // After filling the DP table, find the maximum value among all states in the bottom-right cell.
  let finalResult = 0;
  for (valIdx = 0; valIdx < 4; valIdx++) {
    finalResult = Math.max(finalResult, dynamicProg[numRows - 1][numCols - 1][valIdx]);
  }

  // Print the final computed maximum result to the console.
  console.log(finalResult);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
