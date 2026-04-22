/**
 * This module provides functionality to analyze a sequence of numeric data
 * to determine the longest continuous non-increasing subsequence.
 * It processes input data typically provided in a multi-line string format.
 */
function processRawData(entryData) {
    // Validate the input: ensure it's a non-empty string.
    if (typeof entryData !== 'string' || entryData.trim().length === 0) {
        console.error("Input data validation failed: Data is invalid or empty.");
        return;
    }

    // Split the incoming multi-line string into individual line segments.
    const dataLines = entryData.split('\n');

    // Essential check: verify that at least two lines of data are present (count and sequence).
    if (dataLines.length < 2) {
        console.error("Input data error: Insufficient lines provided for processing.");
        return;
    }

    // Attempt to parse the first line, which should represent the expected count of sequence elements.
    // Using parseFloat for robustness, though problem usually implies integers.
    const expectedElementCount = parseInt(dataLines[0].trim(), 10);

    // Validate the parsed count: it must be a positive integer.
    if (isNaN(expectedElementCount) || expectedElementCount < 0) {
        console.error("Input data error: Invalid or negative element count specified.");
        return;
    }

    // Process the second line, splitting it by spaces and converting each part to a number.
    // The `filter(val => !isNaN(val))` ensures only valid numbers are kept, handling potential extra spaces.
    const numericSequence = dataLines[1].trim().split(' ').map(Number).filter(val => !isNaN(val));

    // Optional warning if the actual number of elements doesn't match the declared count.
    if (numericSequence.length !== expectedElementCount) {
        console.warn(`Data discrepancy: Declared element count (${expectedElementCount}) differs from actual elements parsed (${numericSequence.length}). Processing with actual elements.`);
    }

    // Initialize trackers for the current non-increasing streak and the maximum streak found.
    let currentNonIncreasingStreak = 0;
    let maximumNonIncreasingStreak = 0;

    // Handle edge cases for very short sequences (0 or 1 element).
    // In such cases, a non-increasing streak of length 1 or more cannot be formed by comparison.
    if (numericSequence.length <= 1) {
        console.log(0);
        return;
    }

    // Iterate through the numeric sequence, comparing each element with its successor.
    // The loop runs up to the second-to-last element to allow for `currentPosition + 1` access.
    for (let currentPosition = 0; currentPosition < numericSequence.length - 1; currentPosition++) {
        // Retrieve the two adjacent values for comparison to enhance readability.
        const valueAtCurrentPosition = numericSequence[currentPosition];
        const valueAtNextPosition = numericSequence[currentPosition + 1];

        // Check if the sequence is non-increasing (current element is greater than or equal to the next).
        if (valueAtCurrentPosition >= valueAtNextPosition) {
            currentNonIncreasingStreak++; // Increment the streak if the condition holds.
        } else {
            currentNonIncreasingStreak = 0; // Reset the streak if an increase is detected.
        }

        // Update the overall maximum streak using a concise Math.max operation.
        maximumNonIncreasingStreak = Math.max(maximumNonIncreasingStreak, currentNonIncreasingStreak);
    }

    // Output the final computed maximum non-increasing streak.
    console.log(`${maximumNonIncreasingStreak}`);
}

// --- Standard Input/Output Handling ---
// This section is responsible for reading the input from the standard stream
// and invoking the primary data processing function.
// While Type III allows changes, the core mechanism of reading /dev/stdin is usually preserved.

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";

try {
    // Read the entire content from the standard input file, specifying UTF-8 encoding.
    const collectedInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8");

    // Execute the main data analysis function with the content obtained from stdin.
    processRawData(collectedInputContent);
} catch (errorReadingInput) {
    // Log any errors encountered during the file reading process.
    console.error(`An exception occurred during standard input reading: ${errorReadingInput.message}`);
    // Indicate an abnormal termination of the program.
    process.exit(1);
}