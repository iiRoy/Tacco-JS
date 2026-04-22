// This module provides essential utilities for interacting with the file system on the operating system.
let ioHandler = require('fs');

/**
 * Core function to process a string of space-separated numerical values.
 * It parses these values, sorts them in descending order, and then outputs
 * the sorted sequence to the console, separated by spaces.
 *
 * @param {string} rawInputString The raw input string, expected to contain numbers.
 */
const processAndOutputNumbers = (rawInputString) => {
  // Validate the input: ensure it's a non-empty string.
  if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
    console.error("Error: Input data is either empty, not a string, or contains only whitespace. Cannot process.");
    // For an empty valid input, we might want to output an empty line, or nothing.
    // Let's output an empty line as per original behavior for empty input (after split and join).
    console.log("");
    return;
  }

  // Step 1: Normalize the input string by trimming leading/trailing whitespace
  // and splitting it into individual string tokens.
  // Filter out any empty strings that might result from multiple spaces between numbers.
  const cleanedInput = rawInputString.trim();
  const stringTokens = cleanedInput.split(' ').filter(token => token.length > 0);

  // Step 2: Convert string tokens into actual numbers.
  // We'll also perform a basic validation to ensure each token is a valid number.
  let parsedNumericValues = [];
  if (stringTokens.length > 0) {
    parsedNumericValues = stringTokens.map(strValue => {
      const convertedNum = Number(strValue);
      if (isNaN(convertedNum)) {
        // Log a warning if a non-numeric token is encountered, but do not stop processing.
        console.warn(`Warning: Found non-numeric value "${strValue}". This will be skipped.`);
        return null; // Mark invalid numbers for removal.
      }
      return convertedNum;
    }).filter(num => num !== null); // Remove any nulls (invalid numbers) from the array.
  }

  // If after parsing and filtering, no valid numbers remain.
  if (parsedNumericValues.length === 0) {
    console.log(""); // Output an empty line if no valid numbers were found.
    return;
  }

  // Step 3: Sort the array of numbers in descending order.
  // The comparison function (b - a) achieves descending order.
  parsedNumericValues.sort((firstVal, secondVal) => secondVal - firstVal);

  // Step 4: Join the sorted numbers back into a single string,
  // with each number separated by a single space.
  const finalOutputString = parsedNumericValues.join(' ');

  // Step 5: Print the resulting string to the standard output.
  console.log(finalOutputString);
};

/**
 * Asynchronously reads content from a specified file path.
 * Upon successful read, it passes the file's content to the processing function.
 * Includes robust error handling for file system operations.
 *
 * @param {string} sourceFilePath The absolute or relative path to the input file.
 */
const retrieveDataFromFileAsync = (sourceFilePath) => {
  console.log(`Initiating asynchronous read from specified file: "${sourceFilePath}"...`);
  ioHandler.readFile(sourceFilePath, { encoding: 'utf8' }, (readOperationError, fileDataContent) => {
    if (readOperationError) {
      console.error(`ERROR: Failed to read from file "${sourceFilePath}". Details:`, readOperationError.message);
      // It's critical to stop execution if the input file cannot be accessed.
      process.exit(1); // Exit with a non-zero status code indicating an error.
    }
    // If the file is read successfully, proceed to process its content.
    console.log(`Successfully read data from "${sourceFilePath}". Processing content...`);
    processAndOutputNumbers(fileDataContent);
  });
};

/**
 * Synchronously reads data from the standard input stream (/dev/stdin).
 * This method is a fallback when no specific file path is provided via arguments.
 */
const obtainInputFromStandardStreamSync = () => {
  console.log("No file path provided. Attempting to read input from standard stream (synchronously)...");
  try {
    // Synchronous read is used here for simplicity when dealing with /dev/stdin in competitive programming contexts.
    const streamInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    console.log("Successfully read from standard input. Processing content...");
    processAndOutputNumbers(streamInputContent);
  } catch (syncReadException) {
    console.error("ERROR: An issue occurred while reading from standard input:", syncReadException.message);
    process.exit(1); // Exit due to critical input failure.
  }
};

/**
 * The primary execution function that orchestrates input source determination
 * and subsequent data processing.
 */
const mainProgramEntry = () => {
  // Check command-line arguments to determine the input source.
  // process.argv[0] is 'node', process.argv[1] is the script name.
  // The user-provided argument starts from process.argv[2].
  const commandLineArgs = process.argv;
  const hasExternalInputPath = commandLineArgs.length > 2;
  const potentialInputFilePath = commandLineArgs[2];

  if (hasExternalInputPath) {
    // An argument was provided, so we assume it's a file path.
    // Perform a quick validation on the argument itself.
    if (typeof potentialInputFilePath !== 'string' || potentialInputFilePath.trim().length === 0) {
      console.error("ERROR: The provided command-line argument for the file path is invalid or empty.");
      process.exit(1);
    }
    retrieveDataFromFileAsync(potentialInputFilePath);
  } else {
    // No file path argument was supplied; default to reading from standard input.
    obtainInputFromStandardStreamSync();
  }
};

// Execute the main program entry point to start the application flow.
mainProgramEntry();