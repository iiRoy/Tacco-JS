'use strict';

// Define a constant for the large prime modulus to be used in calculations.
const MODULO_PRIME_CONSTANT = 1000000007; // Equivalent to 1e9 + 7

let dataContentBuffer;
try {
    // Acquire the necessary file system utility module.
    const fileIOManager = require('fs');

    // Synchronously read all data from the standard input stream.
    dataContentBuffer = fileIOManager.readFileSync('/dev/stdin');

} catch (acquisitionError) {
    // In case of an error during input acquisition, log the issue and exit.
    console.error('Error encountered while accessing standard input:', acquisitionError.message);
    process.exit(1); // Terminate execution due to critical input failure.
}

// Convert the raw buffer data into a UTF-8 string and clean up leading/trailing whitespace.
const processedInputString = dataContentBuffer.toString('utf8').trim();

// Split the cleaned string into an array of lines.
const inputLinesArray = processedInputString.split('\n');

// Attempt to parse the first line of input as a numerical value.
let upperFactorialLimit = Number(inputLinesArray[0]);

// Validate the parsed numerical limit. If it's not a valid number or is negative,
// treat it as an invalid input and potentially default or exit.
if (isNaN(upperFactorialLimit) || upperFactorialLimit < 0) {
    console.error('Invalid or negative numerical limit provided. Defaulting to zero for calculation.');
    upperFactorialLimit = 0; // Default to 0, for which 0! is typically 1.
}

// Initialize the variable that will accumulate the product (factorial result).
let computedFactorialValue = 1;

// Initialize a counter for the iterative multiplication process.
let currentMultiplier = 1;

// Perform the factorial calculation using a 'while' loop for structural variation.
while (currentMultiplier <= upperFactorialLimit) {
    // Calculate the intermediate product before applying the modulus.
    const intermediateProduct = computedFactorialValue * currentMultiplier;

    // Apply the modulus to keep the number within manageable bounds and prevent overflow.
    computedFactorialValue = intermediateProduct % MODULO_PRIME_CONSTANT;

    // Increment the multiplier for the next iteration.
    currentMultiplier++;
}

// Output the final calculated factorial value to standard output.
console.log(computedFactorialValue);