'use strict'; // Enforce strict mode for cleaner code practices

/**
 * Processes input data to find a specific integer value.
 * This function calculates a potential range and then iterates to find a match
 * based on two percentage conditions.
 * @param {string} inputDataString - The raw input string, expected to contain two space-separated numbers.
 */
function processInput(inputDataString) {
  // Clean and parse the input string into an array of numbers.
  // Each string element is converted to a number using multiplication by 1.
  let parsedNumbers = inputDataString.trim().split(' ').map(itemString => itemString * 1);

  let resultValue = -1; // Initialize the result with a default 'not found' value.

  // Calculate an upper bound for the search loop based on the first number and 8% tax.
  // This provides an efficient limit for the iteration.
  let upperBound = Math.floor(parsedNumbers[0] / 0.08);

  // Calculate a lower bound estimate based on the second number and 10% tax.
  // Note: This variable is declared but not used in the final loop condition,
  // preserving the original code's structure.
  let lowerBoundEstimate = Math.floor(parsedNumbers[1] / 0.10);

  // Iterate from 1 up to the calculated upper bound.
  // The loop searches for an integer 'currentIteration' that satisfies both conditions.
  for (let currentIteration = 1; currentIteration <= upperBound; currentIteration++) {
    // Check if applying 8% tax to 'currentIteration' matches the first input number,
    // AND if applying 10% tax to 'currentIteration' matches the second input number.
    // Math.floor is used to simulate integer tax calculation.
    if (Math.floor(currentIteration * 0.08) === parsedNumbers[0] && Math.floor(currentIteration * 0.1) === parsedNumbers[1]) {
      resultValue = currentIteration; // If both conditions are met, store 'currentIteration' as the result.
    }
  }

  // Output the final calculated result to the console.
  console.log(resultValue);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
