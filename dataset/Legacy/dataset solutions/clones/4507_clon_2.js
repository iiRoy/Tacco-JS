"use strict";

const processInput = (inputData) => {
  // Parse the initial data
  let totalEntries = inputData.split("\n")[0];
  let numberSequence = inputData.split("\n").slice(1, totalEntries + 1).map(val => Number(val));

  // Initialize a step counter
  let stepCounter = 0;
  // Set the starting point for traversal
  let currentPosition = 1;

  // Loop until the target value (2) is reached
  while (currentPosition !== 2) {
    // Move to the next position in the sequence
    currentPosition = numberSequence[currentPosition - 1];
    // Increment the step counter
    stepCounter++;

    // If the counter exceeds the total number of entries, it indicates an infinite loop or invalid sequence
    if (stepCounter > totalEntries) {
      console.log("-1");
      return; // Exit the function
    }
  }
  // Output the final step count
  console.log(stepCounter);
};

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
