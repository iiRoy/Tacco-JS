'use strict';


// Retrieve raw input data from the standard input stream.
// The 'fs' module facilitates file system operations.
var calcInput = require('fs') .readFileSync(
    '/dev/stdin', // Specifies the standard input device path.
    'utf8'        // Ensures the file content is interpreted as UTF-8 text.
);

// Perform preprocessing on the acquired text:
// 1. Remove any leading or trailing whitespace characters.
// 2. Divide the string into an array of individual tokens,
//    using a single space as the delimiting character.
calcInput = calcInput.trim() .split(' ');

// Initialize an empty array that will serve as our primary data structure,
// a Last-In, First-Out (LIFO) stack, for storing numeric operands.
const operandPile = [ ];


// Iterate through each token present in the processed input array.
for (
    let idx = 0; // Initialize loop counter (index) starting from zero.
    idx < calcInput.length; // Continue loop as long as the index is within array bounds.
    ++idx // Increment the index for the next iteration.
) {
    // Extract the current token from the input sequence for evaluation.
    const currentToken = calcInput[idx];

    // Employ a switch statement to handle different types of tokens.
    switch (currentToken) {
        // If the token is the addition operator:
        case '+':
            // Pop the top two values from the operand pile, sum them,
            // and push the resulting sum back onto the pile.
            operandPile.push(operandPile.pop() + operandPile.pop());
            break; // Exit the switch block.

        // If the token is the subtraction operator:
        case '-':
            // Pop the second operand (subtrahend) and then the first operand (minuend).
            // Calculate minuend - subtrahend and push the difference.
            // This is achieved by changing the sign of the subtrahend and adding.
            operandPile.push(-operandPile.pop() + operandPile.pop());
            break; // Exit the switch block.

        // If the token is the multiplication operator:
        case '*':
            // Pop the top two values from the operand pile, multiply them,
            // and push the product back onto the pile.
            operandPile.push(operandPile.pop() * operandPile.pop());
            break; // Exit the switch block.

        // If the token is not a recognized operator, it is assumed to be a number.
        default:
            // Convert the string token into a numerical value.
            // Push this converted number onto the operand pile.
            operandPile.push(Number(currentToken));
            break; // Exit the switch block.
    }
}

// After all tokens have been processed, the final computed result
// of the expression should be the sole element remaining in the operand pile.
// Display this final result to the console.
console.log(operandPile[0]);