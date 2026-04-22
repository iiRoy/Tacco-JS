/**
 * This module is designed to process a numerical dataset, transforming each element
 * based on its relation to two specific pivot values. These pivot values are derived
 * from the sorted version of the input sequence, essentially representing "median-like"
 * boundaries. The primary goal is to re-map elements below or equal to the lower pivot
 * to the upper pivot, and elements above the lower pivot to the lower pivot.
 */

/**
 * A utility function to safely parse a string containing space-separated numbers
 * into an array of numeric values. It handles empty strings or non-numeric parts.
 *
 * @param {string} numberString - The string of numbers (e.g., "10 20 30").
 * @returns {number[]} An array containing the parsed numbers. Returns an empty array
 *                     if the input string is invalid or contains no valid numbers.
 */
function parseNumbersFromString(numberString) {
  // Ensure we're working with a string and trim whitespace for robust parsing.
  if (typeof numberString !== 'string' || numberString.trim() === '') {
    return []; // Return an empty array for invalid or empty input.
  }
  // Split the string by one or more spaces, filter out any resulting empty strings,
  // and convert each valid string part to a number.
  return numberString.split(/\s+/).filter(segment => segment !== '').map(segment => Number(segment));
}

/**
 * Computes two pivot values (a 'lower' and an 'upper' pivot) from a numerically sorted array.
 * These pivots are typically chosen from the central elements of the sorted sequence,
 * mimicking indices around the mathematical median.
 *
 * @param {number[]} sortedArray - The input array, which must be sorted in ascending order.
 * @param {number} declaredLength - The declared total number of elements in the original sequence
 *                                  (as read from the input, not necessarily `sortedArray.length`).
 * @returns {{lower: number, upper: number}} An object containing the calculated lower and upper pivot values.
 *                                         Returns {lower: 0, upper: 0} for empty or invalid lengths,
 *                                         or {lower: element, upper: element} for a single-element array.
 */
function determinePivotValues(sortedArray, declaredLength) {
  // Handle edge cases where the sequence length is too small to determine two distinct pivots.
  if (declaredLength <= 0) {
    // For zero or negative length, pivots are undefined. Defaulting to 0 is a safe fallback.
    return { lower: 0, upper: 0 };
  }
  if (declaredLength === 1) {
    // If only one element, both pivots logically refer to that single element.
    return { lower: sortedArray[0], upper: sortedArray[0] };
  }

  // Calculate the indices for the two central elements.
  // JavaScript's array access `arr[float]` implicitly floors the float index.
  // Example: For declaredLength = 4, indices are (4/2 - 1) = 1 and (4/2) = 2.
  // Example: For declaredLength = 5, indices are (5/2 - 1) = 1.5 -> 1 and (5/2) = 2.5 -> 2.
  // To explicitly represent this behavior and ensure integer indices:
  const lowerPivotIndex = Math.floor(declaredLength / 2) - 1;
  const upperPivotIndex = Math.floor(declaredLength / 2);

  // Retrieve the actual values from the sorted array using the calculated indices.
  // These indices are guaranteed to be valid for `declaredLength >= 2`.
  const lowerPivot = sortedArray[lowerPivotIndex];
  const upperPivot = sortedArray[upperPivotIndex];

  return { lower: lowerPivot, upper: upperPivot };
}

/**
 * The main processing function that orchestrates the transformation of the input data.
 * It reads the sequence length and the sequence of numbers, determines pivot values,
 * and then applies a conditional transformation to each number in the original sequence.
 *
 * @param {string} rawDataString - The complete multi-line input string.
 *   Expected format:
 *     Line 1: A single integer representing the count of numbers (N).
 *     Line 2: N space-separated integers.
 * @returns {string} A newline-separated string where each number is the result of the transformation.
 *                   Returns an empty string if input is invalid or cannot be processed.
 */
function ProcessInputData(rawDataString) {
  // Initial validation: Ensure the input string is valid and not empty.
  if (typeof rawDataString !== 'string' || rawDataString.trim() === '') {
    console.error("Execution Error: Received empty or invalid input data string.");
    return ""; // Return an empty string to indicate failure.
  }

  // Split the entire raw input into an array of individual lines.
  const inputLines = rawDataString.split("\n");

  // Validate that there are enough lines to extract the necessary information.
  if (inputLines.length < 2) {
    console.error("Execution Error: Insufficient input lines. Expected at least two lines (length and data).");
    return "";
  }

  // Parse the declared sequence length from the first line of input.
  const declaredSequenceLength = parseInt(inputLines[0].trim(), 10);

  // Validate the parsed sequence length. It must be a non-negative integer.
  if (isNaN(declaredSequenceLength) || declaredSequenceLength < 0) {
    console.error("Execution Error: Invalid or negative sequence length detected in input.");
    return "";
  }

  // Parse the original numeric sequence from the second line of input.
  const originalNumericSequence = parseNumbersFromString(inputLines[1]);

  // Provide a warning if the declared length does not match the actual count of parsed numbers.
  // The processing logic will proceed using the 'declaredSequenceLength' as the authoritative count
  // for iterations and pivot determination, mirroring the original code's implicit behavior
  // (which might lead to `undefined` values if `originalNumericSequence` is shorter than declared).
  if (originalNumericSequence.length !== declaredSequenceLength) {
    console.warn(`Data Mismatch Warning: Declared sequence length (${declaredSequenceLength}) does not match the actual number of parsed elements (${originalNumericSequence.length}). Processing will use the declared length as primary.`);
  }

  // Create a sorted duplicate of the original sequence. This copy is used only for pivot calculation,
  // ensuring the original sequence's order remains unchanged for the final transformation loop.
  const sortedNumericSequence = [...originalNumericSequence].sort((valueA, valueB) => valueA - valueB);

  // Determine the two pivot values (lower and upper) using the sorted sequence and the declared length.
  const { lower: lowerPivotValue, upper: upperPivotValue } = determinePivotValues(
    sortedNumericSequence,
    declaredSequenceLength // Pass the declared length as the basis for pivot calculation.
  );

  // Initialize a buffer to store the results of each element's transformation.
  const transformedResultsBuffer = [];

  // Iterate through the sequence based on the declared length.
  // This loop explicitly uses `declaredSequenceLength` as its boundary.
  for (let currentElementIndex = 0; currentElementIndex < declaredSequenceLength; currentElementIndex++) {
    // Retrieve the current value from the original sequence.
    // If `currentElementIndex` exceeds `originalNumericSequence.length`, `currentValue` will be `undefined`.
    const currentValue = originalNumericSequence[currentElementIndex];

    // Apply the core transformation logic:
    // If `currentValue` is `undefined` (e.g., due to short input), the comparison `undefined <= lowerPivotValue`
    // evaluates to `false`. In such cases, the `lowerPivotValue` will be assigned.
    const transformedValue = currentValue <= lowerPivotValue ? upperPivotValue : lowerPivotValue;

    // Add the transformed value to our results buffer.
    transformedResultsBuffer.push(transformedValue);
  }

  // Join all transformed values with newline characters to form the final output string.
  return transformedResultsBuffer.join("\n");
}

// Main execution block: This section handles reading input from the system's standard input
// and printing the processed output to standard output. It includes error handling for robustness.
try {
  // Use Node.js 'fs' module to synchronously read all data from standard input.
  // The input is expected to be UTF-8 encoded.
  const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

  // Call the primary processing function with the read content.
  const finalOutputString = ProcessInputData(standardInputContent);

  // Output the final transformed string to standard output.
  console.log(finalOutputString);
} catch (executionError) {
  // Catch and report any errors that occur during file reading or the main processing.
  console.error("A critical error occurred during program execution:", executionError.message);
  // Exit with a non-zero status code to indicate that the program terminated with an error.
  process.exit(1);
}