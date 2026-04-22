const fileSystemModule = require("fs"); // Import the Node.js file system module for input operations.

/**
 * Analyzes a given text string to determine if it contains a specific set of numeric characters.
 * The required characters are '1', '9', '7', and '4'.
 *
 * @param {string} candidateDataStream - The raw string data received for analysis.
 * @returns {void} This function prints "YES" to standard output if all required characters are found,
 *                 otherwise it prints "NO" (or an error message starting with "NO").
 */
function verifyNumericSequencePresence(candidateDataStream) {
    // Step 1: Input validation. Ensure the input is a string and not empty.
    // This is an added guard clause for robustness.
    if (typeof candidateDataStream !== 'string' || candidateDataStream.length === 0) {
        console.error("NO: Input data stream is invalid or empty; cannot perform verification.");
        return; // Terminate execution early for invalid input.
    }

    // Step 2: Define the target characters.
    // This uses an array constant, making the required characters explicit and easy to modify.
    const targetDigitsCollection = ['1', '9', '7', '4'];

    // Step 3: Pre-process the input string.
    // Trim whitespace, similar to the original logic, but now explicitly named.
    const sanitizedContent = candidateDataStream.trim();

    // Step 4: Core logic - check for the presence of each target digit.
    // This replaces multiple `indexOf` checks with a more functional and readable `every` method
    // combined with `String.prototype.includes()`.
    let allTargetsAreContained = true; // Initialize a flag for the verification outcome.

    for (const digitToFind of targetDigitsCollection) {
        // Iterate through each required digit.
        if (!sanitizedContent.includes(digitToFind)) {
            // If any target digit is missing, set the flag and break early.
            allTargetsAreContained = false;
            break;
        }
    }

    // Step 5: Determine and output the final result.
    // Using a ternary operator for concise output selection.
    const finalEvaluationResult = allTargetsAreContained ? "YES" : "NO";
    console.log(finalEvaluationResult);
}

// Main execution block: Handles reading input and invoking the analysis function.
try {
    // Attempt to read the entire content from standard input.
    // This operation is wrapped in a try-catch block for error handling,
    // which is an added robustness feature.
    const receivedStandardInput = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Call our refined function with the content read from stdin.
    verifyNumericSequencePresence(receivedStandardInput);

} catch (inputReadError) {
    // If an error occurs during standard input reading, report it.
    console.error("NO: Error encountered while attempting to read standard input.", inputReadError.message);
}