// This program reads a single numerical input from standard input,
// performs a series of arithmetic computations, and then outputs the final result.
// The calculation involves integer division, modulo operations, and conditional adjustments.

// Establish a link to the Node.js file system module for input/output operations.
const fileSystemAccess = require('fs');

// Define the specific path for reading standard input in a typical Unix-like environment.
const standardInputSource = '/dev/stdin';

// Retrieve the entire content of the standard input file as a string.
// It's crucial to specify UTF-8 encoding to handle character sets correctly.
const rawSourceData = fileSystemAccess.readFileSync(standardInputSource, 'utf8');

// Divide the raw input string into an array of lines.
// This is a common preparatory step for processing line-oriented input.
const dataRows = rawSourceData.split('\n');

// Extract the very first line from the array.
// This line is expected to contain the primary numerical input.
const mainInputString = dataRows.shift();

// Convert the extracted string into an integer.
// Using `parseInt` with a radix (10) ensures robust numerical conversion.
const primaryNumericValue = parseInt(mainInputString, 10);

// Define a constant for the primary divisor used in the core calculation.
const majorDivisor = 11;

// Calculate the base result component using integer division.
// `Math.floor` ensures that we only consider the whole number part of the division.
const baseQuotient = Math.floor(primaryNumericValue / majorDivisor);

// Initialize the accumulator for the final computed value.
// The base result is twice the integer quotient.
let finalComputedValue = baseQuotient * 2;

// Determine the remainder after dividing the primary number by the major divisor.
// This remainder is crucial for subsequent conditional adjustments.
const currentRemainder = primaryNumericValue % majorDivisor;

// Define a utility function to calculate an additional increment based on the remainder.
// This function encapsulates the conditional logic for clarity and modularity.
const determineRemainderIncrement = (remValue) => {
    let additionalIncrement = 0; // Default increment is zero if no conditions are met.

    // If the remainder is non-zero, an increment is required.
    if (remValue > 0) {
        // For remainders from 1 to 6 (inclusive), add 1 to the result.
        if (remValue <= 6) {
            additionalIncrement = 1;
        } else {
            // For remainders greater than 6 (i.e., 7, 8, 9, 10), add 2.
            additionalIncrement = 2;
        }
    }
    return additionalIncrement;
};

// Apply the calculated increment from the remainder logic to the total.
finalComputedValue += determineRemainderIncrement(currentRemainder);

// Output the comprehensive final computed value to the standard output stream.
// This is the desired outcome of the program's execution.
console.log(finalComputedValue);