/*
 * This module computes the minimum combined Manhattan distance
 * between two pairs of points on a grid with a variable wrap-around dimension.
 */

const fileSystemHandler = require('node:fs');

// Determine the total byte count of the standard input stream
let streamByteCount = fileSystemHandler.fstatSync(process.stdin.fd).size;

// Allocate a new buffer to hold the incoming data
const rawInputBuffer = Buffer.alloc(streamByteCount);

// Read the data from standard input into the buffer
let actualBytesTransferred = fileSystemHandler.readSync(process.stdin.fd, rawInputBuffer, 0, streamByteCount, 0);

// Convert the buffer content to a UTF-8 string and split it into individual lines
const parsedInputLines = rawInputBuffer.toString('utf-8', 0, actualBytesTransferred).split('\n');


// Parse the first line to get the maximum grid extent
let gridExtent = parseInt(parsedInputLines[0], 10);

// Parse the second line for the first pair of coordinates (0-indexed)
let coordA = parseInt(parsedInputLines[1].split(' ')[0], 10) - 1;
let coordB = parseInt(parsedInputLines[1].split(' ')[1], 10) - 1;

// Parse the third line for the second pair of coordinates (0-indexed)
let coordC = parseInt(parsedInputLines[2].split(' ')[0], 10) - 1;
let coordD = parseInt(parsedInputLines[2].split(' ')[1], 10) - 1;

let wrapDimension; // Loop variable for current wrapping width
let distAB;        // Calculated distance for the first point pair
let distCD;        // Calculated distance for the second point pair

// Initialize the overall minimum distance to a very large number
let overallMinDistance = Number.POSITIVE_INFINITY;


// Iterate through all possible wrap-around dimensions from 1 up to the grid extent
for (wrapDimension = 1; wrapDimension <= gridExtent; ++wrapDimension) {
  // Calculate Manhattan distance for the first pair (coordA, coordB) on a wrapped grid
  // abs(x1 % w - x2 % w) gives horizontal distance
  // abs(floor(x1 / w) - floor(x2 / w)) gives vertical distance
  distAB = Math.abs(coordA % wrapDimension - coordB % wrapDimension) +
           Math.abs(Math.floor(coordA / wrapDimension) - Math.floor(coordB / wrapDimension));

  // Calculate Manhattan distance for the second pair (coordC, coordD) on a wrapped grid
  distCD = Math.abs(coordC % wrapDimension - coordD % wrapDimension) +
           Math.abs(Math.floor(coordC / wrapDimension) - Math.floor(coordD / wrapDimension));

  // Update the overall minimum distance if the current sum is smaller
  overallMinDistance = Math.min(overallMinDistance, distAB + distCD);
}

// Output the final calculated minimum total distance
console.log(overallMinDistance);