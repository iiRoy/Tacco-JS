"use strict"; // Ensures strict mode is enabled for cleaner code.

// This utility module provides synchronous and asynchronous file system operations.
const fileSystemHandler = require("fs");

// Specifies the standard input file path, typically used for command-line input.
const standardInputFile = "/dev/stdin";

// These are the specific integer values that the program considers "special".
const TARGET_NUMBER_A = 3;
const TARGET_NUMBER_B = 5;
const TARGET_NUMBER_C = 7;

// Predefined string messages for the program's output.
const POSITIVE_RESULT_MESSAGE = "YES";
const NEGATIVE_RESULT_MESSAGE = "NO";

/**
 * Retrieves data from a designated file path, sanitizes it, and attempts conversion to a number.
 * Includes basic error handling for file operations and number parsing.
 * @param {string} sourcePath - The complete path to the file to be read.
 * @returns {number | null} The successfully parsed integer, or null if any step fails.
 */
function fetchAndCleanNumericInput(sourcePath) {
    let fileContentBuffer;
    try {
        // Read the entire file content synchronously, specifying UTF-8 encoding.
        // An options object is used for clarity and extensibility.
        fileContentBuffer = fileSystemHandler.readFileSync(sourcePath, { encoding: "utf-8", flag: "r" });
    } catch (readingError) {
        // If file reading fails, log the error and indicate failure.
        console.error(`Error encountered while accessing input source: ${readingError.message}`);
        return null; // Return null to signify an unrecoverable input error.
    }

    // Remove any leading or trailing whitespace characters from the raw string.
    const trimmedInputString = fileContentBuffer.trim();

    // Attempt to convert the cleaned string into a base-10 integer.
    // `parseInt` is used for explicit integer conversion.
    const numericalValue = parseInt(trimmedInputString, 10);

    // Validate if the parsing operation yielded a legitimate number.
    if (isNaN(numericalValue)) {
        console.error(`Invalid data format: Expected a numerical input but received '${trimmedInputString}'.`);
        return null; // Return null if the input isn't a valid number.
    }

    // Return the successfully parsed and validated numeric input.
    return numericalValue;
}

// Encapsulate the primary execution logic within an immediately invoked function expression (IIFE).
(function programExecutionCore() {
    // Obtain and process the numeric input from the standard input stream.
    const receivedNumericInput = fetchAndCleanNumericInput(standardInputFile);

    // If the input was not successfully parsed, halt execution.
    if (receivedNumericInput === null) {
        // Error messages would have been printed by the `fetchAndCleanNumericInput` function.
        return;
    }

    // Define a collection of the special numbers for efficient membership testing.
    // Using a Set provides O(1) average time complexity for lookups, a structural improvement.
    const specialNumberSet = new Set([
        TARGET_NUMBER_A,
        TARGET_NUMBER_B,
        TARGET_NUMBER_C
    ]);

    let outputDisplayString; // Declare a variable to hold the final message.

    // Check if the received input number is present within the set of special numbers.
    if (specialNumberSet.has(receivedNumericInput)) {
        outputDisplayString = POSITIVE_RESULT_MESSAGE; // Assign the positive message.
    } else {
        outputDisplayString = NEGATIVE_RESULT_MESSAGE; // Assign the negative message.
    }

    // Output the determined result to the console.
    console.log(outputDisplayString);
})(); // Execute the main program block.