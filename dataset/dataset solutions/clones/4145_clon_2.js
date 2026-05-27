'use strict';

// This script reads two numbers from standard input, then calculates
// how many times the first number needs to be doubled to exceed the second number.

const dataArray = require('fs').readFileSync('/dev/stdin', 'utf8')
                               .trim()
                               .split(' ')
                               .map(item => item * 1); // Parse input string into an array of numbers

let resultCount = 0; // Initialize a variable to store the final count
let upperBound = dataArray[1]; // The second number from input defines the upper limit
let initialValue = dataArray[0]; // The first number from input is our starting point

let currentValue = initialValue; // A temporary variable to hold the value that gets doubled

// Loop while the current value is less than the specified upper bound
while (currentValue < upperBound) {
  currentValue *= 2; // Double the current value
  resultCount++;     // Increment the counter for each doubling operation
}

// Print the total number of doublings required
console.log(resultCount);
