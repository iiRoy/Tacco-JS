"use strict"; /* Enforce strict mode for cleaner code */

const fileSystemModule = require("fs"); // Import the file system module

/**
 * Orchestrates the bingo game logic.
 * @param {string} rawDataString - The entire input string from stdin.
 */
function processGameData(rawDataString) {
  // Split the input string into individual lines
  const linesArray = rawDataString.split("\n");

  // Extract the 3x3 bingo grid from the first three lines
  const bingoGrid = linesArray.slice(0, 3).map(elementStr => elementStr.split(" "));

  // The fourth line contains the count of called numbers, which is not used in this logic
  const numberOfCalls = linesArray[3];

  // The remaining lines are the sequence of numbers called
  const calledNumbersList = linesArray.slice(4);

  // Initialize a 3x3 matrix to track marked cells, all initially false
  const markedCellsMatrix = [];
  for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
    markedCellsMatrix[rowIndex] = new Array(3).fill(false);
  }

  // Iterate through each called number and mark corresponding cells in the grid
  for (const currentCall of calledNumbersList) {
    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
      for (let colIndex = 0; colIndex < 3; colIndex++) {
        // If a number in the grid matches a called number, mark it
        if (bingoGrid[rowIndex][colIndex] === currentCall) {
          markedCellsMatrix[rowIndex][colIndex] = true;
        }
      }
    }
  }

  // Check for any winning condition (horizontal, vertical, or diagonal line)
  if (
       (markedCellsMatrix[0][0] && markedCellsMatrix[0][1] && markedCellsMatrix[0][2]) // First row
    || (markedCellsMatrix[1][0] && markedCellsMatrix[1][1] && markedCellsMatrix[1][2]) // Second row
    || (markedCellsMatrix[2][0] && markedCellsMatrix[2][1] && markedCellsMatrix[2][2]) // Third row
    || (markedCellsMatrix[0][0] && markedCellsMatrix[1][0] && markedCellsMatrix[2][0]) // First column
    || (markedCellsMatrix[0][1] && markedCellsMatrix[1][1] && markedCellsMatrix[2][1]) // Second column
    || (markedCellsMatrix[0][2] && markedCellsMatrix[1][2] && markedCellsMatrix[2][2]) // Third column
    || (markedCellsMatrix[0][0] && markedCellsMatrix[1][1] && markedCellsMatrix[2][2]) // Main diagonal
    || (markedCellsMatrix[0][2] && markedCellsMatrix[1][1] && markedCellsMatrix[2][0])   // Anti-diagonal
  ) {
    console.log("yes"); // A winning condition was met
  } else {
    console.log("no");  // No winning condition found
  }
}

// Read the entire standard input as a UTF-8 string and pass it to the main processing function
processGameData(fileSystemModule.readFileSync("/dev/stdin", "utf8"));