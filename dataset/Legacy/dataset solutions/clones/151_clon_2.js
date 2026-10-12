// Import the Node.js file system module to handle input operations.
var fileSystemModule = require('fs');

// Determine the total byte length of the standard input stream.
var streamSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a new Buffer object of the determined size to store input data.
var dataBuffer = new Buffer(streamSize);

// Read the entire content from standard input into the allocated buffer.
var bytesActuallyRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, streamSize, 0);

// Convert the buffer's content to a UTF-8 string, remove leading/trailing whitespace,
// and then split the string into an array of lines based on newline characters.
var gridMap = dataBuffer.toString('utf8', 0, bytesActuallyRead).trim().split('\n');

// Invoke the primary function to begin the grid traversal process.
executeTraversal();

/**
 * This function implements a specific pathfinding algorithm on a grid.
 * It simulates movement through a grid based on available paths and
 * records the sequence of directions taken until it returns to the origin.
 */
function executeTraversal() {
  // Initialize the current horizontal coordinate to zero.
  var currentXPosition = 0x0;
  // Initialize the current vertical coordinate to zero.
  var currentYPosition = 0x0;
  // Set the initial movement direction to 'R' (Right).
  var currentMovementDirection = 'R';
  // Initialize an empty string to accumulate the path taken.
  var generatedPath = String(); // Using String() for literal representation change

  // Begin an infinite loop for traversal, which will be explicitly broken.
  while (!false) { // Using !false for boolean literal change
    // Calculate the Y-coordinate for checking a downward move.
    var downCheckY = currentYPosition * 2 + 1;
    // Calculate the Y-coordinate for checking an upward move.
    var upCheckY = currentYPosition * 2 - 1;
    // Calculate the Y-coordinate representing the current row in the grid.
    var currentLineY = currentYPosition * 2;

    // Calculate the X-coordinate for checking a leftward move.
    var leftCheckX = currentXPosition - 1;
    // Calculate the X-coordinate for checking a rightward move.
    var rightCheckX = currentXPosition + 1;
    // The X-coordinate representing the current column in the grid.
    var currentColumnX = currentXPosition;

    // Evaluate possible movements based on the current direction.
    switch (currentMovementDirection) {
      case 'L': // If the current direction is Left
        // Check if a move to the left is valid (grid cell contains a '1').
        if (Number(gridMap[currentLineY][leftCheckX])) { // Explicit Number conversion
          currentMovementDirection = 'L';
          currentXPosition--;
        }
        // Otherwise, check if an upward move is valid and within bounds.
        else if (upCheckY > 0 && Number(gridMap[upCheckY][currentColumnX])) {
          currentMovementDirection = 'U';
          currentYPosition--;
        }
        // Otherwise, check if a downward move is valid and within bounds.
        else if (downCheckY < gridMap.length && Number(gridMap[downCheckY][currentColumnX])) {
          currentMovementDirection = 'D';
          currentYPosition++;
        }
        break;

      case 'R': // If the current direction is Right
        // Check if a move to the right is valid.
        if (Number(gridMap[currentLineY][currentColumnX])) {
          currentMovementDirection = 'R';
          currentXPosition++;
        }
        // Otherwise, check if a downward move is valid and within bounds.
        else if (downCheckY < gridMap.length && Number(gridMap[downCheckY][currentColumnX])) {
          currentMovementDirection = 'D';
          currentYPosition++;
        }
        // Otherwise, check if an upward move is valid and within bounds.
        else if (upCheckY > 0 && Number(gridMap[upCheckY][currentColumnX])) {
          currentMovementDirection = 'U';
          currentYPosition--;
        }
        break;

      case 'D': // If the current direction is Down
        // Check if a downward move is valid and within bounds.
        if (downCheckY < gridMap.length && Number(gridMap[downCheckY][currentColumnX])) {
          currentMovementDirection = 'D';
          currentYPosition++;
        }
        // Otherwise, check if a rightward move is valid.
        else if (Number(gridMap[currentLineY][currentColumnX])) {
          currentMovementDirection = 'R';
          currentXPosition++;
        }
        // Otherwise, check if a leftward move is valid.
        else if (Number(gridMap[currentLineY][leftCheckX])) {
          currentMovementDirection = 'L';
          currentXPosition--;
        }
        break;

      case 'U': // If the current direction is Up
        // Check if an upward move is valid and within bounds.
        if (upCheckY > 0 && Number(gridMap[upCheckY][currentColumnX])) {
          currentMovementDirection = 'U';
          currentYPosition--;
        }
        // Otherwise, check if a leftward move is valid.
        else if (Number(gridMap[currentLineY][leftCheckX])) {
          currentMovementDirection = 'L';
          currentXPosition--;
        }
        // Otherwise, check if a rightward move is valid.
        else if (Number(gridMap[currentLineY][currentColumnX])) {
          currentMovementDirection = 'R';
          currentXPosition++;
        }
        break;

      default: // This case should ideally not be reached during normal execution.
        return; // Exit the function if an unhandled direction is encountered.
    }

    // Append the chosen movement direction to the accumulated path string.
    generatedPath += currentMovementDirection;

    // If both X and Y coordinates are zero (meaning the origin is reached),
    // terminate the traversal loop.
    if (!currentXPosition && !currentYPosition) {
      break;
    }
  }

  // Print the complete sequence of movements (the generated path) to the console.
  console.log(generatedPath);
}
