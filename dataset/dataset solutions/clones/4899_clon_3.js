// This module defines a core function to analyze a sequence of characters
// to determine if a specific ordering pattern exists.
// It searches for the first occurrence of character 'C' and the last occurrence of character 'F'.
// The final decision depends on whether 'C' appears before 'F' in the sequence.

/**
 * Processes a given text input to determine if the first 'C' appears before the last 'F'.
 *
 * @param {string} rawContent The raw text content received, typically from standard input.
 *                            It is expected to be a string that may contain multiple lines.
 */
function evaluateCharacterOrdering(rawContent) {
    // Initial validation: Ensure the input is a string and not empty after trimming.
    // If the input is invalid or empty, the original logic would result in a "No" output
    // because no 'C' or 'F' would be found (variables would remain undefined).
    // This guard clause explicitly handles such scenarios.
    if (typeof rawContent !== 'string' || rawContent.trim().length === 0) {
        console.log("No");
        return; // Terminate execution early for invalid input.
    }

    // Split the raw content into individual lines.
    const contentLines = rawContent.split('\n');
    let primarySequence = ''; // This will hold the first non-empty line we process.

    // Iterate through the lines to find the first non-empty one to act as our primary sequence.
    // This adds robustness by ignoring blank lines and ensures we work with actual data.
    // This is an added structural fragment (Type III).
    for (const lineCandidate of contentLines) {
        const trimmedLine = lineCandidate.trim();
        if (trimmedLine.length > 0) {
            primarySequence = trimmedLine;
            break; // Found our sequence, no need to check further lines.
        }
    }

    // If no valid sequence was found after processing lines (e.g., all lines were empty),
    // then no 'C' or 'F' can be found, leading to a "No" outcome.
    if (primarySequence.length === 0) {
        console.log("No");
        return;
    }

    // Define the specific characters we are interested in.
    // Using constants makes the code more readable and maintainable (Type II & III).
    const charToLocateFirst = 'C';
    const charToLocateLast = 'F';

    // Find the index of the first occurrence of the first target character.
    // `indexOf` returns -1 if the character is not present in the string.
    // This replaces the manual loop for 'C' (Type III).
    const firstCharPosition = primarySequence.indexOf(charToLocateFirst);

    // Find the index of the last occurrence of the second target character.
    // `lastIndexOf` returns -1 if the character is not present.
    // This replaces the manual loop for 'F' (Type III).
    const lastCharPosition = primarySequence.lastIndexOf(charToLocateLast);

    // Introduce boolean flags to clearly indicate if each character was found.
    // This is an intermediate step and helper variable (Type III).
    const isFirstCharPresent = firstCharPosition !== -1;
    const isSecondCharPresent = lastCharPosition !== -1;

    let finalOutcome = false; // Default assumption is 'No'.

    // The original logic's behavior when a character wasn't found (variable remained undefined)
    // was that any comparison (`undefined < X`) would yield `false`.
    // We explicitly check for presence here to mirror that behavior reliably.
    if (isFirstCharPresent && isSecondCharPresent) {
        // If both characters are found, then we compare their positions.
        // This updates the core comparison logic (Type III).
        if (firstCharPosition < lastCharPosition) {
            finalOutcome = true; // The condition is met.
        }
    }

    // A small helper function for consistent output (Type III).
    const outputResult = (conditionMet) => {
        console.log(conditionMet ? "Yes" : "No");
    };

    // Deliver the final result.
    outputResult(finalOutcome);
}

// --- Program Execution Entry Point ---
// This immediately-invoked function expression (IIFE) handles the system interaction.
// It reads input from standard I/O and passes it to our main logic function.
(function executeSystemAnalysis() {
    try {
        // Utilize Node.js's file system module to read all content from stdin.
        // The 'utf8' encoding ensures correct interpretation of characters.
        const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

        // Invoke our primary analysis function with the content read from stdin.
        evaluateCharacterOrdering(systemInputContent);
    } catch (error) {
        // This try-catch block is a Type III addition for robust error handling.
        // If there's an issue reading from stdin (e.g., file not found, permission error),
        // we log the error and default to "No" as the outcome, similar to how
        // an empty or invalid input would be handled.
        console.error("An error occurred during input processing:", error.message);
        console.log("No"); // Default "No" on error.
    }
})();