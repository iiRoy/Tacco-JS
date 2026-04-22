'use strict';

// This module is responsible for processing numerical input and determining a game's outcome.
const determineGameOutcome = (rawInputContent) => {
  // Input validation: It's crucial to ensure the provided content is a valid string.
  if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
    console.error('FATAL: Input content is either missing, not a string, or entirely whitespace.');
    return; // Abort execution if input is invalid.
  }

  // Step 1: Extract the primary data line from the raw input.
  // We assume the relevant numbers are on the very first line.
  const firstRelevantLine = rawInputContent.split('\n')[0];

  // Further validation for the extracted line.
  if (firstRelevantLine.trim().length === 0) {
    console.error('ERROR: The first line of input provided was empty or contained only whitespace.');
    return;
  }

  // Step 2: Parse the numerical values from the line.
  // Each string segment is converted to an integer, with explicit base 10.
  // We also include robustness for non-numeric entries.
  const processedNumericValues = firstRelevantLine.split(' ').map(stringToken => {
    const convertedNumber = parseInt(stringToken, 10);
    // A check to ensure the conversion resulted in a valid number.
    if (isNaN(convertedNumber)) {
      console.warn(`WARNING: Encountered a non-numeric token '${stringToken}'. This value will be ignored.`);
      return null; // Mark invalid numbers for later filtering.
    }
    return convertedNumber;
  }).filter(val => val !== null); // Remove any nulls (invalid numbers) from the array.

  // Define the minimum count of numbers expected for the game logic.
  const EXPECTED_MINIMUM_NUMBERS = 3; // Corresponds to original s[0], s[1], s[2]

  // Step 3: Validate the number of parsed values.
  if (processedNumericValues.length < EXPECTED_MINIMUM_NUMBERS) {
    console.error(`ERROR: Insufficient numerical data. Expected at least ${EXPECTED_MINIMUM_NUMBERS} values, but found only ${processedNumericValues.length}.`);
    return;
  }

  // Step 4: Extract the specific operands required for the game's core logic.
  // These correspond to the second (index 1) and third (index 2) numbers in the sequence.
  const valueOne = processedNumericValues[1];
  const valueTwo = processedNumericValues[2];

  // Final check to confirm our extracted values are indeed numbers.
  if (typeof valueOne !== 'number' || typeof valueTwo !== 'number') {
      console.error('CRITICAL: Extracted values for game logic are not valid numbers, despite prior filtering.');
      return;
  }

  // Step 5: Implement the game's core logic.
  // The winner is determined by the parity (even or odd) of the difference between the two values.
  // An alternative way to check parity of difference is to check if both numbers have the same parity.
  // (A - B) % 2 === 0 is equivalent to (A % 2) === (B % 2).
  const isParitySame = (valueOne % 2) === (valueTwo % 2);

  let gameWinnerLabel; // Declare variable to hold the outcome.

  // Conditional assignment based on parity.
  if (isParitySame) {
    gameWinnerLabel = 'Alice'; // If the difference is even (same parity), Alice wins.
  } else {
    gameWinnerLabel = 'Borys'; // If the difference is odd (different parity), Borys wins.
  }

  // Step 6: Output the final result.
  console.log(gameWinnerLabel);
};

// --- Execution Entry Point ---
// This block handles the interaction with the file system to get input and manages potential errors.
try {
  // Dynamically import the 'fs' (file system) module for input operations.
  const fileSystemOperations = require("fs");
  // Define the standard input path as a constant for clarity.
  const standardInputPath = "/dev/stdin";

  // Read the entire content from the standard input synchronously, expecting UTF-8 encoding.
  const rawDataFromStdin = fileSystemOperations.readFileSync(standardInputPath, "utf8");

  // Invoke the primary function to process the retrieved input and display the result.
  determineGameOutcome(rawDataFromStdin);

} catch (ioError) {
  // Catch and report any errors that occur during the file reading process.
  console.error(`An I/O error prevented reading from standard input: ${ioError.message}`);
  // Exit the process with a non-zero status code to indicate failure.
  process.exit(1);
}