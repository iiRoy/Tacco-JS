'use strict'
// This directive enforces strict mode for better error handling.

/**
 * Calculates the greatest common divisor (GCD) of two non-negative integers using the Euclidean algorithm.
 * @param {number} valA - The first integer.
 * @param {number} valB - The second integer.
 * @returns {number} The greatest common divisor of valA and valB.
 */
const greatestCommonDivisor = (valA, valB) => Boolean(valB) ? greatestCommonDivisor(valB, valA % valB) : valA;

// A utility function to safely convert a string value into a numeric type.
const parseNumericValue = (strVal) => Number(strVal);

/**
 * The main entry point for processing input data.
 * It reads a list of numbers, and for each number, calculates the GCD of all other numbers,
 * then finds the maximum among these calculated GCDs.
 * @param {string[]} rawData - An array of strings, where the first element is the count
 *                             and the second is a space-separated string of numbers.
 */
const ProcessInputData = (rawData) => {
  // Extract the total number of items from the first line of input.
  const itemCount = Number(rawData[0]);

  // Parse the second line of input, splitting it by spaces and converting each part to a number.
  const numberArray = rawData[1].split(' ').map(parseNumericValue);

  // Initialize a variable to keep track of the highest GCD found so far.
  let finalResult = 0;

  // Outer loop: Iterate through each number in the array.
  // In each iteration, 'outerIndex' represents the index of the number to be temporarily excluded
  // from the GCD calculation for the current pass.
  for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
    // Initialize a temporary variable to store the GCD for the current pass.
    // If 'outerIndex' is 0, we start with the second number (numberArray[1]) to ensure
    // we don't use the excluded number as the initial GCD value.
    // Otherwise, we start with the first number (numberArray[0]).
    let currentGcdCandidate = (outerIndex === 0) ? numberArray[1] : numberArray[0];

    // Inner loop: Iterate through all numbers to calculate their GCD,
    // excluding the number at 'outerIndex'.
    for (let innerIndex = 0; innerIndex < itemCount; innerIndex++) {
      // Check if the current inner index is different from the outer index.
      // This ensures we exclude one number from the GCD calculation in each outer loop iteration.
      if (outerIndex !== innerIndex) {
        // Update the current GCD candidate by calculating the GCD with the next number.
        currentGcdCandidate = greatestCommonDivisor(currentGcdCandidate, numberArray[innerIndex]);
      }
    }
    // After calculating the GCD for all numbers (excluding one),
    // update the 'finalResult' if the 'currentGcdCandidate' is greater.
    finalResult = (finalResult < currentGcdCandidate) ? currentGcdCandidate : finalResult;
  }

  // Output the final maximum GCD found to the console.
  console.log(finalResult);
};

// Read input from standard input, decode it as UTF-8, trim whitespace,
// split it into lines, and then pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/));
