// This script manages input from the system's standard stream to guide a traversal process.
var sysIO = require('fs'),
totalBytes = sysIO.fstatSync(process.stdin.fd).size,
dataContainer = Buffer.alloc(totalBytes), // Allocate a buffer to hold incoming data
octetsRead = sysIO.readSync(process.stdin.fd, dataContainer, 0, totalBytes, 0),
gridLayout = dataContainer.toString('utf8', 0, octetsRead).trim().split('\n'); // Convert raw bytes to string lines for grid processing
executeTraversal(); // Initiate the grid navigation routine

function executeTraversal() {
  // Establish the starting position and initial movement vector
  var currentXPos = 0,
    currentYPos = 0;
  var currentMoveDirection = 'R'; // Begin moving towards the Right
  var journeyPath = ''; // Accumulate the sequence of directional movements

  // Continuously loop to simulate movement until the origin is revisited
  while (true) {
    // Determine potential vertical indices for next steps
    var downCandidateY = currentYPos * 2 + 1;
    var upCandidateY = currentYPos * 2 - 1;
    var actualYCoord = currentYPos * 2;

    // Determine potential horizontal indices for next steps
    var leftCandidateX = currentXPos - 1;
    var rightCandidateX = currentXPos + 1;
    var actualXCoord = currentXPos;

    // Evaluate possible moves based on the current heading
    switch (currentMoveDirection) {
      case 'L': // Currently facing Left
        // Check if a downward move is viable
        if (downCandidateY < gridLayout.length && +gridLayout[downCandidateY][actualXCoord]) {
          currentMoveDirection = 'D';
          currentYPos++;
        }
        // Otherwise, check if continuing left is possible
        else if (+gridLayout[actualYCoord][leftCandidateX]) {
          currentMoveDirection = 'L';
          currentXPos--;
        }
        // Otherwise, check if an upward move is viable
        else if (upCandidateY >= 0 && +gridLayout[upCandidateY][actualXCoord]) {
          currentMoveDirection = 'U';
          currentYPos--;
        }
        // If no other path, turn right
        else {
          currentMoveDirection = 'R';
          currentXPos++;
        }
        break;

      case 'R': // Currently facing Right
        // Check if an upward move is viable
        if (upCandidateY >= 0 && +gridLayout[upCandidateY][actualXCoord]) {
          currentMoveDirection = 'U';
          currentYPos--;
        }
        // Otherwise, check if continuing right is possible
        else if (+gridLayout[actualYCoord][actualXCoord]) {
          currentMoveDirection = 'R';
          currentXPos++;
        }
        // Otherwise, check if a downward move is viable
        else if (downCandidateY < gridLayout.length && +gridLayout[downCandidateY][actualXCoord]) {
          currentMoveDirection = 'D';
          currentYPos++;
        }
        // If no other path, turn left
        else {
          currentMoveDirection = 'L';
          currentXPos--;
        }
        break;

      case 'D': // Currently facing Down
        // Check if a rightward move is viable
        if (+gridLayout[actualYCoord][actualXCoord]) {
          currentMoveDirection = 'R';
          currentXPos++;
        }
        // Otherwise, check if continuing down is possible
        else if (downCandidateY < gridLayout.length && +gridLayout[downCandidateY][actualXCoord]) {
          currentMoveDirection = 'D';
          currentYPos++;
        }
        // Otherwise, check if a leftward move is viable
        else if (+gridLayout[actualYCoord][leftCandidateX]) {
          currentMoveDirection = 'L';
          currentXPos--;
        }
        // If no other path, turn up
        else {
          currentMoveDirection = 'U';
          currentYPos--;
        }
        break;

      case 'U': // Currently facing Up
        // Check if a leftward move is viable
        if (+gridLayout[actualYCoord][leftCandidateX]) {
          currentMoveDirection = 'L';
          currentXPos--;
        }
        // Otherwise, check if continuing up is possible
        else if (upCandidateY >= 0 && +gridLayout[upCandidateY][actualXCoord]) {
          currentMoveDirection = 'U';
          currentYPos--;
        }
        // Otherwise, check if a rightward move is viable
        else if (+gridLayout[actualYCoord][actualXCoord]) {
          currentMoveDirection = 'R';
          currentXPos++;
        }
        // If no other path, turn down
        else {
          currentMoveDirection = 'D';
          currentYPos++;
        }
        break;

      default: // Handle unexpected direction, though unlikely in this logic
        return; // Exit the function gracefully
    }
    journeyPath += currentMoveDirection; // Append the executed direction to the log

    // Verify if the traversal has returned to the initial coordinates (0,0)
    if (!currentXPos && !currentYPos)
      break; // Conclude the loop if origin is reached
  }
  console.log(journeyPath); // Display the complete sequence of movements taken
}