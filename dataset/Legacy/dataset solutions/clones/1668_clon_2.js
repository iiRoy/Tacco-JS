"use strict"; // Enforce strict mode for cleaner code

/**
 * Processes raw input to find numbers divisible by a specific value
 * within a given range.
 * @param {string} rawText - The raw input string containing space-separated numbers.
 */
function processInputData(rawText) {
  // Clean up the input string and split it into an array of strings
  const parsedValues = rawText.trim().split(" ");

  // Parse the numerical bounds and the divisor from the input array
  const lowerBoundValue = parseInt(parsedValues[0], 10); // Convert first part to integer
  const upperBoundValue = parseInt(parsedValues[1], 10); // Convert second part to integer
  const targetDivisor = parseInt(parsedValues[2], 10); // Convert third part to integer

  let matchingCount = 0; // Initialize a counter for numbers that meet the criteria

  // Iterate through multiples of the targetDivisor, starting from targetDivisor itself,
  // up to a reasonable upper limit (100 in this context, as per original logic)
  for (let currentIterationNumber = targetDivisor; currentIterationNumber < 101; currentIterationNumber += targetDivisor) {
    // Check if the current multiple falls within the specified range [lowerBoundValue, upperBoundValue]
    if (lowerBoundValue <= currentIterationNumber && upperBoundValue >= currentIterationNumber) {
      matchingCount++; // Increment the counter if the condition is met
    }
  }

  // Output the final count to the console
  console.log(matchingCount);
}

/**
 * Sorts an array of numbers in ascending order.
 * This function is present in the original code but not called by main logic.
 * @param {number[]} inputArray - The array of numbers to be sorted.
 * @returns {number[]} The sorted array.
 */
function sortNumbersAscending(inputArray) {
  inputArray.sort(ascendingComparator); // Use the custom comparator for numeric sort
  return inputArray; // Return the modified array
}

// A comparison function for sorting numbers in ascending order
var ascendingComparator = function (firstElement, secondElement) {
  return firstElement - secondElement; // Standard numeric comparison
};

// Read input from standard input and pass it to the main processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));
