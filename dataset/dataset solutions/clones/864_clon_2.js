/*
 *  This JavaScript module performs a specific numerical calculation.
 *  It reads data from standard input, processes it, and outputs a minimum value.
 */

// Obtain the file system interaction module from the Node.js runtime.
const fileSystemMod = require('fs');

// Query the size of the standard input stream's descriptor.
let dataSize = fileSystemMod.fstatSync(process.stdin.fd) .size;

// Create a new memory buffer of the exact size required to hold input.
let readBuffer = new Buffer(dataSize);

// Synchronously read bytes from standard input into the allocated buffer.
let actualBytes = fileSystemMod.readSync(process.stdin.fd, readBuffer, 0, dataSize, 0);

// Convert the buffered bytes into a UTF-8 string, then parse it into an array of lines.
let lineData = readBuffer .toString('utf8', 0, actualBytes) .split('\n');

// Extract and parse the primary numerical parameters from the input lines.
let upperBound = parseInt(lineData[0], 10); // The maximum value for the iterating divisor.

// Parse the individual string components from the relevant input lines.
let firstVal = lineData[1].split(' ')[0];
let secondVal = lineData[1].split(' ')[1];
let thirdVal = lineData[2].split(' ')[0];
let fourthVal = lineData[2].split(' ')[1];

// Declare variables that will be used within the iterative process.
let divisor;
let pairOneDist;
let pairTwoDist;

// Initialize the lowest found combined distance to the largest possible number.
let overallMinimum = Number.POSITIVE_INFINITY;

// Commence an iteration loop, testing each divisor from 1 up to the parsed upper limit.
for (divisor = 1; divisor <= upperBound; divisor++) {
  // Calculate a "Manhattan-like" distance for the initial pair of values.
  // This involves taking the absolute difference of their remainders and their floor-divided quotients.
  pairOneDist = Math.abs(firstVal % divisor - secondVal % divisor) + Math.abs(Math.floor(firstVal / divisor) - Math.floor(secondVal / divisor));

  // Perform the same distance calculation for the subsequent pair of values.
  pairTwoDist = Math.abs(thirdVal % divisor - fourthVal % divisor) + Math.abs(Math.floor(thirdVal / divisor) - Math.floor(fourthVal / divisor));

  // Re-evaluate and update the global minimum if the sum of current pair distances is less.
  overallMinimum = Math.min(overallMinimum, pairOneDist + pairTwoDist);
}

// Print the final, lowest calculated combined distance to the standard output.
console.log(overallMinimum);