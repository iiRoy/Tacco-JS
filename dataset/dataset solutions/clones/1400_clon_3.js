const nodeFileModule = require('fs'); // Import the Node.js file system module for I/O operations.

// Define the path for standard input, typically '/dev/stdin' in Unix-like environments.
const standardInputFile = '/dev/stdin';

// A constant representing the operator that signals the end of input processing.
const endOfInputSignal = '%';

/**
 * Parses a string value into a numeric representation.
 * Includes basic validation and error logging for non-numeric inputs.
 * @param {string} inputString - The string to convert to a number.
 * @returns {number} The parsed numeric value, or 0 if parsing fails.
 */
const convertToNumber = (inputString) => {
    const numericalValue = Number(inputString); // Attempt to cast the string to a number.
    if (Number.isNaN(numericalValue)) {
        // Log a warning if the input string cannot be converted to a valid number.
        console.error(`Warning: Encountered non-numeric data '${inputString}'. Defaulting to zero.`);
        return 0; // Return a default value or throw an error for stricter validation.
    }
    return numericalValue;
};

/**
 * Executes the main calculation logic by reading input from stdin,
 * processing mathematical operations line by line, and printing results.
 */
async function performArithmeticOperations() {
    let rawDataContent;
    try {
        // Synchronously read the entire content of the standard input file.
        rawDataContent = nodeFileModule.readFileSync(standardInputFile, 'utf8');
    } catch (fileReadError) {
        // If file reading fails, log the error and terminate the process.
        console.error(`Error: Could not read input from '${standardInputFile}'. Details: ${fileReadError.message}`);
        return; // Exit the function if input cannot be obtained.
    }

    // Process the raw input:
    // 1. Remove leading/trailing whitespace from the entire block.
    // 2. Split into an array of lines.
    // 3. Trim whitespace from each individual line.
    // 4. Filter out any lines that become empty after trimming.
    const processedInputLines = rawDataContent
        .trim()
        .split('\n')
        .map(lineContent => lineContent.trim())
        .filter(trimmedLine => trimmedLine.length > 0);

    // If no valid lines remain after processing, warn the user and exit.
    if (processedInputLines.length === 0) {
        console.warn('No valid calculation instructions provided in the input.');
        return;
    }

    let currentLineIndex = 0; // Initialize an index to track the current line being processed.

    // Iterate through the input lines. The loop continues as long as there are lines
    // to process and the termination signal has not been encountered.
    while (currentLineIndex < processedInputLines.length) {
        const activeLineInstruction = processedInputLines[currentLineIndex];
        currentLineIndex++; // Advance to the next line for the subsequent iteration.

        // Each line is expected to contain two numbers and an operator, separated by spaces.
        const lineSegments = activeLineInstruction.split(' ');

        // Validate the structure of the current line instruction.
        if (lineSegments.length !== 3) {
            console.error(`Skipping invalid instruction line: '${activeLineInstruction}'. Expected format: 'NUMBER OPERATOR NUMBER'.`);
            continue; // Skip to the next line if the format is incorrect.
        }

        const firstOperandString = lineSegments[0];
        const operatorCharacter = lineSegments[1];
        const secondOperandString = lineSegments[2];

        // Check if the current operator is the termination signal.
        if (operatorCharacter === endOfInputSignal) {
            // If the termination signal is found, break out of the processing loop.
            // console.info('Termination signal received. Halting further calculations.');
            break;
        }

        // Convert string operands to numbers using the helper function.
        const valueA = convertToNumber(firstOperandString);
        const valueB = convertToNumber(secondOperandString);

        let computationResult; // Variable to hold the outcome of the arithmetic operation.
        let operationWasSuccessful = true; // Flag to indicate if the operation completed without issues.

        // Use a switch statement for clear and organized handling of different operators.
        switch (operatorCharacter) {
            case '+':
                computationResult = valueA + valueB;
                break;
            case '-':
                computationResult = valueA - valueB;
                break;
            case '*':
                computationResult = valueA * valueB;
                break;
            case '/':
                // Implement a safeguard against division by zero.
                if (valueB === 0) {
                    console.error(`Error: Division by zero attempted in line '${activeLineInstruction}'.`);
                    operationWasSuccessful = false; // Mark as unsuccessful.
                } else {
                    // Perform integer division by truncating the decimal part.
                    computationResult = Math.trunc(valueA / valueB);
                }
                break;
            default:
                // Handle cases where an unknown or unsupported operator is encountered.
                console.error(`Error: Unknown operator '${operatorCharacter}' in line '${activeLineInstruction}'.`);
                operationWasSuccessful = false; // Mark as unsuccessful.
                break;
        }

        // Only print the result if the operation was successful.
        if (operationWasSuccessful) {
            console.log(computationResult);
        }
    }
}

// Initiate the main calculation process.
// Catch any unhandled promise rejections that might occur during async execution.
performArithmeticOperations().catch(executionError => {
    console.error("An unexpected error occurred during the arithmetic operation process:", executionError);
});