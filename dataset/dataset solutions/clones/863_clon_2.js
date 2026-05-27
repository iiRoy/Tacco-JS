/*
 * This module processes standard input to calculate a minimum distance.
 * It reads input lines, parses numerical values, and then performs
 * a grid-like distance calculation over a range of possible widths.
 */

const fileSystemModule = require('fs'); // Import the Node.js file system module.

// Determine the total byte size of the standard input stream.
const dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a new buffer to hold the incoming data.
const inputBuffer = new Buffer(dataSize);

// Read the entire standard input into the buffer.
const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string and split it into an array of lines.
const linesOfInput = inputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Parse the first line for the grid dimension.
const gridDimension = linesOfInput[0] - 0;

// Parse the second line for the starting point coordinates (adjusted to be 0-indexed).
const startRow = linesOfInput[1].split(' ')[0] - 1;
const startCol = linesOfInput[1].split(' ')[1] - 1;

// Parse the third line for the ending point coordinates (adjusted to be 0-indexed).
const endRow = linesOfInput[2].split(' ')[0] - 1;
const endCol = linesOfInput[2].split(' ')[1] - 1;

// Declare variables for loop iteration, intermediate distances, and the overall minimum.
let currentWidth;
let startPointDistance;
let endPointDistance;
let minimumTotalDistance = Infinity; // Initialize with a very large value.

// Iterate through possible grid widths from 1 up to the maximum dimension.
for (currentWidth = 1; currentWidth <= gridDimension; currentWidth++) {
  // Calculate the Manhattan distance for the starting point (startRow, startCol)
  // when mapped onto a grid of 'currentWidth' columns.
  // The coordinates are (row % width, row / width) and (col % width, col / width).
  startPointDistance = Math.abs(startRow % currentWidth - startCol % currentWidth) + Math.abs(~~(startRow / currentWidth) - ~~(startCol / currentWidth));

  // Calculate the Manhattan distance for the ending point (endRow, endCol)
  // using the same 'currentWidth' grid mapping.
  endPointDistance = Math.abs(endRow % currentWidth - endCol % currentWidth) + Math.abs(~~(endRow / currentWidth) - ~~(endCol / currentWidth));

  // Update the minimum total distance found so far.
  minimumTotalDistance = Math.min(minimumTotalDistance, startPointDistance + endPointDistance);
}

// Output the final calculated minimum total distance to the console.
console.log(minimumTotalDistance);
