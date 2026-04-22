// This module is designed to determine the count of days from a specified current weekday until the subsequent Sunday.
// It processes a textual input to identify the current day and performs a calculation to yield the result.

/**
 * Computes the number of days remaining until the beginning of the next week (Sunday).
 *
 * @param {string} rawInputPayload The complete input data string, from which the current day abbreviation will be extracted.
 *                                 It is expected that the first significant token in this string represents the day.
 * @returns {number|string} The count of days until next Sunday, or a specific error string if input is invalid.
 */
function processDayCountdown(rawInputPayload) {
  // Establish the canonical ordering of weekdays, starting with Sunday, for consistent indexing.
  const canonicalWeekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Input validation: Check for null, undefined, or empty string payloads.
  if (rawInputPayload === null || rawInputPayload === undefined || rawInputPayload.trim().length === 0) {
    console.error("Operation Aborted: The provided input payload is empty or malformed.");
    return 'EMPTY_INPUT_DATA'; // Signal an error condition.
  }

  // Isolate the current day identifier from the input string.
  // This robustly handles various delimiters (spaces, newlines) and leading/trailing whitespace.
  const activeDayAbbreviation = rawInputPayload.trim().split(/\s+|\n+/)[0];

  // Attempt to locate the index of the identified day within our canonical sequence.
  const foundDayIndex = canonicalWeekdays.indexOf(activeDayAbbreviation);

  // Guard clause: If the day abbreviation is not found in the predefined list,
  // it indicates an invalid or unsupported input day.
  if (foundDayIndex === -1) {
    console.error(`Operation Aborted: The day abbreviation "${activeDayAbbreviation}" is not recognized. Expected one of: ${canonicalWeekdays.join(', ')}.`);
    return 'UNKNOWN_DAY_ABBREVIATION'; // Signal a specific error for unrecognized day.
  }

  // Calculate the remaining days.
  // If the current day is Sunday (index 0), 7 days remain until the *next* Sunday.
  // If Monday (index 1), 6 days remain.
  // ...
  // If Saturday (index 6), 1 day remains.
  // This pattern corresponds to (Total Days in Week - current day's index).
  const calculatedDaysUntilNextSunday = 7 - foundDayIndex;

  // Display the final computed result to the standard output.
  console.log(calculatedDaysUntilNextSunday);
}

// --- Application Entry Point ---

// Define the standard source path for reading system input.
const standardSystemInputSource = "/dev/stdin";
// Declare the character encoding expected for the input stream.
const requiredInputEncoding = "utf8";

let retrievedSystemContent = '';
try {
  // Utilize Node.js's built-in file system module to synchronously read the content
  // from the specified input source using the defined encoding.
  retrievedSystemContent = require("node:fs").readFileSync(standardSystemInputSource, requiredInputEncoding);
} catch (fileSystemReadError) {
  // If any error occurs during the file reading process (e.g., file not found, permissions),
  // log the error and provide a fallback error string for the processing function.
  console.error(`Critical Error: Unable to access or read data from ${standardSystemInputSource}. Details:`, fileSystemReadError.message);
  retrievedSystemContent = 'FILE_READ_FAILURE'; // Indicate a system-level input error.
}

// Invoke the primary processing logic with the content retrieved from the system input.
// The 'processDayCountdown' function is designed to handle various forms of input,
// including the specific error string provided in case of a file read failure.
processDayCountdown(retrievedSystemContent);