// Core module for managing console input and output operations.
const ioManager = require('readline');

// Configuration for the interactive command-line interface.
const appConsoleInterface = ioManager.createInterface({
  input: process.stdin,  // Specifies the standard input stream.
  output: process.stdout // Specifies the standard output stream.
});

// Define boundary constants for valid month and day values.
const MIN_CALENDAR_MONTH = 1;
const MAX_CALENDAR_MONTH = 12;
const MIN_CALENDAR_DAY = 1;
const MAX_CALENDAR_DAY = 31; // This is a simplified max day, not accounting for month-specific lengths.

/**
 * Checks if a given numeric value is within a specified inclusive range.
 * @param {number} valToCheck - The number to be validated.
 * @param {number} lowerBound - The minimum acceptable value.
 * @param {number} upperBound - The maximum acceptable value.
 * @returns {boolean} - Returns true if the value is a valid number within the bounds, false otherwise.
 */
function checkValueBounds(valToCheck, lowerBound, upperBound) {
  return typeof valToCheck === 'number' && !isNaN(valToCheck) && valToCheck >= lowerBound && valToCheck <= upperBound;
}

/**
 * Parses an input string, extracts month and day, and computes a specific count.
 * This function calculates how many months, from the starting month down to January (1),
 * have their numerical value less than or equal to the provided target day.
 *
 * @param {string} receivedLineData - The raw string input, expected to contain two space-separated numbers.
 * @returns {number} - The computed count of matching months, or 0 if the input is invalid.
 */
function calculateMatchingMonthCount(receivedLineData) {
  // Split the input string by one or more whitespace characters to get the numeric parts.
  const numericalStringParts = receivedLineData.trim().split(/\s+/);

  // Parse the first and second parts as base-10 integers.
  const initialMonthValue = parseInt(numericalStringParts[0], 10);
  const targetDayValue = parseInt(numericalStringParts[1], 10);

  // Validate the parsed month and day values against their defined boundaries.
  if (!checkValueBounds(initialMonthValue, MIN_CALENDAR_MONTH, MAX_CALENDAR_MONTH) ||
      !checkValueBounds(targetDayValue, MIN_CALENDAR_DAY, MAX_CALENDAR_DAY)) {
    // If validation fails, output an error to stderr and return 0, mimicking the original behavior.
    console.error("Validation Error: Input month or day is not valid or out of range.");
    return 0;
  }

  let countedMatches = 0; // Accumulator for the number of months that meet the criteria.

  // Loop backward from the specified initial month down to 1 (January).
  for (let currentMonthInSequence = initialMonthValue; currentMonthInSequence >= MIN_CALENDAR_MONTH; currentMonthInSequence--) {
    // If the current month's number is less than or equal to the target day value,
    // increment our counter.
    if (currentMonthInSequence <= targetDayValue) {
      countedMatches++;
    }
  }

  return countedMatches; // Return the final calculated count.
}

// Attach an event listener to process each line of input received from the console.
appConsoleInterface.on('line', (inputEntry) => {
  // Call the core logic function and then print its result to standard output.
  const finalCalculatedResult = calculateMatchingMonthCount(inputEntry);
  console.log(finalCalculatedResult);
});

// Optional: Add a handler for when the input stream is closed.
appConsoleInterface.on('close', () => {
  // console.log("Input processing complete. Exiting application.");
});