/*
 * This JavaScript module is designed to acquire a numeric datum from a designated
 * input stream (typically standard input), perform necessary parsing and validation,
 * and then format this numeric value by prepending a specific string before
 * outputting the final result to the console.
 *
 * This implementation includes robust error handling, explicit type conversions,
 * and clear separation of concerns using intermediate variables and a main processing function.
 */

// Define immutable configuration parameters for clarity and maintainability.
// These constants specify the source of input, the expected character encoding,
// the string literal to be used as a prefix for the output, and the numerical
// base for parsing operations.
const SOURCE_FILE_PATH = '/dev/stdin';
const CHARACTER_ENCODING_FORMAT = 'utf8';
const RESULT_PREFIX_STRING = 'ABC';
const DECIMAL_RADIX_BASE = 10; // Explicitly using base 10 for parseInt

// Attempt to load the Node.js 'fs' (file system) module.
// This is a critical dependency for reading input from the file system.
// A try-catch block is used to gracefully handle scenarios where the module
// might not be available, although this is highly unlikely in a standard Node.js runtime.
let fileSystemModuleReference;
try {
    fileSystemModuleReference = require('fs');
} catch (dependencyLoadError) {
    // Log an error message and terminate the process if the 'fs' module cannot be loaded.
    console.error(`CRITICAL ERROR: Unable to load the 'fs' (file system) module. 
                   This is essential for reading input. Details: ${dependencyLoadError.message}`);
    // Exiting with a non-zero code indicates an abnormal termination.
    process.exit(1);
}

/**
 * Executes the primary logic of the script:
 * 1. Reads content from a predefined input path.
 * 2. Extracts and trims the first line of the content.
 * 3. Attempts to parse this line into an integer.
 * 4. Validates the parsed number, providing a default if parsing fails.
 * 5. Constructs a final output string by prepending a fixed prefix.
 * 6. Logs the final string to standard output.
 *
 * This function encapsulates all operational steps, making the script's
 * workflow explicit and modular.
 */
function processAndDisplayNumericInput() {
    let rawContentBuffer; // Variable to store the raw data read from the file.

    // Use a try-catch block to handle potential errors during file reading operations.
    // Synchronous reading is used here for simplicity in this script context.
    try {
        rawContentBuffer = fileSystemModuleReference.readFileSync(SOURCE_FILE_PATH, CHARACTER_ENCODING_FORMAT);
    } catch (fileReadError) {
        // If an error occurs during file reading (e.g., file not found, permissions issue),
        // log the error details and exit the function gracefully without further processing.
        console.error(`INPUT ERROR: Failed to read data from '${SOURCE_FILE_PATH}'. 
                       Please ensure the file exists and is accessible. Details: ${fileReadError.message}`);
        return; // Terminate execution of this function.
    }

    // Split the entire content buffer into an array of strings, where each string
    // represents a line from the input file. The first element of this array
    // will be the first line of the input.
    const contentLineSegments = rawContentBuffer.split('\n');

    // Perform a preliminary check to ensure that the input actually contains data
    // and that the first line is not empty or undefined.
    if (contentLineSegments.length === 0 || !contentLineSegments[0]) {
        // If no valid first line is found, issue a warning and proceed with a default numeric value.
        console.warn('WARNING: The input file was empty or its first line contained no data. Defaulting to zero.');
        const defaultNumericValueForEmpty = 0; // A specific default for this scenario.
        const outputForEmptyInput = RESULT_PREFIX_STRING + defaultNumericValueForEmpty;
        console.log(outputForEmptyInput);
        return;
    }

    // Extract the very first line from the array of content segments.
    // The `.trim()` method is used to remove any leading or trailing whitespace,
    // which is crucial for accurate numeric parsing.
    const initialInputStringSegment = contentLineSegments[0].trim();

    // Attempt to convert the cleaned input string into an integer.
    // `parseInt()` is used with an explicit `DECIMAL_RADIX_BASE` to avoid
    // unexpected parsing behaviors (e.g., octal interpretation for strings starting with '0').
    const potentialNumericValue = parseInt(initialInputStringSegment, DECIMAL_RADIX_BASE);

    // Validate the result of the parsing operation. `isNaN()` checks if the
    // `parseInt()` function successfully converted the string into a valid number.
    let finalProcessedNumber;
    if (isNaN(potentialNumericValue)) {
        // If parsing fails (e.g., the line contains non-numeric characters),
        // log a warning and assign a default value to ensure the script can continue.
        console.warn(`WARNING: The input segment '${initialInputStringSegment}' could not be
                      reliably parsed into an integer. Using a fallback value of zero.`);
        finalProcessedNumber = 0; // Assign a fallback numeric value.
    } else {
        // If parsing is successful, use the obtained numeric value.
        finalProcessedNumber = potentialNumericValue;
    }

    // Construct the final string that will be displayed to the user.
    // This involves concatenating the predefined prefix string with the
    // processed (or defaulted) numeric value.
    const constructedOutputString = RESULT_PREFIX_STRING + finalProcessedNumber;

    // Output the final constructed string to the standard console.
    console.log(constructedOutputString);
}

// Invoke the main processing function to start the script's execution.
// This is the single entry point for the logic defined above.
processAndDisplayNumericInput();