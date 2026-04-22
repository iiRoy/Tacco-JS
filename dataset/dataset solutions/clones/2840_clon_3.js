'use strict';

/**
 * Processes raw input data to determine a specific numeric outcome based on two provided numbers.
 * This function handles parsing, validation, and the core conditional logic.
 *
 * @param {string} rawInputString - The input string expected to contain two space-separated numbers.
 */
function processInputData(rawInputString) {

  // Internal utility function to safely convert a string segment to an integer.
  // Includes basic error logging for invalid input, defaulting to 0 for robustness.
  const parseNumericSegment = (segment) => {
    const parsedNumber = parseInt(segment, 10);
    // In a production scenario, more sophisticated error handling (e.g., throwing exceptions)
    // or default values might be implemented here. For this context, we log and return 0.
    if (isNaN(parsedNumber)) {
      console.warn(`Warning: Non-numeric input detected for segment: "${segment}". Defaulting to 0.`);
      return 0;
    }
    return parsedNumber;
  };

  // Pre-process the input string: trim whitespace and split by one or more spaces.
  const inputComponents = rawInputString.trim().split(/\s+/);

  // Validate that the input string yielded the expected number of components.
  // If not, log an error and terminate processing for this input.
  const minimumExpectedComponents = 2;
  if (inputComponents.length < minimumExpectedComponents) {
    console.error(`Error: Insufficient input components. Expected at least ${minimumExpectedComponents}, but received ${inputComponents.length}.`);
    return; // Exit the function if input is malformed.
  }

  // Extract and convert the primary and secondary numeric values from the components.
  const firstNumericOperand = parseNumericSegment(inputComponents[0]);
  const secondNumericOperand = parseNumericSegment(inputComponents[1]);

  // Define the specific constant used for the conditional check.
  const specialConditionValue = 1;

  let finalCalculatedResult; // Declare the variable to hold the computed result.

  // Apply the core logic: if the second operand matches a specific value, the result is 0;
  // otherwise, it's the difference between the two operands.
  if (secondNumericOperand === specialConditionValue) {
    finalCalculatedResult = 0; // Special case: result is zero.
  } else {
    finalCalculatedResult = firstNumericOperand - secondNumericOperand; // General case: subtraction.
  }

  // Output the final computed result to the standard output stream.
  console.log(finalCalculatedResult);
}

// This immediately invoked function expression (IIFE) handles the environment-specific
// input reading and delegates to the main processing logic.
// It ensures that the application starts by reading from standard input.
(function initializeAndExecute() {
  const fileSystemUtility = require("fs");
  const standardInputFilePath = "/dev/stdin";
  const standardEncodingScheme = "utf8";

  try {
    // Read all content from standard input synchronously.
    const fullInputContentString = fileSystemUtility.readFileSync(standardInputFilePath, standardEncodingScheme);
    // Invoke the primary processing function with the obtained input.
    processInputData(fullInputContentString);
  } catch (executionError) {
    // Log any errors that occur during file reading or processing.
    console.error(`An error occurred during input processing: ${executionError.message}`);
    // Depending on requirements, additional error handling or default behavior could be implemented here.
  }
})();