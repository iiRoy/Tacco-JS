'use strict'; // Activate strict parsing and error handling for the entire script.

// Define a constant for the default character encoding to ensure consistency across file operations.
const DEFAULT_TEXT_ENCODING = 'utf8';

// Define a constant for the standard input file path, which is common in Unix-like systems for CLI tools.
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';

/**
 * A utility function designed to safely evaluate a given JavaScript expression string.
 * It incorporates basic type validation, emptiness checks, and robust error handling
 * to mitigate common issues associated with dynamic code execution.
 *
 * @param {string} expressionString - The JavaScript code snippet or expression to be evaluated dynamically.
 * @returns {any|null} The computed result of the evaluation, or `null` if any validation
 *                     fails or a runtime error occurs during the evaluation process.
 */
function attemptCodeExecution(expressionString) {
    // Step 1: Perform an initial type check to ensure the input is indeed a string.
    // Non-string inputs are immediately flagged as invalid for evaluation.
    if (typeof expressionString !== 'string') {
        console.error("Evaluation Error: The provided input for code execution is not of string type.");
        return null; // Terminate early as evaluation is not possible with an incorrect type.
    }

    // Step 2: Clean and validate the string content.
    // Remove any leading or trailing whitespace to avoid issues with empty strings or malformed expressions.
    const sanitizedExpressionFragment = expressionString.trim();

    // If the string becomes empty after trimming, it signifies that there's no actual code to execute.
    if (sanitizedExpressionFragment.length === 0) {
        console.warn("Evaluation Warning: Attempted to execute an empty or whitespace-only code fragment. No operation performed.");
        return null; // Return null as there's no meaningful execution.
    }

    let computationOutcome = null; // Initialize a variable to hold the result of the `eval` operation.
    try {
        // Step 3: Execute the sanitized JavaScript expression using `eval`.
        // This is the core functionality but is inherently risky; thus, it's wrapped in error handling.
        computationOutcome = eval(sanitizedExpressionFragment);
    } catch (dynamicEvaluationError) {
        // Step 4: Catch and report any runtime errors that occur during the `eval` execution.
        // This provides crucial feedback without crashing the entire application.
        console.error(`Runtime Evaluation Error: Failed to execute the code fragment "${sanitizedExpressionFragment}". Specific details: ${dynamicEvaluationError.message}`);
        // Optionally, for detailed debugging, the full stack trace can be logged:
        // console.error(dynamicEvaluationError.stack);
        return null; // Indicate failure in code execution.
    }

    // Step 5: Return the result obtained from the successful evaluation.
    return computationOutcome;
}

/**
 * This function serves as the primary orchestration point for the application.
 * It handles reading raw data from an external source, systematically processes it,
 * and then attempts to execute the first identified JavaScript code line within that data.
 *
 * @param {string|Buffer} rawDataSourceContent - The raw data obtained directly from the input source.
 *                                               This can be a string or a Node.js Buffer object.
 */
const processExternalPayloadAndExecute = (rawDataSourceContent) => {
    // Step 1: Initial validation of the raw input data.
    // Check for null, undefined, or explicitly empty strings to prevent subsequent errors.
    if (!rawDataSourceContent || (typeof rawDataSourceContent === 'string' && rawDataSourceContent.length === 0)) {
        console.error("Input Processing Error: No valid data was received from the designated input source.");
        return; // Exit the function early if the input is deemed invalid.
    }

    // Step 2: Convert the raw data into a consistent string format.
    // This handles both string inputs and Buffer objects (by calling their `toString()` method implicitly).
    const fullContentAsString = String(rawDataSourceContent);

    // Step 3: Perform a comprehensive cleanup of the entire content block.
    // This regex-based trimming removes all leading and trailing whitespace characters,
    // including spaces, tabs, newlines, and carriage returns, for robust sanitization.
    const normalizedContentBlock = fullContentAsString.replace(/^\s+|\s+$/g, '');

    // Step 4: Check if the content block is empty after the normalization process.
    // If it's empty, it implies no meaningful data was provided.
    if (normalizedContentBlock.length === 0) {
        console.warn("Input Processing Warning: Input source contained only whitespace or was empty after thorough cleaning.");
        return;
    }

    // Step 5: Divide the normalized content into an array of individual lines.
    // The regex `/\r?\n/` ensures compatibility with both Windows-style (CRLF) and Unix-style (LF) newlines.
    const distinctContentLines = normalizedContentBlock.split(/\r?\n/);

    // Step 6: Verify that the splitting operation actually yielded some lines.
    // An empty array here means no distinct lines of content could be identified.
    if (distinctContentLines.length === 0) {
        console.warn("Input Processing Warning: No distinct lines of content were identified after parsing the input.");
        return;
    }

    // Step 7: Extract the very first line from the array, as per the application's logic.
    // This line is presumed to contain the primary JavaScript code fragment for execution.
    const primaryExecutableFragment = distinctContentLines[0];

    // Step 8: Perform a final check on the extracted primary fragment itself.
    // If this specific line is empty or just whitespace, it's not a valid code fragment.
    if (primaryExecutableFragment.trim().length === 0) {
        console.warn("Input Processing Warning: The first identified line of code was empty or consisted solely of whitespace characters. No execution attempted.");
        return;
    }

    // Step 9: Invoke the dedicated `attemptCodeExecution` utility to run the extracted code fragment.
    // The result of this operation is stored for subsequent logging.
    const finalOperationOutcome = attemptCodeExecution(primaryExecutableFragment);

    // Step 10: Present the outcome of the code execution to the console.
    // Only log if the `attemptCodeExecution` function returned a non-null value, indicating success.
    if (finalOperationOutcome !== null) {
        console.log(finalOperationOutcome);
    } else {
        // If `finalOperationOutcome` is null, it means an error occurred during evaluation,
        // and appropriate messages would have already been logged by `attemptCodeExecution`.
        console.error("Final Output: Code execution did not produce a loggable result due to preceding errors or invalid input conditions.");
    }
};

// --- Script Entry Point ---
// This block defines how the application starts and handles initial resource loading.
try {
    // Dynamically load the 'fs' (file system) module, which is essential for reading files.
    // Storing it in a constant improves readability and performance by avoiding repeated lookups.
    const fileSystemModuleHandler = require('fs');

    // Read the entire content of the standard input file synchronously.
    // This is a blocking operation, which is acceptable for simple command-line utilities
    // that process input once and then terminate.
    const rawSystemInputContent = fileSystemModuleHandler.readFileSync(STANDARD_INPUT_FILE_PATH, DEFAULT_TEXT_ENCODING);

    // Pass the successfully retrieved raw content to the main processing function.
    processExternalPayloadAndExecute(rawSystemInputContent);

} catch (ioOperationFailure) {
    // Catch any critical errors that occur during the file system input operation.
    // This includes issues like file not found, permission denied, or other I/O failures.
    console.error(`Critical System Error: An I/O operation failed while attempting to read from the standard input path (${STANDARD_INPUT_FILE_PATH}). Detailed message: ${ioOperationFailure.message}`);
    // Terminate the process with a non-zero exit code to signal that the script ended abnormally due to an error.
    process.exit(1);
}