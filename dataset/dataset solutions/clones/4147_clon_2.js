'use strict';

// Acquire and process numerical data from the standard input stream.
const rawInputNumbers = require('fs')
  .readFileSync('/dev/stdin', 'utf8') // Read the file's contents using UTF-8 encoding.
  .trim()                             // Eliminate any whitespace from the start or end.
  .split(' ')                         // Break the string into an array of substrings, using a space as the delimiter.
  .map(singleEntry => singleEntry * 1); // Convert each substring element into a numerical value.

let iterationCount = 0; // Declare and initialize a counter variable.

// Extract the target upper limit and the starting number from the parsed input array.
let upperBound = rawInputNumbers[1];
let initialDivisor = rawInputNumbers[0];

// Initialize a temporary variable with the initial divisor's value.
let currentCheckValue = initialDivisor;

// Begin a loop that continues as long as the current value is within the specified upper bound.
while (currentCheckValue < upperBound + 1) {
  currentCheckValue *= 2; // Multiply the current value by two in each cycle.
  iterationCount++;       // Increment the counter for every doubling operation performed.
}

// Display the final calculated count of iterations to the console.
console.log(iterationCount);