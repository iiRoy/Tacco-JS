/**
 * This module is responsible for processing a specific format of text input
 * typically received from a standard input stream. It extracts two numerical
 * values from the first line and performs a conditional calculation,
 * printing the final result to the console.
 */
function handleInputAndCalculate(rawDataString) {

    // Validate the initial input: ensure it's a non-empty string.
    if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        console.error("Processing error: Input data is invalid or empty.");
        // Exit early if the fundamental input is missing.
        return;
    }

    // Extract the very first line from the received multi-line text.
    // The original code created a 'lines' array; this version directly accesses the first element.
    const primaryInputLine = rawDataString.split('\n')[0];

    // Perform a crucial validation: check if the primary line contains a space,
    // which is expected to separate the two required numbers.
    if (!primaryInputLine || primaryInputLine.indexOf(' ') === -1) {
        console.error("Input format mismatch: The first line does not contain the expected space separator.");
        return;
    }

    // Split the primary line into its constituent string parts.
    const stringComponents = primaryInputLine.split(' ');

    // Assign the string representations of the numbers to temporary variables
    // before attempting numerical conversion.
    const firstNumString = stringComponents[0];
    const secondNumString = stringComponents[1];

    // Explicitly convert the string components to integers (base 10).
    // The original code relied on JavaScript's implicit type coercion for subtraction.
    const operandA = parseInt(firstNumString, 10);
    const operandB = parseInt(secondNumString, 10);

    // Validate the success of the numerical parsing.
    // If either value is not a number, an error is reported.
    if (isNaN(operandA) || isNaN(operandB)) {
        console.error(`Data parsing failure: Expected numbers, but received '${firstNumString}' and '${secondNumString}'.`);
        return;
    }

    // Compute the initial difference between the two parsed operands.
    const intermediateDifference = operandA - operandB;

    // Determine the final output based on a specific condition for 'operandB'.
    // This replaces the original ternary operator with an 'if-else' block for clarity.
    let finalCalculatedValue;
    if (operandB === 1) {
        // If the second operand is 1, the result is always 0, overriding the difference.
        finalCalculatedValue = 0;
    } else {
        // Otherwise, the result is the previously calculated difference.
        finalCalculatedValue = intermediateDifference;
    }

    // Output the computed final value to the standard output.
    console.log(finalCalculatedValue);
}

// --- Application Entry Point and Input Handling ---
// This block is responsible for reading input from stdin and invoking the main processing function.
// It includes error handling for file system operations.
try {
    const fileSystemModuleReference = require("fs");
    const standardInputPathSpecifier = "/dev/stdin";
    const characterEncodingStandard = "utf8";

    // Read the entire content of the standard input stream synchronously.
    // This operation is wrapped in a try-catch block for robustness against I/O errors.
    const contentFromStandardInput = fileSystemModuleReference.readFileSync(
        standardInputPathSpecifier,
        characterEncodingStandard
    );

    // Pass the acquired content to the main processing function.
    handleInputAndCalculate(contentFromStandardInput);

} catch (fileReadError) {
    // If any error occurs during the file reading process, log a detailed error message
    // and terminate the application with a non-zero exit code, indicating failure.
    console.error(`Fatal I/O Error: Could not read from standard input. Details: ${fileReadError.message}`);
    process.exit(1);
}