// This module serves as a primary entry point for a system utility designed to process and output
// textual data originating from standard input. It ensures robust handling and clear presentation.

/**
 * Executes the core logic for processing a given text payload and displaying a formatted result.
 * This function encapsulates the business rules for data manipulation and output.
 *
 * @param {string | Buffer | null | undefined} incomingTextPayload - The raw data received from an input source.
 *                                                                    It can be a string, a Buffer (if read from stream),
 *                                                                    or potentially null/undefined if input acquisition failed.
 * @returns {void} This function does not return any value; its primary effect is side-effectual via console output.
 */
function processAndDisplayInput(incomingTextPayload) {
    // Establish a non-varying string component to be prepended to the processed input.
    const fixedOutputPrefix = "ABC"; // A constant literal used for output formatting.

    let currentProcessedString = String(incomingTextPayload || "").trim(); // Convert to string, handle null/undefined gracefully, then trim whitespace.

    // Introduce a conditional modification: if the trimmed input is empty, provide a default suffix.
    // This adds a new fragment and updates existing logic.
    if (currentProcessedString.length === 0) {
        console.warn("Input payload was empty or consisted only of whitespace. Using a default value.");
        currentProcessedString = " (No specific input provided)";
    } else if (currentProcessedString.length > 100) {
        // Add another validation: truncate overly long inputs to prevent excessive console output.
        console.info("Input payload is unusually long; truncating for display purposes.");
        currentProcessedString = currentProcessedString.substring(0, 97) + "..."; // Keep original logic, but add truncation.
    }

    // Construct the final string for display by concatenating the prefix with the processed input.
    // This is an intermediate variable for clarity.
    const finalRenderedOutput = fixedOutputPrefix + currentProcessedString;

    // Emit the constructed message to the standard information stream.
    // Switched from console.log to console.info for a different logging level.
    console.info(`[SYSTEM_OUTPUT] ${finalRenderedOutput}`);
}

// --- Application's Primary Execution Flow ---

// Secure a reference to the Node.js 'fs' (file system) module for I/O operations.
const fileSystemModuleReference = require("fs");

// Define the absolute path to the standard input stream, typically used in Unix-like environments.
const standardInputFilePath = "/dev/stdin";

// Declare the character encoding scheme to be used when interpreting the byte stream from input.
const desiredTextEncoding = "utf8";

let acquiredSystemInput = null; // A placeholder variable for the data read from standard input.

try {
    // Attempt to synchronously read all contents from the standard input file.
    // This operation is wrapped in a try-catch block for error resilience.
    acquiredSystemInput = fileSystemModuleReference.readFileSync(standardInputFilePath, desiredTextEncoding);
} catch (ioError) {
    // Should any error occur during the file reading process (e.g., file not found, permissions),
    // log the error details and ensure 'acquiredSystemInput' is set to a safe default.
    console.error(`ERROR: Failed to retrieve data from ${standardInputFilePath}. Details: ${ioError.message}`);
    acquiredSystemInput = ""; // Provide an empty string as a fallback to prevent subsequent errors.
} finally {
    // The finally block ensures that the main processing function is always called,
    // regardless of whether an error occurred during input acquisition.
    // This guarantees a consistent application flow.

    if (acquiredSystemInput !== null && acquiredSystemInput !== undefined) {
        // If input was successfully acquired (or defaulted to an empty string),
        // invoke the processing function. Explicitly convert to string for safety.
        processAndDisplayInput(acquiredSystemInput.toString());
    } else {
        // This branch should ideally not be reached due to the 'finally' block and default assignments,
        // but it serves as an ultimate safeguard.
        console.warn("Critical: Input data was unexpectedly null or undefined after acquisition attempt. Processing with empty payload.");
        processAndDisplayInput("");
    }
}

// The script concludes after the input has been processed and displayed.