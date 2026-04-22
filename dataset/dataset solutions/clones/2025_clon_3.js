"use strict";

/**
 * Helper function to safely parse a space-separated string of numbers into an array of numeric values.
 * Includes basic validation to ensure robust parsing.
 * @param {string} lineContent - The string containing space-separated numbers.
 * @returns {number[]} An array of parsed numbers. Returns an empty array if parsing fails or input is invalid.
 */
const extractNumericValues = (lineContent) => {
    // Input validation: ensure the content is a string and not empty
    if (typeof lineContent !== 'string' || lineContent.trim() === '') {
        console.error("Error: Invalid or empty string provided for numeric value extraction.");
        return [];
    }

    // Split the string by spaces and convert each part to a number
    // Filter out any non-finite numbers (NaN, Infinity) that might result from conversion errors
    const parsedValues = lineContent.split(" ").map(str => Number(str));
    return parsedValues.filter(val => Number.isFinite(val));
};

/**
 * Orchestrates the calculation of the minimum traversal distance for a circular path.
 * This function processes raw input, validates it, computes segment lengths,
 * and determines the optimal path coverage.
 * @param {string} rawInputPayload - The complete input string, typically from standard input.
 *                                  Expected format:
 *                                  Line 1: K N (total circuit length, number of points)
 *                                  Line 2: A1 A2 ... AN (coordinates of points)
 */
const computeOptimalCircuitTraversal = (rawInputPayload) => {
    // Pre-process the raw input: trim whitespace and split into individual lines
    const processedLines = rawInputPayload.trim().split("\n");

    // Input validation: ensure we have at least two lines of data
    if (processedLines.length < 2) {
        console.error("Input processing failed: Insufficient data lines provided.");
        return console.log(0); // Output a default value or signal an error
    }

    // Parse the first line to get circuit dimensions
    const circuitParameters = extractNumericValues(processedLines[0]);
    if (circuitParameters.length < 2 || circuitParameters.some(isNaN)) {
        console.error("Input processing failed: Malformed circuit parameters (K, N).");
        return console.log(0);
    }

    const totalCircuitBoundary = circuitParameters[0]; // K: Represents the total circumference or length of the circular track
    const totalNumberOfPoints = circuitParameters[1];   // N: The count of distinct points (stations) on the track

    // Parse the second line to get the coordinates of the points
    const pointCoordinates = extractNumericValues(processedLines[1]);

    // Input validation: verify the number of provided coordinates matches the declared count
    if (pointCoordinates.length !== totalNumberOfPoints) {
        console.error(`Input processing failed: Declared point count (${totalNumberOfPoints}) does not match actual point count (${pointCoordinates.length}).`);
        return console.log(0);
    }

    // Early exit if there are no points or only one point, as traversal logic assumes at least two distinct points
    if (totalNumberOfPoints < 2) {
        console.warn("Warning: Fewer than two points provided. Optimal traversal is trivial or not applicable.");
        return console.log(0);
    }

    // Array to store the calculated lengths of all segments between consecutive points
    let travelSegmentLengths = [];

    // Loop through each point to calculate the distance to the next point in the circuit
    for (let currentPointIndex = 0; currentPointIndex < totalNumberOfPoints; ++currentPointIndex) {
        const currentCoord = pointCoordinates[currentPointIndex];
        let nextCoord;
        let segmentDistance;

        // Determine the coordinate of the subsequent point.
        // For the last point, the "next" point is the first point (circular path).
        const nextPointIndex = (currentPointIndex + 1) % totalNumberOfPoints;
        nextCoord = pointCoordinates[nextPointIndex];

        // Calculate the segment length. Special handling for the wrap-around segment.
        if (currentPointIndex === totalNumberOfPoints - 1) {
            // This is the segment from the last point back to the first point
            // Distance = (Total length - Last point's coordinate) + First point's coordinate
            segmentDistance = (totalCircuitBoundary - currentCoord) + nextCoord;
        } else {
            // Standard segment distance between two adjacent points
            segmentDistance = nextCoord - currentCoord;
        }
        
        // Add the calculated segment length to our collection
        travelSegmentLengths.push(segmentDistance);
    }

    // The sum of all segment lengths should ideally equal the total circuit boundary (K).
    // We can compute this sum to confirm or use it directly in the final calculation.
    const totalSegmentsSum = travelSegmentLengths.reduce((acc, len) => acc + len, 0);

    // To cover all points with minimum travel, one must effectively "skip" the longest segment.
    // The total distance covered will be the entire circuit length minus the length of the longest skipped segment.
    const longestSegmentToSkip = Math.max(...travelSegmentLengths);

    // Calculate the final minimum distance required to visit all points
    const finalOptimalDistance = totalSegmentsSum - longestSegmentToSkip;

    // Output the calculated minimum traversal distance
    console.log(finalOptimalDistance);
};

// Main execution block: Handles reading input and invoking the core logic.
// Uses a try-catch block for robust file system operations.
try {
    const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
    computeOptimalCircuitTraversal(fileData);
} catch (ioError) {
    console.error("Error encountered while reading input from /dev/stdin:", ioError.message);
    // In a production environment, you might exit with a non-zero status code here.
    // process.exit(1);
}