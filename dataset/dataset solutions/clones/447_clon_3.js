// This module is designed to process sequential input data, interpreting it as a series of grid configurations
// for pathfinding problems. It calculates the total number of distinct paths based on specific rules
// defined by the values within the grid cells.

let dataAccumulator = ''; // Stores all incoming standard input data as a single string.
let currentLineIndex = 0; // Tracks the current line being processed from the parsed input array.

/**
 * Retrieves the next non-empty line from the buffered input data.
 * This function increments an internal line counter with each call.
 * @returns {string} The next line of input data. Returns an empty string if no more lines are available.
 */
function extractNextInputLine() {
  if (currentLineIndex >= dataAccumulator.length) {
    return ''; // No more lines to process.
  }
  return dataAccumulator[currentLineIndex++];
}

/**
 * Safely retrieves a path count for a given coordinate key from the path accumulation map.
 * If the key does not exist, it defaults to 0, preventing `undefined` in calculations.
 * @param {Map<string, number>} pathMap The map holding path counts, keyed by "col,row" strings.
 * @param {string} coordKey The string key representing the cell coordinates (e.g., "3,5").
 * @returns {number} The path count associated with the key, or 0 if the key is not found.
 */
function retrievePathCountSafely(pathMap, coordKey) {
  return pathMap.get(coordKey) || 0;
}

/**
 * The primary function that orchestrates the processing of grid path data.
 * It reads grid dimensions and cell values, then calculates and sums paths
 * according to predefined propagation rules for different cell types.
 */
function processGridPathCalculations() {
  let currentGridDimensions; // Stores the width and height of the current grid.
  let currentGridCells;      // An array of arrays representing the grid's cell types.
  let pathCountRegistry = new Map(); // A map to store calculated path counts for each cell (keyed as "col,row").
  let overallPathSum;        // The final sum of paths for the current grid configuration.
  const BLOCKING_CELL_TYPE = 2; // Constant representing a cell type that blocks diagonal movement but allows jumping.

  // The main processing loop continues indefinitely until a specific termination condition is met.
  while (true) {
    const dimensionInputLine = extractNextInputLine();
    if (!dimensionInputLine) { // Break if no more lines are available for dimensions.
      break;
    }
    // Parse the width and height from the current input line.
    currentGridDimensions = dimensionInputLine.split(' ').map(Number);

    const gridWidth = currentGridDimensions[0];  // The number of columns in the grid.
    const gridHeight = currentGridDimensions[1]; // The number of rows in the grid.

    // Termination condition: A grid with zero width and zero height signals the end of input.
    if (gridWidth === 0 && gridHeight === 0) {
      break;
    }

    // Initialize/reset data structures for the new grid.
    currentGridCells = [];
    pathCountRegistry = new Map();
    overallPathSum = 0;

    // Populate the grid cell data by reading subsequent lines.
    for (let rowIterator = 0; rowIterator < gridHeight; ++rowIterator) {
      const cellRowString = extractNextInputLine();
      if (!cellRowString) { // Guard against premature end of input.
        // In a robust application, error handling would go here. For this clone, we assume valid input.
        break;
      }
      currentGridCells.push(cellRowString.split(' ').map(Number));
    }

    // Append a dynamically generated padding row to the grid.
    // This row, filled with `BLOCKING_CELL_TYPE`, helps simplify boundary conditions
    // for path calculations that extend beyond the actual grid height, particularly for 'jump' paths.
    const dynamicallyPaddedRow = Array(gridWidth).fill(BLOCKING_CELL_TYPE);
    currentGridCells.push(dynamicallyPaddedRow);

    // Initialize path counts for the very first row of the grid.
    // Paths can only originate from cells of type 0 in the first row.
    for (let colIterator = 0; colIterator < gridWidth; ++colIterator) {
      const initialCellKey = `${colIterator},0`;
      pathCountRegistry.set(initialCellKey, currentGridCells[0][colIterator] === 0 ? 1 : 0);
    }

    // Iterate through each cell of the grid (excluding the padding row) to propagate path counts.
    for (let currentRowCoord = 0; currentRowCoord < gridHeight; ++currentRowCoord) {
      for (let currentColCoord = 0; currentColCoord < gridWidth; ++currentColCoord) {
        const currentCellIdentifier = `${currentColCoord},${currentRowCoord}`;
        const cellValue = currentGridCells[currentRowCoord][currentColCoord];
        let currentCellPathQuantity = retrievePathCountSafely(pathCountRegistry, currentCellIdentifier);

        // Optimization: If no paths lead to the current cell, there's no need to propagate from it.
        if (currentCellPathQuantity === 0) {
          continue;
        }

        // Apply path propagation rules based on the current cell's type.
        // This uses if-else if structure as a Type III variation from the original switch.
        if (cellValue === 0) {
          // Type 0 cell: Paths can move to (x-1, y+1), (x, y+1), and (x+1, y+1).
          const nextRowForType0 = currentRowCoord + 1;

          // Propagate to diagonally left (x-1, y+1).
          const prevCol = currentColCoord - 1;
          if (prevCol >= 0 && currentGridCells[nextRowForType0][prevCol] !== BLOCKING_CELL_TYPE) {
            const diagonalLeftKey = `${prevCol},${nextRowForType0}`;
            const existingPathCount = retrievePathCountSafely(pathCountRegistry, diagonalLeftKey);
            pathCountRegistry.set(diagonalLeftKey, existingPathCount + currentCellPathQuantity);
          }

          // Propagate straight down (x, y+1).
          const straightDownKey = `${currentColCoord},${nextRowForType0}`;
          const existingPathCountStraight = retrievePathCountSafely(pathCountRegistry, straightDownKey);
          pathCountRegistry.set(straightDownKey, existingPathCountStraight + currentCellPathQuantity);

          // Propagate to diagonally right (x+1, y+1).
          const nextCol = currentColCoord + 1;
          if (nextCol < gridWidth && currentGridCells[nextRowForType0][nextCol] !== BLOCKING_CELL_TYPE) {
            const diagonalRightKey = `${nextCol},${nextRowForType0}`;
            const existingPathCount = retrievePathCountSafely(pathCountRegistry, diagonalRightKey);
            pathCountRegistry.set(diagonalRightKey, existingPathCount + currentCellPathQuantity);
          }
        } else if (cellValue === 1) {
          // Type 1 cell: Paths terminate here; no further propagation from this cell.
          // This branch is explicitly kept even if empty to reflect the original logic's handling.
        } else if (cellValue === BLOCKING_CELL_TYPE) {
          // Type 2 cell (BLOCKING_CELL_TYPE): Paths jump two rows down directly below (x, y+2).
          const jumpTargetRow = currentRowCoord + 2;
          const jumpCellKey = `${currentColCoord},${jumpTargetRow}`;
          const existingPathCount = retrievePathCountSafely(pathCountRegistry, jumpCellKey);
          pathCountRegistry.set(jumpCellKey, existingPathCount + currentCellPathQuantity);
        }
        // No explicit handling for other cell values, assuming only 0, 1, 2 are valid.
      }
    }

    // Sum up the path counts for the final relevant rows.
    // This includes the last actual grid row (gridHeight) and the row immediately following it (gridHeight + 1).
    // The dynamicallyPaddedRow (at gridHeight index) and the row after it (gridHeight + 1) are critical here.
    for (let finalRowPosition = gridHeight; finalRowPosition <= gridHeight + 1; ++finalRowPosition) {
      for (let finalColPosition = 0; finalColPosition < gridWidth; ++finalColPosition) {
        const finalPositionKey = `${finalColPosition},${finalRowPosition}`;
        overallPathSum += retrievePathCountSafely(pathCountRegistry, finalPositionKey);
      }
    }

    // Output the calculated total path sum for the current grid scenario.
    console.log(overallPathSum);
  }
}

// --- Standard Input Stream Management ---

// Ensures the Node.js standard input stream remains open to receive data.
process.stdin.resume();
// Sets the encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for when data chunks are received from standard input.
process.stdin.on('data', function(incomingDataChunk) {
  // Appends the received data chunk to our global buffer.
  dataAccumulator += incomingDataChunk;
});

// Event listener for when the standard input stream has ended (no more data to receive).
process.stdin.on('end', function() {
  // Splits the accumulated data into an array of lines.
  // The filter ensures that any empty strings resulting from trailing newlines are removed.
  dataAccumulator = dataAccumulator.split('\n').filter(lineContent => lineContent.length > 0);
  // Once all input is collected and parsed into lines, initiate the main processing logic.
  processGridPathCalculations();
});