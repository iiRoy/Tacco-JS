"use strict";

// This function processes raw input data to determine the count of valid integers
// within a series of overlapping ranges.
function processInputData(rawData) {
    // Split the entire input string into an array of individual lines.
    const linesOfData = rawData.split("\n");

    // Parse the first line which contains N and M.
    // N is the total number of elements (not directly used in calculation here).
    // M is the number of range constraints that follow.
    const firstLineParts = linesOfData[0].split(" ");
    const totalElements = parseInt(firstLineParts[0]); // N
    const numRanges = parseInt(firstLineParts[1]);     // M

    // The second line provides the initial range [min, max].
    const initialRangeParts = linesOfData[1].split(" ");
    let currentRangeParts; // Temporary variable to hold parts of the current constraint line.
    let currentLower;      // Lower bound of the current constraint.
    let currentUpper;      // Upper bound of the current constraint.

    // Initialize the effective minimum and maximum based on the second line.
    let effectiveMin = parseInt(initialRangeParts[0]);
    let effectiveMax = parseInt(initialRangeParts[1]);

    // Iterate through the remaining lines, starting from the third line (index 2),
    // up to the M-th constraint.
    for (let rangeIdx = 2; rangeIdx <= numRanges; rangeIdx++) {
        // Split the current constraint line into its lower and upper bounds.
        currentRangeParts = linesOfData[rangeIdx].split(" ");
        currentLower = parseInt(currentRangeParts[0]);
        currentUpper = parseInt(currentRangeParts[1]);

        // Check for non-overlapping ranges. If the current range does not overlap
        // with the accumulated effective range, then no common integers exist.
        if (effectiveMax < currentLower || currentUpper < effectiveMin) {
            effectiveMin = 0; // Set min to 0
            effectiveMax = -1; // Set max to -1, making the result 0
            break; // No need to check further constraints.
        }

        // If there's an overlap, update the effective minimum.
        // The new effective minimum is the larger of the current effective minimum
        // and the current constraint's lower bound.
        if (effectiveMin < currentLower) {
            effectiveMin = currentLower;
        }

        // If there's an overlap, update the effective maximum.
        // The new effective maximum is the smaller of the current effective maximum
        // and the current constraint's upper bound.
        if (currentUpper < effectiveMax) {
            effectiveMax = currentUpper;
        }
    }

    // Calculate and print the count of integers in the final effective range.
    // If effectiveMax < effectiveMin (e.g., after a non-overlap break), this will be <= 0.
    console.log(effectiveMax - effectiveMin + 1);
}

// Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
