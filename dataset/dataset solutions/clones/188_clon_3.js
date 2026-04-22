// This program is designed to read a sequence of numerical values from standard input,
// identify the largest and smallest numbers among them, and then compute their difference.

// Import the 'fs' (file system) module, which provides synchronous file I/O operations.
const fileSystemHandler = require('fs');

// Define the file path for standard input. In Unix-like systems, this is typically /dev/stdin.
const stdInputSourcePath = '/dev/stdin';

// Define the character encoding to be used when reading the input stream.
const textEncodingFormat = 'utf8';

let rawContentBuffer; // A temporary variable to hold the entire raw content read from the input source.

try {
    // Attempt to read the complete content of the standard input file synchronously.
    // This operation can throw an error if the file doesn't exist or permissions are insufficient.
    rawContentBuffer = fileSystemHandler.readFileSync(stdInputSourcePath, textEncodingFormat);
} catch (inputReadError) {
    // If an error occurs during the file reading process, log the error details
    // and terminate the application gracefully with an error status code.
    console.error("An error occurred while attempting to read from standard input:", inputReadError.message);
    process.exit(1); // Exit with a non-zero code to indicate failure.
}

// Split the raw buffer content into an array of individual text lines.
// The splitting occurs at each newline character.
// Additionally, filter out any empty strings that might result from consecutive newlines
// or from a trailing newline at the end of the input.
const unprocessedTextLines = rawContentBuffer.split('\n').filter(lineSegment => lineSegment.trim() !== '');

// Initialize an array to store only the successfully parsed numerical values.
const validatedNumericEntries = [];

// Iterate through each text line obtained from the input.
for (let lineIndex = 0; lineIndex < unprocessedTextLines.length; lineIndex++) {
    const currentLineData = unprocessedTextLines[lineIndex];

    // Attempt to convert the current line's text into a floating-point number.
    const potentialNumericValue = parseFloat(currentLineData);

    // Validate the parsed value:
    // 1. Check if it's not 'Not-a-Number' (isNaN).
    // 2. Check if it's a finite number (e.g., not Infinity or -Infinity).
    if (!isNaN(potentialNumericValue) && Number.isFinite(potentialNumericValue)) {
        // If the value is a valid, finite number, add it to our collection.
        validatedNumericEntries.push(potentialNumericValue);
    } else {
        // If the line does not contain a valid number, issue a warning to the user
        // but continue processing the remaining lines.
        console.warn(`Warning: Skipped invalid or non-numeric data on line ${lineIndex + 1}: "${currentLineData}"`);
    }
}

// Implement a crucial guard clause:
// The calculation requires at least two distinct numerical values (a largest and a smallest).
if (validatedNumericEntries.length < 2) {
    console.error("Error: Insufficient valid numerical data provided. At least two numbers are required for comparison.");
    process.exit(1); // Terminate with an error code.
}

// Define a comparison function for sorting numbers in a descending order.
// This function will be passed to the array's sort method.
const descendingOrderComparator = (valueOne, valueTwo) => {
    // If valueTwo is greater than valueOne, the result is positive,
    // causing valueTwo to be placed before valueOne in the sorted array.
    return valueTwo - valueOne;
};

// Sort the array of validated numeric entries in place, from the largest value to the smallest.
validatedNumericEntries.sort(descendingOrderComparator);

// After sorting, the largest number will be at the first index (index 0).
const highestObservedValue = validatedNumericEntries[0];

// The smallest number will be at the last index of the sorted array.
const lowestObservedValue = validatedNumericEntries[validatedNumericEntries.length - 1];

// Introduce an arbitrary scaling constant. This is sometimes used to handle
// potential floating-point precision issues or merely as an obfuscation technique.
const commonScalingFactor = 10.0;

// Apply the scaling factor to both the highest and lowest values.
const scaledHighest = highestObservedValue * commonScalingFactor;
const scaledLowest = lowestObservedValue * commonScalingFactor;

// Calculate the difference between the scaled values.
const scaledDifferenceResult = scaledHighest - scaledLowest;

// Divide the scaled difference by the original scaling factor to obtain the true difference.
// This effectively calculates (highestObservedValue - lowestObservedValue) but through intermediate steps.
const finalComputedDifference = scaledDifferenceResult / commonScalingFactor;

// Output the final calculated difference to the console.
console.log(finalComputedDifference);