// This script processes a single numeric input to perform a specific time-related calculation.
// It aims to determine a total duration based on an initial hour value.

/**
 * Utility object for displaying results to the console.
 * Provides a consistent interface for output operations.
 */
const displayUtility = {
  /**
   * Logs a message to the standard output.
   * @param {any} message - The data or message to be logged.
   */
  emitResult: (message) => {
    console.log(message);
  },

  /**
   * Logs an error message to the standard error output.
   * @param {string} errorMessage - The error description.
   */
  reportError: (errorMessage) => {
    console.error(`ERROR: ${errorMessage}`);
  }
};

/**
 * Reads a string from standard input.
 * This function is a wrapper for Node.js file system operations.
 * @returns {string} The content read from /dev/stdin, or an empty string if an error occurs.
 */
function retrieveStandardInputData() {
  try {
    // Attempt to read the entire content of the standard input stream.
    // The 'utf8' encoding ensures proper string conversion.
    const fileSystemModule = require("fs");
    return fileSystemModule.readFileSync("/dev/stdin", "utf8");
  } catch (inputReadError) {
    // If there's an issue reading input (e.g., file not found, permission error),
    // log the error and return an empty string to prevent further processing issues.
    displayUtility.reportError(`Failed to read input from stdin: ${inputReadError.message}`);
    return ""; // Return a default empty string in case of input reading failure.
  }
}

/**
 * Orchestrates the primary logic: parsing input, performing a calculation, and outputting the result.
 * This function calculates a total duration based on a given starting hour.
 * @param {string} rawInputString - The raw string input, expected to be a numeric value.
 */
function calculateTotalHoursFromInput(rawInputString) {
  // Define constants for the calculation, representing full cycles or base durations.
  const fullCycleHours = 24; // Represents a standard day or cycle length.

  // --- Input Validation and Parsing ---
  let initialHourValue;
  try {
    // Check if the input string is valid before attempting conversion.
    if (!rawInputString || rawInputString.trim() === '') {
      throw new Error("Input string is empty or contains only whitespace.");
    }

    // Attempt to convert the input string to a floating-point number.
    // parseFloat is used to be slightly more robust than parseInt for potential decimal inputs,
    // though the original problem implied integer hours. Number() would also work.
    initialHourValue = parseFloat(rawInputString.trim());

    // Validate if the conversion resulted in a valid number.
    if (isNaN(initialHourValue)) {
      throw new Error(`Invalid numeric input: '${rawInputString}'. Cannot convert to a number.`);
    }

    // Add a sanity check for the hour value, assuming it's usually positive.
    // This is an added guard clause.
    if (initialHourValue < 0) {
      displayUtility.reportError(`Negative hour value detected (${initialHourValue}). Proceeding with calculation, but this might indicate unexpected input.`);
    }

    // Optional: Clamp or warn if the hour is excessively large, indicating potential bad input.
    if (initialHourValue > fullCycleHours * 10) { // Arbitrary large number for "excessive"
        displayUtility.reportError(`Very large hour value detected (${initialHourValue}). This might be an unintended input.`);
    }

  } catch (parsingError) {
    // If any error occurs during parsing or validation, report it and terminate gracefully.
    displayUtility.reportError(`Input processing failed: ${parsingError.message}`);
    return; // Exit the function as valid input is not available.
  }

  // --- Core Calculation Logic ---
  // The calculation involves determining hours remaining in the current cycle
  // and then adding hours from an additional full cycle.

  // Step 1: Calculate the hours remaining in the *first* 24-hour cycle.
  // This is the difference between a full day and the initial hour.
  const hoursRemainingInCurrentCycle = fullCycleHours - initialHourValue;

  // Step 2: Add the duration of a subsequent full 24-hour cycle.
  // This represents the "plus 24" part of the original calculation.
  const additionalFullCycleHours = fullCycleHours; // Explicitly defining 24 for clarity.

  // Step 3: Combine the remaining hours from the first cycle with the second full cycle's hours.
  // This yields the final accumulated duration.
  const accumulatedDuration = hoursRemainingInCurrentCycle + additionalFullCycleHours;

  // --- Output Result ---
  // Display the final calculated duration using the utility.
  displayUtility.emitResult(accumulatedDuration);
}

// --- Program Entry Point ---
// When the script is executed, it first retrieves input, then performs the calculation.
const programInput = retrieveStandardInputData();
calculateTotalHoursFromInput(programInput);