// This module provides functionality to determine the Japanese era based on a given date.
// It specifically identifies the transition from the Heisei era to a subsequent era (initially "TBD").

/**
 * Safely converts a string value to a number. If the conversion results in NaN,
 * it returns a specified default value or NaN if no default is provided.
 *
 * @param {string} strValue - The string to convert to a number.
 * @param {number} [defaultValue=NaN] - The value to return if parsing fails.
 * @returns {number} The parsed number or the default value/NaN.
 */
const convertToNumeric = (strValue, defaultValue = NaN) => {
  const parsedNumber = Number(strValue); // Using Number() for parsing strings to numbers.
  return isNaN(parsedNumber) ? defaultValue : parsedNumber;
};

/**
 * Analyzes raw text input, extracts a date, and determines the corresponding era status.
 * The logic checks if the date falls on or after May 1, 2019, or on or after January 1, 2020.
 * Dates meeting these criteria are assigned the "TBD" status; otherwise, "Heisei".
 *
 * @param {string} inputDataSource - The raw input string, expected to contain a date string
 *                                   (e.g., "YYYY/MM/DD") on its first line.
 * @returns {string} The determined era status, either "Heisei" or "TBD".
 */
function determineEraStatus(inputDataSource) {
  // Define key constants for the era transition point.
  const TRANSITION_YEAR_THRESHOLD = 2019;
  const TRANSITION_MONTH_THRESHOLD = 5; // Represents May (1-indexed month).

  // Initialize the era status to the default, which is "Heisei".
  let currentEraDesignation = "Heisei";

  // Split the input into individual lines. The date is expected on the first line.
  const allInputLines = inputDataSource.split('\n');

  // Perform basic validation to ensure there's a first line to process.
  if (allInputLines.length === 0 || !allInputLines[0]) {
    console.error("Input processing error: No valid date string found in the provided data source.");
    return currentEraDesignation; // Return default if input is empty or malformed.
  }

  // Extract the primary date string from the initial line.
  const primaryDateString = allInputLines[0];

  // Divide the date string into its constituent parts (e.g., year, month, day).
  // The delimiter is expected to be a forward slash '/'.
  const dateSegmentArray = primaryDateString.split('/');

  // Validate that we have at least year and month components.
  if (dateSegmentArray.length < 2) {
    console.error(`Input format error: Date string "${primaryDateString}" is not in the expected YYYY/MM... format.`);
    return currentEraDesignation; // Return default if date format is insufficient.
  }

  // Parse the year and month values from the date segments.
  // Utilizing the helper function for robust conversion.
  const calendarYear = convertToNumeric(dateSegmentArray[0]);
  const calendarMonth = convertToNumeric(dateSegmentArray[1]);

  // Check if the parsed year or month values are invalid (NaN).
  if (isNaN(calendarYear) || isNaN(calendarMonth)) {
    console.error(`Data parsing error: Could not extract valid year (${dateSegmentArray[0]}) or month (${dateSegmentArray[1]}).`);
    return currentEraDesignation; // Return default if parsing failed.
  }

  // Evaluate the date against the transition criteria.
  // The "TBD" era applies if:
  // 1. The year is strictly after the transition year (e.g., 2020 or later).
  // OR
  // 2. The year is exactly the transition year AND the month is the transition month or later.
  const isPostTransitionPeriod = (calendarYear > TRANSITION_YEAR_THRESHOLD) ||
                                 (calendarYear === TRANSITION_YEAR_THRESHOLD && calendarMonth >= TRANSITION_MONTH_THRESHOLD);

  // Update the era designation if the date falls into the post-transition period.
  if (isPostTransitionPeriod) {
    currentEraDesignation = "TBD";
  }

  // Output the final determined era status to the standard console.
  console.log('Final Era Determination: %s', currentEraDesignation);

  // Return the result for further use or testing.
  return currentEraDesignation;
}

// --- Auxiliary Functions and Script Execution Block ---

/**
 * A debugging utility function designed for browser environments.
 * It fetches input from a specific HTML element and processes it.
 *
 * @param {number} elementIndex - The numerical suffix of the HTML input element ID (e.g., for "input1", pass 1).
 */
function handleTestInput(elementIndex) {
  // Verify if the script is running in a browser environment with a Document Object Model.
  if (typeof document !== 'undefined' && document.getElementById) {
    const targetElementId = `input${elementIndex}`;
    const sourceHtmlElement = document.getElementById(targetElementId);

    // Check if the HTML element exists and contains a value.
    if (sourceHtmlElement && sourceHtmlElement.value) {
      const testInputContent = sourceHtmlElement.value;
      // Execute the primary date processing logic with the retrieved test data.
      determineEraStatus(testInputContent);
    } else {
      console.warn(`Debugging: HTML input element with ID "${targetElementId}" was not located or is empty.`);
    }
  } else {
    console.warn("Debugging function 'handleTestInput' is intended for browser contexts and requires a DOM.");
  }
}

// Main execution entry point for Node.js environments.
// This block ensures the script reads from standard input when executed directly.
// The conditional check prevents execution in environments where 'require' or 'fs' might not exist.
if (typeof require !== 'undefined' && require.main === module) {
  try {
    // Access the Node.js file system module.
    const fileSystemModule = require("fs");
    // Read all content from standard input synchronously, interpreting it as UTF-8 text.
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Invoke the core era determination function with the content from standard input.
    determineEraStatus(standardInputContent);
  } catch (executionError) {
    // Log any errors that occur during file reading or processing.
    console.error("An unhandled error occurred during script execution:", executionError.message);
    // Optionally, exit the process with an error code.
    // process.exit(1);
  }
}