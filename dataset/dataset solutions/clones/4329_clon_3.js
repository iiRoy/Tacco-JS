// This module is designed to perform a specific string analysis task on data
// typically received from a standard input stream. Its primary goal is to
// check if the initial segment of the first line of text matches a predefined pattern.

/**
 * Executes a textual analysis workflow on the provided raw input string.
 * It determines if the first non-empty line begins with a designated sequence.
 *
 * @param {string} rawInputContent The complete string data, potentially spanning multiple lines,
 *                                 read from an external source (e.g., standard input).
 * @returns {void} This function prints its determination directly to the console.
 */
function processInputContentForSpecificPrefix(rawInputContent) {
    // Define the exact character sequence that must appear at the beginning of the first line.
    const TARGET_START_PATTERN = "YAKI";

    // Standard responses for output based on the analysis result.
    const SUCCESS_INDICATION = "Yes";
    const FAILURE_INDICATION = "No";

    // Preliminary validation: Ensure the input is indeed a string.
    // If not, output the failure message and terminate execution for this call.
    if (typeof rawInputContent !== 'string') {
        console.error("Operational Fault: Input received was not a string type. Type detected:", typeof rawInputContent);
        console.log(FAILURE_INDICATION);
        return; // Halt processing due to invalid input type.
    }

    // Divide the entire input block into an array of individual lines.
    // This step prepares the data for line-by-line inspection.
    const contentLinesArray = rawInputContent.split('\n');

    let firstSignificantLine = '';
    // Safely retrieve the first line of content. If the input was empty or only contained newlines,
    // this check prevents errors and ensures 'firstSignificantLine' remains an empty string.
    if (contentLinesArray.length > 0) {
        // Use Array.prototype.at() as a modern alternative to direct index access [0].
        firstSignificantLine = contentLinesArray.at(0);
    } else {
        // If there are no lines, the target pattern cannot possibly be found.
        console.log(FAILURE_INDICATION);
        return; // No lines to process, so we exit early.
    }

    let patternMatchFound = false;

    // Proceed with the pattern check only if the first line is long enough
    // to possibly contain the target pattern. This is a minor optimization
    // and guard against out-of-bounds access if we were using manual indexing.
    if (firstSignificantLine.length >= TARGET_START_PATTERN.length) {
        // Extract a substring from the beginning of the first line,
        // exactly the length of our target pattern.
        const leadingSegment = firstSignificantLine.substring(0, TARGET_START_PATTERN.length);

        // Compare the extracted segment with the predefined target pattern.
        if (leadingSegment === TARGET_START_PATTERN) {
            patternMatchFound = true;
        }
    }

    // Based on whether the pattern was detected, choose the appropriate output message.
    let finalEvaluationMessage;
    if (patternMatchFound) {
        finalEvaluationMessage = SUCCESS_INDICATION;
    } else {
        finalEvaluationMessage = FAILURE_INDICATION;
    }

    // Output the final result of the analysis to the standard console.
    console.log(finalEvaluationMessage);
}

// --- System Integration Section ---
// This block handles the interaction with the operating system's file system
// to read input and then passes that input to our core processing logic.
// It is typically left unchanged in competitive programming contexts to ensure
// compatibility with automated judging systems.
try {
    // Dynamically load the Node.js file system module.
    const fileSystemUtility = require("fs");

    // Read all content from the standard input path as a UTF-8 encoded string.
    const rawDataFromStandardInput = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

    // Invoke our primary function with the data obtained from standard input.
    processInputContentForSpecificPrefix(rawDataFromStandardInput);
} catch (inputReadError) {
    // If any error occurs during the input reading phase (e.g., file not found, permissions),
    // log the error details to the standard error stream.
    console.error("Critical Input Error: Failed to retrieve data from standard input stream.", inputReadError.message);
    // As a fallback or for robustness, one might decide to output a 'No' or re-throw the error.
    // For this specific problem's context, simply logging the error is sufficient.
}