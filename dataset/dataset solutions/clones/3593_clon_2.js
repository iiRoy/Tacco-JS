'use strict';

/*
 * This function determines the central value of a numerical sequence.
 * It first sorts the sequence and then picks the element at the middle index.
 */
const calculateMidpoint = (inputArray) => {
    // The provided array will be sorted in ascending order.
    return inputArray.sort((x, y) => x - y)[Math.floor(inputArray.length / 2)];
};

/**
 * The primary execution function that processes raw input data.
 * It extracts numbers, calculates medians of all possible subarrays,
 * and then finds the median of those medians.
 * @param {string} rawData - The input string containing numbers.
 */
const processInputData = (rawData) => {
    const dataRows = rawData.split('\n');
    const firstLineParts = dataRows[0].split(' ');
    const elementCount = parseInt(firstLineParts[0], 10);
    const numericValues = dataRows[1].split(' ').map(valStr => parseInt(valStr, 10));

    const allSubarrayMedians = []; // Collection to store medians of all subarrays.

    // Iterate through all possible right boundaries of subarrays.
    for (let rightIndex = 0; rightIndex < elementCount; rightIndex++) {
        // Iterate through all possible left boundaries for the current right boundary.
        for (let leftIndex = 0; leftIndex <= rightIndex; leftIndex++) {
            // Extract the current subarray.
            const currentSubarray = numericValues.slice(leftIndex, rightIndex + 1);
            // Calculate the median of the current subarray.
            const subarrayMidpoint = calculateMidpoint(currentSubarray);
            // Add the calculated median to our collection.
            allSubarrayMedians.push(subarrayMidpoint);
        }
    }
    // Output the median of all collected subarray medians.
    console.log(calculateMidpoint(allSubarrayMedians));
};

// A flag to control execution mode: test cases or standard input.
const isDevelopmentMode = false;

if (isDevelopmentMode) {
    // Execute with predefined test cases for verification.
    processInputData('3\n10 30 20');
    processInputData('1\n10');
    processInputData('10\n5 9 5 9 8 9 3 5 4 3');
} else {
    // Read input from standard input in production mode.
    processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
