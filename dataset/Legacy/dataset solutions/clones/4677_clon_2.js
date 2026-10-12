'use strict'; // Enforce strict parsing and error handling in the script.

/**
 * Analyzes a string of numerical data to determine the gap between two intervals.
 * @param {string} rawInputData The raw input string, expected to contain three space-separated integers.
 */
const processInputData = (rawInputData) => {
    // Convert the input string into an array of integer values.
    // The input is expected to be in the format "W a b".
    const numericalComponents = rawInputData.split(' ').map(singleValue => parseInt(singleValue, 10));

    // Extract the individual components from the parsed array.
    const intervalWidth = numericalComponents[0]; // Corresponds to 'W' in the original problem.
    const startPointA = numericalComponents[1];   // Corresponds to 'a'.
    const startPointB = numericalComponents[2];   // Corresponds to 'b'.

    // Calculate the end points of the two intervals.
    // Interval 1: [startPointA, endPointA]
    // Interval 2: [startPointB, endPointB]
    const endPointA = startPointA + intervalWidth;
    const endPointB = startPointB + intervalWidth;

    // An array to store the sorted boundary points of the two intervals.
    // This helps in simplifying the logic for gap calculation.
    let orderedBoundaries = [];

    // Arrange the interval boundaries such that the first interval always starts
    // at or before the second interval.
    if (startPointA <= startPointB) {
        // If interval A begins first or simultaneously with B.
        orderedBoundaries = [startPointA, endPointA, startPointB, endPointB];
    } else {
        // If interval B begins before interval A.
        orderedBoundaries = [startPointB, endPointB, startPointA, endPointA];
    }

    // Check if there is a non-overlapping gap between the two intervals.
    // The intervals are now effectively [orderedBoundaries[0], orderedBoundaries[1]]
    // and [orderedBoundaries[2], orderedBoundaries[3]], with orderedBoundaries[0] <= orderedBoundaries[2].
    if (orderedBoundaries[1] < orderedBoundaries[2]) {
        // If the end of the first interval is before the start of the second,
        // calculate and output the length of the gap.
        console.log(orderedBoundaries[2] - orderedBoundaries[1]);
    } else {
        // If the intervals overlap or touch, there is no gap, so output 0.
        console.log(0);
    }
};

// Read the input from standard input and initiate the processing.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
