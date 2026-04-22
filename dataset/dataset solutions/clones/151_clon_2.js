// This section handles obtaining input from the system's standard input stream.
let   diskHandler = require('fs');
const totalDataSize = diskHandler.fstatSync(process.stdin.fd).size;
let   dataContainer = new Buffer(totalDataSize);
const actualDataRead = diskHandler.readSync(process.stdin.fd, dataContainer, 0, totalDataSize, 0);
const gridMatrix = dataContainer .toString('utf8', 0, actualDataRead) .trim() .split('\n');

// Initiate the primary grid processing function.
processGridTraversal();

/**
 * Executes the main pathfinding algorithm on the input grid.
 * This function navigates a virtual agent through a 2D grid
 * based on specific movement rules and logs its journey.
 */
function processGridTraversal() {

  let currentColumn = 0.0;
  let currentRow    = 0.0;
  let currentHeading = 'RIGHTWARD'; // Initial direction for the agent.
  let pathLog = ''; // Stores the sequence of movements.

  while (true) {
    // Calculate potential next row indices based on current position
    let downwardRowIndex = currentRow * 2 + 1;
    let upwardRowIndex   = currentRow * 2 - 1;
    let currentLogicalRow = currentRow * 2;

    // Calculate potential next column indices based on current position
    let leftwardColumnIndex  = currentColumn - 1;
    let rightwardColumnIndex = currentColumn + 1;
    let currentLogicalColumn = currentColumn;

    // Determine the next movement based on current heading and grid availability.
    switch (currentHeading) {
      case 'LEFTWARD':
        // Attempt to move left first.
        if (Number(gridMatrix[currentLogicalRow][leftwardColumnIndex])) {
          currentHeading = 'LEFTWARD';
          currentColumn--;
        }
        // If left is blocked, try moving up.
        else if (upwardRowIndex > 0 && Number(gridMatrix[upwardRowIndex][currentLogicalColumn])) {
          currentHeading = 'UPWARD';
          currentRow--;
        }
        // If up is also blocked, try moving down.
        else if (downwardRowIndex < gridMatrix.length && Number(gridMatrix[downwardRowIndex][currentLogicalColumn])) {
          currentHeading = 'DOWNWARD';
          currentRow++;
        }
        break;

      case 'RIGHTWARD':
        // Attempt to move right first.
        if (Number(gridMatrix[currentLogicalRow][currentLogicalColumn])) {
          currentHeading = 'RIGHTWARD';
          currentColumn++;
        }
        // If right is blocked, try moving down.
        else if (downwardRowIndex < gridMatrix.length && Number(gridMatrix[downwardRowIndex][currentLogicalColumn])) {
          currentHeading = 'DOWNWARD';
          currentRow++;
        }
        // If down is also blocked, try moving up.
        else if (upwardRowIndex > 0 && Number(gridMatrix[upwardRowIndex][currentLogicalColumn])) {
          currentHeading = 'UPWARD';
          currentRow--;
        }
        break;

      case 'DOWNWARD':
        // Attempt to move down first.
        if (downwardRowIndex < gridMatrix.length && Number(gridMatrix[downwardRowIndex][currentLogicalColumn])) {
          currentHeading = 'DOWNWARD';
          currentRow++;
        }
        // If down is blocked, try moving right.
        else if (Number(gridMatrix[currentLogicalRow][currentLogicalColumn])) {
          currentHeading = 'RIGHTWARD';
          currentColumn++;
        }
        // If right is also blocked, try moving left.
        else if (Number(gridMatrix[currentLogicalRow][leftwardColumnIndex])) {
          currentHeading = 'LEFTWARD';
          currentColumn--;
        }
        break;

      case 'UPWARD':
        // Attempt to move up first.
        if (upwardRowIndex > 0 && Number(gridMatrix[upwardRowIndex][currentLogicalColumn])) {
          currentHeading = 'UPWARD';
          currentRow--;
        }
        // If up is blocked, try moving left.
        else if (Number(gridMatrix[currentLogicalRow][leftwardColumnIndex])) {
          currentHeading = 'LEFTWARD';
          currentColumn--;
        }
        // If left is also blocked, try moving right.
        else if (Number(gridMatrix[currentLogicalRow][currentLogicalColumn])) {
          currentHeading = 'RIGHTWARD';
          currentColumn++;
        }
        break;

      default:
        // In case of an unrecognized direction, exit the function.
        return;
    }

    // Append the current movement direction's initial to the path history.
    pathLog += currentHeading.charAt(0);

    // Check if the agent has returned to the origin (0,0).
    if (currentColumn === 0.0 && currentRow === 0.0) {
      break; // Terminate the traversal loop.
    }
  }

  // Display the complete path taken by the agent.
  console.log(pathLog);
}