/*
 * This module provides a core utility function to assess a specific numerical relationship.
 * It expects a string containing at least three space-separated numeric values.
 * The primary objective is to determine if the third parsed value
 * falls inclusively within a range defined by the first value
 * as the lower bound, and the sum of the first two values as the upper bound.
 *
 * Example: For input "5 3 7", the check is if 7 is between 5 and (5+3=8).
 *          Since 5 <= 7 <= 8, the result would be "VALID".
 *
 * The module includes robust parsing, validation steps, and a clear output mechanism.
 */

/**
 * Emits the final decision to the standard output.
 * This helper function abstracts the output mechanism, allowing for
 * easy modification or redirection of results in the future.
 * @param {string} outcomeMessage - The message indicating the result of the evaluation.
 */
const emitVerdict = (outcomeMessage) => {
  console.log(outcomeMessage);
};

/**
 * Processes a raw string input, extracts numeric components,
 * and evaluates a specific range constraint based on these components.
 * It performs input validation and handles potential parsing errors.
 *
 * @param {string} rawInputText - The unparsed string data, typically originating from stdin.
 * @returns {void} This function does not return a value but outputs directly.
 */
function processNumericConstraint(rawInputText) {
  // Step 1: Pre-process the input string by removing leading/trailing whitespace.
  const trimmedData = rawInputText.trim();

  // Step 2: Split the cleaned string into individual tokens based on space delimiter.
  const numericalTokens = trimmedData.split(" ");

  // Step 3: Validate the number of tokens to ensure sufficient data points are provided.
  const MINIMUM_EXPECTED_TOKENS = 3;
  if (numericalTokens.length < MINIMUM_EXPECTED_TOKENS) {
    emitVerdict("ERROR: INSUFFICIENT DATA POINTS PROVIDED");
    return; // Terminate execution if minimum tokens are not met.
  }

  // Step 4: Parse the first three tokens into numeric values and store them
  // in a structured object for improved readability and named access.
  const parsedValues = {};
  let isValidParsing = true; // Flag to track successful numeric conversion.

  for (let i = 0; i < MINIMUM_EXPECTED_TOKENS; i++) {
    const currentToken = numericalTokens[i];
    const numericValue = Number(currentToken); // Attempt to convert token to a number.

    if (isNaN(numericValue)) {
      // If any token cannot be converted to a valid number, mark as invalid and break.
      isValidParsing = false;
      break;
    }

    // Assign the parsed numeric value to a descriptive property in the object.
    if (i === 0) parsedValues.componentA = numericValue;
    else if (i === 1) parsedValues.componentB = numericValue;
    else if (i === 2) parsedValues.componentC = numericValue;
  }

  // Step 5: Guard clause to handle cases where numeric parsing failed.
  if (!isValidParsing) {
    emitVerdict("ERROR: INVALID NUMERIC FORMAT DETECTED");
    return; // Terminate if any input token was not a valid number.
  }

  // Step 6: Extract the validated numeric components using object destructuring
  // for cleaner access within the core logic.
  const { componentA, componentB, componentC } = parsedValues;

  // Step 7: Calculate the upper bound of the target range.
  // This intermediate variable improves clarity over inlining the sum.
  const sumOfInitialElements = componentA + componentB;

  // Step 8: Evaluate the core condition: Is componentC within the inclusive range
  // [componentA, componentA + componentB]?
  // The condition is broken down into two explicit checks for clarity.
  const conditionMet = (componentC >= componentA) && (componentC <= sumOfInitialElements);

  // Step 9: Output the final verdict based on the evaluation result.
  if (conditionMet) {
    emitVerdict("VALID"); // Indicates the condition is satisfied.
  } else {
    emitVerdict("INVALID"); // Indicates the condition is not satisfied.
  }
}

/**
 * Initiates the application by acquiring input from standard input
 * and then passing it to the main processing function.
 * Includes error handling for robust input acquisition.
 */
const acquireInputAndExecute = () => {
  try {
    // Attempt to read the entire content of standard input as a UTF-8 string.
    const fileSystemModule = require('fs');
    const inputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Execute the primary logic with the successfully acquired input.
    processNumericConstraint(inputBuffer);
  } catch (inputError) {
    // Catch and report any errors that occur during file reading or processing.
    console.error("A critical error occurred during input acquisition or processing:");
    console.error(`Error Type: ${inputError.name}`);
    console.error(`Error Message: ${inputError.message}`);
    // Provide a generic failure message to the standard output as a final status.
    emitVerdict("FATAL_ERROR_DURING_EXECUTION");
    // In a production environment, one might exit with a non-zero status code here.
    // process.exit(1);
  }
};

// The entry point of the script: immediately execute the input acquisition and processing.
acquireInputAndExecute();