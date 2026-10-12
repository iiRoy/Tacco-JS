"use strict";

// This section handles reading input from the standard input stream.
const dataStream = require("fs") // Utilize the Node.js file system module.
  .readFileSync("/dev/stdin", "utf8") // Read the entire file content as UTF-8.
  .split(" "); // Split the content by spaces into an array of strings.

// Parse the input values into integers.
const redVal = parseInt(dataStream[0], 10); // First value for red component.
const greenVal = parseInt(dataStream[1], 10); // Second value for green component.
const blueVal = parseInt(dataStream[2], 10); // Third value for blue component.
const targetSum = parseInt(dataStream[3], 10); // The target sum to achieve.

let totalCombinations = 0; // Initialize a counter for valid combinations.

// Outer loop iterates through possible counts of the red component.
for (let redCount = 0; redCount <= targetSum / redVal; redCount++) {
  // Inner loop iterates through possible counts of the green component.
  // The upper bound depends on the remaining sum after accounting for red.
  for (let greenCount = 0; greenCount <= (targetSum - (redCount * redVal)) / greenVal; greenCount++) {
    // Calculate the sum remaining after red and green components are considered.
    const remainingSum = targetSum - (redCount * redVal + greenCount * greenVal);

    // Check if the remaining sum can be perfectly divided by the blue component value.
    if (remainingSum % blueVal === 0) {
      totalCombinations++; // If so, increment the combination counter.
    }
  }
}

// Output the final count of valid combinations to the console.
console.log(totalCombinations);
