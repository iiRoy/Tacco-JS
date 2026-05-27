/*
 * This module processes numerical input from a specified source.
 * It calculates the Greatest Common Divisor (GCD) and Least Common Multiple (LCM)
 * for pairs of numbers provided on each line.
 */

// Configuration object for input source and line termination.
// For Windows systems, you might use: const processingSettings = { sourcePath: 'temp_input.txt', lineSeparator: '\r\n' };
const processingSettings = { sourcePath: '/dev/stdin', lineSeparator: '\n' }; // Standard for Linux/Unix environments

// Utilize the 'fs' module to read the input file synchronously.
require('fs').readFileSync(processingSettings.sourcePath, 'ascii')
    .trim() // Remove leading/trailing whitespace from the entire content.
    .split(processingSettings.lineSeparator) // Divide the content into individual lines.
    .forEach(function (inputLine) { // Iterate over each line of input.
        // Split the current line by space to get the two numbers as strings.
        const parts = inputLine.split(' ');
        // Extract the string representations of the two numbers.
        const firstNumStr = parts[0];
        const secondNumStr = parts[1];

        // Convert string numbers to integers and compute GCD and LCM.
        // Then, print the results to the console in a formatted way.
        console.log('%d %d', computeGreatestCommonDivisor(firstNumStr, secondNumStr), calculateLeastCommonMultiple(firstNumStr, secondNumStr));
    });

/**
 * Computes the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
 * @param {number} val1 - The first integer.
 * @param {number} val2 - The second integer.
 * @returns {number} The greatest common divisor of val1 and val2.
 */
function computeGreatestCommonDivisor(val1, val2) {
    // Ensure numbers are positive integers for the algorithm.
    let currentVal1 = parseInt(val1, 10);
    let currentVal2 = parseInt(val2, 10);

    // Loop until both values are equal.
    while (currentVal1 !== currentVal2) {
        // If the first value is smaller, swap them to ensure currentVal1 >= currentVal2.
        if (currentVal1 < currentVal2) {
            let temporaryHolder = currentVal1;
            currentVal1 = currentVal2;
            currentVal2 = temporaryHolder;
        }
        // If currentVal1 is perfectly divisible by currentVal2, then currentVal2 is the GCD.
        if (currentVal1 % currentVal2 === 0) {
            return currentVal2;
        }
        // Subtract currentVal2 from currentVal1.
        currentVal1 -= currentVal2;
    }
    // When currentVal1 equals currentVal2, that value is the GCD.
    return currentVal1;
}

/**
 * Calculates the Least Common Multiple (LCM) of two numbers.
 * LCM(a, b) = |a * b| / GCD(a, b)
 * This implementation uses the formula: (a / GCD(a, b)) * b to prevent potential overflow
 * when a and b are large, while maintaining mathematical equivalence.
 * @param {number} val1 - The first integer.
 * @param {number} val2 - The second integer.
 * @returns {number} The least common multiple of val1 and val2.
 */
function calculateLeastCommonMultiple(val1, val2) {
    // Convert string numbers to integers.
    const numA = parseInt(val1, 10);
    const numB = parseInt(val2, 10);

    // Find the greatest common divisor of the two numbers.
    const commonDivisor = computeGreatestCommonDivisor(numA, numB);

    // Calculate LCM using the GCD.
    // The multiplication is done carefully to avoid intermediate overflow for large numbers.
    return commonDivisor * (numA / commonDivisor) * (numB / commonDivisor);
}
