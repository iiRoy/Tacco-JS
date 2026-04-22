"use strict";

/**
 * A utility function designed to process raw string input,
 * parse it into a set of numeric values, and then apply
 * specific business logic to categorize the outcome.
 *
 * This function encapsulates the primary workflow of the application.
 *
 * @param {string} rawInputString - The complete string received from the input source,
 *                                  expected to contain space-separated numeric values.
 */
const SystemDataProcessor = (rawInputString) => {

    /**
     * Internal helper to convert a space-delimited string into an array of numbers.
     * Includes basic validation for segment count and numeric parsing.
     * @param {string} inputDataFragment - The string to be parsed.
     * @returns {number[]} An array of parsed numeric values.
     */
    const parseAndValidateNumericSegments = (inputDataFragment) => {
        // Remove leading/trailing whitespace and split the string by spaces.
        const stringSegments = inputDataFragment.trim().split(' ');
        
        // A minimal check to ensure the expected number of components.
        // If not exactly three, it might indicate malformed input,
        // but parsing will proceed with available segments.
        if (stringSegments.length !== 3) {
            // Log a warning rather than throwing, to allow subsequent logic to attempt processing.
            console.warn(`Input warning: Expected 3 numeric values, but received ${stringSegments.length}.`);
        }

        // Map each string segment to a number. Using unary plus for type conversion.
        // This handles cases where a segment might not be a valid number, resulting in NaN.
        return stringSegments.map(segmentItem => {
            const convertedValue = +segmentItem; // Equivalent to Number(segmentItem)
            if (isNaN(convertedValue)) {
                // If a segment is not a number, default it to 0 to prevent errors
                // in subsequent arithmetic operations, mimicking robust parsing.
                console.warn(`Conversion alert: Non-numeric input "${segmentItem}" detected. Using 0.`);
                return 0;
            }
            return convertedValue;
        });
    };

    // Step 1: Parse the incoming raw data into a structured array of numbers.
    const processedNumericArray = parseAndValidateNumericSegments(rawInputString);

    // Step 2: Extract individual values using array destructuring for clarity.
    // This improves readability over direct index access (e.g., array[0]).
    const [valueAlpha, valueBeta, valueGamma] = processedNumericArray;

    // Initialize the final categorization result.
    // An empty string is the default state if no conditions are met.
    let finalCategorizationResult = '';

    // Step 3: Compute an intermediate difference, promoting code reusability and clarity.
    // This helps in simplifying the conditional expressions that follow.
    const gammaMinusBetaDifference = valueGamma - valueBeta;

    // Step 4: Apply the core business logic based on the extracted values.
    // The order of conditional checks is crucial and is preserved from the original.

    // Condition A: If the second value is greater than or equal to the third.
    if (valueBeta >= valueGamma) {
        finalCategorizationResult = 'delicious';
    } 
    // Condition B: If Condition A is false, check if (first value + 1) is strictly less than the calculated difference.
    else if ((valueAlpha + 1) < gammaMinusBetaDifference) {
        finalCategorizationResult = 'dangerous';
    } 
    // Condition C: If both Condition A and B are false, check if (first value + 1) is strictly greater than the calculated difference.
    else if ((valueAlpha + 1) > gammaMinusBetaDifference) {
        finalCategorizationResult = 'safe';
    }
    // Note: If (valueAlpha + 1) === gammaMinusBetaDifference and valueBeta < valueGamma,
    //       then finalCategorizationResult remains an empty string, matching original behavior.

    // Step 5: Output the determined category to the standard output stream.
    console.log(finalCategorizationResult);
};

// Entry point for execution: Reads from standard input and delegates to the processor.
// Encapsulated within an Immediately Invoked Function Expression (IIFE) for scope isolation.
(function executeMainProcess() {
    try {
        // Define the constant path for standard input.
        const STDIN_FILE_PATH = '/dev/stdin';
        
        // Read the entire content of the standard input synchronously.
        // 'utf8' encoding is specified for proper string interpretation.
        const receivedInputContent = require('fs').readFileSync(STDIN_FILE_PATH, 'utf8');
        
        // Invoke the main data processing function with the acquired content.
        SystemDataProcessor(receivedInputContent);
    } catch (ioError) {
        // Comprehensive error handling for file system operations.
        // This catch block ensures that I/O issues are reported gracefully.
        console.error(`An I/O error occurred during input reading: ${ioError.message}`);
        // In a production system, further actions like exiting or logging to a specific file might be considered.
    }
})();