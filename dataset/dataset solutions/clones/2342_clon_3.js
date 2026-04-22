'use strict';

/**
 * This constant defines the critical numerical threshold for evaluating game outcomes.
 * It helps centralize important magic numbers within the application logic.
 */
const GAME_OVER_THRESHOLD = 21;

/**
 * Safely acquires the raw input string data from the standard input stream.
 * This function encapsulates file system operations, making the main logic cleaner.
 *
 * @returns {string} The raw string content read from `/dev/stdin`, or an empty string on error.
 */
function fetchStandardInputContent() {
  // Dynamically load the Node.js File System module.
  const fileSystemUtility = require('fs');
  // Specify the path for standard input, common in competitive programming environments.
  const inputResourcePath = '/dev/stdin';
  // Define the character encoding to ensure proper text interpretation.
  const characterEncodingScheme = 'utf8';

  try {
    // Perform a synchronous read operation to get the entire file content.
    return fileSystemUtility.readFileSync(inputResourcePath, characterEncodingScheme);
  } catch (dataReadError) {
    // Log any errors encountered during the file reading process.
    console.error(`An error occurred while attempting to read input: ${dataReadError.message}`);
    // Return an empty string as a safe fallback, allowing the program to continue gracefully.
    return '';
  }
}

/**
 * Processes a raw string, extracting and validating a fixed number of numerical components.
 * It includes robust checks for input validity, such as emptiness, correct component count,
 * and successful numerical conversion.
 *
 * @param {string} unprocessedTextLine - The raw string obtained from the input source.
 * @returns {number[]} An array containing the validated numerical values, or an empty array if any validation fails.
 */
function parseAndValidateNumericalComponents(unprocessedTextLine) {
  // Guard clause: Check if the input string is null, undefined, or consists only of whitespace.
  if (!unprocessedTextLine || unprocessedTextLine.trim().length === 0) {
    console.warn("Input string is empty or contains only whitespace. Cannot proceed with parsing.");
    return []; // Return an empty array indicating failure.
  }

  // Trim whitespace from the string ends and split it by spaces into an array of string parts.
  let textualParts = unprocessedTextLine.trim().split(' ');

  // Define the exact number of numerical components expected.
  const REQUIRED_COMPONENT_COUNT = 3;
  // Guard clause: Ensure the number of split parts matches the expectation.
  if (textualParts.length !== REQUIRED_COMPONENT_COUNT) {
    console.error(`Mismatched input: Expected ${REQUIRED_COMPONENT_COUNT} components, but found ${textualParts.length}.`);
    return []; // Indicate failure due to incorrect component count.
  }

  let convertedNumericData = [];
  // Loop through each textual part to convert it to a number and validate.
  for (let componentIndex = 0; componentIndex < textualParts.length; componentIndex++) {
    let currentStringComponent = textualParts[componentIndex];
    // Attempt to convert the string component to a floating-point number.
    let numericRepresentation = parseFloat(currentStringComponent);

    // Guard clause: Check if the conversion resulted in a valid number.
    if (isNaN(numericRepresentation)) {
      console.error(`Invalid data detected: '${currentStringComponent}' is not a valid number. Aborting parsing.`);
      return []; // Abort and return empty on the first invalid number.
    }
    convertedNumericData.push(numericRepresentation);
  }

  return convertedNumericData;
}

/**
 * Computes the aggregate sum of all numbers within a given array.
 * This function provides a clear, isolated step for summation.
 *
 * @param {number[]} collectionOfNumbers - An array of numerical values.
 * @returns {number} The sum of all numbers in the array. Returns 0 for an empty array.
 */
function computeAggregateSum(collectionOfNumbers) {
  let runningSummation = 0;
  // Iterate using a for...of loop for concise array element access.
  for (const individualNumber of collectionOfNumbers) {
    runningSummation += individualNumber;
  }
  return runningSummation;
}

/**
 * Determines the final outcome message based on a calculated score and a predefined threshold.
 * Uses an explicit if-else structure for clarity over a ternary operator.
 *
 * @param {number} finalCalculatedScore - The total score obtained from summing components.
 * @param {number} gameLimitValue - The threshold against which the score is compared.
 * @returns {string} The outcome message, either 'bust' or 'win'.
 */
function ascertainGameOutcomeMessage(finalCalculatedScore, gameLimitValue) {
  if (finalCalculatedScore > gameLimitValue) {
    return 'bust'; // The score has exceeded the allowed limit.
  } else {
    return 'win';  // The score is within or below the allowed limit.
  }
}

/**
 * The main orchestrator function that drives the entire game analysis workflow.
 * It coordinates input acquisition, data parsing, calculation, and result presentation.
 */
function initiateGameAnalysisProcess() {
  // Step 1: Retrieve the raw input text from the system.
  let rawInputContent = fetchStandardInputContent();

  // Step 2: Process the raw text to extract and validate numerical data.
  let validatedNumericalArray = parseAndValidateNumericalComponents(rawInputContent);

  // Guard: If parsing or validation failed, the numerical array will be empty.
  if (validatedNumericalArray.length === 0) {
    // An error message would have been logged by parseAndValidateNumericalComponents.
    // We simply exit this function as no valid data is available for processing.
    return;
  }

  // Step 3: Calculate the total sum of the validated numbers.
  let cumulativeScore = computeAggregateSum(validatedNumericalArray);

  // Step 4: Determine the final game outcome message using the calculated score and the global threshold.
  let conclusiveOutcomeString = ascertainGameOutcomeMessage(cumulativeScore, GAME_OVER_THRESHOLD);

  // Step 5: Display the final, conclusive outcome to the standard output.
  console.log(conclusiveOutcomeString);
}

// Execute the primary game analysis process to start the application.
initiateGameAnalysisProcess();