/**
 * This module provides a function to analyze a text string for a specific character sequence.
 * It is a Type III clone of an original script, demonstrating significant structural and
 * stylistic modifications while preserving the core functionality.
 */

/**
 * Examines an input string to determine if it contains the sequence 'C' followed by 'F'.
 * The function implements a state machine approach to detect the sequence.
 *
 * @param {string | any} sourceString - The raw string data to be processed.
 *                                     Expected to be a string; other types will result in "No".
 * @returns {void} - Prints "Yes" to standard output if the sequence is found,
 *                   otherwise prints "No".
 */
function evaluateCharacterPattern(sourceString) {
    // Type III: Added a guard clause for robust input validation.
    // This prevents errors if the input is not a string or is empty.
    if (typeof sourceString !== 'string' || sourceString === null || sourceString.length === 0) {
        console.log("No");
        return;
    }

    // Type II: Renamed variables for clarity and changed 'var' to 'const'/'let'.
    // Type III: Introduced helper constants for the target characters, improving readability.
    const PRIMARY_TARGET_CHAR = 'C';
    const SECONDARY_TARGET_CHAR = 'F';

    // Type II: Renamed the state tracking variable.
    // Type III: Added a dedicated boolean flag to explicitly track the final detection status.
    let sequenceScanState = 0; // 0: Awaiting primary target, 1: Primary target found, 2: Both targets found.
    let fullSequenceAchieved = false;

    // Type II: Reformat whitespace and add descriptive comments.
    // Type III: Changed the iteration mechanism from an indexed 'for' loop after 'split'
    //           to a more modern 'for...of' loop, iterating directly over characters.
    for (const currentCharacter of sourceString) {
        // Type III: Rewritten the 'switch' statement into an 'if-else if' structure.
        if (sequenceScanState === 0) {
            // Current state: We are actively searching for the first character ('C').
            if (currentCharacter === PRIMARY_TARGET_CHAR) {
                sequenceScanState = 1; // Transition to state 1: 'C' has been found.
            }
        } else if (sequenceScanState === 1) {
            // Current state: 'C' was found, now we are searching for the second character ('F').
            if (currentCharacter === SECONDARY_TARGET_CHAR) {
                sequenceScanState = 2; // Transition to state 2: 'C' then 'F' found.
                fullSequenceAchieved = true; // Mark the successful detection.
                // Type III: Added an early exit optimization. Once the sequence is found,
                //           further iteration is unnecessary for this specific problem.
                break;
            }
        }
        // If sequenceScanState is 2, the pattern is already confirmed, so no further state changes are needed.
        // For this pattern, an unmatched character in state 1 does not reset the state, it simply continues
        // looking for 'F'.
    }

    // Type II: Reformat the output logic for better readability.
    // Type III: Utilized the explicit 'fullSequenceAchieved' boolean for the final decision.
    if (fullSequenceAchieved) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

/**
 * A helper function to safely acquire and trim standard input.
 * This abstracts away the file system access details.
 *
 * @returns {string} The trimmed content read from standard input.
 */
function obtainInputFromStandardStream() {
    // Type III: Encapsulated input reading into a dedicated helper function.
    // Type III: Added a basic try-catch block for error handling during file access,
    //           making the input reading more robust.
    try {
        const fileSystemModule = require("fs");
        const rawInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        return rawInputBuffer.trim();
    } catch (readError) {
        // In a production environment, more sophisticated error logging/handling would be used.
        // For this context, an empty string is returned, which the main function's guard clause handles.
        console.error("Failed to read standard input:", readError.message);
        return "";
    }
}

// Type II: Renamed the main execution call.
// Type III: Utilized the helper function to retrieve input for processing.
evaluateCharacterPattern(obtainInputFromStandardStream());