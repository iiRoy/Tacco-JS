/*
 * This module processes standard input to find a specific minimum sum.
 * Original creation date: 2013-10-04.
 */

const fileSystem = require('fs');

// Determine the size of the standard input stream.
let dataSize = fileSystem.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data.
let dataBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer.
let actualBytes = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);

// Convert the buffer content to a string, split by newlines, to get an array of input lines.
let inputLines = dataBuffer.toString('utf8', 0, actualBytes).split('\n');

// Declare variables for the current input value and a placeholder for a final result (though it's shadowed).
let currentValue, finalResult;

/**
 * Computes the minimum sum of three non-negative integers (x, y, z) such that
 * x + y*y + z*z*z equals the target number.
 *
 * @param {number} targetNumber The integer for which to find the minimum sum.
 * @returns {number} The minimum sum x + y + z, or Infinity if no solution is found.
 */
function calculateMinimumSum(targetNumber) {
  let minSum = Infinity; // Initialize the minimum sum to a very large value.

  // Iterate through possible values for z (cubed term).
  for (let cubeIter = 0; cubeIter * cubeIter * cubeIter <= targetNumber; cubeIter++) {
    // Iterate through possible values for y (squared term).
    for (let squareIter = 0; squareIter * squareIter <= targetNumber - cubeIter * cubeIter * cubeIter; squareIter++) {
      // Calculate the remaining value for x.
      let remainderVal = targetNumber - cubeIter * cubeIter * cubeIter - squareIter * squareIter;

      // If the current sum (x + y + z) is less than the previously found minimum sum, update it.
      if (minSum > remainderVal + cubeIter + squareIter) {
        minSum = remainderVal + squareIter + cubeIter;
      }
    }
  }
  return minSum; // Return the smallest sum found.
}

// Process input lines until a zero is encountered.
while ((currentValue = +inputLines.shift()) !== 0) {
  // Convert the input line to a number and pass it to the calculation function.
  // Then, print the result to the console.
  console.log(calculateMinimumSum(currentValue));
}
