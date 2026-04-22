/**
 * This module provides a utility function designed to compute a specific numerical metric
 * from an input string. The calculation is based on the string's total length
 * and the frequency of a particular target character within it.
 */

/**
 * Analyzes a given raw string to derive a specific integer metric.
 * The process involves sanitizing the input, counting occurrences of a predefined character,
 * and performing a mathematical operation based on the string's length and character count.
 *
 * @param {string} rawInputData - The original string data, potentially containing leading/trailing whitespace.
 * @returns {number|NaN} The calculated integer metric, or `NaN` if the input is not a valid string.
 */
function processStringMetrics(rawInputData) {
  // Defensive programming: Validate the input type to ensure it's a string.
  // This prevents unexpected errors if non-string data is passed to string methods.
  if (typeof rawInputData !== 'string' || rawInputData === null || rawInputData === undefined) {
    console.error("ERR_INPUT_VALIDATION: Received an invalid input type. Expected a string.");
    // Returning NaN clearly indicates that a valid metric could not be computed.
    return NaN; 
  }

  // Configuration: Define the specific character that we are interested in counting.
  const characterToMonitor = 'p';

  // Data preparation: Remove any extraneous whitespace from the beginning and end of the string.
  // This ensures that the length calculation is based on the significant content.
  const sanitizedString = rawInputData.trim();
  
  // Basic metric: Determine the total number of characters in the cleaned string.
  const effectiveLength = sanitizedString.length;

  // Early exit for trivial cases: If the string is empty after trimming, the result is zero.
  // This optimizes performance and avoids unnecessary subsequent calculations.
  if (effectiveLength === 0) {
    // For an empty string, the formula (0 / 2 - 0) naturally yields 0.
    console.log(0);
    return 0; 
  }

  // Core counting mechanism: Count how many times `characterToMonitor` appears.
  // This uses a functional chain (split, filter, length) as an alternative to an imperative loop,
  // enhancing readability for this specific task.
  const countOfTargetChar = sanitizedString
                              .split('') // Convert string to an array of individual characters.
                              .filter(charElement => charElement === characterToMonitor) // Filter for the target character.
                              .length; // Get the count of filtered characters.

  // Intermediate calculation step 1: Compute half of the string's effective length.
  // This breaks down the final formula into manageable parts.
  const halfOfEffectiveLength = effectiveLength / 2;

  // Intermediate calculation step 2: Calculate the raw difference.
  // This is the core arithmetic operation before final adjustments.
  const rawCalculatedDifference = halfOfEffectiveLength - countOfTargetChar;

  // Final adjustment: Apply the floor operation to guarantee an integer result,
  // aligning with typical problem constraints for such metrics.
  const finalMetricResult = Math.floor(rawCalculatedDifference);

  // Output: Display the computed result to the standard output stream.
  console.log(finalMetricResult);
}

// Application entry point: An Immediately Invoked Function Expression (IIFE)
// to manage the lifecycle of reading input and executing the main logic.
(function initializeAndExecute() {
  try {
    // System interaction: Read all content from the standard input stream synchronously.
    // Assumes UTF-8 encoding for text input.
    const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    
    // Delegate the processing of the retrieved input content to our primary function.
    processStringMetrics(systemInputContent);
  } catch (inputReadError) {
    // Robust error handling: Catch and report any issues encountered during file reading.
    // This provides user feedback and ensures the script terminates gracefully in case of I/O errors.
    console.error("FATAL_ERROR: Unable to read input from /dev/stdin. Details:", inputReadError.message);
    process.exit(1); // Exit with a non-zero status code to indicate an error.
  }
})();