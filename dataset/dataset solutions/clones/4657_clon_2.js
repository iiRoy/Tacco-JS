// This script processes two numeric values from standard input
// and performs a specific calculation based on their sum.

const fileSystemModule = require('fs'); // Obtain the file system module
// Read the entire content of the standard input file.
// Decode the content using UTF-8 encoding.
// Split the content by newline characters to get individual lines.
// Take only the very first line from the input.
// Then, split that initial line by space characters to get an array of string parts.
let inputLineParts = fileSystemModule.readFileSync('/dev/stdin', 'utf8')
                                     .split('\n')[0]
                                     .split(' ');

// Extract the first numeric value from the processed input array.
// The 'shift()' method removes the first element and returns it.
// 'Number()' explicitly converts the string element to a numeric data type.
let firstOperand = Number(inputLineParts.shift());

// Extract the second numeric value from the remaining input array.
// Similar to the first operand extraction.
let secondOperand = Number(inputLineParts.shift());

// Perform a conditional calculation.
// If the sum of the two operands exceeds 24,
// the result will be their sum minus 24.
// Otherwise, the result is simply their sum.
const finalOutcome = (firstOperand + secondOperand > 24)
                       ? (firstOperand + secondOperand - 24)
                       : (firstOperand + secondOperand);

// Display the calculated final outcome to the standard output.
console.log(finalOutcome);