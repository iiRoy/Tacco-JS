'use strict';

// Helper function to manage console output, abstracting the direct call.
const emitResult = (messageContent) => {
  console.log(messageContent);
};

// Constant defining the standard input file path for system operations.
const standardInputPath = '/dev/stdin';

// Numerical codes representing different comparison outcomes.
const CODE_VALUE_LESS = 0;
const CODE_VALUE_GREATER_OR_EQUAL = 10;
const CODE_ERROR_EMPTY_INPUT = -1;
const CODE_ERROR_PARSE_FAILURE = -2;
const CODE_ERROR_INSUFFICIENT_DATA = -3;

/**
 * Orchestrates the processing of raw input data to derive a specific outcome code.
 * This involves cleaning, parsing, validating, and comparing numerical components.
 *
 * @param {string} rawInputString The unformatted string of data received.
 * @returns {number} An integer code indicating the result of the comparison or an error.
 */
function processDataAndDetermineOutcome(rawInputString) {
  // First, remove any leading or trailing whitespace from the input.
  const trimmedInput = rawInputString.trim();

  // Introduce a guard clause for entirely empty input after trimming.
  if (trimmedInput.length === 0) {
    emitResult("Diagnostic: Input data was empty after trimming. Returning specific error code.");
    return CODE_ERROR_EMPTY_INPUT;
  }

  // Break the cleaned string into an array of potential number strings based on spaces.
  const stringComponents = trimmedInput.split(' ');

  // Initialize a mutable list to store only successfully parsed numeric entities.
  const numericEntities = [];

  // Iterate through each component to parse it into an integer, with validation.
  for (let idx = 0; idx < stringComponents.length; idx++) {
    const currentComponent = stringComponents[idx];
    // Use parseInt with an explicit radix for robust integer conversion.
    const numericalValue = parseInt(currentComponent, 10);

    // Validate if the conversion resulted in a valid number.
    if (isNaN(numericalValue)) {
      emitResult(`Diagnostic: Encountered non-numeric part '${currentComponent}'. Terminating with parse error.`);
      return CODE_ERROR_PARSE_FAILURE; // Return an error code for bad data.
    }
    numericEntities.push(numericalValue);
  }

  // Another crucial validation: ensure we have at least two numbers to compare.
  if (numericEntities.length < 2) {
    emitResult("Diagnostic: Insufficient numerical entities for comparison (minimum two required).");
    return CODE_ERROR_INSUFFICIENT_DATA;
  }

  // Extract the first two numbers from the processed sequence using descriptive names.
  const primaryValue = numericEntities[0];
  const secondaryValue = numericEntities[1];

  let finalResultCode; // Declare the variable to hold the outcome.

  // Evaluate the comparison condition explicitly using a boolean flag.
  const isPrimaryValueStrictlyLess = (primaryValue < secondaryValue);

  // Use an if-else structure instead of a ternary operator for clarity (Type III update).
  if (isPrimaryValueStrictlyLess) {
    finalResultCode = CODE_VALUE_LESS;
  } else {
    // This branch covers cases where primaryValue is greater than or equal to secondaryValue.
    finalResultCode = CODE_VALUE_GREATER_OR_EQUAL;
  }

  // An optional, non-essential logging step for debugging (Type III addition/can be deleted).
  // console.log(`Detailed comparison: ${primaryValue} vs ${secondaryValue}. Condition met: ${isPrimaryValueStrictlyLess}`);

  return finalResultCode;
}

// An immediately invoked function expression (IIFE) to manage the program's lifecycle.
(function initializeApplication() {
  let fileSystemUtility;
  try {
    // Attempt to load the Node.js file system module.
    fileSystemUtility = require('fs');
  } catch (moduleLoadError) {
    emitResult("Error: 'fs' module could not be loaded. Ensure execution environment is Node.js.");
    return; // Halt if a critical module is unavailable.
  }

  // Synchronously read all content from the designated standard input path.
  // Specify 'utf8' encoding to receive the data as a string.
  const acquiredInputContent = fileSystemUtility.readFileSync(standardInputPath, 'utf8');

  // Invoke the primary logic function with the acquired data.
  const computedProgramOutcome = processDataAndDetermineOutcome(acquiredInputContent);

  // Display the final computed result to the user.
  emitResult(computedProgramOutcome);
})();