'use strict';

// Utility function to safely parse an integer from a string.
// Returns NaN if parsing fails, allowing for explicit checks.
const convertToNumber = (textValue) => {
    // Remove leading/trailing whitespace and attempt conversion.
    const numericForm = parseInt(textValue.trim(), 10);
    return numericForm;
};

// Helper function to compute the absolute difference between two numerical points.
const calculateMagnitudeDifference = (pointOne, pointTwo) => Math.abs(pointOne - pointTwo);

// Main function to compute the minimum traversal distance.
const computeOptimalPath = (rawInputContent) => {
    // Break down the entire input content into individual lines.
    const contentLines = rawInputContent.split('\n');

    // Early exit for malformed input (e.g., less than two lines expected).
    if (contentLines.length < 2) {
        return Number.MAX_SAFE_INTEGER; // Indicate an impossible path.
    }

    // Process the first line to extract problem parameters.
    const parameterStrings = contentLines[0].split(' ');
    const totalItemCountSpecified = convertToNumber(parameterStrings[0]);
    const targetSubsetLength = convertToNumber(parameterStrings[1]);

    // Validate the parsed numerical parameters.
    if (isNaN(totalItemCountSpecified) || isNaN(targetSubsetLength) || totalItemCountSpecified < 0 || targetSubsetLength < 0) {
        return Number.MAX_SAFE_INTEGER; // Invalid problem constraints.
    }

    // Parse the second line to get the array of coordinate values.
    // Filter out any non-numeric results from parsing to ensure data integrity.
    const allCoordinates = contentLines[1].split(' ').map(coordStr => convertToNumber(coordStr)).filter(val => !isNaN(val));

    // Handle edge case where no points are available, or target length is zero.
    if (targetSubsetLength === 0) {
        return 0; // No traversal needed if zero points are to be visited.
    }
    if (allCoordinates.length === 0) {
        return Number.MAX_SAFE_INTEGER; // Cannot visit any points if none are provided.
    }
    if (targetSubsetLength > allCoordinates.length) {
        return Number.MAX_SAFE_INTEGER; // Cannot form a subset larger than the available points.
    }

    // Initialize the variable to store the shortest found path.
    // Start with the largest possible safe integer to ensure any valid path will be smaller.
    let minimumPathFound = Number.MAX_SAFE_INTEGER;

    // Determine the furthest possible starting index for a valid segment of 'targetSubsetLength'.
    const lastPossibleStartIndex = allCoordinates.length - targetSubsetLength;

    // Iterate through all possible contiguous segments of points.
    for (let currentSegmentStart = 0; currentSegmentStart <= lastPossibleStartIndex; ++currentSegmentStart) {
        // Extract the current segment of points for evaluation.
        const activePointsSegment = allCoordinates.slice(currentSegmentStart, currentSegmentStart + targetSubsetLength);

        // Identify the boundary points of the current segment.
        const segmentFirstCoordinate = activePointsSegment[0];
        const segmentLastCoordinate = activePointsSegment[activePointsSegment.length - 1];

        // Calculate the span (distance between the two ends) of this segment.
        const segmentEndToEndSpan = calculateMagnitudeDifference(segmentFirstCoordinate, segmentLastCoordinate);

        // Calculate the total path distance if starting from the segment's left end.
        // Path: Origin (0) -> segmentFirstCoordinate -> segmentLastCoordinate
        const pathStartingLeft = Math.abs(segmentFirstCoordinate) + segmentEndToEndSpan;

        // Calculate the total path distance if starting from the segment's right end.
        // Path: Origin (0) -> segmentLastCoordinate -> segmentFirstCoordinate
        const pathStartingRight = Math.abs(segmentLastCoordinate) + segmentEndToEndSpan;

        // Update the overall minimum path if a shorter one is found.
        minimumPathFound = Math.min(minimumPathFound, pathStartingLeft, pathStartingRight);
    }

    return minimumPathFound;
};

// Entry point for execution: Reads input and prints the result.
try {
    // Read the entire file content from standard input in UTF-8 format.
    const inputContentFromFile = require('fs').readFileSync('/dev/stdin', 'utf-8');
    const finalCalculatedResult = computeOptimalPath(inputContentFromFile);

    // Output the computed result.
    // If an error state (MAX_SAFE_INTEGER) was returned, this will still print it,
    // which is acceptable for a "raw code" output for competitive programming.
    console.log(finalCalculatedResult);
} catch (executionError) {
    // In case of file reading errors or other unexpected issues.
    // For competitive programming, this might just crash or print an error.
    // For a robust application, more specific error handling would be here.
    console.log(Number.MAX_SAFE_INTEGER); // Indicate a failure to calculate.
}