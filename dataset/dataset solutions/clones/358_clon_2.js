// This function performs a depth-first search (DFS) or flood-fill operation
// to explore a connected region of identical characters in a grid.
function exploreRegion(rowCoord, colCoord, targetChar) {
  // Increment a global counter to track recursion depth.
  // This acts as a safeguard against excessively deep recursion, preventing stack overflows.
  recursionDepthCounter++;
  if (recursionDepthCounter > 50) {
    return; // Exit if the recursion depth limit is reached.
  }

  // Define arrays for row and column offsets to check adjacent cells (up, down, left, right).
  const rowOffsets = [0, 0, -1, 1]; // Changes for row index
  const colOffsets = [-1, 1, 0, 0]; // Changes for column index

  // Loop through the four possible directions.
  for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
    // Calculate the coordinates of the neighboring cell.
    const newRow = rowCoord + rowOffsets[directionIndex];
    const newCol = colCoord + colOffsets[directionIndex];

    // Check if the new coordinates are within the bounds of the grid.
    // gridDimensions[0] is the number of rows, gridDimensions[1] is the number of columns.
    if (newRow < 0 || newRow >= gridDimensions[0] || newCol < 0 || newCol >= gridDimensions[1]) {
      continue; // If out of bounds, skip to the next direction.
    }

    // If the neighboring cell contains the same character as the target,
    // mark it as visited and recursively explore from there.
    if (targetChar === gameGrid[newRow][newCol]) {
      gameGrid[newRow][newCol] = '0'; // Mark the cell as visited by changing its value to '0'.
      exploreRegion(newRow, newCol, targetChar); // Recursive call to continue exploration.
    }
  }
}

// Import the 'fs' module to read from the file system.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process the raw input: trim whitespace and split into an array of lines.
const inputLines = (rawData.trim()).split("\n");

// Global variables to be used across test cases and functions.
let gridDimensions; // Stores the [rows, columns] for the current grid.
let gameGrid;       // The 2D array representing the current game grid.
let blobCount;      // Counts the number of distinct "blobs" found.
let recursionDepthCounter; // Counter for the recursion depth in exploreRegion.

// Main loop to process multiple test cases from the input.
while (true) {
  // Read the first line of the current test case, which contains grid dimensions.
  // Split by space and convert to numbers.
  gridDimensions = (inputLines.shift()).split(" ").map(Number);

  // Check for the termination condition: if both dimensions are 0, exit the loop.
  if (gridDimensions[0] === 0 && gridDimensions[1] === 0) {
    break;
  }

  // Initialize the game grid for the current test case.
  gameGrid = [];
  // Populate the grid by reading subsequent lines.
  for (let lineIndex = 0; lineIndex < gridDimensions[0]; lineIndex++) {
    // Read a line, split it into individual characters, and add it as a row to the grid.
    const currentLineChars = (inputLines.shift()).split("");
    gameGrid.push(currentLineChars);
  }

  // Reset counters for the new test case.
  blobCount = 0;
  recursionDepthCounter = 0;

  // Iterate through each cell of the grid to find and process blobs.
  for (let rowIndex = 0; rowIndex < gridDimensions[0]; rowIndex++) {
    for (let colIndex = 0; colIndex < gridDimensions[1]; colIndex++) {
      const cellValue = gameGrid[rowIndex][colIndex]; // Get the character at the current cell.

      // If the cell contains a character that signifies the start of a blob ('@', '#', or '*').
      if (cellValue === "@" || cellValue === "#" || cellValue === "*") {
        blobCount++; // Increment the count of distinct blobs.
        gameGrid[rowIndex][colIndex] = "m"; // Mark the starting cell as 'm' (modified/visited)
                                            // to prevent recounting it or starting a new DFS from it.
        exploreRegion(rowIndex, colIndex, cellValue); // Start the recursive exploration for this blob.
      }
    }
  }
  // Output the total number of blobs found for the current test case.
  console.log(blobCount);
}
