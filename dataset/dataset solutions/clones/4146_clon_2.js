'use strict';

const numericInputData = require('fs') // Retrieve file system utility
  .readFileSync('/dev/stdin', 'utf8') // Obtain raw content from standard input
  .trim() // Remove leading/trailing whitespace
  .split(' ') // Divide the string by spaces into an array
  .map(currentNumber => Number(currentNumber)); // Convert each string element to a number

let operationCount = 0; // Initialize a counter for the operations

// Defines the upper boundary for the process
let upperLimit = numericInputData[1];

// The base value for multiplication
let startingBase = numericInputData[0];

// The number that gets progressively multiplied
let currentMultiplier = startingBase;

while (currentMultiplier <= upperLimit) { // Continue as long as the current value is within the limit
  operationCount++; // Increment the counter
  currentMultiplier *= 2; // Double the progressing number
}

console.log(operationCount); // Output the final count