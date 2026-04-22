"use strict"; // Ensure strict mode for robust coding practices.

const processInputData = (rawInputString) => { // Primary function to handle program logic.
  let cumulativeSum = 0; // Initialize a variable to accumulate results.

  // Parse the incoming string data into individual lines.
  const processedLines = rawInputString.trim().split("\n");

  // Extract the first and second numeric parameters from the first line.
  const firstNumericParam = parseInt(processedLines[0].split(" ")[0]);
  const secondNumericParam = parseInt(processedLines[0].split(" ")[1]);

  let computedPower = secondNumericParam; // Start with the base value.
  // Calculate the power: secondNumericParam raised to the firstNumericParam.
  for (let exponentiationIterator = 1; exponentiationIterator <= firstNumericParam; exponentiationIterator++) {
    computedPower *= secondNumericParam;
  }
  // Output the calculated power.
  console.log(computedPower);

  // Begin a triple nested loop structure.
  for (let outerLoopVar = 1; outerLoopVar <= computedPower; outerLoopVar++) {
    for (let middleLoopVar = 1; middleLoopVar <= computedPower; middleLoopVar++) {
      for (let innerLoopVar = 1; innerLoopVar <= computedPower; innerLoopVar++) {
        // Increment the cumulative sum by the GCD of the three loop variables.
        cumulativeSum += computeGreatestCommonDivisor(outerLoopVar, middleLoopVar, innerLoopVar);
      }
    }
  }
  // Output the final cumulative sum divided by a large prime number.
  console.log(cumulativeSum / 10000000007);
};

/**
 * Calculates the Greatest Common Divisor (GCD) of an arbitrary number of integers.
 * @param {...number} numbersToProcess - An array of numbers for which to calculate the GCD.
 * @returns {number} The GCD of all input numbers.
 */
function computeGreatestCommonDivisor(...numbersToProcess) {
  // Helper function for binary GCD calculation using Euclidean algorithm.
  const recursiveGcdHelper = (valOne, valTwo) =>
    valTwo ? recursiveGcdHelper(valTwo, valOne % valTwo) : valOne;

  let currentDivisorResult = numbersToProcess[0]; // Initialize with the first number.

  // Iterate through the remaining numbers to find the cumulative GCD.
  for (let argumentIndex = 1; argumentIndex < numbersToProcess.length; argumentIndex++) {
    currentDivisorResult = recursiveGcdHelper(currentDivisorResult, numbersToProcess[argumentIndex]);
  }
  return currentDivisorResult; // Return the final GCD.
}

// Execute the main program function with data read from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));