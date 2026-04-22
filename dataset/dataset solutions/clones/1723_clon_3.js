/*
 * This module processes raw text input to determine
 * the number of character mismatches between its
 * initial two lines. It effectively computes a form
 * of Hamming distance for the common prefix of the
 * first line's length, considering missing characters
 * in the second line as mismatches.
 */
function calculateCharacterMismatches(rawInputData) {
    // Ensure the input provided is a string type.
    // If not, log an error and indicate failure, as processing
    // non-string data would lead to runtime errors.
    if (typeof rawInputData !== 'string') {
        console.error('Error: Input data must be a string. Received type:', typeof rawInputData);
        return; // Exit the function gracefully without further processing.
    }

    // Split the entire input string into individual lines
    // using the newline character as a delimiter. This creates
    // an array where each element is a line of the original input.
    const sourceLines = rawInputData.split('\n');

    // Validate that there are at least two lines to compare.
    // If fewer than two lines are present, there are no meaningful
    // differences to calculate based on the problem's intent.
    if (sourceLines.length < 2) {
        console.log(0); // If fewer than two lines, assume zero differences and print.
        return; // Exit the function.
    }

    // Extract the first and second sequences for character-by-character comparison.
    // The primary sequence is always the first line.
    const primarySequence = sourceLines[0];
    // The secondary sequence is the second line. If sourceLines[1] is undefined
    // (e.g., if the input had only one line, which is caught by the previous check,
    // but defensive coding is good), it defaults to an empty string to prevent errors.
    const secondarySequence = sourceLines[1] || '';

    // If the primary sequence itself is empty, there are no characters to compare,
    // so the number of mismatches is zero.
    if (primarySequence.length === 0) {
        console.log(0);
        return;
    }

    // Initialize a counter to track the total number of differences found.
    // This variable will accumulate the count of non-matching characters.
    let totalMismatchesFound = 0;

    // Iterate through each character position up to the length of the primary sequence.
    // This loop ensures that every character in the first line is considered.
    for (let charPosition = 0; charPosition < primarySequence.length; charPosition++) {
        // Retrieve characters at the current position from both sequences.
        // Using charAt() is a robust way to access characters, returning an empty
        // string if the index is out of bounds, which simplifies comparison logic.
        const charFromPrimary = primarySequence.charAt(charPosition);
        const charFromSecondary = secondarySequence.charAt(charPosition); // Will be '' if out of bounds for secondary

        // Compare the extracted characters. If they are not identical,
        // it signifies a mismatch, and the counter is incremented.
        // Note: If charFromSecondary is an empty string (because secondarySequence is shorter),
        // and charFromPrimary is not empty, they will correctly be considered different.
        if (charFromPrimary !== charFromSecondary) {
            totalMismatchesFound++; // Increment the counter for each detected difference.
        }
    }

    // Output the final tally of character mismatches to the console.
    // This is the result of the Hamming distance calculation.
    console.log(totalMismatchesFound);
}

// --- Program Execution Entry Point ---
// This block handles reading input from standard input and initiating
// the core logic. It's designed for execution in a Node.js environment.
try {
    // Dynamically import the Node.js file system module for I/O operations.
    const fileSystemModule = require("fs");
    // Define the standard input file path, common in Unix-like systems.
    const standardInputPath = "/dev/stdin";

    // Read the entire content of standard input synchronously as a UTF-8 string.
    // This blocks execution until the input is fully read.
    const rawInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8");

    // Invoke the core logic function with the acquired input data.
    // This passes the raw text content to be processed.
    calculateCharacterMismatches(rawInputContent);
} catch (executionError) {
    // Catch and log any errors that occur during file reading or during
    // the execution of the main processing logic, providing a descriptive message.
    console.error("An unexpected error occurred during program execution:", executionError.message);
}