"use strict";

/**
 * Orchestrates the processing of input data to perform a specific numerical partitioning task.
 * It reads data, parses numbers, calculates a total sum, and then partitions the numbers
 * into two groups based on a derived threshold, finally reporting the difference between the group sums.
 *
 * @param {string} rawInputDataString - The raw string input, expected to contain at least two lines:
 *                                      The first line indicates the count of numbers to process (N).
 *                                      The second line contains N space-separated integer values.
 */
const ProcessInputData = (rawInputDataString) => {
    // --- Input Validation and Pre-processing (Type III: Guard clauses, intermediate steps, validation) ---

    // Ensure the input string is valid and not empty.
    if (typeof rawInputDataString !== 'string' || rawInputDataString.trim().length === 0) {
        console.error("Error: Provided input data is empty or not a valid string. Cannot proceed.");
        return; // Terminate execution gracefully for invalid input.
    }

    // Split the trimmed input into individual lines for easier access.
    const inputContentLines = rawInputDataString.trim().split('\n');

    // Verify that the necessary number of lines are present.
    if (inputContentLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines (count and numbers).");
        return;
    }

    // Extract and parse the count of numerical elements from the first line.
    const numberOfElementsString = inputContentLines[0];
    const expectedElementCount = Number(numberOfElementsString); // Explicit conversion to number.

    // Validate the parsed element count.
    if (isNaN(expectedElementCount) || expectedElementCount <= 0) {
        console.error(`Error: Invalid or non-positive element count detected: '${numberOfElementsString}'. Must be a positive number.`);
        return;
    }

    // Parse the actual numeric values from the second line.
    const spaceSeparatedNumbers = inputContentLines[1].split(' ');
    // Convert each string part to a number and filter out any non-numeric results (e.g., empty strings).
    const processedNumericSequence = spaceSeparatedNumbers
        .map(strValue => Number(strValue.trim()))
        .filter(numValue => !isNaN(numValue)); // Ensure only valid numbers are retained.

    // Optional: Log a warning if the actual number of valid elements differs from the expected count.
    if (processedNumericSequence.length < expectedElementCount) {
        console.warn(`Warning: Expected ${expectedElementCount} numbers, but found only ${processedNumericSequence.length} valid numbers. Proceeding with available data.`);
    }

    // --- Calculate the Overall Sum (Type III: Explicit loop bounds, renamed variables) ---
    let totalAccumulatedSum = 0;
    // Iterate up to the 'expectedElementCount' or the actual length of the numeric sequence, whichever is smaller.
    // This prevents out-of-bounds access if the input numbers are fewer than declared.
    for (let currentIndex = 0; currentIndex < expectedElementCount && currentIndex < processedNumericSequence.length; ++currentIndex) {
        totalAccumulatedSum += processedNumericSequence[currentIndex];
    }

    // --- Determine the Partitioning Threshold (Type II: Renamed variable) ---
    // The target sum for one of the partitions, typically half of the total sum.
    const partitioningTargetThreshold = totalAccumulatedSum / 2;

    // --- Execute the Partitioning Logic (Type III: Explicit conditions, renamed accumulators, preserved unique behavior) ---
    let primaryPartitionSum = 0;   // Accumulator for the first group of numbers.
    let secondaryPartitionSum = 0; // Accumulator for the second group of numbers.

    // Iterate through the numeric sequence to distribute elements into partitions.
    for (let elementIterator = 0; elementIterator < expectedElementCount; elementIterator++) {
        // Guard against accessing elements beyond the actual length of the processed sequence.
        if (elementIterator >= processedNumericSequence.length) {
            console.warn(`Warning: Iteration exceeded available numeric data at index ${elementIterator}. Stopping partitioning.`);
            break;
        }

        const currentElementValue = processedNumericSequence[elementIterator];

        // This conditional structure precisely replicates the original code's behavior:
        // - If primaryPartitionSum is strictly less than the threshold, add the element to it.
        // - If primaryPartitionSum is strictly greater than the threshold, add the element to the secondary sum.
        // - CRITICALLY: If primaryPartitionSum is EXACTLY equal to the threshold, the element is SKIPPED (added to neither sum).
        const conditionForPrimarySum = (primaryPartitionSum < partitioningTargetThreshold);
        const conditionForSecondarySum = (primaryPartitionSum > partitioningTargetThreshold); // This implicitly handles the 'equal' case by not matching.

        if (conditionForPrimarySum) {
            primaryPartitionSum += currentElementValue;
        } else if (conditionForSecondarySum) {
            secondaryPartitionSum += currentElementValue;
        }
        // No 'else' block here, preserving the unique characteristic where elements are skipped if `primaryPartitionSum === partitioningTargetThreshold`.
    }

    // --- Output the Final Result (Type II: Renamed variables, Type III: Added comment) ---
    // The final output is the difference between the two accumulated sums.
    console.log(primaryPartitionSum - secondaryPartitionSum);
};

// --- Entry Point for Script Execution (Type III: Encapsulated file reading, error handling) ---

/**
 * Safely reads the content of a file from the specified path.
 * @param {string} filePath - The path to the file to be read.
 * @returns {string} The content of the file as a string, or an empty string if an error occurs.
 */
const retrieveFileContent = (filePath) => {
    try {
        // Use Node.js 'fs' module to synchronously read the file.
        const fileContentBuffer = require('fs').readFileSync(filePath);
        return fileContentBuffer.toString('utf8'); // Convert buffer to UTF-8 string.
    } catch (readError) {
        console.error(`An error occurred while attempting to read from '${filePath}': ${readError.message}`);
        return ""; // Return an empty string to indicate failure.
    }
};

// Define the standard input path for typical competitive programming environments.
const standardInputSourcePath = '/dev/stdin';
const fileContents = retrieveFileContent(standardInputSourcePath);

// Only invoke the main processing function if file data was successfully retrieved.
if (fileContents !== "") {
    ProcessInputData(fileContents);
}