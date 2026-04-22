'use strict';

/**
 * Parses raw textual input to extract problem parameters and a sorted list of numbers.
 * Assumes the first line contains 'N K' (where K is the desired subset length),
 * and subsequent lines contain the numbers to be processed.
 *
 * @param {string} rawInputText - The complete raw input string, typically from stdin.
 * @returns {object} An object containing the target subset length and the sorted numeric elements.
 * @throws {Error} If the input format is invalid or essential data is missing.
 */
const extractAndPrepareNumericData = (rawInputText) => {
    // Split the entire input string into an array of individual lines.
    const allInputLines = rawInputText.split('\n');

    // Perform initial validation: ensure there's at least one line for parameters.
    if (allInputLines.length === 0 || allInputLines[0].trim() === '') {
        throw new Error("Input string is empty or contains no valid data lines.");
    }

    // Process the first line to obtain the problem's 'K' parameter.
    const initialParameterLine = allInputLines[0].trim();
    const parameterTokens = initialParameterLine.split(/\s+/); // Split by any whitespace sequence.

    // Validate the parameter line format.
    if (parameterTokens.length < 2 || isNaN(Number(parameterTokens[1]))) {
        throw new Error(`Invalid format for parameter line: '${initialParameterLine}'. Expected 'N K'.`);
    }

    // Convert the extracted 'K' token to a number.
    const desiredSubsetLength = Number(parameterTokens[1]);

    // Extract the remaining lines, filter out empty ones, convert to numbers, and sort them.
    const sortedNumericalElements = allInputLines.slice(1) // Discard the parameter line.
                                                .filter(line => line.trim() !== '') // Remove any blank lines.
                                                .map(strValue => Number(strValue.trim())) // Convert each string to a number.
                                                .sort((valA, valB) => valA - valB); // Sort numerically in ascending order.

    return {
        targetSubsetSize: desiredSubsetLength,
        processedNumbers: sortedNumericalElements
    };
};

/**
 * Computes the minimum difference between the largest and smallest elements
 * within any contiguous sub-array of a specified size from a sorted array.
 *
 * @param {object} preparedData - An object containing `targetSubsetSize` and `processedNumbers`.
 * @returns {number} The smallest observed difference, or 0 if conditions lead to it.
 * @throws {Error} If input data is invalid for the calculation.
 */
const calculateMinimumSpan = (preparedData) => {
    const { targetSubsetSize: subsetLength, processedNumbers: sortedElements } = preparedData;

    // Validate the array of numbers.
    if (!Array.isArray(sortedElements) || sortedElements.length === 0) {
        throw new Error("Cannot calculate span: no numeric elements provided.");
    }

    // Validate the subset length.
    if (subsetLength <= 0) {
        // A non-positive subset length is ambiguous. For consistency, a length of 0 or less
        // could imply an empty set (0 difference) or an invalid request.
        // Here, we'll treat it as yielding 0 difference, effectively.
        return 0;
    }

    // If the requested subset length is 1, the difference between max and min is always 0.
    if (subsetLength === 1) {
        return 0;
    }

    // If the subset length exceeds the total number of elements, we cannot form such a subset.
    // In typical competitive programming, this scenario might imply an error or that the
    // entire array should be considered (if K > N, the "best" K-sized subset is effectively the whole array).
    // Let's assume for this problem, it means we can't satisfy the condition, or perhaps
    // the max possible difference if we had to pick all available items.
    if (subsetLength > sortedElements.length) {
        // This scenario might warrant an error or returning the full range.
        // For robustness, let's return the span of the entire array if K > N.
        return sortedElements[sortedElements.length - 1] - sortedElements[0];
    }

    // Initialize the variable to store the smallest difference found.
    // Use Infinity to ensure any valid difference will be smaller.
    let minimumObservedRange = Infinity;

    // Determine the last possible starting index for a window of `subsetLength`.
    const lastValidStartingIndex = sortedElements.length - subsetLength;

    // Iterate through the sorted array using a sliding window approach.
    // Each iteration represents a new window of `subsetLength` elements.
    for (let currentWindowStart = 0; currentWindowStart <= lastValidStartingIndex; ++currentWindowStart) {
        // Calculate the ending index for the current window.
        const currentWindowEnd = currentWindowStart + subsetLength - 1;

        // Since the array is sorted, the element at `currentWindowStart` is the minimum
        // and the element at `currentWindowEnd` is the maximum within this window.
        const minimumInWindow = sortedElements[currentWindowStart];
        const maximumInWindow = sortedElements[currentWindowEnd];

        // Calculate the range (difference between maximum and minimum) for the current window.
        const currentWindowRange = maximumInWindow - minimumInWindow;

        // Update `minimumObservedRange` if the current window's range is smaller.
        minimumObservedRange = Math.min(minimumObservedRange, currentWindowRange);
    }

    // Return the smallest difference found across all valid windows.
    return minimumObservedRange;
};

// Main execution block:
try {
    // Read all input from standard input, assuming UTF-8 encoding.
    const fullRawInput = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Parse and prepare the data using the helper function.
    const structuredInputData = extractAndPrepareNumericData(fullRawInput);

    // Compute the final result using the prepared data.
    const finalCalculatedResult = calculateMinimumSpan(structuredInputData);

    // Output the final result to the console.
    console.log(finalCalculatedResult);

} catch (executionError) {
    // If any error occurs during input processing or calculation, log it and exit.
    console.error("An operational error occurred:", executionError.message);
    process.exit(1); // Indicate an abnormal termination.
}