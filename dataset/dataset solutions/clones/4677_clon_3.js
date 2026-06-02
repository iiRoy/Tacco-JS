'use strict'

// Helper function to parse a space-separated string of numbers into an array of integers.
const parseNumericStringArray = (inputString) => {
    const stringParts = inputString.split(' ');
    const parsedNumbers = stringParts.map(strVal => parseInt(strVal, 10));
    return parsedNumbers;
};

// Helper function to compute the non-overlapping distance between two intervals of equal width.
// The intervals are defined by their starting positions and a common width.
const computeIntervalGap = (intervalWidth, firstPosition, secondPosition) => {
    // Determine the start of the interval that begins earlier.
    const earlierStart = Math.min(firstPosition, secondPosition);
    // Determine the start of the interval that begins later.
    const laterStart = Math.max(firstPosition, secondPosition);

    // Calculate the end point of the earlier interval.
    // This corresponds to arr[1] in the original logic if intervals were sorted.
    const earlierIntervalEnd = earlierStart + intervalWidth;

    // The potential gap is the distance from the end of the earlier interval
    // to the start of the later interval. This corresponds to arr[2] - arr[1].
    const potentialGap = laterStart - earlierIntervalEnd;

    // If potentialGap is negative or zero, the intervals overlap or touch,
    // meaning the actual gap is 0. Otherwise, it's the positive distance.
    return Math.max(0, potentialGap);
};

const main = (rawInputData) => {
    const numericParameters = parseNumericStringArray(rawInputData);

    // Extract the width and the two starting positions from the parsed numbers.
    const widthDimension = numericParameters[0];
    const startPointA = numericParameters[1];
    const startPointB = numericParameters[2];

    // Calculate the distance using the helper function.
    const finalDistance = computeIntervalGap(widthDimension, startPointA, startPointB);

    // Output the result to the console.
    console.log(finalDistance);
};

// Read input from stdin and pass it to the main function.
main(require('fs').readFileSync('/dev/stdin', 'utf-8'));
