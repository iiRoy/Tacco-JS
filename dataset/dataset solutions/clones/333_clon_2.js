// A utility function designed to traverse a grid-like structure.
// It detects loops and target destinations.
function navigatePath(
  rowCoord,  // The current row index in the grid.
  colCoord   // The current column index in the grid.
)
{
  // If the current cell has already been marked as visited (part of a loop),
  // set the output message to indicate a loop and terminate this path.
  if (pathMatrix[rowCoord][colCoord] === "#")
  {
    outputMessage = "LOOP";
    return;
  }

  // If the current cell is the designated target (marked with '.'),
  // record its coordinates as the final outcome and terminate this path.
  if (pathMatrix[rowCoord][colCoord] === ".")
  {
    outputMessage = colCoord + " " + rowCoord;
    return;
  }

  // Initialize displacement values for column and row.
  let colOffset = 0;
  let rowOffset = 0;

  // Determine the direction of movement based on the character in the current cell.
  if (pathMatrix[rowCoord][colCoord] === ">")
    colOffset++; // Move one step to the right.
  if (pathMatrix[rowCoord][colCoord] === "<")
    colOffset--; // Move one step to the left.
  if (pathMatrix[rowCoord][colCoord] === "^")
    rowOffset--; // Move one step upwards.
  if (pathMatrix[rowCoord][colCoord] === "v")
    rowOffset++; // Move one step downwards.

  // Mark the current cell as visited to prevent infinite loops on subsequent visits.
  pathMatrix[rowCoord][colCoord] = "#";

  // Recursively call the navigation function for the next position.
  navigatePath(rowCoord + rowOffset, colCoord + colOffset);
}

// Obtain the necessary module for file system operations.
const fileSystemModule = require('fs');

// Read the entire content from the standard input stream.
let sourceContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace, then split into individual lines.
let inputLinesArray = (sourceContent.trim()).split("\n");

// Declare global variables to be used across different parts of the script.
let pathMatrix;     // Represents the 2D grid/map for traversal.
let outputMessage;  // Stores the final result or status of a traversal.

// Begin the main processing loop for handling multiple test scenarios.
while (true)
{
  // Extract grid dimensions (rows and columns) from the first line of the current input block.
  // The values are parsed as numbers.
  const gridSizeInfo = inputLinesArray.shift().split(" ").map(Number);

  // Check for the termination condition: if both dimensions are zero, exit the loop.
  if (gridSizeInfo[0] === 0 && gridSizeInfo[1] === 0)
  {
    break;
  }

  // Initialize an empty 2D array (grid) for the current scenario.
  pathMatrix = [];
  // Populate the grid by reading subsequent lines from the input array.
  for (let rowIndex = 0; rowIndex < gridSizeInfo[0]; rowIndex++)
  {
    const currentLineChars = (inputLinesArray.shift()).split("");
    pathMatrix.push(currentLineChars);
  }

  // Reset the output message before starting a new traversal.
  outputMessage = "";

  // Initiate the grid traversal from the top-left corner (0,0).
  navigatePath(0, 0);

  // Output the determined message for the current scenario.
  console.log(outputMessage);
}