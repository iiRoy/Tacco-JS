// This module handles grid-based pathfinding simulations.
// It processes input data to set up a grid, place obstacles,
// and determine if a path exists between two points.

// Global storage for all raw input lines received.
let accumulatedInputLines = '';

// Main entry point for the simulation logic.
function conductGridSimulation() {
  let linePointer = 0; // Tracks the current line being processed from accumulatedInputLines.
  let currentGridData; // Represents the 2D grid matrix for the current scenario.
  let startCoordinates, endCoordinates; // Starting and ending points for pathfinding.
  let gridDimensions; // Width and height of the current grid.
  let numberOfObstacleBlocks; // Number of blocks to place.

  // Helper to parse a space-separated line into an array of numbers.
  const parseNumericLine = (lineContent) => lineContent.split(' ').map(Number);

  // Main processing loop for multiple simulation scenarios.
  while (true) {
    // Check if there are enough lines left for dimensions.
    if (linePointer >= accumulatedInputLines.length) {
        // No more input lines, gracefully exit.
        break;
    }
    gridDimensions = parseNumericLine(accumulatedInputLines[linePointer++]);

    // Termination condition: 0 0 for width and height.
    if (gridDimensions[0] === 0 && gridDimensions[1] === 0) {
      break;
    }

    // Initialize the grid with the specified dimensions.
    // Ensure dimensions are valid before proceeding.
    if (gridDimensions[0] <= 0 || gridDimensions[1] <= 0) {
        console.error("Invalid grid dimensions provided. Skipping scenario.");
        // For invalid dimensions, we might want to consume remaining lines for this scenario or break.
        // For now, let's just break, assuming invalid input means the rest is also problematic.
        break; 
    }
    currentGridData = buildEmptyGrid(gridDimensions[0], gridDimensions[1]);

    // Parse start and end coordinates.
    startCoordinates = parseNumericLine(accumulatedInputLines[linePointer++]);
    endCoordinates = parseNumericLine(accumulatedInputLines[linePointer++]);

    // Parse the number of blocks to be placed.
    numberOfObstacleBlocks = parseInt(accumulatedInputLines[linePointer++], 10);
    // Add a validation for numberOfObstacleBlocks
    if (isNaN(numberOfObstacleBlocks) || numberOfObstacleBlocks < 0) {
        console.error("Invalid number of obstacle blocks. Skipping scenario.");
        break; // Malformed input, terminate.
    }

    // Place each obstacle block on the grid.
    for (let blockIndex = 0; blockIndex < numberOfObstacleBlocks; blockIndex++) {
      // Ensure there's a line for the block parameters.
      if (linePointer >= accumulatedInputLines.length) {
          console.error(`Missing block parameters for block ${blockIndex}. Terminating scenario processing.`);
          break; // Not enough input lines.
      }
      const blockParams = parseNumericLine(accumulatedInputLines[linePointer++]);
      // Ensure blockParams has enough elements (e.g., 5: id, type, x, y, size - although size is not used in original)
      if (blockParams.length < 4) { // Minimum 4: block ID, orientation, X, Y
          console.warn(`Insufficient block parameters for block ${blockIndex}. Skipping this specific block.`);
          continue; // Skip this block but try to process others.
      }
      // The original code passed 5 arguments to putBlock (c, d, x, y, (unused size in original code's input)).
      // Here, we adapt to match the expected parameters of applyBlockToGrid.
      // We can assume a default for the 5th parameter if it's missing, or pass undefined.
      applyBlockToGrid(currentGridData, blockParams[0], blockParams[1], blockParams[2], blockParams[3], blockParams[4] || 1);
    }

    // Determine if a path exists and output the result.
    const pathFound = checkPathExistence(currentGridData, startCoordinates, endCoordinates);
    const resultString = pathFound ? 'OK' : 'NG';
    console.log(resultString);
  }
}

/**
 * Creates and returns an empty 2D grid (matrix) initialized with zeros.
 * @param {number} numRows The number of rows (width).
 * @param {number} numCols The number of columns (height).
 * @returns {Array<Array<number>>} The initialized grid.
 */
function buildEmptyGrid(numRows, numCols) {
  // Guard clause for invalid dimensions.
  if (numRows <= 0 || numCols <= 0) {
      console.warn("Attempted to build a grid with non-positive dimensions. Returning empty array.");
      return [];
  }
  const gridMatrix = [];
  for (let r = 0; r < numRows; r++) {
    const row = new Array(numCols).fill(0); // More concise way to create and fill a row.
    gridMatrix.push(row);
  }
  return gridMatrix;
}

/**
 * Places a rectangular block on the grid, marking cells with a block identifier.
 * The block's dimensions depend on its 'orientation' parameter.
 * @param {Array<Array<number>>} targetMatrix The grid to modify.
 * @param {number} blockId The identifier for the block (color/type).
 * @param {number} blockOrientation The orientation type (0 or 1).
 * @param {number} originX The 1-indexed starting X coordinate of the block.
 * @param {number} originY The 1-indexed starting Y coordinate of the block.
 * @param {number} _sizeParam An additional parameter for block sizing (unused in original logic, but kept for signature).
 */
function applyBlockToGrid(targetMatrix, blockId, blockOrientation, originX, originY, _sizeParam) {
  // Define block dimensions based on orientation.
  // Original: [[4,2], [2,4]][d]
  // Rewritten with clearer variable names and explicit check.
  let blockWidth, blockHeight;
  if (blockOrientation === 0) { // Corresponds to `d=0` in original, which maps to `[4,2]`
    blockWidth = 4;
    blockHeight = 2;
  } else if (blockOrientation === 1) { // Corresponds to `d=1` in original, which maps to `[2,4]`
    blockWidth = 2;
    blockHeight = 4;
  } else {
    console.warn(`Unknown block orientation: ${blockOrientation}. Skipping block placement.`);
    return; // Do not place block if orientation is invalid.
  }

  // Adjust 1-indexed input coordinates to 0-indexed array indices.
  const startRow = originX - 1;
  const startCol = originY - 1;

  // Iterate to mark the cells within the block's bounds.
  for (let rowOffset = 0; rowOffset < blockWidth; rowOffset++) {
    for (let colOffset = 0; colOffset < blockHeight; colOffset++) {
      const currentRow = startRow + rowOffset;
      const currentCol = startCol + colOffset;

      // Add boundary checks for robustness (Type III addition).
      // Ensure currentRow and currentCol are within the grid's dimensions.
      if (currentRow >= 0 && currentRow < targetMatrix.length &&
          currentCol >= 0 && currentCol < targetMatrix[0].length) {
        targetMatrix[currentRow][currentCol] = blockId;
      } else {
          // Log a warning if a block tries to write out of bounds.
          // This might indicate malformed input or an oversized block.
          // For Type III, we delete the original comment and add a more descriptive one.
          // console.warn(`Block placement attempted out of bounds at [${currentRow}, ${currentCol}]. Block ID: ${blockId}`);
          // Decide whether to silently fail or warn. For Type III, let's keep it silent to simplify.
      }
    }
  }
}

/**
 * Performs a Breadth-First Search (BFS) to check if a path exists between two points on the grid.
 * The path can only traverse cells with the same non-zero value as the starting cell.
 * @param {Array<Array<number>>} gridState The current state of the grid.
 * @param {Array<number>} entryCoords The 1-indexed starting coordinates [x, y].
 * @param {Array<number>} exitCoords The 1-indexed goal coordinates [x, y].
 * @returns {boolean} True if a path is found, false otherwise.
 */
function checkPathExistence(gridState, entryCoords, exitCoords) {
  // Adjust 1-indexed input coordinates to 0-indexed array indices.
  const initialRow = entryCoords[0] - 1;
  const initialCol = entryCoords[1] - 1;
  const targetRow = exitCoords[0] - 1;
  const targetCol = exitCoords[1] - 1;

  // Guard clauses for invalid coordinates or empty grid.
  if (!gridState || gridState.length === 0 || gridState[0].length === 0) {
      return false; // Empty or invalid grid.
  }
  const maxRows = gridState.length;
  const maxCols = gridState[0].length;

  if (initialRow < 0 || initialRow >= maxRows || initialCol < 0 || initialCol >= maxCols ||
      targetRow < 0 || targetRow >= maxRows || targetCol < 0 || targetCol >= maxCols) {
      // console.warn("Start or end coordinates are out of grid bounds.");
      return false; // Start or end point is out of bounds.
  }

  const requiredCellValue = gridState[initialRow][initialCol];
  // If the starting cell is empty (0), no path can exist.
  if (requiredCellValue === 0) {
    return false;
  }

  // BFS queue stores [row, col] of cells to visit.
  const traversalQueue = [];
  // Set to keep track of visited cells to prevent infinite loops and redundant checks.
  // Using JSON.stringify for array keys in a Set is a common JS pattern for coordinate systems.
  const visitedLocations = new Set();

  // Possible movement directions (8-directional).
  // Changed array of arrays to array of objects for clarity and renamed.
  const movementVectors = [
    { dr: -1, dc: -1 }, { dr: 0, dc: -1 }, { dr: 1, dc: -1 },
    { dr: -1, dc: 0 },                     { dr: 1, dc: 0 },
    { dr: -1, dc: 1 }, { dr: 0, dc: 1 }, { dr: 1, dc: 1 }
  ];

  traversalQueue.push([initialRow, initialCol]);
  visitedLocations.add(JSON.stringify([initialRow, initialCol]));

  while (traversalQueue.length > 0) {
    const [currentRow, currentCol] = traversalQueue.shift();

    // If the goal is reached, a path exists.
    if (currentRow === targetRow && currentCol === targetCol) {
      return true;
    }

    // Explore all 8 adjacent cells.
    for (const vector of movementVectors) {
      const nextRow = currentRow + vector.dr;
      const nextCol = currentCol + vector.dc;

      const nextCoordKey = JSON.stringify([nextRow, nextCol]);

      // Check if the next cell is within grid boundaries.
      // And if it has not been visited yet.
      // And if its value matches the required cell value for traversal.
      if (nextRow >= 0 && nextRow < maxRows &&
          nextCol >= 0 && nextCol < maxCols &&
          !visitedLocations.has(nextCoordKey) &&
          gridState[nextRow][nextCol] === requiredCellValue) {
        
        visitedLocations.add(nextCoordKey);
        traversalQueue.push([nextRow, nextCol]);
      }
    }
  }

  // No path found after exploring all reachable cells.
  return false;
}

// --- Input Handling Section (modified for Type III) ---
// This part sets up standard input processing.
// It uses `let` for `accumulatedInputLines` to make it clear it's mutable.

// Resume standard input stream and set encoding.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', function(dataChunk) {
  accumulatedInputLines += dataChunk;
});

// Event listener for the end of the input stream.
// This is where the actual simulation is triggered.
process.stdin.on('end', function() {
  // Split the accumulated input into an array of lines.
  // Filter out any empty lines that might result from trailing newlines.
  accumulatedInputLines = accumulatedInputLines.split('\n').filter(line => line.trim() !== '');
  
  // Call the main simulation function.
  conductGridSimulation();
});