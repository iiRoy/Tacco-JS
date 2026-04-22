'use strict';

// Define constants for output messages, improving readability and maintainability.
const FAILURE_MESSAGE = 'WA'; // Output for invalid input
const SUCCESS_MESSAGE = 'AC'; // Output for valid input

// Define expected characters and their positional constraints.
const EXPECTED_INITIAL_CHARACTER = 'A';
const CRITICAL_CHARACTER = 'C';
const MIN_CRITICAL_CHAR_INDEX = 2; // The 'C' character must appear at or after this index.
const MAX_CRITICAL_CHAR_OFFSET_FROM_END = 2; // The 'C' character must appear at or before (string.length - this_value).

/**
 * Verifies if a given character is an English lowercase letter.
 * This helper function abstracts the regex check from the main logic.
 * @param {string} charToEvaluate - The character to be checked.
 * @returns {boolean} Returns true if the character is a lowercase letter, false otherwise.
 */
function isEnglishLowerCase(charToEvaluate) {
    // Using a regular expression test for robustness against non-ASCII characters,
    // though a simple range check (char >= 'a' && char <= 'z') would also work for basic ASCII.
    return /[a-z]/.test(charToEvaluate);
}

/**
 * Analyzes an input string to determine if it conforms to a specific set of rules.
 * This function encapsulates the core validation logic.
 * @param {string} incomingSequence - The string received for validation.
 */
function validateStringStructure(incomingSequence) {
    let overallValidationStatus = true; // Flag to track the success of all validation steps.
    let criticalCharacterCount = 0;     // Tracks occurrences of the CRITICAL_CHARACTER.

    // Preliminary validation: Ensure the input is a non-empty string.
    if (typeof incomingSequence !== 'string' || incomingSequence.length === 0) {
        overallValidationStatus = false;
    }

    // Rule 1: The very first character must be the EXPECTED_INITIAL_CHARACTER.
    if (overallValidationStatus && incomingSequence[0] !== EXPECTED_INITIAL_CHARACTER) {
        overallValidationStatus = false;
    }

    // If preliminary checks fail, no need to proceed with character-by-character analysis.
    if (overallValidationStatus) {
        // Iterate through the string, starting from the second character (index 1).
        for (let currentPosition = 1; currentPosition < incomingSequence.length; currentPosition++) {
            const charAtCurrentPosition = incomingSequence[currentPosition];

            if (charAtCurrentPosition === CRITICAL_CHARACTER) {
                criticalCharacterCount++;

                // Rule 2a: Validate the position of the CRITICAL_CHARACTER.
                const isPositionValidForCriticalChar = (
                    currentPosition >= MIN_CRITICAL_CHAR_INDEX &&
                    currentPosition <= (incomingSequence.length - MAX_CRITICAL_CHAR_OFFSET_FROM_END)
                );

                if (!isPositionValidForCriticalChar) {
                    overallValidationStatus = false;
                    break; // Terminate loop early if position rule is violated.
                }

                // Rule 2b: Ensure only a single CRITICAL_CHARACTER exists within the valid range.
                if (criticalCharacterCount > 1) {
                    overallValidationStatus = false;
                    break; // Terminate loop early if multiple critical characters are found.
                }
            } else {
                // Rule 3: All other characters (not 'A' or 'C') must be lowercase English letters.
                // This implicitly handles cases where 'A' appears at an invalid position (i.e., not index 0),
                // as 'A' is not a lowercase letter and would fail this check.
                if (!isEnglishLowerCase(charAtCurrentPosition)) {
                    overallValidationStatus = false;
                    break; // Terminate loop early if an invalid character type is found.
                }
            }
        }
    }

    // Final Rule 2c: After iterating through the entire string, precisely one CRITICAL_CHARACTER must have been found.
    // This check is performed only if `overallValidationStatus` is still true, meaning no other rules were broken.
    if (overallValidationStatus && criticalCharacterCount !== 1) {
        overallValidationStatus = false;
    }

    // Output the final verdict based on the validation outcome.
    if (overallValidationStatus) {
        console.log(SUCCESS_MESSAGE);
    } else {
        console.log(FAILURE_MESSAGE);
    }
}

// Application Entry Point: Reads input from standard input and initiates processing.
// A try-catch block is used to gracefully handle potential file reading errors.
try {
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Sanitize input by removing leading/trailing whitespace, including newlines.
    const trimmedInputSequence = rawInputContent.trim();
    validateStringStructure(trimmedInputSequence);
} catch (ioError) {
    // In case of an I/O error, log the error details and output the failure message.
    // This ensures a consistent failure output even for environmental issues.
    console.error("Input reading error encountered:", ioError.message);
    console.log(FAILURE_MESSAGE);
}