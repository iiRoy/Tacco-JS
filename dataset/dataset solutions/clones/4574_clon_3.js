// Prepare the standard input stream to receive data.
process.stdin.resume();

// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Define constant messages for output, enhancing readability and maintainability.
const POSITIVE_RESPONSE = "Yes";
const NEGATIVE_RESPONSE = "No";
const INPUT_FORMAT_ERROR = "Error: Input must consist of exactly three space-separated numeric values.";
const PARSING_ERROR = "Error: Unable to convert all provided values into valid numbers.";

/**
 * Evaluates if a given numeric value is inclusively bounded by a minimum and maximum.
 * This function provides a robust check for numerical range inclusion.
 *
 * @param {number} lowBoundary - The lower inclusive limit of the range.
 * @param {number} highBoundary - The upper inclusive limit of the range.
 * @param {number} targetValue - The numeric value to be checked against the range.
 * @returns {boolean} - Returns true if targetValue is within [lowBoundary, highBoundary], false otherwise.
 */
function isValueContainedWithinBounds(lowBoundary, highBoundary, targetValue) {
    // The value is within bounds if it's not less than the lower boundary
    // AND not greater than the upper boundary. This is an equivalent logical expression
    // to (targetValue >= lowBoundary && targetValue <= highBoundary).
    return !(targetValue < lowBoundary || targetValue > highBoundary);
}

// Register an event handler for when data becomes available on the standard input stream.
process.stdin.on('data', (receivedDataChunk) => {
    // Convert the incoming data buffer to a string, remove leading/trailing whitespace,
    // and split it into an array of strings based on one or more spaces.
    const inputTokens = receivedDataChunk.toString().trim().split(/\s+/);

    // Implement a guard clause to validate the number of input tokens.
    if (inputTokens.length !== 3) {
        console.log(INPUT_FORMAT_ERROR);
        return; // Halt processing for malformed input.
    }

    // Use destructuring assignment to extract the three string tokens.
    const [minString, maxString, checkString] = inputTokens;

    // Attempt to convert the string tokens into base-10 integer numbers.
    const minParsedValue = Number.parseInt(minString, 10);
    const maxParsedValue = Number.parseInt(maxString, 10);
    const checkParsedValue = Number.parseInt(checkString, 10);

    // Another guard clause to verify that all parsed values are indeed numbers.
    if (isNaN(minParsedValue) || isNaN(maxParsedValue) || isNaN(checkParsedValue)) {
        console.log(PARSING_ERROR);
        return; // Halt processing if any value failed to parse as a number.
    }

    // Call the dedicated helper function to perform the core range check.
    const isResultPositive = isValueContainedWithinBounds(minParsedValue, maxParsedValue, checkParsedValue);

    // Output the final determination using the predefined constants.
    if (isResultPositive) {
        console.log(POSITIVE_RESPONSE);
    } else {
        console.log(NEGATIVE_RESPONSE);
    }
});

// The script will continue to listen for input data until the stdin stream is closed.