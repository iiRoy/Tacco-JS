'use strict';

// This section handles reading and parsing input data from standard input.
const dataArray = require('fs')
    .readFileSync('/dev/stdin', 'utf8') // Reads the entire content of stdin as a UTF-8 string.
    .trim() // Removes any leading or trailing whitespace from the string.
    .split(' ') // Splits the string into an array of substrings, using space as a delimiter.
    .map(item => item * 1); // Converts each string element in the array to a numeric type.

// Initialize a variable to store the final computed result.
let resultCount = 0;

// Extract the maximum threshold value from the second element of the input array.
let upperBound = dataArray[1];

// Extract the starting divisor value from the first element of the input array.
let initialValue = dataArray[0];

// Create a mutable variable to track the current number in the iterative process.
let currentNumber = initialValue;

// Begin a loop that continues as long as the current number is less than or equal to the upper bound.
while (currentNumber < upperBound + 1) {
    // Double the current number in each iteration.
    currentNumber *= 2;
    // Increment the counter for each successful doubling operation.
    resultCount++;
}

// Print the final calculated count to the standard output.
console.log(resultCount);
