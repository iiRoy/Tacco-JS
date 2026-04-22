/**
 * This module contains a function designed to analyze a given string of numerical data
 * to find specific patterns. It identifies and counts all non-empty contiguous substrings
 * that, when interpreted as an integer, are perfectly divisible by a predefined target value.
 *
 * The function aims for robustness by including input validation and explicit data type conversions.
 */

/**
 * Processes a provided sequence of characters to discover numeric sub-patterns.
 * The core logic involves iterating through all possible non-empty sub-sequences,
 * converting each into a number, and checking its divisibility against a constant modulus.
 *
 * @param {string} rawDataSegments - The primary input string. It is expected to contain
 *                                   characters that can be parsed into integers.
 *                                   For example, "12345" or "9876".
 * @returns {number} The total count of unique sub-sequences that meet the divisibility criterion.
 *                   Returns 0 if the input is invalid or no such sub-sequences are found.
 */
function processInputData(rawDataSegments) {
  // Establish the constant divisor for the modulo operation.
  // This value is a fundamental parameter of the problem.
  const DIVISOR_MAGNITUDE = 2019;

  // --- Input Validation Guard Clause ---
  // Ensure the input is a valid non-empty string.
  // An empty or non-string input cannot contain any valid numeric sub-sequences.
  if (typeof rawDataSegments !== 'string' || rawDataSegments.length === 0) {
    // Log a warning for invalid input (optional, but good for debugging/robustness).
    // console.warn("Warning: Invalid or empty input provided to processInputData.");
    return 0; // No patterns can be found with invalid input.
  }

  // Assign the validated input to a more descriptive variable.
  // Using 'let' to signify that this data sequence could theoretically be modified,
  // although it remains constant in this particular implementation.
  let dataSequence = rawDataSegments;

  // Initialize a counter to keep track of how many divisible sub-sequences are found.
  let foundDivisibleSubarrays = 0;

  // --- Outer Loop: Defines the starting point of each potential sub-sequence ---
  // Iterates from the first character (index 0) up to the last character of the data sequence.
  for (let startIndex = 0; startIndex < dataSequence.length; ++startIndex) {

    // --- Inner Loop: Defines the ending point of each potential sub-sequence ---
    // This loop ensures that 'endIndex' always points to a character *after* 'startIndex',
    // guaranteeing that the extracted 'currentSubsegment' is never empty.
    // The loop runs until 'endIndex' is one past the last character, allowing 'substring'
    // to correctly capture sequences extending to the very end of 'dataSequence'.
    for (let endIndex = startIndex + 1; endIndex <= dataSequence.length; endIndex++) {

      // --- Intermediate Step: Extract the sub-sequence ---
      // Obtain the current contiguous portion of the data sequence.
      // 'substring(start, end)' extracts characters from 'start' up to (but not including) 'end'.
      const currentSubsegment = dataSequence.substring(startIndex, endIndex);

      // --- Data Type Conversion and Validation ---
      // Explicitly convert the extracted string sub-sequence into a numeric value.
      // This step is critical as the modulo operation requires a number.
      // Number() handles cases where the string might not be a valid number (e.g., "abc")
      // by returning NaN (Not a Number).
      const numericValue = Number(currentSubsegment);

      // --- Conditional Check: Divisibility and Numeric Validity ---
      // 1. Ensure 'numericValue' is actually a number (not NaN). This prevents errors
      //    if the input string contains non-digit characters that lead to an invalid number.
      // 2. Check if the numeric value is perfectly divisible by our target 'DIVISOR_MAGNITUDE'.
      //    The remainder of the division must be zero.
      if (!isNaN(numericValue) && (numericValue % DIVISOR_MAGNITUDE === 0)) {
        // If both conditions are met, we have found a valid pattern.
        // Increment the counter.
        foundDivisibleSubarrays++;
      }
    }
  }

  // --- Result Output ---
  // Instead of directly printing, the function returns the calculated count.
  // This design promotes modularity, allowing the caller to decide how to handle the result
  // (e.g., print to console, use in further calculations, display in a UI).
  return foundDivisibleSubarrays;
}

// --- Execution Context ---
// This block demonstrates how the `processInputData` function might be invoked
// when executed as a standalone script, typically in a command-line environment.
// It reads input from standard input, processes it, and then outputs the result.

// Retrieve the raw string input from standard input.
// The `trim()` method is added to remove any leading/trailing whitespace,
// especially newline characters that `readFileSync` might include,
// which could interfere with numeric parsing of the entire string.
const systemDataFeed = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

// Execute the main processing logic with the obtained system input.
const finalTally = processInputData(systemDataFeed);

// Output the final count of divisible sub-sequences to the console.
console.log(finalTally);