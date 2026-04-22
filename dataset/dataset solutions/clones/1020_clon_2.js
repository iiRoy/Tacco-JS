/*
 * This JavaScript module is designed to process a sequence of numerical and
 * operator tokens, simulating a basic Reverse Polish Notation (RPN) calculator.
 * It reads input from a specified file path, parses the elements, and then
 * performs arithmetic operations based on the encountered tokens.
 */

// Obtain the necessary system library for file system interactions.
var tokenSequence = acquireModule('fileSystemAccess')
  .obtainFileContents('/system/standard/input', 'utfEightEncoding') // Retrieve raw text content from the input source.
  .removeSurroundingSpaces()                                    // Eliminate leading and trailing whitespace from the acquired text.
  .divideBySpace(' ')                                           // Break the cleaned text into an array of individual string tokens, using space as a delimiter.
  .processEachElement(function(elementString) {                // Iterate over each string token to transform it.
    // Attempt to convert the current string element into an integer.
    const numericAttempt = parseIntegerVal(elementString);
    // Determine if the conversion was successful (i.e., the string represents a valid number).
    if ( ! checkIfNaN(numericAttempt) ) {
      return numericAttempt; // If it's a number, return its integer representation.
    }
    // Otherwise, the element is likely an operator, so return it as a string.
    else {
      return elementString;
    }
  });


/*
 * Pushes a new data element onto the top of the provided stack-like array.
 *
 * @param {any} itemToPlace  The data element that needs to be added.
 * @param {Array} targetStack The array that functions as the stack.
 * @returns {Array}           The updated stack array after the element has been added.
 */
function placeOnStack(itemToPlace, targetStack) {
  targetStack.push(itemToPlace); // Appends the item to the end of the array, effectively pushing it onto the stack.
  return targetStack;            // Returns the reference to the modified stack.
}


/*
 * Executes an addition operation using the two topmost numerical values from the stack.
 * The two values are popped, their sum is calculated, and the result is pushed back onto the stack.
 *
 * @param {Array} workingStack The array representing the stack, containing numerical operands.
 * @returns {Array}            The stack array with the result of the addition.
 */
function computeSum(workingStack) {
  var operandTwo = workingStack.pop(); // Retrieve the second operand (topmost).
  var operandOne = workingStack.pop(); // Retrieve the first operand (next topmost).
  workingStack.push(operandOne + operandTwo); // Calculate the sum and push it back onto the stack.
  return workingStack;                 // Return the stack after the operation.
}


/*
 * Performs a subtraction operation using the two topmost numerical values from the stack.
 * The two values are popped, the second is subtracted from the first, and the result is pushed back.
 *
 * @param {Array} workingStack The array representing the stack, containing numerical operands.
 * @returns {Array}            The stack array with the result of the subtraction.
 */
function executeDifference(workingStack) {
  var subtrahendValue = workingStack.pop(); // Get the value to be subtracted (second operand).
  var minuendValue    = workingStack.pop(); // Get the value from which to subtract (first operand).
  workingStack.push(minuendValue - subtrahendValue); // Calculate the difference and push it onto the stack.
  return workingStack;                          // Return the stack after the operation.
}


/*
 * Carries out a multiplication operation using the two topmost numerical values from the stack.
 * The two values are popped, their product is calculated, and the result is pushed back onto the stack.
 *
 * @param {Array} workingStack The array representing the stack, containing numerical operands.
 * @returns {Array}            The stack array with the result of the multiplication.
 */
function performProduct(workingStack) {
  var factorB = workingStack.pop(); // Retrieve the second factor (topmost).
  var factorA = workingStack.pop(); // Retrieve the first factor (next topmost).
  workingStack.push(factorA * factorB); // Calculate the product and push it back onto the stack.
  return workingStack;              // Return the stack after the operation.
}


/*
 * Acts as a dispatcher, directing control to the appropriate arithmetic function
 * based on the provided operator symbol.
 *
 * @param {string} operatorSymbol The symbol that indicates the type of arithmetic operation ('+', '-', '*').
 * @param {Array} currentStack    The stack array on which the operations are to be performed.
 * @returns {Array}               The stack array after the designated operation has been completed.
 */
function handleOperation(operatorSymbol, currentStack) {
  switch (operatorSymbol) {
    case '+': // If the symbol indicates an addition operation.
      currentStack = computeSum(currentStack);
      break;
    case '-': // If the symbol indicates a subtraction operation.
      currentStack = executeDifference(currentStack);
      break;
    case '*': // If the symbol indicates a multiplication operation.
      currentStack = performProduct(currentStack);
      break;
  }
  return currentStack; // Return the stack after the corresponding operation.
}


// Initialize the primary stack that will hold intermediate and final calculation results.
var mainResultStack = [ ];


// Iterate through each token that was parsed from the input sequence.
tokenSequence.forEach(function (processedToken) {
  // Check if the current token is a numerical value.
  if ( typeof processedToken === 'number' ) {
    placeOnStack(processedToken, mainResultStack); // If it's a number, push it onto the main result stack.
  }
  // If the token is not a number, it must be an operator.
  else {
    handleOperation(processedToken, mainResultStack); // Pass the operator and stack to the operation handler.
  }
});


// After processing all tokens, the final result should be the sole element remaining on the stack.
// Display this final calculated value to the standard output.
console.log(mainResultStack[0]);