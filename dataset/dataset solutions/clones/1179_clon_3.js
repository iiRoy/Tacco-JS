'use strict';
// This self-executing anonymous function serves as the main entry point
// for processing standard input data in a controlled scope.
(function(inputData) {
  // Convert the raw buffer input to a string and split it into an array of lines.
  const rawInputRows = inputData.toString().split('\n');

  // Define a specific string that acts as a termination marker for input data.
  const terminationMarker = '0';

  /**
   * Helper function to compute the arithmetic mean (average) of an array of numbers.
   * @param {number[]} values - An array of numeric values.
   * @returns {number} The calculated mean, or 0 if the array is empty to prevent division by zero.
   */
  const computeArithmeticMean = (values) => {
    if (values.length === 0) {
      return 0; // Returning 0 for an empty set is a common convention or a safe default.
    }
    const sum = values.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    return sum / values.length;
  };

  /**
   * Helper function to calculate the sum of squared differences from the mean for an array of numbers.
   * @param {number[]} values - An array of numeric values.
   * @param {number} mean - The pre-calculated mean of the values.
   * @returns {number} The sum of (value - mean)^2 for all values.
   */
  const computeSumOfSquaredDifferences = (values, mean) => {
    return values.reduce((accumulator, item) => accumulator + Math.pow(item - mean, 2), 0);
  };

  // This Immediately Invoked Function Expression (IIFE) encapsulates the core logic
  // for parsing input segments and calculating standard deviations.
  const finalOutputString = (function(processedInputSegments) {
    // An array to accumulate the results of each standard deviation calculation.
    const calculatedStdDevs = [];

    /**
     * Calculates the standard deviation for a given number of elements from a set of numeric values.
     * @param {number} numElements - The count of elements to consider for the calculation.
     * @param {number[]} numericValues - The array containing all potential numeric values.
     * @returns {string} The calculated standard deviation, formatted to 8 decimal places.
     */
    function calculateStandardDeviation(numElements, numericValues) {
      // Implement a guard clause for edge cases:
      // Standard deviation is typically 0 for a single element, and undefined/0 for zero elements.
      if (numElements <= 1) {
        return (0.0).toFixed(8); // Return 0.00000000 for consistency and robustness.
      }

      // Extract the exact number of values required for the calculation.
      // This defends against cases where 'numericValues' might contain more elements than 'numElements'.
      const effectiveValues = numericValues.slice(0, numElements);

      // Compute the average value using the dedicated helper function.
      const averageValue = computeArithmeticMean(effectiveValues);

      // Compute the sum of squared differences from the average using another helper.
      const sumOfSquaredDeviations = computeSumOfSquaredDifferences(effectiveValues, averageValue);

      // Calculate the final standard deviation by taking the square root of the variance.
      const standardDeviation = Math.sqrt(sumOfSquaredDeviations / numElements);

      // Format the result to a fixed number of decimal places as required.
      return standardDeviation.toFixed(8);
    }

    // Determine the relevant portion of the input data.
    // The `slice` method, when given `indexOf(terminationMarker)` as its second argument,
    // correctly handles cases where the marker is not found (returns -1, resulting in an empty array),
    // or is at the beginning (returns 0, resulting in an empty array).
    const dataToProcess = processedInputSegments.slice(0, processedInputSegments.indexOf(terminationMarker));

    // Initialize an index for iterating through the data pairs.
    let idx = 0;
    // Loop through the processed data, ensuring there's always a pair of rows (count and scores).
    while (idx + 1 < dataToProcess.length) {
      const countString = dataToProcess[idx];
      const scoresString = dataToProcess[idx + 1];

      // Convert the count string to a number.
      const numElements = Number(countString);
      // Parse the scores string into an array of numbers.
      const numericValues = scoresString.split(' ').map(Number);

      // Add a validation step: only process valid numerical inputs.
      // Skip if count is not a positive number, or if scores array is invalid/empty.
      if (!isNaN(numElements) && numElements > 0 && Array.isArray(numericValues) && numericValues.length > 0) {
          // If input is valid, calculate and store the standard deviation.
          calculatedStdDevs.push(calculateStandardDeviation(numElements, numericValues));
      } else {
          // In case of invalid input, we can log a warning or simply skip the pair.
          // Skipping ensures only valid calculations contribute to the output.
          // console.warn(`Warning: Skipping invalid input pair at index ${idx}. Count: '${countString}', Scores: '${scoresString}'`);
      }

      // Advance the index to the next pair of rows.
      idx += 2;
    }

    // Join all the calculated standard deviation strings with newline characters.
    return calculatedStdDevs.join('\n');

  }(rawInputRows)); // Pass the initial raw input rows to the IIFE for processing.

  // Print the final aggregated output string to the console.
  console.log(finalOutputString);

}(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read the entire content of /dev/stdin synchronously.