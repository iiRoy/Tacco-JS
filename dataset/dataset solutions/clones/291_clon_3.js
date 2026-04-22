const fileSystemUtilities = require('fs');

// Define the source path for reading input expressions.
const inputSourceFilePath = '/dev/stdin';

/**
 * Parses a string value into a floating-point number.
 * If the parsing fails (results in NaN), it returns a default value of 0.0.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed number or 0.0 if invalid.
 */
function safelyParseNumericToken(inputString) {
    const potentialNumber = parseFloat(inputString);
    return isNaN(potentialNumber) ? 0.0 : potentialNumber;
}

// --- Main Program Execution Flow ---
try {
    // Synchronously read all content from the specified input file path.
    // Ensure the data is interpreted as UTF-8 text.
    const entireFileContent = fileSystemUtilities.readFileSync(inputSourceFilePath, 'utf8');

    // Perform an initial validation: check if the input content is empty or only whitespace.
    if (!entireFileContent || entireFileContent.trim().length === 0) {
        console.error("Error: No input data detected in the standard input stream.");
        // Terminate the process if no meaningful input is provided.
        process.exit(1);
    }

    // Split the entire content into an array of individual lines, using newline as the delimiter.
    const expressionLineArray = entireFileContent.split(/\n/);

    // Iterate over each line to process the RPN expression it contains.
    // 'currentLineIndex' keeps track of the line number for potential error reporting.
    for (let currentLineIndex = 0; currentLineIndex < expressionLineArray.length; currentLineIndex++) {
        const activeLineContent = expressionLineArray[currentLineIndex];

        // Skip processing if the current line is empty or consists only of whitespace.
        if (!activeLineContent || activeLineContent.trim().length === 0) {
            continue; // Move to the next line without processing.
        }

        // Break down the current line into an array of tokens (numbers or operators),
        // using one or more whitespace characters as separators.
        const lineTokens = activeLineContent.split(/\s+/);

        // Initialize a stack data structure, represented as an array, for RPN evaluation.
        const operandEvaluationStack = [];

        // Process each token in the current line's expression.
        for (const singleToken of lineTokens) {
            // Clean up the token by removing leading/trailing whitespace.
            const cleanedToken = singleToken.trim();

            // If the token becomes empty after trimming, skip it.
            if (cleanedToken.length === 0) {
                continue;
            }

            let firstOperand;  // Stores the first value popped from the stack (often 'A' in B op A)
            let secondOperand; // Stores the second value popped from the stack (often 'B' in B op A)
            let operationResult; // Holds the outcome of the arithmetic operation

            // Evaluate the token using a switch statement for operators.
            switch (cleanedToken) {
                case '+':
                    // Ensure sufficient operands exist for a binary operation.
                    if (operandEvaluationStack.length < 2) {
                        console.error(`Runtime Error (Line ${currentLineIndex + 1}): Insufficient operands for addition. Pushing 0.`);
                        operandEvaluationStack.push(0.0); // Push a default value to avoid further errors.
                        break;
                    }
                    firstOperand = operandEvaluationStack.pop();
                    secondOperand = operandEvaluationStack.pop();
                    operationResult = secondOperand + firstOperand;
                    operandEvaluationStack.push(operationResult);
                    break;

                case '-':
                    if (operandEvaluationStack.length < 2) {
                        console.error(`Runtime Error (Line ${currentLineIndex + 1}): Insufficient operands for subtraction. Pushing 0.`);
                        operandEvaluationStack.push(0.0);
                        break;
                    }
                    firstOperand = operandEvaluationStack.pop();
                    secondOperand = operandEvaluationStack.pop();
                    operationResult = secondOperand - firstOperand;
                    operandEvaluationStack.push(operationResult);
                    break;

                case '*':
                    if (operandEvaluationStack.length < 2) {
                        console.error(`Runtime Error (Line ${currentLineIndex + 1}): Insufficient operands for multiplication. Pushing 0.`);
                        operandEvaluationStack.push(0.0);
                        break;
                    }
                    firstOperand = operandEvaluationStack.pop();
                    secondOperand = operandEvaluationStack.pop();
                    operationResult = secondOperand * firstOperand;
                    operandEvaluationStack.push(operationResult);
                    break;

                case '/':
                    if (operandEvaluationStack.length < 2) {
                        console.error(`Runtime Error (Line ${currentLineIndex + 1}): Insufficient operands for division. Pushing 0.`);
                        operandEvaluationStack.push(0.0);
                        break;
                    }
                    firstOperand = operandEvaluationStack.pop();
                    secondOperand = operandEvaluationStack.pop();

                    // Implement a guard clause for division by zero.
                    if (firstOperand === 0) {
                        console.warn(`Warning (Line ${currentLineIndex + 1}): Attempted division by zero. Result set to 0.`);
                        operationResult = 0.0; // Handle division by zero gracefully.
                    } else {
                        operationResult = secondOperand / firstOperand;
                    }
                    operandEvaluationStack.push(operationResult);
                    break;

                default:
                    // If the token is not a recognized operator, treat it as a numeric operand.
                    const numericalValue = safelyParseNumericToken(cleanedToken);
                    operandEvaluationStack.push(numericalValue);
            }
        }

        // After all tokens in a line are processed, the result of the RPN expression
        // should be the sole element remaining on the stack.
        if (operandEvaluationStack.length === 0) {
            // If the stack is empty, it means the expression was malformed or resulted in no value.
            console.log("0.000000"); // Output a default value, consistent with original NaN handling.
        } else {
            // Retrieve the final calculated value from the top of the stack.
            const finalCalculatedResult = operandEvaluationStack[0];
            // Output the result formatted to exactly six decimal places.
            console.log(finalCalculatedResult.toFixed(6));
        }
    }
} catch (processingException) {
    // Catch and report any unexpected exceptions that occur during file I/O or processing.
    console.error(`An unhandled exception occurred during RPN evaluation: ${processingException.message}`);
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}