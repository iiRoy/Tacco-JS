function primaryExecution() {
  // Declare variables for the main processing loop
  var idx = 0,
    loopCounter,
    gridDimensions,
    startCoordinates,
    targetCoordinates,
    numObstacles,
    gameGrid;

  // Main loop to process multiple test cases
  for (;;) {
    // Read grid width and height from input
    gridDimensions = rawData[idx++].split(' ').map(Number);

    // If both dimensions are zero, terminate the program
    if (!gridDimensions[0] && !gridDimensions[1]) {
      break;
    }

    // Initialize the game board with the given dimensions
    gameGrid = initializeGrid(gridDimensions[0], gridDimensions[1]);

    // Read starting and target coordinates
    startCoordinates = rawData[idx++].split(' ').map(Number);
    targetCoordinates = rawData[idx++].split(' ').map(Number);

    // Read the number of obstacles to place
    numObstacles = Number(rawData[idx++]);

    // Loop to place each obstacle on the grid
    for (loopCounter = 0; loopCounter < numObstacles; loopCounter++) {
      // Parse obstacle details and apply them to the grid
      placeObstacle.bind(null, gameGrid).apply(null, rawData[idx++].split(' ').map(Number));
    }

    // Determine if the goal is reachable and print the result
    console.log(canReachDestination(gameGrid, startCoordinates, targetCoordinates) ? 'OK' : 'NG');
  }
}

// Function to create and initialize a 2D grid
function initializeGrid(widthVal, heightVal) {
  var rowIdx, colIdx;
  var newGrid = []; // The grid itself

  // Populate the grid with rows and columns, setting all cells to 0
  for (rowIdx = 0; rowIdx < widthVal; rowIdx++) {
    newGrid.push([]); // Add a new row
    for (colIdx = 0; colIdx < heightVal; colIdx++) {
      newGrid[rowIdx][colIdx] = 0; // Initialize cell value
    }
  }
  return newGrid; // Return the newly created grid
}

// Function to place a block (obstacle) on the grid
function placeObstacle(currentGrid, blockType, blockOrientation, startX, startY) {
  var blockRow, blockCol;
  // Define block shapes based on orientation (d=0 or d=1)
  var blockShape = [[4, 2], [2, 4]][blockOrientation];

  // Iterate through the block's dimensions to mark cells on the grid
  for (blockRow = 0; blockRow < blockShape[0]; blockRow++) {
    for (blockCol = 0; blockCol < blockShape[1]; blockCol++) {
      // Adjust coordinates for 0-based indexing and apply block type
      currentGrid[startX - 1 + blockRow][startY - 1 + blockCol] = blockType;
    }
  }
}

// Function to check if a path exists from start to goal on the grid
function canReachDestination(activeGrid, startCoordinates, targetCoordinates) {
  var pathQueue = []; // Queue for BFS traversal
  // Possible movement directions (8-directional)
  var moveDirections = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1]
  ];

  // Convert 1-based coordinates to 0-based grid indices
  var startGridX = startCoordinates[0] - 1,
    startGridY = startCoordinates[1] - 1;
  var goalGridX = targetCoordinates[0] - 1,
    goalGridY = targetCoordinates[1] - 1;

  var currentPos, currentX, currentY;
  var visitedCells = {}; // Object to keep track of visited cells
  var startCellType = activeGrid[startGridX][startGridY]; // Type of the starting cell

  // If the starting cell is empty (type 0), no path is possible
  if (startCellType === 0) {
    return false;
  }

  // Add the starting position to the queue
  pathQueue.push([startGridX, startGridY, {}]); // The third element is unused, preserving original behavior

  // Perform Breadth-First Search (BFS)
  for (; pathQueue.length >= 1;) {
    currentPos = pathQueue.shift(); // Get the next position from the queue
    currentX = currentPos[0];
    currentY = currentPos[1];

    // Mark the current cell as visited
    visitedCells[[currentX, currentY]] = true;

    // Check boundary conditions and cell type consistency
    if (currentX < 0 || activeGrid.length <= currentX || startCellType !== activeGrid[currentX][currentY]) {
      continue; // Skip if out of bounds or cell type doesn't match starting cell
    }

    // If the goal is reached, return true
    if (currentX === goalGridX && currentY === goalGridY) {
      return true;
    }

    // Explore all 8 possible directions
    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
      let nextX = currentX + moveDirections[directionIndex][0];
      let nextY = currentY + moveDirections[directionIndex][1];

      // If the next cell has not been visited, add it to the queue
      if (!visitedCells[[nextX, nextY]]) {
        pathQueue.push([nextX, nextY]);
      }
    }
  }

  // If the queue becomes empty and the goal was not reached, return false
  return false;
}


// Global variable to store raw input data
var rawData = '';

// Set up standard input processing
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Accumulate data chunks from stdin
process.stdin.on('data', function(chunk) {
  rawData += chunk;
});

// When all input is received, process it
process.stdin.on('end', function() {
  rawData = rawData.split('\n'); // Split input into lines
  primaryExecution(); // Start the main program logic
});
