// This function serves as the primary entry point for processing the problem's data
function ProcessInputData(incomingText)
{
  // First, clean up the raw input string by trimming whitespace and splitting it into individual lines
  incomingText = incomingText.trim()
                           .split("\n");

  // The very first line of input contains three critical parameters:
  // the number of rows, the number of columns, and the total count of items.
  // We parse these as integers from the space-separated string.
  const [numRows, numCols, itemCount] = incomingText.shift().split(" ").map((strVal) => parseInt(strVal, 10));

  // The subsequent lines in the input represent individual item records.
  // Each record specifies a row, a column, and a value for an item.
  // These are parsed into a 2D array where each inner array is [itemRow, itemCol, itemValue].
  const itemRecords = incomingText.map((lineStr) =>
    lineStr.split(" ").map((subStrVal) => parseInt(subStrVal, 10))
  );

  // Declare loop counter variables, which will be reused across different iteration blocks.
  let rowIndex, colIndex, stateSlotIndex;

  // Initialize a sparse 2D array to store the values of items at their respective grid positions.
  // This array (valueGrid) will map (row, col) to itemValue.
  const valueGrid = [];

  // Initialize a 3D array that will serve as our dynamic programming (DP) or memoization table.
  // This table (stateTable) will store computed maximum values for various states.
  const stateTable = [];

  // Pre-populate the stateTable with a fixed maximum size (e.g., 3005x3005)
  // Each cell in the 2D plane will contain an array of 4 elements, initialized to zeros.
  // This setup is crucial for the DP calculations to have a base state.
  for (rowIndex = 0; rowIndex < 3005; rowIndex++) {
    const currentRowContainer = [];
    for (colIndex = 0; colIndex < 3005; colIndex++) {
      currentRowContainer.push([0, 0, 0, 0]); // Each inner array represents 4 distinct states
    }
    stateTable.push(currentRowContainer);
  }

  // Now, populate the valueGrid using the itemRecords parsed earlier.
  // The input coordinates are 1-indexed, so we convert them to 0-indexed for array access.
  for (let currentItem = 0; currentItem < itemCount; currentItem++) {
    const [itemRow, itemCol, itemValue] = itemRecords[currentItem];
    // Ensure the specific row in valueGrid exists before attempting to assign a column value.
    valueGrid[itemRow - 1] = valueGrid[itemRow - 1] || [];
    // Assign the item's value to its correct 0-indexed position in the grid.
    valueGrid[itemRow - 1][itemCol - 1] = itemValue;
  }

  // The core dynamic programming logic is implemented here.
  // We iterate through each cell (rowIndex, colIndex) within the problem's defined dimensions.
  for (rowIndex = 0; rowIndex < numRows; rowIndex++) {
    for (colIndex = 0; colIndex < numCols; colIndex++) {

      // First inner loop: Update the current cell's states based on previous states within itself.
      // This often represents collecting items in the current cell.
      // We iterate downwards from state 2 to 0 to ensure dependencies are met.
      for (stateSlotIndex = 2; stateSlotIndex >= 0; stateSlotIndex--) {
        // Update stateSlotIndex+1 for the current cell.
        // It's the maximum of its current value and the sum of stateSlotIndex
        // plus the value found at the current grid position (if any).
        stateTable[rowIndex][colIndex][stateSlotIndex + 1] = Math.max(
          stateTable[rowIndex][colIndex][stateSlotIndex + 1],
          stateTable[rowIndex][colIndex][stateSlotIndex] +
            (valueGrid[rowIndex] && valueGrid[rowIndex][colIndex] || 0) // Add item value if present
        );
      }

      // Second inner loop: Propagate computed states to adjacent cells (down and right).
      // This represents moving from the current cell to the next cell in the grid.
      // We iterate through all four possible states (0 to 3).
      for (stateSlotIndex = 0; stateSlotIndex < 4; stateSlotIndex++) {
        // Propagate to the cell directly below (rowIndex + 1).
        // For vertical movement, the state is typically reset to 0 in the target cell.
        stateTable[rowIndex + 1][colIndex][0] = Math.max(
          stateTable[rowIndex + 1][colIndex][0],
          stateTable[rowIndex][colIndex][stateSlotIndex]
        );

        // Propagate to the cell directly to the right (colIndex + 1).
        // For horizontal movement, the stateSlotIndex is often preserved.
        stateTable[rowIndex][colIndex + 1][stateSlotIndex] = Math.max(
          stateTable[rowIndex][colIndex + 1][stateSlotIndex],
          stateTable[rowIndex][colIndex][stateSlotIndex]
        );
      }
    }
  }

  // After all DP calculations, find the maximum value in the bottom-rightmost cell.
  // This represents the optimal solution path ending at the grid's destination.
  let ultimateScore = 0;
  for (stateSlotIndex = 0; stateSlotIndex < 4; stateSlotIndex++) {
    ultimateScore = Math.max(ultimateScore, stateTable[numRows - 1][numCols - 1][stateSlotIndex]);
  }

  // Print the final calculated maximum score to the console.
  console.log(ultimateScore);
}

// Invoke the main processing function, reading input from the standard input stream.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));