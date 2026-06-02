'use strict';

// This function processes an array of input strings to calculate a specific sum.
function processInput(rawData) {
    // The first element of the input array contains the count of numbers.
    const arraySize = parseInt(rawData[0], 10); // Parse the string to an integer, explicitly using base 10.

    // The second element contains space-separated numbers, which are converted to an array of numbers.
    const originalNumbers = rawData[1].split(' ').map(Number);

    // Initialize an empty array to store the modified values.
    let transformedValues = [];

    // Iterate through the original numbers to apply a transformation.
    for (let idx = 0; idx < arraySize; idx++) {
        // For each number, subtract its index and add one (represented as a binary literal).
        transformedValues.push(originalNumbers[idx] - idx + 0b1);
    }

    // Sort the array of transformed values numerically in ascending order.
    transformedValues.sort((valA, valB) => valA - valB);

    let medianValue;
    // Calculate the middle index of the sorted array.
    const medianIndex = Math.floor(arraySize / 2);

    // Determine the median value based on whether the array has an odd or even number of elements.
    if (arraySize % 0b1) { // If arraySize is odd (remainder when divided by 1 is 1, using binary literal for 1).
        medianValue = transformedValues[medianIndex];
    } else {
        // If arraySize is even, the median is the floor of the average of the two middle elements.
        medianValue = Math.floor((transformedValues[medianIndex] + transformedValues[medianIndex - 0b1]) / 2);
    }

    let totalDeviation = 0x0; // Initialize the sum of deviations to zero (using hexadecimal literal for 0).
    // Calculate the sum of absolute differences between each transformed value and the calculated median.
    for (const currentVal of transformedValues) {
        totalDeviation += Math.abs(currentVal - medianValue);
    }

    // Output the final calculated sum to the console.
    console.log(totalDeviation);
}

// Read input from standard input, decode it as UTF-8, and split it into lines.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'));
