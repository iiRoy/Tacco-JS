'use strict';

/**
 * This function processes a given input string to find a specific integer.
 * It identifies the number within the range [1, N] (where N is the input value)
 * that can be divided by 2 the maximum number of times before it becomes an odd number.
 *
 * @param {string} rawData - The raw input string, expected to contain a single numeric value.
 */
const processInput = (rawData) => {
  // Convert the trimmed input string into an integer, using base 10.
  const limitValue = parseInt(rawData.trim(), 10);

  let resultNumber = 0; // This variable will store the number that satisfies the condition.
  let maximumDivisions = -1; // This tracks the highest count of divisions by 2 found so far.

  // Iterate through each integer starting from 1 up to and including the limitValue.
  for (let currentIteration = 1; currentIteration <= limitValue; currentIteration++) {
    let temporaryValue = currentIteration; // A temporary variable to perform divisions on.
    let divisionCount = 0; // Counts how many times the temporaryValue can be divided by 2.

    // Loop indefinitely until the temporaryValue becomes odd.
    while (true) {
      // If the temporaryValue is odd (remainder when divided by 2 is 1), exit the loop.
      if (temporaryValue % 2 === 1) {
        break;
      }
      // Divide the temporaryValue by 2.
      temporaryValue /= 2;
      // Increment the division counter.
      divisionCount++;
    }

    // After counting divisions for the currentIteration, compare it with the maximum found.
    if (divisionCount > maximumDivisions) {
      // If the current number has more divisions, update the resultNumber.
      resultNumber = currentIteration;
      // Also update the maximumDivisions count.
      maximumDivisions = divisionCount;
    }
  }

  // Print the final resultNumber to the standard output.
  console.log(resultNumber);
};

// Read the entire content of standard input as a UTF-8 string
// and then pass it to the processInput function for execution.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
