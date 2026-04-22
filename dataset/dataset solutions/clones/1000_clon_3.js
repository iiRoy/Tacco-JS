/*
 * Module: FinancialDataProcessor
 * Description: This module provides utilities for processing sequences of numerical data,
 *              specifically designed to identify the maximum possible gain (difference)
 *              between a 'sell' point and a 'buy' point within a constrained data subset.
 *
 *              The input format expects the first line to indicate an upper bound for
 *              the indices of elements to consider, followed by the actual data points.
 *              For instance, if the first line is '3', the subsequent data at indices
 *              1 and 2 will be processed.
 */

/**
 * Computes the maximum possible gain from a given sequence of numerical values.
 * The function interprets the first element of the input array as an exclusive upper limit
 * for the indices of the actual data points to be processed, starting from index 1.
 *
 * @param {Array<string>} valueSequence - An array of strings, where the first element
 *                                        is the processing limit, and subsequent elements
 *                                        are the data points.
 * @returns {number} The highest difference found between a current value and the
 *                   lowest value encountered prior to it within the processed segment,
 *                   or 0 if no valid calculation can be made.
 */
const computeMaximumPossibleGain = (valueSequence) => {
    // --- Input Validation and Pre-processing (Type III additions) ---

    // Guard clause: Check if the input is a valid array and not empty.
    if (!Array.isArray(valueSequence) || valueSequence.length === 0) {
        console.error("Error: The provided value sequence is empty or invalid. Returning 0.");
        return 0;
    }

    // Parse the first element, which specifies the exclusive upper bound for data point indices.
    const processingIndexLimit = parseInt(valueSequence[0], 10);

    // Validate the parsed limit: must be a number and at least 1.
    // A limit of 1 means the loop (index=1; index < 1) won't run, resulting in 0 gain.
    if (isNaN(processingIndexLimit) || processingIndexLimit < 1) {
        console.error("Error: Invalid or insufficient processing limit specified by the first input element. Returning 0.");
        return 0;
    }

    // Ensure there are enough elements in the array to satisfy the specified limit.
    // For example, if limit is 3, we need elements at indices 0, 1, 2. So, length must be at least 3.
    if (valueSequence.length < processingIndexLimit) {
        console.error(`Error: Insufficient data points provided. Expected at least ${processingIndexLimit} elements based on the limit, but got ${valueSequence.length}. Returning 0.`);
        return 0;
    }

    // --- Core Algorithm Logic (Type II & III modifications) ---

    // Initialize variables:
    // `peakObservedDifference`: Tracks the highest profit (sell - buy) found. Initialized to negative infinity
    //                         to ensure any valid profit, even negative, is captured.
    // `lowestValueEncountered`: Keeps track of the minimum value seen so far during iteration.
    //                           Initialized to positive infinity to ensure the first valid data point becomes the initial minimum.
    let peakObservedDifference = -Infinity;
    let lowestValueEncountered = Infinity;

    // Iterate through the data points relevant to the calculation.
    // The loop starts from index 1 and goes up to (but not including) `processingIndexLimit`.
    // This faithfully reproduces the behavior of the original `j < arr[0]` loop.
    for (let currentIterationIndex = 1; currentIterationIndex < processingIndexLimit; currentIterationIndex++) {
        const rawValueString = valueSequence[currentIterationIndex];
        const numericValue = parseFloat(rawValueString);

        // Type III: Add validation for individual data points.
        if (isNaN(numericValue)) {
            console.warn(`Warning: Skipping non-numeric data point at index ${currentIterationIndex}: '${rawValueString}'.`);
            continue; // Skip to the next data point if the current one is invalid.
        }

        // Calculate the potential profit if we 'sell' at the current price and 'bought' at the lowest point seen so far.
        const currentPotentialGain = numericValue - lowestValueEncountered;

        // Update the overall maximum profit if the current potential gain is higher.
        peakObservedDifference = Math.max(peakObservedDifference, currentPotentialGain);

        // Update the lowest value encountered so far.
        lowestValueEncountered = Math.min(lowestValueEncountered, numericValue);
    }

    // --- Post-processing and Return (Type III modification) ---

    // If `peakObservedDifference` is still negative infinity, it implies no valid profit calculation was possible.
    // This could be due to invalid input, or the loop not running (e.g., `processingIndexLimit` was 1 or less).
    // In such scenarios, returning 0 is a sensible default, indicating no gain.
    if (peakObservedDifference === -Infinity) {
        return 0;
    }

    // Return the final maximum gain computed.
    return peakObservedDifference;
};

/*
 * --- Standard Input/Output Handling Subsystem ---
 * This section manages the asynchronous reading of data from standard input (stdin)
 * and writing the final computed result to standard output (stdout).
 */

// Keep the Node.js process running even if there's no immediate work,
// allowing it to wait for input from `stdin`.
process.stdin.resume();

// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding("utf8");

// A buffer to accumulate all incoming data chunks from stdin.
let aggregatedInputContent = "";

// Event listener for the 'data' event, fired whenever data is available from stdin.
process.stdin.on("data", (receivedDataChunk) => {
    aggregatedInputContent += receivedDataChunk; // Append each new data chunk to the buffer.
});

// Event listener for the 'end' event, fired when the standard input stream has closed.
process.stdin.on("end", () => {
    // --- Input Parsing and Filtering (Type II & III modifications) ---

    // 1. Split the accumulated content into individual lines.
    // 2. Trim whitespace from the beginning and end of each line.
    // 3. Filter out any lines that become empty after trimming.
    const cleanedAndFilteredLines = aggregatedInputContent
        .split("\n")
        .map(individualLine => individualLine.trim())
        .filter(processedLine => processedLine.length > 0); // Only keep non-empty lines.

    // Type III: Add a check for completely empty or invalid input after filtering.
    if (cleanedAndFilteredLines.length === 0) {
        console.error("No valid input data found after filtering empty lines. Outputting default result.");
        console.log(0); // Consistent with function's error handling.
        return;
    }

    // --- Execution and Output ---

    // Call the main calculation function with the prepared input data.
    const finalComputedOutput = computeMaximumPossibleGain(cleanedAndFilteredLines);

    // Print the final result to standard output.
    console.log(finalComputedOutput);
});