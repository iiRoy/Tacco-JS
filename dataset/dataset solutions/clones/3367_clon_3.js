const NUMERIC_CRITERION = '2'; // This constant defines the specific character we are looking for within the input data.

/**
 * Conducts a comprehensive pattern search within a given string payload.
 * It's designed to locate all non-overlapping occurrences of the predefined numeric criterion.
 *
 * @param {string} textualPayload - The string content that needs to be analyzed for patterns.
 * @returns {Array<string>|null} An array containing all matched substrings if found; otherwise, returns null.
 */
function initiatePatternSearch(textualPayload) {
    // A regular expression object is dynamically created using the constant criterion.
    // The 'g' flag ensures that the search operation is global, capturing all instances.
    const searchExpression = new RegExp(NUMERIC_CRITERION, 'g');
    // The native string 'match' method is employed to perform the pattern discovery.
    return textualPayload.match(searchExpression);
}

/**
 * Orchestrates the primary data processing flow for content received from an external source.
 * This function encapsulates the logic for input validation, pattern analysis, and result presentation.
 *
 * @param {string} incomingDataStream - The raw string data that has been acquired from an external channel.
 */
function processIncomingDataStream(incomingDataStream) {
    // --- Input Validation Phase ---
    // A preliminary check to ensure that the received data is of the expected string type.
    // This helps prevent runtime errors from unexpected input formats.
    if (typeof incomingDataStream !== 'string') {
        // In a production environment, more sophisticated error handling or logging might be implemented.
        // For this context, an informative error message is logged, and the function execution is halted.
        console.error("Error: Input data for processing must be a string. Received type:", typeof incomingDataStream);
        return; // Terminate execution gracefully for invalid input.
    }

    // --- Core Analysis Phase ---
    // Invokes the dedicated helper function to perform the pattern matching operation.
    const discoveredOccurrences = initiatePatternSearch(incomingDataStream);

    // --- Result Determination Phase ---
    let outputValueForPresentation; // A temporary variable to store the final result before display.

    // Conditional logic to determine the output based on the pattern search results.
    if (discoveredOccurrences === null) {
        // If the pattern search yielded no matches (i.e., returned null),
        // a specific default numeric value is designated as the output.
        outputValueForPresentation = 0;
    } else {
        // If one or more matches were successfully identified,
        // the array containing these matches is directly assigned as the output.
        outputValueForPresentation = discoveredOccurrences;
    }

    // --- Output Presentation Phase ---
    // The final determined value is transmitted to the standard output console.
    console.log(outputValueForPresentation);
}

// --- Application Bootstrap / Entry Point ---
// Acquire the built-in Node.js 'fs' (file system) module to handle file operations.
const fileSystemUtility = require("fs");

// Specify the path for standard input, typically used in competitive programming environments.
const standardInputEndpoint = "/dev/stdin";

// --- Data Acquisition and Error Handling ---
// A try-catch block is used to robustly handle potential issues during the file reading process.
try {
    // Synchronously read the entire content from the specified standard input path.
    // The content is decoded as a UTF-8 string, which is a common character encoding.
    const acquiredContentBuffer = fileSystemUtility.readFileSync(standardInputEndpoint, "utf8");

    // Once the data is successfully acquired, it is passed to the main processing routine.
    processIncomingDataStream(acquiredContentBuffer);
} catch (dataAcquisitionError) {
    // In the event of an error during file reading (e.g., file not found, permission issues),
    // an error message is logged to the console, detailing the problem.
    console.error("Failure encountered while attempting to read data from standard input:", dataAcquisitionError.message);
    // Optionally, the application might exit with a non-zero status code to indicate an error.
    process.exit(1);
}