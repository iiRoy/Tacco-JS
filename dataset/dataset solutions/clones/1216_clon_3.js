const STANDARD_INPUT_FILE_PATH = '/dev/stdin';

/**
 * Robustly converts a string representation into an integer.
 * It handles non-numeric inputs by returning a specified fallback value
 * and ensures the result is a whole number.
 * @param {string} textValue - The string to be converted.
 * @param {number} [fallbackValue=0] - The value to return if conversion fails.
 * @returns {number} The parsed integer or the fallback value.
 */
function obtainIntegerFromString(textValue, fallbackValue = 0) {
    // Attempt to convert the string to a number.
    const numericCandidate = Number(textValue);

    // Check if the result is not a number or if it's not a finite integer.
    if (isNaN(numericCandidate) || !Number.isFinite(numericCandidate) || !Number.isInteger(numericCandidate)) {
        console.error(`Issue encountered: Input "${textValue}" cannot be reliably parsed as an integer. Defaulting to ${fallbackValue}.`);
        return fallbackValue;
    }

    // Ensure it's an integer (handles potential float inputs like "5.0")
    return Math.trunc(numericCandidate);
}

// Execute the primary logic within an anonymous function to prevent global scope pollution.
(function performNumericValueComparison() {
    // Reference to the Node.js file system module for input operations.
    const nodeFileSystem = require('node:fs');
    let acquiredRawData = ''; // Variable to store the content read from the input source.

    try {
        // Synchronously read the entire content of the standard input.
        // It's crucial to specify UTF-8 encoding for text data.
        acquiredRawData = nodeFileSystem.readFileSync(STANDARD_INPUT_FILE_PATH, { encoding: 'utf8', flag: 'r' });
    } catch (readingError) {
        // If there's any problem reading the file (e.g., file not found, permissions),
        // log the error and terminate the execution gracefully.
        console.error(`System Error: Unable to access or read data from the designated input source (${STANDARD_INPUT_FILE_PATH}). Details: ${readingError.message}`);
        process.exit(1); // Exit with a non-zero code indicating an error.
    }

    // Validate that some content was actually obtained.
    // Trim whitespace to handle cases where input might just be spaces or empty lines.
    if (!acquiredRawData || acquiredRawData.trim().length === 0) {
        console.warn('No discernible content was provided via standard input. No comparison can be made.');
        return; // Abort if input is empty.
    }

    // Split the raw string into individual components based on a single space character.
    // Using trim() ensures leading/trailing whitespace doesn't affect splitting.
    const contentFragments = acquiredRawData.trim().split(' ');

    // Verify that we have at least two numerical fragments to compare.
    if (contentFragments.length < 2) {
        console.error('Input Data Error: Expected at least two space-separated numerical values, but received insufficient fragments.');
        return; // Abort if the input format is incorrect.
    }

    // Convert the first two fragments into integer values using our helper function.
    // A default value of 0 is used if any fragment cannot be parsed correctly.
    const primaryValue = obtainIntegerFromString(contentFragments[0], 0);
    const secondaryValue = obtainIntegerFromString(contentFragments[1], 0);

    let comparisonStatement = ''; // Variable to hold the final output message.

    // Evaluate the relationship between the two numerical values.
    // This nested conditional structure offers an alternative to a simple if/else if/else chain.
    if (primaryValue < secondaryValue) {
        comparisonStatement = `Observation: The initial numerical quantity (${primaryValue}) is definitely smaller than the subsequent quantity (${secondaryValue}).`;
    } else {
        // If the primary value is not less than the secondary, it must be either greater or equal.
        if (primaryValue > secondaryValue) {
            comparisonStatement = `Observation: The initial numerical quantity (${primaryValue}) is unequivocally larger than the subsequent quantity (${secondaryValue}).`;
        } else {
            // If neither less nor greater, they must be equal.
            comparisonStatement = `Observation: Both numerical quantities (${primaryValue} and ${secondaryValue}) are found to be precisely equivalent.`;
            // Add an extra informational log specifically for the equality case.
            console.info('Additional Detail: A perfect match was identified between the compared operands.');
        }
    }

    // Display the final determined comparison result to the standard output.
    console.log(comparisonStatement);

})(); // End of the immediately invoked function expression.