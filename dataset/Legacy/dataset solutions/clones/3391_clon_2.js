"use strict";

/*
 * This function calculates the minimum number of swaps required
 * to move all 'W' characters to the beginning of a sequence.
 * It's a Type II clone, preserving the original algorithm.
 */
function ProcessSequence(sequenceData) {
  let totalSwaps = 0; // Accumulator for the total number of necessary swaps.
  let processedWhites = 0; // Counter for 'W' characters encountered so far.

  // Iterate through each element of the provided sequence.
  for (let currentIdx = 0; currentIdx < sequenceData.length; currentIdx++) {
    // If the current character is not 'W', skip to the next one.
    if (sequenceData[currentIdx] !== 'W') {
      continue;
    }

    // If it is 'W', calculate the swaps needed for this specific 'W'.
    // This 'W' needs to move from its current position (currentIdx)
    // to the position right after the previously processed 'W's (processedWhites).
    totalSwaps += currentIdx - processedWhites;
    // Increment the count of 'W' characters that have been processed.
    processedWhites += 1;
  }

  // Output the final calculated total number of swaps to the console.
  console.log(totalSwaps);
}

// Execute the main processing function with data read from standard input.
ProcessSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
