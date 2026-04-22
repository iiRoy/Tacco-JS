function checkGridCompletion(currentGridState) {
  // Verifies if the entire grid has been filled with colored cells ('#').
  // Returns true if all cells are '#', false otherwise.

  // Early exit for empty or malformed grids
  if (!currentGridState || currentGridState.length === 0 || !currentGridState[0]) {
    return true; // An empty grid is vacuously considered complete
  }

  // Iterate over each row to quickly find any uncolored cells ('.')
  for (const row of currentGridState) {
    if (row.includes('.')) {
      return false; // Found an uncolored cell, grid is not complete
    }
  }

  // If no uncolored cells were found after checking all rows, the grid is complete.
  return true;
}

function expandColoredRegions(matrixConfiguration, activeColoredSpots) {
  // Expands the colored regions in the grid by converting adjacent uncolored cells ('.') to colored cells ('#').
  // Takes the current grid state and a list of currently colored cell coordinates.
  // Returns a new list of coordinates that were newly colored in this expansion step.

  const newlyMarkedCells = [];
  const totalRows = matrixConfiguration.length;
  const totalCols = matrixConfiguration[0] ? matrixConfiguration[0].length : 0;

  // Define relative offsets for checking 4-directional neighbors (up, down, left, right)
  const rowOffsets = [-1, 1, 0, 0];
  const colOffsets = [0, 0, -1, 1];

  // Helper lambda to check if a given coordinate is within the grid boundaries
  const isValidPosition = (r, c) => r >= 0 && r < totalRows && c >= 0 && c < totalCols;

  activeColoredSpots.forEach(cellLocation => {
    const currentCellRow = cellLocation[0];
    const currentCellCol = cellLocation[1];

    // Optimization: If a colored cell is already surrounded by other colored cells,
    // it cannot contribute to further expansion from its position.
    // This avoids redundant checks for cells deep within an already expanded region.
    let isFullyEnclosed = true;
    for (let i = 0; i < 4; i++) {
      const neighborRow = currentCellRow + rowOffsets[i];
      const neighborCol = currentCellCol + colOffsets[i];

      if (isValidPosition(neighborRow, neighborCol) && matrixConfiguration[neighborRow][neighborCol] === '.') {
        isFullyEnclosed = false; // Found an uncolored neighbor
        break;
      }
    }
    if (isFullyEnclosed) {
      return; // Skip this cell as it cannot expand further
    }

    // Attempt to color adjacent uncolored cells
    for (let i = 0; i < 4; i++) {
      const neighborRow = currentCellRow + rowOffsets[i];
      const neighborCol = currentCellCol + colOffsets[i];

      // Check if the neighbor is within bounds and is currently uncolored
      if (isValidPosition(neighborRow, neighborCol) && matrixConfiguration[neighborRow][neighborCol] === '.') {
        matrixConfiguration[neighborRow][neighborCol] = '#'; // Change '.' to '#' in the grid
        newlyMarkedCells.push([neighborRow, neighborCol]); // Add to the list of newly colored cells
      }
    }
  });

  return newlyMarkedCells;
}

function retrieveColoredCellCoordinates(inputMatrix) {
  // Scans the input grid and returns a list of coordinates [row, col] for all '#' cells.

  // Input validation for robustness
  if (!inputMatrix || inputMatrix.length === 0 || !inputMatrix[0] || inputMatrix[0].length === 0) {
    return []; // Return empty array for invalid or empty grids
  }

  const markedPositions = [];

  // Use nested forEach loops for clear iteration
  inputMatrix.forEach((rowEntry, rowIndex) => {
    rowEntry.forEach((cellContent, colIndex) => {
      if (cellContent === '#') {
        markedPositions.push([rowIndex, colIndex]); // Store coordinates of colored cells
      }
    });
  });
  return markedPositions;
}

function processGridExpansion(sourceDataString) {
  // Main function orchestrating the grid expansion simulation.
  // Parses input, initializes the grid, and calculates the number of steps
  // required to fully color the grid, or a special distance for a single initial cell.

  // Robust input validation
  if (typeof sourceDataString !== 'string' || sourceDataString.trim() === '') {
    return null; // Indicate an issue with input
  }

  const parsedLines = sourceDataString.trim().split('\n');

  // Ensure there's at least one line for dimensions
  if (parsedLines.length < 1) {
    return null;
  }

  // Extract grid dimensions (Height and Width)
  const [gridHeight, gridWidth] = parsedLines[0].split(' ').map(Number);

  // Validate parsed dimensions
  if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
    return null;
  }

  const gridConfiguration = [];
  // Populate the grid matrix from the input lines
  for (let r = 0; r < gridHeight; r++) {
    const currentLineIndex = 1 + r;
    if (parsedLines[currentLineIndex]) {
      gridConfiguration.push(parsedLines[currentLineIndex].split(''));
    } else {
      return null; // Mismatch between declared height and actual input lines
    }
  }

  let expansionStepCount = 0;
  let currentlyActiveCells = retrieveColoredCellCoordinates(gridConfiguration);

  // Special case handling: If only one cell is initially colored
  if (currentlyActiveCells.length === 1) {
    const initialCell = currentlyActiveCells[0];
    const initialRow = initialCell[0];
    const initialCol = initialCell[1];

    // Calculate maximum Manhattan distance from this single cell to any boundary
    const maxRowDistance = Math.max(initialRow, gridHeight - 1 - initialRow);
    const maxColDistance = Math.max(initialCol, gridWidth - 1 - initialCol);

    return maxRowDistance + maxColDistance; // Return this specific calculation
  }

  // Main simulation loop: continue expanding until the grid is fully colored
  while (!checkGridCompletion(gridConfiguration)) {
    const newlyAffectedCells = expandColoredRegions(gridConfiguration, currentlyActiveCells);

    // Safety break: if no new cells are colored in a step, but the grid isn't complete,
    // it implies an unreachable state or an error in logic, preventing infinite loops.
    if (newlyAffectedCells.length === 0) {
      break;
    }

    currentlyActiveCells = newlyAffectedCells; // Update active cells for the next iteration
    expansionStepCount++;
  }

  return expansionStepCount; // Return the total number of expansion steps
}

// Self-executing anonymous function to handle input/output and execution flow
(function executeGridProcessor() {
  // Check for Node.js environment to handle file system operations
  if (typeof require !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    const fileSystemModule = require('fs');
    try {
      const inputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
      const finalComputedResult = processGridExpansion(inputBuffer);
      // Output the result to standard output
      if (finalComputedResult !== null) {
        console.log(finalComputedResult);
      } else {
        // console.error("Processing failed due to invalid input or unexpected state.");
        // For Type III, we just silently fail or return nothing if an error occurs.
      }
    } catch (error) {
      // console.error("Error reading input or during processing:", error.message);
    }
  }
})();