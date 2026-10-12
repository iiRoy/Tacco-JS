function exploreGrid(rowCoord, colCoord) {
  // Check if the current cell has already been visited during this path
  if (gridMap[rowCoord][colCoord] === "#") {
    outcomeMessage = "LOOP"; // Indicate a cycle has been detected
    return; // Terminate this recursive branch
  }

  // Check if the current cell is the designated exit point
  if (gridMap[rowCoord][colCoord] === ".") {
    outcomeMessage = colCoord + " " + rowCoord; // Record the coordinates of the exit
    return; // Terminate this recursive branch
  }

  // Mark the current cell as visited to prevent re-processing in the same path
  gridMap[rowCoord][colCoord] = "#";

  // The following conditional statements are effectively non-functional
  // because the cell content was just changed to '#'.
  // They are retained to strictly adhere to Type II cloning rules.
  if (gridMap[rowCoord][colCoord] === ">") {
    colCoord++; // Attempt to move right (will not execute)
  }
  if (gridMap[rowCoord][colCoord] === "<") {
    colCoord--; // Attempt to move left (will not execute)
  }
  if (gridMap[rowCoord][colCoord] === "^") {
    rowCoord--; // Attempt to move up (will not execute)
  }
  if (gridMap[rowCoord][colCoord] === "v") {
    rowCoord++; // Attempt to move down (will not execute)
  }

  // Recursively call the exploration function for the next step.
  // Due to the preceding dead code, rowCoord and colCoord remain unchanged here.
  exploreGrid(rowCoord, colCoord);
}

// Declare global variables for the grid structure and the final output message
let gridMap;
let outcomeMessage;

// Read all input data from standard input synchronously
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process the raw input into an array of individual lines
const inputLines = (rawData.trim()).split("\n");

// Main loop to process multiple grid configurations
while (true) {
  // Extract grid dimensions (rows and columns) from the first line of the current input block
  const dimensions = inputLines.shift().split(" ").map(Number);

  // Check for the termination condition (0 0)
  if (dimensions[0] === 0 && dimensions[1] === 0) {
    break; // Exit the processing loop if dimensions are zero
  }

  // Initialize the 2D array (grid) for the current test case
  gridMap = [];
  for (let idx = 0; idx < dimensions[0]; idx++) {
    // Read each row of the grid and split it into individual characters
    const currentLineChars = (inputLines.shift()).split("");
    gridMap.push(currentLineChars); // Add the row to the grid
  }

  // Reset the outcome message for the new test case
  outcomeMessage = "";

  // Begin the grid exploration from the starting point (0,0)
  exploreGrid(0, 0);

  // Output the determined outcome for the current grid
  console.log(outcomeMessage);
}
