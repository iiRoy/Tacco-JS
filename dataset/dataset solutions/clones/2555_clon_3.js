/**
 * This module defines a function for validating a textual input stream against a specific character pattern.
 * The pattern checks for forbidden characters at alternating positions within the first significant line of text.
 */

/**
 * Analyzes a given string input to determine if it adheres to a strict character sequence rule.
 * The rule states that the character 'R' is not permitted at even (0-indexed) positions,
 * and the character 'L' is not permitted at odd (0-indexed) positions.
 *
 * @param {string} rawTextStream The complete input string, which may contain multiple lines.
 *                                Only the first non-empty line will be processed.
 * @returns {void} Prints "Yes" to standard output if the sequence is valid throughout,
 *                  otherwise prints "No" immediately upon finding the first violation.
 */
function verifyStringPattern(rawTextStream) {
    // Define the specific characters that are forbidden at certain positions.
    const RESTRICTED_CHAR_AT_EVEN = 'R';
    const RESTRICTED_CHAR_AT_ODD = 'L';

    // A boolean flag to track the overall validity of the sequence.
    // It's initialized to true, assuming validity until a rule is broken.
    let sequenceIsCompliant = true;

    try {
        // Extract the primary line for validation from the raw input stream.
        // We ensure it's a string, trim any surrounding whitespace, and take only the first line.
        const processingTargetLine = String(rawTextStream).trim().split('\n')[0];

        // If the target line is empty or non-existent after extraction,
        // it vacuously satisfies the pattern (no violations possible).
        if (!processingTargetLine || processingTargetLine.length === 0) {
            console.log("Yes");
            return;
        }

        // Iterate over each character in the target line using its zero-based index.
        for (let charIndex = 0; charIndex < processingTargetLine.length; charIndex++) {
            // Retrieve the character at the current position.
            const currentCharacter = processingTargetLine.charAt(charIndex);

            // Determine if the current position is an even or odd index.
            const isPositionEven = (charIndex % 2 === 0);

            // Apply the validation logic based on the position's parity.
            if (isPositionEven) {
                // For even positions, check if the character is the forbidden 'R'.
                if (currentCharacter === RESTRICTED_CHAR_AT_EVEN) {
                    sequenceIsCompliant = false; // A violation has been detected.
                    break; // No need to continue checking; the sequence is invalid.
                }
            } else {
                // For odd positions, check if the character is the forbidden 'L'.
                if (currentCharacter === RESTRICTED_CHAR_AT_ODD) {
                    sequenceIsCompliant = false; // A violation has been detected.
                    break; // Terminate iteration early as the sequence is invalid.
                }
            }
        }
    } catch (operationError) {
        // Catch any unexpected errors during processing (e.g., input conversion issues).
        // Log the error for debugging and mark the sequence as non-compliant.
        console.error("An internal processing error occurred:", operationError.message);
        sequenceIsCompliant = false; // Assume non-compliant on error.
    } finally {
        // Regardless of loop completion or error, output the final determination.
        console.log(sequenceIsCompliant ? "Yes" : "No");
    }
}

// This self-executing anonymous function handles the environment-specific
// standard input reading and passes it to the core validation logic.
// This part should remain consistent with the problem's execution environment.
(function initializeProgramExecution() {
    try {
        const fileSystemHandler = require("fs");
        const standardInputFilePath = "/dev/stdin";
        // Read the entire content of standard input as a UTF-8 encoded string.
        const fullInputContent = fileSystemHandler.readFileSync(standardInputFilePath, "utf8");
        // Pass the read content to our main validation function.
        verifyStringPattern(fullInputContent);
    } catch (readingError) {
        // If there's an error reading from stdin, log it and exit with an error code.
        console.error("Error reading from standard input source:", readingError.message);
        process.exit(1); // Indicate an abnormal termination.
    }
})();