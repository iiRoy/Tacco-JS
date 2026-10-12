var fileSystemModule = require('fs');
var dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;
var dataBuffer = new Buffer(dataSize);
var readBytesCount = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);
var gridData = dataBuffer.toString('utf8', 0, readBytesCount).trim().split('\n');

// Initiate the main processing function
executeTraversal();

function executeTraversal() {
  var currentXPosition = 0, currentYPosition = 0; // Current coordinates, starting at origin
  var currentMovementDirection = 'R'; // Initial movement direction
  var recordedPath = ''; // String to store the sequence of movements

  // Loop indefinitely until a specific break condition is met
  while (true) {
    // Calculate potential Y-coordinates for movement checks
    var potentialDownY = currentYPosition * 2 + 1;
    var potentialUpY = currentYPosition * 2 - 1;
    var currentGridY = currentYPosition * 2;

    // Calculate potential X-coordinates for movement checks
    var potentialLeftX = currentXPosition - 1;
    var potentialRightX = currentXPosition + 1;
    var currentGridX = currentXPosition;

    // Evaluate movement options based on the current direction
    switch (currentMovementDirection) {
      case 'L':
        // Try to move Down
        if (potentialDownY < gridData.length && +gridData[potentialDownY][currentGridX]) {
          currentMovementDirection = 'D';
          currentYPosition++;
        }
        // Else, try to move Left
        else if (+gridData[currentGridY][potentialLeftX]) {
          currentMovementDirection = 'L';
          currentXPosition--;
        }
        // Else, try to move Up
        else if (potentialUpY > 0 && +gridData[potentialUpY][currentGridX]) {
          currentMovementDirection = 'U';
          currentYPosition--;
        }
        // Else, move Right as a fallback
        else {
          currentMovementDirection = 'R';
          currentXPosition++;
        }
        break;

      case 'R':
        // Try to move Up
        if (potentialUpY > 0 && +gridData[potentialUpY][currentGridX]) {
          currentMovementDirection = 'U';
          currentYPosition--;
        }
        // Else, try to move Right
        else if (+gridData[currentGridY][currentGridX]) {
          currentMovementDirection = 'R';
          currentXPosition++;
        }
        // Else, try to move Down
        else if (potentialDownY < gridData.length && +gridData[potentialDownY][currentGridX]) {
          currentMovementDirection = 'D';
          currentYPosition++;
        }
        // Else, move Left as a fallback
        else {
          currentMovementDirection = 'L';
          currentXPosition--;
        }
        break;

      case 'D':
        // Try to move Right
        if (+gridData[currentGridY][currentGridX]) {
          currentMovementDirection = 'R';
          currentXPosition++;
        }
        // Else, try to move Down
        else if (potentialDownY < gridData.length && +gridData[potentialDownY][currentGridX]) {
          currentMovementDirection = 'D';
          currentYPosition++;
        }
        // Else, try to move Left
        else if (+gridData[currentGridY][potentialLeftX]) {
          currentMovementDirection = 'L';
          currentXPosition--;
        }
        // Else, move Up as a fallback
        else {
          currentMovementDirection = 'U';
          currentYPosition--;
        }
        break;

      case 'U':
        // Try to move Left
        if (+gridData[currentGridY][potentialLeftX]) {
          currentMovementDirection = 'L';
          currentXPosition--;
        }
        // Else, try to move Up
        else if (potentialUpY > 0 && +gridData[potentialUpY][currentGridX]) {
          currentMovementDirection = 'U';
          currentYPosition--;
        }
        // Else, try to move Right
        else if (+gridData[currentGridY][currentGridX]) {
          currentMovementDirection = 'R';
          currentXPosition++;
        }
        // Else, move Down as a fallback
        else {
          currentMovementDirection = 'D';
          currentYPosition++;
        }
        break;

      default:
        // This case should ideally not be reached with the given logic
        return;
    }
    recordedPath += currentMovementDirection; // Append the chosen direction to the path string
    // Break the loop if the current position returns to the origin (0,0)
    if (!currentXPosition && !currentYPosition) {
      break;
    }
  }
  console.log(recordedPath); // Output the final recorded path
}
