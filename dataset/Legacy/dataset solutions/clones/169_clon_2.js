// This script processes input from standard input to solve a knapsack-like problem.

// Import the file system module for input handling.
const fileSystem = require('fs');

// Determine the size of the standard input stream.
let dataSize = fileSystem.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data.
let inputBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer.
let readBytes = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string and split it into lines.
let inputLines = inputBuffer.toString('utf8', 0, readBytes).split('\n');

// Initiate the primary data processing routine.
processData();

/**
 * Main function to handle the problem logic.
 * It reads test cases, performs calculations, and prints results.
 */
function processData() {
  let lineIndex = 0; // Current index for reading from inputLines.
  let caseNumber = 1; // Counter for test cases.

  // Loop indefinitely until a termination condition is met.
  while (true) {
    // Read the maximum allowed weight for the current case.
    // The unary plus converts the string to a number.
    let capacityLimit = +inputLines[lineIndex++];

    // If capacityLimit is zero or falsy, it signifies the end of input.
    if (!capacityLimit) {
      break; // Exit the loop.
    }

    // Read the number of items (treasures) for the current case.
    let itemCount = +inputLines[lineIndex++];

    // Initialize a dynamic programming array for the previous iteration.
    // Int32Array is used for performance and type safety.
    let previousDP = new Int32Array(capacityLimit + 1);

    // Iterate through each item.
    for (let itemIdx = itemCount; itemIdx--;) {
      // Parse item details (value and weight) from the input line.
      let itemDetails = inputLines[lineIndex++].split(",");
      let itemValue = +itemDetails[0]; // Value of the current item.
      let itemWeight = +itemDetails[1]; // Weight of the current item.

      // Initialize a new DP array for the current iteration.
      let currentDP = new Int32Array(capacityLimit + 1);

      // Iterate through possible weights from 1 up to the capacity limit.
      for (let currentWeight = 1; currentWeight <= capacityLimit; currentWeight++) {
        // If the current item's weight exceeds the current capacity,
        // we cannot include it, so the value remains the same as without it.
        if (currentWeight - itemWeight < 0) {
          currentDP[currentWeight] = previousDP[currentWeight];
        } else {
          // Otherwise, choose the maximum between:
          // 1. Not including the current item (value from previousDP).
          // 2. Including the current item (value of item + value from previousDP
          //    for the remaining capacity).
          currentDP[currentWeight] = findMaximum(previousDP[currentWeight - itemWeight] + itemValue, previousDP[currentWeight]);
        }
      }
      // Update previousDP to currentDP for the next item's calculation.
      previousDP = currentDP;
    }

    // After processing all items, find the optimal weight and maximum value.
    let optimalWeight = 1001; // Initialize with a value outside the expected range.
    let maxValue = 0; // Initialize maximum value found.

    // Iterate through the final DP array to find the best result.
    for (let itemIdx = 0; itemIdx <= capacityLimit; itemIdx++) {
      if (previousDP[itemIdx] > maxValue) {
        maxValue = previousDP[itemIdx];
        optimalWeight = itemIdx;
      }
    }
    
    // Print the results for the current test case.
    console.log("Case " + caseNumber++ + ":\n" + maxValue + "\n" + optimalWeight);
  }
}

/**
 * Helper function to determine the greater of two numbers.
 * @param {number} val1 - The first number.
 * @param {number} val2 - The second number.
 * @returns {number} The larger of the two input numbers.
 */
function findMaximum(val1, val2) {
  return val1 > val2 ? val1 : val2;
}
