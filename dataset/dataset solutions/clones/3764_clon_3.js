// Define a global configuration object for application-wide constants.
const AppConfiguration = Object.freeze({
    // The numerical threshold used for comparison.
    COMPARISON_THRESHOLD: 1000,
    // Message displayed when the input value is below the threshold.
    LESSER_VALUE_MESSAGE: 'ABC',
    // Message displayed when the input value is greater than or equal to the threshold.
    GREATER_OR_EQUAL_MESSAGE: 'ABD',
    // Message for invalid or unparseable input data.
    INVALID_DATA_MESSAGE: 'Invalid numerical input detected.',
    // Standard input file path for reading data.
    STANDARD_INPUT_PATH: "/dev/stdin"
});

/**
 * @function processAndEvaluateNumericInput
 * @description This routine takes a raw string, attempts to convert it into a number,
 *              and then evaluates it against a predefined system threshold.
 *              It provides a descriptive message based on the comparison outcome or
 *              any issues encountered during data processing.
 * @param {string | any} rawDataPayload - The incoming data, expected to be a string
 *                                        representing a numeric value.
 * @returns {string} A textual message indicating the result of the evaluation.
 */
function processAndEvaluateNumericInput(rawDataPayload) {
    // Initiating a local variable to hold the final message.
    let evaluationResultStatement = AppConfiguration.INVALID_DATA_MESSAGE;

    // Step 1: Initial validation of the input payload.
    // Ensure the payload is a non-empty string before proceeding.
    if (typeof rawDataPayload !== 'string' || rawDataPayload.trim().length === 0) {
        console.warn("Input payload is not a valid non-empty string. Aborting numerical evaluation.");
        return evaluationResultStatement; // Return default invalid message.
    }

    // Step 2: Pre-process the raw string data.
    // Remove leading/trailing whitespace to clean the input for parsing.
    const cleanedNumericString = rawDataPayload.trim();

    // Step 3: Attempt to parse the cleaned string into an integer.
    // Use `Number()` for potentially more robust parsing, or `parseInt` with radix.
    // For this specific clone, let's use `Number()` to introduce a slight variation.
    const parsedNumericValue = Number(cleanedNumericString);

    // Step 4: Validate the parsed numeric value.
    // Check if the parsing operation resulted in a legitimate finite number.
    if (isNaN(parsedNumericValue) || !Number.isFinite(parsedNumericValue)) {
        console.error(`Parsing error: "${cleanedNumericString}" could not be converted into a valid finite number.`);
        return evaluationResultStatement; // Return default invalid message.
    }

    // Step 5: Perform the core comparison logic.
    // Compare the successfully parsed number against the application-defined threshold.
    if (parsedNumericValue < AppConfiguration.COMPARISON_THRESHOLD) {
        evaluationResultStatement = AppConfiguration.LESSER_VALUE_MESSAGE;
    } else {
        evaluationResultStatement = AppConfiguration.GREATER_OR_EQUAL_MESSAGE;
    }

    // Step 6: Return the determined evaluation message.
    return evaluationResultStatement;
}

// --- Application Entry Point and Execution Flow ---

// Obtain the Node.js File System module for file operations.
const fileStreamHandler = require("fs");

try {
    // Attempt to read the content from the specified standard input path synchronously.
    // The content is initially a Buffer, so convert it to a UTF-8 string.
    const fileDataBuffer = fileStreamHandler.readFileSync(AppConfiguration.STANDARD_INPUT_PATH);
    const effectiveInputContent = fileDataBuffer.toString('utf8');

    // Pass the retrieved and prepared content to our primary processing function.
    const finalOutputMessage = processAndEvaluateNumericInput(effectiveInputContent);

    // Display the final result of the evaluation to the standard output.
    console.log(finalOutputMessage);

} catch (dataReadError) {
    // Catch and handle any errors that might occur during the file reading process.
    // This provides robustness against missing files or permission issues.
    console.error(`Failed to read input from '${AppConfiguration.STANDARD_INPUT_PATH}':`, dataReadError.message);
    // As a fallback, output the generic invalid data message to ensure some output.
    console.log(AppConfiguration.INVALID_DATA_MESSAGE);
}