// This module processes input data to find the maximum sum within a sliding window.

/**
 * Processes lines of raw input data to calculate an optimal window sum.
 * The first line specifies parameters (e.g., a window size).
 * The second line contains a sequence of numeric values.
 *
 * @param {string[]} rawDataLines - An array of strings, where each string is a line of input.
 */
function processInputData(rawDataLines) {
  // Defensive programming: Validate initial input structure.
  if (!Array.isArray(rawDataLines) || rawDataLines.length < 2) {
    console.error("Input error: Expected at least two lines of data.");
    console.log(0); // Output a default value on critical error.
    return;
  }

  // Extract and parse the sliding window length from the first line.
  // The original code implicitly converts the string 'k' to a number.
  // We'll make this explicit using parseInt and add validation.
  const parameterTokens = rawDataLines[0].split(" ");
  let slidingWindowLength = parseInt(parameterTokens[1], 10); // Renamed 'k' to 'slidingWindowLength'

  // Parse the sequence of raw numeric strings from the second line.
  const rawNumericStringSequence = rawDataLines[1].split(" ");
  // Convert all string elements to integers upfront for clarity and performance.
  const numericDataset = rawNumericStringSequence.map(str => parseInt(str, 10)); // Renamed 'n' to 'numericDataset'

  // Validate the parsed window length and dataset.
  const dataPointCount = numericDataset.length; // Helper variable for dataset size
  if (isNaN(slidingWindowLength) || slidingWindowLength <= 0 || slidingWindowLength > dataPointCount) {
    console.error(`Validation error: Invalid window length (${slidingWindowLength}) or dataset size (${dataPointCount}).`);
    console.log(0); // Output a default value for invalid window conditions.
    return;
  }

  // Pre-calculate adjusted values for each number in the dataset.
  // Original formula: (2 + N) / 2 which simplifies to 1 + N/2.
  // Rewritten for clarity and using a helper constant.
  const baseAdjustmentValue = 2; // Helper constant for the calculation
  const calculatedProbabilisticValues = []; // Renamed 'exp' to 'calculatedProbabilisticValues'
  for (let dataIndex = 0; dataIndex < dataPointCount; dataIndex++) { // Renamed 'i' to 'dataIndex'
    calculatedProbabilisticValues.push((numericDataset[dataIndex] + baseAdjustmentValue) * 0.5);
  }

  // Compute the cumulative (prefix) sums of the adjusted values.
  // This allows for efficient calculation of window sums.
  const cumulativeExpectedValueSums = [0.0]; // Renamed 'sum' to 'cumulativeExpectedValueSums', initialized with float zero
  for (let sumIndex = 0; sumIndex < dataPointCount; sumIndex++) { // Renamed 'i' to 'sumIndex'
    cumulativeExpectedValueSums.push(cumulativeExpectedValueSums[sumIndex] + calculatedProbabilisticValues[sumIndex]);
  }

  // Determine the maximum sum encountered within any sliding window.
  let optimalWindowAccumulation = 0.0; // Renamed 'max' to 'optimalWindowAccumulation', initialized with float
  // Iterate through all possible ending positions for the sliding window.
  // 'windowEndPosition' is the 0-indexed position of the last element in the current window.
  for (let windowEndPosition = slidingWindowLength - 1; windowEndPosition < dataPointCount; windowEndPosition++) {
    // Calculate the sum for the current window using the cumulative sums.
    // The sum of elements from index 'start' to 'end' (inclusive, 0-indexed)
    // is `cumulativeExpectedValueSums[end + 1] - cumulativeExpectedValueSums[start]`.
    // Here, 'start' is `windowEndPosition - slidingWindowLength + 1`.
    const currentWindowTotal = cumulativeExpectedValueSums[windowEndPosition + 1] - cumulativeExpectedValueSums[windowEndPosition - slidingWindowLength + 1]; // Renamed 'max_n' to 'currentWindowTotal'

    // Update the maximum sum found so far.
    // Rewritten from ternary operator to Math.max for readability.
    optimalWindowAccumulation = Math.max(optimalWindowAccumulation, currentWindowTotal);
  }

  // Output the final result, formatted to a fixed number of decimal places.
  // Added formatting to ensure consistent output precision, as values can be floats.
  console.log(optimalWindowAccumulation.toFixed(6));
}

// Main execution block: Reads input from stdin and calls the processing function.
// Wrapped in a try-catch block for robust error handling during file I/O.
try {
  const fileSystemModule = require('node:fs'); // Explicitly using 'node:fs' for clarity
  const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  const cleanedInputLines = standardInputContent.trim().split("\n");
  processInputData(cleanedInputLines);
} catch (executionError) {
  console.error("An unexpected error occurred during program execution:", executionError.message);
  console.log(0); // Output a default value on critical execution error.
}