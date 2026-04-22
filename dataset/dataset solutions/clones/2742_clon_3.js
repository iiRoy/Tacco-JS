/*
 * This JavaScript module is designed to process a sequence of integers
 * and compute the minimum number of strictly increasing subsequences
 * into which the entire sequence can be partitioned. This is a classic
 * problem related to Dilworth's Theorem, where the minimum number of
 * increasing subsequences is equal to the length of the longest decreasing subsequence.
 *
 * The implementation uses a greedy approach to maintain a collection of
 * "active" increasing subsequences by storing their last elements.
 * When a new number is processed, it attempts to extend an existing
 * subsequence. If multiple subsequences can be extended, it picks the
 * one whose last element is largest but still smaller than the current number,
 * to keep the "tails" as small as possible, maximizing future extension opportunities.
 * If no existing subsequence can be extended, a new one is started.
 *
 * This file includes robust input parsing and error handling to ensure
 * reliable operation with various input formats.
 */

/**
 * Parses a raw string input, extracting the total count of elements
 * and the numerical sequence itself. It expects the first line to be
 * the count (N) and subsequent N lines to be the individual numeric elements.
 *
 * @param {string} textPayload - The complete raw string content read from an input source.
 * @returns {{totalElementsCount: number, numericalDataSeries: number[]}} An object containing
 *          the validated total count and the array of parsed numbers.
 * @throws {Error} If the input format is invalid, missing, or contains non-numeric data.
 */
function decodeAndValidateInput(textPayload) {
    // Preliminary check for valid input type and content.
    if (typeof textPayload !== 'string' || textPayload.trim().length === 0) {
        throw new Error("Input payload must be a non-empty string for processing.");
    }

    const contentLines = textPayload.split("\n");

    // Validate the presence of the count line.
    if (contentLines.length === 0 || contentLines[0].trim().length === 0) {
        throw new Error("Missing or empty first line in input; expected total element count.");
    }

    const declaredCountString = contentLines[0].trim();
    const parsedTotalCount = parseInt(declaredCountString, 10);

    // Ensure the declared count is a valid non-negative integer.
    if (isNaN(parsedTotalCount) || parsedTotalCount < 0) {
        throw new Error(`Invalid total element count specified: '${declaredCountString}'. It must be a non-negative integer.`);
    }

    const extractedNumericSeries = [];
    // Iterate from the second line (index 1) to parse the actual data elements.
    // The loop runs `parsedTotalCount` times, corresponding to the expected elements.
    for (let elementLineIndex = 1; elementLineIndex <= parsedTotalCount; elementLineIndex++) {
        // Check if there are enough lines for the declared count.
        if (elementLineIndex >= contentLines.length) {
            throw new Error(`Insufficient data lines. Declared count is ${parsedTotalCount}, but only ${elementLineIndex - 1} elements were found.`);
        }

        const currentElementText = contentLines[elementLineIndex].trim();
        const currentElementValue = parseInt(currentElementText, 10);

        // Validate each individual element is a number.
        if (isNaN(currentElementValue)) {
            throw new Error(`Invalid numeric element encountered at line ${elementLineIndex + 1}: '${currentElementText}'.`);
        }
        extractedNumericSeries.push(currentElementValue);
    }

    // Final consistency check: actual parsed elements versus declared count.
    if (extractedNumericSeries.length !== parsedTotalCount) {
        throw new Error(`Data series length mismatch: Declared ${parsedTotalCount} elements, but parsed ${extractedNumericSeries.length}.`);
    }

    return {
        totalElementsCount: parsedTotalCount,
        numericalDataSeries: extractedNumericSeries
    };
}

/**
 * Determines the minimum number of strictly increasing subsequences
 * required to cover all elements in the provided numeric array.
 * This function implements the core greedy algorithm.
 *
 * @param {number[]} inputSequence - An array of integers to analyze.
 * @returns {number} The calculated minimum count of increasing subsequences.
 * @throws {Error} If the input is not a valid array or contains non-numeric values.
 */
function calculateMinIncreasingSubsequencePartitions(inputSequence) {
    // Validate the input array.
    if (!Array.isArray(inputSequence)) {
        throw new Error("Input for subsequence partitioning must be an array.");
    }
    if (inputSequence.length === 0) {
        // An empty sequence requires no subsequences.
        return 0;
    }

    // This array stores the last element of each active increasing subsequence.
    // Each index `idx` in `activeSubsequenceEndingValues` implicitly represents
    // an increasing subsequence, and `activeSubsequenceEndingValues[idx]` is its tail.
    // The goal is to keep these tail values as small as possible.
    const activeSubsequenceEndingValues = [];

    // Process each number from the input sequence.
    for (const currentNumericValue of inputSequence) {
        // Runtime validation for individual elements, ensuring they are numbers.
        if (typeof currentNumericValue !== 'number' || isNaN(currentNumericValue)) {
            throw new Error(`Non-numeric value detected in the sequence: ${currentNumericValue}.`);
        }

        let chosenSubsequenceIndex = -1; // Sentinel value indicating no suitable subsequence found.
        let largestPossibleTail = -Infinity; // Tracks the largest ending value that is still less than currentNumericValue.

        // Iterate through all currently active subsequences to find the best one to extend.
        // We look for a subsequence whose last element (`activeSubsequenceEndingValues[k]`)
        // is strictly less than `currentNumericValue`. Among all such candidates,
        // we prefer the one with the largest `activeSubsequenceEndingValues[k]`.
        // This greedy choice aims to "fill" the gaps efficiently.
        for (let k = 0; k < activeSubsequenceEndingValues.length; k++) {
            const tailOfCurrentSubsequence = activeSubsequenceEndingValues[k];

            if (tailOfCurrentSubsequence < currentNumericValue) {
                // This subsequence `k` can be extended by `currentNumericValue`.
                // Check if this is the best candidate so far (i.e., has the largest tail).
                if (tailOfCurrentSubsequence > largestPossibleTail) {
                    largestPossibleTail = tailOfCurrentSubsequence;
                    chosenSubsequenceIndex = k;
                }
            }
        }

        if (chosenSubsequenceIndex === -1) {
            // If no existing subsequence could be extended, it means `currentNumericValue`
            // is smaller than or equal to all current subsequence tails.
            // Therefore, `currentNumericValue` must start a brand new increasing subsequence.
            activeSubsequenceEndingValues.push(currentNumericValue);
        } else {
            // An existing subsequence (identified by `chosenSubsequenceIndex`) was found
            // that can be extended. Update its last element to `currentNumericValue`.
            // This effectively extends that subsequence.
            activeSubsequenceEndingValues[chosenSubsequenceIndex] = currentNumericValue;
        }
    }

    // The total number of unique subsequences started (and still active or modified)
    // is the final length of the `activeSubsequenceEndingValues` array.
    return activeSubsequenceEndingValues.length;
}

/**
 * Orchestrates the full application workflow:
 * Reads raw input, parses it, executes the core logic, and prints the final result.
 * Includes comprehensive error handling for robust execution.
 *
 * @param {string} rawInputSourceText - The raw string content received from the input stream.
 */
function manageApplicationFlow(rawInputSourceText) {
    try {
        // Step 1: Parse and validate the input data.
        const { totalElementsCount, numericalDataSeries } = decodeAndValidateInput(rawInputSourceText);

        // Additional check for edge case: declared count > 0 but data series is empty.
        // (Though decodeAndValidateInput should prevent this, it's a defensive check).
        if (totalElementsCount > 0 && numericalDataSeries.length === 0) {
            console.warn("Warning: Declared element count was positive, but no actual data elements were successfully parsed.");
            console.log(0); // If no elements are present, zero subsequences are needed.
            return;
        }

        // Step 2: Execute the primary algorithm to find the minimum number of subsequences.
        const resultantPartitionCount = calculateMinIncreasingSubsequencePartitions(numericalDataSeries);

        // Step 3: Output the computed result to standard output.
        console.log(resultantPartitionCount);

    } catch (operationError) {
        // Centralized error reporting for any issues encountered during the process.
        console.error("An unrecoverable error occurred during execution:");
        console.error(operationError.message);
        // In a production environment, one might exit with a non-zero status code here.
        // process.exit(1);
    }
}

// Main execution block: Reads input from standard input and initiates the processing.
// This part is environment-specific, typically for Node.js.
try {
    const fileSystemHandler = require("fs");
    const standardInputContent = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
    manageApplicationFlow(standardInputContent);
} catch (ioSystemError) {
    // Handle errors specifically related to file system operations or reading stdin.
    console.error("Failed to read input from '/dev/stdin':");
    console.error(ioSystemError.message);
    // process.exit(1);
}