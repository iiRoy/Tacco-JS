"use strict";

/**
 * Utility function to safely convert a string representation to an integer.
 * It uses base 10 for parsing.
 * @param {string} numericString - The string expected to contain a number.
 * @returns {number} The parsed integer. Returns NaN if the string cannot be parsed.
 */
const parseNumericValue = (numericString) => {
    return parseInt(numericString, 10);
};

/**
 * Breaks down a given text line into an array of string components,
 * using space as the delimiter.
 * @param {string} lineContent - The string content of a single line.
 * @returns {string[]} An array of strings, representing the parts of the line.
 */
const tokenizeLineContent = (lineContent) => {
    return lineContent.split(" ");
};

/**
 * Main execution flow to determine the length of the common intersection
 * across a series of specified numerical intervals.
 * @param {string} fullInputText - The complete input data received as a single text block.
 */
function executeIntervalIntersectionAnalysis(fullInputText) {
    // Divide the entire input text into an array where each element is a line.
    const inputLineSegments = fullInputText.split("\n");

    // A crucial check to ensure the input data has the minimum required structure.
    // We need at least two lines: one for global parameters and one for the first interval.
    if (inputLineSegments.length < 2) {
        console.error("Error: Input data is incomplete. Expected at least two lines.");
        return; // Terminate if input is malformed
    }

    // Extracting global parameters from the very first line of input.
    const globalParameterTokens = tokenizeLineContent(inputLineSegments[0]);
    // The first parameter (N in original context) is not utilized in this specific algorithm,
    // as it relates to a separate problem dimension or constraint not relevant here.
    // The original code parsed this value but never used it; it is omitted here as a deletion.

    // The second parameter (M) dictates how many intervals, including the first, are to be processed.
    const numberOfIntervalsToProcess = parseNumericValue(globalParameterTokens[1]);

    // Validation for the number of intervals. It must be a positive integer.
    if (isNaN(numberOfIntervalsToProcess) || numberOfIntervalsToProcess < 1) {
        console.error("Error: Invalid or missing count for total intervals to process.");
        return;
    }

    // Initialize the current state of the intersection using the values from the second input line.
    // This represents the very first interval in our sequence.
    const initialIntervalTokens = tokenizeLineContent(inputLineSegments[1]);
    let currentIntersectionLowerBoundary = parseNumericValue(initialIntervalTokens[0]);
    let currentIntersectionUpperBoundary = parseNumericValue(initialIntervalTokens[1]);

    // A flag to keep track if at any point the intersection of intervals becomes empty.
    // If true, subsequent processing for length can be skipped, and result is 0.
    let isOverallIntersectionEmpty = false;

    // Loop through the remaining intervals, starting from the third line (index 2)
    // up to the total number of intervals specified by 'M'.
    // This loop processes 'M-1' intervals after the initial one.
    for (let currentProcessingIndex = 2; currentProcessingIndex <= numberOfIntervalsToProcess; currentProcessingIndex++) {
        // Defensive check: ensure there is a line for the current interval being processed.
        if (currentProcessingIndex >= inputLineSegments.length) {
            console.error(`Error: Missing interval definition for line ${currentProcessingIndex + 1}. Aborting.`);
            isOverallIntersectionEmpty = true;
            break; // Cannot proceed without required data
        }

        const currentIntervalComponents = tokenizeLineContent(inputLineSegments[currentProcessingIndex]);
        const incomingIntervalStart = parseNumericValue(currentIntervalComponents[0]);
        const incomingIntervalEnd = parseNumericValue(currentIntervalComponents[1]);

        // Further validation for the parsed interval boundaries.
        if (isNaN(incomingIntervalStart) || isNaN(incomingIntervalEnd)) {
            console.error(`Error: Malformed interval values detected on line ${currentProcessingIndex + 1}.`);
            isOverallIntersectionEmpty = true;
            break;
        }

        // Logic to determine if the incoming interval completely disjoints the current intersection.
        // If the current intersection ends before the new interval starts, OR
        // if the new interval ends before the current intersection starts,
        // then there is no overlap, and the overall intersection is empty.
        if (currentIntersectionUpperBoundary < incomingIntervalStart || incomingIntervalEnd < currentIntersectionLowerBoundary) {
            isOverallIntersectionEmpty = true;
            break; // No further intervals can create an overlap
        }

        // If an overlap exists, update the boundaries of the common intersection.
        // The new lower bound is the maximum of the current lower bound and the incoming interval's start.
        currentIntersectionLowerBoundary = Math.max(currentIntersectionLowerBoundary, incomingIntervalStart);
        // The new upper bound is the minimum of the current upper bound and the incoming interval's end.
        currentIntersectionUpperBoundary = Math.min(currentIntersectionUpperBoundary, incomingIntervalEnd);
    }

    let calculatedIntersectionLength;

    // Final calculation of the intersection's length.
    if (isOverallIntersectionEmpty) {
        calculatedIntersectionLength = 0; // If any point was disjoint, the total length is zero.
    } else {
        // For a valid, non-empty inclusive interval [a, b], the number of integers is b - a + 1.
        calculatedIntersectionLength = currentIntersectionUpperBoundary - currentIntersectionLowerBoundary + 1;
        // As a safeguard, ensure the length is not negative, which could theoretically happen
        // if boundaries were somehow inconsistent (e.g., upper < lower after updates, though Math.min/max should prevent this).
        if (calculatedIntersectionLength < 0) {
            calculatedIntersectionLength = 0;
        }
    }

    // Present the final computed length to the user.
    console.log(calculatedIntersectionLength);
}

// Entry point: Read the input from standard input and pass it to the analysis function.
executeIntervalIntersectionAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));