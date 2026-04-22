/* This function orchestrates the entire data processing and dynamic programming calculation.
   It takes raw input string, parses it, initializes data structures, and computes a final result. */
function ProcessInputData(rawData) {
  // Trim leading/trailing whitespace and split the input string into individual lines.
  rawData = rawData.trim().split('\n');

  // Extract grid dimensions (rows, columns) and number of special points from the first line.
  // Each element is parsed as an integer.
  const [rowCount, colCount, numPoints] = rawData.shift().split(' ').map((strElement) => parseInt(strElement, 10));

  // Parse subsequent lines to get details of each special point (row, column, value).
  const pointDetails = rawData.map((strElement) => strElement.split(' ').map((subElement) => parseInt(subElement, 10)));

  // Initialize a 2D array (dataGrid) to store values at specific coordinates.
  let dataGrid = [];
  // Initialize a 3D array (dynamicProgTable) for dynamic programming state.
  let dynamicProgTable = [];

  // Pre-allocate the dynamic programming table with a slightly larger size
  // than required by problem constraints (e.g., 3005x3005x4).
  for (let rowIdx = 0; rowIdx < 3005; ++rowIdx) {
    const innerArray = []; // Represents a row in the 2D plane of the DP table.
    for (let colIdx = 0; colIdx < 3005; ++colIdx) {
      innerArray.push(new Array(4)); // Each cell can hold 4 state values.
    }
    dynamicProgTable.push(innerArray);
  }

  // Populate the dataGrid with values from the special points.
  // Adjusting coordinates from 1-based to 0-based indexing.
  for (let pointIdx = 0; pointIdx < numPoints; ++pointIdx) {
    const [currentR, currentC, currentV] = pointDetails[pointIdx];
    // Ensure the row exists before accessing its elements.
    dataGrid[currentR - 1] = dataGrid[currentR - 1] || [];
    dataGrid[currentR - 1][currentC - 1] = currentV;
  }

  // Perform the dynamic programming calculations.
  // Iterate through each cell of the grid.
  for (let rowIdx = 0; rowIdx < rowCount; ++rowIdx) {
    for (let colIdx = 0; colCount > colIdx; ++colIdx) {
      // Step 1: Update current cell's states based on its own values.
      // This loop processes depth levels in descending order.
      for (let depthIdx = 2; depthIdx >= 0; --depthIdx) {
        // Calculate the value to add from the current cell in dataGrid, defaulting to 0 if undefined.
        const cellValue = (dataGrid[rowIdx] && dataGrid[rowIdx][colIdx]) || 0;
        // Update the next depth level state, taking the maximum of existing or current state + cell value.
        dynamicProgTable[rowIdx][colIdx][depthIdx + 1] = Math.max(
          dynamicProgTable[rowIdx][colIdx][depthIdx + 1] || 0,
          (dynamicProgTable[rowIdx][colIdx][depthIdx] || 0) + cellValue
        );
      }

      // Step 2: Propagate maximum values to adjacent cells (right and down).
      // This loop processes all 4 depth levels.
      for (let depthIdx = 0; depthIdx < 4; ++depthIdx) {
        // Propagate to the cell directly below.
        dynamicProgTable[rowIdx + 1][colIdx][0] = Math.max(
          dynamicProgTable[rowIdx + 1][colIdx][0] || 0,
          dynamicProgTable[rowIdx][colIdx][depthIdx] || 0
        );
        // Propagate to the cell directly to the right.
        dynamicProgTable[rowIdx][colIdx + 1][depthIdx] = Math.max(
          dynamicProgTable[rowIdx][colIdx + 1][depthIdx] || 0,
          dynamicProgTable[rowIdx][colIdx][depthIdx] || 0
        );
      }
    }
  }

  // Determine the final maximum outcome from the last cell in the DP table.
  let finalOutcome = 0;
  for (let depthIdx = 0; depthIdx < 4; ++depthIdx) {
    finalOutcome = Math.max(finalOutcome, dynamicProgTable[rowCount - 1][colCount - 1][depthIdx]);
  }

  // Output the computed final result.
  console.log(finalOutcome);
}

// Invoke the main processing function with input read from standard input.
ProcessInputData(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);