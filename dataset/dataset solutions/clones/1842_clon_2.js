function ProcessGridData(rawData) {
  // Prepare input data by trimming whitespace and splitting into lines.
  rawData = rawData.trim().split("\n");

  // Parse the grid size from the first line of input.
  let gridSize = parseInt(rawData[0], 10);

  // Parse the permutation sequence from the second line, converting strings to numbers.
  let permutationSequence = rawData[1].split(" ").map((valStr) => parseInt(valStr, 10));

  // Initialize a 2D array to represent the grid's current state.
  let gridState = new Array(gridSize);
  // Initialize a counter for positions that meet the "unfavorable" criteria.
  let unfavorableCount = 0;

  // Populate the outer array with inner arrays to form a square grid.
  for (let rowInit = 0; rowInit < gridSize; rowInit++) {
    gridState[rowInit] = new Array(gridSize);
  }

  // Create a map to store the 1-based [row, column] coordinates for each cell value.
  const positionMap = {};

  // First pass: Initialize the grid with sequential numbers and build the coordinate lookup map.
  for (let rowIdx = 1; rowIdx <= gridSize; rowIdx++) {
    for (let colIdx = 1; colIdx <= gridSize; colIdx++) {
      // Calculate the unique sequential number for the current cell (1-based).
      let cellValue = (rowIdx - 1) * gridSize + 1 + (colIdx - 1);
      // Assign this calculated value to the grid at its 0-based index.
      gridState[rowIdx - 1][colIdx - 1] = cellValue;
      // Convert the cell value to a string to use as a key in the map.
      let cellKey = cellValue.toString(10);
      // Store the 1-based coordinates associated with this cell value.
      positionMap[cellKey] = [rowIdx, colIdx];
    }
  }

  // Second pass: Process the permutation sequence to determine the unfavorable count.
  for (let rowIdx = 1; rowIdx <= gridSize; rowIdx++) {
    for (let colIdx = 1; colIdx <= gridSize; colIdx++) {
      // Calculate the 0-based index into the permutation sequence array.
      let arrayIndex = (rowIdx - 1) * gridSize + (colIdx - 1);
      // Get the current value from the permutation sequence.
      let currentPermutationValue = permutationSequence[arrayIndex];

      // Use the position map to find the 1-based grid coordinates for this value.
      let targetRow = positionMap[currentPermutationValue][0];
      let targetCol = positionMap[currentPermutationValue][1];

      // Mark the cell at the target coordinates as "removed" or "empty" by setting its value to 0.
      gridState[targetRow - 1][targetCol - 1] = 0;

      // Check if the current cell is located on any of the grid's borders.
      if (targetRow === 1 || targetCol === 1 || targetRow === gridSize || targetCol === gridSize) {
        // Border cells do not contribute to the unfavorable count in this specific logic.
        unfavorableCount += 0; // Explicitly adding zero, which has no effect but maintains structure.
        continue; // Skip further calculations for border cells and move to the next iteration.
      } else {
        // Initialize counters for non-zero cells in the four cardinal directions.
        let countLeft = 0;
        let countRight = 0;
        let countUp = 0;
        let countDown = 0;

        // Count non-zero cells to the left (decreasing row index, same column).
        for (let scanRowUp = targetRow - 1; scanRowUp > 0; scanRowUp--) {
          if (gridState[scanRowUp - 1][targetCol - 1] !== 0) {
            countLeft++;
          }
        }
        // Count non-zero cells to the right (increasing row index, same column).
        for (let scanRowDown = targetRow + 1; scanRowDown <= gridSize; scanRowDown++) {
          if (gridState[scanRowDown - 1][targetCol - 1] !== 0) {
            countRight++;
          }
        }
        // Count non-zero cells upwards (decreasing column index, same row).
        for (let scanColLeft = targetCol - 1; scanColLeft > 0; scanColLeft--) {
          if (gridState[targetRow - 1][scanColLeft - 1] !== 0) {
            countUp++;
          }
        }
        // Count non-zero cells downwards (increasing column index, same row).
        for (let scanColRight = targetCol + 1; scanColRight <= gridSize; scanColRight++) {
          if (gridState[targetRow - 1][scanColRight - 1] !== 0) {
            countDown++;
          }
        }
        // Add the minimum count among the four directions to the total unfavorable count.
        unfavorableCount += Math.min(countLeft, countRight, countUp, countDown);
      }
    }
  }

  // Output the final calculated total of unfavorable positions.
  console.log(unfavorableCount);
}

// Read input from standard input and pass it to the main processing function.
ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
