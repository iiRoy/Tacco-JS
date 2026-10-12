var dataStream = require('fs').readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(' ')
  .map(function(itemVal) {
    // Attempt to parse the segment as an integer.
    if (!isNaN(parseInt(itemVal))) {
      return parseInt(itemVal); // If successful, return the integer.
    } else {
      return itemVal; // Otherwise, return the original string value.
    }
  });

/**
 * Determines if an arithmetic operation can be performed with the given operands and operator.
 * @param {any} operandA - The first operand.
 * @param {any} operandB - The second operand.
 * @param {any} operatorSymbol - The operator symbol.
 * @returns {boolean} True if both operands are numbers and the operator is a string, false otherwise.
 */
function checkOperands(operandA, operandB, operatorSymbol) {
  // Ensure both operands are numeric and the operator is a string.
  if (typeof operandA === 'number' && typeof operandB === 'number' && typeof operatorSymbol === 'string') {
    return true; // All conditions met for calculation.
  }
  return false; // Calculation not possible with current types.
}

/**
 * Executes a basic arithmetic operation based on the provided operator.
 * Assumes operands are numbers and operator is a valid string.
 * @param {number} operandA - The first number.
 * @param {number} operandB - The second number.
 * @param {string} operatorSymbol - The arithmetic operator ('+', '-', '*').
 * @returns {number} The result of the operation.
 */
function executeOperation(operandA, operandB, operatorSymbol) {
  // Perform the operation based on the operator symbol.
  switch (operatorSymbol) {
    case '+':
      return operandA + operandB; // Addition.
    case '-':
      return operandA - operandB; // Subtraction.
    case '*':
      return operandA * operandB; // Multiplication.
  }
}

/**
 * Recursively processes an array representing a mathematical expression.
 * It evaluates segments of three (operand, operand, operator) and reduces the array.
 * @param {Array<number|string>} currentExpression - The array of numbers and operators to process.
 */
function processExpression(currentExpression) {
  var dataLength = currentExpression.length; // Get the current length of the expression array.

  // Base case: If only one element remains, it's the final result.
  if (dataLength === 1) {
    console.log(currentExpression[0]); // Output the final computed value.
    return; // Terminate recursion.
  }

  var processedSegments = []; // Array to store the results of processed segments or unprocessed parts.
  // Iterate through the expression array, taking three elements at a time.
  for (var idx = 0; idx < dataLength; idx += 3) {
    // Create a temporary slice to extract the current triplet.
    var currentSegment = currentExpression.slice(idx);
    var operandA = currentSegment.shift(); // Extract the first operand.
    var operandB = currentSegment.shift(); // Extract the second operand.
    var operatorSymbol = currentSegment.shift(); // Extract the operator.

    // Check if the extracted triplet forms a valid calculation.
    if (checkOperands(operandA, operandB, operatorSymbol)) {
      // If valid, perform the calculation and add the result to the new array.
      processedSegments.push(executeOperation(operandA, operandB, operatorSymbol));
    } else {
      // If not a valid calculation, push the elements back in reverse order of extraction
      // to maintain their relative order for the next iteration, if they exist.
      // This handles cases where the triplet is incomplete or contains non-numeric operands.
      if (typeof operatorSymbol !== 'undefined') processedSegments.push(operatorSymbol);
      if (typeof operandB !== 'undefined') processedSegments.push(operandB);
      if (typeof operandA !== 'undefined') processedSegments.push(operandA);
    }
  }

  // Recursively call the function with the reduced expression.
  processExpression(processedSegments);
}

// Initiate the expression processing with the initial parsed input.
processExpression(dataStream);
