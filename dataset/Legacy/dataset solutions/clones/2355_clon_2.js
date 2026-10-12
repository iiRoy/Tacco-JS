'use strict';

/**
 * Processes the given input string to calculate a specific sum.
 * @param {string} inputData The raw input string from stdin.
 */
function processInput(inputData) {
  // Define a large prime number for modulo operations.
  const moduloValue = 1e9 + 7;

  // Clean up the input: remove leading/trailing whitespace and split into lines.
  inputData = inputData.trim().split('\n');

  // The first line contains the count of elements. Convert it to a number.
  const countElements = Number(inputData.shift());

  // The next line contains space-separated numbers. Parse them into an array of numbers.
  inputData = inputData[0].split(' ').map(numStr => Number(numStr));

  // Initialize the accumulator for the final result.
  let resultSum = 0;

  // Iterate through the array with a nested loop to consider all unique pairs.
  // The outer loop iterates from the first element up to (but not including) the last.
  for (let outerIndex = 0; outerIndex < countElements; outerIndex++) {
    // The inner loop starts from the element immediately after the outer loop's current element.
    for (let innerIndex = outerIndex + 1; innerIndex < countElements; innerIndex++) {
      // Calculate the bitwise XOR of the two elements, then apply modulo.
      // Add this result to the total sum.
      resultSum += inputData[outerIndex] ^ inputData[innerIndex] % moduloValue;
    }
  }

  // Output the final calculated sum to the console.
  console.log(resultSum);
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
