// Constants for the primary and alternative identifiers used in the logic.
const PRIMARY_CODE_VALUE = "ABC";
const ALTERNATE_CODE_VALUE = "ARC";

/**
 * Executes a specific data processing routine based on the provided input string.
 * This function evaluates the incoming textual data and prints a corresponding
 * result to the standard output. It includes basic validation and sanitization.
 *
 * @param {string} incomingDataPayload The raw text string received from an input source.
 * @returns {void} This function does not return a value; it performs a side effect by logging output.
 */
function processAndDisplayResult(incomingDataPayload) {
    // --- Input Validation and Pre-processing ---

    // Ensure the input is a valid string and not just empty whitespace.
    // This acts as a guard clause for unexpected input types or blank data.
    if (typeof incomingDataPayload !== 'string' || incomingDataPayload.trim().length === 0) {
        // If the input is invalid, log an error message to the console's error stream.
        console.error("Error: Received an invalid or empty data payload for processing.");
        // Terminate the function's execution as valid processing is not possible.
        return;
    }

    // Standardize the input by trimming leading/trailing whitespace.
    // This makes the comparison robust against minor formatting differences.
    const cleanedInputString = incomingDataPayload.trim();

    // --- Core Logic Execution ---

    let finalOutputString; // Declare a variable to hold the determined output.

    // Evaluate the cleaned input string against the predefined primary code value.
    // This is the central decision point of the program.
    if (cleanedInputString === PRIMARY_CODE_VALUE) {
        // If the input matches the primary code, assign the alternate code for output.
        finalOutputString = ALTERNATE_CODE_VALUE;
    } else {
        // Otherwise, if there is no match, assign the primary code itself as the output.
        // This serves as the default or fallback response.
        finalOutputString = PRIMARY_CODE_VALUE;
    }

    // --- Output Generation ---

    // Print the determined output string to the standard console output.
    // This is the final action of the processing routine.
    console.log(finalOutputString);
}

// --- Application Entry Point ---

// This block handles reading input from the system's standard input stream.
// It's typically used in environments like competitive programming platforms.
try {
    // Utilize the Node.js 'fs' module to synchronously read the entire file
    // content from '/dev/stdin' (standard input usually redirected from a file or pipe).
    // The content is expected to be encoded in UTF-8.
    const systemRawInputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");

    // Pass the acquired raw input buffer to our main processing function.
    processAndDisplayResult(systemRawInputBuffer);

} catch (ioReadError) {
    // In case of any error during the input reading process (e.g., file not found, permissions).
    // Log a detailed error message to the console's error stream, including the error details.
    console.error("Fatal Error: Could not read data from standard input stream.", ioReadError.message);
    // Optionally, one could call processAndDisplayResult with a default or error value here,
    // e.g., processAndDisplayResult("ERROR_INPUT");
}