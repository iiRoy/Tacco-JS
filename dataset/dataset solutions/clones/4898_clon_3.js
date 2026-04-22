/*
 * This script performs a specialized textual analysis on an input sequence.
 * Its purpose is to detect the co-occurrence and relative positioning of two
 * designated character types within the provided string data.
 *
 * This implementation aims for clarity and robustness in handling various
 * input scenarios, including empty or undefined string values.
 *
 * Author: Synthetic Code Generation System
 * Date: 2023-10-27
 * Version: 1.1.0
 */

// Define constant values for the characters being searched, enhancing readability.
const PRIMARY_MARKER_CHAR = 'C'; // The initial character of interest
const SECONDARY_MARKER_CHAR = 'F'; // The subsequent character of interest

/**
 * Executes the primary logic to evaluate a given text string based on
 * the presence and sequential order of specific character markers.
 *
 * The evaluation criteria are as follows:
 * 1. If the PRIMARY_MARKER_CHAR is found, then the SECONDARY_MARKER_CHAR must
 *    also be found at or after the position of the first PRIMARY_MARKER_CHAR.
 * 2. If the PRIMARY_MARKER_CHAR is not found anywhere in the string, then the
 *    SECONDARY_MARKER_CHAR must also NOT be found anywhere in the string.
 *
 * @param {string} sourceTextData The string input to be processed.
 * @returns {boolean} Returns `true` if the combined conditions are satisfied, `false` otherwise.
 */
const processCharacterPatternVerification = (sourceTextData) => {
    // --- Input integrity check and boundary handling ---
    // Ensure the input is a valid string type. If not, or if it's empty,
    // the system defaults to a 'true' outcome, as per the original logic's
    // implicit handling for cases where neither character is found.
    if (typeof sourceTextData !== 'string' || sourceTextData.length === 0) {
        // An empty string means no 'C' (primary_marker_char) and no 'F' (secondary_marker_char)
        // This corresponds to flag1=0 and flag2=0 in the original Java, leading to "Yes".
        return true;
    }

    // --- Internal flags and positional tracking variables ---
    let primaryCharacterEncountered = false; // Tracks if PRIMARY_MARKER_CHAR ('C') was located.
    let initialScanPoint = -1;               // Stores the index of the first 'C', if found.

    // --- Phase 1: Locating the PRIMARY_MARKER_CHAR ('C') ---
    // An iterative scan is performed from the beginning of the string.
    // The loop terminates upon the first discovery of 'C', capturing its index.
    for (let charIndex = 0; charIndex < sourceTextData.length; charIndex++) {
        const currentElement = sourceTextData[charIndex];

        if (currentElement === PRIMARY_MARKER_CHAR) {
            primaryCharacterEncountered = true;
            initialScanPoint = charIndex;
            // Early exit: The requirement is to find the *first* 'C'.
            break;
        }
    }

    // --- Determining the starting offset for the subsequent character search ---
    // If 'C' was found, the search for 'F' begins from 'C's position.
    // If 'C' was not found, the search for 'F' must still cover the entire string,
    // effectively starting from the beginning (index 0).
    const subsequentSearchOffset = primaryCharacterEncountered ? initialScanPoint : 0;

    let secondaryCharacterFoundPostOffset = false; // Tracks if SECONDARY_MARKER_CHAR ('F') was located.

    // --- Phase 2: Locating the SECONDARY_MARKER_CHAR ('F') ---
    // This loop commences from `subsequentSearchOffset` and continues to the end.
    // It identifies if 'F' exists within this relevant segment of the string.
    let scanCursor = subsequentSearchOffset;
    while (scanCursor < sourceTextData.length) {
        const elementUnderExamination = sourceTextData[scanCursor];

        if (elementUnderExamination === SECONDARY_MARKER_CHAR) {
            secondaryCharacterFoundPostOffset = true;
            // Early exit: Once 'F' is found, further scanning is unnecessary.
            break;
        }
        // Advance the scan cursor to the next position.
        scanCursor++;
    }

    // --- Final logical comparison for result determination ---
    // The ultimate outcome hinges on whether both character flags are in agreement:
    // - Both true (C found, and F found after/at C) --> Yes
    // - Both false (C not found, and F not found anywhere) --> Yes
    // - One true, one false (C found but F not after C, OR C not found but F found somewhere) --> No
    const resultConditionMet = (primaryCharacterEncountered === secondaryCharacterFoundPostOffset);

    return resultConditionMet;
};

// --- Script execution entry point ---
// This block retrieves input and displays the final evaluation.
// In a Node.js environment, `process.argv[2]` commonly captures the first
// command-line argument provided when executing the script.
// A default empty string is used if no argument is supplied, matching the
// behavior for empty input.
const inputArgumentFromCommandLine = process.argv[2] || "";

// Invoke the core logic function with the obtained input.
const finalEvaluationResult = processCharacterPatternVerification(inputArgumentFromCommandLine);

// Output the determined result to the console.
if (finalEvaluationResult) {
    console.log("Yes");
} else {
    console.log("No");
}