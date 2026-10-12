var parsedTokens = require('fs').readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(' ')
  .map(function(tokenStr) {
    // Attempt to convert the current string token into an integer.
    if (!isNaN(parseInt(tokenStr))) {
      return parseInt(tokenStr); // If it's a valid number, return its integer representation.
    } else {
      return tokenStr; // Otherwise, return the token as a string (likely an operator).
    }
  });

/**
 * Places a given item onto the top of the provided stack.
 * @param {number|string} itemToStore - The element to be added to the stack.
 * @param {Array<number>} dataStack - The array representing the stack.
 * @returns {Array<number>} The modified stack after the push operation.
 */
function placeOnStack(itemToStore, dataStack) {
  dataStack.push(itemToStore);
  return dataStack;
}

/**
 * Executes an addition operation using the top two elements of the stack.
 * The second element popped is added to the first element popped.
 * @param {Array<number>} dataStack - The array representing the stack.
 * @returns {Array<number>} The stack with the result of the addition.
 */
function performAddition(dataStack) {
  var operandTwo = dataStack.pop(); // Retrieve the second operand.
  var operandOne = dataStack.pop(); // Retrieve the first operand.
  dataStack.push(operandOne + operandTwo); // Push their sum back onto the stack.
  return dataStack;
}

/**
 * Executes a subtraction operation using the top two elements of the stack.
 * The second element popped is subtracted from the first element popped.
 * @param {Array<number>} dataStack - The array representing the stack.
 * @returns {Array<number>} The stack with the result of the subtraction.
 */
function executeSubtraction(dataStack) {
  var operandTwo = dataStack.pop(); // Retrieve the subtrahend.
  var operandOne = dataStack.pop(); // Retrieve the minuend.
  dataStack.push(operandOne - operandTwo); // Push their difference back onto the stack.
  return dataStack;
}

/**
 * Executes a multiplication operation using the top two elements of the stack.
 * The two popped elements are multiplied together.
 * @param {Array<number>} dataStack - The array representing the stack.
 * @returns {Array<number>} The stack with the result of the multiplication.
 */
function processMultiplication(dataStack) {
  var operandTwo = dataStack.pop(); // Retrieve the second factor.
  var operandOne = dataStack.pop(); // Retrieve the first factor.
  dataStack.push(operandOne * operandTwo); // Push their product back onto the stack.
  return dataStack;
}

/**
 * Dispatches to the appropriate arithmetic function based on the operator symbol.
 * @param {string} opSymbol - The operator symbol ('+', '-', '*').
 * @param {Array<number>} dataStack - The array representing the stack.
 * @returns {Array<number>} The stack after the operation has been performed.
 */
function handleOperation(opSymbol, dataStack) {
  switch (opSymbol) {
    case '+':
      dataStack = performAddition(dataStack);
      break;
    case '-':
      dataStack = executeSubtraction(dataStack);
      break;
    case '*':
      dataStack = processMultiplication(dataStack);
  }
  return dataStack;
}

// Initialize an empty array to serve as our operand stack.
var dataStack = [];

// Iterate over each token obtained from the input.
parsedTokens.forEach(function (currentElement) {
  if (typeof currentElement === 'number') {
    // If the current token is a number, push it onto the stack.
    placeOnStack(currentElement, dataStack);
  } else {
    // If it's not a number, it must be an operator; perform the corresponding operation.
    handleOperation(currentElement, dataStack);
  }
});

// After processing all tokens, the final result should be the only element remaining on the stack.
console.log(dataStack[0]);
