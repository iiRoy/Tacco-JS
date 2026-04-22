const fileSystemModule = require('fs'); // Import the standard Node.js file system module.

// Define the path for reading standard input, typically used in competitive programming.
const standardInputFile = '/dev/stdin';

/**
 * Determines if a given string can be reliably parsed into a finite number.
 * This helper function replaces the less explicit `+value == value` check.
 * @param {string} candidateString The string to check.
 * @returns {boolean} True if the string represents a finite number, false otherwise.
 */
const isNumericalToken = (candidateString) => {
    // Attempt to convert the string into a floating-point number.
    const parsedNumber = parseFloat(candidateString);
    // Check if the parsed value is a finite number (not NaN, not Infinity).
    return Number.isFinite(parsedNumber);
};

/**
 * Executes a specific arithmetic operation between two numerical operands.
 * This function replaces the use of `eval()` for safety and explicit control.
 * @param {number} leftValue The left-hand side operand.
 * @param {string} operatorSymbol The arithmetic operator (+, -, *, /).
 * @param {number} rightValue The right-hand side operand.
 * @returns {number} The result of the operation, or NaN if the operation is invalid (e.g., division by zero, unknown operator).
 */
const performCalculation = (leftValue, operatorSymbol, rightValue) => {
    // Explicitly ensure operands are numbers.
    const numLeft = Number(leftValue);
    const numRight = Number(rightValue);

    // Use a switch statement to handle different operators.
    switch (operatorSymbol) {
        case '+':
            return numLeft + numRight;
        case '-':
            return numLeft - numRight;
        case '*':
            return numLeft * numRight;
        case '/':
            // Implement a guard clause for division by zero.
            if (numRight === 0) {
                // Log an error and return NaN to indicate a problematic result.
                console.error("Runtime Error: Attempted division by zero.");
                return NaN;
            }
            return numLeft / numRight;
        default:
            // Handle unrecognized operators.
            console.error(`Runtime Error: Unrecognized operator symbol encountered: '${operatorSymbol}'.`);
            return NaN;
    }
};

// --- Main Program Execution Flow ---

// Read the entire content from the standard input file, decode as UTF-8, and trim leading/trailing whitespace.
const fullInputContent = fileSystemModule.readFileSync(standardInputFile, 'utf8').trim();

// If the input content is empty after trimming, there's nothing to process.
// This is an added validation step (Type III modification).
if (fullInputContent.length === 0) {
    // console.log("Input data is empty. No expressions to evaluate.");
    // In this scenario, we just exit without further processing.
    // If we wanted to output something, we could do: console.log("No input.");
    return; // Exits the script if run as a module, or function if wrapped.
}

// Split the input into an array of individual expression strings.
// `filter(Boolean)` is used to remove any empty strings that might result from multiple newlines.
const expressionStrings = fullInputContent.split('\n').filter(Boolean);

// Iterate through each expression string to evaluate it as a Reverse Polish Notation (RPN) expression.
for (let currentLineIndex = 0; currentLineIndex < expressionStrings.length; ++currentLineIndex) {
    const activeExpressionLine = expressionStrings[currentLineIndex];

    // Trim whitespace from the current line and skip if it's entirely empty.
    const sanitizedExpression = activeExpressionLine.trim();
    if (!sanitizedExpression) {
        // console.log(`Skipping empty or whitespace-only line at index ${currentLineIndex}.`);
        continue; // Move to the next line.
    }

    // Split the sanitized expression into individual tokens (numbers or operators).
    // `/\s+/` matches one or more whitespace characters as delimiters.
    const expressionTokens = sanitizedExpression.split(/\s+/);

    // Initialize a stack for operands for the current RPN evaluation.
    const operationStack = [];

    // Process each token in the current RPN expression.
    for (let tokenPosition = 0; tokenPosition < expressionTokens.length; ++tokenPosition) {
        const currentItem = expressionTokens[tokenPosition];

        // Check if the current item is a numerical value.
        if (isNumericalToken(currentItem)) {
            // If it's a number, convert it to a float and push onto the stack.
            operationStack.push(parseFloat(currentItem));
        } else {
            // If it's not a number, it must be an operator.
            // Add a guard clause: An operator requires at least two operands on the stack.
            if (operationStack.length < 2) {
                console.error(`Evaluation Error: Insufficient operands for operator '${currentItem}' on line ${currentLineIndex + 1}.`);
                // Clear the stack to signal an error state for this line.
                operationStack.length = 0;
                break; // Stop processing this malformed line.
            }

            // Pop the two most recent operands from the stack.
            // In RPN, the first popped is the right operand, the second popped is the left operand.
            const operandRight = operationStack.pop(); // Corresponds to 'a' in original
            const operandLeft = operationStack.pop();  // Corresponds to 'b' in original

            // Execute the operation using the dedicated helper function.
            const calculatedResult = performCalculation(operandLeft, currentItem, operandRight);

            // Check if the operation resulted in an error (e.g., NaN from division by zero or unknown operator).
            if (Number.isNaN(calculatedResult)) {
                console.error(`Evaluation Error: Invalid calculation result for '${operandLeft} ${currentItem} ${operandRight}' on line ${currentLineIndex + 1}.`);
                // Clear the stack to indicate an error.
                operationStack.length = 0;
                break; // Stop processing this malformed line.
            }

            // Push the result of the operation back onto the stack.
            operationStack.push(calculatedResult);
        }
    }

    // After processing all tokens for the current line:
    // A correctly formed RPN expression should have exactly one numerical result remaining on the stack.
    if (operationStack.length === 1) {
        const finalComputedValue = operationStack.pop();
        // Output the final result, formatted to six decimal places.
        // Ensure it's treated as a Number before calling toFixed.
        console.log(Number(finalComputedValue).toFixed(6));
    } else if (operationStack.length > 1) {
        // This indicates a malformed expression where too many operands were left.
        console.error(`Evaluation Error: Too many operands remaining on stack for line ${currentLineIndex + 1}. Stack content: [${operationStack.join(', ')}]`);
        console.log("Error"); // Indicate an error state in output.
    } else { // operationStack.length is 0, implying an error occurred or the line was empty/invalid.
        // Error messages would have been printed by earlier guard clauses if applicable.
        console.log("Error"); // Generic error output for invalid expressions.
    }
}