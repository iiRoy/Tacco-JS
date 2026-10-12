'use strict'; // Enforce strict mode for cleaner code execution.

// Obtain raw input data from the standard input stream, encoded as UTF-8.
let dataString = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: remove leading/trailing whitespace and split into an array of string tokens using space as a delimiter.
dataString = dataString.trim().split(' ');

// Initialize an empty array to serve as a stack for operands during evaluation.
const operandPile = [];

// Iterate through each token in the processed input array.
for (let idx = 0; idx < dataString.length; ++idx) {
  const token = dataString[idx]; // Retrieve the current token for evaluation.

  // Use a switch statement to handle different types of tokens (operators or numbers).
  switch (token) {
    case '+': // If the token is the addition operator.
      // Pop the top two numbers from the stack, add them, and push the result back onto the stack.
      operandPile.push(operandPile.pop() + operandPile.pop());
      break;
    case '-': // If the token is the subtraction operator.
      // Pop two numbers. The order of popping is crucial for subtraction:
      // the first pop is the right operand, the second pop is the left operand.
      // So, it's (second_popped - first_popped).
      operandPile.push(-operandPile.pop() + operandPile.pop());
      break;
    case '*': // If the token is the multiplication operator.
      // Pop the top two numbers, multiply them, and push the product back onto the stack.
      operandPile.push(operandPile.pop() * operandPile.pop());
      break;
    default: // If the token is not an operator, it must be a numeric value.
      // Convert the string token to a number and push it onto the stack.
      operandPile.push(Number(token));
      break;
  }
}

// After processing all tokens, the final result of the RPN expression should be the sole element remaining on the stack.
console.log(operandPile[0]); // Output this final computed result to the console.
