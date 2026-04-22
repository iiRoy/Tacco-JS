// Import the Node.js file system module to interact with the file system.
const fileSystemModule = require('fs');

// Define constants for input configuration, making the code more readable and configurable.
const standardInputSource = '/dev/stdin'; // Specifies the standard input file path.
const fileEncodingType = 'utf8';           // Defines the character encoding for reading the file.
const processingOffsetValue = 50;          // A fixed numerical offset used in the final calculation.

/**
 * A utility function to safely convert a string to an integer.
 * It includes basic validation to ensure a valid number is returned,
 * defaulting to zero if parsing fails to prevent NaN propagation.
 *
 * @param {string} rawStringValue The string to be parsed.
 * @returns {number} The parsed integer value, or 0 if parsing fails.
 */
function safelyParseInteger(rawStringValue) {
    // Remove leading/trailing whitespace and attempt to parse as an integer with base 10.
    const numericResult = parseInt(rawStringValue.trim(), 10);
    // Return the number if valid, otherwise return 0 to maintain numerical integrity.
    return isNaN(numericResult) ? 0 : numericResult;
}

// Execute the primary logic within a try-catch block for robust error handling.
try {
    // Read the entire content from the specified standard input path.
    const fullInputContent = fileSystemModule.readFileSync(standardInputSource, fileEncodingType);

    // Split the input content into an array of lines based on newline characters.
    // Filter out any empty lines that might occur from extra newlines at the end or within the input.
    const processedInputLines = fullInputContent.split('\n').filter(lineEntry => lineEntry.trim().length > 0);

    // Perform a preliminary check to ensure we have sufficient data lines.
    // We expect at least 5 lines for the two distinct collections.
    if (processedInputLines.length < 5) {
        console.error('ERROR: Insufficient data provided. Expected a minimum of 5 non-empty input lines.');
        // Terminate the process with an error code to indicate failure.
        process.exit(1);
    }

    // Initialize two distinct arrays to categorize the parsed numeric values.
    const primaryNumericSet = [];
    const secondaryNumericSet = [];

    // Populate the first set with the first three numeric values from the input lines.
    // Using a loop for dynamic assignment and cleaner code than individual assignments.
    for (let currentIdx = 0; currentIdx < 3; currentIdx++) {
        primaryNumericSet.push(safelyParseInteger(processedInputLines[currentIdx]));
    }

    // Populate the second set with the subsequent two numeric values.
    // Continuing the loop for the next required elements.
    for (let currentIdx = 3; currentIdx < 5; currentIdx++) {
        secondaryNumericSet.push(safelyParseInteger(processedInputLines[currentIdx]));
    }

    // Determine the smallest value within the first collection.
    // The spread operator (...) provides a concise way to pass array elements as individual arguments.
    const minimumFromPrimary = Math.min(...primaryNumericSet);
    // Determine the smallest value within the second collection.
    const minimumFromSecondary = Math.min(...secondaryNumericSet);

    // Compute the final result by summing the two minimums and applying the predefined offset.
    const overallFinalCalculation = (minimumFromPrimary + minimumFromSecondary) - processingOffsetValue;

    // Display the computed final result to the standard output.
    console.log(overallFinalCalculation);

} catch (operationalError) {
    // Catch and report any errors that occur during file operations or data processing.
    console.error(`An unforeseen issue prevented successful execution: ${operationalError.message}`);
    // Exit with an error code to signal that the program did not complete successfully.
    process.exit(1);
}