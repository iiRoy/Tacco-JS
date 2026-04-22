const inputSource = require('fs');

// Function to process the input and perform grid operations
function analyzeGridActivity(allContent) {
  // Parse input lines, keeping potential empty lines as they affect array length
  const rawLines = allContent.split('\n');

  // Initialize a 10x10 grid with all zeroes
  // Using an array of arrays for direct 2D representation
  const activityMatrix = Array.from({ length: 10 }, () => Array(10).fill(0));

  // Helper to safely increment a cell, respecting grid boundaries (0-9)
  const incrementCell = (gridRef, rowIdx, colIdx) => {
    if (rowIdx >= 0 && rowIdx < 10 && colIdx >= 0 && colIdx < 10) {
      gridRef[rowIdx][colIdx]++;
    }
  };

  // Define operation functions, simulating fall-through by calling preceding types
  const handleOperationType1 = (grid, xVal, yVal) => {
    incrementCell(grid, yVal + 1, xVal);
    incrementCell(grid, yVal, xVal - 1);
    incrementCell(grid, yVal, xVal);
    incrementCell(grid, yVal, xVal + 1);
    incrementCell(grid, yVal - 1, xVal);
  };

  const handleOperationType2 = (grid, xVal, yVal) => {
    handleOperationType1(grid, xVal, yVal); // Fall-through from type 1
    incrementCell(grid, yVal + 1, xVal - 1);
    incrementCell(grid, yVal + 1, xVal + 1);
    incrementCell(grid, yVal - 1, xVal - 1);
    incrementCell(grid, yVal - 1, xVal + 1);
  };

  const handleOperationType3 = (grid, xVal, yVal) => {
    handleOperationType2(grid, xVal, yVal); // Fall-through from type 2
    incrementCell(grid, yVal + 2, xVal);
    incrementCell(grid, yVal - 2, xVal);
    incrementCell(grid, yVal, xVal - 2);
    incrementCell(grid, yVal, xVal + 2);
  };

  // Map operation characters to their respective functions
  const operationDispatcher = {
    '1': handleOperationType1,
    '2': handleOperationType2,
    '3': handleOperationType3,
  };

  // Process input lines in reverse order, skipping the very last line
  // (Original loop processes indices from length-2 down to 0)
  for (let idx = rawLines.length - 2; idx >= 0; idx--) {
    const currentEntry = rawLines[idx];
    const horizontalCoord = Number(currentEntry[0]);
    const verticalCoord = Number(currentEntry[2]);
    const actionType = currentEntry[4];

    if (operationDispatcher[actionType]) {
      operationDispatcher[actionType](activityMatrix, horizontalCoord, verticalCoord);
    }
  }

  // Flatten the 2D grid into a 1D array for easier aggregation
  const allCellValues = activityMatrix.flatMap(row => row);

  // Calculate the number of cells that remained at zero
  const untouchedCells = allCellValues.filter(value => value === 0).length;

  // Find the maximum value in the grid
  const peakActivity = allCellValues.reduce((maximum, current) => Math.max(maximum, current), 0);

  // Output the results
  console.log(untouchedCells);
  console.log(peakActivity);
}

// Read all standard input synchronously
const completeStdin = inputSource.readFileSync('/dev/stdin', 'utf8');

// Initiate the grid analysis process
analyzeGridActivity(completeStdin);