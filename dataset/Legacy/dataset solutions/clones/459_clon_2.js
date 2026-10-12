function primaryExecution() {
  // Declare variables for the main processing loop
  let dataIndex = 0; // Index for reading from the rawData array
  let blockLoopCounter; // Loop counter for placing blocks
  let gridDimensions; // Stores width and height of the current grid
  let initialCoordinates; // Starting X, Y coordinates
  let finalCoordinates; // Goal X, Y coordinates
  let numberOfBlocks; // Count of blocks to be placed
  let gameBoard; // The 2D array representing the game grid

  // Infinite loop to process multiple test cases until a termination condition is met
  for (;;) {
    // Read grid width and height from input, parse them as numbers
    gridDimensions = rawData[dataIndex++].split(' ').map(Number);
    
    // Termination condition: if both width and height are zero, exit the loop
    if (!gridDimensions[0] && !gridDimensions[1]) {
      break;
    }
    
    // Initialize the game board with the specified dimensions
    gameBoard = initializeGrid(gridDimensions[0], gridDimensions[1]);
    
    // Read starting and goal coordinates from input
    initialCoordinates = rawData[dataIndex++].split(' ').map(Number);
    finalCoordinates = rawData[dataIndex++].split(' ').map(Number);
    
    // Read the number of blocks to be placed on the board
    numberOfBlocks = Number(rawData[dataIndex++]);

    // Loop to place each block according to input specifications
    for (blockLoopCounter = 0; blockLoopCounter < numberOfBlocks; blockLoopCounter++) {
      // Parse block parameters (type, direction, x, y) and apply them to the board
      // Using bind and apply to pass board as the first argument and remaining as individual arguments
      placeObstacle.bind(null, gameBoard).apply(null, rawData[dataIndex++].split(' ').map(Number));
    }
    
    // Determine if the goal is reachable from the start position on the current board
    // and print 'OK' or 'NG' to the console
    console.log(canReachDestination(gameBoard, initialCoordinates, finalCoordinates) ? 'OK' : 'NG');
  }
}

// Function to create and initialize a new game grid
function initializeGrid(widthVal, heightVal) {
  // Variables for iterating through rows and columns
  let rowIterator;
  let colIterator;
  // The new 2D array representing the grid
  const newGrid = [];

  // Loop through each row to create and initialize it
  for (rowIterator = 0; rowIterator < widthVal; rowIterator++) {
    newGrid.push([]); // Add an empty array for the current row
    // Loop through each column in the current row
    for (colIterator = 0; colIterator < heightVal; colIterator++) {
      newGrid[rowIterator][colIterator] = 0; // Initialize each cell with a value of 0
    }
  }
  return newGrid; // Return the newly created and initialized grid
}

// Function to place a block (obstacle) onto the game grid
function placeObstacle(currentGrid, blockType, blockDirection, startXCoord, startYCoord) {
  // Variables for iterating over the block's dimensions
  let rowOffset;
  let colOffset;
  // Determine the block's shape (dimensions) based on its direction
  // [[4, 2], [2, 4]] means two possible shapes: 4x2 or 2x4
  const blockShape = [[4, 2], [2, 4]][blockDirection];

  // Iterate through the block's width (first dimension of blockShape)
  for (rowOffset = 0; rowOffset < blockShape[0]; rowOffset++) {
    // Iterate through the block's height (second dimension of blockShape)
    for (colOffset = 0; colOffset < blockShape[1]; colOffset++) {
      // Mark the cells on the grid with the blockType value
      // Adjust coordinates by -1 as input coordinates are 1-indexed
      currentGrid[startXCoord - 1 + rowOffset][startYCoord - 1 + colOffset] = blockType;
    }
  }
}

// Function to determine if a path exists from start to goal using BFS
function canReachDestination(currentGridState, initialPosition, finalPosition) {
  // Queue for Breadth-First Search (BFS) to store positions to visit
  const pathQueue = [];
  // Array of 8-directional offsets for checking neighbors (including diagonals)
  const neighborOffsets = [
    [-1, -1], [0, -1], [1, -1], // Top row
    [-1, 0],           [1, 0],  // Middle row
    [-1, 1],  [0, 1],  [1, 1]   // Bottom row
  ];
  
  // Convert 1-indexed input coordinates to 0-indexed grid coordinates
  const startGridX = initialPosition[0] - 1;
  const startGridY = initialPosition[1] - 1;
  const goalGridX = finalPosition[0] - 1;
  const goalGridY = finalPosition[1] - 1;
  
  let currentX; // X-coordinate of the current cell being processed
  let currentY; // Y-coordinate of the current cell being processed
  let currentCoords; // Array holding [currentX, currentY]
  
  // Object to keep track of visited cells to prevent cycles and redundant processing
  // Keys are string representations of coordinates, values are true
  const visitedMap = {};
  // The value of the starting cell, which defines the "type" of path we can traverse
  const startBlockValue = currentGridState[startGridX][startGridY];
  
  // If the starting cell is blocked (value 0), it's impossible to move, so return false
  if (startBlockValue === 0) {
    return false;
  }
  
  // Add the starting position to the queue to begin the BFS
  pathQueue.push([startGridX, startGridY]);
  // Mark the starting cell as visited to avoid re-adding it immediately
  visitedMap[[startGridX, startGridY]] = true;

  // Process the queue until it's empty (no more reachable cells)
  while (pathQueue.length > 0) {
    currentCoords = pathQueue.shift(); // Dequeue the next position
    currentX = currentCoords[0];
    currentY = currentCoords[1];
    
    // Check if the current position is out of bounds or if its block type
    // does not match the starting block type. If so, skip this path.
    // Note: The original code implicitly handles Y-out-of-bounds by checking
    // if `startBlockValue !== undefined` when `currentGridState[currentX][currentY]` is `undefined`.
    if (currentX < 0 || currentGridState.length <= currentX || startBlockValue !== currentGridState[currentX][currentY]) {
      continue;
    }

    // If the current position is the goal, a path has been found, return true
    if (currentX === goalGridX && currentY === goalGridY) {
      return true;
    }
    
    // Explore all 8 neighbors of the current cell
    for (let offsetIndex = 0; offsetIndex < 8; offsetIndex++) {
      const nextX = currentX + neighborOffsets[offsetIndex][0];
      const nextY = currentY + neighborOffsets[offsetIndex][1];
      
      // Only add unvisited neighbors to the queue.
      // Bounds and block type checks for 'nextX', 'nextY' will happen when they are dequeued.
      if (!visitedMap[[nextX, nextY]]) {
        pathQueue.push([nextX, nextY]);
        visitedMap[[nextX, nextY]] = true; // Mark as visited immediately to prevent duplicates in queue
      }
    }
  }
  
  // If the queue becomes empty and the goal was never reached, return false
  return false;
}

// Global variable to accumulate all incoming standard input data
let rawData = '';

// Configure standard input stream
process.stdin.resume(); // Ensure the process stays alive to receive input
process.stdin.setEncoding('utf8'); // Specify UTF-8 encoding for input data

// Event listener for when data chunks are received from stdin
process.stdin.on('data', function(inputChunk) {
  rawData += inputChunk; // Append the received chunk to the rawData string
});

// Event listener for when the standard input stream ends
process.stdin.on('end', function() {
  // Once all input is received, split the accumulated string into an array of lines
  rawData = rawData.split('\n');
  // Call the primary execution function to start processing the input
  primaryExecution();
});
