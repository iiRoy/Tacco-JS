/**
 * Core function to process a raw string of total seconds and format it into a time string (H:M:S).
 * This routine parses the input, performs necessary calculations, and handles basic validation.
 * @param {string} timeValueStr - The input string containing the total number of seconds.
 */
function ProcessInputSeconds(timeValueStr) {
    // Define constant values for time conversions.
    // Using explicit constants enhances readability and maintainability.
    const SECONDS_PER_MINUTE_UNIT = 60;
    const SECONDS_PER_HOUR_UNIT = 3600; // 60 minutes * 60 seconds

    // Normalize the input string by trimming whitespace and
    // parse it into an integer, explicitly specifying base 10.
    let totalSecondsValue = parseInt(timeValueStr.trim(), 10);

    // --- Robust Input Validation ---
    // Check if parsing resulted in a valid non-negative number.
    // If not, log an error and terminate execution for this input.
    if (isNaN(totalSecondsValue) || totalSecondsValue < 0) {
        console.error("Error: Provided input is not a valid non-negative integer for time calculation.");
        return; // Exit the function if input is invalid.
    }

    // --- Calculate Time Components ---
    // Determine the number of full hours.
    let hoursCount = Math.floor(totalSecondsValue / SECONDS_PER_HOUR_UNIT);

    // Calculate the remaining seconds after extracting all full hours.
    let secondsAfterHours = totalSecondsValue % SECONDS_PER_HOUR_UNIT;

    // From the remaining seconds, determine the number of full minutes.
    let minutesCount = Math.floor(secondsAfterHours / SECONDS_PER_MINUTE_UNIT);

    // The final seconds component is the remainder after extracting all full minutes.
    let finalSecondsCount = secondsAfterHours % SECONDS_PER_MINUTE_UNIT;

    // --- Output the Formatted Time ---
    // Concatenate the calculated time components into the desired "H:M:S" format.
    console.log(hoursCount + ":" + minutesCount + ":" + finalSecondsCount);
}

/**
 * Utility function for browser-based testing and debugging.
 * It retrieves input from a designated DOM element and passes it to the main processing logic.
 */
function handleBrowserTestExecution() {
    // Attempt to locate the specific input field in the HTML document.
    const inputElement = document.getElementById("timeInputField");

    // Guard clause: Ensure the input element exists before proceeding.
    if (!inputElement) {
        console.error("DOM Error: Required input element with ID 'timeInputField' was not found.");
        return;
    }

    // Retrieve the current value from the input field.
    const currentInputData = inputElement.value;

    try {
        // Execute the primary time processing function with the obtained input.
        ProcessInputSeconds(currentInputData);
    } catch (executionIssue) {
        // Catch and report any unexpected errors that might occur during processing.
        console.error("An unexpected issue occurred during time conversion:", executionIssue.message);
    }
}

// --- Standard Input Processing for Command-Line Environments (e.g., Node.js) ---
// This self-executing block handles reading input from /dev/stdin, typical for competitive programming.
(function processStandardInput() {
    // Verify if the current environment supports Node.js-specific modules like 'fs'.
    if (typeof require !== 'undefined' && typeof require('fs') !== 'undefined') {
        const fileSystemModule = require("fs");
        const standardInputFilePath = "/dev/stdin";

        try {
            // Read the entire content of the standard input file synchronously.
            // Ensure UTF-8 encoding for proper string interpretation.
            const dataFromStdin = fileSystemModule.readFileSync(standardInputFilePath, "utf8");
            // Invoke the main processing function with the data read from standard input.
            ProcessInputSeconds(dataFromStdin);
        } catch (fileReadError) {
            // Report any errors encountered during file reading from standard input.
            console.error("Failed to read data from standard input:", fileReadError.message);
            // In a production scenario, more robust error handling might be required.
        }
    } else {
        // This message indicates that the script is not running in an expected Node.js environment,
        // hence the standard input processing part is bypassed.
        console.warn("Standard input processing skipped: 'fs' module not available (not a Node.js environment?).");
    }
})();