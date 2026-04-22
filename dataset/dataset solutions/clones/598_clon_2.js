// This function implements a Breadth-First Search (BFS) algorithm
// to find the shortest path in a grid-like structure.
// It searches for a path that collects numerical 'power-ups' in sequence.
function findShortestPath(initialX,   initialY) {

  // Arrays defining movement offsets for 4 directions (up, down, left, right)
  var columnOffsets = [  0, -1,  1,  0 ];
  var rowOffsets    = [ -1,  0,  0,  1 ];

  // Variable to store the length of the shortest path found
  var currentPathLength = 0;

  // The primary queue for the BFS, storing state as [x_coord, y_coord, path_len, required_power]
  var searchQueue = [ [initialX, initialY, currentPathLength, 1] ];

  // An unused object, potentially for tracking visited nodes or other metadata.
  var nodeHistory = {};

  // A 2D array used to memoize the minimum 'power level' required to reach a specific cell.
  // It helps in pruning less efficient paths.
  var pathProgressMatrix = [];

  // Initialize the path progress matrix with default values (e.g., 0)
  for (let rIdx = 0; rIdx <= 1000; rIdx++) {
    pathProgressMatrix[rIdx] = [];
    for (let cIdx = 0; cIdx <= 1000; cIdx++) {
      pathProgressMatrix[rIdx][cIdx] = 0;
    }
  }

  // Set the initial cell's required power level.
  // Note: The indexing here (X, Y) might imply [col][row] access for this matrix.
  pathProgressMatrix[initialX][initialY] = 0;

  // A pointer to track the current position in the BFS queue, simulating a dequeue operation.
  let queueReadPointer = 0;

  // Main loop for the Breadth-First Search
  while (true) {
    // Retrieve the next node to process from the queue
    var activeNode = searchQueue[queueReadPointer];
    queueReadPointer++;

    // Deconstruct the active node's state
    var currentCellX = activeNode[0];
    var currentCellY = activeNode[1];
    var currentLen   = activeNode[2];
    var currentPwr   = activeNode[3];

    // Check if the target 'maximumPower' has been surpassed.
    // If so, the path to this state is the shortest path to collect all power-ups.
    if (currentPwr === maximumPower + 1) {
      currentPathLength = currentLen;
      break; // Exit the BFS loop
    }

    // Explore all four adjacent cells (neighbors)
    for (var directionIndex = 0; directionIndex < 4; directionIndex++) {
      var nextCellX = currentCellX + columnOffsets[directionIndex];
      var nextCellY = currentCellY + rowOffsets[directionIndex];
      var nextPwr   = currentPwr; // Initialize next power level with current

      // Boundary check: ensure the next cell is within the grid dimensions
      // gridMapSize[1] is number of columns, gridMapSize[0] is number of rows.
      if (nextCellX < 0 || nextCellY < 0 || nextCellX >= gridMapSize[1] || nextCellY >= gridMapSize[0]) {
        continue; // Skip this cell if it's out of bounds
      }

      // Obstacle check: 'X' represents an impassable block
      // Note: gridLayout is indexed [row][col].
      if (gridLayout[nextCellY][nextCellX] === "X") {
        continue; // Skip if it's an obstacle
      }

      // Check for 'power-up' collection: if the cell contains the required power level, increment it.
      // The comparison involves converting nextPwr to a string to match grid content.
      if (gridLayout[nextCellY][nextCellX] === "" + nextPwr) {
        nextPwr++;
      }

      // Pruning condition: if we've already found a path to this 'nextCell'
      // with an equal or higher 'required power level', this current path is not more efficient.
      // Note: The indexing pathProgressMatrix[nextCellX][nextCellY] implies [col][row].
      if (pathProgressMatrix[nextCellX][nextCellY] >= nextPwr) {
        continue; // Skip if a better or equivalent path already exists
      }

      // Update the minimum required power level to reach this cell
      pathProgressMatrix[nextCellX][nextCellY] = nextPwr;

      // Add the valid and unpruned next cell to the end of the BFS queue
      searchQueue[searchQueue.length] = [nextCellX, nextCellY, currentLen + 1, nextPwr];
    }
  }

  // Return the final calculated shortest path length
  return currentPathLength;
}


// --- Global Scope: Program Entry Point ---

// Use Node.js 'fs' module to read all input from standard input (stdin)
let rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines
var inputLineSegments = (rawInputData.trim()).split("\n");

// Parse the first line to extract grid dimensions (height, width) and the maximum power-up value
// The 'shift()' method removes the first element from the array.
var gridMapSize = (inputLineSegments.shift()).split(" ").map(Number);
var maximumPower = gridMapSize[2]; // The third value in the first line represents max power.

// Initialize arrays to hold the grid layout and the detected starting position
var gridLayout = [];
var initialPosition = [];

// Iterate through the remaining input lines to construct the grid and locate the 'S'tarting point
for (let rowCounter = 0; rowCounter < gridMapSize[0]; rowCounter++) {
  // Get the characters for the current line and split them into an array
  var lineCharacters = (inputLineSegments.shift()).split("");

  // Check if the current line contains the 'S'tarting character
  if (lineCharacters.indexOf("S") !== -1) {
    // If 'S' is found, record its [column, row] coordinates
    initialPosition = [lineCharacters.indexOf("S"), rowCounter];
  }
  // Add the processed line of characters to the grid layout
  gridLayout.push(lineCharacters);
}

// Call the pathfinding function with the determined starting coordinates
var computedResult = findShortestPath(initialPosition[0], initialPosition[1]);

// Output the final result (the shortest path length) to the console
console.log(computedResult);