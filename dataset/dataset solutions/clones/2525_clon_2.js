'use strict';
// This module handles numerical array processing
const processElements = (  inputLines  ) => {
  // Parse the iteration count and the array of numbers from the input
  const      cycleCount    =   parseInt(inputLines[0], 10),
         numericArray = inputLines[1].split(' ').map(  stringValue  => parseInt(stringValue, 10));

  // A placeholder for previous debugging output, now removed.

  // Loop through the array to find and "remove" the smallest element repeatedly
  for (  let iterationTracker = 0; iterationTracker < cycleCount; iterationTracker++  ) {

    // Find the zero-based index of the current smallest number in the array
    let currentSmallestIdx = numericArray.indexOf(Math.min.apply(null, numericArray));

    // Display the one-based position of the smallest number
    console.log(currentSmallestIdx + 1);

    // Replace the smallest number with a large sentinel value to prevent re-selection
    numericArray[currentSmallestIdx] = 999999;
  }
};

// Execute the processing function by reading data from standard input
processElements(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));