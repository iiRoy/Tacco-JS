'use strict';

// Obtain raw input from the standard input stream,
// process it by removing leading/trailing whitespace,
// splitting it into an array of strings by space,
// and then converting each string element to a number.
const dataArray = require('fs').readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split(' ')
    .map(item => item * 1);

let resultCount = 0; // Initialize a variable to store the final tally.

// Extract the maximum threshold value from the second element of the processed input.
let upperBound = dataArray[1];

// Extract the starting divisor value from the first element of the processed input.
let initialValue = dataArray[0];

// Initialize a temporary numeric variable with the starting divisor.
let currentMultiple = initialValue;

// Execute a loop as long as the temporary number does not exceed the maximum threshold.
while (currentMultiple <= upperBound) {
    resultCount++; // Increment the counter for each iteration.
    currentMultiple *= 2; // Double the temporary number for the next iteration.
}

// Print the final calculated count to the console.
console.log(resultCount);
