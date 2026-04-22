const fileSystemHandler = require('fs'); // Import the Node.js file system module for input operations

// Define constants for various configurable aspects of the script.
const standardInputFilePath = '/dev/stdin'; // Path to the standard input stream
const expressionTokenSeparator = /\s+/;    // Regular expression to split tokens by one or more whitespace characters
const outputDecimalPrecision = 6;         // The number of decimal places to fix numeric results to

// A dynamic array to accumulate the final computed result for each input line.
const collectedEvaluationOutcomes = [];

/**
 * Safely extracts an operand from the provided stack.
 * If the stack is empty, it returns 0, mimicking the original behavior
 * where popping from an empty stack results in `undefined`, which
 * often coerces to `NaN` in arithmetic operations, or `0` in some contexts.
 * This explicit handling prevents runtime errors and provides a consistent default.
 * @param {Array<number>} operandPile The stack (array) from which to pop an operand.
 * @returns {number} The popped numeric operand, or 0 if the stack was empty.
 */
function safelyRetrieveOperand(operandPile) {
    // Check if the stack has any elements before attempting to pop.
    if (operandPile.length === 0) {
        // In a more robust application, one might throw an error or log a warning.
        // For this clone, returning 0 aligns with implicit type coercion behavior of the original.
        return 0;
    }
    return operandPile.pop();
}

try {
    // Read the entire content from the specified input file path synchronously.
    // Decode the buffer into a UTF-8 string, then split it into an array of lines.
    // Filter out any lines that are empty or contain only whitespace to ensure valid expressions.
    const rawInputExpressionLines = fileSystemHandler.readFileSync(standardInputFilePath, 'utf8')
                                                .split('\n')
                                                .filter(lineContent => lineContent.trim().length > 0);

    // Proceed only if there are valid expression lines to process.
    if (rawInputExpressionLines.length > 0) {
        // Iterate over each distinct expression line obtained from the input.
        for (const currentExpressionString of rawInputExpressionLines) {
            // Initialize an empty array to serve as the RPN evaluation stack for the current line.
            const rpnComputationStack = [];

            // Split the current expression line into individual tokens (numbers or operators).
            // The `filter(Boolean)` removes any empty strings that might result from `split`
            // if there are multiple spaces between tokens.
            const tokensForCurrentExpression = currentExpressionString.split(expressionTokenSeparator).filter(Boolean);

            // Process each token within the current expression.
            for (const currentTokenSymbol of tokensForCurrentExpression) {
                let firstPoppedValue, secondPoppedValue, operationResultValue;

                // A switch statement to determine the action based on the current token.
                switch (currentTokenSymbol) {
                    case '+':
                        // For addition, pop two operands, add them, and push the sum back.
                        firstPoppedValue = safelyRetrieveOperand(rpnComputationStack);
                        secondPoppedValue = safelyRetrieveOperand(rpnComputationStack);
                        operationResultValue = secondPoppedValue + firstPoppedValue;
                        rpnComputationStack.push(operationResultValue);
                        break;

                    case '-':
                        // For subtraction, pop two operands, subtract the first from the second, and push the difference.
                        firstPoppedValue = safelyRetrieveOperand(rpnComputationStack);
                        secondPoppedValue = safelyRetrieveOperand(rpnComputationStack);
                        operationResultValue = secondPoppedValue - firstPoppedValue;
                        rpnComputationStack.push(operationResultValue);
                        break;

                    case '*':
                        // For multiplication, pop two operands, multiply them, and push the product.
                        firstPoppedValue = safelyRetrieveOperand(rpnComputationStack);
                        secondPoppedValue = safelyRetrieveOperand(rpnComputationStack);
                        operationResultValue = secondPoppedValue * firstPoppedValue;
                        rpnComputationStack.push(operationResultValue);
                        break;

                    case '/':
                        // For division, pop two operands. The first popped is the divisor, the second is the dividend.
                        firstPoppedValue = safelyRetrieveOperand(rpnComputationStack);  // This becomes the divisor
                        secondPoppedValue = safelyRetrieveOperand(rpnComputationStack); // This becomes the dividend

                        // Implement a guard clause to prevent division by zero errors.
                        if (firstPoppedValue === 0) {
                            // If dividing by zero, the result is either Infinity (non-zero dividend) or NaN (zero dividend).
                            // This behavior aligns with standard JavaScript arithmetic.
                            operationResultValue = (secondPoppedValue === 0) ? NaN : Infinity;
                        } else {
                            operationResultValue = secondPoppedValue / firstPoppedValue;
                        }
                        rpnComputationStack.push(operationResultValue);
                        break;

                    default:
                        // If the token is not an operator, attempt to parse it as a floating-point number.
                        const parsedNumericValue = parseFloat(currentTokenSymbol);

                        // Check if the parsing resulted in a valid number.
                        if (Number.isNaN(parsedNumericValue)) {
                            // If not a number, push 0 as a default, consistent with some implicit RPN implementations.
                            rpnComputationStack.push(0);
                        } else {
                            // Format the number to the specified decimal precision and then re-parse it
                            // to ensure it's stored as a number, not a string, for future calculations.
                            rpnComputationStack.push(parseFloat(parsedNumericValue.toFixed(outputDecimalPrecision)));
                        }
                        break;
                }
            }
            // After processing all tokens for a line, the final result should be the sole element on the stack.
            // If the stack is unexpectedly empty, push 0 to `collectedEvaluationOutcomes` to indicate no result.
            collectedEvaluationOutcomes.push(rpnComputationStack.length > 0 ? rpnComputationStack[0] : 0);
        }
    }
} catch (fileReadingError) {
    // Catch and handle potential errors that might occur during file system operations
    // (e.g., file not found, permission issues, invalid path).
    // In a real application, one might log this error or exit more gracefully.
    // For cloning purposes, we add NaN to results to indicate a failure for the input source.
    collectedEvaluationOutcomes.push(NaN);
}

// Iterate through the array of collected results and print each one to the console.
// This approach allows for collecting all results first, then printing them,
// which can be useful for batch processing or modifying output order.
collectedEvaluationOutcomes.forEach(singleComputationResult => {
    // Ensure the output is a number and handle special numeric values like NaN explicitly.
    if (typeof singleComputationResult === 'number' && !Number.isNaN(singleComputationResult)) {
        console.log(singleComputationResult);
    } else if (Number.isNaN(singleComputationResult)) {
        console.log("NaN"); // Explicitly show "NaN" for Not-a-Number results.
    } else {
        console.log(0); // A fallback for any unexpected result types, defaulting to 0.
    }
});