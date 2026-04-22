/**
 * Core processing unit for analyzing incoming data streams.
 * This function determines if the leading segment of the input
 * string commences with a predefined character sequence.
 *
 * @param {string} receivedData The complete string payload obtained from the input source.
 */
function processDataStream(receivedData) {
    // Define the specific string prefix we are looking to identify.
    const targetPrefix = "YAKI";

    // Standardized output messages for clarity.
    const positiveOutcome = "Yes";
    const negativeOutcome = "No";

    // --- Input Validation and Pre-processing ---

    // Initial robust check: Ensure the input is a valid string and not empty
    // after trimming any leading/trailing whitespace. An empty or invalid input
    // cannot possibly start with our target prefix.
    if (typeof receivedData !== 'string' || receivedData.trim().length === 0) {
        console.log(negativeOutcome);
        return; // Terminate execution early if validation fails.
    }

    let firstSegmentOfData; // This variable will hold the content of the first line.

    // Locate the position of the first newline character within the received data.
    // This helps in isolating the first logical line.
    const newlineDelimiterPosition = receivedData.indexOf('\n');

    // Conditional extraction of the first segment:
    if (newlineDelimiterPosition === -1) {
        // If no newline character is found, the entire input string constitutes the first segment.
        firstSegmentOfData = receivedData;
    } else {
        // Otherwise, extract the substring from the beginning up to the first newline.
        firstSegmentOfData = receivedData.substring(0, newlineDelimiterPosition);
    }

    // --- Core Logic Execution ---

    // Secondary validation: Check if the extracted first segment is even long enough
    // to potentially contain the target prefix. If it's shorter, it's an immediate 'No'.
    if (firstSegmentOfData.length < targetPrefix.length) {
        console.log(negativeOutcome);
        return; // Terminate early as the condition cannot be met.
    }

    // Perform the primary check: Does the first segment indeed begin with the 'YAKI' prefix?
    // The startsWith() method provides a clean and direct way to verify this.
    const doesSegmentBeginWithTarget = firstSegmentOfData.startsWith(targetPrefix);

    // --- Output Generation ---

    // Based on the outcome of the check, print the appropriate standardized response.
    if (doesSegmentBeginWithTarget) {
        console.log(positiveOutcome);
    } else {
        console.log(negativeOutcome);
    }
}

/**
 * APPLICATION ENTRY POINT
 * This critical section is responsible for environment setup and data acquisition.
 * It reads the entire content from the standard input stream (typically /dev/stdin in Unix-like systems)
 * using Node.js's file system module and then dispatches this raw data
 * to the main processing function.
 *
 * This block should remain untouched to maintain compatibility and ensure proper
 * interaction with the execution environment.
 */
processDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));