let printMsg = console.log; // Assign console.log to a new identifier for output

// Read input from standard input using the 'fs' module
let inputData = require("fs").readFileSync("/dev/stdin", "UTF-8");

// Process the input: split by space and convert each part to a number
let parsedNumbers = inputData
  .split(" ") // Split the string by space character
  .map(Number); // Convert each resulting string segment into a numerical value

// Extract the first and second numbers from the processed array
let firstVal = parsedNumbers[0]; // The first number from the input
let secondVal = parsedNumbers[1]; // The second number from the input

// Calculate the difference between the two numbers
let differenceResult = firstVal - secondVal;

// Conditional logic based on the second value
if (secondVal === 1) {
  // If the second value is 1, print 0
  printMsg(0);
} else {
  // Otherwise, print the calculated difference
  printMsg(differenceResult);
}
