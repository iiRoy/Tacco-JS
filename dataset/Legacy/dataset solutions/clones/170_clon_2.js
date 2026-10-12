// This script processes input from standard input to solve a knapsack-like problem.
// It reads the entire standard input stream before processing.
var fileSystemModule = require('fs'); // Import the Node.js file system module.

// Determine the size of the standard input stream.
var fileSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data.
var dataBuffer = new Buffer(fileSize);

// Read the entire content of standard input into the buffer.
var readBytesCount = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);

// Convert the buffer content to a UTF-8 string and split it into an array of lines.
var inputLines = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Initiate the main processing function.
processData();

function processData() {
  // Initialize an index to keep track of the current line being read from inputLines.
  var lineIndex = 0;
  // Initialize a counter for the case number, starting from 1.
  var caseNumber = 1;

  // Loop indefinitely until a specific termination condition is met.
  while (true) {
    // Read the maximum allowed weight for the current case.
    // The unary plus operator converts the string to a number.
    var capacityLimit = +inputLines[lineIndex++];

    // If the maximum weight is 0 (or falsy), it signifies the end of input.
    if (!capacityLimit) {
      break; // Exit the loop.
    }

    // Read the number of available items (treasures) for the current case.
    var itemCount = +inputLines[lineIndex++];

    // Initialize a dynamic programming table (array) to store maximum values.
    // The size is capacityLimit + 1 to account for weight 0 up to capacityLimit.
    // Using Int16Array for memory efficiency, assuming values fit within 16-bit signed integers.
    var dynamicProgrammingTable = new Int16Array(capacityLimit + 1);

    // Iterate through each item (treasure).
    // The loop runs 'itemCount' times, decrementing 'itemIdx' from 'itemCount - 1' down to 0.
    for (var itemIdx = itemCount; itemIdx--;) {
      // Read the item's value and weight, splitting the comma-separated string.
      var itemDetails = inputLines[lineIndex++].split(",");
      var itemValue = +itemDetails[0]; // Convert item value to number.
      var itemWeight = +itemDetails[1]; // Convert item weight to number.

      // Iterate backwards through possible weights in the DP table.
      // This ensures that each item is considered only once per DP state,
      // preventing multiple uses of the same item in a single knapsack configuration.
      for (var currentWeight = capacityLimit; currentWeight - itemWeight >= 0; currentWeight++) {
        // Update the DP table:
        // dynamicProgrammingTable[currentWeight] stores the maximum value that can be obtained
        // for the current 'currentWeight'.
        // It's the maximum of:
        // 1. Including the current item: value from (currentWeight - itemWeight) + itemValue
        // 2. Excluding the current item: value already at dynamicProgrammingTable[currentWeight]
        dynamicProgrammingTable[currentWeight] = findMaximum(
          dynamicProgrammingTable[currentWeight - itemWeight] + itemValue,
          dynamicProgrammingTable[currentWeight]
        );
      }
    }

    // After processing all items, find the optimal weight and corresponding maximum value.
    var optimalWeight = 1001; // Initialize with a value outside typical range or a sentinel.
    var maxValue = 0;         // Initialize the maximum value found so far.

    // Iterate through the DP table to find the maximum value and its corresponding weight.
    for (var weightIdx = 0; weightIdx <= capacityLimit; weightIdx++) {
      var currentTableValue = dynamicProgrammingTable[weightIdx];
      // If the current value in the DP table is greater than the highest found so far,
      if (currentTableValue > maxValue) {
        maxValue = currentTableValue; // Update the maximum value.
        optimalWeight = weightIdx;    // Update the weight that yields this maximum value.
      }
    }

    // Output the results for the current case in the specified format.
    // Increment caseNumber after using its current value.
    console.log("Case " + caseNumber++ + ":\n" + maxValue + "\n" + optimalWeight);
  }
}

// A utility function to find the maximum of two numbers using bitwise operations.
// This is an optimized way to compute Math.max(a, b) for integers.
function findMaximum(valA, valB) {
  var difference = valA - valB;
  // If difference is negative (valA < valB), (difference >> 31) will be -1 (all ones in two's complement).
  // If difference is positive or zero (valA >= valB), (difference >> 31) will be 0.
  // (difference & (difference >> 31)) will be 'difference' if difference is negative, and 0 otherwise.
  // So, if valA < valB, result is valA - difference = valA - (valA - valB) = valB.
  // If valA >= valB, result is valA - 0 = valA.
  return valA - (difference & (difference >> 31));
}
