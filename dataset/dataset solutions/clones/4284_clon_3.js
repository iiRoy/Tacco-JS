// This JavaScript module implements a text analysis utility.
// Its primary goal is to determine if a specific predefined textual pattern
// exists within a given input string, providing a clear affirmative or negative response.

/**
 * Executes a comprehensive analysis on the provided textual content
 * to ascertain the presence of a critical sequence.
 *
 * @param {string} incomingDataPayload - The string content to be scrutinized.
 *                                     This typically originates from an external source,
 *                                     such as standard input or a file.
 */
function processTextualContent(incomingDataPayload) {
    // Configuration: Define the precise character string we are actively searching for.
    // This value is immutable for the scope of this analysis.
    const REQUIRED_TOKEN_SEQUENCE = "AC";

    // Internal state variable to record the outcome of our search operation.
    // It is initialized to false, assuming the token is not present until confirmed.
    let tokenFoundStatus = false;

    // --- Preliminary Input Validation and Sanitization ---
    // Before proceeding with any pattern matching, it's crucial to ensure
    // that the input is valid and suitable for string operations.
    // We check if it's a string and if it contains any non-whitespace characters.
    if (typeof incomingDataPayload !== 'string' || incomingDataPayload.trim().length === 0) {
        // If the input is invalid (not a string or empty after trimming),
        // we log a warning for diagnostic purposes and output a default 'No' response.
        console.warn("NOTICE: The analytical process received an invalid or empty data payload. Unable to perform sequence detection.");
        console.log("No"); // Default response for unprocessable input.
        return; // Terminate execution as no meaningful analysis can occur.
    }

    // --- Core Pattern Matching Logic ---
    // Utilize a regular expression search to locate the 'REQUIRED_TOKEN_SEQUENCE'.
    // The 'search' method returns the starting index of the first match, or -1 if no match is found.
    // Using a RegExp allows for more complex pattern matching flexibility if requirements evolve.
    const detectionIndex = incomingDataPayload.search(new RegExp(REQUIRED_TOKEN_SEQUENCE));

    // Evaluate the result of the search operation.
    // If 'detectionIndex' is not -1, it means the token was successfully located.
    if (detectionIndex !== -1) {
        tokenFoundStatus = true; // Mark the token as found.
    } else {
        tokenFoundStatus = false; // Explicitly confirm token was not found (redundant with initialization but adds clarity).
    }

    // --- Final Result Formulation and Output ---
    // Prepare the ultimate message based on the 'tokenFoundStatus'.
    // This provides a standardized output format.
    let conclusiveStatement = "";
    if (tokenFoundStatus) {
        conclusiveStatement = "Yes"; // The required sequence is present.
    } else {
        conclusiveStatement = "No";  // The required sequence is absent.
    }

    // Output the final verdict to the standard console.
    console.log(conclusiveStatement);
}

// --- Application Execution Block ---
// This section serves as the entry point for the script when executed.
// It is responsible for acquiring the necessary input data and initiating the analysis.
try {
    // Read the entire content from the standard input stream ('/dev/stdin').
    // The 'utf8' encoding ensures proper character interpretation.
    const systemProvidedInput = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke our main processing function with the data obtained from the system input.
    processTextualContent(systemProvidedInput);
} catch (dataAcquisitionError) {
    // Implement robust error handling for scenarios where reading from standard input fails.
    // This could be due to file system issues, permissions, or incorrect stream handling.
    console.error("FATAL ERROR: Failed to read input from the system's standard input stream. Details:", dataAcquisitionError.message);
    // In case of input acquisition failure, we cannot perform the check, so we default to 'No'.
    console.log("No");
}