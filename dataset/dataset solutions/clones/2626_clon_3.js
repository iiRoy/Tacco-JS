"use strict";

// Constants for configuration and readability
const THRESHOLD_CAP = 3200;
const PRIMARY_COLOR_A = "pink";
const PRIMARY_COLOR_B = "red";
const MISSING_INPUT_MESSAGE = "Error: Input data is either missing or not a string.";
const INSUFFICIENT_LINES_MESSAGE = "Error: Expected at least two lines of input.";
const INVALID_NUMERIC_MESSAGE_PREFIX = "Error: Invalid numeric value encountered - ";
const UNRECOGNIZED_COLOR_WARNING_PREFIX = "Warning: Unrecognized color string - ";
const DEFAULT_FALLBACK_COLOR = "unspecified"; // A new default for robustness

/**
 * Safely acquires input content from standard input.
 * Exits the process if reading fails.
 * @returns {string} The content read from /dev/stdin.
 */
const retrieveSourceData = () => {
  try {
    // Using 'node:fs' for explicit Node.js module path
    return require("node:fs").readFileSync("/dev/stdin", "utf8");
  } catch (ioError) {
    console.error(`Fatal I/O Error: Could not read from standard input. Details: ${ioError.message}`);
    process.exit(1); // Terminate execution upon critical failure
  }
};

/**
 * Processes the raw text input according to specific business logic.
 * This function orchestrates parsing, validation, and conditional output.
 * @param {string} rawTextInput The entire input string, typically from stdin.
 */
const performCoreLogic = (rawTextInput) => {
  // Validate initial input
  if (typeof rawTextInput !== 'string' || rawTextInput.length === 0) {
    console.error(MISSING_INPUT_MESSAGE);
    return; // Halt execution if input is fundamentally flawed
  }

  // Split input into individual lines, trimming leading/trailing whitespace from the whole block
  const lineSegments = rawTextInput.trim().split("\n");

  // Ensure minimum input structure is present
  if (lineSegments.length < 2) {
    console.error(INSUFFICIENT_LINES_MESSAGE);
    return;
  }

  // Extract and prepare components for processing
  const firstLineContent = lineSegments[0];
  const secondLineContent = lineSegments[1];

  // Convert the first line to an integer, explicitly specifying radix for safety
  const numericalIndicator = parseInt(firstLineContent, 10);

  // Validate the numerical conversion
  if (isNaN(numericalIndicator)) {
    console.error(`${INVALID_NUMERIC_MESSAGE_PREFIX}'${firstLineContent}'.`);
    return;
  }

  // Normalize the second line (color string) to lowercase for case-insensitive comparison
  const normalizedColorName = secondLineContent.toLowerCase();

  let computedResult; // Variable to hold the final determined output

  // Apply primary conditional logic based on the numerical indicator against the threshold
  if (numericalIndicator >= THRESHOLD_CAP) {
    // If the indicator meets or exceeds the cap, the output is simply the normalized color.
    computedResult = normalizedColorName;
  } else {
    // Otherwise, a color transformation rule applies.
    // Utilize a switch statement for clear and extensible color-based logic.
    switch (normalizedColorName) {
      case PRIMARY_COLOR_A:
        computedResult = PRIMARY_COLOR_B;
        break;
      case PRIMARY_COLOR_B:
        computedResult = PRIMARY_COLOR_A;
        break;
      default:
        // Handle cases where the color string is not recognized.
        // This is a Type III addition for robustness.
        console.warn(`${UNRECOGNIZED_COLOR_WARNING_PREFIX}'${secondLineContent}'. Using default fallback.`);
        computedResult = DEFAULT_FALLBACK_COLOR; // Fallback to a predefined value
        break;
    }
  }

  // Emit the final computed result to standard output
  console.log(computedResult);
};

// Self-invoking anonymous function to manage the application's entry point
(() => {
  const acquiredDataPayload = retrieveSourceData(); // Get input
  performCoreLogic(acquiredDataPayload); // Process it
})();