"use strict";

// This function processes the given input string to calculate a specific value.
const processInput = (inputString) => {
  // Trim leading/trailing whitespace and split the input by newlines.
  let processedLines = inputString.trim().split("\n");

  // Parse the first two space-separated integers from the first line.
  const initialValue = parseInt(processedLines[0].split(" ")[0]);
  const targetLimit = parseInt(processedLines[0].split(" ")[1]);

  // Initialize a variable to track the current value, starting from initialValue.
  let currentVal = initialValue;
  // Initialize a counter for the result, starting at one.
  let resultCount = 1;

  // Loop as long as the current value does not exceed the target limit.
  while (currentVal <= targetLimit) {
    // Check if doubling the current value would still be within the target limit.
    if (currentVal * 2 <= targetLimit) {
      // If so, increment the result counter.
      resultCount++;
    }

    // Double the current value for the next iteration.
    currentVal *= 2;
  }

  // Output the final calculated result to the console.
  console.log(resultCount);
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
