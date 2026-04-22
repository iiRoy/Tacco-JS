/**
 * This module provides utilities for ordering collections based on various criteria
 * and a main routine to process numerical input data.
 */

/**
 * Generates a comparison function suitable for use with Array.prototype.sort().
 * This function determines the core comparison logic and applies a sort order multiplier.
 *
 * @param {string} comparisonCriterion - Specifies the type of comparison (e.g., 'NUMERICAL_SORT', 'ALPHABETICAL_SORT').
 * @param {number} sortOrderMultiplier - A multiplier to control the sort direction (e.g., 1 for ascending, -1 for descending).
 * @returns {function(any, any): number} A comparison function that returns a negative, zero, or positive value.
 */
function obtainComparisonRoutine(comparisonCriterion, sortOrderMultiplier) {
  let activeComparator; // This variable will hold the specific comparison logic.

  // Determine the base comparison logic based on the provided criterion.
  switch (comparisonCriterion) {
    case "NUMERICAL_SORT":
      // For numerical comparison, parse values to floats and subtract.
      activeComparator = (firstItem, secondItem) => {
        const numericalValueA = parseFloat(firstItem);
        const numericalValueB = parseFloat(secondItem);
        return numericalValueA - numericalValueB;
      };
      break;

    case "ALPHABETICAL_SORT":
      // For textual comparison, convert to string and compare lexicographically.
      activeComparator = (firstItem, secondItem) => {
        const stringFormA = String(firstItem); // Ensure explicit string conversion
        const stringFormB = String(secondItem);
        // Returns 1 if A > B, -1 if A < B, 0 if A == B.
        return stringFormA > stringFormB ? 1 : (stringFormA < stringFormB ? -1 : 0);
      };
      break;

    case "CASE_INSENSITIVE_SORT":
      // For case-insensitive textual comparison, convert to lowercase strings before comparing.
      activeComparator = (firstItem, secondItem) => {
        const lowerStringFormA = String(firstItem).toLowerCase();
        const lowerStringFormB = String(secondItem).toLowerCase();
        // Returns 1 if A > B, -1 if A < B, 0 if A == B, ignoring case.
        return lowerStringFormA > lowerStringFormB ? 1 : (lowerStringFormA < lowerStringFormB ? -1 : 0);
      };
      break;

    default:
      // If an unrecognized criterion is provided, log a warning and default to alphabetical sort.
      console.warn(`Warning: Unknown comparison criterion '${comparisonCriterion}'. Defaulting to 'ALPHABETICAL_SORT'.`);
      activeComparator = (firstItem, secondItem) => {
        const stringFormA = String(firstItem);
        const stringFormB = String(secondItem);
        return stringFormA > stringFormB ? 1 : (stringFormA < stringFormB ? -1 : 0);
      };
      break;
  }

  // Return a closure that applies the determined comparison logic
  // and then adjusts the result based on the desired sort order (ascending/descending).
  return (firstItem, secondItem) => activeComparator(firstItem, secondItem) * sortOrderMultiplier;
}

/**
 * Processes a raw input string containing space-separated numbers.
 * It sorts these numbers numerically in descending order and then calculates
 * the sum of the absolute differences between all adjacent elements in the sorted sequence.
 * The final sum is printed to the console.
 *
 * @param {string} rawDataString - The raw string input, expected to contain space-separated numerical values.
 */
function processInputAndCalculate(rawDataString) {
  // Input validation: Ensure the provided input is indeed a string.
  if (typeof rawDataString !== 'string') {
    console.error("Error: Input for processing must be a string. Received:", typeof rawDataString);
    return; // Exit early if input is invalid.
  }

  // Split the raw string into individual tokens using one or more whitespace characters as delimiters.
  // Then, filter out any empty tokens that might result from extra spaces.
  const initialTokens = rawDataString.split(/\s+/).filter(token => token.trim() !== '');

  // Guard clause: If there are fewer than two numerical tokens,
  // no differences between adjacent elements can be calculated.
  if (initialTokens.length < 2) {
    console.log(0); // In this scenario, the sum of differences is conventionally zero.
    return;
  }

  // Convert all collected tokens to numbers and then sort them.
  // We use the 'NUMERICAL_SORT' criterion with a multiplier of -1 for descending order.
  const descendingNumericalSorter = obtainComparisonRoutine("NUMERICAL_SORT", -1);
  const orderedValues = initialTokens.map(Number).sort(descendingNumericalSorter);

  // Initialize an accumulator for the total sum of absolute differences.
  let cumulativeDifferenceSum = 0;

  // Iterate through the sorted array starting from the second element.
  // In each step, calculate the absolute difference between the current element
  // and its immediate predecessor, then add this difference to the total sum.
  for (let idx = 1; idx < orderedValues.length; idx++) {
    const currentElement = orderedValues[idx];
    const previousElement = orderedValues[idx - 1];

    // Calculate the absolute difference between the two adjacent numbers.
    const absoluteDelta = Math.abs(currentElement - previousElement);
    cumulativeDifferenceSum += absoluteDelta;
  }

  // Output the final calculated sum of absolute differences.
  console.log(cumulativeDifferenceSum);
}

// --- Main execution block for the application ---
// Define a constant for the standard input file descriptor, which is commonly 0 in Node.js.
const STANDARD_INPUT_FILE_DESCRIPTOR = 0;

try {
  // Attempt to read all content from standard input (stdin) as a UTF-8 string.
  // The `fs.readFileSync` method is synchronous.
  const fileContent = require('fs').readFileSync(STANDARD_INPUT_FILE_DESCRIPTOR, 'utf8');

  // Process the content, ensuring to trim any leading/trailing whitespace (like newlines).
  processInputAndCalculate(fileContent.trim());
} catch (inputReadError) {
  // Catch and report any errors that occur during the reading of standard input.
  console.error("Error: Failed to read input from standard input stream.", inputReadError.message);
  // Depending on desired error handling, one might exit the process here or provide a default value.
}