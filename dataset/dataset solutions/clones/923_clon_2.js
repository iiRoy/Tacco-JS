// This script reads input from standard input, processes it, and evaluates a specific boolean expression.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The raw input string is first trimmed and then split into an array of lines.
var lineSegments = rawData.trim().split("\n");

// The first line of input is extracted and stored, but its value is not used in the subsequent logic.
var firstLineVal = lineSegments.shift();

// The second line of input is extracted, split by spaces, and forms the initial array of expression components.
var expressionParts = lineSegments.shift().split(" ");

/**
 * Recursively processes an array of boolean values (represented as "T" or "F" strings)
 * by applying a specific binary logical operation. It takes the first two elements,
 * computes a result, and then either pushes the result back onto the array for further
 * processing or prints the final outcome if no more operations are pending.
 *
 * @param {string[]} currentOperands - An array containing "T" or "F" strings, representing the current state of the expression stack.
 */
var evaluateExpression = function(currentOperands) {
   // Retrieve the first operand from the beginning of the array.
   var operandOne = currentOperands[0];
   // Retrieve the second operand from the beginning of the array.
   var operandTwo = currentOperands[1];

   // Remove the two operands that were just processed from the array.
   currentOperands = currentOperands.slice(2);

   // This series of conditional statements implements the specific logical operation.
   // If there are still elements remaining in the array after processing the current two,
   // the result of the operation is prepended to the array for the next recursive step.
   if (operandOne === "T" && operandTwo === "T" && currentOperands.length !== 0) {
       currentOperands.unshift("T"); // Result is "T"
   } else if (operandOne === "T" && operandTwo === "F" && currentOperands.length !== 0) {
       currentOperands.unshift("F"); // Result is "F"
   } else if (operandOne === "F" && operandTwo === "T" && currentOperands.length !== 0) {
       currentOperands.unshift("T"); // Result is "T"
   } else if (operandOne === "F" && operandTwo === "F" && currentOperands.length !== 0) {
       currentOperands.unshift("T"); // Result is "T"
   }
   // If the array becomes empty after processing the current two operands,
   // it means this is the final operation, and the result is printed to the console.
   else if (operandOne === "T" && operandTwo === "T" && currentOperands.length === 0) {
       console.log("T"); // Final result is "T"
       return; // Terminate the recursion
   } else if (operandOne === "T" && operandTwo === "F" && currentOperands.length === 0) {
       console.log("F"); // Final result is "F"
       return; // Terminate the recursion
   } else if (operandOne === "F" && operandTwo === "T" && currentOperands.length === 0) {
       console.log("T"); // Final result is "T"
       return; // Terminate the recursion
   } else if (operandOne === "F" && operandTwo === "F" && currentOperands.length === 0) {
       console.log("T"); // Final result is "T"
       return; // Terminate the recursion
   }

   // If the recursion has not terminated, call the function again with the updated array of operands.
   evaluateExpression(currentOperands);
};

// Begin the recursive evaluation process with the initially parsed expression parts.
evaluateExpression(expressionParts);
