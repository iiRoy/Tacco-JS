'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes the raw input string to calculate the range of numbers.
 * The range is defined as the difference between the maximum and minimum number.
 *
 * @param {string} rawData - The complete input string, expected to contain
 *                           numbers on the second line, separated by spaces.
 */
const processInput = (rawData) => {
    // Split the input by newline characters, then take the second line (index 1).
    // This line is then split by spaces to get individual number strings.
    // Each string is converted to an integer, and the resulting array is sorted numerically.
    const sortedNumbers = rawData.split('\n')[1].split(' ').map(valStr => parseInt(valStr, 10)).sort((numA, numB) => numA - numB);

    // After sorting, the smallest number is at index 0 and the largest is at the last index.
    // Calculate the difference between the largest and smallest number.
    const resultValue = sortedNumbers[sortedNumbers.length - 1] - sortedNumbers[0];

    // Output the calculated range to the console.
    console.log(resultValue);
};

// Read the entire content from standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
// Then, pass this content to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
