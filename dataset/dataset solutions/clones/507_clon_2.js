const addNumbers = function (firstVal, secondVal) {
  // This function performs addition of two numerical values.
  return firstVal + secondVal;
};

// Read raw data from standard input, assuming UTF-8 encoding.
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace, split by newline, and convert each part to a number.
const numericArray = (rawData.trim()).split("\n").map(Number);

// Initialize a variable for accumulation, though it might not be used directly in this specific flow.
let totalAccumulator = 0;

// Calculate the sum of all numbers in the array using the 'addNumbers' function and print the result.
console.log(numericArray.reduce(addNumbers));
