'use strict';

/**
 * Orchestrates the processing of raw input data to derive a specific numerical outcome.
 * This function is responsible for parsing, validating, and performing the core calculations.
 *
 * @param {string} rawInputData - The complete string content received, typically from a file system read operation.
 * @returns {void} This function prints the final computed result to the console or an error message.
 */
const processInputAndComputeValue = (rawInputData) => {
  // Perform initial validation: ensure the input is a string and not merely empty or whitespace.
  if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
    console.error('Data Processing Error: The provided input string is either invalid or contains no meaningful content.');
    return; // Halt execution if input is unusable.
  }

  // Standardize the input by trimming leading/trailing whitespace and splitting into an array of lines.
  const dataLines = rawInputData.trim().split('\n');

  // Verify that at least one line of data is present after splitting.
  if (dataLines.length === 0) {
    console.error('Data Processing Error: No discernible lines of data were found in the input.');
    return;
  }

  // The problem specifies that parameters are located on the first line of input.
  const primaryLineContent = dataLines[0];

  // Split the content of the first line by space to isolate the individual string representations of numbers.
  const numericStringTokens = primaryLineContent.split(' ');

  // Validate that the first line contains the expected number of numeric tokens (at least two).
  if (numericStringTokens.length < 2) {
    console.error('Data Processing Error: The primary data line does not contain the expected number of parameters.');
    return;
  }

  // Parse the string tokens into integer values. Using parseInt with a radix of 10 for reliability.
  const firstNumericalParameter = parseInt(numericStringTokens[0], 10);
  const secondNumericalParameter = parseInt(numericStringTokens[1], 10);

  // Crucial validation step: ensure that both parsed values are indeed valid numbers.
  if (isNaN(firstNumericalParameter) || isNaN(secondNumericalParameter)) {
    console.error('Data Processing Error: One or both of the extracted parameters are not valid numerical values.');
    return;
  }

  // --- Core Calculation Logic ---
  // The problem's specific calculation involves a weighted sum and then halving it.

  // Step 1: Apply a triple weighting to the first parameter.
  const tripledFirstParam = firstNumericalParameter * 3;

  // Step 2: Sum the tripled first parameter with the second parameter.
  const aggregatedSum = tripledFirstParam + secondNumericalParameter;

  // Step 3: Divide the aggregated sum by two and round down to the nearest whole number (floor operation).
  // This ensures an integer result as often required in competitive programming.
  const finalComputedResult = Math.floor(aggregatedSum / 2);

  // Output the final calculated integer value to the standard output stream.
  console.log(finalComputedResult);
};

// --- Application Entry Point & Input Handling ---
// This section is responsible for reading input from the specified source and initiating the computation.

/**
 * Safely reads the entire content of a file into a string.
 * This helper function abstracts the file system interaction.
 *
 * @param {string} sourcePath - The absolute or relative path to the file to be read.
 * @returns {string} The full content of the file as a UTF-8 encoded string.
 * @throws {Error} Throws an error if the file cannot be accessed or read.
 */
const retrieveInputContent = (sourcePath) => {
  try {
    // Lazily load the 'fs' module as it's typically for Node.js environments.
    const fileSystemModule = require('fs');
    return fileSystemModule.readFileSync(sourcePath, 'utf8');
  } catch (readError) {
    // Log a detailed error message if file reading fails.
    console.error(`File Read Failure: Could not retrieve data from '${sourcePath}'. Reason: ${readError.message}`);
    throw readError; // Re-throw the error to indicate a critical failure.
  }
};

// Define the standard input file path for typical competitive programming setups.
const standardInputFilePath = '/dev/stdin';

// Execute the main application logic:
try {
  // Attempt to read the input from the standard input file.
  const currentInputData = retrieveInputContent(standardInputFilePath);

  // Pass the retrieved data to the core processing function.
  processInputAndComputeValue(currentInputData);

} catch (runtimeError) {
  // Catch any errors that propagate up from input reading or processing.
  console.error('Application Critical Error: The program terminated unexpectedly due to an unhandled exception.');
  // In a production environment, one might log `runtimeError` details or gracefully exit.
  // process.exit(1); // Uncomment to exit with a non-zero status code on error.
}