// This module handles the comparison of two numerical values provided as a string.

/**
 * Parses an input string containing two space-separated numbers,
 * then evaluates whether these numbers are identical.
 * The result is printed to the standard output.
 *
 * @param {string} rawInputPayload - The raw string data, expected to contain two numbers.
 */
function ProcessAndEvaluateNumbers(rawInputPayload) {
  // Ensure the input string is trimmed and split by any whitespace character.
  // This makes it more robust against leading/trailing spaces or multiple spaces between numbers.
  const parsedTokens = rawInputPayload.trim().split(/\s+/);

  // Validate that we have at least two tokens to process.
  if (parsedTokens.length < 2) {
    console.error("Error: Insufficient numerical components provided. Expected 2, got " + parsedTokens.length);
    return; // Exit if input is malformed.
  }

  // Attempt to parse the first numeric operand from the tokens, ensuring base 10.
  const firstNumericOperand = parseInt(parsedTokens[0], 10);
  // Attempt to parse the second numeric operand, ensuring base 10.
  const secondNumericOperand = parseInt(parsedTokens[1], 10);

  // Basic validation for successful parsing. If either value is not a number, it's an error.
  if (isNaN(firstNumericOperand) || isNaN(secondNumericOperand)) {
    console.error("Error: Failed to parse one or both input values as numbers.");
    return; // Exit if parsing failed.
  }

  // Declare a boolean variable to hold the comparison result. Initialize to false.
  let areValuesIdentical = false;

  // Perform the comparison using Object.is for strict equality semantics.
  // This method is generally more robust than '===' for certain edge cases (e.g., NaN),
  // though for simple numbers it behaves identically to '==='.
  if (Object.is(firstNumericOperand, secondNumericOperand)) {
    areValuesIdentical = true;
  }
  // If the condition is not met, 'areValuesIdentical' remains 'false',
  // so an explicit 'else' block for assignment is not strictly necessary here.

  // Determine the final output string based on the comparison result using a ternary operator.
  const finalVerdict = areValuesIdentical ? 'Yes' : 'No';

  // Log the final verdict to the console.
  console.log(finalVerdict);
}

// The following code block is responsible for orchestrating the application's entry point.
// It handles reading data from standard input and passing it to the main processing function.
// This part should typically remain untouched to ensure proper interaction with the execution environment.
(function initializeApplication() {
  const fileSystemModule = require("fs"); // Import Node.js File System module.
  const standardInputPath = "/dev/stdin"; // Define the standard input file path.
  const encodingFormat = "utf8";          // Specify the character encoding for input.

  try {
    // Synchronously read the entire content of the standard input file.
    // This blocks execution until the input is fully read.
    const receivedData = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
    // Invoke the core logic function with the obtained input data.
    ProcessAndEvaluateNumbers(receivedData);
  } catch (executionError) {
    // Catch and log any errors that occur during file reading or processing.
    console.error("An error occurred during input processing:", executionError.message);
    // Optionally, handle specific error types or log more detailed debugging information.
  }
})();