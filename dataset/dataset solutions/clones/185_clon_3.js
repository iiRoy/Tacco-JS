// This module provides essential file system utilities for reading data from external sources.
const systemFileHandler = require('fs');

// Define configuration constants for the input stream and processing.
const standardInputSourcePath = '/dev/stdin'; // Specifies the standard input file path on Unix-like systems.
const dataEncodingFormat = 'utf8';           // Defines the character encoding for reading the input content.
const outputPrecisionDigits = 2;             // Sets the number of decimal places for the final result.

/**
 * Utility function to safely convert a string value into a floating-point number.
 * It handles cases where the string might not represent a valid number.
 * @param {string} stringToConvert - The string that needs to be parsed.
 * @returns {number | null} The parsed floating-point number, or null if parsing fails (isNaN).
 */
function attemptNumericConversion(stringToConvert) {
    const convertedValue = parseFloat(stringToConvert);
    // Validate if the conversion resulted in a legitimate number.
    if (isNaN(convertedValue)) {
        // In a production scenario, one might log this warning or throw an error.
        // console.warn(`Non-numeric input encountered and skipped: "${stringToConvert}"`);
        return null; // Indicate failure to parse a valid number.
    }
    return convertedValue; // Return the successfully parsed number.
}

let rawIncomingData = ''; // Variable to hold the entire content read from the input source.

try {
    // Synchronously read all content from the specified standard input path using the defined encoding.
    rawIncomingData = systemFileHandler.readFileSync(standardInputSourcePath, dataEncodingFormat);
} catch (ioOperationError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`ERROR: Failed to read input from ${standardInputSourcePath}. Details: ${ioOperationError.message}`);
    process.exit(1); // Terminate the application with an error code.
}

// Initial validation: Check if the input content is entirely empty or just whitespace.
if (rawIncomingData.trim().length === 0) {
    console.log("No content detected in the input stream. Exiting gracefully.");
    process.exit(0); // Exit successfully as there's no data to process.
}

// Process the raw input: split it into individual lines and filter out any empty lines.
const nonBlankInputLines = rawIncomingData
    .split("\n") // Split the entire content by newline characters.
    .filter(lineFragment => lineFragment.trim().length > 0); // Remove any lines that are empty or contain only whitespace.

// Further validation: Ensure that we have at least one meaningful line after filtering.
if (nonBlankInputLines.length === 0) {
    console.log("Input contains no valid non-blank lines for processing. Exiting.");
    process.exit(0);
}

// Transform the array of string lines into an array of numeric values.
// Utilize the helper function to parse each string, then filter out any unsuccessful conversions.
const validNumericValues = nonBlankInputLines
    .map(lineValue => attemptNumericConversion(lineValue)) // Attempt to convert each line to a float.
    .filter(convertedItem => convertedItem !== null);      // Keep only the successfully converted numbers.

// Critical validation: Check if there are sufficient numeric values to perform a difference calculation.
if (validNumericValues.length < 2) {
    console.log("Insufficient valid numeric data (less than two distinct numbers) provided.");
    // If only one number is provided, the difference between itself and itself is zero.
    // This matches the behavior of the original snippet where x[0] - x[x.length-1] would be x[0] - x[0] = 0.
    if (validNumericValues.length === 1) {
        console.log((0.00).toFixed(outputPrecisionDigits));
    }
    process.exit(0);
}

// Sort the array of numeric values in descending order.
// The comparison function (valueB - valueA) arranges elements from largest to smallest.
validNumericValues.sort((valueA, valueB) => valueB - valueA);

// Identify the extreme values from the sorted array.
// The largest value is at the first index.
const highestObservedMagnitude = validNumericValues[0];
// The smallest value is at the last index.
const lowestObservedMagnitude = validNumericValues[validNumericValues.length - 1];

// Calculate the range between the highest and lowest observed magnitudes.
const computedRangeDifference = highestObservedMagnitude - lowestObservedMagnitude;

// Format the final result to the predefined number of decimal places.
const finalFormattedOutput = computedRangeDifference.toFixed(outputPrecisionDigits);

// Display the formatted result to the standard output.
console.log(finalFormattedOutput);