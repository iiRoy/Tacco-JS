// This script processes a series of arithmetic operations provided via standard input.
// It reads an initial numerical value, then iteratively applies operations and operands.

// Module for file system operations, specifically to read input.
const fileSystemHandler = require('fs');

// Read all raw input data from /dev/stdin as a UTF-8 string.
const rawInputData = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

// Trim leading/trailing whitespace from the raw input and then split it into an array
// of individual lines based on the newline character.
const processingInstructions = rawInputData.trim().split("\n");

// Initialize the accumulator for calculations.
let calculationAccumulator;

// --- Input Validation and Initial Value Parsing ---
// Check if any input lines were provided.
if (processingInstructions.length === 0) {
    console.error("Error: No input lines were provided for processing.");
    process.exit(1); // Exit with an error code.
}

// Attempt to parse the very first line as the initial numeric value.
const initialValueString = processingInstructions[0];
calculationAccumulator = Number.parseInt(initialValueString, 10);

// Validate if the initial value was successfully parsed as a number.
if (isNaN(calculationAccumulator)) {
    console.error(`Error: The initial value '${initialValueString}' is not a valid number.`);
    process.exit(1); // Exit with an error code.
}

// --- Main Operation Loop ---
// Iterate through the instruction lines, starting from the second line (index 1).
// Each iteration processes an operator and its corresponding operand, so the pointer
// advances by 2 in each step.
for (let instructionPointer = 1; instructionPointer < processingInstructions.length; instructionPointer += 2) {

    // Ensure there is an operand available for the current operator.
    if (instructionPointer + 1 >= processingInstructions.length) {
        console.warn(`Warning: Operator at line ${instructionPointer + 1} has no corresponding operand. Terminating processing.`);
        break; // Stop if an operand is missing.
    }

    // Extract the current operator and its string representation of the operand.
    const currentOperator = processingInstructions[instructionPointer];
    const operandString = processingInstructions[instructionPointer + 1];

    // Check for the termination signal.
    if (currentOperator === "=") {
        // If the operator is '=', it signifies the end of operations.
        break;
    }

    // Parse the operand string into a numeric value.
    const operandValue = Number.parseInt(operandString, 10);

    // Validate if the operand was successfully parsed as a number.
    if (isNaN(operandValue)) {
        console.warn(`Warning: Invalid number '${operandString}' encountered at line ${instructionPointer + 2}. Skipping this operation.`);
        continue; // Skip to the next pair of instructions if the operand is invalid.
    }

    // --- Perform the arithmetic operation based on the operator ---
    switch (currentOperator) {
        case "+":
            calculationAccumulator += operandValue;
            break;
        case "-":
            calculationAccumulator -= operandValue;
            break;
        case "*":
            calculationAccumulator *= operandValue;
            break;
        case "/":
            // Implement a guard clause for division by zero.
            if (operandValue === 0) {
                console.warn(`Warning: Attempted division by zero at line ${instructionPointer + 1}. Operation skipped.`);
            } else {
                calculationAccumulator /= operandValue;
            }
            break;
        default:
            // Handle unknown or unsupported operators.
            console.warn(`Warning: Unknown operator '${currentOperator}' found at line ${instructionPointer + 1}. This operation will be ignored.`);
            break;
    }

    // After each operation, round the accumulator to the nearest integer.
    // This ensures results remain whole numbers as per the original logic.
    calculationAccumulator = Math.round(calculationAccumulator);
}

// Output the final calculated integer value to the console.
console.log(calculationAccumulator);