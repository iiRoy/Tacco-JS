process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (rawDataBuffer) => {
    // Split the incoming data buffer into individual lines,
    // filtering out any empty lines that might result from trailing newlines.
    const linesOfText = rawDataBuffer.split('\n').filter(line => line.trim() !== '');

    // Iterate over each non-empty line received from standard input.
    for (const currentLine of linesOfText) {
        // Attempt to evaluate the arithmetic expression present in the current line.
        const calculationOutcome = evaluateExpression(currentLine);

        // If the evaluation yields a valid numerical result (i.e., not 'false',
        // which signals an invalid expression or the special '?' operator),
        // then print this result to standard output.
        if (calculationOutcome !== false) {
            console.log(calculationOutcome);
        }
        // Expressions that return 'false' (e.g., malformed, unknown operator, '?')
        // are silently ignored as per the original logic.
    }
});

/**
 * Parses and evaluates a simple arithmetic expression provided as a string.
 * The expected format is "NUMBER OPERATOR NUMBER", where parts are space-separated.
 *
 * @param {string} expressionString - The input string containing the arithmetic expression.
 * @returns {number|boolean} The numerical result of the operation, or `false` if:
 *                           - The input string is empty or malformed.
 *                           - Operands are not valid numbers.
 *                           - The operator is unrecognized.
 *                           - Division by zero is attempted.
 *                           - The special '?' operator is encountered.
 */
function evaluateExpression(expressionString) {
    // Guard clause: Check for empty or whitespace-only input strings.
    if (!expressionString || expressionString.trim() === '') {
        return false;
    }

    // Split the expression string into its constituent parts.
    // Using a regex for split handles multiple spaces between components gracefully.
    const components = expressionString.trim().split(/\s+/);

    // Guard clause: Validate that exactly three components (operand1, operator, operand2) were found.
    if (components.length !== 3) {
        return false;
    }

    // Parse the numerical operands using parseFloat for robustness.
    const primaryOperand = parseFloat(components[0]);
    const operationSymbol = components[1];
    const secondaryOperand = parseFloat(components[2]);

    // Guard clause: Ensure both parsed operands are valid numbers.
    if (isNaN(primaryOperand) || isNaN(secondaryOperand)) {
        return false;
    }

    let finalResult; // This variable will hold the computed value before returning.

    // Use a switch statement to handle different arithmetic operations cleanly.
    switch (operationSymbol) {
        case '+':
            finalResult = primaryOperand + secondaryOperand;
            break;
        case '-':
            finalResult = primaryOperand - secondaryOperand;
            break;
        case '*':
            finalResult = primaryOperand * secondaryOperand;
            break;
        case '/':
            // Specific guard clause: Prevent division by zero.
            if (secondaryOperand === 0) {
                return false; // Indicate an invalid operation.
            }
            finalResult = primaryOperand / secondaryOperand;
            break;
        case '?':
            // Special case: The '?' operator explicitly means no calculation should be reported.
            return false;
        default:
            // Default case: Handle any operators that are not recognized.
            return false; // Indicate an unknown operation.
    }

    // If all checks pass and an operation was successfully performed, return the numerical result.
    return finalResult;
}