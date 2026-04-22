'use strict';

/**
 * Primary function to orchestrate the processing of raw input data.
 * It reads, parses, calculates, and outputs the result.
 * @param {string} sourceContent - The complete raw text received from the input stream.
 */
function processInputData(sourceContent) {
  // Step 1: Clean and transform the raw string input into a structured array of numbers.
  // This involves removing external whitespace, splitting by line breaks,
  // and then parsing each line's elements into integers.
  let parsedRows = sourceContent
    .trim() // Eliminate any leading or trailing whitespace from the entire input string.
    .split('\n') // Divide the input string into an array of individual lines.
    .map(lineString => // Iterate over each line to process its content.
      lineString.split(' ') // Split the current line into an array of string-represented numbers.
                .map(Number.parseInt) // Convert each string number into an actual integer.
    );

  // Step 2: Extract the total count of items from the first element of the first parsed row.
  const elementCount = parsedRows[0][0];

  // Step 3: Retrieve the array of numbers from the second parsed row and sort it numerically.
  // Sorting is a prerequisite for correctly computing the greatest common divisor of adjacent elements.
  const numericSequence = parsedRows[1]
    .sort((valA, valB) => valA - valB); // Arrange numbers in ascending order.

  // Step 4: Initialize a variable to store the smallest greatest common divisor found.
  // We begin with an infinitely large value to ensure any calculated GCD will be smaller.
  let currentMinimumFactor = Infinity;

  /**
   * Computes the greatest common divisor (GCD) of two non-negative integers
   * using the recursive Euclidean algorithm.
   * @param {number} firstNum - The first integer for the GCD computation.
   * @param {number} secondNum - The second integer for the GCD computation.
   * @returns {number} The greatest common divisor of the two input numbers.
   */
  const calculateCommonDivisor = (firstNum, secondNum) => {
    // The base condition for the recursion: if the second number is zero,
    // the first number is the GCD.
    return secondNum === 0
      ? firstNum
      : calculateCommonDivisor(secondNum, firstNum % secondNum); // Recursive call with remainder.
  };

  // Step 5: Iterate through the sorted numerical sequence to determine the GCD of all adjacent pairs.
  // The loop runs for N-1 iterations for N elements to cover all pairs.
  for (let index = 0; index < elementCount - 1; ++index) {
    // Compute the greatest common divisor for the current pair of neighboring numbers.
    const currentPairGcd = calculateCommonDivisor(numericSequence[index], numericSequence[index + 1]);

    // Update the `currentMinimumFactor` if the newly calculated GCD is smaller.
    currentMinimumFactor = Math.min(currentPairGcd, currentMinimumFactor);
  }

  // Step 6: Display the final smallest greatest common divisor to the standard output.
  console.log(currentMinimumFactor);
}

// Execute the main processing function by reading the input from standard input (stdin).
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));