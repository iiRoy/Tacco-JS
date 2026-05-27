"use strict";

/**
 * Processes the raw input data to determine the count of non-decreasing maximums.
 * @param {string} rawData - The complete input string received from standard input.
 */
function ProcessInput(rawData) {
  // Divide the incoming string into an array of individual lines.
  let processedLines = rawData.split('\n');

  // Extract the first line, which represents the total number of elements (N).
  let itemCount = parseInt(processedLines.shift(), 10);

  // Extract the second line, split it by spaces, and convert each part to a number.
  let dataCollection = processedLines.shift().split(' ').map(val => val - 0);

  // Initialize a counter to store the final result.
  let finalCount = 0;

  // Initialize a variable to keep track of the largest value encountered so far.
  let currentMaximum = 0;

  // Iterate through each element in the data collection.
  for (let idx = 0; idx < itemCount; idx++) {
    // Get the numerical value of the current element.
    let currentValue = dataCollection[idx];

    // Check if the current value is greater than or equal to the current maximum.
    if (currentValue >= currentMaximum) {
      // If it is, update the current maximum to this new value.
      currentMaximum = currentValue;
      // Increment the final count, as a new non-decreasing maximum has been found.
      finalCount++;
    }
  }

  // Print the calculated final count to the console.
  console.log(finalCount);
}

// Read the entire content of standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
