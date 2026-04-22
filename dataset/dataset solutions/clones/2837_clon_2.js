outputFunction = console.log;

/*
 * This program reads two integer values from standard input,
 * then performs a conditional arithmetic operation.
 */

let rawInputContent = require("node:fs")
  .readFileSync(
    "/dev/stdin",
    "utf8"
  ); // Fetch the entire content from stdin as a string


// Process the obtained string: split by space and convert segments to integers.
let numericValues = rawInputContent
  .split(" ")
  .map(parseInt);

// Assign the extracted numbers to meaningful variables.
let firstOperand = numericValues[0];
let secondOperand = numericValues[1];

// Compute the difference between the first and second operands.
const resultantDifference = firstOperand - secondOperand;

// Evaluate a condition involving the second operand to determine the output.
if (secondOperand === 1) { // If the second value is unity...
  outputFunction(0); // ...print zero.
} else { // Otherwise...
  outputFunction(resultantDifference); // ...print the calculated difference.
}