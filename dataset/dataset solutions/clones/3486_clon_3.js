// This module is responsible for processing numerical input based on specific conditions.

/**
 * Executes the core logic of the program, determining an output message
 * based on the first line of provided data.
 *
 * @param {string[]} dataLines - An array of strings, where the first element
 *                                is expected to contain a numeric value.
 * @returns {void} Outputs the determined message to the console.
 */
function processInputData(dataLines) {
  // Guard clause: Ensure input data is valid and not empty.
  if (!Array.isArray(dataLines) || dataLines.length === 0) {
    console.error("Error: Input data array is empty or invalid. Cannot proceed.");
    // Exit early if no data to process.
    return;
  }

  // Extract the potential numeric string from the first line of input.
  const rawValueCandidate = dataLines[0];

  // Perform a validation check to ensure the input can be parsed as a number.
  // Using Number() for explicit type conversion and then checking for NaN.
  if (isNaN(Number(rawValueCandidate))) {
    console.error(`Error: The provided input '${rawValueCandidate}' is not a valid number.`);
    // Exit early if the input is non-numeric.
    return;
  }

  // Convert the string input to a numerical representation.
  // Both operands are derived from the same initial input value.
  let operandOne = Number(rawValueCandidate);
  let operandTwo = Number(rawValueCandidate); // This operand also originates from the first input line.

  // A temporary variable to hold the message that will be logged.
  let computedOutputMessage;

  // Evaluate the condition using an explicit if-else structure,
  // instead of a ternary operator, for increased readability in this clone.
  if (operandOne === 1) {
    // If the first operand is exactly 1, a special greeting message is prepared.
    computedOutputMessage = "Greetings from the Digital Realm!";
  } else {
    // Otherwise, calculate the sum of the two operands.
    // Introducing an intermediate variable for the sum calculation.
    const numericSumResult = operandOne + operandTwo;
    // Format the sum into a more descriptive output string.
    computedOutputMessage = "The calculated total is: " + numericSumResult;
  }

  // Display the final determined message to the standard output.
  console.log(computedOutputMessage);
}

/**
 * Retrieves input from the standard input stream, performs basic cleaning,
 * and splits it into an array of lines. Includes error handling for file operations.
 *
 * @returns {string[]} An array of strings, each representing a line from the input.
 *                     Returns an empty array if an error occurs during input reading.
 */
function acquireStandardInputLines() {
  try {
    // Attempt to read the entire content of the standard input stream.
    // Ensure UTF-8 encoding for text data.
    const fileSystemModule = require('fs');
    const rawContentBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Trim any leading/trailing whitespace from the entire content
    // and then split it into individual lines based on newline characters.
    const processedLinesArray = rawContentBuffer.trim().split("\n");

    return processedLinesArray;
  } catch (inputReadError) {
    // Log any errors encountered during the file reading process.
    console.error("An error occurred while attempting to read from standard input:", inputReadError.message);
    // Return an empty array to prevent further processing with invalid data.
    return [];
  }
}

// Orchestrate the program execution: First, get the input, then process it.
const programExecutionInput = acquireStandardInputLines();
processInputData(programExecutionInput);