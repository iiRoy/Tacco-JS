"use strict";

/**
 * Processes the raw input string to calculate the minimum total adjustments
 * required to make a sequence of numbers non-decreasing.
 *
 * @param {string} rawInputContent - The complete input string, typically read from stdin.
 */
function processInputData(rawInputContent) {
  // Trim whitespace and split the input into individual lines.
  const inputLines = rawInputContent.trim().split("\n");

  // The first line contains the count of elements in the sequence.
  const elementCount = Number(inputLines[0]);

  // The second line contains space-separated numeric strings, which form the sequence.
  const numericSequence = inputLines[1].split(" ");

  // Initialize a variable to store the cumulative sum of adjustments.
  let totalAdjustments = 0;

  // Iterate through the sequence from the first element up to the second-to-last.
  // This allows comparison of each element with its immediate successor.
  for (let currentIdx = 0; currentIdx < elementCount - 1; currentIdx++) {
    const currentNumericValue = Number(numericSequence[currentIdx]);
    const nextNumericValue = Number(numericSequence[currentIdx + 1]);

    // If the current element is greater than the next element, an adjustment is needed.
    // The goal is to make the sequence non-decreasing.
    if (currentNumericValue > nextNumericValue) {
      // Calculate the difference that needs to be added to the total adjustments.
      totalAdjustments += currentNumericValue - nextNumericValue;
      // To ensure the sequence becomes non-decreasing at this point,
      // the next element is set to the value of the current element.
      // This modification affects subsequent comparisons in the loop.
      numericSequence[currentIdx + 1] = numericSequence[currentIdx];
    }
  }

  // Output the final calculated sum of all necessary adjustments.
  console.log(totalAdjustments);
}

/**
 * Sorts an array of numbers in ascending order.
 * This utility function is defined but not utilized by the primary logic.
 *
 * @param {Array<number>} targetArray - The array of numbers to be sorted.
 * @returns {Array<number>} The same array, now sorted in ascending order.
 */
function sortNumericArray(targetArray) {
  // Use the custom comparison function for proper numeric sorting.
  targetArray.sort(ascendingComparator);
  return targetArray;
}

/**
 * A comparison function designed for Array.prototype.sort() to sort numbers
 * in ascending order.
 *
 * @param {number} valueA - The first number for comparison.
 * @param {number} valueB - The second number for comparison.
 * @returns {number} A negative value if valueA < valueB, 0 if equal,
 *                   or a positive value if valueA > valueB.
 */
const ascendingComparator = function (valueA, valueB) {
  return valueA - valueB;
};

// Read the entire content from standard input synchronously and
// then pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));
