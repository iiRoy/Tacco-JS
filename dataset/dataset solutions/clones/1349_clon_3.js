// This module is designed to process a single numerical input from a specified source.
// It performs a mathematical operation (cubing) on the input and displays the result.

/**
 * Calculates the cube of a given numerical value.
 * This function ensures the mathematical operation is encapsulated and reusable.
 * @param {number} baseNumberInput - The number for which the cube needs to be computed.
 * @returns {number} The calculated cube of the input number.
 */
function performCubingOperation(baseNumberInput) {
    // Define the exponent as a named constant for clarity and potential future modification.
    const EXPONENT_VALUE = 3;
    // Utilize the Math.pow method for robust power calculation.
    return Math.pow(baseNumberInput, EXPONENT_VALUE);
}

/**
 * Manages the end-to-end data flow: acquiring raw input, validating it,
 * performing the primary calculation, and presenting the output.
 * @param {string} receivedDataPayload - The raw string content obtained from the input stream.
 */
function orchestrateDataProcessing(receivedDataPayload) {
    // Sanitize the input by removing any leading or trailing whitespace characters.
    const trimmedInputString = receivedDataPayload.trim();

    let processedNumericValue;

    // Attempt to convert the cleaned string into a floating-point number.
    // parseFloat is chosen to handle both integer and decimal inputs gracefully.
    processedNumericValue = parseFloat(trimmedInputString);

    // Implement a critical validation step: check if the parsed value is indeed a number.
    // If not, log an error and terminate the program gracefully with an error code.
    if (isNaN(processedNumericValue)) {
        console.error("Input data error: The supplied string could not be converted into a valid numeric format.");
        console.error("Please ensure the input consists solely of numerical characters.");
        process.exit(1); // Exit with a non-zero status indicating an error.
    }

    // Execute the core business logic by calling the dedicated cubing function.
    const finalComputedResult = performCubingOperation(processedNumericValue);

    // Assemble a comprehensive output string that includes both input and result.
    const displayOutputMessage = `Successfully processed. The cube of [${processedNumericValue}] is: >> ${finalComputedResult} <<`;

    // Emit the final, formatted result to the standard output stream.
    console.log(displayOutputMessage);
}

// Entry point for the application execution.
// This section handles reading the input and initiating the processing pipeline.
try {
    // Read the entire content of standard input as a UTF-8 encoded string.
    // The 'fs' module is used for file system operations, including stdin access.
    const inputFromStandardStream = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke the main data processing function with the acquired input.
    orchestrateDataProcessing(inputFromStandardStream);

} catch (runtimeError) {
    // Catch any unexpected exceptions that might occur during input reading or processing.
    console.error("An unhandled exception occurred during program execution:");
    console.error(`Error Type: ${runtimeError.name}, Message: ${runtimeError.message}`);
    process.exit(2); // Exit with a different error code for unexpected runtime issues.
}