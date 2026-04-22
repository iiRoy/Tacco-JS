process.stdin.resume();
process.stdin.setEncoding('utf8');

// This robust module processes arithmetic expressions provided via standard input.
// It expects input in the format: "OPERAND1 OPERAND2 OPERATION_SYMBOL" (e.g., "10 5 +").
// The script will output the computed result or an error message for invalid inputs.

process.stdin.on('data', (inputBuffer) => {
    // Trim whitespace and split the raw input string into individual components.
    const rawExpressionString = inputBuffer.toString().trim();

    // Early exit for empty input to prevent further processing errors.
    if (!rawExpressionString) {
        console.error("Input processing error: Received an empty data chunk. Please provide a valid expression.");
        return;
    }

    // Split the input string by one or more whitespace characters.
    const expressionComponents = rawExpressionString.split(/\s+/);

    // Validate the number of components. We strictly expect two operands and one operator.
    const EXPECTED_COMPONENT_COUNT = 3;
    if (expressionComponents.length !== EXPECTED_COMPONENT_COUNT) {
        console.error(`Input processing error: Expected ${EXPECTED_COMPONENT_COUNT} components (operand1, operand2, operator) but found ${expressionComponents.length}. Input was: "${rawExpressionString}"`);
        return;
    }

    // Extract raw string values for operands and the operation symbol.
    const firstOperandString = expressionComponents[0];
    const secondOperandString = expressionComponents[1];
    const mathematicalOperator = expressionComponents[2];

    // Attempt to convert operand strings to numbers.
    // Using Number() for flexible parsing, but will check for NaN.
    const numericalOperandA = Number(firstOperandString);
    const numericalOperandB = Number(secondOperandString);

    // Validate that both operands are indeed valid numbers.
    if (isNaN(numericalOperandA) || isNaN(numericalOperandB)) {
        console.error(`Input validation error: One or both operands are not valid numbers. Received "${firstOperandString}" and "${secondOperandString}".`);
        return;
    }

    let calculationOutcome; // Variable to store the result of the arithmetic operation.
    let isCalculationSuccessful = true; // Flag to track if the operation was handled without errors.

    // Use a switch statement for cleaner operator handling compared to a long if-else chain.
    switch (mathematicalOperator) {
        case '+':
            calculationOutcome = numericalOperandA + numericalOperandB;
            break;
        case '-':
            calculationOutcome = numericalOperandA - numericalOperandB;
            break;
        case '*':
            calculationOutcome = numericalOperandA * numericalOperandB;
            break;
        case '/':
            // Implement a guard clause for division by zero.
            if (numericalOperandB === 0) {
                console.error("Arithmetic error: Division by zero is prohibited. Please provide a non-zero divisor.");
                isCalculationSuccessful = false;
            } else {
                // Ensure integer division as per original code's Math.floor.
                calculationOutcome = Math.floor(numericalOperandA / numericalOperandB);
            }
            break;
        default:
            // Handle unsupported or unknown operators.
            console.error(`Operation error: The operator "${mathematicalOperator}" is not supported by this calculator.`);
            isCalculationSuccessful = false;
    }

    // Output the result only if the calculation was performed successfully.
    if (isCalculationSuccessful) {
        console.log(`Calculation: ${numericalOperandA} ${mathematicalOperator} ${numericalOperandB} = ${calculationOutcome}`);
    }
});

// Add an 'end' event listener to signal when the input stream has closed.
process.stdin.on('end', () => {
    console.log("Input stream concluded. Arithmetic processing session terminated.");
});