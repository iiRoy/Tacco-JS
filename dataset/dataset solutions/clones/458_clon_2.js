/*
 * This JavaScript program processes grid-based input
 * to determine if a path exists between a starting point
 * and a goal point, avoiding certain obstacles.
 * It reads grid dimensions, start/end coordinates,
 * and obstacle placements from standard input.
 */

let programInputBuffer = ''; // Buffer to accumulate input data

// Begin listening for incoming data from the standard input stream.
process.stdin.resume();

// Set the encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for when data chunks are received.
process.stdin.on('data', (inputDataPortion) => {
  // Append each incoming data chunk to the buffer.
  programInputBuffer += inputDataPortion;
});

// Event listener for when the input stream has ended.
process.stdin.on('end', () => {
  // Split the accumulated input into individual lines.
  programInputBuffer = programInputBuffer.split('\n');
  // Initiate the main simulation routine.
  executeSimulation();
});

/**
 * Main function to orchestrate the grid pathfinding simulation.
 * It reads multiple test cases from input and processes each one.
 */
function executeSimulation() {
  // Declare variables for managing input parsing and grid state.
  let lineIndex = 0; // Current line number being processed from input
  let loopCounter;   // Generic loop iterator
  let currentDimensions; // Stores width and height of the grid
  let entryCoord;        // Starting X, Y coordinates
  let finishCoord;       // Goal X, Y coordinates
  let obstacleCount;     // Number of obstacles to place on the grid
  let gameGrid;          // The 2D array representing the game board

  // Loop indefinitely until a termination condition is met (0 0 dimensions).
  while ( true ) {
    // Parse grid dimensions from the current input line.
    // The 'lineIndex' is incremented after use.
    currentDimensions = programInputBuffer[lineIndex++].split(' ').map(Number);

    // Check for the termination condition: both dimensions are zero.
    if (!currentDimensions[0] && !currentDimensions[1]) {
      break; // Exit the simulation loop.
    }
    
    // Initialize the game grid based on the parsed width and height.
    gameGrid = initializeGameMatrix(currentDimensions[0], currentDimensions[1]);
    
    // Parse the starting coordinates for the pathfinding.
    entryCoord = programInputBuffer[lineIndex++].split(' ').map(Number);
    // Parse the target coordinates for the pathfinding.
    finishCoord = programInputBuffer[lineIndex++].split(' ').map(Number);
    
    // Read the total number of obstacles to be placed.
    obstacleCount = Number(programInputBuffer[lineIndex++]);
    
    // Loop through and place each obstacle on the grid.
    for (loopCounter = 0; loopCounter < obstacleCount; loopCounter++) {
      // Parse obstacle details and apply them to the grid.
      // Using bind/apply to pass gameGrid as the first argument,
      // followed by the parsed numbers from the input line.
      placeGridObstacle.bind(null, gameGrid).apply(null, programInputBuffer[lineIndex++].split(' ').map(Number));
    }
    
    // Determine if a path exists from start to goal and print the result.
    console.log(verifyPathExists(gameGrid, entryCoord, finishCoord) ? 'OK' : 'NG');
  }
}


/**
 * Creates and initializes a new 2D matrix (grid) with all cells set to 0.
 * @param {number} gridWidth - The number of columns for the grid.
 * @param {number} gridHeight - The number of rows for the grid.
 * @returns {Array<Array<number>>} The newly created and initialized grid.
 */
function initializeGameMatrix(gridWidth, gridHeight) {
  let colIdx, rowIdx;      // Loop iterators for columns and rows.
  const newMatrix = [];    // The array to hold the grid rows.

  // Iterate through each column to create the grid structure.
  for (colIdx = 0; colIdx < gridWidth; colIdx++) {
    newMatrix.push([]); // Add a new empty row for the current column.
    // Iterate through each row within the current column to initialize cells.
    for (rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
      newMatrix[colIdx][rowIdx] = 0; // Set cell value to zero (empty).
    }
  }
  return newMatrix; // Return the fully initialized grid.
}


/**
 * Places a rectangular block (obstacle) onto the target grid.
 * The block's dimensions depend on its orientation.
 * @param {Array<Array<number>>} targetMatrix - The grid to modify.
 * @param {number} blockValue - The value to assign to the cells covered by the block.
 * @param {number} blockOrientation - Determines the block's shape (0 or 1).
 * @param {number} startCol - The 1-based starting column coordinate for placement.
 * @param {number} startRow - The 1-based starting row coordinate for placement.
 */
function placeGridObstacle(targetMatrix, blockValue, blockOrientation, startCol, startRow) {
  let currentColumn, currentRow; // Loop iterators for block dimensions.
  // Define block dimensions based on orientation: [[width, height] for orientation 0, [width, height] for orientation 1].
  const obstacleDimensions = [[4, 2], [2, 4]][blockOrientation];

  // Loop through the width of the obstacle.
  for (currentColumn = 0; currentColumn < obstacleDimensions[0]; currentColumn++) {
    // Loop through the height of the obstacle.
    for (currentRow = 0; currentRow < obstacleDimensions[1]; currentRow++) {
      // Assign the blockValue to the corresponding cell in the grid.
      // Coordinates are 1-based in input, so convert to 0-based.
      targetMatrix[startCol - 1 + currentColumn][startRow - 1 + currentRow] = blockValue;
    }
  }
}


/**
 * Performs a Breadth-First Search (BFS) to check if a path exists
 * from an initial cell to a target cell on the game matrix.
 * Path can only traverse cells with the same value as the starting cell.
 * @param {Array<Array<number>>} gameMatrix - The 2D grid representing the game board.
 * @param {Array<number>} initialCoords - The [x, y] 1-based starting coordinates.
 * @param {Array<number>} finalCoords - The [x, y] 1-based target coordinates.
 * @returns {boolean} True if a path is found, false otherwise.
 */
function verifyPathExists(gameMatrix, initialCoords, finalCoords) {
  const explorationQueue = []; // Queue for BFS traversal.
  // Defines all 8 possible movement directions (including diagonals).
  const movementVectors = [
    [-1, -1], [ 0, -1], [ 1, -1],
    [-1,  0],           [ 1,  0],
    [-1,  1], [ 0,  1], [ 1,  1]
  ];

  // Convert 1-based input coordinates to 0-based array indices.
  const initialX = initialCoords[0] - 1;
  const initialY = initialCoords[1] - 1;
  const targetX = finalCoords[0] - 1;
  const targetY = finalCoords[1] - 1;

  let currentCellInfo;     // Holds [x, y] of the cell being processed.
  let currentXCoord;       // X-coordinate of the current cell.
  let currentYCoord;       // Y-coordinate of the current cell.
  
  // A map to keep track of visited cells to prevent cycles and redundant processing.
  const discoveredPathNodes = {}; 
  
  // Get the value of the starting cell. Path can only move through cells of this type.
  const startingCellType = gameMatrix[initialX][initialY];
  
  // If the starting cell itself is an obstacle (value 0), no path is possible.
  if (startingCellType === 0) {
    return false;
  }
  
  // Add the starting coordinates to the queue to begin the BFS.
  explorationQueue.push([initialX, initialY]);
  
  // Continue as long as there are cells to explore in the queue.
  while (explorationQueue.length > 0) {
    currentCellInfo = explorationQueue.shift(); // Dequeue the next cell to process.
    currentXCoord = currentCellInfo[0];         // Extract X coordinate.
    currentYCoord = currentCellInfo[1];         // Extract Y coordinate.

    // Mark the current cell as visited.
    discoveredPathNodes[[currentXCoord, currentYCoord]] = true;
    
    // Check for out-of-bounds or invalid cell type.
    // If currentXCoord is less than 0 (left of board)
    // OR currentXCoord is beyond the board width
    // OR the current cell's value does not match the starting cell's value (meaning it's an obstacle or different path segment)
    if (currentXCoord < 0 || gameMatrix.length <= currentXCoord || startingCellType !== gameMatrix[currentXCoord][currentYCoord]) {
      continue; // Skip this cell and move to the next in the queue.
    }
    
    // If the current cell is the target cell, a path has been found.
    if (currentXCoord === targetX && currentYCoord === targetY) {
      return true; // Path exists!
    }
    
    // Explore all 8 neighboring cells.
    for (let moveIndex = 0; moveIndex < 8; moveIndex++) {
      // Calculate coordinates of the neighbor.
      const neighborX = currentXCoord + movementVectors[moveIndex][0];
      const neighborY = currentYCoord + movementVectors[moveIndex][1];

      // Check if the neighbor has not been visited yet.
      if (!discoveredPathNodes[[neighborX, neighborY]]) {
        // If not visited, add it to the queue for future exploration.
        explorationQueue.push([neighborX, neighborY]);
      }
    }
  }
  
  // If the queue becomes empty and the target was not reached, no path exists.
  return false;
}