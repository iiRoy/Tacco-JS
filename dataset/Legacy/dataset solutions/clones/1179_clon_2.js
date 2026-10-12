'use strict'; // Enforces stricter parsing and error handling for better code quality

(function (inputData) {
  // Read the entire input stream, convert it to a string, and then split it into an array of individual lines.
  const inputRows = inputData.toString().split('\n');

  // Define a specific string that acts as a sentinel value, indicating the end of the actual data to be processed.
  const endMarker = '0';

  // This immediately-invoked function expression (IIFE) processes the relevant input segments
  // and orchestrates the calculation of standard deviations.
  const finalOutput = (function (processedSegments) {
    // Initialize an array to store the results of each standard deviation calculation.
    const computedValues = [];

    // Iterate through the array of processed segments, advancing by two elements in each step.
    // Each pair of elements represents a dataset: a count and a list of numbers.
    for (let idx = 0, segmentCount = processedSegments.length; idx < segmentCount; idx += 2) {
      // For each pair, call the standard deviation calculation function.
      // The first segment is the count, the second is a space-separated string of numbers.
      computedValues.push(calculateStandardDeviation(
        processedSegments[idx], // The string representing the count of numbers.
        processedSegments[idx + 1].split(' ').map(Number) // Split the string of numbers and convert each part to a numeric type.
      ));
    }

    // After all calculations are complete, join the individual results with newline characters
    // to form a single string suitable for output.
    return computedValues.join('\n');

    /**
     * Computes the standard deviation for a given array of numeric values.
     *
     * @param {string} itemCountStr - A string representing the number of elements to consider from the `numericValues` array.
     * @param {number[]} numericValues - An array containing the raw numeric data.
     * @returns {string} The calculated standard deviation, formatted to eight decimal places.
     */
    function calculateStandardDeviation(itemCountStr, numericValues) {
      // Convert the string count to an integer for numerical operations.
      const itemCount = Number(itemCountStr);

      // Calculate the arithmetic mean (average) of the relevant subset of numbers.
      // It slices the array to include only the specified number of items, sums them, and then divides by the count.
      const averageValue = numericValues.slice(0, itemCount)
        .reduce((accumulator, currentValue) => accumulator + currentValue) / itemCount;

      // Perform the standard deviation calculation steps:
      // 1. Slice the `numericValues` array to consider only the `itemCount` elements.
      // 2. For each `singleValue`, calculate the square of its difference from the `averageValue`.
      // 3. Sum all these squared differences.
      // 4. Divide the sum by `itemCount` to get the variance.
      // 5. Take the square root of the variance to get the standard deviation.
      // 6. Format the final result to exactly 8 decimal places as a string.
      return Math.sqrt(
        numericValues.slice(0, itemCount)
          .map((singleValue) => Math.pow(singleValue - averageValue, 2))
          .reduce((accumulator, currentValue) => accumulator + currentValue) / itemCount
      ).toFixed(8);
    }
  }(
    // Before processing, filter the `inputRows` to exclude any lines after the `endMarker`.
    // This ensures only valid data segments are passed to the processing IIFE.
    inputRows.slice(0, inputRows.indexOf(endMarker))
  ));

  // Output the final computed string, which contains all standard deviations, to the console.
  console.log(finalOutput);

// This entire script is wrapped in an IIFE that reads its input from the standard input stream,
// typically `/dev/stdin` in a Unix-like environment, using UTF-8 encoding.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
