// This module provides a robust mechanism for processing a sequence of numerical inputs.
// Its primary purpose is to determine and output the minimum value between
// the product of the first two supplied numbers and a distinct third number.

/**
 * Parses a raw string of space-separated numerical values into an array of integers.
 * This function incorporates validation steps to ensure data integrity and format.
 *
 * @param {string} inputDataString - The unparsed string, expected to contain numbers separated by spaces.
 * @returns {Array<number>} An array containing the successfully parsed integer values.
 * @throws {Error} If the input string is empty, contains insufficient numbers, or includes non-numeric components.
 */
function extractAndValidateNumbers(inputDataString) {
  // First, check for null, undefined, or empty input to prevent further errors.
  if (!inputDataString || inputDataString.trim().length === 0) {
    throw new Error("Input data string cannot be empty or consist only of whitespace.");
  }

  // Split the string into potential number components. Using a regex for splitting
  // handles multiple spaces between numbers more gracefully than a simple ' '.
  const stringFragments = inputDataString.trim().split(/\s+/);

  // Define the minimum number of numerical fragments required for our calculation.
  const requiredFragmentCount = 3;
  if (stringFragments.length < requiredFragmentCount) {
    throw new Error(`Insufficient numerical fragments provided. Expected at least ${requiredFragmentCount}, but found ${stringFragments.length}.`);
  }

  // Iterate over each string fragment, converting it to an integer.
  // `parseInt` with a radix of 10 is used for explicit base-10 conversion.
  const numericValues = stringFragments.map(fragment => {
    const convertedNumber = parseInt(fragment, 10);
    // Validate if the conversion resulted in a valid number.
    if (isNaN(convertedNumber)) {
      throw new Error(`Encountered an invalid numerical fragment: '${fragment}'. All parts must be valid integers.`);
    }
    return convertedNumber;
  });

  return numericValues;
}

/**
 * Computes the product of two given numerical operands.
 * Includes basic type validation to ensure operations are performed on numbers.
 *
 * @param {number} operandOne - The first number in the multiplication.
 * @param {number} operandTwo - The second number in the multiplication.
 * @returns {number} The result of multiplying operandOne by operandTwo.
 * @throws {Error} If either of the provided operands is not a valid number.
 */
function calculateProduct(operandOne, operandTwo) {
  // Verify that both arguments are indeed numbers before performing arithmetic.
  if (typeof operandOne !== 'number' || typeof operandTwo !== 'number' || isNaN(operandOne) || isNaN(operandTwo)) {
    throw new Error("Both operands for product calculation must be valid numerical types.");
  }
  return operandOne * operandTwo;
}

/**
 * A utility function to output results to the console.
 * Centralizes logging for consistency and potential future modification (e.g., logging to a file).
 *
 * @param {any} contentToDisplay - The data or message to be printed to the console.
 */
function printOutput(contentToDisplay) {
  console.log(contentToDisplay);
}

/**
 * The core function that orchestrates the entire process:
 * from receiving raw input, to parsing, calculating, and finally displaying the result.
 *
 * @param {string} incomingRawData - The raw string data that needs to be processed.
 */
function orchestrateDataProcessing(incomingRawData) {
  try {
    // Step 1: Safely extract and validate numbers from the raw input string.
    const processedNumbers = extractAndValidateNumbers(incomingRawData);

    // Destructure the first three required numbers for clear variable assignment.
    // '_remainder' captures any extra numbers, which are ignored as per the problem.
    const [valueA, valueB, valueC, ..._remainder] = processedNumbers;

    // Defensive check: although `extractAndValidateNumbers` should catch this,
    // it's good practice to ensure destructuring yielded expected values.
    if (valueA === undefined || valueB === undefined || valueC === undefined) {
      throw new Error("Critical error: Not all required numeric values could be resolved after parsing.");
    }

    // Step 2: Compute the product of the first two extracted numbers.
    const computedProduct = calculateProduct(valueA, valueB);

    // Step 3: Determine the final result by comparing the computed product with the third value.
    // The objective is to find the smaller of the two.
    let finalResultantValue;
    // Using a ternary operator for a concise conditional assignment.
    finalResultantValue = (computedProduct < valueC) ? computedProduct : valueC;

    // Step 4: Output the determined minimum value.
    printOutput(finalResultantValue);

  } catch (processingError) {
    // If any error occurs during parsing or calculation, log it.
    console.error("An operational error occurred:", processingError.message);
    // In a production system, this might trigger an application exit or
    // a more sophisticated error handling routine.
    // process.exit(1);
  }
}

// --- Application Bootstrap Section ---

// Define the standard input stream path for this environment.
const standardInputSourcePath = "/dev/stdin";

/**
 * This immediately invoked function expression (IIFE) serves as the application's
 * entry point, handling file reading and initiating the core processing logic.
 */
(function applicationBootstrap() {
  let fileContentBuffer = ""; // Buffer to hold the content read from the file.
  try {
    // Dynamically import the Node.js 'fs' (file system) module.
    const fileSystemUtility = require("fs");
    // Synchronously read the entire content of the standard input file.
    // Specify 'utf8' encoding for correct text interpretation.
    fileContentBuffer = fileSystemUtility.readFileSync(standardInputSourcePath, "utf8");

    // Once the data is successfully read, pass it to the main processing function.
    orchestrateDataProcessing(fileContentBuffer);

  } catch (fileReadFailure) {
    // Handle errors specifically related to file I/O operations
    // (e.g., file not found, permission issues).
    console.error(`Error reading input from '${standardInputSourcePath}':`, fileReadFailure.message);
    // A non-zero exit code typically indicates an error condition to the operating system.
    // process.exit(1);
  }
})(); // The IIFE is executed immediately upon script loading.