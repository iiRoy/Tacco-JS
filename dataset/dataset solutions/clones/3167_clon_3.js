const ERA_TRANSITION_POINT_MS = Date.UTC(2019, 3, 30, 15, 0, 0, 0); // Represents May 1, 2019, 00:00:00 JST, which is April 30, 2019, 15:00:00 UTC. This is the precise moment the Heisei era concluded.

/**
 * Parses a date string formatted as "YYYY/MM/DD" into its numerical components.
 * Includes basic validation for the input string format and component values.
 *
 * @param {string} rawDateString The input date string, e.g., "2019/04/30".
 * @returns {number[]|null} An array [year, month (0-indexed), day] or null if parsing fails.
 */
const decomposeDateString = (rawDateString) => {
  // Validate the overall string format using a regular expression.
  if (!rawDateString || typeof rawDateString !== 'string' || !/^\d{4}\/\d{2}\/\d{2}$/.test(rawDateString)) {
    console.error("Input format error: Expected YYYY/MM/DD string.");
    return null;
  }

  // Split the string into year, month, and day components.
  const components = rawDateString.split('/');

  // Convert string components to integer values.
  const [yearString, monthString, dayString] = components;
  const numericYear = parseInt(yearString, 10);
  const numericMonth = parseInt(monthString, 10);
  const numericDay = parseInt(dayString, 10);

  // Validate that all components are valid numbers.
  if (isNaN(numericYear) || isNaN(numericMonth) || isNaN(numericDay)) {
    console.error("Parsing error: Date components are not valid numbers.");
    return null;
  }

  // Perform basic range validation for month and day.
  if (numericMonth < 1 || numericMonth > 12 || numericDay < 1 || numericDay > 31) {
    console.error("Range error: Month or day value is out of bounds.");
    return null;
  }

  // Return components, adjusting month to be 0-indexed for JavaScript's Date constructor.
  return [numericYear, numericMonth - 1, numericDay];
};

/**
 * Determines the Japanese era for a given date.
 * It checks if the date falls before or on/after the transition from Heisei to Reiwa.
 *
 * @param {string} suppliedDateText The date string to evaluate, e.g., "2019/04/30".
 * @returns {string} The identified era ("Heisei", "TBD" for Reiwa, or "Invalid Date").
 */
const identifyHistoricalPeriod = (suppliedDateText) => {
  let eraResult = "Invalid Date"; // Default outcome for problematic inputs.

  // Attempt to parse and validate the input date string.
  const datePartsArray = decomposeDateString(suppliedDateText.trim()); // Trim whitespace from input.

  if (datePartsArray === null) {
    // If date decomposition failed, return the error message directly.
    return eraResult;
  }

  // Extract the year, 0-indexed month, and day.
  const [targetYear, targetMonthIndex, targetDay] = datePartsArray;

  // Construct a UTC Date object from the components and get its timestamp.
  // Using Date.UTC helps avoid issues with local timezones.
  const evaluatedDateTimestamp = Date.UTC(targetYear, targetMonthIndex, targetDay, 0, 0, 0, 0); // Midnight UTC of the target day.

  // Further validation: check if the constructed date is actually valid (e.g., no Feb 30).
  if (isNaN(evaluatedDateTimestamp)) {
    console.error("Date construction error: The provided date is not a real calendar date.");
    return eraResult;
  }

  // Compare the evaluated date's timestamp with the defined era transition point.
  // Dates strictly before the transition point are Heisei.
  if (evaluatedDateTimestamp < ERA_TRANSITION_POINT_MS) {
    eraResult = 'Heisei';
  } else {
    // Dates on or after the transition point fall into the subsequent era.
    eraResult = 'TBD'; // As per original requirements, the new era is labeled "TBD".
  }

  return eraResult;
};

// --- Execution Entry Point ---
try {
  // Access the Node.js 'fs' (file system) module for reading standard input.
  const fileSystemUtility = require("fs");

  // Read the entire standard input as a UTF-8 encoded string.
  const rawInputContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

  // Process the input date and determine its historical period.
  const finalEraDetermination = identifyHistoricalPeriod(rawInputContent);

  // Output the result to the console.
  console.log(finalEraDetermination);
} catch (operationError) {
  // Catch and report any errors that occur during file reading or date processing.
  console.error("An unexpected runtime error occurred:", operationError.message);
  // Provide a generic error output for the user.
  console.log("Error processing date information.");
}