// This module is designed to ingest a single line of string data,
// parse its constituent parts, and perform a conditional arithmetic calculation.
// The specific operation executed is determined by the parity (odd/even)
// of the final digit within the fourth segment of the input.

/**
 * Determines if a given integer is an odd number.
 * This helper function enhances readability and modularity.
 * @param {number} valueToCheck The numeric value whose parity is to be assessed.
 * @returns {boolean} Returns `true` if `valueToCheck` is odd; `false` otherwise.
 */
const checkNumberParity = (valueToCheck) => {
  // The modulo operator (%) returns the remainder of a division.
  // For odd numbers, the remainder when divided by 2 is 1 (or -1 for negative odds).
  // Using Math.abs ensures consistent behavior for negative numbers if they were ever introduced.
  return Math.abs(valueToCheck) % 2 === 1;
};

/**
 * Orchestrates the parsing of input and the execution of the primary logic.
 * It takes a raw string, splits it into components, extracts key numeric values,
 * and then computes a result based on a conditional rule.
 *
 * @param {string} incomingDataString The complete string received from the input source.
 *                                    It is expected to be a sequence of space-separated tokens.
 *                                    The first two tokens should be convertible to integers,
 *                                    and the fourth token should be a string of digits.
 * @returns {void} The function prints its final computed result directly to the console.
 */
function processInputPayload(incomingDataString) {
  // First, normalize the input string by removing any leading or trailing whitespace,
  // then divide it into an array of individual components using space as the delimiter.
  const stringComponents = incomingDataString.trim().split(" ");

  // Implement a preliminary validation step to ensure the integrity of the input structure.
  // The core logic requires at least four distinct segments to proceed.
  if (stringComponents.length < 4) {
    console.error("Input processing error: Not enough data segments found. Expected a minimum of 4.");
    // Terminate execution gracefully if the input format is severely incorrect.
    return;
  }

  // Explicitly convert the first two segments into base-10 integers.
  // This avoids potential implicit type coercion issues and makes intent clear.
  const firstValueAsInt = parseInt(stringComponents[0], 10);
  const secondValueAsInt = parseInt(stringComponents[1], 10);

  // Retrieve the fourth segment, which contains the critical digit for our condition.
  const fourthSegmentString = stringComponents[3];

  // Another validation step: ensure the fourth segment isn't an empty string,
  // as we need to extract a digit from it.
  if (fourthSegmentString.length === 0) {
    console.error("Input processing error: The fourth segment was empty. Cannot extract a controlling digit.");
    return;
  }

  // Extract the last character from the fourth segment string and convert it to a number.
  // Using the modern `.at(-1)` method for robust last-character access.
  const controllingDigit = Number(fourthSegmentString.at(-1));

  // Initialize a variable to hold the outcome of our arithmetic calculation.
  let calculatedResult;

  // The central conditional logic:
  // If the `controllingDigit` is odd, perform one subtraction.
  // If the `controllingDigit` is even (or zero), perform the alternative subtraction.
  if (checkNumberParity(controllingDigit)) {
    // Scenario A: The controlling digit is odd.
    // The operation is (second value - first value).
    calculatedResult = secondValueAsInt - firstValueAsInt;
  } else {
    // Scenario B: The controlling digit is even (or zero).
    // The operation is (first value - second value).
    calculatedResult = firstValueAsInt - secondValueAsInt;
  }

  // Finally, display the determined result to the standard output.
  console.log(calculatedResult);
}

// --- Primary Execution Entry Point ---
// This block is responsible for setting up the environment,
// reading the necessary input, and invoking the main processing function.
try {
  // Dynamically load the Node.js 'fs' (File System) module.
  const fileSystemUtility = require("fs");

  // Read all data from the standard input stream ('/dev/stdin').
  // The 'utf8' encoding ensures correct interpretation of text.
  // `.trim()` is applied to remove any trailing newline characters or other whitespace.
  const rawInputFromSystem = fileSystemUtility.readFileSync("/dev/stdin", "utf8").trim();

  // Pass the acquired raw input string to our dedicated processing function.
  processInputPayload(rawInputFromSystem);
} catch (ioError) {
  // Catch and report any exceptions that occur during the input reading phase.
  // This provides robust error feedback to the user or calling environment.
  console.error(`An error occurred while reading standard input: ${ioError.message}`);
  // Exit the process with a non-zero status code to indicate failure.
  process.exit(1);
}