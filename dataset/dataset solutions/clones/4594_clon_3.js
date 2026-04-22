const parseInteger = (inputString) => {
  // Validate input to ensure it's a string and not empty after trimming
  if (typeof inputString !== 'string' || inputString.trim() === '') {
    // Return NaN or throw an error for invalid input, depending on desired robustness
    return NaN;
  }
  // Use Number.parseInt with radix 10 for explicit integer parsing
  return Number.parseInt(inputString.trim(), 10);
};

// Main entry point for processing the grid data
function analyzeEscapePath(rawInputLines) {
  // --- Input Validation and Initialization ---

  // Guard clause for empty or invalid input array
  if (!Array.isArray(rawInputLines) || rawInputLines.length === 0) {
    console.error("Error: Provided input lines are empty or not an array.");
    return;
  }

  // Process the first line containing grid dimensions and path length constraint
  const initialParameters = rawInputLines[0].split(/\s+/).map(parseInteger);

  // Validate parsed initial parameters
  if (initialParameters.some(isNaN) || initialParameters.length < 3) {
    console.error("Error: Invalid grid dimensions or maximum path length in the first input line.");
    return;
  }

  const gridHeight = initialParameters[0];
  const gridWidth = initialParameters[1];
  const maxMoveDistance = initialParameters[2];

  // Further validate dimensions and maxMoveDistance
  if (gridHeight <= 0 || gridWidth <= 0) {
    console.error("Error: Grid dimensions must be positive integers.");
    return;
  }
  if (maxMoveDistance < 0) { // maxMoveDistance can be 0, meaning no moves allowed
    console.error("Error: Maximum move distance cannot be negative.");
    return;
  }

  // Initialize the grid structure for path tracking
  // We slice from the second line (index 1) up to the expected grid height
  const pathExplorationGrid = rawInputLines.slice(1, gridHeight + 1).map((lineContent, rowIndex) => {
    const trimmedLine = lineContent.trim();
    // Convert string to an array of characters
    const rowCharacters = Array.from(trimmedLine);

    // Validate if the row length matches the declared grid width
    if (rowCharacters.length !== gridWidth) {
      console.warn(`Warning: Row ${rowIndex + 1} has an unexpected length (${rowCharacters.length}). Expected ${gridWidth}. It will be adjusted.`);
      // Adjust row: truncate if too long, pad with '.' if too short
      return rowCharacters.slice(0, gridWidth).concat(Array(Math.max(0, gridWidth - rowCharacters.length)).fill('.'));
    }
    return rowCharacters;
  });

  // Final check on the number of rows processed
  if (pathExplorationGrid.length !== gridHeight) {
    console.error(`Error: Mismatch in actual number of grid rows (${pathExplorationGrid.length}) versus declared height (${gridHeight}).`);
    return;
  }

  // --- Locate Starting Position ---

  let startCoordinates = null;
  let startFoundFlag = false; // Using a flag instead of an 'outer' label

  for (let r = 0; r < gridHeight && !startFoundFlag; r++) {
    for (let c = 0; c < gridWidth; c++) {
      if (pathExplorationGrid[r][c] === 'S') {
        startCoordinates = [r, c];
        startFoundFlag = true;
        break; // Exit inner loop
      }
    }
  }

  // Guard if the starting point 'S' is not found
  if (!startCoordinates) {
    console.error("Error: Starting position 'S' character not found within the grid.");
    return;
  }

  // --- Path Exploration (DFS-like) ---

  // Helper function to check if coordinates are within grid boundaries
  const isCoordinateValid = (row, col) => row >= 0 && row < gridHeight && col >= 0 && col < gridWidth;

  // Define possible movement directions (up, down, left, right)
  const MOVEMENT_VECTORS = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1]   // Right
  ];

  // Recursive function to map reachable cells with their minimum step count
  function traceReachablePaths(currentRow, currentCol, currentSteps) {
    // Base case 1: If current path exceeds the maximum allowed move distance
    if (currentSteps > maxMoveDistance) {
      return;
    }

    // Base case 2: If current coordinates are outside the grid
    if (!isCoordinateValid(currentRow, currentCol)) {
      return;
    }

    const currentCellContent = pathExplorationGrid[currentRow][currentCol];

    // Determine if this cell can be updated with the current step count
    // Conditions:
    // 1. It's an empty cell ('.')
    // 2. It's the starting cell ('S') - allowing re-visitation to find new paths
    // 3. It's a previously visited cell (a number), but the current path 'currentSteps' is shorter
    const shouldUpdateCell = (
      currentCellContent === '.' ||
      currentCellContent === 'S' ||
      (Number.isFinite(currentCellContent) && currentCellContent > currentSteps)
    );

    if (shouldUpdateCell) {
      // Mark the cell with the current minimum steps to reach it
      pathExplorationGrid[currentRow][currentCol] = currentSteps;

      // Recursively explore all four neighboring cells
      for (const [deltaRow, deltaCol] of MOVEMENT_VECTORS) {
        traceReachablePaths(currentRow + deltaRow, currentCol + deltaCol, currentSteps + 1);
      }
    }
  }

  // Start the path tracing from the identified starting position
  traceReachablePaths(startCoordinates[0], startCoordinates[1], 0);

  // --- Calculate Minimum Escape Cost ---

  // Helper function to find the shortest distance from a cell to any grid border
  function calculateNearestBorderDistance(rCoord, cCoord) {
    const distanceToTop = rCoord;
    const distanceToBottom = gridHeight - 1 - rCoord;
    const distanceToLeft = cCoord;
    const distanceToRight = gridWidth - 1 - cCoord;

    return Math.min(distanceToTop, distanceToBottom, distanceToLeft, distanceToRight);
  }

  let overallShortestEscapeCost = Number.POSITIVE_INFINITY;
  let earlyExitTriggered = false; // Flag to replace 'outer' label for early loop termination

  // Iterate through the entire grid to find the minimum escape cost
  for (let rIndex = 0; rIndex < gridHeight && !earlyExitTriggered; rIndex++) {
    for (let cIndex = 0; cIndex < gridWidth; cIndex++) {
      const cellValue = pathExplorationGrid[rIndex][cIndex];

      // Only consider cells that were successfully reached by the path exploration (marked with a number)
      if (Number.isFinite(cellValue)) {
        const stepsToReachThisCell = cellValue; // This is the 'i' from traceReachablePaths

        // Calculate the minimum steps from this cell to any border
        const stepsRequiredToBorder = calculateNearestBorderDistance(rIndex, cIndex);

        // If a reachable cell is already on the border (stepsRequiredToBorder === 0)
        // The escape cost from this cell is 1 (just step out)
        if (stepsRequiredToBorder === 0) {
          overallShortestEscapeCost = 1;
          earlyExitTriggered = true; // Found the quickest escape possible
          break; // Exit inner loop
        }

        // Calculate the number of 'K-length jumps' needed to cross the border from this cell
        // Equivalent to Math.ceil(stepsRequiredToBorder / maxMoveDistance)
        let numberOfJumpsToExit;
        if (maxMoveDistance === 0) {
            // If K is 0, no jumps are possible unless already at the border (handled above)
            numberOfJumpsToExit = Number.POSITIVE_INFINITY;
        } else {
            numberOfJumpsToExit = Math.floor((stepsRequiredToBorder + maxMoveDistance - 1) / maxMoveDistance);
        }

        // The total escape cost from this cell is the number of jumps needed to exit, plus 1
        // (the '1' accounts for the initial move from the current cell onto the border area)
        const currentCellEscapeCost = numberOfJumpsToExit + 1;

        // Update the overall minimum escape cost
        overallShortestEscapeCost = Math.min(overallShortestEscapeCost, currentCellEscapeCost);
      }
    }
  }

  // --- Output Result ---

  // If overallShortestEscapeCost is still Infinity, it implies no escape path was found
  // within the given constraints. The problem statement usually implies a finite solution
  // or that Infinity is an acceptable representation of "no solution".
  console.log(overallShortestEscapeCost);
}

// --- Input Reading and Execution ---

try {
  // Read entire file content from standard input as UTF-8
  const fileContentBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
  // Split content by newline, then filter out any empty lines resulting from extra newlines
  const processedInputLines = fileContentBuffer.split('\n').filter(line => line.trim() !== '');

  // Execute the main analysis function
  analyzeEscapePath(processedInputLines);
} catch (error) {
  console.error("An error occurred during file reading or processing:", error.message);
  // Optionally, exit with an error code
  process.exit(1);
}