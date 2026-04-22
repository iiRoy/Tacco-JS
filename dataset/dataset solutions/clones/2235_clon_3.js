"use strict"; // Enforce strict mode for cleaner code practices and better error detection

/**
 * Orchestrates the processing of raw input data to perform a specific calculation.
 * This function handles input parsing, data validation, core computation, and output.
 *
 * @param {string} rawInputData - The entire input content as a single string, typically from standard input.
 */
function processCalculationRequest(rawInputData) {
  // Step 1: Normalize and split the raw input string into an array of lines.
  // Using a regular expression split to robustly handle various newline characters and trim excess whitespace.
  const inputLinesArray = rawInputData.trim().split(/\s*\r?\n\s*/);

  // Step 2: Validate the number of input lines.
  // We expect at least three lines for the required numerical parameters.
  if (inputLinesArray.length < 3) {
    console.error("INPUT_ERROR: Insufficient data provided. Expected at least 3 numerical lines.");
    return; // Terminate execution if input is incomplete.
  }

  // Step 3: Parse and convert string inputs to integer numbers.
  // Using parseInt with radix 10 for explicit base conversion.
  const primaryDimension = parseInt(inputLinesArray[0], 10);   // Corresponds to 'h' in the original script
  const secondaryDimension = parseInt(inputLinesArray[1], 10); // Corresponds to 'w' in the original script (read but not used in final calculation)
  const totalUnits = parseInt(inputLinesArray[2], 10);         // Corresponds to 'n' in the original script

  // Step 4: Validate parsed numerical values.
  // Check if any of the parsed values resulted in Not-a-Number (NaN).
  if (isNaN(primaryDimension) || isNaN(secondaryDimension) || isNaN(totalUnits)) {
    console.error("DATA_PARSING_ERROR: One or more input values could not be converted to valid numbers.");
    return; // Terminate if any input is invalid.
  }

  // Step 5: Implement a crucial guard clause to prevent division by zero.
  // The primary dimension is used as a divisor, so it must not be zero.
  if (primaryDimension === 0) {
    console.error("MATH_ERROR: The primary dimension cannot be zero, as it would lead to division by zero.");
    return; // Terminate to avoid runtime errors.
  }

  // Step 6: Perform the core mathematical computation.
  // The original code had a redundant 'if (h > w)' block where both branches
  // performed the exact same calculation. This redundancy has been removed,
  // and the calculation is now directly performed.
  // First, calculate the raw division result.
  const intermediateFractionalResult = totalUnits / primaryDimension;

  // Second, apply the ceiling function to round up to the nearest whole number.
  const finalComputedValue = Math.ceil(intermediateFractionalResult);

  // Step 7: Output the final calculated value using a dedicated display function.
  emitResultToConsole(finalComputedValue);
}

/**
 * A utility function to standardize how results are displayed to the user.
 * Encapsulates the console logging mechanism.
 *
 * @param {number} valueToDisplay - The numeric value that needs to be printed to standard output.
 */
function emitResultToConsole(valueToDisplay) {
  console.log(valueToDisplay);
}

/**
 * This Immediately Invoked Function Expression (IIFE) serves as the entry point
 * for the script, handling the initial setup and error management for input reading.
 */
(function initializeAndExecute() {
  try {
    // Read the entire content from standard input synchronously.
    // The 'fs' module is a Node.js built-in, and '/dev/stdin' is the standard input path on Unix-like systems.
    // 'utf8' encoding ensures correct character interpretation.
    const systemInputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
    
    // Once input is successfully read, pass it to our main processing function.
    processCalculationRequest(systemInputBuffer);
  } catch (initializationError) {
    // Catch and report any errors that occur during the file reading or initial setup phase.
    console.error("SYSTEM_ERROR: Failed to read input or initialize the process.", initializationError.message);
    // Optionally, log the full error stack for debugging: console.error(initializationError);
  }
})(); // The IIFE is executed immediately upon script load.