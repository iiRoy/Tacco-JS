const retrieveAndCompute = (rawInputLine) => {
    // This function processes a single textual line, expecting it to represent a basic arithmetic expression.
    // It is designed to handle addition and subtraction operations.
    // Expected format: "NUMBER OPERATOR NUMBER" (e.g., "15 + 7" or "30 - 12").

    // Initial validation: Ensure the input string is not empty or malformed.
    if (!rawInputLine || typeof rawInputLine !== 'string' || rawInputLine.trim().length === 0) {
        console.error("Error: The provided input string is either empty, null, or not a valid string type.");
        return; // Terminate execution if input is invalid.
    }

    // Split the input string into its constituent parts based on whitespace.
    // Using a regex for split handles multiple spaces between components gracefully.
    const expressionTokens = rawInputLine.trim().split(/\s+/);

    // Validate the number of tokens obtained. A valid expression should have exactly three tokens.
    const requiredTokenCount = 3;
    if (expressionTokens.length !== requiredTokenCount) {
        console.error(`Error: Expected exactly ${requiredTokenCount} tokens (operand1 operator operand2), but found ${expressionTokens.length}. Input was: '${rawInputLine}'`);
        return;
    }

    // Declare variables to store the parsed numeric values and the arithmetic operator.
    let firstOperandValue;
    let secondOperandValue;
    const arithmeticOperator = expressionTokens[1]; // The operator is expected to be the second token.
    let computedResult; // This variable will hold the final outcome of the calculation.

    // Helper function for robust integer parsing with error checking.
    const parseIntegerSafely = (numericString, contextMessage) => {
        const parsedNumber = Number.parseInt(numericString.trim(), 10);
        if (Number.isNaN(parsedNumber)) {
            // If parsing fails, throw an error with specific context.
            throw new Error(`Failed to parse numeric value: '${numericString}'. ${contextMessage}`);
        }
        return parsedNumber;
    };

    try {
        // Attempt to parse the first and third tokens as integers.
        firstOperandValue = parseIntegerSafely(expressionTokens[0], "Check the first number in your expression.");
        secondOperandValue = parseIntegerSafely(expressionTokens[2], "Check the second number in your expression.");

    } catch (parsingException) {
        // Catch and report any errors that occur during the numeric parsing phase.
        console.error(`An error occurred during operand parsing: ${parsingException.message}`);
        return; // Halt if operands cannot be correctly processed.
    }

    // Perform the arithmetic operation based on the identified operator symbol.
    if (arithmeticOperator === "+") {
        // If the operator is '+', perform addition.
        computedResult = firstOperandValue + secondOperandValue;
    } else if (arithmeticOperator === "-") {
        // If the operator is '-', perform subtraction.
        computedResult = firstOperandValue - secondOperandValue;
    } else {
        // If the operator is neither '+' nor '-', it's considered invalid.
        console.error(`Error: The operator '${arithmeticOperator}' is not supported. Only '+' and '-' are currently recognized.`);
        return; // Exit due to an unsupported operation.
    }

    // Log the final computed result to the console.
    console.log(computedResult);
};

// This block serves as the execution entry point for the script.
// It reads input from standard input (typically /dev/stdin in Unix-like systems)
// and passes it to the main processing function.
try {
    const nodeFileSystem = require("fs"); // Import Node.js's native file system module.
    // Read the entire content of standard input as a UTF-8 encoded string.
    const streamInputContent = nodeFileSystem.readFileSync("/dev/stdin", "utf8");
    // Invoke the primary function to process the retrieved input.
    retrieveAndCompute(streamInputContent);
} catch (inputReadError) {
    // If any error occurs during the file system operation (e.g., /dev/stdin not found or permission issues),
    // catch it and log an informative message.
    console.error(`An exception occurred while attempting to read from standard input: ${inputReadError.message}`);
}