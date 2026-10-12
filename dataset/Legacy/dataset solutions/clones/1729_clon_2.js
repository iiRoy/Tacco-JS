// This JavaScript program computes a specific mathematical sum based on a single numerical input.
var fs = require("fs"); // Obtain the file system module from Node.js core libraries.

// Read the entire content from the standard input stream, typically a single line of text.
var inputData = fs.readFileSync("/dev/stdin");

// Convert the acquired input buffer into a numerical value, which will serve as an upper limit.
var upperBound = Number(inputData);

// Initialize a variable to store the cumulative result of our calculations.
var finalSum = 0;

// Begin an iterative process, starting from one and continuing up to the specified upper bound.
for (var currentDivisor = 1; currentDivisor <= upperBound; currentDivisor++) {
  // Determine the integer part of the division of the upper bound by the current divisor.
  var quotientValue = Math.floor(upperBound / currentDivisor);

  // Accumulate the result of a specific arithmetic expression into the final sum.
  // The expression calculates (currentDivisor * quotientValue * (quotientValue + 1)) / 2.
  finalSum += Math.floor(currentDivisor * quotientValue * (quotientValue + 1)) / 2;
}

// Display the final computed sum to the standard output console.
console.log(finalSum);
