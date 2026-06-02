'use strict'; // Enforce strict mode for cleaner code execution

/*
 * This module defines a function to analyze a sequence of numbers
 * provided as input and count specific patterns.
 */
function processInput(rawData) {
  // First, clean up the raw input string: remove leading/trailing whitespace
  // and then split it into an array of individual lines.
  let processedLines = rawData.trim().split('\n');

  // The first line of the input contains the total number of elements (N).
  // Convert this string representation to a numerical value.
  const arrayLength = Number(processedLines[0]);

  // The second line contains the actual numbers, space-separated.
  // Split this string by spaces, then use 'map' to convert each string
  // representation of a number into an integer.
  const numericValues = processedLines[1].split(' ').map(valStr => parseInt(valStr, 10));

  // Initialize a variable to keep track of the count of elements
  // that satisfy our specific condition.
  let peakCount = 0;

  // Iterate through the array of numbers. We start from the second element
  // (index 1) and go up to, but not including, the last element (arrayLength - 1).
  // This is because each element needs to be compared with its immediate
  // predecessor and successor.
  for (let idx = 1; idx < arrayLength - 1; idx++) {
    // Check if the current number (numericValues[idx]) is strictly between
    // its two neighbors (numericValues[idx - 1] and numericValues[idx + 1]).
    // This means either:
    // 1. The current number is smaller than its left neighbor AND larger than its right neighbor.
    //    (e.g., [5, 3, 7] - 3 is between 5 and 7)
    // OR
    // 2. The current number is smaller than its right neighbor AND larger than its left neighbor.
    //    (e.g., [7, 3, 5] - 3 is between 7 and 5)
    if (
      (numericValues[idx] < numericValues[idx - 1] && numericValues[idx] > numericValues[idx + 1]) ||
      (numericValues[idx] < numericValues[idx + 1] && numericValues[idx] > numericValues[idx - 1])
    ) {
      // If the condition is met, increment our counter.
      peakCount++;
    }
  }

  // After checking all relevant elements, print the final count to the console.
  console.log(peakCount);
}

// The program execution starts here.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string,
// and then passes this raw string to our 'processInput' function for analysis.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
