const fileSystemModule = require('fs');

// Define the source path for standard input.
const standardInputLocation = '/dev/stdin';

let entireInputContent = '';
try {
    // Attempt to synchronously read the entire content of the standard input.
    // Specifying 'utf8' encoding ensures proper string handling.
    entireInputContent = fileSystemModule.readFileSync(standardInputLocation, 'utf8');
} catch (readError) {
    // If there's an issue reading the file (e.g., file not found, permissions),
    // log the error and terminate the process.
    console.error(`Error reading input source: ${readError.message}`);
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}

// Process the raw input content into an array of individual RPN expressions.
// First, split by newline characters.
// Then, trim any leading/trailing whitespace from each line.
// Finally, filter out any lines that are empty after trimming.
const rpnExpressionList = entireInputContent
    .split('\n')
    .map(lineContent => lineContent.trim())
    .filter(trimmedLine => trimmedLine.length > 0);

// Iterate over each RPN expression string in the processed list.
for (const currentExpressionLine of rpnExpressionList) {
    // If for some reason an empty line slipped through, skip it.
    if (!currentExpressionLine) {
        continue;
    }

    // Tokenize the current RPN expression string into its constituent parts (numbers or operators).
    // Split by spaces, and then filter out any empty strings that might result from multiple spaces.
    const expressionTokens = currentExpressionLine
        .split(' ')
        .filter(token => token.length > 0);

    // Initialize an empty array to serve as the operand stack for the current calculation.
    // We'll use `push` for adding and `pop` for removing, treating the end of the array as the top of the stack.
    const calculationStack = [];

    // Process each token within the current RPN expression.
    for (const expressionElement of expressionTokens) {
        // Attempt to convert the current token to a floating-point number.
        const numericalValue = parseFloat(expressionElement);

        // Check if the conversion resulted in a valid number (i.e., not NaN).
        if (!isNaN(numericalValue)) {
            // If it's a number, push it onto the calculation stack.
            calculationStack.push(numericalValue);
        } else {
            // If it's not a number, it must be an operator.
            // For binary operations, we need at least two operands on the stack.
            if (calculationStack.length < 2) {
                console.error(`Syntax Error: Insufficient operands for operator '${expressionElement}' in '${currentExpressionLine}'. Skipping.`);
                // Clear stack and break from inner loop if expression is malformed
                calculationStack.length = 0;
                break;
            }

            // Pop the two top operands from the stack.
            // `operandOne` is the most recently pushed (right operand in `B op A`).
            // `operandTwo` is the one before it (left operand in `B op A`).
            const operandOne = calculationStack.pop();
            const operandTwo = calculationStack.pop();

            let outcome; // Variable to store the result of the operation.

            // Use a switch statement for clear and efficient handling of different operators.
            switch (expressionElement) {
                case '+':
                    outcome = operandTwo + operandOne;
                    break;
                case '-':
                    outcome = operandTwo - operandOne;
                    break;
                case '*':
                    outcome = operandTwo * operandOne;
                    break;
                case '/':
                    // Implement a guard against division by zero to prevent errors.
                    if (operandOne === 0) {
                        console.error(`Runtime Error: Division by zero detected in '${currentExpressionLine}'.`);
                        outcome = NaN; // Indicate an invalid result.
                    } else {
                        outcome = operandTwo / operandOne;
                    }
                    break;
                default:
                    // Handle any unrecognized operators.
                    console.error(`Syntax Error: Unknown operator '${expressionElement}' in '${currentExpressionLine}'.`);
                    outcome = NaN; // Indicate an invalid result.
            }

            // If the operation resulted in a valid number, push it back onto the stack.
            // If it's NaN (due to error), we might skip pushing it or push NaN itself.
            // Pushing NaN allows the final check to catch it.
            calculationStack.push(outcome);
        }
    }

    // After processing all tokens for an expression, the stack should ideally contain
    // exactly one valid number, which is the final result.
    if (calculationStack.length === 1 && !isNaN(calculationStack[0])) {
        // Output the final computed result, formatted to six decimal places.
        console.log(calculationStack[0].toFixed(6));
    } else {
        // Handle cases where the expression was malformed or resulted in an error.
        if (calculationStack.length === 0) {
            console.error(`Processing Error: No result on stack for '${currentExpressionLine}'.`);
        } else if (calculationStack.length > 1) {
            console.error(`Processing Error: Stack not empty after '${currentExpressionLine}'. Remaining items: ${calculationStack.join(', ')}.`);
        } else if (isNaN(calculationStack[0])) {
            console.error(`Processing Error: Invalid numerical result for '${currentExpressionLine}'.`);
        }
        // In error cases, we might output a specific error message or nothing,
        // depending on desired behavior. For this clone, we'll just log errors.
    }
}