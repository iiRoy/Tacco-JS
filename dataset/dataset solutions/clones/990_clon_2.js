// This module defines general operational configurations
const appOptions = {
    sourcePath: '/dev/stdin', // Specifies the input file location
    lineBreakChar: '\n'       // Defines the character sequence for new lines
};

// Reads the entire content from the specified source file,
// decodes it as UTF-8, and then splits it into an array of strings
// based on the configured line break character.
const dataRows = require('fs')
    .readFileSync(appOptions.sourcePath, 'utf-8')
    .split(appOptions.lineBreakChar);

/**
 * Computes the Greatest Common Divisor (GCD) of two non-negative integers
 * using the Euclidean algorithm.
 * @param {number} valA - The first integer value.
 * @param {number} valB - The second integer value.
 * @returns {number} The greatest common divisor of valA and valB.
 */
const computeGCD = (valA, valB) =>
    valB === 0
        ? valA
        : computeGCD(valB, valA % valB); // Recursive step of the Euclidean algorithm

// Processes the initial line of input data:
// 1. Splits the first data row by space characters to get individual number strings.
// 2. Converts each string segment into an integer (base 10).
// 3. Spreads these parsed integers as arguments to the computeGCD function.
// 4. Prints the final calculated GCD value to the standard output.
console.log(
    computeGCD(
        ...dataRows[0]
            .split(' ')
            .map(itemStr => parseInt(itemStr, 10)) // Explicitly parse strings to base-10 integers
    )
);