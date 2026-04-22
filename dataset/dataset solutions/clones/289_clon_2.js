/*
 * This program reads a series of Reverse Polish Notation (RPN) expressions
 * from standard input, evaluates each one, and prints the result.
 */

// Acquire the 'fs' module for file system operations.
var   fileSystemModule  = require('fs');

// Read all incoming raw data from the standard input stream,
// interpreting it as UTF-8 encoded text.
var   sourceContent   = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input:
// 1. Remove leading/trailing whitespace.
// 2. Split the content into an array of individual lines,
//    each representing a distinct RPN expression.
var   expressionList  = sourceContent.trim().split("\n");


// Commence an infinite processing loop.
// Each iteration handles one RPN expression from the input.
for (;;) {

    // If there are no more expressions to evaluate, terminate the loop.
    if (expressionList.length === 0)
    {
        break;
    }


    // Extract the next RPN expression line from the list.
    // Then, break it down into an array of individual tokens (numbers or operators).
    var   rpnTokens   = expressionList.shift().split(" ");


    // Initialize an empty stack to hold operands and intermediate results
    // during the RPN evaluation process.
    var   calculationStack  = [];


    // Iterate through each token in the current RPN expression.
    rpnTokens.forEach(function (tokenUnit) {

        /*
         * Check if the current token represents a numeric value.
         * Using parseFloat and checking for NaN is a robust way to identify numbers.
         */
        if ( ! isNaN( parseFloat(tokenUnit) ) ) {
            // If it's a number, convert it to a floating-point number
            // and push it onto the top of our calculation stack.
            calculationStack.unshift(parseFloat(tokenUnit));
        } else {
            // If the token is not a number, it must be an operator.
            // Pop the two topmost operands from the stack.
            // Note: RPN operations typically use the first popped as the second operand.
            var   firstValue  = calculationStack.shift();
            var   secondValue = calculationStack.shift();

            // Perform the arithmetic operation based on the operator token.
            // Push the result back onto the stack.
            if (tokenUnit === "+") {
                calculationStack.unshift(secondValue + firstValue);
            }
            if (tokenUnit === "-") {
                calculationStack.unshift(secondValue - firstValue);
            }
            if (tokenUnit === "*") {
                calculationStack.unshift(secondValue * firstValue);
            }
            if (tokenUnit === "/") {
                calculationStack.unshift(secondValue / firstValue);
            }
        }
    });

    // After processing all tokens in an expression,
    // the final result should be the only item remaining on the stack.
    // Print this result, formatted to six decimal places.
    console.log(calculationStack[0].toFixed(6));
}