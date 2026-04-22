const filesystemModule = require('fs'); // Access Node.js file system utilities

// Define constants for the input source and encoding format to enhance readability and maintainability.
const inputSourcePath = '/dev/stdin'; // Standard input file path in Unix-like systems
const characterEncoding = 'utf8';     // Universal character encoding standard

// This constant represents the final scaling factor applied to the difference between values.
// The original logic of `(value.replace('.', '') - otherValue.replace('.', '')) / 10`
// effectively computes `10 * (parsedValue - parsedOtherValue)`.
const resultScalingMultiplier = 10;

/**
 * Executes the main program logic:
 * 1. Reads raw input data from a specified source.
 * 2. Parses and validates numeric data points from the input.
 * 3. Sorts the validated numbers to identify the extreme values.
 * 4. Calculates a scaled difference based on the largest and smallest numbers.
 * 5. Displays the final computed result.
 */
function processAndDisplayCalculatedDifference() {
    let rawFileContents; // Variable to hold the raw text content read from the file.

    try {
        // Attempt to synchronously read the entire content of the input file.
        rawFileContents = filesystemModule.readFileSync(inputSourcePath, characterEncoding);
    } catch (readingError) {
        // If an error occurs during file reading (e.g., file not found, permission issues),
        // log the error and terminate the process gracefully.
        console.error(`An error occurred while attempting to read the input source: ${readingError.message}`);
        process.exit(1); // Exit with a non-zero status code to indicate failure.
    }

    // Split the raw content into an array of individual lines.
    const rawInputLines = rawFileContents.split("\n");

    // Process each line to extract and validate numeric values.
    // - Trim whitespace from each line.
    // - Filter out any lines that become empty after trimming.
    // - Attempt to convert each remaining line to a floating-point number.
    // - Filter out any results that are Not-a-Number (NaN), ensuring only valid numbers remain.
    const validatedNumericValues = rawInputLines
        .map(currentLine => currentLine.trim())         // Remove leading/trailing whitespace
        .filter(trimmedLine => trimmedLine !== '')      // Discard empty strings
        .map(stringToNumber => parseFloat(stringToNumber)) // Convert string to float
        .filter(numberValue => !isNaN(numberValue));    // Exclude invalid number conversions

    // Implement a guard clause to ensure there are at least two valid numbers for comparison.
    if (validatedNumericValues.length < 2) {
        console.error("Error: Insufficient valid numeric data. At least two distinct numbers are required for computation.");
        process.exit(1); // Terminate due to insufficient data.
    }

    // Sort the array of validated numeric values in descending order.
    // The comparator (valueB - valueA) ensures that the largest number comes first.
    validatedNumericValues.sort((valueA, valueB) => valueB - valueA);

    // Retrieve the largest and smallest numbers from the sorted array.
    // The first element is the maximum, and the last is the minimum.
    const maximumValue = validatedNumericValues[0];
    const minimumValue = validatedNumericValues[validatedNumericValues.length - 1];

    // Calculate the raw difference between the maximum and minimum values.
    const calculatedDifference = maximumValue - minimumValue;

    // Apply the predefined scaling multiplier to the difference to get the final result.
    const finalComputedResult = calculatedDifference * resultScalingMultiplier;

    // Output the final result with a descriptive message.
    console.log(`The scaled difference between the extreme values is: ${finalComputedResult}`);
}

// Initiate the execution of the program by calling the main processing function.
processAndDisplayCalculatedDifference();