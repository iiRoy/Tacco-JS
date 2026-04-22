// Function to process grid data and compute the maximum collectible value.
function processGridData(rawInputData) {
  // Clean and segment the raw input string into individual lines.
  const inputLineSegments = rawInputData.trim().split("\n");

  // A utility function to safely parse numerical parameters from a string line.
  const extractNumericParameters = (lineOfText) => {
    const numericParts = lineOfText.split(" ").map(Number);
    // Perform basic validation to ensure we have three valid numbers.
    if (numericParts.length !== 3 || numericParts.some(isNaN)) {
      console.error("Data parsing error: Expected three valid numbers for grid dimensions.");
      // Return default/invalid values to trigger early exit or error handling.
      return { rows: 0, columns: 0, itemQuantity: 0 };
    }
    return { rows: numericParts[0], columns: numericParts[1], itemQuantity: numericParts[2] };
  };

  // Extract the grid dimensions and total item count from the very first line.
  const {
    rows: gridHeight,
    columns: gridWidth,
    itemQuantity: totalItemCount
  } = extractNumericParameters(inputLineSegments.shift());

  // Implement an early exit if the grid dimensions are non-positive, as no path can exist.
  if (gridHeight <= 0 || gridWidth <= 0) {
    console.log(0); // Output 0 since no items can be collected on an invalid grid.
    return;
  }

  // Process the remaining lines to get details of each collectible item.
  const itemPlacementDetails = inputLineSegments.map((itemLine) => {
    const itemData = itemLine.split(" ").map(Number);
    // Validate each item detail line.
    if (itemData.length !== 3 || itemData.some(isNaN)) {
      console.warn(`Warning: Malformed item data line detected: "${itemLine}". This entry will be skipped.`);
      return null; // Mark invalid entries for removal.
    }
    return { itemRowCoord: itemData[0], itemColCoord: itemData[1], itemValue: itemData[2] };
  }).filter(Boolean); // Filter out any null entries resulting from malformed data.

  // Initialize a sparse 2D array (map) to store item values at specific grid coordinates.
  // This map will be indexed as `itemValuesGrid[row][col]`.
  const itemValuesGrid = [];

  // Populate the item values grid using the parsed item placement details.
  for (const itemEntry of itemPlacementDetails) {
    const { itemRowCoord, itemColCoord, itemValue } = itemEntry;
    // Adjust coordinates to be 0-indexed for array access.
    const zeroIndexedRow = itemRowCoord - 1;
    const zeroIndexedCol = itemColCoord - 1;

    // Perform boundary checks for item placement to prevent out-of-bounds access.
    if (zeroIndexedRow < 0 || zeroIndexedRow >= gridHeight || zeroIndexedCol < 0 || zeroIndexedCol >= gridWidth) {
      console.warn(`Warning: Item specified at (${itemRowCoord}, ${itemColCoord}) is outside the defined grid boundaries. Skipping this item.`);
      continue; // Skip this item and proceed to the next.
    }

    // Ensure the row array exists before attempting to assign a value to a column.
    if (!itemValuesGrid[zeroIndexedRow]) {
      itemValuesGrid[zeroIndexedRow] = [];
    }
    itemValuesGrid[zeroIndexedRow][zeroIndexedCol] = itemValue;
  }

  // Define the number of states for items collected within a single cell.
  // The problem implies collecting up to 3 items, so states are 0, 1, 2, 3.
  const POSSIBL_COLLECTION_STATES = 4;

  // Initialize the dynamic programming (DP) table to store maximum scores.
  // The table dimensions are (gridHeight + 1) x (gridWidth + 1) x POSSIBL_COLLECTION_STATES.
  // Adding +1 to height and width simplifies boundary conditions for transitions.
  const dpMemoTable = Array.from({ length: gridHeight + 1 }, () =>
    Array.from({ length: gridWidth + 1 }, () =>
      Array(POSSIBL_COLLECTION_STATES).fill(0) // All scores are initialized to zero.
    )
  );

  // Iterate through each cell of the grid to compute the maximum scores.
  for (let currentGridRow = 0; currentGridRow < gridHeight; currentGridRow++) {
    for (let currentGridCol = 0; currentGridCol < gridWidth; currentGridCol++) {
      // Determine the value of any item present at the current cell.
      // Defaults to 0 if no item or if the cell is uninitialized in itemValuesGrid.
      const currentCellItemValue = (itemValuesGrid[currentGridRow] && itemValuesGrid[currentGridRow][currentGridCol]) || 0;

      // Stage 1: Update scores by considering collecting an item at the current cell.
      // This loop processes states from higher collected counts down to lower,
      // ensuring that we use the score from 'k' items collected *before* adding the current item.
      for (let priorCollectedCount = POSSIBL_COLLECTION_STATES - 2; priorCollectedCount >= 0; priorCollectedCount--) {
          const newCollectedCount = priorCollectedCount + 1; // Represents collecting one more item.
          const scoreWithCurrentItem = dpMemoTable[currentGridRow][currentGridCol][priorCollectedCount] + currentCellItemValue;
          dpMemoTable[currentGridRow][currentGridCol][newCollectedCount] = Math.max(
              dpMemoTable[currentGridRow][currentGridCol][newCollectedCount],
              scoreWithCurrentItem
          );
      }

      // Stage 2: Propagate the calculated scores from the current cell to adjacent cells.
      // This includes moving downwards and moving rightwards.
      for (let currentCollectedStateIndex = 0; currentCollectedStateIndex < POSSIBL_COLLECTION_STATES; currentCollectedStateIndex++) {
        const currentCellScore = dpMemoTable[currentGridRow][currentGridCol][currentCollectedStateIndex];

        // Propagate score to the cell directly below.
        // When moving to a new cell (down), the collected item count for the new cell resets to 0.
        if (currentGridRow + 1 < gridHeight + 1) { // Ensure next row is within bounds.
            dpMemoTable[currentGridRow + 1][currentGridCol][0] = Math.max(
                dpMemoTable[currentGridRow + 1][currentGridCol][0],
                currentCellScore
            );
        }

        // Propagate score to the cell directly to the right.
        // When moving to a new cell (right), the collected item count is maintained.
        if (currentGridCol + 1 < gridWidth + 1) { // Ensure next column is within bounds.
            dpMemoTable[currentGridRow][currentGridCol + 1][currentCollectedStateIndex] = Math.max(
                dpMemoTable[currentGridRow][currentGridCol + 1][currentCollectedStateIndex],
                currentCellScore
            );
        }
      }
    }
  }

  // After the DP table is fully populated, find the highest score achievable at the destination cell.
  let highestAchievedScore = 0;
  const finalRowIndex = gridHeight - 1;
  const finalColIndex = gridWidth - 1;

  // Examine all possible collected states at the bottom-rightmost cell.
  for (let stateIdx = 0; stateIdx < POSSIBL_COLLECTION_STATES; stateIdx++) {
    const scoreAtFinalCellState = dpMemoTable[finalRowIndex][finalColIndex][stateIdx];
    highestAchievedScore = Math.max(highestAchievedScore, scoreAtFinalCellState);
  }

  // Output the ultimate maximum score found.
  console.log(highestAchievedScore);
}

// Entry point for execution: Read input from standard input and pass to the main processing function.
// This setup is common in competitive programming environments.
processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));