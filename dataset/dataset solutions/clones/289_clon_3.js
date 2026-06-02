const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';

const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
let expressionLines = rawInputContent.trim().split("\n");

while (expressionLines.length > 0) {
    const currentLineString = expressionLines.shift();
    const currentLineTokens = currentLineString.split(" ");
    const calculationStack = [];

    currentLineTokens.forEach(function(currentToken) {
        // Check if the token contains at least one digit, indicating it's a number.
        // This matches the original's regex-based number detection.
        if (/\d/.test(currentToken)) {
            // Convert the token to a number. parseFloat handles integers and decimals.
            // This is equivalent to the original's 'v-0' for valid numeric strings.
            calculationStack.unshift(parseFloat(currentToken));
        } else {
            // It's an operator. Pop the two most recent operands.
            // The order of popping is crucial for RPN: first popped is 'a', second is 'b'
            // for operations like 'b op a'.
            const firstOperand = calculationStack.shift();
            const secondOperand = calculationStack.shift();

            let intermediateResult;
            // Use a switch statement for clarity and structure, replacing the if-else chain.
            switch (currentToken) {
                case "+":
                    intermediateResult = secondOperand + firstOperand;
                    break;
                case "-":
                    intermediateResult = secondOperand - firstOperand;
                    break;
                case "*":
                    intermediateResult = secondOperand * firstOperand;
                    break;
                case "/":
                    intermediateResult = secondOperand / firstOperand;
                    break;
                // No default case is needed, as the original code implicitly assumes valid operators
                // and does not handle unknown tokens explicitly.
            }
            // Push the result of the operation back onto the stack.
            calculationStack.unshift(intermediateResult);
        }
    });
    // After processing all tokens in a line, the final result is the only element left on the stack.
    // Format it to 6 decimal places as per the original requirement.
    console.log(calculationStack[0].toFixed(6));
}
