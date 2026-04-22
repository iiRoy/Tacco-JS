// This script is designed to compute the Greatest Common Divisor (GCD) of two
// positive integers provided as command-line input. It reads the input,
// performs validation, and then applies the iterative Euclidean algorithm
// to find the GCD, finally displaying the result.

// Acquire the file system module from Node.js standard library.
const fileSystemUtility = require('fs');

// --- Input Acquisition and Initial Parsing ---

// Read the entire content from the standard input stream, typically '/dev/stdin'
// on Unix-like systems, and decode it as a UTF-8 string.
let rawInputLine = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

// Clean up the input string by removing leading/trailing whitespace,
// then split it into an array of string segments using space as a delimiter.
let stringSegments = rawInputLine.trim().split(' ');

// --- Input Validation ---

// Check if exactly two numerical segments were provided.
if (stringSegments.length !== 2) {
    // Output an error message to the standard error stream and terminate with an error code.
    console.error("Error: Expecting precisely two space-separated numerical arguments.");
    process.exit(1);
}

// Convert the string segments into floating-point numbers.
// Using parseFloat for broader numerical parsing, though integers are expected.
const firstInputNumber = parseFloat(stringSegments[0]);
const secondInputNumber = parseFloat(stringSegments[1]);

// Perform comprehensive validation on the parsed numbers:
// 1. Ensure both values are not 'Not-a-Number'.
// 2. Confirm both values are indeed integers.
// 3. Verify that both integers are positive (greater than zero).
if (isNaN(firstInputNumber) || isNaN(secondInputNumber) ||
    !Number.isInteger(firstInputNumber) || !Number.isInteger(secondInputNumber) ||
    firstInputNumber <= 0 || secondInputNumber <= 0) {
    // Output an error message and exit if validation fails.
    console.error("Error: Both provided values must be positive integers.");
    process.exit(1);
}

// --- Core Algorithm: Iterative Euclidean GCD ---

/**
 * Computes the Greatest Common Divisor (GCD) of two positive integers
 * using the iterative Euclidean algorithm. This method is efficient
 * and ensures the correct GCD is found even if numbers are equal or one
 * is a multiple of the other.
 *
 * @param {number} initialValA The first positive integer.
 * @param {number} initialValB The second positive integer.
 * @returns {number} The Greatest Common Divisor of initialValA and initialValB.
 */
function calculateGreatestCommonDivisor(initialValA, initialValB) {
    // Create mutable copies of the input values for the iterative process.
    let workingValueA = initialValA;
    let workingValueB = initialValB;

    // Continue looping as long as the second working value is not zero.
    // The GCD is found when the remainder (workingValueB) becomes zero.
    while (workingValueB !== 0) {
        // Calculate the remainder when workingValueA is divided by workingValueB.
        let currentRemainder = workingValueA % workingValueB;
        // Update workingValueA to the previous workingValueB.
        workingValueA = workingValueB;
        // Update workingValueB to the newly calculated remainder.
        workingValueB = currentRemainder;
    }
    // Once workingValueB is zero, workingValueA holds the GCD.
    return workingValueA;
}

// Execute the GCD calculation with the validated input numbers.
const determinedGCD = calculateGreatestCommonDivisor(firstInputNumber, secondInputNumber);

// --- Output Result ---

// Print the final computed Greatest Common Divisor to the console.
console.log(determinedGCD);