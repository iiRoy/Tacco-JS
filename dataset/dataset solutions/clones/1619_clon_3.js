/**
 * This module contains a core function to assess a numerical input
 * against a specific threshold and an execution block to handle
 * standard input/output operations.
 */

// Define the primary processing function for evaluating input data.
// It takes a string, attempts to convert it to a number, and then
// compares it against a predefined constant.
const evaluateThresholdStatus = (incomingValueString) => {
    // Establish the benchmark value for comparison.
    // In this context, it's the critical number that the input must meet or exceed.
    const comparisonBenchmark = 30;

    // Standard messages for different evaluation outcomes.
    // These messages provide a clear indication of the result.
    const successIndicator = "AFFIRMATIVE";
    const failureIndicator = "NEGATIVE";
    const parsingErrorMessage = "INVALID_INPUT_DETECTED";

    // Attempt to convert the provided string input into a floating-point number.
    // Using parseFloat allows for handling inputs that might contain decimal points,
    // though the original problem implies integers.
    const numericRepresentation = parseFloat(incomingValueString);

    // Initial validation: Check if the string conversion resulted in a non-numeric value.
    // If it's not a valid number, an error is logged, a specific message is printed,
    // and the function terminates early.
    if (isNaN(numericRepresentation)) {
        console.error("System Error: The provided input '%s' could not be interpreted as a valid number.", incomingValueString);
        console.log(parsingErrorMessage); // Report the specific error outcome.
        return; // Halt further processing for invalid data.
    }

    let finalResultLabel; // Variable to store the ultimate message based on comparison.

    // Core logic: Compare the numeric input against the established benchmark.
    // If the input is greater than or equal to the benchmark, it's a success.
    // Otherwise, it indicates a failure relative to the benchmark.
    if (numericRepresentation >= comparisonBenchmark) {
        finalResultLabel = successIndicator;
    } else {
        finalResultLabel = failureIndicator;
    }

    // Output the final determined label to the standard console.
    console.log(finalResultLabel);
};

// This segment is responsible for orchestrating the input reading
// from the standard input stream and passing it to the evaluation logic.
// It is typically kept separate to manage I/O concerns from core logic.
try {
    // Dynamically load the 'fs' (file system) module, ensuring a modern Node.js context.
    const fileSystemHandler = require("node:fs");

    // Define the universal path for standard input in Unix-like systems.
    const standardInputSource = "/dev/stdin";

    // Specify the character encoding for reading the data from the input source.
    const desiredEncoding = "utf8";

    // Synchronously read all content from the standard input stream.
    const rawBufferContent = fileSystemHandler.readFileSync(standardInputSource, desiredEncoding);

    // Process the raw input: remove any leading or trailing whitespace characters.
    // This helps in ensuring that numerical parsing is not affected by extraneous spaces.
    const sanitizedInputString = rawBufferContent.trim();

    // Additional validation: Check if the input became empty after trimming.
    // An empty input might signify an issue or could be handled as a specific case.
    if (sanitizedInputString.length === 0) {
        console.warn("Input Warning: No meaningful data was received from standard input after cleanup. Processing with a default '0'.");
        evaluateThresholdStatus("0"); // Provide a sensible default for empty input.
    } else {
        // Invoke the main evaluation function with the cleaned input string.
        evaluateThresholdStatus(sanitizedInputString);
    }

} catch (inputOutputError) {
    // Catch and report any exceptions that occur during the file system operations.
    // This could include issues like file not found, permission errors, etc.
    console.error("Critical I/O Error: Failed to read from standard input. Details: %s", inputOutputError.message);
    // As a fallback, call the evaluation function with a value indicating an error state.
    // This ensures the program doesn't crash silently and provides an output.
    evaluateThresholdStatus("-1");
}