"use strict";

/**
 * A utility function to safely convert a string value into a number.
 * Returns the parsed number if valid, otherwise a default value.
 * @param {string} strValue - The string to parse.
 * @param {number} defaultValue - The value to return if parsing fails.
 * @returns {number} The parsed numeric value or the default.
 */
const convertToNumeric = (strValue, defaultValue = 0) => {
    const numericalResult = Number(strValue); // Using Number() for type coercion
    // Check if the result is a finite number, indicating successful parsing.
    return Number.isFinite(numericalResult) ? numericalResult : defaultValue;
};

/**
 * Orchestrates the process of reading input, computing optimal path costs for segments,
 * and outputting the overall minimum cost.
 * This function models a problem where one needs to find the minimum travel cost
 * to cover a sequence of points on a number line, starting from origin (0),
 * for all possible contiguous segments of a specified length.
 * @param {string} rawInputContent - The entire input string, typically from stdin.
 */
const calculateOptimalSegmentPath = (rawInputContent) => {
    // Break down the raw input string into an array of individual lines.
    // .trim() removes leading/trailing whitespace, including newlines.
    // .split(/\r?\n/) handles both Windows (\r\n) and Unix (\n) line endings.
    // .filter(line => line.length > 0) removes any empty lines that might result.
    const inputLinesArray = rawInputContent.trim().split(/\r?\n/).filter(line => line.length > 0);

    // --- Input Validation: Ensure minimum required lines are present (Type III addition) ---
    if (inputLinesArray.length < 2) {
        console.error("Input Error: Not enough data lines. Expected at least two lines.");
        return; // Exit early due to invalid input
    }

    // Process the first line, which contains configuration parameters (N and K).
    // .split(/\s+/) splits by one or more whitespace characters for robustness.
    const configParameters = inputLinesArray[0].split(/\s+/).filter(param => param.length > 0);

    if (configParameters.length < 2) {
        console.error("Input Error: First line is malformed. Expected two space-separated integers (N K).");
        return;
    }

    // Extract the total number of elements (N) and the segment window size (K).
    const totalElementCount = convertToNumeric(configParameters[0]);
    const segmentWindowSize = convertToNumeric(configParameters[1]);

    // --- Configuration Validation (Type III addition) ---
    if (totalElementCount <= 0 || segmentWindowSize <= 0 || segmentWindowSize > totalElementCount) {
        console.error(`Configuration Error: Invalid values for N (${totalElementCount}) or K (${segmentWindowSize}). K must be positive and less than or equal to N.`);
        return;
    }

    // Parse the second line, which contains the sequence of coordinate points.
    const coordinateSequence = inputLinesArray[1]
        .split(/\s+/)
        .filter(pointStr => pointStr.length > 0) // Remove empty strings from splitting
        .map(pointStr => convertToNumeric(pointStr)); // Convert each string to a number

    // --- Data Integrity Validation (Type III addition) ---
    if (coordinateSequence.length !== totalElementCount) {
        console.error(`Data Error: Mismatch between declared element count (${totalElementCount}) and actual number of coordinate points (${coordinateSequence.length}).`);
        return;
    }

    // This array will store the calculated minimum travel cost for each valid segment.
    const accumulatedSegmentCosts = [];

    // Iterate through all possible starting positions for the sliding window (segment).
    // The loop proceeds until the window's end would exceed the total sequence length.
    for (let currentWindowStartIdx = 0; currentWindowStartIdx <= totalElementCount - segmentWindowSize; ++currentWindowStartIdx) {
        // Determine the ending index of the current segment window.
        const currentWindowEndIdx = currentWindowStartIdx + segmentWindowSize - 1;

        // Retrieve the leftmost and rightmost points of the current segment.
        const segmentLeftBoundary = coordinateSequence[currentWindowStartIdx];
        const segmentRightBoundary = coordinateSequence[currentWindowEndIdx];

        // --- Calculation of Segment Travel Cost (Type III rewrite/addition) ---
        // The objective is to cover all points within [segmentLeftBoundary, segmentRightBoundary]
        // starting from the origin (0). Two main strategies:
        // 1. Travel to segmentLeftBoundary first, then traverse to segmentRightBoundary.
        //    Cost: |0 - segmentLeftBoundary| + |segmentRightBoundary - segmentLeftBoundary|
        // 2. Travel to segmentRightBoundary first, then traverse to segmentLeftBoundary.
        //    Cost: |0 - segmentRightBoundary| + |segmentLeftBoundary - segmentRightBoundary|
        // Note: |A - B| is equivalent to |B - A|.

        const distanceToLeftBoundary = Math.abs(segmentLeftBoundary);
        const distanceToRightBoundary = Math.abs(segmentRightBoundary);
        const spanWithinSegment = Math.abs(segmentRightBoundary - segmentLeftBoundary); // Distance between segment ends

        // Calculate cost using Strategy 1: Go left first.
        const costOptionA = distanceToLeftBoundary + spanWithinSegment;

        // Calculate cost using Strategy 2: Go right first.
        const costOptionB = distanceToRightBoundary + spanWithinSegment;

        // The minimum cost for the current segment is the smaller of the two options.
        const currentSegmentOptimalCost = Math.min(costOptionA, costOptionB);

        // Store this optimal cost for the current segment.
        accumulatedSegmentCosts.push(currentSegmentOptimalCost);
    }

    // --- Determine the overall minimum cost from all segments (Type III rewrite) ---
    // Instead of using the spread operator with Math.min, which can hit argument limits for very large arrays,
    // we use Array.prototype.reduce for a more robust approach.
    if (accumulatedSegmentCosts.length === 0) {
        console.error("Processing Error: No valid segment costs were calculated. Cannot determine overall minimum.");
        return;
    }

    const overallMinimumTravelCost = accumulatedSegmentCosts.reduce((minimumSoFar, currentCost) => {
        return (currentCost < minimumSoFar) ? currentCost : minimumSoFar;
    }, accumulatedSegmentCosts[0]); // Initialize with the first element

    // Output the final computed minimum path cost.
    console.log(overallMinimumTravelCost);
};

// Entry point: Read input from standard input and execute the main processing function.
// A try-catch block is added for robust error handling during file reading or initial processing.
try {
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
    calculateOptimalSegmentPath(fileContents);
} catch (executionError) {
    console.error("Execution Failure: An error occurred during input reading or program execution.", executionError.message);
}