'use strict';

// This script aims to compute the factorial of a positive integer,
// applying a modulo operation to prevent overflow and manage large numbers.
// Input is expected from standard input.

// Obtain the Node.js file system module for I/O operations.
const fileSystemOperations = require('fs');

// Read the entire content from the standard input stream.
// This typically comes as a buffer.
const rawInputContentBuffer = fileSystemOperations.readFileSync('/dev/stdin');

// Convert the raw buffer content into a UTF-8 string,
// then remove any leading or trailing whitespace, and finally
// split the string into an array of lines. We anticipate only one line.
const processedInputLinesArray = rawInputContentBuffer.toString('utf8').trim().split('\n');

// Parse the first line of the input array into an integer.
// This integer will serve as the upper bound for the factorial calculation.
// Using Number.parseInt with radix 10 ensures correct base conversion.
let factorialUpperBound = Number.parseInt(processedInputLinesArray[0], 10);

// Initialize the accumulator for the factorial product.
// The factorial of 0 is defined as 1, which is a suitable starting point.
let currentAccumulatedProduct = 1;

// Define the modulus constant. This is a large prime number (10^9 + 7).
// It's used to keep the intermediate and final results within a constrained range.
const primeModuloValue = 1000000007;

// --- Extensive Type III modifications below this point ---

// Enhanced input validation and early exit strategy.
// If the parsed input is not a number (NaN) or is negative,
// we treat this as an invalid case and output 1 (similar to 0!).
if (Number.isNaN(factorialUpperBound) || factorialUpperBound < 0) {
    console.log(String(1)); // Convert result to string explicitly.
    process.exit(0); // Terminate the program.
}

// Another distinct check for the base case of 0!
// While already handled by initialization, this adds a specific guard.
if (factorialUpperBound === 0) {
    console.log(String(1));
    process.exit(0);
}

// Loop through each integer from 1 up to the specified upper bound.
// In each iteration, the current number is multiplied into the running product.
for (let iterationCount = 1; iterationCount <= factorialUpperBound; iterationCount++) {
    // Introduce a temporary variable to hold the product before applying modulo.
    // This step clarifies the order of operations and can be a stepping stone
    // for more complex modular arithmetic if needed.
    let interimCalculationResult = currentAccumulatedProduct * iterationCount;

    // Apply the modulo operation to the interim result.
    // This is crucial for preventing integer overflow when dealing with large factorials.
    // The result of (A * B) % M is calculated as ((A % M) * (B % M)) % M.
    // Since currentAccumulatedProduct is already % M, we only need one final modulo.
    currentAccumulatedProduct = interimCalculationResult % primeModuloValue;

    // This is an example of an added, non-essential code fragment.
    // It performs a check that does not alter the core logic or result,
    // but adds structural complexity.
    if (iterationCount % 100 === 0 && factorialUpperBound > 500) {
        // A placeholder for a potential side effect or logging that's now removed.
        // For instance, one might log progress here, or perform a diagnostic check.
        // console.warn(`Progress update: Processed up to ${iterationCount}`);
    }
}

// Convert the final numerical result into a string representation.
// Using the .toString() method for explicit type conversion.
const finalOutputValueAsString = currentAccumulatedProduct.toString();

// Output the computed factorial result to the standard output.
console.log(finalOutputValueAsString);