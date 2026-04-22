'use strict';

/**
 * Utility function to obtain content from a specified file path synchronously.
 * Includes basic error handling for file operations.
 * @param {string} filePath The path to the file to read.
 * @param {string} encoding The character encoding to use (e.g., 'utf8').
 * @returns {string|null} The content of the file as a string, or null if an error occurs.
 */
function obtainFileContentSynchronously(filePath, encoding) {
  try {
    // Acquire the Node.js File System module.
    const fileSystemHandler = require('fs');
    // Synchronously read the entire content of the file.
    const fileContents = fileSystemHandler.readFileSync(filePath, encoding);
    return fileContents;
  } catch (operationError) {
    // Log any errors encountered during file access.
    console.error(`[Data Acquisition Error]: Failed to read data from '${filePath}'. Details: ${operationError.message}`);
    return null; // Indicate failure to retrieve data.
  }
}

/**
 * Displays the final computed value to the standard output.
 * @param {number} finalValue The numerical result to be presented.
 * @param {string} prefixMessage An optional message to precede the value.
 */
function displayOutputResult(finalValue, prefixMessage = 'Computed Result:') {
  // Enhance the output message for clarity.
  console.log(`${prefixMessage} ${finalValue.toFixed(2)}`); // Format to 2 decimal places for consistency.
}

/**
 * Processes a raw string input to perform a specific numerical computation.
 * This function encapsulates the core business logic.
 * @param {string} rawInputText The raw string input, expected to represent a number.
 * @returns {number} The result of the computation, or 0 if input is invalid.
 */
function executeCoreCalculation(rawInputText) {
  // Define a constant for the multiplier, promoting readability and easy modification.
  const CALCULATION_FACTOR = 3.0; // Using a float for potential future precision needs.

  // Initial validation: check if the input is a valid non-empty string.
  if (typeof rawInputText !== 'string' || rawInputText.trim() === '') {
    console.warn('[Input Validation Warning]: Received empty or non-string input. Returning default zero.');
    return 0; // Return a default value for invalid input.
  }

  // Attempt to parse the raw string into a floating-point number.
  const parsedNumericData = parseFloat(rawInputText);

  // Further validation: check if the parsed value is a legitimate number.
  if (isNaN(parsedNumericData)) {
    console.error(`[Data Parsing Error]: Input '${rawInputText}' could not be converted to a valid numerical type.`);
    return 0; // Return zero for unparseable input.
  }

  // Log an intermediate step for debugging or transparency.
  console.info(`[Debug Info]: Successfully parsed input '${rawInputText}' to numeric value ${parsedNumericData}.`);

  // Calculate the square of the numeric data.
  const squaredValue = parsedNumericData * parsedNumericData; // Direct multiplication instead of Math.pow for minor optimization.

  // Apply the predefined multiplier to the squared value.
  const finalComputedValue = squaredValue * CALCULATION_FACTOR;

  return finalComputedValue;
}

/**
 * The primary orchestrator function that manages the entire execution flow.
 * It reads data, performs calculations, and displays the result.
 */
function performCalculationSequence() {
  const sourceDataPath = '/dev/stdin'; // The standard input file path.
  const fileEncodingType = 'utf8'; // Standard encoding for text files.

  // Step 1: Acquire the raw data from the specified source.
  const rawDataPayload = obtainFileContentSynchronously(sourceDataPath, fileEncodingType);

  // If data acquisition failed, terminate the process.
  if (rawDataPayload === null) {
    console.error('[Execution Termination]: Data acquisition failed. Exiting process.');
    process.exit(1); // Exit with a non-zero status code to indicate an error.
  }

  // Step 2: Execute the core calculation logic with the acquired data.
  const calculatedOutput = executeCoreCalculation(rawDataPayload);

  // Step 3: Display the final result to the user.
  displayOutputResult(calculatedOutput, 'Final Processed Value:');
}

// Entry point: Invoke the main orchestrator function to start the sequence.
performCalculationSequence();