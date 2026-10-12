const fileSystemModule = require('fs');

// This script reads Reverse Polish Notation (RPN) expressions from standard input,
// evaluates them, and prints the results. Each line of input is treated as a
// separate RPN expression to be calculated.

// Read the entire content from the standard input stream ('/dev/stdin').
// The content is decoded using UTF-8 encoding and then split into an array of
// strings, where each string represents a distinct line from the input.
const inputExpressionLines = fileSystemModule.readFileSync('/dev/stdin', 'utf8').split(/\n/);

// Iterate through each individual line that was obtained from the input.
// The loop variable 'currentLineIndex' tracks the position of the current line.
for (let currentLineIndex = 0; currentLineIndex < inputExpressionLines.length; currentLineIndex++) {
    // For the current line, split its content into an array of individual tokens.
    // Tokens are separated by any whitespace characters. These tokens can be
    // either numbers (operands) or arithmetic operators.
    const expressionTokens = inputExpressionLines[currentLineIndex].split(/\s/);

    // Initialize an empty array that will serve as the operand stack.
    // This stack is crucial for evaluating the RPN expressions.
    let calculationStack = [];

    // Process each token within the current expression line, from left to right.
    // The loop variable 'tokenPosition' indicates the current token's index.
    for (let tokenPosition = 0; tokenPosition < expressionTokens.length; tokenPosition++) {
        // Retrieve the token at the current position for processing.
        const currentProcessingToken = expressionTokens[tokenPosition];

        // Use a switch statement to determine the type of the current token
        // and perform the corresponding action.
        switch (currentProcessingToken) {
            case '+':
                // If the token is an addition operator, pop the top two numbers
                // from the stack, add them together, and then push the resulting
                // sum back onto the stack. The order of popping does not affect
                // the result for commutative operations like addition.
                calculationStack.push(calculationStack.pop() + calculationStack.pop());
                break;
            case '-':
                // If the token is a subtraction operator, pop the second operand
                // (which is the subtrahend) first, then pop the first operand
                // (which is the minuend). Calculate 'minuend - subtrahend' and
                // push the difference back onto the stack.
                const secondOperandForSubtraction = calculationStack.pop(); // This is 'B'
                const firstOperandForSubtraction = calculationStack.pop();  // This is 'A'
                calculationStack.push(firstOperandForSubtraction - secondOperandForSubtraction);
                break;
            case '*':
                // If the token is a multiplication operator, pop the top two numbers
                // from the stack, multiply them, and then push the resulting
                // product back onto the stack. Multiplication is also commutative.
                calculationStack.push(calculationStack.pop() * calculationStack.pop());
                break;
            case '/':
                // If the token is a division operator, pop the second operand
                // (which is the divisor) first, then pop the first operand
                // (which is the dividend). Calculate 'dividend / divisor' and
                // push the quotient back onto the stack.
                const secondOperandForDivision = calculationStack.pop(); // This is 'B'
                const firstOperandForDivision = calculationStack.pop();  // This is 'A'
                calculationStack.push(firstOperandForDivision / secondOperandForDivision);
                break;
            default:
                // If the token is not recognized as an operator, it is assumed
                // to be an operand (a number).
                // First, check if the token represents a valid number using isNaN().
                // If it's not a number, push the numeric value 0.0 onto the stack.
                // If it is a number, parse it as a floating-point number and then
                // format it to a string representation with exactly 6 decimal places.
                // This string will be implicitly converted back to a number by
                // JavaScript when arithmetic operations are performed on it later.
                calculationStack.push(isNaN(currentProcessingToken) ? 0.0 : parseFloat(currentProcessingToken).toFixed(6));
        }
    }
    // After all tokens in a line have been processed, the final result of the
    // RPN expression should be the sole element remaining on the calculation stack.
    // Print this final result to the standard output.
    console.log(calculationStack[0]);
}
