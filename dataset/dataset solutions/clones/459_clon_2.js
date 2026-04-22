/*
 * This JavaScript program processes grid-based puzzles.
 * It reads input, initializes a grid, places obstacles,
 * and then determines if a path exists from a start to a goal coordinate.
 */
function executeProgram() {
  // Declare variables for program execution.
  var idx = 0,
      loopVarB,
      dimensions,
      startCoords,
      targetCoords,
      numBlocks,
      gameGrid;

  // Main loop to process multiple puzzle instances until termination condition.
  for ( ; ; ) {
    // Parse grid dimensions from input, converting them to numbers.
    dimensions = rawInputData[idx++] .split(' ') .map(Number);

    // If both dimensions are zero, it's the termination signal.
    if ( !dimensions[0] && !dimensions[1] )
      break;

    // Initialize the game grid based on the parsed width and height.
    gameGrid = initializeGrid(dimensions[0], dimensions[1]);

    // Parse starting and target coordinates.
    startCoords = rawInputData[idx++] .split(' ') .map(Number);
    targetCoords = rawInputData[idx++] .split(' ') .map(Number);

    // Read the number of blocks/obstacles to place.
    numBlocks = Number(rawInputData[idx++]);

    // Loop to place each block/obstacle onto the grid.
    for ( loopVarB = 0; loopVarB < numBlocks; loopVarB++ ) {
      // Use bind and apply to pass parsed block data to the placement function.
      placeObstacle.bind( null, gameGrid ) .apply( null, rawInputData[idx++] .split(' ') .map(Number) );
    }

    // Determine if a path exists and print the result.
    console.log(checkPathExistence(gameGrid, startCoords, targetCoords) ? 'OK' : 'NG');
  }
}

/**
 * Initializes a new grid (2D array) with specified width and height,
 * filling all cells with a default value (0).
 *
 * @param {number} widthParam  The number of columns for the grid.
 * @param {number} heightParam The number of rows for the grid.
 * @returns {Array<Array<number>>} A newly created 2D grid array.
 */
function initializeGrid(widthParam, heightParam) {
  var rowIter,
      colIter,
      newGrid = []; // Initialize the array that will hold the grid.

  // Loop through each column to create rows.
  for ( rowIter = 0; rowIter < widthParam; rowIter++ ) {
    newGrid.push([]); // Add a new row (inner array).
    // Loop through each row to fill cells.
    for ( colIter = 0; colIter < heightParam; colIter++ ) {
      newGrid[rowIter][colIter] = 0; // Set default value for each cell.
    }
  }
  return newGrid; // Return the fully initialized grid.
}

/**
 * Places a rectangular block onto the target grid.
 *
 * @param {Array<Array<number>>} targetGrid   The grid to modify.
 * @param {number} blockType      The value to fill the block cells with.
 * @param {number} blockDirection The orientation/shape index of the block (0 or 1).
 * @param {number} blockXPos      The 1-based X coordinate for the block's top-left corner.
 * @param {number} blockYPos      The 1-based Y coordinate for the block's top-left corner.
 */
function placeObstacle(targetGrid, blockType, blockDirection, blockXPos, blockYPos) {
  var rowOffset,
      colOffset,
      // Define block shapes based on direction (e.g., [[width, height]]).
      blockShape = [[4, 2], [2, 4]][blockDirection];

  // Iterate over the dimensions of the block to place it.
  for ( rowOffset = 0; rowOffset < blockShape[0]; rowOffset++ ) {
    for ( colOffset = 0; colOffset < blockShape[1]; colOffset++ ) {
      // Adjust coordinates from 1-based to 0-based and place the block type.
      targetGrid[blockXPos - 1 + rowOffset][blockYPos - 1 + colOffset] = blockType;
    }
  }
}

/**
 * Determines if a path exists from an origin point to a destination point
 * on the given grid, considering cells of the same type as the origin.
 * Uses a Breadth-First Search (BFS) like approach.
 *
 * @param {Array<Array<number>>} currentGrid     The grid to search within.
 * @param {Array<number>} originCoords   The [x, y] 1-based coordinates of the starting point.
 * @param {Array<number>} destinationCoords The [x, y] 1-based coordinates of the target point.
 * @returns {boolean} True if a path exists, false otherwise.
 */
function checkPathExistence(currentGrid, originCoords, destinationCoords) {
  var pathQueue = [], // Queue for BFS traversal.
      // 8-directional offsets for neighbors (dx, dy).
      neighborOffsets = [[-1, -1], [0, -1], [1, -1],
                         [-1, 0],           [1, 0],
                         [-1, 1], [0, 1], [1, 1]],
      startCol = originCoords[0] - 1, // Convert 1-based X to 0-based column.
      startRow = originCoords[1] - 1, // Convert 1-based Y to 0-based row.
      destCol = destinationCoords[0] - 1, // Convert 1-based target X to 0-based column.
      destRow = destinationCoords[1] - 1, // Convert 1-based target Y to 0-based row.
      currentPosition, // Holds [x, y] of current cell being processed.
      currX,           // Current cell's X coordinate.
      currY,           // Current cell's Y coordinate.
      visitedCells = {}, // Object to keep track of visited cells to prevent cycles.
      startCellType = currentGrid[startCol][startRow]; // Type of the starting cell.

  // If the starting cell is empty (0), no path can exist.
  if ( startCellType === 0 ) return false;

  // Add the starting position to the queue. (Original had an extra `{}` which is ignored)
  pathQueue.push([startCol, startRow]);

  // Process the queue until it's empty.
  for ( ; pathQueue.length >= 1; ) {
    currentPosition = pathQueue.shift(); // Get the next cell from the queue.
    currX = currentPosition[0];
    currY = currentPosition[1];

    // Check bounds and cell type. If out of bounds or different type, skip.
    // Note: The original code implicitly handles Y-bounds through `currentGrid[currX][currY]`
    // which would result in `undefined` if out of bounds, then `startCellType !== undefined`.
    if ( currX < 0 || currentGrid.length <= currX || startCellType !== currentGrid[currX][currY] )
      continue;

    // If the current cell is the destination, a path is found.
    if ( currX === destCol && currY === destRow )
      return true;

    visitedCells[[currX, currY]] = true; // Mark the current cell as visited.

    // Explore all 8 neighbors.
    for ( let neighborIdx = 0; neighborIdx < 8; neighborIdx++ ) {
      let nextX = currX + neighborOffsets[neighborIdx][0];
      let nextY = currY + neighborOffsets[neighborIdx][1];
      // If neighbor hasn't been visited, add it to the queue.
      if ( !visitedCells[[nextX, nextY]] ) {
        pathQueue.push([nextX, nextY]);
      }
    }
  }

  // If the queue is empty and the destination wasn't reached, no path exists.
  return false;
}

// Global variable to accumulate raw input data.
var rawInputData = '';

// Set up event listeners for standard input.
process.stdin.resume(); // Start reading from stdin.
process.stdin.setEncoding('utf8'); // Set input encoding.

// Event listener for incoming data chunks.
process.stdin.on('data', function(chunkOfData) {
  rawInputData += chunkOfData; // Append data chunk to the buffer.
});

// Event listener for end of input stream.
process.stdin.on('end', function() {
  rawInputData = rawInputData.split('\n'); // Split the accumulated data into lines.
  executeProgram(); // Start the main program execution.
});