'use strict';

/**
 * This function processes a given input string to calculate the total number of 'BW' to 'WB' swaps.
 * It iteratively finds and replaces all occurrences of 'BW' with 'WB' and counts these operations.
 *
 * @param {string} rawData - The complete input string, typically read from a file or standard input.
 */
const processInputData = (rawData) => {
  // The problem typically involves only the first line of input.
  // We extract this line to work with it.
  let workingString = rawData.split('\n')[0];

  // Initialize a variable to accumulate the total count of swaps.
  let swapCount = 0;

  // Continue looping as long as the pattern 'BW' can be found in the string.
  // The `match(/BW/)` without 'g' flag checks for existence.
  while (workingString.match(/BW/) !== null) {
    // Find all occurrences of 'BW' in the current string.
    // The 'g' flag ensures all matches are returned as an array.
    // The length of this array gives us the number of 'BW' pairs found in this iteration.
    swapCount += workingString.match(/BW/g).length;

    // Replace all found 'BW' patterns with 'WB'.
    // This simulates the swap and updates the string for the next iteration.
    workingString = workingString.replace(/BW/g, 'WB');
  }

  // After the loop terminates (no more 'BW' pairs exist),
  // print the final accumulated swap count to the console.
  console.log(swapCount);
};

// This is the entry point for execution.
// It reads the entire content of standard input synchronously,
// decodes it as UTF-8, and then passes it to our processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
