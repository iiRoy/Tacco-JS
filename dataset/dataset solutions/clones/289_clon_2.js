let inputData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from the standard input stream

let lineArray = inputData.trim().split("\n"); // Clean up input: remove leading/trailing whitespace, then split into an array of lines

// Begin processing each line as a separate Reverse Polish Notation (RPN) expression
while (true) {
    // If there are no more lines to process, terminate the loop
    if (lineArray.length === 0) {
        break;
    }

    // Extract the next expression line, then break it down into individual tokens (numbers or operators)
    let tokenList = lineArray.shift().split(" ");

    // Initialize a stack data structure to manage operands during evaluation
    let operandStack = [];

    // Iterate through each token within the current RPN expression
    tokenList.forEach(function(currentToken) {
        // Determine if the current token represents a numeric value
        if (/\d/.test(currentToken)) {
            // If it's a number, convert it to a numeric type and push it onto the operand stack
            operandStack.unshift(Number(currentToken));
        } else {
            // If the token is an operator, pop the necessary operands from the stack
            // The order of popping is crucial for correct RPN evaluation
            let operandA = operandStack.shift(); // This is the second operand in a binary operation
            let operandB = operandStack.shift(); // This is the first operand in a binary operation

            // Execute the appropriate arithmetic operation based on the operator token
            if (currentToken === "+") {
                operandStack.unshift(operandB + operandA); // Push the sum back onto the stack
            }
            if (currentToken === "-") {
                operandStack.unshift(operandB - operandA); // Push the difference back onto the stack
            }
            if (currentToken === "*") {
                operandStack.unshift(operandB * operandA); // Push the product back onto the stack
            }
            if (currentToken === "/") {
                operandStack.unshift(operandB / operandA); // Push the quotient back onto the stack
            }
        }
    });

    // After all tokens in a line have been processed, the final result should be the sole element on the stack.
    // Output this result, formatted to six decimal places, to the console.
    console.log(operandStack[0].toFixed(6));
}
