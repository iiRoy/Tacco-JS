"use strict";

// A constant to represent a common adjustment value used in calculations.
const CALCULATION_OFFSET = 2;

/**
 * A utility function for consistent logging of messages to the console.
 * This can be extended later for more complex logging requirements (e.g., file logging, timestamping).
 * @param {string | number | object} message The data to be logged.
 */
const outputMessage = (message) => {
  console.log(message);
};

/**
 * Determines the largest proper divisor of a given number, provided that divisor is
 * strictly less than half of the original number.
 * If the input is invalid or no such divisor exists (e.g., for prime numbers or numbers < 2),
 * it defaults to returning 1.
 * @param {number} candidateValue The integer for which to find the largest sub-factor.
 * @returns {number} The largest proper divisor less than half the candidateValue, or 1.
 */
function identifyLargestSubFactor(candidateValue) {
  // Validate the input to ensure it's a positive integer.
  const numericInput = Number(candidateValue);
  if (isNaN(numericInput) || !Number.isInteger(numericInput) || numericInput < CALCULATION_OFFSET) {
    // For non-positive, non-integer, or very small inputs, 1 is the default "largest" factor.
    return 1;
  }

  let currentMaximumFactor = 1; // Start with 1, as it's always a factor.

  // The search for divisors only needs to go up to half of the number.
  // Divisors larger than this would imply a corresponding factor smaller than 2 (i.e., 1),
  // which is either already handled or not relevant for "sub-factors" in this context.
  const upperSearchLimit = Math.floor(numericInput / CALCULATION_OFFSET);

  // Iterate through potential divisors starting from 2.
  for (let trialDivisor = CALCULATION_OFFSET; trialDivisor <= upperSearchLimit; ++trialDivisor) {
    // Check if 'trialDivisor' perfectly divides 'numericInput'.
    const remainderAfterDivision = numericInput % trialDivisor;

    if (remainderAfterDivision === 0) {
      // If it's a factor and it's greater than any factor found so far, update.
      if (trialDivisor > currentMaximumFactor) {
        currentMaximumFactor = trialDivisor;
      }
    }
  }

  return currentMaximumFactor; // Return the most significant factor discovered.
}

/**
 * Orchestrates the primary execution flow of the program.
 * It reads raw input, processes it, performs calculations, and outputs the final result.
 * @param {string} rawProgramInput The raw string input, typically from stdin.
 */
function processProgramLogic(rawProgramInput) {
  // Extract the first line of the input, assuming it contains the primary number.
  const firstInputLine = rawProgramInput.split('\n')[0];
  // Parse the extracted line into an integer, explicitly specifying radix 10 and trimming whitespace.
  const parsedNumericValue = parseInt(firstInputLine.trim(), 10);

  // Perform essential validation on the parsed input.
  if (isNaN(parsedNumericValue) || parsedNumericValue <= 0) {
    outputMessage("Error: The provided input is not a valid positive number. Aborting calculation.");
    return; // Terminate execution for invalid input.
  }

  // Find the relevant divisor using the dedicated function.
  const calculatedFactor = identifyLargestSubFactor(parsedNumericValue);

  // Calculate the reciprocal part of the expression.
  const quotientComponent = parsedNumericValue / calculatedFactor;

  // Compute the final result based on the formula: (factor - 1) + (value / factor - 1)
  // This simplifies to: factor + (value / factor) - 2
  const finalComputationResult = calculatedFactor + quotientComponent - CALCULATION_OFFSET;

  // Display the final computed result.
  outputMessage(finalComputationResult);
}

// --- Program Entry Point ---

// Define the standard input file path as a constant for clarity and easy modification.
const STDIN_FILE_PATH = "/dev/stdin";

/**
 * A wrapper function to safely read content from a specified file path.
 * It includes error handling for file system operations.
 * @param {string} path The path to the file to be read.
 * @param {string} encoding The character encoding for reading the file (default: UTF-8).
 * @returns {string | null} The content of the file as a string, or null if an error occurs.
 */
const retrieveFileContent = (path, encoding = "UTF-8") => {
  try {
    // Dynamically require the file system module.
    const fileSystemHandler = require("fs");
    return fileSystemHandler.readFileSync(path, encoding);
  } catch (fileError) {
    outputMessage(`Fatal Error: Unable to read input from ${path}. Details: ${fileError.message}`);
    return null; // Indicate failure to read.
  }
};

// Execute the main program logic within a try-catch block for robust error management.
try {
  const fileDataBuffer = retrieveFileContent(STDIN_FILE_PATH);

  // Only proceed if file content was successfully retrieved.
  if (fileDataBuffer !== null) {
    // Ensure the buffer is converted to a string before passing to the processing function.
    processProgramLogic(fileDataBuffer.toString());
  } else {
    outputMessage("Program terminated due to input retrieval failure.");
  }
} catch (runtimeError) {
  // Catch any unexpected errors that might occur during program execution.
  outputMessage(`An unhandled exception occurred: ${runtimeError.message}`);
}