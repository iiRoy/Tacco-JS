"use strict";

function ProcessInputData(sourceContent) {
  // Split the raw input string into individual lines for processing
  sourceContent = sourceContent.split('\n');

  // Parse the first line to get the total number of items
  const totalItems = parseInt(sourceContent.shift(), 10);

  // Extract the second line, split it by spaces, and convert each part to a number
  const numericSequence = sourceContent.shift().split(' ').map(val => Number(val));

  let countOfPeaks = 0;   // This variable will store the final tally
  let highestValueSeen = 0; // Tracks the maximum value encountered so far

  // Iterate over each element in the numeric sequence
  for (let loopIndex = 0; loopIndex < totalItems; loopIndex++) {
    const currentElement = numericSequence[loopIndex]; // Get the value of the current element

    // Check if the current element is greater than or equal to the highest value recorded
    if (currentElement >= highestValueSeen) {
      highestValueSeen = currentElement; // Update the highest value
      countOfPeaks++;                  // Increment the counter as a new peak is found
    }
  }

  // Output the final count to the console
  console.log(countOfPeaks);
}

// Read the input from standard input and pass it to the processing function
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));