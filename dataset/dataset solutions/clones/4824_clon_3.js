// A foundational constant for line separation in input strings.
const LINE_BREAK_CHAR = '\n';

// A constant defining how many times each relevant line should be echoed.
const ECHO_REPETITIONS = 2;

/**
 * Utility function to output a given string multiple times to the console.
 * This function enhances logging flexibility by abstracting the repetition logic.
 * @param {string} contentToLog The string content that needs to be logged.
 * @param {number} numberOfTimes The count of repetitions for logging the content.
 */
function echoContentRepeatedly(contentToLog, numberOfTimes) {
    // Iterates a specified number of times to perform the logging action.
    for (let currentIteration = 0; currentIteration < numberOfTimes; currentIteration++) {
        console.log(contentToLog); // Outputs the content to the standard output stream.
    }
}

/**
 * Orchestrates the processing of raw input data received by the application.
 * This function performs several steps:
 * 1. Validates and parses the input string into an array of lines.
 * 2. Extracts a numerical configuration value from the first line to determine
 *    how many subsequent lines are relevant.
 * 3. Slices the array to isolate the data lines targeted for processing.
 * 4. Iterates over these relevant lines, applying a specific action (logging)
 *    to each one.
 * @param {string} rawInputString The entire input provided as a single string.
 */
const processInputData = (rawInputString) => {
    // Initial validation: ensure the input is a non-empty string.
    // This guard clause prevents errors from malformed or missing input.
    if (typeof rawInputString !== 'string' || rawInputString.length === 0) {
        console.error("Processing halted: Input data is either empty, null, or not a string.");
        return; // Exits the function early if input is invalid.
    }

    // Decomposing the monolithic input string into an array, where each element
    // represents a distinct line, using the predefined line break character.
    const individualLinesArray = rawInputString.split(LINE_BREAK_CHAR);

    // Another guard: check if any lines were actually parsed after splitting.
    // This can happen if the input was just whitespace or an empty string without newlines.
    if (individualLinesArray.length === 0) {
        console.warn("Processing warning: No discernible lines were found in the provided input string.");
        return;
    }

    // The very first line of the input is expected to contain configuration details,
    // specifically a number indicating how many subsequent lines to process.
    const firstConfigurationLine = individualLinesArray[0];

    // Extracting the numeric part from the configuration line. It's assumed
    // the relevant number is the first token when splitting by space.
    const numericStringValue = firstConfigurationLine.split(' ')[0];

    // Converting the extracted string to an integer. Using radix 10 for explicit base.
    const numberOfPayloadLines = parseInt(numericStringValue, 10);

    // Critical validation for the parsed count: it must be a positive integer.
    // If not, it indicates a problem with the input's configuration.
    if (isNaN(numberOfPayloadLines) || numberOfPayloadLines <= 0) {
        console.error(`Processing error: Invalid or non-positive line count specified in configuration "${numericStringValue}".`);
        return;
    }

    // Extracting the actual data lines that need processing.
    // This slice operation effectively discards the configuration line and
    // selects the next 'numberOfPayloadLines' lines.
    const designatedPayloadLines = individualLinesArray.slice(1, numberOfPayloadLines + 1);

    // Iterating through each of the designated data lines.
    // A 'for...of' loop provides a clean and modern way to access each element.
    for (const currentPayloadItem of designatedPayloadLines) {
        // For every relevant line, invoke the helper function to log its content
        // a predetermined number of times, as defined by ECHO_REPETITIONS.
        echoContentRepeatedly(currentPayloadItem, ECHO_REPETITIONS);
    }
};

// --- Primary Execution Block ---
// This block serves as the entry point for the script, handling the acquisition
// of input data and initiating the main processing logic.
try {
    // Dynamically importing the Node.js 'fs' (file system) module for input operations.
    const fileSystemUtility = require('fs');

    // Defining the standard input path, typically '/dev/stdin' on Unix-like systems.
    const inputSourcePath = '/dev/stdin';

    // Specifying the character encoding for reading the input file.
    const fileEncoding = 'utf-8';

    // Synchronously reading the entire content from standard input.
    // This approach blocks until all input is read, suitable for simple scripts.
    const acquiredInputBuffer = fileSystemUtility.readFileSync(inputSourcePath, fileEncoding);

    // Once the input data is successfully acquired, it's passed to the
    // primary function for processing and subsequent actions.
    processInputData(acquiredInputBuffer);
} catch (executionError) {
    // This catch block handles any exceptions that might occur during
    // file reading (e.g., file not found, permission issues) or
    // within the initial stages of processing.
    console.error(`Critical runtime error encountered: ${executionError.message}`);
    // For debugging purposes, the full stack trace could be logged.
    // console.error(executionError.stack);
    // Exiting the process with a non-zero code signals that the script terminated due to an error.
    process.exit(1);
}