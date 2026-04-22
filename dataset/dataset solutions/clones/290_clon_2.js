/* This module reads input from standard input to process
 * a series of reverse polish notation (RPN) expressions. */
var programInput = require('fs').readFileSync('/dev/stdin', 'utf8')
                                .trim(); // Read all input and remove leading/trailing whitespace

// Split the entire input into individual lines, each representing an RPN expression
var inputSegments = programInput.split('\n');

var currentSegment; // Declare variable to hold the current line being processed

// Loop through each line of input until no more lines are available
while (currentSegment = inputSegments.shift()) {

  // Parse the current line into individual components (operands or operators)
  // by trimming whitespace and splitting by one or more spaces
  var expressionComponents = currentSegment.trim()
                                           .split(/ +/);

  var operandStore = []; // Initialize an empty stack to store operands during evaluation

  // Process each component of the RPN expression
  while (expressionComponents.length > 0) {

    var currentElement = expressionComponents.shift(); // Get the next component from the front of the list

    // Check if the current element can be interpreted as a number
    if (Number(currentElement) == currentElement) {
      operandStore.push(currentElement); // If it's a number, push it onto the operand stack
    }
    else {
      // If it's not a number, it must be an operator.
      // Pop the last two operands from the stack (order is important for non-commutative ops)
      var firstOperand = operandStore.pop();
      var secondOperand = operandStore.pop();

      // Construct and evaluate the expression using the two operands and the operator
      // Push the result back onto the operand stack
      operandStore.push(eval(secondOperand + currentElement + firstOperand));
    }
  }

  // After processing all components of the expression, the final result is the only item left on the stack
  // Print the result formatted to 6 decimal places
  console.log(operandStore.pop().toFixed(6));
}