// Type III Clone: Advanced Arithmetic Processor from Standard Input

// This module provides utilities for file system operations,
// specifically for reading input from a file or stream.
const fileSystemUtility = require('fs');

// Define a constant for the path to the standard input stream.
// This makes the input source explicit and easily configurable.
const standardInputSource = '/dev/stdin';

/**
 * Converts a given string value into a numeric representation.
 * Includes robust error handling for non-numeric inputs.
 * @param {string} stringValue - The string to be converted to a number.
 * @returns {number} The numeric value of the string, or 0 if conversion fails.
 */
function convertToNumber(stringValue) {
    const numericalInterpretation = Number(stringValue);
    // If the conversion results in NaN (Not-a-Number), it indicates invalid input.
    if (isNaN(numericalInterpretation)) {
        // Log a warning to inform about the data anomaly without halting execution.
        console.warn(`Input validation warning: Found non-numeric data '${stringValue}'. Defaulting to 0.`);
        return 0; // Provide a default fallback value for robustness.
    }
    return numericalInterpretation;
}

/**
 * Executes a specific arithmetic operation based on the provided operator.
 * This function is critical for replicating the original code's
 * unique behavior regarding string concatenation for addition after rounding.
 * @param {string|number} currentAccumulatedValue - The current result, potentially a string after toFixed(0).
 * @param {string} operationSymbol - The arithmetic operator character ('+', '-', '*', '/').
 * @param {number} nextNumericalOperand - The number to operate with.
 * @returns {string|number} The outcome of the operation, which could be a string if '+' is used.
 */
function applyArithmeticOperation(currentAccumulatedValue, operationSymbol, nextNumericalOperand) {
    let numericWorkingValue; // Temporary variable for numeric conversions.

    // The original code's behavior: 'toFixed(0)' converts the value to a string.
    // For the '+' operator, JavaScript performs string concatenation if any operand is a string.
    // For other operators ('-', '*', '/'), JavaScript implicitly converts strings to numbers before operation.
    // This function explicitly mimics this nuanced behavior.
    switch (operationSymbol) {
        case '+':
            // Explicitly convert both to string to ensure concatenation,
            // matching the original code's behavior when currentAccumulatedValue is a string.
            return String(currentAccumulatedValue) + String(nextNumericalOperand);
        case '-':
            // Convert current value to number before subtraction.
            numericWorkingValue = Number(currentAccumulatedValue);
            return numericWorkingValue - nextNumericalOperand;
        case '*':
            // Convert current value to number before multiplication.
            numericWorkingValue = Number(currentAccumulatedValue);
            return numericWorkingValue * nextNumericalOperand;
        case '/':
            // Convert current value to number before division.
            numericWorkingValue = Number(currentAccumulatedValue);
            // Implement a guard clause for division by zero to prevent runtime errors.
            if (nextNumericalOperand === 0) {
                console.error("Runtime error: Attempted division by zero. Result will be non-finite.");
                return NaN; // Return NaN to indicate an invalid numerical result.
            }
            return numericWorkingValue / nextNumericalOperand;
        default:
            // If an unrecognized operator is encountered, issue a warning and keep the value unchanged.
            console.warn(`Unrecognized operation symbol '${operationSymbol}'. Skipping this step.`);
            return currentAccumulatedValue;
    }
}

// --- Core Program Logic ---

// Read the entire content of the standard input source synchronously.
// Ensure UTF-8 encoding for proper character interpretation.
const unprocessedInputContent = fileSystemUtility.readFileSync(standardInputSource, 'utf8');

// Clean and parse the input:
// 1. Remove leading/trailing whitespace from the entire content.
// 2. Split the content into an array of lines using the newline character.
// 3. Filter out any empty lines that might result from extra newlines.
const parsedInputLines = unprocessedInputContent.trim().split('\n').filter(line => line.length > 0);

// Implement a guard clause: If no meaningful input lines are found, exit gracefully.
if (parsedInputLines.length === 0) {
    console.log("No operational data provided. Terminating process.");
    process.exit(0); // Exit with a success code.
}

// Initialize the primary result accumulator with the first line of input.
// Convert this initial value to a number using the helper function.
let finalComputedResult = convertToNumber(parsedInputLines[0]);

// Iterate through the remaining input lines to perform sequential operations.
// The loop starts from the second line (index 1) and processes in pairs: operator then operand.
// The condition `lineIterator < parsedInputLines.length - 1` ensures that
// an operator always has a subsequent operand to process.
for (let lineIterator = 1; lineIterator < parsedInputLines.length - 1; lineIterator += 2) {
    const currentOperation = parsedInputLines[lineIterator]; // Operator symbol.
    const subsequentOperandString = parsedInputLines[lineIterator + 1]; // Operand as a string.

    // Convert the operand string to its numeric equivalent.
    const numericalOperand = convertToNumber(subsequentOperandString);

    // Apply the arithmetic operation using the dedicated helper function.
    finalComputedResult = applyArithmeticOperation(finalComputedResult, currentOperation, numericalOperand);

    // Crucial step: After each operation, the original code rounds the result
    // to zero decimal places and converts it to a string. This string form
    // is then carried over for the next iteration, affecting '+' operations.
    // Ensure `finalComputedResult` is a number before `toFixed` to handle
    // cases where it became a string due to a previous '+' operation.
    finalComputedResult = String(Number(finalComputedResult).toFixed(0));
}

// Display the final computed result to the console.
// The result is output as a string, consistent with the last `toFixed(0)` call.
console.log(finalComputedResult);