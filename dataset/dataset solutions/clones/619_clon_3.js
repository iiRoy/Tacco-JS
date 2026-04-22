const fileSystemModule = require('fs'); // Renamed module variable for clarity

/**
 * Reads and preprocesses input data from a specified file path.
 * Handles potential errors during file reading and ensures basic data integrity.
 * @param {string} sourcePath - The path to the input file.
 * @returns {string[]} An array of strings, where each element is a line from the input.
 * @throws {Error} If the file cannot be read or is empty after trimming.
 */
function obtainProcessedInputLines(sourcePath) {
    let rawContentBuffer;
    try {
        // Read the entire file content synchronously using the specified encoding
        rawContentBuffer = fileSystemModule.readFileSync(sourcePath, 'utf8');
    } catch (readError) {
        // Log a detailed error message if file reading fails
        console.error(`ERROR: Could not access or read data from '${sourcePath}'. Details: ${readError.message}`);
        // Terminate execution as input data is crucial
        process.exit(1);
    }

    const trimmedContent = rawContentBuffer.trim();

    // Validate that content is not empty after trimming
    if (trimmedContent.length === 0) {
        console.error("ERROR: Input data source is empty or contains only whitespace.");
        process.exit(1);
    }

    // Split the content into individual lines
    return trimmedContent.split("\n");
}

// Define the input source path as a constant
const standardInputPath = '/dev/stdin';

// Retrieve the array of instruction lines
const operationInstructions = obtainProcessedInputLines(standardInputPath);

// Verify that there's at least an initial value
if (operationInstructions.length === 0) {
    console.error("ERROR: No valid instruction lines were processed.");
    process.exit(1);
}

// Attempt to parse the initial numeric value from the first line
let runningTotal = parseFloat(operationInstructions[0]);

// Validate the initial value
if (isNaN(runningTotal)) {
    console.error(`ERROR: The first line ('${operationInstructions[0]}') is not a valid initial number.`);
    process.exit(1);
}

// Apply initial rounding to the running total, consistent with post-operation rounding
runningTotal = Math.round(runningTotal);

// Iterate through the instruction lines, starting from the second line,
// processing operators and operands in pairs.
for (let currentLineIdx = 1; currentLineIdx < operationInstructions.length; currentLineIdx += 2) {
    const currentOperatorSymbol = operationInstructions[currentLineIdx];

    // Check for the termination symbol '='
    if (currentOperatorSymbol === "=") {
        // If '=' is encountered, stop further processing
        break;
    }

    // Ensure there is an operand available for the current operator
    if (currentLineIdx + 1 >= operationInstructions.length) {
        console.warn(`WARNING: Operator '${currentOperatorSymbol}' at line ${currentLineIdx + 1} has no matching operand. Calculation terminated prematurely.`);
        break; // Stop if an operator is missing its operand
    }

    const operandText = operationInstructions[currentLineIdx + 1];
    const operandNumericValue = parseFloat(operandText);

    // Validate the operand's numeric value
    if (isNaN(operandNumericValue)) {
        console.warn(`WARNING: Invalid numeric operand '${operandText}' at line ${currentLineIdx + 2}. Skipping this operation.`);
        // Continue to the next pair of operator/operand
        continue;
    }

    // Use a switch statement for handling different arithmetic operations
    switch (currentOperatorSymbol) {
        case "+":
            runningTotal += operandNumericValue;
            break;
        case "-":
            runningTotal -= operandNumericValue;
            break;
        case "*":
            runningTotal *= operandNumericValue;
            break;
        case "/":
            // Implement a guard clause for division by zero
            if (operandNumericValue === 0) {
                console.warn("WARNING: Attempted division by zero. Result may become Infinity or NaN.");
                // The original code would produce Infinity/NaN, so we maintain this behavior.
                runningTotal /= operandNumericValue;
            } else {
                runningTotal /= operandNumericValue;
            }
            break;
        default:
            console.warn(`WARNING: Unrecognized operator '${currentOperatorSymbol}' at line ${currentLineIdx + 1}. Skipping this operation.`);
            // If an unknown operator is found, skip its corresponding operand as well
            continue; // Proceed to the next instruction pair
    }

    // After each successful operation, round the running total
    runningTotal = Math.round(runningTotal);
}

// Output the final computed result to the console
console.log(runningTotal);