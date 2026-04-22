/**
 * This module is designed to analyze a given string input to determine if it contains a specific pattern.
 * The pattern sought is the substring "AC" which may be optionally preceded and followed by up to three
 * arbitrary characters. The output indicates whether such a pattern was successfully detected.
 */
function processInputData(rawDataContent) {
    // Define the regular expression pattern to be used for searching.
    // The pattern `(.{0,3})AC(.{0,3})` looks for the literal "AC"
    // preceded by zero to three any characters (except line breaks) and
    // followed by zero to three any characters (except line breaks).
    // Using `String.raw` ensures backslashes are treated as literal characters, though not strictly
    // necessary for this particular pattern, it's good practice for complex regexes.
    const targetPattern = new RegExp(String.raw`(.{0,3})AC(.{0,3})`);

    // Initialize a variable to hold the final result message.
    let detectionOutcome = "No"; // Default to "No" unless a match is found.

    // --- Input Validation and Guard Clause ---
    // Ensure the input is a valid non-empty string before attempting to process.
    if (typeof rawDataContent !== 'string' || rawDataContent.length === 0) {
        // If the input is not a string or is empty, the pattern cannot be found.
        // The default "No" is appropriate here.
        // For debugging, one might add console.warn("Invalid or empty input provided.");
    } else {
        // Perform the pattern test on the cleaned input string.
        // The `test()` method of RegExp objects returns `true` if a match is found, `false` otherwise.
        const isPatternPresent = targetPattern.test(rawDataContent);

        // Update the outcome message based on the detection result.
        if (isPatternPresent) {
            detectionOutcome = "Yes";
        }
    }

    // Output the final determination to the standard console.
    console.log(detectionOutcome);
}

// --- Application Entry Point ---
// This block handles the execution flow, including reading input and error management.
try {
    // Dynamically load the Node.js 'fs' (File System) module.
    // This allows reading data from files, specifically standard input in this context.
    const fileSystemModule = require("fs");

    // Read the entire content from standard input (`/dev/stdin`).
    // The data is read as a Buffer.
    const inputBuffer = fileSystemModule.readFileSync("/dev/stdin");

    // Convert the Buffer content to a UTF-8 encoded string.
    let rawInputString = inputBuffer.toString('utf8');

    // Remove any leading or trailing whitespace (like newlines) from the input string.
    const processedString = rawInputString.trim();

    // Invoke the primary function to analyze the cleaned input string.
    processInputData(processedString);

} catch (runtimeError) {
    // If any error occurs during file reading or initial processing (e.g., file not found,
    // invalid encoding, or issues with 'require'), log the error message.
    console.error("An operational error occurred during input processing:", runtimeError.message);
    // As a fallback, if an error prevents normal execution, output "No" as the result.
    console.log("No");
}