// This module provides file system capabilities, crucial for interacting with the operating system's file I/O.
const fileSystemModule = require('fs');

// Retrieve metadata about the standard input stream to determine its size.
// Synchronous operations are used here for straightforward script execution order.
const streamMetaData = fileSystemModule.fstatSync(process.stdin.fd);
const totalDataSize = streamMetaData.size; // Represents the total number of bytes available in stdin.

// Implement a critical guard clause: if no input data is detected, log an error and terminate the process.
if (totalDataSize === 0) {
    console.error("Error: No data was provided through standard input. Please ensure input is piped or redirected.");
    process.exit(1); // Exit with a non-zero code to indicate an error.
}

// Dynamically allocate a buffer of the exact size required to store the standard input content.
const rawDataBuffer = Buffer.alloc(totalDataSize);

// Perform a synchronous read operation to transfer the data from standard input into the allocated buffer.
const actualBytesTransferred = fileSystemModule.readSync(
    process.stdin.fd,      // File descriptor for standard input.
    rawDataBuffer,         // The buffer to write the data into.
    0,                     // Offset in the buffer to begin writing.
    totalDataSize,         // Number of bytes to read.
    0                      // Position in the file to begin reading from (0 for stdin).
);

// Convert the buffer's content into a UTF-8 string, remove leading/trailing whitespace,
// and then split the string into an array of lines based on newline characters.
const dataLines = rawDataBuffer
    .toString('utf8', 0, actualBytesTransferred)
    .trim()
    .split('\n');

// Invoke the primary routine responsible for processing the collected input lines.
processInputData();

/**
 * A utility function designed to check if a specific number of consecutive elements within an array
 * are all identical. This is particularly useful for pattern matching in sorted sequences.
 *
 * @param {Array<number>} candidateArray - The array of numerical values to be examined.
 * @param {number} startingIdx - The zero-based index from which the comparison should begin.
 * @param {number} comparisonCount - The total number of elements (including the starting one) to check for equality.
 * @returns {boolean} - Returns `true` if all `comparisonCount` elements starting from `startingIdx` are identical;
 *                      `false` otherwise, or if the array does not have enough elements for the check.
 */
function checkForConsecutiveIdentical(candidateArray, startingIdx, comparisonCount) {
    // Basic validation to ensure the array is valid and has sufficient elements for the check.
    if (!Array.isArray(candidateArray) || candidateArray.length < startingIdx + comparisonCount || comparisonCount <= 0) {
        return false;
    }

    const referenceValue = candidateArray[startingIdx]; // The value to compare against.
    // Iterate through the subsequent elements to ensure they match the reference value.
    for (let k = 1; k < comparisonCount; k++) {
        if (candidateArray[startingIdx + k] !== referenceValue) {
            return false; // Found a mismatch.
        }
    }
    return true; // All elements checked were identical.
}

/**
 * The core function that iterates through each line of input, parses numerical values,
 * sorts them, and applies specific pattern recognition logic.
 */
function processInputData() {
    const expectedNumberCount = 5; // Defines the fixed number of numerical values expected per input line.

    // Utilize forEach for iterating over each line, providing both the line content and its index.
    dataLines.forEach((currentLineContent, lineIdx) => {
        let patternMatchResult = "null"; // Initialize the outcome string. "null" is the default as per original logic.

        // Trim whitespace from the current line and split it into segments based on commas.
        const rawSegments = currentLineContent.trim().split(',');

        // --- Input Validation (Type III Addition) ---
        // Verify that the number of segments matches the expected count.
        if (rawSegments.length !== expectedNumberCount) {
            console.log(`Line ${lineIdx + 1}: Input error - Expected ${expectedNumberCount} comma-separated values, but found ${rawSegments.length}. Outputting default: ${patternMatchResult}`);
            return; // Skip processing for this invalid line and move to the next.
        }

        // Convert each segment to an integer, explicitly handling potential non-numeric inputs.
        // `parseInt` with radix 10 is used for robust conversion, and `null` marks invalid numbers.
        const numericValues = rawSegments.map(segment => {
            const num = parseInt(segment.trim(), 10);
            return isNaN(num) ? null : num; // Return null if conversion fails.
        });

        // Check if any of the parsed values resulted in `null`, indicating a non-numeric input.
        if (numericValues.includes(null)) {
            console.log(`Line ${lineIdx + 1}: Input error - Contains non-numeric data. Outputting default: ${patternMatchResult}`);
            return; // Skip this line if it contains invalid numbers.
        }
        // --- End Input Validation ---

        // Sort the array of numbers in descending order. This arrangement simplifies pattern detection.
        // For example, [1, 5, 2, 5, 5] becomes [5, 5, 5, 2, 1] after sorting.
        numericValues.sort((valA, valB) => valB - valA);

        // --- Pattern Recognition Logic (Type III Refactor with Helper) ---
        // Check for the "four card" pattern. This involves two distinct scenarios in a sorted array:
        // Scenario 1: The four largest numbers are identical (e.g., [7, 7, 7, 7, 2]).
        const fourLargestAreIdentical = checkForConsecutiveIdentical(numericValues, 0, 4);

        // Scenario 2: The four smallest numbers are identical (e.g., [9, 3, 3, 3, 3]).
        // In a descending sorted array of 5 elements, this corresponds to indices 1 through 4.
        const fourSmallestAreIdentical = checkForConsecutiveIdentical(numericValues, 1, 4);

        // If either of the "four card" scenarios is met, update the result.
        if (fourLargestAreIdentical || fourSmallestAreIdentical) {
            patternMatchResult = "four card";
        }
        // --- End Pattern Recognition ---

        // Output the final determined pattern for the current line.
        console.log(patternMatchResult);
    });
}