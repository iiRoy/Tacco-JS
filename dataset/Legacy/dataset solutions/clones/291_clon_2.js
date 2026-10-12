let inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/); // Read all input from stdin, decode as UTF-8, and split into an array of lines.

// Iterate through each line of input.
for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
    // Split the current line into individual tokens based on whitespace.
    let currentTokens = inputLines[lineIndex].split(/\s/);

    // Initialize an empty array to serve as our operand stack for RPN evaluation.
    let operandStack = [];

    // Process each token in the current line.
    for (let tokenIndex = 0; tokenIndex < currentTokens.length; tokenIndex++) {
        let currentToken = currentTokens[tokenIndex]; // Get the current token.

        // Evaluate the token to determine if it's an operator or an operand.
        switch (currentToken) {
            case '+':
                // Pop two operands, add them, and push the result back onto the stack.
                operandStack.push(operandStack.pop() + operandStack.pop());
                break;
            case '-':
                // Pop two operands (b, a), perform a - b, and push the result.
                // The order of pop() matters for subtraction: second pop is 'a', first pop is 'b'.
                // So, -b + a effectively calculates a - b.
                operandStack.push(-operandStack.pop() + operandStack.pop());
                break;
            case '*':
                // Pop two operands, multiply them, and push the result.
                operandStack.push(operandStack.pop() * operandStack.pop());
                break;
            case '/':
                // Pop two operands (b, a), perform a / b, and push the result.
                // The order of pop() matters for division: second pop is 'a', first pop is 'b'.
                // So, (1/b) * a effectively calculates a / b.
                operandStack.push(1.0 / operandStack.pop() * operandStack.pop());
                break;
            default:
                // If the token is not an operator, attempt to parse it as a floating-point number.
                // If parsing results in NaN (Not a Number), push 0.0 onto the stack; otherwise, push the parsed number.
                operandStack.push(isNaN(currentToken) ? 0.0 : parseFloat(currentToken));
        }
    }

    // After processing all tokens in a line, the result of the RPN expression should be the only element on the stack.
    // Print this result, formatted to six decimal places.
    console.log(operandStack[0].toFixed(6));
}
