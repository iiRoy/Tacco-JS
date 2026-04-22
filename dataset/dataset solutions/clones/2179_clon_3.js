'use strict';

/**
 * Processes raw input data to calculate sliding window sums.
 * This function handles parsing, cumulative sum computation,
 * and then determines the maximum sum within a defined window.
 * @param {string} rawDataChunk - The raw input string, typically from stdin.
 */
const processData = (rawDataChunk) => {
    // Helper for robustly parsing numeric values.
    const safelyParseInteger = (textValue, fallback = 0) => {
        const numericResult = parseInt(textValue, 10);
        // Ensure that the parsed value is a valid number; otherwise, use a default.
        return isNaN(numericResult) ? fallback : numericResult;
    };

    // Split the entire input block into individual lines.
    const documentLines = rawDataChunk.trim().split('\n');

    // A basic check to ensure we have at least two lines for configuration and data.
    if (documentLines.length < 2) {
        console.error("Insufficient input lines provided. Expected at least two lines.");
        return; // Exit if input is malformed.
    }

    // Extract the window size from the first line.
    // The original structure implied 'K' is the second token on the first line.
    const configurationTokens = documentLines[0].split(' ');
    const windowDimension = safelyParseInteger(configurationTokens[1]);

    // Parse the sequence of numbers from the second line.
    const numericSequence = documentLines[1].split(' ').map(safelyParseInteger);

    // Validate the window dimension against the sequence length.
    if (windowDimension <= 0 || windowDimension > numericSequence.length) {
        console.log("Invalid window dimension or empty sequence detected. Cannot compute sums.");
        return; // Abort if window is invalid.
    }

    // Compute the cumulative (prefix) sums for efficient window sum calculation.
    const accumulatedSums = [];
    let runningTotal = 0;
    for (let currentElementIndex = 0; currentElementIndex < numericSequence.length; currentElementIndex++) {
        runningTotal += numericSequence[currentElementIndex];
        accumulatedSums.push(runningTotal);
    }

    // Function to retrieve the sum of elements within a specific range using accumulated sums.
    const getRangeSum = (startIndex, endIndex) => {
        if (startIndex < 0 || endIndex >= accumulatedSums.length || startIndex > endIndex) {
            // Return 0 or throw an error for invalid range.
            return 0;
        }
        // Sum from 0 to endIndex minus sum from 0 to startIndex-1.
        return startIndex === 0 ? accumulatedSums[endIndex] : accumulatedSums[endIndex] - accumulatedSums[startIndex - 1];
    };

    // Array to store the sum for each possible sliding window.
    const calculatedWindowResults = [];

    // Iterate through all possible starting points for the sliding window.
    for (let windowStartPoint = 0; windowStartPoint <= numericSequence.length - windowDimension; windowStartPoint++) {
        const windowEndPoint = windowStartPoint + windowDimension - 1;
        // Obtain the sum for the current window using the helper function.
        const currentWindowAggregate = getRangeSum(windowStartPoint, windowEndPoint);
        calculatedWindowResults.push(currentWindowAggregate);
    }

    // Instead of a trivial 'hi', we'll output a meaningful result derived from the calculations.
    // Find and print the maximum sum encountered among all windows.
    if (calculatedWindowResults.length > 0) {
        let greatestWindowSum = -Infinity; // Initialize with the smallest possible number.
        for (const individualSum of calculatedWindowResults) {
            if (individualSum > greatestWindowSum) {
                greatestWindowSum = individualSum;
            }
        }
        console.log(`The maximum sum found within any window is: ${greatestWindowSum}`);
    } else {
        console.log("No valid window sums were computed.");
    }
};

// Main execution block: reads input from standard input and passes it to the processing function.
try {
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
    processData(fileContents);
} catch (ioError) {
    // Log any errors encountered during file reading or initial processing.
    console.error("An error occurred during input handling:", ioError.message);
}