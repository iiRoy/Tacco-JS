// This module handles file system operations for accessing standard input.
const fileSystemModule = require('fs');

/**
 * Safely acquires and parses numeric input from standard input.
 * It reads the entire input, splits it into lines, filters empty lines,
 * and converts valid lines into numbers.
 * @returns {Array<number>} An array of numbers parsed from the input.
 */
function acquireProgramInput() {
    let rawInputContent;
    try {
        // Attempt to read the entire standard input synchronously.
        // This method is common in competitive programming environments for quick input handling.
        // Note: '/dev/stdin' is Unix-specific. For cross-platform compatibility,
        // more complex logic involving fs.fstatSync and fs.readSync would be needed,
        // similar to the original, but with modern Buffer/Uint8Array handling.
        rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    } catch (error) {
        // Log an error if input cannot be read, and return an empty array to prevent further processing.
        console.error("Critical error: Unable to read standard input. Details:", error.message);
        return [];
    }

    // Split the input string by newlines, then filter out any empty string lines.
    const filteredInputLines = rawInputContent.split('\n').filter(line => line.trim() !== '');

    // Convert each filtered line string into a number.
    // Lines that cannot be parsed as numbers will result in NaN.
    const parsedNumericData = filteredInputLines.map(Number);

    // Provide a warning if no valid numeric data was found after parsing.
    if (parsedNumericData.length === 0) {
        console.warn("No valid numeric input detected from stdin after parsing. Program may terminate early.");
    }
    return parsedNumericData;
}

/**
 * Compares two numeric values and returns the larger one.
 * This is a simple helper function for readability.
 * @param {number} valueA - The first value to compare.
 * @param {number} valueB - The second value to compare.
 * @returns {number} The greater of the two input values.
 */
const getGreaterValue = (valueA, valueB) => Math.max(valueA, valueB);

/**
 * Implements Kadane's algorithm to find the maximum sum of a contiguous subarray
 * within a specified segment of a numeric array.
 *
 * @param {Array<number>} sourceArray - The array containing numeric data.
 * @param {number} segmentStartIndex - The starting index of the segment within sourceArray.
 * @param {number} segmentLength - The number of elements in the segment to process.
 * @returns {number} The maximum subarray sum, or Number.NEGATIVE_INFINITY if no valid numbers were processed.
 */
function calculateMaxSubarraySumForSegment(sourceArray, segmentStartIndex, segmentLength) {
    // If the segment length is non-positive, there are no elements to process.
    // Return negative infinity as a base case for maximum sum.
    if (segmentLength <= 0) {
        return Number.NEGATIVE_INFINITY;
    }

    let currentMaxEndingHere = Number.NEGATIVE_INFINITY; // Represents max sum ending at the current position.
    let overallMaxSum = Number.NEGATIVE_INFINITY;       // Represents the global maximum sum found so far.

    // Iterate through the specified segment of the source array.
    for (let offset = 0; offset < segmentLength; offset++) {
        const currentAbsoluteIndex = segmentStartIndex + offset;
        const currentElementValue = sourceArray[currentAbsoluteIndex];

        // Validate if the current element is a valid number. Skip if not.
        if (isNaN(currentElementValue)) {
            console.error(`Data integrity warning: Non-numeric value found at index ${currentAbsoluteIndex}. Skipping this element.`);
            continue; // Move to the next element without processing this one.
        }

        // Kadane's core logic:
        // The maximum sum ending at the current position is either
        // the current element itself, or the current element added to the max sum ending at the previous position.
        currentMaxEndingHere = getGreaterValue(currentMaxEndingHere + currentElementValue, currentElementValue);

        // Update the overall maximum sum found across all subarrays processed so far.
        overallMaxSum = getGreaterValue(overallMaxSum, currentMaxEndingHere);
    }

    // Return the final overall maximum sum.
    // If overallMaxSum is still Number.NEGATIVE_INFINITY, it implies either
    // the segment was empty (handled above), or all elements were invalid/skipped,
    // or all elements were negative and the initial negative infinity was never updated by a valid sum.
    // However, Kadane's correctly handles all-negative arrays by returning the largest single negative number.
    return overallMaxSum;
}

/**
 * Orchestrates the main program logic: reading input sequences and processing them.
 * It reads a sequence length, then processes that many numbers, repeating until a length of 0 is encountered.
 */
function processInputSequences() {
    const allNumericInput = acquireProgramInput();
    let inputReadCursor = 0; // Pointer to the current position in the input array.

    // Loop indefinitely until a specific break condition is met.
    while (inputReadCursor < allNumericInput.length) {
        // The first number in each block indicates the count of elements in the subsequent sequence.
        const elementsCountForCurrentSequence = allNumericInput[inputReadCursor];
        inputReadCursor++; // Advance the cursor past the count number.

        // Perform validation on the read count.
        if (isNaN(elementsCountForCurrentSequence) || elementsCountForCurrentSequence < 0) {
            console.error(`Input format error: Encountered invalid sequence length '${elementsCountForCurrentSequence}' at index ${inputReadCursor - 1}. Terminating processing.`);
            break; // Stop if the count is invalid.
        }

        // A sequence length of 0 is the sentinel value to signal the end of all input sequences.
        if (elementsCountForCurrentSequence === 0) {
            break; // Exit the main processing loop.
        }

        // Pre-check to ensure there are enough actual data elements remaining in the input array
        // to satisfy the declared sequence length.
        if (inputReadCursor + elementsCountForCurrentSequence > allNumericInput.length) {
            console.error(`Input data shortage: Declared sequence length of ${elementsCountForCurrentSequence} at index ${inputReadCursor - 1} exceeds available data. Expected ${elementsCountForCurrentSequence} elements, but only ${allNumericInput.length - inputReadCursor} remain. Terminating.`);
            break; // Stop due to insufficient data.
        }

        // Calculate the maximum subarray sum for the current block of numbers.
        const currentSequenceMaxSum = calculateMaxSubarraySumForSegment(
            allNumericInput,
            inputReadCursor,
            elementsCountForCurrentSequence
        );

        // Output the result for the current sequence.
        console.log(currentSequenceMaxSum);

        // Advance the cursor past all elements processed in the current sequence.
        inputReadCursor += elementsCountForCurrentSequence;
    }
}

// Entry point for the program.
// Wrap the main execution in a try-catch block for robust error handling
// against unexpected runtime issues.
try {
    processInputSequences();
} catch (globalProgramError) {
    console.error("An unhandled exception occurred during program execution:", globalProgramError.message);
    // Optionally, exit the process with a non-zero code to indicate an error.
    // process.exit(1);
}