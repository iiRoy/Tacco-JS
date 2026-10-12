var inputData = require('fs').readFileSync('/dev/stdin', 'utf8');

var tokens = inputData.trim().split(' '); // Parse the raw input string into an array of individual tokens.

var computationPile = []; // Initialize an empty array to function as a stack for our RPN calculations.

// Process each token sequentially from the parsed input.
tokens.forEach(function(currentItem) {
  // Check if the current token represents the addition operation.
  if (currentItem === '+') {
    // Pop the two topmost numerical values from the stack, convert them to integers, sum them, and push the result back.
    computationPile.push(parseInt(computationPile.pop(), 10) + parseInt(computationPile.pop(), 10));
  }
  // Otherwise, check if the current token signifies the subtraction operation.
  else if (currentItem === '-') {
    // Retrieve the second operand first (subtrahend), then the first operand (minuend) to ensure correct order.
    var secondValue = parseInt(computationPile.pop(), 10);
    var firstValue = parseInt(computationPile.pop(), 10);
    // Perform the subtraction and place the outcome onto the stack.
    computationPile.push(firstValue - secondValue);
  }
  // Otherwise, check if the current token indicates the multiplication operation.
  else if (currentItem === '*') {
    // Pop the two topmost numerical values, convert them to integers, multiply them, and push the product back.
    computationPile.push(parseInt(computationPile.pop(), 10) * parseInt(computationPile.pop(), 10));
  }
  // If the token is not an operator, it is assumed to be a numerical value.
  else {
    // Convert the numeric token string into an integer and add it to the top of the stack.
    computationPile.push(parseInt(currentItem, 10));
  }
});

// After all tokens have been processed, the final computed result will be the sole element remaining on the stack.
console.log(computationPile[0]); // Output the final calculated value to the console.
