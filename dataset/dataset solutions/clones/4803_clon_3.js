// This function is designed to process a single line of input representing a simple
// arithmetic expression, then calculate and display the result.
// It aims for robustness by handling various input formats and performing validations.
function performSimpleCalculation(rawExpressionString) {
    // Step 1: Pre-process the incoming expression string.
    // We first remove any leading/trailing whitespace and then split the string
    // into individual tokens (numbers and operator) using one or more spaces as delimiters.
    // This approach allows for multi-digit numbers and flexible spacing.
    const expressionTokens = rawExpressionString.trim().split(/\s+/);

    // Step 2: Validate the structural integrity of the parsed expression.
    // A valid expression for this calculator is expected to consist of exactly three parts:
    // the first operand, the operator, and the second operand.
    if (expressionTokens.length !== 3) {
        // If the token count is incorrect, it indicates an improperly formatted expression.
        console.error("Input format error: Expected 'number operator number'. Please check your expression.");
        return; // Terminate execution as we cannot proceed with invalid input.
    }

    // Step 3: Extract and convert the numerical operands.
    // We use parseInt() with a radix of 10 to ensure proper conversion from string to integer.
    const firstNumericValue = parseInt(expressionTokens[0], 10);
    const operatorSymbol = expressionTokens[1]; // The operator is directly taken as a string.
    const secondNumericValue = parseInt(expressionTokens[2], 10);

    // Step 4: Validate that the extracted operands are indeed valid numbers.
    // The isNaN() function checks if a value is 'Not-a-Number'.
    if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
        // If either operand fails to convert into a valid number, report an error.
        console.error("Data type error: One or both operands provided are not valid numerical values.");
        return; // Terminate execution.
    }

    let computationOutcome = 0; // Initialize a variable to store the final result of the calculation.
    let operationSuccessfullyExecuted = true; // A flag to track if a recognized operation was performed.

    // Step 5: Perform the arithmetic operation based on the identified operator.
    // A switch statement provides a clean and extensible way to handle different operators.
    switch (operatorSymbol) {
        case '+':
            // Execute addition.
            computationOutcome = firstNumericValue + secondNumericValue;
            break;
        case '-':
            // Execute subtraction.
            computationOutcome = firstNumericValue - secondNumericValue;
            break;
        // Future enhancements could include 'case '*':', 'case '/':', etc.
        default:
            // If the operator does not match any known cases, it's considered unsupported.
            console.error(`Operator error: The operator '${operatorSymbol}' is currently not supported.`);
            operationSuccessfullyExecuted = false; // Mark that no valid operation occurred.
            break;
    }

    // Step 6: Output the calculation result if the operation was successful.
    // This conditional ensures that output is only produced for valid calculations.
    if (operationSuccessfullyExecuted) {
        console.log(computationOutcome);
    }
}

// This block simulates the typical input mechanism for command-line applications
// or online judges. It reads all data from the standard input stream ('/dev/stdin'),
// converts it to a UTF-8 string, and then passes this string to our main processing function.
performSimpleCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));