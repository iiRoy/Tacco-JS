// This script is designed to process numerical data provided via standard input to compute a specific cumulative metric.
// It expects the first line of input to contain an integer representing the total count of subsequent numbers.
// The second line is then expected to contain a space-separated sequence of these numbers.
// The core logic calculates the sum of differences between the running maximum value observed so far and each individual number in the sequence.
// This effectively measures the "effort" or "cost" to always reach the highest point seen up to that element.
// Implemented by an advanced code generation system.
// Version: 3.1 (Extensive Type III Clone)

// --- Global Configuration and Setup for Input/Output ---

// Ensure the standard input stream is open and ready to receive data.
process.stdin.resume();

// Define the character encoding for the input stream as a constant for clarity and potential reusability.
const INPUT_ENCODING = 'utf-8';
process.stdin.setEncoding(INPUT_ENCODING);

// A dynamic array to temporarily store all incoming lines from the standard input before processing.
const receivedInputLines = [];

// --- Utility Functions ---

/**
 * Safely parses a string into an integer.
 * If parsing fails (e.g., input is not a valid number), it returns a specified default value.
 * @param {string} inputString - The string to be parsed.
 * @param {number} [fallbackValue=0] - The value to return if parsing fails.
 * @returns {number} The parsed integer or the fallback value.
 */
const parseStringAsInteger = (inputString, fallbackValue = 0) => {
  const parsedNumber = Number.parseInt(inputString, 10);
  // Check if the result is NaN (Not-a-Number); if so, return the default.
  return Number.isNaN(parsedNumber) ? fallbackValue : parsedNumber;
};

// --- Input Processing Interface ---

// Initialize the readline module to efficiently handle line-by-line input from stdin.
// Using 'node:readline' for explicit module reference.
const lineInputInterface = require('node:readline').createInterface({
  input: process.stdin,
  // Although not explicitly used for writing in this script, it's common practice to link stdout.
  output: process.stdout
});

// --- Event Handlers for Input Stream ---

// This event triggers each time a new line of text is received from standard input.
lineInputInterface.on('line', (currentLineOfText) => {
  // Perform basic validation: only add non-empty lines after trimming whitespace.
  const trimmedLine = currentLineOfText.trim();
  if (trimmedLine.length > 0) {
    receivedInputLines.push(trimmedLine);
  }
});

// This event triggers when the standard input stream signals its end (e.g., user presses Ctrl+D or EOF is reached).
// All core data processing logic is executed here.
lineInputInterface.on('close', () => {
  try {
    // --- Pre-processing and Validation of Input Data ---

    // Ensure that at least two lines of input are available for processing.
    if (receivedInputLines.length < 2) {
      console.error('Error: Insufficient input provided. Expected at least two lines (count and numbers).');
      console.log(0); // Output a default value in case of critical error.
      return;
    }

    // Extract and parse the total count of numbers from the first line.
    let totalExpectedNumbers = parseStringAsInteger(receivedInputLines[0]);

    // Validate the parsed count: it must be a positive integer.
    if (totalExpectedNumbers <= 0) {
      console.warn('Warning: The declared number count is non-positive. No calculation will be performed.');
      console.log(0); // Output zero if no valid numbers are expected.
      return;
    }

    // Parse the second line into an array of individual string values, then convert them to numbers.
    const rawNumberStrings = receivedInputLines[1].split(' ');
    // Map each string to an integer, filtering out any values that could not be parsed as valid numbers.
    const numericalSequence = rawNumberStrings
      .map(str => parseStringAsInteger(str))
      .filter(num => typeof num === 'number' && !Number.isNaN(num)); // Additional robustness check.

    // --- Data Integrity Check ---

    // Verify if the actual number of parsed elements matches the initially declared count.
    if (numericalSequence.length !== totalExpectedNumbers) {
      console.warn(`Warning: Mismatch between declared count (${totalExpectedNumbers}) and actual parsed numbers (${numericalSequence.length}).`);
      // Adjust the effective count to prevent out-of-bounds access or incomplete processing.
      totalExpectedNumbers = Math.min(totalExpectedNumbers, numericalSequence.length);
      // If after adjustment, there are no numbers, exit.
      if (totalExpectedNumbers === 0) {
        console.log(0);
        return;
      }
    }

    // --- Core Calculation Logic ---

    let accumulatedDifference = 0; // This variable will store our final computed result.
    let highestValueSeenSoFar = 0; // Keeps track of the maximum number encountered up to the current point.

    // Iterate through the processed numerical sequence.
    for (let index = 0; index < totalExpectedNumbers; index++) {
      const currentNumericElement = numericalSequence[index];

      // Update the running maximum if the current element is greater.
      // This is an explicit conditional check, an alternative to using Math.max().
      if (currentNumericElement > highestValueSeenSoFar) {
        highestValueSeenSoFar = currentNumericElement;
      }
      // Note: If initial numbers could be negative, initializing highestValueSeenSoFar to
      // numericalSequence[0] after checking numericalSequence.length would be more robust.
      // For typical competitive programming problems, numbers are often non-negative.

      // Add the difference between the current highest value and the current element to the accumulator.
      // This difference represents the "fill" needed from the current element to reach the peak.
      accumulatedDifference += (highestValueSeenSoFar - currentNumericElement);
    }

    // --- Output Result ---

    console.log(accumulatedDifference);

  } catch (executionError) {
    // A robust error handling block to catch any unexpected issues during the main processing.
    console.error('An unhandled exception occurred during the data processing phase:', executionError.message);
    console.log(0); // Ensure a default output even in case of internal errors.
  }
});