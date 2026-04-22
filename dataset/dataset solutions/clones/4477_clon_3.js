'use strict';

/**
 * Analyzes raw input data to determine the minimum absolute difference
 * achievable by splitting a sequence of numbers into two contiguous sub-sequences.
 * This function handles input parsing, data validation, and core computation.
 *
 * @param {string} incomingDataPayload - A string containing two lines:
 *                                       the first line specifies the count of numbers,
 *                                       the second line lists the numbers themselves, space-separated.
 */
function calculateSmallestPartitionDelta(incomingDataPayload) {
    // --- Input Acquisition and Initial Verification ---
    if (typeof incomingDataPayload !== 'string' || incomingDataPayload.trim() === '') {
        console.error("Error: The provided data payload is either not a string or is empty.");
        return; // Terminate execution gracefully for invalid input
    }

    // Split the entire payload into individual lines
    const parsedInputLines = incomingDataPayload.trim().split('\n');

    // Ensure we have at least two lines for N and the array
    if (parsedInputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines for data processing.");
        return;
    }

    // --- Parameter Parsing and Validation ---
    const declaredElementCount = Number(parsedInputLines[0].trim());

    // Basic validation for the element count
    if (isNaN(declaredElementCount) || !Number.isInteger(declaredElementCount) || declaredElementCount < 2) {
        console.error(`Error: Invalid or insufficient element count '${parsedInputLines[0]}'. Must be an integer greater than or equal to 2.`);
        return;
    }

    // Process the line containing the numeric values
    const stringifiedValues = parsedInputLines[1].trim().split(' ');
    const numericDataPoints = [];

    // Populate the array with parsed numbers, performing type conversion and validation
    for (let valueTokenIndex = 0; valueTokenIndex < stringifiedValues.length; valueTokenIndex++) {
        const currentNumericValue = Number(stringifiedValues[valueTokenIndex]);

        if (isNaN(currentNumericValue)) {
            console.error(`Error: Non-numeric data encountered at position ${valueTokenIndex}: '${stringifiedValues[valueTokenIndex]}'.`);
            return;
        }
        numericDataPoints.push(currentNumericValue);
    }

    // A crucial check to ensure the actual number of parsed elements matches the declared count
    if (numericDataPoints.length !== declaredElementCount) {
        console.warn(`Warning: The declared element count (${declaredElementCount}) does not match the actual number of parsed elements (${numericDataPoints.length}). Proceeding with actual count.`);
        // Optionally, one might choose to throw an error or adjust declaredElementCount here.
        // For this implementation, we'll proceed using the actual array length.
        if (numericDataPoints.length < 2) {
            console.error("Error: After parsing, the actual number of elements is less than 2, preventing valid partition.");
            return;
        }
    }

    // --- Core Logic: Aggregate Sum Calculation ---
    let overallCollectionSum = 0;
    // Using a traditional loop to sum elements, an alternative to 'reduce'
    for (const itemValue of numericDataPoints) {
        overallCollectionSum += itemValue;
    }

    // --- Core Logic: Partitioning and Minimum Difference Determination ---
    let currentSegmentSum = 0; // Accumulator for the first partition
    let lowestAbsoluteDifferenceEncountered = Infinity; // Initialize with a value guaranteed to be higher than any possible difference

    // Iterate through all possible split points.
    // A split point `k` divides the array into `[0...k]` and `[k+1...end]`.
    // The loop must end before the last element to ensure the second partition is not empty.
    for (let partitionMarker = 0; partitionMarker < declaredElementCount - 1; partitionMarker++) {
        // Add the current element to the sum of the first partition
        currentSegmentSum += numericDataPoints[partitionMarker];

        // Calculate the sum of the second partition
        const complementarySegmentSum = overallCollectionSum - currentSegmentSum;

        // Compute the absolute difference between the two partition sums
        const thisIterationDelta = Math.abs(currentSegmentSum - complementarySegmentSum);

        // Update the minimum difference if the current one is smaller
        lowestAbsoluteDifferenceEncountered = Math.min(lowestAbsoluteDifferenceEncountered, thisIterationDelta);
    }

    // --- Final Output ---
    console.log(lowestAbsoluteDifferenceEncountered);
}

// --- Program Entry Point: Reads from standard input and delegates processing ---
try {
    // Attempt to read the entire content of standard input as a UTF-8 string
    const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Pass the acquired content to our primary processing function
    calculateSmallestPartitionDelta(systemInputContent);
} catch (ioError) {
    // Catch and report any errors encountered during file reading or initial processing
    console.error("An error occurred during input reading or initial setup:", ioError.message);
}