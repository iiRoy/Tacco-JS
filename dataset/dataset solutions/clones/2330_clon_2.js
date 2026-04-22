"use strict";

// This function orchestrates the primary data processing logic.
const processInputData = rawDataString => {
  // First, we clean up the incoming string and split it into individual lines.
  let linesOfData = rawDataString.trim().split("\n");

  // The first line provides the count of elements we expect.
  const totalElements = parseInt(linesOfData[0]);

  // The second line contains space-separated numbers, which we convert to an array of integers.
  const numericArray = linesOfData[1].split(" ").map(numStr => parseInt(numStr));

  // Initialize a counter to track consecutive matches.
  let foundCount = 0;

  // Iterate through each element in the processed numerical sequence.
  for (let idx = 0; idx < totalElements; idx++) {
    // Check if the current element matches our expected consecutive value.
    if (numericArray[idx] === (foundCount + 1)) {
      // If it matches, increment our consecutive match counter.
      foundCount++;
    }
  }

  // Based on the final count, determine the output.
  if (foundCount !== 0) {
    // If some matches were found, output the number of elements that didn't fit the sequence.
    console.log(totalElements - foundCount);
  } else {
    // If no matches were found at all, output -1 as per requirements.
    console.log(-1);
  }
};

// Execute the main processing function with data read from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));