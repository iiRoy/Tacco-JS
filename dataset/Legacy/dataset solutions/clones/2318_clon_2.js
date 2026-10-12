"use strict";

/*
 * This module processes input data to determine a specific output value.
 * It expects two numeric lines as input.
 */
const ProcessData = (rawText) => {
    // Split the raw input string into individual lines and clean up whitespace.
    let lineSegments = rawText.trim().split('\n');

    /**
     * Defines a comparison function for numerical sorting.
     * @param {number} firstVal - The first value for comparison.
     * @param {number} secondVal - The second value for comparison.
     * @returns {number} A negative, zero, or positive value indicating the sort order.
     */
    const valueComparator = (firstVal, secondVal) => {
        return firstVal - secondVal;
    };

    // Sort the extracted line segments numerically.
    lineSegments.sort(valueComparator);

    // Evaluate the sorted segments to produce the final output.
    if (lineSegments[0] == 1 && lineSegments[1] == 2) {
        console.log(3); // Output for specific combination 1, 2
    } else if (lineSegments[0] == 2 && lineSegments[1] == 3) {
        console.log(1); // Output for specific combination 2, 3
    } else {
        console.log(2); // Default output for other combinations
    }
};

// Read input from standard input and pass it to the processing function.
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));
